// packages/desktop/src/tabs/SettingsTab.tsx
import { useState } from "react";
import { setRpcUrl, updateSettings, useSettings } from "../lib/store";
import { NETWORKS, NETWORK_ORDER } from "../lib/networks";
import { deleteWallet, hasWallet, revealKey, walletAddress } from "../lib/wallet";
import { log } from "../lib/log";
import { Button, Card, CopyButton, Field, Input } from "../components/ui";

export function SettingsTab() {
  const settings = useSettings();
  const [revealed, setRevealed] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 lg:grid-cols-2">
      <Card title="Appearance">
        <div className="flex gap-2">
          <Button
            variant={settings.theme === "dark" ? "primary" : "ghost"}
            className="flex-1"
            onClick={() => updateSettings({ theme: "dark" })}
          >
            Dark
          </Button>
          <Button
            variant={settings.theme === "light" ? "primary" : "ghost"}
            className="flex-1"
            onClick={() => updateSettings({ theme: "light" })}
          >
            Light
          </Button>
        </div>
      </Card>

      <Card title="Bridge API">
        <Field label="API Base URL">
          <Input
            value={settings.apiUrl}
            onChange={(e) => updateSettings({ apiUrl: e.target.value })}
          />
        </Field>
        <div className="mt-2 text-xs text-faint">
          Custodial bridge API (Cloudflare Worker). Default: {NETWORKS.mainnet.apiUrl}
        </div>
      </Card>

      <Card title="RPC Endpoints" className="lg:col-span-2">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {NETWORK_ORDER.map((id) => (
            <Field key={id} label={`${NETWORKS[id].label} RPC`}>
              <Input
                value={settings.rpcUrls[id]}
                onChange={(e) => setRpcUrl(id, e.target.value)}
                placeholder={NETWORKS[id].rpcUrl}
              />
            </Field>
          ))}
        </div>
        <div className="mt-2 text-xs text-faint">
          The light client talks to these hosted endpoints for all chain data and transaction
          submission. Chain IDs are auto-detected per endpoint.
        </div>
      </Card>

      <Card title="Wallet (Danger Zone)" className="lg:col-span-2 border-err/30">
        {hasWallet() ? (
          <div className="flex flex-col gap-3">
            <div className="font-mono text-sm text-muted">{walletAddress()}</div>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={() => setRevealed(revealKey())}>
                Reveal Private Key
              </Button>
              {!confirmDelete ? (
                <Button variant="danger" onClick={() => setConfirmDelete(true)}>
                  Delete Wallet
                </Button>
              ) : (
                <>
                  <Button
                    variant="danger"
                    onClick={() => {
                      deleteWallet();
                      setConfirmDelete(false);
                      setRevealed(null);
                      log("info", "settings", "Wallet deleted — reload the Wallet tab");
                    }}
                  >
                    Confirm Delete (no undo)
                  </Button>
                  <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
                    Cancel
                  </Button>
                </>
              )}
            </div>
            {revealed && (
              <div className="rounded border border-warn/40 bg-warn/10 p-3">
                <div className="mb-1 text-xs font-bold uppercase tracking-wide text-warn">
                  Private key — never share this
                </div>
                <div className="flex items-center gap-2">
                  <span className="break-all font-mono text-xs text-ink">{revealed}</span>
                  <CopyButton text={revealed} />
                </div>
              </div>
            )}
            <div className="text-xs text-faint">
              After deleting, open the Wallet tab to create or import a new wallet.
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted">No wallet on this device.</div>
        )}
      </Card>

      <Card title="About" className="lg:col-span-2">
        <div className="space-y-1 text-sm text-muted">
          <div>Snowside desktop light client — eCash drivechain (slot 88) on an Avalanche L1.</div>
          <div className="text-xs text-faint">
            <a className="text-accent hover:text-accent-strong" href="https://snowside.network" target="_blank" rel="noreferrer">snowside.network</a>
            {" · "}
            <a className="text-accent hover:text-accent-strong" href="https://docs.snowside.network" target="_blank" rel="noreferrer">docs.snowside.network</a>
            {" · "}
            <a className="text-accent hover:text-accent-strong" href="https://github.com/abitsuite/snowside" target="_blank" rel="noreferrer">github.com/abitsuite/snowside</a>
          </div>
        </div>
      </Card>
    </div>
  );
}
