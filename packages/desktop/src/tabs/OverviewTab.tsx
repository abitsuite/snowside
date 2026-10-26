// packages/desktop/src/tabs/OverviewTab.tsx
import { useState } from "react";
import { getSettings, useSettings } from "../lib/store";
import { NETWORKS, TOKEN_SYMBOL } from "../lib/networks";
import { getBalance, getChainStats, type ChainStats } from "../lib/rpc";
import { bridgeApi, type BridgeStatus } from "../lib/bridge";
import { hasWallet, walletAddress } from "../lib/wallet";
import { fmtEcx, fmtGwei, shortAddr } from "../lib/format";
import { usePoller } from "../lib/hooks";
import { Card, Stat, StatusDot } from "../components/ui";

export function OverviewTab() {
  const settings = useSettings();
  const net = NETWORKS[settings.activeNetwork];
  const rpcUrl = settings.rpcUrls[net.id] || net.rpcUrl;
  const address = hasWallet() ? walletAddress() : null;

  const [stats, setStats] = useState<ChainStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [bridge, setBridge] = useState<BridgeStatus | null>(null);

  usePoller(
    async () => {
      try {
        setStats(await getChainStats(rpcUrl));
        setStatsError(null);
      } catch (err) {
        setStats(null);
        setStatsError(err instanceof Error ? err.message : String(err));
      }
      if (address) {
        try {
          setBalance(await getBalance(rpcUrl, address));
        } catch {
          // logged in rpc layer
        }
      }
      try {
        setBridge(await bridgeApi.status());
      } catch {
        setBridge(null);
      }
    },
    15000,
    [rpcUrl, address],
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card title="Wallet">
        {address ? (
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-mono text-sm text-muted">{shortAddr(address, 10)}</div>
              <div className="mt-1 text-2xl font-bold text-ink">
                {balance === null ? "…" : fmtEcx(balance)}{" "}
                <span className="text-sm font-normal text-muted">{TOKEN_SYMBOL}</span>
              </div>
            </div>
            <div className="text-right text-xs text-faint">
              <div>{net.label}</div>
              <div className="mt-1 flex items-center justify-end gap-1.5">
                <StatusDot ok={stats !== null} />
                {stats !== null ? "connected" : "unreachable"}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted">
            No wallet yet. Open the <span className="font-bold text-ink">Wallet</span> tab to create
            or import one.
          </div>
        )}
      </Card>

      <Card title="Bridge Federation">
        <div className="flex items-center gap-2 text-sm">
          <StatusDot ok={bridge?.federation_online ?? false} warn={bridge !== null} />
          <span className="text-ink">
            {bridge === null ? "API unreachable" : bridge.federation_online ? "Online" : "Offline"}
          </span>
        </div>
        <div className="mt-2 text-xs text-faint">
          Custodial MVP bridge. Deposits are credited after federation confirmation; withdrawals are
          processed by the federation.
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:col-span-2 lg:grid-cols-4">
        <Stat label="Latest Block" value={stats ? stats.blockNumber.toLocaleString() : "—"} />
        <Stat label="Gas Price" value={stats ? `${fmtGwei(stats.gasPriceWei)} gwei` : "—"} />
        <Stat
          label="Chain ID"
          value={stats ? `${stats.chainId} (0x${stats.chainId.toString(16)})` : "—"}
        />
        <Stat label="Network" value={net.label} mono={false} />
      </div>

      {statsError && (
        <div className="rounded-lg border border-err/40 bg-err/10 p-3 text-sm text-err lg:col-span-2">
          RPC unreachable at {rpcUrl} — {statsError}. Check the endpoint in Settings.
        </div>
      )}

      <Card title="Connection" className="lg:col-span-2">
        <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
          <div>
            <span className="text-faint">RPC: </span>
            <span className="font-mono text-muted">{rpcUrl}</span>
          </div>
          <div>
            <span className="text-faint">Bridge API: </span>
            <span className="font-mono text-muted">{getSettings().apiUrl}</span>
          </div>
          <div>
            <span className="text-faint">Explorer: </span>
            <a
              className="text-accent hover:text-accent-strong"
              href={net.explorerUrl}
              target="_blank"
              rel="noreferrer"
            >
              {net.explorerUrl}
            </a>
          </div>
          <div>
            <span className="text-faint">Docs: </span>
            <a
              className="text-accent hover:text-accent-strong"
              href="https://docs.snowside.network"
              target="_blank"
              rel="noreferrer"
            >
              docs.snowside.network
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}
