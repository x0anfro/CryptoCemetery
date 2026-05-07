import React from "react";

const STROKE = "#f5f1e8";
const BLOOD  = "#8b1e1e";
const DRIP   = { strokeDasharray: "3 10", animation: "blood-drip 1s linear infinite" } as React.CSSProperties;

function DripGrad({ id, y0, y1 }: { id: string; y0: number; y1: number }) {
  return (
    <defs>
      <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1={y0} x2="0" y2={y1}>
        <stop offset="0%"   stopColor={BLOOD} stopOpacity="0.75"/>
        <stop offset="100%" stopColor={BLOOD} stopOpacity="0"/>
      </linearGradient>
    </defs>
  );
}

const CRYPTO_LETTERS = [
  {
    label: "THE COIN",
    el: (
      <svg viewBox="0 0 100 100" fill="none" overflow="visible" className="w-[78%] h-[78%]">
        <DripGrad id="dg-coin" y0={70} y1={280}/>
        <path d="M75 25 A35 35 0 1 0 75 75" stroke={STROKE} strokeWidth="6" strokeLinecap="round"/>
        <path d="M68 35 A22 22 0 1 0 68 65" stroke={STROKE} strokeWidth="3" strokeLinecap="round"/>
        <path d="M30 30 L40 45 L32 55 L42 70" stroke={BLOOD} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <line x1="42" y1="70" x2="40" y2="280" stroke="url(#dg-coin)" strokeWidth="1.5" style={DRIP}/>
      </svg>
    ),
  },
  {
    label: "THE GRAVE",
    el: (
      <svg viewBox="0 0 100 100" fill="none" className="w-[78%] h-[78%]">
        <path d="M28 85 L28 30 Q28 15 45 15 L60 15 Q72 15 72 28 Q72 40 60 42 L45 42 L72 85"
              stroke={STROKE} strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" fill="none"/>
        <text x="50" y="62" fontFamily="monospace" fontSize="9" fontWeight="700"
              fill={STROKE} textAnchor="middle" letterSpacing="1">RIP</text>
        <path d="M15 92 L85 92" stroke={STROKE} strokeWidth="3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "THE FORK",
    el: (
      <svg viewBox="0 0 100 100" fill="none" className="w-[78%] h-[78%]">
        <path d="M50 90 L50 55" stroke={STROKE} strokeWidth="6" strokeLinecap="round"/>
        <path d="M50 55 L25 20" stroke={STROKE} strokeWidth="6" strokeLinecap="round"/>
        <path d="M50 55 L75 20" stroke={STROKE} strokeWidth="6" strokeLinecap="round"/>
        <circle cx="50" cy="55" r="3" fill={STROKE}/>
        <path d="M30 25 L30 35" stroke={STROKE} strokeWidth="1.5"/>
        <circle cx="30" cy="40" r="5" stroke={STROKE} strokeWidth="2" fill="none"/>
        <path d="M70 25 L78 22 M22 18 L28 14" stroke={STROKE} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "THE SHOVEL",
    el: (
      <svg viewBox="0 0 100 100" fill="none" className="w-[78%] h-[78%]">
        <path d="M30 90 L30 15 L55 15 Q72 15 72 32 Q72 50 55 50 L30 50"
              stroke={STROKE} strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" fill="none"/>
        <path d="M18 88 Q30 78 42 88" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <circle cx="55" cy="32" r="3" fill={BLOOD}/>
      </svg>
    ),
  },
  {
    label: "THE CROSS",
    el: (
      <svg viewBox="0 0 100 100" fill="none" className="w-[78%] h-[78%]">
        <rect x="44" y="12" width="12" height="78" fill={STROKE} rx="1"/>
        <rect x="22" y="32" width="56" height="12" fill={STROKE} rx="1"/>
        <path d="M15 90 Q35 80 50 80 Q65 80 85 90" stroke={STROKE} strokeWidth="3" strokeLinecap="round" fill="none"/>
        <path d="M40 78 L38 72 M50 78 L50 70 M60 78 L62 73" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "THE NULL",
    el: (
      <svg viewBox="0 0 100 100" fill="none" overflow="visible" className="w-[78%] h-[78%]">
        <DripGrad id="dg-null" y0={92} y1={300}/>
        <ellipse cx="50" cy="52" rx="32" ry="36" stroke={STROKE} strokeWidth="6" fill="none"/>
        <rect x="44" y="42" width="12" height="20" fill={STROKE}/>
        <path d="M50 36 L50 42 M50 62 L50 68" stroke={STROKE} strokeWidth="2" strokeLinecap="round"/>
        <path d="M50 75 L50 92 M44 86 L50 92 L56 86" stroke={BLOOD} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <line x1="50" y1="92" x2="50" y2="300" stroke="url(#dg-null)" strokeWidth="1.5" style={DRIP}/>
      </svg>
    ),
  },
];

const CEMETERY_LETTERS = [
  {
    label: "THE SKULL",
    el: (
      <svg viewBox="0 0 100 100" fill="none" className="w-[78%] h-[78%]">
        <path d="M75 30 Q60 15 42 18 Q22 22 22 50 Q22 75 42 80 Q60 84 75 72"
              stroke={STROKE} strokeWidth="6" strokeLinecap="round" fill="none"/>
        <circle cx="38" cy="42" r="5" fill={STROKE}/>
        <path d="M32 70 L34 76 M38 72 L40 78 M44 72 L46 78" stroke={STROKE} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "THE DUMP",
    el: (
      <svg viewBox="0 0 100 100" fill="none" overflow="visible" className="w-[78%] h-[78%]">
        <DripGrad id="dg-dump" y0={78} y1={290}/>
        <path d="M22 18 L78 18 M22 18 L22 50 M22 50 L60 50 M22 82 L48 82 M22 50 L22 82"
              stroke={STROKE} strokeWidth="6" strokeLinecap="round"/>
        <path d="M70 65 L82 78 M78 73 L82 78 L77 78" stroke={BLOOD} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <line x1="82" y1="78" x2="80" y2="290" stroke="url(#dg-dump)" strokeWidth="1.5" style={DRIP}/>
      </svg>
    ),
  },
  {
    label: "THE BLEED",
    el: (
      <svg viewBox="0 0 100 100" fill="none" className="w-[78%] h-[78%]">
        <path d="M22 12 L22 88" stroke={STROKE} strokeWidth="2"/>
        <rect x="17" y="20" width="10" height="60" fill={STROKE}/>
        <path d="M50 25 L50 75" stroke={STROKE} strokeWidth="2"/>
        <rect x="45" y="35" width="10" height="30" fill="none" stroke={STROKE} strokeWidth="2"/>
        <path d="M78 12 L78 88" stroke={STROKE} strokeWidth="2"/>
        <rect x="73" y="20" width="10" height="60" fill={STROKE}/>
        <path d="M22 20 L50 35 L78 20" stroke={STROKE} strokeWidth="3" strokeLinejoin="round" fill="none"/>
      </svg>
    ),
  },
  {
    label: "THE CHART",
    el: (
      <svg viewBox="0 0 100 100" fill="none" overflow="visible" className="w-[78%] h-[78%]">
        <DripGrad id="dg-chart1" y0={45} y1={260}/>
        <DripGrad id="dg-chart2" y0={78} y1={290}/>
        <path d="M22 15 L78 15 M22 15 L22 85 M22 50 L60 50 M22 85 L78 85"
              stroke={STROKE} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M30 25 L40 30 L48 28 L55 38 L62 35 L72 45" stroke={BLOOD} strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M30 60 L42 62 L50 70 L60 72 L70 78" stroke={BLOOD} strokeWidth="2" fill="none" strokeLinecap="round"/>
        <line x1="72" y1="45" x2="72" y2="260" stroke="url(#dg-chart1)" strokeWidth="1.5" style={{...DRIP, animationDelay: "0.4s"}}/>
        <line x1="70" y1="78" x2="70" y2="290" stroke="url(#dg-chart2)" strokeWidth="1.5" style={DRIP}/>
      </svg>
    ),
  },
  {
    label: "THE MARKER",
    el: (
      <svg viewBox="0 0 100 100" fill="none" className="w-[78%] h-[78%]">
        <rect x="20" y="14" width="60" height="10" fill={STROKE} rx="1"/>
        <rect x="44" y="14" width="12" height="76" fill={STROKE} rx="1"/>
        <path d="M30 24 L30 38" stroke={STROKE} strokeWidth="1.5"/>
        <circle cx="30" cy="44" r="5" stroke={STROKE} strokeWidth="2" fill="none"/>
        <path d="M70 24 L70 38" stroke={STROKE} strokeWidth="1.5"/>
        <circle cx="70" cy="44" r="5" stroke={STROKE} strokeWidth="2" fill="none"/>
        <path d="M15 92 L85 92" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "THE COFFIN",
    el: (
      <svg viewBox="0 0 100 100" fill="none" className="w-[78%] h-[78%]">
        <path d="M22 15 L78 15 M22 15 L22 85 M22 50 L60 50 M22 85 L78 85"
              stroke={STROKE} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M73 12 L83 18 M73 18 L83 12" stroke={STROKE} strokeWidth="2" strokeLinecap="round"/>
        <path d="M55 47 L65 53 M55 53 L65 47" stroke={STROKE} strokeWidth="2" strokeLinecap="round"/>
        <path d="M73 82 L83 88 M73 88 L83 82" stroke={STROKE} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "THE REAPER",
    el: (
      <svg viewBox="0 0 100 100" fill="none" className="w-[78%] h-[78%]">
        <path d="M28 88 L28 14 L52 14 Q68 14 68 28 Q68 42 52 42 L40 42 L70 88"
              stroke={STROKE} strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" fill="none"/>
        <path d="M65 18 Q82 22 82 38" stroke={BLOOD} strokeWidth="3" strokeLinecap="round" fill="none"/>
      </svg>
    ),
  },
  {
    label: "THE END",
    el: (
      <svg viewBox="0 0 100 100" fill="none" overflow="visible" className="w-[78%] h-[78%]">
        <DripGrad id="dg-end1" y0={86} y1={290}/>
        <DripGrad id="dg-end2" y0={88} y1={290}/>
        <path d="M50 92 L50 60" stroke={STROKE} strokeWidth="6" strokeLinecap="round"/>
        <path d="M50 60 L24 14 M50 60 L76 14" stroke={STROKE} strokeWidth="6" strokeLinecap="round"/>
        <path d="M50 60 L50 72" stroke={STROKE} strokeWidth="1.5"/>
        <ellipse cx="50" cy="78" rx="6" ry="5" stroke={STROKE} strokeWidth="2" fill="none"/>
        <circle cx="44" cy="86" r="1.5" fill={BLOOD}/>
        <circle cx="56" cy="88" r="1" fill={BLOOD}/>
        <line x1="44" y1="86" x2="44" y2="290" stroke="url(#dg-end1)" strokeWidth="1.5" style={DRIP}/>
        <line x1="56" y1="88" x2="56" y2="290" stroke="url(#dg-end2)" strokeWidth="1.5" style={{...DRIP, animationDelay: "0.6s"}}/>
      </svg>
    ),
  },
];

function LetterCell({ label, el }: { label: string; el: React.ReactNode }) {
  return (
    <div className="
      relative aspect-[1/1.15] border border-white/[0.1] bg-white/[0.015]
      flex items-center justify-center
      hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.04]
      transition-all duration-300 cursor-default group
    ">
      {el}
      <span className="
        absolute -bottom-5 left-0 right-0 text-center
        font-mono text-[7px] tracking-widest text-white/25 uppercase
        opacity-0 group-hover:opacity-100 transition-opacity duration-200
      ">{label}</span>
    </div>
  );
}

export function LetterformTitle() {
  return (
    <div className="w-full select-none">
      {/* CRYPTO */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mb-10">
        {CRYPTO_LETTERS.map((l, i) => (
          <LetterCell key={i} label={l.label} el={l.el} />
        ))}
      </div>

      {/* CEMETERY */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 mb-6">
        {CEMETERY_LETTERS.map((l, i) => (
          <LetterCell key={i} label={l.label} el={l.el} />
        ))}
      </div>
    </div>
  );
}
