'use client';
import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import styles from './MainLayout.module.css';

interface MainLayoutProps {
    children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div className={styles.layoutWrapper}>
            <Header />
            <div className={styles.mainContentWrapper}>
                <Sidebar />
                <main className={styles.mainContent}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
