// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CryptoCemetery
 * @notice NFT collection of crypto's greatest disasters.
 *
 * Token ID layout:
 *   1–21    Tombstones (unlimited supply, payable mint, wave-gated)
 *   101     Sam Bankman-Fried — FTX legendary (craft-only, repeatable)
 *   102–108 Legendaries — unique, craft-only
 *   201     Caroline Ellison  — FTX intermediate (craft-only)
 *   202     Gary Wang         — FTX intermediate (craft-only)
 *   203     Alexei Bilyuchenko — Mt.Gox/BTC-e crossover intermediate (craft-only, repeatable)
 *
 * FTX craft (3-stage):
 *   Stage 1: Burn [1,2,3] → mint 201 (Caroline) — guaranteed
 *   Stage 2: Burn [1,2,3] → mint 202 (Gary)     — guaranteed (when Caroline held)
 *   Stage 3: Burn [201,202] → mint 101 (SBF)    — repeatable
 *
 * Mt.Gox / BTC-e craft (crossover):
 *   Stage 1: Burn [7,8,9]          → mint 203 (Bilyuchenko)  — repeatable
 *   Stage 2a: Burn [203,7,8]       → mint 103 (Karpeles)     — unique
 *   Stage 2b: Burn [203×2 + 9]     → mint 108 (Vinnik)       — unique
 *
 * Direct crafts (unique):
 *   4,5,6    → 102  Do Kwon         (Terra)
 *   10,11,12 → 104  Carlos Matos    (BitConnect)
 *   13,14,15 → 105  Ruja Ignatova   (OneCoin)
 *   16,17,18 → 106  Alex Mashinsky  (Celsius)
 *   19,20,21 → 107  Su Zhu          (3AC)
 */
