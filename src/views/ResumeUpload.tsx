'use client';
import React, { useRef, useState, useEffect } from 'react';
import { useAppRouter } from '../lib/router';
import {
    Upload, Sparkles, Check, Lock, ShieldCheck,
    Linkedin, Link, Loader2
} from 'lucide-react';
import styles from './ResumeUpload.module.css';
import { doctorService } from '../services/doctorService';

const ResumeUpload = () => {
    const router = useAppRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isNewUser, setIsNewUser] = useState(true);

    useEffect(() => {
        try {
            const s = JSON.parse(sessionStorage.getItem('nav_state') || '{}');
            if (s.isNewUser !== undefined) setIsNewUser(s.isNewUser);
            sessionStorage.removeItem('nav_state');
        } catch { }
    }, []);

    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setError(null);

        try {
            const extractedData = await doctorService.extractResume(file);
            console.log("Resume extracted:", extractedData);
            sessionStorage.setItem('nav_state', JSON.stringify({ isNewUser, formData: extractedData }));
            router.push('/doctor/onboarding');
        } catch (err) {
            console.error("Extraction failed:", err);
            setError("Failed to process resume. Please try again or skip.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSkip = () => {
        sessionStorage.setItem('nav_state', JSON.stringify({ isNewUser }));
        router.push('/doctor/onboarding');
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

                {error && <p style={{ color: 'red', fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</p>}

                <button
                    className={styles.uploadButton}
                    onClick={handleUploadClick}
                    disabled={isUploading}
                    style={{ opacity: isUploading ? 0.7 : 1, cursor: isUploading ? 'not-allowed' : 'pointer' }}
                >
                    {isUploading ? (
                        <>
                            <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                            Processing Resume...
                        </>
                    ) : (
                        <>
                            <Upload size={18} /> Upload Resume
                        </>
                    )}
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                />

                <p className={styles.uploadMeta}>
                    (Supports PDF, DOC, DOCX, Images • Max 10MB) Takes less than 30 seconds
                </p>

                <div className={styles.importOptions}>
                    <div className={styles.importItem}>
                        Import Profile from : <Linkedin size={16} className={styles.linkedinIcon} fill="#0077B5" />
                    </div>
                    <div className={styles.importItem}>
                        Import Profile from hospital : <Link size={16} className={styles.linkIcon} />
                    </div>
                </div>

                <button className={styles.skipButton} onClick={handleSkip} disabled={isUploading}>
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
