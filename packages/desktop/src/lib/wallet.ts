// packages/desktop/src/lib/wallet.ts
import {
  createPublicClient,
  createWalletClient,
  custom,
  isAddress,
  parseEther,
  type Chain,
  type Hex,
} from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { getSettings, setWalletKey, clearWalletKey, getWalletKey } from "./store";
import { NETWORKS, TOKEN_DECIMALS, TOKEN_SYMBOL } from "./networks";
import { rpcCall } from "./rpc";
import { log } from "./log";

export function hasWallet(): boolean {
  return getWalletKey() !== null;
}

export function walletAddress(): string | null {
  const pk = getWalletKey();
  if (!pk) return null;
  try {
    return privateKeyToAccount(normalizePk(pk)).address;
  } catch {
    return null;
  }
}

function normalizePk(pk: string): Hex {
  const trimmed = pk.trim();
  return (trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`) as Hex;
}

export function createWallet(): string {
  const pk = generatePrivateKey();
  setWalletKey(pk);
  log("info", "wallet", "New wallet created");
  return privateKeyToAccount(pk).address;
}

export function importWallet(pk: string): string {
  const normalized = normalizePk(pk);
  const account = privateKeyToAccount(normalized); // throws on invalid key
  setWalletKey(normalized);
  log("info", "wallet", "Wallet imported");
  return account.address;
}

export function deleteWallet() {
  clearWalletKey();
  log("info", "wallet", "Wallet removed from this device");
}

export function revealKey(): string | null {
  return getWalletKey();
}

function chainDef(chainId: number, rpcUrl: string, name: string): Chain {
  return {
    id: chainId,
    name,
    nativeCurrency: { name: TOKEN_SYMBOL, symbol: TOKEN_SYMBOL, decimals: TOKEN_DECIMALS },
    rpcUrls: { default: { http: [rpcUrl] } },
  };
}

function transportFor(rpcUrl: string) {
  return custom({
    request: async ({ method, params }) =>
      rpcCall(rpcUrl, method, (params as unknown[]) ?? []),
  });
}

export async function sendEcx(to: string, amountEcx: string): Promise<Hex> {
  const pk = getWalletKey();
  if (!pk) throw new Error("No wallet — create or import one first");
  if (!isAddress(to)) throw new Error(`Invalid recipient address: ${to}`);

  const settings = getSettings();
  const net = NETWORKS[settings.activeNetwork];
  const rpcUrl = settings.rpcUrls[net.id] || net.rpcUrl;
  const account = privateKeyToAccount(normalizePk(pk));
  const transport = transportFor(rpcUrl);
  const publicClient = createPublicClient({ transport });

  const chainId = await publicClient.getChainId();
  const chain = chainDef(chainId, rpcUrl, net.label);
  const value = parseEther(amountEcx);

  // Legacy gas pricing: subnet-evm accepts eth_gasPrice txs; keep it simple
  // and explicit rather than relying on EIP-1559 fee history.
  const [gasPrice, gas] = await Promise.all([
    publicClient.getGasPrice(),
    publicClient.estimateGas({ account, to: to as Hex, value }),
  ]);

  const walletClient = createWalletClient({ account, chain, transport });
  const hash = await walletClient.sendTransaction({
    to: to as Hex,
    value,
    gas,
    gasPrice,
  });
  log("info", "wallet", `Sent ${amountEcx} ${TOKEN_SYMBOL} -> ${to} (tx ${hash})`);
  return hash;
}

export async function waitForReceipt(hash: Hex): Promise<void> {
  const settings = getSettings();
  const net = NETWORKS[settings.activeNetwork];
  const rpcUrl = settings.rpcUrls[net.id] || net.rpcUrl;
  const publicClient = createPublicClient({ transport: transportFor(rpcUrl) });
  await publicClient.waitForTransactionReceipt({ hash, timeout: 60_000 });
}
