'use client';
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import styles from '@/layouts/MainLayout.module.css';
import profileStyles from '@/views/ProfileSubmitted.module.css';
import { LifeBuoy } from 'lucide-react';

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  useEffect(() => {
    const handleOpenSupport = () => setIsSupportOpen(true);

    window.addEventListener('openSupportModal', handleOpenSupport as EventListener);
    return () => {
      window.removeEventListener('openSupportModal', handleOpenSupport as EventListener);
    };
  }, []);

  return (
    <div className={styles.layoutWrapper}>
      <Header />
      <div className={styles.mainContentWrapper}>
        <Sidebar />
        <main className={styles.mainContent}>{children}</main>
      </div>

      {isSupportOpen && (
        <div
          className={profileStyles.supportOverlay}
          onClick={() => setIsSupportOpen(false)}
        >
          <div
            className={profileStyles.supportModal}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={profileStyles.supportCloseButton}
              onClick={() => setIsSupportOpen(false)}
            >
              ×
            </button>
            <section className={profileStyles.supportSection}>
              <div className={profileStyles.supportHeader}>
                <div className={profileStyles.supportIcon}>
                  <LifeBuoy size={20} />
                </div>
                <div>
                  <h3 className={profileStyles.supportTitle}>Need help with your profile?</h3>
                  <p className={profileStyles.supportDescription}>
                    Our support team can assist you with onboarding, verification, or any questions about your account.
                  </p>
                </div>
              </div>

              <div className={profileStyles.supportChannels}>
                <div className={profileStyles.supportChannel}>
                  <p className={profileStyles.supportLabel}>Email</p>
                  <a className={profileStyles.supportLink} href="mailto:support@caepy.com">
                    support@caepy.com
                  </a>
                </div>
                <div className={profileStyles.supportChannel}>
                  <p className={profileStyles.supportLabel}>Phone</p>
                  <a className={profileStyles.supportLink} href="tel:+911234567890">
                    +91 123 456 7890
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
