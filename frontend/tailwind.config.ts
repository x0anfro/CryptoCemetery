import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent:  "#5b9bd5",
        "accent-dim": "#3a6fa0",
        navy:    "#0a1628",
        panel:   "#0e1f35",
        surface: "#132840",
        border:  "#1e3a57",
        muted:   "#4a7090",
        text:    "#c8dce8",
      },
      fontFamily: {
        sans:  ["var(--font-grotesk)", "system-ui", "sans-serif"],
        mono:  ["var(--font-mono)", "monospace"],
      },
      keyframes: {
        glow: {
          "0%, 100%": { boxShadow: "0 0 10px #5b9bd544, 0 0 30px #5b9bd511" },
          "50%":       { boxShadow: "0 0 20px #5b9bd577, 0 0 50px #5b9bd522" },
        },
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        glow:    "glow 3s ease-in-out infinite",
        fadeUp:  "fadeUp 0.5s ease both",
        shimmer: "shimmer 2s linear infinite",
      },
      clipPath: {
        hex: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
        cut: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)",
        "cut-sm": "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
