/**
 * The Vault Manager - Cryptographic Security & REST Endpoint Authority
 * 
 * Enforces cryptographic signature verification before auto-generated REST endpoints
 * can be bound to open network interfaces (0.0.0.0 / eth0 / wlan0 / LAN).
 */

export interface VaultKeyPair {
  keyId: string;
  publicKeyPem: string;
  algorithm: 'ECDSA_P256_SHA256' | 'RSA_PSS_2048' | 'ED25519_VAULT';
  createdAt: string;
  expiresAt: string;
  fingerprint: string;
  status: 'ACTIVE' | 'REVOKED';
}

export interface RestEndpointDefinition {
  id: string;
  name: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'ALL';
  source: 'database_collection' | 'glasssheets_range' | 'glassword_doc' | 'system_kernel' | 'lanbridge_relay';
  sourceTarget: string; // e.g. "users_collection" or "Sheet1!A1:D50"
  boundInterface: 'UNBOUND' | '127.0.0.1' | '0.0.0.0' | '192.168.1.105 (eth0)' | '10.0.0.42 (wlan0)';
  port: number;
  isPublicInterface: boolean;
  signatureStatus: 'UNSIGNED' | 'VERIFIED_SIGNED' | 'SIGNATURE_INVALID' | 'REVOKED';
  signatureToken?: string;
  signedByVaultKeyId?: string;
  signedTimestamp?: string;
  rateLimitPerMin: number;
  totalRequests: number;
  lastAccess?: string;
  description: string;
}

export interface VaultAuditLogEntry {
  id: string;
  timestamp: string;
  event: 'SIGNATURE_ISSUED' | 'BINDING_APPROVED' | 'BINDING_BLOCKED_UNSIGNED' | 'AUTH_VERIFIED' | 'AUTH_REJECTED' | 'KEY_ROTATED' | 'QUOTA_EXCEEDED';
  endpointId?: string;
  endpointPath?: string;
  interfaceTarget?: string;
  details: string;
  severity: 'INFO' | 'WARN' | 'CRITICAL' | 'SUCCESS';
}

export class TheVaultManager {
  private static masterKeyId = 'VAULT_ROOT_KEY_9921';
  private static masterSecret = 'vault_sec_9f81ac39e8024dbe8a77f1190bc2a';
  
  private static keyPairs: VaultKeyPair[] = [
    {
      keyId: 'VAULT_SIGNING_KEY_ALPHA',
      publicKeyPem: '-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE7p9vJ4W12...\n-----END PUBLIC KEY-----',
      algorithm: 'ECDSA_P256_SHA256',
      createdAt: '2026-08-01 00:00:00',
      expiresAt: '2027-08-01 00:00:00',
      fingerprint: 'SHA256:7a:9f:3b:c4:e1:82:5d:00:aa:f4:2e:9c:88:bb:11:03',
      status: 'ACTIVE'
    },
    {
      keyId: 'VAULT_SIGNING_KEY_BETA',
      publicKeyPem: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----',
      algorithm: 'RSA_PSS_2048',
      createdAt: '2026-08-10 12:00:00',
      expiresAt: '2027-08-10 12:00:00',
      fingerprint: 'SHA256:33:4d:88:91:ff:ab:12:34:56:78:90:ab:cd:ef:12:34',
      status: 'ACTIVE'
    }
  ];

