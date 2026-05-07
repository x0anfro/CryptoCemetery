export type CauseOfDeath = "Hack" | "Ponzi" | "Rug Pull" | "Mismanagement" | "Hubris";

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
}

const PLACEHOLDER_CID = "bafybeicezg2dudclqyh22z2oeq6mesq3oyuedljmx5fpfc4uvpm7jcqt6i";

const GATEWAYS = [
  "https://cloudflare-ipfs.com/ipfs/",
  "https://gateway.pinata.cloud/ipfs/",
];

export function ipfsToHttp(cid: string, gatewayIndex = 0): string {
  return `${GATEWAYS[gatewayIndex % GATEWAYS.length]}${cid}`;
}

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
}

export type CraftFunctionName = "craft" | "craftDoKwon" | "craftSuZhu";

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
    fate: "Пошла на сотрудничество со следствием в декабре 2022 года. В октябре 2023 дала показания против СБФ — её откровения стали ключевыми для обвинения. В сентябре 2024 приговорена к 2 годам заключения: минимально возможный срок благодаря «беспрецедентной» помощи следствию.",
  },
  {
    id: 202,
    name: "Gary Wang",
    role: "Co-founder & CTO, FTX",
    quote: "I wrote the code. I didn't think about the rest.",
    group: "FTX",
    fate: "Сотрудничал со следствием с первых дней после краха FTX. В ноябре 2023 дал показания против СБФ на суде. В ноябре 2024 приговорён к условному сроку без реального заключения — суд оценил его сотрудничество как «беспрецедентное».",
  },
  {
    id: 203,
    name: "Alexei Bilyuchenko",
    role: "Mt. Gox Hacker & BTC-e Co-operator",
    quote: "We moved the coins. That's all.",
    group: "Mt. Gox / BTC-e",
    fate: "В 2023 году Министерство юстиции США предъявило обвинения в отмывании 647 000 биткоинов (~$400 млн), похищенных с Mt. Gox, через биржу BTC-e. Находится в России и вне досягаемости американского правосудия. Дело официально открыто, экстрадиция невозможна.",
  },
  {
    id: 204,
    name: "Glenn Arcaro",
    role: "BitConnect US Promoter",
    quote: "I believed in the product. Then I got paid to believe harder.",
    group: "BitConnect",
    fate: "Первый осуждённый в деле BitConnect. В сентябре 2021 признал вину в мошенничестве и организации реферальной схемы. В феврале 2022 приговорён к 45 месяцам заключения. Выплатил $24 млн жертвам схемы в рамках мирового соглашения.",
  },
  {
    id: 205,
    name: "Irina Dilkinska",
    role: "Head of Legal & Compliance, OneCoin",
    quote: "Everything was above board. I made sure of it.",
    group: "OneCoin",
    fate: "Ближайший юридический советник Ружи Игнатовой. Арестована в Болгарии в 2023 году. Признала вину в сговоре с целью отмывания денег и сотрудничает со следствием США. Приговор ожидается.",
  },
  {
    id: 206,
    name: "Karl Greenwood",
    role: "Co-founder & Global Head of Sales, OneCoin",
    quote: "We're going to be bigger than Bitcoin.",
    group: "OneCoin",
    fate: "Сооснователь OneCoin и главный архитектор глобальной дистрибуции. Арестован в Таиланде в 2018 году. В 2023 приговорён к 20 годам заключения в США и обязан выплатить $300 млн — один из крупнейших сроков в истории криптомошенничества.",
  },
  {
    id: 207,
    name: "Konstantin Ignatov",
    role: "CEO, OneCoin (after Ruja disappeared)",
    quote: "My sister left me to deal with all of this.",
    group: "OneCoin",
    fate: "Брат Ружи Игнатовой, принял управление схемой после её исчезновения в 2017 году. Арестован в аэропорту Лос-Анджелеса в 2019. Пошёл на сотрудничество со следствием — его показания стали ключевыми против Гринвуда. Приговор ожидается.",
  },
  {
    id: 208,
    name: "Mark Scott",
    role: "US Lawyer & Money Laundering Architect",
    quote: "I was just providing legal services.",
    group: "OneCoin",
    fate: "Американский адвокат, организовавший схему отмывания ~$400 млн через подставные фонды на Кайманах. Осуждён в 2019 году. В 2023 приговорён к 10 годам заключения. Его схема позволила Игнатовой скрыться с деньгами.",
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
];

