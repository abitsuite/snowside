/**
 * Snowside Federation Service
 *
 * Polls the bridge API for pending deposits/withdrawals and processes them:
 *   1. Assigns HD-derived deposit addresses to pending deposits
 *   2. Monitors Esplora for incoming L1 transactions
 *   3. Mints ECX on Snowside L2 via NativeMinter precompile
 *   4. Processes withdrawals by sending L1 funds back
 */

import {
  createWalletClient,
  createPublicClient,
  http,
  type WalletClient,
  type PublicClient,
  type Chain,
} from 'viem';
import { privateKeyToAccount, type PrivateKeyAccount } from 'viem/accounts';
import { HDWallet } from './wallet.js';
import {
  buildSignAndBroadcastWithdrawal, ecxToSats,
  type FundedDeposit,
} from './withdraw.js';

// ── Configuration ───────────────────────────────────────────────

const API_URL = process.env.API_URL || 'https://snowside.network/v1';
const FEDERATION_TOKEN = process.env.FEDERATION_TOKEN || 'dev-secret';
const HD_MNEMONIC = process.env.HD_MNEMONIC || '';
const EWOQ_PRIVATE_KEY = process.env.EWOQ_PRIVATE_KEY || '';
const POLL_MS = parseInt(process.env.POLL_MS || '10000');

const RPC_URLS: Record<string, string> = {
  mainnet: process.env.MAINNET_RPC || '',
  testnet: process.env.TESTNET_RPC || '',
  signet: process.env.SIGNET_RPC || '',
};

const ESPLORA_URLS: Record<string, string> = {
  mainnet:
    process.env.MAINNET_ESPLORA || '',
  testnet:
    process.env.TESTNET_ESPLORA || 'https://esplora.drynet4.drivechain.dev',
  signet:
    process.env.SIGNET_ESPLORA || 'https://esplora.signet.drivechain.info',
};

const NATIVE_MINTER = '0x0200000000000000000000000000000000000001';
const CHAIN_IDS: Record<string, number> = {
  mainnet: 32904,
  testnet: 33160,
  signet: 33352,
};

// 1 XEC = 100 satoshis; 1 ECX = 10^18 (18 decimals)
// Mint amount = satoshis * 10^16 to convert sats → ECX with 18 decimals
const XEC_TO_ECX_MULTIPLIER = BigInt(10) ** BigInt(16);

// ── Types ───────────────────────────────────────────────────────

interface Deposit {
  id: string;
  network: string;
  snowside_address: string;
  ecash_address: string | null;
  derivation_index: number | null;
  amount_xec: number | null;
  amount_ecx: number | null;
  ecash_tx_hash: string | null;
  mint_tx_hash: string | null;
  status: string;
  created_at: number;
}

interface Withdrawal {
  id: string;
  network: string;
  snowside_address: string;
  ecash_address: string;
  amount_ecx: string | null;
  amount_xec: number | null;
  burn_tx_hash: string | null;
  ecash_tx_hash: string | null;
  status: string;
  created_at: number;
}

// ── Chain definitions ───────────────────────────────────────────

function getChain(network: string): Chain {
  const id = CHAIN_IDS[network];
  const rpc = RPC_URLS[network];
  return {
    id,
    name: `snowside-${network}`,
    nativeCurrency: { name: 'ECX', symbol: 'ECX', decimals: 18 },
    rpcUrls: { default: { http: [rpc] } },
  };
}

// ── viem client cache ───────────────────────────────────────────

const walletClients: Record<string, WalletClient> = {};
const publicClients: Record<string, PublicClient> = {};
let account: PrivateKeyAccount | null = null;

function getAccount(): PrivateKeyAccount {
  if (!account) {
    if (!EWOQ_PRIVATE_KEY) throw new Error('EWOQ_PRIVATE_KEY not set');
    const key = EWOQ_PRIVATE_KEY.startsWith('0x')
      ? EWOQ_PRIVATE_KEY
      : `0x${EWOQ_PRIVATE_KEY}`;
    account = privateKeyToAccount(key as `0x${string}`);
    console.log(`[viem] Account: ${account.address}`);
  }
  return account;
}

function getWalletClient(network: string): WalletClient {
  if (!walletClients[network]) {
    const rpc = RPC_URLS[network];
    if (!rpc) throw new Error(`No RPC URL for network: ${network}`);
    walletClients[network] = createWalletClient({
      account: getAccount(),
      chain: getChain(network),
      transport: http(),
    });
  }
  return walletClients[network];
}

