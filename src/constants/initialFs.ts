import { FileSystemItem, Permissions } from '../types';

export const DEFAULT_PERMISSIONS: Permissions = {
  owner: { r: true, w: true, x: true },
  group: { r: true, w: false, x: true },
  others: { r: true, w: false, x: false },
};

export const INITIAL_FS: FileSystemItem[] = [
  { name: '.bashrc', type: 'file', content: 'alias ll="ls -l"\nalias la="ls -a"\nexport PATH=/sys/bin:$PATH', size: 68, dateModified: '2026-04-20T10:00:00Z', permissions: DEFAULT_PERMISSIONS },
  {
    name: 'sys',
    type: 'folder',
    category: 'local',
    size: 0,
    dateModified: '2026-04-20T09:00:00Z',
    permissions: {
      owner: { r: true, w: true, x: true },
      group: { r: true, w: false, x: true },
      others: { r: true, w: false, x: false },
    },
    children: [
      { name: 'kernel.sys', type: 'file', content: 'v1.2.0-glass-kernel', size: 18, dateModified: '2026-04-20T09:05:00Z', permissions: DEFAULT_PERMISSIONS },
      { name: 'init.pkg', type: 'file', content: 'bootstrap-package', size: 17, dateModified: '2026-04-20T09:10:00Z', permissions: DEFAULT_PERMISSIONS },
      {
        name: 'bin',
        type: 'folder',
        permissions: DEFAULT_PERMISSIONS,
        children: [
          { name: 'ls.pkg', type: 'file', content: 'list-files-binary', permissions: DEFAULT_PERMISSIONS },
          { name: 'grep.pkg', type: 'file', content: 'search-pattern-binary', permissions: DEFAULT_PERMISSIONS },
          { name: 'cat.pkg', type: 'file', content: 'concat-files-binary', permissions: DEFAULT_PERMISSIONS },
        ],
      },
      {
        name: 'lib',
        type: 'folder',
        permissions: DEFAULT_PERMISSIONS,
        children: [
          { name: 'FileSystem.lib.ts', type: 'file', content: 'fs-core-library', permissions: DEFAULT_PERMISSIONS },
          { name: 'UI.lib.js', type: 'file', content: 'glass-ui-library', permissions: DEFAULT_PERMISSIONS },
          { name: 'NativeBridge.lib.ts', type: 'file', content: 'system-bridge-library', permissions: DEFAULT_PERMISSIONS },
        ],
      },
      {
        name: 'pkgs',
        type: 'folder',
        permissions: DEFAULT_PERMISSIONS,
        children: [],
      }
    ],
  },
  {
    name: 'home',
    type: 'folder',
    category: 'local',
    permissions: DEFAULT_PERMISSIONS,
    children: [
      {
        name: 'Guest',
        type: 'folder',
        permissions: DEFAULT_PERMISSIONS,
        children: [
          { name: 'welcome.txt', type: 'file', content: 'Welcome to your GlassOS home directory!', permissions: DEFAULT_PERMISSIONS },
          { name: 'profile.b', type: 'file', content: 'USER_PROFILE_DATA', permissions: DEFAULT_PERMISSIONS },
          {
            name: 'Documents',
            type: 'folder',
            size: 0,
            dateModified: '2026-04-21T12:00:00Z',
            permissions: DEFAULT_PERMISSIONS,
            children: [
                { name: 'notes.txt', type: 'file', content: 'My first GlassOS note!', size: 23, dateModified: '2026-04-21T12:05:00Z', permissions: DEFAULT_PERMISSIONS },
                { name: 'report.gdoc', type: 'file', content: 'DOCUMENT_DATA', size: 13, dateModified: '2026-04-21T12:10:00Z', permissions: DEFAULT_PERMISSIONS },
            ]
          },
          {
            name: 'Scripts',
            type: 'folder',
            permissions: DEFAULT_PERMISSIONS,
            children: [
              { name: 'hello.scr', type: 'file', content: 'tell app "Notepad"\nwrite "Hello World"\nend tell', permissions: DEFAULT_PERMISSIONS },
            ]
          },
          {
            name: 'Projects',
            type: 'folder',
            permissions: DEFAULT_PERMISSIONS,
            children: [
              {
                name: 'CodeStudio',
                type: 'folder',
                permissions: DEFAULT_PERMISSIONS,
                children: [
                  { 
                    name: 'main.b', 
                    content: '@@global.main\nStart\n  REM Welcome to Brainscript v1.0\n  LET $msg \'Hello GlassOS\'\n  PRINT $msg\n  TIMESTAMP\nEnd\n\n##parseconfig\nStart\n  REM Configuration Parser Module\n  REM Expects Key=Value pairs\n  LET $config \'theme=frosted;mode=performance;security=high\'\n  PRINT \'System: Initializing parseconfig routine...\'\n  PRINT $config\n  TIMESTAMP\nEnd', 
                    type: 'file', 
                    permissions: DEFAULT_PERMISSIONS 
                  },
                  {
                    name: 'FormatReport.scr',
                    content: '-- GlassScript Example\ntell app "Notepad"\n    set font size to 16\n    set style to bold\n    align center\n    write "Monthly Progress Report"\n    \n    insert newline\n    set style to normal\n    align left\n    write "Date: " & system.date\n    insert newline\n    write "------------------------"\n    insert newline\n    write "Status: All systems operational."\nend tell\n\nnotify "Formatting Complete"',
                    type: 'file',
                    permissions: DEFAULT_PERMISSIONS
                  },
                  { 
                    name: 'utils.b', 
                    content: '##local.utils\nStart\n  REM Utility functions\nEnd', 
                    type: 'file', 
                    permissions: DEFAULT_PERMISSIONS 
                  },
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: 'Picture',
    type: 'folder',
    category: 'local',
    permissions: DEFAULT_PERMISSIONS,
    children: [
      { name: 'wallpaper.jpg', type: 'file', permissions: DEFAULT_PERMISSIONS },
    ],
  },
  {
    name: 'dev',
    type: 'folder',
    category: 'local',
    permissions: DEFAULT_PERMISSIONS,
    children: [
      { name: 'tty0', type: 'file', content: 'virtual-terminal-device', permissions: DEFAULT_PERMISSIONS },
      { name: 'cpu0', type: 'file', content: 'virtual-cpu-unit', permissions: DEFAULT_PERMISSIONS },
      { name: 'mem0', type: 'file', content: 'virtual-memory-shard', permissions: DEFAULT_PERMISSIONS },
    ]
  },
  {
    name: 'GlassDrive',
    type: 'folder',
    category: 'networking',
    permissions: DEFAULT_PERMISSIONS,
    children: [
      { 
        name: 'Public Shared', 
        type: 'folder', 
        permissions: DEFAULT_PERMISSIONS,
        children: [
          { name: 'readme_server.txt', type: 'file', content: 'This is the shared Glass Server space.', permissions: DEFAULT_PERMISSIONS }
        ]
      },
      {
        name: 'webpages',
        type: 'folder',
        permissions: DEFAULT_PERMISSIONS,
        children: [
          { name: 'home.html', type: 'file', content: '<h1>Welcome to GlassOS</h1><p>The next generation of computing.</p>', permissions: DEFAULT_PERMISSIONS },
          { name: 'about.html', type: 'file', content: '<h1>About GlassOS</h1><p>Built for the future.</p>', permissions: DEFAULT_PERMISSIONS },
        ]
      }
    ],
  },
  {
    name: 'Trash',
    type: 'folder',
    category: 'trash',
    permissions: DEFAULT_PERMISSIONS,
    children: [],
  },
];
