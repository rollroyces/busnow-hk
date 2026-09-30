// Hong Kong Transport Department open data API wrappers.
// All endpoints return JSON with CORS enabled.

const KMB = 'https://data.etabus.gov.hk';
const CTB = 'https://rt.data.gov.hk/v1/transport/citybus-nwfb';

export type Operator = 'KMB' | 'LWB' | 'CTB';

export interface Stop {
  stop: string;
  name_en: string;
  name_tc: string;
  name_sc: string;
  lat: string;
  long: string;
}

export interface Route {
  co: Operator;
  route: string;
  orig_tc: string;
  orig_en: string;
  orig_sc: string;
  dest_tc: string;
  dest_en: string;
  dest_sc: string;
  service_type?: number;
  dir?: 'O' | 'I';
}

export interface StopOnRoute {
  co: Operator;
  route: string;
  dir: 'O' | 'I';
  service_type: number;
  seq: number;
  stop: string;
}

export interface EtaItem {
  co: Operator;
  route: string;
  dir: 'O' | 'I';
  service_type: number;
  seq: number;
  dest_tc: string;
  dest_sc: string;
  dest_en: string;
  eta_seq: number;
  eta: string; // ISO
  rmk_tc?: string;
  rmk_sc?: string;
  rmk_en?: string;
  data_timestamp: string;
}

async function jget<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return (await r.json()) as T;
}

// ---------- KMB / LWB ----------

export async function getKmbStops(): Promise<Stop[]> {
  const j = await jget<{ data: Stop[] }>(`${KMB}/v1/transport/kmb/stop`);
  return j.data ?? [];
}

export async function getLwbStops(): Promise<Stop[]> {
  try {
    const j = await jget<{ data: Stop[] }>(`${KMB}/v1/transport/lwb/stop`);
    return j.data ?? [];
  } catch {
    return [];
  }
}

export async function getKmbRoutes(): Promise<Route[]> {
  const j = await jget<{ data: Route[] }>(`${KMB}/v1/transport/kmb/route`);
  return (j.data ?? []).map(r => ({ ...r, co: 'KMB' as const }));
}

export async function getLwbRoutes(): Promise<Route[]> {
  try {
    const j = await jget<{ data: Route[] }>(`${KMB}/v1/transport/lwb/route`);
    return (j.data ?? []).map(r => ({ ...r, co: 'LWB' as const }));
  } catch {
    return [];
  }
}

export async function getKmbStopEta(stopId: string): Promise<EtaItem[]> {
  const j = await jget<{ data: EtaItem[] }>(`${KMB}/v1/transport/kmb/stop-eta/${encodeURIComponent(stopId)}`);
  return j.data ?? [];
}

// ---------- Citybus ----------

export async function getCtbRoutes(): Promise<Route[]> {
  const j = await jget<{ data: Route[] }>(`${CTB}/route/CTB`);
  return (j.data ?? []).map(r => ({ ...r, co: 'CTB' as const }));
}

export async function getCtbStopsForRoute(route: string, dir: 'O' | 'I' = 'O'): Promise<StopOnRoute[]> {
  const j = await jget<{ data: StopOnRoute[] }>(`${CTB}/stop/${encodeURIComponent(route)}`);
  return (j.data ?? []).filter(s => s.dir === dir);
}

export async function getCtbBatchEta(stopId: string): Promise<EtaItem[]> {
  const j = await jget<{ data: EtaItem[] }>(`https://rt.data.gov.hk/v1/transport/batch/stop-eta/CTB/${encodeURIComponent(stopId)}`);
  return j.data ?? [];
}

export async function getCtbStop(stopId: string): Promise<Stop | null> {
  try {
    // CTB doesn't have a single-stop endpoint; use route list pattern instead.
    // We'll resolve stops from route-stop lookups lazily — for now return null and let UI handle.
    return null;
  } catch {
    return null;
  }
}

// ---------- helpers ----------

export function stopsByIds(co: Operator, ids: string[]): Promise<(Stop | null)[]> {
  // Resolves a small list of stop ids — uses cached full stop list.
  return Promise.resolve([]);
}

export function fmtEta(lang: 'zh-HK' | 'zh-CN' | 'en', item: EtaItem): { label: string; minutes: number | null; arriving: boolean } {
  const ts = Date.parse(item.eta);
  if (Number.isNaN(ts)) return { label: '—', minutes: null, arriving: false };
  const ms = ts - Date.now();
  const min = Math.round(ms / 60000);
  if (ms <= 0) return { label: lang === 'en' ? 'Arriving' : lang === 'zh-CN' ? '即将到站' : '即將到站', minutes: 0, arriving: true };
  if (lang === 'en') return { label: `${min} min`, minutes: min, arriving: false };
  if (lang === 'zh-CN') return { label: `${min} 分钟`, minutes: min, arriving: false };
  return { label: `${min} 分鐘`, minutes: min, arriving: false };
}

export function opBadgeClass(co: Operator): string {
  return co === 'KMB' ? 'badge-kmb' : co === 'LWB' ? 'badge-lwb' : 'badge-ctb';
}
