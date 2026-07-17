import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, Shield, Zap, Play, Pause, Terminal, Activity, X, Check, 
  AlertCircle, Sliders, RefreshCw, Eye, EyeOff, Lock, Unlock, Database, Layers, ArrowLeftRight,
  HardDrive, Code2, Wrench, MousePointer, ShieldAlert, ShieldCheck, Bug, Trash2, Scan, Search, AlertTriangle
} from 'lucide-react';

interface GlassKernelProps {
  cpuUsage: number;
  ramUsage: number;
  addNotification: (app: string, message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
  kernelCalls: any[];
  setKernelCalls: React.Dispatch<React.SetStateAction<any[]>>;
  fsLib?: any;
  windows?: any[];
  closeWindow?: (id: any) => void;
}

interface Process {
  id: number;
  name: string;
  type: 'system' | 'user' | 'untrusted';
  color: string;
  virtualPages: string[];
  physicalPages: number[];
  status: 'running' | 'blocked' | 'terminated';
}

interface KernelLog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'mmu';
  source: string;
  message: string;
}

interface Driver {
  id: string;
  name: string;
  type: 'network' | 'storage' | 'display' | 'accelerator' | 'input';
  version: string;
  agnosticCode: string;
  irqs: number;
  baseAddress: string;
  status: 'unloaded' | 'loaded' | 'compiling';
  transactionsCount: number;
}

interface VirusSignature {
  name: string;
  hash: string;
  severity: 'critical' | 'high' | 'medium';
  target: 'MMU' | 'IPC' | 'SADF' | 'FS';
  description: string;
  status: 'active' | 'quarantined' | 'neutralized' | 'not_detected';
}

interface VirtualSyscall {
  val: string;
  name: string;
  num: number;
  desc: string;
  regRAX: string;
  startMsg: string;
  successMsg: string;
  resultRAX: string;
  category: 'Process' | 'Files / IO' | 'Network' | 'Memory' | 'Signals / Timer' | 'System Info';
}

const SYSTEM_CALLS: VirtualSyscall[] = [
  {
    val: 'SYS_WRITE',
    name: 'SYS_WRITE (0x1)',
    num: 1,
    desc: 'Write payload buffer stream to console/tty',
    regRAX: '0x0000000000000001',
    startMsg: 'sys_write(fd=1, buf="Hello, glassOS!", size=16) invoked. Switching context...',
    successMsg: 'sys_write returned 16. Characters written successfully to console tty0.',
    resultRAX: '0x0000000000000010',
    category: 'Files / IO'
  },
  {
    val: 'SYS_READ',
    name: 'SYS_READ (0x0)',
    num: 0,
    desc: 'Retrieve keyboard scan characters dynamically',
    regRAX: '0x0000000000000000',
    startMsg: 'sys_read(fd=0, buf=0x7fff003a, count=256) polling user keyboard buffer...',
    successMsg: 'sys_read retrieved 12 bytes scan data: "user_input\\n".',
    resultRAX: '0x000000000000000C',
    category: 'Files / IO'
  },
  {
    val: 'SYS_FORK',
    name: 'SYS_FORK (0x39)',
    num: 57,
    desc: 'Clone memory process structures & address mapping',
    regRAX: '0x0000000000000039',
    startMsg: 'sys_fork() initiating copy-on-write page mirroring on active thread frame tables...',
    successMsg: 'sys_fork completed. New child process cloned successfully with PID 1048!',
    resultRAX: '0x0000000000000418',
    category: 'Process'
  },
  {
    val: 'SYS_MMAP',
    name: 'SYS_MMAP (0x9)',
    num: 9,
    desc: 'Allocate standard physical page frame in RAM',
    regRAX: '0x0000000000000009',
    startMsg: 'sys_mmap(addr=0, length=4096, prot=PROT_READ|PROT_WRITE, flags=MAP_ANONYMOUS) requested.',
    successMsg: 'sys_mmap mapped standard physical page frame at virtual pointer 0x7FFF6A000000.',
    resultRAX: '0x00007FFF6A000000',
    category: 'Memory'
  },
  {
    val: 'SYS_REBOOT',
    name: 'SYS_REBOOT (0xA9)',
    num: 169,
    desc: 'Cycle processor power grids & reboot kernel',
    regRAX: '0x00000000000000A9',
    startMsg: 'sys_reboot(magic=0xfee1dead, cmd=LINUX_REBOOT_CMD_RESTART) triggered!',
    successMsg: 'Rebooting virtual glassOS container core. Standard HAL warm cycle initialized...',
    resultRAX: '0x0000000000000000',
    category: 'System Info'
  },
  {
    val: 'SYS_EXIT',
    name: 'SYS_EXIT (0x3C)',
    num: 60,
    desc: 'Terminate the current process and return exit code status',
    regRAX: '0x000000000000003C',
    startMsg: 'sys_exit(status=0) invoked. Terminating current user space task environment...',
    successMsg: 'Process terminated with status code 0. Resources reclaimed.',
    resultRAX: '0x0000000000000000',
    category: 'Process'
  },
  {
    val: 'SYS_WAITPID',
    name: 'SYS_WAIT/WAITPID (0x72)',
    num: 114,
    desc: 'Wait for state changes in a child process',
    regRAX: '0x0000000000000072',
    startMsg: 'sys_wait4(pid=-1, status=0x7fff01a0, options=0) blocking until child state change...',
    successMsg: 'Child process 1048 terminated. Cleaned zombie thread structures.',
    resultRAX: '0x0000000000000418',
    category: 'Process'
  },
  {
    val: 'SYS_EXECVE',
    name: 'SYS_EXECVE (0x3B)',
    num: 59,
    desc: 'Execute a new program binary file, replacing current program',
    regRAX: '0x000000000000003B',
    startMsg: 'sys_execve(filename="/bin/sh", argv=0x7fff02c0, envp=0x7fff02d8) executing...',
    successMsg: 'New program loaded. RIP register reset to entry point of /bin/sh.',
    resultRAX: '0x0000000000000000',
    category: 'Process'
  },
  {
    val: 'SYS_KILL',
    name: 'SYS_KILL (0x3E)',
    num: 62,
    desc: 'Send a signal to a process',
    regRAX: '0x000000000000003E',
    startMsg: 'sys_kill(pid=1048, sig=SIGKILL) dispatching hardware signal vector...',
    successMsg: 'Signal SIGKILL successfully delivered. Process 1048 killed.',
    resultRAX: '0x0000000000000000',
    category: 'Process'
  },
  {
    val: 'SYS_PIPE',
    name: 'SYS_PIPE (0x16)',
    num: 22,
    desc: 'Create an unidirectional data channel (pipe)',
    regRAX: '0x0000000000000016',
    startMsg: 'sys_pipe(pipefd=0x7fff0350) allocating kernel ring buffer...',
    successMsg: 'Pipe created. Read FD 3 and Write FD 4 mapped in file descriptor table.',
    resultRAX: '0x0000000000000000',
    category: 'Files / IO'
  },
  {
    val: 'SYS_OPEN',
    name: 'SYS_OPEN (0x2)',
    num: 2,
    desc: 'Open a file or directory path, returning a file descriptor',
    regRAX: '0x0000000000000002',
    startMsg: 'sys_open(pathname="/etc/glassos.conf", flags=O_RDONLY) searching directory tree...',
    successMsg: 'File opened. Returned file descriptor FD 3 pointing to node stream.',
    resultRAX: '0x0000000000000003',
    category: 'Files / IO'
  },
  {
    val: 'SYS_CLOSE',
    name: 'SYS_CLOSE (0x3)',
    num: 3,
    desc: 'Close a file descriptor',
    regRAX: '0x0000000000000003',
    startMsg: 'sys_close(fd=3) cleaning file descriptor mapping context...',
    successMsg: 'File descriptor FD 3 released. Active socket or file handle closed.',
    resultRAX: '0x0000000000000000',
    category: 'Files / IO'
  },
  {
    val: 'SYS_STAT',
    name: 'SYS_STAT (0x4)',
    num: 4,
    desc: 'Retrieve file status metadata by pathname',
    regRAX: '0x0000000000000004',
    startMsg: 'sys_stat(pathname="/sys/bin/system", statbuf=0x7fff0480) reading disk metadata...',
    successMsg: 'Stat loaded. Size: 240KB, Permissions: rwxr-xr-x, Owner: root.',
    resultRAX: '0x0000000000000000',
    category: 'Files / IO'
  },
  {
    val: 'SYS_FSTAT',
    name: 'SYS_FSTAT (0x5)',
    num: 5,
    desc: 'Retrieve file status metadata by active file descriptor',
    regRAX: '0x0000000000000005',
    startMsg: 'sys_fstat(fd=3, statbuf=0x7fff0510) fetching inode information...',
    successMsg: 'Fstat loaded. File type: Regular File, Inode: 29481, Blocks: 480.',
    resultRAX: '0x0000000000000000',
    category: 'Files / IO'
  },
  {
    val: 'SYS_LSEEK',
    name: 'SYS_LSEEK (0x8)',
    num: 8,
    desc: 'Reposition read/write file offset pointer',
    regRAX: '0x0000000000000008',
    startMsg: 'sys_lseek(fd=3, offset=1024, whence=SEEK_SET) adjusting stream cursor...',
    successMsg: 'File pointer moved to byte offset 1024 successfully.',
    resultRAX: '0x0000000000000400',
    category: 'Files / IO'
  },
  {
    val: 'SYS_IOCTL',
    name: 'SYS_IOCTL (0x10)',
    num: 16,
    desc: 'Control underlying device parameters of special files/tty',
    regRAX: '0x0000000000000010',
    startMsg: 'sys_ioctl(fd=1, request=TIOCGWINSZ, argp=0x7fff06a0) querying tty viewport...',
    successMsg: 'Terminal geometry fetched: 80 columns, 24 rows.',
    resultRAX: '0x0000000000000000',
    category: 'System Info'
  },
  {
    val: 'SYS_FCNTL',
    name: 'SYS_FCNTL (0x48)',
    num: 72,
    desc: 'Manipulate file descriptor properties and flags',
    regRAX: '0x0000000000000048',
    startMsg: 'sys_fcntl(fd=3, cmd=F_SETFL, arg=O_NONBLOCK) altering descriptor flags...',
    successMsg: 'Fcntl applied. Descriptor 3 is now configured for non-blocking I/O.',
    resultRAX: '0x0000000000000000',
    category: 'Files / IO'
  },
  {
    val: 'SYS_DUP',
    name: 'SYS_DUP (0x20)',
    num: 32,
    desc: 'Duplicate an active file descriptor',
    regRAX: '0x0000000000000020',
    startMsg: 'sys_dup(oldfd=1) cloning file descriptor reference...',
    successMsg: 'Descriptor duplicated. FD 4 now targets same file structure as FD 1.',
    resultRAX: '0x0000000000000004',
    category: 'Files / IO'
  },
  {
    val: 'SYS_SOCKET',
    name: 'SYS_SOCKET (0x29)',
    num: 41,
    desc: 'Create a communication endpoint (network socket)',
    regRAX: '0x0000000000000029',
    startMsg: 'sys_socket(domain=AF_INET, type=SOCK_STREAM, protocol=0) provisioning socket...',
    successMsg: 'Network endpoint instantiated. Mapped to file descriptor FD 5.',
    resultRAX: '0x0000000000000005',
    category: 'Network'
  },
  {
    val: 'SYS_CONNECT',
    name: 'SYS_CONNECT (0x2A)',
    num: 42,
    desc: 'Initiate a connection on a network socket descriptor',
    regRAX: '0x000000000000002A',
    startMsg: 'sys_connect(sockfd=5, addr=127.0.0.1:80, addrlen=16) transmitting TCP handshake...',
    successMsg: 'TCP Handshake complete! Connected successfully to loopback host 127.0.0.1:80.',
    resultRAX: '0x0000000000000000',
    category: 'Network'
  },
  {
    val: 'SYS_BIND',
    name: 'SYS_BIND (0x31)',
    num: 49,
    desc: 'Bind a name/address to an active network socket',
    regRAX: '0x0000000000000031',
    startMsg: 'sys_bind(sockfd=5, addr=0.0.0.0:3000, addrlen=16) locking local network interface...',
    successMsg: 'Socket successfully bound to interface 0.0.0.0 on local port 3000.',
    resultRAX: '0x0000000000000000',
    category: 'Network'
  },
  {
    val: 'SYS_LISTEN',
    name: 'SYS_LISTEN (0x32)',
    num: 50,
    desc: 'Listen for incoming network connections on a bound socket',
    regRAX: '0x0000000000000032',
    startMsg: 'sys_listen(sockfd=5, backlog=128) preparing listen queue structures...',
    successMsg: 'Socket state updated to LISTEN. Enqueued backlog threshold established.',
    resultRAX: '0x0000000000000000',
    category: 'Network'
  },
  {
    val: 'SYS_ACCEPT',
    name: 'SYS_ACCEPT (0x2B)',
    num: 43,
    desc: 'Accept an incoming network connection request on a listening socket',
    regRAX: '0x000000000000002B',
    startMsg: 'sys_accept(sockfd=5, addr=0x7fff07b0, addrlen=16) blocking until incoming packet...',
    successMsg: 'Connection accepted from client 192.168.1.50. Mapped to client descriptor FD 6.',
    resultRAX: '0x0000000000000006',
    category: 'Network'
  },
  {
    val: 'SYS_SEND',
    name: 'SYS_SEND/SENDTO (0x2C)',
    num: 44,
    desc: 'Transmit message packets over a connected socket',
    regRAX: '0x000000000000002C',
    startMsg: 'sys_sendto(sockfd=6, buf=0x7fff08a0, len=48, flags=0) copying bytes to TX buffers...',
    successMsg: 'Sent 48 bytes payload stream to client socket successfully.',
    resultRAX: '0x0000000000000030',
    category: 'Network'
  },
  {
    val: 'SYS_RECV',
    name: 'SYS_RECV/RECVFROM (0x2D)',
    num: 45,
    desc: 'Receive message packets from a socket endpoint',
    regRAX: '0x000000000000002D',
    startMsg: 'sys_recvfrom(sockfd=6, buf=0x7fff09a0, len=256, flags=0) reading network interface...',
    successMsg: 'Received 128 bytes from remote host: "GET / HTTP/1.1\\r\\n".',
    resultRAX: '0x0000000000000080',
    category: 'Network'
  },
  {
    val: 'SYS_CHMOD',
    name: 'SYS_CHMOD (0xF)',
    num: 15,
    desc: 'Change file access permissions / mode flags',
    regRAX: '0x000000000000000F',
    startMsg: 'sys_chmod(filename="/bin/shell", mode=0755) updating file permission bits...',
    successMsg: 'Permissions updated to rwxr-xr-x (0755) for /bin/shell.',
    resultRAX: '0x0000000000000000',
    category: 'Files / IO'
  },
  {
    val: 'SYS_CHOWN',
    name: 'SYS_CHOWN (0x5C)',
    num: 92,
    desc: 'Change file owner and primary user group mappings',
    regRAX: '0x000000000000005C',
    startMsg: 'sys_chown(filename="/home/user", owner=1000, group=1000) rewriting inode uid/gid...',
    successMsg: 'Ownership of /home/user updated to UID 1000 (user), GID 1000 successfully.',
    resultRAX: '0x0000000000000000',
    category: 'Files / IO'
  },
  {
    val: 'SYS_MKDIR',
    name: 'SYS_MKDIR (0x53)',
    num: 83,
    desc: 'Create a new directory folder',
    regRAX: '0x0000000000000053',
    startMsg: 'sys_mkdir(pathname="/home/user/docs", mode=0755) appending entry to parent inode...',
    successMsg: 'Directory "/home/user/docs" created successfully.',
    resultRAX: '0x0000000000000000',
    category: 'Files / IO'
  },
  {
    val: 'SYS_RMDIR',
    name: 'SYS_RMDIR (0x54)',
    num: 84,
    desc: 'Remove an empty directory',
    regRAX: '0x0000000000000054',
    startMsg: 'sys_rmdir(pathname="/home/user/tmp") checking directory emptiness...',
    successMsg: 'Directory "/home/user/tmp" successfully removed from volume structure.',
    resultRAX: '0x0000000000000000',
    category: 'Files / IO'
  },
  {
    val: 'SYS_UNLINK',
    name: 'SYS_UNLINK (0x57)',
    num: 87,
    desc: 'Delete a directory name or hard link',
    regRAX: '0x0000000000000057',
    startMsg: 'sys_unlink(pathname="/home/user/old.txt") decremented node links...',
    successMsg: 'File "/home/user/old.txt" unlinked. Disk sectors marked as free space.',
    resultRAX: '0x0000000000000000',
    category: 'Files / IO'
  },
  {
    val: 'SYS_RENAME',
    name: 'SYS_RENAME (0x52)',
    num: 82,
    desc: 'Change the name or physical path location of a file',
    regRAX: '0x0000000000000052',
    startMsg: 'sys_rename(oldpath="/home/user/a.txt", newpath="/home/user/b.txt") altering directory tree...',
    successMsg: 'File renamed to /home/user/b.txt successfully.',
    resultRAX: '0x0000000000000000',
    category: 'Files / IO'
  },
  {
    val: 'SYS_LINK',
    name: 'SYS_LINK (0x56)',
    num: 86,
    desc: 'Create a new hard link referencing an existing file',
    regRAX: '0x0000000000000056',
    startMsg: 'sys_link(oldpath="file.txt", newpath="link.txt") copying inode references...',
    successMsg: 'Hard link "link.txt" mapped to inode 10243 successfully.',
    resultRAX: '0x0000000000000000',
    category: 'Files / IO'
  },
  {
    val: 'SYS_SYMLINK',
    name: 'SYS_SYMLINK (0x58)',
    num: 88,
    desc: 'Create a soft symbolic link pointing to a target path',
    regRAX: '0x0000000000000058',
    startMsg: 'sys_symlink(target="file.txt", linkpath="sym.txt") writing link path pointer...',
    successMsg: 'Symbolic link "sym.txt" -> "file.txt" written successfully.',
    resultRAX: '0x0000000000000000',
    category: 'Files / IO'
  },
  {
    val: 'SYS_GETPID',
    name: 'SYS_GETPID (0x27)',
    num: 39,
    desc: 'Retrieve active process identifier (PID)',
    regRAX: '0x0000000000000027',
    startMsg: 'sys_getpid() parsing thread control block...',
    successMsg: 'Retrieved active Process ID: PID 451.',
    resultRAX: '0x00000000000001C3',
    category: 'Process'
  },
  {
    val: 'SYS_GETUID',
    name: 'SYS_GETUID (0x66)',
    num: 102,
    desc: 'Retrieve user identity credentials of current process',
    regRAX: '0x0000000000000066',
    startMsg: 'sys_getuid() fetching user security token...',
    successMsg: 'Retrieved Real User ID: UID 1000.',
    resultRAX: '0x00000000000003E8',
    category: 'Process'
  },
  {
    val: 'SYS_GETGID',
    name: 'SYS_GETGID (0x68)',
    num: 104,
    desc: 'Retrieve group identity credentials of current process',
    regRAX: '0x0000000000000068',
    startMsg: 'sys_getgid() fetching group security token...',
    successMsg: 'Retrieved Real Group ID: GID 1000.',
    resultRAX: '0x00000000000003E8',
    category: 'Process'
  },
  {
    val: 'SYS_SETUID',
    name: 'SYS_SETUID (0x69)',
    num: 105,
    desc: 'Set user identity of current process (privileged)',
    regRAX: '0x0000000000000069',
    startMsg: 'sys_setuid(uid=0) verifying CAP_SETUID capability credentials...',
    successMsg: 'User identity transitioned to UID 0 (root) successfully.',
    resultRAX: '0x0000000000000000',
    category: 'Process'
  },
  {
    val: 'SYS_SETGID',
    name: 'SYS_SETGID (0x6A)',
    num: 106,
    desc: 'Set group identity of current process (privileged)',
    regRAX: '0x000000000000006A',
    startMsg: 'sys_setgid(gid=0) verifying CAP_SETGID capability credentials...',
    successMsg: 'Group identity transitioned to GID 0 (root) successfully.',
    resultRAX: '0x0000000000000000',
    category: 'Process'
  },
  {
    val: 'SYS_CLOCK_GETTIME',
    name: 'SYS_CLOCK_GETTIME (0xE4)',
    num: 228,
    desc: 'Retrieve current high-precision hardware system clock timer',
    regRAX: '0x00000000000000E4',
    startMsg: 'sys_clock_gettime(clk_id=CLOCK_REALTIME, tp=0x7fff0ab0) reading TSC oscillator...',
    successMsg: 'Clock retrieved. Unix epoch time: 1784192842s, 492040182ns.',
    resultRAX: '0x0000000000000000',
    category: 'Signals / Timer'
  },
  {
    val: 'SYS_NANOSLEEP',
    name: 'SYS_NANOSLEEP (0x23)',
    num: 35,
    desc: 'Suspend process execution thread for high-precision nanoseconds interval',
    regRAX: '0x0000000000000023',
    startMsg: 'sys_nanosleep(req={tv_sec=1, tv_nsec=0}, rem=NULL) yielding CPU thread quantum...',
    successMsg: 'Nanosleep interval expired. CPU task state returned to RUNNING.',
    resultRAX: '0x0000000000000000',
    category: 'Signals / Timer'
  },
  {
    val: 'SYS_SIGNAL',
    name: 'SYS_SIGNAL (0xE)',
    num: 14,
    desc: 'Configure signal action disposition (legacy)',
    regRAX: '0x000000000000000E',
    startMsg: 'sys_signal(signum=SIGINT, handler=0x7fff81a0) registering vector trap...',
    successMsg: 'Signal SIGINT handler mapped to user function pointer 0x7FFF81A0.',
    resultRAX: '0x0000000000000000',
    category: 'Signals / Timer'
  },
  {
    val: 'SYS_SIGACTION',
    name: 'SYS_SIGACTION (0xD)',
    num: 13,
    desc: 'Examine and alter standard thread signal delivery handler',
    regRAX: '0x000000000000000D',
    startMsg: 'sys_rt_sigaction(signum=SIGSEGV, act=0x7fff0b80, oact=NULL) registering action handler...',
    successMsg: 'Signal SIGSEGV action block registered. Mapped custom signal handler stack.',
    resultRAX: '0x0000000000000000',
    category: 'Signals / Timer'
  },
  {
    val: 'SYS_SIGPROCMASK',
    name: 'SYS_SIGPROCMASK (0xE)',
    num: 14,
    desc: 'Examine and change blocked system signals mask',
    regRAX: '0x000000000000000E',
    startMsg: 'sys_rt_sigprocmask(how=SIG_BLOCK, set=0x7fff0c40, oset=NULL) configuring thread mask...',
    successMsg: 'Signals mask modified. Blocked async delivery of vectors: SIGALRM, SIGUSR1.',
    resultRAX: '0x0000000000000000',
    category: 'Signals / Timer'
  },
  {
    val: 'SYS_SIGPENDING',
    name: 'SYS_SIGPENDING (0x7F)',
    num: 127,
    desc: 'Examine currently pending signals blocked from delivery',
    regRAX: '0x000000000000007F',
    startMsg: 'sys_rt_sigpending(set=0x7fff0d10) checking deferred thread queues...',
    successMsg: 'Pending signals fetched. Active blocked vectors waiting: none.',
    resultRAX: '0x0000000000000000',
    category: 'Signals / Timer'
  },
  {
    val: 'SYS_BRK',
    name: 'SYS_BRK (0xC)',
    num: 12,
    desc: 'Change process heap memory data segment breakpoint (brk pointer)',
    regRAX: '0x000000000000000C',
    startMsg: 'sys_brk(addr=0) querying current heap allocation pointer...',
    successMsg: 'Heap base retrieved: 0x5555557A8000.',
    resultRAX: '0x00005555557A8000',
    category: 'Memory'
  },
  {
    val: 'SYS_SBRK',
    name: 'SYS_SBRK (0xC)',
    num: 12,
    desc: 'Increment process heap data segment by offset size',
    regRAX: '0x000000000000000C',
    startMsg: 'sys_sbrk(increment=16384) scaling program break limit...',
    successMsg: 'Allocated 16KB heap space. Heap limit updated to 0x5555557AC000.',
    resultRAX: '0x00005555557AC000',
    category: 'Memory'
  },
  {
    val: 'SYS_MUNMAP',
    name: 'SYS_MUNMAP (0xB)',
    num: 11,
    desc: 'Unmap physical page allocations from process memory',
    regRAX: '0x000000000000000B',
    startMsg: 'sys_munmap(addr=0x7fff6a000000, length=4096) releasing page table entries...',
    successMsg: 'Virtual pages unmapped. Reclaimed physical frames back to kernel page pool.',
    resultRAX: '0x0000000000000000',
    category: 'Memory'
  },
  {
    val: 'SYS_MPROTECT',
    name: 'SYS_MPROTECT (0xA)',
    num: 10,
    desc: 'Modify protection access flags (read/write/exec) of memory',
    regRAX: '0x000000000000000A',
    startMsg: 'sys_mprotect(addr=0x7fff6a000000, len=4096, prot=PROT_READ) modifying page attributes...',
    successMsg: 'Memory permission updated to READ-ONLY. Execution / Writing prohibited on page segment.',
    resultRAX: '0x0000000000000000',
    category: 'Memory'
  },
  {
    val: 'SYS_MSYNC',
    name: 'SYS_MSYNC (0x1A)',
    num: 26,
    desc: 'Synchronize a mapped file cache buffer memory back to storage disk',
    regRAX: '0x000000000000001A',
    startMsg: 'sys_msync(addr=0x7fff6a000000, length=4096, flags=MS_SYNC) flushing dirty cache...',
    successMsg: 'File-backed cache synchronized to storage sectors block 29481.',
    resultRAX: '0x0000000000000000',
    category: 'Memory'
  },
  {
    val: 'SYS_MADVISE',
    name: 'SYS_MADVISE (0x1C)',
    num: 28,
    desc: 'Give memory usage strategy advice to kernel page manager',
    regRAX: '0x000000000000001C',
    startMsg: 'sys_madvise(addr=0x7fff6a000000, len=4096, advice=MADV_SEQUENTIAL) optimizing paging...',
    successMsg: 'Madvise advice applied. Aggressive pre-fetching enabled for target range.',
    resultRAX: '0x0000000000000000',
    category: 'Memory'
  },
  {
    val: 'SYS_GETCWD',
    name: 'SYS_GETCWD (0x4F)',
    num: 79,
    desc: 'Retrieve current process active working directory path',
    regRAX: '0x000000000000004F',
    startMsg: 'sys_getcwd(buf=0x7fff0e10, size=256) resolving active directory tree path...',
    successMsg: 'Current working directory path fetched: "/home/user/workspace".',
    resultRAX: '0x0000000000000015',
    category: 'Files / IO'
  },
  {
    val: 'SYS_CHDIR',
    name: 'SYS_CHDIR (0x50)',
    num: 80,
    desc: 'Change current working directory path of process',
    regRAX: '0x0000000000000050',
    startMsg: 'sys_chdir(path="/var/log") checking directory node existences...',
    successMsg: 'Working directory updated. Mapped process root to "/var/log" context.',
    resultRAX: '0x0000000000000000',
    category: 'Files / IO'
  },
  {
    val: 'SYS_GETRUSAGE',
    name: 'SYS_GETRUSAGE (0x62)',
    num: 98,
    desc: 'Retrieve process resource utilization consumption statistics',
    regRAX: '0x0000000000000062',
    startMsg: 'sys_getrusage(who=RUSAGE_SELF, usage=0x7fff0ed0) fetching thread counters...',
    successMsg: 'Resource usage fetched. User CPU time: 42ms, System CPU: 18ms, Max RSS: 45MB.',
    resultRAX: '0x0000000000000000',
    category: 'Signals / Timer'
  },
  {
    val: 'SYS_TIMES',
    name: 'SYS_TIMES (0x64)',
    num: 100,
    desc: 'Retrieve task CPU execution time intervals',
    regRAX: '0x0000000000000064',
    startMsg: 'sys_times(buf=0x7fff0f40) summarizing execution timer ticks...',
    successMsg: 'Times summary loaded. User ticks: 4200, System ticks: 1800.',
    resultRAX: '0x0000000000021A4B',
    category: 'Signals / Timer'
  },
  {
    val: 'SYS_SYSINFO',
    name: 'SYS_SYSINFO (0x63)',
    num: 99,
    desc: 'Retrieve global kernel resource utilization telemetry metrics',
    regRAX: '0x0000000000000063',
    startMsg: 'sys_sysinfo(info=0x7fff0fa0) scanning motherboard hardware structures...',
    successMsg: 'Sysinfo loaded. Uptime: 32049s, RAM: 16384MB total / 8124MB free, Load: [0.05, 0.12, 0.18].',
    resultRAX: '0x0000000000000000',
    category: 'System Info'
  },
  {
    val: 'SYS_UNAME',
    name: 'SYS_UNAME (0x3F)',
    num: 63,
    desc: 'Retrieve global operating system identification properties',
    regRAX: '0x000000000000003F',
    startMsg: 'sys_uname(buf=0x7fff1010) copying identification strings...',
    successMsg: 'Uname fetched. OS: glassOS-kernel, Release: 6.2.0-glass, Arch: x86_64.',
    resultRAX: '0x0000000000000000',
    category: 'System Info'
  }
];

