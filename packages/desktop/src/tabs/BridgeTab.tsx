// packages/desktop/src/tabs/BridgeTab.tsx
import { useEffect, useState } from "react";
import { isAddress } from "viem";
import { useSettings } from "../lib/store";
import { NETWORKS, NETWORK_ORDER, TOKEN_SYMBOL, type NetworkId } from "../lib/networks";
import { bridgeApi, type Deposit, type Withdrawal } from "../lib/bridge";
import { sendEcx, waitForReceipt, walletAddress } from "../lib/wallet";
import { fmtAgo, fmtEcx, fmtTime, shortAddr } from "../lib/format";
import { usePoller } from "../lib/hooks";
import { Button, Card, CopyButton, Field, Input, StatusDot, SubTabs } from "../components/ui";
import { Qr } from "../components/Qr";

const BURN_ADDRESS = "0x0000000000000000000000000000000000000000";

function statusColor(status: string): "ok" | "warn" | "err" {
  if (status === "minted" || status === "completed") return "ok";
  if (status === "pending" || status === "confirmed" || status === "processing") return "warn";
  return "err";
}

export function BridgeTab() {
  const [sub, setSub] = useState<"deposit" | "withdraw" | "history">("deposit");
  const address = walletAddress();

  return (
    <div className="mx-auto max-w-2xl">
      <SubTabs
        tabs={[
          { id: "deposit" as const, label: "Deposit (ECX -> Snowside)" },
          { id: "withdraw" as const, label: "Withdraw (Snowside -> ECX)" },
          { id: "history" as const, label: "History" },
        ]}
        active={sub}
        onChange={setSub}
      />
      {sub === "deposit" && <DepositPane address={address} />}
      {sub === "withdraw" && <WithdrawPane address={address} />}
      {sub === "history" && <HistoryPane address={address} />}
    </div>
  );
}

// ── Deposit ─────────────────────────────────────────────────────

