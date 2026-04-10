'use client';
import Header from '@/components/Header';
import AdminSidebar from '@/components/AdminSidebar';
import styles from '@/layouts/MainLayout.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layoutWrapper}>
      <Header centerTitle="Admin Console" />
      <div className={styles.mainContentWrapper}>
        <AdminSidebar />
        <main className={styles.mainContent}>{children}</main>
      </div>
    </div>
  );
}
