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
}

function WitnessCard({ id, name, role, state, onClick }: {
  id: number; name: string; role: string;
  state: "obtained" | "next" | "locked";
  onClick?: () => void;
}) {
  return (
    <button onClick={onClick} className={`clip-cut border flex flex-col items-center gap-2 p-4 transition-all text-left w-full ${state === "obtained" ? "group cursor-pointer border-accent/50" : state === "next" ? "cursor-default border-accent/20" : "cursor-default border-border"}`}>
      <div className="w-full aspect-square overflow-hidden clip-cut-sm bg-panel mb-1 relative">
        <img
          src={state === "obtained" ? `/nft/${id}.jpg` : `/nft/${id}_closed.jpg`}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { (e.target as HTMLImageElement).src = `/nft/${id}.jpg`; }}
        />
        {onClick && (
          <div className="absolute bottom-1.5 right-1.5 font-mono text-[7px] text-muted/50 opacity-0 group-hover:opacity-100 transition-opacity">
            details →
          </div>
        )}
      </div>
      <div className={`font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 border ${
        state === "obtained" ? "text-accent border-accent/30 bg-accent/10"
        : state === "next"   ? "text-text border-border"
        :                      "text-muted border-border"
      }`}>
        {state === "obtained" ? "Interrogated ✓" : state === "next" ? "Next" : "Waiting"}
      </div>
      <div className="font-sans text-[11px] text-text font-semibold text-center leading-tight">{name}</div>
      <div className="font-mono text-[9px] text-muted text-center">{role}</div>
    </button>
  );
}

function SlotCard({ name, label, owned }: { name: string; label?: string; owned: boolean }) {
  return (
    <div className={`p-3 text-center transition-all ${
      owned ? "" : "opacity-40"
    }`}>
      <div className={`font-mono text-lg mb-1 ${owned ? "text-accent" : "text-border"}`}>◈</div>
      <div className="font-sans text-[10px] text-text leading-tight">{name}</div>
      {label && <div className="font-mono text-[9px] text-muted mt-0.5">{label}</div>}
      {owned && <div className="font-mono text-[9px] text-accent mt-1">✓</div>}
    </div>
  );
}

