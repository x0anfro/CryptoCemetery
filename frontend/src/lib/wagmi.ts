import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";

export const shape = defineChain({
  id: 360,
  name: "Shape",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://mainnet.shape.network"] },
  },
  blockExplorers: {
    default: { name: "Shape Explorer", url: "https://explorer.shape.network" },
  },
});

export const wagmiConfig = getDefaultConfig({
  appName: "Crypto Cemetery",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID!,
  chains: [shape],
  ssr: true,
});
