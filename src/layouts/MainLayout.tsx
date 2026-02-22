import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';

import Sidebar from '../components/Sidebar';

import styles from './MainLayout.module.css';

const MainLayout: React.FC = () => {
    return (
        <div className={styles.layoutWrapper}>
            <Header />
            <div className={styles.mainContentWrapper}>
                <Sidebar />
                <main className={styles.mainContent}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
