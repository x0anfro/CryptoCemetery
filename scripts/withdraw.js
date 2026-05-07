const { ethers } = require("hardhat");

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x1878B03e66CC8fA4E74Fc0768E82AcC2371cab71";

const ABI = [
  "function withdraw() external",
  "function owner() external view returns (address)",
];

async function main() {
  const [signer] = await ethers.getSigners();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

  const owner = await contract.owner();
  const balance = await ethers.provider.getBalance(CONTRACT_ADDRESS);

  console.log(`Signer  : ${signer.address}`);
  console.log(`Owner   : ${owner}`);
  console.log(`Balance : ${ethers.formatEther(balance)} ETH`);

  if (signer.address.toLowerCase() !== owner.toLowerCase()) {
    throw new Error("You are not the owner");
  }

  if (balance === 0n) {
    console.log("Nothing to withdraw");
    return;
  }

  const tx = await contract.withdraw();
  console.log(`Tx hash : ${tx.hash}`);
  await tx.wait();
  console.log(`✓ Withdrawn ${ethers.formatEther(balance)} ETH to ${signer.address}`);
}

main().catch((err) => {
  console.error("✗", err.message);
  process.exit(1);
});
