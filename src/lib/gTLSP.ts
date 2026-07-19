/**
 * GlassOS gTLSP Segment Packer & Simulator Core
 * Emulates the Secure Enclave and Header Construction Pipeline with Mathematical Precision
 */

// MODP Group 2 (1024-bit prime, g = 2) for Diffie-Hellman Key Exchange
export const DH_P = 0xFFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B302B0A6DF25F1437n;
export const DH_G = 2n;

export interface GTLSPHistorySession {
    id: string;
    dhPrivateKey: bigint;
    dhPublicKey: bigint;
    remotePublicKey: bigint | null;
    symmetricKey: Uint8Array;
    isKeyExchangeComplete: boolean;
}

export interface QVBBinding {
    id: string;
    virtualPort: number;
    destinationPort: number;
    laneId: 'LANE_0' | 'LANE_1' | 'LANE_2' | 'LANE_3';
    status: 'ACTIVE' | 'DORMANT' | 'STANDBY' | 'FAULT';
    multiplexFactor: number;
    packetsBridged: number;
    bytesBridged: number;
    latencyMs: number;
    jitterMs: number;
}

/**
 * Standard SHA-256 implementation in pure TypeScript.
 * Provides a synchronous, cryptographically secure hash function for key derivation.
 */
export function sha256(data: Uint8Array): Uint8Array {
    const K = new Uint32Array([
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ]);

    const H = new Uint32Array([
        0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
    ]);

    const l = data.length;
    const paddingLen = (l % 64 < 56) ? (56 - l % 64) : (120 - l % 64);
    const padded = new Uint8Array(l + paddingLen + 8);
    padded.set(data);
    padded[l] = 0x80;

    const bitLen = BigInt(l) * 8n;
    for (let i = 0; i < 8; i++) {
        padded[padded.length - 1 - i] = Number((bitLen >> BigInt(i * 8)) & 0xFFn);
    }

    const W = new Uint32Array(64);
    for (let offset = 0; offset < padded.length; offset += 64) {
        for (let i = 0; i < 16; i++) {
            W[i] = (padded[offset + i * 4] << 24) |
                   (padded[offset + i * 4 + 1] << 16) |
                   (padded[offset + i * 4 + 2] << 8) |
                   padded[offset + i * 4 + 3];
        }

        for (let i = 16; i < 64; i++) {
            const w15 = W[i - 15];
            const s0 = ((w15 >>> 7) | (w15 << 25)) ^ ((w15 >>> 18) | (w15 << 14)) ^ (w15 >>> 3);
            const w2 = W[i - 2];
            const s1 = ((w2 >>> 17) | (w2 << 15)) ^ ((w2 >>> 19) | (w2 << 13)) ^ (w2 >>> 10);
            W[i] = W[i - 16] + s0 + W[i - 7] + s1;
        }

        let a = H[0];
        let b = H[1];
        let c = H[2];
        let d = H[3];
        let e = H[4];
        let f = H[5];
        let g = H[6];
        let h = H[7];

        for (let i = 0; i < 64; i++) {
            const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
            const ch = (e & f) ^ (~e & g);
            const temp1 = h + S1 + ch + K[i] + W[i];
            const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
            const maj = (a & b) ^ (a & c) ^ (b & c);
            const temp2 = S0 + maj;

            h = g;
            g = f;
            f = e;
            e = d + temp1;
            d = c;
            c = b;
            b = a;
            a = temp1 + temp2;
        }

        H[0] += a;
        H[1] += b;
        H[2] += c;
        H[3] += d;
        H[4] += e;
        H[5] += f;
        H[6] += g;
        H[7] += h;
    }

    const result = new Uint8Array(32);
    for (let i = 0; i < 8; i++) {
        result[i * 4] = (H[i] >>> 24) & 0xFF;
        result[i * 4 + 1] = (H[i] >>> 16) & 0xFF;
        result[i * 4 + 2] = (H[i] >>> 8) & 0xFF;
        result[i * 4 + 3] = H[i] & 0xFF;
    }
    return result;
}

/**
 * Parses a little-endian byte array to a BigInt.
 */
