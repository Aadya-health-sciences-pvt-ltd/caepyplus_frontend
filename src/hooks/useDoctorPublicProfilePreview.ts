'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    doctorService,
    isDoctorVerified,
    type DoctorProfile,
} from '../services/doctorService';
import { isBrowser } from '../lib/isBrowser';

export const PREVIEW_PUBLIC_PROFILE_DISABLED_TOOLTIP =
    'Public profile can be viewed after verification';

export function useDoctorPublicProfilePreview() {
    const [profile, setProfile] = useState<DoctorProfile | null>(() =>
        isBrowser() ? doctorService.getStoredProfile() : null,
    );

    const loadProfile = useCallback(async () => {
        if (!isBrowser()) return;
        const doctorId = localStorage.getItem('doctor_id');
        if (!doctorId) {
            setProfile(doctorService.getStoredProfile());
            return;
        }
        try {
            const fetched = await doctorService.fetchAndStoreProfile(doctorId);
            setProfile(fetched);
        } catch {
            setProfile(doctorService.getStoredProfile());
        }
    }, []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            await loadProfile();
            if (cancelled) return;
        })();
        return () => {
            cancelled = true;
        };
    }, [loadProfile]);

    useEffect(() => {
        if (!isBrowser()) return;
        const onFocus = () => {
            void loadProfile();
        };
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [loadProfile]);

    const onboardingStatus = profile?.onboarding_status;
    const isVerified = isDoctorVerified(onboardingStatus);
    const publicProfileUrl = profile?.public_profile_url ?? null;
    const canPreviewPublicProfile = isVerified && !!publicProfileUrl;

    const openPublicProfile = useCallback(() => {
        if (publicProfileUrl) {
            window.open(publicProfileUrl, '_blank', 'noopener,noreferrer');
        }
    }, [publicProfileUrl]);

    return {
        profile,
        isVerified,
        publicProfileUrl,
        canPreviewPublicProfile,
        openPublicProfile,
        refreshProfile: loadProfile,
    };
}
