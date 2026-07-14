import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Network, Radio, Activity, Compass, Shield, Cpu, 
  FileText, Send, Zap, Check, AlertCircle, ArrowLeftRight, 
  Globe, Server, Lock, Unlock, Database, RefreshCw, X, Play, Pause,
  Terminal, Layers, Monitor, ChevronRight, Plus, Trash2, Sliders
} from 'lucide-react';
import { FileSystemItem } from '../types';

interface GlassTCPProps {
  socket: any;
  fs: FileSystemItem[];
  setFs: React.Dispatch<React.SetStateAction<FileSystemItem[]>>;
  addNotification: (app: string, message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
  currentUser: any;
  networkConfig: any;
  networkNodes: any[];
  setNetworkNodes: React.Dispatch<React.SetStateAction<any[]>>;
  networkTraffic: any[];
  setNetworkTraffic: React.Dispatch<React.SetStateAction<any[]>>;
  openWindow: (id: string, title?: string) => void;
}

interface NodeLocation {
  id: string;
  name: string;
  ip: string;
  x: number; // percentage coordinate for map SVG
  y: number; // percentage coordinate for map SVG
  isBot: boolean;
}

interface TcpPacket {
  id: string;
  source: string;
  sourceIp: string;
  destination: string;
  destIp: string;
  sourcePort: number;
  destPort: number;
  seq: number;
  ack: number;
  flags: {
    syn: boolean;
    ack: boolean;
    psh: boolean;
    fin: boolean;
  };
  payload: string;
  fileName?: string;
  size: string;
  timestamp: string;
  status: 'routed' | 'failed' | 'handshake';
}

interface ActiveConnection {
  id: string;
  nodeName: string;
  ip: string;
  state: 'CLOSED' | 'SYN_SENT' | 'SYN_RECEIVED' | 'ESTABLISHED' | 'FIN_WAIT_1' | 'FIN_WAIT_2' | 'TIME_WAIT';
  sourcePort: number;
  destPort: number;
  seq: number;
  ack: number;
}

interface TenantRoute {
  id: string;
  name: string;
  subdomain: string;
  ingressLanes: number;
  activeConnections: number;
  bandwidthLimit: string;
  priority: 'critical' | 'high' | 'standard';
  ingressQueuePressure: number;
}

interface AsyncFilterRule {
  id: string;
  pattern: string;
  action: 'DROP' | 'SANDBOX' | 'PASS' | 'DECRYPT';
  isActive: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  matchesCount: number;
}

interface SandboxFault {
  id: string;
  timestamp: string;
  triggerSource: string;
  payloadSnippet: string;
  faultType: string;
  isolationStatus: 'quarantined' | 'analyzed' | 'purged';
}

const DEFAULT_LOCATIONS: NodeLocation[] = [
  { id: 'loc-tokyo', name: 'Neo-Tokyo Core', ip: '192.168.1.50', x: 80, y: 45, isBot: true },
  { id: 'loc-silicon', name: 'Silicon-Valley HQ', ip: '192.168.1.12', x: 20, y: 35, isBot: true },
  { id: 'loc-zurich', name: 'Zurich Backbone', ip: '192.168.1.200', x: 50, y: 25, isBot: true },
  { id: 'loc-london', name: 'London-Gate', ip: '192.168.1.75', x: 45, y: 20, isBot: true },
  { id: 'loc-singapore', name: 'Singapore-Hub', ip: '192.168.1.150', x: 72, y: 70, isBot: true },
  { id: 'loc-sydney', name: 'Sydney-Terminal', ip: '192.168.1.90', x: 88, y: 85, isBot: true },
  { id: 'loc-paris', name: 'Paris-Gateway', ip: '192.168.1.110', x: 48, y: 24, isBot: true }
];

export function GlassTCP({
  socket, fs, setFs, addNotification, currentUser,
  networkConfig, networkNodes, setNetworkNodes,
  networkTraffic, setNetworkTraffic, openWindow
}: GlassTCPProps) {
  // Local identity selection
  const [selectedLocation, setSelectedLocation] = useState<NodeLocation>(DEFAULT_LOCATIONS[1]); // Default to Silicon Valley
  const [localIp, setLocalIp] = useState(networkConfig?.ip || '192.168.1.104');
  const [localHostname, setLocalHostname] = useState(currentUser?.username ? `${currentUser.username}-station.local` : 'glass-workstation.local');

  // Node coordination
  const [nodes, setNodes] = useState<NodeLocation[]>(DEFAULT_LOCATIONS);
  const [activeClients, setActiveClients] = useState<any[]>([]);
  const [selectedTargetNode, setSelectedTargetNode] = useState<string>('loc-tokyo');

  // TCP Protocol states
  const [connections, setConnections] = useState<Record<string, ActiveConnection>>({});
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>(['[System] GlassTCP Core Engine initialized.', '[System] Awaiting link synchronization...']);
  
  // Real-time Traffic Multi-location wave
  const [isWaveActive, setIsWaveActive] = useState(false);
  const [packetVisuals, setPacketVisuals] = useState<Array<{ id: string; fromX: number; fromY: number; toX: number; toY: number; color: string; duration: number }>>([]);
  const [selectedPacket, setSelectedPacket] = useState<TcpPacket | null>(null);

  // File sending selection
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [messageText, setMessageText] = useState('');

  // Native Transport Layer Matrix & Socket Bridge States
  const [subTab, setSubTab] = useState<'topology' | 'matrix' | 'firewall'>('topology');
  const [socketBridgeMode, setSocketBridgeMode] = useState<'low-bit' | 'high-bit' | 'balanced'>('balanced');
  const [lowBitActive, setLowBitActive] = useState<boolean>(true);
  const [highBitActive, setHighBitActive] = useState<boolean>(true);
  const [tenants, setTenants] = useState<TenantRoute[]>([
    { id: 'ten-devops', name: 'DevOps Sentinel Logs', subdomain: 'devops.core.glass', ingressLanes: 12, activeConnections: 184, bandwidthLimit: '500 Mbps', priority: 'critical', ingressQueuePressure: 32 },
    { id: 'ten-holo', name: 'Holographic Stream Engine', subdomain: 'holo.pipeline.glass', ingressLanes: 32, activeConnections: 1240, bandwidthLimit: '5.0 Gbps', priority: 'high', ingressQueuePressure: 58 },
    { id: 'ten-db', name: 'Virtual Replica DB Mirror', subdomain: 'db-sync.replica.glass', ingressLanes: 8, activeConnections: 45, bandwidthLimit: '100 Mbps', priority: 'standard', ingressQueuePressure: 15 }
  ]);

  // Firewall Asynchronous Filtering & Fault Isolation States
  const [firewallActive, setFirewallActive] = useState<boolean>(true);
  const [asyncFilters, setAsyncFilters] = useState<AsyncFilterRule[]>([
    { id: 'flt-udp', pattern: 'UDP Flood / Port Scanner Block', action: 'DROP', isActive: true, severity: 'high', matchesCount: 142 },
    { id: 'flt-sandbox', pattern: 'Sandbox Executable Payloads (.elf/.bin)', action: 'SANDBOX', isActive: true, severity: 'critical', matchesCount: 24 },
    { id: 'flt-whitelist', pattern: 'Enforce Trusted Peer Whitelisting', action: 'PASS', isActive: false, severity: 'medium', matchesCount: 0 },
    { id: 'flt-dec', pattern: 'Asynchronous TLS Inspection Decryptor', action: 'DECRYPT', isActive: true, severity: 'low', matchesCount: 89 }
  ]);
  const [sandboxFaults, setSandboxFaults] = useState<SandboxFault[]>([
    { id: 'fault-01', timestamp: '19:12:04', triggerSource: '192.168.1.50 (Tokyo)', payloadSnippet: '0xEB 0x04 OVERFLOW PATH=/bin/sh', faultType: 'Ring-0 Buffer Poisoning', isolationStatus: 'quarantined' },
    { id: 'fault-02', timestamp: '19:15:33', triggerSource: '192.168.1.75 (London)', payloadSnippet: 'SYN ACK SWARM PORT_SWEEP_FAST', faultType: 'Asynchronous Ingress Overflow', isolationStatus: 'quarantined' }
  ]);
  const [newFilterPattern, setNewFilterPattern] = useState<string>('');
  const [newFilterAction, setNewFilterAction] = useState<'DROP' | 'SANDBOX' | 'PASS' | 'DECRYPT'>('DROP');
  const [isInjectingFault, setIsInjectingFault] = useState<boolean>(false);

  const mapRef = useRef<HTMLDivElement>(null);

  // Convert string to hex matrix representation
  const stringToHexMatrix = (str: string) => {
    const hexArr = [];
    for (let i = 0; i < str.length; i++) {
      hexArr.push(str.charCodeAt(i).toString(16).toUpperCase().padStart(2, '0'));
    }
    // group by 8 bytes
    const rows = [];
    for (let i = 0; i < hexArr.length; i += 8) {
      const bytes = hexArr.slice(i, i + 8);
      const address = (i).toString(16).toUpperCase().padStart(4, '0');
      const hexStr = bytes.join(' ');
      const asciiStr = str.slice(i, i + 8).replace(/[^\x20-\x7E]/g, '.');
      rows.push({ address, hex: hexStr.padEnd(23, ' '), ascii: asciiStr });
    }
    return rows;
  };

  const logToTerminal = useCallback((msg: string) => {
    setTerminalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-80));
  }, []);

  // Register local node on load/change
  useEffect(() => {
    if (socket) {
      socket.emit('glasstcp:register', {
        hostname: localHostname,
        ip: localIp,
        services: ['GlassTCP', 'GlassDrive', 'NOC-Router']
      });
      logToTerminal(`Registered local network node as ${localHostname} (${localIp})`);
    }
  }, [socket, localHostname, localIp, logToTerminal]);

  // Socket event listening
  useEffect(() => {
    if (!socket) return;

    const handleClientsUpdate = (clientNodes: any[]) => {
      // Filter out self and update active client list
      const remoteClients = clientNodes.filter(n => n.socketId !== socket.id);
      setActiveClients(remoteClients);
    };

    const handleReceivePacket = (packet: TcpPacket) => {
      // Find source coordinate or assign default
      const sourceNode = nodes.find(n => n.name === packet.source || n.ip === packet.sourceIp);
      const destNode = selectedLocation;

      if (sourceNode && destNode) {
        triggerPacketAnimation(sourceNode.x, sourceNode.y, destNode.x, destNode.y, '#10B981'); // Emerald for real incoming
      }

      // Append to local traffic stream
      setNetworkTraffic(prev => [packet, ...prev].slice(0, 50));

      // Handle custom TCP state transition based on flags
      const connId = packet.source;
      const currentConn = connections[connId];

      if (packet.flags.syn && !packet.flags.ack) {
        // SYN received: Reply with SYN-ACK
        logToTerminal(`GlassTCP: Received SYN from ${packet.source}. initiating handshake.`);
        const replyPacket = generatePacket(destNode, sourceNode, 49152, packet.sourcePort, Math.floor(Math.random() * 10000), packet.seq + 1, { syn: true, ack: true, psh: false, fin: false }, 'Handshake SYN-ACK');
        
        setConnections(prev => ({
          ...prev,
          [connId]: {
            id: connId,
            nodeName: packet.source,
            ip: packet.sourceIp,
            state: 'SYN_RECEIVED',
            sourcePort: packet.destPort,
            destPort: packet.sourcePort,
            seq: replyPacket.seq,
            ack: packet.seq + 1
          }
        }));

        setTimeout(() => {
          socket.emit('glasstcp:send_packet', replyPacket);
          logToTerminal(`GlassTCP: Sent SYN-ACK to ${packet.source} (Seq=${replyPacket.seq}, Ack=${replyPacket.ack})`);
          triggerPacketAnimation(destNode.x, destNode.y, sourceNode.x, sourceNode.y, '#3B82F6'); // Blue for outgoing
        }, 1000);

      } else if (packet.flags.syn && packet.flags.ack) {
        // SYN-ACK received in reply to our SYN
        if (currentConn && currentConn.state === 'SYN_SENT') {
          logToTerminal(`GlassTCP: Received SYN-ACK from ${packet.source}. Connection established!`);
          
          const ackPacket = generatePacket(destNode, sourceNode, currentConn.sourcePort, currentConn.destPort, packet.ack, packet.seq + 1, { syn: false, ack: true, psh: false, fin: false }, 'Handshake ACK');
          
          setConnections(prev => ({
            ...prev,
            [connId]: {
              ...prev[connId],
              state: 'ESTABLISHED',
              seq: ackPacket.seq,
              ack: packet.seq + 1
            }
          }));

          socket.emit('glasstcp:send_packet', ackPacket);
          logToTerminal(`GlassTCP: Sent ACK to ${packet.source}. Link fully established.`);
          addNotification('GlassTCP', `Connection established with ${packet.source}`, 'success');
          setActiveSession(connId);
        }

      } else if (packet.flags.ack && !packet.flags.syn && !packet.flags.psh && !packet.flags.fin) {
        // ACK received
        if (currentConn && currentConn.state === 'SYN_RECEIVED') {
          logToTerminal(`GlassTCP: Received ACK from ${packet.source}. Connection fully ESTABLISHED!`);
          setConnections(prev => ({
            ...prev,
            [connId]: {
              ...prev[connId],
              state: 'ESTABLISHED'
            }
          }));
          addNotification('GlassTCP', `Incoming link established from ${packet.source}`, 'success');
          setActiveSession(connId);
        }

      } else if (packet.flags.psh) {
        // Data packet received
        logToTerminal(`GlassTCP: Received data segment from ${packet.source} (Size: ${packet.size}, Seq=${packet.seq})`);
        
        // Handle file transmissions (the strength of glassOS!)
        if (packet.fileName && packet.payload) {
          addNotification('GlassTCP', `Reassembling incoming file: ${packet.fileName} (${packet.size})`, 'info');
          
          // Re-assemble and write file directly to glassOS filesystem!
          const newFile: FileSystemItem = {
            name: packet.fileName,
            content: packet.payload,
            type: 'file',
            size: typeof packet.size === 'number' ? packet.size : (parseInt(packet.size) || 0),
            dateModified: new Date().toLocaleDateString(),
            permissions: {
              owner: { r: true, w: true, x: false },
              group: { r: true, w: false, x: false },
              others: { r: true, w: false, x: false }
            }
          };

          setFs((prev: FileSystemItem[]) => {
            // Put in GlassTCP folder or root if not exists
            const folderName = 'GlassTCP Downloads';
            const existingFolder = prev.find(item => item.name === folderName && item.children);
            
            if (existingFolder) {
              return prev.map(item => {
                if (item.name === folderName && item.children) {
                  return {
                    ...item,
                    children: [...item.children.filter(f => f.name !== newFile.name), newFile]
                  };
                }
                return item;
              });
            } else {
              // Create folder
              const newFolder: FileSystemItem = {
                name: folderName,
                type: 'folder',
                children: [newFile],
                permissions: {
                  owner: { r: true, w: true, x: true },
                  group: { r: true, w: false, x: true },
                  others: { r: true, w: false, x: true }
                }
              };
              return [...prev, newFolder];
            }
          });

          addNotification('GlassTCP', `Saved file: ${packet.fileName} to "GlassTCP Downloads"`, 'success');
          logToTerminal(`[Reassembly Success] File written to /GlassTCP Downloads/${packet.fileName}`);
        } else {
          // Regular text message
          addNotification('GlassTCP', `${packet.source}: ${packet.payload}`, 'info');
        }

        // Return ACK
        const ackPacket = generatePacket(destNode, sourceNode, packet.destPort, packet.sourcePort, packet.ack, packet.seq + (packet.payload?.length || 1), { syn: false, ack: true, psh: false, fin: false }, 'ACK Data');
        socket.emit('glasstcp:send_packet', ackPacket);

      } else if (packet.flags.fin) {
        logToTerminal(`GlassTCP: Received FIN teardown request from ${packet.source}`);
        setConnections(prev => {
          const next = { ...prev };
          delete next[connId];
          return next;
        });
        if (activeSession === connId) setActiveSession(null);
        addNotification('GlassTCP', `Connection closed by ${packet.source}`, 'warning');
      }
    };

    const handleBroadcastTraffic = (packet: TcpPacket) => {
      // Draw background packets flying across map from broadcast channel
      const sourceNode = nodes.find(n => n.name === packet.source || n.ip === packet.sourceIp);
      const destNode = nodes.find(n => n.name === packet.destination || n.ip === packet.destIp);
      if (sourceNode && destNode) {
        triggerPacketAnimation(sourceNode.x, sourceNode.y, destNode.x, destNode.y, '#8B5CF6'); // Purple for broadcast
      }
      setNetworkTraffic(prev => [packet, ...prev].slice(0, 50));
    };

    socket.on('glasstcp:nodes', handleClientsUpdate);
    socket.on('glasstcp:receive_packet', handleReceivePacket);
    socket.on('glasstcp:traffic', handleBroadcastTraffic);

    return () => {
      socket.off('glasstcp:nodes', handleClientsUpdate);
      socket.off('glasstcp:receive_packet', handleReceivePacket);
      socket.off('glasstcp:traffic', handleBroadcastTraffic);
    };
  }, [socket, nodes, selectedLocation, connections, activeSession, logToTerminal, setNetworkTraffic, setFs, addNotification]);

  // Helper to generate a standardized TCP segment packet
  const generatePacket = (
    src: NodeLocation | { name: string, ip: string, x: number, y: number },
    dest: NodeLocation | { name: string, ip: string, x: number, y: number },
    srcPort: number,
    destPort: number,
    seq: number,
    ack: number,
    flags: { syn: boolean, ack: boolean, psh: boolean, fin: boolean },
    payload: string,
    fileName?: string
  ): TcpPacket => {
    return {
      id: Math.random().toString(36).substr(2, 9),
      source: src.name,
      sourceIp: src.ip,
      destination: dest.name,
      destIp: dest.ip,
      sourcePort: srcPort,
      destPort: destPort,
      seq,
      ack,
      flags,
      payload,
      fileName,
      size: `${(payload.length * 0.001).toFixed(3)} KB`,
      timestamp: new Date().toLocaleTimeString(),
      status: 'routed'
    };
  };

  // Triggers visual fly-packet line effect
  const triggerPacketAnimation = (fromX: number, fromY: number, toX: number, toY: number, color: string = '#3B82F6') => {
    const pId = Math.random().toString();
    setPacketVisuals(prev => [...prev, { id: pId, fromX, fromY, toX, toY, color, duration: 1.5 }]);
    setTimeout(() => {
      setPacketVisuals(prev => prev.filter(p => p.id !== pId));
    }, 1600);
  };

  // Generate simultaneous stress wave of background multi-location packets
  useEffect(() => {
    if (!isWaveActive) return;

    const interval = setInterval(() => {
      // Pick random source and destination from list of default locations
      const availableNodes = DEFAULT_LOCATIONS;
      const sIdx = Math.floor(Math.random() * availableNodes.length);
      let dIdx = Math.floor(Math.random() * availableNodes.length);
      while (dIdx === sIdx) {
        dIdx = Math.floor(Math.random() * availableNodes.length);
      }

      const src = availableNodes[sIdx];
      const dest = availableNodes[dIdx];

      const payloads = [
        'GET /index.html HTTP/1.1',
        '200 OK - GlassFS Sync Complete',
        'SYN connection probe on service layer',
        'XMPP routing table update',
        'Heartbeat signal ping',
        'Storage replica block hash verification',
        'gRPC remote process invocation'
      ];

      const packet = generatePacket(
        src, dest, 
        Math.floor(Math.random() * 16383) + 49152,
        Math.random() > 0.5 ? 443 : 80,
        Math.floor(Math.random() * 500000),
        Math.floor(Math.random() * 500000),
        { syn: false, ack: true, psh: true, fin: false },
        payloads[Math.floor(Math.random() * payloads.length)]
      );

      // Trigger animation locally
      triggerPacketAnimation(src.x, src.y, dest.x, dest.y, '#F59E0B'); // Orange for active multi-node simulation
      
      // Add packet to general NOC traffic stream
      setNetworkTraffic(prev => [packet, ...prev].slice(0, 50));

      // Emit over socket so other parallel users see the background waves and traffic!
      if (socket) {
        socket.emit('glasstcp:send_packet', packet);
      }
    }, 600); // 600ms stream interval for active stream experience

    return () => clearInterval(interval);
  }, [isWaveActive, socket, setNetworkTraffic]);

  // Establish TCP 3-way handshake with target node
  const initiateHandshake = (target: NodeLocation | any) => {
    const targetId = target.name || target.hostname;
    const targetIp = target.ip;
    const srcPort = Math.floor(Math.random() * 16383) + 49152;
    const destPort = 80; // HTTP / Service Port
    const clientSeq = Math.floor(Math.random() * 100000);

    logToTerminal(`[SYN] Initiating GlassTCP 3-way handshake with node ${targetId} (${targetIp})`);
    
    // Create new connection object in SYN_SENT state
    setConnections(prev => ({
      ...prev,
      [targetId]: {
        id: targetId,
        nodeName: targetId,
        ip: targetIp,
        state: 'SYN_SENT',
        sourcePort: srcPort,
        destPort,
        seq: clientSeq,
        ack: 0
      }
    }));

    const synPacket = generatePacket(
      selectedLocation,
      { name: targetId, ip: targetIp, x: target.x || 50, y: target.y || 50 },
      srcPort,
      destPort,
      clientSeq,
      0,
      { syn: true, ack: false, psh: false, fin: false },
      'Connection SYN Probe'
    );

    // Send packet
    if (socket) {
      socket.emit('glasstcp:send_packet', synPacket);
      triggerPacketAnimation(selectedLocation.x, selectedLocation.y, target.x || 50, target.y || 50, '#3B82F6'); // Blue outgoing SYN
    }

    // Bot Auto-Response mechanism if target is a Bot/Simulated node!
    if (target.isBot) {
      setTimeout(() => {
        logToTerminal(`GlassTCP: Simulated SYN-ACK response from ${targetId}`);
        
        const synAckPacket = generatePacket(
          target,
          selectedLocation,
          destPort,
          srcPort,
          Math.floor(Math.random() * 50000),
          clientSeq + 1,
          { syn: true, ack: true, psh: false, fin: false },
          'Handshake SYN-ACK Response'
        );

        triggerPacketAnimation(target.x, target.y, selectedLocation.x, selectedLocation.y, '#10B981'); // Emerald incoming SYN-ACK
        
        // Emulate receiving SYN-ACK
        setTimeout(() => {
          // Send back ultimate ACK
          logToTerminal(`GlassTCP: Connection ESTABLISHED with simulated bot node ${targetId}!`);
          setConnections(prev => ({
            ...prev,
            [targetId]: {
              id: targetId,
              nodeName: targetId,
              ip: targetIp,
              state: 'ESTABLISHED',
              sourcePort: srcPort,
              destPort,
              seq: clientSeq + 1,
              ack: synAckPacket.seq + 1
            }
          }));
          setActiveSession(targetId);
          addNotification('GlassTCP', `Connected to simulated node: ${targetId}`, 'success');

          const ackPacket = generatePacket(
            selectedLocation,
            target,
            srcPort,
            destPort,
            clientSeq + 1,
            synAckPacket.seq + 1,
            { syn: false, ack: true, psh: false, fin: false },
            'Handshake ACK Finalize'
          );
          
          if (socket) {
            socket.emit('glasstcp:send_packet', ackPacket);
          }
          triggerPacketAnimation(selectedLocation.x, selectedLocation.y, target.x, target.y, '#3B82F6');
        }, 500);

      }, 1200);
    }
  };

  // Close TCP link (Teardown handshake)
  const terminateConnection = (targetId: string) => {
    const conn = connections[targetId];
    if (!conn) return;

    logToTerminal(`[FIN] Closing connection socket with ${targetId}...`);
    
    // Find coordinate
    const targetNode = DEFAULT_LOCATIONS.find(n => n.name === targetId) || activeClients.find(n => n.hostname === targetId);
    
    const finPacket = generatePacket(
      selectedLocation,
      { name: targetId, ip: conn.ip, x: targetNode?.x || 50, y: targetNode?.y || 50 },
      conn.sourcePort,
      conn.destPort,
      conn.seq,
      conn.ack,
      { syn: false, ack: true, psh: false, fin: true },
      'Teardown FIN segment'
    );

    if (socket) {
      socket.emit('glasstcp:send_packet', finPacket);
      if (targetNode) {
        triggerPacketAnimation(selectedLocation.x, selectedLocation.y, targetNode.x || 50, targetNode.y || 50, '#EF4444'); // Red for FIN
      }
    }

    setConnections(prev => {
      const next = { ...prev };
      delete next[targetId];
      return next;
    });

    if (activeSession === targetId) {
      setActiveSession(null);
    }

    logToTerminal(`GlassTCP: Session with ${targetId} cleanly closed (FIN-ACK handshake complete).`);
    addNotification('GlassTCP', `Disconnected from ${targetId}`, 'info');
  };

  // Send regular text message or data segment
  const sendTcpData = () => {
    if (!activeSession || !messageText.trim()) return;

    const conn = connections[activeSession];
    const targetNode = DEFAULT_LOCATIONS.find(n => n.name === activeSession) || activeClients.find(n => n.hostname === activeSession);

    if (!conn || !targetNode) return;

    logToTerminal(`[PSH] Encapsulating TCP Data payload segment to send to ${activeSession}`);

    const payloadPacket = generatePacket(
      selectedLocation,
      { name: activeSession, ip: conn.ip, x: targetNode.x || 50, y: targetNode.y || 50 },
      conn.sourcePort,
      conn.destPort,
      conn.seq,
      conn.ack,
      { syn: false, ack: true, psh: true, fin: false },
      messageText
    );

    // Update local connection state seq
    setConnections(prev => ({
      ...prev,
      [activeSession]: {
        ...prev[activeSession],
        seq: conn.seq + messageText.length
      }
    }));

    if (socket) {
      socket.emit('glasstcp:send_packet', payloadPacket);
    }

    triggerPacketAnimation(selectedLocation.x, selectedLocation.y, targetNode.x || 50, targetNode.y || 50, '#10B981'); // Emerald for PSH message
    setMessageText('');

    // If bot, simulate auto message response back!
    if (targetNode.isBot) {
      setTimeout(() => {
        const botReplies = [
          `Acknowledge segment received. CRC 32 Verification successful.`,
          `Node echo: "${messageText.toUpperCase()}"`,
          `Transmission latency recorded at 42ms. System load nominal.`,
          `Data verified and synchronized to regional virtual replica database.`
        ];
        const replyText = botReplies[Math.floor(Math.random() * botReplies.length)];

        logToTerminal(`GlassTCP: Received response payload from bot ${activeSession}`);
        
        const replyPacket = generatePacket(
          targetNode,
          selectedLocation,
          conn.destPort,
          conn.sourcePort,
          conn.ack,
          conn.seq + messageText.length,
          { syn: false, ack: true, psh: true, fin: false },
          replyText
        );

        triggerPacketAnimation(targetNode.x, targetNode.y, selectedLocation.x, selectedLocation.y, '#3B82F6');
        
        setConnections(prev => ({
          ...prev,
          [activeSession]: {
            ...prev[activeSession],
            ack: replyPacket.seq + replyText.length
          }
        }));

        // Trigger local display
        setNetworkTraffic(prev => [replyPacket, ...prev].slice(0, 50));
        addNotification('GlassTCP', `${activeSession}: ${replyText}`, 'info');
      }, 1500);
    }
  };

  // Select file from GlassOS file tree to transmit as TCP packet! (strength of glassOS!)
  const sendFileOverTcp = (item: FileSystemItem) => {
    if (!activeSession || !item.content) return;

    const conn = connections[activeSession];
    const targetNode = DEFAULT_LOCATIONS.find(n => n.name === activeSession) || activeClients.find(n => n.hostname === activeSession);

    if (!conn || !targetNode) return;

    logToTerminal(`[DATA] Segmenting file "${item.name}" into GlassTCP stream packets...`);
    
    // Construct single packet with file attachment properties
    const filePacket = generatePacket(
      selectedLocation,
      { name: activeSession, ip: conn.ip, x: targetNode.x || 50, y: targetNode.y || 50 },
      conn.sourcePort,
      conn.destPort,
      conn.seq,
      conn.ack,
      { syn: false, ack: true, psh: true, fin: false },
      item.content,
      item.name
    );

    setConnections(prev => ({
      ...prev,
      [activeSession]: {
        ...prev[activeSession],
        seq: conn.seq + (item.content?.length || 1)
      }
    }));

    if (socket) {
      socket.emit('glasstcp:send_packet', filePacket);
    }

    triggerPacketAnimation(selectedLocation.x, selectedLocation.y, targetNode.x || 50, targetNode.y || 50, '#8B5CF6'); // Deep purple file stream packet
    logToTerminal(`[GlassTCP] File packet emitted safely! Payload length: ${item.content.length} characters.`);
    addNotification('GlassTCP', `Transmitted file "${item.name}" over GlassTCP Tunnel`, 'success');
    setShowFilePicker(false);
  };

  // Set local identity coordinates based on location selection
  const handleLocationChange = (locId: string) => {
    const loc = DEFAULT_LOCATIONS.find(l => l.id === locId);
    if (!loc) return;
    setSelectedLocation(loc);
    setLocalIp(loc.ip);
    logToTerminal(`Updated local node coordinates to ${loc.name} IP: ${loc.ip}`);
  };

  // Live simulation loop for multi-tenant queue pressure and filter matches
  useEffect(() => {
    const interval = setInterval(() => {
      setTenants(prev => prev.map(t => {
        // Vary queue pressure slightly
        const variance = Math.floor(Math.random() * 7) - 3;
        let nextPressure = t.ingressQueuePressure + variance;
        if (nextPressure < 5) nextPressure = 5;
        if (nextPressure > 95) nextPressure = 95;

        // If isWaveActive is on, add a higher baseline
        if (isWaveActive) {
          nextPressure = Math.min(95, nextPressure + Math.floor(Math.random() * 5));
        }

        return {
          ...t,
          ingressQueuePressure: nextPressure,
          activeConnections: t.activeConnections + (Math.random() > 0.6 ? (Math.random() > 0.5 ? 2 : -2) : 0)
        };
      }));

      // Increment matches for active filters
      setAsyncFilters(prev => prev.map(f => {
        if (f.isActive && Math.random() > 0.7) {
          return {
            ...f,
            matchesCount: f.matchesCount + Math.floor(Math.random() * 3) + 1
          };
        }
        return f;
      }));
    }, 2500);

    return () => clearInterval(interval);
  }, [isWaveActive]);

  // Adjust tenant lanes
  const handleTenantLanesChange = (id: string, change: number) => {
    setTenants(prev => prev.map(t => {
      if (t.id === id) {
        const nextLanes = Math.max(1, Math.min(128, t.ingressLanes + change));
        logToTerminal(`SADF Matrix: Modified Ingress Lanes for tenant ${t.name} to ${nextLanes}`);
        return { ...t, ingressLanes: nextLanes };
      }
      return t;
    }));
  };

  // Simulate traffic burst on a tenant
  const handleTenantBurst = (id: string) => {
    setTenants(prev => prev.map(t => {
      if (t.id === id) {
        logToTerminal(`SADF Matrix: Initiated concurrent ingress burst for tenant ${t.name}. Handshaking routes...`);
        addNotification('NOC Router', `Tenant burst simulation active for ${t.subdomain}`, 'info');
        return {
          ...t,
          ingressQueuePressure: Math.min(98, t.ingressQueuePressure + 35),
          activeConnections: t.activeConnections + 50
        };
      }
      return t;
    }));
  };

  // Toggle filter rule active state
  const handleToggleFilterRule = (id: string) => {
    setAsyncFilters(prev => prev.map(f => {
      if (f.id === id) {
        const nextState = !f.isActive;
        logToTerminal(`Firewall: Filter rule "${f.pattern}" set to ${nextState ? 'ACTIVE' : 'INACTIVE'}`);
        return { ...f, isActive: nextState };
      }
      return f;
    }));
  };

  // Add a new filter rule
  const handleCreateFilterRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilterPattern.trim()) return;

    const newRule: AsyncFilterRule = {
      id: `flt-${Math.random().toString(36).substr(2, 4)}`,
      pattern: newFilterPattern,
      action: newFilterAction,
      isActive: true,
      severity: newFilterAction === 'DROP' ? 'high' : newFilterAction === 'SANDBOX' ? 'critical' : 'medium',
      matchesCount: 0
    };

    setAsyncFilters(prev => [...prev, newRule]);
    setNewFilterPattern('');
    logToTerminal(`Firewall: Created asynchronous filtering rule for: ${newRule.pattern}`);
    addNotification('Firewall', 'New firewall security rule deployed', 'success');
  };

  // Delete filter rule
  const handleDeleteFilterRule = (id: string) => {
    setAsyncFilters(prev => {
      const target = prev.find(f => f.id === id);
      if (target) {
        logToTerminal(`Firewall: Revoked security rule "${target.pattern}"`);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  // Inject a malicious/anomalous payload and watch Asynchronous Filtering & Fault Isolation capture it!
  const handleInjectFault = () => {
    if (isInjectingFault) return;
    setIsInjectingFault(true);

    const targetIps = ['192.168.1.110 (Paris)', '192.168.1.200 (Zurich)', '104.28.19.12 (External Cloud)'];
    const selectedSrc = targetIps[Math.floor(Math.random() * targetIps.length)];
    
    logToTerminal(`[INGRESS WARNING] Unauthorized Socket packet detected from ${selectedSrc}`);

    setTimeout(() => {
      logToTerminal(`[FIREWALL EVENT] Asynchronous filtering engine intercepts anomalous socket descriptor.`);
      
      setTimeout(() => {
        const payloadExploits = [
          '0x90 0x90 0x90 NOP_SLIDE OVERRUN_PTR',
          'MALICIOUS_ELF_EXEC_RING3_ESCALATION',
          'FAST_INGRESS_QUEUE_STALL_FLOOD',
          'SQL_INJECTION OR 1=1 UNION_DROP_SYS_TABLES'
        ];
        const selectedExploit = payloadExploits[Math.floor(Math.random() * payloadExploits.length)];
        
        const faultTypes = [
          'Memory Corruption Payload',
          'Unauthorized Binary Sandbox Escape',
          'Concurrency Queue Flooder',
          'Dynamic Query Sanitizer Violation'
        ];
        const selectedFaultType = faultTypes[Math.floor(Math.random() * faultTypes.length)];

        // Increment the Sandbox rule matches count
        setAsyncFilters(prev => prev.map(f => {
          if (f.action === 'SANDBOX') {
            return { ...f, matchesCount: f.matchesCount + 1 };
          }
          return f;
        }));

        // Isolated Threat
        const newFault: SandboxFault = {
          id: `fault-${Math.floor(Math.random() * 90) + 10}`,
          timestamp: new Date().toLocaleTimeString(),
          triggerSource: selectedSrc,
          payloadSnippet: selectedExploit,
          faultType: selectedFaultType,
          isolationStatus: 'quarantined'
        };

        setSandboxFaults(prev => [newFault, ...prev]);
        setIsInjectingFault(false);

        logToTerminal(`[FAULT ISOLATION SUCCESS] Malicious socket isolated inside Ring-3 Sandboxed Thread. Threat contained!`);
        addNotification('Firewall Sandbox', `Isolated threat from ${selectedSrc} in sandboxed thread!`, 'error');
      }, 1000);
    }, 600);
  };

  // Clear sandbox faults
  const handlePurgeSandbox = () => {
    setSandboxFaults([]);
    logToTerminal(`Firewall Sandbox: All quarantined sockets purged and memory registers cleared.`);
    addNotification('Firewall Sandbox', 'Purged isolated sandbox faults successfully', 'success');
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0c10] text-[#c9d1d9] font-sans overflow-hidden">
      {/* Topology Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0d1117]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Layers size={20} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-widest text-white uppercase flex items-center gap-2">
              GlassTCP Segmenter & Live Bridge
              <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">L4 Bridge</span>
            </h2>
            <p className="text-[10px] text-white/40 font-mono">Custom protocol built on GlassOS Signal Engine</p>
          </div>
        </div>

        {/* Global Stress Stream Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#161b22] px-3 py-1.5 rounded-xl border border-white/5">
            <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Multi-Location Wave:</span>
            <button
              onClick={() => setIsWaveActive(!isWaveActive)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                isWaveActive 
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                  : 'bg-white/5 hover:bg-white/10 text-white/60 border border-white/5'
              }`}
            >
              {isWaveActive ? <Pause size={10} /> : <Play size={10} />}
              {isWaveActive ? 'Active Stream' : 'Deploy Traffic'}
            </button>
          </div>

          <div className="text-xs font-mono bg-[#161b22] border border-white/5 rounded-xl px-4 py-2 flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-white/30 uppercase font-bold">Node Identity</span>
              <span className="text-blue-400 font-bold text-[10px]">{localHostname}</span>
            </div>
            <div className="w-[1px] h-6 bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[9px] text-white/30 uppercase font-bold">Coordinates</span>
              <span className="text-emerald-400 text-[10px] font-bold">{selectedLocation.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center justify-between px-6 py-2 border-b border-white/5 bg-[#0a0c10] select-none">
        <div className="flex gap-2">
          <button
            onClick={() => setSubTab('topology')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border ${
              subTab === 'topology'
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                : 'text-white/40 border-transparent hover:text-white/70 hover:bg-white/2'
            }`}
          >
            <Globe size={12} />
            Topology & TCP Sessions
          </button>
          <button
            onClick={() => setSubTab('matrix')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border ${
              subTab === 'matrix'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'text-white/40 border-transparent hover:text-white/70 hover:bg-white/2'
            }`}
          >
            <Layers size={12} />
            Transport Matrix & Socket Bridge
          </button>
          <button
            onClick={() => setSubTab('firewall')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border ${
              subTab === 'firewall'
                ? 'bg-red-500/10 text-red-400 border-red-500/30'
                : 'text-white/40 border-transparent hover:text-white/70 hover:bg-white/2'
            }`}
          >
            <Shield size={12} />
            Firewall Sandbox
          </button>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono text-white/30">
          {subTab === 'topology' && (
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              L4 TCP Bridge Active
            </span>
          )}
          {subTab === 'matrix' && (
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Dual Low/High Bit sockets mapped
            </span>
          )}
          {subTab === 'firewall' && (
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              Fault isolation engine armed
            </span>
          )}
        </div>
      </div>

      {subTab === 'topology' ? (
        /* Main Workspace Grid */
        <div className="flex-1 grid grid-cols-12 overflow-hidden">
          {/* Map, Visual Flow & Traffic Stream */}
          <div className="col-span-8 flex flex-col overflow-hidden border-r border-white/5">
            {/* Live Topology Map */}
            <div 
              ref={mapRef}
              className="flex-1 min-h-[300px] bg-[#0c0f16] border-b border-white/5 relative overflow-hidden flex items-center justify-center p-8 group"
              style={{
                backgroundImage: 'radial-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }}
            >
              {/* World Vector Outline Mock background */}
              <div className="absolute inset-0 opacity-15 select-none pointer-events-none flex items-center justify-center">
                <Globe size={320} className="text-blue-500/20 animate-spin-slow" />
              </div>

              {/* Glowing lines between default nodes */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
                {/* Plot static topology lanes */}
                {DEFAULT_LOCATIONS.map((node, i) => {
                  const nextNode = DEFAULT_LOCATIONS[(i + 1) % DEFAULT_LOCATIONS.length];
                  return (
                    <line
                      key={node.id}
                      x1={`${node.x}%`}
                      y1={`${node.y}%`}
                      x2={`${nextNode.x}%`}
                      y2={`${nextNode.y}%`}
                      stroke="url(#blueGrad)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                  );
                })}

                {/* Render visual flying packet dots */}
                {packetVisuals.map((visual) => (
                  <motion.circle
                    key={visual.id}
                    r="4"
                    fill={visual.color}
                    initial={{ cx: `${visual.fromX}%`, cy: `${visual.fromY}%` }}
                    animate={{ cx: `${visual.toX}%`, cy: `${visual.toY}%` }}
                    transition={{ duration: visual.duration, ease: "easeInOut" }}
                    style={{ filter: `drop-shadow(0 0 6px ${visual.color})` }}
                  />
                ))}
              </svg>

              {/* Render Node Markers */}
              {DEFAULT_LOCATIONS.map((node) => {
                const isSelected = selectedLocation.id === node.id;
                const hasActiveLink = (Object.values(connections) as ActiveConnection[]).some(c => c.nodeName === node.name && c.state === 'ESTABLISHED');
                return (
                  <div
                    key={node.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group/node z-10"
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  >
                    <button
                      onClick={() => handleLocationChange(node.id)}
                      className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/40 ring-2 ring-white/20 scale-110' 
                          : hasActiveLink
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse'
                            : 'bg-[#161b22] border border-white/10 text-white/50 hover:text-white hover:border-white/30'
                      }`}
                    >
                      <Server size={12} />
                    </button>
                    <div className="bg-[#0d1117]/90 border border-white/5 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider text-white/70 shadow-xl opacity-80 group-hover/node:opacity-100 transition-opacity">
                      {node.name.split(' ')[0]}
                    </div>
                  </div>
                );
              })}

              {/* Display active real-time client peers if any */}
              {activeClients.map((client, i) => (
                <div
                  key={client.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10"
                  style={{ left: `${40 + (i * 12)}%`, top: `65%` }}
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center animate-pulse">
                    <Monitor size={14} />
                  </div>
                  <div className="bg-[#0d1117] border border-white/5 px-2 py-0.5 rounded text-[8px] font-bold text-purple-300">
                    {client.hostname.split('-')[0]}
                  </div>
                </div>
              ))}

              {/* Topology Map Label */}
              <div className="absolute top-4 left-6 bg-[#0d1117]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 flex items-center gap-1.5 pointer-events-none">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/60">Active Mesh Topology Map</span>
              </div>
            </div>

            {/* Real-time TCP Traffic Log Stream */}
            <div className="h-64 flex flex-col bg-[#07090e] overflow-hidden">
              <div className="px-6 py-2 border-b border-white/5 bg-[#0d1117]/30 flex items-center justify-between">
                <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest flex items-center gap-1.5">
                  <Activity size={10} className="text-amber-500" /> Layer 4 Network Packet Stream
                </span>
                <span className="text-[8px] font-mono text-white/30">Total Packet Buffer: {networkTraffic.length} segments</span>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar font-mono text-[10px] px-6 py-2 divide-y divide-white/2">
                {networkTraffic.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-white/20 uppercase tracking-widest text-[9px]">
                    No network packet traffic streaming. Use "Deploy Traffic" to generate wave.
                  </div>
                ) : (
                  networkTraffic.map((pkt) => {
                    return (
                      <div 
                        key={pkt.id} 
                        onClick={() => setSelectedPacket(pkt)}
                        className={`py-2 grid grid-cols-12 gap-2 items-center hover:bg-white/5 px-2 -mx-2 rounded transition-all cursor-pointer ${
                          selectedPacket?.id === pkt.id ? 'bg-blue-500/10 border-l-2 border-blue-500' : ''
                        }`}
                      >
                        <span className="col-span-2 text-white/30">{pkt.timestamp}</span>
                        <span className="col-span-3 text-white/80 font-bold truncate flex items-center gap-1">
                          {pkt.source.split(' ')[0]}
                          <ChevronRight size={10} className="text-white/20" />
                          <span className="text-blue-400 truncate">{pkt.destination.split(' ')[0]}</span>
                        </span>
                        <span className="col-span-1 text-purple-400 font-bold">{pkt.sourcePort}</span>
                        <span className="col-span-1 text-purple-300 font-bold">{pkt.destPort}</span>
                        <span className="col-span-2 text-blue-300/80 tracking-tighter">
                          {pkt.flags.syn ? 'SYN ' : ''}
                          {pkt.flags.ack ? 'ACK ' : ''}
                          {pkt.flags.psh ? 'PSH ' : ''}
                          {pkt.flags.fin ? 'FIN ' : ''}
                        </span>
                        <span className="col-span-2 text-white/50 truncate font-sans">{pkt.payload}</span>
                        <span className="col-span-1 text-right text-amber-400/80 font-bold">{pkt.size}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Custom TCP Handshake & Connection Controller Sidebar */}
          <div className="col-span-4 flex flex-col overflow-hidden bg-[#0d1117]/60 backdrop-blur-md">
            {/* Active Target Nodes Selection */}
            <div className="p-5 border-b border-white/5 flex flex-col gap-3">
              <h3 className="text-[10px] text-white/40 uppercase font-bold tracking-widest flex items-center gap-1.5">
                <Compass size={11} className="text-blue-400" /> Select Target Destination
              </h3>
              
              <div className="grid grid-cols-1 gap-2">
                <select
                  value={selectedTargetNode}
                  onChange={(e) => setSelectedTargetNode(e.target.value)}
                  className="w-full h-10 bg-[#161b22] border border-white/10 rounded-xl px-3 text-xs text-white font-medium focus:border-blue-500 focus:outline-none"
                >
                  <optgroup label="Simulated OS Core Backbone Nodes (Bots)">
                    {DEFAULT_LOCATIONS.map(loc => (
                      <option key={loc.id} value={loc.name}>{loc.name} ({loc.ip})</option>
                    ))}
                  </optgroup>
                  {activeClients.length > 0 && (
                    <optgroup label="Real-Time Active OS Users (Live peers)">
                      {activeClients.map(client => (
                        <option key={client.id} value={client.hostname}>{client.hostname} ({client.ip})</option>
                      ))}
                    </optgroup>
                  )}
                </select>

                {/* Action Handshake buttons */}
                {(() => {
                  const isConnected = connections[selectedTargetNode]?.state === 'ESTABLISHED';
                  const hasPending = connections[selectedTargetNode]?.state === 'SYN_SENT' || connections[selectedTargetNode]?.state === 'SYN_RECEIVED';
                  
                  return (
                    <button
                      onClick={() => {
                        if (isConnected) {
                          terminateConnection(selectedTargetNode);
                        } else {
                          // Find matching target
                          const targetObj = DEFAULT_LOCATIONS.find(l => l.name === selectedTargetNode) || activeClients.find(c => c.hostname === selectedTargetNode);
                          if (targetObj) initiateHandshake(targetObj);
                        }
                      }}
                      disabled={hasPending}
                      className={`w-full h-10 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                        isConnected 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30' 
                          : hasPending
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 cursor-wait animate-pulse'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/15'
                      }`}
                    >
                      <Layers size={13} />
                      {isConnected ? 'Disconnect TCP Socket' : hasPending ? 'TCP Handshake Pending...' : 'Establish TCP Session'}
                    </button>
                  );
                })()}
              </div>
            </div>

            {/* Core TCP Segment Inspector / Message Center */}
            <div className="flex-1 flex flex-col overflow-hidden min-h-0">
              {activeSession ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Active Session Info Panel */}
                  <div className="px-5 py-3 border-b border-white/5 bg-[#161b22]/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-white uppercase">{activeSession.split(' ')[0]}</span>
                    </div>
                    <span className="text-[9px] font-mono text-emerald-400/80 uppercase font-bold tracking-wider">ESTABLISHED</span>
                  </div>

                  {/* Chat Panel / Stream payloads */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
                    <div className="text-[9px] text-white/30 font-mono flex items-center justify-center gap-2">
                      <Lock size={8} /> TCP Segments Encrypted with OMEMO Handshake key
                    </div>

                    {networkTraffic
                      .filter(pkt => 
                        (pkt.source === activeSession && (pkt.destIp === localIp || pkt.destination === localHostname)) ||
                        ((pkt.source === localHostname || pkt.source === selectedLocation.name) && pkt.destination === activeSession)
                      )
                      .slice()
                      .reverse()
                      .map((pkt) => {
                        const isSelf = pkt.source === localHostname || pkt.source === selectedLocation.name;
                        return (
                          <div key={pkt.id} className={`flex flex-col gap-1 max-w-[85%] ${isSelf ? 'ml-auto items-end' : 'items-start'}`}>
                            <div className="flex items-center gap-2 text-[8px] text-white/30">
                              <span className="font-bold">{isSelf ? 'Local Host' : activeSession.split(' ')[0]}</span>
                              <span>{pkt.timestamp}</span>
                            </div>
                            
                            {pkt.fileName ? (
                              <div className="p-3 rounded-2xl bg-purple-500/15 border border-purple-500/20 flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-purple-300">
                                  <FileText size={16} />
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold">{pkt.fileName}</span>
                                    <span className="text-[9px] text-purple-400/80">Received over TCP stream • {pkt.size}</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className={`px-4 py-2 rounded-2xl text-xs font-medium leading-relaxed ${
                                isSelf ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-[#161b22] text-white/90 border border-white/5 rounded-tl-none'
                              }`}>
                                {pkt.payload}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>

                  {/* Input Panel with File Transmit strength of glassOS */}
                  <div className="p-4 bg-[#0d1117] border-t border-white/5 flex flex-col gap-2">
                    <div className="flex gap-2 relative group">
                      <input
                        type="text"
                        placeholder={`Encapsulate PSH segment payload...`}
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendTcpData()}
                        className="flex-1 h-11 bg-[#161b22] border border-white/10 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                      />
                      
                      {/* Send Button */}
                      <button
                        onClick={sendTcpData}
                        disabled={!messageText.trim()}
                        className="h-11 w-11 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-blue-600/10"
                      >
                        <Send size={14} />
                      </button>
                    </div>

                    {/* GlassOS File System Integration Tunnel */}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[9px] text-white/30 font-mono">Leverage GlassOS File System:</span>
                      <button
                        onClick={() => setShowFilePicker(true)}
                        className="text-[9px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20"
                      >
                        <FileText size={10} /> Send Local File
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-30 select-none">
                  <Terminal size={36} className="text-blue-400 mb-3" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">No Active TCP Session</h4>
                  <p className="text-[10px] text-white/60 max-w-[200px] leading-relaxed">
                    Select a target location above and initiate a 3-way handshake to open a session.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : subTab === 'matrix' ? (
        <div id="matrix-workspace-pane" className="flex-1 grid grid-cols-12 overflow-hidden">
          {/* Dual Low-Bit & High-Bit Socket Bridges + Ingress Channels */}
          <div className="col-span-7 flex flex-col overflow-hidden border-r border-white/5 p-6 gap-6">
            <div className="flex flex-col gap-1.5 border-b border-white/5 pb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                <Network size={14} /> Dual-Bitrate Native Socket Bridge
              </h3>
              <p className="text-[10px] text-white/40">Multi-lane hardware transceiver abstraction with hardware flow acceleration</p>
            </div>

            {/* Bridge Controls Panel */}
            <div className="grid grid-cols-2 gap-4">
              {/* Low-Bit Socket Bridge */}
              <div className="bg-[#111622] border border-emerald-500/10 p-5 rounded-2xl flex flex-col gap-3 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/2 rounded-full blur-2xl group-hover:bg-emerald-500/4 transition-all" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio size={14} className="text-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Low-Bit Socket Bridge</span>
                  </div>
                  <button
                    onClick={() => setLowBitActive(!lowBitActive)}
                    className={`w-10 h-5 rounded-full p-0.5 transition-all ${lowBitActive ? 'bg-emerald-500' : 'bg-white/10'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-all ${lowBitActive ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
                <p className="text-[10px] text-white/50 leading-relaxed">
                  Optimized for IoT telemetry, micro-pings, and serial streams. Employs 4-bit nibble packet compression & extreme MTU restriction.
                </p>
                <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-white/5 text-[9px] font-mono">
                  <div>
                    <span className="text-white/30 block">THROUGHPUT</span>
                    <span className="text-emerald-400/80 font-bold">{lowBitActive ? '14.8 KB/s' : '0.00 B/s'}</span>
                  </div>
                  <div>
                    <span className="text-white/30 block">FRAME WIDTH</span>
                    <span className="text-emerald-400/80 font-bold">128-Bit Micro</span>
                  </div>
                  <div>
                    <span className="text-white/30 block">AVG LATENCY</span>
                    <span className="text-emerald-400/80 font-bold">84 ms</span>
                  </div>
                  <div>
                    <span className="text-white/30 block">TRANSCEIVER</span>
                    <span className="text-emerald-400/80 font-semibold">Active (IoT-RX)</span>
                  </div>
                </div>

                {/* Animated byte visualization */}
                {lowBitActive && (
                  <div className="flex gap-1 h-3 mt-2 bg-[#0c0f16] rounded px-1.5 items-center justify-between font-mono text-[8px] text-emerald-400/60 overflow-hidden select-none">
                    <span className="animate-pulse">0101</span>
                    <span className="animate-ping delay-75">1010</span>
                    <span className="animate-pulse delay-150">0011</span>
                    <span className="animate-pulse delay-300">1100</span>
                  </div>
                )}
              </div>

              {/* High-Bit Socket Bridge */}
              <div className="bg-[#111622] border border-blue-500/10 p-5 rounded-2xl flex flex-col gap-3 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/2 rounded-full blur-2xl group-hover:bg-blue-500/4 transition-all" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-blue-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">High-Bit Socket Bridge</span>
                  </div>
                  <button
                    onClick={() => setHighBitActive(!highBitActive)}
                    className={`w-10 h-5 rounded-full p-0.5 transition-all ${highBitActive ? 'bg-blue-500' : 'bg-white/10'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-all ${highBitActive ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
                <p className="text-[10px] text-white/50 leading-relaxed">
                  Engineered for ultra-wideband multimedia pipeline, database mirroring, and zero-copy DMA packet transfer with jumbo windows.
                </p>
                <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-white/5 text-[9px] font-mono">
                  <div>
                    <span className="text-white/30 block">THROUGHPUT</span>
                    <span className="text-blue-400/80 font-bold">{highBitActive ? '1.82 GB/s' : '0.00 GB/s'}</span>
                  </div>
                  <div>
                    <span className="text-white/30 block">FRAME WIDTH</span>
                    <span className="text-blue-400/80 font-bold">64-Bit Jumbo</span>
                  </div>
                  <div>
                    <span className="text-white/30 block">AVG LATENCY</span>
                    <span className="text-blue-400/80 font-bold">1.4 ms</span>
                  </div>
                  <div>
                    <span className="text-white/30 block">TRANSCEIVER</span>
                    <span className="text-blue-400/80 font-semibold">Active (DMA-ZCPY)</span>
                  </div>
                </div>

                {/* Animated spectrum representation */}
                {highBitActive && (
                  <div className="flex gap-0.5 h-3 items-end mt-2 bg-[#0c0f16] rounded p-1 overflow-hidden">
                    {[30, 80, 50, 90, 60, 40, 75, 55, 95, 35, 85, 20, 65, 45, 90, 70, 50, 80].map((h, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 bg-blue-500/60 rounded-t"
                        initial={{ height: '10%' }}
                        animate={{ height: `${h}%` }}
                        transition={{
                          repeat: Infinity,
                          repeatType: 'reverse',
                          duration: 0.5 + (i % 5) * 0.1,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Matrix Parameters & Config Table */}
            <div className="flex-1 bg-[#0c0f16] border border-white/5 rounded-2xl p-5 flex flex-col min-h-0">
              <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                <span className="text-[10px] text-white/40 font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders size={11} className="text-emerald-400" /> Physical Layer Multiplex Config
                </span>
                <div className="flex gap-1.5">
                  {(['low-bit', 'high-bit', 'balanced'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setSocketBridgeMode(mode)}
                      className={`px-2 py-1 rounded text-[9px] uppercase font-bold tracking-wider font-mono border transition-all ${
                        socketBridgeMode === mode
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-white/2 text-white/40 border-white/5 hover:text-white/70'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Config table list */}
              <div className="flex-1 overflow-y-auto no-scrollbar font-mono text-[10px] space-y-4 pr-1">
                <div className="grid grid-cols-12 gap-2 text-white/30 border-b border-white/2 pb-1.5 uppercase text-[9px] font-bold">
                  <span className="col-span-3">TRANSCEIVER PARAMETER</span>
                  <span className="col-span-3 text-right">LOW-BIT VALUE</span>
                  <span className="col-span-3 text-right">HIGH-BIT VALUE</span>
                  <span className="col-span-3 text-right">MULTIPLEX ACTION</span>
                </div>

                <div className="grid grid-cols-12 gap-2 py-1 items-center border-b border-white/2">
                  <span className="col-span-3 text-white/70 font-semibold">Zero-Copy DMA Rings</span>
                  <span className="col-span-3 text-right text-white/50">Disabled (Bypass)</span>
                  <span className="col-span-3 text-right text-blue-400">4x Direct 1024-Ring</span>
                  <span className="col-span-3 text-right text-emerald-400">Auto-Spawning</span>
                </div>

                <div className="grid grid-cols-12 gap-2 py-1 items-center border-b border-white/2">
                  <span className="col-span-3 text-white/70 font-semibold">Frame MTU Scaling</span>
                  <span className="col-span-3 text-right text-white/50">512 Byte Max</span>
                  <span className="col-span-3 text-right text-blue-400">9000 Byte Jumbo</span>
                  <span className="col-span-3 text-right text-emerald-400">Dynamic Adjust</span>
                </div>

                <div className="grid grid-cols-12 gap-2 py-1 items-center border-b border-white/2">
                  <span className="col-span-3 text-white/70 font-semibold">Silicon Driver HAL</span>
                  <span className="col-span-3 text-right text-white/50">SADF-Bypass</span>
                  <span className="col-span-3 text-right text-blue-400">SADF Core Pipeline</span>
                  <span className="col-span-3 text-right text-emerald-400">Accelerated</span>
                </div>

                <div className="grid grid-cols-12 gap-2 py-1 items-center font-mono">
                  <span className="col-span-3 text-white/70 font-semibold">Duplexing Multiplex</span>
                  <span className="col-span-3 text-right text-white/50">Simplex Pulse</span>
                  <span className="col-span-3 text-right text-blue-400">Full Duplex Mesh</span>
                  <span className="col-span-3 text-right text-emerald-400">Virtual Bridge</span>
                </div>
              </div>
            </div>
          </div>

          {/* Multi-Tenant Routing Manager & Concurrent Ingress Sidebar */}
          <div className="col-span-5 flex flex-col overflow-hidden bg-[#0d1117]/60 backdrop-blur-md p-6 gap-6">
            <div className="flex flex-col gap-1.5 border-b border-white/5 pb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                <Compass size={14} /> Multi-Tenant Concurrent Ingress
              </h3>
              <p className="text-[10px] text-white/40">Isolate routing domains and configure concurrent pipeline lanes</p>
            </div>

            {/* Tenant list */}
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto no-scrollbar pr-1">
              {tenants.map(tenant => {
                const priorityColors = {
                  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
                  high: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                  standard: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                };

                return (
                  <div key={tenant.id} className="bg-[#111622] border border-white/5 rounded-2xl p-5 flex flex-col gap-4 relative">
                    {/* Priority badge */}
                    <span className={`absolute top-5 right-5 px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${priorityColors[tenant.priority]}`}>
                      {tenant.priority}
                    </span>

                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-white">{tenant.name}</span>
                      <span className="text-[10px] font-mono text-emerald-400">{tenant.subdomain}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[9px] font-mono pt-2 border-t border-white/2">
                      <div>
                        <span className="text-white/30 block mb-0.5">BANDWIDTH LIMIT</span>
                        <span className="text-white/80 font-bold">{tenant.bandwidthLimit}</span>
                      </div>
                      <div>
                        <span className="text-white/30 block mb-0.5">ACTIVE SOCKETS</span>
                        <span className="text-white/80 font-bold">{tenant.activeConnections}</span>
                      </div>
                      <div>
                        <span className="text-white/30 block mb-0.5">CONCURRENT LANES</span>
                        <span className="text-white/80 font-bold">{tenant.ingressLanes} Thread-Lanes</span>
                      </div>
                    </div>

                    {/* Progress slider for queue pressure */}
                    <div className="flex flex-col gap-1.5 mt-2">
                      <div className="flex justify-between text-[9px] font-mono">
                        <span className="text-white/30 uppercase font-bold">Ingress Queue Buffer Pressure</span>
                        <span className={`font-bold ${tenant.ingressQueuePressure > 70 ? 'text-red-400' : tenant.ingressQueuePressure > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {tenant.ingressQueuePressure}% Queue-Fill
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#0a0c10] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            tenant.ingressQueuePressure > 70 
                              ? 'bg-red-500 shadow-md shadow-red-500/50' 
                              : tenant.ingressQueuePressure > 40 
                                ? 'bg-amber-500 shadow-md shadow-amber-500/50' 
                                : 'bg-emerald-500 shadow-md shadow-emerald-500/50'
                          }`}
                          style={{ width: `${tenant.ingressQueuePressure}%` }}
                        />
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-between gap-4 mt-1 pt-1">
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] text-white/30 uppercase font-bold mr-1">Ingress Lanes:</span>
                        <button
                          onClick={() => handleTenantLanesChange(tenant.id, -2)}
                          className="w-5 h-5 bg-white/5 hover:bg-white/10 text-white rounded flex items-center justify-center text-xs font-bold transition-all border border-white/5"
                        >
                          -
                        </button>
                        <button
                          onClick={() => handleTenantLanesChange(tenant.id, 2)}
                          className="w-5 h-5 bg-white/5 hover:bg-white/10 text-white rounded flex items-center justify-center text-xs font-bold transition-all border border-white/5"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => handleTenantBurst(tenant.id)}
                        className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all"
                      >
                        Trigger Burst Traffic
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div id="firewall-workspace-pane" className="flex-1 grid grid-cols-12 overflow-hidden">
          {/* Asynchronous Filtering Rules */}
          <div className="col-span-7 flex flex-col overflow-hidden border-r border-white/5 p-6 gap-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-red-400 flex items-center gap-1.5">
                  <Shield size={14} /> Asynchronous Firewall Filtering Center
                </h3>
                <p className="text-[10px] text-white/40">Deploy live security rules evaluated out-of-band to prevent interface blocks</p>
              </div>

              {/* Master Firewall Switch */}
              <div className="flex items-center gap-2 bg-[#161b22] px-3 py-1.5 rounded-xl border border-white/5">
                <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Firewall Status:</span>
                <button
                  onClick={() => setFirewallActive(!firewallActive)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    firewallActive 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                      : 'bg-white/5 hover:bg-white/10 text-white/60 border border-white/5'
                  }`}
                >
                  <Shield size={10} />
                  {firewallActive ? 'Shield Armed' : 'Bypassed'}
                </button>
              </div>
            </div>

            {/* Form to create a custom rule */}
            <form onSubmit={handleCreateFilterRule} className="bg-[#111622] border border-white/5 p-5 rounded-2xl flex flex-col gap-4">
              <span className="text-[10px] text-white/30 uppercase font-bold font-mono">Create Asynchronous Filtering Policy Rule</span>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Regex, IP CIDR, payload string, or port descriptor (e.g. 192.168.1.100 or .sh/.exe)"
                  value={newFilterPattern}
                  onChange={(e) => setNewFilterPattern(e.target.value)}
                  className="flex-1 h-10 bg-[#0a0c10] border border-white/10 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-red-500 font-medium"
                />

                <select
                  value={newFilterAction}
                  onChange={(e: any) => setNewFilterAction(e.target.value)}
                  className="h-10 bg-[#0a0c10] border border-white/10 rounded-xl px-3 text-xs text-white font-medium focus:border-red-500 focus:outline-none min-w-[120px]"
                >
                  <option value="DROP">DROP Packet</option>
                  <option value="SANDBOX">SANDBOX Route</option>
                  <option value="PASS">PASS Whitelist</option>
                  <option value="DECRYPT">DECRYPT Inspect</option>
                </select>

                <button
                  type="submit"
                  disabled={!newFilterPattern.trim()}
                  className="h-10 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold rounded-xl px-4 text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-lg shadow-red-600/10"
                >
                  <Plus size={12} /> Add Policy
                </button>
              </div>
            </form>

            {/* Rule List Container */}
            <div className="flex-1 bg-[#0c0f16] border border-white/5 rounded-2xl p-5 flex flex-col min-h-0">
              <span className="text-[10px] text-white/40 font-mono font-bold uppercase tracking-wider mb-3 block pb-2 border-b border-white/5">
                Active Asynchronous Evaluation Policies
              </span>

              <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1">
                {asyncFilters.map(filter => {
                  const actionColors = {
                    DROP: 'bg-red-500/20 text-red-400 border-red-500/30',
                    SANDBOX: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
                    PASS: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
                    DECRYPT: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  };

                  return (
                    <div
                      key={filter.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                        filter.isActive
                          ? 'bg-[#111622]/60 border-white/5 hover:border-white/10'
                          : 'bg-[#111622]/20 border-transparent opacity-40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Toggle active state */}
                        <button
                          onClick={() => handleToggleFilterRule(filter.id)}
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                            filter.isActive 
                              ? 'bg-red-500 border-red-500 text-white' 
                              : 'bg-transparent border-white/20 text-transparent'
                          }`}
                        >
                          <Check size={10} />
                        </button>

                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-white/90">{filter.pattern}</span>
                          <span className="text-[8px] font-mono text-white/30 uppercase tracking-wide flex items-center gap-2">
                            <span>Evaluated out-of-band</span>
                            <span>•</span>
                            <span className="text-red-400 font-semibold">{filter.matchesCount} packets filtered</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase border ${actionColors[filter.action]}`}>
                          {filter.action}
                        </span>

                        <button
                          onClick={() => handleDeleteFilterRule(filter.id)}
                          className="p-1.5 rounded bg-white/2 hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-colors border border-transparent hover:border-red-500/10"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Fault Isolation Sandbox Sidebar (Ring-3 Sandbox Sandbagging) */}
          <div className="col-span-5 flex flex-col overflow-hidden bg-[#0d1117]/60 backdrop-blur-md p-6 gap-6">
            <div className="flex flex-col gap-1.5 border-b border-white/5 pb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-red-400 flex items-center gap-1.5">
                <AlertCircle size={14} /> Ring-3 Thread Fault Isolation Sandbox
              </h3>
              <p className="text-[10px] text-white/40">Threat sandbagging container isolating compromised socket processes</p>
            </div>

            {/* Test Simulation Controls */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleInjectFault}
                disabled={isInjectingFault}
                className={`w-full h-11 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border shadow-lg ${
                  isInjectingFault
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 cursor-wait animate-pulse'
                    : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20 shadow-red-500/5'
                }`}
              >
                <Cpu size={14} className={isInjectingFault ? 'animate-spin' : ''} />
                {isInjectingFault ? 'Evaluating Ingress Payload...' : 'Inject Malicious Socket payload'}
              </button>
            </div>

            {/* Isolated Sandbox Sockets View */}
            <div className="flex-1 bg-[#0c0f16] border border-white/5 rounded-2xl p-5 flex flex-col min-h-0 relative">
              <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                <span className="text-[10px] text-white/40 font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Shield size={11} className="text-red-400" /> Isolated Sandbox threats ({sandboxFaults.length})
                </span>
                {sandboxFaults.length > 0 && (
                  <button
                    onClick={handlePurgeSandbox}
                    className="text-[9px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20"
                  >
                    Flush Sandbox
                  </button>
                )}
              </div>

              {sandboxFaults.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 select-none">
                  <Check size={28} className="text-emerald-400 mb-2" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider mb-0.5">Sandbox Clear</span>
                  <span className="text-[9px] text-white/60">No isolated faults or sandbagged threats.</span>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-1">
                  {sandboxFaults.map(fault => (
                    <div key={fault.id} className="p-3.5 rounded-xl bg-red-500/5 border border-red-500/10 flex flex-col gap-2 font-mono text-[9px]">
                      <div className="flex items-center justify-between border-b border-white/2 pb-1.5">
                        <span className="text-red-400 font-bold flex items-center gap-1">
                          <AlertCircle size={9} /> {fault.faultType}
                        </span>
                        <span className="text-white/30">{fault.timestamp}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                        <div>
                          <span className="text-white/30 block">TRIGGER SOURCE</span>
                          <span className="text-white/80 font-bold">{fault.triggerSource}</span>
                        </div>
                        <div>
                          <span className="text-white/30 block">CONTAINER ROUTE</span>
                          <span className="text-red-400 font-bold flex items-center gap-1">
                            <div className="w-1 h-1 rounded-full bg-red-400 animate-ping" />
                            RING-3 ISOLATED
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-white/30 block mb-0.5">INTERCEPTED HEX PAYLOAD</span>
                        <div className="bg-[#0a0c10] px-2 py-1.5 rounded border border-white/5 text-white/60 text-[8px] break-all leading-tight">
                          {fault.payloadSnippet}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Packet Inspection / Raw Hex Viewer Panel */}
      <AnimatePresence>
        {selectedPacket && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="absolute bottom-0 left-0 right-0 h-80 bg-[#0d1117] border-t border-white/10 shadow-2xl z-20 flex flex-col overflow-hidden"
          >
            {/* Inspector Header */}
            <div className="px-6 py-3 border-b border-white/5 bg-[#161b22] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-blue-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Raw TCP segment inspector</span>
                <span className="text-[10px] font-mono bg-[#0c0f16] px-2 py-0.5 rounded text-white/40">Packet ID: {selectedPacket.id}</span>
              </div>
              <button 
                onClick={() => setSelectedPacket(null)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Inspector Body Grid */}
            <div className="flex-1 grid grid-cols-12 overflow-hidden p-6 gap-6 font-mono text-[10px]">
              {/* Header Fields */}
              <div className="col-span-5 grid grid-cols-2 gap-4 bg-[#0a0c10] p-4 rounded-xl border border-white/5 overflow-y-auto no-scrollbar">
                <div>
                  <span className="text-white/30 block mb-0.5">Source IP / Host:</span>
                  <span className="text-blue-400 font-bold">{selectedPacket.source} ({selectedPacket.sourceIp})</span>
                </div>
                <div>
                  <span className="text-white/30 block mb-0.5">Dest IP / Host:</span>
                  <span className="text-emerald-400 font-bold">{selectedPacket.destination} ({selectedPacket.destIp})</span>
                </div>
                <div>
                  <span className="text-white/30 block mb-0.5">Source Port:</span>
                  <span className="text-white/80">{selectedPacket.sourcePort}</span>
                </div>
                <div>
                  <span className="text-white/30 block mb-0.5">Destination Port:</span>
                  <span className="text-white/80">{selectedPacket.destPort}</span>
                </div>
                <div>
                  <span className="text-white/30 block mb-0.5">Sequence Number:</span>
                  <span className="text-purple-400 font-bold">{selectedPacket.seq}</span>
                </div>
                <div>
                  <span className="text-white/30 block mb-0.5">Acknowledgment Num:</span>
                  <span className="text-purple-300 font-bold">{selectedPacket.ack}</span>
                </div>
                <div>
                  <span className="text-white/30 block mb-0.5">Header TCP Flags:</span>
                  <span className="text-amber-400 font-bold flex gap-1">
                    {selectedPacket.flags.syn && <span className="bg-amber-500/10 px-1.5 py-0.5 rounded text-[8px]">SYN</span>}
                    {selectedPacket.flags.ack && <span className="bg-amber-500/10 px-1.5 py-0.5 rounded text-[8px]">ACK</span>}
                    {selectedPacket.flags.psh && <span className="bg-amber-500/10 px-1.5 py-0.5 rounded text-[8px]">PSH</span>}
                    {selectedPacket.flags.fin && <span className="bg-amber-500/10 px-1.5 py-0.5 rounded text-[8px]">FIN</span>}
                  </span>
                </div>
                <div>
                  <span className="text-white/30 block mb-0.5">Calculated Size:</span>
                  <span className="text-amber-500 font-bold">{selectedPacket.size}</span>
                </div>
              </div>

              {/* Raw Hex Matrix Dump */}
              <div className="col-span-7 flex flex-col bg-[#07090e] p-4 rounded-xl border border-white/5 overflow-hidden">
                <div className="flex justify-between border-b border-white/5 pb-2 mb-2 text-white/30 text-[9px]">
                  <span>OFFSET</span>
                  <span>HEX CONTENT (8 BYTES PER MATRIX BLOCK)</span>
                  <span>ASCII</span>
                </div>
                <div className="flex-1 overflow-y-auto font-mono no-scrollbar leading-relaxed">
                  {stringToHexMatrix(selectedPacket.payload || 'TCP Keepalive handshake ping').map((row, idx) => (
                    <div key={idx} className="flex justify-between select-text text-[11px]">
                      <span className="text-blue-500/70">{row.address}</span>
                      <span className="text-white/90 tracking-wider whitespace-pre">{row.hex}</span>
                      <span className="text-emerald-400/80">{row.ascii}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Embedded File System Picker Modal */}
      {showFilePicker && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-[450px] bg-[#161b22] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[80vh]">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase text-white tracking-widest flex items-center gap-2">
                <Database size={14} className="text-blue-400" /> Select GlassOS File to Transmit
              </h3>
              <button 
                onClick={() => setShowFilePicker(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-2 no-scrollbar">
              {fs.length === 0 ? (
                <div className="text-center py-8 text-xs text-white/30 font-medium">No files available in virtual storage.</div>
              ) : (
                fs.map((item, index) => {
                  if (item.children) {
                    // It's a folder, render children files
                    return (
                      <div key={index} className="flex flex-col gap-1.5">
                        <div className="text-[10px] text-white/30 font-bold uppercase px-1">{item.name}</div>
                        {item.children.map((subItem, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => sendFileOverTcp(subItem)}
                            className="w-full text-left p-3 rounded-xl bg-white/2 hover:bg-white/5 border border-white/2 flex items-center justify-between text-xs font-medium transition-colors text-white/80 hover:text-white"
                          >
                            <span className="flex items-center gap-2">
                              <FileText size={12} className="text-blue-400" /> {subItem.name}
                            </span>
                            <span className="text-[10px] font-mono text-white/30">{subItem.size || 'txt'}</span>
                          </button>
                        ))}
                      </div>
                    );
                  }
                  // It's a root file
                  return (
                    <button
                      key={index}
                      onClick={() => sendFileOverTcp(item)}
                      className="w-full text-left p-3 rounded-xl bg-white/2 hover:bg-white/5 border border-white/2 flex items-center justify-between text-xs font-medium transition-colors text-white/80 hover:text-white"
                    >
                      <span className="flex items-center gap-2">
                        <FileText size={12} className="text-blue-400" /> {item.name}
                      </span>
                      <span className="text-[10px] font-mono text-white/30">{item.size || 'txt'}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
