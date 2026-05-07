"use client";

import { useAccount, useReadContracts } from "wagmi";
import { ScrollRevealGroup } from "@/components/ScrollRevealGroup";
import { LetterformTitle } from "@/components/LetterformTitle";
import { TOMBSTONES } from "@/lib/data";
import { ABI, CONTRACT_ADDRESS } from "@/lib/contract";

const GROUPS = [
  { label: "FTX",         villain: "Sam Bankman-Fried",  ids: [1,  2,  3]       },
  { label: "Terra",       villain: "Do Kwon",             ids: [4,  5,  6,  18]  },
  { label: "3AC",         villain: "Su Zhu",              ids: [19, 17, 20, 21]  },
  { label: "MT. GOX & BTC-e", villain: "Mark Karpeles",   ids: [7,  9,  8]       },
  { label: "BitConnect",      villain: "Satish Kumbhani", ids: [10, 11, 12]      },
  { label: "OneCoin",     villain: "Ruja Ignatova",       ids: [13, 14, 15]      },
  { label: "Celsius",     villain: "Alex Mashinsky",      ids: [16]              },
];


export default function MintPage() {
  const { address } = useAccount();

  const balanceContracts = address
    ? TOMBSTONES.map((t) => ({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "balanceOf" as const,
        args: [address, BigInt(t.id)] as const,
      }))
    : [];

  const { data: balanceData } = useReadContracts({
    contracts: balanceContracts,
    query: { enabled: !!address, refetchInterval: 15_000 },
  });

  const balances: Record<number, number> = {};
  if (balanceData) {
    TOMBSTONES.forEach((t, i) => {
      balances[t.id] = Number(balanceData[i]?.result ?? 0);
    });
  }

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="mb-16">
        <LetterformTitle />

        <div className="text-center mt-10 mb-10">
          <p className="font-mono text-sm tracking-[0.3em] text-accent uppercase">
            Mint &amp; Craft
          </p>
        </div>

        {/* Skull divider */}
        <div className="flex items-center gap-4 mt-12">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-border" />
          <svg viewBox="0 0 200 200" fill="none" className="w-8 h-8 opacity-40">
            <path d="M58 72 Q58 32 100 32 Q142 32 142 72 L142 112 Q142 128 132 134 L132 150 L116 150 L116 138 L106 138 L106 150 L94 150 L94 138 L84 138 L84 150 L68 150 L68 134 Q58 128 58 112 Z"
                  stroke="#f5f1e8" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round"/>
            <rect x="72" y="74" width="16" height="26" fill="#f5f1e8"/>
            <path d="M80 68 L80 74 M80 100 L80 106" stroke="#f5f1e8" strokeWidth="3" strokeLinecap="round"/>
            <rect x="112" y="74" width="16" height="26" fill="#f5f1e8"/>
            <path d="M120 68 L120 74 M120 100 L120 106" stroke="#f5f1e8" strokeWidth="3" strokeLinecap="round"/>
            <path d="M100 110 L94 122 L106 122 Z" fill="#f5f1e8"/>
          </svg>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-border" />
        </div>
      </div>

      {/* ── Groups ───────────────────────────────────────── */}
      {GROUPS.map((group, gi) => {
        const stones = group.ids.map((id) => TOMBSTONES.find((t) => t.id === id)!);
        return (
          <section key={group.label} className="mb-16">
            <div className="poly-divider mb-7">
              <span className="font-mono text-[10px] tracking-[0.3em] text-accent uppercase">{group.label}</span>
              <span className="font-mono text-[10px] text-muted">·</span>
              <span className="font-mono text-[10px] text-muted">{group.villain}</span>
            </div>
            <ScrollRevealGroup stones={stones} balances={balances} />
          </section>
        );
      })}
    </div>
  );
}
