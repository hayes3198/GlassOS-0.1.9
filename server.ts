import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { WebSocketServer, WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function generateHeuristicResponse(messages: any[]): string {
  const lastMsg = messages && messages.length > 0 ? messages[messages.length - 1] : null;
  const userText = lastMsg ? (lastMsg.content || lastMsg.text || '').toLowerCase() : '';

  if (userText.includes('glassscript') || userText.includes('script') || userText.includes('automate')) {
    return `### ⚡ GlassScript System Automation Sequence

Here is a standard, fully-formed **glassScript** macro designed to run safely inside the GlassOS sandbox. You can execute this directly inside Code Studio or the system terminal to orchestrate window states and generate notifications:

\`\`\`glassscript
// glassScript Automation Macro
// Target: Workspace Optimization
const main = () => {
    // 1. Initialize subsystem references
    const term = System.openApp("terminal");
    term.write("Executing workspace consolidation sequence...\\n");

    // 2. Clear background cache lines
    System.flushBuffers();

    // 3. Dispatch security notification to NOC
    System.addNotification(
        "glassScript Kernel", 
        "Subsystem optimization completed (12ms delay).", 
        "success"
    );
};

main();
\`\`\`

#### Key Architecture Principles:
* **Execution Boundary**: Runs with sandboxed local execution context.
* **State Operations**: Synchronously reads and writes to GlassOS IndexedDB state hooks.`;
  }

  if (userText.includes('brainscript') || userText.includes('cognitive') || userText.includes('model') || userText.includes('agent')) {
    return `### 🧠 Brainscript Cognitive Pipeline Layout

To configure advanced logic routing or process complex user flows, GlassOS uses **Brainscript** to declare structured agent orchestrations. Here is a valid configuration schema:

\`\`\`brainscript
// Brainscript Cognitive Model Definition
declare model "Heuristics-Core-V2" {
    temperature: 0.25;
    max_tokens: 2048;
    top_p: 0.90;
}

// Memory block mapping for workspace reference
declare memory "system_context" {
    source: "/sys/config/kernel.conf";
    priority: "highest";
    cache_policy: "write-through";
}

// Sequential agent execution cycle
execute "Consolidate active network lanes and verify gTLSP TCP packets."
\`\`\`

#### Usage Instructions:
1. Load this Brainscript payload into any active IDE window.
2. The local cognitive parser will compile the tokens into executable JSON actions dynamically.`;
  }

  if (userText.includes('database') || userText.includes('sql') || userText.includes('table') || userText.includes('schema') || userText.includes('query')) {
    return `### 🗄️ GlassOS Database Query & Schema Design

Here is a highly optimized schema layout and structured JSON collection query template for the Glass Database applet:

\`\`\`json
{
  "collection": "system_nodes",
  "operation": "SELECT",
  "query": {
    "priority": { "$in": ["critical", "high"] },
    "status": "active"
  },
  "options": {
    "sort": { "latencyMs": 1 },
    "limit": 25
  }
}
\`\`\`

#### SQL Equivalency:
If you are mapping this to a relational or Cloud SQL architecture, use the following optimized command:

\`\`\`sql
-- Fetch top performing critical routing nodes
SELECT id, hostname, ip, latency_ms 
FROM system_nodes 
WHERE priority IN ('critical', 'high') AND status = 'active'
ORDER BY latency_ms ASC 
LIMIT 25;
\`\`\`

Let me know if you need help with table normalizations or indexing specific query attributes!`;
  }

  if (userText.includes('mail') || userText.includes('email') || userText.includes('letter') || userText.includes('draft')) {
    return `### ✉️ Drafted Communication Template

Based on your active mail context, here is a highly professional and polished email draft ready for dispatch in GlassMail:

**Subject:** GlassOS Subsystem Tuning Sequence - Status Complete

Dear Systems Operator,

I have completed a thorough check of our active local ports and TCP socket connections. All virtual channels are fully optimized and running smoothly, displaying low latency metrics.

**Subsystem Health Report:**
* **gTLSP Handshakes**: Fully Secured (Derived 256-bit keys)
* **Quantum Bridge (QVB)**: Active (Zero segment dropped)
* **Ingress Queue Pressure**: 12% (Nominal)

Please review the attached diagnostic sheets at your convenience.

Best regards,  
**glassChat Assistant**`;
  }

  if (userText.includes('spreadsheet') || userText.includes('sheet') || userText.includes('formula') || userText.includes('excel')) {
    return `### 📊 Suggested Tabular Formulas for Glass Sheets

To analyze your active spreadsheet grid, here are the most effective formula paths:

* **Calculate Total Sockets Latency**:  
  \`=SUM(D2:D12)\`
* **Evaluate Standard Deviation of Packet Jitter**:  
  \`=STDEV(E2:E12)\`
* **Trigger Congestion Flag**:  
  \`=IF(F2 > 75, "CONGESTED", "OPTIMAL")\`
* **Compute Weighted Priority Index**:  
  \`=AVERAGEIF(C2:C12, "high", D2:D12)\`

You can input these formulas directly into any cell coordinate in Glass Sheets to evaluate live array updates in real-time.`;
  }

  if (userText.includes('document') || userText.includes('write') || userText.includes('text') || userText.includes('paragraph') || userText.includes('word')) {
    return `### 📝 Rich Document Composition Outline

Here is a structured, elegant draft compiled for your document workspace inside GlassWord:

# GlassOS Systems Integration Blueprint
## Section 1: End-to-End Transport Layer Security

This specification outlines the integration of **gTLSP** (Glass Transport Security Protocol) with the client-side socket bridge. By establishing secure key exchanges over physical virtual lanes, the network prevents unauthorized third-party snooping.

### Key Objectives
* **Zero-copy DMA transfers** for rapid packet delivery.
* **Poly1305 symmetric validation** to guard stream authenticity.
* **Quantum-Virtualization Bridge (QVB)** to map ingress ports cleanly.

You can paste this structured document outline directly into GlassWord and select from standard formatting fonts like *Inter* or *JetBrains Mono* to style.`;
  }

  return `### ⚡ glassChat Offline Copilot

Hello, Operator! I am your local, high-performance systems copilot. 

Since this system has been successfully decoupled from external cloud APIs, I run entirely **offline on your local machine** with zero network latency.

I am an expert in:
* **glassOS Architecture** (Subsystems, Files, Mail, Sheets, Database, Drawing)
* **glassScript** (Automating interface configurations and actions)
* **Brainscript** (Setting up agent orchestrations and neural pipelines)
* **Code & Queries** (Writing SQL queries, Excel formulas, rich text documents, or HTML app templates)

How can I assist you with your GlassOS environment today?`;
}

async function ensureStorage() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR);
  }
  
  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify({
      fs_v1: null,
      settings_v1: {},
      users_v1: [],
      collections: {
        emails: [],
        messages: [],
        db_metadata: {
          created_at: new Date().toISOString(),
          version: "1.0.0"
        }
      }
    }));
  }
}

