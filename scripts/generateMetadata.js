const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "..", "metadata");

// Rarity tiers — marketplaces (Element, OpenSea, etc.) color-code these:
// Common   → grey
// Rare     → blue
// Legendary → purple
// Epic     → orange
const RARITY = {
  COMMON:    "Common",
  RARE:      "Rare",
  LEGENDARY: "Legendary",
  EPIC:      "Epic",
};

const IMAGE_CID = process.argv[2];
if (!IMAGE_CID) {
  console.error("Usage: node scripts/generateMetadata.js <IMAGE_FOLDER_CID>");
  process.exit(1);
}

function img(id) {
  return `ipfs://${IMAGE_CID}/${id}.jpg`;
}

// ─── Tombstones 1–32 ──────────────────────────────────────────────────────────

const TOMBSTONES = [
  { id: 1,  name: "FTX Exchange",              born: 2019, died: 2022, cause: "Mismanagement", lost: "$8,000,000,000",    group: "FTX",            epitaph: "Customer funds? Never heard of her." },
  { id: 2,  name: "Alameda Research",          born: 2017, died: 2022, cause: "Mismanagement", lost: "$10,000,000,000",   group: "FTX",            epitaph: "The hedge fund that hedged with your money." },
  { id: 3,  name: "BlockFi",                   born: 2017, died: 2022, cause: "Mismanagement", lost: "$1,200,000,000",    group: "FTX",            epitaph: "Collateral damage has never been so expensive." },
  { id: 4,  name: "Terra / LUNA",              born: 2018, died: 2022, cause: "Ponzi",         lost: "$30,000,000,000",   group: "Terra",          epitaph: "1 LUNA = 1 LUNA. Eventually." },
  { id: 5,  name: "Anchor Protocol",           born: 2021, died: 2022, cause: "Ponzi",         lost: "$14,000,000,000",   group: "Terra",          epitaph: "20% APY. Sustainable. Trust me." },
  { id: 6,  name: "TerraUSD (UST)",            born: 2020, died: 2022, cause: "Ponzi",         lost: "$18,000,000,000",   group: "Terra",          epitaph: "Algorithmic stablecoin. Emphasis on 'was'." },
  { id: 7,  name: "Mt. Gox",                   born: 2010, died: 2014, cause: "Hack",          lost: "$473,000,000",      group: "Mt. Gox",        epitaph: "First to rise. First to fall. Still in court." },
  { id: 8,  name: "Bitcoinica",                born: 2011, died: 2012, cause: "Hack",          lost: "$300,000",          group: "Mt. Gox",        epitaph: "Hacked twice. Kept going. Hacked again." },
  { id: 9,  name: "BTC-e",                     born: 2011, died: 2017, cause: "Hack",          lost: "$9,000,000,000",    group: "BTC-e",          epitaph: "Where crime paid — until the FBI showed up." },
  { id: 10, name: "BitConnect",                born: 2016, died: 2018, cause: "Ponzi",         lost: "$2,400,000,000",    group: "BitConnect",     epitaph: "WHATS UP BITCONNEEEEECT." },
  { id: 11, name: "BitConnect X",              born: 2018, died: 2018, cause: "Rug Pull",      lost: "$45,000,000",       group: "BitConnect",     epitaph: "The sequel nobody asked for, exited even faster." },
  { id: 12, name: "BCC Token",                 born: 2016, died: 2018, cause: "Ponzi",         lost: "$2,000,000,000",    group: "BitConnect",     epitaph: "From $400 to $0. Volatility works both ways." },
  { id: 13, name: "OneCoin",                   born: 2014, died: 2017, cause: "Ponzi",         lost: "$18,000,000,000",   group: "OneCoin",        epitaph: "The blockchain that existed only in PowerPoint." },
  { id: 14, name: "One Exchange",              born: 2015, died: 2017, cause: "Ponzi",         lost: "",                  group: "OneCoin",        epitaph: "An exchange where only the exit was real." },
  { id: 15, name: "OneLife Network",           born: 2015, died: 2017, cause: "Ponzi",         lost: "",                  group: "OneCoin",        epitaph: "MLM for the blockchain age. RIP." },
  { id: 16, name: "Celsius Network",           born: 2017, died: 2022, cause: "Mismanagement", lost: "$4,700,000,000",    group: "Celsius",        epitaph: "Unbank yourself. Then lose everything." },
  { id: 17, name: "Voyager Digital",           born: 2018, died: 2022, cause: "Mismanagement", lost: "$1,100,000,000",    group: "3AC",            epitaph: "Voyaged straight into bankruptcy." },
  { id: 18, name: "Hodlnaut",                  born: 2019, died: 2022, cause: "Mismanagement", lost: "$190,000,000",      group: "Terra",          epitaph: "HODLed too hard. Lost it all." },
  { id: 19, name: "Three Arrows Capital",      born: 2012, died: 2022, cause: "Hubris",        lost: "$3,500,000,000",    group: "3AC",            epitaph: "Supercycle believers. Supercycle victims." },
  { id: 20, name: "Starry Night Capital",      born: 2021, died: 2022, cause: "Hubris",        lost: "$100,000,000",      group: "3AC",            epitaph: "$100M NFT fund. Stars aligned — for liquidation." },
  { id: 21, name: "GBTC Trade",                born: 2020, died: 2022, cause: "Hubris",        lost: "$1,200,000,000",    group: "3AC",            epitaph: "The discount that discounted their existence." },
  { id: 22, name: "James Howells' Hard Drive", born: 2009, died: 2013, cause: "Lost", lost: "$800,000,000", group: "Forgotten Keys", epitaph: "8,000 BTC. One wrong bin bag. Twelve years of council meetings.",
    description: "James Howells is a British IT engineer from Newport who became world-famous as the man who accidentally threw away a hard drive containing 8,000 Bitcoin. During a house cleanup, he put the hard drive in a trash bag which his partner later took to the local landfill. For over 12 years he petitioned Newport City Council for permission to excavate the site, offering up to 25% of any recovered funds. The council consistently refused, citing environmental risks and waste disposal regulations. In early 2025, a court definitively ruled that Howells had no legal right to retrieve the drive." },
  { id: 23, name: "Stefan Thomas's IronKey",   born: 2011, died: 2011, cause: "Lost", lost: "$700,000,000", group: "Forgotten Keys", epitaph: "7,002 BTC. Eight attempts down. Two tries left. No room for error.",
    description: "Stefan Thomas's story remains one of the most famous dramas in crypto. As of 2026, nothing has fundamentally changed: he still has two attempts remaining out of ten before the IronKey permanently destroys its data. The device holds the keys to 7,002 BTC, received in 2011 as payment for the educational video 'What is Bitcoin?'. Thomas wrote the password on a piece of paper and later lost it. After eight failed attempts he stopped — unwilling to risk everything. In 2023–2025, cybersecurity firm Unciphered claimed to have found a way to crack the same IronKey model. Thomas declined their offer, citing legal complications, privacy concerns, and an unwillingness to take the risk." },
  { id: 24, name: "Satoshi's Ghost Million",   born: 2009, died: 2011, cause: "Lost", lost: "$109,000,000,000", group: "Forgotten Keys", epitaph: "Mined it. Vanished. Left $100 billion untouched.",
    description: "The 'Ghost Million' is the informal name for Satoshi Nakamoto's fortune — approximately 1.1 million BTC mined between 2009 and 2010, virtually untouched ever since. According to Arkham Intelligence, Satoshi controls ~1,096,354 BTC distributed across more than 21,900 addresses identified by the Patoshi Pattern mining fingerprint. This places Satoshi among the world's wealthiest individuals, holding about 5.5% of Bitcoin's total supply. Any movement on a Satoshi-era address causes an immediate global market reaction. No one knows if the private keys still exist." },
  { id: 25, name: "QuadrigaCX",                born: 2013, died: 2019, cause: "Lost", lost: "$250,000,000", group: "Forgotten Keys", epitaph: "Dead men tell no passwords.",
    description: "Gerald Cotten was the founder of Canada's largest crypto exchange QuadrigaCX. His sudden death in India in December 2018 — aged 30 — led to the loss of $190–250 million in client funds, the subject of Netflix documentary 'Trust No One: The Hunt for the Crypto King' (2022). Only Cotten knew the passwords to the cold wallets; his widow said she could not access his encrypted laptop. The Ontario Securities Commission concluded QuadrigaCX was a Ponzi scheme: Cotten opened fake accounts, traded nonexistent assets, and spent client funds on personal expenses. Ernst & Young auditors found most wallets were already empty long before his death. Many suspected Cotten faked his death — Canadian authorities found insufficient grounds for exhumation." },
  { id: 26, name: "Coincheck",                 born: 2014, died: 2018, cause: "Hack",          lost: "$534,000,000",      group: "Lazarus",        epitaph: "500 million NEM. No multisig. No mercy." },
  { id: 27, name: "Ronin Network",             born: 2021, died: 2022, cause: "Hack",          lost: "$625,000,000",      group: "Lazarus",        epitaph: "5 of 9 validators. One fake job offer. $625 million gone." },
  { id: 28, name: "Atomic Wallet & CoinEx",    born: 2017, died: 2023, cause: "Hack",          lost: "$170,000,000",      group: "Lazarus",        epitaph: "Two platforms. One summer. $170 million drained." },
  { id: 29, name: "DMM Bitcoin",               born: 2018, died: 2024, cause: "Hack",          lost: "$308,000,000",      group: "Lazarus",        epitaph: "4,502 BTC. One social engineering call. One exchange closed forever." },
  { id: 30, name: "Bybit",                     born: 2018, died: 2025, cause: "Hack",          lost: "$1,500,000,000",    group: "Lazarus",        epitaph: "The largest crypto theft in history. A cold wallet. February 2025." },
  { id: 31, name: "Drift Protocol",            born: 2021, died: 2026, cause: "Hack",          lost: "$285,000,000",      group: "Lazarus",        epitaph: "Months of preparation. April Fools' Day. $285 million." },
  { id: 32, name: "Kelp DAO",                  born: 2023, died: 2026, cause: "Hack",          lost: "$292,000,000",      group: "Lazarus",        epitaph: "They didn't break the bridge. They printed fake tokens instead." },
];

