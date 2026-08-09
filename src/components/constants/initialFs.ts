import { FileSystemItem, Permissions } from '../../types';

export const DEFAULT_PERMISSIONS: Permissions = {
  owner: { r: true, w: true, x: true },
  group: { r: true, w: false, x: true },
  others: { r: true, w: false, x: false },
};

export const INITIAL_FS: FileSystemItem[] = [
  { name: '.bashrc', type: 'file', content: 'alias ll="ls -l"\nalias la="ls -a"\nexport PATH=/sys/bin:$PATH', size: 68, dateModified: '2026-04-20T10:00:00Z', permissions: DEFAULT_PERMISSIONS },
  {
    name: 'Documents',
    type: 'folder',
    category: 'local',
    size: 0,
    dateModified: '2026-07-15T08:00:00Z',
    permissions: DEFAULT_PERMISSIONS,
    children: [
      {
        name: 'Drawings',
        type: 'folder',
        permissions: DEFAULT_PERMISSIONS,
        children: [
          {
            name: 'glass_logo.gdraw',
            type: 'file',
            content: '[{"id":"shape1","type":"roundrect","x":50,"y":50,"width":220,"height":150,"rx":12,"ry":12,"fill":"#3b82f6","stroke":"#ffffff","strokeWidth":3,"opacity":0.85,"pattern":"solid","rotate":0,"scaleX":1,"scaleY":1},{"id":"shape2","type":"circle","x":160,"y":100,"radius":35,"fill":"#f59e0b","stroke":"#ffffff","strokeWidth":2,"opacity":0.9,"pattern":"solid","rotate":0,"scaleX":1,"scaleY":1},{"id":"shape3","type":"line","x":60,"y":140,"x2":260,"y2":140,"fill":"#000000","stroke":"#ffffff","strokeWidth":2,"opacity":1,"pattern":"solid","rotate":0,"scaleX":1,"scaleY":1},{"id":"shape4","type":"text","x":70,"y":180,"text":"glassOS Vector","fontFamily":"Chicago","fontSize":16,"fontWeight":"bold","fontStyle":"normal","textDecoration":"none","fill":"#ffffff","opacity":1,"rotate":0,"scaleX":1,"scaleY":1}]',
            size: 618,
            dateCreated: '2026-07-15T08:00:00Z',
            dateModified: '2026-07-15T08:00:00Z',
            permissions: DEFAULT_PERMISSIONS
          },
          {
            name: 'vintage_art.gdraw',
            type: 'file',
            content: '[{"id":"star1","type":"oval","x":80,"y":60,"rx":60,"ry":40,"fill":"#ef4444","stroke":"#000000","strokeWidth":2,"opacity":0.9,"pattern":"solid","rotate":0,"scaleX":1,"scaleY":1},{"id":"star2","type":"rect","x":120,"y":100,"width":100,"height":100,"fill":"#10b981","stroke":"#000000","strokeWidth":2,"opacity":0.8,"pattern":"solid","rotate":0,"scaleX":1,"scaleY":1},{"id":"star3","type":"text","x":95,"y":150,"text":"MacDraw 1984","fontFamily":"Chicago","fontSize":14,"fontWeight":"bold","fontStyle":"italic","textDecoration":"none","fill":"#000000","opacity":1,"rotate":0,"scaleX":1,"scaleY":1}]',
            size: 485,
            dateCreated: '2026-07-15T08:00:00Z',
            dateModified: '2026-07-15T08:00:00Z',
            permissions: DEFAULT_PERMISSIONS
          }
        ]
      },
      {
        name: 'Paintings',
        type: 'folder',
        permissions: DEFAULT_PERMISSIONS,
        children: []
      },
      {
        name: 'Photos',
        type: 'folder',
        permissions: DEFAULT_PERMISSIONS,
        children: []
      }
    ]
  },
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
        name: 'Administrator',
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
                {
                  name: 'Projects',
                  type: 'folder',
                  permissions: DEFAULT_PERMISSIONS,
                  children: [
                    {
                      name: 'CodeStudio',
                      type: 'folder',
                      permissions: DEFAULT_PERMISSIONS,
                      children: []
                    }
                  ]
                }
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
                    content: '@@global.system.init\nStart\n  SET $0000 0x4000\n  SET $0001 0x01\n  SET $0002 \'BOOT SUCCESS\'\nEnd\n\n###mainrun.boot\nStart\n  PRINT \'Initializing Brainscript V3.0...\'\n  TIMESTAMP\n  \n  LET $math 100° * 2 + ABS -50\n  PRINT \'Kernel Math: \' && $math\n  \n  BRANCH ##user_auth\n  QUIT\nEnd\n\n##user_auth\nStart\n  PRINT \'Address Check: \' && $0000\n  INPUT $input_pass\n  LET $expected \'1234\'\n  \n  COMPARE $input_pass $expected : PRINT \'AUTH OK\' && $0002 : PRINT \'INVALID PASSWORD\' BRANCH ##halt_sequence\nEnd\n\n##halt_sequence\nStart\n  PRINT \'System Lockdown...\'\n  QUIT\nEnd', 
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
                  {
                    name: 'error_test.b',
                    content: '###error_demo\nStart\n  PRINT "This script will fail at runtime"\n  \n  REM Intentional error: Division by zero\n  LET $result 100 / 0\n  \n  PRINT "Result is: " && $result\n  \n  PRINT "This line will not be reached"\nEnd',
                    type: 'file',
                    permissions: DEFAULT_PERMISSIONS
                  }
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
        name: 'SiliconValley',
        type: 'folder',
        permissions: DEFAULT_PERMISSIONS,
        children: [
          {
            name: 'index.json',
            type: 'file',
            permissions: DEFAULT_PERMISSIONS,
            content: JSON.stringify({
              type: "document",
              version: "1.0.0",
              metadata: {
                author: "SiliconValley_Coder99",
                created: "2026-08-03T00:00:00Z",
                modified: "2026-08-03T08:00:00Z",
                tags: ["geocities", "siliconvalley", "personal-site", "retro"],
                isExecutable: true,
                neighborhood: "SiliconValley",
                neighborhoodIcon: "💻",
                theme: "matrix-cyan"
              },
              content: {
                title: "SiliconValley Cyber Shrine",
                tagline: "The Official Home of GlassOS Kernel Tweaks & Retro Cybernetics",
                richText: [
                  {
                    type: "heading",
                    text: "Welcome to My SiliconValley Cyber Shrine!"
                  },
                  {
                    type: "marquee",
                    text: "*** Under Construction *** Best Viewed in GlassFlow Browser @ 800x600 resolution *** GlassOS Kernel v1.2 Enabled ***"
                  },
                  {
                    type: "paragraph",
                    text: "Greetings netizen! You have stumbled into the personal node of SiliconValley_Coder99. Here we compile custom GlassOS executables, write low-bit assembly, and host local virtual drive documents."
                  },
                  {
                    type: "hitCounter",
                    initialValue: 1337
                  },
                  {
                    type: "guestbook",
                    entries: [
                      { author: "GlassOS_Admin", message: "First comment on the SiliconValley node! GlassOS rules!", date: "2026-08-03 10:14" },
                      { author: "CyberNet_Fan", message: "Awesome page! Love the retro neon style.", date: "2026-08-03 11:22" }
                    ]
                  }
                ]
              },
              customScripts: {
                onRender: "playBackgroundMidi(); initMouseStars();",
                onOpen: "this.stats.incrementVisitorCount();"
              },
              api: [
                {
                  endpoint: "/guestbook",
                  method: "POST",
                  handler: "sys_guestbook_append"
                }
              ]
            }, null, 2)
          }
        ]
      },
      {
        name: 'Area51',
        type: 'folder',
        permissions: DEFAULT_PERMISSIONS,
        children: [
          {
            name: 'index.json',
            type: 'file',
            permissions: DEFAULT_PERMISSIONS,
            content: JSON.stringify({
              type: "document",
              version: "1.0.0",
              metadata: {
                author: "XFiles_Watcher88",
                created: "2026-08-03T00:00:00Z",
                modified: "2026-08-03T08:00:00Z",
                tags: ["geocities", "area51", "ufos", "retro"],
                isExecutable: true,
                neighborhood: "Area51",
                neighborhoodIcon: "🛸",
                theme: "alien-green"
              },
              content: {
                title: "Area 51 Paranormal & Retro Gaming Vault",
                tagline: "The Truth is Out There... Inside GlassDrive!",
                richText: [
                  {
                    type: "heading",
                    text: "🛸 Area 51 Top Secret Archives"
                  },
                  {
                    type: "marquee",
                    text: "👽 WARNING: TOP SECRET CLEARANCE REQUIRED *** UFO Sightings Log Updated *** Area 51 Webring Node ***"
                  },
                  {
                    type: "paragraph",
                    text: "Welcome to the Area 51 node. Here we investigate unexplainable GlassOS kernel anomalies, mysterious process IDs, and classic 90s sci-fi gaming secrets."
                  },
                  {
                    type: "hitCounter",
                    initialValue: 5151
                  },
                  {
                    type: "guestbook",
                    entries: [
                      { author: "FoxM_Agent", message: "I saw a glowing green UFO over Nevada sector 4!", date: "2026-08-03 09:05" },
                      { author: "RetroGamer99", message: "The retro alien synth beat is amazing!", date: "2026-08-03 12:40" }
                    ]
                  }
                ]
              },
              customScripts: {
                onRender: "playBackgroundMidi(); initAlienGlow();",
                onOpen: "this.stats.incrementVisitorCount();"
              },
              api: [
                {
                  endpoint: "/guestbook",
                  method: "POST",
                  handler: "sys_guestbook_append"
                }
              ]
            }, null, 2)
          }
        ]
      },
      {
        name: 'Tokyo',
        type: 'folder',
        permissions: DEFAULT_PERMISSIONS,
        children: [
          {
            name: 'index.json',
            type: 'file',
            permissions: DEFAULT_PERMISSIONS,
            content: JSON.stringify({
              type: "document",
              version: "1.0.0",
              metadata: {
                author: "CyberPixel_Artisan",
                created: "2026-08-03T00:00:00Z",
                modified: "2026-08-03T08:00:00Z",
                tags: ["geocities", "tokyo", "anime", "pixelart"],
                isExecutable: true,
                neighborhood: "Tokyo",
                neighborhoodIcon: "🗼",
                theme: "tokyo-magenta"
              },
              content: {
                title: "Neo-Tokyo Low-Bit Pixel Haven",
                tagline: "Cyberpunk, Anime Shrine & Low-Bit Audio Synth",
                richText: [
                  {
                    type: "heading",
                    text: "🗼 Neo-Tokyo 8-Bit Cyber Shrine"
                  },
                  {
                    type: "marquee",
                    text: "★ Welcome to Tokyo Cyber Shrine ★ Anime Pixel Art & Synthwave Sounds ★ GlassOS Webring Node ★"
                  },
                  {
                    type: "paragraph",
                    text: "Konichiwa! Welcome to my Tokyo neighborhood node. Dedicated to synthwave aesthetics, anime pixel art, and low-bit music creation in GlassOS."
                  },
                  {
                    type: "hitCounter",
                    initialValue: 9001
                  },
                  {
                    type: "guestbook",
                    entries: [
                      { author: "Akira_Fan", message: "Sugoi page design! Tokyo neighborhood is the best!", date: "2026-08-03 08:30" },
                      { author: "SynthRider", "message": "Love the magenta neon borders and synth audio!", date: "2026-08-03 14:15" }
                    ]
                  }
                ]
              },
              customScripts: {
                onRender: "playBackgroundMidi(); initNeonFlicker();",
                onOpen: "this.stats.incrementVisitorCount();"
              },
              api: [
                {
                  endpoint: "/guestbook",
                  method: "POST",
                  handler: "sys_guestbook_append"
                }
              ]
            }, null, 2)
          }
        ]
      },
      {
        name: 'webpages',
        type: 'folder',
        permissions: DEFAULT_PERMISSIONS,
        children: [
          {
            name: 'neighborhood.html',
            type: 'file',
            permissions: DEFAULT_PERMISSIONS,
            content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>GlassDrive Neighborhoods & Webpages Directory</title>
  <style>
    :root {
      --primary: #06b6d4;
      --accent: #a855f7;
      --bg: #090d16;
      --card-bg: #0f172a;
      --text: #f1f5f9;
      --text-muted: #94a3b8;
    }
    body {
      background: #030712;
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      line-height: 1.6;
    }
    .header {
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #030712 100%);
      border-bottom: 1px solid #1e293b;
      padding: 2.5rem 1.5rem 2rem 1.5rem;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .header-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      background: rgba(168, 85, 247, 0.15);
      border: 1px solid rgba(168, 85, 247, 0.3);
      color: #c084fc;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }
    h1 {
      font-size: 2.25rem;
      font-weight: 800;
      margin: 0 0 0.5rem 0;
      background: linear-gradient(135deg, #38bdf8, #c084fc, #f472b6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.025em;
    }
    .subtitle {
      color: #94a3b8;
      font-size: 1.05rem;
      max-width: 680px;
      margin: 0 auto 1.5rem auto;
    }
    .marquee-bar {
      background: #020617;
      border: 1px solid #1e293b;
      border-radius: 8px;
      padding: 8px 16px;
      max-width: 820px;
      margin: 0 auto;
      font-family: 'Courier New', monospace;
      font-size: 0.85rem;
      color: #38bdf8;
    }
    .container {
      max-width: 1040px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }
    .search-filter-box {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 12px;
      padding: 1.25rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    .filter-title {
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #94a3b8;
      margin-bottom: 0.75rem;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tag-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .tag-pill {
      background: #1e293b;
      border: 1px solid #334155;
      color: #cbd5e1;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }
    .tag-pill:hover, .tag-pill.active {
      background: #0284c7;
      border-color: #38bdf8;
      color: #ffffff;
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.3);
    }
    .search-input {
      width: 100%;
      background: #020617;
      border: 1px solid #334155;
      color: #fff;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 0.9rem;
      margin-bottom: 1rem;
      box-sizing: border-box;
      outline: none;
    }
    .search-input:focus {
      border-color: #38bdf8;
    }
    .group-section {
      margin-bottom: 2.5rem;
    }
    .group-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #1e293b;
      padding-bottom: 0.5rem;
      margin-bottom: 1.25rem;
    }
    .group-title {
      font-size: 1.3rem;
      font-weight: 700;
      color: #f8fafc;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .group-tag-badge {
      font-size: 0.75rem;
      padding: 3px 10px;
      border-radius: 12px;
      background: rgba(56, 189, 248, 0.1);
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.3);
      font-weight: 600;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.25rem;
    }
    .card {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 12px;
      padding: 1.25rem;
      text-decoration: none;
      color: inherit;
      transition: all 0.2s ease;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
    }
    .card:hover {
      transform: translateY(-3px);
      border-color: #38bdf8;
      box-shadow: 0 10px 25px -5px rgba(56, 189, 248, 0.2);
    }
    .card-top {
      margin-bottom: 1rem;
    }
    .card-icon-title {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 0.5rem;
    }
    .card-icon {
      font-size: 1.5rem;
    }
    .card-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #f1f5f9;
      margin: 0;
    }
    .card-author {
      font-size: 0.75rem;
      color: #64748b;
      margin-bottom: 0.5rem;
      display: block;
    }
    .card-desc {
      font-size: 0.85rem;
      color: #94a3b8;
      margin: 0;
      line-height: 1.5;
    }
    .card-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 0.75rem;
    }
    .card-tag {
      font-size: 0.7rem;
      padding: 2px 6px;
      background: #1e293b;
      color: #cbd5e1;
      border-radius: 4px;
      font-family: monospace;
    }
    .card-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 1rem;
      padding-top: 0.75rem;
      border-top: 1px solid #1e293b;
    }
    .card-path {
      font-family: 'Courier New', monospace;
      font-size: 0.75rem;
      color: #38bdf8;
    }
    .btn-visit {
      display: inline-block;
      padding: 6px 12px;
      background: #0284c7;
      color: white;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.8rem;
      text-align: center;
      text-decoration: none;
      transition: background 0.2s;
    }
    .btn-visit:hover {
      background: #0369a1;
    }
    .guide-box {
      background: #020617;
      border: 1px solid #1e293b;
      border-radius: 12px;
      padding: 1.5rem;
      margin-top: 2.5rem;
    }
    .footer {
      text-align: center;
      padding: 2rem;
      color: #64748b;
      font-size: 0.85rem;
      border-top: 1px solid #1e293b;
      margin-top: 3rem;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-badge">🌆 GlassDrive Personal Webpages Directory</div>
    <h1>Glass Drive Neighborhood Hub</h1>
    <p class="subtitle">Discover user-created webpages and retro GeoCities personal sites grouped dynamically by document metadata tags.</p>
    
    <div class="marquee-bar">
      <marquee>*** GlassDrive Neighborhood Hub Active *** Search and filter user pages by tags: #siliconvalley #area51 #tokyo #geocities #retro #tech #anime ***</marquee>
    </div>
  </div>

  <div class="container">
    <!-- Interactive Tag Filter and Search Box -->
    <div class="search-filter-box">
      <input type="text" id="search-input" class="search-input" placeholder="🔍 Search webpages by title, author, description, or metadata tag..." onkeyup="filterPages()" />
      
      <div class="filter-title">🏷️ Filter by Metadata Tag:</div>
      <div class="tag-pills" id="tag-pills">
        <span class="tag-pill active" onclick="selectTag('all')"># All Pages</span>
        <span class="tag-pill" onclick="selectTag('geocities')"># geocities</span>
        <span class="tag-pill" onclick="selectTag('siliconvalley')"># siliconvalley</span>
        <span class="tag-pill" onclick="selectTag('area51')"># area51</span>
        <span class="tag-pill" onclick="selectTag('tokyo')"># tokyo</span>
        <span class="tag-pill" onclick="selectTag('retro')"># retro</span>
        <span class="tag-pill" onclick="selectTag('tech')"># tech</span>
        <span class="tag-pill" onclick="selectTag('ufos')"># ufos</span>
        <span class="tag-pill" onclick="selectTag('anime')"># anime</span>
        <span class="tag-pill" onclick="selectTag('system')"># system</span>
      </div>
    </div>

    <!-- Metadata Group 1: SiliconValley & Tech Shrines -->
    <div class="group-section" data-group-tag="siliconvalley tech kernel">
      <div class="group-header">
        <div class="group-title">
          <span>💻</span> Silicon Valley Tech Neighborhood
        </div>
        <span class="group-tag-badge">Tags: geocities &bull; siliconvalley &bull; tech</span>
      </div>
      <div class="grid">
        <div class="card" data-tags="geocities siliconvalley personal-site retro tech kernel">
          <div class="card-top">
            <div class="card-icon-title">
              <span class="card-icon">💻</span>
              <h3 class="card-title">SiliconValley Cyber Shrine</h3>
            </div>
            <span class="card-author">By: SiliconValley_Coder99</span>
            <p class="card-desc">Low-level assembly, custom GlassOS executables, kernel tweaks, hit counters, and cybernetics shrine.</p>
            <div class="card-tags">
              <span class="card-tag">#geocities</span>
              <span class="card-tag">#siliconvalley</span>
              <span class="card-tag">#retro</span>
              <span class="card-tag">#tech</span>
            </div>
          </div>
          <div class="card-bottom">
            <span class="card-path">local://SiliconValley/index.json</span>
            <a href="local://SiliconValley/index.json" class="btn-visit" style="background:#0891b2;">Visit Site ➔</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Metadata Group 2: Area51 & Sci-Fi Archives -->
    <div class="group-section" data-group-tag="area51 ufos sci-fi gaming">
      <div class="group-header">
        <div class="group-title">
          <span>🛸</span> Area 51 Paranormal & Sci-Fi Vault
        </div>
        <span class="group-tag-badge">Tags: geocities &bull; area51 &bull; ufos</span>
      </div>
      <div class="grid">
        <div class="card" data-tags="geocities area51 ufos retro sci-fi gaming">
          <div class="card-top">
            <div class="card-icon-title">
              <span class="card-icon">🛸</span>
              <h3 class="card-title">Area 51 Top Secret Vault</h3>
            </div>
            <span class="card-author">By: XFiles_Watcher88</span>
            <p class="card-desc">Paranormal archives, UFO sighting logs, mysterious GlassOS process IDs, and 90s gaming secrets.</p>
            <div class="card-tags">
              <span class="card-tag">#geocities</span>
              <span class="card-tag">#area51</span>
              <span class="card-tag">#ufos</span>
              <span class="card-tag">#retro</span>
            </div>
          </div>
          <div class="card-bottom">
            <span class="card-path">local://Area51/index.json</span>
            <a href="local://Area51/index.json" class="btn-visit" style="background:#16a34a;">Visit Site ➔</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Metadata Group 3: Tokyo & Synthwave Cyber Haven -->
    <div class="group-section" data-group-tag="tokyo anime pixelart synth">
      <div class="group-header">
        <div class="group-title">
          <span>🗼</span> Neo-Tokyo 8-Bit Pixel Haven
        </div>
        <span class="group-tag-badge">Tags: geocities &bull; tokyo &bull; anime</span>
      </div>
      <div class="grid">
        <div class="card" data-tags="geocities tokyo anime pixelart synthwave">
          <div class="card-top">
            <div class="card-icon-title">
              <span class="card-icon">🗼</span>
              <h3 class="card-title">Neo-Tokyo Cyber Shrine</h3>
            </div>
            <span class="card-author">By: CyberPixel_Artisan</span>
            <p class="card-desc">Synthwave aesthetics, anime low-bit pixel art, 90s audio synthesis, and collectibles node.</p>
            <div class="card-tags">
              <span class="card-tag">#geocities</span>
              <span class="card-tag">#tokyo</span>
              <span class="card-tag">#anime</span>
              <span class="card-tag">#pixelart</span>
            </div>
          </div>
          <div class="card-bottom">
            <span class="card-path">local://Tokyo/index.json</span>
            <a href="local://Tokyo/index.json" class="btn-visit" style="background:#db2777;">Visit Site ➔</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Metadata Group 4: System Pages & Directories -->
    <div class="group-section" data-group-tag="system docs geocities hub">
      <div class="group-header">
        <div class="group-title">
          <span>📄</span> GlassDrive Portals & System Pages
        </div>
        <span class="group-tag-badge">Tags: system &bull; docs &bull; hub</span>
      </div>
      <div class="grid">
        <div class="card" data-tags="geocities hub retro network">
          <div class="card-top">
            <div class="card-icon-title">
              <span class="card-icon">🏰</span>
              <h3 class="card-title">GeoCities Network Hub</h3>
            </div>
            <span class="card-author">GlassOS System</span>
            <p class="card-desc">Overview of polymorphic GlassOSDocument sites with guestbooks, hit counters, and webrings.</p>
            <div class="card-tags">
              <span class="card-tag">#geocities</span>
              <span class="card-tag">#hub</span>
              <span class="card-tag">#retro</span>
            </div>
          </div>
          <div class="card-bottom">
            <span class="card-path">local://geocities.html</span>
            <a href="local://geocities.html" class="btn-visit">Visit Page ➔</a>
          </div>
        </div>

        <div class="card" data-tags="system portal home">
          <div class="card-top">
            <div class="card-icon-title">
              <span class="card-icon">🏠</span>
              <h3 class="card-title">GlassOS Home Portal</h3>
            </div>
            <span class="card-author">GlassOS System</span>
            <p class="card-desc">Primary OS web portal for featured applications, system specifications, and shortcuts.</p>
            <div class="card-tags">
              <span class="card-tag">#system</span>
              <span class="card-tag">#portal</span>
            </div>
          </div>
          <div class="card-bottom">
            <span class="card-path">local://home.html</span>
            <a href="local://home.html" class="btn-visit">Visit Page ➔</a>
          </div>
        </div>

        <div class="card" data-tags="system docs guide manual">
          <div class="card-top">
            <div class="card-icon-title">
              <span class="card-icon">📖</span>
              <h3 class="card-title">User's Manual & Guide</h3>
            </div>
            <span class="card-author">GlassOS System</span>
            <p class="card-desc">Comprehensive guide on writing GlassOS documents, Web Composer authoring, and GlassScripting.</p>
            <div class="card-tags">
              <span class="card-tag">#system</span>
              <span class="card-tag">#docs</span>
            </div>
          </div>
          <div class="card-bottom">
            <span class="card-path">local://guide.html</span>
            <a href="local://guide.html" class="btn-visit">Visit Page ➔</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Guide for Authors -->
    <div class="guide-box">
      <h2 style="font-size: 1.15rem; color: #f8fafc; margin: 0 0 0.5rem 0; display: flex; align-items: center; gap: 8px;">
        <span>🚀</span> How to Tag Your Page for Neighborhood Placement
      </h2>
      <p style="font-size: 0.875rem; color: #94a3b8; margin: 0 0 1rem 0;">
        When creating a document in Web Composer or saving a JSON document in <code>/GlassDrive/</code>, include a <code>metadata</code> object with your neighborhood and tags:
      </p>
      <pre style="background: #0f172a; border: 1px solid #1e293b; padding: 12px; border-radius: 8px; font-size: 0.8rem; color: #38bdf8; overflow-x: auto;"><code>{
  "type": "document",
  "metadata": {
    "author": "YourName",
    "neighborhood": "SiliconValley", // "SiliconValley" | "Area51" | "Tokyo"
    "tags": ["geocities", "tech", "personal-site", "retro"]
  }
}</code></pre>
    </div>
  </div>

  <div class="footer">
    GlassOS Neighborhood Directory &bull; GlassDrive Virtual Filesystem &bull; Powered by Metadata Schema
  </div>

  <script>
    var currentTag = 'all';

    function selectTag(tag) {
      currentTag = tag;
      var pills = document.querySelectorAll('.tag-pill');
      pills.forEach(function(p) {
        if (p.innerText.includes(tag) || (tag === 'all' && p.innerText.includes('All'))) {
          p.classList.add('active');
        } else {
          p.classList.remove('active');
        }
      });
      filterPages();
    }

    function filterPages() {
      var query = document.getElementById('search-input').value.toLowerCase();
      var cards = document.querySelectorAll('.card');
      var sections = document.querySelectorAll('.group-section');

      cards.forEach(function(card) {
        var tags = (card.getAttribute('data-tags') || '').toLowerCase();
        var text = card.innerText.toLowerCase();
        var matchesTag = (currentTag === 'all') || tags.includes(currentTag);
        var matchesQuery = !query || text.includes(query) || tags.includes(query);

        if (matchesTag && matchesQuery) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });

      sections.forEach(function(sec) {
        var visibleCards = sec.querySelectorAll('.card[style="display: flex;"]');
        if (visibleCards.length === 0 && (query || currentTag !== 'all')) {
          sec.style.display = 'none';
        } else {
          sec.style.display = 'block';
        }
      });
    }
  </script>
</body>
</html>`
          },
          {
            name: 'geocities.html',
            type: 'file',
            permissions: DEFAULT_PERMISSIONS,
            content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>GeoCities Cyber Shrine Network - GlassOS</title>
  <style>
    body {
      background: #090d16;
      color: #e2e8f0;
      font-family: 'Courier New', Courier, monospace;
      margin: 0;
      padding: 24px;
      line-height: 1.6;
    }
    .hero {
      text-align: center;
      padding: 30px 20px;
      background: linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%);
      border: 3px double #a855f7;
      border-radius: 12px;
      margin-bottom: 24px;
      box-shadow: 0 0 20px rgba(168, 85, 247, 0.2);
    }
    h1 {
      color: #38bdf8;
      font-size: 28px;
      margin: 0 0 10px 0;
      text-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
    }
    .marquee-box {
      background: #000;
      border: 1px solid #38bdf8;
      color: #f43f5e;
      font-weight: bold;
      padding: 6px;
      margin: 15px 0;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .card {
      background: #111827;
      border: 2px solid #374151;
      border-radius: 10px;
      padding: 18px;
      text-decoration: none;
      color: inherit;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .card:hover {
      transform: translateY(-3px);
      border-color: #a855f7;
      box-shadow: 0 0 15px rgba(168, 85, 247, 0.3);
    }
    .card-silicon { border-top: 4px solid #06b6d4; }
    .card-area51 { border-top: 4px solid #22c55e; }
    .card-tokyo { border-top: 4px solid #ec4899; }
    .card-title {
      font-size: 18px;
      font-weight: bold;
      color: #f3f4f6;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .tag {
      font-size: 10px;
      text-transform: uppercase;
      padding: 2px 6px;
      border-radius: 4px;
      background: #1f2937;
      color: #9ca3af;
      margin-right: 4px;
    }
    .btn-link {
      display: inline-block;
      margin-top: 12px;
      padding: 8px 14px;
      background: #2563eb;
      color: white;
      border-radius: 6px;
      font-weight: bold;
      text-align: center;
      text-decoration: none;
    }
    .btn-link:hover { background: #1d4ed8; }
    .spec-box {
      background: #020617;
      border: 1px dashed #475569;
      padding: 16px;
      border-radius: 8px;
      font-size: 12px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="hero">
    <h1>🏰 GlassDrive GeoCities Cyber Shrine Network</h1>
    <div class="marquee-box">
      <marquee>*** Welcome to the Retro Personal Site Network hosted directly on GlassDrive *** Polymorphic GlassOSDocument Schema Enabled ***</marquee>
    </div>
    <p style="color: #cbd5e1; font-size: 14px; margin: 0;">
      Every page in GlassDrive conforms to the polymorphic <code>GlassOSDocument</code> JSON schema, bundling layout, custom scripts, hit counters, and live REST API guestbooks.
    </p>
  </div>

  <h2 style="color: #f472b6; font-size: 20px; border-bottom: 2px solid #ec4899; padding-bottom: 6px;">
    🌆 Neighborhood Nodes
  </h2>

  <div class="grid">
    <div class="card card-silicon">
      <div>
        <div class="card-title">💻 SiliconValley</div>
        <div>
          <span class="tag">tech</span><span class="tag">kernel</span><span class="tag">retro</span>
        </div>
        <p style="font-size: 13px; color: #9ca3af; margin-top: 10px;">
          Personal node of <strong>SiliconValley_Coder99</strong>. OS assembly tweaks, kernel scripts, and cybernetic shrine.
        </p>
      </div>
      <a href="local://SiliconValley/index.json" class="btn-link" style="background: #0891b2;">Visit Node ➔</a>
    </div>

    <div class="card card-area51">
      <div>
        <div class="card-title">🛸 Area51</div>
        <div>
          <span class="tag">ufos</span><span class="tag">sci-fi</span><span class="tag">gaming</span>
        </div>
        <p style="font-size: 13px; color: #9ca3af; margin-top: 10px;">
          Paranormal archives of <strong>XFiles_Watcher88</strong>. UFO sightings, mysterious process IDs, and retro gaming secrets.
        </p>
      </div>
      <a href="local://Area51/index.json" class="btn-link" style="background: #16a34a;">Visit Node ➔</a>
    </div>

    <div class="card card-tokyo">
      <div>
        <div class="card-title">🗼 Tokyo</div>
        <div>
          <span class="tag">anime</span><span class="tag">pixel-art</span><span class="tag">synth</span>
        </div>
        <p style="font-size: 13px; color: #9ca3af; margin-top: 10px;">
          Neo-Tokyo 8-bit cyber shrine of <strong>CyberPixel_Artisan</strong>. Low-bit pixel art, synthwave audio, and anime collectibles.
        </p>
      </div>
      <a href="local://Tokyo/index.json" class="btn-link" style="background: #db2777;">Visit Node ➔</a>
    </div>
  </div>

  <div class="spec-box">
    <strong style="color: #38bdf8;">⚙️ GlassOSDocument Specifications:</strong><br/>
    • <strong>Location:</strong> <code>/GlassDrive/&lt;Neighborhood&gt;/index.json</code><br/>
    • <strong>Features:</strong> Marquee banners, Odometer hit counter, Live filesystem guestbook, Synth audio MIDI player, Low-bit webring navigation.<br/>
    • <strong>Publishing:</strong> Call <code>publishAsApp()</code> in GlassOS kernel to deploy any document as an instant executable web app!
  </div>
</body>
</html>`
          },
          {
            name: 'home.html',
            type: 'file',
            content: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
      line-height: 1.5;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 3rem 1.5rem;
    }
    .header {
      text-align: center;
      margin-bottom: 3rem;
    }
    .logo-container {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      border-radius: 16px;
      color: white;
      font-size: 2.2rem;
      font-weight: bold;
      margin-bottom: 1rem;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
    h1 {
      font-size: 2.5rem;
      font-weight: 800;
      color: #1e293b;
      margin: 0 0 0.5rem 0;
      letter-spacing: -0.025em;
    }
    .subtitle {
      font-size: 1.125rem;
      color: #64748b;
      margin: 0;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 3rem;
    }
    .card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 1.5rem;
      text-decoration: none;
      color: inherit;
      transition: all 0.2s ease-in-out;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 20px -8px rgba(0, 0, 0, 0.1);
      border-color: #cbd5e1;
    }
    .card-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.5rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .card-desc {
      font-size: 0.95rem;
      color: #475569;
      margin: 0;
    }
    .footer {
      text-align: center;
      font-size: 0.875rem;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
      padding-top: 2rem;
      margin-top: 3rem;
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      background: #eff6ff;
      color: #2563eb;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 6px;
      margin-bottom: 0.5rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-container">G</div>
      <h1>Welcome to GlassOS</h1>
      <p class="subtitle">The next generation web operating system environment.</p>
    </div>

    <div class="grid">
      <a href="local://guide.html" class="card" style="border-left: 4px solid #2563eb;">
        <span class="badge">Recommended</span>
        <h2 class="card-title">📖 GlassOS User's Guide</h2>
        <p class="card-desc">Master GlassOS. Learn system applications, custom webpages, script automation, and keyboard shortcuts.</p>
      </a>

      <a href="local://about.html" class="card">
        <span class="badge" style="background:#f1f5f9; color:#475569;">System</span>
        <h2 class="card-title">✨ About GlassOS</h2>
        <p class="card-desc">Read about the architecture, system specifications, kernel version, and the vision of GlassOS.</p>
      </a>

      <a href="local://neighborhood.html" class="card" style="border-left: 4px solid #06b6d4; background: linear-gradient(135deg, #ecfeff, #cffaff);">
        <span class="badge" style="background:#cffaff; color:#0891b2;">Webpages Directory</span>
        <h2 class="card-title">🌆 Web Neighborhoods Landing Page</h2>
        <p class="card-desc">Directory of all user created webpages, GeoCities personal sites, and GlassDrive HTML documents.</p>
      </a>

      <a href="local://geocities.html" class="card" style="border-left: 4px solid #a855f7; background: linear-gradient(135deg, #fdf4ff, #fae8ff);">
        <span class="badge" style="background:#f3e8ff; color:#9333ea;">Retro GlassDrive</span>
        <h2 class="card-title">🏰 GeoCities Cyber Shrine Network</h2>
        <p class="card-desc">Explore polymorphic GlassOSDocument personal sites in SiliconValley, Area51, and Tokyo with guestbooks, hit counters, and webrings!</p>
      </a>
    </div>

    <div class="footer">
      Powered by the GlassOS Web Engine &bull; System Version 1.2.0
    </div>
  </div>
</body>
</html>`,
            permissions: DEFAULT_PERMISSIONS
          },
          { name: 'about.html', type: 'file', content: '<h1>About GlassOS</h1><p>Built for the future.</p>', permissions: DEFAULT_PERMISSIONS },
          {
            name: 'guide.html',
            type: 'file',
            content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>The User's Guide to GlassOS</title>
  <style>
    :root {
      --primary: #3b82f6;
      --primary-dark: #2563eb;
      --bg: #f8fafc;
      --text: #0f172a;
      --muted: #475569;
      --border: #e2e8f0;
      --card-bg: #ffffff;
      --code-bg: #1e293b;
    }

    * {
      box-sizing: border-box;
      scroll-behavior: smooth;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: var(--text);
      background-color: var(--bg);
      margin: 0;
      padding: 0;
      display: flex;
      height: 100vh;
      overflow: hidden;
    }

    /* Layout */
    .sidebar {
      width: 240px;
      background-color: #ffffff;
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      height: 100%;
      flex-shrink: 0;
    }

    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--border);
      background: linear-gradient(135deg, #1e293b, #0f172a);
      color: white;
    }

    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 700;
      font-size: 1.1rem;
    }

    .sidebar-logo span {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 26px;
      background: var(--primary);
      border-radius: 6px;
      font-size: 0.9rem;
    }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
    }

    .nav-title {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #94a3b8;
      margin: 1.5rem 0 0.5rem 0.5rem;
    }

    .nav-title:first-child {
      margin-top: 0.5rem;
    }

    .nav-link {
      display: block;
      padding: 0.5rem 0.75rem;
      color: var(--muted);
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 500;
      border-radius: 6px;
      transition: all 0.15s;
    }

    .nav-link:hover {
      background-color: #f1f5f9;
      color: var(--text);
    }

    .nav-link.active {
      background-color: #eff6ff;
      color: var(--primary-dark);
      font-weight: 600;
    }

    .content-area {
      flex: 1;
      overflow-y: auto;
      padding: 3rem 4rem;
      max-width: 900px;
    }

    /* Typography */
    h1 {
      font-size: 2.25rem;
      font-weight: 800;
      letter-spacing: -0.025em;
      margin-top: 0;
      margin-bottom: 1.5rem;
      color: #1e293b;
    }

    h2 {
      font-size: 1.5rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-top: 3rem;
      margin-bottom: 1rem;
      color: #1e293b;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.5rem;
    }

    h3 {
      font-size: 1.1rem;
      font-weight: 600;
      margin-top: 2rem;
      margin-bottom: 0.75rem;
      color: #334155;
    }

    p {
      line-height: 1.7;
      color: var(--muted);
      margin-bottom: 1.25rem;
    }

    /* Styled Elements */
    .info-box {
      background-color: #f0fdf4;
      border-left: 4px solid #22c55e;
      padding: 1.25rem;
      border-radius: 8px;
      margin: 1.5rem 0;
    }

    .info-box-title {
      font-weight: 700;
      color: #14532d;
      margin-bottom: 0.25rem;
      font-size: 0.95rem;
    }

    .info-box p {
      margin: 0;
      color: #166534;
      font-size: 0.9rem;
    }

    .warning-box {
      background-color: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 1.25rem;
      border-radius: 8px;
      margin: 1.5rem 0;
    }

    .warning-box-title {
      font-weight: 700;
      color: #78350f;
      margin-bottom: 0.25rem;
      font-size: 0.95rem;
    }

    .warning-box p {
      margin: 0;
      color: #92400e;
      font-size: 0.9rem;
    }

    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      background-color: #e2e8f0;
      color: #0f172a;
      padding: 0.15rem 0.35rem;
      border-radius: 4px;
      font-size: 0.85em;
    }

    pre {
      background-color: var(--code-bg);
      color: #f8fafc;
      padding: 1.25rem;
      border-radius: 8px;
      overflow-x: auto;
      margin: 1.5rem 0;
      font-size: 0.85rem;
      line-height: 1.6;
    }

    pre code {
      background-color: transparent;
      color: inherit;
      padding: 0;
      font-size: inherit;
    }

    ul, ol {
      margin-bottom: 1.25rem;
      padding-left: 1.5rem;
    }

    li {
      margin-bottom: 0.5rem;
      color: var(--muted);
      line-height: 1.6;
    }

    .steps {
      list-style-type: none;
      padding-left: 0;
      counter-reset: step-counter;
    }

    .steps li {
      position: relative;
      padding-left: 2.5rem;
      margin-bottom: 1.5rem;
    }

    .steps li::before {
      content: counter(step-counter);
      counter-increment: step-counter;
      position: absolute;
      left: 0;
      top: 0;
      width: 1.75rem;
      height: 1.75rem;
      background-color: var(--primary);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: bold;
    }

    .tag {
      display: inline-block;
      padding: 0.15rem 0.4rem;
      background-color: #f1f5f9;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
      vertical-align: middle;
      margin-right: 0.25rem;
    }

    .tag-blue {
      background-color: #eff6ff;
      color: #2563eb;
    }

    /* Grid layout inside guide */
    .apps-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1rem;
      margin: 1.5rem 0;
    }

    .app-card {
      background-color: white;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1rem;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }

    .app-card-title {
      font-weight: 600;
      font-size: 0.95rem;
      margin-bottom: 0.25rem;
      color: #1e293b;
    }

    .app-card-desc {
      font-size: 0.8rem;
      color: #64748b;
      margin: 0;
    }
  </style>
</head>
<body>

  <!-- Navigation Sidebar -->
  <div class="sidebar">
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <span>G</span> Documentation
      </div>
    </div>
    <div class="sidebar-nav">
      <div class="nav-title">Welcome</div>
      <a href="#welcome" class="nav-link">Introduction to GlassOS</a>
      
      <div class="nav-title">Webpages & Composer</div>
      <a href="#webpages" class="nav-link">Creating Webpages</a>
      <a href="#composer" class="nav-link">HTML Composer</a>
      <a href="#templates" class="nav-link">Webpage Templates</a>
      
      <div class="nav-title">Applications</div>
      <a href="#apps" class="nav-link">Built-in Applications</a>
      <a href="#music" class="nav-link">Media & Synthesizer</a>
      <a href="#codestudio" class="nav-link">Code Studio</a>
      
      <div class="nav-title">System & Advanced</div>
      <a href="#automation" class="nav-link">GlassScript & Automation</a>
      <a href="#shortcuts" class="nav-link">Keyboard Shortcuts</a>
      
      <div style="margin-top: 2rem; padding: 0 0.5rem;">
        <a href="local://home.html" style="display: block; text-align: center; background-color: var(--primary); color: white; text-decoration: none; padding: 0.5rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600;">Go Back Home</a>
      </div>
    </div>
  </div>

  <!-- Content Panel -->
  <div class="content-area">
    
    <!-- Welcome section -->
    <div id="welcome">
      <h1>The User's Guide to GlassOS</h1>
      <p>Welcome to <strong>GlassOS</strong>—the ultimate web-based micro-desktop environment. GlassOS brings an elegant window-based workspace straight to your browser, packing a full-stack suite of visual design, script editing, coding, and browser simulation tools into a beautiful, fluid glassmorphic UI.</p>
      
      <div class="info-box">
        <div class="info-box-title">💡 System Architecture Tip</div>
        <p>GlassOS uses a fully virtualized, stateful, in-memory filesystem that persists and connects all your system apps. You can edit script files in Notepad, run them in Code Studio, or write web documents to be loaded instantly in the Browser App!</p>
      </div>
    </div>

    <!-- Creating Webpages section -->
    <div id="webpages">
      <h2>Creating and Viewing Your Own Webpages</h2>
      <p>One of the most powerful features of GlassOS is the ability to write <strong>HTML pages</strong> and browse them natively inside the simulated Web Browser using local protocols.</p>
      
      <h3>How the Local Web Works</h3>
      <p>Inside the simulated browser, typing <code>local://</code> followed by a filename resolves directly to files in your <code>/GlassDrive/webpages/</code> directory. For example:</p>
      <ul>
        <li><code>local://home.html</code> resolves to <code>/GlassDrive/webpages/home.html</code></li>
        <li><code>local://about.html</code> resolves to <code>/GlassDrive/webpages/about.html</code></li>
        <li><code>local://guide.html</code> opens this guide!</li>
      </ul>

      <p>Any file created in that directory can be loaded instantly. You can create styles, structures, links, buttons, and layouts!</p>
    </div>

    <!-- HTML Composer section -->
    <div id="composer">
      <h2>Using the HTML Composer</h2>
      <p>The Browser application comes with a built-in <strong>HTML Composer</strong> to make page creation exceptionally easy and fast.</p>
      
      <ol class="steps">
        <li>
          <strong>Open the Browser App</strong>: Double-click the <strong>Browser</strong> icon on your desktop or select it from the app list.
        </li>
        <li>
          <strong>Open Composer Mode</strong>: Look at the toolbar in the simulated browser. Click the <strong>HTML Composer button</strong> (represented by a Code icon <code>&lt;/&gt;</code>).
        </li>
        <li>
          <strong>Write Your HTML</strong>: Use the left side text editor to write standard HTML markup and embedded stylesheets. The right side will immediately display a <strong>Live Real-time Preview</strong>!
        </li>
        <li>
          <strong>Insert Snippets</strong>: Click the handy snippet buttons (like <code>H1</code>, <code>P</code>, <code>STYLE</code>, <code>BUTTON</code>, or <code>A</code>) to quickly paste layout primitives at your cursor.
        </li>
        <li>
          <strong>Name and Save</strong>: Give your page a filename (such as <code>mypage.html</code>) in the input bar and click <strong>Save page</strong>. It will be saved into your <code>/GlassDrive/webpages/</code> directory and becomes instantly accessible via <code>local://mypage.html</code>!
        </li>
      </ol>

      <div class="warning-box">
        <div class="warning-box-title">⚠️ Relative URL Routing</div>
        <p>When linking between your local pages, always use the <code>local://</code> scheme! For example: <code>&lt;a href="local://home.html"&gt;Back to Home&lt;/a&gt;</code>. Standard web links like <code>https://google.com</code> will open in normal external frames.</p>
      </div>
    </div>

    <!-- Webpage Templates section -->
    <div id="templates">
      <h2>Webpage Templates & Primitives</h2>
      <p>Here are some beautiful templates you can copy and paste into the HTML Composer to build highly interactive layouts!</p>
      
      <h3>Interactive Click Counter Template</h3>
      <pre><code>&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
  &lt;style&gt;
    body { font-family: sans-serif; text-align: center; padding: 2rem; background: #fafafa; }
    .btn { padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; box-shadow: 0 4px 6px -1px rgba(59,130,246,0.3); transition: all 0.2s; }
    .btn:hover { background: #2563eb; transform: translateY(-1px); }
    .btn:active { transform: translateY(1px); }
    .counter { font-size: 3rem; font-weight: bold; margin: 1rem; color: #1e293b; }
  &lt;/style&gt;
&lt;/head&gt;
&lt;body&gt;
  &lt;h1&gt;Interactive App&lt;/h1&gt;
  &lt;div class="counter" id="count"&gt;0&lt;/div&gt;
  &lt;button class="btn" onclick="document.getElementById('count').innerText = Number(document.getElementById('count').innerText) + 1"&gt;
    Click Me!
  &lt;/button&gt;
&lt;/body&gt;
&lt;/html&gt;</code></pre>

      <h3>Styled Profile Card Template</h3>
      <pre><code>&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
  &lt;style&gt;
    body { font-family: system-ui; background: #e2e8f0; display: flex; justify-content: center; padding: 3rem; }
    .card { background: white; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); width: 300px; padding: 1.5rem; text-align: center; }
    .avatar { width: 80px; height: 80px; border-radius: 50%; background: #3b82f6; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem; font-weight: bold; }
    h2 { margin: 0; color: #1e293b; }
    p { color: #64748b; font-size: 0.9rem; margin: 0.5rem 0 1rem; }
    .link { display: inline-block; padding: 8px 16px; background: #f1f5f9; color: #3b82f6; text-decoration: none; border-radius: 6px; font-size: 0.85rem; font-weight: 600; }
  &lt;/style&gt;
&lt;/head&gt;
&lt;body&gt;
  &lt;div class="card"&gt;
    &lt;div class="avatar"&gt;JS&lt;/div&gt;
    &lt;h2&gt;Jane Smith&lt;/h2&gt;
    &lt;p&gt;GlassOS Designer & Creator&lt;/p&gt;
    &lt;a href="local://home.html" class="link"&gt;Visit Home Portal&lt;/a&gt;
  &lt;/div&gt;
&lt;/body&gt;
&lt;/html&gt;</code></pre>
    </div>

    <!-- Built-in Applications section -->
    <div id="apps">
      <h2>Built-In Applications</h2>
      <p>GlassOS comes loaded with over 20+ specialized system applications. Here is an overview of the most essential utilities on your desktop:</p>
      
      <div class="apps-grid">
        <div class="app-card">
          <div class="app-card-title"><span class="tag tag-blue">Files</span> File Explorer</div>
          <p class="app-card-desc">Navigate documents, drawing vectors, photographs, and system binaries inside a structured folder browser.</p>
        </div>
        <div class="app-card">
          <div class="app-card-title"><span class="tag tag-blue">Notepad</span> Text Editor</div>
          <p class="app-card-desc">Write rich text files, change alignment, text size, font weights, or draft scripts to trigger automation routines.</p>
        </div>
        <div class="app-card">
          <div class="app-card-title"><span class="tag tag-blue">Terminal</span> Shell console</div>
          <p class="app-card-desc">Execute virtual commands like ls, cat, grep, cd, rm, and export custom environment path aliases.</p>
        </div>
        <div class="app-card">
          <div class="app-card-title"><span class="tag tag-blue">NOC</span> System Monitor</div>
          <p class="app-card-desc">Monitor virtual CPU, memory load graphs, check current system logs, and control running background processes.</p>
        </div>
      </div>
    </div>

    <!-- Media section -->
    <div id="music">
      <h2>Music Player & Synthesizer Engine</h2>
      <p>The music player in GlassOS is a real-time, interactive synthesizer backed by the <strong>Web Audio API</strong>. It synthesizes tracks entirely in software, featuring high-quality sound synthesis modules:</p>
      
      <ul>
        <li><strong>Kick Drums, Snares, and Hi-Hats</strong> generated from oscillator frequency ramps and randomized noise buffers.</li>
        <li><strong>Chords Pads & Lead Bells</strong> generated using detuned oscillators, peaking filters, and low-frequency resonance curves.</li>
        <li><strong>Three-Band Parametric Equalizer</strong>: Adjust <code>Bass Gain</code>, <code>Mid Gain</code>, and <code>Treble Gain</code> sliders manually, or select presets (Flat, Bass Boost, Treble Boost, Vocal) to modulate the sound in real-time.</li>
        <li><strong>Advanced Visualizers</strong>: Select between <strong>Bars</strong>, <strong>Wave</strong>, or <strong>Orbit</strong> rendering modes to display real-time frequency analysis.</li>
      </ul>
    </div>

    <!-- Code Studio section -->
    <div id="codestudio">
      <h2>Code Studio & B (Brainscript) Kernel VM</h2>
      <p><strong>B (Brainscript)</strong> is a powerful high/low-level programming and kernel scripting language designed for programs and low-level system execution. It utilizes structural block delimiters (<code>@@</code> Global Parent, <code>$$</code> Library, <code>###</code> Conductor Entry Point, <code>##</code> Local Method) and indexed memory segments (<code>$000-$02F</code> System, <code>$030-$0FF</code> Global, <code>$100-$1FF</code> Library, <code>$200-$2FF</code> Conductor, <code>$300-$7FF</code> Local, <code>$800-$9FF</code> User Defined).</p>
      
      <h3>B (Brainscript) Program Example</h3>
      <pre><code>###MAIN.EntryPoint
Start
  SET $000 0x01 $001 "SYS_ACTIVE"
  LET $appName 'GlassOS Kernel Engine'
  PRINT 'Initializing: ' && $appName
  TIMESTAMP
  BRANCH ##user_auth
  QUIT
End

##user_auth
Start
  INPUT $pass: "Enter Access PIN: "
  LET $expected "1234"
  COMPARE $pass $expected : PRINT "AUTH OK" BRANCH ##run_process : PRINT "AUTH DENIED"
End

##run_process
Start
  LET $batchCount 5
  PRINT "Running task batch, size: " && $batchCount
End</code></pre>
      <p>Launch CodeStudio to compile B scripts, step through VM instruction execution, inspect memory registers, and debug kernel tasks!</p>
    </div>

    <!-- GlassScript section -->
    <div id="automation">
      <h2>glassScript Automation</h2>
      <p><strong>glassScript</strong> is a high-level English-like desktop automation language that operates like AppleScript / HyperTalk to script applications and GUI processes:</p>
      <pre><code>tell app "Notepad"
    set font size to 16
    set style to bold
    align center
    write "Automated Document Creator"
end tell</code></pre>
    </div>

    <!-- Keyboard Shortcuts section -->
    <div id="shortcuts">
      <h2>Desktop Keyboard Shortcuts</h2>
      <p>Navigate like a pro with these high-productivity global system shortcuts:</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 1rem;">
        <thead>
          <tr style="border-bottom: 2px solid var(--border); text-align: left;">
            <th style="padding: 0.5rem; font-size: 0.9rem;">Shortcut</th>
            <th style="padding: 0.5rem; font-size: 0.9rem;">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid var(--border);">
            <td style="padding: 0.5rem; font-size: 0.85rem;"><code>Ctrl + Alt + T</code></td>
            <td style="padding: 0.5rem; font-size: 0.85rem; color: var(--muted);">Launch Terminal</td>
          </tr>
          <tr style="border-bottom: 1px solid var(--border);">
            <td style="padding: 0.5rem; font-size: 0.85rem;"><code>Ctrl + Alt + B</code></td>
            <td style="padding: 0.5rem; font-size: 0.85rem; color: var(--muted);">Launch Web Browser</td>
          </tr>
          <tr style="border-bottom: 1px solid var(--border);">
            <td style="padding: 0.5rem; font-size: 0.85rem;"><code>Ctrl + Alt + F</code></td>
            <td style="padding: 0.5rem; font-size: 0.85rem; color: var(--muted);">Open File Explorer</td>
          </tr>
          <tr style="border-bottom: 1px solid var(--border);">
            <td style="padding: 0.5rem; font-size: 0.85rem;"><code>Esc</code></td>
            <td style="padding: 0.5rem; font-size: 0.85rem; color: var(--muted);">Close current active window</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>

  <!-- Internal script to handle dynamic sidebar styling on scroll/clicks -->
  <script>
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', function(e) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
      });
    });

    // Automatically highlight link based on section in view
    const observerOptions = {
      root: document.querySelector('.content-area'),
      threshold: 0.4
    };

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('href') === '#' + id) {
              document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
              link.classList.add('active');
            }
          });
        }
      });
    }, observerOptions);

    document.querySelectorAll('.content-area > div').forEach(section => {
      observer.observe(section);
    });
  </script>
</body>
</html>`,
            permissions: DEFAULT_PERMISSIONS
          }
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
