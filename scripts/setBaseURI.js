const { ethers } = require("hardhat");
require("dotenv").config();

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0xbbd948e1E0f865f12A8fA7D0Cfe4a977dfadFD58";
const NEW_BASE_URI     = process.env.NEW_BASE_URI;

const ABI = [
  "function setBaseURI(string calldata newUri) external",
  "function uri(uint256 tokenId) external view returns (string)",
  "function owner() external view returns (address)",
];

async function main() {
  if (!NEW_BASE_URI) {
    console.error("Set NEW_BASE_URI env var, e.g.:");
    console.error('  NEW_BASE_URI="ipfs://<CID>/" npx hardhat run scripts/setBaseURI.js --network shape');
    process.exit(1);
  }

  const [signer] = await ethers.getSigners();
  const contract  = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

  const owner = await contract.owner();
  console.log(`Signer  : ${signer.address}`);
  console.log(`Owner   : ${owner}`);
  console.log(`New URI : ${NEW_BASE_URI}`);

  if (signer.address.toLowerCase() !== owner.toLowerCase()) {
    throw new Error("You are not the owner");
  }

  const tx = await contract.setBaseURI(NEW_BASE_URI);
  console.log(`Tx hash : ${tx.hash}`);
  await tx.wait();

  const sample = await contract.uri(1);
  console.log(`uri(1)  : ${sample}`);
  console.log("✓ Base URI updated");
}

main().catch((err) => {
  console.error("✗", err.message);
  process.exit(1);
});
