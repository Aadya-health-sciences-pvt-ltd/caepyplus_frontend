'use client';

import React from 'react';
import { Eye } from 'lucide-react';
import {
    PREVIEW_PUBLIC_PROFILE_DISABLED_TOOLTIP,
    useDoctorPublicProfilePreview,
} from '../hooks/useDoctorPublicProfilePreview';

type PreviewPublicProfileButtonProps = {
    /** Dashboard header button (ProfileView) */
    variant?: 'dashboard' | 'submitted';
    className?: string;
    disabledClassName?: string;
    wrapClassName?: string;
    iconSize?: number;
};

export function PreviewPublicProfileButton({
    variant = 'dashboard',
    className = '',
    disabledClassName = '',
    wrapClassName = '',
    iconSize = variant === 'submitted' ? 18 : 16,
}: PreviewPublicProfileButtonProps) {
    const {
        canPreviewPublicProfile,
        isVerified,
        openPublicProfile,
    } = useDoctorPublicProfilePreview();

    const disabled = !canPreviewPublicProfile;
    const title = !isVerified ? PREVIEW_PUBLIC_PROFILE_DISABLED_TOOLTIP : undefined;

    return (
        <span
            title={title}
            className={wrapClassName || undefined}
            style={variant === 'dashboard' && !wrapClassName ? { display: 'inline-flex' } : undefined}
        >
            <button
                type="button"
                className={`${className} ${disabled ? disabledClassName : ''}`.trim()}
                disabled={disabled}
                onClick={openPublicProfile}
            >
                <Eye size={iconSize} /> Preview Public Profile
            </button>
        </span>
    );
}
