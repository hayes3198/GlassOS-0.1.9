import React, { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

interface GTermProps {
  subTtyId: number;
  parentPid: number;
  onExit?: () => void;
  sendSyscallTrap: (syscallId: number, args: any) => void;
}

export const GTerm: React.FC<GTermProps> = ({
  subTtyId,
  parentPid,
  onExit,
  sendSyscallTrap,
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Create the terminal instance
    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: 'underline',
      fontSize: 13,
      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
      theme: {
        background: '#090d16',
        foreground: '#e0e6ed',
        cursor: '#60a5fa',
        selectionBackground: 'rgba(59, 130, 246, 0.3)',
        black: '#1e293b',
        red: '#ef4444',
        green: '#10b981',
        yellow: '#f59e0b',
        blue: '#3b82f6',
        magenta: '#8b5cf6',
        cyan: '#06b6d4',
        white: '#f1f5f9',
      },
    });

    xtermRef.current = term;

    // Load FitAddon
    const fitAddon = new FitAddon();
    fitAddonRef.current = fitAddon;
    term.loadAddon(fitAddon);

    // Open terminal in element
    term.open(terminalRef.current);
    
    // Fit to container dimensions
    try {
      fitAddon.fit();
    } catch (e) {
      console.warn('Initial fit failed:', e);
    }

    // Trigger initial RESIZE syscall trap (syscallId 0x1C or similar)
    sendSyscallTrap(0x1C, { tty: subTtyId, cols: term.cols, rows: term.rows });

    // Handle container resizing
    const resizeObserver = new ResizeObserver(() => {
      try {
        fitAddon.fit();
        sendSyscallTrap(0x1C, { tty: subTtyId, cols: term.cols, rows: term.rows });
      } catch (e) {
        // Safe catch for potential detached element fit errors
      }
    });
    
    if (terminalRef.current.parentElement) {
      resizeObserver.observe(terminalRef.current.parentElement);
    }

    // Print welcome instructions matching GlassOS aesthetic
    term.writeln('\x1b[1;36m┌────────────────────────────────────────────────────────┐\x1b[0m');
    term.writeln(`\x1b[1;36m│\x1b[0m   \x1b[1;32mGlassOS GTerm Virtual Sub-Shell Active\x1b[0m               \x1b[1;36m│\x1b[0m`);
    term.writeln(`\x1b[1;36m│\x1b[0m   TTY: \x1b[1;33m/dev/tty${subTtyId}\x1b[0m  •  Parent PID: \x1b[1;35m${parentPid}\x1b[0m            \x1b[1;36m│\x1b[0m`);
    term.writeln('\x1b[1;36m│\x1b[0m   Zero-Latency Direct Memory Pipeline Enabled           \x1b[1;36m│\x1b[0m');
    term.writeln('\x1b[1;36m└────────────────────────────────────────────────────────┘\x1b[0m');
    term.writeln('Type \x1b[1;33mhelp\x1b[0m for sub-shell commands, or \x1b[1;33mexit\x1b[0m to terminate process.');
    term.writeln('');

    const writePrompt = () => {
      term.write(`\x1b[1;32mguest@glass-os-sub:${subTtyId}$ \x1b[0m`);
    };

    writePrompt();

    let inputBuffer = '';

    const handleCommand = (cmdStr: string) => {
      const parts = cmdStr.trim().split(/\s+/);
      const command = parts[0].toLowerCase();
      const args = parts.slice(1);

      if (command === 'exit' || command === 'quit') {
        term.writeln('\r\n[SYS] TTY Connection torn down. Releasing virtual resources...');
        sendSyscallTrap(0x01, { tty: subTtyId, code: 0 }); // SYS_EXIT (0x01)
        setTimeout(() => {
          if (onExit) onExit();
        }, 500);
        return;
      }

      if (command === 'help') {
        term.writeln('\r\n\x1b[1;34mGTerm Sub-Shell System Monitor Interface:\x1b[0m');
        term.writeln('  \x1b[1;33mhelp\x1b[0m         - Display local sub-shell capabilities');
        term.writeln('  \x1b[1;33mclear\x1b[0m        - Clear screen and reset terminal state');
        term.writeln('  \x1b[1;33msysinfo\x1b[0m      - Probe hardware via virtual CPU register read');
        term.writeln('  \x1b[1;33mexec <cmd>\x1b[0m   - Direct-inject Command Frame to Host OS Scheduler');
        term.writeln('  \x1b[1;33mcrash\x1b[0m        - Raise General Protection Fault CPU exception (#GP)');
        term.writeln('  \x1b[1;33mexit/quit\x1b[0m    - Safely trigger SYS_EXIT & return to main shell');
        term.writeln('');
        writePrompt();
        return;
      }

      if (command === 'clear') {
        term.clear();
        writePrompt();
        return;
      }

      if (command === 'sysinfo') {
        term.writeln('\r\n\x1b[1;35m--- Sub-Shell Hardware Probe ---\x1b[0m');
        term.writeln(`VIRT-CPU: Core-Z10 (Sub-TTY ID: ${subTtyId})`);
        term.writeln('L1 CACHE: 512 KB direct-mapped');
        term.writeln(`PARENT PROC: PID ${parentPid} [active]`);
        term.writeln('TRAP PORT: Host interrupt controller (0x80)');
        term.writeln('');
        writePrompt();
        return;
      }

      if (command === 'exec') {
        const fullCmd = args.join(' ');
        if (!fullCmd) {
          term.writeln('\r\nusage: exec <command_to_execute>');
          writePrompt();
          return;
        }

        term.writeln(`\r\n[SYS_WRITE] Injecting Host System Command: '${fullCmd}'`);
        // Passes trap request back to GlassTrapHandler
        sendSyscallTrap(0x04, { tty: subTtyId, command: fullCmd, action: 'EXEC_COMMAND' });
        
        // Also trigger the actual master OS command processing!
        // We can dispatch standard lanbridge:execute-command event on window so the master window gets it!
        const event = new CustomEvent('lanbridge:execute-command', {
          detail: {
            slaveId: 'local-gterm',
            tty: `tty${subTtyId}`,
            command: fullCmd
          }
        });
        window.dispatchEvent(event);

        term.writeln('\x1b[1;32m[SUCCESS] Routed payload down to GlassOS Scheduler via SYS_WRITE.\x1b[0m\r\n');
        writePrompt();
        return;
      }

      if (command === 'crash') {
        term.writeln('\r\n\x1b[1;31m[TRAP] Triggering #GP General Protection Fault directly in CPU...\x1b[0m');
        
        // Dispatch to window so GlassKernel handles exception
        const event = new CustomEvent('lanbridge:cpu-crash-trap', {
          detail: {
            vector: 13,
            exception: 'GP_FAULT',
            tty: subTtyId,
            message: 'Direct memory injection from gterm sub-shell caused hardware fault'
          }
        });
        window.dispatchEvent(event);
        
        sendSyscallTrap(0x02, { tty: subTtyId, exception: 'GP_FAULT' });
        
        term.writeln('\x1b[1;31m[KERNEL RESPONSE] Thread context frozen. Exception state pushed to Stack.\x1b[0m\r\n');
        writePrompt();
        return;
      }

      if (cmdStr.trim() !== '') {
        // Any other command is routed via standard SYS_WRITE trap (0x04)
        term.writeln(`\r\n[SYS_WRITE] Trap 0x04: Routing command '${cmdStr}' to Trap Handler...`);
        sendSyscallTrap(0x04, { tty: subTtyId, command: cmdStr });
        term.writeln('\x1b[1;33m[SYS] Handled.\x1b[0m\r\n');
      } else {
        term.writeln('');
      }

      writePrompt();
    };

    // Handle user keyboard inputs
    const dataDisposable = term.onData((data) => {
      for (let i = 0; i < data.length; i++) {
        const char = data[i];

        if (char === '\r' || char === '\n') {
          handleCommand(inputBuffer);
          inputBuffer = '';
        } else if (char === '\u007F' || char === '\b') { // Backspace
          if (inputBuffer.length > 0) {
            inputBuffer = inputBuffer.slice(0, -1);
            term.write('\b \b');
          }
        } else if (char === '\u0003') { // Ctrl+C
          term.write('^C\r\n');
          inputBuffer = '';
          writePrompt();
        } else {
          // Check for normal ASCII printable characters
          const code = char.charCodeAt(0);
          if (code >= 32 && code <= 126) {
            inputBuffer += char;
            term.write(char);
          }
        }
      }
    });

    return () => {
      dataDisposable.dispose();
      resizeObserver.disconnect();
      term.dispose();
    };
  }, [subTtyId, parentPid, onExit]);

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 font-mono text-sm relative rounded-b-xl border border-white/5 overflow-hidden">
      {/* Header Bar */}
      <div className="h-8 bg-slate-900 border-b border-white/10 flex items-center justify-between px-3 text-white/60 select-none">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse"></span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">GTerm v1.0 [Sub-TTY: {subTtyId}]</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-white/40">PID: {parentPid}</span>
          <button 
            onClick={onExit}
            className="hover:text-red-400 transition-colors text-xs font-bold px-1.5 py-0.5 rounded hover:bg-white/5"
            title="Terminate sub-shell process"
          >
            TERMINATE
          </button>
        </div>
      </div>
      {/* Terminal View Container */}
      <div 
        ref={terminalRef} 
        className="flex-1 p-3 overflow-hidden bg-[#090d16]"
        style={{ height: 'calc(100% - 32px)' }}
      />
    </div>
  );
};
