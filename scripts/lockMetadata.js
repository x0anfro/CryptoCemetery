const { ethers } = require("hardhat");
require("dotenv").config();

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0xbbd948e1E0f865f12A8fA7D0Cfe4a977dfadFD58";

const ABI = [
  "function lockMetadata() external",
  "function metadataLocked() external view returns (bool)",
  "function owner() external view returns (address)",
];

async function main() {
  const [signer] = await ethers.getSigners();
  const contract  = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

  const owner  = await contract.owner();
  const locked = await contract.metadataLocked();

  console.log(`Signer  : ${signer.address}`);
  console.log(`Owner   : ${owner}`);
  console.log(`Locked  : ${locked}`);

  if (locked) {
    console.log("Already locked — nothing to do.");
    return;
  }

  if (signer.address.toLowerCase() !== owner.toLowerCase()) {
    throw new Error("You are not the owner");
  }

  const tx = await contract.lockMetadata();
  console.log(`Tx hash : ${tx.hash}`);
  await tx.wait();

  console.log("✓ Metadata locked forever");
}

main().catch((err) => {
  console.error("✗", err.message);
  process.exit(1);
});
