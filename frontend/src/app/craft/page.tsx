"use client";

import { useAccount, useReadContracts } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { CraftSection } from "@/components/CraftSection";
import { FTXCraftSection } from "@/components/FTXCraftSection";
import { MtGoxCraftSection } from "@/components/MtGoxCraftSection";
import { BitConnectCraftSection } from "@/components/BitConnectCraftSection";
import { OneCoinCraftSection } from "@/components/OneCoinCraftSection";
import { CelsiusCraftSection } from "@/components/CelsiusCraftSection";
import { TOMBSTONES, LEGENDARIES, RECIPES } from "@/lib/data";
import { ABI, CONTRACT_ADDRESS } from "@/lib/contract";

// IDs we need balances for: tombstones 1-21 + intermediates 201-208
const BALANCE_IDS = [...TOMBSTONES.map((t) => t.id), 201, 202, 203, 204, 205, 206, 207, 208];
// Unique legendaries (all except repeatable SBF #101)
const UNIQUE_LEGENDARY_IDS = LEGENDARIES.filter((l) => l.id !== 101).map((l) => l.id);

export default function CraftPage() {
  const { address, isConnected } = useAccount();

  const balanceContracts = isConnected && address
    ? BALANCE_IDS.map((id) => ({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "balanceOf" as const,
        args: [address, BigInt(id)] as const,
      }))
    : [];

  const craftedContracts = UNIQUE_LEGENDARY_IDS.map((id) => ({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "legendaryCrafted" as const,
    args: [BigInt(id)] as const,
  }));

  const { data: balanceData } = useReadContracts({
    contracts: balanceContracts,
    query: { enabled: isConnected && !!address, refetchInterval: 15_000 },
  });

  const { data: craftedData } = useReadContracts({
    contracts: craftedContracts,
    query: { refetchInterval: 15_000 },
  });

  const balances: Record<number, number> = {};
  if (balanceData) {
    BALANCE_IDS.forEach((id, i) => {
      balances[id] = Number(balanceData[i]?.result ?? 0);
    });
  }

  const craftedMap: Record<number, boolean> = {};
  if (craftedData) {
    UNIQUE_LEGENDARY_IDS.forEach((id, i) => {
      craftedMap[id] = Boolean(craftedData[i]?.result);
    });
  }

  const totalOwned = TOMBSTONES.reduce((a, t) => a + (balances[t.id] ?? 0), 0);

  return (
    <div>
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-5 mb-5">
          <div className="flex-1 max-w-[120px] h-px bg-gradient-to-r from-transparent to-border" />
          <svg viewBox="0 0 200 200" fill="none" className="w-10 h-10 opacity-60">
            <path d="M58 72 Q58 32 100 32 Q142 32 142 72 L142 112 Q142 128 132 134 L132 150 L116 150 L116 138 L106 138 L106 150 L94 150 L94 138 L84 138 L84 150 L68 150 L68 134 Q58 128 58 112 Z"
                  stroke="#f5f1e8" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round"/>
            <rect x="72" y="74" width="16" height="26" fill="#f5f1e8"/>
            <path d="M80 68 L80 74 M80 100 L80 106" stroke="#f5f1e8" strokeWidth="3" strokeLinecap="round"/>
            <rect x="112" y="74" width="16" height="26" fill="#f5f1e8"/>
            <path d="M120 68 L120 74 M120 100 L120 106" stroke="#f5f1e8" strokeWidth="3" strokeLinecap="round"/>
            <path d="M100 110 L94 122 L106 122 Z" fill="#f5f1e8"/>
          </svg>
          <div className="flex-1 max-w-[120px] h-px bg-gradient-to-l from-transparent to-border" />
        </div>
        <h1 className="font-mono text-[11px] tracking-[0.4em] text-muted uppercase mb-3">Craft Room</h1>
        <p className="text-muted text-sm max-w-xl mx-auto leading-relaxed">
          Burn tombstones to reveal the villains behind them.
          FTX is a three-stage craft — interrogate Caroline, then Gary, then sentence SBF.
        </p>
      </div>

      {/* Not connected */}
      {!isConnected && (
        <div className="flex flex-col items-center gap-6 py-20 text-center">
          <div className="text-6xl text-[#2a2a2a]">✝</div>
          <p className="text-[#555] text-sm">Connect your wallet to see your tombstones</p>
          <ConnectButton />
        </div>
      )}

      {/* Connected */}
      {isConnected && (
        <>
          {/* Stats bar */}
          <div className="flex justify-center gap-10 mb-10 text-xs text-[#555] border-y border-border py-4">
            <span>
              Tombstones owned:{" "}
              <span className="text-stone font-bold">{totalOwned}</span>
            </span>
            <span>
              Legendaries crafted:{" "}
              <span className="text-stone font-bold">
                {Object.values(craftedMap).filter(Boolean).length} / {UNIQUE_LEGENDARY_IDS.length}
              </span>
            </span>
          </div>

          {/* Recipe grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* FTX 3-stage craft */}
            <FTXCraftSection balances={balances} />

            {/* Mt.Gox / BTC-e crossover craft */}
            <MtGoxCraftSection
              balances={balances}
              karpelesCrafted={craftedMap[103] ?? false}
              vinnikCrafted={craftedMap[108] ?? false}
            />

            {/* BitConnect crossover craft */}
            <BitConnectCraftSection
              balances={balances}
              matosCrafted={craftedMap[104] ?? false}
              kumbhaniCrafted={craftedMap[109] ?? false}
            />

            {/* Regular crafts (Terra 4-NFT, 3AC 4-NFT) */}
            {RECIPES.map((recipe) => (
              <CraftSection
                key={recipe.legendary}
                recipe={recipe}
                balances={balances}
                legendaryCrafted={craftedMap[recipe.legendary] ?? false}
              />
            ))}

            {/* OneCoin 4-witness craft */}
            <OneCoinCraftSection
              balances={balances}
              rujaCrafted={craftedMap[105] ?? false}
            />

            {/* Celsius — 1:1 exchange */}
            <CelsiusCraftSection
              balances={balances}
              mashinskyCrafted={craftedMap[106] ?? false}
            />
          </div>

          {/* Your collection */}
          {totalOwned > 0 && (
            <section className="mt-14">
              <div className="flex items-center gap-4 mb-5">
                <h2 className="font-serif text-stone/70 text-xs tracking-widest uppercase">
                  Your Collection
                </h2>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="flex flex-wrap gap-3">
                {TOMBSTONES.filter((t) => (balances[t.id] ?? 0) > 0).map((t) => (
                  <div key={t.id} className="border border-stone/40 bg-stone/5 rounded px-3 py-2 text-xs">
                    <span className="text-stone mr-2">✝</span>
                    <span className="text-[#ccc]">{t.name}</span>
                  </div>
                ))}
                {(balances[201] ?? 0) > 0 && (
                  <div className="border border-accent/40 bg-accent/5 rounded px-3 py-2 text-xs">
                    <span className="text-accent mr-2">◈</span>
                    <span className="text-[#ccc]">Caroline Ellison</span>
                  </div>
                )}
                {(balances[202] ?? 0) > 0 && (
                  <div className="border border-accent/40 bg-accent/5 rounded px-3 py-2 text-xs">
                    <span className="text-accent mr-2">◈</span>
                    <span className="text-[#ccc]">Gary Wang</span>
                  </div>
                )}
                {(balances[203] ?? 0) > 0 && (
                  <div className="border border-accent/40 bg-accent/5 rounded px-3 py-2 text-xs">
                    <span className="text-accent mr-2">◈</span>
                    <span className="text-[#ccc]">Alexei Bilyuchenko ×{balances[203]}</span>
                  </div>
                )}
                {(balances[204] ?? 0) > 0 && (
                  <div className="border border-accent/40 bg-accent/5 rounded px-3 py-2 text-xs">
                    <span className="text-accent mr-2">◈</span>
                    <span className="text-[#ccc]">Glenn Arcaro ×{balances[204]}</span>
                  </div>
                )}
                {(balances[205] ?? 0) > 0 && (
                  <div className="border border-accent/40 bg-accent/5 rounded px-3 py-2 text-xs">
                    <span className="text-accent mr-2">◈</span>
                    <span className="text-[#ccc]">Irina Dilkinska</span>
                  </div>
                )}
                {(balances[206] ?? 0) > 0 && (
                  <div className="border border-accent/40 bg-accent/5 rounded px-3 py-2 text-xs">
                    <span className="text-accent mr-2">◈</span>
                    <span className="text-[#ccc]">Karl Greenwood</span>
                  </div>
                )}
                {(balances[207] ?? 0) > 0 && (
                  <div className="border border-accent/40 bg-accent/5 rounded px-3 py-2 text-xs">
                    <span className="text-accent mr-2">◈</span>
                    <span className="text-[#ccc]">Konstantin Ignatov</span>
                  </div>
                )}
                {(balances[208] ?? 0) > 0 && (
                  <div className="border border-accent/40 bg-accent/5 rounded px-3 py-2 text-xs">
                    <span className="text-accent mr-2">◈</span>
                    <span className="text-[#ccc]">Mark Scott</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {totalOwned === 0 && (
            <div className="text-center py-16 text-[#444] text-sm">
              You don't own any tombstones yet.{" "}
              <a href="/" className="text-stone underline hover:no-underline">
                Go mint some →
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}
