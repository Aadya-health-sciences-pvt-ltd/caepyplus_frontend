'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutGrid, FileText, User,
    ChevronLeft, ChevronRight,
    PenTool, BookOpen
} from 'lucide-react';
import styles from './Sidebar.module.css';
import { mockDataService } from '../services/mockDataService';
import { calculateProfileProgress } from '../lib/profileProgress';

const Sidebar: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    // Compute profile completion to conditionally show the Onboarding menu item.
    // Once the doctor reaches ≥80% completion, the onboarding item is hidden
    // so the sidebar stays uncluttered for users who have largely finished setup.
    const currentUser = mockDataService.getCurrentUser();
    const profileData = { ...(currentUser?.data || {}), ...currentUser };
    const profilePercentage = calculateProfileProgress(profileData).totalPercentage;
    const showOnboarding = profilePercentage < 80;

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
                {showOnboarding && (
                    <NavItem
                        to="/doctor/onboarding"
                        icon={<FileText size={20} />}
                        label="Onboarding"
                        isCollapsed={isCollapsed}
                    />
                )}
                <NavItem
                    to="/doctor/profile"
                    icon={<LayoutGrid size={20} />}
                    label="Dashboard"
                    isCollapsed={isCollapsed}
                    tourTarget="sidebar-dashboard"
                />
                <NavItem
                    to="/doctor/profile-summary"
                    icon={<User size={20} />}
                    label="Profile"
                    isCollapsed={isCollapsed}
                    tourTarget="sidebar-profile"
                />
                <NavItem
                    to="/doctor/blog-studio"
                    icon={<BookOpen size={20} />}
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
    /** Optional `data-tour` target id for the guided onboarding tour */
    tourTarget?: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isCollapsed, tourTarget }) => {
    const pathname = usePathname();
    const isActive = pathname === to;
    return (
        <Link
            href={to}
            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            title={isCollapsed ? label : undefined}
            {...(tourTarget ? { 'data-tour': tourTarget } : {})}
        >
            <span className={styles.icon}>{icon}</span>
            <span className={styles.label}>{label}</span>
        </Link>
    );
};

export default Sidebar;