export const LEGENDARIES: Legendary[] = [
  {
    id: 101, name: "Sam Bankman-Fried", alias: "SBF", group: "FTX",
    crime: "Fraud & Mismanagement", sentence: "25 years", status: "Convicted",
    total_damage: "$32,000,000,000", victims: "1,000,000+",
    quote: "I didn't knowingly commit fraud. I think.",
    fate: "Осуждён в ноябре 2023 по всем 7 статьям обвинения. В марте 2024 приговорён к 25 годам — один из крупнейших сроков в истории финансовых преступлений США. Отбывает наказание в федеральной тюрьме.",
  },
  {
    id: 102, name: "Do Kwon", alias: "Lunatic", group: "Terra",
    crime: "Fraud & Securities Violations", sentence: "Pending", status: "Arrested in Montenegro",
    total_damage: "$45,000,000,000", victims: "500,000+",
    quote: "I don't debate poor people.",
    fate: "Арестован в Черногории в марте 2023 с поддельными документами при попытке бегства. В декабре 2024 экстрадирован в США. Ожидает суда по 8 статьям обвинения, включая мошенничество и манипуляцию рынком.",
  },
  {
    id: 103, name: "Mark Karpeles", alias: "MagicalTux", group: "Mt. Gox",
    crime: "Embezzlement", sentence: "2.5 years suspended", status: "Convicted (Japan)",
    total_damage: "$473,000,000", victims: "850,000",
    quote: "I was busy coding.",
    fate: "Осуждён в Японии в 2019 году: получил условный срок 2,5 года за манипуляцию данными. Обвинения в растрате были сняты. Продолжает жить в Японии, занимается IT-проектами.",
  },
  {
    id: 104, name: "Carlos Matos", alias: "BitConnect Guy", group: "BitConnect",
    crime: "Promoting Securities Fraud", sentence: "Not yet sentenced", status: "Charged",
    total_damage: "$2,400,000,000", victims: "300,000+",
    quote: "WHATS UP BITCONNEEEEECT.",
    fate: "Обвинён в США в 2022 году в мошенничестве с ценными бумагами. Вернулся на родину в Бразилию, приговор ожидается. Стал интернет-мемом благодаря своему выступлению на конференции BitConnect.",
  },
  {
    id: 105, name: "Ruja Ignatova", alias: "Cryptoqueen", group: "OneCoin",
    crime: "Wire Fraud & Money Laundering", sentence: "Fugitive (FBI Top 10)", status: "At Large",
    total_damage: "$25,000,000,000", victims: "3,000,000+",
    quote: "OneCoin will replace Bitcoin.",
    fate: "Исчезла в октябре 2017 перед запланированным арестом. Включена в список 10 самых разыскиваемых ФБР. Предположительно скрывается при поддержке организованной преступности. Местонахождение до сих пор неизвестно.",
  },
  {
    id: 106, name: "Alex Mashinsky", alias: "The Unbanker", group: "Celsius",
    crime: "Fraud & Market Manipulation", sentence: "Pending trial", status: "Charged",
    total_damage: "$4,700,000,000", victims: "600,000+",
    quote: "Banks are not your friends. I am.",
    fate: "Арестован в июле 2023 по 7 статьям, включая мошенничество с ценными бумагами и манипуляцию токеном CEL. В декабре 2024 признал вину по двум статьям. Приговор ожидается в 2025 году.",
  },
  {
    id: 107, name: "Su Zhu", alias: "Supercycle Su", group: "3AC",
    crime: "Contempt of Court & Fraud", sentence: "4 months (Singapore)", status: "Convicted",
    total_damage: "$3,500,000,000", victims: "100,000+",
    quote: "We are in a supercycle.",
    fate: "Задержан в сингапурском аэропорту в сентябре 2023 при попытке покинуть страну. В ноябре 2023 приговорён к 4 месяцам заключения за неуважение к суду ликвидаторов 3AC. Освобождён в 2024 году.",
  },
  {
    id: 109, name: "Satish Kumbhani", alias: "BitConnect Boss", group: "BitConnect",
    crime: "Securities & Commodities Fraud", sentence: "Fugitive", status: "At Large",
    total_damage: "$2,400,000,000", victims: "300,000+",
    quote: "BitConnect is the future of decentralized lending.",
    fate: "Обвинён в США в 2022 году по 7 статьям мошенничества. Исчез до ареста — предположительно скрывается в Индии. Местонахождение неизвестно, ФБР объявило в розыск. Единственный крупный крипто-мошенник, которому удалось избежать экстрадиции.",
  },
  {
    id: 108, name: "Alexander Vinnik", alias: "BTC-e Baron", group: "BTC-e",
    crime: "Money Laundering", sentence: "5 years (France)", status: "Convicted",
    total_damage: "$4,000,000,000", victims: "Mt. Gox creditors",
    quote: "I had no idea what my clients were doing.",
    fate: "Арестован в Греции в 2017 при попытке отдохнуть на курорте — Интерпол ждал. После многолетних споров между США, Францией и Россией экстрадирован во Францию. Осуждён в 2023 на 5 лет за отмывание $4 млрд. В 2024 году обменян на российского гражданина.",
  },
];

