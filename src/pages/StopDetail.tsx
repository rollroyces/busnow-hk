import { useEffect, useState } from 'react';
import { t, type Lang, name } from '../i18n';
import type { Route } from '../App';
import {
  getKmbStopEta, getCtbBatchEta, fmtEta, destLabel, remarkLabel, hasValidEta,
  opBadgeClass,
  type EtaItem, type Stop
} from '../api';
import { useFavStops, useRecent } from '../storage';
import { getKmbStops } from '../api';

export default function StopDetail({ lang, stopId, goto }: { lang: Lang; stopId: string; goto: (r: Route) => void }) {
  const fav = useFavStops();
  const recent = useRecent();
  const [stop, setStop] = useState<Stop | null>(null);
  const [etas, setEtas] = useState<EtaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const [kmb, ctb] = await Promise.all([
        getKmbStopEta(stopId).catch(() => [] as EtaItem[]),
        getCtbBatchEta(stopId).catch(() => [] as EtaItem[])
      ]);
      // Keep only entries that have a real, parseable ETA — CTB returns
      // rows with empty `eta` for KMB-cycle routes that we can't render.
      const merged = [...kmb, ...ctb].filter(hasValidEta);
      merged.sort((a, b) => Date.parse(a.eta) - Date.parse(b.eta));
      setEtas(merged);
      setLastUpdate(new Date());
    } catch (e: any) {
      setError(e?.message ?? 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stops = await getKmbStops();
        if (cancelled) return;
        setStop(stops.find(s => s.stop === stopId) ?? null);
      } catch {/* no-op */}
    })();
    refresh();
    const id = setInterval(refresh, 60_000);
    return () => { cancelled = true; clearInterval(id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopId]);

  // Group ETAs by route
  const grouped = new Map<string, EtaItem[]>();
  for (const e of etas) {
    const key = `${e.co}|${e.route}|${e.dir}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(e);
  }
  const groups = Array.from(grouped.entries()).sort((a, b) => {
    const an = parseInt(a[0].split('|')[1], 10);
    const bn = parseInt(b[0].split('|')[1], 10);
    if (!Number.isNaN(an) && !Number.isNaN(bn)) return an - bn;
    return a[0].localeCompare(b[0]);
  });

  const isFav = fav.has(stopId);

  return (
    <div className="px-4 pt-3">
      <button
        type="button"
        onClick={() => goto({ name: 'home' })}
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-cream"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        {t(lang, 'back')}
      </button>

      <div className="card p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted">{t(lang, 'stop')}</p>
            <h2 className="mt-0.5 text-2xl font-black tracking-tight text-cream break-words">
              {stop ? name(lang, stop) : stopId}
            </h2>
            {stop && <p className="mt-1 text-xs text-muted">{stop.stop}</p>}
          </div>
          <button
            type="button"
            onClick={() => {
              fav.toggle(stopId);
              if (stop) {
                recent.push({ kind: 'stop', id: stopId, label: name(lang, stop) });
              }
            }}
            aria-label={isFav ? t(lang, 'removeFav') : t(lang, 'addFav')}
            className={`shrink-0 rounded-full p-2 ${isFav ? 'text-led' : 'text-muted hover:text-cream'}`}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>
            </svg>
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-muted">
          <span>
            {lastUpdate ? `${t(lang, 'lastUpdate')} ${lastUpdate.toLocaleTimeString(lang === 'en' ? 'en-GB' : 'zh-HK', { hour: '2-digit', minute: '2-digit' })}` : ''}
          </span>
          <button type="button" onClick={refresh} className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-1 hover:text-cream">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/></svg>
            {t(lang, 'refresh')}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 card p-4 text-center">
          <p className="text-sm text-bad">{t(lang, 'error')}</p>
          <button type="button" onClick={refresh} className="mt-3 rounded-full bg-led px-4 py-1.5 text-sm font-semibold text-led-ink">
            {t(lang, 'retry')}
          </button>
        </div>
      )}

      {!error && loading && etas.length === 0 && (
        <div className="mt-6 space-y-3">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-line motion-reduce:animate-none" />
          ))}
        </div>
      )}

      {!error && !loading && etas.length === 0 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-muted">{t(lang, 'noEta')}</p>
          <p className="mt-1 text-xs text-muted/70">
            {lang === 'en'
              ? 'Try a different stop, or check back in a few minutes — service may not be running right now.'
              : lang === 'zh-CN'
                ? '请尝试其他车站，或稍后再试——此时段可能没有班次。'
                : '請試吓其他車站，或者稍後再嚟——呢個時段可能冇班次。'}
          </p>
        </div>
      )}

      <div className="mt-4 space-y-3">
        {groups.map(([key, items]) => {
          const [co, route, dir] = key.split('|');
          const dest = items[0];
          const destText = destLabel(lang, dest);
          return (
            <div key={key} className="card overflow-hidden">
              <button
                type="button"
                className="flex w-full items-center gap-3 p-4 text-left"
                onClick={() => goto({ name: 'route', co, route, dir: dir === 'I' ? 'I' : 'O' })}
              >
                <span className={`badge ${opBadgeClass(co as any)}`}>{route}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-cream">{destText ? `${t(lang, 'towards')} ${destText}` : co}</p>
                  <p className="truncate text-xs text-muted">{co}</p>
                </div>
              </button>
              <div className="border-t border-line">
                {items.map((e, i) => {
                  const f = fmtEta(lang, e);
                  const cls = f.arriving ? 'eta eta-arriving' : (f.minutes !== null && f.minutes <= 5 ? 'eta eta-soon' : 'eta eta-later');
                  const remark = remarkLabel(lang, e);
                  return (
                    <div key={`${e.eta}-${i}`} className="flex items-center justify-between px-4 py-2.5 text-sm">
                      <span className={cls}>{f.label}</span>
                      <span className="text-xs text-muted">{remark && remark !== t(lang, 'scheduled') ? remark : ''}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
