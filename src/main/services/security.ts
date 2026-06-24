import ElectronStore from 'electron-store';
import bcrypt from 'bcryptjs';
import { createHash } from 'crypto';
import { hostname, userInfo } from 'os';

const SALT_ROUNDS = 10;

interface SecureStoreSchema {
  encryptedKeys: Record<string, string>;
}

let store: ElectronStore<SecureStoreSchema> | null = null;

/**
 * Generate a machine-specific encryption key derived from system identifiers.
 * This provides better protection than a hardcoded key since it is unique per machine.
 */
function getMachineEncryptionKey(): string {
  const machineId = `${hostname()}-${userInfo().username}-apex-pos`;
  return createHash('sha256').update(machineId).digest('hex');
}

function getStore(): ElectronStore<SecureStoreSchema> {
  if (!store) {
    store = new ElectronStore<SecureStoreSchema>({
      name: 'apex-secure-store',
      encryptionKey: getMachineEncryptionKey(),
      defaults: {
        encryptedKeys: {},
      },
    });
  }
  return store;
}

// API Key Management
export function storeApiKey(keyName: string, value: string): void {
  const secureStore = getStore();
  const keys = secureStore.get('encryptedKeys', {});
  keys[keyName] = value;
  secureStore.set('encryptedKeys', keys);
}

export function getApiKey(keyName: string): string | null {
  const secureStore = getStore();
  const keys = secureStore.get('encryptedKeys', {});
  return keys[keyName] || null;
}

export function deleteApiKey(keyName: string): void {
  const secureStore = getStore();
  const keys = secureStore.get('encryptedKeys', {});
  delete keys[keyName];
  secureStore.set('encryptedKeys', keys);
}

export function listApiKeys(): string[] {
  const secureStore = getStore();
  const keys = secureStore.get('encryptedKeys', {});
  return Object.keys(keys);
}

// PIN Hashing
export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, SALT_ROUNDS);
}

export async function verifyPin(pin: string, hashedPin: string): Promise<boolean> {
  return bcrypt.compare(pin, hashedPin);
}

// Password Hashing
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
