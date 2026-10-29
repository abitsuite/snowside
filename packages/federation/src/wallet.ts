/**
 * HD Wallet for deposit address generation.
 *
 * Derives unique deposit addresses per network:
 *   eCash (mainnet/betanet): m/84'/0'/0'/0/{index} → bc1q... (Bech32 P2WPKH, Bitcoin formats, coin type 0')
 *   Bitcoin signet:          m/44'/1'/0'/0/{index} → tb1q... (Bech32 P2WPKH)
 *
 * NOTE: eCash (ecash.com, the L2L Bitcoin hard-fork) uses standard Bitcoin
 * address/key formats — NOT CashAddr. Betanet is a mainnet-fork rehearsal, so
 * mainnet and betanet share derivation (same addresses on both networks).
 */

import { HDKey } from '@scure/bip32';
import { mnemonicToSeedSync } from '@scure/bip39';
import { bech32 } from '@scure/base';
import { createHash } from 'crypto';

/** SHA256 → RIPEMD160 (Bitcoin's hash160) */
function hash160(pubkey: Uint8Array): Buffer {
  const sha = createHash('sha256').update(pubkey).digest();
  return createHash('ripemd160').update(sha).digest();
}

/** Convert byte array from 8-bit groups to 5-bit groups (BIP-173) */
function convertBits(
  data: Uint8Array,
  fromBits: number,
  toBits: number,
  pad: boolean,
): number[] {
  let acc = 0;
  let bits = 0;
  const ret: number[] = [];
  const maxv = (1 << toBits) - 1;
  const maxAcc = (1 << (fromBits + toBits - 1)) - 1;
  for (const value of data) {
    acc = ((acc << fromBits) | value) & maxAcc;
    bits += fromBits;
    while (bits >= toBits) {
      bits -= toBits;
      ret.push((acc >> bits) & maxv);
    }
  }
  if (pad && bits) ret.push((acc << (toBits - bits)) & maxv);
  return ret;
}

/** Encode a P2WPKH segwit address (bech32) */
function encodeSegwitAddress(
  hrp: string,
  version: number,
  program: Uint8Array,
): string {
  const data = [version, ...convertBits(program, 8, 5, true)];
  return bech32.encode(hrp, data);
}

/** HD derivation paths per network */
const DERIVATION_PATHS: Record<string, string> = {
  mainnet: "m/84'/0'/0'/0/", // eCash mainnet (Bitcoin coin type 0, BIP84 P2WPKH)
  testnet: "m/84'/0'/0'/0/", // eCash betanet (mainnet-fork formats; same addresses as mainnet)
  signet: "m/44'/1'/0'/0/", // Bitcoin signet (coin type 1 = testnet)
};

export class HDWallet {
  private master: HDKey;

  constructor(mnemonic: string) {
    const seed = mnemonicToSeedSync(mnemonic);
    this.master = HDKey.fromMasterSeed(seed);
  }

  /**
   * Derive a deposit address for the given network and index.
   *
   * @param network - 'mainnet', 'testnet', or 'signet'
   * @param index - Derivation index (0-based)
   * @returns The deposit address string (ecash:... or tb1q...)
   */
  deriveDepositAddress(network: string, index: number): string {
    const basePath = DERIVATION_PATHS[network];
    if (!basePath) throw new Error(`Unknown network: ${network}`);

    const child = this.master.derive(`${basePath}${index}`);
    if (!child.publicKey) throw new Error('Failed to derive public key');

    const pubKeyHash = hash160(child.publicKey);

    if (network === 'signet') {
      // Bitcoin signet: P2WPKH bech32 with 'tb' HRP
      return encodeSegwitAddress('tb', 0, new Uint8Array(pubKeyHash));
    }

    // eCash (mainnet/betanet): standard Bitcoin P2WPKH bech32 with 'bc' HRP
    return encodeSegwitAddress('bc', 0, new Uint8Array(pubKeyHash));
  }

  /**
   * Derive the private key for a given network and index.
   * Used for spending deposited funds (withdrawals).
   */
  derivePrivateKey(network: string, index: number): Buffer | null {
    const basePath = DERIVATION_PATHS[network];
    if (!basePath) throw new Error(`Unknown network: ${network}`);

    const child = this.master.derive(`${basePath}${index}`);
    if (!child.privateKey) return null;
    return Buffer.from(child.privateKey);
  }

  /**
   * Derive both private and public keys for a given network and index.
   * Used for building and signing withdrawal transactions.
   */
  deriveKeyPair(network: string, index: number): {
    privateKey: Uint8Array;
    publicKey: Uint8Array;
    pubkeyHash: Uint8Array;
  } | null {
    const basePath = DERIVATION_PATHS[network];
    if (!basePath) throw new Error(`Unknown network: ${network}`);

    const child = this.master.derive(`${basePath}${index}`);
    if (!child.privateKey || !child.publicKey) return null;

    const pubkeyHash = hash160(child.publicKey);
    return {
      privateKey: new Uint8Array(child.privateKey),
      publicKey: new Uint8Array(child.publicKey),
      pubkeyHash: new Uint8Array(pubkeyHash),
    };
  }
}
