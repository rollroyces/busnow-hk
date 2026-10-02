import { useEffect, useState } from 'react';
import { useFavRoutes, useFavStops, useRecent } from '../storage';
import { t, type Lang, name } from '../i18n';
import type { Route } from '../App';
import { getKmbRoutes, getLwbRoutes, getCtbRoutes, getKmbStops, type Stop, type Route as BusRoute } from '../api';
import { opBadgeClass } from '../api';

export default function Home({ lang, goto }: { lang: Lang; goto: (r: Route) => void }) {
  const favStops = useFavStops();
  const favRoutes = useFavRoutes();
  const recent = useRecent();

  const [allStops, setAllStops] = useState<Stop[]>([]);
  const [allRoutes, setAllRoutes] = useState<BusRoute[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [stops, kmb, lwb, ctb] = await Promise.all([
          getKmbStops().catch(() => [] as Stop[]),
          getKmbRoutes().catch(() => [] as BusRoute[]),
          getLwbRoutes().catch(() => [] as BusRoute[]),
          getCtbRoutes().catch(() => [] as BusRoute[])
        ]);
        if (cancelled) return;
        setAllStops(stops);
        setAllRoutes([...kmb, ...lwb, ...ctb]);
      } catch {/* no-op */}
    })();
    return () => { cancelled = true; };
  }, []);

  const stopsById = new Map<string, Stop>(allStops.map(s => [s.stop, s] as const));
  const routesById = new Map<string, BusRoute>(allRoutes.map(r => [`${r.co}|${r.route}|${r.dir ?? 'O'}`, r] as const));

  const favStopList = Array.from(favStops.set)
    .map(id => stopsById.get(id))
    .filter((x): x is Stop => !!x);
  const favRouteList = Array.from(favRoutes.set)
    .map(id => routesById.get(id))
    .filter((x): x is BusRoute => !!x);

  return (
    <div>
      <section className="mt-3 px-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-medium text-muted">{t(lang, 'favRoutes')}</h2>
          {favRouteList.length > 0 && <span className="text-xs text-muted">{favRouteList.length}</span>}
        </div>
        <div className="mt-2 card overflow-hidden">
          {favRouteList.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-muted">{t(lang, 'noFavRoutes')}</div>
          )}
          {favRouteList.map(r => {
            const key = `${r.co}|${r.route}|${r.dir ?? 'O'}`;
            return (
              <div key={key} className="card-row cursor-pointer" onClick={() => goto({ name: 'route', co: r.co, route: r.route, dir: (r.dir ?? 'O') as 'O' | 'I' })}>
                <span className={`badge ${opBadgeClass(r.co)}`}>{r.route}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-cream">{name(lang, { name_en: r.orig_en, name_tc: r.orig_tc, name_sc: r.orig_sc })} → {name(lang, { name_en: r.dest_en, name_tc: r.dest_tc, name_sc: r.dest_sc })}</p>
                  <p className="text-xs text-muted">{r.co}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-4 px-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-medium text-muted">{t(lang, 'favStops')}</h2>
          {favStopList.length > 0 && <span className="text-xs text-muted">{favStopList.length}</span>}
        </div>
        <div className="mt-2 card overflow-hidden">
          {favStopList.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-muted">{t(lang, 'noFavStops')}</div>
          )}
          {favStopList.map(s => (
            <div key={s.stop} className="card-row cursor-pointer" onClick={() => goto({ name: 'stop', id: s.stop })}>
              <div className="size-9 shrink-0 rounded-full bg-line/60 grid place-items-center text-cream">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 7-8 12-8 12s-8-5-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-cream">{name(lang, s)}</p>
                <p className="truncate text-xs text-muted">{s.stop}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-4 px-4">
        <h2 className="text-sm font-medium text-muted">{t(lang, 'recent')}</h2>
        <div className="mt-2 card overflow-hidden">
          {recent.list.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-muted">{t(lang, 'noRecent')}</div>
          )}
          {recent.list.map(item => (
            <div key={`${item.kind}:${item.id}`} className="card-row">
              <div
                className="min-w-0 flex-1 cursor-pointer"
                onClick={() => goto(item.kind === 'stop' ? { name: 'stop', id: item.id } : { name: 'route', co: item.id.split('|')[0], route: item.id.split('|')[1], dir: (item.id.split('|')[2] as 'O' | 'I') ?? 'O' })}
              >
                <p className="truncate text-sm font-semibold text-cream">{item.label}</p>
                <p className="text-xs text-muted">{item.kind === 'stop' ? t(lang, 'stop') : t(lang, 'route')}</p>
              </div>
              <button
                type="button"
                aria-label="Remove"
                className="shrink-0 rounded-full p-2 text-muted hover:text-bad"
                onClick={() => recent.remove(item.kind, item.id)}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
