import { ethers } from 'ethers';

const API_URL = process.env.API_URL || 'https://snowside.network/v1';
const FED_TOKEN = process.env.FEDERATION_TOKEN || 'dev-secret';
const EWOQ_KEY = process.env.EWOQ_PRIVATE_KEY || '';
const ESPLORA_URL = process.env.ESPLORA_URL || 'https://esplora.drynet4.drivechain.dev';
const POLL_MS = parseInt(process.env.POLL_MS || '10000');

// RPC URLs for all three Snowside networks
const RPC_URLS: Record<string, string> = {
  mainnet: process.env.MAINNET_RPC || 'https://rpc.snowside.network/mainnet',
  testnet: process.env.TESTNET_RPC || 'https://rpc.snowside.network/testnet',
  signet: process.env.SIGNET_RPC || 'https://rpc.snowside.network/signet',
};

const NATIVE_MINTER = '0x0200000000000000000000000000000000000001';
const MINTER_ABI = ['function mint(address to, uint256 amount) external'];
const XEC_TO_ECX = BigInt(10) ** BigInt(16);

// Cache providers and wallets per network
const providers: Record<string, ethers.JsonRpcProvider> = {};
const wallets: Record<string, ethers.Wallet> = {};

function getWallet(network: string): ethers.Wallet {
  if (!wallets[network]) {
    const rpc = RPC_URLS[network];
    if (!rpc) throw new Error(`No RPC URL for network: ${network}`);
    if (!providers[network]) providers[network] = new ethers.JsonRpcProvider(rpc);
    if (!EWOQ_KEY) throw new Error('EWOQ_PRIVATE_KEY not set');
    wallets[network] = new ethers.Wallet(EWOQ_KEY, providers[network]);
  }
  return wallets[network];
}

async function api(path: string, init?: RequestInit) {
  const resp = await fetch(`${API_URL}${path}`, init);
  return resp.json();
}

function fedHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${FED_TOKEN}`,
  };
}

// Stub: generate eCash deposit address from deposit ID
// In production: HD wallet derivation with bip32 + ecashaddrjs
function generateEcashAddress(depositId: string): string {
  const hex = depositId.replace(/-/g, '');
  return `ecash:qz${hex.slice(0, 38)}`;
}

// Check Esplora for UTXOs on an address
async function checkDeposits(
  ecashAddr: string
): Promise<{ txHash: string; sat: number } | null> {
  const addr = ecashAddr.replace('ecash:', '').replace('bitcoincash:', '');
  try {
    const resp = await fetch(`${ESPLORA_URL}/address/${addr}/utxo`);
    if (!resp.ok) return null;
    const utxos = (await resp.json()) as Array<{ txid: string; value: number }>;
    if (utxos.length > 0) {
      return { txHash: utxos[0].txid, sat: utxos[0].value };
    }
  } catch (err) {
    console.error('Esplora error:', err);
  }
  return null;
}

// Mint ECX on the specified Snowside network via NativeMinter precompile
async function mintEcx(
  network: string,
  to: string,
  sat: number
): Promise<string> {
  const wallet = getWallet(network);
  const minter = new ethers.Contract(NATIVE_MINTER, MINTER_ABI, wallet);
  const amount = BigInt(sat) * XEC_TO_ECX;
  const tx = await minter.mint(to, amount);
  await tx.wait();
  return tx.hash;
}

// Verify a burn transaction on Snowside L2
// TODO: implement burn verification via NativeMinter or burn contract
async function verifyBurnTx(
  network: string,
  burnTxHash: string,
  expectedAddress: string,
  expectedAmount: string
): Promise<boolean> {
  if (!burnTxHash) return false;
  try {
    const provider = providers[network] || new ethers.JsonRpcProvider(RPC_URLS[network]);
    const tx = await provider.getTransaction(burnTxHash);
    if (!tx) return false;
    // TODO: parse tx input to verify it's a burn to the correct address for the correct amount
    // For now, just verify the tx exists
    return true;
  } catch (err) {
    console.error(`Burn verification failed for ${burnTxHash}:`, err);
    return false;
  }
}

async function poll() {
  // Federation check-in heartbeat
  await api('/fed/checkin', { method: 'POST', headers: fedHeaders() });

  // Process pending deposits across all networks
  const pending = (await api('/fed/deposits/pending', {
    headers: fedHeaders(),
  })) as any[];
  for (const dep of pending) {
    const network = dep.network || 'signet';

    if (!dep.ecash_address) {
      // Assign a deposit address to this deposit
      const addr = generateEcashAddress(dep.id);
      await api(`/fed/deposit/${dep.id}`, {
        method: 'PATCH',
        headers: fedHeaders(),
        body: JSON.stringify({ ecash_address: addr }),
      });
      console.log(`[${network}] Deposit ${dep.id}: assigned ${addr}`);
    } else {
      // Check Esplora for incoming eCash transaction
      const tx = await checkDeposits(dep.ecash_address);
      if (tx) {
        console.log(
          `[${network}] Deposit ${dep.id}: detected ${tx.sat} sats in ${tx.txHash}`
        );
        await api(`/fed/deposit/${dep.id}`, {
          method: 'PATCH',
          headers: fedHeaders(),
          body: JSON.stringify({
            status: 'confirmed',
            ecash_tx_hash: tx.txHash,
            amount_xec: tx.sat,
          }),
        });

        // Mint ECX on the correct Snowside network
        if (EWOQ_KEY) {
          try {
            const mintTx = await mintEcx(
              network,
              dep.snowside_address,
              tx.sat
            );
            await api(`/fed/deposit/${dep.id}`, {
              method: 'PATCH',
              headers: fedHeaders(),
              body: JSON.stringify({
                status: 'minted',
                mint_tx_hash: mintTx,
                amount_ecx: Number(BigInt(tx.sat) * XEC_TO_ECX),
              }),
            });
            console.log(
              `[${network}] Deposit ${dep.id}: minted via ${mintTx}`
            );
          } catch (err) {
            console.error(
              `[${network}] Deposit ${dep.id}: mint failed:`,
              err
            );
          }
        }
      }
    }
  }

  // Process pending withdrawals across all networks
  const wdPending = (await api('/fed/withdrawals/pending', {
    headers: fedHeaders(),
  })) as any[];
  for (const wd of wdPending) {
    const network = wd.network || 'signet';
    console.log(
      `[${network}] Withdrawal ${wd.id}: pending (amount: ${wd.amount_ecx} ECX, dest: ${wd.ecash_address})`
    );

    if (wd.burn_tx_hash && EWOQ_KEY) {
      // Verify burn tx on Snowside L2
      const verified = await verifyBurnTx(
        network,
        wd.burn_tx_hash,
        wd.snowside_address,
        wd.amount_ecx
      );
      if (verified) {
        console.log(
          `[${network}] Withdrawal ${wd.id}: burn tx verified, TODO: send XEC to ${wd.ecash_address}`
        );
        // TODO: Send XEC from federation eCash wallet to user's eCash address
        // TODO: Update withdrawal status to 'completed' with ecash_tx_hash
      } else {
        console.error(
          `[${network}] Withdrawal ${wd.id}: burn tx verification failed`
        );
      }
    } else {
      console.log(
        `[${network}] Withdrawal ${wd.id}: no burn tx hash, skipping`
      );
    }
  }
}

async function main() {
  console.log('Snowside Federation Service');
  console.log(`  API: ${API_URL}`);
  console.log('  Networks:');
  for (const [net, rpc] of Object.entries(RPC_URLS)) {
    console.log(`    ${net}: ${rpc}`);
  }
  console.log(`  Esplora: ${ESPLORA_URL}`);
  console.log(`  EWOQ key: ${EWOQ_KEY ? 'set' : 'NOT SET'}`);
  console.log(`  Poll interval: ${POLL_MS}ms`);
  console.log('---');

  while (true) {
    try {
      await poll();
    } catch (err) {
      console.error('Poll error:', err);
    }
    await new Promise((r) => setTimeout(r, POLL_MS));
  }
}

main().catch(console.error);
