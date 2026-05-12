"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { ABI, CONTRACT_ADDRESS, CRAFT_PRICE } from "@/lib/contract";
import { TOMBSTONES, LEGENDARIES } from "@/lib/data";
import { LegendaryModal } from "@/components/LegendaryModal";

interface Props {
  balances: Record<number, number>;
  mashinskyCrafted: boolean;
}

export function CelsiusCraftSection({ balances, mashinskyCrafted }: Props) {
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [modalOpen, setModalOpen] = useState(false);

  const { address } = useAccount();
  const celsius   = TOMBSTONES.find((t) => t.id === 16)!;
  const mashinsky = LEGENDARIES.find((l) => l.id === 106)!;

  const hasCelsius = (balances[16] ?? 0) > 0;
  const canCraft   = hasCelsius && !mashinskyCrafted;

  const { writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  const isBusy = isPending || isConfirming;

  const { data: mashinskyBalance, refetch: refetchMashinsky } = useReadContract({
    address: CONTRACT_ADDRESS, abi: ABI, functionName: "balanceOf",
    args: [address ?? "0x0000000000000000000000000000000000000000", BigInt(106)],
    query: { enabled: !!address, refetchInterval: 20_000 },
  });
  const hasMashinskyNFT = Number(mashinskyBalance ?? 0) > 0 || isSuccess;

  useEffect(() => {
    if (!isSuccess) return;
    const t = setTimeout(() => refetchMashinsky(), 3_000);
    return () => clearTimeout(t);
  }, [isSuccess]);

  function handleCraft() {
    writeContract(
      { address: CONTRACT_ADDRESS, abi: ABI, functionName: "craftMashinsky", args: [], value: CRAFT_PRICE },
      { onSuccess: (h) => setTxHash(h) }
    );
  }

  return (
    <>
      {modalOpen && <LegendaryModal legendary={mashinsky} crafted={hasMashinskyNFT} onClose={() => setModalOpen(false)} />}

      <div className={`
        card-lift clip-cut border p-5 transition-all duration-300
        ${mashinskyCrafted && !hasMashinskyNFT ? "border-border"
          : hasMashinskyNFT ? "border-accent/50"
          : canCraft        ? "border-accent/50 animate-glow"
          :                   "border-border hover:border-accent/20"}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <span className="font-mono text-[10px] tracking-widest text-accent uppercase">Celsius</span>
          <div className={`w-1.5 h-1.5 rotate-45 transition-colors ${hasCelsius ? "bg-accent" : "bg-border"}`} />
        </div>

        {/* Single slot */}
        <div className="mb-5">
          <div className={`p-3 text-center transition-all ${
            hasCelsius ? "" : "opacity-40"
          }`}>
            <div className={`font-mono text-lg mb-1 ${hasCelsius ? "text-accent" : "text-border"}`}>◈</div>
            <div className="font-sans text-[10px] text-text leading-tight">{celsius.name}</div>
            {hasCelsius && <div className="font-mono text-[9px] text-accent mt-1">✓</div>}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border mb-5" />

        {/* Legendary — clickable for modal */}
        <button
          onClick={hasMashinskyNFT ? () => setModalOpen(true) : undefined}
          className={`w-full clip-cut border p-4 mb-4 transition-all text-left ${hasMashinskyNFT ? "group cursor-pointer" : "cursor-default"} ${
            mashinskyCrafted && !hasMashinskyNFT ? "border-border"
              : hasMashinskyNFT ? "border-accent/50"
              : canCraft        ? "border-accent/40"
              :                   "border-border"
          }`}
        >
          <div className="w-full aspect-square overflow-hidden clip-cut-sm bg-navy mb-3 relative">
            <img
              src={hasMashinskyNFT ? "/nft/106.jpg" : "/nft/106_closed.jpg"}
              alt={mashinsky.name}
              className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
            <div className="absolute bottom-2 right-2 font-mono text-[8px] text-muted/60 tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              details →
            </div>
          </div>
          <div className={`font-mono text-2xl mb-2 text-center ${canCraft ? "text-accent" : "text-border"}`}>★</div>
          <div className="font-sans font-semibold text-sm text-text text-center mb-1">{mashinsky.name}</div>
          <div className="font-sans italic text-[11px] text-muted text-center leading-snug">"{mashinsky.quote}"</div>
          <div className="flex justify-center gap-4 mt-3">
            <span className="font-mono text-[10px] text-red-400">{mashinsky.total_damage}</span>
            <span className="text-border">·</span>
            <span className="font-mono text-[10px] text-muted">{mashinsky.status}</span>
          </div>
        </button>

        {/* Craft button */}
        <button
          onClick={handleCraft}
          disabled={!canCraft || isBusy}
          className={`
            w-full py-3 clip-cut-sm font-mono text-[10px] tracking-widest uppercase transition-all duration-200
            ${mashinskyCrafted ? "bg-surface text-muted/30 cursor-not-allowed border border-border"
              : canCraft        ? "bg-accent text-navy hover:bg-accent/90 border border-accent font-bold"
              :                   "bg-surface text-muted/40 cursor-not-allowed border border-border"}
          `}
        >
          {mashinskyCrafted ? "Already Crafted"
            : isSuccess      ? "★ Crafted"
            : isBusy         ? "Crafting…"
            : canCraft       ? "CRAFT"
            :                  "Need Celsius NFT"}
        </button>
      </div>
    </>
  );
}
