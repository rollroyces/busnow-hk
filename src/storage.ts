import { useEffect, useState, useCallback } from 'react';
import type { Lang } from './i18n';

const LANG_KEY = 'busnow:lang';
const FAV_STOPS_KEY = 'busnow:fav:stops';
const FAV_ROUTES_KEY = 'busnow:fav:routes';
const RECENT_KEY = 'busnow:recent';
const SPLASH_KEY = 'busnow:splash';

export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem(LANG_KEY) as Lang | null;
    if (saved && ['zh-HK', 'zh-CN', 'en'].includes(saved)) return saved;
    return 'zh-HK';
  });
  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem(LANG_KEY, lang);
  }, [lang]);
  return [lang, setLang];
}

function readSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}
function writeSet(key: string, set: Set<string>) {
  localStorage.setItem(key, JSON.stringify(Array.from(set)));
}

export function useFavStops() {
  const [set, setSet] = useState<Set<string>>(() => readSet(FAV_STOPS_KEY));
  const toggle = useCallback((id: string) => {
    setSet(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      writeSet(FAV_STOPS_KEY, next);
      return next;
    });
  }, []);
  const has = useCallback((id: string) => set.has(id), [set]);
  return { set, toggle, has };
}

export function useFavRoutes() {
  const [set, setSet] = useState<Set<string>>(() => readSet(FAV_ROUTES_KEY));
  const toggle = useCallback((id: string) => {
    setSet(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      writeSet(FAV_ROUTES_KEY, next);
      return next;
    });
  }, []);
  const has = useCallback((id: string) => set.has(id), [set]);
  return { set, toggle, has };
}

export type RecentItem = { kind: 'stop' | 'route'; id: string; label: string; ts: number };

export function useRecent() {
  const [list, setList] = useState<RecentItem[]>(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  });
  const push = useCallback((item: Omit<RecentItem, 'ts'>) => {
    setList(prev => {
      const next: RecentItem[] = [{ ...item, ts: Date.now() }, ...prev.filter(x => !(x.kind === item.kind && x.id === item.id))].slice(0, 8);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  }, []);
  const remove = useCallback((kind: RecentItem['kind'], id: string) => {
    setList(prev => {
      const next = prev.filter(x => !(x.kind === kind && x.id === id));
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  }, []);
  return { list, push, remove };
}

export function markSplashSeen() {
  try { sessionStorage.setItem(SPLASH_KEY, '1'); } catch {}
}

export function splashSeen(): boolean {
  try { return sessionStorage.getItem(SPLASH_KEY) === '1'; } catch { return false; }
}