  // Auto-Generated REST Endpoints Registry
  private static endpoints: Map<string, RestEndpointDefinition> = new Map([
    [
      'ep_db_users',
      {
        id: 'ep_db_users',
        name: 'Users Collection REST Gateway',
        path: '/api/v1/database/collections/users',
        method: 'ALL',
        source: 'database_collection',
        sourceTarget: 'users',
        boundInterface: '127.0.0.1',
        port: 8080,
        isPublicInterface: false,
        signatureStatus: 'VERIFIED_SIGNED',
        signatureToken: 'vlt_sig_ecdsa_99fa12b842918804910efb',
        signedByVaultKeyId: 'VAULT_SIGNING_KEY_ALPHA',
        signedTimestamp: '2026-08-15 14:22:00',
        rateLimitPerMin: 120,
        totalRequests: 1420,
        lastAccess: 'Just now',
        description: 'Auto-generated REST CRUD endpoint for GlassDatabase users table.'
      }
    ],
    [
      'ep_sheets_financials',
      {
        id: 'ep_sheets_financials',
        name: 'Financial Ledger Sheet Query API',
        path: '/api/v1/sheets/ranges/q3_financials',
        method: 'GET',
        source: 'glasssheets_range',
        sourceTarget: 'Sheet1!A1:G100',
        boundInterface: 'UNBOUND',
        port: 8443,
        isPublicInterface: true,
        signatureStatus: 'UNSIGNED',
        rateLimitPerMin: 60,
        totalRequests: 0,
        description: 'Live compute and JSON range streaming endpoint for GlassSheets financial workbook.'
      }
    ],
    [
      'ep_kernel_telemetry',
      {
        id: 'ep_kernel_telemetry',
        name: 'GlassOS Kernel Telemetry Stream',
        path: '/api/v1/kernel/telemetry/live',
        method: 'GET',
        source: 'system_kernel',
        sourceTarget: 'kernel_metrics',
        boundInterface: '127.0.0.1',
        port: 8080,
        isPublicInterface: false,
        signatureStatus: 'VERIFIED_SIGNED',
        signatureToken: 'vlt_sig_rsa_4810fe912a77bc0019',
        signedByVaultKeyId: 'VAULT_SIGNING_KEY_BETA',
        signedTimestamp: '2026-08-18 09:15:00',
        rateLimitPerMin: 300,
        totalRequests: 5890,
        lastAccess: '1 min ago',
        description: 'Zero-copy kernel CPU, RAM, and protocol telemetry streamer.'
      }
    ],
    [
      'ep_lanbridge_relay',
      {
        id: 'ep_lanbridge_relay',
        name: 'LAN Bridge OLE Packet Relay',
        path: '/api/v1/bridge/relay/packets',
        method: 'POST',
        source: 'lanbridge_relay',
        sourceTarget: 'packet_bus',
        boundInterface: 'UNBOUND',
        port: 9000,
        isPublicInterface: true,
        signatureStatus: 'UNSIGNED',
        rateLimitPerMin: 200,
        totalRequests: 0,
        description: 'Auto-generated inter-workstation packet bridge REST endpoint.'
      }
    ]
  ]);

  // Security Audit Log
  private static auditLogs: VaultAuditLogEntry[] = [
    {
      id: 'log_001',
      timestamp: '2026-08-18 10:14:22',
      event: 'BINDING_APPROVED',
      endpointId: 'ep_db_users',
      endpointPath: '/api/v1/database/collections/users',
      interfaceTarget: '127.0.0.1:8080',
      details: 'Endpoint bound successfully to loopback interface with verified Vault ECDSA signature.',
      severity: 'SUCCESS'
    },
    {
      id: 'log_002',
      timestamp: '2026-08-18 11:02:19',
      event: 'BINDING_BLOCKED_UNSIGNED',
      endpointId: 'ep_sheets_financials',
      endpointPath: '/api/v1/sheets/ranges/q3_financials',
      interfaceTarget: '0.0.0.0:8443 (Open Interface)',
      details: 'SECURITY INTERCEPT: Attempted binding to open interface without cryptographic signature from The Vault Manager was blocked (403 Forbidden).',
      severity: 'CRITICAL'
    }
  ];

  /**
   * Get all registered REST endpoints
   */
  static getEndpoints(): RestEndpointDefinition[] {
    return Array.from(this.endpoints.values());
  }

  /**
   * Get all active Vault Keypairs
   */
  static getKeyPairs(): VaultKeyPair[] {
    return [...this.keyPairs];
  }

  /**
   * Get security audit log entries
   */
  static getAuditLogs(): VaultAuditLogEntry[] {
    return [...this.auditLogs];
  }

  /**
   * Generate an auto-generated REST endpoint from Database collection, Sheet range, etc.
   */
  static registerAutoGeneratedEndpoint(ep: Omit<RestEndpointDefinition, 'id' | 'signatureStatus' | 'totalRequests'>): RestEndpointDefinition {
    const id = `ep_${ep.source.slice(0, 3)}_${Math.random().toString(36).substr(2, 6)}`;
    const newEp: RestEndpointDefinition = {
      ...ep,
      id,
      signatureStatus: 'UNSIGNED',
      boundInterface: 'UNBOUND',
      totalRequests: 0
    };
    this.endpoints.set(id, newEp);
    
    this.addAuditLog({
      event: 'AUTH_VERIFIED',
      endpointId: id,
      endpointPath: newEp.path,
      details: `New auto-generated REST endpoint created: "${newEp.name}" (${newEp.path}). Initial status: UNSIGNED.`,
      severity: 'INFO'
    });

    return newEp;
  }