export function FTXCraftSection({ balances }: Props) {
  const { address } = useAccount();

  const [witnessHash, setWitnessHash]       = useState<`0x${string}` | undefined>();
  const [sbfHash, setSbfHash]               = useState<`0x${string}` | undefined>();
  const [modalOpen, setModalOpen]           = useState(false);
  const [intModal, setIntModal]             = useState<Intermediate | null>(null);

  const caroline      = INTERMEDIATES.find((i) => i.id === 201)!;
  const gary          = INTERMEDIATES.find((i) => i.id === 202)!;
  const sbf           = LEGENDARIES.find((l) => l.id === 101)!;
  const ftxTombstones = TOMBSTONES.filter((t) => t.group === "FTX");

  const hasFTX     = (balances[1] ?? 0) > 0;
  const hasAlameda = (balances[2] ?? 0) > 0;
  const hasBlockFi = (balances[3] ?? 0) > 0;
  const ownedFTX   = [hasFTX, hasAlameda, hasBlockFi];
  const hasTombstones = hasFTX && hasAlameda && hasBlockFi;
  const ownedCount = ownedFTX.filter(Boolean).length;

  const { writeContract: writeWitness, isPending: pendingW } = useWriteContract();
  const { writeContract: writeSBF,     isPending: pendingS } = useWriteContract();
  const { isLoading: confirmingW, isSuccess: successW } = useWaitForTransactionReceipt({ hash: witnessHash });
  const { isLoading: confirmingS, isSuccess: successS } = useWaitForTransactionReceipt({ hash: sbfHash });

  const busyW = pendingW || confirmingW;
  const busyS = pendingS || confirmingS;

  const { data: witnessData, refetch: refetchWitnesses } = useReadContracts({
    contracts: [
      {
        address: CONTRACT_ADDRESS, abi: ABI, functionName: "balanceOf" as const,
        args: [address ?? "0x0000000000000000000000000000000000000000", BigInt(201)] as const,
      },
      {
        address: CONTRACT_ADDRESS, abi: ABI, functionName: "balanceOf" as const,
        args: [address ?? "0x0000000000000000000000000000000000000000", BigInt(202)] as const,
      },
      {
        address: CONTRACT_ADDRESS, abi: ABI, functionName: "balanceOf" as const,
        args: [address ?? "0x0000000000000000000000000000000000000000", BigInt(101)] as const,
      },
    ],
    query: { enabled: !!address, refetchInterval: busyW ? 3_000 : 20_000 },
  });

  const hasCaroline = Number(witnessData?.[0]?.result ?? balances[201] ?? 0) > 0;
  const hasGary     = Number(witnessData?.[1]?.result ?? balances[202] ?? 0) > 0;
  const hasSBFNFT   = Number(witnessData?.[2]?.result ?? 0) > 0;
  const witnessDone = hasCaroline && hasGary;
  // SBF is revealed once both witnesses are obtained (they're never burned)
  const canSBF = witnessDone && hasTombstones;

  // 1 = need Caroline, 2 = need Gary, 3 = done
  const witnessStage = !hasCaroline ? 1 : !hasGary ? 2 : 3;
  const canWitnessCraft = hasTombstones && witnessStage < 3;
  // Stage 2 button needs Caroline as proof
  const canGetGary = hasCaroline && !hasGary && hasTombstones;

  useEffect(() => {
    if (!successW) return;
    const t = setTimeout(() => refetchWitnesses(), 3_000);
    return () => clearTimeout(t);
  }, [successW]);

  function handleWitnessCraft() {
    writeWitness(
      {
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "craftFTXStage1",
        args: [[BigInt(1), BigInt(2), BigInt(3)]],
        value: CRAFT_PRICE,
      },
      { onSuccess: (hash) => setWitnessHash(hash) }
    );
  }

  function handleSBF() {
    writeSBF(
      {
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "craftSBF",
        args: [],
        value: CRAFT_PRICE,
      },
      { onSuccess: (hash) => setSbfHash(hash) }
    );
  }

  return (
    <>
    {modalOpen && <LegendaryModal legendary={sbf} crafted={hasSBFNFT} onClose={() => setModalOpen(false)} />}
    {intModal && <IntermediateModal intermediate={intModal} onClose={() => setIntModal(null)} />}
    <div className="clip-cut border border-border p-5 col-span-1 md:col-span-2 xl:col-span-3">

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="font-mono text-[10px] tracking-widest text-accent uppercase">FTX</span>
            <span className="font-mono text-[9px] text-muted ml-3 tracking-widest uppercase">3-Stage Craft</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[9px]">
            <span className={hasCaroline ? "text-accent" : "text-muted"}>Caroline</span>
            <span className="text-border mx-1">→</span>
            <span className={hasGary ? "text-accent" : "text-muted"}>Gary</span>
            <span className="text-border mx-1">→</span>
            <span className="text-accent">SBF</span>
          </div>
        </div>
        <div className="border border-border/50 bg-surface/50 clip-cut-sm px-4 py-3">
          <p className="font-sans text-[12px] text-muted leading-relaxed">
            <span className="text-accent font-semibold">Interrogate two witnesses</span> — first Caroline, then Gary.
            Each time burn three FTX tombstones — a witness drops guaranteed, in order.
            Once both are interrogated — sentence Bankman-Fried.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Stage 1: Caroline ── */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="font-mono text-[9px] tracking-widest text-muted uppercase bg-surface border border-border px-2 py-1">Stage 1</div>
            <div className="font-mono text-[10px] text-text">Caroline Ellison</div>
            <div className="flex gap-1 ml-auto">
              {ownedFTX.map((o, i) => (
                <div key={i} className={`w-1.5 h-1.5 rotate-45 ${o ? "bg-accent" : "bg-border"}`} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 mb-4">
            {ftxTombstones.map((t, i) => (
              <SlotCard key={t.id} name={t.name} owned={ownedFTX[i]} />
            ))}
          </div>

          <div className="h-px bg-border mb-4" />

          <WitnessCard
            id={201} name={caroline.name} role={caroline.role}
            state={hasCaroline ? "obtained" : "next"}
            onClick={hasCaroline ? () => setIntModal(caroline) : undefined}
          />

          <button
            onClick={handleWitnessCraft}
            disabled={hasCaroline || !hasTombstones || busyW}
            className={`
              mt-auto w-full py-2.5 clip-cut-sm font-mono text-[10px] tracking-widest uppercase transition-all duration-200
              ${!hasCaroline && hasTombstones && !busyW
                ? "bg-accent text-navy hover:bg-accent/90 border border-accent font-bold animate-glow"
                : "bg-surface text-muted/40 cursor-not-allowed border border-border"}
            `}
          >
            {hasCaroline     ? "✓ Caroline done"
             : busyW         ? "Crafting…"
             : !hasTombstones ? `${ownedCount} / 3`
             :                  "CRAFT"}
          </button>
        </div>

        {/* ── Stage 2: Gary ── */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="font-mono text-[9px] tracking-widest text-muted uppercase bg-surface border border-border px-2 py-1">Stage 2</div>
            <div className="font-mono text-[10px] text-text">Gary Wang</div>
            <div className="flex gap-1 ml-auto">
              {ownedFTX.map((o, i) => (
                <div key={i} className={`w-1.5 h-1.5 rotate-45 ${o ? "bg-accent" : "bg-border"}`} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 mb-4">
            {ftxTombstones.map((t, i) => (
              <SlotCard key={t.id} name={t.name} owned={ownedFTX[i]} />
            ))}
          </div>

          <div className="h-px bg-border mb-4" />

          <WitnessCard
            id={202} name={gary.name} role={gary.role}
            state={hasGary ? "obtained" : hasCaroline ? "next" : "locked"}
            onClick={hasGary ? () => setIntModal(gary) : undefined}
          />

          <button
            onClick={handleWitnessCraft}
            disabled={!hasCaroline || hasGary || !hasTombstones || busyW}
            className={`
              mt-auto w-full py-2.5 clip-cut-sm font-mono text-[10px] tracking-widest uppercase transition-all duration-200
              ${hasCaroline && !hasGary && hasTombstones && !busyW
                ? "bg-accent text-navy hover:bg-accent/90 border border-accent font-bold animate-glow"
                : "bg-surface text-muted/40 cursor-not-allowed border border-border"}
            `}
          >
            {hasGary         ? "✓ Gary done"
             : busyW         ? "Crafting…"
             : !hasCaroline  ? "Need Caroline"
             : !hasTombstones ? `${ownedCount} / 3`
             :                  "CRAFT"}
          </button>
        </div>

        {/* ── Stage 3: SBF ── */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="font-mono text-[9px] tracking-widest text-muted uppercase bg-surface border border-border px-2 py-1">Stage 3</div>
            <div className="font-mono text-[10px] text-text">Sentence Bankman-Fried</div>
            <div className="flex gap-1 ml-auto">
              {[hasCaroline, hasGary, ...ownedFTX].map((o, i) => (
                <div key={i} className={`w-1.5 h-1.5 rotate-45 ${o ? "bg-accent" : "bg-border"}`} />
              ))}
            </div>
          </div>

          {/* Proof: witnesses must be owned (not burned) */}
          <div className="grid grid-cols-2 gap-1.5 mb-2">
            <SlotCard name={caroline.name} label="proof" owned={hasCaroline} />
            <SlotCard name={gary.name}     label="proof" owned={hasGary}     />
          </div>
          {/* Fuel: 3 tombstones to burn */}
          <div className="grid grid-cols-3 gap-1.5 mb-4">
            {ftxTombstones.map((t, i) => (
              <SlotCard key={t.id} name={t.name} owned={ownedFTX[i]} />
            ))}
          </div>

          <div className="h-px bg-border mb-4" />

          <button
            onClick={hasSBFNFT ? () => setModalOpen(true) : undefined}
            className={`w-full clip-cut border p-3 mb-3 transition-all text-left ${hasSBFNFT ? "group cursor-pointer" : "cursor-default"} ${
              witnessDone ? "border-accent/40" : "border-border"
            }`}
          >
            <div className="w-full aspect-square overflow-hidden clip-cut-sm bg-navy mb-2 relative">
              <img
                src={witnessDone ? "/nft/101.jpg" : "/nft/101_closed.jpg"}
                alt="Sam Bankman-Fried"
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
              <div className="absolute bottom-1.5 right-1.5 font-mono text-[7px] text-muted/50 opacity-0 group-hover:opacity-100 transition-opacity">
                details →
              </div>
            </div>
            <div className={`font-mono text-lg text-center mb-1 ${witnessDone ? "text-accent" : "text-border"}`}>★</div>
            <div className="font-sans font-semibold text-xs text-text text-center mb-0.5">{sbf.name}</div>
            <div className="font-sans italic text-[10px] text-muted text-center leading-snug">"{sbf.quote}"</div>
            <div className="flex justify-center gap-3 mt-2">
              <span className="font-mono text-[9px] text-red-400">{sbf.total_damage}</span>
              <span className="text-border">·</span>
              <span className="font-mono text-[9px] text-muted">{sbf.status}</span>
            </div>
          </button>

          <button
            onClick={handleSBF}
            disabled={!canSBF || busyS}
            className={`
              mt-auto w-full py-2.5 clip-cut-sm font-mono text-[10px] tracking-widest uppercase transition-all duration-200
              ${canSBF && !busyS
                ? "bg-accent text-navy hover:bg-accent/90 border border-accent font-bold animate-glow"
                : "bg-surface text-muted/40 cursor-not-allowed border border-border"}
            `}
          >
            {successS        ? "★ Crafted"
             : busyS         ? "Crafting…"
             : canSBF        ? "CRAFT"
             : !hasCaroline  ? "Need Caroline first"
             : !hasGary      ? "Need Gary first"
             : `${ownedCount} / 3 tombstones`}
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