interface VirtualIRQ {
  irq: number;
  vector: number;
  device: string;
  desc: string;
  isrMsg: string;
  category: 'System' | 'Input' | 'Serial/Ports' | 'Storage/Media' | 'Network' | 'Reserved';
}

const SYSTEM_IRQS: VirtualIRQ[] = [
  {
    irq: 0,
    vector: 32,
    device: 'System Timer (PIT/HPET)',
    desc: 'High frequency periodic scheduler quantum ticks',
    isrMsg: 'ISR-0 (Timer Tick) updating scheduler quantum queues and process context arrays.',
    category: 'System'
  },
  {
    irq: 1,
    vector: 33,
    device: 'Keyboard PS/2',
    desc: 'Fires asynchronously on physical key entry scans',
    isrMsg: 'ISR-1 retrieved keydown scan code 0x1E (Key "A") from raw PS/2 serial register.',
    category: 'Input'
  },
  {
    irq: 2,
    vector: 34,
    device: 'Cascade/Slave PIC',
    desc: 'Bypasses slave PIC interrupt signals to master PIC',
    isrMsg: 'ISR-2 synchronized slave PIC cascade interrupt line with master controller.',
    category: 'System'
  },
  {
    irq: 3,
    vector: 35,
    device: 'COM2/Serial Port',
    desc: 'Secondary serial communication interface line',
    isrMsg: 'ISR-3 processed incoming byte segment on secondary serial COM2 register.',
    category: 'Serial/Ports'
  },
  {
    irq: 4,
    vector: 36,
    device: 'COM1/Serial Port',
    desc: 'Primary serial communication interface line',
    isrMsg: 'ISR-4 processed incoming byte segment on primary serial COM1 register.',
    category: 'Serial/Ports'
  },
  {
    irq: 5,
    vector: 37,
    device: 'LPT2/Parallel Port',
    desc: 'Secondary parallel printer and legacy hardware line',
    isrMsg: 'ISR-5 cleared parallel status flags on LPT2 legacy bus driver.',
    category: 'Serial/Ports'
  },
  {
    irq: 6,
    vector: 38,
    device: 'Floppy Disk',
    desc: 'Fires when legacy magnetic disk controllers finish tracks',
    isrMsg: 'ISR-6 read physical sector index from legacy floppy disk controller.',
    category: 'Storage/Media'
  },
  {
    irq: 7,
    vector: 39,
    device: 'LPT1/Parallel Port',
    desc: 'Primary parallel printer communication line',
    isrMsg: 'ISR-7 cleared parallel status flags on LPT1 primary printer bus.',
    category: 'Serial/Ports'
  },
  {
    irq: 8,
    vector: 40,
    device: 'CMOS Real-Time Clock',
    desc: 'Fires periodic hardware real-time clock tick updates',
    isrMsg: 'ISR-8 updated hardware real-time clock CMOS register: timestamp synchronized.',
    category: 'System'
  },
  {
    irq: 9,
    vector: 41,
    device: 'SADF Ethernet',
    desc: 'Triggers on incoming packet segment frames over network',
    isrMsg: 'ISR-41 (IRQ 9) loaded physical Ethernet frames into DMA shared memory boundaries.',
    category: 'Network'
  },
  {
    irq: 10,
    vector: 42,
    device: 'Reserved/Available',
    desc: 'General purpose system interrupt vector',
    isrMsg: 'ISR-10 invoked for custom user-registered secondary driver logic.',
    category: 'Reserved'
  },
  {
    irq: 11,
    vector: 43,
    device: 'Reserved/Available',
    desc: 'General purpose system interrupt vector',
    isrMsg: 'ISR-11 invoked for custom user-registered secondary driver logic.',
    category: 'Reserved'
  },
  {
    irq: 12,
    vector: 44,
    device: 'Mouse PS/2',
    desc: 'Asserts serial mouse coordinates coordinate shifts',
    isrMsg: 'ISR-12 parsed PS/2 mouse movement bytes (dx: +12, dy: -4, buttons: 0x00).',
    category: 'Input'
  },
  {
    irq: 13,
    vector: 45,
    device: 'Coprocessor (FPU)',
    desc: 'Dispatched when floating point arithmetic unit triggers',
    isrMsg: 'ISR-13 processed floating-point division precision flags under modern x87 FPU context.',
    category: 'System'
  },
  {
    irq: 14,
    vector: 46,
    device: 'SADF Storage (IDE/SATA)',
    desc: 'Dispatched when disk partition block read operations finish',
    isrMsg: 'ISR-14 completed disk read sector queue for /sys/kernel/core_scheduler.bin.',
    category: 'Storage/Media'
  },
  {
    irq: 15,
    vector: 47,
    device: 'Secondary IDE',
    desc: 'Secondary storage medium communication channel',
    isrMsg: 'ISR-15 finalized parallel secondary disk controller buffer writes.',
    category: 'Storage/Media'
  }
];

