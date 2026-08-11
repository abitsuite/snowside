/**
 * Withdrawal transaction builder for Snowside Federation.
 *
 * Handles building, signing, and broadcasting L1 withdrawal transactions:
 *   - Bitcoin signet: P2WPKH (segwit) with SIGHASH_ALL
 *   - eCash (mainnet/testnet): P2PKH with SIGHASH_FORKID (BCH-style)
 *
 * Uses @scure/btc-signer for transaction construction.
 */

import { Transaction, p2wpkh, p2pkh, NETWORK, TEST_NETWORK} from '@scure/btc-signer';
import { hex } from '@scure/base';
import { HDWallet } from './wallet.js';

// Get @scure/btc-signer network object for address decoding
// signet/testnet use TEST_NETWORK (bech32 prefix 'tb')
// mainnet uses NETWORK (bech32 prefix 'bc')
function getBtcNetwork(network: string): typeof NETWORK {
  return network === 'signet' || network === 'testnet' ? TEST_NETWORK : NETWORK;
}

export interface Utxo {
  txid: string;
  vout: number;
  value: number;
  scriptPubKey: string;
}

export interface FundedDeposit {
  id: string;
  network: string;
  ecash_address: string;
  derivation_index: number;
  amount_sats: number;
}

export interface WithdrawalRequest {
  id: string;
  network: string;
  snowside_address: string;
  ecash_address: string;
  amount_ecx: string | number | null;
  amount_sats: number | null;
  burn_tx_hash: string | null;
  ecash_tx_hash: string | null;
  status: string;
}

// 1 ECX = 10^18 (18 decimals), 1 XEC = 100 satoshis
// sats = ecx / 10^16
// Network-specific conversion: 1 ECX pegged to 1 BTC or 1 XEC
// signet (Bitcoin): 1 ECX = 1 BTC = 100,000,000 sats → divisor = 10^10
// eCash (mainnet/testnet): 1 ECX = 1 XEC = 100 sats → divisor = 10^16
const ECX_TO_SATS_SIGNET = BigInt(10) ** BigInt(10);
const ECX_TO_SATS_XEC = BigInt(10) ** BigInt(16);

/**
 * Convert ECX amount (18 decimals) to satoshis.
 */
export function ecxToSats(
  amountEcx: string | number | null,
  network: string,
): number {
  if (!amountEcx) return 0;
  try {
    const str = String(amountEcx);
    const isSignet = network === 'signet';
    if (str.includes('.')) {
      // Decimal ECX amount (e.g., "0.1337" ECX from UI)
      const ecxFloat = parseFloat(str);
      const satsPerEcx = isSignet ? 100_000_000 : 100;
      return Math.floor(ecxFloat * satsPerEcx);
    } else {
      // Wei integer string (e.g., "1337000000000000000" from federation)
      const ecx = BigInt(str);
      const divisor = isSignet ? ECX_TO_SATS_SIGNET : ECX_TO_SATS_XEC;
      return Number(ecx / divisor);
    }
  } catch {
    return 0;
  }
}

/**
 * Strip ecash: or bitcoincash: prefix from an address for Esplora API.
 */
function cleanAddress(address: string): string {
  return address.replace('ecash:', '').replace('bitcoincash:', '');
}

/**
 * Fetch UTXOs for an address from Esplora.
 */
export async function fetchUtxos(
  esploraUrl: string,
  address: string,
): Promise<Utxo[]> {
  const clean = cleanAddress(address);
  try {
    const resp = await fetch(`${esploraUrl}/address/${clean}/utxo`);
    if (!resp.ok) return [];
    const data = (await resp.json()) as Array<Record<string, unknown>>;
    return data.map((u) => ({
      txid: String(u.txid || ''),
      vout: Number(u.vout || 0),
      value: Number(u.value || 0),
      scriptPubKey: String(u.scriptPubKey || u.scriptpubkey || ''),
    }));
  } catch (err) {
    console.error(`[utxo] Error fetching UTXOs for ${address}:`, err);
    return [];
  }
}

/**
 * Broadcast a raw transaction hex via Esplora.
 */
export async function broadcastTx(
  esploraUrl: string,
  rawHex: string,
): Promise<string | null> {
  try {
    const resp = await fetch(`${esploraUrl}/tx`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: rawHex,
    });
    if (!resp.ok) {
      const text = await resp.text();
      console.error(`[broadcast] Failed (${resp.status}): ${text}`);
      return null;
    }
    const txHash = (await resp.text()).trim();
    return txHash;
  } catch (err) {
    console.error('[broadcast] Error:', err);
    return null;
  }
}

/**
 * Select UTXOs to fund a withdrawal of targetSats + fee.
 * Simple greedy selection: largest UTXOs first.
 */
function selectUtxos(
  utxos: { utxo: Utxo; deposit: FundedDeposit }[],
  targetSats: number,
  feeSats: number,
): { utxo: Utxo; deposit: FundedDeposit }[] {
  const sorted = [...utxos].sort((a, b) => b.utxo.value - a.utxo.value);
  const selected: { utxo: Utxo; deposit: FundedDeposit }[] = [];
  let total = 0;
  const target = targetSats + feeSats;

  for (const item of sorted) {
    selected.push(item);
    total += item.utxo.value;
    if (total >= target) break;
  }

  if (total < target) {
    console.error(
      `[select] Insufficient funds: ${total} sats < ${target} needed`,
    );
    return [];
  }

  return selected;
}

