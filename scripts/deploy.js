const { ethers, network, run } = require("hardhat");
require("dotenv").config();

async function main() {
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY not set. Run: $env:PRIVATE_KEY = '0x...' in your terminal first");
  }

  const BASE_URI = process.env.BASE_URI;
  if (!BASE_URI) {
    throw new Error("BASE_URI not set in .env (example: ipfs://YOUR_CID/)");
  }

  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("═══════════════════════════════════════════════");
  console.log("  Crypto Cemetery — Deploy");
  console.log("═══════════════════════════════════════════════");
  console.log(`  Network  : ${network.name} (chainId ${network.config.chainId})`);
  console.log(`  Deployer : ${deployer.address}`);
  console.log(`  Balance  : ${ethers.formatEther(balance)} ETH`);
  console.log(`  BASE_URI : ${BASE_URI}`);
  console.log("═══════════════════════════════════════════════\n");

  const MIN_BALANCE = ethers.parseEther("0.001");
  if (balance < MIN_BALANCE) {
    throw new Error(`Insufficient balance. Need at least 0.01 ETH, have ${ethers.formatEther(balance)} ETH`);
  }

  // ─── Deploy ───────────────────────────────────────────────────────────────

  console.log("Deploying CryptoCemetery...");
  const Factory = await ethers.getContractFactory("CryptoCemetery");
  const contract = await Factory.deploy(BASE_URI);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  const deployTx = contract.deploymentTransaction();
  const receipt = await deployTx.wait();

  console.log(`\n✓ Deployed at : ${address}`);
  console.log(`  Tx hash     : ${deployTx.hash}`);
  console.log(`  Gas used    : ${receipt.gasUsed.toString()}`);
  console.log(`  Block       : ${receipt.blockNumber}`);

  // ─── Smoke checks ─────────────────────────────────────────────────────────

  console.log("\nRunning post-deploy checks...");

  const owner = await contract.owner();
  const uri1   = await contract.uri(1);
  const uri201 = await contract.uri(201);
  // OneCoin recipe (13,14,15 → 105) — the only recipe in craftRecipes mapping
  // Terra/DoKwon, FTX, MtGox, etc. use dedicated craft functions, not the mapping
  const recipe = await contract.craftRecipes(
    ethers.solidityPackedKeccak256(["uint256","uint256","uint256"], [13,14,15])
  );

  console.log(`  owner()                → ${owner}`);
  console.log(`  uri(1)                 → ${uri1}`);
  console.log(`  uri(201)               → ${uri201}`);
  console.log(`  craftRecipes(13,14,15) → ${recipe} (expect 105)`);

  if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
    throw new Error("Owner mismatch!");
  }
  if (Number(recipe) !== 105) {
    throw new Error("Craft recipe not registered correctly!");
  }
  console.log("  All checks passed ✓");

  // ─── Verify ───────────────────────────────────────────────────────────────

  if (network.name === "shape") {
    console.log("\nWaiting 15s before verification...");
    await new Promise((r) => setTimeout(r, 15000));

    try {
      await run("verify:verify", {
        address,
        constructorArguments: [BASE_URI],
      });
      console.log("✓ Contract verified on Shape Explorer");
    } catch (e) {
      if (e.message.includes("Already Verified")) {
        console.log("✓ Already verified");
      } else {
        console.warn("⚠ Verification failed:", e.message);
        console.warn("  Run manually:");
        console.warn(`  npx hardhat verify --network shape ${address} "${BASE_URI}"`);
      }
    }
  }

  // ─── Summary ──────────────────────────────────────────────────────────────

  console.log("\n═══════════════════════════════════════════════");
  console.log("  DEPLOYMENT COMPLETE");
  console.log("═══════════════════════════════════════════════");
  console.log(`  Contract : ${address}`);
  if (network.name === "shape") {
    console.log(`  Explorer : https://explorer.shape.network/address/${address}`);
  }
  console.log("\n  Next steps:");
  console.log("  1. Save contract address in your .env → CONTRACT_ADDRESS=" + address);
  console.log("  2. Register in Shape Gasback:");
  console.log("     https://docs.shape.network/building-on-shape/gasback");
  console.log("  3. Test mint on Shape Explorer → Write Contract → mint()");
  console.log("═══════════════════════════════════════════════\n");
}

main().catch((err) => {
  console.error("\n✗ Deploy failed:", err.message);
  process.exit(1);
});
