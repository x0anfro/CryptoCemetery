const { ethers } = require("hardhat");
require("dotenv").config();

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x1878B03e66CC8fA4E74Fc0768E82AcC2371cab71";
const NEW_OWNER = "0xdFa8E876EB75e2a0c156499F19F72447F494c93F";

const ABI = [
  "function owner() external view returns (address)",
  "function transferOwnership(address newOwner) external",
];

async function main() {
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY not set. Run: $env:PRIVATE_KEY = '0x...' first");
  }

  const [signer] = await ethers.getSigners();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

  const currentOwner = await contract.owner();
  console.log(`Contract : ${CONTRACT_ADDRESS}`);
  console.log(`Current owner : ${currentOwner}`);
  console.log(`New owner     : ${NEW_OWNER}`);

  if (signer.address.toLowerCase() !== currentOwner.toLowerCase()) {
    throw new Error("You are not the current owner");
  }

  if (currentOwner.toLowerCase() === NEW_OWNER.toLowerCase()) {
    console.log("Already transferred, nothing to do.");
    return;
  }

  console.log("\nTransferring ownership...");
  const tx = await contract.transferOwnership(NEW_OWNER);
  console.log(`Tx hash : ${tx.hash}`);
  await tx.wait();

  const newOwner = await contract.owner();
  console.log(`\n✓ Owner is now: ${newOwner}`);
  console.log("Old private key is no longer needed.");
}

main().catch((err) => {
  console.error("✗", err.message);
  process.exit(1);
});
