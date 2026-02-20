import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutGrid, FileText, User,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import styles from './Sidebar.module.css';

const Sidebar: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

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

            <nav className={styles.navGroup}>
                <NavItem
                    to="/onboarding"
                    icon={<FileText size={20} />}
                    label="Onboarding"
                    isCollapsed={isCollapsed}
                />
                <NavItem
                    to="/profile"
                    icon={<LayoutGrid size={20} />}
                    label="Dashboard"
                    isCollapsed={isCollapsed}
                />
                <NavItem
                    to="/profile-summary"
                    icon={<User size={20} />}
                    label="Profile"
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

export default Sidebar;
