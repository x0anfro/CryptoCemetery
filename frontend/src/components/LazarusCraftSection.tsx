"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { ABI, CONTRACT_ADDRESS, CRAFT_PRICE } from "@/lib/contract";
import { TOMBSTONES, LEGENDARIES } from "@/lib/data";
import { LegendaryModal } from "@/components/LegendaryModal";

const LAZARUS_IDS = [26, 27, 28, 29, 30, 31, 32];

interface Props {
  balances: Record<number, number>;
  lazarusCrafted: boolean;
}

export function LazarusCraftSection({ balances, lazarusCrafted }: Props) {
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [modalOpen, setModalOpen] = useState(false);

  const { address } = useAccount();
  const legendary = LEGENDARIES.find((l) => l.id === 110)!;

  const tombstones = LAZARUS_IDS.map((id) => TOMBSTONES.find((t) => t.id === id)!);
  const owned = LAZARUS_IDS.map((id) => (balances[id] ?? 0) > 0);
  const canCraft = owned.every(Boolean) && !lazarusCrafted;
  const ownedCount = owned.filter(Boolean).length;

  const { writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  const isBusy = isPending || isConfirming;

  const { data: lazarusBalance, refetch: refetchLazarus } = useReadContract({
    address: CONTRACT_ADDRESS, abi: ABI, functionName: "balanceOf",
    args: [address ?? "0x0000000000000000000000000000000000000000", BigInt(110)],
    query: { enabled: !!address, refetchInterval: 20_000 },
  });
  const hasLazarusNFT = Number(lazarusBalance ?? 0) > 0 || isSuccess;

  useEffect(() => {
    if (!isSuccess) return;
    const t = setTimeout(() => refetchLazarus(), 3_000);
    return () => clearTimeout(t);
  }, [isSuccess]);

  function handleCraft() {
    writeContract(
      { address: CONTRACT_ADDRESS, abi: ABI, functionName: "craftLazarus", args: [], value: CRAFT_PRICE },
      { onSuccess: (h) => setTxHash(h) }
    );
  }

  return (
    <>
      {modalOpen && (
        <LegendaryModal legendary={legendary} crafted={hasLazarusNFT} onClose={() => setModalOpen(false)} />
      )}

      <div className={`
        card-lift clip-cut border p-5 transition-all duration-300
        ${lazarusCrafted && !hasLazarusNFT ? "border-red-900/40"
          : hasLazarusNFT ? "border-red-700/70"
          : canCraft      ? "border-red-700/70 shadow-[0_0_24px_rgba(127,29,29,0.35)]"
          :                 "border-red-900/40 hover:border-red-800/60"}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <span className="font-mono text-[10px] tracking-widest text-red-400 uppercase">Lazarus Group</span>
          <div className="flex gap-1.5">
            {owned.map((o, i) => (
              <div key={i} className={`w-1.5 h-1.5 rotate-45 transition-colors ${o ? "bg-red-500" : "bg-red-900/50"}`} />
            ))}
          </div>
        </div>

        {/* 7 witness slots */}
        <div className="grid grid-cols-7 gap-2 mb-5">
          {tombstones.map((t, i) => (
            <div key={t.id} className={`p-2 text-center transition-all ${owned[i] ? "" : "opacity-40"}`}>
              <div className={`font-mono text-base mb-1 ${owned[i] ? "text-red-400" : "text-red-900/50"}`}>◈</div>
              <div className="font-sans text-[9px] text-text leading-tight line-clamp-2">{t.name}</div>
              {owned[i] && <div className="font-mono text-[8px] text-red-400 mt-1">✓</div>}
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-red-900/40 mb-5" />

        {/* Legendary + craft — horizontal layout */}
        <div className="flex gap-5 items-start">
          {/* Portrait — clickable for modal */}
          <button
            onClick={hasLazarusNFT ? () => setModalOpen(true) : undefined}
            className={`flex-shrink-0 w-36 clip-cut border p-3 transition-all text-left ${hasLazarusNFT ? "group cursor-pointer" : "cursor-default"} ${
              lazarusCrafted && !hasLazarusNFT ? "border-red-900/30"
                : hasLazarusNFT ? "border-red-700/70"
                : canCraft      ? "border-red-700/50"
                :                 "border-red-900/40"
            }`}
          >
            <div className="w-full aspect-square overflow-hidden clip-cut-sm bg-navy mb-2 relative">
              <img
                src={hasLazarusNFT ? `/nft/110.jpg` : `/nft/110_closed.jpg`}
                alt={legendary.name}
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                onError={(e) => { (e.target as HTMLImageElement).src = `/nft/110.jpg`; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
              <div className="absolute bottom-1.5 right-1.5 font-mono text-[7px] text-red-400/50 tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                details →
              </div>
            </div>
            <div className={`font-mono text-xl mb-1 text-center ${canCraft ? "text-red-400" : "text-red-900/50"}`}>★</div>
            <div className="font-sans font-semibold text-[11px] text-text text-center leading-snug">{legendary.name}</div>
          </button>

          {/* Right side */}
          <div className="flex-1 flex flex-col gap-4">
            <div>
              <div className="font-mono text-[9px] tracking-widest text-red-400/60 uppercase mb-2">
                EPIC · {legendary.crime}
              </div>
              <p className="font-sans italic text-[11px] text-muted leading-snug">"{legendary.quote}"</p>
            </div>

            <div className="flex gap-6 flex-wrap">
              <div>
                <div className="font-mono text-[8px] text-muted/60 uppercase tracking-wider mb-0.5">Damage</div>
                <div className="font-mono text-xs font-bold text-red-400">{legendary.total_damage}</div>
              </div>
              <div>
                <div className="font-mono text-[8px] text-muted/60 uppercase tracking-wider mb-0.5">Status</div>
                <div className="font-mono text-xs font-bold text-red-400">{legendary.status}</div>
              </div>
              <div>
                <div className="font-mono text-[8px] text-muted/60 uppercase tracking-wider mb-0.5">Witnesses</div>
                <div className="font-mono text-xs font-bold text-text">{ownedCount} / 7</div>
              </div>
            </div>

            <button
              onClick={handleCraft}
              disabled={!canCraft || isBusy}
              className={`
                w-full py-3 clip-cut-sm font-mono text-[10px] tracking-widest uppercase transition-all duration-200
                ${lazarusCrafted ? "bg-surface text-muted/30 cursor-not-allowed border border-red-900/40"
                  : canCraft     ? "bg-red-900 text-red-100 hover:bg-red-800 border border-red-700 font-bold"
                  :                "bg-surface text-muted/40 cursor-not-allowed border border-red-900/40"}
              `}
            >
              {lazarusCrafted ? "Already Crafted"
                : isSuccess    ? "★ Crafted"
                : isBusy       ? "Crafting…"
                : canCraft     ? "UNLEASH"
                :                `${ownedCount} / 7 Witnesses`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
