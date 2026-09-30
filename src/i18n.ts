export type Lang = 'zh-HK' | 'zh-CN' | 'en';

export const STRINGS = {
  'zh-HK': {
    appName: 'BusNow',
    appTagline: '香港巴士',
    home: '主頁',
    search: '搜尋',
    favRoutes: '收藏路線',
    favStops: '收藏車站',
    recent: '最近查過',
    noFavRoutes: '尚未收藏任何路線',
    noFavStops: '尚未收藏任何車站',
    noRecent: '未有最近紀錄',
    searchPlaceholder: '輸入路線號碼或車站名稱',
    stop: '車站',
    route: '路線',
    stops: '車站',
    routes: '路線',
    eta: '到站',
    arriving: '即將到站',
    min: '分鐘',
    noEta: '暫時未有班次資料',
    addFav: '收藏',
    removeFav: '取消收藏',
    back: '返回',
    direction: '方向',
    towards: '往',
    language: '語言',
    loading: '載入中…',
    error: '載入失敗，請稍後重試',
    retry: '重試',
    dataSource: '資料來源：運輸署資料一線通；KMB／城巴／龍運。預計到站時間約每分鐘更新，只供參考。',
    refresh: '更新',
    lastUpdate: '更新於',
    scheduled: '原定班次',
    wheelchair: '低地台',
    empty: '未有結果',
    resultsFor: '「{q}」嘅結果',
    languageName: '繁體中文'
  },
  'zh-CN': {
    appName: 'BusNow',
    appTagline: '香港巴士',
    home: '主页',
    search: '搜索',
    favRoutes: '收藏路线',
    favStops: '收藏车站',
    recent: '最近查询',
    noFavRoutes: '尚未收藏任何路线',
    noFavStops: '尚未收藏任何车站',
    noRecent: '暂无最近记录',
    searchPlaceholder: '输入路线号码或车站名称',
    stop: '车站',
    route: '路线',
    stops: '车站',
    routes: '路线',
    eta: '到站',
    arriving: '即将到站',
    min: '分钟',
    noEta: '暂无班次信息',
    addFav: '收藏',
    removeFav: '取消收藏',
    back: '返回',
    direction: '方向',
    towards: '往',
    language: '语言',
    loading: '载入中…',
    error: '载入失败，请稍后重试',
    retry: '重试',
    dataSource: '数据来源：运输署资料一线通；KMB／城巴／龙运。预计到站时间约每分钟更新，仅供参考。',
    refresh: '更新',
    lastUpdate: '更新于',
    scheduled: '原定班次',
    wheelchair: '低地台',
    empty: '没有结果',
    resultsFor: '“{q}”的结果',
    languageName: '简体中文'
  },
  en: {
    appName: 'BusNow',
    appTagline: 'Hong Kong Bus',
    home: 'Home',
    search: 'Search',
    favRoutes: 'Saved routes',
    favStops: 'Saved stops',
    recent: 'Recent',
    noFavRoutes: 'No saved routes yet',
    noFavStops: 'No saved stops yet',
    noRecent: 'No recent searches',
    searchPlaceholder: 'Route number or stop name',
    stop: 'Stop',
    route: 'Route',
    stops: 'Stops',
    routes: 'Routes',
    eta: 'ETA',
    arriving: 'Arriving',
    min: 'min',
    noEta: 'No upcoming buses',
    addFav: 'Save',
    removeFav: 'Remove',
    back: 'Back',
    direction: 'Direction',
    towards: 'to',
    language: 'Language',
    loading: 'Loading…',
    error: 'Failed to load — please retry',
    retry: 'Retry',
    dataSource: 'Data: HK Transport Department Data One. ETAs from KMB, LWB and Citybus. Refreshed ~every minute. For reference only.',
    refresh: 'Refresh',
    lastUpdate: 'Updated',
    scheduled: 'Scheduled',
    wheelchair: 'Low-floor',
    empty: 'No results',
    resultsFor: 'Results for “{q}”',
    languageName: 'English'
  }
} as const;

export type Key = keyof typeof STRINGS['en'];

export function t(lang: Lang, key: Key, vars?: Record<string, string | number>): string {
  let s: string = STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return s;
}

export function name(lang: Lang, item: { name_en?: string; name_tc?: string; name_sc?: string }): string {
  if (lang === 'zh-HK') return item.name_tc || item.name_en || '';
  if (lang === 'zh-CN') return item.name_sc || item.name_tc || item.name_en || '';
  return item.name_en || item.name_tc || '';
}
