const { ethers, network, run } = require("hardhat");
require("dotenv").config();

async function main() {
  if (!process.env.PRIVATE_KEY) {
    throw new Error(
      "PRIVATE_KEY not set.\n" +
      "Run in your terminal first:\n" +
      "  $env:PRIVATE_KEY = '0x<your-new-key>'\n" +
      "  $env:BASE_URI    = 'https://your-domain.com/nft/metadata/'"
    );
  }

  const BASE_URI = process.env.BASE_URI;
  if (!BASE_URI) {
    throw new Error("BASE_URI not set (example: https://your-domain.com/nft/metadata/)");
  }

  const TREASURY = process.env.TREASURY_ADDRESS || "0xDfa8E876EB75e2a0c156499F19F72447F494c93F";
  if (!TREASURY || !TREASURY.startsWith("0x")) {
    throw new Error("TREASURY_ADDRESS not set or invalid");
  }

  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("═══════════════════════════════════════════════════════");
  console.log("  Crypto Cemetery v2 — Deploy");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`  Network   : ${network.name} (chainId ${network.config.chainId})`);
  console.log(`  Deployer  : ${deployer.address}`);
  console.log(`  Balance   : ${ethers.formatEther(balance)} ETH`);
  console.log(`  BASE_URI  : ${BASE_URI}`);
  console.log(`  TREASURY  : ${TREASURY}`);
  console.log("═══════════════════════════════════════════════════════\n");

  if (balance < ethers.parseEther("0.001")) {
    throw new Error(`Insufficient balance. Have ${ethers.formatEther(balance)} ETH, need at least 0.001 ETH.`);
  }

  // ─── Deploy ───────────────────────────────────────────────────────────────

  console.log("Deploying CryptoCemetery...");
  const Factory = await ethers.getContractFactory("CryptoCemetery");
  const contract = await Factory.deploy(BASE_URI, TREASURY);
  await contract.waitForDeployment();

  const address   = await contract.getAddress();
  const deployTx  = contract.deploymentTransaction();
  const receipt   = await deployTx.wait();

  console.log(`\n✓ Deployed at : ${address}`);
  console.log(`  Tx hash     : ${deployTx.hash}`);
  console.log(`  Gas used    : ${receipt.gasUsed.toString()}`);
  console.log(`  Block       : ${receipt.blockNumber}`);

  // ─── Smoke checks ─────────────────────────────────────────────────────────

  console.log("\nRunning post-deploy checks...");

  const owner          = await contract.owner();
  const tombCount      = await contract.TOMBSTONE_COUNT();
  const treasuryAddr   = await contract.treasury();
  const uri1           = await contract.uri(1);
  const uri32          = await contract.uri(32);
  const uri110         = await contract.uri(110);
  const mintPrice      = await contract.MINT_PRICE();
  const metaLocked     = await contract.metadataLocked();
  const mint1Enabled   = await contract.mintEnabled(1);
  const mint22Enabled  = await contract.mintEnabled(22);  // should be false (not yet released)
  const mint26Enabled  = await contract.mintEnabled(26);  // should be false
  // legendaryCrafted is now per-user: legendaryCrafted(address, id)
  const crafted105     = await contract.legendaryCrafted(deployer.address, 105);
  const crafted110     = await contract.legendaryCrafted(deployer.address, 110);

  console.log(`  owner()                          → ${owner}`);
  console.log(`  TOMBSTONE_COUNT                  → ${tombCount} (expect 32)`);
  console.log(`  treasury()                       → ${treasuryAddr}`);
  console.log(`  MINT_PRICE                       → ${ethers.formatEther(mintPrice)} ETH`);
  console.log(`  uri(1)                           → ${uri1}`);
  console.log(`  uri(32)                          → ${uri32}`);
  console.log(`  uri(110)                         → ${uri110}`);
  console.log(`  metadataLocked                   → ${metaLocked} (expect false)`);
  console.log(`  mintEnabled(1)                   → ${mint1Enabled} (expect true)`);
  console.log(`  mintEnabled(22)                  → ${mint22Enabled} (expect false)`);
  console.log(`  mintEnabled(26)                  → ${mint26Enabled} (expect false)`);
  console.log(`  legendaryCrafted(deployer, 105)  → ${crafted105} (expect false)`);
  console.log(`  legendaryCrafted(deployer, 110)  → ${crafted110} (expect false)`);

  if (owner.toLowerCase() !== deployer.address.toLowerCase()) throw new Error("Owner mismatch!");
  if (Number(tombCount) !== 32) throw new Error("TOMBSTONE_COUNT should be 32!");
  if (!mint1Enabled) throw new Error("mintEnabled(1) should be true!");
  if (mint22Enabled) throw new Error("mintEnabled(22) should be false!");
  if (mint26Enabled) throw new Error("mintEnabled(26) should be false!");
  if (metaLocked) throw new Error("metadataLocked should be false after deploy!");

  console.log("  All checks passed ✓");

  // ─── Verify on Shape Explorer ─────────────────────────────────────────────

  if (network.name === "shape") {
    console.log("\nWaiting 15s before verification...");
    await new Promise((r) => setTimeout(r, 15000));

    try {
      await run("verify:verify", {
        address,
        constructorArguments: [BASE_URI, TREASURY],
      });
      console.log("✓ Contract verified on Shape Explorer");
    } catch (e) {
      if (e.message.includes("Already Verified")) {
        console.log("✓ Already verified");
      } else {
        console.warn("⚠ Verification failed:", e.message);
        console.warn("  Run manually:");
        console.warn(`  npx hardhat verify --network shape ${address} "${BASE_URI}" "${TREASURY}"`);
      }
    }
  }

  // ─── Summary ──────────────────────────────────────────────────────────────

  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  DEPLOYMENT COMPLETE");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`  Contract  : ${address}`);
  if (network.name === "shape") {
    console.log(`  Explorer  : https://explorer.shape.network/address/${address}`);
  }
  console.log("\n  Next steps:");
  console.log(`  1. Update frontend .env:`);
  console.log(`     NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
  console.log(`  2. Enable Forgotten Keys wave:`);
  console.log(`     setMintEnabled([22,23,24,25], true)`);
  console.log(`  3. Enable Lazarus wave:`);
  console.log(`     setMintEnabled([26,27,28,29,30,31,32], true)`);
  console.log(`  4. Enable Pizza Day event mint:`);
  console.log(`     setMintEnabled([33], true)`);
  console.log(`  5. When metadata is final — call lockMetadata()`);
  console.log(`  6. To collect ETH — call withdraw() (sends to treasury)`);
  console.log(`  7. Register for Shape Gasback:`);
  console.log(`     https://docs.shape.network/building-on-shape/gasback`);
  console.log("═══════════════════════════════════════════════════════\n");
}

main().catch((err) => {
  console.error("\n✗ Deploy failed:", err.message);
  process.exit(1);
});
