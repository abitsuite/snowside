// packages/desktop/src/App.tsx
import { useEffect, useState } from "react";
import "./styles.css";
import { useSettings } from "./lib/store";
import { NETWORKS } from "./lib/networks";
import { TopNav, type TabId } from "./components/TopNav";
import { OverviewTab } from "./tabs/OverviewTab";
import { WalletTab } from "./tabs/WalletTab";
import { BridgeTab } from "./tabs/BridgeTab";
import { NetworkTab } from "./tabs/NetworkTab";
import { ConsoleTab } from "./tabs/ConsoleTab";
import { SettingsTab } from "./tabs/SettingsTab";

export default function App() {
  const settings = useSettings();
  const [tab, setTab] = useState<TabId>("overview");

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  return (
    <div className="flex h-full flex-col bg-surface-0 text-ink">
      <TopNav active={tab} onChange={setTab} />
      <main className="flex-1 overflow-y-auto p-4">
        {tab === "overview" && <OverviewTab />}
        {tab === "wallet" && <WalletTab key={settings.activeNetwork} />}
        {tab === "bridge" && <BridgeTab />}
        {tab === "network" && <NetworkTab />}
        {tab === "console" && <ConsoleTab />}
        {tab === "settings" && <SettingsTab />}
      </main>
      <footer className="flex items-center justify-between border-t border-line bg-surface-1 px-4 py-1.5 text-xs text-faint">
        <span>
          {NETWORKS[settings.activeNetwork].label} ·{" "}
          <span className="font-mono">{settings.rpcUrls[settings.activeNetwork]}</span>
        </span>
        <span>eCash drivechain · slot 88 · light client</span>
      </footer>
    </div>
  );
}
