import { ethers } from 'ethers';

const API_URL = process.env.API_URL || 'https://snowside.network/v1';
const FED_TOKEN = process.env.FEDERATION_TOKEN || 'dev-secret';
const SIGNET_RPC = process.env.SIGNET_RPC || 'https://rpc.snowside.network/signet';
const EWOQ_KEY = process.env.EWOQ_PRIVATE_KEY || '';
const ESPLORA_URL = process.env.ESPLORA_URL || 'https://esplora.drynet4.drivechain.dev';
const POLL_MS = 10000;

const NATIVE_MINTER = '0x0200000000000000000000000000000000000001';
const MINTER_ABI = ['function mint(address to, uint256 amount) external'];
const XEC_TO_ECX = BigInt(10) ** BigInt(16);

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
async function checkDeposits(ecashAddr: string): Promise<{ txHash: string; sat: number } | null> {
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

// Mint ECX on Snowside signet via NativeMinter precompile
async function mintEcx(to: string, sat: number): Promise<string> {
  if (!EWOQ_KEY) throw new Error('EWOQ_PRIVATE_KEY not set');
  const provider = new ethers.JsonRpcProvider(SIGNET_RPC);
  const wallet = new ethers.Wallet(EWOQ_KEY, provider);
  const minter = new ethers.Contract(NATIVE_MINTER, MINTER_ABI, wallet);
  const amount = BigInt(sat) * XEC_TO_ECX;
  const tx = await minter.mint(to, amount);
  await tx.wait();
  return tx.hash;
}

async function poll() {
  await api('/fed/checkin', { method: 'POST', headers: fedHeaders() });

  const pending = (await api('/fed/deposits/pending', { headers: fedHeaders() })) as any[];
  for (const dep of pending) {
    if (!dep.ecash_address) {
      const addr = generateEcashAddress(dep.id);
      await api(`/fed/deposit/${dep.id}`, {
        method: 'PATCH',
        headers: fedHeaders(),
        body: JSON.stringify({ ecash_address: addr }),
      });
      console.log(`Deposit ${dep.id}: assigned ${addr}`);
    } else {
      const tx = await checkDeposits(dep.ecash_address);
      if (tx) {
        console.log(`Deposit ${dep.id}: detected ${tx.sat} sat in ${tx.txHash}`);
        await api(`/fed/deposit/${dep.id}`, {
          method: 'PATCH',
          headers: fedHeaders(),
          body: JSON.stringify({ status: 'confirmed', ecash_tx_hash: tx.txHash, amount_xec: tx.sat }),
        });
        if (EWOQ_KEY) {
          try {
            const mintTx = await mintEcx(dep.snowside_address, tx.sat);
            await api(`/fed/deposit/${dep.id}`, {
              method: 'PATCH',
              headers: fedHeaders(),
              body: JSON.stringify({
                status: 'minted',
                mint_tx_hash: mintTx,
                amount_ecx: Number(BigInt(tx.sat) * XEC_TO_ECX),
              }),
            });
            console.log(`Deposit ${dep.id}: minted via ${mintTx}`);
          } catch (err) {
            console.error(`Deposit ${dep.id}: mint failed:`, err);
          }
        }
      }
    }
  }

  const wdPending = (await api('/fed/withdrawals/pending', { headers: fedHeaders() })) as any[];
  for (const wd of wdPending) {
    console.log(`Withdrawal ${wd.id}: pending (withdrawal processing not yet implemented)`);
  }
}

async function main() {
  console.log('Snowside Federation Service');
  console.log(`  API: ${API_URL}`);
  console.log(`  Signet RPC: ${SIGNET_RPC}`);
  console.log(`  Esplora: ${ESPLORA_URL}`);
  console.log(`  EWOQ key: ${EWOQ_KEY ? 'set' : 'NOT SET'}`);
  console.log(`  Poll: ${POLL_MS}ms`);
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
