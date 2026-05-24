const rawBase = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const BASE_PATH: string = rawBase
    ? `/${rawBase.replace(/^\/|\/$/g, '')}`
    : '';

export const BASE_PATH_WITH_SLASH: string = BASE_PATH ? `${BASE_PATH}/` : '/';

/** Primary brand mark in `/public` (square vector; use with `object-fit: contain`). */
export const BRAND_LOGO_MARK_PATH = '/CAEPY_AI.svg' as const;

/**
 * URL for a file in /public when the app may be served under `basePath`
 * (e.g. NEXT_PUBLIC_BASE_PATH=/portal → /portal/CAEPY_AI.svg).
 */
export function publicAssetUrl(path: string): string {
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${BASE_PATH}${p}`;
}
