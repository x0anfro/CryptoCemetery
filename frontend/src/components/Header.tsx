"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState, useEffect, useRef } from "react";

const FAQ_ITEMS = [
  {
    q: "What is Crypto Cemetery?",
    a: "NFT collection on Shape L2. Each tombstone marks a real crypto disaster — collapsed exchange, rug pull, or convicted fraudster. Burn tombstones to craft villain portraits.",
  },
  {
    q: "How do I mint?",
    a: "Connect wallet, pick a tombstone, pay 0.00042 ETH. ERC-1155 — you can hold multiple copies of the same token.",
  },
  {
    q: "What is crafting?",
    a: "Burn tombstones to mint a villain portrait. Some chains are multi-stage — you unlock intermediate characters first, then the final boss. Burned tokens are gone permanently.",
  },
  {
    q: "What are the rarities?",
    a: "Common tombstones → Rare witnesses (intermediate craft drops) → Legendary portraits → Epic portraits. Epics are sealed until crafted: you see a locked card until the moment you craft it — then the full reveal artwork appears.",
  },
  {
    q: "What network & wallet?",
    a: "Shape L2 (chain ID 360). Any EVM wallet — MetaMask, Rabby, Coinbase Wallet. Bridge ETH to Shape before minting.",
  },
];

function FaqPanel() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`clip-cut-sm font-mono text-[10px] tracking-widest uppercase px-4 py-2 border transition-all duration-200 ${
          open
            ? "border-accent/60 text-accent bg-accent/10"
            : "border-border text-muted hover:border-accent/50 hover:text-accent"
        }`}
      >
        FAQ
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-[420px] bg-panel border border-accent/20 clip-cut shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-50">
          <div className="px-4 pt-4 pb-2 border-b border-border/50 flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-[0.3em] text-accent uppercase">How it works</span>
            <button onClick={() => setOpen(false)} className="font-mono text-[10px] text-muted hover:text-text transition-colors">ESC</button>
          </div>
          <div className="flex flex-col max-h-[70vh] overflow-y-auto">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="border-b border-border/40 last:border-b-0">
                <button
                  onClick={() => setExpanded(expanded === i ? null : i)}
                  className="w-full flex items-start justify-between px-4 py-3 text-left group gap-3"
                >
                  <span className="font-mono text-[11px] tracking-wide text-text group-hover:text-accent transition-colors leading-snug">
                    {item.q}
                  </span>
                  <svg
                    viewBox="0 0 10 6"
                    className={`w-2.5 h-2.5 shrink-0 mt-0.5 transition-transform duration-200 fill-current text-accent ${expanded === i ? "rotate-180" : "rotate-0"}`}
                  >
                    <path d="M0 0 L5 6 L10 0Z" />
                  </svg>
                </button>
                <div className={`grid transition-all duration-300 ease-in-out ${expanded === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden min-h-0">
                    <p className="px-4 pb-4 font-sans text-[12px] text-muted leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

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
        <div className="flex items-center gap-2">
          <FaqPanel />
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
