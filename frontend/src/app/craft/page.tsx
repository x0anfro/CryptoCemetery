"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContracts } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { CraftSection } from "@/components/CraftSection";
import { FTXCraftSection } from "@/components/FTXCraftSection";
import { MtGoxCraftSection } from "@/components/MtGoxCraftSection";
import { BitConnectCraftSection } from "@/components/BitConnectCraftSection";
import { OneCoinCraftSection } from "@/components/OneCoinCraftSection";
import { CelsiusCraftSection } from "@/components/CelsiusCraftSection";
import { LazarusCraftSection } from "@/components/LazarusCraftSection";
import { PizzaDayCraftSection } from "@/components/PizzaDayCraftSection";
import { TOMBSTONES, LEGENDARIES, RECIPES } from "@/lib/data";
import { ABI, CONTRACT_ADDRESS } from "@/lib/contract";

// IDs we need balances for: tombstones 1-32 + pizza day event 33 + witnesses 201-208 + legendaries
const WITNESS_IDS = [201, 202, 203, 204, 205, 206, 207, 208];
const LEGENDARY_IDS = LEGENDARIES.map((l) => l.id);
const BALANCE_IDS = [...TOMBSTONES.map((t) => t.id), 33, ...WITNESS_IDS, ...LEGENDARY_IDS];
// Unique legendaries (all except repeatable SBF #101)
const UNIQUE_LEGENDARY_IDS = LEGENDARIES.filter((l) => l.id !== 101).map((l) => l.id);

export default function CraftPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const { address, isConnected } = useAccount();
  const connected = mounted && isConnected;

  const balanceContracts = connected && address
    ? BALANCE_IDS.map((id) => ({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "balanceOf" as const,
        args: [address, BigInt(id)] as const,
      }))
    : [];

  const craftedContracts = connected && address
    ? UNIQUE_LEGENDARY_IDS.map((id) => ({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "legendaryCrafted" as const,
        args: [address, BigInt(id)] as const,
      }))
    : [];

  const { data: balanceData } = useReadContracts({
    contracts: balanceContracts,
    query: { enabled: connected && !!address, refetchInterval: 15_000 },
  });

  const { data: craftedData } = useReadContracts({
    contracts: craftedContracts,
    query: { enabled: connected && !!address, refetchInterval: 15_000 },
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

  const totalOwned     = TOMBSTONES.reduce((a, t) => a + (balances[t.id] ?? 0), 0);
  const totalWitnesses = WITNESS_IDS.reduce((a, id) => a + (balances[id] ?? 0), 0);
  const totalEpics     = LEGENDARIES.filter((l) => l.rarity === "epic")
                           .reduce((a, l) => a + ((balances[l.id] ?? 0) > 0 ? 1 : 0), 0);
  const totalLegendary = LEGENDARIES.filter((l) => l.rarity === "legendary")
                           .reduce((a, l) => a + ((balances[l.id] ?? 0) > 0 ? 1 : 0), 0);
  const epicTotal      = LEGENDARIES.filter((l) => l.rarity === "epic").length;
  const legendaryTotal = LEGENDARIES.filter((l) => l.rarity === "legendary").length;

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
        <p className="font-mono text-[11px] tracking-[0.4em] text-muted uppercase mb-4">Craft Room</p>
        <p className="text-text text-sm font-bold">Burn tombstones to reveal the villains behind them.</p>
      </div>

      {/* Not connected */}
      {!connected && (
        <div className="flex flex-col items-center gap-6 py-20 text-center">
          <svg viewBox="0 0 200 200" fill="none" className="w-24 h-24 opacity-20">
              <path d="M55 170 L55 75 Q55 40 100 40 Q145 40 145 75 L145 170 Z"
                    stroke="#f5f1e8" strokeWidth="7" strokeLinejoin="round"/>
              <text x="100" y="128" fontFamily="Georgia, serif" fontSize="58" fontWeight="bold"
                    fill="#f5f1e8" textAnchor="middle" letterSpacing="-3">CC</text>
            </svg>
          <p className="text-[#555] text-sm">Connect your wallet to see your tombstones</p>
          <ConnectButton />
        </div>
      )}

      {/* Connected */}
      {connected && (
        <>
          {/* Stats bar */}
          <div className="flex flex-wrap justify-center gap-8 mb-10 text-xs text-[#555] border-y border-border py-4">
            <span>
              Tombstones{" "}
              <span className="text-stone font-bold">{totalOwned} / {TOMBSTONES.length}</span>
            </span>
            <span className="text-border">·</span>
            <span>
              Witnesses{" "}
              <span className="text-stone font-bold">{totalWitnesses} / {WITNESS_IDS.length}</span>
            </span>
            <span className="text-border">·</span>
            <span>
              <span className="text-purple-400">Legendary</span>{" "}
              <span className="text-purple-400 font-bold">{totalLegendary} / {legendaryTotal}</span>
            </span>
            <span className="text-border">·</span>
            <span>
              <span className="text-orange-400">Epic</span>{" "}
              <span className="text-orange-400 font-bold">{totalEpics} / {epicTotal}</span>
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
            {RECIPES.filter((r) => r.group !== "Forgotten Keys" && r.group !== "Lazarus").map((recipe) => (
              <CraftSection
                key={recipe.legendary}
                recipe={recipe}
                balances={balances}
                legendaryCrafted={craftedMap[recipe.legendary] ?? false}
              />
            ))}

            {/* Celsius — 1:1 exchange, grouped with DoKwon/SuZhu */}
            <CelsiusCraftSection
              balances={balances}
              mashinskyCrafted={craftedMap[106] ?? false}
            />

            {/* OneCoin 4-witness craft */}
            <OneCoinCraftSection
              balances={balances}
              rujaCrafted={craftedMap[105] ?? false}
            />
          </div>

          {/* Crypt of Forgotten Keys */}
          <div className="mt-14">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-slate-700/50" />
              <span className="font-mono text-[10px] tracking-[0.3em] text-slate-400 uppercase">Crypt of Forgotten Keys</span>
              <div className="flex-1 h-px bg-slate-700/50" />
            </div>
            <div className="pl-4 border-l-2 border-slate-700/50 bg-gradient-to-r from-slate-900/20 to-transparent">
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {RECIPES.filter((r) => r.group === "Forgotten Keys").map((recipe) => (
                  <CraftSection
                    key={recipe.legendary}
                    recipe={recipe}
                    balances={balances}
                    legendaryCrafted={craftedMap[recipe.legendary] ?? false}
                    compact
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Lazarus Group */}
          <div className="mt-14">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-red-900/50" />
              <span className="font-mono text-[10px] tracking-[0.3em] text-red-400 uppercase">Lazarus Group</span>
              <div className="flex-1 h-px bg-red-900/50" />
            </div>
            <div className="pl-4 border-l-2 border-red-900/70 bg-gradient-to-r from-red-950/20 to-transparent">
              <LazarusCraftSection
                balances={balances}
                lazarusCrafted={craftedMap[110] ?? false}
              />
            </div>
          </div>

          {/* Bitcoin Pizza Day */}
          <div className="mt-14">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-amber-900/40" />
              <span className="font-mono text-[10px] tracking-[0.3em] text-amber-400 uppercase">Bitcoin Pizza Day</span>
              <div className="flex-1 h-px bg-amber-900/40" />
            </div>
            <div className="pl-4 border-l-2 border-amber-900/50 bg-gradient-to-r from-amber-950/10 to-transparent">
              <PizzaDayCraftSection
                balances={balances}
                pizzaCrafted={craftedMap[115] ?? false}
              />
            </div>
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
