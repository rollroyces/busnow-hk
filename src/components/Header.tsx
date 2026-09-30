import type { Lang } from '../i18n';

function pad(n: number) { return n.toString().padStart(2, '0'); }

export default function Header({ now, lang, onChangeLang }: { now: Date; lang: Lang; onChangeLang: () => void }) {
  const hh = pad(now.getHours());
  const mm = pad(now.getMinutes());
  return (
    <header className="bg-blind text-paper">
      <div className="mx-auto w-full max-w-xl px-4 pb-4 pt-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <a href="#/" aria-label="BusNow" className="shrink-0">
              <div className="flex size-11 items-center justify-center rounded-[22%] bg-led">
                <svg viewBox="0 0 24 24" className="size-7 text-blind"><path fill="currentColor" d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2v2h-2v-2H8v2H6v-2H4V6Zm2 2v5h12V8H6Zm0 7v1h12v-1H6Zm2 2.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm8 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z"/></svg>
              </div>
            </a>
            <div className="min-w-0">
              <p className="text-sm text-paper/70">Hong Kong Bus</p>
              <h1 className="text-3xl font-black tracking-tight text-cream">BusNow</h1>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <p className="pb-1 text-2xl font-bold tabular-nums text-cream">{hh}:{mm}</p>
            <button
              type="button"
              onClick={onChangeLang}
              className="h-11 shrink-0 rounded-full border border-paper/40 px-3 text-sm font-semibold text-cream"
              aria-label="Change language"
            >
              {lang === 'en' ? 'EN' : lang === 'zh-CN' ? '简' : '繁'}
            </button>
          </div>
        </div>
      </div>
      <div className="h-1 bg-led" />
    </header>
  );
}
