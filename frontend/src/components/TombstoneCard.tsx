"use client";

import { useState, useRef, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ABI, CONTRACT_ADDRESS, MINT_PRICE } from "@/lib/contract";
import { type Tombstone } from "@/lib/data";
import { ScamModal } from "./ScamModal";

const CAUSE_COLORS: Record<string, string> = {
  Hack:          "text-red-400 border-red-900/60 bg-red-950/40",
  Ponzi:         "text-orange-400 border-orange-900/60 bg-orange-950/40",
  "Rug Pull":    "text-purple-400 border-purple-900/60 bg-purple-950/40",
  Mismanagement: "text-yellow-400 border-yellow-900/60 bg-yellow-950/40",
  Hubris:        "text-accent border-accent/30 bg-accent/5",
};

function NftImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, [src]);

  return (
    <div className="relative w-full h-full bg-panel">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border border-border rotate-45 animate-pulse" />
        </div>
      )}
      <img
        ref={imgRef}
        src={errored ? "/nft/placeholder.png" : src.replace(/\.png$/, ".jpg")}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        loading="eager"
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
      />
    </div>
  );
}

interface Props {
  tombstone: Tombstone;
  owned?: number;
}

export function TombstoneCard({ tombstone, owned = 0 }: Props) {
  const { isConnected } = useAccount();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [modalOpen, setModalOpen] = useState(false);

  const { writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const isBusy = isPending || isConfirming;

  function handleMint() {
    writeContract(
      {
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "mint",
        args: [BigInt(tombstone.id)],
        value: MINT_PRICE,
      },
      { onSuccess: (hash) => setTxHash(hash) }
    );
  }

  const causeClass = CAUSE_COLORS[tombstone.cause_of_death] ?? "text-muted border-border bg-surface";

  return (
    <div
      className={`
        card-lift clip-cut group relative flex flex-col bg-panel border overflow-hidden
        ${owned > 0
          ? "border-accent/40 shadow-[0_0_30px_-5px_rgba(91,155,213,0.2)]"
          : "border-border hover:border-accent/30"
        }
      `}
    >
      {/* Image */}
      <div
        className="relative h-56 group-hover:h-80 transition-[height] duration-500 ease-in-out overflow-hidden cursor-zoom-in"
        onClick={() => setModalOpen(true)}
      >
        <NftImage
          src={`/nft/${tombstone.id}.png`}
          alt={tombstone.name}
        />

        {/* Owned badge */}
        {owned > 0 && (
          <div className="absolute bottom-0 left-0 bg-accent text-navy font-mono text-[9px] tracking-widest px-2.5 py-1 uppercase border-t border-r border-accent">
            Owned
          </div>
        )}


      </div>

      {/* Body */}
      <div className="flex flex-col gap-3 p-4 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-sans font-semibold text-sm text-text leading-tight">{tombstone.name}</h3>
          <span className={`font-mono text-[8px] px-1.5 py-0.5 border tracking-wider shrink-0 uppercase ${causeClass}`}>
            {tombstone.cause_of_death}
          </span>
        </div>

        <p className="text-[12px] text-muted leading-relaxed flex-1 italic">
          "{tombstone.epitaph}"
        </p>

        <div className="border-t border-border pt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
          {[
            ...(tombstone.amount_lost ? [{ k: tombstone.amount_label ?? "Lost", v: tombstone.amount_lost, c: "text-red-400" }] : []),
            { k: "Era",     v: `${tombstone.born}–${tombstone.died}`, c: "text-muted"   },
            { k: "Group",   v: tombstone.group,                       c: "text-accent"  },
            ...(tombstone.villain ? [{ k: "Villain", v: tombstone.villain, c: "text-muted" }] : []),
            ...(tombstone.founder ? [{ k: "Founder", v: tombstone.founder, c: "text-muted" }] : []),
          ].map(({ k, v, c }) => (
            <div key={k}>
              <div className="font-mono text-[9px] text-muted/60 uppercase tracking-wider">{k}</div>
              <div className={`font-mono text-[11px] ${c}`}>{v}</div>
            </div>
          ))}
        </div>

        <button
          onClick={handleMint}
          disabled={!isConnected || isBusy}
          className={`
            mt-1 w-full py-2.5 clip-cut-sm font-mono text-[10px] tracking-widest uppercase transition-all duration-200
            ${isSuccess
              ? "bg-accent/10 text-accent border border-accent/40"
              : isBusy
              ? "bg-surface text-muted border border-border cursor-wait"
              : isConnected
              ? "bg-accent/10 text-accent border border-accent/50 hover:bg-accent/20 hover:border-accent"
              : "bg-surface text-muted/50 border border-border cursor-not-allowed"
            }
          `}
        >
          {!isConnected ? "Connect Wallet"
            : isBusy     ? "Confirming…"
            : isSuccess  ? "✓ Minted"
            :              "Mint · 0.00042 ETH"}
        </button>
      </div>

      {modalOpen && (
        <ScamModal tombstone={tombstone} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}
