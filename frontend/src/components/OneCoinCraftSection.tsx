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
  rujaCrafted: boolean;
}

const WITNESS_IDS = [205, 206, 207, 208] as const;

function SlotCard({ name, owned }: { name: string; owned: boolean }) {
  return (
    <div className={`p-2 text-center transition-all ${
      owned ? "" : "opacity-40"
    }`}>
      <div className={`font-mono text-base mb-0.5 ${owned ? "text-accent" : "text-border"}`}>◈</div>
      <div className="font-sans text-[9px] text-text leading-tight">{name}</div>
      {owned && <div className="font-mono text-[8px] text-accent mt-0.5">✓</div>}
    </div>
  );
}

export function OneCoinCraftSection({ balances, rujaCrafted }: Props) {
  const { address } = useAccount();

  const [witnessHash, setWitnessHash] = useState<`0x${string}` | undefined>();
  const [rujaHash,    setRujaHash]    = useState<`0x${string}` | undefined>();
  const [modalOpen,   setModalOpen]   = useState(false);
  const [intModal,    setIntModal]    = useState<Intermediate | null>(null);

  const ruja        = LEGENDARIES.find((l) => l.id === 105)!;
  const witnesses   = WITNESS_IDS.map((id) => INTERMEDIATES.find((i) => i.id === id)!);
  const ocTombstones = TOMBSTONES.filter((t) => [13, 14, 15].includes(t.id));

  const hasOneCoin    = (balances[13] ?? 0) > 0;
  const hasOneExchange = (balances[14] ?? 0) > 0;
  const hasOneLife    = (balances[15] ?? 0) > 0;
  const hasTombstones = hasOneCoin && hasOneExchange && hasOneLife;
  const ownedCount    = [hasOneCoin, hasOneExchange, hasOneLife].filter(Boolean).length;

  const { writeContract: writeWitness, isPending: pendingW } = useWriteContract();
  const { writeContract: writeRuja,    isPending: pendingR } = useWriteContract();

  const { isLoading: confirmingW, isSuccess: successW } = useWaitForTransactionReceipt({ hash: witnessHash });
  const { isLoading: confirmingR, isSuccess: successR } = useWaitForTransactionReceipt({ hash: rujaHash });

  const busyW = pendingW || confirmingW;
  const busyR = pendingR || confirmingR;

  const { data: witnessData, refetch: refetchWitnesses } = useReadContracts({
    contracts: [
      ...WITNESS_IDS.map((id) => ({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "balanceOf" as const,
        args: [address ?? "0x0000000000000000000000000000000000000000", BigInt(id)] as const,
      })),
      {
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "balanceOf" as const,
        args: [address ?? "0x0000000000000000000000000000000000000000", BigInt(105)] as const,
      },
    ],
    query: { enabled: !!address, refetchInterval: busyW ? 3_000 : 20_000 },
  });

  const witnessBalances = WITNESS_IDS.map((id, i) =>
    Number(witnessData?.[i]?.result ?? balances[id] ?? 0)
  );
  const hasRujaNFT = Number(witnessData?.[4]?.result ?? 0) > 0 || successR;
  const hasWitnessReal = witnessBalances.map((b) => b > 0);
  // Stay revealed once Ruja is crafted (permanent achievement)
  const hasWitness   = hasWitnessReal;
  const witnessCount = hasWitnessReal.filter(Boolean).length;
  const allWitnesses = witnessCount === 4;
  const canBurn      = hasTombstones && !allWitnesses;
  const canCraftRuja = allWitnesses && !rujaCrafted;

  useEffect(() => {
    if (!successW) return;
    const t = setTimeout(() => refetchWitnesses(), 3_000);
    return () => clearTimeout(t);
  }, [successW]);

  function handleBurn() {
    writeWitness(
      { address: CONTRACT_ADDRESS, abi: ABI, functionName: "craftOneCoinWitness", args: [], value: CRAFT_PRICE },
      { onSuccess: (h) => setWitnessHash(h) }
    );
  }

  function handleRuja() {
    writeRuja(
      { address: CONTRACT_ADDRESS, abi: ABI, functionName: "craftRuja", args: [], value: CRAFT_PRICE },
      { onSuccess: (h) => setRujaHash(h) }
    );
  }

  return (
    <>
      {modalOpen && <LegendaryModal legendary={ruja} crafted={hasRujaNFT} onClose={() => setModalOpen(false)} />}
      {intModal && <IntermediateModal intermediate={intModal} onClose={() => setIntModal(null)} />}

      <div className="clip-cut border border-border p-5 col-span-1 md:col-span-2 xl:col-span-3">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="font-mono text-[10px] tracking-widest text-accent uppercase">OneCoin</span>
              <span className="font-mono text-[9px] text-muted ml-3 tracking-widest uppercase">4-Witness Craft</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-[9px]">
              {witnesses.map((w, i) => (
                <span key={w.id} className={hasWitness[i] ? "text-accent" : "text-muted"}>
                  {w.name.split(" ")[0]}{i < 3 && <span className="text-border mx-1">·</span>}
                </span>
              ))}
              <span className="text-border mx-1">→</span>
              <span className={rujaCrafted ? "text-accent" : "text-muted"}>Ruja</span>
            </div>
          </div>
          <div className="border border-border/50 bg-surface/50 clip-cut-sm px-4 py-3">
            <p className="font-sans text-[12px] text-muted leading-relaxed">
              <span className="text-accent font-semibold">The Cryptoqueen is still at large.</span>{" "}
              Burn three OneCoin tombstones — get one witness. Repeat 4 times to collect them all.
              Only with the testimony of Irina, Karl, Konstantin and Scott can you sentence Ruja.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Col 1: Burn stage ── */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="font-mono text-[9px] tracking-widest text-muted uppercase bg-surface border border-border px-2 py-1">Burn ×{witnessCount}/4</div>
              <div className="font-mono text-[10px] text-text">Get a witness</div>
              <div className="flex gap-1 ml-auto">
                {[hasOneCoin, hasOneExchange, hasOneLife].map((o, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rotate-45 ${o ? "bg-accent" : "bg-border"}`} />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 mb-4">
              {ocTombstones.map((t) => (
                <SlotCard key={t.id} name={t.name} owned={(balances[t.id] ?? 0) > 0} />
              ))}
            </div>

            <div className="h-px bg-border mb-4" />

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between font-mono text-[9px] text-muted mb-1.5">
                <span>Witnesses obtained</span>
                <span className={allWitnesses ? "text-accent" : "text-text"}>{witnessCount} / 4</span>
              </div>
              <div className="h-1 bg-surface border border-border">
                <div
                  className="h-full bg-accent transition-all duration-500"
                  style={{ width: `${(witnessCount / 4) * 100}%` }}
                />
              </div>
            </div>

            <button
              onClick={handleBurn}
              disabled={!canBurn || busyW}
              className={`
                mt-auto w-full py-2.5 clip-cut-sm font-mono text-[10px] tracking-widest uppercase transition-all duration-200
                ${canBurn && !busyW
                  ? "bg-accent text-navy hover:bg-accent/90 border border-accent font-bold animate-glow"
                  : "bg-surface text-muted/40 cursor-not-allowed border border-border"}
              `}
            >
              {allWitnesses      ? "✓ All witnesses"
               : busyW          ? "Crafting…"
               : successW       ? `✓ ${witnessCount}/4`
               : !hasTombstones ? `${ownedCount} / 3`
               :                  "CRAFT"}
            </button>
          </div>

          {/* ── Col 2: Witnesses 2×2 ── */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="font-mono text-[9px] tracking-widest text-muted uppercase bg-surface border border-border px-2 py-1">Witnesses</div>
              <div className="flex gap-1 ml-auto">
                {hasWitness.map((o, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rotate-45 ${o ? "bg-accent" : "bg-border"}`} />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 content-start flex-1">
              {witnesses.map((w, i) => (
                <button
                  key={w.id}
                  onClick={hasWitnessReal[i] ? () => setIntModal(w) : undefined}
                  className={`clip-cut border flex flex-col items-center gap-1.5 p-3 transition-all text-left ${hasWitness[i] ? "group cursor-pointer border-accent/50" : "cursor-default border-border"}`}
                >
                  <div className="w-full aspect-square overflow-hidden clip-cut-sm bg-panel relative">
                    <img
                      src={hasWitness[i] ? `/nft/${w.id}.jpg` : `/nft/${w.id}_closed.jpg`}
                      alt={w.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => { (e.target as HTMLImageElement).src = `/nft/${w.id}.jpg`; }}
                    />
                    {hasWitness[i] && (
                      <div className="absolute bottom-1 right-1 font-mono text-[7px] text-muted/50 opacity-0 group-hover:opacity-100 transition-opacity">
                        details →
                      </div>
                    )}
                  </div>
                  <div className={`font-mono text-[8px] tracking-widest uppercase px-1.5 py-0.5 border w-full text-center ${
                    hasWitness[i]
                      ? "text-accent border-accent/30 bg-accent/10"
                      : "text-muted border-border"
                  }`}>
                    {hasWitness[i] ? "Obtained ✓" : "Waiting"}
                  </div>
                  <div className="font-sans text-[10px] text-text font-semibold text-center leading-tight">{w.name}</div>
                  <div className="font-mono text-[8px] text-muted text-center leading-tight">{w.role.split(",")[0]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* ── Col 3: Ruja ── */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="font-mono text-[9px] tracking-widest text-muted uppercase bg-surface border border-border px-2 py-1">Stage Final</div>
              <div className="font-mono text-[10px] text-text">Sentence Ruja</div>
              <div className="flex gap-1 ml-auto">
                {hasWitness.map((o, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rotate-45 ${o ? "bg-accent" : "bg-border"}`} />
                ))}
              </div>
            </div>

            <button
              onClick={hasRujaNFT ? () => setModalOpen(true) : undefined}
              className={`w-full clip-cut border p-3 mb-3 transition-all text-left ${hasRujaNFT ? "group cursor-pointer" : "cursor-default"} ${
                rujaCrafted && !hasRujaNFT ? "border-border"
                : hasRujaNFT  ? "border-accent/50"
                : canCraftRuja ? "border-accent/40"
                :                "border-border"
              }`}
            >
              <div className="w-full aspect-square overflow-hidden clip-cut-sm bg-navy mb-2 relative">
                <img
                  src={hasRujaNFT ? "/nft/105.jpg" : "/nft/105_closed.jpg"}
                  alt="Ruja Ignatova"
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/nft/105.jpg"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
                <div className="absolute bottom-1.5 right-1.5 font-mono text-[7px] text-muted/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  подробнее →
                </div>
              </div>
              <div className={`font-mono text-lg text-center mb-1 ${canCraftRuja && !rujaCrafted ? "text-accent" : "text-border"}`}>★</div>
              <div className="font-sans font-semibold text-xs text-text text-center mb-0.5">{ruja.name}</div>
              <div className="font-sans italic text-[10px] text-muted text-center leading-snug">"{ruja.quote}"</div>
              <div className="flex justify-center gap-3 mt-2">
                <span className="font-mono text-[9px] text-red-400">{ruja.total_damage}</span>
                <span className="text-border">·</span>
                <span className="font-mono text-[9px] text-red-400">{ruja.status}</span>
              </div>
            </button>

            <button
              onClick={handleRuja}
              disabled={!canCraftRuja || busyR}
              className={`
                mt-auto w-full py-2.5 clip-cut-sm font-mono text-[10px] tracking-widest uppercase transition-all duration-200
                ${rujaCrafted ? "bg-surface text-muted/30 cursor-not-allowed border border-border"
                  : canCraftRuja && !busyR ? "bg-accent text-navy hover:bg-accent/90 border border-accent font-bold animate-glow"
                  :                         "bg-surface text-muted/40 cursor-not-allowed border border-border"}
              `}
            >
              {rujaCrafted   ? "Already Crafted"
               : successR    ? "★ Crafted"
               : busyR       ? "Crafting…"
               : canCraftRuja ? "CRAFT"
               :                `${witnessCount} / 4`}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