async function startServer() {
  await ensureStorage();
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  app.use(express.json({ limit: '50mb' }));

  const activeNodes = new Map<string, any>();
  const activeSlaves = new Map<string, any>();
  let masterSocketId: string | null = null;

  // --- Raw WebSocket Server (Host Node Bridge) ---
  const ttyClients = new Map<number, WebSocket>();
  const commandBuffers = new Map<number, string>();
  let nextTtyId = 1;

  function sendToTerminalClient(ttyId: number, data: any) {
    const ws = ttyClients.get(ttyId);
    if (ws && ws.readyState === 1 /* OPEN */) {
      let output = '';
      
      if (data.isTopActive) {
        output = '\x1b[2J\x1b[H'; // Clear screen
        output += '\x1b[1;35m=== MAPPED PROCESS MONITOR (TOP) ===\x1b[0m\r\n';
        output += 'Active Core: 100% MAPPED\r\n\r\n';
        output += '\x1b[1mPID     PROCESS                 CPU%    MEM     TTY\x1b[0m\r\n';
        
        if (data.topData && Array.isArray(data.topData)) {
          data.topData.forEach((p: any) => {
            const pid = String(p.pid).padEnd(8);
            const proc = String(p.proc).padEnd(24);
            const cpu = String(p.cpu).padEnd(8);
            const mem = String(p.mem).padEnd(8);
            const tty = String(p.tty || `pts/${ttyId}`);
            output += `${pid}${proc}${cpu}${mem}${tty}\r\n`;
          });
        }
        output += '\r\n\x1b[5;31mPress Ctrl+C or type "quit" to exit process monitor.\x1b[0m\r\n';
      } else {
        output = '\x1b[2J\x1b[H'; // Clear screen & home cursor
        output += '\x1b[1;36m=== GlassOS Distributed Terminal Client v1.0 ===\x1b[0m\r\n';
        output += `Allocated TTY: /dev/tty${ttyId} (Shell PID: ${ttyId + 100})\r\n\r\n`;
        
        if (data.history && Array.isArray(data.history)) {
          data.history.forEach((line: string) => {
            let formattedLine = line;
            if (line.includes('✅') || line.includes('🟢')) {
              formattedLine = `\x1b[32m${line}\x1b[0m`;
            } else if (line.includes('⚠️')) {
              formattedLine = `\x1b[33m${line}\x1b[0m`;
            } else if (line.includes('❌') || line.includes('error') || line.includes('ERROR')) {
              formattedLine = `\x1b[31m${line}\x1b[0m`;
            }
            output += formattedLine.replace(/\r?\n/g, '\r\n') + '\r\n';
          });
        }
        
        const pathString = '/' + (data.currentPath || []).join('/');
        output += `\r\n\x1b[1;32m${data.username || 'guest'}@glass-os:${pathString}$\x1b[0m `;
      }

      ws.send(JSON.stringify({
        type: 'TTY_OUTPUT',
        tty: ttyId,
        data: output
      }));
    }
  }

  function sendTrapToTerminalClient(ttyId: number, trapType: string, trapMessage: string) {
    const ws = ttyClients.get(ttyId);
    if (ws && ws.readyState === 1 /* OPEN */) {
      let output = '\x1b[2J\x1b[H'; // Clear screen
      output += '\x1b[1;31m======================================================================\x1b[0m\r\n';
      output += '\x1b[1;5;31m           ⚠️  RING-0 CPU INTERRUPT EXCEPTION DETECTED ⚠️  \x1b[0m\r\n';
      output += '\x1b[1;31m======================================================================\x1b[0m\r\n\r\n';
      output += `\x1b[1;33mVECTOR FAULT:\x1b[0m \x1b[31;1m${trapType || 'SYS_HALT'}\x1b[0m\r\n`;
      output += `\x1b[1;33mIP REGISTERS DUMP:\x1b[0m\r\n`;
      output += `  EAX=00000003  EBX=002010A4  ECX=FFFFA340  EDX=00000000\r\n`;
      output += `  ESI=00201B4C  EDI=00201201  EBP=FFFFFF0C  ESP=001FA840\r\n`;
      output += `  EIP=001B0243  EFLAGS=00010246  CR0=80000011  CR2=00000000\r\n\r\n`;
      output += `\x1b[1;33mException details:\x1b[0m\r\n`;
      output += `  \x1b[3m${trapMessage || 'Manual CPU instruction halt called by GlassOS master.'}\x1b[0m\r\n\r\n`;
      output += `\x1b[1;5;31m[ SYSTEM QUARANTINE ACTIVE ]\x1b[0m\r\n`;
      output += `Keyboard and peripheral I/O mapping have been suspended to prevent stack overflow.\r\n`;
      output += `Awaiting recovery vector instruction from master controller...\r\n`;
      
      ws.send(JSON.stringify({
        type: 'TTY_OUTPUT',
        tty: ttyId,
        data: output
      }));
    }
  }

  function handleTerminalWSConnection(ws: WebSocket, remoteIp: string) {
    let clientTty: number | null = null;
    let username = 'slave_user';

    ws.on('message', (message) => {
      try {
        const frame = JSON.parse(message.toString());

        if (frame.type === 'CONNECT_REQ') {
          clientTty = nextTtyId++;
          username = frame.username || 'slave_user';
          ttyClients.set(clientTty, ws);
          commandBuffers.set(clientTty, '');

          activeSlaves.set(`ws-${clientTty}`, {
            id: `ws-${clientTty}`,
            hostname: username,
            ip: remoteIp || '127.0.0.1',
            tty: `pts/${clientTty}`,
            connectedAt: new Date().toISOString(),
            userAgent: 'WebSocket LAN Terminal',
            isTrapped: false,
            isWs: true
          });

          if (masterSocketId) {
            io.to(masterSocketId).emit('bridge:slaves-list', Array.from(activeSlaves.values()));
          }

          ws.send(JSON.stringify({
            type: 'CONNECT_ACK',
            tty: clientTty,
            pid: clientTty + 100,
            welcomeMsg: `GlassOS Intranet Kernel Node\r\nLogged in as ${username}.\r\nType 'help' for available commands.\r\n\r\n$ `
          }));

          console.log(`[Master WS]: Slave registered on /dev/tty${clientTty}`);
        }

        if (frame.type === 'TTY_INPUT') {
          if (clientTty !== null) {
            const slaveEntry = activeSlaves.get(`ws-${clientTty}`);
            if (slaveEntry && slaveEntry.isTrapped) {
              ws.send(JSON.stringify({
                type: 'TTY_OUTPUT',
                tty: clientTty,
                data: '\x07' // ASCII Beep
              }));
              return;
            }

            let buffer = commandBuffers.get(clientTty) || '';
            const data = frame.data;

            if (data === '\r' || data === '\n') {
              const cmd = buffer;
              commandBuffers.set(clientTty, '');
              
              ws.send(JSON.stringify({
                type: 'TTY_OUTPUT',
                tty: clientTty,
                data: '\r\n'
              }));

              if (masterSocketId) {
                io.to(masterSocketId).emit('bridge:slave-input', {
                  slaveId: `ws-${clientTty}`,
                  input: cmd,
                  key: 'Enter'
                });
              }
            } else if (data === '\x7f' || data === '\x08') {
              if (buffer.length > 0) {
                buffer = buffer.slice(0, -1);
                commandBuffers.set(clientTty, buffer);
                ws.send(JSON.stringify({
                  type: 'TTY_OUTPUT',
                  tty: clientTty,
                  data: '\b \b'
                }));
              }
            } else {
              buffer += data;
              commandBuffers.set(clientTty, buffer);
              ws.send(JSON.stringify({
                type: 'TTY_OUTPUT',
                tty: clientTty,
                data: data
              }));
            }
          }
        }
      } catch (e) {
        console.error('Error handling WebSocket frame:', e);
      }
    });

    ws.on('close', () => {
      if (clientTty !== null) {
        ttyClients.delete(clientTty);
        commandBuffers.delete(clientTty);
        activeSlaves.delete(`ws-${clientTty}`);
        
        if (masterSocketId) {
          io.to(masterSocketId).emit('bridge:slaves-list', Array.from(activeSlaves.values()));
        }
        console.log(`[Master WS]: Slave disconnected from /dev/tty${clientTty}`);
      }
    });
  }

  // Set up both 3000 (NoServer upgrading) and 8080 (Direct port)
  const wss3000 = new WebSocketServer({ noServer: true });
  wss3000.on('connection', (ws, req) => {
    handleTerminalWSConnection(ws, req.socket.remoteAddress || '127.0.0.1');
  });

  httpServer.on('upgrade', (request, socket, head) => {
    if (request.url && !request.url.includes('socket.io')) {
      wss3000.handleUpgrade(request, socket, head, (ws) => {
        wss3000.emit('connection', ws, request);
      });
    }
  });

  try {
    const wss8080 = new WebSocketServer({ port: 8080 });
    wss8080.on('error', (err: any) => {
      console.warn('Could not launch WebSocket on port 8080 (EADDRINUSE or other error):', err.message);
    });
    wss8080.on('connection', (ws, req) => {
      handleTerminalWSConnection(ws, req.socket.remoteAddress || '127.0.0.1');
    });
    console.log('[GlassOS Master Relay]: WebSocket listening on port 8080...');
  } catch (err: any) {
    console.warn('Could not launch WebSocket on port 8080:', err.message);
  }

  // Socket.io Connection Handling
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    // Relay Bridge Master Registration
    socket.on('bridge:register-master', () => {
      masterSocketId = socket.id;
      console.log(`Master Node registered: ${socket.id}`);
      socket.emit('bridge:master-status', { online: true });
      socket.emit('bridge:slaves-list', Array.from(activeSlaves.values()));
      io.emit('bridge:master-changed', { masterId: socket.id, online: true });
    });

    // Relay Bridge Slave Registration
    socket.on('bridge:register-slave', (slaveData) => {
      activeSlaves.set(socket.id, {
        id: socket.id,
        hostname: slaveData.hostname || `slave-${socket.id.slice(0, 4)}`,
        ip: socket.handshake.address || '127.0.0.1',
        tty: slaveData.tty || 'pts/1',
        connectedAt: new Date().toISOString(),
        userAgent: slaveData.userAgent || 'Unknown Browser'
      });
      console.log(`Slave Node registered: ${socket.id}`);
      
      // Notify Master about new slave list
      if (masterSocketId) {
        io.to(masterSocketId).emit('bridge:slaves-list', Array.from(activeSlaves.values()));
      }
      
      socket.emit('bridge:registered', { id: socket.id, masterOnline: !!masterSocketId });
    });

    // Keyboard inputs from Slave Node
    socket.on('bridge:slave-input', (data) => {
      if (masterSocketId) {
        io.to(masterSocketId).emit('bridge:slave-input', {
          slaveId: socket.id,
          input: data.input,
          key: data.key
        });
      }
    });

    // Render updates from Master Node to Slave Node
    socket.on('bridge:master-render', (data) => {
      if (data.slaveId) {
        if (typeof data.slaveId === 'string' && data.slaveId.startsWith('ws-')) {
          const ttyId = parseInt(data.slaveId.replace('ws-', ''), 10);
          sendToTerminalClient(ttyId, data);
        } else {
          io.to(data.slaveId).emit('bridge:slave-render', {
            history: data.history,
            currentPath: data.currentPath,
            username: data.username,
            tty: data.tty,
            isTopActive: data.isTopActive,
            topData: data.topData,
            isTrapped: data.isTrapped,
            trapDetails: data.trapDetails
          });
        }
      }
    });

    // Trigger Trap Exception from Master to Slave
    socket.on('bridge:trigger-trap', (data) => {
      if (data.slaveId) {
        if (typeof data.slaveId === 'string' && data.slaveId.startsWith('ws-')) {
          const ttyId = parseInt(data.slaveId.replace('ws-', ''), 10);
          const slaveEntry = activeSlaves.get(data.slaveId);
          if (slaveEntry) {
            slaveEntry.isTrapped = true;
            slaveEntry.trapDetails = {
              trapType: data.trapType,
              trapMessage: data.trapMessage
            };
          }
          sendTrapToTerminalClient(ttyId, data.trapType, data.trapMessage);
        } else {
          io.to(data.slaveId).emit('bridge:trap-triggered', {
            trapType: data.trapType,
            trapMessage: data.trapMessage
          });
        }
      }
    });

    // Resolve Trap Exception from Master to Slave
    socket.on('bridge:resolve-trap', (data) => {
      if (data.slaveId) {
        if (typeof data.slaveId === 'string' && data.slaveId.startsWith('ws-')) {
          const ttyId = parseInt(data.slaveId.replace('ws-', ''), 10);
          const slaveEntry = activeSlaves.get(data.slaveId);
          if (slaveEntry) {
            slaveEntry.isTrapped = false;
            slaveEntry.trapDetails = null;
          }
          const ws = ttyClients.get(ttyId);
          if (ws && ws.readyState === 1) {
            ws.send(JSON.stringify({
              type: 'TTY_OUTPUT',
              tty: ttyId,
              data: '\r\n\x1b[1;32m🟢 SYSTEM RECOVERY EXCEPTION VECTOR DISPATCHED. State quarantine lifted.\x1b[0m\r\n'
            }));
          }
        } else {
          io.to(data.slaveId).emit('bridge:trap-resolved');
        }
      }
    });

    socket.on('glasstcp:register', (nodeData) => {
      activeNodes.set(socket.id, {
        id: socket.id,
        socketId: socket.id,
        hostname: nodeData.hostname,
        ip: nodeData.ip,
        services: nodeData.services || ['GlassTCP'],
        status: 'online',
        isAuthorized: true
      });
      io.emit('glasstcp:nodes', Array.from(activeNodes.values()));
    });

    socket.on('glasstcp:send_packet', (packet) => {
      // Send to destination if it is a real socket
      const destNode = Array.from(activeNodes.values()).find(n => n.hostname === packet.destination || n.ip === packet.destination);
      if (destNode && destNode.socketId) {
        io.to(destNode.socketId).emit('glasstcp:receive_packet', packet);
      }
      // Also broadcast for visual logging in other users' NOC Centers
      socket.broadcast.emit('glasstcp:traffic', packet);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      activeNodes.delete(socket.id);
      io.emit('glasstcp:nodes', Array.from(activeNodes.values()));

      if (activeSlaves.has(socket.id)) {
        activeSlaves.delete(socket.id);
        if (masterSocketId) {
          io.to(masterSocketId).emit('bridge:slaves-list', Array.from(activeSlaves.values()));
        }
      }
      
      if (socket.id === masterSocketId) {
        masterSocketId = null;
        io.emit('bridge:master-changed', { masterId: null, online: false });
      }
    });
  });

  // Middleware for API Authentication
  const apiAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.headers['x-glass-token'];
    const systemToken = process.env.STORAGE_ACCESS_TOKEN || 'glass_os_core_token_2026';
    if (token !== systemToken) {
      return res.status(401).json({ error: 'Unauthorized Access: Invalid System Token' });
    }
    next();
  };

  // API Routes
  app.get('/api/status', (req, res) => {
    res.json({ status: 'online', service: 'GlassOS Persistence Engine', clients: io.engine.clientsCount });
  });

  app.get('/api/storage', apiAuth, async (req, res) => {
    const data = await fs.readFile(DB_FILE, 'utf-8');
    res.json(JSON.parse(data));
  });

  app.post('/api/storage', apiAuth, async (req, res) => {
    try {
      const currentData = JSON.parse(await fs.readFile(DB_FILE, 'utf-8'));
      // Basic schema validation
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Invalid Payload' });
      }
      const newData = { ...currentData, ...req.body };
      await fs.writeFile(DB_FILE, JSON.stringify(newData, null, 2));
      
      // Broadcast update to all other clients
      const senderId = req.headers['x-socket-id'] as string;
      if (senderId) {
        io.except(senderId).emit('storage:updated', { timestamp: Date.now() });
      } else {
        io.emit('storage:updated', { timestamp: Date.now() });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save data' });
    }
  });

  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Invalid or missing messages array' });
      }

      // Generate response offline using our deterministic heuristic rules
      const responseText = generateHeuristicResponse(messages);
      res.json({ text: responseText });
    } catch (error: any) {
      console.error("Local Assistant Error:", error);
      res.status(500).json({ error: error.message || 'Failed to generate response' });
    }
  });

  // Vite Middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`GlassOS Server running on http://localhost:${PORT}`);
  });
}

startServer();