  /**
   * Cryptographically sign an endpoint using The Vault Manager's keypair
   */
  static signEndpoint(endpointId: string, keyId: string = 'VAULT_SIGNING_KEY_ALPHA'): { success: boolean; signatureToken?: string; error?: string } {
    const ep = this.endpoints.get(endpointId);
    if (!ep) {
      return { success: false, error: `Endpoint "${endpointId}" not found in Vault registry.` };
    }

    const key = this.keyPairs.find(k => k.keyId === keyId && k.status === 'ACTIVE');
    if (!key) {
      return { success: false, error: `Vault signing key "${keyId}" is inactive or revoked.` };
    }

    // Cryptographic hash & token generation simulating ECDSA/RSA signature
    const header = btoa(JSON.stringify({ alg: key.algorithm, typ: 'VAULT-REST-SIG', kid: key.keyId }));
    const payload = btoa(JSON.stringify({
      sub: ep.id,
      path: ep.path,
      method: ep.method,
      source: ep.source,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 31536000,
      vlt_root: this.masterKeyId
    }));
    
    // Simulate HMAC signature hex
    const rawSig = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const signatureToken = `vlt_sig_${key.algorithm.toLowerCase()}_${header.slice(0, 8)}.${payload.slice(0, 16)}.${rawSig}`;

    ep.signatureStatus = 'VERIFIED_SIGNED';
    ep.signatureToken = signatureToken;
    ep.signedByVaultKeyId = key.keyId;
    ep.signedTimestamp = new Date().toLocaleString();

    this.addAuditLog({
      event: 'SIGNATURE_ISSUED',
      endpointId: ep.id,
      endpointPath: ep.path,
      details: `Cryptographic signature issued by Vault Key [${key.keyId}] (${key.algorithm}). Signature Token: ${signatureToken.slice(0, 28)}...`,
      severity: 'SUCCESS'
    });

    return { success: true, signatureToken };
  }

  /**
   * Bind an auto-generated REST endpoint to a network interface.
   * STRICT ENFORCEMENT: Binding to OPEN interfaces (0.0.0.0, LAN IPs, WAN) REQUIRES a verified Vault signature.
   */
  static bindEndpoint(
    endpointId: string,
    targetInterface: '127.0.0.1' | '0.0.0.0' | '192.168.1.105 (eth0)' | '10.0.0.42 (wlan0)',
    port: number = 8080
  ): { success: boolean; error?: string; message?: string } {
    const ep = this.endpoints.get(endpointId);
    if (!ep) {
      return { success: false, error: `Endpoint "${endpointId}" does not exist in registry.` };
    }

    const isOpenInterface = targetInterface !== '127.0.0.1';

    // VAULT SECURITY ENFORCEMENT CHECK:
    if (isOpenInterface) {
      if (ep.signatureStatus !== 'VERIFIED_SIGNED' || !ep.signatureToken) {
        const errorMsg = `[VAULT_ENFORCEMENT_ERROR] 403 Forbidden: Endpoint "${ep.name}" cannot be bound to open network interface (${targetInterface}:${port}). Cryptographic signature verification through The Vault Manager is strictly REQUIRED for open interface exposure.`;
        
        this.addAuditLog({
          event: 'BINDING_BLOCKED_UNSIGNED',
          endpointId: ep.id,
          endpointPath: ep.path,
          interfaceTarget: `${targetInterface}:${port}`,
          details: errorMsg,
          severity: 'CRITICAL'
        });

        return {
          success: false,
          error: errorMsg
        };
      }

      // Verify token integrity
      if (!ep.signatureToken.startsWith('vlt_sig_')) {
        const invalidMsg = `[VAULT_INTEGRITY_FAIL] Cryptographic signature token is corrupt or forged. Binding rejected.`;
        this.addAuditLog({
          event: 'BINDING_BLOCKED_UNSIGNED',
          endpointId: ep.id,
          endpointPath: ep.path,
          interfaceTarget: `${targetInterface}:${port}`,
          details: invalidMsg,
          severity: 'CRITICAL'
        });
        return { success: false, error: invalidMsg };
      }
    }

    // Approved: Bind endpoint
    ep.boundInterface = targetInterface;
    ep.port = port;
    ep.isPublicInterface = isOpenInterface;

    const successMsg = `REST endpoint "${ep.name}" successfully bound to ${targetInterface}:${port} with Vault authentication enforcement.`;
    this.addAuditLog({
      event: 'BINDING_APPROVED',
      endpointId: ep.id,
      endpointPath: ep.path,
      interfaceTarget: `${targetInterface}:${port}`,
      details: successMsg,
      severity: 'SUCCESS'
    });

    return { success: true, message: successMsg };
  }

