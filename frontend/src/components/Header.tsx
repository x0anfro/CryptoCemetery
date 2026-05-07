"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";

function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        if (!ready) return null;

        if (!connected) {
          return (
            <button
              onClick={openConnectModal}
              className="clip-cut-sm font-mono text-[10px] tracking-widest uppercase px-4 py-2 border border-border text-muted hover:border-accent/50 hover:text-accent transition-all duration-200"
            >
              Connect Wallet
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button
              onClick={openChainModal}
              className="clip-cut-sm font-mono text-[10px] tracking-widest uppercase px-4 py-2 border border-red-900/60 text-red-400 hover:border-red-500/60 transition-all duration-200"
            >
              Wrong Network
            </button>
          );
        }

        return (
          <div className="flex items-center gap-px">
            <button
              onClick={openChainModal}
              className="clip-cut-sm font-mono text-[10px] tracking-widest uppercase px-3 py-2 border border-border text-muted hover:border-accent/40 hover:text-accent transition-all duration-200 flex items-center gap-1.5"
            >
              {chain.hasIcon && chain.iconUrl && (
                <img src={chain.iconUrl} alt={chain.name} className="w-3 h-3 rounded-full" />
              )}
              <span>{chain.name}</span>
            </button>
            <button
              onClick={openAccountModal}
              className="font-mono text-[10px] tracking-widest uppercase px-4 py-2 border border-accent/30 text-accent bg-accent/5 hover:bg-accent/10 hover:border-accent/50 transition-all duration-200"
            >
              {account.displayName}
            </button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

export function Header() {
  const path = usePathname();

  return (
    <header className="border-b border-border bg-navy/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity group">
            <svg viewBox="0 0 200 200" fill="none" className="w-8 h-8 shrink-0">
              <path d="M58 72 Q58 32 100 32 Q142 32 142 72 L142 112 Q142 128 132 134 L132 150 L116 150 L116 138 L106 138 L106 150 L94 150 L94 138 L84 138 L84 150 L68 150 L68 134 Q58 128 58 112 Z"
                    stroke="#f5f1e8" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round"/>
              <rect x="72" y="74" width="16" height="26" fill="#f5f1e8"/>
              <path d="M80 68 L80 74 M80 100 L80 106" stroke="#f5f1e8" strokeWidth="3" strokeLinecap="round"/>
              <rect x="112" y="74" width="16" height="26" fill="#f5f1e8"/>
              <path d="M120 68 L120 74 M120 100 L120 106" stroke="#f5f1e8" strokeWidth="3" strokeLinecap="round"/>
              <path d="M100 110 L94 122 L106 122 Z" fill="#f5f1e8"/>
            </svg>
            <div className="leading-none">
              <div className="font-mono text-[10px] tracking-[0.2em] text-text/90 uppercase">Crypto</div>
              <div className="font-mono text-[10px] tracking-[0.2em] text-accent/70 uppercase">Cemetery</div>
            </div>
          </Link>
          <nav className="flex gap-7">
            <Link
              href="/"
              className={`font-mono text-[11px] tracking-widest uppercase transition-colors hover:text-accent ${path === "/" ? "text-accent" : "text-muted"}`}
            >
              Mint
            </Link>
            <Link
              href="/craft"
              className={`font-mono text-[11px] tracking-widest uppercase transition-colors hover:text-accent ${path === "/craft" ? "text-accent" : "text-muted"}`}
            >
              Craft
            </Link>
          </nav>
        </div>
        <WalletButton />
      </div>
    </header>
  );
}
