const { ethers } = require("hardhat");

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x1878B03e66CC8fA4E74Fc0768E82AcC2371cab71";

const ABI = [
  "function setMintEnabled(uint256[] calldata tokenIds, bool enabled) external",
  "function mintEnabled(uint256) external view returns (bool)",
  "function owner() external view returns (address)",
];

async function main() {
  const [signer] = await ethers.getSigners();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

  const owner = await contract.owner();
  console.log(`Signer : ${signer.address}`);
  console.log(`Owner  : ${owner}`);

  if (signer.address.toLowerCase() !== owner.toLowerCase()) {
    throw new Error("You are not the owner of this contract");
  }

  // Check current state
  console.log("\nCurrent mintEnabled state:");
  for (let i = 1; i <= 21; i++) {
    const enabled = await contract.mintEnabled(i);
    if (!enabled) process.stdout.write(`  #${i} disabled\n`);
  }

  // Enable all 21 tokens
  const tokenIds = Array.from({ length: 21 }, (_, i) => i + 1);
  console.log("\nEnabling tokens #1–#21...");
  const tx = await contract.setMintEnabled(tokenIds, true);
  console.log(`Tx hash: ${tx.hash}`);
  await tx.wait();
  console.log("✓ Done — all 21 tombstones are now mintable");
}

main().catch((err) => {
  console.error("✗", err.message);
  process.exit(1);
});
