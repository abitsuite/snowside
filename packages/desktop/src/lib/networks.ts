// packages/desktop/src/lib/networks.ts

export type NetworkId = "mainnet" | "testnet" | "signet";

export interface NetworkDef {
  id: NetworkId;
  label: string;
  chainIdHint: number;
  rpcUrl: string;
  apiUrl: string;
  explorerUrl: string;
  esploraLabel: string;
}

// Chain IDs are the documented values from the repo AGENTS.md. The app
// re-detects eth_chainId at runtime and uses the detected value for signing,
// so redeployed L1s with new chain IDs keep working without a config change.
export const NETWORKS: Record<NetworkId, NetworkDef> = {
  mainnet: {
    id: "mainnet",
    label: "Mainnet",
    chainIdHint: 32904,
    rpcUrl: "https://snowside.network/mainnet",
    apiUrl: "https://snowside.network/v1",
    explorerUrl: "https://explorer.snowside.network",
    esploraLabel: "eCash mainnet",
  },
  testnet: {
    id: "testnet",
    label: "Testnet",
    chainIdHint: 33160,
    rpcUrl: "https://snowside.network/testnet",
    apiUrl: "https://snowside.network/v1",
    explorerUrl: "https://explorer-testnet.snowside.network",
    esploraLabel: "eCash drynet4",
  },
  signet: {
    id: "signet",
    label: "Signet",
    chainIdHint: 33416,
    rpcUrl: "https://snowside.network/signet",
    apiUrl: "https://snowside.network/v1",
    explorerUrl: "https://explorer-signet.snowside.network",
    esploraLabel: "Bitcoin signet",
  },
};

export const NETWORK_ORDER: NetworkId[] = ["mainnet", "testnet", "signet"];

export const TOKEN_SYMBOL = "ECX";
export const TOKEN_DECIMALS = 18;
