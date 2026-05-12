const { ethers } = require("hardhat");

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x32a6Ec63F785bBE9169930FF234D5e4563B7caA5";

const ABI = [
  "function setMintEnabled(uint256[] calldata tokenIds, bool enabled) external",
  "function mintEnabled(uint256) external view returns (bool)",
  "function owner() external view returns (address)",
];

async function main() {
  const [signer] = await ethers.getSigners();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

  const owner = await contract.owner();
  console.log(`Signer  : ${signer.address}`);
  console.log(`Owner   : ${owner}`);
  console.log(`Contract: ${CONTRACT_ADDRESS}`);

  if (signer.address.toLowerCase() !== owner.toLowerCase()) {
    throw new Error("You are not the owner of this contract");
  }

  // Enable tombstones #1–#32 + Pizza Day event #33
  const tokenIds = Array.from({ length: 33 }, (_, i) => i + 1);
  console.log("\nEnabling tombstones #1–#32 + Pizza Day event #33...");
  const tx = await contract.setMintEnabled(tokenIds, true);
  console.log(`Tx hash : ${tx.hash}`);
  await tx.wait();

  // Verify
  console.log("\nVerifying...");
  for (let i = 1; i <= 33; i++) {
    const enabled = await contract.mintEnabled(i);
    if (!enabled) console.log(`  ⚠ #${i} still disabled`);
  }
  console.log("✓ All tombstones (#1–#32) + Pizza Day (#33) are now mintable");
}

main().catch((err) => {
  console.error("✗", err.message);
  process.exit(1);
});
