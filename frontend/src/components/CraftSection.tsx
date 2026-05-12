"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { ABI, CONTRACT_ADDRESS, CRAFT_PRICE } from "@/lib/contract";
import { TOMBSTONES, LEGENDARIES, type Recipe } from "@/lib/data";
import { LegendaryModal } from "@/components/LegendaryModal";

interface Props {
  recipe: Recipe;
  balances: Record<number, number>;
  legendaryCrafted: boolean;
  compact?: boolean;
}

export function CraftSection({ recipe, balances, legendaryCrafted, compact = false }: Props) {
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [modalOpen, setModalOpen] = useState(false);

  const { address } = useAccount();
  const legendary = LEGENDARIES.find((l) => l.id === recipe.legendary)!;
  const tombstones = recipe.tombstones.map((id) => TOMBSTONES.find((t) => t.id === id)!);
  const owned = recipe.tombstones.map((id) => (balances[id] ?? 0) > 0);
  const canCraft = owned.every(Boolean) && !legendaryCrafted;
  const ownedCount = owned.filter(Boolean).length;

  const { writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  const isBusy = isPending || isConfirming;

  const { data: legendaryBalance, refetch: refetchLegendary } = useReadContract({
    address: CONTRACT_ADDRESS, abi: ABI, functionName: "balanceOf",
    args: [address ?? "0x0000000000000000000000000000000000000000", BigInt(recipe.legendary)],
    query: { enabled: !!address, refetchInterval: 20_000 },
  });
  const userOwnsLegendary = Number(legendaryBalance ?? 0) > 0 || isSuccess;

  useEffect(() => {
    if (!isSuccess) return;
    const t = setTimeout(() => refetchLegendary(), 3_000);
    return () => clearTimeout(t);
  }, [isSuccess]);

  function handleCraft() {
    const cb = { onSuccess: (hash: `0x${string}`) => setTxHash(hash) };
    if (recipe.craftFn === "craft") {
      writeContract(
        { address: CONTRACT_ADDRESS, abi: ABI, functionName: "craft",
          args: [recipe.tombstones.map(BigInt) as [bigint, bigint, bigint]], value: CRAFT_PRICE },
        cb
      );
    } else {
      writeContract(
        { address: CONTRACT_ADDRESS, abi: ABI, functionName: recipe.craftFn,
          args: [], value: CRAFT_PRICE },
        cb
      );
    }
  }

  return (
    <>
      {modalOpen && <LegendaryModal legendary={legendary} crafted={userOwnsLegendary} onClose={() => setModalOpen(false)} />}

      <div
        className={`
          card-lift clip-cut border transition-all duration-300
          ${compact ? "p-3" : "p-5"}
          ${legendaryCrafted && !userOwnsLegendary ? "border-border"
            : userOwnsLegendary ? "border-accent/50"
            : canCraft          ? "border-accent/50 animate-glow"
            :                     "border-border hover:border-accent/20"}
        `}
      >
        {/* Header */}
        <div className={`flex items-center justify-between ${compact ? "mb-3" : "mb-5"}`}>
          <span className="font-mono text-[10px] tracking-widest text-accent uppercase">{recipe.group}</span>
          <div className="flex gap-1.5">
            {recipe.tombstones.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rotate-45 transition-colors ${owned[i] ? "bg-accent" : "bg-border"}`} />
            ))}
          </div>
        </div>

        {/* Slots */}
        <div className={`grid gap-1.5 ${compact ? "mb-3" : "mb-5"} ${recipe.tombstones.length === 4 ? "grid-cols-4" : "grid-cols-3"}`}>
          {tombstones.map((t, i) => (
            <div
              key={t.id}
              className={`text-center transition-all ${compact ? "p-1.5" : "p-3"} ${
                owned[i] ? "" : "opacity-40"
              }`}
            >
              <div className={`font-mono mb-0.5 ${compact ? "text-sm" : "text-lg"} ${owned[i] ? "text-accent" : "text-border"}`}>◈</div>
              <div className={`font-sans text-text leading-tight ${compact ? "text-[8px]" : "text-[10px]"}`}>{t.name}</div>
              {owned[i] && <div className={`font-mono text-accent mt-0.5 ${compact ? "text-[7px]" : "text-[9px]"}`}>✓</div>}
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className={`h-px bg-border ${compact ? "mb-3" : "mb-5"}`} />

        {/* Legendary — always shows image + clickable for modal */}
        <button
          onClick={userOwnsLegendary ? () => setModalOpen(true) : undefined}
          className={`w-full clip-cut border transition-all text-left ${compact ? "p-2 mb-2" : "p-4 mb-4"} ${userOwnsLegendary ? "group cursor-pointer" : "cursor-default"} ${
            legendaryCrafted && !userOwnsLegendary ? "border-border"
              : userOwnsLegendary ? "border-accent/50"
              : canCraft          ? "border-accent/40"
              :                     "border-border"
          }`}
        >
          {/* Portrait */}
          <div className={`w-full aspect-square overflow-hidden clip-cut-sm bg-navy relative ${compact ? "mb-1.5" : "mb-3"}`}>
            <img
              src={userOwnsLegendary ? `/nft/${legendary.id}.jpg` : `/nft/${legendary.id}_closed.jpg`}
              alt={legendary.name}
              className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              onError={(e) => { (e.target as HTMLImageElement).src = `/nft/${legendary.id}.jpg`; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
            <div className="absolute bottom-1.5 right-1.5 font-mono text-[7px] text-muted/60 tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              details →
            </div>
          </div>

          <div className={`font-mono text-center ${compact ? "text-base mb-1" : "text-2xl mb-2"} ${canCraft ? "text-accent" : "text-border"}`}>★</div>
          <div className={`font-sans font-semibold text-text text-center ${compact ? "text-[10px] mb-0.5" : "text-sm mb-1"}`}>{legendary.name}</div>
          {!compact && <div className="font-sans italic text-[11px] text-muted text-center leading-snug">"{legendary.quote}"</div>}
          <div className={`flex justify-center gap-2 ${compact ? "mt-1" : "mt-3 gap-4"}`}>
            <span className={`font-mono text-red-400 ${compact ? "text-[8px]" : "text-[10px]"}`}>{legendary.total_damage}</span>
            <span className="text-border">·</span>
            <span className={`font-mono ${compact ? "text-[8px]" : "text-[10px]"} ${legendary.status === "At Large" ? "text-red-400" : "text-muted"}`}>
              {legendary.status}
            </span>
          </div>
        </button>

        {/* Button */}
        <button
          onClick={handleCraft}
          disabled={!canCraft || isBusy}
          className={`
            w-full clip-cut-sm font-mono text-[10px] tracking-widest uppercase transition-all duration-200
            ${compact ? "py-2" : "py-3"}
            ${legendaryCrafted ? "bg-surface text-muted/30 cursor-not-allowed border border-border"
              : canCraft        ? "bg-accent text-navy hover:bg-accent/90 border border-accent font-bold"
              :                   "bg-surface text-muted/40 cursor-not-allowed border border-border"}
          `}
        >
          {legendaryCrafted ? "Already Crafted"
            : isSuccess      ? "★ Crafted"
            : isBusy         ? "Crafting…"
            : canCraft       ? "CRAFT"
            :                  `${ownedCount} / ${recipe.tombstones.length}`}
        </button>
      </div>
    </>
  );
}
