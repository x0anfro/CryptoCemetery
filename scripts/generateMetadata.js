const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "..", "metadata");

// IDs with real art ready — остальные получат заглушку
const REVEALED_IDS = new Set([1, 2, 3]);

// Индивидуальные CID для каждого токена (загружены на Pinata)
const IMAGE_CIDS = {
  1:           "bafybeicrcw6hq4y4v2c4r6yejve6wanlcijza6zfg4h4hphbpplq76qvfi", // FTX Exchange
  2:           "bafybeicphyfhxiw3ndx7b3ycpbeimyrp2hk3igiut3gtkc3l7fzrvmpmwa", // Alameda Research
  3:           "bafybeica5xxed3wgg6gfm3rdhxqa2yfk7ftrmzeb7etyghkgqjjs3turei", // BlockFi
  placeholder: "bafybeicezg2dudclqyh22z2oeq6mesq3oyuedljmx5fpfc4uvpm7jcqt6i", // Coming Soon
};

// ─── Tombstone data (IDs 1–21) ────────────────────────────────────────────────

const TOMBSTONES = [
  // ── Group 1: FTX → Sam Bankman-Fried (legendary 101) ──────────────────────
  {
    id: 1,
    name: "FTX Exchange",
    born: 2019,
    died: 2022,
    cause_of_death: "Mismanagement",
    epitaph: "Customer funds? Never heard of her.",
    amount_lost: "$8,000,000,000",
    group: "FTX",
    villain: "Sam Bankman-Fried",
  },
  {
    id: 2,
    name: "Alameda Research",
    born: 2017,
    died: 2022,
    cause_of_death: "Mismanagement",
    epitaph: "The hedge fund that hedged with your money.",
    amount_lost: "$10,000,000,000",
    group: "FTX",
    villain: "Sam Bankman-Fried",
  },
  {
    id: 3,
    name: "BlockFi",
    born: 2017,
    died: 2022,
    cause_of_death: "Mismanagement",
    epitaph: "Collateral damage has never been so expensive.",
    amount_lost: "$1,200,000,000",
    group: "FTX",
    villain: "Sam Bankman-Fried",
  },

  // ── Group 2: Terra/LUNA → Do Kwon (legendary 102) ─────────────────────────
  {
    id: 4,
    name: "Terra / LUNA",
    born: 2018,
    died: 2022,
    cause_of_death: "Ponzi",
    epitaph: "1 LUNA = 1 LUNA. Eventually.",
    amount_lost: "$45,000,000,000",
    group: "Terra",
    villain: "Do Kwon",
  },
  {
    id: 5,
    name: "Anchor Protocol",
    born: 2021,
    died: 2022,
    cause_of_death: "Ponzi",
    epitaph: "20% APY. Sustainable. Trust me.",
    amount_lost: "$17,000,000,000",
    group: "Terra",
    villain: "Do Kwon",
  },
  {
    id: 6,
    name: "TerraUSD (UST)",
    born: 2020,
    died: 2022,
    cause_of_death: "Ponzi",
    epitaph: "Algorithmic stablecoin. Emphasis on 'was'.",
    amount_lost: "$18,000,000,000",
    group: "Terra",
    villain: "Do Kwon",
  },

  // ── Group 3: Mt. Gox → Mark Karpeles (legendary 103) ──────────────────────
  {
    id: 7,
    name: "Mt. Gox",
    born: 2010,
    died: 2014,
    cause_of_death: "Hack",
    epitaph: "First to rise. First to fall. Still in court.",
    amount_lost: "$473,000,000",
    group: "Mt. Gox",
    villain: "Mark Karpeles",
  },
  {
    id: 8,
    name: "Bitcoinica",
    born: 2011,
    died: 2012,
    cause_of_death: "Hack",
    epitaph: "Hacked twice. Kept going. Hacked again.",
    amount_lost: "$300,000",
    group: "Mt. Gox",
    villain: "Mark Karpeles",
  },
  {
    id: 9,
    name: "BTC-e",
    born: 2011,
    died: 2017,
    cause_of_death: "Hack",
    epitaph: "Where crime paid — until the FBI showed up.",
    amount_lost: "$4,000,000,000",
    group: "Mt. Gox",
    villain: "Mark Karpeles",
  },

  // ── Group 4: BitConnect → Carlos Matos (legendary 104) ────────────────────
  {
    id: 10,
    name: "BitConnect",
    born: 2016,
    died: 2018,
    cause_of_death: "Ponzi",
    epitaph: "WHATS UP BITCONNEEEEECT.",
    amount_lost: "$2,400,000,000",
    group: "BitConnect",
    villain: "Carlos Matos",
  },
  {
    id: 11,
    name: "BitConnect X",
    born: 2018,
    died: 2018,
    cause_of_death: "Rug Pull",
    epitaph: "The sequel nobody asked for, exited even faster.",
    amount_lost: "$45,000,000",
    group: "BitConnect",
    villain: "Carlos Matos",
  },
  {
    id: 12,
    name: "BCC Token",
    born: 2016,
    died: 2018,
    cause_of_death: "Ponzi",
    epitaph: "From $400 to $0. Volatility works both ways.",
    amount_lost: "$2,000,000,000",
    group: "BitConnect",
    villain: "Carlos Matos",
  },

  // ── Group 5: OneCoin → Ruja Ignatova (legendary 105) ──────────────────────
  {
    id: 13,
    name: "OneCoin",
    born: 2014,
    died: 2017,
    cause_of_death: "Ponzi",
    epitaph: "The blockchain that existed only in PowerPoint.",
    amount_lost: "$25,000,000,000",
    group: "OneCoin",
    villain: "Ruja Ignatova",
  },
  {
    id: 14,
    name: "One Exchange",
    born: 2015,
    died: 2017,
    cause_of_death: "Ponzi",
    epitaph: "An exchange where only the exit was real.",
    amount_lost: "$1,000,000,000",
    group: "OneCoin",
    villain: "Ruja Ignatova",
  },
  {
    id: 15,
    name: "OneLife Network",
    born: 2015,
    died: 2017,
    cause_of_death: "Ponzi",
    epitaph: "MLM for the blockchain age. RIP.",
    amount_lost: "$500,000,000",
    group: "OneCoin",
    villain: "Ruja Ignatova",
  },

  // ── Group 6: Celsius → Alex Mashinsky (legendary 106) ─────────────────────
  {
    id: 16,
    name: "Celsius Network",
    born: 2017,
    died: 2022,
    cause_of_death: "Mismanagement",
    epitaph: "Unbank yourself. Then lose everything.",
    amount_lost: "$4,700,000,000",
    group: "Celsius",
    villain: "Alex Mashinsky",
  },
  {
    id: 17,
    name: "Voyager Digital",
    born: 2018,
    died: 2022,
    cause_of_death: "Mismanagement",
    epitaph: "Voyaged straight into bankruptcy.",
    amount_lost: "$1,100,000,000",
    group: "Celsius",
    villain: "Alex Mashinsky",
  },
  {
    id: 18,
    name: "Hodlnaut",
    born: 2019,
    died: 2022,
    cause_of_death: "Mismanagement",
    epitaph: "HODLed too hard. Lost it all.",
    amount_lost: "$190,000,000",
    group: "Celsius",
    villain: "Alex Mashinsky",
  },

  // ── Group 7: 3AC → Su Zhu (legendary 107) ─────────────────────────────────
  {
    id: 19,
    name: "Three Arrows Capital",
    born: 2012,
    died: 2022,
    cause_of_death: "Hubris",
    epitaph: "Supercycle believers. Supercycle victims.",
    amount_lost: "$3,500,000,000",
    group: "3AC",
    villain: "Su Zhu",
  },
  {
    id: 20,
    name: "Starry Night Capital",
    born: 2021,
    died: 2022,
    cause_of_death: "Hubris",
    epitaph: "$100M NFT fund. Stars aligned — for liquidation.",
    amount_lost: "$100,000,000",
    group: "3AC",
    villain: "Su Zhu",
  },
  {
    id: 21,
    name: "GBTC Trade",
    born: 2020,
    died: 2022,
    cause_of_death: "Hubris",
    epitaph: "The discount that discounted their existence.",
    amount_lost: "$1,200,000,000",
    group: "3AC",
    villain: "Su Zhu",
  },
];

