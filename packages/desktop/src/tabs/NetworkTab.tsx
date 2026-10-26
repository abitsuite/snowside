// packages/desktop/src/tabs/NetworkTab.tsx
import { useState } from "react";
import { updateSettings, useSettings } from "../lib/store";
import { NETWORKS, NETWORK_ORDER, type NetworkId } from "../lib/networks";
import { getChainStats, type ChainStats } from "../lib/rpc";
import { fmtGwei } from "../lib/format";
import { usePoller } from "../lib/hooks";
import { Card, StatusDot } from "../components/ui";

type Probe = { stats: ChainStats | null; error: boolean };

export function NetworkTab() {
  const settings = useSettings();
  const [probes, setProbes] = useState<Partial<Record<NetworkId, Probe>>>({});

  usePoller(async () => {
    const results = await Promise.all(
      NETWORK_ORDER.map(async (id) => {
        const url = settings.rpcUrls[id] || NETWORKS[id].rpcUrl;
        try {
          return [id, { stats: await getChainStats(url), error: false }] as const;
        } catch {
          return [id, { stats: null, error: true }] as const;
        }
      }),
    );
    setProbes(Object.fromEntries(results));
  }, 15000, [settings.rpcUrls]);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {NETWORK_ORDER.map((id) => {
        const net = NETWORKS[id];
        const probe = probes[id];
        const active = settings.activeNetwork === id;
        const url = settings.rpcUrls[id] || net.rpcUrl;
        return (
          <button
            key={id}
            onClick={() => updateSettings({ activeNetwork: id })}
            className="text-left"
          >
            <Card className={active ? "border-accent" : "hover:border-accent/50"}>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-ink">{net.label}</span>
                <span className="flex items-center gap-1.5 text-xs text-muted">
                  <StatusDot ok={probe?.stats != null} warn={probe === undefined} />
                  {probe === undefined ? "probing…" : probe.stats ? "online" : "offline"}
                </span>
              </div>
              <div className="mt-3 space-y-1.5 text-sm">
                <Row k="Block" v={probe?.stats ? probe.stats.blockNumber.toLocaleString() : "—"} />
                <Row
                  k="Chain ID"
                  v={
                    probe?.stats
                      ? `${probe.stats.chainId} (0x${probe.stats.chainId.toString(16)})`
                      : `hint ${net.chainIdHint}`
                  }
                />
                <Row k="Gas" v={probe?.stats ? `${fmtGwei(probe.stats.gasPriceWei)} gwei` : "—"} />
                <div className="break-all pt-1 font-mono text-xs text-faint">{url}</div>
                <a
                  className="block pt-1 text-xs text-accent hover:text-accent-strong"
                  href={net.explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  {net.explorerUrl}
                </a>
              </div>
              {active && <div className="mt-3 text-xs font-bold uppercase tracking-wide text-accent">Active network</div>}
            </Card>
          </button>
        );
      })}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-faint">{k}</span>
      <span className="font-mono text-muted">{v}</span>
    </div>
  );
}
