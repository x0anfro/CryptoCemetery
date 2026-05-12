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
  karpelesCrafted: boolean;
  vinnikCrafted: boolean;
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

function LegendaryCard({
  legendary, crafted, userOwns, canCraft, onClick,
}: {
  legendary: ReturnType<typeof LEGENDARIES.find> & object;
  crafted: boolean; userOwns: boolean; canCraft: boolean; onClick: () => void;
}) {
  if (!legendary) return null;
  return (
    <button
      onClick={userOwns ? onClick : undefined}
      className={`w-full clip-cut border p-3 mb-3 transition-all text-left ${userOwns ? "group cursor-pointer" : "cursor-default"} ${
        crafted && !userOwns ? "border-border"
        : userOwns           ? "border-accent/50"
        : canCraft           ? "border-accent/40"
        :                      "border-border"
      }`}
    >
      <div className="w-full aspect-square overflow-hidden clip-cut-sm bg-navy mb-2 relative">
        <img
          src={userOwns ? `/nft/${legendary.id}.jpg` : `/nft/${legendary.id}_closed.jpg`}
          alt={legendary.name}
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { (e.target as HTMLImageElement).src = `/nft/${legendary.id}.jpg`; }}
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

export function MtGoxCraftSection({ balances, karpelesCrafted, vinnikCrafted }: Props) {
  const { address } = useAccount();

  const [bilyHash,  setBilyHash]  = useState<`0x${string}` | undefined>();
  const [karpHash,  setKarpHash]  = useState<`0x${string}` | undefined>();
  const [vinnHash,  setVinnHash]  = useState<`0x${string}` | undefined>();
  const [modal, setModal]         = useState<103 | 108 | null>(null);
  const [intModal, setIntModal]   = useState<Intermediate | null>(null);

  const bilyuchenko = INTERMEDIATES.find((i) => i.id === 203)!;
  const karpeles    = LEGENDARIES.find((l) => l.id === 103)!;
  const vinnik      = LEGENDARIES.find((l) => l.id === 108)!;

  const ftTombstones = TOMBSTONES.filter((t) => [7, 8, 9].includes(t.id));
  const hasMtGox      = (balances[7] ?? 0) > 0;
  const hasBitcoinica = (balances[8] ?? 0) > 0;
  const hasBtcE       = (balances[9] ?? 0) > 0;
  const ownedSlots    = [hasMtGox, hasBitcoinica, hasBtcE];
  const hasTombstones = hasMtGox && hasBitcoinica && hasBtcE;
  const ownedCount    = ownedSlots.filter(Boolean).length;

  const { writeContract: writeBily, isPending: pendingB } = useWriteContract();
  const { writeContract: writeKarp, isPending: pendingK } = useWriteContract();
  const { writeContract: writeVinn, isPending: pendingV } = useWriteContract();

  const { isLoading: confirmB, isSuccess: successB } = useWaitForTransactionReceipt({ hash: bilyHash });
  const { isLoading: confirmK, isSuccess: successK } = useWaitForTransactionReceipt({ hash: karpHash });
  const { isLoading: confirmV, isSuccess: successV } = useWaitForTransactionReceipt({ hash: vinnHash });

  const busyB = pendingB || confirmB;
  const busyK = pendingK || confirmK;
  const busyV = pendingV || confirmV;

  const { data: bilyData, refetch: refetchBily } = useReadContracts({
    contracts: [
      {
        address: CONTRACT_ADDRESS, abi: ABI, functionName: "balanceOf" as const,
        args: [address ?? "0x0000000000000000000000000000000000000000", BigInt(203)] as const,
      },
      {
        address: CONTRACT_ADDRESS, abi: ABI, functionName: "balanceOf" as const,
        args: [address ?? "0x0000000000000000000000000000000000000000", BigInt(103)] as const,
      },
      {
        address: CONTRACT_ADDRESS, abi: ABI, functionName: "balanceOf" as const,
        args: [address ?? "0x0000000000000000000000000000000000000000", BigInt(108)] as const,
      },
    ],
    query: { enabled: !!address, refetchInterval: busyB ? 3_000 : 20_000 },
  });

  const bilyBalance     = Number(bilyData?.[0]?.result ?? balances[203] ?? 0);
  const karpBalance     = Number(bilyData?.[1]?.result ?? 0);
  const hasVinnikNFT    = Number(bilyData?.[2]?.result ?? 0) > 0;
  const hasBily1    = bilyBalance >= 1;
  const bilyRevealed = bilyBalance > 0;

  const hasMtGox2     = (balances[7] ?? 0) >= 2;
  const hasBtcE2      = (balances[9] ?? 0) >= 2;

  // Karpeles: proof = Bilyuchenko owned, fuel = MtGox×2 + Bitcoinica
  const canGetBily  = hasTombstones;
  const canKarpeles = hasBily1 && hasMtGox2 && hasBitcoinica && !karpelesCrafted;
  // Vinnik: proof = Karpeles owned (not burned), fuel = BTC-e×2 + Bitcoinica
  const hasKarpeles = karpBalance >= 1;
  const canVinnik   = hasKarpeles && hasBtcE2 && hasBitcoinica && !vinnikCrafted;

  useEffect(() => {
    if (!successB) return;
    const t = setTimeout(() => refetchBily(), 3_000);
    return () => clearTimeout(t);
  }, [successB]);

  function handleBily() {
    writeBily({
      address: CONTRACT_ADDRESS, abi: ABI,
      functionName: "craftBilyuchenko",
      args: [[BigInt(7), BigInt(8), BigInt(9)]],
      value: CRAFT_PRICE,
    }, { onSuccess: (h) => setBilyHash(h) });
  }

  function handleKarpeles() {
    writeKarp({
      address: CONTRACT_ADDRESS, abi: ABI,
      functionName: "craftKarpeles",
      args: [],
      value: CRAFT_PRICE,
    }, { onSuccess: (h) => setKarpHash(h) });
  }

  function handleVinnik() {
    writeVinn({
      address: CONTRACT_ADDRESS, abi: ABI,
      functionName: "craftVinnik",
      args: [],
      value: CRAFT_PRICE,
    }, { onSuccess: (h) => setVinnHash(h) });
  }

  const modalLegendary = modal === 103 ? karpeles : modal === 108 ? vinnik : null;

  return (
    <>
      {modalLegendary && (
        <LegendaryModal
          legendary={modalLegendary}
          crafted={modal === 103 ? karpBalance >= 1 : hasVinnikNFT}
          onClose={() => setModal(null)}
        />
      )}
      {intModal && <IntermediateModal intermediate={intModal} onClose={() => setIntModal(null)} />}

      <div className="clip-cut border border-border p-5 col-span-1 md:col-span-2 xl:col-span-3">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="font-mono text-[10px] tracking-widest text-accent uppercase">Mt. Gox / BTC-e</span>
              <span className="font-mono text-[9px] text-muted ml-3 tracking-widest uppercase">Crossover Craft</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-[9px]">
              <span className={bilyBalance > 0 ? "text-accent" : "text-muted"}>Bilyuchenko ×{bilyBalance}</span>
              <span className="text-border mx-1">→</span>
              <span className={karpelesCrafted ? "text-accent" : "text-muted"}>Karpeles</span>
              <span className="text-border mx-1">+</span>
              <span className={vinnikCrafted ? "text-accent" : "text-muted"}>Vinnik</span>
            </div>
          </div>
          <div className="border border-border/50 bg-surface/50 clip-cut-sm px-4 py-3">
            <p className="font-sans text-[12px] text-muted leading-relaxed">
              <span className="text-accent font-semibold">Alexei Bilyuchenko</span> — the link between Mt. Gox and BTC-e.
              First hacked the exchange, then helped Vinnik launder the stolen funds.
              Burn three tombstones to get Bilyuchenko, then use him for both cases: 1× for Karpeles, 2× for Vinnik.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Stage 1: Get Bilyuchenko ── */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="font-mono text-[9px] tracking-widest text-muted uppercase bg-surface border border-border px-2 py-1">Stage 1</div>
              <div className="font-mono text-[10px] text-text">Expose the link</div>
              <div className="flex gap-1 ml-auto">
                {ownedSlots.map((o, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rotate-45 ${o ? "bg-accent" : "bg-border"}`} />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 mb-4">
              {ftTombstones.map((t, i) => (
                <SlotCard key={t.id} name={t.name} owned={ownedSlots[i]} />
              ))}
            </div>

            <div className="h-px bg-border mb-4" />

            {/* Bilyuchenko card */}
            <button
              onClick={bilyRevealed ? () => setIntModal(bilyuchenko) : undefined}
              className={`w-full clip-cut border p-3 mb-3 transition-all text-left ${bilyRevealed ? "group cursor-pointer" : "cursor-default"} ${
                bilyRevealed ? "border-accent/50" : "border-border"
              }`}
            >
              <div className="w-full aspect-square overflow-hidden clip-cut-sm bg-navy mb-2 relative">
                <img
                  src={bilyRevealed ? "/nft/203.jpg" : "/nft/203_closed.jpg"}
                  alt="Alexei Bilyuchenko"
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/nft/203.jpg"; }}
                />
                <div className="absolute bottom-1.5 right-1.5 font-mono text-[7px] text-muted/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  details →
                </div>
              </div>
              <div className="font-mono text-[9px] tracking-widest uppercase text-center px-2 py-0.5 border mb-1.5 mx-auto w-fit
                              border-accent/30 bg-accent/10 text-accent">
                ◈ Crossover
              </div>
              <div className="font-sans text-xs text-text font-semibold text-center">{bilyuchenko.name}</div>
              <div className="font-mono text-[9px] text-muted text-center">{bilyuchenko.role}</div>
              {bilyRevealed && (
                <div className="font-mono text-[10px] text-accent text-center mt-1.5">{bilyBalance > 0 ? `×${bilyBalance} in wallet` : "Crafted ✓"}</div>
              )}
            </button>

            <button
              onClick={handleBily}
              disabled={!canGetBily || busyB}
              className={`
                mt-auto w-full py-2.5 clip-cut-sm font-mono text-[10px] tracking-widest uppercase transition-all duration-200
                ${canGetBily && !busyB
                  ? "bg-accent text-navy hover:bg-accent/90 border border-accent font-bold animate-glow"
                  : "bg-surface text-muted/40 cursor-not-allowed border border-border"}
              `}
            >
              {busyB          ? "Crafting…"
               : !hasTombstones ? `${ownedCount} / 3`
               :                  "CRAFT"}
            </button>
          </div>

          {/* ── Stage 2a: Karpeles ── */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="font-mono text-[9px] tracking-widest text-muted uppercase bg-surface border border-border px-2 py-1">Stage 2a</div>
              <div className="font-mono text-[10px] text-text">Mt. Gox</div>
              <div className="flex gap-1 ml-auto">
                {[hasBily1, hasMtGox, hasMtGox2, hasBitcoinica].map((o, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rotate-45 ${o ? "bg-accent" : "bg-border"}`} />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 mb-2">
              <SlotCard name="Bilyuchenko" label="proof" owned={hasBily1} />
            </div>
            <div className="grid grid-cols-3 gap-1.5 mb-4">
              <SlotCard name="Mt. Gox"    label="×1" owned={hasMtGox} />
              <SlotCard name="Mt. Gox"    label="×2" owned={hasMtGox2} />
              <SlotCard name="Bitcoinica" owned={hasBitcoinica} />
            </div>

            <div className="h-px bg-border mb-4" />

            <LegendaryCard
              legendary={karpeles}
              crafted={karpelesCrafted}
              userOwns={hasKarpeles}
              canCraft={canKarpeles}
              onClick={() => setModal(103)}
            />

            <button
              onClick={handleKarpeles}
              disabled={!canKarpeles || busyK}
              className={`
                mt-auto w-full py-2.5 clip-cut-sm font-mono text-[10px] tracking-widest uppercase transition-all duration-200
                ${karpelesCrafted ? "bg-surface text-muted/30 cursor-not-allowed border border-border"
                  : canKarpeles && !busyK ? "bg-accent text-navy hover:bg-accent/90 border border-accent font-bold animate-glow"
                  :                        "bg-surface text-muted/40 cursor-not-allowed border border-border"}
              `}
            >
              {karpelesCrafted ? "Already Crafted"
               : successK      ? "★ Crafted"
               : busyK         ? "Crafting…"
               : canKarpeles   ? "CRAFT"
               : !hasBily1     ? "Need Bilyuchenko"
               : !hasMtGox2    ? "Mt. Gox ×2"
               :                 "Need Bitcoinica"}
            </button>
          </div>

          {/* ── Stage 2b: Vinnik ── */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="font-mono text-[9px] tracking-widest text-muted uppercase bg-surface border border-border px-2 py-1">Stage 2b</div>
              <div className="font-mono text-[10px] text-text">BTC-e</div>
              <div className="flex gap-1 ml-auto">
                {[hasKarpeles, hasBtcE, hasBtcE2, hasBitcoinica].map((o, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rotate-45 ${o ? "bg-accent" : "bg-border"}`} />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 mb-2">
              <SlotCard name="Karpeles" label="proof" owned={hasKarpeles} />
            </div>
            <div className="grid grid-cols-3 gap-1.5 mb-4">
              <SlotCard name="BTC-e"      label="×1" owned={hasBtcE} />
              <SlotCard name="BTC-e"      label="×2" owned={hasBtcE2} />
              <SlotCard name="Bitcoinica" owned={hasBitcoinica} />
            </div>

            <div className="h-px bg-border mb-4" />

            <LegendaryCard
              legendary={vinnik}
              crafted={vinnikCrafted}
              userOwns={hasVinnikNFT}
              canCraft={canVinnik}
              onClick={() => setModal(108)}
            />

            <button
              onClick={handleVinnik}
              disabled={!canVinnik || busyV}
              className={`
                mt-auto w-full py-2.5 clip-cut-sm font-mono text-[10px] tracking-widest uppercase transition-all duration-200
                ${vinnikCrafted ? "bg-surface text-muted/30 cursor-not-allowed border border-border"
                  : canVinnik && !busyV ? "bg-accent text-navy hover:bg-accent/90 border border-accent font-bold animate-glow"
                  :                      "bg-surface text-muted/40 cursor-not-allowed border border-border"}
              `}
            >
              {vinnikCrafted ? "Already Crafted"
               : successV    ? "★ Crafted"
               : busyV       ? "Crafting…"
               : canVinnik   ? "CRAFT"
               : !hasKarpeles ? "Need Karpeles"
               : !hasBtcE2   ? "BTC-e ×2"
               :               "Need Bitcoinica"}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
