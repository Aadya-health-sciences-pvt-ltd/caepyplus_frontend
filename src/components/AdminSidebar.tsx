'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutGrid, Users,
    ChevronLeft, ChevronRight,
    Shield, Database, ContactRound
} from 'lucide-react';
import styles from './Sidebar.module.css'; // Reusing existing sidebar styles
import { getLoggedInAdmin, type AdminUser } from '../lib/adminAuth';
import { adminService } from '../services/adminService';

const AdminSidebar: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [user, setUser] = useState<AdminUser | null>(null);
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        const storedRole = localStorage.getItem('role');
        const mockUser = getLoggedInAdmin();

        if (storedRole) {
            setUser({
                id: localStorage.getItem('doctor_id') || 'admin_user',
                name: 'Admin User',
                email: localStorage.getItem('mobile_number') || '',
                role: storedRole as 'admin' | 'operation',
                joinedDate: new Date().toISOString()
            });
        } else {
            setUser(mockUser);
        }

        adminService.getDropdownOptions({ status: 'pending', limit: 1 })
            .then(res => setPendingCount(res.pending_count ?? 0))
            .catch(() => { });
    }, []);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
            <button
                className={styles.toggleBtn}
                onClick={toggleSidebar}
                aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            <div style={{ padding: '0 1rem', marginBottom: '1rem', display: isCollapsed ? 'none' : 'block' }}>
                <div style={{
                    background: '#FEF3C7', color: '#92400E',
                    padding: '0.25rem 0.5rem', borderRadius: '0.25rem',
                    fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem'
                }}>
                    <Shield size={12} /> {user?.role.toUpperCase() || 'ADMIN'}
                </div>
            </div>

            <nav className={styles.navGroup}>
                <NavItem
                    to="/admin/dashboard"
                    icon={<LayoutGrid size={20} />}
                    label="Dashboard"
                    isCollapsed={isCollapsed}
                />
                <NavItem
                    to="/admin/dashboard/doctors"
                    icon={<Users size={20} />}
                    label="Doctors"
                    isCollapsed={isCollapsed}
                />
                <NavItem
                    to="/admin/dashboard/users"
                    icon={<Shield size={20} />}
                    label="User Management"
                    isCollapsed={isCollapsed}
                />


                <NavItem
                    to="/admin/dashboard/masters"
                    icon={<Database size={20} />}
                    label="Master Data"
                    isCollapsed={isCollapsed}
                    badge={pendingCount > 0 ? pendingCount : undefined}
                />
                <NavItem
                    to="/admin/dashboard/lead-doctors"
                    icon={<ContactRound size={20} />}
                    label="Lead Doctors"
                    isCollapsed={isCollapsed}
                />
            </nav>
        </aside>
    );
};

interface NavItemProps {
    to: string;
    icon: React.ReactNode;
    label: string;
    isCollapsed: boolean;
    badge?: number;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isCollapsed, badge }) => {
    const pathname = usePathname();
    const isActive = pathname === to;
    return (
        <Link
            href={to}
            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            title={isCollapsed ? label : undefined}
        >
            <span className={styles.icon}>{icon}</span>
            <span className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                {label}
                {badge !== undefined && !isCollapsed && (
                    <span style={{
                        background: '#EF4444', color: 'white', fontSize: '0.6875rem', fontWeight: 700,
                        borderRadius: '99px', padding: '0.0625rem 0.375rem', minWidth: '1.125rem',
                        textAlign: 'center', lineHeight: '1.25',
                    }}>
                        {badge}
                    </span>
                )}
            </span>
        </Link>
    );
};

export default AdminSidebar;
