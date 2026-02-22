import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import AdminSidebar from '../components/AdminSidebar';

import styles from './MainLayout.module.css';

const AdminLayout: React.FC = () => {
    return (
        <div className={styles.layoutWrapper}>
            <Header centerTitle="Admin Console" />
            <div className={styles.mainContentWrapper}>
                <AdminSidebar />
                <main className={styles.mainContent}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
