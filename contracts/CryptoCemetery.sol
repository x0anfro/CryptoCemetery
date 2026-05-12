// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

/**
 * @title CryptoCemetery
 * @notice NFT collection of crypto's greatest disasters.
 *
 * Token ID layout:
 *   1–32    Tombstones (unlimited supply, payable mint, wave-gated)
 *   33      Bitcoin Pizza Day — Event NFT (mintable, wave-gated, repeatable)
 *
 *   101     Sam Bankman-Fried   — FTX Epic      (craft-only, repeatable)
 *   102     Do Kwon             — Terra Legendary
 *   103     Mark Karpeles       — Mt.Gox Legendary
 *   104     Carlos Matos        — BitConnect Legendary
 *   105     Ruja Ignatova       — OneCoin Epic
 *   106     Alex Mashinsky      — Celsius Legendary
 *   107     Su Zhu              — 3AC Legendary
 *   108     Alexander Vinnik    — BTC-e Epic
 *   109     Satish Kumbhani     — BitConnect Epic
 *   110     Lazarus Group       — Lazarus Epic
 *   111     James Howells       — Forgotten Keys Legendary
 *   112     Stefan Thomas       — Forgotten Keys Legendary
 *   113     Satoshi Nakamoto    — Forgotten Keys Legendary
 *   114     Gerald Cotten       — Forgotten Keys Legendary
 *   115     Laszlo Hanyecz      — Bitcoin Pizza Day Epic
 *
 *   201     Caroline Ellison    — FTX intermediate (repeatable)
 *   202     Gary Wang           — FTX intermediate (repeatable)
 *   203     Alexei Bilyuchenko  — Mt.Gox/BTC-e intermediate (repeatable)
 *   204     Glenn Arcaro        — BitConnect intermediate (repeatable)
 *   205     Irina Dilkinska     — OneCoin witness (repeatable)
 *   206     Karl Greenwood      — OneCoin witness (repeatable)
 *   207     Konstantin Ignatov  — OneCoin witness (repeatable)
 *   208     Mark Scott          — OneCoin witness (repeatable)
 *
 * ── Craft recipes ───────────────────────────────────────────────────────────
 *
 * FTX (3-stage):
 *   Stage 1: Burn [1,2,3]                    → mint 201 (Caroline)    repeatable
 *   Stage 2: Own [201]; Burn [1,2,3]         → mint 202 (Gary)        repeatable
 *   Stage 3: Own [201,202]; Burn [1,2,3]     → mint 101 (SBF)         repeatable
 *
 * Mt.Gox / BTC-e (crossover):
 *   Stage 1:  Burn [7,8,9]                   → mint 203 (Bilyuchenko) repeatable
 *   Stage 2a: Own [203]; Burn [7×2 + 8]      → mint 103 (Karpeles)    unique
 *   Stage 2b: Own [103]; Burn [9×2 + 8]      → mint 108 (Vinnik)      unique
 *
 * BitConnect (crossover):
 *   Stage 1:  Burn [10,11,12]                → mint 204 (Arcaro)      repeatable
 *   Stage 2a: Own [204]; Burn [10×2]         → mint 104 (Matos)       unique
 *   Stage 2b: Own [104]; Burn [12×2]         → mint 109 (Kumbhani)    unique
 *
 * Terra:       Burn [4,5,6,18]       → mint 102 (Do Kwon)     unique
 * 3AC:         Burn [17,19,20,21]    → mint 107 (Su Zhu)      unique
 * Celsius:     Burn [16]             → mint 106 (Mashinsky)   unique
 *
 * OneCoin (2-stage):
 *   Stage 1: Burn [13,14,15]         → mint next witness       repeatable ×4
 *              Witnesses: 205 → 206 → 207 → 208
 *   Stage 2: Burn [205,206,207,208]  → mint 105 (Ruja)         unique
 *
 * Forgotten Keys (1:1):
 *   Burn [22] → mint 111 (Howells)   unique
 *   Burn [23] → mint 112 (Thomas)    unique
 *   Burn [24] → mint 113 (Satoshi)   unique
 *   Burn [25] → mint 114 (Cotten)    unique
 *
 * Lazarus (7-witness):
 *   Burn [26,27,28,29,30,31,32]      → mint 110 (Lazarus)      unique
 *
 * Bitcoin Pizza Day:
 *   Own [101,105,108,109,110] (not burned) + Burn [33×5] → mint 115 (Laszlo) unique
 */
