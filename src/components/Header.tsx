import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Stethoscope, Bell, Settings, User, CheckCircle, FileText, CreditCard, HelpCircle, Phone, LogOut } from 'lucide-react';
import styles from './Header.module.css';
import { authService } from '../services/authService';

interface HeaderProps {
    centerTitle?: string;
}

import { mockDataService } from '../services/mockDataService';

const Header: React.FC<HeaderProps> = ({ centerTitle }) => {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null); // 'notifications', 'settings', 'profile', or null
    const navigate = useNavigate();
    const location = useLocation();

    const user = mockDataService.getCurrentUser();
    // Access name from root or nested data. Fallback to Anonymous.
    const displayName = user?.name || user?.data?.fullName || user?.data?.personalInfo?.fullName || 'Anonymous';
    // Display identifier: email > phone > nothing
    const displayIdentifier = user?.email || user?.phone || localStorage.getItem('mobile_number') || '';

    const handleLogout = () => {
        // Clear all auth and user data from localStorage
        authService.clearSession();

        if (location.pathname.startsWith('/admin')) {
            navigate('/admin/login', { replace: true });
        } else {
            navigate('/login', { replace: true });
        }
    };

    return (
        <header className={styles.header}>
            <div className={styles.leftSection}>
                <Stethoscope className={styles.logoIcon} strokeWidth={2.5} />
                <div className={styles.logoText}>
                    <span className={styles.brandName}>CAEPY</span>
                    <span className={styles.tagline}>Practice Smarter</span>
                </div>
            </div>

            {centerTitle && (
                <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontWeight: 600, fontSize: '1.125rem', color: '#111827' }}>
                    {centerTitle}
                </div>
            )}

            <div className={styles.rightSection}>
                {/* NOTIFICATIONS */}
                <div
                    style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}
                    onMouseEnter={() => setOpenDropdown('notifications')}
                    onMouseLeave={() => setOpenDropdown(null)}
                >
                    <button
                        className={styles.iconButton}
                        aria-label="Notifications"
                    >
                        <Bell size={20} />
                        <span className={styles.notificationBadge}>1</span>
                    </button>

                    {openDropdown === 'notifications' && (
                        <div className={styles.dropdownMenu} style={{ width: '320px' }}>
                            <div className={styles.notificationItem}>
                                <div className={styles.notificationIcon} style={{ background: '#ECFDF5', color: '#059669' }}>
                                    <CheckCircle size={16} />
                                </div>
                                <div className={styles.notificationContent}>
                                    <h4>Verification completed</h4>
                                    <p>2 hours ago</p>
                                </div>
                            </div>
                            <div className={styles.notificationItem}>
                                <div className={styles.notificationIcon} style={{ background: '#EFF6FF', color: '#3B82F6' }}>
                                    <FileText size={16} />
                                </div>
                                <div className={styles.notificationContent}>
                                    <h4>Content ready for review</h4>
                                    <p>5 hours ago</p>
                                </div>
                            </div>
                            <div className={styles.notificationItem}>
                                <div className={styles.notificationIcon} style={{ background: '#F0F9FF', color: '#0EA5E9' }}>
                                    <CreditCard size={16} />
                                </div>
                                <div className={styles.notificationContent}>
                                    <h4>Subscription renewal in 7 days</h4>
                                    <p>1 day ago</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

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
                            <button className={styles.dropdownItem}>
                                <HelpCircle size={16} /> Help Center
                            </button>
                            <button className={styles.dropdownItem}>
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