// ─── Legendary data (IDs 101–107) ─────────────────────────────────────────────

const LEGENDARIES = [
  {
    id: 101,
    name: "Sam Bankman-Fried",
    alias: "SBF",
    born: 1992,
    crime: "Fraud & Mismanagement",
    sentence: "25 years",
    total_damage: "$32,000,000,000",
    victims: "1,000,000+",
    quote: "I didn't knowingly commit fraud. I think.",
    status: "Convicted",
    group: "FTX",
  },
  {
    id: 102,
    name: "Do Kwon",
    alias: "Lunatic",
    born: 1991,
    crime: "Fraud & Securities Violations",
    sentence: "Pending",
    total_damage: "$45,000,000,000",
    victims: "500,000+",
    quote: "I don't debate poor people.",
    status: "Arrested in Montenegro",
    group: "Terra",
  },
  {
    id: 103,
    name: "Mark Karpeles",
    alias: "MagicalTux",
    born: 1985,
    crime: "Embezzlement & Data Manipulation",
    sentence: "2.5 years suspended",
    total_damage: "$473,000,000",
    victims: "850,000",
    quote: "I was busy coding.",
    status: "Convicted (Japan)",
    group: "Mt. Gox",
  },
  {
    id: 104,
    name: "Carlos Matos",
    alias: "BitConnect Guy",
    born: 1970,
    crime: "Promoting Securities Fraud",
    sentence: "Not yet sentenced",
    total_damage: "$2,400,000,000",
    victims: "300,000+",
    quote: "WHATS UP BITCONNEEEEECT.",
    status: "Charged",
    group: "BitConnect",
  },
  {
    id: 105,
    name: "Ruja Ignatova",
    alias: "Cryptoqueen",
    born: 1980,
    crime: "Wire Fraud & Money Laundering",
    sentence: "Fugitive (FBI Top 10)",
    total_damage: "$25,000,000,000",
    victims: "3,000,000+",
    quote: "OneCoin will replace Bitcoin.",
    status: "At Large",
    group: "OneCoin",
  },
  {
    id: 106,
    name: "Alex Mashinsky",
    alias: "The Unbanker",
    born: 1965,
    crime: "Fraud & Market Manipulation",
    sentence: "Pending trial",
    total_damage: "$4,700,000,000",
    victims: "600,000+",
    quote: "Banks are not your friends. I am.",
    status: "Charged",
    group: "Celsius",
  },
  {
    id: 107,
    name: "Su Zhu",
    alias: "Supercycle Su",
    born: 1987,
    crime: "Contempt of Court & Fraud",
    sentence: "4 months (Singapore)",
    total_damage: "$3,500,000,000",
    victims: "100,000+",
    quote: "We are in a supercycle.",
    status: "Convicted",
    group: "3AC",
  },
];