export function GlassKernel({
  cpuUsage,
  ramUsage,
  addNotification,
  kernelCalls,
  setKernelCalls,
  fsLib,
  windows,
  closeWindow
}: GlassKernelProps) {
  const getPidFromAppId = (id: string): number => {
    switch (id) {
      case 'files': return 208;
      case 'terminal': return 412;
      case 'browser': return 515;
      case 'notepad': return 451;
      case 'codestudio': return 610;
      case 'settings': return 820;
      case 'systemmonitor': return 888;
      case 'glassword': return 320;
      case 'spreadsheet': return 330;
      case 'glassmail': return 710;
      case 'glassdatabase': return 720;
      case 'glassmessaging': return 730;
      case 'glasspaint': return 204;
      case 'glassdraw': return 205;
      case 'glassphoto': return 206;
      case 'printers': return 210;
      case 'calendar': return 220;
      case 'taskscheduler': return 230;
      default: return 900;
    }
  };

  const getAppIdFromPid = (pid: number): string | null => {
    switch (pid) {
      case 208: return 'files';
      case 412: return 'terminal';
      case 515: return 'browser';
      case 451: return 'notepad';
      case 610: return 'codestudio';
      case 820: return 'settings';
      case 888: return 'systemmonitor';
      case 320: return 'glassword';
      case 330: return 'spreadsheet';
      case 710: return 'glassmail';
      case 720: return 'glassdatabase';
      case 730: return 'glassmessaging';
      case 204: return 'glasspaint';
      case 205: return 'glassdraw';
      case 206: return 'glassphoto';
      case 210: return 'printers';
      case 220: return 'calendar';
      case 230: return 'taskscheduler';
      default: return null;
    }
  };

  const getAppColor = (id: string): string => {
    switch (id) {
      case 'terminal': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'files': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'browser': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'notepad': return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
      case 'settings': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'glassword': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      case 'spreadsheet': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
    }
  };

  const handleKillProcess = (proc: Process) => {
    const windowAppId = getAppIdFromPid(proc.id);
    if (windowAppId && closeWindow) {
      closeWindow(windowAppId);
      addNotification('Kernel', `Force terminated application window: ${proc.name}`, 'warning');
    } else {
      setProcesses(prev => prev.map(p => p.id === proc.id ? { ...p, status: 'terminated' } : p));
      addNotification('Kernel', `Terminated process: ${proc.name}`, 'warning');
    }
  };
  // Silicon-Agnostic Driver Framework (SADF) States
  const [drivers, setDrivers] = useState<Driver[]>([
    {
      id: 'net0',
      name: 'GlassNet v3 Ethernet Controller',
      type: 'network',
      version: '3.0.1-SADF',
      irqs: 9,
      baseAddress: '0x1A4000',
      status: 'loaded',
      transactionsCount: 1420,
      agnosticCode: `// Unified network descriptor mapping
void glass_init() {
  glass_map_irq(9, &network_handler);
  glass_dma_alloc(0x1000, &rx_buffer);
  glass_log("SADF: GlassNet driver active.");
}

void network_handler() {
  u8* packet = glass_dma_read(rx_buffer);
  glass_zero_copy_forward(packet, PORT_ETH0);
}`
    },
    {
      id: 'store0',
      name: 'NovaNVMe Storage Shield',
      type: 'storage',
      version: '1.2.0-SADF',
      irqs: 14,
      baseAddress: '0x3F8000',
      status: 'unloaded',
      transactionsCount: 0,
      agnosticCode: `// Block device access abstraction
void glass_init() {
  glass_map_irq(14, &nvme_handler);
  glass_register_block_device("nvme0", 512);
}

void nvme_handler() {
  u64 block = glass_read_register(0x20);
  glass_dma_write(block, &cache_buffer);
}`
    },
    {
      id: 'gpu0',
      name: 'AeroGPU Holographic Buffer',
      type: 'display',
      version: '2.4.5-SADF',
      irqs: 18,
      baseAddress: '0x7C0000',
      status: 'unloaded',
      transactionsCount: 0,
      agnosticCode: `// Acceleration unit pixel pipe
void glass_init() {
  glass_map_irq(18, &gpu_handler);
  glass_dma_alloc(0x4000, &framebuffer);
}

void gpu_handler() {
  glass_flush_pipeline();
  glass_write_register(0x10, framebuffer);
}`
    },
    {
      id: 'npu0',
      name: 'Cognitive NPU Accelerator',
      type: 'accelerator',
      version: '1.0.0-SADF',
      irqs: 22,
      baseAddress: '0x9E2000',
      status: 'unloaded',
      transactionsCount: 0,
      agnosticCode: `// Deep learning hardware tensor stream
void glass_init() {
  glass_map_irq(22, &npu_handler);
  glass_dma_alloc(0x8000, &weights_buffer);
}

void npu_handler() {
  glass_trigger_tensor_dot();
  glass_log("Tensor operation completed.");
}`
    },
    {
      id: 'input0',
      name: 'USB & HID Pointer Controller',
      type: 'input',
      version: '2.1.0-SADF',
      irqs: 5,
      baseAddress: '0x0FC000',
      status: 'unloaded',
      transactionsCount: 0,
      agnosticCode: `// Silicon-Agnostic Human Interface Device (HID) Parser
void glass_init() {
  glass_map_irq(5, &hid_pointer_handler);
  glass_usb_register_driver(0x046D, 0xC52B); // Logi USB Receiver
  glass_log("SADF: USB & HID Pointer Driver active.");
}

void hid_pointer_handler() {
  u8 packet[64];
  glass_usb_bulk_transfer(ENDPOINT_IN, packet, 64);
  
  // Extract absolute coordinate deltas
  s16 dx = (packet[2] << 8) | packet[1];
  s16 dy = (packet[4] << 8) | packet[3];
  u8 buttons = packet[0];
  
  glass_inject_input_event(EV_REL_MOUSE, dx, dy, buttons);
}`
    }
  ]);

  const [selectedDriverId, setSelectedDriverId] = useState<string>('net0');
  const [activeArch, setActiveArch] = useState<'arm64' | 'x86_64' | 'riscv' | 'tpu'>('arm64');
  const [isCompilingDriver, setIsCompilingDriver] = useState<boolean>(false);
  const [compilerLogs, setCompilerLogs] = useState<string[]>([]);
  const [driverAgnosticCode, setDriverAgnosticCode] = useState<string>(drivers[0].agnosticCode);

  // Kernel Tuning States
  const [strictIsolation, setStrictIsolation] = useState(true);
  const [holoCryptEnclaveActive, setHoloCryptEnclaveActive] = useState(true);
  const [rotatingKey, setRotatingKey] = useState<string>('0x9A4F8B2C1E706D53');

  useEffect(() => {
    const keyInterval = setInterval(() => {
      const hex = '0123456789ABCDEF';
      let key = '0x';
      for (let i = 0; i < 16; i++) {
        key += hex[Math.floor(Math.random() * 16)];
      }
      setRotatingKey(key);
    }, 2000);
    return () => clearInterval(keyInterval);
  }, []);

  const [zeroCopyEnabled, setZeroCopyEnabled] = useState(true);
  const [pageSize, setPageSize] = useState<4 | 2048 | 1048576>(4); // 4KB, 2MB, 1GB
  
  // IPC Simulator States
  const [messageSize, setMessageSize] = useState<number>(10); // in MB
  const [isIpcRunning, setIsIpcRunning] = useState(false);
  const [ipcProgress, setIpcProgress] = useState(0);
  const [ipcMode, setIpcMode] = useState<'copy' | 'zerocopy'>('zerocopy');
  const [ipcStats, setIpcStats] = useState({
    copyCount: 0,
    zeroCopyCount: 0,
    totalBytesTransferred: 0,
    copyAvgLatencyMs: 42.5,
    zeroCopyAvgLatencyMs: 0.12,
    copyAvgCpuOverhead: 18.4,
    zeroCopyAvgCpuOverhead: 0.8
  });

  // Memory Isolation / Process list States
  const [processes, setProcesses] = useState<Process[]>([
    { id: 100, name: 'AuthService (Kernel)', type: 'system', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', virtualPages: ['0x00A0', '0x00A1', '0x00A2', '0x00A3'], physicalPages: [2, 3, 4, 5], status: 'running' },
    { id: 101, name: 'GlassFS Driver', type: 'system', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', virtualPages: ['0x01B0', '0x01B1', '0x01B2', '0x01B3'], physicalPages: [8, 9, 10, 11], status: 'running' },
    { id: 204, name: 'GlassPaint App', type: 'user', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', virtualPages: ['0x04C0', '0x04C1', '0x04C2'], physicalPages: [16, 17, 18], status: 'running' },
    { id: 512, name: 'Untrusted Guest Script', type: 'untrusted', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20', virtualPages: ['0x09F0', '0x09F1'], physicalPages: [24, 25], status: 'running' }
  ]);

  // Physical RAM map simulation (32 blocks/frames)
  // Value represents process ID that owns it, -1 is free, -2 is shared zero-copy buffer
  const [physicalRAM, setPhysicalRAM] = useState<number[]>(() => {
    const ram = Array(32).fill(-1);
    // Seed initial system pages
    ram[0] = 0; // Kernel reserved
    ram[1] = 0; // Kernel reserved
    ram[2] = 100; ram[3] = 100; ram[4] = 100; ram[5] = 100; // AuthService
    ram[8] = 101; ram[9] = 101; ram[10] = 101; ram[11] = 101; // GlassFS
    ram[16] = 204; ram[17] = 204; ram[18] = 204; // GlassPaint
    ram[24] = 512; ram[25] = 512; // Untrusted
    return ram;
  });

  // Dynamic window synchronizer
  useEffect(() => {
    if (!windows) return;
    setProcesses(prev => {
      const systemProcesses = prev.filter(p => p.type === 'system' || p.id === 512);
      const userProcesses: Process[] = windows.map((w) => {
        const pid = getPidFromAppId(w.id);
        const existing = prev.find(p => p.id === pid);
        if (existing) {
          return {
            ...existing,
            name: w.title,
            status: w.isMinimized ? 'blocked' : 'running'
          };
        }
        const virtualPages = [
          `0x0${pid.toString(16).toUpperCase()}0`,
          `0x0${pid.toString(16).toUpperCase()}1`,
          `0x0${pid.toString(16).toUpperCase()}2`
        ];
        const physicalPages = [
          (pid % 12) + 12,
          ((pid + 1) % 12) + 12,
          ((pid + 2) % 12) + 12
        ];
        return {
          id: pid,
          name: w.title,
          type: 'user',
          color: getAppColor(w.id),
          virtualPages,
          physicalPages,
          status: w.isMinimized ? 'blocked' : 'running'
        };
      });
      return [...systemProcesses, ...userProcesses];
    });
  }, [windows]);

  // RAM allocator sync
  useEffect(() => {
    setPhysicalRAM(prev => {
      const ram = Array(32).fill(-1);
      ram[0] = 0;
      ram[1] = 0;
      processes.forEach(proc => {
        if (proc.status !== 'terminated') {
          proc.physicalPages.forEach(pageIdx => {
            if (pageIdx >= 0 && pageIdx < 32) {
              ram[pageIdx] = proc.id;
            }
          });
        }
      });
      return ram;
    });
  }, [processes]);

  const [kernelLogs, setKernelLogs] = useState<KernelLog[]>([
    { id: '1', timestamp: new Date().toLocaleTimeString(), type: 'info', source: 'BOOT', message: 'GlassOS kernel loading active protection layer...' },
    { id: '2', timestamp: new Date().toLocaleTimeString(), type: 'success', source: 'MMU', message: 'Page table isolation initialized with hardware-enforced protection boundaries.' },
    { id: '3', timestamp: new Date().toLocaleTimeString(), type: 'info', source: 'SHM', message: 'Zero-Copy message subsystem bound to POSIX shared memory interfaces.' }
  ]);

  const [exploitStatus, setExploitStatus] = useState<'idle' | 'running' | 'prevented' | 'breached'>('idle');
  const [selectedPhysicalBlock, setSelectedPhysicalBlock] = useState<number | null>(null);

  const logRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [kernelLogs]);

  // Push new kernel log helper
  const addKernelLog = useCallback((type: KernelLog['type'], source: string, message: string) => {
    const newLog: KernelLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      source,
      message
    };
    setKernelLogs(prev => [...prev, newLog].slice(-50));

    // Also push to the main app's kernelCalls for continuity
    const newCall = {
      id: Math.random().toString(36).substr(2, 9),
      service: `Kernel::${source}`,
      method: message.split(' ')[0] || 'sys_call',
      status: type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'success',
      timestamp: new Date().toLocaleTimeString(),
      latency: type === 'error' ? 2 : Math.floor(Math.random() * 5) + 1
    };
    setKernelCalls(prev => [newCall, ...prev].slice(0, 50));
  }, [setKernelCalls]);

  // Antivirus Protection Protocol (AVPP) States & Functions
  const [viruses, setViruses] = useState<VirusSignature[]>([
    { name: 'StuxOS-X', hash: '0x8F3D11A290FF', severity: 'critical', target: 'SADF', description: 'Injects dummy instructions into hotplug compiled drivers to overflow IRQ vector table.', status: 'not_detected' },
    { name: 'SADF-Overflower', hash: '0x2C4B7E9A102D', severity: 'high', target: 'SADF', description: 'Bypasses pointer sandboxing to rewrite driver base addresses in live kernel space.', status: 'not_detected' },
    { name: 'HoloCrypt-Ransomware', hash: '0x7E1D88FF330A', severity: 'critical', target: 'MMU', description: 'Attempts to intercept Ring-0 secure enclaves and encrypt AuthService segment keys.', status: 'not_detected' },
    { name: 'ZeroCopy-Snooper', hash: '0x5C921AA0E87F', severity: 'medium', target: 'IPC', description: 'Monitors the memory bus during zero-copy page flips to leak active transaction buffers.', status: 'not_detected' },
    { name: 'IRQ-Flooder', hash: '0x9A3B5C7D2E1F', severity: 'high', target: 'IPC', description: 'Triggers hardware interrupts sequentially at high frequencies, crashing the central scheduler.', status: 'not_detected' }
  ]);

  const [avScanStatus, setAvScanStatus] = useState<'idle' | 'scanning' | 'clean' | 'threat_detected'>('idle');
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [currentScanningItem, setCurrentScanningItem] = useState<string>('');
  const [heuristicsEnabled, setHeuristicsEnabled] = useState<boolean>(true);
  const [activeShieldActive, setActiveShieldActive] = useState<boolean>(true);

  // ==========================================
  // SYSTEM CALLS, TRAPS & INTERRUPTS DAEMON STATES
  // ==========================================
  const [activeCtrlTab, setActiveCtrlTab] = useState<'syscall' | 'trap' | 'irq'>('syscall');
  const [selectedSyscall, setSelectedSyscall] = useState<string>('SYS_WRITE');
  const [selectedTrap, setSelectedTrap] = useState<string>('DIV_ZERO');
  const [selectedIrq, setSelectedIrq] = useState<number>(1); // IRQ 1 - Keyboard
  const [transitioningRing, setTransitioningRing] = useState<boolean>(false);
  const [ringTarget, setRingTarget] = useState<'user' | 'kernel'>('user');
  const [cpuRegisters, setCpuRegisters] = useState({
    RAX: '0x0000000000000000',
    RIP: '0x00007FFF8A3C4D00',
    RSP: '0x00007FFFFFFFEDD8',
    CR2: '0x0000000000000000',
    EFLAGS: '0x00000202',
    privilege: 'Ring 3 (User)'
  });
  const [kernelPanic, setKernelPanic] = useState<boolean>(false);
  const [panicDetails, setPanicDetails] = useState<string>('');
  const [kernelStack, setKernelStack] = useState<string[]>([
    '0x00007FFFFFFFEDD8 (User RSP)',
    '0x0000000000000202 (User EFLAGS)',
    '0x00007FFF8A3C4D00 (User RIP)'
  ]);
  const [idtActiveVector, setIdtActiveVector] = useState<number | null>(null);
  const [syscallLogs, setSyscallLogs] = useState<{ id: string; msg: string; time: string; type: 'info' | 'success' | 'error' | 'warning' }[]>([
    { id: '1', msg: 'System call gates and CPU interrupt controllers synchronized in Ring-3 / Ring-0.', time: new Date().toLocaleTimeString(), type: 'success' },
    { id: '2', msg: 'Interrupt Descriptor Table (IDT) mapped with standard trap service routine vectors.', time: new Date().toLocaleTimeString(), type: 'info' }
  ]);
  const [syscallFilter, setSyscallFilter] = useState<string>('');
  const [syscallCategory, setSyscallCategory] = useState<string>('All');
  const [irqFilter, setIrqFilter] = useState<string>('');
  const [irqCategory, setIrqCategory] = useState<string>('All');

  const addSyscallLog = useCallback((type: 'info' | 'success' | 'error' | 'warning', msg: string) => {
    setSyscallLogs(prev => [
      { id: Math.random().toString(36).substr(2, 9), msg, time: new Date().toLocaleTimeString(), type },
      ...prev
    ].slice(0, 40));
  }, []);

  // Invokes a virtual system call via software trap (int 0x80 / SYSENTER)
  const handleInvokeSyscall = () => {
    if (transitioningRing || kernelPanic) return;

    setTransitioningRing(true);
    setRingTarget('kernel');

    const syscall = SYSTEM_CALLS.find(s => s.val === selectedSyscall);

    const syscallNum = syscall ? String(syscall.num) : '0';
    const syscallName = syscall ? syscall.val : 'SYS_UNKNOWN';
    const regRAX = syscall ? syscall.regRAX : '0x0000000000000000';
    const startMsg = syscall ? syscall.startMsg : 'Invoking system call...';
    const successMsg = syscall ? syscall.successMsg : 'System call completed successfully.';
    const resultRAX = syscall ? syscall.resultRAX : '0x0000000000000000';

    // Phase 1: Software Trap Transition to Ring 0
    setIdtActiveVector(128); // 0x80 System Call Gate
    addSyscallLog('info', `[CPU] TRAP: executing "int 0x80 / syscall" assembly instruction.`);
    addSyscallLog('warning', `[KERNEL] Privilege escalation triggered: Ring-3 -> Ring-0`);
    
    // Push Exception frame onto Kernel Stack
    setKernelStack(prev => [
      `0x0000000000000080 (IDT Vector 128)`,
      `0x0000000000000202 (User EFLAGS)`,
      `0x00007FFFFFFFEDD8 (User RSP)`,
      `0x00007FFF8A3C4D00 (User RIP)`,
      `${regRAX} (User RAX / Syscall ID)`,
      ...prev
    ]);

    setCpuRegisters(prev => ({
      ...prev,
      RAX: regRAX,
      privilege: 'Ring 0 (Kernel)'
    }));

    addKernelLog('info', 'SYSCALL', `TRAP: ${syscallName} (${syscallNum}) intercepted by Ring-0 Vector 0x80 handler.`);

    setTimeout(() => {
      // Phase 2: Execute System Call Inside Kernel Space
      addSyscallLog('info', `[KERNEL] ${startMsg}`);
      
      setTimeout(() => {
        // Phase 3: Syscall executes & returns
        addSyscallLog('success', `[KERNEL] ${successMsg}`);
        addSyscallLog('info', `[CPU] Returning to Ring-3 via "sysret / iret" instructions.`);
        
        // Pop stack
        setKernelStack([
          '0x00007FFFFFFFEDD8 (User RSP)',
          '0x0000000000000202 (User EFLAGS)',
          '0x00007FFF8A3C4D00 (User RIP)'
        ]);

        setCpuRegisters(prev => ({
          ...prev,
          RAX: resultRAX,
          RIP: selectedSyscall === 'SYS_REBOOT' ? '0x00007FFF8A3C0000' : '0x00007FFF8A3C4D04',
          privilege: 'Ring 3 (User)'
        }));

        setRingTarget('user');
        setTransitioningRing(false);
        setIdtActiveVector(null);

        if (selectedSyscall === 'SYS_REBOOT') {
          addNotification('Kernel', 'System Reboot Syscall Triggered! Warm cycling core.', 'info');
          // Restart driver list and trigger warm logs
          addKernelLog('success', 'KERNEL', 'glassOS container rebooted successfully.');
        } else {
          addNotification('System Call', `Executed ${selectedSyscall} successfully.`, 'success');
        }

      }, 800);
    }, 600);
  };

  // Triggers a CPU hardware/software Trap / Exception
  const handleTriggerTrap = () => {
    if (transitioningRing || kernelPanic) return;

    setTransitioningRing(true);
    setRingTarget('kernel');
    
    let vectorNum = 0;
    let exceptionCode = '';
    let faultMsg = '';
    let regRIP = '0x0000000000000000';
    let regCR2 = '0x0000000000000000';

    switch (selectedTrap) {
      case 'DIV_ZERO':
        vectorNum = 0;
        exceptionCode = '#DE (Divide Error Exception)';
        faultMsg = 'CPU executed invalid "div ecx" with divisor register ECX set to zero.';
        regRIP = '0x00007FFF8A3C4E52';
        regCR2 = '0x0000000000000000';
        break;
      case 'PAGE_FAULT':
        vectorNum = 14;
        exceptionCode = '#PF (Page Fault Exception)';
        faultMsg = 'CPU tried to dereference non-mapped virtual page segment at address 0x00000000DEADC0DE.';
        regRIP = '0x00007FFF8A3C4F10';
        regCR2 = '0x00000000DEADC0DE';
        break;
      case 'GP_FAULT':
        vectorNum = 13;
        exceptionCode = '#GP (General Protection Fault Exception)';
        faultMsg = 'CPU Ring-3 process tried to execute privileged hardware CPU instruction "cli" directly.';
        regRIP = '0x00007FFF8A3C4A2C';
        regCR2 = '0x0000000000000000';
        break;
      case 'INVALID_OP':
        vectorNum = 6;
        exceptionCode = '#UD (Invalid Opcode Exception)';
        faultMsg = 'CPU decode engine parsed a corrupted or unaligned instruction stream at pointer location.';
        regRIP = '0x00007FFF8A3C4C90';
        regCR2 = '0x0000000000000000';
        break;
    }

    setIdtActiveVector(vectorNum);
    addSyscallLog('error', `[CPU] CRITICAL TRAP: CPU raised interrupt Vector ${vectorNum} (${exceptionCode})!`);
    addSyscallLog('warning', `[KERNEL] Intercepting trap. Freezing User Space process threads.`);

    setCpuRegisters(prev => ({
      ...prev,
      RIP: regRIP,
      CR2: regCR2,
      privilege: 'Ring 0 (Kernel)'
    }));

    // Push Exception state onto kernel stack
    setKernelStack(prev => [
      `0x000000000000000D (Error Code: Vector ${vectorNum} Frame)`,
      `0x0000000000000202 (User EFLAGS)`,
      `0x00007FFFFFFFEDD8 (User RSP)`,
      `${regRIP} (Faulting instruction RIP)`,
      `${regCR2} (CR2 Faulting Address)`,
      ...prev
    ]);

    addKernelLog('error', 'TRAP EXCEPTION', `Core trap vector ${vectorNum} raised! Cause: ${faultMsg}`);

    setTimeout(() => {
      addSyscallLog('info', `[KERNEL TRAP SERVICE] Dumped registers for Vector ${vectorNum}:`);
      addSyscallLog('info', `[REG DUMP] RIP: ${regRIP} • RSP: 0x00007FFFFFFFEDD8 • CR2: ${regCR2}`);
      addSyscallLog('warning', `[KERNEL TRAP SERVICE] Exception: ${faultMsg}`);

      // Open interactive panic modal / crash sequence or trigger auto-quarantine options
      addNotification('Kernel Trap', `Trap raised: ${exceptionCode}! Action required.`, 'error');
    }, 800);
  };

  const handleResolveTrap = (action: 'quarantine' | 'panic') => {
    if (action === 'quarantine') {
      addSyscallLog('success', '[KERNEL] Process threads safely quarantined. Unmapping faulting addresses.');
      addSyscallLog('info', '[CPU] Resuming scheduling. Back to Ring-3 user mode.');
      
      setKernelStack([
        '0x00007FFFFFFFEDD8 (User RSP)',
        '0x0000000000000202 (User EFLAGS)',
        '0x00007FFF8A3C4D00 (User RIP)'
      ]);

      setCpuRegisters(prev => ({
        ...prev,
        CR2: '0x0000000000000000',
        privilege: 'Ring 3 (User)'
      }));

      setRingTarget('user');
      setTransitioningRing(false);
      setIdtActiveVector(null);
      addNotification('Kernel Safe', 'Process quarantined. System recovered.', 'success');
      addKernelLog('success', 'RECOVERY', 'Quarantine engine cleared trapped thread vectors.');
    } else {
      // Trigger KERNEL PANIC (BSOD)
      let dump = `*** STOP: 0x0000007E (0x00000000C0000005, 0x00007FFF8A3C4D00, 0x00000000DEADC0DE)\n`;
      dump += `KERNEL_MODE_EXCEPTION_NOT_HANDLED (${selectedTrap})\n\n`;
      dump += `CPUs: 8 Cores • glassOS Core version 2.5-Native\n`;
      dump += `System crashed while executing hardware instructions.\n\n`;
      dump += `REGISTER DUMP:\n`;
      dump += `RAX: ${cpuRegisters.RAX}   RBX: 0x00000000FFCC22AA\n`;
      dump += `RCX: 0x0000000000000000   RDX: 0x000000000000000F\n`;
      dump += `RIP: ${cpuRegisters.RIP}   RSP: ${cpuRegisters.RSP}\n`;
      dump += `RDI: 0x00007FFF00000400   RSI: 0x0000000000000010\n`;
      dump += `CR2: ${cpuRegisters.CR2}   EFLAGS: ${cpuRegisters.EFLAGS}\n\n`;
      dump += `STACK TRACE:\n`;
      kernelStack.forEach((frame, i) => {
        dump += `  [frame #${i}] ${frame}\n`;
      });
      
      setPanicDetails(dump);
      setKernelPanic(true);
      addNotification('Kernel Panic', 'CRITICAL ERROR: glassOS has panicked!', 'error');
    }
  };

  // Triggers an asynchronous Hardware Interrupt (IRQ)
  const handleTriggerHardwareIRQ = (irqNum: number) => {
    if (transitioningRing || kernelPanic) return;

    const matchedIrq = SYSTEM_IRQS.find(item => item.irq === irqNum);
    const deviceName = matchedIrq ? `${matchedIrq.device} (IRQ ${irqNum})` : `Generic Device (IRQ ${irqNum})`;
    const isrMsg = matchedIrq ? matchedIrq.isrMsg : `ISR-${irqNum} processed generic hardware interrupt signal.`;

    setTransitioningRing(true);
    setRingTarget('kernel');
    setIdtActiveVector(32 + irqNum); // Hardware interrupts mapped at Vector 32+

    addSyscallLog('warning', `[APIC] Hardware Interrupt ${irqNum} raised! Routing via CPU local APIC line...`);
    addSyscallLog('info', `[CPU] Asynchronously pausing user thread. Swapping CPU registers.`);

    // Push previous state
    setKernelStack(prev => [
      `0x0000000000000020 (IRQ Vector ${32 + irqNum})`,
      `0x0000000000000202 (User EFLAGS)`,
      `0x00007FFFFFFFEDD8 (User RSP)`,
      `0x00007FFF8A3C4D00 (User RIP)`,
      ...prev
    ]);

    setCpuRegisters(prev => ({
      ...prev,
      privilege: 'Ring 0 (Kernel)'
    }));

    addKernelLog('success', 'IRQ', `Asynchronous hardware interrupt ${irqNum} triggered by ${deviceName}. Routing to Ring-0.`);

    setTimeout(() => {
      addSyscallLog('success', `[ISR] Executing handler: ${isrMsg}`);
      
      setTimeout(() => {
        addSyscallLog('info', `[ISR] Handled asynchronously. Restoring user registers via "iret".`);
        
        setKernelStack([
          '0x00007FFFFFFFEDD8 (User RSP)',
          '0x0000000000000202 (User EFLAGS)',
          '0x00007FFF8A3C4D00 (User RIP)'
        ]);

        setCpuRegisters(prev => ({
          ...prev,
          privilege: 'Ring 3 (User)'
        }));

        setRingTarget('user');
        setTransitioningRing(false);
        setIdtActiveVector(null);

        // Find SADF driver and increment transaction counts if applicable
        if (irqNum === 9 || irqNum === 14) {
          const drvId = irqNum === 9 ? 'net0' : 'store0';
          setDrivers(prev => prev.map(drv => {
            if (drv.id === drvId) {
              return { ...drv, transactionsCount: drv.transactionsCount + 100, status: 'loaded' };
            }
            return drv;
          }));
        }

        addNotification('Hardware HAL', `Handled IRQ ${irqNum} successfully.`, 'info');
      }, 700);
    }, 500);
  };

  const handleRebootPanic = () => {
    setKernelPanic(false);
    setTransitioningRing(false);
    setRingTarget('user');
    setIdtActiveVector(null);
    setKernelStack([
      '0x00007FFFFFFFEDD8 (User RSP)',
      '0x0000000000000202 (User EFLAGS)',
      '0x00007FFF8A3C4D00 (User RIP)'
    ]);
    setCpuRegisters({
      RAX: '0x0000000000000000',
      RIP: '0x00007FFF8A3C4D00',
      RSP: '0x00007FFFFFFFEDD8',
      CR2: '0x0000000000000000',
      EFLAGS: '0x00000202',
      privilege: 'Ring 3 (User)'
    });
    setSyscallLogs([
      { id: 'reboot_1', msg: '--- KERNEL REBOOT COMPLETED ---', time: new Date().toLocaleTimeString(), type: 'success' },
      { id: 'reboot_2', msg: 'Re-initializing CPU structures. Loading GDT, LDT, and IDT tables...', time: new Date().toLocaleTimeString(), type: 'info' },
      { id: 'reboot_3', msg: 'IDT system call vector mapped at Vector 128 (0x80). Core recovered.', time: new Date().toLocaleTimeString(), type: 'success' }
    ]);
    addKernelLog('success', 'REBOOT', 'Kernel panic cleared. System successfully warm-booted.');
    addNotification('Kernel Reboot', 'glassOS Core successfully rebooted and recovered from panic.', 'success');
  };

  const scanTargets = [

    '/sys/kernel/core_scheduler.bin',
    '/sys/kernel/mmu_translator.bin',
    '/sys/drivers/net0_controller.sadf',
    '/sys/drivers/store0_storage.sadf',
    '/sys/drivers/gpu0_holographic.sadf',
    '/sys/enclave/holocrypt_keys.secure',
    '/sys/bus/zerocopy_ipc_pipeline',
    '/sys/bin/auth_service',
    '/sys/ram/frame_table_0x03',
    '/sys/ram/frame_table_0x14',
    '/sys/devices/pointer_hid'
  ];

  const handleStartAvScan = () => {
    if (avScanStatus === 'scanning') return;
    setAvScanStatus('scanning');
    setScanProgress(0);
    addKernelLog('info', 'AVPP', 'Initiating full-system Ring-0 signature scan...');
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < scanTargets.length) {
        setCurrentScanningItem(scanTargets[index]);
        setScanProgress(Math.floor(((index + 1) / scanTargets.length) * 100));
        index++;
      } else {
        clearInterval(interval);
        setCurrentScanningItem('');
        setScanProgress(100);
        
        // Determine scan result
        const activeThreats = viruses.filter(v => v.status === 'active');
        if (activeThreats.length > 0) {
          setAvScanStatus('threat_detected');
          addKernelLog('error', 'AVPP', `SCAN COMPLETED: Found ${activeThreats.length} active kernel threats! Immediate action required.`);
          addNotification('AVPP Core', `Detected ${activeThreats.length} severe kernel threats! Check AV dashboard.`, 'error');
        } else {
          setAvScanStatus('clean');
          addKernelLog('success', 'AVPP', 'SCAN COMPLETED: System fully verified. 0 threats detected. Memory segments aligned.');
          addNotification('AVPP Core', 'System integrity scan complete. 0 threats found.', 'success');
        }

        // Generate scan log in the logs folder
        if (fsLib) {
          try {
            const logsPath = 'home/Administrator/logs';
            if (!fsLib.exists(logsPath)) {
              fsLib.mkdir(logsPath);
            }
            
            const now = new Date();
            const formattedDate = now.toLocaleString();
            const fileSafeTimestamp = now.toISOString().replace(/[:.]/g, '-');
            const filename = `scan_report_kernel_${fileSafeTimestamp}.log`;
            const filePath = `${logsPath}/${filename}`;
            
            let logContent = `==================================================\n`;
            logContent += `GLASSOS KERNEL INTEGRITY & AVPP SCAN REPORT (KERNEL TAB)\n`;
            logContent += `==================================================\n`;
            logContent += `Timestamp: ${formattedDate}\n`;
            logContent += `Scan Status: ${activeThreats.length > 0 ? 'WARNING (Threats Found)' : 'NOMINAL (System Clean)'}\n`;
            logContent += `Total Files Scanned: ${scanTargets.length}\n`;
            logContent += `--------------------------------------------------\n`;
            logContent += `SCAN TARGETS VERIFIED:\n`;
            scanTargets.forEach(target => {
              logContent += `  [OK] ${target}\n`;
            });
            logContent += `--------------------------------------------------\n`;
            logContent += `THREAT DETECTION DETAILS:\n`;
            
            if (activeThreats.length === 0) {
              logContent += `  No active virus signatures detected.\n`;
              logContent += `  All Ring-0 driver enclaves fully validated and clean.\n`;
            } else {
              logContent += `  ⚠️ Detected ${activeThreats.length} severe active system threat(s):\n\n`;
              activeThreats.forEach((threat, i) => {
                logContent += `  [THREAT #${i+1}]\n`;
                logContent += `    Name: ${threat.name}\n`;
                logContent += `    Signature Hash: ${threat.hash}\n`;
                logContent += `    Severity: ${threat.severity.toUpperCase()}\n`;
                logContent += `    Target Layer: ${threat.target}\n`;
                logContent += `    Description: ${threat.description}\n`;
                logContent += `    Status: ${threat.status.toUpperCase()}\n\n`;
              });
            }
            
            logContent += `==================================================\n`;
            logContent += `Log produced by GlassOS AVPP Security Daemon.\n`;
            logContent += `==================================================\n`;
            
            fsLib.write(filePath, logContent);
            addKernelLog('success', 'AVPP', `Scan report generated: ${filename} saved to ${logsPath}`);
          } catch (e) {
            console.error('Failed to write scan log in GlassKernel', e);
          }
        }
      }
    }, 250);
  };

  const handleSimulateInfection = (virusName: string) => {
    // Check if Active Shield / Heuristics is active
    if (activeShieldActive) {
      addKernelLog('warning', 'AVPP', `ALERT: Intrusive signature [${virusName}] intercepted in real-time by Heuristics Active Shield.`);
      addKernelLog('success', 'AVPP', `Shield successfully quarantined signature hash inside Ring-0 enclave buffer. Threat neutralized.`);
      addNotification('Heuristics Active Shield', `Intercepted and quarantined ${virusName} intrusion!`, 'success');
      
      setViruses(prev => prev.map(v => v.name === virusName ? { ...v, status: 'quarantined' } : v));
      return;
    }
    
    // Otherwise, infect the system!
    setViruses(prev => prev.map(v => v.name === virusName ? { ...v, status: 'active' } : v));
    addKernelLog('error', 'KERNEL_BREACH', `CRITICAL: Known virus signature [${virusName}] has injected itself into live kernel space!`);
    addNotification('Kernel Warning', `Kernel space infected with ${virusName}! Run system scan immediately.`, 'error');
    
    // Visually alter some states
    if (virusName === 'HoloCrypt-Ransomware') {
      setHoloCryptEnclaveActive(false);
    } else if (virusName === 'SADF-Overflower') {
      setStrictIsolation(false);
    }
  };

  const handleNeutralizeThreat = (virusName: string) => {
    setViruses(prev => prev.map(v => v.name === virusName ? { ...v, status: 'neutralized' } : v));
    addKernelLog('success', 'AVPP', `Remediation successful: Purged signature payload for ${virusName}. Restoring segment hashes...`);
    addNotification('AVPP Core', `Threat neutralized: ${virusName} has been purged.`, 'success');
    
    // Recover state
    if (virusName === 'HoloCrypt-Ransomware') {
      setHoloCryptEnclaveActive(true);
    } else if (virusName === 'SADF-Overflower') {
      setStrictIsolation(true);
    }
    
    // Check if any active threats remain
    setTimeout(() => {
      setViruses(prev => {
        const remaining = prev.filter(v => v.status === 'active');
        if (remaining.length === 0) {
          setAvScanStatus('idle');
        }
        return prev;
      });
    }, 100);
  };

  const handleResetAv = () => {
    setViruses(prev => prev.map(v => ({ ...v, status: 'not_detected' })));
    setAvScanStatus('idle');
    setScanProgress(0);
    addKernelLog('info', 'AVPP', 'Antivirus Protection Protocol database and scan state cleared.');
  };

  // Synchronize driver agnostic code when selected driver changes
  useEffect(() => {
    const drv = drivers.find(d => d.id === selectedDriverId);
    if (drv) {
      setDriverAgnosticCode(drv.agnosticCode);
    }
  }, [selectedDriverId, drivers]);

  // Simulate transactional throughput for loaded drivers
  useEffect(() => {
    const interval = setInterval(() => {
      setDrivers(prev => prev.map(drv => {
        if (drv.status === 'loaded') {
          const increment = Math.floor(Math.random() * 8) + 1;
          return {
            ...drv,
            transactionsCount: drv.transactionsCount + increment
          };
        }
        return drv;
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Compile and Hotplug Agnostic Driver code
  const handleCompileAndHotplug = () => {
    if (isCompilingDriver) return;
    setIsCompilingDriver(true);
    setCompilerLogs([]);

    const currentDriver = drivers.find(d => d.id === selectedDriverId);
    if (!currentDriver) return;

    addKernelLog('info', 'SADF', `Preparing Silicon-Agnostic compilation for driver: ${currentDriver.name}...`);

    const archLabel = 
      activeArch === 'arm64' ? 'Apple Silicon (ARM64 / M-Series)' :
      activeArch === 'x86_64' ? 'Intel/AMD Core (x86_64)' :
      activeArch === 'riscv' ? 'RISC-V (Open-ISA Embedded)' :
      'Google Tensor (TPU VLIW Accelerators)';

    const steps = [
      { msg: '[SADF Engine] Parsing unified agnostic driver source tree...', delay: 200 },
      { msg: '[SADF Compiler] Emitting platform-independent Intermediate Representation (SADF-IR v2.1)...', delay: 450 },
      { msg: `[SADF Compiler] Invoking backend code generator targeting: ${archLabel}`, delay: 700 },
      { msg: '[SADF Linker] Binding hardware registers & static page mapping...', delay: 950 },
      { msg: '[SADF Sandbox] Validating pointer safety and device DMA bounds (Ring-0 Gatekeeper)...', delay: 1200 },
      { msg: '[SADF Hotplug] Dynamically loading translation table into live kernel memory space...', delay: 1450 },
      { msg: `[SADF Success] Driver '${currentDriver.name}' successfully bound to IRQ ${currentDriver.irqs} at Base ${currentDriver.baseAddress}!`, delay: 1650 }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setCompilerLogs(prev => [...prev, step.msg]);
        if (idx === steps.length - 1) {
          setIsCompilingDriver(false);
          // Set driver status to loaded and update code
          setDrivers(prev => prev.map(drv => {
            if (drv.id === selectedDriverId) {
              return {
                ...drv,
                status: 'loaded',
                agnosticCode: driverAgnosticCode,
                transactionsCount: drv.status === 'loaded' ? drv.transactionsCount : 0
              };
            }
            return drv;
          }));

          addKernelLog('success', 'SADF', `Hotplug loaded agnostic driver: ${currentDriver.name} (${currentDriver.version})`);
          addNotification('Silicon HAL', `Driver '${currentDriver.name}' successfully loaded into ring-0 on ${activeArch.toUpperCase()}`, 'success');
        }
      }, step.delay);
    });
  };

  // Simulating hardware interrupt trigger
  const handleTriggerHardwareInterrupt = (driver: Driver) => {
    if (driver.status !== 'loaded') {
      addNotification('SADF Bus', `Cannot trigger interrupt: Driver ${driver.name} is unloaded`, 'warning');
      return;
    }
    
    addKernelLog('success', 'IRQ', `HARDWARE INTERRUPT (IRQ ${driver.irqs}): Handled by Silicon-Agnostic HAL via compiled target descriptor!`);
    addNotification('Hardware HAL', `Fired IRQ ${driver.irqs} -> Handled via SADF translation on ${activeArch.toUpperCase()}`, 'info');
    
    // Increment transaction count
    setDrivers(prev => prev.map(drv => {
      if (drv.id === driver.id) {
        return {
          ...drv,
          transactionsCount: drv.transactionsCount + 100
        };
      }
      return drv;
    }));
  };

  // Dispatch interactive IPC transfer
  const handleIpcDispatch = () => {
    if (isIpcRunning) return;
    setIsIpcRunning(true);
    setIpcProgress(0);

    const mode = ipcMode;
    const size = messageSize;
    addKernelLog('info', 'IPC', `Initiating IPC transmission of ${size}MB payload in ${mode === 'zerocopy' ? 'ZERO-COPY' : 'BUFFER COPY'} mode...`);

    let duration = mode === 'zerocopy' ? 300 : size * 250; // zerocopy is blazing fast and constant time!
    let intervalTime = 30;
    let steps = duration / intervalTime;
    let currentStep = 0;

    // Temporarily allocate shared page in RAM if zerocopy is used
    if (mode === 'zerocopy') {
      setPhysicalRAM(prev => {
        const next = [...prev];
        next[14] = -2; // -2 represents the Zero-Copy Shared Ring Buffer
        return next;
      });
    } else {
      // Buffer copy creates transient page copies
      setPhysicalRAM(prev => {
        const next = [...prev];
        next[13] = 204; // App local buffer
        next[14] = 0;   // Copied to kernel buffer
        next[15] = 101; // Copied to target driver buffer
        return next;
      });
    }

    const interval = setInterval(() => {
      currentStep++;
      const progress = Math.min((currentStep / steps) * 100, 100);
      setIpcProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        setIsIpcRunning(false);

        // Stats calculation
        const calculatedLatency = mode === 'zerocopy' 
          ? Number((0.05 + Math.random() * 0.1).toFixed(3)) 
          : Number((size * 4.2 + Math.random() * 2).toFixed(1));
        
        const calculatedCpu = mode === 'zerocopy'
          ? Number((0.2 + Math.random() * 0.5).toFixed(2))
          : Number((size * 1.8 + Math.random() * 3).toFixed(1));

        addKernelLog(
          'success', 
          'IPC', 
          `IPC Complete! Mode: ${mode === 'zerocopy' ? 'Zero-Copy (Shared Pointer)' : 'Double Buffer Copy'}. Size: ${size}MB. Latency: ${calculatedLatency}ms. CPU overhead: ${calculatedCpu}%.`
        );

        // Add Notification
        addNotification(
          'Kernel Bus', 
          `IPC passed ${size}MB via ${mode === 'zerocopy' ? 'Zero-Copy Reference' : 'Memory Copy'} in ${calculatedLatency}ms`, 
          'success'
        );

        // Record stats
        setIpcStats(prev => ({
          ...prev,
          copyCount: prev.copyCount + (mode === 'copy' ? 1 : 0),
          zeroCopyCount: prev.zeroCopyCount + (mode === 'zerocopy' ? 1 : 0),
          totalBytesTransferred: prev.totalBytesTransferred + size * 1024 * 1024,
          copyAvgLatencyMs: mode === 'copy' ? Number(((prev.copyAvgLatencyMs * prev.copyCount + calculatedLatency) / (prev.copyCount + 1)).toFixed(2)) : prev.copyAvgLatencyMs,
          zeroCopyAvgLatencyMs: mode === 'zerocopy' ? Number(((prev.zeroCopyAvgLatencyMs * prev.zeroCopyCount + calculatedLatency) / (prev.zeroCopyCount + 1)).toFixed(3)) : prev.zeroCopyAvgLatencyMs,
          copyAvgCpuOverhead: mode === 'copy' ? Number(((prev.copyAvgCpuOverhead * prev.copyCount + calculatedCpu) / (prev.copyCount + 1)).toFixed(2)) : prev.copyAvgCpuOverhead,
          zeroCopyAvgCpuOverhead: mode === 'zerocopy' ? Number(((prev.zeroCopyAvgCpuOverhead * prev.zeroCopyCount + calculatedCpu) / (prev.zeroCopyCount + 1)).toFixed(2)) : prev.zeroCopyAvgCpuOverhead
        }));

        // Clean up RAM visualization frames
        setPhysicalRAM(prev => {
          const next = [...prev];
          next[13] = -1;
          next[14] = -1;
          next[15] = -1;
          return next;
        });
      }
    }, intervalTime);
  };

  // Simulate Malicious Memory Access Exploit
  const handleSimulateExploit = () => {
    if (exploitStatus === 'running') return;
    setExploitStatus('running');
    addKernelLog('warning', 'EXPLOIT', 'Process 512 (Untrusted Guest Script) executing pointer scan...');
    addKernelLog('warning', 'EXPLOIT', 'Attempting read from physical block 0x03 (Reserved for AuthService token cache)...');

    setTimeout(() => {
      if (strictIsolation) {
        setExploitStatus('prevented');
        addKernelLog('error', 'MMU', 'SECURITY EXCEPTION: SIGSEGV (Segmentation Fault). Process 512 tried to access unauthorized memory space.');
        addKernelLog('success', 'KERNEL', 'Guest script process sandboxed and strictly isolated. Threat neutralized.');
        addNotification('Gatekeeper', 'Intercepted memory read violation from untrusted script!', 'error');

        // Terminate the guest script process visually
        setProcesses(prev => prev.map(p => p.id === 512 ? { ...p, status: 'terminated' } : p));
        // Free its physical pages
        setPhysicalRAM(prev => {
          const next = [...prev];
          next[24] = -1;
          next[25] = -1;
          return next;
        });
      } else if (holoCryptEnclaveActive) {
        setExploitStatus('prevented');
        addKernelLog('success', 'SECURE ENCLAVE', `[HoloCrypt Enclave] INTERCEPT: Blocked illegal read access using Ring-0 secure hardware protection boundaries.`);
        addKernelLog('success', 'SECURE ENCLAVE', `[HoloCrypt Enclave] Enclave memory shield verified with dynamic quantum signature: HOLO-SECURE-${rotatingKey}.`);
        addKernelLog('success', 'SECURE ENCLAVE', `[HoloCrypt Enclave] Process 512 memory frames quarantined inside Ring-0 Secure Enclave.`);
        addNotification('HoloCrypt Enclave', 'HoloCrypt Enclave intercepted and neutralized memory read violation!', 'success');

        // Visually place process 512 into enclave/suspended status
        setProcesses(prev => prev.map(p => p.id === 512 ? { ...p, status: 'terminated' } : p));
        // In the physical RAM map, mark its physical frames as secured inside the enclave!
        // We can keep them as owned by 512 but mark them as secure in the log.
      } else {
        setExploitStatus('breached');
        addKernelLog('error', 'BREACH', 'EXPLOIT SUCCESSFUL! Process 512 successfully read 256 bytes from AuthService segment: token="gOS_usr_tok_8f9024c...".');
        addKernelLog('warning', 'SECURITY', 'System tokens leaked to untrusted space. Strict isolation recommended.');
        addNotification('Critical Breach', 'Memory isolation failure! AuthService data leaked.', 'error');
      }
    }, 2000);
  };

  const handleResetGuestScript = () => {
    setProcesses(prev => prev.map(p => p.id === 512 ? { ...p, status: 'running' } : p));
    setPhysicalRAM(prev => {
      const next = [...prev];
      next[24] = 512;
      next[25] = 512;
      return next;
    });
    setExploitStatus('idle');
    addKernelLog('info', 'KERNEL', 'Untrusted guest script process restarted with generic boundaries.');
  };

  return (
    <div className="flex flex-col gap-6 text-white p-6 md:p-8 select-none font-sans bg-[#0d1117] min-h-full rounded-2xl border border-white/5">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/10">
            <Cpu size={24} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight">Virtual Kernel Engine</h2>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[9px] font-bold uppercase tracking-wider">
                v2.5-Native
              </span>
            </div>
            <p className="text-xs text-white/40">Hardware-level isolation and Zero-Copy IPC Bus controllers</p>
          </div>
        </div>

        {/* Global Controls & States */}
        <div className="flex items-center flex-wrap gap-4">
          <div className="flex items-center gap-2 bg-[#161b22] px-4 py-2 rounded-2xl border border-white/5">
            <Shield size={14} className={strictIsolation ? "text-emerald-400" : "text-rose-400"} />
            <span className="text-xs font-semibold">Strict Isolation:</span>
            <button
              onClick={() => {
                setStrictIsolation(!strictIsolation);
                addKernelLog(
                  !strictIsolation ? 'success' : 'warning', 
                  'KERNEL', 
                  `Hardware-enforced Memory Isolation toggled to ${!strictIsolation ? 'STRICT' : 'LOOSE'}.`
                );
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all uppercase ${
                strictIsolation 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30'
              }`}
            >
              {strictIsolation ? 'ACTIVE' : 'DISABLED'}
            </button>
          </div>

          <div className="flex items-center gap-2 bg-[#161b22] px-4 py-2 rounded-2xl border border-white/5">
            <Zap size={14} className={zeroCopyEnabled ? "text-blue-400" : "text-amber-400"} />
            <span className="text-xs font-semibold">Zero-Copy:</span>
            <button
              onClick={() => {
                setZeroCopyEnabled(!zeroCopyEnabled);
                setIpcMode(!zeroCopyEnabled ? 'zerocopy' : 'copy');
                addKernelLog(
                  'info', 
                  'KERNEL', 
                  `Message passing bus standard set to ${!zeroCopyEnabled ? 'Zero-Copy Reference mode' : 'Traditional Data-Buffer Copying'}.`
                );
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all uppercase ${
                zeroCopyEnabled 
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30'
              }`}
            >
              {zeroCopyEnabled ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          <div className="flex items-center gap-2 bg-[#161b22] px-4 py-2 rounded-2xl border border-white/5">
            <Lock size={14} className={holoCryptEnclaveActive ? "text-amber-400" : "text-white/40"} />
            <span className="text-xs font-semibold text-white">HoloCrypt Enclave:</span>
            <button
              onClick={() => {
                setHoloCryptEnclaveActive(!holoCryptEnclaveActive);
                addKernelLog(
                  !holoCryptEnclaveActive ? 'success' : 'warning', 
                  'SECURE ENCLAVE', 
                  `HoloCrypt Ring-0 Secure Enclave toggled to ${!holoCryptEnclaveActive ? 'ENFORCED' : 'BYPASSED'}.`
                );
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all uppercase ${
                holoCryptEnclaveActive 
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]' 
                  : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'
              }`}
            >
              {holoCryptEnclaveActive ? 'ENFORCED' : 'BYPASSED'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Zero-Copy IPC Bus Controller */}
        <div className="bg-[#161b22] border border-white/5 rounded-3xl p-6 flex flex-col gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/2 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-blue-400" />
              <h3 className="text-sm font-semibold uppercase tracking-wider">Zero-Copy IPC Controller</h3>
            </div>
            <span className="text-[10px] text-white/30 font-mono">bus_latency: {zeroCopyEnabled ? '0.12ms' : '42.50ms'}</span>
          </div>

          <p className="text-xs text-white/60 leading-relaxed">
            Zero-copy communication eliminates the CPU overhead of duplicating buffer streams. Instead of writing bytes from Process memory into Kernel memory and finally to Driver buffers, GlassOS maps physical memory pages directly, passing lightweight read-only pointer pointers.
          </p>

          {/* Interactive Simulation Panel */}
          <div className="bg-[#0d1117] p-5 rounded-2xl border border-white/5 flex flex-col gap-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/40">Select Message Payload Size</span>
              <span className="text-blue-400 font-mono font-bold">{messageSize} MB</span>
            </div>
            
            {/* Range slider for message size */}
            <input 
              type="range" 
              min="1" 
              max="100" 
              value={messageSize} 
              onChange={(e) => setMessageSize(Number(e.target.value))}
              disabled={isIpcRunning}
              className="w-full accent-blue-500 h-1 bg-white/10 rounded-lg cursor-pointer"
            />
            
            <div className="flex items-center justify-between text-[11px] text-white/30">
              <span>1 MB (Fast)</span>
              <span>100 MB (Intense copy overhead)</span>
            </div>

            {/* Toggle IPC Style directly in Sandbox */}
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                onClick={() => setIpcMode('copy')}
                disabled={isIpcRunning}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  ipcMode === 'copy' 
                    ? 'border-amber-500/30 bg-amber-500/5 text-amber-400' 
                    : 'border-white/5 bg-white/2 text-white/40 hover:text-white/60 hover:bg-white/5'
                }`}
              >
                <span className="font-bold">Buffer Memory Copy</span>
                <span className="text-[9px] opacity-60">CPU cycles proportional to size</span>
              </button>

              <button
                onClick={() => setIpcMode('zerocopy')}
                disabled={isIpcRunning}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  ipcMode === 'zerocopy' 
                    ? 'border-blue-500/30 bg-blue-500/5 text-blue-400' 
                    : 'border-white/5 bg-white/2 text-white/40 hover:text-white/60 hover:bg-white/5'
                }`}
              >
                <span className="font-bold">Zero-Copy Pointer</span>
                <span className="text-[9px] opacity-60">Constant-time O(1) page flip</span>
              </button>
            </div>

            {/* Send Action */}
            <button
              onClick={handleIpcDispatch}
              disabled={isIpcRunning}
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
                isIpcRunning 
                  ? 'bg-blue-500/20 text-blue-400/60 cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-600 shadow-blue-500/10 hover:scale-[1.01]'
              }`}
            >
              {isIpcRunning ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Transferring via Bus... {Math.round(ipcProgress)}%
                </>
              ) : (
                <>
                  <ArrowLeftRight size={14} />
                  Dispatch IPC Message ({messageSize}MB)
                </>
              )}
            </button>
          </div>

          {/* Animated IPC Bus Pipeline Visualizer */}
          <div className="bg-[#0d1117] p-5 rounded-2xl border border-white/5 flex flex-col gap-4 relative min-h-[140px] justify-center">
            <div className="absolute top-2 left-3 text-[9px] font-bold text-white/20 uppercase tracking-wider">
              Memory Bus Routing Engine
            </div>

            <div className="flex items-center justify-between px-6 relative">
              {/* Process A */}
              <div className="flex flex-col items-center gap-1 z-10">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-bold font-mono shadow-lg">
                  App
                </div>
                <span className="text-[9px] text-white/40">Source (Client)</span>
              </div>

              {/* Memory Pipeline with moving packets */}
              <div className="flex-1 h-[2px] bg-white/10 mx-4 relative overflow-hidden">
                {/* Visualizer animation block */}
                {isIpcRunning && ipcMode === 'copy' && (
                  <motion.div 
                    initial={{ left: '0%' }}
                    animate={{ left: '100%' }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    className="absolute w-6 h-6 -mt-3 bg-amber-500/30 border border-amber-500 rounded-full flex items-center justify-center text-[8px] font-bold text-amber-400"
                  >
                    BUF
                  </motion.div>
                )}

                {isIpcRunning && ipcMode === 'zerocopy' && (
                  <motion.div 
                    initial={{ left: '0%' }}
                    animate={{ left: '100%' }}
                    transition={{ duration: 0.3, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute w-6 h-6 -mt-3 bg-blue-500/30 border border-blue-500 rounded-full flex items-center justify-center text-[8px] font-bold text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.6)]"
                  >
                    PTR
                  </motion.div>
                )}

                {/* Pipeline description text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[8px] text-white/20 font-bold uppercase tracking-widest bg-[#0d1117] px-2">
                    {isIpcRunning 
                      ? (ipcMode === 'zerocopy' ? 'SHARED PAGE FLIP' : 'COPYING MEMORY BUFFERS')
                      : 'IDLE BUS'
                    }
                  </span>
                </div>
              </div>

              {/* Process B */}
              <div className="flex flex-col items-center gap-1 z-10">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-bold font-mono shadow-lg">
                  Driver
                </div>
                <span className="text-[9px] text-white/40">Dest (Kernel)</span>
              </div>
            </div>

            {/* Explanatory subtitle */}
            <div className="text-center text-[10px] text-white/30 italic">
              {ipcMode === 'zerocopy' 
                ? '✓ Shared Pointer passes a memory reference instantly. Zero extra RAM allocated.' 
                : '✗ Buffer Copy copies whole block to kernel, then target. High CPU usage!'
              }
            </div>
          </div>

          {/* Performance Real-Time Analytics Comparison */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider">Bus Efficiency Analytics</span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#0d1117] p-3 rounded-xl border border-white/5 flex flex-col">
                <span className="text-[9px] text-white/30 uppercase">Copy Latency</span>
                <span className="text-xs font-mono font-bold text-amber-400">{ipcStats.copyAvgLatencyMs} ms</span>
              </div>
              <div className="bg-[#0d1117] p-3 rounded-xl border border-white/5 flex flex-col">
                <span className="text-[9px] text-white/30 uppercase">Zero-Copy Latency</span>
                <span className="text-xs font-mono font-bold text-blue-400">{ipcStats.zeroCopyAvgLatencyMs} ms</span>
              </div>
              <div className="bg-[#0d1117] p-3 rounded-xl border border-white/5 flex flex-col">
                <span className="text-[9px] text-white/30 uppercase">Copy CPU load</span>
                <span className="text-xs font-mono font-bold text-amber-400">{ipcStats.copyAvgCpuOverhead}%</span>
              </div>
              <div className="bg-[#0d1117] p-3 rounded-xl border border-white/5 flex flex-col">
                <span className="text-[9px] text-white/30 uppercase">Zero-Copy CPU load</span>
                <span className="text-xs font-mono font-bold text-blue-400">{ipcStats.zeroCopyAvgCpuOverhead}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: MMU & Strict Memory Isolation Visualizer */}
        <div className="bg-[#161b22] border border-white/5 rounded-3xl p-6 flex flex-col gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/2 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-emerald-400" />
              <h3 className="text-sm font-semibold uppercase tracking-wider">MMU Isolation controller</h3>
            </div>
            <span className="text-[10px] text-white/30 font-mono">isolation_mode: {strictIsolation ? 'HARDWARE' : 'EMULATED'}</span>
          </div>

          <p className="text-xs text-white/60 leading-relaxed">
            Strict memory isolation segments virtual address space, mapping logical page addresses strictly to distinct physical frames inside the RAM array. Rogue scripts or processes cannot bypass their isolation sandbox to read/write system service blocks unless allowed.
          </p>

          {/* Process List with Address Mappings */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider">Isolated Processes Address Spaces</span>
              {exploitStatus !== 'idle' && (
                <button 
                  onClick={handleResetGuestScript} 
                  className="text-[9px] text-blue-400 hover:underline flex items-center gap-1"
                >
                  <RefreshCw size={10} /> Reset Guest Script
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2">
              {processes.map(proc => (
                <div 
                  key={proc.id} 
                  className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                    proc.status === 'terminated' 
                      ? 'bg-rose-950/10 border-rose-950/30 opacity-50' 
                      : 'bg-[#0d1117] border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      proc.status === 'terminated' ? 'bg-rose-500' :
                      proc.type === 'system' ? 'bg-purple-400 shadow-[0_0_6px_rgba(168,85,247,0.5)]' :
                      proc.type === 'user' ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' : 
                      'bg-rose-400 animate-pulse shadow-[0_0_6px_rgba(244,63,94,0.5)]'
                    }`} />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white/90">{proc.name}</span>
                      <span className="text-[9px] text-white/30 font-mono">PID: {proc.id} • {proc.virtualPages.join(', ')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] text-white/20 uppercase font-bold">Physical Maps</span>
                      <span className="text-[10px] font-mono text-white/40">
                        {proc.status === 'terminated' ? 'DEALLOCATED' : proc.physicalPages.map(p => `f${p}`).join(', ')}
                      </span>
                    </div>
                    <div className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                      proc.status === 'terminated' ? 'bg-rose-500/10 text-rose-400' :
                      proc.type === 'system' ? 'bg-purple-500/10 text-purple-400' :
                      proc.type === 'user' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {proc.status}
                    </div>

                    {proc.type === 'user' && proc.status !== 'terminated' && (
                      <button
                        onClick={() => handleKillProcess(proc)}
                        className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-md shadow-rose-950/20"
                        title="End Task"
                      >
                        <X size={10} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Physical RAM Map Grid Visualizer (32 frames) */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider">Physical System RAM Allocation</span>
              <span className="text-[9px] text-white/40">Total Frames: 32 ({pageSize === 4 ? '128KB' : '64MB'} RAM)</span>
            </div>

            <div className="grid grid-cols-8 gap-2">
              {physicalRAM.map((ownerId, index) => {
                const isSelected = selectedPhysicalBlock === index;
                const owner = processes.find(p => p.id === ownerId);
                
                let bgClass = 'bg-white/2 border-white/5 hover:bg-white/5';
                let textClass = 'text-white/20';
                
                if (ownerId === 0) {
                  bgClass = 'bg-slate-700/30 border-slate-700/50 text-slate-400';
                } else if (ownerId === -2) {
                  bgClass = 'bg-blue-500/20 border-blue-500/40 text-blue-400 animate-pulse';
                } else if (owner) {
                  if (owner.type === 'system') {
                    bgClass = 'bg-purple-500/15 border-purple-500/30 text-purple-400';
                  } else if (owner.type === 'user') {
                    bgClass = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400';
                  } else {
                    bgClass = 'bg-rose-500/15 border-rose-500/30 text-rose-400';
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedPhysicalBlock(isSelected ? null : index)}
                    className={`h-9 rounded-lg border text-[10px] font-mono font-bold flex flex-col items-center justify-center transition-all ${bgClass} ${
                      isSelected ? 'ring-2 ring-blue-500 border-transparent scale-105 z-10 shadow-lg shadow-blue-500/10' : ''
                    }`}
                    title={
                      ownerId === 0 ? 'Kernel Reserved Page' :
                      ownerId === -2 ? 'Shared Zero-Copy Page Reference' :
                      owner ? `${owner.name} Frame` : 'Free Memory Block'
                    }
                  >
                    <span>f{index}</span>
                    <span className="text-[7px] opacity-40">
                      {ownerId === 0 ? 'SYS' : ownerId === -2 ? 'SHM' : ownerId === -1 ? 'FREE' : ownerId}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Block Info Panel */}
            <AnimatePresence>
              {selectedPhysicalBlock !== null && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[#0d1117] p-3 rounded-xl border border-white/5 text-xs flex flex-col gap-1 overflow-hidden"
                >
                  <div className="flex justify-between font-bold">
                    <span>Physical Frame f{selectedPhysicalBlock} Address</span>
                    <span className="text-blue-400">0x{selectedPhysicalBlock.toString(16).toUpperCase().padStart(4, '0')}</span>
                  </div>
                  <p className="text-[11px] text-white/50">
                    {physicalRAM[selectedPhysicalBlock] === 0 ? 'Fully locked page containing core scheduler and file table pointers.' :
                     physicalRAM[selectedPhysicalBlock] === -2 ? 'Shared ring-buffer mapped context used for zero-copy packet flow.' :
                     physicalRAM[selectedPhysicalBlock] === -1 ? 'Unallocated memory page frame. Ready for allocation requests.' :
                     `Currently mapped to ${processes.find(p => p.id === physicalRAM[selectedPhysicalBlock])?.name || 'Unknown Process'}.`}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Malicious Exploit Security Testing Switchboard */}
          <div className="bg-[#0d1117] p-4 rounded-2xl border border-white/5 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white/90">Boundary Leak Tester</span>
                <span className="text-[10px] text-white/40">Verify segment shield integrity against hostile scripts</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                exploitStatus === 'prevented' ? 'bg-emerald-500/10 text-emerald-400' :
                exploitStatus === 'breached' ? 'bg-rose-500/10 text-rose-400 animate-pulse' :
                'bg-slate-500/10 text-slate-400'
              }`}>
                {exploitStatus === 'prevented' ? 'Shielded' : exploitStatus === 'breached' ? 'Breached' : 'Awaiting Test'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSimulateExploit}
                disabled={exploitStatus === 'running' || processes.find(p => p.id === 512)?.status === 'terminated'}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  processes.find(p => p.id === 512)?.status === 'terminated'
                    ? 'bg-rose-500/10 text-rose-400/40 border border-rose-500/10 cursor-not-allowed'
                    : exploitStatus === 'running'
                    ? 'bg-rose-500/20 text-rose-400 cursor-wait'
                    : 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-500/5'
                }`}
              >
                {exploitStatus === 'running' ? 'Scanning memory address space...' : 'Trigger Memory Leak Exploit'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Antivirus Protection Protocol (AVPP) */}
      <div className="bg-[#161b22] border border-white/5 rounded-3xl p-6 flex flex-col gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/2 rounded-full blur-3xl pointer-events-none" />
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/5">
              <ShieldAlert size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Antivirus Protection Protocol (AVPP)</h3>
                <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[8px] font-bold uppercase tracking-wider">
                  SEC-LEVEL 4
                </span>
              </div>
              <p className="text-xs text-white/40">Real-time heuristic signature scanning and memory quarantine isolation systems</p>
            </div>
          </div>

          {/* AV Switches */}
          <div className="flex items-center gap-4 flex-wrap text-xs">
            <div className="flex items-center gap-2 bg-[#0d1117] px-3 py-1.5 rounded-xl border border-white/5">
              <ShieldCheck size={14} className={activeShieldActive ? "text-emerald-400" : "text-white/20"} />
              <span className="text-[11px] text-white/60 font-semibold">Active Shield:</span>
              <button
                onClick={() => {
                  setActiveShieldActive(!activeShieldActive);
                  addKernelLog(
                    !activeShieldActive ? 'success' : 'warning',
                    'AVPP',
                    `Real-time signature monitoring active shield ${!activeShieldActive ? 'ENABLED' : 'DISABLED'}.`
                  );
                }}
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-all ${
                  activeShieldActive 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'
                }`}
              >
                {activeShieldActive ? 'ON' : 'OFF'}
              </button>
            </div>

            <button
              onClick={handleResetAv}
              className="text-white/30 hover:text-white/60 transition-colors text-[10px] font-bold uppercase flex items-center gap-1.5"
            >
              <RefreshCw size={10} /> Reset AV DB
            </button>
          </div>
        </div>

        {/* Outer Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Side: Scan Dashboard & Intrusion Simulator (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Live Scanner Screen */}
            <div className="bg-[#0d1117] p-5 rounded-2xl border border-white/5 flex flex-col gap-4 relative min-h-[170px] justify-between overflow-hidden">
              <div className="absolute top-2 left-3 text-[9px] font-bold text-white/20 uppercase tracking-wider flex items-center gap-1.5">
                <Scan size={10} className={avScanStatus === 'scanning' ? 'animate-pulse text-blue-400' : ''} />
                Heuristic Scan Terminal
              </div>

              {/* Status Header */}
              <div className="flex justify-between items-start mt-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/30 uppercase">System Integrity</span>
                  <span className={`text-sm font-bold uppercase tracking-tight flex items-center gap-1.5 ${
                    avScanStatus === 'scanning' ? 'text-blue-400 animate-pulse' :
                    avScanStatus === 'threat_detected' ? 'text-rose-500' :
                    avScanStatus === 'clean' ? 'text-emerald-400' :
                    viruses.some(v => v.status === 'active') ? 'text-rose-500 animate-pulse' : 'text-white/60'
                  }`}>
                    {avScanStatus === 'scanning' && 'SCANNING KERNEL MEMORY...'}
                    {avScanStatus === 'threat_detected' && '⚠️ THREATS FOUND!'}
                    {avScanStatus === 'clean' && '✓ CORE NOMINAL'}
                    {avScanStatus === 'idle' && (viruses.some(v => v.status === 'active') ? '⚠️ THREATS DETECTED' : 'AWAITING SCAN')}
                  </span>
                </div>
                {avScanStatus === 'scanning' && (
                  <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                    {scanProgress}%
                  </span>
                )}
              </div>

              {/* Scan Info or Scan Progress */}
              {avScanStatus === 'scanning' ? (
                <div className="flex flex-col gap-2 my-2">
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-white/40 truncate">
                    READ: {currentScanningItem}
                  </span>
                </div>
              ) : avScanStatus === 'threat_detected' ? (
                <div className="my-2 p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/20 text-[11px] text-rose-400/90 leading-relaxed flex items-center gap-2">
                  <AlertTriangle size={14} className="shrink-0 text-rose-400 animate-bounce" />
                  <span>
                    Signature matches found inside driver compiler allocations. Deploy purging vectors immediately.
                  </span>
                </div>
              ) : avScanStatus === 'clean' ? (
                <div className="my-2 p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-[11px] text-emerald-400/90 leading-relaxed flex items-center gap-2">
                  <ShieldCheck size={14} className="shrink-0 text-emerald-400" />
                  <span>
                    Core system files fully verified against hash registry. All pages aligned cleanly.
                  </span>
                </div>
              ) : (
                <div className="text-white/30 text-[10px] italic leading-normal">
                  Press the execution button below to run a high-priority, zero-copy, hash-matching signature scan across all Ring-0 buffers.
                </div>
              )}

              {/* Scan Controls */}
              <button
                onClick={handleStartAvScan}
                disabled={avScanStatus === 'scanning'}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  avScanStatus === 'scanning'
                    ? 'bg-blue-500/10 text-blue-400/40 border border-blue-500/10 cursor-wait'
                    : 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-[1.01] shadow-lg shadow-blue-500/10'
                }`}
              >
                <Search size={14} />
                {avScanStatus === 'scanning' ? 'Scanning Signature Hashes...' : 'Start Deep System Scan'}
              </button>
            </div>

            {/* Intrusion Simulator Panel */}
            <div className="bg-[#0d1117] p-5 rounded-2xl border border-white/5 flex flex-col gap-3">
              <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider flex items-center gap-1">
                <Bug size={11} className="text-rose-400" />
                Vulnerability Intrusion Simulator
              </span>
              <p className="text-[11px] text-white/50 leading-relaxed">
                Inject signature payloads into live RAM to verify the AV scan, heuristic protection traps, and quarantine protocols.
              </p>

              {/* Virus Injection Select List */}
              <div className="flex flex-col gap-2 mt-1">
                {viruses.filter(v => v.status === 'not_detected').length === 0 ? (
                  <div className="text-center text-[10px] text-white/30 py-2">
                    All signatures are currently active, quarantined, or neutralized.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {viruses.map(virus => {
                      if (virus.status !== 'not_detected') return null;
                      return (
                        <button
                          key={virus.name}
                          onClick={() => handleSimulateInfection(virus.name)}
                          disabled={avScanStatus === 'scanning'}
                          className="py-1.5 px-2.5 rounded-xl bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/30 text-rose-400 text-[10px] font-bold text-left transition-all truncate"
                          title={`Infect with ${virus.name}`}
                        >
                          + {virus.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side: Active Virus Database & Quarantines (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider">Known Virus Signatures Registry</span>
            
            <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto no-scrollbar pr-1">
              {viruses.map(virus => {
                let statusColor = 'bg-white/5 text-white/40 border border-white/5';
                let statusLabel = 'Nominal';
                
                if (virus.status === 'active') {
                  statusColor = 'bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse font-extrabold';
                  statusLabel = 'INFECTED';
                } else if (virus.status === 'quarantined') {
                  statusColor = 'bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold';
                  statusLabel = 'QUARANTINED';
                } else if (virus.status === 'neutralized') {
                  statusColor = 'bg-blue-500/10 text-blue-400 border border-blue-500/30 font-bold';
                  statusLabel = 'NEUTRALIZED';
                }

                return (
                  <div 
                    key={virus.name} 
                    className={`p-3.5 rounded-2xl border bg-[#0d1117]/60 flex flex-col gap-2.5 transition-all ${
                      virus.status === 'active' 
                        ? 'border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.1)] bg-rose-950/5' 
                        : 'border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          virus.status === 'active' ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]' :
                          virus.status === 'quarantined' ? 'bg-amber-400' :
                          virus.status === 'neutralized' ? 'bg-blue-400' : 'bg-white/10'
                        }`} />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white/90">{virus.name}</span>
                          <span className="text-[9px] text-white/30 font-mono">SIGNATURE: {virus.hash} • Target: {virus.target}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ${
                          virus.severity === 'critical' ? 'bg-red-500/15 text-red-400 border border-red-500/20' :
                          virus.severity === 'high' ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20' :
                          'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                        }`}>
                          {virus.severity}
                        </span>

                        <span className={`px-1.5 py-0.5 rounded text-[8px] tracking-wider uppercase ${statusColor}`}>
                          {statusLabel}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-4 border-t border-white/2 pt-2 text-[11px] text-white/50 leading-relaxed">
                      <span className="flex-1">{virus.description}</span>
                      
                      {/* Action buttons based on status */}
                      {(virus.status === 'active' || virus.status === 'quarantined') && (
                        <button
                          onClick={() => handleNeutralizeThreat(virus.name)}
                          className="px-2.5 py-1 rounded-lg bg-blue-500 text-white hover:bg-blue-600 text-[10px] font-extrabold border border-blue-500/30 flex items-center gap-1 self-center shadow-lg shadow-blue-500/5 shrink-0 transition-all hover:scale-[1.02]"
                        >
                          <ShieldCheck size={11} />
                          Neutralize
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Silicon-Agnostic Driver Framework (SADF) Dashboard */}
      <div className="bg-[#161b22] border border-white/5 rounded-3xl p-6 flex flex-col gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/2 rounded-full blur-3xl pointer-events-none" />
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Wrench size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Silicon-Agnostic Driver Framework (SADF)</h3>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[8px] font-bold uppercase tracking-wider">
                  HAL v3.0
                </span>
              </div>
              <p className="text-xs text-white/40">Compile once, execute securely on any CPU/NPU architecture without platform modifications</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40">Active Silicon ISA:</span>
            <div className="flex bg-[#0d1117] p-1 rounded-xl border border-white/5">
              {(['arm64', 'x86_64', 'riscv', 'tpu'] as const).map(arch => (
                <button
                  key={arch}
                  onClick={() => setActiveArch(arch)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                    activeArch === arch 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'text-white/40 hover:text-white/70 border border-transparent'
                  }`}
                >
                  {arch}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Inner Grid layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Driver Selector & Stats - 4 cols */}
          <div className="xl:col-span-4 flex flex-col gap-4">
            <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider">Unified Driver Catalog</span>
            <div className="flex flex-col gap-2.5">
              {drivers.map(drv => {
                const isSelected = selectedDriverId === drv.id;
                return (
                  <div
                    key={drv.id}
                    onClick={() => {
                      if (!isCompilingDriver) {
                        setSelectedDriverId(drv.id);
                      }
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                      isSelected 
                        ? 'bg-emerald-500/5 border-emerald-500/30 shadow-lg shadow-emerald-500/2' 
                        : 'bg-[#0d1117]/60 border-white/5 hover:border-white/10 hover:bg-[#0d1117]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          drv.type === 'network' ? 'bg-blue-500/10 text-blue-400' :
                          drv.type === 'storage' ? 'bg-amber-500/10 text-amber-400' :
                          drv.type === 'display' ? 'bg-purple-500/10 text-purple-400' :
                          drv.type === 'input' ? 'bg-rose-500/10 text-rose-400' :
                          'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {drv.type === 'network' && <ArrowLeftRight size={16} />}
                          {drv.type === 'storage' && <HardDrive size={16} />}
                          {drv.type === 'display' && <Sliders size={16} />}
                          {drv.type === 'accelerator' && <Cpu size={16} />}
                          {drv.type === 'input' && <MousePointer size={16} />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white/90">{drv.name}</span>
                          <span className="text-[9px] text-white/30 font-mono">IRQ {drv.irqs} • {drv.baseAddress}</span>
                        </div>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                        drv.status === 'loaded' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-white/30'
                      }`}>
                        {drv.status}
                      </span>
                    </div>

                    {drv.status === 'loaded' && (
                      <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-1 text-[10px] text-white/40">
                        <span className="flex items-center gap-1 font-mono">
                          <Activity size={10} className="text-emerald-400 animate-pulse" />
                          {drv.transactionsCount.toLocaleString()} xfers
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTriggerHardwareInterrupt(drv);
                          }}
                          className="px-2 py-0.5 rounded bg-white/5 text-white/70 hover:bg-white/10 text-[9px] font-semibold border border-white/5"
                        >
                          Trigger IRQ
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Code Editor & Architecture Translation - 8 cols */}
          <div className="xl:col-span-8 flex flex-col lg:grid lg:grid-cols-2 gap-6 bg-[#0d1117] p-5 rounded-3xl border border-white/5">
            {/* Unified Agnostic Code */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <Code2 size={12} className="text-emerald-400" />
                  Unified SADF Code
                </span>
                <span className="text-[9px] text-emerald-400/70 font-mono">Hardware Independent API</span>
              </div>
              <textarea
                value={driverAgnosticCode}
                onChange={(e) => setDriverAgnosticCode(e.target.value)}
                disabled={isCompilingDriver}
                className="w-full flex-1 min-h-[160px] lg:h-56 bg-[#090d11] border border-white/5 rounded-xl p-3 text-[11px] font-mono text-emerald-400/90 leading-normal focus:outline-none focus:border-emerald-500/40 resize-none no-scrollbar shadow-inner"
              />
              <button
                onClick={handleCompileAndHotplug}
                disabled={isCompilingDriver}
                className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  isCompilingDriver 
                    ? 'bg-emerald-500/10 text-emerald-400/50 cursor-not-allowed border border-emerald-500/20' 
                    : 'bg-emerald-500 text-slate-900 hover:bg-emerald-400 font-bold hover:scale-[1.01] shadow-lg shadow-emerald-500/10'
                }`}
              >
                {isCompilingDriver ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Compiling Bytecode...
                  </>
                ) : (
                  <>
                    <Wrench size={14} />
                    Compile & Hotplug to {activeArch.toUpperCase()}
                  </>
                )}
              </button>
            </div>

            {/* Compiled Assembly Translation */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <Cpu size={12} className="text-blue-400" />
                  ISA Machine Translation
                </span>
                <span className="text-[9px] text-blue-400/70 font-mono">Ring-0 Assembly Output</span>
              </div>

              {/* Compilation console output or static assembly */}
              <div className="flex-1 min-h-[200px] lg:h-full bg-[#090d11] border border-white/5 rounded-xl p-4 font-mono text-[10px] flex flex-col gap-1.5 overflow-y-auto no-scrollbar shadow-inner">
                {isCompilingDriver ? (
                  <div className="flex flex-col gap-1 text-emerald-500/80">
                    {compilerLogs.map((log, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.1 }}
                      >
                        {log}
                      </motion.div>
                    ))}
                    <div className="h-4 flex items-center gap-1.5 mt-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-emerald-500/50 text-[9px]">Laying platform segments...</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-400/90 leading-relaxed">
                    <div className="text-white/20 mb-2 border-b border-white/5 pb-1 flex justify-between items-center text-[9px]">
                      <span>TARGET: {activeArch.toUpperCase()} TRANSLATOR</span>
                      <span>OPTIMIZATION: -O3</span>
                    </div>
                    {activeArch === 'arm64' && (
                      <>
                        <span className="text-blue-400">.global</span> _glass_init<br />
                        _glass_init:<br />
                        &nbsp;&nbsp;<span className="text-purple-400">sub</span> sp, sp, #32 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-600">; Allocate frame</span><br />
                        &nbsp;&nbsp;<span className="text-purple-400">str</span> x30, [sp, #16] &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-600">; Save link reg</span><br />
                        &nbsp;&nbsp;<span className="text-purple-400">mov</span> w0, #{drivers.find(d => d.id === selectedDriverId)?.irqs || 9} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-600">; Register interrupt line</span><br />
                        &nbsp;&nbsp;<span className="text-purple-400">adrp</span> x1, _handler@PAGE<br />
                        &nbsp;&nbsp;<span className="text-purple-400">add</span> x1, x1, _handler@PAGEOFF<br />
                        &nbsp;&nbsp;<span className="text-purple-400">bl</span> _glass_map_irq &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-600">; HAL vector binding</span><br />
                        &nbsp;&nbsp;<span className="text-purple-400">mov</span> x0, #{drivers.find(d => d.id === selectedDriverId)?.baseAddress || '0x1A4000'}<br />
                        &nbsp;&nbsp;<span className="text-purple-400">bl</span> _glass_dma_alloc &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-600">; Agnostic MMU frame pin</span><br />
                        &nbsp;&nbsp;<span className="text-purple-400">ldr</span> x30, [sp, #16] &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-600">; Restore stack state</span><br />
                        &nbsp;&nbsp;<span className="text-purple-400">add</span> sp, sp, #32<br />
                        &nbsp;&nbsp;<span className="text-purple-400">ret</span>
                      </>
                    )}
                    {activeArch === 'x86_64' && (
                      <>
                        <span className="text-blue-400">section</span> .text<br />
                        <span className="text-blue-400">global</span> glass_init<br />
                        glass_init:<br />
                        &nbsp;&nbsp;<span className="text-purple-400">push</span> rbp<br />
                        &nbsp;&nbsp;<span className="text-purple-400">mov</span> rbp, rsp<br />
                        &nbsp;&nbsp;<span className="text-purple-400">mov</span> rdi, #{drivers.find(d => d.id === selectedDriverId)?.irqs || 9} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-600">; Syscall IRQ parameter</span><br />
                        &nbsp;&nbsp;<span className="text-purple-400">lea</span> rsi, [rip + network_handler]<br />
                        &nbsp;&nbsp;<span className="text-purple-400">call</span> glass_map_irq &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-600">; Global IDT rewrite</span><br />
                        &nbsp;&nbsp;<span className="text-purple-400">mov</span> rdi, #{drivers.find(d => d.id === selectedDriverId)?.baseAddress || '0x1A4000'}<br />
                        &nbsp;&nbsp;<span className="text-purple-400">call</span> glass_dma_alloc &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-600">; Map Ring-0 physical frames</span><br />
                        &nbsp;&nbsp;<span className="text-purple-400">pop</span> rbp<br />
                        &nbsp;&nbsp;<span className="text-purple-400">ret</span>
                      </>
                    )}
                    {activeArch === 'riscv' && (
                      <>
                        <span className="text-blue-400">.global</span> glass_init<br />
                        glass_init:<br />
                        &nbsp;&nbsp;<span className="text-purple-400">addi</span> sp, sp, -16 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-600">; Reserve stack index</span><br />
                        &nbsp;&nbsp;<span className="text-purple-400">sd</span> ra, 8(sp) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-600">; Preserve return address</span><br />
                        &nbsp;&nbsp;<span className="text-purple-400">li</span> a0, #{drivers.find(d => d.id === selectedDriverId)?.irqs || 9} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-600">; Load immediate target IRQ</span><br />
                        &nbsp;&nbsp;<span className="text-purple-400">la</span> a1, network_handler<br />
                        &nbsp;&nbsp;<span className="text-purple-400">jal</span> ra, glass_map_irq &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-600">; Map vectorized hardware interrupt</span><br />
                        &nbsp;&nbsp;<span className="text-purple-400">li</span> a0, {drivers.find(d => d.id === selectedDriverId)?.baseAddress || '0x1A4000'}<br />
                        &nbsp;&nbsp;<span className="text-purple-400">jal</span> ra, glass_dma_alloc &nbsp;&nbsp;&nbsp;<span className="text-slate-600">; Standard micro-page map</span><br />
                        &nbsp;&nbsp;<span className="text-purple-400">ld</span> ra, 8(sp)<br />
                        &nbsp;&nbsp;<span className="text-purple-400">addi</span> sp, sp, 16<br />
                        &nbsp;&nbsp;<span className="text-purple-400">ret</span>
                      </>
                    )}
                    {activeArch === 'tpu' && (
                      <>
                        <span className="text-blue-400">; Google Tensor Matrix Vector Core</span><br />
                        <span className="text-blue-400">_tensor_entry</span>:<br />
                        &nbsp;&nbsp;<span className="text-purple-400">vld.u16</span> v0, r0, r1 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-600">; Stream tensor frame addresses</span><br />
                        &nbsp;&nbsp;<span className="text-purple-400">li</span> r14, #{drivers.find(d => d.id === selectedDriverId)?.irqs || 9} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-600">; Tensor IRQ trigger line</span><br />
                        &nbsp;&nbsp;<span className="text-purple-400">vmapirq</span> r14, _tensor_callback<br />
                        &nbsp;&nbsp;<span className="text-purple-400">vdma_set</span> v0, #{drivers.find(d => d.id === selectedDriverId)?.baseAddress || '0x1A4000'}<br />
                        &nbsp;&nbsp;<span className="text-purple-400">vflush</span> matrix_buffer &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-600">; Atomic VLIW vector block pipeline</span><br />
                        &nbsp;&nbsp;<span className="text-purple-400">tcall</span> #0x3 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-600">; Deep learning scheduler yield</span><br />
                        &nbsp;&nbsp;<span className="text-purple-400">ret</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* SYSTEM CALLS, TRAPS & INTERRUPTS CORE PANEL */}
      {/* ========================================== */}
      <div className="bg-[#161b22] border border-white/5 rounded-3xl p-6 flex flex-col gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Activity size={18} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">System Call Gates, traps & IRQ interrupts</h3>
                <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[8px] font-bold uppercase tracking-wider">
                  Ring-0 / Ring-3 Gateway
                </span>
              </div>
              <p className="text-[10px] text-white/40 mt-0.5">Hardware Interrupt Request routing, privileged assembly traps, and custom IDT exception handling</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-[#0d1117] p-1.5 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveCtrlTab('syscall')}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all uppercase ${
                activeCtrlTab === 'syscall'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              Syscalls
            </button>
            <button
              onClick={() => setActiveCtrlTab('trap')}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all uppercase ${
                activeCtrlTab === 'trap'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              Traps & Faults
            </button>
            <button
              onClick={() => setActiveCtrlTab('irq')}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all uppercase ${
                activeCtrlTab === 'irq'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              HW Interrupts (IRQ)
            </button>
          </div>
        </div>

        {/* Local Kernel Panic BSoD Screen Overlay */}
        <AnimatePresence>
          {kernelPanic && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="absolute inset-0 z-50 bg-[#000088] text-white p-8 font-mono flex flex-col justify-between overflow-y-auto"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-white/20 pb-3">
                  <div className="bg-red-600 px-2 py-0.5 rounded text-xs font-bold uppercase animate-bounce">
                    !!! KERNEL PANIC !!!
                  </div>
                  <span className="text-sm font-bold tracking-tight">glassOS Core Dump Interface v2.5</span>
                </div>

                <div className="bg-black/30 p-4 rounded border border-white/10 text-xs text-white/90 leading-relaxed whitespace-pre-wrap font-mono max-h-96 overflow-y-auto scrollbar-thin">
                  {panicDetails}
                </div>

                <div className="text-xs text-blue-200 leading-relaxed space-y-1">
                  <p>• If this is the first time you've seen this Stop error, restart the virtual kernel core.</p>
                  <p>• Check to make sure any new hardware or drivers are properly configured.</p>
                  <p>• If problems continue, disable Memory Isolation or resize MMU segment page size.</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/20 mt-4">
                <span className="text-[10px] text-white/50">Core: ESNext Native Virtual Core (Ring 0 Exception Trap)</span>
                <button
                  onClick={handleRebootPanic}
                  className="px-4 py-2 bg-white text-[#000088] font-bold text-xs rounded hover:bg-white/90 transition-all flex items-center gap-1.5 shadow-lg shadow-black/20"
                >
                  <RefreshCw size={13} className="animate-spin" />
                  Reboot Kernel Core
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Column 1: Privilege Rings & CPU Registers (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4 bg-[#0d1117] p-5 rounded-2xl border border-white/5">
            <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider">CPU Execution Ring & Registers</span>
            
            {/* Privilege Rings Visualizer */}
            <div className="relative h-44 bg-[#090d12] rounded-xl border border-white/5 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:14px_14px]" />
              
              {/* Outer Ring: Ring 3 User */}
              <div className={`absolute w-36 h-36 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                ringTarget === 'user' 
                  ? 'border-emerald-500/40 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.15)] scale-100' 
                  : 'border-white/5 bg-transparent scale-95 opacity-40'
              }`}>
                <span className="absolute top-1 text-[8px] font-mono font-bold tracking-wider text-emerald-400">RING 3 - USER SPACE</span>
              </div>

              {/* Inner Ring: Ring 0 Kernel */}
              <div className={`absolute w-24 h-24 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                ringTarget === 'kernel' 
                  ? 'border-purple-500/60 bg-purple-500/10 shadow-[0_0_25px_rgba(168,85,247,0.25)] scale-105' 
                  : 'border-white/5 bg-transparent scale-95 opacity-40'
              }`}>
                <span className="absolute bottom-1 text-[8px] font-mono font-bold tracking-wider text-purple-400">RING 0 - KERNEL</span>
              </div>

              {/* CPU Core Center */}
              <div className="z-10 w-12 h-12 rounded-xl bg-black border border-white/10 flex flex-col items-center justify-center text-white/90 shadow-lg">
                <span className="text-[10px] font-bold font-sans">CPU</span>
                <span className="text-[8px] font-mono text-white/40 uppercase">Core0</span>
              </div>

              {/* Privilege Transition Animation Stream */}
              {transitioningRing && (
                <motion.div
                  initial={{ scale: ringTarget === 'kernel' ? 1.4 : 0.6, opacity: 0 }}
                  animate={{ scale: ringTarget === 'kernel' ? 0.7 : 1.3, opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 0.8, ease: 'easeInOut', repeat: Infinity }}
                  className={`absolute w-28 h-28 rounded-full border border-dashed z-0 ${
                    ringTarget === 'kernel' ? 'border-purple-500 text-purple-400' : 'border-emerald-500 text-emerald-400'
                  }`}
                />
              )}

              {/* Operating Status HUD Badge */}
              <div className="absolute top-2.5 left-3 px-2 py-0.5 rounded-md bg-[#161b22] border border-white/5 flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  ringTarget === 'kernel' ? 'bg-purple-400 animate-pulse' : 'bg-emerald-400 animate-pulse'
                }`} />
                <span className="text-[8px] font-mono font-bold text-white/80">
                  {ringTarget === 'kernel' ? 'KERNEL MODE (Ring 0)' : 'USER MODE (Ring 3)'}
                </span>
              </div>

              {/* Active Vector Frame HUD */}
              {idtActiveVector !== null && (
                <div className="absolute top-2.5 right-3 px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 flex items-center gap-1">
                  <AlertCircle size={8} className="text-rose-400 animate-spin" />
                  <span className="text-[8px] font-mono font-bold text-rose-400">
                    VECTOR {idtActiveVector}
                  </span>
                </div>
              )}
            </div>

            {/* Processor Register State */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="bg-[#090d12] p-2 rounded-lg border border-white/5 flex justify-between items-center">
                <span className="text-white/40">RAX (SysNo):</span>
                <span className="text-emerald-400 font-bold text-[10px] tracking-tight truncate max-w-[85px]" title={cpuRegisters.RAX}>
                  {cpuRegisters.RAX}
                </span>
              </div>
              <div className="bg-[#090d12] p-2 rounded-lg border border-white/5 flex justify-between items-center">
                <span className="text-white/40">RIP (Pointer):</span>
                <span className="text-blue-400 font-bold text-[10px] tracking-tight truncate max-w-[85px]" title={cpuRegisters.RIP}>
                  {cpuRegisters.RIP}
                </span>
              </div>
              <div className="bg-[#090d12] p-2 rounded-lg border border-white/5 flex justify-between items-center">
                <span className="text-white/40">RSP (Stack):</span>
                <span className="text-amber-400 font-bold text-[10px] tracking-tight truncate max-w-[85px]" title={cpuRegisters.RSP}>
                  {cpuRegisters.RSP}
                </span>
              </div>
              <div className="bg-[#090d12] p-2 rounded-lg border border-white/5 flex justify-between items-center">
                <span className="text-white/40">CR2 (Fault):</span>
                <span className="text-rose-400 font-bold text-[10px] tracking-tight truncate max-w-[85px]" title={cpuRegisters.CR2}>
                  {cpuRegisters.CR2}
                </span>
              </div>
              <div className="bg-[#090d12] p-2 col-span-2 rounded-lg border border-white/5 flex justify-between items-center">
                <span className="text-white/40">EFLAGS (Status):</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-white/40 text-[9px] bg-white/5 px-1 rounded">IF (Interrupts Active)</span>
                  <span className="text-purple-400 font-bold text-[10px]">{cpuRegisters.EFLAGS}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: IDT & Kernel Stack (3 cols) */}
          <div className="lg:col-span-3 flex flex-col gap-4 bg-[#0d1117] p-5 rounded-2xl border border-white/5">
            <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider">IDT Mapping & Kernel Stack</span>
            
            {/* Real-time Stack visualizer */}
            <div className="flex flex-col gap-1.5 flex-1 min-h-[120px] justify-end">
              <span className="text-[9px] font-mono text-white/30 text-center uppercase tracking-wide">Kernel Stack Frames</span>
              <div className="flex flex-col-reverse gap-1 border border-white/5 bg-black/40 p-1.5 rounded-xl font-mono text-[9px] overflow-y-auto max-h-36 scrollbar-thin">
                {kernelStack.map((frame, index) => (
                  <div 
                    key={index} 
                    className={`px-2 py-1 rounded text-center truncate select-none ${
                      index === 0 
                        ? 'bg-purple-500/25 border border-purple-500/40 text-purple-300 font-bold animate-pulse' 
                        : 'bg-white/5 text-white/60 border border-white/5'
                    }`}
                  >
                    {frame}
                  </div>
                ))}
              </div>
              <span className="text-[8px] text-white/20 text-center uppercase">← RSP Stack Pointer Base</span>
            </div>

            {/* Interrupt Descriptor Table (IDT) Mini Map */}
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-white/30 uppercase tracking-wide">IDT Gate Registers</span>
              <div className="grid grid-cols-4 gap-1 font-mono text-[8px]">
                <div className={`p-1 text-center rounded border ${
                  idtActiveVector === 0 ? 'bg-rose-500/30 border-rose-500 text-rose-300 font-bold' : 'bg-[#161b22] border-white/5 text-white/40'
                }`} title="Vector 0: #DE Divide Error">
                  #DE 00
                </div>
                <div className={`p-1 text-center rounded border ${
                  idtActiveVector === 6 ? 'bg-rose-500/30 border-rose-500 text-rose-300 font-bold' : 'bg-[#161b22] border-white/5 text-white/40'
                }`} title="Vector 6: #UD Invalid Opcode">
                  #UD 06
                </div>
                <div className={`p-1 text-center rounded border ${
                  idtActiveVector === 13 ? 'bg-rose-500/30 border-rose-500 text-rose-300 font-bold' : 'bg-[#161b22] border-white/5 text-white/40'
                }`} title="Vector 13: #GP General Protection">
                  #GP 13
                </div>
                <div className={`p-1 text-center rounded border ${
                  idtActiveVector === 14 ? 'bg-rose-500/30 border-rose-500 text-rose-300 font-bold' : 'bg-[#161b22] border-white/5 text-white/40'
                }`} title="Vector 14: #PF Page Fault">
                  #PF 14
                </div>
                <div className={`p-1 text-center rounded border ${
                  idtActiveVector === 32 ? 'bg-amber-500/30 border-amber-500 text-amber-300 font-bold animate-pulse' : 'bg-[#161b22] border-white/5 text-white/40'
                }`} title="Vector 32: System Timer IRQ 0">
                  IRQ 00
                </div>
                <div className={`p-1 text-center rounded border ${
                  idtActiveVector === 33 ? 'bg-amber-500/30 border-amber-500 text-amber-300 font-bold animate-pulse' : 'bg-[#161b22] border-white/5 text-white/40'
                }`} title="Vector 33: Keyboard IRQ 1">
                  IRQ 01
                </div>
                <div className={`p-1 text-center rounded border truncate ${
                  (idtActiveVector !== null && idtActiveVector >= 34 && idtActiveVector <= 47) 
                    ? 'bg-amber-500/30 border-amber-500 text-amber-300 font-bold animate-pulse' 
                    : 'bg-[#161b22] border-white/5 text-white/40'
                }`} title={(idtActiveVector !== null && idtActiveVector >= 34 && idtActiveVector <= 47) ? `Vector ${idtActiveVector}: IRQ ${idtActiveVector - 32} active` : "Other IRQ Line (IRQ 2-15)"}>
                  {(idtActiveVector !== null && idtActiveVector >= 34 && idtActiveVector <= 47) 
                    ? `IRQ ${(idtActiveVector - 32).toString().padStart(2, '0')}` 
                    : 'IRQ HW'}
                </div>
                <div className={`p-1 text-center rounded border ${
                  idtActiveVector === 128 ? 'bg-purple-500/30 border-purple-500 text-purple-300 font-bold' : 'bg-[#161b22] border-white/5 text-white/40'
                }`} title="Vector 128 (0x80): System Call Gateway">
                  SYS 80
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Interactive Trigger Actions (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4 bg-[#0d1117] p-5 rounded-2xl border border-white/5 justify-between">
            
            {/* SUBTAB CONTENT: System Calls */}
            {activeCtrlTab === 'syscall' && (() => {
              // Filter system calls
              const filteredSyscalls = SYSTEM_CALLS.filter(call => {
                const matchesCategory = syscallCategory === 'All' || call.category === syscallCategory;
                const matchesFilter = call.val.toLowerCase().includes(syscallFilter.toLowerCase()) || 
                                      call.desc.toLowerCase().includes(syscallFilter.toLowerCase()) ||
                                      `0x${call.num.toString(16)}`.toLowerCase().includes(syscallFilter.toLowerCase());
                return matchesCategory && matchesFilter;
              });

              const categories: ('All' | 'Process' | 'Files / IO' | 'Network' | 'Memory' | 'Signals / Timer' | 'System Info')[] = [
                'All', 'Process', 'Files / IO', 'Network', 'Memory', 'Signals / Timer', 'System Info'
              ];

              return (
                <div className="space-y-3 flex-1 flex flex-col justify-between overflow-hidden">
                  <div className="space-y-2 flex-1 flex flex-col min-h-0">
                    <div className="flex items-center justify-between text-xs font-bold text-white/80">
                      <div className="flex items-center gap-1.5">
                        <Code2 size={12} className="text-purple-400" />
                        <span>Select software system call (trap)</span>
                      </div>
                      <span className="text-[10px] text-purple-400 font-mono bg-purple-500/10 px-1.5 py-0.5 rounded-md">
                        {filteredSyscalls.length} / {SYSTEM_CALLS.length} Syscalls
                      </span>
                    </div>

                    {/* Category Filter Pills (Horizontal scrollable) */}
                    <div className="flex gap-1 overflow-x-auto pb-1 select-none scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setSyscallCategory(cat)}
                          className={`px-2 py-0.5 rounded-full text-[9px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                            syscallCategory === cat
                              ? 'bg-purple-600 text-white font-bold'
                              : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                      <Search size={11} className="absolute left-2.5 top-2.5 text-white/40" />
                      <input
                        type="text"
                        placeholder="Search syscall name, hex, desc..."
                        value={syscallFilter}
                        onChange={(e) => setSyscallFilter(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 pl-7 pr-3 py-1.5 rounded-xl text-[10px] font-mono text-white placeholder-white/30 focus:outline-none focus:border-purple-500/40 transition-colors"
                      />
                      {syscallFilter && (
                        <button 
                          onClick={() => setSyscallFilter('')}
                          className="absolute right-2 top-1.5 text-[9px] text-white/40 hover:text-white font-sans bg-white/5 px-1.5 py-0.5 rounded"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Scrollable list container */}
                    <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 max-h-[350px] min-h-[150px] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                      {filteredSyscalls.length > 0 ? (
                        filteredSyscalls.map(call => (
                          <button
                            key={call.val}
                            onClick={() => setSelectedSyscall(call.val)}
                            className={`w-full p-2 rounded-xl text-left border text-[11px] font-mono transition-all flex flex-col cursor-pointer ${
                              selectedSyscall === call.val
                                ? 'bg-purple-500/10 border-purple-500/40 text-white'
                                : 'bg-black/30 border-white/5 text-white/60 hover:bg-black/50'
                            }`}
                          >
                            <div className="flex justify-between items-center w-full">
                              <span className="font-bold text-purple-300">{call.val}</span>
                              <span className="text-[9px] text-white/40 bg-white/5 px-1 py-0.5 rounded font-mono">
                                RAX: 0x{call.num.toString(16).toUpperCase()} ({call.num})
                              </span>
                            </div>
                            <span className="text-[9px] opacity-65 font-sans mt-0.5 leading-tight">{call.desc}</span>
                            <span className="text-[8px] opacity-40 font-mono mt-1 text-purple-400">
                              Category: {call.category}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-4 border border-white/5 border-dashed rounded-xl bg-black/20">
                          <Code2 size={24} className="text-white/20 mb-2" />
                          <span className="text-[10px] text-white/40 font-medium">No system calls found</span>
                          <span className="text-[8px] text-white/30 mt-0.5">Adjust filter keywords or category selection</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleInvokeSyscall}
                    disabled={transitioningRing}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-purple-500/10 disabled:opacity-50 mt-1 cursor-pointer"
                  >
                    <Cpu size={14} />
                    Invoke {selectedSyscall} (int 0x80)
                  </button>
                </div>
              );
            })()}

            {/* SUBTAB CONTENT: Traps & Faults */}
            {activeCtrlTab === 'trap' && (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white/80">
                    <ShieldAlert size={12} className="text-rose-400" />
                    <span>Trigger CPU Hardware Trap Fault</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { name: '#DE - Divide by Zero', val: 'DIV_ZERO', desc: 'Attempting division by direct register containing zero' },
                      { name: '#PF - Page Fault Exception', val: 'PAGE_FAULT', desc: 'Core attempts to reference unmapped memory segment' },
                      { name: '#GP - General Protection Fault', val: 'GP_FAULT', desc: 'Ring-3 instruction attempts Ring-0 hardware operations' },
                      { name: '#UD - Invalid Instruction Opcode', val: 'INVALID_OP', desc: 'Processor encounters unknown assembly instruction' }
                    ].map(trap => (
                      <button
                        key={trap.val}
                        onClick={() => setSelectedTrap(trap.val)}
                        className={`p-2 rounded-xl text-left border text-[11px] font-mono transition-all flex flex-col ${
                          selectedTrap === trap.val
                            ? 'bg-rose-500/10 border-rose-500/40 text-white'
                            : 'bg-black/30 border-white/5 text-white/60 hover:bg-black/50'
                        }`}
                      >
                        <span className="font-bold">{trap.name}</span>
                        <span className="text-[8.5px] opacity-60 font-sans mt-0.5 leading-none">{trap.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trap Action Buttons (Quarantine or Crash Panic) */}
                {idtActiveVector !== null && idtActiveVector < 32 ? (
                  <div className="space-y-2">
                    <span className="text-[9px] text-rose-400 font-bold block text-center uppercase tracking-wide animate-pulse">
                      ⚠️ CPU TRAP CAPTURED: RESOLVE FAULT
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleResolveTrap('quarantine')}
                        className="py-2 rounded-lg bg-emerald-600/25 hover:bg-emerald-600/35 text-emerald-300 font-bold text-[10px] border border-emerald-500/30 transition-all flex items-center justify-center gap-1"
                      >
                        <Check size={11} />
                        Quarantine
                      </button>
                      <button
                        onClick={() => handleResolveTrap('panic')}
                        className="py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] transition-all flex items-center justify-center gap-1 shadow-lg shadow-red-500/20"
                      >
                        <AlertTriangle size={11} />
                        Trigger Panic
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleTriggerTrap}
                    disabled={transitioningRing}
                    className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-rose-500/10 disabled:opacity-50"
                  >
                    <Bug size={14} />
                    Fire Trap Exception
                  </button>
                )}
              </div>
            )}

            {/* SUBTAB CONTENT: Hardware Interrupts */}
            {/* SUBTAB CONTENT: Hardware Interrupts */}
            {activeCtrlTab === 'irq' && (() => {
              // Filter IRQs
              const filteredIrqs = SYSTEM_IRQS.filter(item => {
                const matchesCategory = irqCategory === 'All' || item.category === irqCategory;
                const matchesFilter = item.device.toLowerCase().includes(irqFilter.toLowerCase()) || 
                                      item.desc.toLowerCase().includes(irqFilter.toLowerCase()) ||
                                      `irq ${item.irq}`.toLowerCase().includes(irqFilter.toLowerCase()) ||
                                      `vector ${item.vector}`.toLowerCase().includes(irqFilter.toLowerCase());
                return matchesCategory && matchesFilter;
              });

              const categories: ('All' | 'System' | 'Input' | 'Serial/Ports' | 'Storage/Media' | 'Network' | 'Reserved')[] = [
                'All', 'System', 'Input', 'Serial/Ports', 'Storage/Media', 'Network', 'Reserved'
              ];

              return (
                <div className="space-y-3 flex-1 flex flex-col justify-between overflow-hidden">
                  <div className="space-y-2 flex-1 flex flex-col min-h-0">
                    <div className="flex items-center justify-between text-xs font-bold text-white/80">
                      <div className="flex items-center gap-1.5">
                        <Zap size={12} className="text-amber-400" />
                        <span>Assert Hardware Interrupt line</span>
                      </div>
                      <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded-md">
                        {filteredIrqs.length} / {SYSTEM_IRQS.length} IRQs
                      </span>
                    </div>

                    {/* Category Filter Pills (Horizontal scrollable) */}
                    <div className="flex gap-1 overflow-x-auto pb-1 select-none scrollbar-none">
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setIrqCategory(cat)}
                          className={`px-2.5 py-0.5 rounded-full text-[9px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                            irqCategory === cat
                              ? 'bg-amber-600 text-white font-bold'
                              : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                      <Search size={11} className="absolute left-2.5 top-2.5 text-white/40" />
                      <input
                        type="text"
                        placeholder="Search IRQ, device, vector, desc..."
                        value={irqFilter}
                        onChange={(e) => setIrqFilter(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 pl-7 pr-3 py-1.5 rounded-xl text-[10px] font-mono text-white placeholder-white/30 focus:outline-none focus:border-amber-500/40 transition-colors"
                      />
                      {irqFilter && (
                        <button 
                          onClick={() => setIrqFilter('')}
                          className="absolute right-2 top-1.5 text-[9px] text-white/40 hover:text-white font-sans bg-white/5 px-1.5 py-0.5 rounded"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Scrollable list container */}
                    <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 max-h-[190px] min-h-[100px] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                      {filteredIrqs.length > 0 ? (
                        filteredIrqs.map(item => (
                          <button
                            key={item.irq}
                            onClick={() => setSelectedIrq(item.irq)}
                            className={`w-full p-2 rounded-xl text-left border text-[11px] font-mono transition-all flex flex-col cursor-pointer ${
                              selectedIrq === item.irq
                                ? 'bg-amber-500/10 border-amber-500/40 text-white'
                                : 'bg-black/30 border-white/5 text-white/60 hover:bg-black/50'
                            }`}
                          >
                            <div className="flex justify-between items-center w-full">
                              <span className="font-bold text-amber-300">IRQ {item.irq}</span>
                              <span className="text-[9px] text-white/40 bg-white/5 px-1 py-0.5 rounded font-mono">
                                Vector {item.vector} (0x{item.vector.toString(16).toUpperCase()})
                              </span>
                            </div>
                            <span className="text-[10px] font-sans font-semibold text-white/95 mt-0.5">{item.device}</span>
                            <span className="text-[9px] opacity-65 font-sans mt-0.5 leading-tight">{item.desc}</span>
                            <span className="text-[8px] opacity-40 font-mono mt-1 text-amber-400">
                              Category: {item.category}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-4 border border-white/5 border-dashed rounded-xl bg-black/20">
                          <Zap size={24} className="text-white/20 mb-2 animate-pulse" />
                          <span className="text-[10px] text-white/40 font-medium">No hardware interrupts found</span>
                          <span className="text-[8px] text-white/30 mt-0.5">Adjust filter keywords or category selection</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleTriggerHardwareIRQ(selectedIrq)}
                    disabled={transitioningRing}
                    className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-amber-500/10 disabled:opacity-50 mt-1 cursor-pointer"
                  >
                    <Layers size={14} />
                    Assert IRQ {selectedIrq} (Vector {32 + selectedIrq})
                  </button>
                </div>
              );
            })()}

          </div>

        </div>

        {/* Dynamic Bus Trace Log Terminal (Shared bottom tracer) */}
        <div className="space-y-2 mt-2">
          <div className="flex items-center justify-between text-[10px] text-white/40">
            <span className="font-bold uppercase tracking-wider font-sans">Local CPU System Trap Trace Monitor</span>
            <button
              onClick={() => setSyscallLogs([])}
              className="hover:text-white/60 transition-colors"
            >
              Flush Trace
            </button>
          </div>
          <div className="bg-[#0d1117] border border-white/5 rounded-2xl p-3 h-28 overflow-y-auto font-mono text-[10px] flex flex-col gap-1 no-scrollbar shadow-inner">
            {syscallLogs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-white/20 select-none italic">
                Awaiting assembly context traps or syscall entries...
              </div>
            ) : (
              syscallLogs.map(log => (
                <div key={log.id} className="flex gap-2.5 hover:bg-white/2 p-0.5 rounded transition-all">
                  <span className="text-white/20">{log.time}</span>
                  <span className={`font-bold ${
                    log.type === 'success' ? 'text-emerald-400' :
                    log.type === 'warning' ? 'text-purple-400' :
                    log.type === 'error' ? 'text-rose-400' : 'text-blue-400'
                  }`}>
                    {log.type === 'success' ? '[RET]' : log.type === 'warning' ? '[RING]' : log.type === 'error' ? '[FAULT]' : '[INFO]'}
                  </span>
                  <span className="text-white/70 flex-1">{log.msg}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Settings Tuning Panel & Live Kernel Logging Console */}
      <div className="bg-[#161b22] border border-white/5 rounded-3xl p-6 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Terminal size={18} className="text-blue-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider">Kernel Console Logging Interface</h3>
          </div>
          
          {/* Hardware Parameters Tuner */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Sliders size={12} className="text-white/40" />
              <span className="text-white/40">Page Size:</span>
              <select 
                value={pageSize} 
                onChange={(e) => {
                  const size = Number(e.target.value) as 4 | 2048 | 1048576;
                  setPageSize(size);
                  addKernelLog(
                    'info', 
                    'MMU', 
                    `Kernel page segment mapping resized to ${size === 4 ? '4KB Standard Pages' : size === 2048 ? '2MB Huge Pages' : '1GB Giant Pages'}.`
                  );
                }}
                className="bg-[#0d1117] border border-white/10 rounded-lg py-1 px-2 text-white text-[11px] font-semibold focus:outline-none focus:border-blue-500"
              >
                <option value="4">4 KB (Standard)</option>
                <option value="2048">2 MB (Huge Pages)</option>
                <option value="1048576">1 GB (Giant Pages)</option>
              </select>
            </div>

            <button 
              onClick={() => setKernelLogs([])}
              className="text-white/30 hover:text-white/60 transition-colors text-[10px] font-bold uppercase"
            >
              Clear Logs
            </button>
          </div>
        </div>

        {/* Live Logs console stream */}
        <div 
          ref={logRef}
          className="bg-[#0d1117] border border-white/5 rounded-2xl p-4 h-48 overflow-y-auto font-mono text-[11px] flex flex-col gap-1.5 no-scrollbar shadow-inner"
        >
          {kernelLogs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-white/20 select-none">
              Awaiting virtual memory bus telemetry...
            </div>
          ) : (
            kernelLogs.map((log) => (
              <div key={log.id} className="flex gap-3 hover:bg-white/2 p-1 rounded transition-all">
                <span className="text-white/20">{log.timestamp}</span>
                <span className={`font-bold ${
                  log.type === 'success' ? 'text-emerald-400' :
                  log.type === 'warning' ? 'text-amber-400' :
                  log.type === 'error' ? 'text-rose-400' : 'text-blue-400'
                }`}>
                  [{log.source}]
                </span>
                <span className="text-white/70 flex-1">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