function DepositPane({ address }: { address: string | null }) {
  const settings = useSettings();
  const [snowsideAddr, setSnowsideAddr] = useState(address ?? "");
  const [network, setNetwork] = useState<NetworkId>(settings.activeNetwork);
  const [deposit, setDeposit] = useState<Deposit | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Poll the deposit until the federation assigns an address and it settles.
  useEffect(() => {
    if (!deposit || deposit.status === "minted") return;
    const id = setInterval(async () => {
      try {
        setDeposit(await bridgeApi.getDeposit(deposit.id));
      } catch {
        // transient
      }
    }, 10000);
    return () => clearInterval(id);
  }, [deposit?.id, deposit?.status]);

  const addrValid = isAddress(snowsideAddr);

  return (
    <div className="flex flex-col gap-4">
      <Card title="Deposit ECX from the mainchain">
        <div className="flex flex-col gap-3">
          <Field label="Your Snowside Address (receives minted ECX)">
            <Input value={snowsideAddr} onChange={(e) => setSnowsideAddr(e.target.value)} placeholder="0x…" />
          </Field>
          {snowsideAddr && !addrValid && <div className="text-sm text-err">Invalid address</div>}
          <Field label="Mainchain Network">
            <div className="flex gap-2">
              {NETWORK_ORDER.map((n) => (
                <Button
                  key={n}
                  variant={network === n ? "primary" : "ghost"}
                  className="flex-1"
                  onClick={() => setNetwork(n)}
                >
                  {NETWORKS[n].label}
                </Button>
              ))}
            </div>
          </Field>
          <div className="text-xs text-faint">
            You will receive a unique deposit address on {NETWORKS[network].esploraLabel}. Send ECX
            there and the federation mints the same amount on Snowside.
          </div>
          {error && <div className="rounded border border-err/40 bg-err/10 p-2 text-sm text-err">{error}</div>}
          <Button
            disabled={!addrValid || busy}
            onClick={async () => {
              setBusy(true);
              setError(null);
              try {
                const { id } = await bridgeApi.createDeposit(snowsideAddr, network);
                setDeposit(await bridgeApi.getDeposit(id));
              } catch (err) {
                setError(err instanceof Error ? err.message : String(err));
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Creating…" : "Create Deposit Address"}
          </Button>
        </div>
      </Card>

      {deposit && (
        <Card title={`Deposit ${shortAddr(deposit.id, 4)}`}>
          {!deposit.ecash_address ? (
            <div className="flex items-center gap-2 text-sm text-muted">
              <StatusDot ok={false} warn />
              Waiting for the federation to assign a deposit address…
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Qr value={deposit.ecash_address} />
              <div className="break-all text-center font-mono text-sm text-ink">{deposit.ecash_address}</div>
              <CopyButton text={deposit.ecash_address} />
            </div>
          )}
          <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-sm">
            <span className="flex items-center gap-2">
              <StatusDot ok={statusColor(deposit.status) === "ok"} warn={statusColor(deposit.status) === "warn"} />
              <span className="font-bold text-ink">{deposit.status}</span>
            </span>
            <span className="text-muted">
              {deposit.amount_sats !== null
                ? `${(deposit.amount_sats / 100).toLocaleString()} ECX seen`
                : "no funds detected yet"}
            </span>
          </div>
          {deposit.mint_tx_hash && (
            <div className="mt-2 break-all font-mono text-xs text-faint">
              Mint tx: {deposit.mint_tx_hash}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

// ── Withdraw ────────────────────────────────────────────────────

function WithdrawPane({ address }: { address: string | null }) {
  const settings = useSettings();
  const [snowsideAddr, setSnowsideAddr] = useState(address ?? "");
  const [ecashAddr, setEcashAddr] = useState("");
  const [amount, setAmount] = useState("");
  const [burnTx, setBurnTx] = useState("");
  const [busy, setBusy] = useState<"burn" | "submit" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const amountValid = /^\d+(\.\d+)?$/.test(amount) && Number(amount) > 0;
  const snowValid = isAddress(snowsideAddr);

  const doBurn = async (): Promise<string | null> => {
    if (!address) {
      setError("No wallet in this app — burn from your own wallet and paste the tx hash below.");
      return null;
    }
    setBusy("burn");
    setError(null);
    try {
      const hash = await sendEcx(BURN_ADDRESS, amount);
      setBurnTx(hash);
      waitForReceipt(hash).catch(() => {});
      return hash;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return null;
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card title="Withdraw ECX to the mainchain">
      <div className="flex flex-col gap-3">
        <Field label="Your Snowside Address (source of funds)">
          <Input value={snowsideAddr} onChange={(e) => setSnowsideAddr(e.target.value)} placeholder="0x…" />
        </Field>
        <Field label="Destination ECX Address (mainchain)">
          <Input value={ecashAddr} onChange={(e) => setEcashAddr(e.target.value)} placeholder="ecash:qz…" />
        </Field>
        <Field label={`Amount (${TOKEN_SYMBOL})`}>
          <Input inputMode="decimal" placeholder="0.0" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <Field label="Burn Transaction Hash">
          <div className="flex gap-2">
            <Input value={burnTx} onChange={(e) => setBurnTx(e.target.value)} placeholder="0x…" />
            <Button variant="cta" disabled={!amountValid || !address || busy !== null} onClick={doBurn}>
              {busy === "burn" ? "Burning…" : `Burn ${TOKEN_SYMBOL}`}
            </Button>
          </div>
        </Field>
        <ol className="list-decimal pl-5 text-xs text-faint">
          <li>
            Click "Burn {TOKEN_SYMBOL}" to send your {TOKEN_SYMBOL} to the zero address on Snowside{" "}
            {NETWORKS[settings.activeNetwork].label}.
          </li>
          <li>Click "Initiate Withdrawal" — the federation sends ECX to your destination.</li>
        </ol>
        {error && <div className="rounded border border-err/40 bg-err/10 p-2 text-sm text-err">{error}</div>}
        {done && (
          <div className="rounded border border-ok/40 bg-ok/10 p-2 text-sm text-ok">
            Withdrawal submitted (id {done}). Track it in the History tab.
          </div>
        )}
        <Button
          disabled={!snowValid || !ecashAddr || !amountValid || busy !== null}
          onClick={async () => {
            setError(null);
            setDone(null);
            let hash = burnTx.trim();
            if (!hash) {
              const h = await doBurn();
              if (!h) return;
              hash = h;
            }
            setBusy("submit");
            try {
              const { id } = await bridgeApi.createWithdrawal(
                snowsideAddr,
                ecashAddr,
                amount,
                settings.activeNetwork,
                hash,
              );
              setDone(id);
              setAmount("");
              setEcashAddr("");
              setBurnTx("");
            } catch (err) {
              setError(err instanceof Error ? err.message : String(err));
            } finally {
              setBusy(null);
            }
          }}
        >
          {busy === "submit" ? "Submitting…" : "Initiate Withdrawal"}
        </Button>
      </div>
    </Card>
  );
}

// ── History ─────────────────────────────────────────────────────

function HistoryPane({ address }: { address: string | null }) {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [error, setError] = useState<string | null>(null);

  usePoller(
    async () => {
      if (!address) return;
      try {
        const [d, w] = await Promise.all([
          bridgeApi.listDeposits(address),
          bridgeApi.listWithdrawals(address),
        ]);
        setDeposits(d);
        setWithdrawals(w);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    },
    15000,
    [address],
  );

  if (!address) {
    return (
      <Card>
        <div className="text-sm text-muted">
          History is tied to your wallet address. Create or import a wallet first.
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <div className="rounded border border-err/40 bg-err/10 p-2 text-sm text-err">{error}</div>}
      <Card title={`Deposits (${deposits.length})`}>
        {deposits.length === 0 ? (
          <div className="text-sm text-faint">No deposits yet.</div>
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {deposits.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <div className="flex items-center gap-2">
                  <StatusDot ok={statusColor(d.status) === "ok"} warn={statusColor(d.status) === "warn"} />
                  <span className="font-bold text-ink">{d.status}</span>
                  <span className="text-faint">{d.network}</span>
                </div>
                <div className="text-right">
                  <div className="font-mono text-muted">
                    {d.amount_sats !== null ? `${(d.amount_sats / 100).toLocaleString()} ECX` : "—"}
                  </div>
                  <div className="text-xs text-faint" title={fmtTime(d.created_at)}>
                    {fmtAgo(d.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card title={`Withdrawals (${withdrawals.length})`}>
        {withdrawals.length === 0 ? (
          <div className="text-sm text-faint">No withdrawals yet.</div>
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {withdrawals.map((w) => (
              <div key={w.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <div className="flex items-center gap-2">
                  <StatusDot ok={statusColor(w.status) === "ok"} warn={statusColor(w.status) === "warn"} />
                  <span className="font-bold text-ink">{w.status}</span>
                  <span className="text-faint">{w.network}</span>
                </div>
                <div className="text-right">
                  <div className="font-mono text-muted">
                    {w.amount_ecx ? `${fmtEcx(BigInt(Math.floor(Number(w.amount_ecx) * 1e18)))} ECX` : "—"}
                  </div>
                  <div className="text-xs text-faint" title={fmtTime(w.created_at)}>
                    {fmtAgo(w.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
