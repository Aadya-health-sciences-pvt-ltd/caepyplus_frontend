'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import AdminSidebar from '@/components/AdminSidebar';
import styles from '@/layouts/MainLayout.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'content_creator') return;
    const path = pathname || '';
    if (!path.startsWith('/admin/dashboard/content')) {
      router.replace('/admin/dashboard/content');
    }
  }, [pathname, router]);

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
