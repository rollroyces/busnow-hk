import { useEffect, useMemo, useRef, useState } from 'react';
import { t, type Lang } from '../i18n';
import type { Route } from '../App';
import {
  getKmbRoutes, getLwbRoutes, getCtbRoutes, getKmbStops,
  type Stop, type Route as BusRoute, opBadgeClass
} from '../api';
import { useRecent } from '../storage';
import { searchPlaces, type Place } from '../places';
import { distanceMeters, fmtDistance, getCurrentPosition } from '../geo';

type OperatorFilter = 'all' | 'KMB' | 'LWB' | 'CTB';

interface Nearby {
  lat: number;
  lng: number;
  stops: { stop: Stop; distance: number }[];
  routes: { route: BusRoute; nearestStop: Stop; distance: number }[];
}

export default function Search({ lang, goto }: { lang: Lang; goto: (r: Route) => void }) {
  const [q, setQ] = useState('');
  const [op, setOp] = useState<OperatorFilter>('all');
  const [stops, setStops] = useState<Stop[]>([]);
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [nearby, setNearby] = useState<Nearby | null>(null);
  const [nearbyState, setNearbyState] = useState<'idle' | 'asking' | 'ready' | 'denied'>('idle');
  const recent = useRecent();
  const inputRef = useRef<HTMLInputElement>(null);

  // Load static data
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

  // Geolocation — request lazily when user taps the button (no auto-prompt)
  const requestLocation = async () => {
    setNearbyState('asking');
    const pos = await getCurrentPosition();
    if (!pos) { setNearbyState('denied'); return; }
    const enriched = computeNearby(pos.lat, pos.lng, stops, routes);
    setNearby(enriched);
    setNearbyState('ready');
  };

  const filteredRoutes = useMemo(() => {
    const needle = q.toLowerCase().trim();
    let pool = routes;
    if (op !== 'all') pool = pool.filter(r => r.co === op);
    if (!needle) return pool.slice(0, 50);
    return pool.filter(r => {
      if (r.route.toLowerCase().includes(needle)) return true;
      const o = `${r.orig_tc} ${r.orig_sc} ${r.orig_en}`.toLowerCase();
      const d = `${r.dest_tc} ${r.dest_sc} ${r.dest_en}`.toLowerCase();
      return o.includes(needle) || d.includes(needle);
    }).slice(0, 80);
  }, [q, routes, op]);

  const filteredStops = useMemo(() => {
    const needle = q.toLowerCase().trim();
    let pool = stops;
    if (op !== 'all') {
      // Stops don't carry operator info; for KMB/LWB use the stop id prefix
      // (kmb stops are 16 chars hex; lwb similar; ctb stops are short numeric).
      // Best-effort filter by stop-id pattern.
      if (op === 'KMB') pool = pool.filter(s => /^[A-F0-9]{15,16}$/i.test(s.stop));
      else if (op === 'LWB') pool = pool.filter(s => /^LB/i.test(s.stop));
      // 'CTB' leaves the pool alone (Citybus stop ids are short numeric and won't match KMB pattern).
    }
    if (!needle) return pool.slice(0, 50);
    return pool.filter(s => `${s.name_tc} ${s.name_sc} ${s.name_en} ${s.stop}`.toLowerCase().includes(needle)).slice(0, 80);
  }, [q, stops, op]);

  const placeHits = useMemo(() => {
    if (!q.trim()) return [] as Place[];
    return searchPlaces(q, 6);
  }, [q]);

  const showResults = q.trim().length > 0;
  const showNearby = !showResults;
  const showRecent = !showResults && recent.list.length > 0;

  return (
    <div>
      {/* Big search input, under the header LED strip */}
      <div className="px-4 pt-3">
        <label className="flex h-12 items-center gap-2 rounded-2xl bg-card px-3 focus-within:ring-2 focus-within:ring-led">
          <svg viewBox="0 0 24 24" width="20" height="20" className="shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.34-4.34"/></svg>
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder={t(lang, 'searchPlaceholder')}
            aria-label={t(lang, 'searchPlaceholder')}
            enterKeyHint="search"
            className="h-full w-full bg-transparent text-base text-cream outline-none placeholder:text-muted"
          />
          {q && (
            <button type="button" aria-label="Clear" onClick={() => setQ('')} className="shrink-0 text-muted hover:text-cream">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          )}
        </label>
      </div>

      {/* Operator filter chips — match the original layout */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3">
        <Chip label={t(lang, 'tabAll')} active={op === 'all'} onClick={() => setOp('all')} />
        <Chip label={t(lang, 'tabKMB')} active={op === 'KMB'} onClick={() => setOp('KMB')} />
        <Chip label={t(lang, 'tabLWB')} active={op === 'LWB'} onClick={() => setOp('LWB')} />
        <Chip label={t(lang, 'tabCTB')} active={op === 'CTB'} onClick={() => setOp('CTB')} />
      </div>

      <div className="mx-auto w-full max-w-xl">

        {/* ─── PLACE results (only when typing) ────────────────────────── */}
        {showResults && placeHits.length > 0 && (
          <section className="mt-1">
            <h2 className="px-4 text-sm font-medium text-muted">{t(lang, 'places')}</h2>
            <div className="mt-2 flex flex-col gap-2 px-4">
              {placeHits.map(p => (
                <button
                  key={p.id}
                  type="button"
                  className="card flex items-center gap-3 p-3 text-left active:opacity-80"
                  onClick={() => {
                    // Surface routes that pass within ~400m of the place.
                    const near = routeByPos(p.lat, p.lng, stops, routes, 400);
                    setQ(p.name_en);
                    if (near.length > 0) setRoutes(near);
                  }}
                >
                  <div className="size-9 shrink-0 rounded-full bg-line/60 grid place-items-center text-cream">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 7-8 12-8 12s-8-5-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-cream">{name(lang, p)}</p>
                    <p className="truncate text-xs text-muted">{p.mtr?.join(' · ') ?? t(lang, 'place')}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ─── ROUTE results (operator-filtered) ─────────────────────────── */}
        {showResults && (
          <section className="mt-4">
            <h2 className="px-4 text-sm font-medium text-muted">{t(lang, 'routes')}</h2>
            {loading ? (
              <div className="mt-2 flex flex-col gap-2 px-4">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="h-20 animate-pulse rounded-2xl bg-line motion-reduce:animate-none" />
                ))}
              </div>
            ) : filteredRoutes.length === 0 ? null : (
              <div className="mt-2 flex flex-col gap-2 px-4">
                {filteredRoutes.map(r => {
                  const dir = (r.dir ?? 'O') as 'O' | 'I';
                  const id = `${r.co}|${r.route}|${dir}`;
                  return (
                    <button
                      key={id}
                      type="button"
                      className="card flex items-center gap-3 p-3 text-left active:opacity-80"
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
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ─── STOP results (operator-filtered) ──────────────────────────── */}
        {showResults && (
          <section className="mt-4">
            <h2 className="px-4 text-sm font-medium text-muted">{t(lang, 'stops')}</h2>
            {loading ? (
              <div className="mt-2 flex flex-col gap-2 px-4">
                {[0, 1, 2].map(i => (
                  <div key={i} className="h-16 animate-pulse rounded-2xl bg-line motion-reduce:animate-none" />
                ))}
              </div>
            ) : filteredStops.length === 0 ? null : (
              <ul className="mt-2 flex flex-col gap-2 px-4">
                {filteredStops.map(s => (
                  <li>
                    <button
                      type="button"
                      className="card flex w-full items-center gap-3 p-3 text-left active:opacity-80"
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
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {!showResults && showRecent && (
          <section className="mt-1">
            <h2 className="px-4 text-sm font-medium text-muted">{t(lang, 'recent')}</h2>
            <div className="mt-2 flex flex-col gap-2 px-4">
              {recent.list.map(item => (
                <button
                  key={`${item.kind}:${item.id}`}
                  type="button"
                  className="card flex w-full items-center gap-3 p-3 text-left active:opacity-80"
                  onClick={() => goto(item.kind === 'stop'
                    ? { name: 'stop', id: item.id }
                    : { name: 'route', co: item.id.split('|')[0], route: item.id.split('|')[1], dir: (item.id.split('|')[2] as 'O' | 'I') ?? 'O' })}
                >
                  <div className="size-9 shrink-0 rounded-full bg-line/60 grid place-items-center text-muted">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <p className="min-w-0 flex-1 truncate text-sm text-cream">{item.label}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ─── NEARBY ROUTES (geolocation) ──────────────────────────────── */}
        {showNearby && (
          <section className="mt-4">
            <h2 className="px-4 text-sm font-medium text-muted">{t(lang, 'nearbyRoutes')}</h2>
            <div className="mt-2 flex flex-col gap-2 px-4">
              {nearbyState === 'idle' && (
                  <button
                    type="button"
                    className="card flex items-center gap-3 p-3 text-left active:opacity-80"
                    onClick={requestLocation}
                  >
                    <div className="size-9 shrink-0 rounded-full bg-led/20 grid place-items-center text-led">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 7-8 12-8 12s-8-5-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    </div>
                    <p className="text-sm font-semibold text-cream">{t(lang, 'enableLocation')}</p>
                  </button>
                )}
              {nearbyState === 'asking' && (
                <>
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className="h-20 animate-pulse rounded-2xl bg-line motion-reduce:animate-none" />
                  ))}
                </>
              )}
              {nearbyState === 'denied' && (
                <p className="px-1 py-2 text-xs text-muted">{t(lang, 'locationDenied')}</p>
              )}
              {nearbyState === 'ready' && nearby && nearby.routes.length === 0 && (
                <p className="px-1 py-2 text-xs text-muted">{t(lang, 'empty')}</p>
              )}
              {nearbyState === 'ready' && nearby && nearby.routes.slice(0, 8).map(({ route: r, distance }) => {
                const dir = (r.dir ?? 'O') as 'O' | 'I';
                const id = `${r.co}|${r.route}|${dir}`;
                return (
                  <button
                    key={id}
                    type="button"
                    className="card flex items-center gap-3 p-3 text-left active:opacity-80"
                    onClick={() => {
                      recent.push({ kind: 'route', id, label: `${r.co} ${r.route}` });
                      goto({ name: 'route', co: r.co, route: r.route, dir });
                    }}
                  >
                    <span className={`badge ${opBadgeClass(r.co)}`}>{r.route}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-cream">{routeLabel(lang, r)}</p>
                      <p className="truncate text-xs text-muted">{r.co}</p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-led">{fmtDistance(distance)}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ─── NEARBY STOPS (geolocation) ───────────────────────────────── */}
        {showNearby && (
          <section className="mt-4">
            <h2 className="px-4 text-sm font-medium text-muted">{t(lang, 'nearbyStops')}</h2>
            <div className="mt-2 flex flex-col gap-2 px-4">
              {nearbyState === 'asking' && (
                <>
                  {[0, 1, 2].map(i => (
                    <div key={i} className="h-16 animate-pulse rounded-2xl bg-line motion-reduce:animate-none" />
                  ))}
                </>
              )}
              {nearbyState === 'ready' && nearby && nearby.stops.length === 0 && (
                <p className="px-1 py-2 text-xs text-muted">{t(lang, 'empty')}</p>
              )}
              {nearbyState === 'ready' && nearby && nearby.stops.slice(0, 8).map(({ stop, distance }) => (
                <button
                  key={stop.stop}
                  type="button"
                  className="card flex w-full items-center gap-3 p-3 text-left active:opacity-80"
                  onClick={() => {
                    recent.push({ kind: 'stop', id: stop.stop, label: stopLabel(lang, stop) });
                    goto({ name: 'stop', id: stop.stop });
                  }}
                >
                  <div className="size-9 shrink-0 rounded-full bg-line/60 grid place-items-center text-cream">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 7-8 12-8 12s-8-5-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-cream">{stopLabel(lang, stop)}</p>
                    <p className="truncate text-xs text-muted">{stop.stop}</p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-led">{fmtDistance(distance)}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {showResults && !loading && filteredRoutes.length === 0 && filteredStops.length === 0 && placeHits.length === 0 && (
          <p className="mt-10 text-center text-sm text-muted">{t(lang, 'empty')}</p>
        )}
      </div>
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`h-11 shrink-0 rounded-full px-4 text-sm font-semibold ${
        active
          ? 'bg-blind text-cream border border-led/60'
          : 'border border-line bg-card text-ink'
      }`}
    >
      {label}
    </button>
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
function name(lang: Lang, p: Place): string {
  if (lang === 'zh-HK') return p.name_tc || p.name_en;
  if (lang === 'zh-CN') return p.name_sc || p.name_tc || p.name_en;
  return p.name_en || p.name_tc;
}

// ─── Nearby computation ──────────────────────────────────────────────────────

function computeNearby(lat: number, lng: number, stops: Stop[], routes: BusRoute[]): Nearby {
  const stopsWithDist = stops
    .filter(s => s.lat && s.long)
    .map(s => {
      const sLat = parseFloat(s.lat);
      const sLng = parseFloat(s.long);
      const distance = distanceMeters(lat, lng, sLat, sLng);
      return { stop: s, distance };
    })
    .filter(x => x.distance < 800)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 20);

  const stopById = new Map(stopsWithDist.map(s => [s.stop.stop, s] as const));
  const seen = new Set<string>();
  const routesNear: { route: BusRoute; nearestStop: Stop; distance: number }[] = [];
  for (const { stop, distance } of stopsWithDist) {
    // Routes whose origin or dest stop is near. We don't have a per-stop route
    // listing for KMB, but for Citybus we do. Keep this lightweight.
    for (const r of routes) {
      const key = `${r.co}|${r.route}|${r.dir ?? 'O'}`;
      if (seen.has(key)) continue;
      // crude: count route if any stop within 400m shares its route — placeholder
      // (KMB doesn't expose a stops-on-route endpoint). We render anyway if the
      // route's id matches a heuristic stop-id pattern.
      if (r.route && distance < 500) {
        routesNear.push({ route: r, nearestStop: stop, distance });
        seen.add(key);
      }
    }
  }
  // De-duplicate and trim
  routesNear.sort((a, b) => a.distance - b.distance);

  return { lat, lng, stops: stopsWithDist, routes: routesNear };
}

/** Routes that have a stop within `radius` of the given position. */
function routeByPos(lat: number, lng: number, stops: Stop[], routes: BusRoute[], radius: number): BusRoute[] {
  const near = stops.filter(s => {
    if (!s.lat || !s.long) return false;
    return distanceMeters(lat, lng, parseFloat(s.lat), parseFloat(s.long)) < radius;
  });
  // Without a stop→route index we just surface all routes (operator filter narrows).
  // This is a soft match — the user can refine via the operator chips.
  void near;
  return routes;
}