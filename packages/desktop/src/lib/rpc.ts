// packages/desktop/src/lib/rpc.ts
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import { log } from "./log";

const isTauri =
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

async function httpFetch(url: string, init: RequestInit): Promise<Response> {
  if (isTauri) {
    return tauriFetch(url, init as Parameters<typeof tauriFetch>[1]);
  }
  return fetch(url, init);
}

export interface RpcError {
  code: number;
  message: string;
}

let nextId = 1;

export async function rpcCall<T = unknown>(
  url: string,
  method: string,
  params: unknown[] = [],
): Promise<T> {
  const started = Date.now();
  log("debug", "rpc", `${method} -> ${url}`);
  try {
    const resp = await httpFetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: nextId++, method, params }),
    });
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
    }
    const json = (await resp.json()) as {
      result?: T;
      error?: RpcError;
    };
    if (json.error) {
      throw new Error(`RPC ${json.error.code}: ${json.error.message}`);
    }
    log("debug", "rpc", `${method} ok (${Date.now() - started}ms)`);
    return json.result as T;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log("error", "rpc", `${method} failed: ${msg}`);
    throw err;
  }
}

export const hexToNumber = (hex: string): number => parseInt(hex, 16);
export const hexToBigInt = (hex: string): bigint => BigInt(hex);

export interface ChainStats {
  chainId: number;
  blockNumber: number;
  gasPriceWei: bigint;
}

export async function getChainStats(url: string): Promise<ChainStats> {
  const [chainIdHex, blockHex, gasHex] = await Promise.all([
    rpcCall<string>(url, "eth_chainId"),
    rpcCall<string>(url, "eth_blockNumber"),
    rpcCall<string>(url, "eth_gasPrice"),
  ]);
  return {
    chainId: hexToNumber(chainIdHex),
    blockNumber: hexToNumber(blockHex),
    gasPriceWei: hexToBigInt(gasHex),
  };
}

export async function getBalance(url: string, address: string): Promise<bigint> {
  const hex = await rpcCall<string>(url, "eth_getBalance", [address, "latest"]);
  return hexToBigInt(hex);
}