// ─── Legendaries & Epics 101–115 ──────────────────────────────────────────────

const LEGENDARIES = [
  { id: 101, name: "Sam Bankman-Fried", alias: "SBF",              rarity: RARITY.EPIC,      group: "FTX",            crime: "Fraud & Mismanagement",          sentence: "25 years",          status: "Convicted",                  damage: "$32,000,000,000", victims: "1,000,000+",  quote: "I didn't knowingly commit fraud. I think." },
  { id: 102, name: "Do Kwon",           alias: "Lunatic",           rarity: RARITY.LEGENDARY, group: "Terra",          crime: "Fraud & Securities Violations",  sentence: "Pending",           status: "Arrested",                   damage: "$45,000,000,000", victims: "500,000+",    quote: "I don't debate poor people." },
  { id: 103, name: "Mark Karpeles",     alias: "MagicalTux",        rarity: RARITY.LEGENDARY, group: "Mt. Gox",        crime: "Embezzlement",                   sentence: "2.5 yrs suspended", status: "Convicted (Japan)",          damage: "$473,000,000",    victims: "850,000",     quote: "I was busy coding." },
  { id: 104, name: "Carlos Matos",      alias: "BitConnect Guy",    rarity: RARITY.LEGENDARY, group: "BitConnect",     crime: "Promoting Securities Fraud",     sentence: "Not yet sentenced", status: "Charged",                    damage: "$2,400,000,000",  victims: "300,000+",    quote: "WHATS UP BITCONNEEEEECT." },
  { id: 105, name: "Ruja Ignatova",     alias: "Cryptoqueen",       rarity: RARITY.EPIC,      group: "OneCoin",        crime: "Wire Fraud & Money Laundering",  sentence: "FBI Top 10",        status: "At Large",                   damage: "$25,000,000,000", victims: "3,000,000+",  quote: "OneCoin will replace Bitcoin." },
  { id: 106, name: "Alex Mashinsky",    alias: "The Unbanker",      rarity: RARITY.LEGENDARY, group: "Celsius",        crime: "Fraud & Market Manipulation",    sentence: "Pending trial",     status: "Charged",                    damage: "$4,700,000,000",  victims: "600,000+",    quote: "Banks are not your friends. I am." },
  { id: 107, name: "Su Zhu",            alias: "Supercycle Su",     rarity: RARITY.LEGENDARY, group: "3AC",            crime: "Contempt of Court & Fraud",      sentence: "4 months",          status: "Convicted (Singapore)",      damage: "$3,500,000,000",  victims: "100,000+",    quote: "We are in a supercycle." },
  { id: 108, name: "Alexander Vinnik",  alias: "BTC-e Baron",       rarity: RARITY.EPIC,      group: "BTC-e",          crime: "Money Laundering",               sentence: "5 years (France)",  status: "Convicted",                  damage: "$4,000,000,000",  victims: "Mt. Gox creditors", quote: "I had no idea what my clients were doing." },
  { id: 109, name: "Satish Kumbhani",   alias: "BitConnect Boss",   rarity: RARITY.EPIC,      group: "BitConnect",     crime: "Securities & Commodities Fraud", sentence: "Fugitive",          status: "At Large",                   damage: "$2,400,000,000",  victims: "300,000+",    quote: "BitConnect is the future." },
  { id: 110, name: "Lazarus Group",     alias: "Labyrinth Chollima",rarity: RARITY.EPIC,      group: "Lazarus",        crime: "State-Sponsored Cybercrime",     sentence: "Above the Law",     status: "Untouchable",                damage: "$3,500,000,000+", victims: "Millions",    quote: "We are not criminals. We are the state." },
  { id: 111, name: "James Howells",     alias: "The Landfill Man",  rarity: RARITY.LEGENDARY, group: "Forgotten Keys", crime: "Lost Access", sentence: "Self-inflicted", status: "Search Abandoned", damage: "$800,000,000", victims: "Himself", quote: "It's in there somewhere. I know it.",
    fate: "In August 2025, Howells announced he was ending his twelve-year effort to physically recover the drive. The Bitcoin — buried under tonnes of waste at Newport landfill — will most likely stay there forever." },
  { id: 112, name: "Stefan Thomas",     alias: "Two Tries Left",    rarity: RARITY.LEGENDARY, group: "Forgotten Keys", crime: "Lost Access", sentence: "Self-inflicted", status: "Waiting", damage: "$700,000,000", victims: "Himself", quote: "I have two tries left. I'm not going to waste them.",
    fate: "Stefan placed the drive in a secret, secure location — reportedly a Swiss vault — and is waiting for more reliable decryption methods to emerge. Quantum computing remains his last theoretical hope." },
  { id: 113, name: "Satoshi Nakamoto",  alias: "The Ghost",         rarity: RARITY.LEGENDARY, group: "Forgotten Keys", crime: "Voluntary Disappearance", sentence: "Unknown", status: "Unknown", damage: "$109,000,000,000", victims: "None — or everyone", quote: "I've moved on to other things.",
    fate: "To this day, there is no conclusive proof of who hides behind the pseudonym. In 2025–2026, cryptographer Adam Back (New York Times investigation) and Peter Todd (HBO documentary) were named as suspects — both deny involvement. That Satoshi has never touched the billions reinforces the belief in the project's ideological purity — or simply means the keys are long gone." },
  { id: 114, name: "Gerald Cotten",    alias: "Dead Man's Password", rarity: RARITY.LEGENDARY, group: "Forgotten Keys", crime: "Fraud & Embezzlement", sentence: "Deceased (officially)", status: "Unknown", damage: "$250,000,000", victims: "76,000+", quote: "I'm the only one who knows the password.",
    fate: "Cotten died in India in December 2018, aged 30 — supposedly from Crohn's disease. He took the passwords to QuadrigaCX's cold wallets with him. Investigations later revealed the exchange was a Ponzi scheme: Cotten had created fake accounts, traded nonexistent assets, and spent customer funds on personal luxury. Whether Cotten is truly dead remains disputed." },
  { id: 115, name: "Laszlo Hanyecz",   alias: "Pizza Man",           rarity: RARITY.EPIC,      group: "Bitcoin Pizza Day", crime: "Spent 10,000 BTC on pizza", sentence: "None", status: "No regrets", damage: "10,000 BTC (~$1B)", victims: "Himself", quote: "Someone had to start.",
    fate: "On May 22, 2010, Laszlo Hanyecz paid 10,000 BTC for two large Papa John's pizzas — the first documented real-world Bitcoin purchase. He pioneered GPU mining and developed the first Bitcoin client for macOS. He has no regrets: for him it was an experiment that proved Bitcoin worked as money." },
];

