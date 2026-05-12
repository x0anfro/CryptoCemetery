export type CauseOfDeath = "Hack" | "Ponzi" | "Rug Pull" | "Mismanagement" | "Hubris" | "Lost";

export interface Tombstone {
  id: number;
  name: string;
  born: number;
  died: number;
  cause_of_death: CauseOfDeath;
  epitaph: string;
  amount_lost: string;
  amount_label?: string;
  group: string;
  villain: string;
  founder?: string;
  image?: string;
  video?: string;
  hideEra?: boolean;
  singleEra?: boolean;
}

const PLACEHOLDER_CID = "bafybeicezg2dudclqyh22z2oeq6mesq3oyuedljmx5fpfc4uvpm7jcqt6i";

const GATEWAYS = [
  "https://cloudflare-ipfs.com/ipfs/",
  "https://gateway.pinata.cloud/ipfs/",
];

export function ipfsToHttp(cid: string, gatewayIndex = 0): string {
  return `${GATEWAYS[gatewayIndex % GATEWAYS.length]}${cid}`;
}

export type Rarity = "rare" | "legendary" | "epic";

export interface Legendary {
  id: number;
  name: string;
  alias: string;
  crime: string;
  sentence: string;
  status: string;
  total_damage: string;
  victims: string;
  quote: string;
  group: string;
  fate: string;
  rarity: Rarity;
}

export type CraftFunctionName =
  | "craft"
  | "craftDoKwon"
  | "craftSuZhu"
  | "craftHowells"
  | "craftThomas"
  | "craftSatoshi"
  | "craftCotten"
  | "craftLazarus"
  | "craftPizzaDay";

export interface PizzaDayEvent {
  id: number;
  name: string;
  date: string;
  epitaph: string;
  description: string;
  fate: string;
}

export const PIZZA_DAY_EVENT: PizzaDayEvent = {
  id: 33,
  name: "Bitcoin Pizza Day",
  date: "May 22, 2010",
  epitaph: "10,000 BTC. Two pizzas. $1 billion in regrets — not his.",
  description: "On May 22, 2010, Laszlo Hanyecz paid 10,000 BTC for two large Papa John's pizzas — the first documented real-world purchase using Bitcoin. At the time, worth ~$41. At Bitcoin's 2026 price, the same coins exceed $1 billion.",
  fate: "By various accounts, Hanyecz spent approximately 100,000 BTC in total on food and other needs while Bitcoin was nearly worthless. He developed the first Bitcoin client for macOS and pioneered GPU mining. In numerous interviews, Laszlo has stated he has no regrets: for him it was an experiment that proved Bitcoin worked as money. 'Someone had to start.'",
};

export interface Recipe {
  tombstones: number[];
  legendary: number;
  group: string;
  craftFn: CraftFunctionName;
}

export interface Intermediate {
  id: number;
  name: string;
  role: string;
  quote: string;
  group: string;
  fate: string;
}

export const INTERMEDIATES: Intermediate[] = [
  {
    id: 201,
    name: "Caroline Ellison",
    role: "CEO, Alameda Research",
    quote: "I just did what Sam told me.",
    group: "FTX",
    fate: "Cooperated with investigators in December 2022. Testified against SBF in October 2023 — her revelations were key to the prosecution. Sentenced to 2 years in September 2024: the minimum possible term thanks to her extraordinary cooperation with authorities.",
  },
  {
    id: 202,
    name: "Gary Wang",
    role: "Co-founder & CTO, FTX",
    quote: "I wrote the code. I didn't think about the rest.",
    group: "FTX",
    fate: "Cooperated with investigators from the earliest days after FTX's collapse. Testified against SBF at trial in November 2023. Sentenced to time served with no prison time in November 2024 — the court praised his cooperation as extraordinary.",
  },
  {
    id: 203,
    name: "Alexei Bilyuchenko",
    role: "Mt. Gox Hacker & BTC-e Co-operator",
    quote: "We moved the coins. That's all.",
    group: "Mt. Gox / BTC-e",
    fate: "In 2023, the US Department of Justice charged him with laundering 647,000 Bitcoin (~$400 million) stolen from Mt. Gox through the BTC-e exchange. Currently in Russia and beyond the reach of US justice. The case remains officially open; extradition is impossible.",
  },
  {
    id: 204,
    name: "Glenn Arcaro",
    role: "BitConnect US Promoter",
    quote: "I believed in the product. Then I got paid to believe harder.",
    group: "BitConnect",
    fate: "The first person convicted in the BitConnect case. Pleaded guilty in September 2021 to fraud and running the referral scheme. Sentenced to 45 months in February 2022. Paid $24 million to scheme victims as part of a settlement.",
  },
  {
    id: 205,
    name: "Irina Dilkinska",
    role: "Head of Legal & Compliance, OneCoin",
    quote: "Everything was above board. I made sure of it.",
    group: "OneCoin",
    fate: "Ruja Ignatova's closest legal advisor. Arrested in Bulgaria in 2023. Pleaded guilty to conspiracy to commit money laundering and is cooperating with US investigators. Sentencing pending.",
  },
  {
    id: 206,
    name: "Karl Greenwood",
    role: "Co-founder & Global Head of Sales, OneCoin",
    quote: "We're going to be bigger than Bitcoin.",
    group: "OneCoin",
    fate: "OneCoin co-founder and the chief architect of its global distribution. Arrested in Thailand in 2018. Sentenced in 2023 to 20 years in the US and ordered to pay $300 million — one of the longest sentences in crypto fraud history.",
  },
  {
    id: 207,
    name: "Konstantin Ignatov",
    role: "CEO, OneCoin (after Ruja disappeared)",
    quote: "My sister left me to deal with all of this.",
    group: "OneCoin",
    fate: "Ruja Ignatova's brother, took over running the scheme after her disappearance in 2017. Arrested at Los Angeles airport in 2019. Cooperated with investigators — his testimony was key against Greenwood. Sentencing pending.",
  },
  {
    id: 208,
    name: "Mark Scott",
    role: "US Lawyer & Money Laundering Architect",
    quote: "I was just providing legal services.",
    group: "OneCoin",
    fate: "A US lawyer who orchestrated the laundering of ~$400 million through shell funds in the Cayman Islands. Convicted in 2019. Sentenced to 10 years in 2023. His scheme enabled Ignatova to disappear with the money.",
  },
];