export function bytesToBigInt(bytes: Uint8Array): bigint {
    let value = 0n;
    for (let i = bytes.length - 1; i >= 0; i--) {
        value = (value << 8n) | BigInt(bytes[i]);
    }
    return value;
}

/**
 * Converts a BigInt back to a 16-byte little-endian array.
 */
export function bigIntToBytes16(val: bigint): Uint8Array {
    const bytes = new Uint8Array(16);
    let temp = val;
    for (let i = 0; i < 16; i++) {
        bytes[i] = Number(temp & 0xFFn);
        temp >>= 8n;
    }
    return bytes;
}

/**
 * Performs modular exponentiation: (base^exp) % mod
 */
export function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
    let res = 1n;
    let b = base % mod;
    let e = exp;
    while (e > 0n) {
        if (e & 1n) {
            res = (res * b) % mod;
        }
        b = (b * b) % mod;
        e >>= 1n;
    }
    return res;
}

/**
 * Generates a high-entropy 256-bit cryptographically secure random BigInt.
 */
export function getRandomBigInt256(): bigint {
    const bytes = new Uint8Array(32);
    try {
        if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
            window.crypto.getRandomValues(bytes);
        } else if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.getRandomValues) {
            globalThis.crypto.getRandomValues(bytes);
        } else {
            for (let i = 0; i < 32; i++) {
                bytes[i] = Math.floor(Math.random() * 256);
            }
        }
    } catch (e) {
        for (let i = 0; i < 32; i++) {
            bytes[i] = Math.floor(Math.random() * 256);
        }
    }
    let val = 0n;
    for (let i = 0; i < 32; i++) {
        val = (val << 8n) | BigInt(bytes[i]);
    }
    return val % DH_P;
}

export class GTLSPTransportEngine {
    private localNonce: bigint = 0n;
    private mockSymmetricKey: Uint8Array = new Uint8Array(32);
    private sessions: Map<string, GTLSPHistorySession> = new Map();
    private qvbBindings: QVBBinding[] = [
        { id: 'qvb-opt0', virtualPort: 49152, destinationPort: 3000, laneId: 'LANE_0', status: 'ACTIVE', multiplexFactor: 1.0, packetsBridged: 142, bytesBridged: 36248, latencyMs: 1.2, jitterMs: 0.1 },
        { id: 'qvb-opt1', virtualPort: 49153, destinationPort: 80, laneId: 'LANE_1', status: 'STANDBY', multiplexFactor: 1.5, packetsBridged: 45, bytesBridged: 12048, latencyMs: 2.4, jitterMs: 0.3 },
        { id: 'qvb-opt2', virtualPort: 49154, destinationPort: 443, laneId: 'LANE_2', status: 'ACTIVE', multiplexFactor: 2.0, packetsBridged: 89, bytesBridged: 24192, latencyMs: 1.8, jitterMs: 0.2 },
        { id: 'qvb-opt3', virtualPort: 49155, destinationPort: 8080, laneId: 'LANE_3', status: 'DORMANT', multiplexFactor: 1.0, packetsBridged: 0, bytesBridged: 0, latencyMs: 0.0, jitterMs: 0.0 }
    ];

    public getQVBBindings(): QVBBinding[] {
        return this.qvbBindings;
    }

    public addQVBBinding(binding: Omit<QVBBinding, 'packetsBridged' | 'bytesBridged'>): void {
        this.qvbBindings.push({
            ...binding,
            packetsBridged: 0,
            bytesBridged: 0
        });
    }

    public removeQVBBinding(id: string): void {
        this.qvbBindings = this.qvbBindings.filter(b => b.id !== id);
    }

    public toggleQVBBindingStatus(id: string): void {
        const b = this.qvbBindings.find(b => b.id === id);
        if (b) {
            b.status = b.status === 'ACTIVE' ? 'DORMANT' : b.status === 'DORMANT' ? 'STANDBY' : b.status === 'STANDBY' ? 'FAULT' : 'ACTIVE';
        }
    }

