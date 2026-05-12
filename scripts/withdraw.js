const { ethers } = require("hardhat");

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x32a6Ec63F785bBE9169930FF234D5e4563B7caA5";

const ABI = [
  "function withdraw() external",
  "function treasury() external view returns (address)",
];

async function main() {
  const [signer] = await ethers.getSigners();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

  const treasury = await contract.treasury();
  const balance  = await ethers.provider.getBalance(CONTRACT_ADDRESS);

  console.log(`Signer   : ${signer.address}`);
  console.log(`Treasury : ${treasury}`);
  console.log(`Balance  : ${ethers.formatEther(balance)} ETH`);

  if (balance === 0n) {
    console.log("Nothing to withdraw");
    return;
  }

  const tx = await contract.withdraw();
  console.log(`Tx hash  : ${tx.hash}`);
  await tx.wait();
  console.log(`✓ Withdrawn ${ethers.formatEther(balance)} ETH → ${treasury}`);
}

main().catch((err) => {
  console.error("✗", err.message);
  process.exit(1);
});
