"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContracts } from "wagmi";
import { ABI, CONTRACT_ADDRESS, CRAFT_PRICE } from "@/lib/contract";
import { TOMBSTONES, LEGENDARIES, INTERMEDIATES } from "@/lib/data";
import { LegendaryModal } from "@/components/LegendaryModal";
import { IntermediateModal } from "@/components/IntermediateModal";
import { type Intermediate } from "@/lib/data";

interface Props {
  balances: Record<number, number>;
  matosCrafted: boolean;
  kumbhaniCrafted: boolean;
}

function SlotCard({ name, label, owned }: { name: string; label?: string; owned: boolean }) {
  return (
    <div className={`p-2 text-center transition-all ${
      owned ? "" : "opacity-40"
    }`}>
      <div className={`font-mono text-base mb-0.5 ${owned ? "text-accent" : "text-border"}`}>◈</div>
      <div className="font-sans text-[9px] text-text leading-tight">{name}</div>
      <div className="font-mono text-[8px] text-muted mt-0.5 min-h-[12px]">{label ?? ""}</div>
      <div className="font-mono text-[8px] text-accent mt-0.5 min-h-[12px]">{owned ? "✓" : ""}</div>
    </div>
  );
}

function LegendaryCard({ legendary, crafted, canCraft, onClick }: {
  legendary: (typeof LEGENDARIES)[number];
  crafted: boolean; canCraft: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full clip-cut border p-3 mb-3 transition-all text-left group ${
        crafted    ? "border-border opacity-40"
        : canCraft ? "border-accent/40 hover:border-accent/70"
        :            "border-border hover:border-accent/20"
      }`}
    >
      <div className="w-full aspect-square overflow-hidden clip-cut-sm bg-navy mb-2 relative">
        <img
          src={`/nft/${legendary.id}.jpg`}
          alt={legendary.name}
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
        <div className="absolute bottom-1.5 right-1.5 font-mono text-[7px] text-muted/50 opacity-0 group-hover:opacity-100 transition-opacity">
          подробнее →
        </div>
      </div>
      <div className={`font-mono text-lg text-center mb-1 ${canCraft && !crafted ? "text-accent" : "text-border"}`}>★</div>
      <div className="font-sans font-semibold text-xs text-text text-center mb-0.5">{legendary.name}</div>
      <div className="font-sans italic text-[10px] text-muted text-center leading-snug">"{legendary.quote}"</div>
      <div className="flex justify-center gap-3 mt-2">
        <span className="font-mono text-[9px] text-red-400">{legendary.total_damage}</span>
        <span className="text-border">·</span>
        <span className={`font-mono text-[9px] ${legendary.status === "At Large" ? "text-red-400" : "text-muted"}`}>
          {legendary.status}
        </span>
      </div>
    </button>
  );
}

export function BitConnectCraftSection({ balances, matosCrafted, kumbhaniCrafted }: Props) {
  const { address } = useAccount();

  const [arcHash,  setArcHash]  = useState<`0x${string}` | undefined>();
  const [matHash,  setMatHash]  = useState<`0x${string}` | undefined>();
  const [kumHash,  setKumHash]  = useState<`0x${string}` | undefined>();
  const [modal, setModal]       = useState<104 | 109 | null>(null);
  const [intModal, setIntModal] = useState<Intermediate | null>(null);

  const arcaro   = INTERMEDIATES.find((i) => i.id === 204)!;
  const matos    = LEGENDARIES.find((l) => l.id === 104)!;
  const kumbhani = LEGENDARIES.find((l) => l.id === 109)!;

  const bcTombstones   = TOMBSTONES.filter((t) => [10, 11, 12].includes(t.id));
  const hasBitConnect  = (balances[10] ?? 0) > 0;
  const hasBitConnectX = (balances[11] ?? 0) > 0;
  const hasBCC         = (balances[12] ?? 0) > 0;
  const ownedSlots     = [hasBitConnect, hasBitConnectX, hasBCC];
  const hasTombstones  = hasBitConnect && hasBitConnectX && hasBCC;
  const ownedCount     = ownedSlots.filter(Boolean).length;

  const hasBitConnect2 = (balances[10] ?? 0) >= 2;
  const hasBCC2        = (balances[12] ?? 0) >= 2;

  const { writeContract: writeArc, isPending: pendingA } = useWriteContract();
  const { writeContract: writeMat, isPending: pendingM } = useWriteContract();
  const { writeContract: writeKum, isPending: pendingK } = useWriteContract();

  const { isLoading: confirmA, isSuccess: successA } = useWaitForTransactionReceipt({ hash: arcHash });
  const { isLoading: confirmM, isSuccess: successM } = useWaitForTransactionReceipt({ hash: matHash });
  const { isLoading: confirmK, isSuccess: successK } = useWaitForTransactionReceipt({ hash: kumHash });

  const busyA = pendingA || confirmA;
  const busyM = pendingM || confirmM;
  const busyK = pendingK || confirmK;

  const { data: arcData, refetch: refetchArc } = useReadContracts({
    contracts: [{
      address: CONTRACT_ADDRESS, abi: ABI, functionName: "balanceOf" as const,
      args: [address ?? "0x0000000000000000000000000000000000000000", BigInt(204)] as const,
    }],
    query: { enabled: !!address, refetchInterval: busyA ? 3_000 : 20_000 },
  });

  const arcBalance = Number(arcData?.[0]?.result ?? balances[204] ?? 0);
  const hasArc     = arcBalance >= 1;

  const canGetArc  = hasTombstones;
  const canMatos   = hasBitConnect2 && hasArc && !matosCrafted;
  const canKumbhani = hasBCC2 && hasArc && !kumbhaniCrafted;

  useEffect(() => {
    if (!successA) return;
    const t = setTimeout(() => refetchArc(), 3_000);
    return () => clearTimeout(t);
  }, [successA]);

  function handleArcaro() {
    writeArc({
      address: CONTRACT_ADDRESS, abi: ABI,
      functionName: "craftArcaro",
      args: [[BigInt(10), BigInt(11), BigInt(12)]],
      value: CRAFT_PRICE,
    }, { onSuccess: (h) => setArcHash(h) });
  }

  function handleMatos() {
    writeMat({
      address: CONTRACT_ADDRESS, abi: ABI,
      functionName: "craftMatos",
      args: [],
      value: CRAFT_PRICE,
    }, { onSuccess: (h) => setMatHash(h) });
  }

  function handleKumbhani() {
    writeKum({
      address: CONTRACT_ADDRESS, abi: ABI,
      functionName: "craftKumbhani",
      args: [],
      value: CRAFT_PRICE,
    }, { onSuccess: (h) => setKumHash(h) });
  }

  const modalLegendary = modal === 104 ? matos : modal === 109 ? kumbhani : null;

  return (
    <>
      {modalLegendary && <LegendaryModal legendary={modalLegendary} onClose={() => setModal(null)} />}
      {intModal && <IntermediateModal intermediate={intModal} onClose={() => setIntModal(null)} />}

      <div className="clip-cut border border-border p-5 col-span-1 md:col-span-2 xl:col-span-3">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="font-mono text-[10px] tracking-widest text-accent uppercase">BitConnect</span>
              <span className="font-mono text-[9px] text-muted ml-3 tracking-widest uppercase">Crossover Craft</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-[9px]">
              <span className={arcBalance > 0 ? "text-accent" : "text-muted"}>Arcaro ×{arcBalance}</span>
              <span className="text-border mx-1">→</span>
              <span className={matosCrafted ? "text-accent" : "text-muted"}>Matos</span>
              <span className="text-border mx-1">+</span>
              <span className={kumbhaniCrafted ? "text-accent" : "text-muted"}>Kumbhani</span>
            </div>
          </div>
          <div className="border border-border/50 bg-surface/50 clip-cut-sm px-4 py-3">
            <p className="font-sans text-[12px] text-muted leading-relaxed">
              <span className="text-accent font-semibold">Гленн Аркаро</span> — главный промоутер BitConnect в США,
              сотрудничал со следствием и сдал схему изнутри.
              Сожгите три надгробия чтобы получить его показания, затем используйте их для обоих дел:
              Матос пойман через суд, Кумбхани до сих пор в бегах.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Stage 1: Get Arcaro */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="font-mono text-[9px] tracking-widest text-muted uppercase bg-surface border border-border px-2 py-1">Stage 1</div>
              <div className="font-mono text-[10px] text-text">Получить показания</div>
              <div className="flex gap-1 ml-auto">
                {ownedSlots.map((o, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rotate-45 ${o ? "bg-accent" : "bg-border"}`} />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 mb-4">
              {bcTombstones.map((t, i) => (
                <SlotCard key={t.id} name={t.name} owned={ownedSlots[i]} />
              ))}
            </div>

            <div className="h-px bg-border mb-4" />

            <button
              onClick={() => setIntModal(arcaro)}
              className={`w-full clip-cut border p-3 mb-3 transition-all text-left group ${
                arcBalance > 0 ? "border-accent/50 hover:border-accent/80" : "border-border hover:border-accent/30"
              }`}
            >
              <div className="w-full aspect-square overflow-hidden clip-cut-sm bg-navy mb-2 relative">
                <img
                  src="/nft/204.jpg"
                  alt="Glenn Arcaro"
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <div className="absolute bottom-1.5 right-1.5 font-mono text-[7px] text-muted/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  подробнее →
                </div>
              </div>
              <div className="font-mono text-[9px] tracking-widest uppercase text-center px-2 py-0.5 border mb-1.5 mx-auto w-fit border-accent/30 bg-accent/10 text-accent">
                ◈ Свидетель
              </div>
              <div className="font-sans text-xs text-text font-semibold text-center">{arcaro.name}</div>
              <div className="font-mono text-[9px] text-muted text-center">{arcaro.role}</div>
              {arcBalance > 0 && (
                <div className="font-mono text-[10px] text-accent text-center mt-1.5">×{arcBalance} в кошельке</div>
              )}
            </button>

            <button
              onClick={handleArcaro}
              disabled={!canGetArc || busyA}
              className={`
                mt-auto w-full py-2.5 clip-cut-sm font-mono text-[10px] tracking-widest uppercase transition-all duration-200
                ${canGetArc && !busyA
                  ? "bg-accent text-navy hover:bg-accent/90 border border-accent font-bold animate-glow"
                  : "bg-surface text-muted/40 cursor-not-allowed border border-border"}
              `}
            >
              {busyA          ? "Crafting…"
               : !hasTombstones ? `${ownedCount} / 3`
               :                  "CRAFT"}
            </button>
          </div>

          {/* Stage 2a: Matos */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="font-mono text-[9px] tracking-widest text-muted uppercase bg-surface border border-border px-2 py-1">Stage 2a</div>
              <div className="font-mono text-[10px] text-text">BitConnect</div>
              <div className="flex gap-1 ml-auto">
                {[hasBitConnect, hasBitConnect2, hasArc].map((o, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rotate-45 ${o ? "bg-accent" : "bg-border"}`} />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 mb-4">
              <SlotCard name="BitConnect" label="×1" owned={hasBitConnect} />
              <SlotCard name="BitConnect" label="×2" owned={hasBitConnect2} />
              <SlotCard name="Arcaro"     owned={hasArc} />
            </div>

            <div className="h-px bg-border mb-4" />

            <LegendaryCard legendary={matos} crafted={matosCrafted} canCraft={canMatos} onClick={() => setModal(104)} />

            <button
              onClick={handleMatos}
              disabled={!canMatos || busyM}
              className={`
                mt-auto w-full py-2.5 clip-cut-sm font-mono text-[10px] tracking-widest uppercase transition-all duration-200
                ${matosCrafted ? "bg-surface text-muted/30 cursor-not-allowed border border-border"
                  : canMatos && !busyM ? "bg-accent text-navy hover:bg-accent/90 border border-accent font-bold animate-glow"
                  :                     "bg-surface text-muted/40 cursor-not-allowed border border-border"}
              `}
            >
              {matosCrafted  ? "Already Crafted"
               : successM    ? "★ Crafted"
               : busyM       ? "Crafting…"
               : canMatos    ? "CRAFT"
               : !hasBitConnect2 ? "BitConnect ×2"
               :               "Need Arcaro"}
            </button>
          </div>

          {/* Stage 2b: Kumbhani */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="font-mono text-[9px] tracking-widest text-muted uppercase bg-surface border border-border px-2 py-1">Stage 2b</div>
              <div className="font-mono text-[10px] text-text">BCC Token</div>
              <div className="flex gap-1 ml-auto">
                {[hasBCC, hasBCC2, hasArc].map((o, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rotate-45 ${o ? "bg-accent" : "bg-border"}`} />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 mb-4">
              <SlotCard name="BCC Token" label="×1" owned={hasBCC} />
              <SlotCard name="BCC Token" label="×2" owned={hasBCC2} />
              <SlotCard name="Arcaro"    owned={hasArc} />
            </div>

            <div className="h-px bg-border mb-4" />

            <LegendaryCard legendary={kumbhani} crafted={kumbhaniCrafted} canCraft={canKumbhani} onClick={() => setModal(109)} />

            <button
              onClick={handleKumbhani}
              disabled={!canKumbhani || busyK}
              className={`
                mt-auto w-full py-2.5 clip-cut-sm font-mono text-[10px] tracking-widest uppercase transition-all duration-200
                ${kumbhaniCrafted ? "bg-surface text-muted/30 cursor-not-allowed border border-border"
                  : canKumbhani && !busyK ? "bg-accent text-navy hover:bg-accent/90 border border-accent font-bold animate-glow"
                  :                        "bg-surface text-muted/40 cursor-not-allowed border border-border"}
              `}
            >
              {kumbhaniCrafted ? "Already Crafted"
               : successK      ? "★ Crafted"
               : busyK         ? "Crafting…"
               : canKumbhani   ? "CRAFT"
               : !hasBCC2      ? "BCC Token ×2"
               :                 "Need Arcaro"}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
