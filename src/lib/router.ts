'use client';

import { useMemo } from 'react';
import { useRouter as useNextRouter, usePathname } from 'next/navigation';

type PushOptions = Parameters<ReturnType<typeof useNextRouter>['push']>[1];
type ReplaceOptions = Parameters<ReturnType<typeof useNextRouter>['replace']>[1];

export interface AppRouter {
  pathname: string;
  push: (href: string, options?: PushOptions) => void;
  replace: (href: string, options?: ReplaceOptions) => void;
  back: () => void;
  forward: () => void;
  refresh: () => void;
  prefetch: (href: string) => void;
}

function normalizeHref(href: string): string {
  if (!href) return '/';

  // Absolute URLs or protocols (http, https, mailto, etc.) — don't touch
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(href)) {
    return href;
  }

  // Let Next.js basePath handling take care of prefixing.
  // We just normalise to a leading slash.
  return href.startsWith('/') ? href : `/${href}`;
}

export function useAppRouter(): AppRouter {
  const nextRouter = useNextRouter();
  const pathname = usePathname();

  // Return a stable object so effects depending on the router
  // (e.g. in ProtectedRoute) don't re-run on every render.
  return useMemo<AppRouter>(
    () => ({
      pathname,
      push: (href, options) => nextRouter.push(normalizeHref(href), options),
      replace: (href, options) => nextRouter.replace(normalizeHref(href), options),
      back: () => nextRouter.back(),
      forward: () => nextRouter.forward(),
      refresh: () => nextRouter.refresh(),
      prefetch: (href) => nextRouter.prefetch(normalizeHref(href)),
    }),
    [nextRouter, pathname],
  );
}



