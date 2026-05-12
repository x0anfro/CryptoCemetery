"use client";

import { RainbowKitProvider, darkTheme, type Theme, AvatarComponent } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "@/lib/wagmi";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries:   { throwOnError: false, retry: false },
    mutations: { throwOnError: false },
  },
});

const base = darkTheme({
  accentColor: "#c8a96e",
  accentColorForeground: "#0d0d0d",
  borderRadius: "none",
  fontStack: "system",
  overlayBlur: "small",
});

const siteTheme: Theme = {
  ...base,
  colors: {
    ...base.colors,
    modalBackground:              "#0d0d0d",
    modalBorder:                  "#2a2a2a",
    modalText:                    "#f5f1e8",
    modalTextSecondary:           "#888888",
    modalTextDim:                 "#555555",
    closeButton:                  "#888888",
    closeButtonBackground:        "transparent",
    actionButtonBorder:           "#2a2a2a",
    actionButtonBorderMobile:     "#2a2a2a",
    actionButtonSecondaryBackground: "#141414",
    generalBorder:                "#2a2a2a",
    generalBorderDim:             "#1e1e1e",
    menuItemBackground:           "#141414",
    profileAction:                "#141414",
    profileActionHover:           "#1e1e1e",
    profileForeground:            "#0d0d0d",
  },
  fonts: {
    body: "ui-monospace, 'Courier New', monospace",
  },
  radii: {
    actionButton:  "0px",
    connectButton: "0px",
    menuButton:    "0px",
    modal:         "0px",
    modalMobile:   "0px",
  },
};

const SkullAvatar: AvatarComponent = ({ size }) => (
  <div
    style={{ width: size, height: size, background: "#0d0d0d", border: "1px solid #2a2a2a", display: "flex", alignItems: "center", justifyContent: "center" }}
  >
    <svg
      viewBox="0 0 200 200"
      fill="none"
      style={{ width: size * 0.65, height: size * 0.65 }}
    >
      <path
        d="M58 72 Q58 32 100 32 Q142 32 142 72 L142 112 Q142 128 132 134 L132 150 L116 150 L116 138 L106 138 L106 150 L94 150 L94 138 L84 138 L84 150 L68 150 L68 134 Q58 128 58 112 Z"
        stroke="#c8a96e" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round"
      />
      <rect x="72" y="74" width="16" height="26" fill="#c8a96e" />
      <path d="M80 68 L80 74 M80 100 L80 106" stroke="#c8a96e" strokeWidth="3" strokeLinecap="round" />
      <rect x="112" y="74" width="16" height="26" fill="#c8a96e" />
      <path d="M120 68 L120 74 M120 100 L120 106" stroke="#c8a96e" strokeWidth="3" strokeLinecap="round" />
      <path d="M100 110 L94 122 L106 122 Z" fill="#c8a96e" />
    </svg>
  </div>
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={siteTheme}
          avatar={SkullAvatar}
          locale="en-US"
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