contract CryptoCemetery is ERC1155, ERC1155Burnable, ERC1155Supply, Ownable2Step, Pausable, ReentrancyGuard, IERC2981 {

    // ─── Constants ────────────────────────────────────────────────────────────

    uint96  public constant ROYALTY_BPS     = 500; // 5%

    uint256 public constant MINT_PRICE      = 0.00042 ether;
    uint256 public constant CRAFT_PRICE     = 0.00042 ether;
    uint256 public constant TOMBSTONE_COUNT = 32;

    // FTX intermediates
    uint256 public constant CAROLINE    = 201;
    uint256 public constant GARY_WANG   = 202;
    uint256 public constant SBF         = 101;

    // Mt.Gox / BTC-e intermediates & legendaries
    uint256 public constant BILYUCHENKO = 203;
    uint256 public constant VINNIK      = 108;

    // BitConnect intermediates & legendaries
    uint256 public constant ARCARO      = 204;
    uint256 public constant KUMBHANI    = 109;

    // OneCoin witnesses
    uint256 public constant DILKINSKA   = 205;
    uint256 public constant GREENWOOD   = 206;
    uint256 public constant IGNATOV     = 207;
    uint256 public constant MARK_SCOTT  = 208;

    // ─── State ────────────────────────────────────────────────────────────────

    // Mutable treasury — changeable by owner via setTreasury()
    address public treasury;

    string private _baseURI;

    // Once true, _baseURI can never be changed again.
    bool public metadataLocked;

    // address → legendary ID → crafted (per-user: each player completes quests independently)
    mapping(address => mapping(uint256 => bool)) public legendaryCrafted;

    // token ID → minting enabled (covers tombstones 1–32 and Pizza Day event #33)
    mapping(uint256 => bool) public mintEnabled;

    // ─── Events ───────────────────────────────────────────────────────────────

    event TombstoneMinted(address indexed to, uint256 indexed tokenId);
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
    event OneCoinWitnessCrafted(address indexed by, uint256 indexed witnessId);
    event RujaCrafted(address indexed by);
    event HowellsCrafted(address indexed by);
    event ThomasCrafted(address indexed by);
    event SatoshiCrafted(address indexed by);
    event CottenCrafted(address indexed by);
    event LazarusCrafted(address indexed by);
    event PizzaDayCrafted(address indexed by);
    event MintToggled(uint256[] tokenIds, bool enabled);
    event BaseURIUpdated(string newUri);
    event MetadataLocked();
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event Withdrawn(address indexed to, uint256 amount);
    event ETHRetained(uint256 amount); // treasury forward failed — ETH stays in contract, use withdraw()

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(string memory baseUri, address initialTreasury) ERC1155("") Ownable(msg.sender) {
        require(initialTreasury != address(0), "Zero treasury");
        _baseURI = baseUri;
        treasury = initialTreasury;
        mintEnabled[1] = true;
        mintEnabled[2] = true;
        mintEnabled[3] = true;
    }

    receive() external payable {}

    // ─── Public: Mint ─────────────────────────────────────────────────────────

    function mint(uint256 tokenId) external payable nonReentrant whenNotPaused {
        require(tokenId >= 1 && tokenId <= TOMBSTONE_COUNT, "Invalid tombstone ID");
        require(mintEnabled[tokenId], "Not available yet");
        require(msg.value == MINT_PRICE, "Send exactly 0.00042 ETH");

        _mint(msg.sender, tokenId, 1, "");
        emit TombstoneMinted(msg.sender, tokenId);
        _forwardETH();
    }

    // ─── Public: FTX Stage 1/2 — Burn [1,2,3] → Caroline then Gary ──────────

    function craftFTXStage1(uint256[3] calldata tokenIds) external payable nonReentrant whenNotPaused {
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

    // ─── Public: FTX Stage 3 — Own Caroline+Gary; Burn [1,2,3] → SBF ──────────

    function craftSBF() external payable nonReentrant whenNotPaused {
        require(msg.value == CRAFT_PRICE, "Send exactly 0.00042 ETH");
        require(balanceOf(msg.sender, CAROLINE)  >= 1, "Missing Caroline Ellison (#201)");
        require(balanceOf(msg.sender, GARY_WANG) >= 1, "Missing Gary Wang (#202)");
        require(balanceOf(msg.sender, 1) >= 1, "Missing FTX Exchange (#1)");
        require(balanceOf(msg.sender, 2) >= 1, "Missing Alameda Research (#2)");
        require(balanceOf(msg.sender, 3) >= 1, "Missing BlockFi (#3)");

        _burn(msg.sender, 1, 1);
        _burn(msg.sender, 2, 1);
        _burn(msg.sender, 3, 1);
        _mint(msg.sender, SBF, 1, "");
        emit SBFCrafted(msg.sender);
        _forwardETH();
    }

    // ─── Public: Mt.Gox Stage 1 — Burn [7,8,9] → Bilyuchenko (repeatable) ───

    function craftBilyuchenko(uint256[3] calldata tokenIds) external payable nonReentrant whenNotPaused {
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

    // ─── Public: Mt.Gox Stage 2a — Own Bilyuchenko; Burn [7×2 + 8] → Karpeles ─

    function craftKarpeles() external payable nonReentrant whenNotPaused {
        require(msg.value == CRAFT_PRICE, "Send exactly 0.00042 ETH");
        require(balanceOf(msg.sender, BILYUCHENKO) >= 1, "Missing Bilyuchenko (#203)");
        require(balanceOf(msg.sender, 7) >= 2, "Need 2x Mt. Gox tombstone (#7)");
        require(balanceOf(msg.sender, 8) >= 1, "Missing Bitcoinica (#8)");
        require(!legendaryCrafted[msg.sender][103], "Already crafted by you");

        _burn(msg.sender, 7, 2);
        _burn(msg.sender, 8, 1);
        legendaryCrafted[msg.sender][103] = true;
        _mint(msg.sender, 103, 1, "");
        emit KarpelesCrafted(msg.sender);
        _forwardETH();
    }

    // ─── Public: BTC-e Stage 2b — Own Karpeles; Burn [9×2 + 8] → Vinnik ──────

    function craftVinnik() external payable nonReentrant whenNotPaused {
        require(msg.value == CRAFT_PRICE, "Send exactly 0.00042 ETH");
        require(balanceOf(msg.sender, 103) >= 1, "Missing Karpeles (#103)");
        require(balanceOf(msg.sender, 9) >= 2, "Need 2x BTC-e tombstone (#9)");
        require(balanceOf(msg.sender, 8) >= 1, "Missing Bitcoinica (#8)");
        require(!legendaryCrafted[msg.sender][VINNIK], "Already crafted by you");

        _burn(msg.sender, 9, 2);
        _burn(msg.sender, 8, 1);
        legendaryCrafted[msg.sender][VINNIK] = true;
        _mint(msg.sender, VINNIK, 1, "");
        emit VinnikCrafted(msg.sender);
        _forwardETH();
    }

    // ─── Public: BitConnect Stage 1 — Burn [10,11,12] → Arcaro (repeatable) ──

    function craftArcaro(uint256[3] calldata tokenIds) external payable nonReentrant whenNotPaused {
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

    // ─── Public: BitConnect Stage 2a — Own Arcaro; Burn [10×2] → Matos ────────

    function craftMatos() external payable nonReentrant whenNotPaused {
        require(msg.value == CRAFT_PRICE, "Send exactly 0.00042 ETH");
        require(balanceOf(msg.sender, ARCARO) >= 1, "Missing Arcaro (#204)");
        require(balanceOf(msg.sender, 10) >= 2, "Need 2x BitConnect tombstone (#10)");
        require(!legendaryCrafted[msg.sender][104], "Already crafted by you");

        _burn(msg.sender, 10, 2);
        legendaryCrafted[msg.sender][104] = true;
        _mint(msg.sender, 104, 1, "");
        emit MatosCrafted(msg.sender);
        _forwardETH();
    }

    // ─── Public: BitConnect Stage 2b — Own Matos; Burn [12×2] → Kumbhani ─────

    function craftKumbhani() external payable nonReentrant whenNotPaused {
        require(msg.value == CRAFT_PRICE, "Send exactly 0.00042 ETH");
        require(balanceOf(msg.sender, 104) >= 1, "Missing Carlos Matos (#104)");
        require(balanceOf(msg.sender, 12) >= 2, "Need 2x BCC Token tombstone (#12)");
        require(!legendaryCrafted[msg.sender][KUMBHANI], "Already crafted by you");

        _burn(msg.sender, 12, 2);
        legendaryCrafted[msg.sender][KUMBHANI] = true;
        _mint(msg.sender, KUMBHANI, 1, "");
        emit KumbhaniCrafted(msg.sender);
        _forwardETH();
    }

    // ─── Public: Terra — Burn [4,5,6,18] → Do Kwon ───────────────────────────

    function craftDoKwon() external payable nonReentrant whenNotPaused {
        require(msg.value == CRAFT_PRICE, "Send exactly 0.00042 ETH");
        require(balanceOf(msg.sender, 4)  >= 1, "Missing Terra/LUNA (#4)");
        require(balanceOf(msg.sender, 5)  >= 1, "Missing Anchor Protocol (#5)");
        require(balanceOf(msg.sender, 6)  >= 1, "Missing TerraUSD (#6)");
        require(balanceOf(msg.sender, 18) >= 1, "Missing Hodlnaut (#18)");
        require(!legendaryCrafted[msg.sender][102], "Already crafted by you");

        _burn(msg.sender, 4,  1);
        _burn(msg.sender, 5,  1);
        _burn(msg.sender, 6,  1);
        _burn(msg.sender, 18, 1);
        legendaryCrafted[msg.sender][102] = true;
        _mint(msg.sender, 102, 1, "");
        emit DoKwonCrafted(msg.sender);
        _forwardETH();
    }

    // ─── Public: 3AC — Burn [17,19,20,21] → Su Zhu ───────────────────────────

    function craftSuZhu() external payable nonReentrant whenNotPaused {
        require(msg.value == CRAFT_PRICE, "Send exactly 0.00042 ETH");
        require(balanceOf(msg.sender, 17) >= 1, "Missing Voyager Digital (#17)");
        require(balanceOf(msg.sender, 19) >= 1, "Missing Three Arrows Capital (#19)");
        require(balanceOf(msg.sender, 20) >= 1, "Missing Starry Night Capital (#20)");
        require(balanceOf(msg.sender, 21) >= 1, "Missing GBTC Trade (#21)");
        require(!legendaryCrafted[msg.sender][107], "Already crafted by you");

        _burn(msg.sender, 17, 1);
        _burn(msg.sender, 19, 1);
        _burn(msg.sender, 20, 1);
        _burn(msg.sender, 21, 1);
        legendaryCrafted[msg.sender][107] = true;
        _mint(msg.sender, 107, 1, "");
        emit SuZhuCrafted(msg.sender);
        _forwardETH();
    }

    // ─── Public: Celsius — Burn [16] → Alex Mashinsky (1:1 exchange) ─────────

    function craftMashinsky() external payable nonReentrant whenNotPaused {
        require(msg.value == CRAFT_PRICE, "Send exactly 0.00042 ETH");
        require(balanceOf(msg.sender, 16) >= 1, "Missing Celsius Network (#16)");
        require(!legendaryCrafted[msg.sender][106], "Already crafted by you");

        _burn(msg.sender, 16, 1);
        legendaryCrafted[msg.sender][106] = true;
        _mint(msg.sender, 106, 1, "");
        emit MashinskyCrafted(msg.sender);
        _forwardETH();
    }

    // ─── Public: OneCoin Stage 1 — Burn [13,14,15] → next witness ────────────
    //
    // Witnesses are minted in order: 205 → 206 → 207 → 208.
    // Each call gives the next witness the caller doesn't yet own.
    // Repeatable up to 4 times per address.

    function craftOneCoinWitness() external payable nonReentrant whenNotPaused {
        require(msg.value == CRAFT_PRICE, "Send exactly 0.00042 ETH");
        require(balanceOf(msg.sender, 13) >= 1, "Missing OneCoin tombstone (#13)");
        require(balanceOf(msg.sender, 14) >= 1, "Missing One Exchange tombstone (#14)");
        require(balanceOf(msg.sender, 15) >= 1, "Missing OneLife tombstone (#15)");

        uint256 witId;
        if      (balanceOf(msg.sender, DILKINSKA)  == 0) witId = DILKINSKA;
        else if (balanceOf(msg.sender, GREENWOOD)   == 0) witId = GREENWOOD;
        else if (balanceOf(msg.sender, IGNATOV)     == 0) witId = IGNATOV;
        else if (balanceOf(msg.sender, MARK_SCOTT)  == 0) witId = MARK_SCOTT;
        else revert("Already have all OneCoin witnesses");

        _burn(msg.sender, 13, 1);
        _burn(msg.sender, 14, 1);
        _burn(msg.sender, 15, 1);
        _mint(msg.sender, witId, 1, "");
        emit OneCoinWitnessCrafted(msg.sender, witId);
        _forwardETH();
    }

    // ─── Public: OneCoin Stage 2 — Burn all 4 witnesses → Ruja Ignatova ──────

    function craftRuja() external payable nonReentrant whenNotPaused {
        require(msg.value == CRAFT_PRICE, "Send exactly 0.00042 ETH");
        require(balanceOf(msg.sender, DILKINSKA)  >= 1, "Missing Irina Dilkinska (#205)");
        require(balanceOf(msg.sender, GREENWOOD)  >= 1, "Missing Karl Greenwood (#206)");
        require(balanceOf(msg.sender, IGNATOV)    >= 1, "Missing Konstantin Ignatov (#207)");
        require(balanceOf(msg.sender, MARK_SCOTT) >= 1, "Missing Mark Scott (#208)");
        require(!legendaryCrafted[msg.sender][105], "Already crafted by you");

        _burn(msg.sender, DILKINSKA,  1);
        _burn(msg.sender, GREENWOOD,  1);
        _burn(msg.sender, IGNATOV,    1);
        _burn(msg.sender, MARK_SCOTT, 1);
        legendaryCrafted[msg.sender][105] = true;
        _mint(msg.sender, 105, 1, "");
        emit RujaCrafted(msg.sender);
        _forwardETH();
    }

    // ─── Public: Forgotten Keys — 1:1 exchanges ──────────────────────────────

    function craftHowells() external payable nonReentrant whenNotPaused {
        require(msg.value == CRAFT_PRICE, "Send exactly 0.00042 ETH");
        require(balanceOf(msg.sender, 22) >= 1, "Missing Howells Hard Drive (#22)");
        require(!legendaryCrafted[msg.sender][111], "Already crafted by you");

        _burn(msg.sender, 22, 1);
        legendaryCrafted[msg.sender][111] = true;
        _mint(msg.sender, 111, 1, "");
        emit HowellsCrafted(msg.sender);
        _forwardETH();
    }

    function craftThomas() external payable nonReentrant whenNotPaused {
        require(msg.value == CRAFT_PRICE, "Send exactly 0.00042 ETH");
        require(balanceOf(msg.sender, 23) >= 1, "Missing Stefan Thomas IronKey (#23)");
        require(!legendaryCrafted[msg.sender][112], "Already crafted by you");

        _burn(msg.sender, 23, 1);
        legendaryCrafted[msg.sender][112] = true;
        _mint(msg.sender, 112, 1, "");
        emit ThomasCrafted(msg.sender);
        _forwardETH();
    }

    function craftSatoshi() external payable nonReentrant whenNotPaused {
        require(msg.value == CRAFT_PRICE, "Send exactly 0.00042 ETH");
        require(balanceOf(msg.sender, 24) >= 1, "Missing Satoshi Ghost Million (#24)");
        require(!legendaryCrafted[msg.sender][113], "Already crafted by you");

        _burn(msg.sender, 24, 1);
        legendaryCrafted[msg.sender][113] = true;
        _mint(msg.sender, 113, 1, "");
        emit SatoshiCrafted(msg.sender);
        _forwardETH();
    }

    function craftCotten() external payable nonReentrant whenNotPaused {
        require(msg.value == CRAFT_PRICE, "Send exactly 0.00042 ETH");
        require(balanceOf(msg.sender, 25) >= 1, "Missing QuadrigaCX (#25)");
        require(!legendaryCrafted[msg.sender][114], "Already crafted by you");

        _burn(msg.sender, 25, 1);
        legendaryCrafted[msg.sender][114] = true;
        _mint(msg.sender, 114, 1, "");
        emit CottenCrafted(msg.sender);
        _forwardETH();
    }

    // ─── Public: Lazarus Group — Burn all 7 incidents → Lazarus Epic ─────────

    function craftLazarus() external payable nonReentrant whenNotPaused {
        require(msg.value == CRAFT_PRICE, "Send exactly 0.00042 ETH");
        require(balanceOf(msg.sender, 26) >= 1, "Missing Coincheck (#26)");
        require(balanceOf(msg.sender, 27) >= 1, "Missing Ronin Network (#27)");
        require(balanceOf(msg.sender, 28) >= 1, "Missing Atomic Wallet (#28)");
        require(balanceOf(msg.sender, 29) >= 1, "Missing DMM Bitcoin (#29)");
        require(balanceOf(msg.sender, 30) >= 1, "Missing Bybit (#30)");
        require(balanceOf(msg.sender, 31) >= 1, "Missing Drift Protocol (#31)");
        require(balanceOf(msg.sender, 32) >= 1, "Missing Kelp DAO (#32)");
        require(!legendaryCrafted[msg.sender][110], "Already crafted by you");

        for (uint256 i = 26; i <= 32; i++) {
            _burn(msg.sender, i, 1);
        }
        legendaryCrafted[msg.sender][110] = true;
        _mint(msg.sender, 110, 1, "");
        emit LazarusCrafted(msg.sender);
        _forwardETH();
    }

    // ─── Public: Bitcoin Pizza Day ────────────────────────────────────────────

    function mintPizzaDay() external payable nonReentrant whenNotPaused {
        require(mintEnabled[33], "Not available yet");
        require(msg.value == MINT_PRICE, "Send exactly 0.00042 ETH");
        _mint(msg.sender, 33, 1, "");
        emit TombstoneMinted(msg.sender, 33);
        _forwardETH();
    }

    function craftPizzaDay() external payable nonReentrant whenNotPaused {
        require(msg.value == CRAFT_PRICE, "Send exactly 0.00042 ETH");
        require(balanceOf(msg.sender, 33) >= 5, "Need 5 Pizza Day NFTs");
        require(!legendaryCrafted[msg.sender][115], "Already crafted by you");

        // Must own all 5 epic NFTs — they are NOT burned, just required
        require(balanceOf(msg.sender, 101) >= 1, "Missing SBF (#101)");
        require(balanceOf(msg.sender, 105) >= 1, "Missing Ruja (#105)");
        require(balanceOf(msg.sender, 108) >= 1, "Missing Vinnik (#108)");
        require(balanceOf(msg.sender, 109) >= 1, "Missing Kumbhani (#109)");
        require(balanceOf(msg.sender, 110) >= 1, "Missing Lazarus (#110)");

        _burn(msg.sender, 33, 5);
        legendaryCrafted[msg.sender][115] = true;
        _mint(msg.sender, 115, 1, "");
        emit PizzaDayCrafted(msg.sender);
        _forwardETH();
    }

    // ─── Internal: ETH forwarding ─────────────────────────────────────────────

    // Tries to push ETH to treasury immediately. If treasury rejects (e.g. contract
    // with a broken receive()), ETH stays in this contract and ETHRetained is emitted.
    // Owner can recover via withdraw() at any time.
    function _forwardETH() private {
        (bool ok, ) = treasury.call{value: msg.value}("");
        if (!ok) emit ETHRetained(msg.value);
    }

    // ─── Owner: Admin ─────────────────────────────────────────────────────────

    /**
     * @notice Send all accumulated ETH to treasury (fallback for failed forwards).
     * @dev Anyone can call — ETH always goes to treasury, no theft possible.
     */
    function withdraw() external {
        uint256 bal = address(this).balance;
        require(bal > 0, "Nothing to withdraw");
        (bool ok, ) = treasury.call{value: bal}("");
        require(ok, "Withdraw failed");
        emit Withdrawn(treasury, bal);
    }

    /**
     * @notice Update the treasury address.
     * @dev Two-step ownership (Ownable2Step) protects against typos on owner transfers.
     */
    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Zero address");
        emit TreasuryUpdated(treasury, newTreasury);
        treasury = newTreasury;
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    /**
     * @notice Update the base metadata URI.
     * @dev Permanently blocked once lockMetadata() is called.
     */
    function setBaseURI(string calldata newUri) external onlyOwner {
        require(!metadataLocked, "Metadata is permanently locked");
        require(bytes(newUri).length > 0, "URI cannot be empty");
        _baseURI = newUri;
        emit BaseURIUpdated(newUri);
    }

    /**
     * @notice Permanently freeze the metadata URI. Irreversible.
     * @dev Call this once IPFS/Arweave URIs are final.
     */
    function lockMetadata() external onlyOwner {
        require(!metadataLocked, "Already locked");
        metadataLocked = true;
        emit MetadataLocked();
    }

    /**
     * @notice Enable or disable minting for tombstones (1–32) and Pizza Day event (33).
     */
    function setMintEnabled(uint256[] calldata tokenIds, bool enabled) external onlyOwner {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(
                (tokenIds[i] >= 1 && tokenIds[i] <= TOMBSTONE_COUNT) || tokenIds[i] == 33,
                "Invalid token ID"
            );
            mintEnabled[tokenIds[i]] = enabled;
        }
        emit MintToggled(tokenIds, enabled);
    }

    /**
     * @notice Renouncing ownership is permanently disabled to protect users and admin functions.
     */
    function renounceOwnership() public view override onlyOwner {
        revert("Renounce disabled");
    }

    // ─── Metadata ─────────────────────────────────────────────────────────────

    function name() public pure returns (string memory) { return "Crypto Cemetery"; }
    function symbol() public pure returns (string memory) { return "CRYPT"; }

    function contractURI() public view returns (string memory) {
        return string(abi.encodePacked(_baseURI, "collection.json"));
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        return string(abi.encodePacked(_baseURI, Strings.toString(tokenId), ".json"));
    }

    /// @notice EIP-2981 royalty info — 5% to treasury on every secondary sale.
    function royaltyInfo(uint256 /*tokenId*/, uint256 salePrice)
        external view override
        returns (address receiver, uint256 royaltyAmount)
    {
        return (treasury, (salePrice * ROYALTY_BPS) / 10_000);
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC1155, IERC165)
        returns (bool)
    {
        return interfaceId == type(IERC2981).interfaceId || super.supportsInterface(interfaceId);
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
