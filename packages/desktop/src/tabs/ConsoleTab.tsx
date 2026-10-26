// packages/desktop/src/tabs/ConsoleTab.tsx
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useSettings } from "../lib/store";
import { NETWORKS } from "../lib/networks";
import { rpcCall } from "../lib/rpc";
import { clearLogs, getLogs, log, subscribeLogs, type LogLevel } from "../lib/log";
import { Button, Card, Input } from "../components/ui";

const LEVEL_COLOR: Record<LogLevel, string> = {
  debug: "text-faint",
  info: "text-accent-strong",
  error: "text-err",
};

export function ConsoleTab() {
  const settings = useSettings();
  const net = NETWORKS[settings.activeNetwork];
  const entries = useSyncExternalStore(subscribeLogs, getLogs);
  const [method, setMethod] = useState("eth_blockNumber");
  const [params, setParams] = useState("[]");
  const [result, setResult] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);

  const rpcUrl = settings.rpcUrls[net.id] || net.rpcUrl;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card title={`JSON-RPC Console (${net.label})`}>
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Input value={method} onChange={(e) => setMethod(e.target.value)} placeholder="eth_blockNumber" />
            <Button
              disabled={busy || !method.trim()}
              onClick={async () => {
                setBusy(true);
                setResult(null);
                try {
                  const parsed = params.trim() ? JSON.parse(params) : [];
                  if (!Array.isArray(parsed)) throw new Error("Params must be a JSON array");
                  const res = await rpcCall(rpcUrl, method.trim(), parsed);
                  setResult(JSON.stringify(res, null, 2));
                } catch (err) {
                  const msg = err instanceof Error ? err.message : String(err);
                  setResult(`Error: ${msg}`);
                  log("error", "console", msg);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? "…" : "Call"}
            </Button>
          </div>
          <div>
            <div className="mb-1 text-xs font-bold uppercase tracking-wide text-faint">Params (JSON array)</div>
            <textarea
              className="h-20 w-full rounded border border-line bg-surface-0 p-2 font-mono text-xs text-ink outline-none focus:border-accent"
              value={params}
              onChange={(e) => setParams(e.target.value)}
            />
          </div>
          {result !== null && (
            <pre className="max-h-64 overflow-auto rounded border border-line bg-surface-0 p-2 font-mono text-xs text-muted">
              {result}
            </pre>
          )}
          <div className="text-xs text-faint">
            Calls go to <span className="font-mono">{rpcUrl}</span>
          </div>
        </div>
      </Card>

      <Card
        title="Log"
      >
        <div className="mb-2 flex justify-end">
          <Button variant="ghost" className="px-2 py-1 text-xs" onClick={clearLogs}>
            Clear
          </Button>
        </div>
        <div ref={scrollRef} className="h-80 overflow-auto rounded border border-line bg-surface-0 p-2 font-mono text-xs">
          {entries.length === 0 ? (
            <div className="text-faint">No log entries yet.</div>
          ) : (
            entries.map((e, i) => (
              <div key={i} className="whitespace-pre-wrap break-all">
                <span className="text-faint">{new Date(e.ts).toLocaleTimeString()} </span>
                <span className={`font-bold ${LEVEL_COLOR[e.level]}`}>[{e.source}] </span>
                <span className="text-muted">{e.message}</span>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
