// packages/desktop/src/lib/store.ts
import { useSyncExternalStore } from "react";
import { NETWORKS, type NetworkId } from "./networks";

export type Theme = "dark" | "light";

export interface Settings {
  theme: Theme;
  activeNetwork: NetworkId;
  rpcUrls: Record<NetworkId, string>;
  apiUrl: string;
}

const LS_SETTINGS = "snowside.settings.v1";
const LS_WALLET_PK = "snowside.wallet.pk";

function defaults(): Settings {
  return {
    theme: "dark",
    activeNetwork: "mainnet",
    rpcUrls: {
      mainnet: NETWORKS.mainnet.rpcUrl,
      testnet: NETWORKS.testnet.rpcUrl,
      signet: NETWORKS.signet.rpcUrl,
    },
    apiUrl: NETWORKS.mainnet.apiUrl,
  };
}

function load(): Settings {
  try {
    const raw = localStorage.getItem(LS_SETTINGS);
    if (!raw) return defaults();
    const parsed = JSON.parse(raw) as Partial<Settings>;
    const d = defaults();
    return {
      theme: parsed.theme === "light" ? "light" : "dark",
      activeNetwork:
        parsed.activeNetwork === "testnet" || parsed.activeNetwork === "signet"
          ? parsed.activeNetwork
          : "mainnet",
      rpcUrls: { ...d.rpcUrls, ...(parsed.rpcUrls ?? {}) },
      apiUrl: typeof parsed.apiUrl === "string" && parsed.apiUrl ? parsed.apiUrl : d.apiUrl,
    };
  } catch {
    return defaults();
  }
}

let settings: Settings = load();
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(LS_SETTINGS, JSON.stringify(settings));
  } catch {
    // storage unavailable (private mode) — session-only settings
  }
  listeners.forEach((l) => l());
}

export function getSettings(): Settings {
  return settings;
}

export function updateSettings(patch: Partial<Settings>) {
  settings = { ...settings, ...patch };
  persist();
}

export function setRpcUrl(network: NetworkId, url: string) {
  settings = { ...settings, rpcUrls: { ...settings.rpcUrls, [network]: url } };
  persist();
}

export function subscribeSettings(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSettings(): Settings {
  return useSyncExternalStore(subscribeSettings, getSettings);
}

// ── Wallet key persistence ──────────────────────────────────────
// MVP: the private key is stored in plaintext localStorage. This mirrors the
// custodial MVP stage of the bridge. Hardening (OS keychain via a Tauri
// plugin) is a pre-mainnet follow-up.

export function getWalletKey(): string | null {
  try {
    return localStorage.getItem(LS_WALLET_PK);
  } catch {
    return null;
  }
}

export function setWalletKey(pk: string) {
  try {
    localStorage.setItem(LS_WALLET_PK, pk);
  } catch {
    // ignore
  }
  listeners.forEach((l) => l());
}

export function clearWalletKey() {
  try {
    localStorage.removeItem(LS_WALLET_PK);
  } catch {
    // ignore
  }
  listeners.forEach((l) => l());
}