export const RECIPES: Recipe[] = [
  // FTX (1,2,3), Mt.Gox/BTC-e (7,8,9), BitConnect (10,11,12) handled by their own craft sections
  // OneCoin (13,14,15→205-208→105) handled by OneCoinCraftSection
  // Celsius (#16→106) handled by CelsiusCraftSection (1:1 exchange)
  { tombstones: [4, 5, 6, 18],    legendary: 102, group: "Terra", craftFn: "craftDoKwon" },
  { tombstones: [17, 19, 20, 21], legendary: 107, group: "3AC",   craftFn: "craftSuZhu"  },
];

export const TOMBSTONE_DESCRIPTIONS: Record<number, string> = {
  1:  "FTX был крупнейшей криптобиржей мира — пока в ноябре 2022 не выяснилось, что клиентские средства тайно перекачивались в сестринский хедж-фонд Alameda Research. Дыра в балансе на $8 млрд спровоцировала банковский набег, который биржа пережить не смогла. SBF был осуждён за мошенничество и получил 25 лет тюрьмы.",
  2:  "Торговая фирма, которую тайно контролировал SBF, стала инструментом, через который исчезли деньги клиентов FTX. Alameda делала огромные ставки на рынке — на заёмные деньги, которые ей никогда не принадлежали. Когда схема рухнула, $10 млрд клиентских средств испарились.",
  3:  "Криптокредитная платформа, глубоко завязанная финансово на Alameda Research и Three Arrows Capital. Когда оба рухнули, BlockFi оказался под перекрёстным огнём. Компания объявила о банкротстве в ноябре 2022, заморозив активы более 600 тысяч пользователей.",
  4:  "Алгоритмическая стейблкоин-экосистема До Квона рухнула в мае 2022, когда привязка UST к доллару сломалась. LUNA, призванная поглощать волатильность UST, гиперинфлировала с $119 до нуля за считанные дни. $30 млрд стоимости было уничтожено в одном из самых катастрофических крахов в истории крипты.",
  5:  "Anchor Protocol предлагал 20% годовых на депозиты в UST — доходность, которую невозможно поддерживать без субсидий от Terraform Labs. Когда резервы иссякли, а экосистема Terra рухнула, все депозиты обесценились за одну ночь. Протокол унёс с собой $14 млрд.",
  6:  "Алгоритмический стейблкоин, удерживавший привязку к доллару через механизм сжигания и выпуска LUNA. В мае 2022 скоординированная атака или рыночная паника сломала пег, запустив спираль смерти. $18 млрд рыночной капитализации испарились за несколько дней.",
  7:  "Когда-то Mt. Gox обрабатывал 70% всех биткоин-транзакций в мире. Токийская биржа годами теряла BTC из-за взломов и халатности, а дыра оставалась незамеченной. В 2014 году компания объявила о банкротстве; кредиторы ждали частичного возврата средств более десяти лет.",
  8:  "Одна из первых платформ для маржинальной торговли биткоином была взломана не один, а два раза в 2012 году. Часть активов Bitcoinica хранилась на бирже Mt. Gox. После второго взлома платформу закрыли. Один из первых примеров того, что стало повторяющимся паттерном в криптоиндустрии.",
  9:  "Теневая биржа, ставшая любимым инструментом для отмывания денег — в том числе выручки от взлома Mt. Gox. BTC-e проработала шесть лет, прежде чем ФБР закрыло её в 2017 и арестовало предполагаемого оператора Александра Винника. Через платформу прошло около $9 млрд преступных средств.",
  10: "Классическая крипто-пирамида, обещавшая 1% в день через загадочного «торгового бота». Карлос Матос стал её легендарным зазывалой с кричащим «WHATS UP BITCONNEEEEECT». Схема рухнула в январе 2018 после предписаний регуляторов, уничтожив $2.4 млрд.",
  11: "BitConnect X был запущен как «новый и улучшенный» BitConnect прямо в момент краха оригинала — и умудрился обмануть отчаявшихся инвесторов снова. Прожил меньше месяца и исчез с миллионами, даже не дав людям опомниться.",
  12: "Монета BCC была инструментом, через который работала пирамида BitConnect. На пике торговалась выше $400; после закрытия схемы рухнула практически в ноль. Её график стал одним из самых драматичных в истории крипты.",
  13: "Маркетировался как «убийца Bitcoin» — при том, что реального блокчейна не существовало. Руджа Игнатова (Крипто-королева) продавала учебные пакеты и токены в пирамиде, охватившей 175 стран. В 2017 она исчезла и до сих пор остаётся в списке разыскиваемых ФБР.",
  14: "Торговая платформа, привязанная к OneCoin, никогда не была настоящей биржей. Пользователи не могли свободно выводить средства или продавать токены. Существовала исключительно для создания иллюзии ликвидности и легитимности всей схемы.",
  15: "MLM-сеть, обеспечившая глобальное распространение OneCoin. Участники получали комиссии за вербовку новых «инвесторов». Работала как классическая пирамида: ранние участники зарабатывали за счёт тех, кто пришёл позже.",
  16: "Celsius обещал высокие доходы на криптодепозиты под лозунгом «разбанкируй себя». Гендиректор Алекс Машинский вводил пользователей в заблуждение, тайно занимая рискованные позиции на рынке. В июне 2022 все выводы были заморожены; в 2023 Машинский был арестован за мошенничество.",
  17: "Криптоброкер, державший значительную долговую экспозицию к Three Arrows Capital. Когда 3AC дефолтнул по займу на $650 млн, Voyager подал на банкротство в течение нескольких недель. Пользователи платформы оказались простыми необеспеченными кредиторами в банкротном процессе.",
  18: "Сингапурская криптокредитная платформа рухнула после тяжёлых потерь, связанных с крахом Terra/LUNA. Пользователи лишились доступа к средствам, пока компания подавала на судебное управление. Её основатели были расследованы сингапурскими властями по делу о мошенничестве.",
  19: "Некогда самый престижный криптохедж-фонд. 3AC занимал по всей отрасли и ставил огромные плечевые ставки на всё — от LUNA до GBTC. Когда рынок развернулся, они не смогли покрыть позиции. Дефолт на $3.5 млрд запустил цепную реакцию банкротств по всей индустрии.",
  20: "NFT-фонд 3AC, задача которого была создать институциональную коллекцию цифрового искусства. Привлёк $100 млн и устроил шопинг на NFT-рынке на пике оценок. Когда 3AC рухнул, вся коллекция была ликвидирована за ничтожную долю вложенного.",
  21: "Три стрелы эксплуатировали арбитраж между акциями GBTC и биткоином, накопив гигантскую позицию. Когда ожидаемый дисконт GBTC не закрылся, а BTC рухнул, позиция стала катастрофической. Сделка, которая должна была быть безрисковой, обернулась одним из крупнейших убытков 3AC.",
};

export const CAUSE_COLORS: Record<CauseOfDeath, string> = {
  Hack:          "bg-red-900 text-red-300 border-red-700",
  Ponzi:         "bg-orange-900 text-orange-300 border-orange-700",
  "Rug Pull":    "bg-purple-900 text-purple-300 border-purple-700",
  Mismanagement: "bg-yellow-900 text-yellow-300 border-yellow-700",
  Hubris:        "bg-blue-900 text-blue-300 border-blue-700",
};