export const TOMBSTONES: Tombstone[] = [
  // Group 1 — FTX
  { id: 1,  name: "FTX Exchange",         born: 2019, died: 2022, cause_of_death: "Mismanagement", epitaph: "Customer funds? Never heard of her.",              amount_lost: "$8,000,000,000",  group: "FTX",       villain: "Sam Bankman-Fried", image: "bafybeicrcw6hq4y4v2c4r6yejve6wanlcijza6zfg4h4hphbpplq76qvfi" },
  { id: 2,  name: "Alameda Research",     born: 2017, died: 2022, cause_of_death: "Mismanagement", epitaph: "The hedge fund that hedged with your money.",      amount_lost: "$10,000,000,000", group: "FTX",       villain: "Caroline Ellison",  image: "bafybeicphyfhxiw3ndx7b3ycpbeimyrp2hk3igiut3gtkc3l7fzrvmpmwa" },
  { id: 3,  name: "BlockFi",             born: 2017, died: 2022, cause_of_death: "Mismanagement", epitaph: "Collateral damage has never been so expensive.",   amount_lost: "$1,200,000,000",  group: "FTX",       villain: "",                  founder: "Zac Prince & Flori Marquez", image: "bafybeica5xxed3wgg6gfm3rdhxqa2yfk7ftrmzeb7etyghkgqjjs3turei" },
  // Group 2 — Terra
  { id: 4,  name: "Terra / LUNA",         born: 2018, died: 2022, cause_of_death: "Ponzi",         epitaph: "1 LUNA = 1 LUNA. Eventually.",                     amount_lost: "$30,000,000,000", group: "Terra",     villain: "Do Kwon" },
  { id: 5,  name: "Anchor Protocol",      born: 2021, died: 2022, cause_of_death: "Ponzi",         epitaph: "20% APY. Sustainable. Trust me.",                  amount_lost: "$14,000,000,000", group: "Terra",     villain: "Do Kwon" },
  { id: 6,  name: "TerraUSD (UST)",       born: 2020, died: 2022, cause_of_death: "Ponzi",         epitaph: "Algorithmic stablecoin. Emphasis on 'was'.",       amount_lost: "$18,000,000,000", group: "Terra",     villain: "Do Kwon" },
  // Group 3 — Mt. Gox
  { id: 7,  name: "Mt. Gox",             born: 2010, died: 2014, cause_of_death: "Hack",          epitaph: "First to rise. First to fall. Still in court.",    amount_lost: "$473,000,000",    group: "Mt. Gox",  villain: "Mark Karpeles" },
  { id: 8,  name: "Bitcoinica",           born: 2011, died: 2012, cause_of_death: "Hack",          epitaph: "Hacked twice. Kept going. Hacked again.",          amount_lost: "$300,000",         group: "Mt. Gox",  villain: "",                  founder: "Zhou Tong" },
  { id: 9,  name: "BTC-e",               born: 2011, died: 2017, cause_of_death: "Hack",          epitaph: "Where crime paid — until the FBI showed up.",      amount_lost: "$9,000,000,000",  amount_label: "Laundered", group: "BTC-e",    villain: "Alexander Vinnik" },
  // Group 4 — BitConnect
  { id: 10, name: "BitConnect",           born: 2016, died: 2018, cause_of_death: "Ponzi",         epitaph: "WHATS UP BITCONNEEEEECT.",                         amount_lost: "$2,400,000,000",  group: "BitConnect", villain: "Satish Kumbhani" },
  { id: 11, name: "BitConnect X",         born: 2018, died: 2018, cause_of_death: "Rug Pull",      epitaph: "The sequel nobody asked for, exited even faster.", amount_lost: "$45,000,000",     group: "BitConnect", villain: "Satish Kumbhani" },
  { id: 12, name: "BCC Token",            born: 2016, died: 2018, cause_of_death: "Ponzi",         epitaph: "From $400 to $0. Volatility works both ways.",     amount_lost: "$2,000,000,000",  group: "BitConnect", villain: "Satish Kumbhani" },
  // Group 5 — OneCoin
  { id: 13, name: "OneCoin",              born: 2014, died: 2017, cause_of_death: "Ponzi",         epitaph: "The blockchain that existed only in PowerPoint.",  amount_lost: "$18,000,000,000", group: "OneCoin",   villain: "Ruja Ignatova" },
  { id: 14, name: "One Exchange",         born: 2015, died: 2017, cause_of_death: "Ponzi",         epitaph: "An exchange where only the exit was real.",        amount_lost: "",                group: "OneCoin",   villain: "Ruja Ignatova" },
  { id: 15, name: "OneLife Network",      born: 2015, died: 2017, cause_of_death: "Ponzi",         epitaph: "MLM for the blockchain age. RIP.",                 amount_lost: "",                group: "OneCoin",   villain: "Ruja Ignatova" },
  // Group 6 — Celsius
  { id: 16, name: "Celsius Network",      born: 2017, died: 2022, cause_of_death: "Mismanagement", epitaph: "Unbank yourself. Then lose everything.",           amount_lost: "$4,700,000,000",  group: "Celsius",   villain: "Alex Mashinsky" },
  { id: 17, name: "Voyager Digital",      born: 2018, died: 2022, cause_of_death: "Mismanagement", epitaph: "Voyaged straight into bankruptcy.",                amount_lost: "$1,100,000,000",  group: "3AC",       villain: "",        founder: "Stephen Ehrlich" },
  { id: 18, name: "Hodlnaut",             born: 2019, died: 2022, cause_of_death: "Mismanagement", epitaph: "HODLed too hard. Lost it all.",                    amount_lost: "$190,000,000",    group: "Terra",     villain: "",        founder: "Juntao Zhu & Simon Lee" },
  // Group 7 — 3AC
  { id: 19, name: "Three Arrows Capital", born: 2012, died: 2022, cause_of_death: "Hubris",        epitaph: "Supercycle believers. Supercycle victims.",        amount_lost: "$3,500,000,000",  group: "3AC",       villain: "Su Zhu" },
  { id: 20, name: "Starry Night Capital", born: 2021, died: 2022, cause_of_death: "Hubris",        epitaph: "$100M NFT fund. Stars aligned — for liquidation.", amount_lost: "$100,000,000",    group: "3AC",       villain: "Su Zhu" },
  { id: 21, name: "GBTC Trade",           born: 2020, died: 2022, cause_of_death: "Hubris",        epitaph: "The discount that discounted their existence.",    amount_lost: "$1,200,000,000",  group: "3AC",       villain: "Su Zhu",  founder: "Barry Silbert" },
  // Group 8 — Crypt of Forgotten Keys
  { id: 22, name: "James Howells' Hard Drive", born: 2009, died: 2013, cause_of_death: "Lost", epitaph: "8,000 BTC. One wrong bin bag. Twelve years of council meetings.", amount_lost: "$800,000,000",    group: "Forgotten Keys", villain: "", founder: "James Howells",  hideEra: true },
  { id: 23, name: "Stefan Thomas's IronKey",   born: 2011, died: 2011, cause_of_death: "Lost", epitaph: "7,002 BTC. Eight attempts down. Two tries left. No room for error.", amount_lost: "$700,000,000",    group: "Forgotten Keys", villain: "", founder: "Stefan Thomas", hideEra: true },
  { id: 24, name: "Satoshi's Ghost Million",   born: 2009, died: 2011, cause_of_death: "Lost", epitaph: "Mined it. Vanished. Left $100 billion untouched — on principle, or by accident.", amount_lost: "$109,000,000,000", amount_label: "Unmoved", group: "Forgotten Keys", villain: "", founder: "Satoshi Nakamoto", hideEra: true },
  { id: 25, name: "QuadrigaCX",               born: 2013, died: 2019, cause_of_death: "Lost", epitaph: "Dead men tell no passwords.",                          amount_lost: "$250,000,000",    group: "Forgotten Keys", villain: "Gerald Cotten", hideEra: true },
  // Group 9 — Lazarus Group
  { id: 26, name: "Coincheck",              born: 2014, died: 2018, cause_of_death: "Hack", epitaph: "500 million NEM. No multisig. No mercy.",                                   amount_lost: "$534,000,000",    group: "Lazarus", villain: "Lazarus Group", singleEra: true },
  { id: 27, name: "Ronin Network",          born: 2021, died: 2022, cause_of_death: "Hack", epitaph: "5 of 9 validators. One fake job offer. $625 million gone.",                 amount_lost: "$625,000,000",    group: "Lazarus", villain: "Lazarus Group", singleEra: true },
  { id: 28, name: "Atomic Wallet & CoinEx", born: 2017, died: 2023, cause_of_death: "Hack", epitaph: "Two platforms. One summer. $170 million drained.",                          amount_lost: "$170,000,000",    group: "Lazarus", villain: "Lazarus Group", singleEra: true },
  { id: 29, name: "DMM Bitcoin",            born: 2018, died: 2024, cause_of_death: "Hack", epitaph: "4,502 BTC. One social engineering call. One exchange closed forever.",      amount_lost: "$308,000,000",    group: "Lazarus", villain: "Lazarus Group", singleEra: true },
  { id: 30, name: "Bybit",                  born: 2018, died: 2025, cause_of_death: "Hack", epitaph: "The largest crypto theft in history. A cold wallet. February 2025.",        amount_lost: "$1,500,000,000",  group: "Lazarus", villain: "Lazarus Group", singleEra: true },
  { id: 31, name: "Drift Protocol",         born: 2021, died: 2026, cause_of_death: "Hack", epitaph: "Months of preparation. April Fools' Day. $285 million.",                   amount_lost: "$285,000,000",    group: "Lazarus", villain: "Lazarus Group", singleEra: true },
  { id: 32, name: "Kelp DAO",              born: 2023, died: 2026, cause_of_death: "Hack", epitaph: "They didn't break the bridge. They printed fake tokens instead.",            amount_lost: "$292,000,000",    group: "Lazarus", villain: "Lazarus Group", singleEra: true },
];