// ─── Intermediates / Witnesses 201–208 ────────────────────────────────────────

const INTERMEDIATES = [
  { id: 201, name: "Caroline Ellison",    role: "CEO, Alameda Research",              group: "FTX",            fate: "Sentenced to 2 years (Sep 2024) for cooperating with prosecutors against SBF." },
  { id: 202, name: "Gary Wang",           role: "Co-founder & CTO, FTX",             group: "FTX",            fate: "Sentenced to time served (Nov 2024) — no prison time for extraordinary cooperation." },
  { id: 203, name: "Alexei Bilyuchenko", role: "Mt. Gox Hacker & BTC-e Co-operator", group: "Mt. Gox / BTC-e", fate: "Charged in 2023 for laundering 647,000 BTC. In Russia; extradition impossible." },
  { id: 204, name: "Glenn Arcaro",        role: "BitConnect US Promoter",             group: "BitConnect",     fate: "Convicted Sep 2021. Sentenced to 45 months. Paid $24M to victims." },
  { id: 205, name: "Irina Dilkinska",    role: "Head of Legal & Compliance, OneCoin", group: "OneCoin",        fate: "Arrested in Bulgaria 2023. Pleaded guilty to money laundering. Cooperating with US." },
  { id: 206, name: "Karl Greenwood",      role: "Co-founder, OneCoin",               group: "OneCoin",        fate: "Sentenced to 20 years in the US, ordered to pay $300M — one of the longest crypto sentences." },
  { id: 207, name: "Konstantin Ignatov", role: "CEO, OneCoin (after Ruja fled)",      group: "OneCoin",        fate: "Arrested at LAX 2019. Cooperated with investigators. Sentencing pending." },
  { id: 208, name: "Mark Scott",          role: "US Lawyer & Money Laundering Architect", group: "OneCoin",   fate: "Sentenced to 10 years (2023) for laundering ~$400M through Cayman Islands shell funds." },
];

