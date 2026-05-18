'use client';
import React from 'react';
import Header from '../components/Header';
import AdminSidebar from '../components/AdminSidebar';
import styles from './MainLayout.module.css';

interface AdminLayoutProps {
    children?: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    return (
        <div className={styles.layoutWrapper}>
            <Header centerTitle="Admin Console" />
            <div className={styles.mainContentWrapper}>
                <AdminSidebar />
                <main className={styles.mainContent}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