export const LEGENDARIES: Legendary[] = [
  {
    id: 101, name: "Sam Bankman-Fried", alias: "SBF", group: "FTX", rarity: "epic",
    crime: "Fraud & Mismanagement", sentence: "25 years", status: "Convicted",
    total_damage: "$32,000,000,000", victims: "1,000,000+",
    quote: "I didn't knowingly commit fraud. I think.",
    fate: "Convicted in November 2023 on all 7 counts. Sentenced to 25 years in March 2024 — one of the longest sentences in US financial crime history. Currently serving time in a federal prison.",
  },
  {
    id: 102, name: "Do Kwon", alias: "Lunatic", group: "Terra", rarity: "legendary",
    crime: "Fraud & Securities Violations", sentence: "Pending", status: "Arrested in Montenegro",
    total_damage: "$45,000,000,000", victims: "500,000+",
    quote: "I don't debate poor people.",
    fate: "Arrested in Montenegro in March 2023 with forged documents while attempting to flee. Extradited to the US in December 2024. Awaiting trial on 8 counts including fraud and market manipulation.",
  },
  {
    id: 103, name: "Mark Karpeles", alias: "MagicalTux", group: "Mt. Gox", rarity: "legendary",
    crime: "Embezzlement", sentence: "2.5 years suspended", status: "Convicted (Japan)",
    total_damage: "$473,000,000", victims: "850,000",
    quote: "I was busy coding.",
    fate: "Convicted in Japan in 2019: received a 2.5-year suspended sentence for data manipulation. Embezzlement charges were dropped. Continues to live in Japan, working on IT projects.",
  },
  {
    id: 104, name: "Carlos Matos", alias: "BitConnect Guy", group: "BitConnect", rarity: "legendary",
    crime: "Promoting Securities Fraud", sentence: "Not yet sentenced", status: "Charged",
    total_damage: "$2,400,000,000", victims: "300,000+",
    quote: "WHATS UP BITCONNEEEEECT.",
    fate: "Charged in the US in 2022 with securities fraud. Returned to his home country of Brazil, sentencing pending. Became an internet meme thanks to his infamous BitConnect conference speech.",
  },
  {
    id: 105, name: "Ruja Ignatova", alias: "Cryptoqueen", group: "OneCoin", rarity: "epic",
    crime: "Wire Fraud & Money Laundering", sentence: "Fugitive (FBI Top 10)", status: "At Large",
    total_damage: "$25,000,000,000", victims: "3,000,000+",
    quote: "OneCoin will replace Bitcoin.",
    fate: "Disappeared in October 2017 ahead of a planned arrest. Listed among the FBI's 10 Most Wanted Fugitives. Believed to be hiding with the support of organized crime. Whereabouts remain unknown to this day.",
  },
  {
    id: 106, name: "Alex Mashinsky", alias: "The Unbanker", group: "Celsius", rarity: "legendary",
    crime: "Fraud & Market Manipulation", sentence: "Pending trial", status: "Charged",
    total_damage: "$4,700,000,000", victims: "600,000+",
    quote: "Banks are not your friends. I am.",
    fate: "Arrested in July 2023 on 7 charges including securities fraud and manipulation of the CEL token. Pleaded guilty to two counts in December 2024. Sentencing expected in 2025.",
  },
  {
    id: 107, name: "Su Zhu", alias: "Supercycle Su", group: "3AC", rarity: "legendary",
    crime: "Contempt of Court & Fraud", sentence: "4 months (Singapore)", status: "Convicted",
    total_damage: "$3,500,000,000", victims: "100,000+",
    quote: "We are in a supercycle.",
    fate: "Detained at Singapore's airport in September 2023 while attempting to leave the country. Sentenced to 4 months in November 2023 for contempt of court during 3AC's liquidation proceedings. Released in 2024.",
  },
  {
    id: 108, name: "Alexander Vinnik", alias: "BTC-e Baron", group: "BTC-e", rarity: "epic",
    crime: "Money Laundering", sentence: "5 years (France)", status: "Convicted",
    total_damage: "$4,000,000,000", victims: "Mt. Gox creditors",
    quote: "I had no idea what my clients were doing.",
    fate: "Arrested in Greece in 2017 while trying to enjoy a holiday — Interpol was waiting. After years of extradition disputes between the US, France, and Russia, he was sent to France. Convicted in 2023 to 5 years for laundering $4 billion. Exchanged for a Russian national in 2024.",
  },
  {
    id: 109, name: "Satish Kumbhani", alias: "BitConnect Boss", group: "BitConnect", rarity: "epic",
    crime: "Securities & Commodities Fraud", sentence: "Fugitive", status: "At Large",
    total_damage: "$2,400,000,000", victims: "300,000+",
    quote: "BitConnect is the future of decentralized lending.",
    fate: "Charged in the US in 2022 on 7 fraud counts. Disappeared before arrest — believed to be hiding in India. Whereabouts unknown; the FBI has issued a wanted notice. The only major crypto fraudster to have evaded extradition.",
  },
  {
    id: 110, name: "Lazarus Group", alias: "Labyrinth Chollima", group: "Lazarus", rarity: "epic",
    crime: "State-Sponsored Cybercrime", sentence: "Above the Law", status: "Untouchable",
    total_damage: "$3,500,000,000+", victims: "Millions worldwide",
    quote: "We are not criminals. We are the state.",
    fate: "Lazarus Group is a cyber unit operated by North Korea's Reconnaissance General Bureau. Unlike typical hackers, they don't steal for personal gain — they steal to fund a nuclear weapons program. Hundreds of millions in stolen crypto have been traced directly to missile development. The US, South Korea, and the EU have issued indictments and sanctions. Arrest is structurally impossible: the entire nation is the suspect. The group has never stopped operating.",
  },
  {
    id: 111, name: "James Howells", alias: "The Landfill Man", group: "Forgotten Keys", rarity: "legendary",
    crime: "Lost Access", sentence: "Self-inflicted", status: "Still searching",
    total_damage: "$800,000,000", victims: "Himself",
    quote: "It's in there somewhere. I know it.",
    fate: "In August 2025, Howells announced he was ending his twelve-year effort to physically recover the drive. The Bitcoin — buried under tonnes of waste at Newport landfill — will most likely stay there forever.",
  },
  {
    id: 112, name: "Stefan Thomas", alias: "Two Tries Left", group: "Forgotten Keys", rarity: "legendary",
    crime: "Lost Access", sentence: "Self-inflicted", status: "Waiting",
    total_damage: "$700,000,000", victims: "Himself",
    quote: "I have two tries left. I'm not going to waste them.",
    fate: "Thomas placed the drive in a secure, undisclosed location — reportedly a Swiss vault — and is waiting for more reliable decryption methods. Quantum computing remains his last theoretical hope.",
  },
  {
    id: 114, name: "Gerald Cotten", alias: "Dead Man's Password", group: "Forgotten Keys", rarity: "legendary",
    crime: "Fraud & Embezzlement", sentence: "Deceased (officially)", status: "Unknown",
    total_damage: "$250,000,000", victims: "76,000+",
    quote: "I'm the only one who knows the password.",
    fate: "Cotten died in India in December 2018, aged 30 — supposedly from Crohn's disease. He took the passwords to QuadrigaCX's cold wallets with him. Investigations later revealed the exchange was a Ponzi scheme: Cotten had created fake accounts, traded nonexistent assets, and spent customer funds on personal luxury. Most wallets were already empty before his death. Whether Cotten is truly dead remains disputed.",
  },
  {
    id: 115, name: "Laszlo Hanyecz", alias: "Pizza Man", group: "Bitcoin Pizza Day", rarity: "epic",
    crime: "Spent 10,000 BTC on pizza", sentence: "None", status: "No regrets",
    total_damage: "10,000 BTC (~$1B)", victims: "Himself",
    quote: "Someone had to start.",
    fate: "By various accounts, Hanyecz spent approximately 100,000 BTC in total on food and other needs while Bitcoin was nearly worthless. He developed the first Bitcoin client for macOS and pioneered GPU mining — discovering that graphics cards mine coins far faster than standard processors. In numerous interviews, Laszlo has stated he has no regrets: for him it was an experiment that proved Bitcoin's viability as a means of payment. 'Someone had to start.'",
  },
  {
    id: 113, name: "Satoshi Nakamoto", alias: "The Ghost", group: "Forgotten Keys", rarity: "legendary",
    crime: "Voluntary Disappearance", sentence: "Unknown", status: "Unknown",
    total_damage: "$109,000,000,000", victims: "None — or everyone",
    quote: "I've moved on to other things.",
    fate: "The true identity of Satoshi Nakamoto remains unknown. Recent investigations named cryptographer Adam Back (New York Times) and developer Peter Todd (HBO), both of whom deny involvement. That Satoshi has never touched the fortune is seen by many as proof of ideological purity — or simply that the keys are long gone.",
  },
];

