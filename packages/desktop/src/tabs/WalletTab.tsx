// packages/desktop/src/tabs/WalletTab.tsx
import { useState } from "react";
import { isAddress } from "viem";
import { useSettings } from "../lib/store";
import { NETWORKS, TOKEN_SYMBOL } from "../lib/networks";
import { getBalance } from "../lib/rpc";
import { createWallet, importWallet, sendEcx, waitForReceipt, walletAddress } from "../lib/wallet";
import { fmtEcx, shortAddr } from "../lib/format";
import { usePoller } from "../lib/hooks";
import { Button, Card, CopyButton, Field, Input, SubTabs } from "../components/ui";
import { Qr } from "../components/Qr";

function WalletSetup({ onReady }: { onReady: () => void }) {
  const [importValue, setImportValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mx-auto grid max-w-2xl grid-cols-1 gap-4 md:grid-cols-2">
      <Card title="Create New Wallet">
        <p className="mb-4 text-sm text-muted">
          Generates a fresh private key on this device and shows your receive address.
        </p>
        <Button
          onClick={() => {
            createWallet();
            onReady();
          }}
        >
          Create Wallet
        </Button>
      </Card>
      <Card title="Import Wallet">
        <div className="flex flex-col gap-3">
          <Field label="Private Key (hex)">
            <Input
              type="password"
              placeholder="0x…"
              value={importValue}
              onChange={(e) => setImportValue(e.target.value)}
            />
          </Field>
          {error && <div className="text-sm text-err">{error}</div>}
          <Button
            variant="ghost"
            disabled={!importValue.trim()}
            onClick={() => {
              try {
                importWallet(importValue);
                onReady();
              } catch {
                setError("Invalid private key");
              }
            }}
          >
            Import
          </Button>
        </div>
      </Card>
      <p className="text-xs text-faint md:col-span-2">
        Keys are stored locally on this device (plain localStorage in this MVP build — OS keychain
        storage is a planned hardening step). Back up your key from Settings.
      </p>
    </div>
  );
}

export function WalletTab() {
  const settings = useSettings();
  const net = NETWORKS[settings.activeNetwork];
  const rpcUrl = settings.rpcUrls[net.id] || net.rpcUrl;
  const [address, setAddress] = useState<string | null>(walletAddress());

  if (!address) {
    return <WalletSetup onReady={() => setAddress(walletAddress())} />;
  }
  return <WalletHome key={address} address={address} rpcUrl={rpcUrl} explorerUrl={net.explorerUrl} onForget={() => setAddress(null)} />;
}

function WalletHome({
  address,
  rpcUrl,
  explorerUrl,
  onForget,
}: {
  address: string;
  rpcUrl: string;
  explorerUrl: string;
  onForget: () => void;
}) {
  const [sub, setSub] = useState<"receive" | "send">("receive");
  const [balance, setBalance] = useState<bigint | null>(null);

  usePoller(
    async () => {
      setBalance(await getBalance(rpcUrl, address));
    },
    15000,
    [rpcUrl, address],
  );

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="mb-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-faint">Balance</div>
            <div className="mt-1 text-3xl font-bold text-ink">
              {balance === null ? "…" : fmtEcx(balance)}{" "}
              <span className="text-base font-normal text-muted">{TOKEN_SYMBOL}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-sm text-muted">{shortAddr(address, 8)}</div>
            <div className="mt-2 flex justify-end gap-2">
              <CopyButton text={address} />
              <Button variant="danger" className="px-2 py-1 text-xs" onClick={onForget}>
                Use Different Wallet
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <SubTabs
        tabs={[
          { id: "receive" as const, label: "Receive" },
          { id: "send" as const, label: "Send" },
        ]}
        active={sub}
        onChange={setSub}
      />

      {sub === "receive" ? (
        <Card title="Receive">
          <div className="flex flex-col items-center gap-4">
            <Qr value={address} />
            <div className="break-all text-center font-mono text-sm text-ink">{address}</div>
            <CopyButton text={address} />
          </div>
        </Card>
      ) : (
        <SendCard address={address} balance={balance} explorerUrl={explorerUrl} />
      )}

      <div className="mt-4 text-xs text-faint">
        Danger zone lives in Settings (reveal key, delete wallet).
      </div>
    </div>
  );
}

function SendCard({
  address,
  balance,
  explorerUrl,
}: {
  address: string;
  balance: bigint | null;
  explorerUrl: string;
}) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toValid = isAddress(to);
  const amountValid = /^\d+(\.\d+)?$/.test(amount) && Number(amount) > 0;

  return (
    <Card title="Send">
      <div className="flex flex-col gap-3">
        <Field label={`From (your address)`}>
          <Input value={address} readOnly className="opacity-70" />
        </Field>
        <Field label="To">
          <Input placeholder="0x…" value={to} onChange={(e) => setTo(e.target.value)} />
        </Field>
        {to && !toValid && <div className="text-sm text-err">Invalid address</div>}
        <Field label={`Amount (${TOKEN_SYMBOL})`}>
          <Input
            placeholder="0.0"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </Field>
        {amount && !amountValid && <div className="text-sm text-err">Invalid amount</div>}
        {balance !== null && amountValid && (
          <div className="text-xs text-faint">
            Available: {fmtEcx(balance)} {TOKEN_SYMBOL}
          </div>
        )}
        {error && <div className="rounded border border-err/40 bg-err/10 p-2 text-sm text-err">{error}</div>}
        {txHash && (
          <div className="rounded border border-ok/40 bg-ok/10 p-2 text-sm text-ok">
            <div>Transaction submitted.</div>
            <a
              className="break-all font-mono underline"
              href={`${explorerUrl}/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
            >
              {txHash}
            </a>
          </div>
        )}
        <Button
          disabled={!toValid || !amountValid || busy}
          onClick={async () => {
            setBusy(true);
            setError(null);
            setTxHash(null);
            try {
              const hash = await sendEcx(to, amount);
              setTxHash(hash);
              setTo("");
              setAmount("");
              waitForReceipt(hash).catch(() => {});
            } catch (err) {
              setError(err instanceof Error ? err.message : String(err));
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Sending…" : "Send"}
        </Button>
      </div>
    </Card>
  );
}
