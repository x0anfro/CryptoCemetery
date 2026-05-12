"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { ABI, CONTRACT_ADDRESS, CRAFT_PRICE } from "@/lib/contract";
import { LEGENDARIES } from "@/lib/data";
import { LegendaryModal } from "@/components/LegendaryModal";

const EPIC_IDS = [101, 105, 108, 109, 110] as const;
const EPIC_NAMES: Record<number, string> = {
  101: "SBF",
  105: "Ruja",
  108: "Vinnik",
  109: "Kumbhani",
  110: "Lazarus",
};

interface Props {
  balances: Record<number, number>;
  pizzaCrafted: boolean;
}

export function PizzaDayCraftSection({ balances, pizzaCrafted }: Props) {
  const { address } = useAccount();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [modalOpen, setModalOpen] = useState(false);

  const laszlo = LEGENDARIES.find((l) => l.id === 115)!;

  const pizzaCount = balances[33] ?? 0;
  const hasFivePizza = pizzaCount >= 5;

  // Epics are required to own (not burned) — need all 5
  const ownedEpicIds = EPIC_IDS.filter((id) => (balances[id] ?? 0) > 0);
  const hasAllEpics = ownedEpicIds.length >= 5;

  const { writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  const isBusy = isPending || isConfirming;

  const { data: laszloBalance, refetch: refetchLaszlo } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "balanceOf",
    args: [address ?? "0x0000000000000000000000000000000000000000", BigInt(115)],
    query: { enabled: !!address, refetchInterval: 20_000 },
  });
  const hasLaszloNFT = Number(laszloBalance ?? 0) > 0 || isSuccess;

  useEffect(() => {
    if (!isSuccess) return;
    const t = setTimeout(() => refetchLaszlo(), 3_000);
    return () => clearTimeout(t);
  }, [isSuccess]);

  const canCraft = hasFivePizza && hasAllEpics && !pizzaCrafted;

  function handleCraft() {
    writeContract(
      { address: CONTRACT_ADDRESS, abi: ABI, functionName: "craftPizzaDay", args: [], value: CRAFT_PRICE },
      { onSuccess: (h) => setTxHash(h) }
    );
  }

  return (
    <>
      {modalOpen && <LegendaryModal legendary={laszlo} crafted={hasLaszloNFT} onClose={() => setModalOpen(false)} />}

      <div className={`
        clip-cut border p-5 transition-all duration-300
        ${pizzaCrafted && !hasLaszloNFT ? "border-amber-900/30"
          : hasLaszloNFT ? "border-amber-500/60"
          : canCraft     ? "border-amber-500/50 shadow-[0_0_24px_rgba(180,130,0,0.25)]"
          :                "border-amber-900/40 hover:border-amber-800/50"}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <span className="font-mono text-[10px] tracking-widest text-amber-400 uppercase">Bitcoin Pizza Day</span>
          <div className="flex gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rotate-45 transition-colors ${i < pizzaCount ? "bg-amber-500" : "bg-amber-900/50"}`} />
            ))}
            <div className="w-px h-3 bg-amber-900/50 mx-1 self-center" />
            {EPIC_IDS.map((id) => (
              <div key={id} className={`w-1.5 h-1.5 rotate-45 transition-colors ${(balances[id] ?? 0) > 0 ? "bg-amber-500" : "bg-amber-900/50"}`} />
            ))}
          </div>
        </div>

        <div className="flex gap-5 items-start">

          {/* Portrait */}
          <button
            onClick={hasLaszloNFT ? () => setModalOpen(true) : undefined}
            className={`flex-shrink-0 w-36 clip-cut border p-3 transition-all text-left ${hasLaszloNFT ? "group cursor-pointer" : "cursor-default"} ${
              pizzaCrafted && !hasLaszloNFT ? "border-amber-900/30"
                : hasLaszloNFT ? "border-amber-500/60"
                : canCraft     ? "border-amber-500/40"
                :                "border-amber-900/40"
            }`}
          >
            <div className="w-full aspect-square overflow-hidden clip-cut-sm bg-navy mb-2 relative">
              <img
                src={hasLaszloNFT ? "/nft/115.jpg" : "/nft/115_closed.jpg"}
                alt={laszlo.name}
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  const el = e.target as HTMLImageElement;
                  el.style.display = "none";
                  el.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-amber-700/40 text-4xl">₿</div>';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
              <div className="absolute bottom-1.5 right-1.5 font-mono text-[7px] text-amber-400/50 tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                details →
              </div>
            </div>
            <div className={`font-mono text-xl mb-1 text-center ${canCraft ? "text-amber-400" : "text-amber-900/50"}`}>★</div>
            <div className="font-sans font-semibold text-[11px] text-text text-center leading-snug">{laszlo.name}</div>
          </button>

          {/* Right side */}
          <div className="flex-1 flex flex-col gap-4">
            <div>
              <div className="font-mono text-[9px] tracking-widest text-amber-400/60 uppercase mb-2">
                EPIC · {laszlo.crime}
              </div>
              <p className="font-sans italic text-[11px] text-muted leading-snug">"{laszlo.quote}"</p>
            </div>

            {/* Requirements */}
            <div className="grid grid-cols-2 gap-4">

              {/* Pizza Day NFTs — burned */}
              <div>
                <div className="font-mono text-[8px] text-muted/60 uppercase tracking-wider mb-2">
                  Burn Pizza Day NFTs · {pizzaCount} / 5
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`p-1.5 text-center clip-cut border transition-all ${i < pizzaCount ? "border-amber-600/50 bg-amber-950/20" : "border-amber-900/30 opacity-40"}`}
                    >
                      <div className={`font-mono text-xs ${i < pizzaCount ? "text-amber-400" : "text-amber-900/50"}`}>₿</div>
                      {i < pizzaCount && <div className="font-mono text-[7px] text-amber-400 mt-0.5">✓</div>}
                    </div>
                  ))}
                </div>
                <div className="h-1 bg-surface border border-amber-900/40 mt-2">
                  <div
                    className="h-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${(Math.min(pizzaCount, 5) / 5) * 100}%` }}
                  />
                </div>
              </div>

              {/* Epic NFTs — required to own, not burned */}
              <div>
                <div className="font-mono text-[8px] text-muted/60 uppercase tracking-wider mb-2">
                  Own All Epics · {ownedEpicIds.length} / 5
                </div>
                <div className="flex flex-col gap-1">
                  {EPIC_IDS.map((id) => {
                    const owned = (balances[id] ?? 0) > 0;
                    return (
                      <div
                        key={id}
                        className={`flex items-center gap-1.5 font-mono text-[9px] transition-all ${
                          owned ? "text-amber-400" : "text-muted/30"
                        }`}
                      >
                        <div className={`w-1 h-1 rotate-45 ${owned ? "bg-amber-400" : "bg-muted/30"}`} />
                        {EPIC_NAMES[id]}
                        {owned
                          ? <span className="text-amber-600/60 text-[7px]">owned ✓</span>
                          : <span className="text-muted/30 text-[7px]">missing</span>
                        }
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-6 flex-wrap">
              <div>
                <div className="font-mono text-[8px] text-muted/60 uppercase tracking-wider mb-0.5">Damage</div>
                <div className="font-mono text-xs font-bold text-amber-400">{laszlo.total_damage}</div>
              </div>
              <div>
                <div className="font-mono text-[8px] text-muted/60 uppercase tracking-wider mb-0.5">Status</div>
                <div className="font-mono text-xs font-bold text-amber-400">{laszlo.status}</div>
              </div>
            </div>

            <button
              onClick={handleCraft}
              disabled={!canCraft || isBusy}
              className={`
                w-full py-3 clip-cut-sm font-mono text-[10px] tracking-widest uppercase transition-all duration-200
                ${pizzaCrafted ? "bg-surface text-muted/30 cursor-not-allowed border border-amber-900/30"
                  : canCraft   ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-600/60 font-bold"
                  :              "bg-surface text-muted/40 cursor-not-allowed border border-amber-900/30"}
              `}
            >
              {pizzaCrafted     ? "Already Crafted"
                : isSuccess     ? "★ Crafted"
                : isBusy        ? "Crafting…"
                : !hasFivePizza ? `${pizzaCount} / 5 Pizza Day NFTs`
                : !hasAllEpics  ? `${ownedEpicIds.length} / 5 Epics`
                :                 "CRAFT"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