export const RECIPES: Recipe[] = [
  // FTX (1,2,3), Mt.Gox/BTC-e (7,8,9), BitConnect (10,11,12) handled by their own craft sections
  // OneCoin (13,14,15→205-208→105) handled by OneCoinCraftSection
  // Celsius (#16→106) handled by CelsiusCraftSection (1:1 exchange)
  { tombstones: [4, 5, 6, 18],                         legendary: 102, group: "Terra",          craftFn: "craftDoKwon"  },
  { tombstones: [17, 19, 20, 21],                      legendary: 107, group: "3AC",             craftFn: "craftSuZhu"   },
  // Forgotten Keys (1:1 exchange, like Celsius)
  { tombstones: [22], legendary: 111, group: "Forgotten Keys", craftFn: "craftHowells"  },
  { tombstones: [23], legendary: 112, group: "Forgotten Keys", craftFn: "craftThomas"   },
  { tombstones: [24], legendary: 113, group: "Forgotten Keys", craftFn: "craftSatoshi"  },
  { tombstones: [25], legendary: 114, group: "Forgotten Keys", craftFn: "craftCotten"   },
  // Lazarus (7-witness → Epic 110)
  { tombstones: [26, 27, 28, 29, 30, 31, 32],          legendary: 110, group: "Lazarus",         craftFn: "craftLazarus" },
];