// ─── Builders ─────────────────────────────────────────────────────────────────

function buildTombstone(t) {
  return {
    name: `${t.name} ✝`,
    description: t.description || `A tombstone commemorating the collapse of ${t.name} (${t.born}–${t.died}). ${t.epitaph} Part of the ${t.group} set — collect the full set to craft the villain portrait.`,
    image: img(t.id),
    external_url: `https://cryptometery.xyz/tombstone/${t.id}`,
    attributes: [
      { trait_type: "Type",           value: "Tombstone" },
      { trait_type: "Rarity",         value: RARITY.COMMON },
      { trait_type: "Born",           value: String(t.born) },
      { trait_type: "Died",           value: String(t.died) },
      { trait_type: "Cause of Death", value: t.cause },
      ...(t.lost ? [{ trait_type: "Amount Lost", value: t.lost }] : []),
      { trait_type: "Group",          value: t.group },
      { trait_type: "Epitaph",        value: t.epitaph },
    ],
  };
}

function buildLegendary(l) {
  const rarityLabel = l.rarity === RARITY.EPIC ? "Epic Villain Portrait" : "Legendary Villain Portrait";
  const description = l.fate
    ? `${l.rarity.toUpperCase()} — ${l.name} (aka "${l.alias}"). ${l.fate}`
    : `${l.rarity.toUpperCase()} — ${l.name} (aka "${l.alias}"), mastermind behind the ${l.group} collapse. Crime: ${l.crime}. Status: ${l.status}. "${l.quote}"`;
  return {
    name: `${l.name}`,
    description,
    image: img(l.id),
    external_url: `https://cryptometery.xyz/legendary/${l.id}`,
    attributes: [
      { trait_type: "Type",          value: rarityLabel },
      { trait_type: "Rarity",        value: l.rarity },
      { trait_type: "Group",         value: l.group },
      { trait_type: "Alias",         value: l.alias },
      { trait_type: "Crime",         value: l.crime },
      { trait_type: "Sentence",      value: l.sentence },
      { trait_type: "Status",        value: l.status },
      { trait_type: "Total Damage",  value: l.damage },
      { trait_type: "Victims",       value: l.victims },
      { trait_type: "Famous Quote",  value: l.quote },
    ],
  };
}