function getPublicClient(network: string): PublicClient {
  if (!publicClients[network]) {
    const rpc = RPC_URLS[network];
    if (!rpc) throw new Error(`No RPC URL for network: ${network}`);
    publicClients[network] = createPublicClient({
      chain: getChain(network),
      transport: http(),
    });
  }
  return publicClients[network];
}

// ── HTTP helpers ────────────────────────────────────────────────

async function apiGet(path: string): Promise<any> {
  const resp = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${FEDERATION_TOKEN}` },
  });
  if (!resp.ok) throw new Error(`API GET ${path} failed: ${resp.status}`);
  return resp.json();
}

async function apiPatch(path: string, body: any): Promise<any> {
  const resp = await fetch(`${API_URL}${path}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${FEDERATION_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) throw new Error(`API PATCH ${path} failed: ${resp.status}`);
  return resp.json();
}

async function apiPost(path: string, body?: any): Promise<any> {
  const resp = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${FEDERATION_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!resp.ok) throw new Error(`API POST ${path} failed: ${resp.status}`);
  return resp.json();
}

// ── HD Wallet ───────────────────────────────────────────────────

let wallet: HDWallet | null = null;

function getWallet(): HDWallet {
  if (!wallet) {
    if (!HD_MNEMONIC) throw new Error('HD_MNEMONIC env var not set');
    wallet = new HDWallet(HD_MNEMONIC);
    console.log('[wallet] HD wallet initialized');
  }
  return wallet;
}

// ── Esplora ─────────────────────────────────────────────────────

/**
 * Check if a deposit address has received any UTXOs via Esplora.
 * Returns the total received amount (in satoshis) and tx hash, or null.
 */
async function checkAddressForDeposits(
  network: string,
  address: string,
): Promise<{ amount: number; txHash: string } | null> {
  const esploraUrl = ESPLORA_URLS[network];
  if (!esploraUrl) return null;

  // Strip ecash: prefix for Esplora API
  const cleanAddr = address.replace('ecash:', '').replace('bitcoincash:', '');

  try {
    const resp = await fetch(`${esploraUrl}/address/${cleanAddr}/utxo`);
    if (!resp.ok) return null;
    const utxos = (await resp.json()) as Array<{
      txid: string;
      value: number;
    }>;
    if (!Array.isArray(utxos) || utxos.length === 0) return null;

    const totalSats = utxos.reduce(
      (sum: number, utxo: any) => sum + (utxo.value || 0),
      0,
    );
    const txHash = utxos[0].txid || '';

    return { amount: totalSats, txHash };
  } catch (err) {
    console.error(`[esplora] Error checking ${address}:`, err);
    return null;
  }
}

// ── Snowside L2 minting ─────────────────────────────────────────

// NativeMinter.mintNativeCoin(address,uint256) selector = 0x4f5aaaba
const MINT_SELECTOR = '0x4f5aaaba';

/**
 * Encode a mintNativeCoin(address to, uint256 amount) call.
 */
function encodeMintCall(toAddress: string, amount: bigint): `0x${string}` {
  const addressPadded = toAddress
    .toLowerCase()
    .replace(/^0x/, '')
    .padStart(64, '0');
  const amountHex = amount.toString(16).padStart(64, '0');
  return `${MINT_SELECTOR}${addressPadded}${amountHex}` as `0x${string}`;
}

/**
 * Mint ECX tokens on Snowside L2 via the NativeMinter precompile.
 */
