'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutGrid, FileText, User,
    ChevronLeft, ChevronRight,
    PenTool
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
                    to="/doctor/onboarding"
                    icon={<FileText size={20} />}
                    label="Onboarding"
                    isCollapsed={isCollapsed}
                />
                <NavItem
                    to="/doctor/profile"
                    icon={<LayoutGrid size={20} />}
                    label="Dashboard"
                    isCollapsed={isCollapsed}
                />
                <NavItem
                    to="/doctor/profile-summary"
                    icon={<User size={20} />}
                    label="Profile"
                    isCollapsed={isCollapsed}
                />
                <NavItem
                    to="/doctor/blog-studio"
                    icon={<PenTool size={20} />}
                    label="Blog Studio"
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
    const pathname = usePathname();
    const isActive = pathname === to;
    return (
        <Link
            href={to}
            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            title={isCollapsed ? label : undefined}
        >
            <span className={styles.icon}>{icon}</span>
            <span className={styles.label}>{label}</span>
        </Link>
    );
};

export default Sidebar;
