import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutGrid, Users,
    ChevronLeft, ChevronRight,
    Shield, Database
} from 'lucide-react';
import styles from './Sidebar.module.css'; // Reusing existing sidebar styles
import { getLoggedInAdmin, type AdminUser } from '../lib/adminAuth';

const AdminSidebar: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [user, setUser] = useState<AdminUser | null>(null);

    useEffect(() => {
        setUser(getLoggedInAdmin());
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
                    to="/admin/doctors"
                    icon={<Users size={20} />}
                    label="Doctors"
                    isCollapsed={isCollapsed}
                />
                <NavItem
                    to="/admin/users"
                    icon={<Shield size={20} />}
                    label="User Management"
                    isCollapsed={isCollapsed}
                />


                <NavItem
                    to="/admin/masters"
                    icon={<Database size={20} />}
                    label="Master Data"
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
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isCollapsed }) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
            }
            title={isCollapsed ? label : undefined}
        >
            <span className={styles.icon}>{icon}</span>
            <span className={styles.label}>{label}</span>
        </NavLink>
    );
};

export default AdminSidebar;
