import { useEffect, useState } from 'react';
import { useLang } from './storage';
import { t } from './i18n';
import Header from './components/Header';
import Nav from './components/Nav';
import Splash from './components/Splash';
import Home from './pages/Home';
import Search from './pages/Search';
import StopDetail from './pages/StopDetail';
import RouteDetail from './pages/RouteDetail';

export type Route =
  | { name: 'home' }
  | { name: 'search' }
  | { name: 'stop'; id: string }
  | { name: 'route'; co: string; route: string; dir: 'O' | 'I' };

function parseHash(): Route {
  const h = location.hash.replace(/^#/, '') || '/';
  const [path, qs] = h.split('?');
  const params = new URLSearchParams(qs ?? '');
  if (path === '/' || path === '') return { name: 'home' };
  if (path === '/search') return { name: 'search' };
  if (path.startsWith('/stop/')) {
    const id = decodeURIComponent(path.slice('/stop/'.length));
    return { name: 'stop', id };
  }
  if (path.startsWith('/route/')) {
    const rest = decodeURIComponent(path.slice('/route/'.length));
    const [co, route, dir = 'O'] = rest.split('/');
    return { name: 'route', co, route, dir: dir === 'I' ? 'I' : 'O' };
  }
  return { name: 'home' };
}

function goto(route: Route) {
  let h = '#/';
  if (route.name === 'search') h = '#/search';
  else if (route.name === 'stop') h = `#/stop/${encodeURIComponent(route.id)}`;
  else if (route.name === 'route') h = `#/route/${route.co}/${encodeURIComponent(route.route)}/${route.dir}`;
  if (location.hash !== h) location.hash = h;
}

export default function App() {
  const [lang, setLang] = useLang();
  const [route, setRoute] = useState<Route>(parseHash());
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [route]);

  return (
    <div className="min-h-dvh pb-[calc(3.5rem+env(safe-area-inset-bottom))]">
      <Splash />
      <Header
        now={now}
        lang={lang}
        onChangeLang={() => {
          const order: typeof lang[] = ['zh-HK', 'zh-CN', 'en'];
          const idx = order.indexOf(lang);
          setLang(order[(idx + 1) % order.length]);
        }}
      />
      <main className="mx-auto w-full max-w-xl">
        {route.name === 'home' && <Home lang={lang} goto={goto} />}
        {route.name === 'search' && <Search lang={lang} goto={goto} />}
        {route.name === 'stop' && <StopDetail lang={lang} stopId={route.id} goto={goto} />}
        {route.name === 'route' && <RouteDetail lang={lang} co={route.co} route={route.route} dir={route.dir} goto={goto} />}
      </main>
      <Nav lang={lang} route={route} goto={goto} />
      <footer className="mx-auto w-full max-w-xl px-4 pt-8 text-xs leading-5 text-muted">
        {t(lang, 'dataSource')}
        <div className="pt-2 pb-4">BusNow · {now.getFullYear()}</div>
      </footer>
    </div>
  );
}

export { goto };