async function mintEcx(
  network: string,
  toAddress: string,
  satAmount: number,
): Promise<string | null> {
  if (!RPC_URLS[network] || !EWOQ_PRIVATE_KEY) {
    console.log(`[mint] No RPC or private key for ${network}, skipping`);
    return null;
  }

  try {
    const client = getWalletClient(network);
    const amount = BigInt(satAmount) * XEC_TO_ECX_MULTIPLIER;
    const data = encodeMintCall(toAddress, amount);

    const txHash = await client.sendTransaction({
      to: NATIVE_MINTER as `0x${string}`,
      data,
      account: getAccount(),
      chain: getChain(network),
    });

    // Wait for transaction receipt
    const publicClient = getPublicClient(network);
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    if (receipt.status === 'success') {
      console.log(
        `[mint] MintedNativeCoin ${satAmount} sats as ECX to ${toAddress}: ${txHash}`,
      );
      return txHash;
    } else {
      console.error(`[mint] Transaction reverted: ${txHash}`);
      return null;
    }
  } catch (err) {
    console.error(`[mint] Error minting on ${network}:`, err);
    if (err && typeof err === 'object') {
      console.error('[mint] Error details:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    }
    return null;
  }
}

// ── Deposit processing ──────────────────────────────────────────

/**
 * Assign a deposit address to a pending deposit using HD wallet.
 * Uses a timestamp-based index (TODO: query max derivation_index from API).
 */
async function assignDepositAddress(deposit: Deposit): Promise<void> {
  if (deposit.ecash_address) return;

  const index = Math.floor(Date.now() / 1000) % 1000000;
  const address = getWallet().deriveDepositAddress(deposit.network, index);

  await apiPatch(`/fed/deposit/${deposit.id}`, {
    ecash_address: address,
    derivation_index: index,
  });

  console.log(
    `[deposit] Assigned ${address} (index ${index}) to ${deposit.id}`,
  );
}

/**
 * Check if a deposit has received L1 funds and mint ECX if so.
 */
async function processDeposit(deposit: Deposit): Promise<void> {
  if (!deposit.ecash_address || deposit.status === 'minted') return;

  const result = await checkAddressForDeposits(
    deposit.network,
    deposit.ecash_address,
  );

  if (!result) return;

  if (deposit.status === 'pending') {
    await apiPatch(`/fed/deposit/${deposit.id}`, {
      status: 'confirmed',
      amount_xec: result.amount,
      ecash_tx_hash: result.txHash,
    });
    console.log(
      `[deposit] Confirmed ${deposit.id}: ${result.amount} sats, tx ${result.txHash}`,
    );
  }

  // Mint ECX (works for both freshly-confirmed and previously-confirmed deposits)
  console.log(`[mint] Attempting to mintNativeCoin ECX for ${deposit.id} on ${deposit.network}...`);
  const mintTxHash = await mintEcx(
    deposit.network,
    deposit.snowside_address,
    result.amount,
  );

  if (mintTxHash) {
    const ecxAmount = Number(BigInt(result.amount) * XEC_TO_ECX_MULTIPLIER);
    await apiPatch(`/fed/deposit/${deposit.id}`, {
      status: 'minted',
      amount_ecx: ecxAmount,
      mint_tx_hash: mintTxHash,
    });
    console.log(`[deposit] Minted ECX for ${deposit.id}: ${mintTxHash}`);
  }
}

// ── Withdrawal processing ───────────────────────────────────────

/**
 * Verify a burn transaction on Snowside L2.
 */
async function verifyBurnTx(
  network: string,
  burnTxHash: string,
): Promise<boolean> {
  if (!burnTxHash) return false;
  try {
    const client = getPublicClient(network);
    const tx = await client.getTransaction({
      hash: burnTxHash as `0x${string}`,
    });
    if (!tx) return false;
    // TODO: parse tx input to verify burn to correct address for correct amount
    return true;
  } catch (err) {
    console.error(`Burn verification failed for ${burnTxHash}:`, err);
    return false;
  }
}

/**
 * Fetch funded deposits (confirmed/minted with UTXOs) from the API.
 */
async function fetchFundedDeposits(): Promise<FundedDeposit[]> {
  try {
    const resp = await fetch(`${API_URL}/fed/deposits/funded`, {
      headers: { Authorization: `Bearer ${FEDERATION_TOKEN}` },
    });
    if (!resp.ok) {
      console.error(`[deposits] Failed to fetch funded: ${resp.status}`);
      return [];
    }
    return (await resp.json()) as FundedDeposit[];
  } catch (err) {
    console.error('[deposits] Error fetching funded:', err);
    return [];
  }
}

/**
 * Process a pending withdrawal.
 * Verifies the burn tx on L2, then builds, signs, and broadcasts an L1
 * transaction sending XEC/sats from federation UTXOs to the user's address.
 */
async function processWithdrawal(withdrawal: Withdrawal): Promise<void> {
  if (withdrawal.status !== 'pending') return;

  console.log(
    `[withdraw] Processing ${withdrawal.id}: ${withdrawal.amount_ecx} ECX to ${withdrawal.ecash_address}`,
  );

  // Require a burn tx hash (proof the user burned ECX on L2)
  if (!withdrawal.burn_tx_hash) {
    console.log(`[withdraw] ${withdrawal.id}: no burn tx hash, skipping`);
    return;
  }

  if (!EWOQ_PRIVATE_KEY) {
    console.log(`[withdraw] ${withdrawal.id}: no EWOQ key, skipping`);
    return;
  }

  // Verify the burn tx on L2
  const verified = await verifyBurnTx(
    withdrawal.network,
    withdrawal.burn_tx_hash,
  );
  if (!verified) {
    console.error(
      `[withdraw] ${withdrawal.id}: burn tx verification failed`,
    );
    return;
  }

  console.log(
    `[withdraw] ${withdrawal.id}: burn tx verified, sending L1 funds...`,
  );

  // Fetch funded deposits (UTXOs we can spend)
  const fundedDeposits = await fetchFundedDeposits();
  if (fundedDeposits.length === 0) {
    console.error(`[withdraw] ${withdrawal.id}: no funded deposits available`);
    return;
  }

  // Derive a change address (use a high index to avoid collision)
  const changeIndex = Math.floor(Date.now() / 1000) % 1000000;
  const changeAddress = getWallet().deriveDepositAddress(
    withdrawal.network,
    changeIndex,
  );

  // Get the Esplora URL for this network
  const esploraUrl = ESPLORA_URLS[withdrawal.network];
  if (!esploraUrl) {
    console.error(`[withdraw] ${withdrawal.id}: no Esplora URL for ${withdrawal.network}`);
    return;
  }

  // Build, sign, and broadcast the withdrawal transaction
  const l1TxHash = await buildSignAndBroadcastWithdrawal(
    withdrawal.network,
    withdrawal,
    fundedDeposits,
    esploraUrl,
    getWallet(),
    changeAddress,
  );

  if (!l1TxHash) {
    console.error(
      `[withdraw] ${withdrawal.id}: L1 transaction failed`,
    );
    return;
  }

  // Calculate amount_xec if not already set
  const amountXec = withdrawal.amount_xec || ecxToSats(withdrawal.amount_ecx);

  // Update the withdrawal record via API
  await apiPatch(`/fed/withdraw/${withdrawal.id}`, {
    status: 'completed',
    ecash_tx_hash: l1TxHash,
    amount_xec: amountXec,
    completed_at: Date.now(),
  });

  console.log(
    `[withdraw] ${withdrawal.id}: completed! L1 tx: ${l1TxHash}, amount: ${amountXec} sats`,
  );
}

// ── Main loop ───────────────────────────────────────────────────

async function checkIn(): Promise<void> {
  try {
    await apiPost('/fed/checkin');
  } catch (err) {
    console.error('[checkin] Failed:', err);
  }
}

async function processPendingDeposits(): Promise<void> {
  try {
    const deposits: Deposit[] = await apiGet('/fed/deposits/pending');

    for (const deposit of deposits) {
      try {
        if (!deposit.ecash_address) {
          await assignDepositAddress(deposit);
        } else {
          await processDeposit(deposit);
        }
      } catch (err) {
        console.error(`[deposit] Error processing ${deposit.id}:`, err);
      }
    }
  } catch (err) {
    console.error('[deposits] Error fetching pending:', err);
  }
}

const WITHDRAWAL_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

async function processPendingWithdrawals(): Promise<void> {
  try {
    const withdrawals: Withdrawal[] = await apiGet(
      '/fed/withdrawals/pending',
    );

    const now = Date.now();

    for (const withdrawal of withdrawals) {
      try {
        // Auto-fail withdrawals older than 15 minutes
        const createdAt = withdrawal.created_at || 0;
        if (createdAt > 0 && now - createdAt > WITHDRAWAL_TIMEOUT_MS) {
          const ageMin = Math.floor((now - createdAt) / 60000);
          console.log(
            `[withdraw] ${withdrawal.id}: timed out (${ageMin}min old), auto-failing`,
          );
          await apiPatch(`/fed/withdraw/${withdrawal.id}`, {
            status: 'failed',
            completed_at: now,
          });
          continue;
        }
        await processWithdrawal(withdrawal);
      } catch (err) {
        console.error(`[withdraw] Error processing ${withdrawal.id}:`, err);
      }
    }
  } catch (err) {
    console.error('[withdrawals] Error fetching pending:', err);
  }
}

async function main(): Promise<void> {
  console.log('Snowside Federation Service (viem)');
  console.log(`  API: ${API_URL}`);
  console.log(`  HD wallet: ${HD_MNEMONIC ? 'set' : 'NOT SET'}`);
  console.log(`  EWOQ key: ${EWOQ_PRIVATE_KEY ? 'set' : 'NOT SET'}`);
  console.log('  L2 Networks (Snowside RPC):');
  for (const [net, rpc] of Object.entries(RPC_URLS)) {
    console.log(`    ${net}: ${rpc || '(not set)'}`);
  }
  console.log('  L1 Networks (Esplora):');
  for (const [net, url] of Object.entries(ESPLORA_URLS)) {
    console.log(`    ${net}: ${url}`);
  }
  console.log(`  Poll interval: ${POLL_MS}ms`);
  console.log('---');

  while (true) {
    try {
      await checkIn();
      await processPendingDeposits();
      await processPendingWithdrawals();
    } catch (err) {
      console.error('Poll error:', err);
    }
    await new Promise((r) => setTimeout(r, POLL_MS));
  }
}

main().catch(console.error);
