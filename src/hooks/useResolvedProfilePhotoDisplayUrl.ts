'use client';

import { useState, useEffect } from 'react';
import { doctorService } from '../services/doctorService';

function isHttpUrl(s: string | null | undefined): boolean {
    if (!s || typeof s !== 'string') return false;
    return /^https?:\/\//i.test(s.trim());
}

/**
 * Resolves the doctor profile photo to a fresh presigned URL when possible.
 * Use for any <img> that must load from S3 — stored `profile_photo` / `profileImage`
 * values are often bare keys or expired URLs.
 *
 * @param fallbackSrc — e.g. formData.profileImage from mock or session
 * @param doctorIdOverride — optional; defaults to localStorage `doctor_id`
 * @param skipSignedUrlFetch — when true, use `fallbackSrc` as display URL only (e.g. `blob:` / `data:` local previews)
 */
export function useResolvedProfilePhotoDisplayUrl(
    fallbackSrc: string | null | undefined,
    doctorIdOverride?: string | number | null,
    skipSignedUrlFetch = false,
): { url: string | null; loading: boolean } {
    const [url, setUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            if (skipSignedUrlFetch) {
                const v =
                    typeof fallbackSrc === 'string' && fallbackSrc.trim() !== '' ? fallbackSrc.trim() : null;
                if (!cancelled) {
                    setUrl(v);
                    setLoading(false);
                }
                return;
            }

            const rawId =
                doctorIdOverride !== undefined && doctorIdOverride !== null && doctorIdOverride !== ''
                    ? String(doctorIdOverride)
                    : typeof window !== 'undefined'
                      ? localStorage.getItem('doctor_id')
                      : null;

            if (!rawId) {
                const fb = typeof fallbackSrc === 'string' && isHttpUrl(fallbackSrc) ? fallbackSrc.trim() : null;
                if (!cancelled) {
                    setUrl(fb);
                    setLoading(false);
                }
                return;
            }

            try {
                const signed = await doctorService.getProfilePhotoSignedUrl(rawId);
                if (cancelled) return;
                if (signed && isHttpUrl(signed)) {
                    setUrl(signed.trim());
                } else if (fallbackSrc && isHttpUrl(fallbackSrc)) {
                    setUrl(String(fallbackSrc).trim());
                } else {
                    setUrl(null);
                }
            } catch {
                if (!cancelled) {
                    setUrl(fallbackSrc && isHttpUrl(fallbackSrc) ? String(fallbackSrc).trim() : null);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        void run();
        return () => {
            cancelled = true;
        };
    }, [fallbackSrc, doctorIdOverride, skipSignedUrlFetch]);

    return { url, loading };
}
