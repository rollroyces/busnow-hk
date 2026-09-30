import { useEffect, useState } from 'react';
import { splashSeen, markSplashSeen } from '../storage';

export default function Splash() {
  const [hidden, setHidden] = useState(splashSeen());

  useEffect(() => {
    if (hidden) return;
    const t = setTimeout(() => {
      setHidden(true);
      markSplashSeen();
    }, 700);
    return () => clearTimeout(t);
  }, [hidden]);

  return (
    <div className="splash" data-hidden={hidden ? 'true' : 'false'} aria-hidden={hidden}>
      <div>
        <div className="flex flex-col items-center">
          <div className="mb-5 flex size-24 items-center justify-center rounded-[22%] bg-led">
            <svg viewBox="0 0 64 64" className="size-16">
              <rect x="8" y="20" width="48" height="26" rx="6" fill="#1c1412" />
              <rect x="12" y="24" width="14" height="8" rx="2" fill="#ff7a1a" />
              <rect x="38" y="24" width="14" height="8" rx="2" fill="#ff7a1a" />
              <rect x="12" y="36" width="40" height="6" rx="2" fill="#ff7a1a" />
              <circle cx="20" cy="48" r="4" fill="#fff6e1" />
              <circle cx="44" cy="48" r="4" fill="#fff6e1" />
            </svg>
          </div>
          <p className="text-sm tracking-wide text-cream/70">Hong Kong Bus</p>
          <p className="mt-1 text-6xl font-black tracking-tight text-cream">BusNow</p>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-led" />
          <p className="mt-4 text-sm text-cream/70">Real-time arrivals</p>
          <div className="splash-spin" />
        </div>
      </div>
    </div>
  );
}
