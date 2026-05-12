import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  okxWallet,
  rabbyWallet,
  coinbaseWallet,
  walletConnectWallet,
  trustWallet,
  binanceWallet,
  bybitWallet,
  rainbowWallet,
  zerionWallet,
  phantomWallet,
  ledgerWallet,
  safeWallet,
  bitgetWallet,
  gateWallet,
  oneKeyWallet,
} from "@rainbow-me/rainbowkit/wallets";
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
  fees: {
    defaultPriorityFee: BigInt(1),
  },
});

export const wagmiConfig = getDefaultConfig({
  appName: "Crypto Cemetery",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID!,
  chains: [shape],
  ssr: true,
  wallets: [
    {
      groupName: "Popular",
      wallets: [
        metaMaskWallet,
        okxWallet,
        rabbyWallet,
        coinbaseWallet,
        trustWallet,
        binanceWallet,
      ],
    },
    {
      groupName: "More",
      wallets: [
        bybitWallet,
        rainbowWallet,
        zerionWallet,
        phantomWallet,
        bitgetWallet,
        gateWallet,
        oneKeyWallet,
        ledgerWallet,
        safeWallet,
        walletConnectWallet,
      ],
    },
  ],
});
