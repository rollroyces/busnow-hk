import { useEffect, useMemo, useState } from 'react';
import { t, type Lang, name } from '../i18n';
import type { Route } from '../App';
import {
  getKmbRoutes, getLwbRoutes, getCtbRoutes,
  getCtbStopsForRoute,
  type Stop, type Route as BusRoute, type Operator
} from '../api';
import { useFavRoutes } from '../storage';

// Note: KMB doesn't expose a public "stops for a route" endpoint,
// so we surface route metadata + origin/destination here. For live
// stop-by-stop ETAs users go through the StopDetail page.

export default function RouteDetail({ lang, co, route, dir, goto }: { lang: Lang; co: string; route: string; dir: 'O' | 'I'; goto: (r: Route) => void }) {
  const fav = useFavRoutes();
  const [meta, setMeta] = useState<BusRoute | null>(null);
  const [ctbStops, setCtbStops] = useState<Stop[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [kmb, lwb, ctb] = await Promise.all([
          getKmbRoutes().catch(() => [] as BusRoute[]),
          getLwbRoutes().catch(() => [] as BusRoute[]),
          getCtbRoutes().catch(() => [] as BusRoute[])
        ]);
        const all = [...kmb, ...lwb, ...ctb];
        const m = all.find(r => r.co === co && r.route === route && (r.dir ?? 'O') === dir);
        if (cancelled) return;
        setMeta(m ?? null);

        // For Citybus, fetch the stop list for this route.
        if (co === 'CTB' && m) {
          try {
            const stops = await getCtbStopsForRoute(route, dir);
            if (cancelled) return;
            setCtbStops(stops.map(s => ({ stop: s.stop, name_en: '', name_tc: '', name_sc: '', lat: '', long: '' })));
          } catch {
            setCtbStops([]);
          }
        } else {
          setCtbStops(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [co, route, dir]);

  const id = `${co}|${route}|${dir}`;
  const isFav = fav.has(id);

  const origLabel = useMemo(() => {
    if (!meta) return '';
    if (lang === 'en') return meta.orig_en;
    if (lang === 'zh-CN') return meta.orig_sc || meta.orig_tc;
    return meta.orig_tc;
  }, [meta, lang]);

  const destLabel = useMemo(() => {
    if (!meta) return '';
    if (lang === 'en') return meta.dest_en;
    if (lang === 'zh-CN') return meta.dest_sc || meta.dest_tc;
    return meta.dest_tc;
  }, [meta, lang]);

  return (
    <div className="px-4 pt-3">
      <button
        type="button"
        onClick={() => goto({ name: 'search' })}
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-cream"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        {t(lang, 'back')}
      </button>

      <div className="card p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted">{t(lang, 'route')} · {co}</p>
            <div className="mt-1 flex items-center gap-3">
              <span className={`badge ${badgeFor(co as Operator)} text-base px-3 py-1`}>{route}</span>
            </div>
            <p className="mt-3 text-sm text-cream">{origLabel} → {destLabel}</p>
          </div>
          <button
            type="button"
            onClick={() => fav.toggle(id)}
            aria-label={isFav ? t(lang, 'removeFav') : t(lang, 'addFav')}
            className={`shrink-0 rounded-full p-2 ${isFav ? 'text-led' : 'text-muted hover:text-cream'}`}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>
            </svg>
          </button>
        </div>
      </div>

      {loading && <p className="mt-6 text-center text-sm text-muted">{t(lang, 'loading')}</p>}

      {co === 'CTB' && ctbStops && ctbStops.length > 0 && (
        <section className="mt-4">
          <h3 className="px-1 text-xs font-medium uppercase tracking-wide text-muted">{t(lang, 'stops')}</h3>
          <div className="mt-2 card overflow-hidden">
            {ctbStops.map((s, i) => (
              <div key={`${s.stop}-${i}`} className="card-row cursor-pointer" onClick={() => goto({ name: 'stop', id: s.stop })}>
                <span className="grid size-7 place-items-center rounded-full bg-line/60 text-xs font-bold text-muted">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-cream">{s.stop}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {co !== 'CTB' && !loading && (
        <p className="mt-6 px-1 text-center text-xs text-muted">
          {lang === 'en'
            ? 'Tap a stop on the map or search by stop name to see live arrivals.'
            : lang === 'zh-CN'
              ? '请点击车站或以名称搜寻以查看实时到站时间。'
              : '請喺搜尋輸入車站名稱以睇實時到站時間。'}
        </p>
      )}
    </div>
  );
}

function badgeFor(co: Operator): string {
  return co === 'KMB' ? 'badge-kmb' : co === 'LWB' ? 'badge-lwb' : 'badge-ctb';
}