function buildIntermediate(i) {
  return {
    name: `${i.name}`,
    description: `RARE — ${i.name}, ${i.role}. A witness in the ${i.group} saga. ${i.fate}`,
    image: img(i.id),
    external_url: `https://cryptometery.xyz/witness/${i.id}`,
    attributes: [
      { trait_type: "Type",   value: "Witness" },
      { trait_type: "Rarity", value: RARITY.RARE },
      { trait_type: "Group",  value: i.group },
      { trait_type: "Role",   value: i.role },
      { trait_type: "Fate",   value: i.fate },
    ],
  };
}

function buildCollection() {
  return {
    name: "Crypto Cemetery",
    description: "NFT tombstones for crypto's greatest disasters. Collect tombstones, burn them to craft Legendary and Epic villain portraits. On Shape L2.",
    image: img("collection"),
    external_link: "https://cryptometery.xyz",
    seller_fee_basis_points: 500,
    fee_recipient: "0xDfa8E876EB75e2a0c156499F19F72447F494c93F",
  };
}

// ─── Generate ─────────────────────────────────────────────────────────────────

function generate() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  let count = 0;

  // Collection metadata (for contractURI)
  fs.writeFileSync(path.join(OUT_DIR, "collection.json"), JSON.stringify(buildCollection(), null, 2));
  console.log("✓ collection.json");

  for (const t of TOMBSTONES) {
    fs.writeFileSync(path.join(OUT_DIR, `${t.id}.json`), JSON.stringify(buildTombstone(t), null, 2));
    console.log(`✝  ${t.id}.json — ${t.name} [Common]`);
    count++;
  }

  // Pizza Day Event #33
  const pizzaDay = {
    name: "Bitcoin Pizza Day",
    description: "On May 22, 2010, Laszlo Hanyecz paid 10,000 BTC for two large Papa John's pizzas — the first documented real-world Bitcoin purchase. At the time, worth ~$41. At Bitcoin's 2026 price, the same coins exceed $1 billion. Collect 5 to craft Laszlo Hanyecz.",
    image: img(33),
    external_url: "https://cryptometery.xyz",
    attributes: [
      { trait_type: "Type",     value: "Event" },
      { trait_type: "Rarity",   value: RARITY.COMMON },
      { trait_type: "Group",    value: "Bitcoin Pizza Day" },
      { trait_type: "Date",     value: "May 22, 2010" },
      { trait_type: "Epitaph",  value: "10,000 BTC. Two pizzas. $1 billion in regrets — not his." },
    ],
  };
  fs.writeFileSync(path.join(OUT_DIR, "33.json"), JSON.stringify(pizzaDay, null, 2));
  console.log(`🍕 33.json — Bitcoin Pizza Day [Common]`);
  count++;

  for (const l of LEGENDARIES) {
    fs.writeFileSync(path.join(OUT_DIR, `${l.id}.json`), JSON.stringify(buildLegendary(l), null, 2));
    console.log(`${l.rarity === RARITY.EPIC ? "💀" : "★"} ${l.id}.json — ${l.name} [${l.rarity}]`);
    count++;
  }

  for (const i of INTERMEDIATES) {
    fs.writeFileSync(path.join(OUT_DIR, `${i.id}.json`), JSON.stringify(buildIntermediate(i), null, 2));
    console.log(`◈  ${i.id}.json — ${i.name} [Rare]`);
    count++;
  }

  console.log(`\nGenerated ${count} metadata files + collection.json → ${OUT_DIR}/`);
  console.log("\nNext steps:");
  console.log("  1. Upload the metadata/ folder to Pinata as a folder");
  console.log("  2. Copy the folder CID");
  console.log("  3. Call setBaseURI(\"ipfs://<FOLDER_CID>/\") on Shape Explorer");
  console.log("  4. Verify: contract.uri(1) should return ipfs://<CID>/1.json");
  console.log("  5. When done — call lockMetadata() to freeze forever");
}

generate();
