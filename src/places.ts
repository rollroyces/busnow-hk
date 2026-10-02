// Lightweight bundled POI index for HK — used to match place-name queries
// ("中環", "Central", "Harbour City") and surface nearby stops/routes.
// Not exhaustive; covers MTR stations, key districts and major landmarks.
// Coordinates are approximate (decimal degrees).

export interface Place {
  id: string;
  name_tc: string;
  name_sc?: string;
  name_en: string;
  lat: number;
  lng: number;
  /** MTR line codes (optional) — for visual cues */
  mtr?: string[];
}

export const PLACES: Place[] = [
  // ─── MTR stations (heavy rail) ──────────────────────────────────────────
  { id: 'mtr-central',     name_tc: '中環',       name_sc: '中环',       name_en: 'Central',     lat: 22.2820, lng: 114.1585, mtr: ['ISL', 'TWL'] },
  { id: 'mtr-hunghom',     name_tc: '紅磡',       name_sc: '红磡',       name_en: 'Hung Hom',    lat: 22.3049, lng: 114.1820, mtr: ['ERL'] },
  { id: 'mtr-mongkok',     name_tc: '旺角',       name_sc: '旺角',       name_en: 'Mong Kok',    lat: 22.3186, lng: 114.1697, mtr: ['TWL'] },
  { id: 'mtr-tsimshatsui', name_tc: '尖沙咀',     name_sc: '尖沙咀',     name_en: 'Tsim Sha Tsui', lat: 22.2980, lng: 114.1722, mtr: ['TWL'] },
  { id: 'mtr-causewaybay', name_tc: '銅鑼灣',     name_sc: '铜锣湾',     name_en: 'Causeway Bay', lat: 22.2803, lng: 114.1847, mtr: ['ISL'] },
  { id: 'mtr-wanchai',     name_tc: '灣仔',       name_sc: '湾仔',       name_en: 'Wan Chai',    lat: 22.2779, lng: 114.1733, mtr: ['ISL'] },
  { id: 'mtr-admiralty',   name_tc: '金鐘',       name_sc: '金钟',       name_en: 'Admiralty',   lat: 22.2792, lng: 114.1648, mtr: ['ISL', 'TWL', 'SIL'] },
  { id: 'mtr-quarrybay',    name_tc: '鰂魚涌',     name_sc: '鲗鱼涌',     name_en: 'Quarry Bay',  lat: 22.2880, lng: 114.2093, mtr: ['ISL', 'TCL'] },
  { id: 'mtr-tinhang',     name_tc: '天恒',       name_en: 'Tin Hang',     lat: 22.3175, lng: 114.1390, mtr: ['LRW'] },
  { id: 'mtr-kwuntong',    name_tc: '觀塘',       name_sc: '观塘',       name_en: 'Kwun Tong',   lat: 22.3137, lng: 114.2259, mtr: ['KTL'] },
  { id: 'mtr-kowloonbay',  name_tc: '九龍灣',     name_sc: '九龙湾',     name_en: 'Kowloon Bay', lat: 22.3230, lng: 114.2159, mtr: ['KTL'] },
  { id: 'mtr-lokfoo',      name_tc: '樂富',       name_sc: '乐富',       name_en: 'Lok Fu',      lat: 22.3389, lng: 114.1870, mtr: ['KTL'] },
  { id: 'mtr-wutai',        name_tc: '烏溪沙',     name_sc: '乌溪沙',     name_en: 'Wu Kai Sha',   lat: 22.4294, lng: 114.2430, mtr: ['ERL'] },
  { id: 'mtr-taiwai',      name_tc: '大圍',       name_sc: '大围',       name_en: 'Tai Wai',     lat: 22.3733, lng: 114.1786, mtr: ['ERL'] },
  { id: 'mtr-sha Tin',      name_tc: '沙田',       name_sc: '沙田',       name_en: 'Sha Tin',     lat: 22.3816, lng: 114.1847, mtr: ['ERL'] },
  { id: 'mtr-fotan',       name_tc: '火炭',       name_sc: '火炭',       name_en: 'Fo Tan',      lat: 22.3931, lng: 114.1984, mtr: ['ERL'] },
  { id: 'mtr-racecourse',  name_tc: '馬場',       name_sc: '马场',       name_en: 'Racecourse',  lat: 22.4003, lng: 114.2043, mtr: ['ERL'] },
  { id: 'mtr-university',  name_tc: '大學',       name_sc: '大学',       name_en: 'University',  lat: 22.4135, lng: 114.2102, mtr: ['ERL'] },
  { id: 'mtr-tai Po Market', name_tc: '大埔墟',     name_sc: '大埔墟',     name_en: 'Tai Po Market', lat: 22.4446, lng: 114.1704, mtr: ['ERL'] },
  { id: 'mtr-tai Wo',        name_tc: '太和',       name_sc: '太和',       name_en: 'Tai Wo',      lat: 22.4514, lng: 114.1614, mtr: ['ERL'] },
  { id: 'mtr-fanling',     name_tc: '粉嶺',       name_sc: '粉岭',       name_en: 'Fanling',     lat: 22.4922, lng: 114.1386, mtr: ['ERL'] },
  { id: 'mtr-sheungshui',  name_tc: '上水',       name_sc: '上水',       name_en: 'Sheung Shui', lat: 22.5009, lng: 114.1280, mtr: ['ERL'] },
  { id: 'mtr-lo Wu',       name_tc: '羅湖',       name_sc: '罗湖',       name_en: 'Lo Wu',      lat: 22.5283, lng: 114.1133, mtr: ['ERL'] },
  { id: 'mtr-tsuen Wan',   name_tc: '荃灣',       name_sc: '荃湾',       name_en: 'Tsuen Wan',   lat: 22.3734, lng: 114.1117, mtr: ['TWL'] },
  { id: 'mtr-tuennymun',   name_tc: '屯門',       name_sc: '屯门',       name_en: 'Tuen Mun',    lat: 22.3953, lng: 113.9733, mtr: ['LRW'] },
  { id: 'mtr-yuenlong',    name_tc: '元朗',       name_sc: '元朗',       name_en: 'Yuen Long',   lat: 22.4459, lng: 114.0348, mtr: ['LRW'] },
  { id: 'mtr-tin Shui Wai', name_tc: '天水圍',     name_sc: '天水围',     name_en: 'Tin Shui Wai', lat: 22.4483, lng: 114.0051, mtr: ['LRW'] },
  { id: 'mtr-siuhong',     name_tc: '兆康',       name_sc: '兆康',       name_en: 'Siu Hong',    lat: 22.4178, lng: 113.9763, mtr: ['LRW'] },

  // ─── Major districts & landmarks ─────────────────────────────────────────
  { id: 'dist-central',    name_tc: '中環',       name_sc: '中环',       name_en: 'Central',     lat: 22.2819, lng: 114.1589 },
  { id: 'dist-wanchai',    name_tc: '灣仔',       name_sc: '湾仔',       name_en: 'Wan Chai',    lat: 22.2780, lng: 114.1740 },
  { id: 'dist-causewaybay', name_tc: '銅鑼灣',    name_sc: '铜锣湾',    name_en: 'Causeway Bay', lat: 22.2810, lng: 114.1849 },
  { id: 'dist-tst',        name_tc: '尖沙咀',     name_sc: '尖沙咀',     name_en: 'Tsim Sha Tsui', lat: 22.2980, lng: 114.1720 },
  { id: 'dist-mongkok',    name_tc: '旺角',       name_sc: '旺角',       name_en: 'Mong Kok',    lat: 22.3190, lng: 114.1700 },
  { id: 'dist-yau Ma Tei', name_tc: '油麻地',     name_sc: '油麻地',     name_en: 'Yau Ma Tei',  lat: 22.3140, lng: 114.1700 },
  { id: 'dist-jordan',     name_tc: '佐敦',       name_sc: '佐敦',       name_en: 'Jordan',      lat: 22.3050, lng: 114.1710 },
  { id: 'dist-hunghom',    name_tc: '紅磡',       name_sc: '红磡',       name_en: 'Hung Hom',    lat: 22.3050, lng: 114.1820 },
  { id: 'dist-to Kwa Wan', name_tc: '土瓜灣',     name_sc: '土瓜湾',     name_en: 'To Kwa Wan',  lat: 22.3160, lng: 114.1850 },
  { id: 'dist-kowloontong', name_tc: '九龍塘',    name_sc: '九龙塘',    name_en: 'Kowloon Tong', lat: 22.3370, lng: 114.1770 },
  { id: 'dist-shamshuipo', name_tc: '深水埗',     name_sc: '深水埗',     name_en: 'Sham Shui Po', lat: 22.3310, lng: 114.1590 },
  { id: 'dist-quarrybay',  name_tc: '鰂魚涌',     name_sc: '鲗鱼涌',     name_en: 'Quarry Bay',  lat: 22.2880, lng: 114.2090 },
  { id: 'dist-north Point', name_tc: '北角',      name_sc: '北角',       name_en: 'North Point', lat: 22.2850, lng: 114.1990 },
  { id: 'dist-taikoo',     name_tc: '太古',       name_sc: '太古',       name_en: 'Taikoo',      lat: 22.2850, lng: 114.2160 },
  { id: 'dist-sha Tin',    name_tc: '沙田',       name_sc: '沙田',       name_en: 'Sha Tin',     lat: 22.3816, lng: 114.1847 },
  { id: 'dist-taipo',      name_tc: '大埔',       name_sc: '大埔',       name_en: 'Tai Po',      lat: 22.4501, lng: 114.1687 },
  { id: 'dist-fanling',    name_tc: '粉嶺',       name_sc: '粉岭',       name_en: 'Fanling',     lat: 22.4949, lng: 114.1395 },
  { id: 'dist-tin Shui Wai',   name_tc: '天水圍',   name_sc: '天水围',    name_en: 'Tin Shui Wai', lat: 22.4501, lng: 114.0029 },
  { id: 'dist-yuenlong',   name_tc: '元朗',       name_sc: '元朗',       name_en: 'Yuen Long',   lat: 22.4459, lng: 114.0348 },
  { id: 'dist-tuennymun',  name_tc: '屯門',       name_sc: '屯门',       name_en: 'Tuen Mun',    lat: 22.3953, lng: 113.9733 },
  { id: 'dist-tsuen Wan',  name_tc: '荃灣',       name_sc: '荃湾',       name_en: 'Tsuen Wan',   lat: 22.3734, lng: 114.1117 },
  { id: 'dist-kwuntong',   name_tc: '觀塘',       name_sc: '观塘',       name_en: 'Kwun Tong',   lat: 22.3137, lng: 114.2259 },
  { id: 'dist-aberdeen',   name_tc: '香港仔',     name_sc: '香港仔',     name_en: 'Aberdeen',    lat: 22.2480, lng: 114.1560 },
  { id: 'dist-stanley',    name_tc: '赤柱',       name_sc: '赤柱',       name_en: 'Stanley',     lat: 22.2180, lng: 114.2100 },
  { id: 'dist-repulsebay',  name_tc: '淺水灣',     name_sc: '浅水湾',     name_en: 'Repulse Bay', lat: 22.2360, lng: 114.1990 },

  // ─── Landmarks ───────────────────────────────────────────────────────────
  { id: 'lm-disneyland',     name_tc: '香港迪士尼樂園', name_sc: '香港迪士尼乐园', name_en: 'Hong Kong Disneyland', lat: 22.3130, lng: 114.0415 },
  { id: 'lm-oceanpark',      name_tc: '海洋公園',   name_sc: '海洋公园',   name_en: 'Ocean Park',  lat: 22.2465, lng: 114.1744 },
  { id: 'lm-peak',           name_tc: '山頂',       name_sc: '山顶',       name_en: 'The Peak',    lat: 22.2710, lng: 114.1490 },
  { id: 'lm-tramway',        name_tc: '中環街市',    name_sc: '中环街市',    name_en: 'Central Market', lat: 22.2826, lng: 114.1580 },
  { id: 'lm-starferry',      name_tc: '天星小輪',   name_sc: '天星小轮',   name_en: 'Star Ferry',  lat: 22.2940, lng: 114.1706 },
  { id: 'lm-hkia',           name_tc: '香港國際機場', name_sc: '香港国际机场', name_en: 'HKIA',        lat: 22.3080, lng: 113.9185 },
  { id: 'lm-hkzoombotanic',  name_tc: '香港動植物公園', name_sc: '香港动植物公园', name_en: 'HK Zoological & Botanical Gardens', lat: 22.2770, lng: 114.1550 },
  { id: 'lm-k11',            name_tc: 'K11 購物藝術館', name_sc: 'K11 购物艺术馆', name_en: 'K11 Musea',   lat: 22.2940, lng: 114.1740 },
  { id: 'lm-harbourcity',    name_tc: '海港城',     name_sc: '海港城',     name_en: 'Harbour City', lat: 22.2970, lng: 114.1690 },
  { id: 'lm-timesquare',     name_tc: '時代廣場',   name_sc: '时代广场',   name_en: 'Times Square', lat: 22.2780, lng: 114.1830 },
  { id: 'lm-ifc',            name_tc: '國際金融中心', name_sc: '国际金融中心', name_en: 'IFC Mall',    lat: 22.2850, lng: 114.1580 },
  { id: 'lm-pacificplace',   name_tc: '太古廣場',   name_sc: '太古广场',   name_en: 'Pacific Place', lat: 22.2770, lng: 114.1650 },
  { id: 'lm-elements',       name_tc: '圓方',       name_sc: '圆方',       name_en: 'Elements',    lat: 22.3040, lng: 114.1620 },
  { id: 'lm-langhamplace',   name_tc: '朗豪坊',     name_sc: '朗豪坊',     name_en: 'Langham Place', lat: 22.3180, lng: 114.1700 },
  { id: 'lm-vcity',          name_tc: 'V city',     name_sc: 'V city',      name_en: 'V city',       lat: 22.3660, lng: 114.1090 },
  { id: 'lm-maritime',       name_tc: '海洋公園碼頭', name_sc: '海洋公园码头', name_en: 'Ocean Park Pier', lat: 22.2465, lng: 114.1760 },
  { id: 'lm-wtc',            name_tc: '會議展覽中心', name_sc: '会议展览中心', name_en: 'HK Convention & Exhibition Centre', lat: 22.2830, lng: 114.1740 },
  { id: 'lm-goldfish',       name_tc: '金魚街',     name_sc: '金鱼街',     name_en: 'Goldfish Market', lat: 22.3140, lng: 114.1700 },
  { id: 'lm-flowermarket',   name_tc: '花墟',       name_sc: '花墟',       name_en: 'Flower Market', lat: 22.3280, lng: 114.1710 },
  { id: 'lm-ladiesmarket',   name_tc: '女人街',     name_sc: '女人街',     name_en: 'Ladies Market', lat: 22.3180, lng: 114.1700 },
  { id: 'lm-temple-night',   name_tc: '廟街夜市',   name_sc: '庙街夜市',   name_en: 'Temple Street Night Market', lat: 22.3060, lng: 114.1700 },
  { id: 'lm-stanley-market', name_tc: '赤柱市集',   name_sc: '赤柱市集',   name_en: 'Stanley Market', lat: 22.2180, lng: 114.2110 },
  { id: 'lm-avenueofstars',  name_tc: '星光大道',   name_sc: '星光大道',   name_en: 'Avenue of Stars', lat: 22.2960, lng: 114.1730 },
  { id: 'lm-clocktower',     name_tc: '尖沙咀鐘樓', name_sc: '尖沙咀钟楼', name_en: 'TST Clock Tower', lat: 22.2940, lng: 114.1706 },
  { id: 'lm-palace',         name_tc: '禮賓府',     name_sc: '礼宾府',     name_en: 'Government House', lat: 22.2780, lng: 114.1620 },
  { id: 'lm-legco',          name_tc: '立法會大樓', name_sc: '立法会大楼', name_en: 'Legislative Council', lat: 22.2820, lng: 114.1620 },
  { id: 'lm-centralpolice',  name_tc: '中區警署',   name_sc: '中区警署',   name_en: 'Central Police Station', lat: 22.2820, lng: 114.1580 },
  { id: 'lm-tinHau',         name_tc: '天后廟',     name_sc: '天后庙',     name_en: 'Tin Hau Temple', lat: 22.2820, lng: 114.1900 },
  { id: 'lm-manMo',          name_tc: '文武廟',     name_sc: '文武庙',     name_en: 'Man Mo Temple', lat: 22.2840, lng: 114.1510 },
  { id: 'lm-10KC',           name_tc: '西貢',         name_sc: '西贡',       name_en: 'Sai Kung',    lat: 22.3810, lng: 114.2720 },
  { id: 'lm-campbell',       name_tc: '金鐘廊',     name_sc: '金钟廊',     name_en: 'Pacific Place', lat: 22.2770, lng: 114.1650 }
];

export function searchPlaces(query: string, limit = 8): Place[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const hits: { p: Place; score: number }[] = [];
  for (const p of PLACES) {
    const fields = [p.name_tc, p.name_sc, p.name_en].map(s => (s || '').toLowerCase());
    let score = 0;
    for (const f of fields) {
      if (!f) continue;
      if (f === q) score = Math.max(score, 100);
      else if (f.startsWith(q)) score = Math.max(score, 80);
      else if (f.includes(q)) score = Math.max(score, 50);
    }
    if (score > 0) hits.push({ p, score });
  }
  hits.sort((a, b) => b.score - a.score);
  return hits.slice(0, limit).map(h => h.p);
}