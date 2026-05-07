require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "cancun",
    },
  },
  networks: {
    shape: {
      url: "https://mainnet.shape.network",
      chainId: 360,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
  etherscan: {
    apiKey: {
      shape: process.env.ETHERSCAN_API_KEY || "placeholder",
    },
    customChains: [
      {
        network: "shape",
        chainId: 360,
        urls: {
          apiURL: "https://explorer.shape.network/api",
          browserURL: "https://explorer.shape.network",
        },
      },
    ],
  },
};