export const TOMBSTONE_DESCRIPTIONS: Record<number, string> = {
  1:  "FTX was the world's largest crypto exchange — until November 2022 revealed that customer funds had been secretly funneled into its sister hedge fund, Alameda Research. An $8 billion hole in the balance sheet triggered a bank run the exchange couldn't survive. SBF was convicted of fraud and sentenced to 25 years in prison.",
  2:  "The trading firm secretly controlled by SBF was the vehicle through which FTX customer funds disappeared. Alameda made massive market bets — with borrowed money that was never theirs to use. When the scheme collapsed, $10 billion in customer funds had vanished.",
  3:  "A crypto lending platform deeply entangled with Alameda Research and Three Arrows Capital. When both collapsed, BlockFi was caught in the crossfire. The company filed for bankruptcy in November 2022, freezing the assets of over 600,000 users.",
  4:  "Do Kwon's algorithmic stablecoin ecosystem collapsed in May 2022 when UST's dollar peg broke. LUNA, designed to absorb UST volatility, hyperinflated from $119 to zero in a matter of days. $30 billion in value was wiped out in one of the most catastrophic crashes in crypto history.",
  5:  "Anchor Protocol offered 20% annual yields on UST deposits — a rate impossible to sustain without subsidies from Terraform Labs. When reserves ran dry and the Terra ecosystem collapsed, all deposits became worthless overnight. The protocol took $14 billion down with it.",
  6:  "An algorithmic stablecoin that maintained its dollar peg through a LUNA burn-and-mint mechanism. In May 2022, a coordinated attack or market panic broke the peg, triggering a death spiral. $18 billion in market cap evaporated within days.",
  7:  "At its peak, Mt. Gox processed 70% of all Bitcoin transactions worldwide. The Tokyo exchange was hemorrhaging BTC for years due to hacks and negligence, while the hole went unnoticed. It filed for bankruptcy in 2014; creditors waited over a decade for a partial recovery.",
  8:  "One of the earliest Bitcoin margin trading platforms was hacked not once, but twice in 2012. Part of Bitcoinica's assets were held on the Mt. Gox exchange. After the second breach, the platform shut down. One of the first examples of what would become a recurring pattern in the crypto industry.",
  9:  "A shadow exchange that became the go-to tool for money laundering — including proceeds from the Mt. Gox hack. BTC-e operated for six years before the FBI shut it down in 2017 and arrested alleged operator Alexander Vinnik. An estimated $9 billion in criminal funds flowed through the platform.",
  10: "A classic crypto pyramid scheme promising 1% daily returns through a mysterious 'trading bot.' Carlos Matos became its legendary hype man with his screaming 'WHATS UP BITCONNEEEEECT.' The scheme collapsed in January 2018 following regulatory cease-and-desist orders, destroying $2.4 billion.",
  11: "BitConnect X launched as the 'new and improved' BitConnect at the exact moment the original was collapsing — and somehow managed to scam desperate investors all over again. It lasted less than a month before vanishing with millions.",
  12: "The BCC token was the vehicle through which the BitConnect pyramid operated. It traded above $400 at its peak; after the scheme was shut down, it crashed to nearly zero. Its price chart became one of the most dramatic in crypto history.",
  13: "Marketed as a 'Bitcoin killer' — despite having no real blockchain. Ruja Ignatova, the Cryptoqueen, sold educational packages and tokens through a pyramid scheme spanning 175 countries. In 2017 she vanished and remains on the FBI's most wanted list to this day.",
  14: "The trading platform tied to OneCoin was never a real exchange. Users couldn't freely withdraw funds or sell tokens. It existed solely to create the illusion of liquidity and legitimacy for the entire scheme.",
  15: "The MLM network that drove OneCoin's global expansion. Participants earned commissions for recruiting new 'investors.' It operated as a classic pyramid: early participants profited at the expense of those who joined later.",
  16: "Celsius promised high yields on crypto deposits under the slogan 'unbank yourself.' CEO Alex Mashinsky misled users while secretly taking on risky market positions. In June 2022 all withdrawals were frozen; in 2023 Mashinsky was arrested for fraud.",
  17: "A crypto broker that held significant debt exposure to Three Arrows Capital. When 3AC defaulted on a $650 million loan, Voyager filed for bankruptcy within weeks. Platform users found themselves as ordinary unsecured creditors in the bankruptcy proceedings.",
  18: "A Singapore-based crypto lending platform that collapsed after severe losses tied to the Terra/LUNA crash. Users lost access to their funds as the company filed for judicial management. Its founders were investigated by Singaporean authorities on fraud charges.",
  19: "Once the most prestigious hedge fund in crypto. 3AC borrowed across the entire industry and placed massive leveraged bets on everything from LUNA to GBTC. When the market turned, they couldn't cover their positions. A $3.5 billion default triggered a chain reaction of bankruptcies across the industry.",
  20: "3AC's NFT fund, created to build an institutional digital art collection. It raised $100 million and went on a shopping spree at peak NFT valuations. When 3AC collapsed, the entire collection was liquidated for a fraction of what was paid.",
  21: "Three Arrows exploited the arbitrage between GBTC shares and Bitcoin, accumulating a massive position. When the expected GBTC discount never closed and BTC crashed, the position turned catastrophic. A trade meant to be risk-free became one of 3AC's largest losses.",
  22: "In 2009, British IT engineer James Howells mined 8,000 Bitcoin and stored the wallet on a hard drive. In 2013, during a house cleanup, the drive was accidentally thrown away and ended up in a Newport landfill. For over twelve years, Howells petitioned the city council for permission to excavate — offering 25% of any recovered funds. The council repeatedly refused, citing environmental regulations. In early 2025, a court ruled definitively that he had no legal right to retrieve the drive.",
  23: "Stefan Thomas received 7,002 Bitcoin in 2011 as payment for producing an educational video, 'What is Bitcoin?'. He wrote the wallet password on a piece of paper — then lost it. After eight failed attempts, he stopped: the IronKey hardware wallet permanently erases all data after ten wrong entries. In 2023–2025, cybersecurity firm Unciphered claimed to have found a way to crack the same IronKey model. Thomas declined, citing legal complications and privacy concerns.",
  24: "Approximately 1.1 million Bitcoin — mined between 2009 and 2010 — sit untouched across more than 21,900 addresses linked to Satoshi Nakamoto by the Patoshi Pattern, a fingerprint of the early mining algorithm. According to Arkham Intelligence, this makes Satoshi one of the wealthiest individuals alive — roughly top 15 on the Forbes scale — holding ~5.5% of Bitcoin's total supply. Any movement on a Satoshi-era address instantly shakes global markets. No one knows if the keys still exist, or if they were deliberately destroyed.",
  25: "Gerald Cotten founded QuadrigaCX, Canada's largest crypto exchange. When he died in India in December 2018 — aged 30, reportedly from Crohn's disease — he took the passwords to the cold wallets with him. His widow said she could not access his encrypted laptop. The Ontario Securities Commission later concluded QuadrigaCX was a Ponzi scheme: Cotten had created fake accounts, traded nonexistent assets, and spent customer funds on personal expenses and failed trades. Ernst & Young auditors found that most exchange wallets were already empty long before his death. Co-founder Michael Patryn was revealed to have a prior fraud conviction under the name Omar Dhanani.",
  26: "In January 2018, Japanese exchange Coincheck lost approximately 500 million NEM tokens — worth $534 million at the time — after hackers accessed its hot wallets through phishing and malware. Funds were stored without multisignature protection, making the withdrawal trivially easy. The exchange compensated around 260,000 affected users from its own reserves. The incident prompted Japan to overhaul crypto regulation and establish the JVCEA industry association. The attackers have never been arrested.",
  27: "In March 2022, the Ronin Network — backbone of Axie Infinity — was drained of 173,600 ETH and 25.5 million USDC. Attackers gained control of 5 of 9 validator nodes after sending a Sky Mavis employee a malware-laced PDF disguised as a job offer. The US government attributed the attack to North Korea's Lazarus Group. The network was halted; the validator set was later expanded to prevent a repeat. One of the largest crypto thefts in history.",
  28: "In June 2023, Lazarus Group compromised Atomic Wallet — over 5,500 wallets across Bitcoin, Ethereum, and Tron — with losses confirmed at over $100 million, far beyond the initial $35 million estimate. In September 2023, CoinEx lost $70 million after hackers reused infrastructure already linked to Atomic. Together with simultaneous hits on Alphapo ($60M), Stake.com ($41M), and CoinsPaid ($37M), the group stole $240–300 million in a single quarter.",
  29: "In May 2024, Japanese exchange DMM Bitcoin lost 4,502.9 BTC — approximately $308 million — in an unauthorized transfer attributed to Lazarus Group (also known as TraderTraitor) by the FBI and Japanese authorities. Attackers used social engineering and malware to compromise staff. The company raised $320 million in emergency funding to cover user losses, but announced the exchange's permanent closure in December 2024. The hack directly killed the business.",
  30: "On February 21, 2025, Bybit confirmed the theft of approximately $1.5 billion from a cold wallet — the largest single crypto heist ever recorded, nearly matching the entire industry's losses for all of 2024. Attackers combined software vulnerabilities in internal transaction software with phishing and malware to compromise signing workflows. Within 48 hours, $160 million was laundered through mixers; by March 2025, over $300 million had been cashed out. North Korean state-sponsored hackers were identified as responsible.",
  31: "On April 1, 2026, Solana-based perpetuals protocol Drift was drained of approximately $285 million. Attackers spent months infiltrating the Drift Council through social engineering before executing the theft — primarily from the JLP Delta Neutral strategy. Elliptic attributed the attack to North Korean hackers. Drift suspended all operations immediately; Tether intervened to help stabilize the protocol. The attack triggered a chain reaction across Solana's DeFi ecosystem.",
  32: "On April 19, 2026, Kelp DAO's rsETH bridge was exploited for $292 million. Rather than attacking the protocol directly, hackers compromised the RPC infrastructure of LayerZero's decentralized verifier network — minting fraudulent rsETH tokens. LayerZero acknowledged the security misconfiguration. Panic spread across DeFi: investors withdrew over $8.6 billion from Aave in two days fearing contagion. Kelp DAO subsequently migrated its bridge to Chainlink; Solv Protocol withdrew $700 million from LayerZero.",
};

export const CAUSE_COLORS: Record<CauseOfDeath, string> = {
  Hack:          "bg-red-900 text-red-300 border-red-700",
  Ponzi:         "bg-orange-900 text-orange-300 border-orange-700",
  "Rug Pull":    "bg-purple-900 text-purple-300 border-purple-700",
  Mismanagement: "bg-yellow-900 text-yellow-300 border-yellow-700",
  Hubris:        "bg-blue-900 text-blue-300 border-blue-700",
  Lost:          "bg-slate-800 text-slate-300 border-slate-600",
};
