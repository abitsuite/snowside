import { ethers } from 'ethers';

const API_URL = process.env.API_URL || 'https://snowside.network/v1';
const FED_TOKEN = process.env.FEDERATION_TOKEN || 'dev-secret';
const EWOQ_KEY = process.env.EWOQ_PRIVATE_KEY || '';
const POLL_MS = parseInt(process.env.POLL_MS || '10000');

// RPC URLs for all three Snowside L2 networks
const RPC_URLS: Record<string, string> = {
  mainnet: process.env.MAINNET_RPC || 'https://rpc.snowside.network/mainnet',
  testnet: process.env.TESTNET_RPC || 'https://rpc.snowside.network/testnet',
  signet: process.env.SIGNET_RPC || 'https://rpc.snowside.network/signet',
};

// Esplora URLs for each L1 network
// mainnet -> eCash mainnet
// testnet -> eCash drynet4
// signet -> Bitcoin signet
const ESPLORA_URLS: Record<string, string> = {
  mainnet: process.env.MAINNET_ESPLORA || 'https://esplora.mainnet.drivechain.dev',
  testnet: process.env.TESTNET_ESPLORA || 'https://esplora.drynet4.drivechain.dev',
  signet: process.env.SIGNET_ESPLORA || 'https://esplora.signet.drivechain.info',
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

// Generate deposit address for the specified L1 network
// eCash networks: ecash:qz... (Base58)
// Bitcoin signet: tb1q... (Bech32)
// TODO: replace with proper HD wallet derivation (bip32 + ecashaddrjs/bitcoinjs-lib)
function generateDepositAddress(network: string, depositId: string): string {
  const hex = depositId.replace(/-/g, '');
  if (network === 'signet') {
    // Bitcoin signet uses bech32 tb1q addresses
    return `tb1q${hex.slice(0, 38)}`;
  }
  // eCash uses ecash: prefix with Base58
  return `ecash:qz${hex.slice(0, 38)}`;
}

// Check Esplora for UTXOs on an address (per-network)
async function checkDeposits(
  network: string,
  addr: string
): Promise<{ txHash: string; sat: number } | null> {
  const esploraUrl = ESPLORA_URLS[network];
  if (!esploraUrl) {
    console.error(`No Esplora URL for network: ${network}`);
    return null;
  }
  // Strip prefixes for Esplora API
  const cleanAddr = addr
    .replace('ecash:', '')
    .replace('bitcoincash:', '')
    .replace('tb1', 'tb1'); // bech32 addresses don't have a prefix
  try {
    const resp = await fetch(`${esploraUrl}/address/${cleanAddr}/utxo`);
    if (!resp.ok) return null;
    const utxos = (await resp.json()) as Array<{ txid: string; value: number }>;
    if (utxos.length > 0) {
      return { txHash: utxos[0].txid, sat: utxos[0].value };
    }
  } catch (err) {
    console.error(`[${network}] Esplora error:`, err);
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
async function verifyBurnTx(
  network: string,
  burnTxHash: string
): Promise<boolean> {
  if (!burnTxHash) return false;
  try {
    const provider =
      providers[network] || new ethers.JsonRpcProvider(RPC_URLS[network]);
    const tx = await provider.getTransaction(burnTxHash);
    if (!tx) return false;
    // TODO: parse tx input to verify burn to correct address for correct amount
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
      const addr = generateDepositAddress(network, dep.id);
      await api(`/fed/deposit/${dep.id}`, {
        method: 'PATCH',
        headers: fedHeaders(),
        body: JSON.stringify({ ecash_address: addr }),
      });
      console.log(`[${network}] Deposit ${dep.id}: assigned ${addr}`);
    } else {
      // Check Esplora for incoming L1 transaction
      const tx = await checkDeposits(network, dep.ecash_address);
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
      const verified = await verifyBurnTx(network, wd.burn_tx_hash);
      if (verified) {
        console.log(
          `[${network}] Withdrawal ${wd.id}: burn tx verified, TODO: send L1 funds to ${wd.ecash_address}`
        );
        // TODO: Send XEC/sBTC from federation wallet to user's L1 address
        // TODO: Update withdrawal status to 'completed' with L1 tx hash
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
  console.log('  L2 Networks (Snowside RPC):');
  for (const [net, rpc] of Object.entries(RPC_URLS)) {
    console.log(`    ${net}: ${rpc}`);
  }
  console.log('  L1 Networks (Esplora):');
  for (const [net, url] of Object.entries(ESPLORA_URLS)) {
    console.log(`    ${net}: ${url}`);
  }
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
