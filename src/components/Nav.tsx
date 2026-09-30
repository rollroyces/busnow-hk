import type { Route } from '../App';
import { t } from '../i18n';

export default function Nav({ lang, route, goto }: { lang: import('../i18n').Lang; route: Route; goto: (r: Route) => void }) {
  const homeActive = route.name === 'home' || route.name === 'stop' || route.name === 'route';
  const searchActive = route.name === 'search';
  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-card pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto grid h-14 max-w-xl grid-cols-2">
        <button
          type="button"
          onClick={() => goto({ name: 'home' })}
          className={`flex flex-col items-center justify-center gap-0.5 text-sm font-semibold ${homeActive ? 'text-led' : 'text-muted'}`}
          aria-current={homeActive ? 'page' : undefined}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>
            <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          </svg>
          {t(lang, 'home')}
          <span className={`h-0.5 w-6 rounded-full ${homeActive ? 'bg-led' : ''}`} />
        </button>
        <button
          type="button"
          onClick={() => goto({ name: 'search' })}
          className={`flex flex-col items-center justify-center gap-0.5 text-sm font-medium ${searchActive ? 'text-led' : 'text-muted'}`}
          aria-current={searchActive ? 'page' : undefined}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.34-4.34"/>
          </svg>
          {t(lang, 'search')}
          <span className={`h-0.5 w-6 rounded-full ${searchActive ? 'bg-led' : ''}`} />
        </button>
      </div>
    </nav>
  );
}
