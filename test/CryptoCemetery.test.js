const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CryptoCemetery", function () {
  let contract;
  let owner, user1, user2, user3;
  const PRICE = ethers.parseEther("0.00042");
  const BASE_URI = "ipfs://testCID/";

  beforeEach(async () => {
    [owner, user1, user2, user3] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("CryptoCemetery");
    contract = await Factory.deploy(BASE_URI);
  });

  // ─── Mint ───────────────────────────────────────────────────────────────────

  describe("mint()", () => {
    it("mints a tombstone with correct ETH", async () => {
      await contract.connect(user1).mint(1, { value: PRICE });
      expect(await contract.balanceOf(user1.address, 1)).to.equal(1);
    });

    it("reverts when minting a token not yet enabled", async () => {
      // Token 4 is Terra group — not enabled in wave 1
      await expect(
        contract.connect(user1).mint(4, { value: PRICE })
      ).to.be.revertedWith("Not available yet");
    });

    it("owner can enable a new token and it becomes mintable", async () => {
      await contract.connect(owner).setMintEnabled([4], true);
      await contract.connect(user1).mint(4, { value: PRICE });
      expect(await contract.balanceOf(user1.address, 4)).to.equal(1);
    });

    it("owner can enable a full group at once", async () => {
      await contract.connect(owner).setMintEnabled([4, 5, 6], true);
      await contract.connect(user1).mint(4, { value: PRICE });
      await contract.connect(user1).mint(5, { value: PRICE });
      await contract.connect(user1).mint(6, { value: PRICE });
      expect(await contract.balanceOf(user1.address, 4)).to.equal(1);
      expect(await contract.balanceOf(user1.address, 6)).to.equal(1);
    });

    it("owner can disable an already-enabled token", async () => {
      await contract.connect(owner).setMintEnabled([1], false);
      await expect(
        contract.connect(user1).mint(1, { value: PRICE })
      ).to.be.revertedWith("Not available yet");
    });

    it("non-owner cannot call setMintEnabled", async () => {
      await expect(
        contract.connect(user1).setMintEnabled([4], true)
      ).to.be.reverted;
    });

    it("emits MintToggled event", async () => {
      await expect(contract.connect(owner).setMintEnabled([4, 5, 6], true))
        .to.emit(contract, "MintToggled")
        .withArgs([4, 5, 6], true);
    });

    it("emits TombstoneMinted", async () => {
      await expect(contract.connect(user1).mint(1, { value: PRICE }))
        .to.emit(contract, "TombstoneMinted")
        .withArgs(user1.address, 1);
    });

    it("reverts with wrong ETH amount", async () => {
      await expect(
        contract.connect(user1).mint(1, { value: ethers.parseEther("0.001") })
      ).to.be.revertedWith("Send exactly 0.00042 ETH");
    });

    it("reverts on invalid token ID (0)", async () => {
      await expect(
        contract.connect(user1).mint(0, { value: PRICE })
      ).to.be.revertedWith("Invalid tombstone ID");
    });

    it("reverts on invalid token ID (22)", async () => {
      await expect(
        contract.connect(user1).mint(22, { value: PRICE })
      ).to.be.revertedWith("Invalid tombstone ID");
    });

    it("tracks totalSupply correctly", async () => {
      const ts = contract["totalSupply(uint256)"];
      expect(await ts(1)).to.equal(0);
      await contract.connect(user1).mint(1, { value: PRICE });
      expect(await ts(1)).to.equal(1);
    });

    it("cannot mint legendary IDs directly", async () => {
      await expect(
        contract.connect(user1).mint(101, { value: PRICE })
      ).to.be.revertedWith("Invalid tombstone ID");
    });
  });

  // ─── Craft ──────────────────────────────────────────────────────────────────

  // craft() handles only OneCoin recipe (13,14,15→105).
  // FTX, Terra, MtGox, BitConnect, 3AC, Celsius use dedicated functions.
  describe("craft() — OneCoin/Ruja (13,14,15→105)", () => {
    async function setupOneCoin(user = user1) {
      await contract.connect(owner).setMintEnabled([13, 14, 15], true);
      await contract.connect(user).mint(13, { value: PRICE });
      await contract.connect(user).mint(14, { value: PRICE });
      await contract.connect(user).mint(15, { value: PRICE });
    }

    it("crafts Ruja Ignatova (#105) from tokens [13,14,15]", async () => {
      await setupOneCoin();
      await contract.connect(user1).craft([13, 14, 15], { value: PRICE });
      expect(await contract.balanceOf(user1.address, 105)).to.equal(1);
    });

    it("craft is order-independent ([15,13,14] works)", async () => {
      await setupOneCoin();
      await contract.connect(user1).craft([15, 13, 14], { value: PRICE });
      expect(await contract.balanceOf(user1.address, 105)).to.equal(1);
    });

    it("burns all three tombstones after crafting", async () => {
      await setupOneCoin();
      await contract.connect(user1).craft([13, 14, 15], { value: PRICE });
      expect(await contract.balanceOf(user1.address, 13)).to.equal(0);
      expect(await contract.balanceOf(user1.address, 14)).to.equal(0);
      expect(await contract.balanceOf(user1.address, 15)).to.equal(0);
    });

    it("emits LegendaryCrafted event", async () => {
      await setupOneCoin();
      await expect(contract.connect(user1).craft([13, 14, 15], { value: PRICE }))
        .to.emit(contract, "LegendaryCrafted")
        .withArgs(user1.address, [13, 14, 15], 105);
    });

    it("reverts if user lacks one of the tokens", async () => {
      await contract.connect(owner).setMintEnabled([13, 14], true);
      await contract.connect(user1).mint(13, { value: PRICE });
      await contract.connect(user1).mint(14, { value: PRICE });
      // missing token 15
      await expect(
        contract.connect(user1).craft([13, 14, 15], { value: PRICE })
      ).to.be.revertedWith("Missing tombstone");
    });

    it("reverts on invalid recipe (wrong tokens)", async () => {
      await contract.connect(owner).setMintEnabled([1, 2, 3], true);
      await contract.connect(user1).mint(1, { value: PRICE });
      await contract.connect(user1).mint(2, { value: PRICE });
      await contract.connect(user1).mint(3, { value: PRICE });
      await expect(
        contract.connect(user1).craft([1, 2, 3], { value: PRICE })
      ).to.be.revertedWith("No recipe for these tombstones");
    });

    it("reverts if duplicate IDs are passed", async () => {
      await contract.connect(owner).setMintEnabled([13], true);
      await contract.connect(user1).mint(13, { value: PRICE });
      await expect(
        contract.connect(user1).craft([13, 13, 13], { value: PRICE })
      ).to.be.revertedWith("Token IDs must be distinct");
    });

    it("reverts with wrong ETH amount", async () => {
      await setupOneCoin();
      await expect(
        contract.connect(user1).craft([13, 14, 15], { value: ethers.parseEther("0.001") })
      ).to.be.revertedWith("Send exactly 0.00042 ETH");
    });

    it("legendary can only be crafted once", async () => {
      await setupOneCoin(user1);
      await contract.connect(user1).craft([13, 14, 15], { value: PRICE });

      await setupOneCoin(user2);
      await expect(
        contract.connect(user2).craft([13, 14, 15], { value: PRICE })
      ).to.be.revertedWith("Already crafted");
    });

    it("legendaryCrafted flag is false before, true after", async () => {
      expect(await contract.legendaryCrafted(105)).to.equal(false);
      await setupOneCoin();
      await contract.connect(user1).craft([13, 14, 15], { value: PRICE });
      expect(await contract.legendaryCrafted(105)).to.equal(true);
    });
  });

  // ─── URI ────────────────────────────────────────────────────────────────────

  describe("uri()", () => {
    it("returns correct URI for tombstone", async () => {
      expect(await contract.uri(1)).to.equal(`${BASE_URI}1.json`);
    });

    it("returns correct URI for legendary", async () => {
      expect(await contract.uri(101)).to.equal(`${BASE_URI}101.json`);
    });

    it("owner can update base URI", async () => {
      await contract.connect(owner).setBaseURI("ipfs://newCID/");
      expect(await contract.uri(5)).to.equal("ipfs://newCID/5.json");
    });

    it("non-owner cannot update base URI", async () => {
      await expect(
        contract.connect(user1).setBaseURI("ipfs://hack/")
      ).to.be.reverted;
    });
  });

  // ─── Withdraw ───────────────────────────────────────────────────────────────

  describe("withdraw()", () => {
    it("owner withdraws collected ETH", async () => {
      await contract.connect(user1).mint(1, { value: PRICE });
      await contract.connect(user2).mint(2, { value: PRICE });

      const before = await ethers.provider.getBalance(owner.address);
      const tx = await contract.connect(owner).withdraw();
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;
      const after = await ethers.provider.getBalance(owner.address);

      expect(after + gasCost - before).to.equal(PRICE * 2n);
    });

    it("reverts if balance is zero", async () => {
      await expect(contract.connect(owner).withdraw()).to.be.revertedWith(
        "Nothing to withdraw"
      );
    });

    it("non-owner cannot withdraw", async () => {
      await contract.connect(user1).mint(1, { value: PRICE });
      await expect(contract.connect(user1).withdraw()).to.be.reverted;
    });
  });

  // ─── craftRecipes mapping ───────────────────────────────────────────────────

  describe("craftRecipes mapping", () => {
    function recipeKey(a, b, c) {
      const sorted = [a, b, c].sort((x, y) => x - y);
      return ethers.solidityPackedKeccak256(
        ["uint256", "uint256", "uint256"],
        sorted
      );
    }

    it("maps OneCoin recipe (13,14,15→105) — only recipe in the mapping", async () => {
      // All other crafts (FTX, Terra, MtGox, BitConnect, 3AC, Celsius) use dedicated functions
      expect(await contract.craftRecipes(recipeKey(13, 14, 15))).to.equal(105);
    });

    it("returns 0 for FTX/Terra/MtGox/3AC — they use dedicated craft functions", async () => {
      expect(await contract.craftRecipes(recipeKey(1,  2,  3))).to.equal(0); // FTX → craftFTXStage1
      expect(await contract.craftRecipes(recipeKey(4,  5,  6))).to.equal(0); // Terra → craftDoKwon
      expect(await contract.craftRecipes(recipeKey(7,  8,  9))).to.equal(0); // MtGox → craftBilyuchenko
      expect(await contract.craftRecipes(recipeKey(19, 20, 21))).to.equal(0); // 3AC → craftSuZhu
    });

    it("returns 0 for unknown recipe", async () => {
      expect(await contract.craftRecipes(recipeKey(1, 5, 9))).to.equal(0);
    });
  });
});
