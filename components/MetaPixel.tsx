'use client';

import { useEffect } from 'react';

const PIXEL_ID = '1071584959002772';

export default function MetaPixel() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as any).fbq) return;

    const w = window as any;
    const n: any = function (...args: any[]) {
      if (n.callMethod) {
        n.callMethod(...args);
      } else {
        n.queue.push(args);
      }
    };

    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];

    const t = document.createElement('script');
    t.async = true;
    t.src = 'https://connect.facebook.net/en_US/fbevents.js';

    const s = document.getElementsByTagName('script')[0];
    if (s?.parentNode) {
      s.parentNode.insertBefore(t, s);
    } else {
      document.head.appendChild(t);
    }

    w.fbq = n;
    w._fbq = n;

    n('init', PIXEL_ID);
    n('track', 'PageView');
  }, []);

  return null;
}