// ─── Builders ─────────────────────────────────────────────────────────────────

function buildTombstone(t) {
  const revealed = REVEALED_IDS.has(t.id);
  return {
    name: revealed ? `${t.name} ✝` : `??? ✝ — Coming Soon`,
    description: revealed
      ? `A tombstone commemorating the death of ${t.name}. Born: ${t.born}. Died: ${t.died}. Part of the ${t.group} trifecta — collect all 3 to craft the Legendary villain card.`
      : `This tombstone has not been revealed yet. A new wave is coming to Crypto Cemetery.`,
    image: revealed
      ? `ipfs://${IMAGE_CIDS[t.id]}`
      : `ipfs://${IMAGE_CIDS.placeholder}`,
    external_url: `https://crypto-cemetery.xyz/tombstone/${t.id}`,
    attributes: revealed
      ? [
          { trait_type: "Type",           value: "Tombstone" },
          { trait_type: "Rarity",         value: "Common" },
          { trait_type: "Born",           value: String(t.born) },
          { trait_type: "Died",           value: String(t.died) },
          { trait_type: "Cause of Death", value: t.cause_of_death },
          { trait_type: "Amount Lost",    value: t.amount_lost },
          { trait_type: "Villain Group",  value: t.group },
          { trait_type: "Villain",        value: t.villain },
          { trait_type: "Epitaph",        value: t.epitaph },
        ]
      : [
          { trait_type: "Type",   value: "Tombstone" },
          { trait_type: "Rarity", value: "Common" },
          { trait_type: "Status", value: "Unrevealed" },
        ],
  };
}

function buildLegendary(l) {
  return {
    name: `${l.name} — The ${l.group} Villain`,
    description: `LEGENDARY. ${l.name} (aka "${l.alias}") — the mastermind behind the ${l.group} collapse. Obtain only by burning the ${l.group} tombstone trifecta. One exists. Ever.`,
    image: `ipfs://${IMAGE_CIDS.placeholder}`,
    external_url: `https://crypto-cemetery.xyz/legendary/${l.id}`,
    attributes: [
      { trait_type: "Type",         value: "Legendary Villain" },
      { trait_type: "Rarity",       value: "Legendary" },
      { trait_type: "Alias",        value: l.alias },
      { trait_type: "Crime",        value: l.crime },
      { trait_type: "Sentence",     value: l.sentence },
      { trait_type: "Status",       value: l.status },
      { trait_type: "Total Damage", value: l.total_damage },
      { trait_type: "Victims",      value: l.victims },
      { trait_type: "Villain Group",value: l.group },
      { trait_type: "Famous Quote", value: l.quote },
    ],
  };
}

// ─── Generate ─────────────────────────────────────────────────────────────────

function generate() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  let count = 0;

  for (const t of TOMBSTONES) {
    const json = buildTombstone(t);
    fs.writeFileSync(
      path.join(OUT_DIR, `${t.id}.json`),
      JSON.stringify(json, null, 2)
    );
    console.log(`✓ ${t.id}.json — ${t.name}`);
    count++;
  }

  for (const l of LEGENDARIES) {
    const json = buildLegendary(l);
    fs.writeFileSync(
      path.join(OUT_DIR, `${l.id}.json`),
      JSON.stringify(json, null, 2)
    );
    console.log(`★ ${l.id}.json — ${l.name} [LEGENDARY]`);
    count++;
  }

  console.log(`\nGenerated ${count} metadata files → ${OUT_DIR}`);
  console.log("\nNext steps:");
  console.log("  1. Add your artwork to metadata/images/");
  console.log("  2. Upload the metadata/ folder to IPFS (Pinata or NFT.Storage)");
  console.log("  3. Replace IMAGES_CID in this file with your images CID");
  console.log("  4. Re-run: npm run metadata");
  console.log("  5. Copy the new metadata CID to .env as BASE_URI=ipfs://<CID>/");
}

generate();