  /**
   * Unbind an endpoint
   */
  static unbindEndpoint(endpointId: string): boolean {
    const ep = this.endpoints.get(endpointId);
    if (!ep) return false;
    ep.boundInterface = 'UNBOUND';
    ep.isPublicInterface = false;
    this.addAuditLog({
      event: 'AUTH_VERIFIED',
      endpointId: ep.id,
      endpointPath: ep.path,
      details: `Endpoint "${ep.name}" unbound from network interface.`,
      severity: 'INFO'
    });
    return true;
  }

  /**
   * Revoke an endpoint signature
   */
  static revokeSignature(endpointId: string): boolean {
    const ep = this.endpoints.get(endpointId);
    if (!ep) return false;
    ep.signatureStatus = 'REVOKED';
    ep.signatureToken = undefined;
    if (ep.isPublicInterface) {
      ep.boundInterface = 'UNBOUND';
      ep.isPublicInterface = false;
    }
    this.addAuditLog({
      event: 'KEY_ROTATED',
      endpointId: ep.id,
      endpointPath: ep.path,
      details: `Cryptographic signature revoked for endpoint "${ep.name}". Public interface bindings terminated immediately.`,
      severity: 'WARN'
    });
    return true;
  }

  /**
   * Simulate a REST HTTP request against a bound endpoint with Vault cryptographic validation
   */
  static simulateRequest(
    endpointId: string,
    req: {
      method: string;
      headers: Record<string, string>;
      body?: any;
    }
  ): { status: number; data: any; headers: Record<string, string> } {
    const ep = this.endpoints.get(endpointId);
    if (!ep) {
      return {
        status: 404,
        data: { error: 'Not Found', message: `Endpoint ${endpointId} does not exist.` },
        headers: { 'X-Vault-Status': 'NOT_FOUND' }
      };
    }

    if (ep.boundInterface === 'UNBOUND') {
      return {
        status: 503,
        data: { error: 'Service Unavailable', message: `Endpoint ${ep.path} is not bound to any active network interface.` },
        headers: { 'X-Vault-Status': 'UNBOUND' }
      };
    }

    // If bound to open interface, check incoming Authorization / Signature headers
    if (ep.isPublicInterface) {
      const authHeader = req.headers['Authorization'] || req.headers['authorization'];
      const sigHeader = req.headers['X-Vault-Signature'] || req.headers['x-vault-signature'];

      const hasValidToken = (authHeader && authHeader.startsWith('Bearer vlt_sig_')) || (sigHeader && sigHeader.startsWith('vlt_sig_'));

      if (!hasValidToken) {
        this.addAuditLog({
          event: 'AUTH_REJECTED',
          endpointId: ep.id,
          endpointPath: ep.path,
          details: `401 Unauthorized: Request to open interface endpoint ${ep.path} was rejected due to missing or invalid X-Vault-Signature.`,
          severity: 'WARN'
        });

        return {
          status: 401,
          data: {
            error: 'Unauthorized',
            code: 'VAULT_AUTH_REQUIRED',
            message: 'Access to this open interface endpoint requires valid X-Vault-Signature cryptographic header.'
          },
          headers: { 'X-Vault-Auth': 'REQUIRED', 'WWW-Authenticate': 'Bearer realm="TheVault"' }
        };
      }
    }

    ep.totalRequests++;
    ep.lastAccess = new Date().toLocaleTimeString();

    return {
      status: 200,
      data: {
        status: 'SUCCESS',
        endpoint: ep.path,
        source: ep.source,
        timestamp: new Date().toISOString(),
        vaultSignatureVerified: true,
        signingKey: ep.signedByVaultKeyId,
        payload: {
          simulatedDataStream: `[VAULT_ENCRYPTED_STREAM] Source: ${ep.sourceTarget}`,
          recordCount: 24,
          integrityHash: 'sha256:d8a4f910bb38201ac09e',
          sample: [
            { id: 1, name: 'Alice Enterprise', status: 'ACTIVE', role: 'ADMIN' },
            { id: 2, name: 'Bob Systems', status: 'ACTIVE', role: 'AUDITOR' }
          ]
        }
      },
      headers: {
        'Content-Type': 'application/json',
        'X-Vault-Verified': 'TRUE',
        'X-Vault-Key-ID': ep.signedByVaultKeyId || 'VAULT_ROOT',
        'X-RateLimit-Limit': String(ep.rateLimitPerMin)
      }
    };
  }

  private static addAuditLog(entry: Omit<VaultAuditLogEntry, 'id' | 'timestamp'>) {
    this.auditLogs.unshift({
      ...entry,
      id: `vlog_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toLocaleTimeString()
    });
    if (this.auditLogs.length > 200) {
      this.auditLogs.pop();
    }
  }
}
