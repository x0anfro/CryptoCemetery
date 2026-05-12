"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useChainId, useSwitchChain } from "wagmi";
import { ABI, CONTRACT_ADDRESS, MINT_PRICE } from "@/lib/contract";
import { PIZZA_DAY_EVENT } from "@/lib/data";

const SHAPE_CHAIN_ID = 360;

function PizzaDayModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 bg-navy/80 backdrop-blur-sm px-3 py-2 font-mono text-[11px] text-muted hover:text-text border border-border transition-colors"
      >
        ESC
      </button>
      <div
        className="modal-enter relative w-full h-full md:h-auto md:max-h-[96vh] md:max-w-6xl flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex-1 md:flex-none md:w-[68%] h-[55vh] md:h-auto bg-black overflow-hidden md:clip-cut">
          <img
            src="/nft/33.jpg"
            alt={PIZZA_DAY_EVENT.name}
            className="w-full h-full object-contain"
          />
          <div className="absolute top-0 left-0 bg-black/70 backdrop-blur-sm px-2.5 py-1.5 font-mono text-[10px] text-muted tracking-widest border-r border-b border-border/40">
            #33
          </div>
        </div>
        <div className="md:w-[32%] flex-shrink-0 bg-panel border-t md:border-t-0 md:border-l border-border/50 overflow-y-auto flex flex-col">
          <div className="p-5 md:p-6 flex flex-col gap-4 flex-1">
            <div className="flex items-start gap-3 pr-10 md:pr-0">
              <h2 className="font-sans font-bold text-lg text-text leading-tight flex-1">
                {PIZZA_DAY_EVENT.name}
              </h2>
              <span className="font-mono text-[8px] px-1.5 py-0.5 border tracking-wider shrink-0 uppercase text-amber-400 border-amber-800/60 bg-amber-950/40">
                Event
              </span>
            </div>
            <div className="font-mono text-[10px] text-amber-400/70">{PIZZA_DAY_EVENT.date}</div>
            <p className="font-mono text-[11px] text-muted italic border-l-2 border-amber-500/30 pl-3 leading-relaxed">
              "{PIZZA_DAY_EVENT.epitaph}"
            </p>
            <p className="text-[13px] text-text/80 leading-relaxed">
              {PIZZA_DAY_EVENT.description}
            </p>
            <div className="mt-auto border-t border-border pt-4">
              <div className="font-mono text-[9px] text-muted/60 uppercase tracking-wider mb-0.5">Token ID</div>
              <div className="font-mono text-sm font-bold text-amber-400">#{PIZZA_DAY_EVENT.id}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PizzaDayMintBlock() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [mounted, setMounted] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const { writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  const isBusy = isPending || isConfirming;
  const connected = mounted && isConnected;
  const isWrongNetwork = connected && chainId !== SHAPE_CHAIN_ID;

  const { data: pizzaBalance, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "balanceOf",
    args: [address ?? "0x0000000000000000000000000000000000000000", BigInt(33)],
    query: { enabled: !!address, refetchInterval: 15_000 },
  });
  const ownedCount = Number(pizzaBalance ?? 0);

  useEffect(() => {
    if (!isSuccess) return;
    const t = setTimeout(() => refetch(), 3_000);
    return () => clearTimeout(t);
  }, [isSuccess]);

  function handleMint() {
    if (isWrongNetwork) { switchChain({ chainId: SHAPE_CHAIN_ID }); return; }
    writeContract(
      { address: CONTRACT_ADDRESS, abi: ABI, functionName: "mintPizzaDay", args: [], value: MINT_PRICE },
      { onSuccess: (h) => setTxHash(h) }
    );
  }

  const progress = Math.min(ownedCount, 5);

  return (
    <div className="mt-14">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-amber-900/40" />
        <span className="font-mono text-[10px] tracking-[0.3em] text-amber-400 uppercase">Bitcoin Pizza Day</span>
        <div className="flex-1 h-px bg-amber-900/40" />
      </div>

      <div className="pl-4 border-l-2 border-amber-900/50 bg-gradient-to-r from-amber-950/10 to-transparent">
        <div className={`
          clip-cut border p-5 transition-all duration-300
          ${ownedCount >= 5 ? "border-amber-500/60" : "border-amber-900/40 hover:border-amber-700/50"}
        `}>
          <div className="flex flex-col md:flex-row gap-6 items-start">

            {/* Portrait */}
            <div
              className="flex-shrink-0 w-28 clip-cut border border-amber-700/40 overflow-hidden bg-panel cursor-zoom-in group"
              onClick={() => setLightbox(true)}
            >
              <div className="w-full aspect-square bg-amber-950/30 flex items-center justify-center">
                <img
                  src="/nft/33.jpg"
                  alt={PIZZA_DAY_EVENT.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    el.style.display = "none";
                    el.parentElement!.innerHTML = '<div class="w-full h-full flex flex-col items-center justify-center gap-2"><span class="text-3xl">₿</span><span class="font-mono text-[8px] text-amber-600">Event NFT</span></div>';
                  }}
                />
              </div>
              <div className="p-2 text-center">
                <div className="font-mono text-[8px] text-amber-400 tracking-wider uppercase">Event</div>
                <div className="font-mono text-[9px] text-amber-300 font-bold">{PIZZA_DAY_EVENT.date}</div>
              </div>
            </div>

            {/* Lightbox */}
            {lightbox && mounted && createPortal(
              <PizzaDayModal onClose={() => setLightbox(false)} />,
              document.body
            )}

            {/* Info */}
            <div className="flex-1 flex flex-col gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-[10px] tracking-widest text-amber-400 uppercase">Bitcoin Pizza Day</span>
                  <span className="font-mono text-[9px] text-amber-700 border border-amber-800/50 px-1.5 py-0.5">Event NFT · #{PIZZA_DAY_EVENT.id}</span>
                </div>
                <p className="font-sans italic text-[12px] text-muted leading-relaxed">
                  "{PIZZA_DAY_EVENT.epitaph}"
                </p>
                <p className="font-sans text-[11px] text-muted/70 leading-relaxed mt-2">
                  {PIZZA_DAY_EVENT.description}
                </p>
              </div>

              <div className="border border-amber-900/30 bg-amber-950/10 clip-cut-sm p-3">
                <p className="font-sans text-[11px] text-amber-300/70 leading-relaxed">
                  <span className="text-amber-400 font-semibold">Collect 5 to craft the legendary.</span>{" "}
                  Combine with 3 epic NFTs on the Craft page to unlock Laszlo Hanyecz — the man who proved Bitcoin works.
                </p>
              </div>

              {/* Progress */}
              <div>
                <div className="flex justify-between font-mono text-[9px] text-muted mb-1.5">
                  <span>Collected</span>
                  <span className={ownedCount >= 5 ? "text-amber-400" : "text-text"}>
                    {connected ? `${ownedCount} / 5` : "— / 5"}
                  </span>
                </div>
                <div className="h-1 bg-surface border border-amber-900/40">
                  <div
                    className="h-full bg-amber-500 transition-all duration-500"
                    style={{ width: connected ? `${(progress / 5) * 100}%` : "0%" }}
                  />
                </div>
                <div className="flex gap-1 mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rotate-45 transition-colors ${i < ownedCount ? "bg-amber-500" : "bg-amber-900/40"}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Mint button */}
            <div className="flex-shrink-0 flex flex-col gap-2 items-end justify-start pt-1">
              <div className="font-mono text-[9px] text-amber-700 text-right">Mintable multiple times</div>
              <button
                onClick={handleMint}
                disabled={!connected || isBusy}
                className={`
                  px-6 py-3 clip-cut-sm font-mono text-[10px] tracking-widest uppercase transition-all duration-200
                  ${isSuccess
                    ? "bg-amber-950/40 text-amber-400 border border-amber-700/60"
                    : isBusy
                    ? "bg-surface text-muted border border-border cursor-wait"
                    : isWrongNetwork
                    ? "bg-orange-950/40 text-orange-400 border border-orange-700 hover:bg-orange-900/40"
                    : connected
                    ? "bg-amber-500/10 text-amber-400 border border-amber-600/50 hover:bg-amber-500/20 hover:border-amber-500"
                    : "bg-surface text-muted/50 border border-border cursor-not-allowed"}
                `}
              >
                {!connected       ? "Connect Wallet"
                  : isBusy        ? "Confirming…"
                  : isSuccess     ? "✓ Minted"
                  : isWrongNetwork ? "Switch to Shape"
                  :                 "Mint · 0.00042 ETH"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
