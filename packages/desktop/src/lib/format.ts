// packages/desktop/src/lib/format.ts
import { formatEther } from "viem";

export function fmtEcx(wei: bigint, maxDecimals = 4): string {
  const s = formatEther(wei);
  const dot = s.indexOf(".");
  if (dot === -1) return s;
  const trimmed = s.slice(0, dot + maxDecimals + 1).replace(/\.?0+$/, "");
  return trimmed === "" ? "0" : trimmed;
}

export function fmtGwei(wei: bigint): string {
  const gwei = Number(wei) / 1e9;
  return gwei.toFixed(gwei < 10 ? 2 : 0);
}

export function shortAddr(addr: string, chars = 6): string {
  if (addr.length <= chars * 2 + 2) return addr;
  return `${addr.slice(0, chars + 2)}…${addr.slice(-chars)}`;
}

export function fmtTime(ts: number | null): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleString();
}

export function fmtAgo(ts: number | null): string {
  if (!ts) return "never";
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