contract CryptoCemetery is ERC1155, ERC1155Burnable, ERC1155Supply, Ownable, ReentrancyGuard {

    // ─── Constants ────────────────────────────────────────────────────────────

    uint256 public constant MINT_PRICE      = 0.00042 ether;
    uint256 public constant CRAFT_PRICE     = 0.00042 ether;
    uint256 public constant TOMBSTONE_COUNT = 21;

    address public constant TREASURY = 0xDfa8E876EB75e2a0c156499F19F72447F494c93F;

    uint256 public constant CAROLINE    = 201;
    uint256 public constant GARY_WANG   = 202;
    uint256 public constant SBF         = 101;
    uint256 public constant BILYUCHENKO = 203;
    uint256 public constant VINNIK      = 108;
    uint256 public constant ARCARO      = 204;
    uint256 public constant KUMBHANI    = 109;

    // ─── State ────────────────────────────────────────────────────────────────

    string private _baseURI;

    // sorted-triple hash → legendary token ID (direct crafts only)
    mapping(bytes32 => uint256) public craftRecipes;

    // legendary ID → crafted (unique legendaries only)
    mapping(uint256 => bool) public legendaryCrafted;

    // token ID → minting enabled
    mapping(uint256 => bool) public mintEnabled;

    // ─── Events ───────────────────────────────────────────────────────────────

    event TombstoneMinted(address indexed to, uint256 indexed tokenId);
    event LegendaryCrafted(address indexed by, uint256[3] burned, uint256 indexed minted);
    event FTXWitnessCrafted(address indexed by, uint256[3] burned, uint256 indexed received);
    event SBFCrafted(address indexed by);
    event BilyuchenkoCrafted(address indexed by);
    event KarpelesCrafted(address indexed by);
    event VinnikCrafted(address indexed by);
    event ArcaroCrafted(address indexed by);
    event MatosCrafted(address indexed by);
    event KumbhaniCrafted(address indexed by);
    event DoKwonCrafted(address indexed by);
    event SuZhuCrafted(address indexed by);
    event MashinskyCrafted(address indexed by);
    event MintToggled(uint256[] tokenIds, bool enabled);

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(string memory baseUri) ERC1155("") Ownable(msg.sender) {
        _baseURI = baseUri;
        _registerRecipes();
        mintEnabled[1] = true;
        mintEnabled[2] = true;
        mintEnabled[3] = true;
    }

    // ─── Public: Mint ─────────────────────────────────────────────────────────

    function mint(uint256 tokenId) external payable nonReentrant {
        require(tokenId >= 1 && tokenId <= TOMBSTONE_COUNT, "Invalid tombstone ID");
        require(mintEnabled[tokenId], "Not available yet");
        require(msg.value == MINT_PRICE, "Send exactly 0.00042 ETH");

        _mint(msg.sender, tokenId, 1, "");
        emit TombstoneMinted(msg.sender, tokenId);
        _forwardETH();
    }

    // ─── Public: Craft (direct unique legendaries) ────────────────────────────

    function craft(uint256[3] calldata tokenIds) external payable nonReentrant {
        require(msg.value == CRAFT_PRICE, "Send exactly 0.00042 ETH");
        require(
            tokenIds[0] != tokenIds[1] &&
            tokenIds[1] != tokenIds[2] &&
            tokenIds[0] != tokenIds[2],
            "Token IDs must be distinct"
        );

        bytes32 key = _recipeKey(tokenIds[0], tokenIds[1], tokenIds[2]);
        uint256 legendaryId = craftRecipes[key];

        require(legendaryId != 0, "No recipe for these tombstones");
        require(!legendaryCrafted[legendaryId], "Already crafted");

        for (uint256 i = 0; i < 3; i++) {
            require(balanceOf(msg.sender, tokenIds[i]) >= 1, "Missing tombstone");
        }
        for (uint256 i = 0; i < 3; i++) {
            _burn(msg.sender, tokenIds[i], 1);
        }

        legendaryCrafted[legendaryId] = true;
        _mint(msg.sender, legendaryId, 1, "");
        emit LegendaryCrafted(msg.sender, tokenIds, legendaryId);
        _forwardETH();
    }

    // ─── Public: FTX Stage 1/2 — Burn [1,2,3] → Caroline then Gary ──────────

    function craftFTXStage1(uint256[3] calldata tokenIds) external payable nonReentrant {
        require(msg.value == CRAFT_PRICE, "Send exactly 0.00042 ETH");
        bool hasFTX = false; bool hasAlameda = false; bool hasBlockFi = false;
        for (uint256 i = 0; i < 3; i++) {
            if      (tokenIds[i] == 1) hasFTX     = true;
            else if (tokenIds[i] == 2) hasAlameda = true;
            else if (tokenIds[i] == 3) hasBlockFi = true;
        }
        require(hasFTX && hasAlameda && hasBlockFi, "Requires FTX tombstones #1, #2, #3");

        bool ownsCaroline = balanceOf(msg.sender, CAROLINE)  > 0;
        bool ownsGary     = balanceOf(msg.sender, GARY_WANG) > 0;
        require(!ownsCaroline || !ownsGary, "Already have both witnesses");

        for (uint256 i = 0; i < 3; i++) {
            require(balanceOf(msg.sender, tokenIds[i]) >= 1, "Missing tombstone");
        }
        for (uint256 i = 0; i < 3; i++) {
            _burn(msg.sender, tokenIds[i], 1);
        }

        uint256 received = ownsCaroline ? GARY_WANG : CAROLINE;
        _mint(msg.sender, received, 1, "");
        emit FTXWitnessCrafted(msg.sender, tokenIds, received);
        _forwardETH();
    }

    // ─── Public: FTX Stage 3 — Burn Caroline + Gary → SBF ───────────────────

    function craftSBF() external payable nonReentrant {
        require(msg.value == CRAFT_PRICE, "Send exactly 0.00042 ETH");
        require(balanceOf(msg.sender, CAROLINE)  >= 1, "Missing Caroline Ellison (#201)");
        require(balanceOf(msg.sender, GARY_WANG) >= 1, "Missing Gary Wang (#202)");

        _burn(msg.sender, CAROLINE,  1);
        _burn(msg.sender, GARY_WANG, 1);
        _mint(msg.sender, SBF, 1, "");
        emit SBFCrafted(msg.sender);
        _forwardETH();
    }

    // ─── Public: Mt.Gox Stage 1 — Burn [7,8,9] → Bilyuchenko (repeatable) ───

    function craftBilyuchenko(uint256[3] calldata tokenIds) external payable nonReentrant {
        require(msg.value == CRAFT_PRICE, "Send exactly 0.00042 ETH");
        bool hasMtGox      = false;
        bool hasBitcoinica = false;
        bool hasBtcE       = false;
        for (uint256 i = 0; i < 3; i++) {
            if      (tokenIds[i] == 7) hasMtGox      = true;
            else if (tokenIds[i] == 8) hasBitcoinica = true;
            else if (tokenIds[i] == 9) hasBtcE       = true;
        }
        require(hasMtGox && hasBitcoinica && hasBtcE, "Requires Mt.Gox tombstones #7, #8, #9");

        for (uint256 i = 0; i < 3; i++) {
            require(balanceOf(msg.sender, tokenIds[i]) >= 1, "Missing tombstone");
        }
        for (uint256 i = 0; i < 3; i++) {
            _burn(msg.sender, tokenIds[i], 1);
        }

        _mint(msg.sender, BILYUCHENKO, 1, "");
        emit BilyuchenkoCrafted(msg.sender);
        _forwardETH();
    }

    // ─── Public: Mt.Gox Stage 2a — Burn [#7×2 + Bilyuchenko] → Karpeles ────

    function craftKarpeles() external payable nonReentrant {
        require(msg.value == CRAFT_PRICE, "Send exactly 0.00042 ETH");
        require(balanceOf(msg.sender, 7) >= 2, "Need 2x Mt. Gox tombstone (#7)");
        require(balanceOf(msg.sender, BILYUCHENKO) >= 1, "Missing Bilyuchenko (#203)");
        require(!legendaryCrafted[103], "Already crafted");

        _burn(msg.sender, 7, 2);
        _burn(msg.sender, BILYUCHENKO, 1);
        legendaryCrafted[103] = true;
        _mint(msg.sender, 103, 1, "");
        emit KarpelesCrafted(msg.sender);
        _forwardETH();
    }

    // ─── Public: BTC-e Stage 2b — Burn [#9×2 + Bilyuchenko] → Vinnik ───────

    function craftVinnik() external payable nonReentrant {
        require(msg.value == CRAFT_PRICE, "Send exactly 0.00042 ETH");
        require(balanceOf(msg.sender, 9) >= 2, "Need 2x BTC-e tombstone (#9)");
        require(balanceOf(msg.sender, BILYUCHENKO) >= 1, "Missing Bilyuchenko (#203)");
        require(!legendaryCrafted[VINNIK], "Already crafted");

        _burn(msg.sender, 9, 2);
        _burn(msg.sender, BILYUCHENKO, 1);
        legendaryCrafted[VINNIK] = true;
        _mint(msg.sender, VINNIK, 1, "");
        emit VinnikCrafted(msg.sender);
        _forwardETH();
    }

    // ─── Public: BitConnect Stage 1 — Burn [10,11,12] → Arcaro (repeatable) ──

    function craftArcaro(uint256[3] calldata tokenIds) external payable nonReentrant {
        require(msg.value == CRAFT_PRICE, "Send exactly 0.00042 ETH");
        bool hasBitConnect  = false;
        bool hasBitConnectX = false;
        bool hasBCC         = false;
        for (uint256 i = 0; i < 3; i++) {
            if      (tokenIds[i] == 10) hasBitConnect  = true;
            else if (tokenIds[i] == 11) hasBitConnectX = true;
            else if (tokenIds[i] == 12) hasBCC         = true;
        }
        require(hasBitConnect && hasBitConnectX && hasBCC, "Requires BitConnect tombstones #10, #11, #12");

        for (uint256 i = 0; i < 3; i++) {
            require(balanceOf(msg.sender, tokenIds[i]) >= 1, "Missing tombstone");
        }
        for (uint256 i = 0; i < 3; i++) {
            _burn(msg.sender, tokenIds[i], 1);
        }

        _mint(msg.sender, ARCARO, 1, "");
        emit ArcaroCrafted(msg.sender);
        _forwardETH();
    }

    // ─── Public: BitConnect Stage 2a — Burn [#10×2 + Arcaro] → Matos ─────────

    function craftMatos() external payable nonReentrant {
        require(msg.value == CRAFT_PRICE, "Send exactly 0.00042 ETH");
        require(balanceOf(msg.sender, 10) >= 2, "Need 2x BitConnect tombstone (#10)");
        require(balanceOf(msg.sender, ARCARO) >= 1, "Missing Arcaro (#204)");
        require(!legendaryCrafted[104], "Already crafted");

        _burn(msg.sender, 10, 2);
        _burn(msg.sender, ARCARO, 1);
        legendaryCrafted[104] = true;
        _mint(msg.sender, 104, 1, "");
        emit MatosCrafted(msg.sender);
        _forwardETH();
    }

    // ─── Public: BitConnect Stage 2b — Burn [#12×2 + Arcaro] → Kumbhani ─────

    function craftKumbhani() external payable nonReentrant {
        require(msg.value == CRAFT_PRICE, "Send exactly 0.00042 ETH");
        require(balanceOf(msg.sender, 12) >= 2, "Need 2x BCC Token tombstone (#12)");
        require(balanceOf(msg.sender, ARCARO) >= 1, "Missing Arcaro (#204)");
        require(!legendaryCrafted[KUMBHANI], "Already crafted");

        _burn(msg.sender, 12, 2);
        _burn(msg.sender, ARCARO, 1);
        legendaryCrafted[KUMBHANI] = true;
        _mint(msg.sender, KUMBHANI, 1, "");
        emit KumbhaniCrafted(msg.sender);
        _forwardETH();
    }

    // ─── Public: Terra — Burn [4,5,6,18] → Do Kwon ───────────────────────────

    function craftDoKwon() external payable nonReentrant {
        require(msg.value == CRAFT_PRICE, "Send exactly 0.00042 ETH");
        require(balanceOf(msg.sender, 4)  >= 1, "Missing Terra/LUNA (#4)");
        require(balanceOf(msg.sender, 5)  >= 1, "Missing Anchor Protocol (#5)");
        require(balanceOf(msg.sender, 6)  >= 1, "Missing TerraUSD (#6)");
        require(balanceOf(msg.sender, 18) >= 1, "Missing Hodlnaut (#18)");
        require(!legendaryCrafted[102], "Already crafted");

        _burn(msg.sender, 4,  1);
        _burn(msg.sender, 5,  1);
        _burn(msg.sender, 6,  1);
        _burn(msg.sender, 18, 1);
        legendaryCrafted[102] = true;
        _mint(msg.sender, 102, 1, "");
        emit DoKwonCrafted(msg.sender);
        _forwardETH();
    }

    // ─── Public: 3AC — Burn [17,19,20,21] → Su Zhu ───────────────────────────

    function craftSuZhu() external payable nonReentrant {
        require(msg.value == CRAFT_PRICE, "Send exactly 0.00042 ETH");
        require(balanceOf(msg.sender, 17) >= 1, "Missing Voyager Digital (#17)");
        require(balanceOf(msg.sender, 19) >= 1, "Missing Three Arrows Capital (#19)");
        require(balanceOf(msg.sender, 20) >= 1, "Missing Starry Night Capital (#20)");
        require(balanceOf(msg.sender, 21) >= 1, "Missing GBTC Trade (#21)");
        require(!legendaryCrafted[107], "Already crafted");

        _burn(msg.sender, 17, 1);
        _burn(msg.sender, 19, 1);
        _burn(msg.sender, 20, 1);
        _burn(msg.sender, 21, 1);
        legendaryCrafted[107] = true;
        _mint(msg.sender, 107, 1, "");
        emit SuZhuCrafted(msg.sender);
        _forwardETH();
    }

    // ─── Public: Celsius — Burn [16] → Alex Mashinsky (1:1 exchange) ─────────

    function craftMashinsky() external payable nonReentrant {
        require(msg.value == CRAFT_PRICE, "Send exactly 0.00042 ETH");
        require(balanceOf(msg.sender, 16) >= 1, "Missing Celsius Network (#16)");
        require(!legendaryCrafted[106], "Already crafted");

        _burn(msg.sender, 16, 1);
        legendaryCrafted[106] = true;
        _mint(msg.sender, 106, 1, "");
        emit MashinskyCrafted(msg.sender);
        _forwardETH();
    }

    // ─── Owner: Admin ─────────────────────────────────────────────────────────

    function _forwardETH() private {
        (bool ok, ) = TREASURY.call{value: msg.value}("");
        require(ok, "ETH forward failed");
    }

    function setBaseURI(string calldata newUri) external onlyOwner {
        _baseURI = newUri;
    }

    function setMintEnabled(uint256[] calldata tokenIds, bool enabled) external onlyOwner {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(tokenIds[i] >= 1 && tokenIds[i] <= TOMBSTONE_COUNT, "Invalid tombstone ID");
            mintEnabled[tokenIds[i]] = enabled;
        }
        emit MintToggled(tokenIds, enabled);
    }

    // ─── Metadata ─────────────────────────────────────────────────────────────

    function uri(uint256 tokenId) public view override returns (string memory) {
        return string(abi.encodePacked(_baseURI, _uint2str(tokenId), ".json"));
    }

    // ─── Internal: Recipes ────────────────────────────────────────────────────

    function _registerRecipes() private {
        // Mt.Gox (7,8,9) handled by craftBilyuchenko/craftKarpeles/craftVinnik
        // BitConnect (10,11,12) handled by craftArcaro/craftMatos/craftKumbhani
        // Terra (4,5,6,18) handled by craftDoKwon()
        // Celsius (16) handled by craftMashinsky() — 1:1 exchange
        // 3AC (17,19,20,21) handled by craftSuZhu()
        _addRecipe(13, 14, 15, 105); // OneCoin → Ruja Ignatova
    }

    function _addRecipe(uint256 a, uint256 b, uint256 c, uint256 legendaryId) private {
        craftRecipes[_recipeKey(a, b, c)] = legendaryId;
    }

    function _recipeKey(uint256 a, uint256 b, uint256 c) private pure returns (bytes32) {
        if (a > b) (a, b) = (b, a);
        if (b > c) (b, c) = (c, b);
        if (a > b) (a, b) = (b, a);
        return keccak256(abi.encodePacked(a, b, c));
    }

    // ─── Internal: Helpers ────────────────────────────────────────────────────

    function _uint2str(uint256 value) private pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) { digits++; temp /= 10; }
        bytes memory buf = new bytes(digits);
        while (value != 0) {
            digits--;
            buf[digits] = bytes1(uint8(48 + value % 10));
            value /= 10;
        }
        return string(buf);
    }

    // ─── Required Overrides ───────────────────────────────────────────────────

    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Supply) {
        super._update(from, to, ids, values);
    }
}
