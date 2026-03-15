/**
 * Server-side AES-256-GCM encryption for vestibular chart notes.
 *
 * Uses the Web Crypto API (crypto.subtle) available in Node 18+ and all modern browsers.
 *
 * Key derivation: HKDF(SHA-256) with IKM = NOTE_ENCRYPTION_KEY pepper + chartId.
 * Each chart ID gets a unique AES-256-GCM key.
 *
 * KV key obfuscation: HMAC-SHA256(pepper, chartId) first 16 bytes as hex,
 * so raw chart IDs are not visible in the KV key namespace.
 *
 * Storage format (v1):
 *   { v: 1, iv: "<base64url 12B>", ct: "<base64url ciphertext+GCM tag>", aad: "CHARTID", createdAt: timestamp }
 *
 * The aad field binds the ciphertext to its chart ID — ciphertext cannot be
 * transplanted from one chart ID to another and still decrypt successfully.
 */

const HKDF_INFO = new TextEncoder().encode('vestibular-note-encryption-v1')
const HKDF_SALT = new Uint8Array(32) // 32 zero bytes — acceptable since IKM already has 256-bit secret
const AES_KEY_LENGTH = 256 // bits
const IV_LENGTH = 12 // bytes (96-bit IV for AES-GCM, as recommended by NIST)
const TAG_LENGTH = 128 // bits (16-byte authentication tag)

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EncryptedNote {
  v: 1
  iv: string      // base64url-encoded 12-byte IV
  ct: string      // base64url-encoded ciphertext with appended 16-byte GCM auth tag
  aad: string     // chartId used as Additional Authenticated Data (uppercase)
  createdAt: number
}

export interface LegacyNote {
  narrative: string
  createdAt: number
}

export type StoredNote = EncryptedNote | LegacyNote

export function isEncryptedNote(note: StoredNote): note is EncryptedNote {
  return (note as EncryptedNote).v === 1
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function loadPepperBytes(): Uint8Array {
  const hex = process.env.NOTE_ENCRYPTION_KEY
  if (!hex || hex.length !== 64) {
    throw new Error(
      'NOTE_ENCRYPTION_KEY must be set as a 64-character hex string (32 bytes). ' +
      "Generate with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    )
  }
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error(
      'NOTE_ENCRYPTION_KEY contains invalid characters — must be hexadecimal (0-9, a-f).'
    )
  }
  const bytes = new Uint8Array(32)
  for (let i = 0; i < 32; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

function toBase64Url(buffer: ArrayBuffer): string {
  return Buffer.from(buffer)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

function fromBase64Url(str: string): ArrayBuffer {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
  const buf = Buffer.from(padded, 'base64')
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer
}

/**
 * Derive a unique AES-256-GCM CryptoKey for the given chartId.
 * IKM = pepper bytes || UTF-8(chartId.toUpperCase())
 */
async function deriveNoteKey(chartId: string): Promise<CryptoKey> {
  const pepper = loadPepperBytes()
  const chartIdBytes = new TextEncoder().encode(chartId.toUpperCase())

  // Concatenate pepper and chartId as input key material
  const ikm = new Uint8Array(pepper.length + chartIdBytes.length)
  ikm.set(pepper, 0)
  ikm.set(chartIdBytes, pepper.length)

  const baseKey = await crypto.subtle.importKey(
    'raw',
    ikm,
    { name: 'HKDF' },
    false, // not extractable
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: HKDF_SALT,
      info: HKDF_INFO,
    },
    baseKey,
    { name: 'AES-GCM', length: AES_KEY_LENGTH },
    false, // key never leaves WebCrypto internals
    ['encrypt', 'decrypt']
  )
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Derive the KV storage key for a given chartId.
 * Returns HMAC-SHA256(pepper, chartId)[0:16 bytes] as a 32-char hex string.
 * This hides raw chart IDs from anyone with read access to the KV key namespace.
 */
export async function deriveKvKey(chartId: string): Promise<string> {
  const pepper = loadPepperBytes()

  const hmacKey = await crypto.subtle.importKey(
    'raw',
    pepper,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const chartIdBytes = new TextEncoder().encode(chartId.toUpperCase())
  const sig = await crypto.subtle.sign('HMAC', hmacKey, chartIdBytes)

  // Use first 16 bytes (128-bit prefix) — unique enough for our scale
  return Array.from(new Uint8Array(sig).slice(0, 16))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Encrypt a plaintext narrative for the given chartId.
 * Returns an EncryptedNote with a random IV and the chartId bound as AAD.
 */
export async function encryptNote(
  chartId: string,
  plaintext: string,
  createdAt?: number
): Promise<EncryptedNote> {
  const key = await deriveNoteKey(chartId)
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const normalizedId = chartId.toUpperCase()
  const aad = new TextEncoder().encode(normalizedId)
  const plaintextBytes = new TextEncoder().encode(plaintext)

  // AES-GCM output from SubtleCrypto appends the 16-byte tag to the ciphertext
  const ciphertextWithTag = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
      additionalData: aad,
      tagLength: TAG_LENGTH,
    },
    key,
    plaintextBytes
  )

  return {
    v: 1,
    iv: toBase64Url(iv.buffer as ArrayBuffer),
    ct: toBase64Url(ciphertextWithTag),
    aad: normalizedId,
    createdAt: createdAt ?? Date.now(),
  }
}

/**
 * Decrypt an EncryptedNote for the given chartId.
 * Verifies the AAD matches the requested chartId before decrypting,
 * preventing ciphertext transplantation attacks.
 * Throws on tampered ciphertext (GCM auth tag failure) or AAD mismatch.
 */
export async function decryptNote(
  chartId: string,
  encryptedNote: EncryptedNote
): Promise<string> {
  const normalizedId = chartId.toUpperCase()

  if (encryptedNote.aad !== normalizedId) {
    throw new Error('Chart ID mismatch: ciphertext AAD does not match the requested chart ID')
  }

  const key = await deriveNoteKey(chartId)
  const iv = new Uint8Array(fromBase64Url(encryptedNote.iv))
  const ciphertextWithTag = fromBase64Url(encryptedNote.ct)
  const aad = new TextEncoder().encode(normalizedId)

  let plaintextBuffer: ArrayBuffer
  try {
    plaintextBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
        additionalData: aad,
        tagLength: TAG_LENGTH,
      },
      key,
      ciphertextWithTag
    )
  } catch {
    // SubtleCrypto throws a generic DOMException on auth tag failure — normalize it
    throw new Error('Decryption failed: the note ciphertext is invalid or has been tampered with')
  }

  return new TextDecoder().decode(plaintextBuffer)
}
