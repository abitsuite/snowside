// packages/desktop/src/lib/bridge.ts
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import { getSettings } from "./store";
import { log } from "./log";

export type BridgeNetwork = "mainnet" | "testnet" | "signet";

export interface Deposit {
  id: string;
  network: string;
  snowside_address: string;
  ecash_address: string | null;
  derivation_index: number | null;
  status: string;
  amount_sats: number | null;
  amount_ecx: number | null;
  ecash_tx_hash: string | null;
  mint_tx_hash: string | null;
  created_at: number;
  confirmed_at: number | null;
  minted_at: number | null;
}

export interface Withdrawal {
  id: string;
  network: string;
  snowside_address: string;
  ecash_address: string;
  amount_ecx: string | null;
  amount_sats: number | null;
  burn_tx_hash: string | null;
  ecash_tx_hash: string | null;
  status: string;
  created_at: number;
  completed_at: number | null;
}

export interface BridgeStatus {
  status: string;
  federation_online: boolean;
  last_checkin: number | null;
}

const isTauri =
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

function baseUrl(): string {
  return getSettings().apiUrl.replace(/\/+$/, "");
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${baseUrl()}${path}`;
  const doFetch = isTauri ? (tauriFetch as typeof fetch) : fetch;
  log("debug", "bridge", `${init?.method ?? "GET"} ${path}`);
  const resp = await doFetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!resp.ok) {
    let detail = `HTTP ${resp.status}`;
    try {
      const body = (await resp.json()) as { error?: string };
      if (body.error) detail = body.error;
    } catch {
      // keep HTTP status detail
    }
    log("error", "bridge", `${path} failed: ${detail}`);
    throw new Error(detail);
  }
  return (await resp.json()) as T;
}

export const bridgeApi = {
  status: () => api<BridgeStatus>("/v1/bridge/status"),

  createDeposit: (snowsideAddress: string, network: BridgeNetwork) =>
    api<{ id: string; status: string }>("/v1/bridge/deposit", {
      method: "POST",
      body: JSON.stringify({ snowsideAddress, network }),
    }),

  getDeposit: (id: string) => api<Deposit>(`/v1/bridge/deposit/${id}`),

  listDeposits: (address: string) => api<Deposit[]>(`/v1/bridge/deposits/${address}`),

  createWithdrawal: (
    snowsideAddress: string,
    ecashAddress: string,
    amountEcx: string,
    network: BridgeNetwork,
    burnTxHash?: string,
  ) =>
    api<{ id: string; status: string }>("/v1/bridge/withdraw", {
      method: "POST",
      body: JSON.stringify({ snowsideAddress, ecashAddress, amountEcx, network, burnTxHash }),
    }),

  listWithdrawals: (address: string) =>
    api<Withdrawal[]>(`/v1/bridge/withdrawals/${address}`),
};
