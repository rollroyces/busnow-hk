import { useEffect, useMemo, useRef, useState } from 'react';
import { t, type Lang } from '../i18n';
import type { Route } from '../App';
import { getKmbRoutes, getLwbRoutes, getCtbRoutes, getKmbStops, type Stop, type Route as BusRoute, opBadgeClass } from '../api';
import { useRecent } from '../storage';

type Tab = 'all' | 'routes' | 'stops';

export default function Search({ lang, goto }: { lang: Lang; goto: (r: Route) => void }) {
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<Tab>('all');
  const [stops, setStops] = useState<Stop[]>([]);
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const recent = useRecent();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    let cancelled = false;
    (async () => {
      try {
        const [stopsRes, kmb, lwb, ctb] = await Promise.all([
          getKmbStops().catch(() => [] as Stop[]),
          getKmbRoutes().catch(() => [] as BusRoute[]),
          getLwbRoutes().catch(() => [] as BusRoute[]),
          getCtbRoutes().catch(() => [] as BusRoute[])
        ]);
        if (cancelled) return;
        setStops(stopsRes);
        setRoutes([...kmb, ...lwb, ...ctb]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const norm = (s: string) => s.toLowerCase().trim();
  const filteredRoutes = useMemo(() => {
    const needle = norm(q);
    if (!needle) return routes.slice(0, 50);
    return routes.filter(r => {
      if (r.route.toLowerCase().includes(needle)) return true;
      const o = `${r.orig_tc} ${r.orig_sc} ${r.orig_en}`.toLowerCase();
      const d = `${r.dest_tc} ${r.dest_sc} ${r.dest_en}`.toLowerCase();
      return o.includes(needle) || d.includes(needle);
    }).slice(0, 80);
  }, [q, routes]);

  const filteredStops = useMemo(() => {
    const needle = norm(q);
    if (!needle) return stops.slice(0, 50);
    return stops.filter(s => `${s.name_tc} ${s.name_sc} ${s.name_en} ${s.stop}`.toLowerCase().includes(needle)).slice(0, 80);
  }, [q, stops]);

  return (
    <div className="px-4 pt-3">
      <div className="relative">
        <svg viewBox="0 0 24 24" width="18" height="18" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.34-4.34"/></svg>
        <input
          ref={inputRef}
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder={t(lang, 'searchPlaceholder')}
          className="w-full rounded-full border border-line bg-card py-3 pl-10 pr-4 text-base text-cream placeholder:text-muted focus:border-led focus:outline-none"
        />
      </div>

      <div className="mt-3 flex gap-2 text-sm">
        <button type="button" className={`rounded-full px-3 py-1.5 ${tab === 'all' ? 'bg-led text-led-ink font-semibold' : 'bg-card border border-line text-muted'}`} onClick={() => setTab('all')}>All</button>
        <button type="button" className={`rounded-full px-3 py-1.5 ${tab === 'routes' ? 'bg-led text-led-ink font-semibold' : 'bg-card border border-line text-muted'}`} onClick={() => setTab('routes')}>{t(lang, 'routes')}</button>
        <button type="button" className={`rounded-full px-3 py-1.5 ${tab === 'stops' ? 'bg-led text-led-ink font-semibold' : 'bg-card border border-line text-muted'}`} onClick={() => setTab('stops')}>{t(lang, 'stops')}</button>
      </div>

      {loading && <p className="mt-6 text-center text-sm text-muted">{t(lang, 'loading')}</p>}

      {(tab === 'all' || tab === 'routes') && filteredRoutes.length > 0 && (
        <section className="mt-4">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted">{t(lang, 'routes')}</h3>
          <div className="mt-2 card overflow-hidden">
            {filteredRoutes.map(r => {
              const dir = (r.dir ?? 'O') as 'O' | 'I';
              const id = `${r.co}|${r.route}|${dir}`;
              return (
                <div
                  key={id}
                  className="card-row cursor-pointer"
                  onClick={() => {
                    recent.push({ kind: 'route', id, label: `${r.co} ${r.route}` });
                    goto({ name: 'route', co: r.co, route: r.route, dir });
                  }}
                >
                  <span className={`badge ${opBadgeClass(r.co)}`}>{r.route}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-cream">
                      {routeLabel(lang, r)}
                    </p>
                    <p className="truncate text-xs text-muted">{r.co}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {(tab === 'all' || tab === 'stops') && filteredStops.length > 0 && (
        <section className="mt-4">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted">{t(lang, 'stops')}</h3>
          <div className="mt-2 card overflow-hidden">
            {filteredStops.map(s => (
              <div
                key={s.stop}
                className="card-row cursor-pointer"
                onClick={() => {
                  recent.push({ kind: 'stop', id: s.stop, label: stopLabel(lang, s) });
                  goto({ name: 'stop', id: s.stop });
                }}
              >
                <div className="size-9 shrink-0 rounded-full bg-line/60 grid place-items-center text-cream">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 7-8 12-8 12s-8-5-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-cream">{stopLabel(lang, s)}</p>
                  <p className="truncate text-xs text-muted">{s.stop}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!loading && q && filteredRoutes.length === 0 && filteredStops.length === 0 && (
        <p className="mt-10 text-center text-sm text-muted">{t(lang, 'empty')}</p>
      )}
    </div>
  );
}

function stopLabel(lang: Lang, s: Stop): string {
  if (lang === 'zh-HK') return s.name_tc || s.name_en;
  if (lang === 'zh-CN') return s.name_sc || s.name_tc || s.name_en;
  return s.name_en || s.name_tc;
}
function routeLabel(lang: Lang, r: BusRoute): string {
  if (lang === 'zh-HK') return `${r.orig_tc} → ${r.dest_tc}`;
  if (lang === 'zh-CN') return `${r.orig_sc || r.orig_tc} → ${r.dest_sc || r.dest_tc}`;
  return `${r.orig_en} → ${r.dest_en}`;
}
