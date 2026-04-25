'use client';
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAppRouter } from '../lib/router';
import { Settings, User, Phone, LogOut } from 'lucide-react';
import styles from './Header.module.css';
import { authService } from '../services/authService';

interface HeaderProps {
    centerTitle?: string;
}

import { getLoggedInAdmin, logoutAdmin } from '../lib/adminAuth';
import { mockDataService } from '../services/mockDataService';
import { isBrowser } from '../lib/isBrowser';
import { publicAssetUrl, BRAND_LOGO_MARK_PATH } from '../config/basePath';

const Header: React.FC<HeaderProps> = ({ centerTitle }) => {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null); // 'settings', 'profile', or null
    const router = useAppRouter();
    const pathname = usePathname();

    const isAdminRoute = pathname.startsWith('/admin');
    const adminUser = isAdminRoute ? getLoggedInAdmin() : null;
    const doctorUser = mockDataService.getCurrentUser();

    // On admin pages: show logged-in admin's full name; else show doctor user name
    const displayName = isAdminRoute && adminUser
        ? (adminUser.full_name || adminUser.name || 'Anonymous')
        : (doctorUser?.name || doctorUser?.data?.fullName || doctorUser?.data?.personalInfo?.fullName || 'Anonymous');
    // Display identifier: email > phone > nothing
    const displayIdentifier = (isAdminRoute && adminUser)
        ? (adminUser.email?.replace(/^phone:/, '') || '')
        : (doctorUser?.email || doctorUser?.phone || (isBrowser() ? localStorage.getItem('mobile_number') : '') || '');

    const handleLogout = () => {
        if (pathname.startsWith('/admin')) {
            logoutAdmin();
        }
        authService.clearSession();

        if (pathname.startsWith('/admin')) {
            router.replace('/admin/login');
        } else {
            router.replace('/login');
        }
    };

    return (
        <header className={styles.header}>
            <div className={styles.leftSection}>
                <img
                    src={publicAssetUrl(BRAND_LOGO_MARK_PATH)}
                    alt="CAEPY logo"
                    className={styles.logoIcon}
                />
                <div className={styles.logoText}>
                    <span className={styles.brandName}>CAEPY</span>
                    <span className={styles.tagline}>Practice Smarter</span>
                </div>
            </div>

            {centerTitle && (
                <div className={styles.centerTitle}>
                    {centerTitle}
                </div>
            )}

            <div className={styles.rightSection}>
                {/* SETTINGS */}
                <div
                    style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}
                    onMouseEnter={() => setOpenDropdown('settings')}
                    onMouseLeave={() => setOpenDropdown(null)}
                >
                    <button
                        className={styles.iconButton}
                        aria-label="Settings"
                    >
                        <Settings size={20} />
                    </button>

                    {openDropdown === 'settings' && (
                        <div className={styles.dropdownMenu} style={{ width: '200px' }}>
                            <button
                                className={styles.dropdownItem}
                                onClick={() => {
                                    window.dispatchEvent(new CustomEvent('openSupportModal'));
                                    setOpenDropdown(null);
                                }}
                            >
                                <Phone size={16} /> Contact Support
                            </button>
                        </div>
                    )}
                </div>

                {/* PROFILE */}
                <div
                    style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}
                    onMouseEnter={() => setOpenDropdown('profile')}
                    onMouseLeave={() => setOpenDropdown(null)}
                >
                    <button
                        className={styles.avatarButton}
                        aria-label="User Profile"
                    >
                        <User className={styles.avatarIcon} />
                    </button>

                    {openDropdown === 'profile' && (
                        <div className={styles.dropdownMenu} style={{ width: '220px' }}>
                            <div style={{ padding: '1rem', borderBottom: '1px solid #E5E7EB' }}>
                                <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#111827' }}>{displayName}</p>
                                {displayIdentifier && <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>{displayIdentifier}</p>}
                            </div>
                            <div style={{ padding: '0.5rem' }}>
                                <button className={styles.dropdownItem}>
                                    <User size={16} /> Account
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className={styles.dropdownItem}
                                    style={{ color: '#EF4444' }}
                                >
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
export default Header;