/**
 * Build, sign, and broadcast a withdrawal transaction.
 *
 * @returns The L1 tx hash on success, null on failure.
 */
export async function buildSignAndBroadcastWithdrawal(
  network: string,
  withdrawal: WithdrawalRequest,
  fundedDeposits: FundedDeposit[],
  esploraUrl: string,
  wallet: HDWallet,
  changeAddress: string,
): Promise<string | null> {
  const isSignet = network === 'signet';

  // Calculate withdrawal amount in satoshis
  const targetSats =
    withdrawal.amount_sats || ecxToSats(withdrawal.amount_ecx, withdrawal.network);
  if (targetSats <= 0) {
    console.error(`[withdraw-tx] Invalid amount: ${targetSats} sats`);
    return null;
  }

  // Dust limit check (546 sats for P2PKH/P2WPKH outputs)
  const DUST_LIMIT = 546;
  if (targetSats < DUST_LIMIT) {
    console.error(
      `[withdraw-tx] Amount ${targetSats} sats below dust limit (${DUST_LIMIT} sats). Minimum withdrawal is ${DUST_LIMIT / 100} ECX.`,
    );
    return null;
  }

  // Collect UTXOs from funded deposits on the same network
  const allUtxos: { utxo: Utxo; deposit: FundedDeposit }[] = [];
  for (const deposit of fundedDeposits) {
    if (deposit.network !== network) continue;
    if (deposit.derivation_index == null) continue;

    const utxos = await fetchUtxos(esploraUrl, deposit.ecash_address);
    for (const utxo of utxos) {
      allUtxos.push({ utxo, deposit });
    }
  }

  if (allUtxos.length === 0) {
    console.error(`[withdraw-tx] No UTXOs available on ${network}`);
    return null;
  }

  console.log(
    `[withdraw-tx] Found ${allUtxos.length} UTXOs across ${fundedDeposits.length} deposits on ${network}`,
  );

  // Select UTXOs (flat 1000 sat fee for MVP)
  const feeSats = 1000;
  const selected = selectUtxos(allUtxos, targetSats, feeSats);
  if (selected.length === 0) {
    console.error(`[withdraw-tx] UTXO selection failed`);
    return null;
  }

  const totalInput = selected.reduce((s, u) => s + u.utxo.value, 0);
  const changeSats = totalInput - targetSats - feeSats;
  console.log(
    `[withdraw-tx] Input: ${totalInput} sats, Output: ${targetSats} sats, Change: ${changeSats} sats, Fee: ${feeSats} sats`,
  );

  try {
    // Build transaction
    const tx = new Transaction();

    // Add inputs
    for (const { utxo, deposit } of selected) {
      const keyPair = wallet.deriveKeyPair(network, deposit.derivation_index);
      if (!keyPair) {
        console.error(
          `[withdraw-tx] Failed to derive key for index ${deposit.derivation_index}`,
        );
        return null;
      }

      if (isSignet) {
        // P2WPKH (segwit): witnessUtxo with P2WPKH script
        const script = p2wpkh(keyPair.publicKey).script;
        tx.addInput({
          txid: hex.decode(utxo.txid),
          index: utxo.vout,
          witnessUtxo: {
            script,
            amount: BigInt(utxo.value),
          },
          sequence: 0xfffffffd,
        });
      } else {
        // P2PKH (eCash): use witnessUtxo to force BIP-143 sighash
        // The script is the P2PKH scriptPubKey
        const script = p2pkh(keyPair.publicKey).script;
        tx.addInput({
          txid: hex.decode(utxo.txid),
          index: utxo.vout,
          witnessUtxo: {
            script,
            amount: BigInt(utxo.value),
          },
          sequence: 0xfffffffd,
        });
      }
    }

    // Add output to user's withdrawal address
    const cleanOutAddr = cleanAddress(withdrawal.ecash_address);
    tx.addOutputAddress(cleanOutAddr, BigInt(targetSats), getBtcNetwork(network));

    // Add change output (if change > dust)
    if (changeSats > 546) {
      const cleanChangeAddr = cleanAddress(changeAddress);
      tx.addOutputAddress(cleanChangeAddr, BigInt(changeSats), getBtcNetwork(network));
    }

    // Sign each input with the correct derived private key
    for (let i = 0; i < selected.length; i++) {
      const { deposit } = selected[i];
      const keyPair = wallet.deriveKeyPair(network, deposit.derivation_index);
      if (!keyPair) continue;
      tx.sign(keyPair.privateKey, [i]);
    }

    // Extract raw hex
    const rawTx = tx.extract();
    const rawHex = hex.encode(rawTx);

    console.log(
      `[withdraw-tx] Built tx: ${selected.length} inputs, raw hex length: ${rawHex.length}`,
    );

    // Broadcast via Esplora
    const txHash = await broadcastTx(esploraUrl, rawHex);
    if (!txHash) {
      console.error('[withdraw-tx] Broadcast failed');
      return null;
    }

    console.log(`[withdraw-tx] Broadcast successful: ${txHash}`);
    return txHash;
  } catch (err) {
    console.error('[withdraw-tx] Error building/signing tx:', err);
    if (err instanceof Error) {
      console.error(`[withdraw-tx] ${err.message}`);
      console.error(`[withdraw-tx] ${err.stack}`);
    }
    return null;
  }
}