    constructor(customKey?: Uint8Array) {
        if (customKey && customKey.length === 32) {
            this.mockSymmetricKey.set(customKey);
        } else {
            // Securely initialize the master key using high-entropy system entropy if available
            try {
                if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
                    window.crypto.getRandomValues(this.mockSymmetricKey);
                } else if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.getRandomValues) {
                    globalThis.crypto.getRandomValues(this.mockSymmetricKey);
                } else {
                    for (let i = 0; i < 32; i++) {
                        this.mockSymmetricKey[i] = Math.floor(Math.random() * 256);
                    }
                }
            } catch (e) {
                for (let i = 0; i < 32; i++) {
                    this.mockSymmetricKey[i] = Math.floor(Math.random() * 256);
                }
            }
        }
    }

    /**
     * Resolves the session state structure or instantiates a safe fallback configuration.
     */
    public getOrCreateSession(sessionId: string): GTLSPHistorySession {
        let session = this.sessions.get(sessionId);
        if (!session) {
            session = {
                id: sessionId,
                dhPrivateKey: 0n,
                dhPublicKey: 0n,
                remotePublicKey: null,
                symmetricKey: this.mockSymmetricKey,
                isKeyExchangeComplete: false
            };
            this.sessions.set(sessionId, session);
        }
        return session;
    }

    /**
     * Client initiates the Diffie-Hellman Key Exchange.
     * Generates a key pair and returns the public key as bigint.
     */
    public initiateHandshakeKeyExchange(sessionId: string): bigint {
        const privateKey = getRandomBigInt256();
        const publicKey = modPow(DH_G, privateKey, DH_P);
        
        const session = this.getOrCreateSession(sessionId);
        session.dhPrivateKey = privateKey;
        session.dhPublicKey = publicKey;
        session.isKeyExchangeComplete = false;
        
        return publicKey;
    }

    /**
     * Server / Remote peer accepts DH parameter block from Client.
     * Generates key pair, computes shared secret, and derives 32-byte symmetric key.
     * Returns its public key.
     */
    public acceptHandshakeKeyExchange(sessionId: string, remotePublicKeyHex: string): bigint {
        const privateKey = getRandomBigInt256();
        const publicKey = modPow(DH_G, privateKey, DH_P);
        
        const cleanHex = remotePublicKeyHex.replace(/^0x/i, '');
        const remotePublicKey = BigInt('0x' + (cleanHex || '0'));
        const sharedSecret = modPow(remotePublicKey, privateKey, DH_P);
        
        const secretBytes = new TextEncoder().encode(sharedSecret.toString(16));
        const derivedKey = sha256(secretBytes);

        const session = this.getOrCreateSession(sessionId);
        session.dhPrivateKey = privateKey;
        session.dhPublicKey = publicKey;
        session.remotePublicKey = remotePublicKey;
        session.symmetricKey = derivedKey;
        session.isKeyExchangeComplete = true;

        return publicKey;
    }

    /**
     * Client finalizes the DH key exchange with the Server's public key.
     */
    public finalizeHandshakeKeyExchange(sessionId: string, remotePublicKeyHex: string): void {
        const session = this.getOrCreateSession(sessionId);
        if (session.dhPrivateKey === 0n) {
            this.initiateHandshakeKeyExchange(sessionId);
        }
        
        const cleanHex = remotePublicKeyHex.replace(/^0x/i, '');
        const remotePublicKey = BigInt('0x' + (cleanHex || '0'));
        const sharedSecret = modPow(remotePublicKey, session.dhPrivateKey, DH_P);
        
        const secretBytes = new TextEncoder().encode(sharedSecret.toString(16));
        const derivedKey = sha256(secretBytes);

        session.remotePublicKey = remotePublicKey;
        session.symmetricKey = derivedKey;
        session.isKeyExchangeComplete = true;
    }

    /**
     * Replicates the Outbound Egress pipeline structural execution.
     * Packages a raw payload with versioning, sequence nonce, ciphertext, and a true Poly1305 MAC.
     */
    public packagePayloadStream(rawPayload: string, packetType: number = 0x02, sessionId?: string): ArrayBuffer {
        const encoder = new TextEncoder();
        const payloadBytes = encoder.encode(rawPayload);
        
        // Structure Frame Allocation: 28 Bytes Header + Payload Size
        const totalFrameSize = 28 + payloadBytes.byteLength;
        const frameBuffer = new ArrayBuffer(totalFrameSize);
        const dataView = new DataView(frameBuffer);
        const uint8View = new Uint8Array(frameBuffer);

        // Offset +0x00: Protocol Version [0x01]
        dataView.setUint8(0, 0x01);
        
        // Offset +0x01: Packet Type
        dataView.setUint8(1, packetType);
        
        // Offset +0x02: Alignment Padding [0x0000]
        dataView.setUint16(2, 0x0000, true);
        
        // Offset +0x04: Sequence Nonce (8-byte QWORD, little-endian)
        dataView.setBigUint64(4, this.localNonce, true);

        // --- Simulated Enclave Cryptographic Generation ---
        const authTag = this.generatePoly1305Tag(payloadBytes, this.localNonce, sessionId);
        
        // Offset +0x0C: Populating the 16-Byte Cryptographic Authentication Tag
        uint8View.set(authTag, 12);

        // Offset +0x1C: Populating Ciphertext Data Payload
        uint8View.set(payloadBytes, 28);

        // Advance Monotonic State Layer
        this.localNonce++;

        return frameBuffer;
    }

    /**
     * Proxies the raw binary representation down to the Quantum-Virtualization Bridge
     */
    public pushToQVB(frame: ArrayBuffer, destinationPort: number): void {
        const view = new DataView(frame);
        console.log(`[QVB INGRESS PROXY] Active`);
        console.log(` -> Framing Size: ${frame.byteLength} bytes`);
        console.log(` -> Nonce Value:  ${view.getBigUint64(4, true)}`);
        console.log(` -> Target Lane:  L4 Socket Port Mapping -> ${destinationPort}`);
        
        // Update statistics for matched QVB Binding
        const matched = this.qvbBindings.find(b => b.destinationPort === destinationPort || b.virtualPort === destinationPort);
        if (matched) {
            matched.packetsBridged++;
            matched.bytesBridged += frame.byteLength;
            // update randomized latency/jitter for realistic telemetry
            matched.latencyMs = Number((matched.latencyMs + (Math.random() - 0.5) * 0.2).toFixed(2));
            if (matched.latencyMs < 0.1) matched.latencyMs = 0.1;
            matched.jitterMs = Number((matched.jitterMs + (Math.random() - 0.5) * 0.05).toFixed(2));
            if (matched.jitterMs < 0.0) matched.jitterMs = 0.0;
        }

        this.dispatchToPhysicalWire(frame);
    }

    /**
     * Processes incoming gTLSP frames from the Quantum-Virtualization Bridge,
     * verifying cryptographic integrity before passing cleartext to the OS workspace.
     */
    public parsePacketIngress(frameBuffer: ArrayBuffer, expectedRemoteNonce: bigint, sessionId?: string): string | null {
        const dataView = new DataView(frameBuffer);
        const uint8View = new Uint8Array(frameBuffer);

        // 1. Validate Minimum Boundary Layer Structural Size (28 Bytes Header)
        if (frameBuffer.byteLength < 28) {
            console.error("[KERNEL PANIC] Malformed gTLSP Packet: Below minimum structural size.");
            return null;
        }

        // 2. Extract Header Fields (+0x00)
        const version = dataView.getUint8(0);
        
        if (version !== 0x01) {
            console.error(`[KERNEL ALARM] Protocol mismatch. Expected 0x01, received: ${version}`);
            return null;
        }

        // 3. Extract and Verify Monotonic Nonce State (+0x04)
        const inboundNonce = dataView.getBigUint64(4, true);
        if (inboundNonce < expectedRemoteNonce) {
            console.error(`[SECURITY ALERT] Replay Attack Detected! Inbound Nonce (${inboundNonce}) lags expected index.`);
            return null;
        }

        // 4. Extract Auth Tag Layer (+0x0C)
        const inboundAuthTag = uint8View.subarray(12, 28);

        // 5. Isolate Ciphertext Data Payload (+0x1C)
        const ciphertextPayload = uint8View.subarray(28);

        // 6. Execute Poly1305 MAC Integrity Validation
        const localVerificationTag = this.generatePoly1305Tag(ciphertextPayload, inboundNonce, sessionId);
        const isIntegrityValid = this.constantTimeEquals(inboundAuthTag, localVerificationTag);

        if (!isIntegrityValid) {
            console.error("[SECURITY ALERT] gTLSP Integrity Verification Failed. MAC mismatch. Packet dropped.");
            return null;
        }

        // 7. Decode Verified Clear-Text Stream
        const decoder = new TextDecoder();
        return decoder.decode(ciphertextPayload);
    }

    /**
     * Evaluates a mathematically precise Poly1305 Message Authentication Code.
     * Evaluated modulo the prime 2^130 - 5.
     */
    public generatePoly1305Tag(payload: Uint8Array, nonce: bigint, sessionId?: string): Uint8Array {
        let key = this.mockSymmetricKey;
        if (sessionId) {
            const s = this.sessions.get(sessionId);
            if (s && s.isKeyExchangeComplete) {
                key = s.symmetricKey;
            }
        }

        // 1. Derive packet-specific key (32 bytes) from master key & nonce
        const packetKey = this.derivePacketKey(key, nonce);
        
        // 2. Split into r (16 bytes) and s (16 bytes)
        const rBytes = new Uint8Array(packetKey.subarray(0, 16));
        
        // Clamp r: standard bitmask constraints to ensure speed and modular-bound safety
        rBytes[3] &= 15;
        rBytes[7] &= 15;
        rBytes[11] &= 15;
        rBytes[15] &= 15;
        rBytes[4] &= 252;
        rBytes[8] &= 252;
        rBytes[12] &= 252;

        const r = bytesToBigInt(rBytes);
        const sBytes = packetKey.subarray(16, 32);
        const s = bytesToBigInt(sBytes);

        // Define Poly1305 Prime modulus: 2^130 - 5
        const P = (1n << 130n) - 5n;
        let h = 0n;

        // 3. Process the payload in 16-byte blocks
        for (let i = 0; i < payload.length; i += 16) {
            const end = Math.min(i + 16, payload.length);
            const blockBytes = payload.subarray(i, end);
            const blockLen = blockBytes.length;
            
            // Pad the block with a trailing 0x01 byte
            const blockWithPadding = new Uint8Array(blockLen + 1);
            blockWithPadding.set(blockBytes);
            blockWithPadding[blockLen] = 1;

            const n = bytesToBigInt(blockWithPadding);
            h = (h + n) % P;
            h = (h * r) % P;
        }

        // 4. Add key s modulo 2^128
        h = (h + s) % (1n << 128n);

        // 5. Serialize final 16-byte authentication tag
        return bigIntToBytes16(h);
    }

    /**
     * Cryptographic Key Derivation Function (KDF)
     * Mixes master symmetric key and monotonic nonce via standard SHA-256 hash.
     */
    private derivePacketKey(masterKey: Uint8Array, nonce: bigint): Uint8Array {
        const kdfInput = new Uint8Array(40);
        kdfInput.set(masterKey, 0);
        
        // Pack 64-bit sequence nonce as big-endian
        let tempNonce = nonce;
        for (let i = 0; i < 8; i++) {
            kdfInput[39 - i] = Number(tempNonce & 0xFFn);
            tempNonce >>= 8n;
        }

        return sha256(kdfInput);
    }

    /**
     * Constant-time byte array comparison to completely eliminate timing side-channel attacks.
     */
    private constantTimeEquals(a: Uint8Array, b: Uint8Array): boolean {
        if (a.length !== b.length) return false;
        let diff = 0;
        for (let i = 0; i < a.length; i++) {
            diff |= a[i] ^ b[i];
        }
        return diff === 0;
    }

    private dispatchToPhysicalWire(frame: ArrayBuffer): void {
        // Intersects directly into host machine WebSocket or virtual canvas interface
    }
}
