import React, { useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Upload, Sparkles, Check, Lock, ShieldCheck,
    Linkedin, Link, Share2
} from 'lucide-react';
import styles from './ResumeUpload.module.css';

const ResumeUpload = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isNewUser = location.state?.isNewUser ?? true;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            // Simulate upload
            setTimeout(() => {
                navigate('/onboarding', { state: { isNewUser } });
            }, 1000);
        }
    };

    const handleSkip = () => {
        navigate('/onboarding', { state: { isNewUser } });
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.topMessage}>
                <Sparkles size={16} className={styles.sparkleIcon} />
                <p className={styles.messageText}>
                    "Welcome. This setup usually takes about 12-15 minutes. You can pause anytime and continue later. Most doctors complete it in one sitting."
                </p>
            </div>

            <h1 className={styles.mainHeading}>Upload your resume to get started</h1>
            <p className={styles.subHeading}>We'll automatically fill most of your profile for you.</p>

            <div className={styles.card}>
                <div className={styles.iconCircle}>
                    {/* Placeholder for the CAEPY logo/icon using Share2 roughly looking like a connection */}
                    <Sparkles size={24} />
                </div>

                <h2 className={styles.cardTitle}>Let's build your professional profile.</h2>
                <p className={styles.cardSubtitle}>
                    I'm here to automate your profile setup. Upload your CV to get started instantly.
                </p>

                <button className={styles.uploadButton} onClick={handleUploadClick}>
                    <Upload size={18} /> Upload Resume
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    accept=".pdf,.doc,.docx"
                />

                <p className={styles.uploadMeta}>
                    (Supports PDF, DOC, DOCX • Max 10MB) Takes less than 30 seconds
                </p>

                <div className={styles.importOptions}>
                    <div className={styles.importItem}>
                        Import Profile from : <Linkedin size={16} className={styles.linkedinIcon} fill="#0077B5" />
                    </div>
                    <div className={styles.importItem}>
                        Import Profile from hospital : <Link size={16} className={styles.linkIcon} />
                    </div>
                </div>

                <button className={styles.skipButton} onClick={handleSkip}>
                    No resume? Start here
                </button>
            </div>

            <div className={styles.footer}>
                <div className={styles.badge}>
                    <Check size={12} className={styles.checkIcon} /> HIPAA Compliant
                </div>
                <div className={styles.badge}>
                    <Lock size={12} className={styles.lockIcon} /> Secure & Encrypted
                </div>
                <div className={styles.badge}>
                    <ShieldCheck size={12} className={styles.shieldIcon} /> Verified Platform
                </div>
            </div>
        </div>
    );
};

export default ResumeUpload;
