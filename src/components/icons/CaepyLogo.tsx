import React from 'react';
import { publicAssetUrl, BRAND_LOGO_MARK_PATH } from '../../config/basePath';

/**
 * CaepyLogo — brand mark from {@link BRAND_LOGO_MARK_PATH} in /public.
 *
 * variant="icon"  → icon mark only (header bar)
 * variant="full"  → icon mark + "CAEPY" wordmark + tagline (login / admin pages)
 */

interface CaepyLogoProps {
    size?: number;
    variant?: 'full' | 'icon';
    className?: string;
}

const CaepyLogo: React.FC<CaepyLogoProps> = ({
    size = 40,
    variant = 'icon',
    className = '',
}) => {
    if (variant === 'icon') {
        return (
            // Render just the icon mark — sized via width/height on the img tag
            <img
                src={publicAssetUrl(BRAND_LOGO_MARK_PATH)}
                alt="CAEPY logo mark"
                width={size}
                height={size}
                className={className}
                style={{ display: 'block', objectFit: 'contain', flexShrink: 0 }}
            />
        );
    }

    // 'full' — icon mark + "CAEPY" wordmark + tagline
    return (
        <span
            className={className}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}
            aria-label="CAEPY — Practice Smarter"
        >
            <img
                src={publicAssetUrl(BRAND_LOGO_MARK_PATH)}
                alt="CAEPY logo mark"
                width={size}
                height={size}
                style={{ display: 'block', objectFit: 'contain', flexShrink: 0 }}
            />

            <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                <span
                    style={{
                        fontFamily: "'Inter', 'Segoe UI', sans-serif",
                        fontSize: size * 0.52,
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                        color: '#1E3A8A',
                    }}
                >
                    CAEPY
                </span>
                <span
                    style={{
                        fontFamily: "'Inter', 'Segoe UI', sans-serif",
                        fontSize: size * 0.19,
                        fontWeight: 600,
                        letterSpacing: '0.16em',
                        color: '#43B5CA',
                        marginTop: 4,
                        textTransform: 'uppercase',
                    }}
                >
                    Practice Smarter
                </span>
            </span>
        </span>
    );
};

export default CaepyLogo;
