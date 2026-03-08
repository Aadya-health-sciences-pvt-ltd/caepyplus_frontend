'use client';
import React, { useState, useEffect } from 'react';
import {
    Calendar, Settings,
    Eye, FileText, CheckCircle,
    PenTool, Video, Info, TrendingUp, Users, Zap,
    ArrowRight, Edit3, Globe, Share2
} from 'lucide-react';

import { useAppRouter } from '../lib/router';
import styles from './ProfileView.module.css';

import { mockDataService } from '../services/mockDataService';

const ProfileView = () => {
    const router = useAppRouter();
    const currentUser = mockDataService.getCurrentUser();

    const [navFormData, setNavFormData] = useState<Record<string, any>>({});

    useEffect(() => {
        try {
            const s = JSON.parse(sessionStorage.getItem('nav_state') || '{}');
            if (s.formData) setNavFormData(s.formData);
            sessionStorage.removeItem('nav_state');
        } catch { }
    }, []);

    const formData = {
        ...(currentUser?.data || {}),
        ...currentUser,
        ...navFormData
    };

    // Safe accessors - Handle both flat structure (from Onboarding) and nested (legacy/seed)
    const name = formData.fullName || formData.personalInfo?.fullName || formData.name || 'Dr. User';
    const specialty = formData.specialty || formData.personalInfo?.specialty || 'General Practitioner';
    const loc = formData.primaryLocation || formData.personalInfo?.primaryLocation || 'India';
    const exp = formData.experience || formData.personalInfo?.experience;
    const isVerified = (formData.onboarding_status || formData.status) === 'verified';
    const hasPhoto = !!formData.profileImage;

    return (
        <div className={styles.pageContent}>


            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.greeting}>
                        <h1>
                            Good evening, {name}
                            {isVerified && <span className={styles.verifiedBadge}>Verified</span>}
                        </h1>
                        <p className={styles.location}>
                            {specialty} · {loc} {exp ? `· ${exp} Years Exp.` : ''}
                        </p>
                    </div>
                    <button className={styles.previewBtn}>
                        <Eye size={16} /> Preview Public Profile
                    </button>
                </div>

                <div className={styles.dashboardGrid}>

                    {/* LEFT COLUMN (2/3) */}
                    <div className={styles.col}>

                        {/* 1. Professional Profile */}
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <FileText className={styles.cardIcon} size={20} />
                                <h3 className={styles.cardTitle}>Professional Profile <span>Your digital identity</span></h3>
                            </div>

                            <div className={styles.profHeader}>
                                <div className={styles.profInfo}>
                                    <div className={styles.progressLabel}>
                                        <span>Profile completion</span>
                                        <span>{hasPhoto ? '85%' : '75%'}</span>
                                    </div>
                                    <div className={styles.progressBar}>
                                        <div className={styles.progressFill} style={{ width: hasPhoto ? '85%' : '75%' }}></div>
                                    </div>

                                    <div className={styles.checklist}>
                                        <CheckItem label="Profile photo" done={hasPhoto} />
                                        <CheckItem label="Credentials verified" done={true} />
                                        <CheckItem label="Practice details" done={!!loc} />
                                        <CheckItem label="Visibility settings" done={true} />
                                    </div>

                                    <div className={styles.profActions}>
                                        <span className={styles.verifiedBadge} style={{
                                            backgroundColor: isVerified ? '#ECFDF5' : '#FEF2F2',
                                            color: isVerified ? '#059669' : '#DC2626',
                                            fontSize: '0.75rem'
                                        }}>
                                            {isVerified ? 'Verified Profile' : 'Not-Verified'}
                                        </span>
                                        <div className={styles.profActionGroup}>
                                            <button className={styles.editBtn} onClick={() => router.push('/doctor/onboarding')}>Edit Profile</button>
                                            <button className={styles.viewProfileBtn} onClick={() => router.push('/doctor/profile-summary')}>View Profile</button>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.avatarContainer}>
                                    {/* Avatar Placeholder */}
                                    <img src={formData.profileImage || "https://i.pravatar.cc/150?u=a042581f4e29026704d"} alt="Profile" className={styles.avatar} />
                                    <div className={styles.editOverlay}><Edit3 size={10} /></div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Practice Hub */}
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <Globe className={styles.cardIcon} size={20} />
                                <h3 className={styles.cardTitle}>Practice Hub <span>Your professional presence</span></h3>
                            </div>

                            <div className={styles.hubGrid}>
                                <div style={{ flex: 1 }}>
                                    <div className={styles.hubStatus}>
                                        <div style={{ width: 6, height: 6, backgroundColor: '#059669', borderRadius: '50%' }}></div>
                                        Domain Active
                                    </div>
                                    <p style={{ fontSize: '0.875rem', marginBottom: '1rem', color: '#6B7280' }}>Enabled sections:</p>

                                    <div className={styles.sectionList}>
                                        <div className={styles.sectionItem}><CheckCircle size={14} color="#39C8CE" /> About</div>
                                        <div className={styles.sectionItem}><CheckCircle size={14} color="#39C8CE" /> Conditions Treated</div>
                                        <div className={styles.sectionItem}><CheckCircle size={14} color="#39C8CE" /> Educational Content</div>
                                        <div className={`${styles.sectionItem} ${styles.disabled}`}><div className={styles.circleIcon}></div> Appointments</div>
                                    </div>

                                    <div className={styles.hubButtons}>
                                        <button className={styles.btnOutline}><Settings size={14} style={{ display: 'inline', marginRight: 4 }} /> Customize</button>
                                        <button className={styles.btnTeal}>Generate Card</button>
                                    </div>
                                </div>

                                {/* Illustration Placeholder */}
                                <div className={styles.illustration}>
                                    {/* SVG Placeholder matching image style roughly */}
                                    <svg width="120" height="100" viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="30" y="10" width="60" height="80" rx="4" fill="white" stroke="#E5E7EB" strokeWidth="2" />
                                        <rect x="40" y="20" width="40" height="40" rx="20" fill="#E5E7EB" />
                                        <rect x="35" y="70" width="50" height="10" rx="2" fill="#E5E7EB" />
                                        <circle cx="90" cy="80" r="30" fill="white" fillOpacity="0.5" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* 3. Content Creation */}
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <PenTool className={styles.cardIcon} size={20} />
                                <h3 className={styles.cardTitle}>Content Creation (C-LINQ) <span>Educate your patients</span></h3>
                            </div>

                            <div className={styles.contentWrapper}>
                                <div style={{ flex: 1 }}>
                                    <div className={styles.contentBox}>
                                        <p className={styles.suggestionTitle}>Suggested: Explain a condition your patients frequently ask about</p>
                                        <p className={styles.aiTag}>AI can help draft educational content based on your expertise</p>
                                    </div>

                                    <div className={styles.creationActions}>
                                        <button className={styles.btnDark}><Edit3 size={14} /> Create Content</button>
                                        <button className={styles.btnOutline}><Eye size={14} /> Review Drafts</button>
                                    </div>
                                </div>

                                <div className={styles.illustrationWrapper}>
                                    {/* Illustration Placeholder */}
                                    <Users size={64} strokeWidth={1} color="#E5E7EB" />
                                </div>
                            </div>
                        </div>

                        {/* 4. Appointments Overview */}
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <Calendar className={styles.cardIcon} size={20} />
                                <h3 className={styles.cardTitle}>Appointments Overview <span>Today's schedule</span></h3>
                            </div>

                            <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Calendar size={14} /> 3 appointments today
                            </div>

                            <div className={styles.apptList}>
                                <ApptItem time="10:00 AM" name="Rahul Kapoor" type="Clinic" />
                                <ApptItem time="2:30 PM" name="Sneha Gupta" type="Online" />
                                <ApptItem time="4:00 PM" name="Amit Verma" type="Clinic" />
                            </div>

                            <button className={styles.btnOutline} style={{ marginTop: '1.5rem', width: 'fit-content' }}>View Full Schedule</button>
                        </div>

                    </div>

                    {/* RIGHT COLUMN (1/3) */}
                    <div className={styles.col}>

                        {/* 5. Clinical Insights */}
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <TrendingUp className={styles.cardIcon} size={20} />
                                <h3 className={styles.cardTitle}>Clinical Insights <span>AI-powered observations</span></h3>
                            </div>

                            <div className={styles.insightAlert}>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <div style={{ color: '#39C8CE' }}><Info size={16} /></div>
                                    <p className={styles.insightText}>
                                        You're seeing an increase in <span className={styles.highlight}>respiratory complaints</span> this month.
                                    </p>
                                </div>
                                <p style={{ fontSize: '0.75rem', color: '#6B7280', marginLeft: '1.5rem' }}>Would you like to educate patients on this topic?</p>
                            </div>

                            <button className={styles.createContentBtn}>
                                Create Educational Content <ArrowRight size={16} />
                            </button>
                        </div>

                        {/* 6. Analytics Snapshot */}
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <TrendingUp className={styles.cardIcon} size={20} />
                                <h3 className={styles.cardTitle}>Analytics Snapshot <span>Last 30 days</span></h3>
                            </div>

                            <div className={styles.metricList}>
                                <MetricRow label="Profile Views" value="1,247" change="+12%" />
                                <MetricRow label="Content Reads" value="856" change="+8%" />
                                <MetricRow label="Appointments" value="34" change="+5%" />
                                <MetricRow label="Referrals" value="18" change="+3%" />
                            </div>
                        </div>

                        {/* 7. Referrals & Circles */}
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <Users className={styles.cardIcon} size={20} />
                                <h3 className={styles.cardTitle}>Referrals & Circles <span>Your professional network</span></h3>
                            </div>

                            <div className={styles.refStats}>
                                <div className={styles.refCol}>
                                    <span className={styles.refLabel}>Active Circles</span>
                                    <span className={styles.refVal}>5</span>
                                </div>
                                <div className={styles.refCol}>
                                    <span className={styles.refLabel}>Referrals Received</span>
                                    <span className={`${styles.refVal} ${styles.blue}`}>12</span>
                                </div>
                            </div>
                            <p style={{ fontSize: '0.7rem', color: '#6B7280', marginTop: '0.5rem' }}>3 new referrals this week</p>

                            <button className={styles.viewRefBtn}>
                                View Referrals <ArrowRight size={14} />
                            </button>
                        </div>

                        {/* 8. Subscription & Tokens */}
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <Zap className={styles.cardIcon} size={20} />
                                <h3 className={styles.cardTitle}>Subscription & Tokens</h3>
                            </div>

                            <span className={styles.verifiedBadge} style={{ backgroundColor: '#EFF6FF', color: '#1E40AF', borderRadius: '4px' }}>Professional Plan</span>

                            <div style={{ marginTop: '1rem' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>AI Token Usage</div>
                                <div className={styles.tokenBar}>
                                    <div className={styles.tokenFill}></div>
                                </div>
                                <div className={styles.tokenText}>
                                    <span>650 / 1000</span>
                                </div>
                                <span style={{ fontSize: '0.7rem', color: '#6B7280', display: 'block', marginBottom: '1rem' }}>350 tokens remaining this month</span>
                            </div>

                            <button className={styles.manageBtn}>
                                <Settings size={14} /> Manage Plan
                            </button>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};

// Sub-components for cleaner code


const CheckItem = ({ label, done = false }: { label: string, done?: boolean }) => (
    <div className={`${styles.checkItem} ${done ? styles.done : ''}`}>
        {done ? <CheckCircle size={16} className={styles.checkIcon} /> : <div className={styles.circleIcon}></div>}
        {label}
    </div>
);

const ApptItem = ({ time, name, type }: { time: string, name: string, type: string }) => (
    <div className={styles.apptItem}>
        <span className={styles.time}>{time}</span>
        <span className={styles.patient}>{name}</span>
        <span className={styles.type}>
            {type === 'Clinic' ? <TrendingUp size={12} /> : <Video size={12} />} {type}
        </span>
    </div>
);

const MetricRow = ({ label, value, change }: { label: string, value: string, change: string }) => (
    <div className={styles.metricRow}>
        <div className={styles.metricLabel}>
            {label === 'Profile Views' && <Eye size={14} />}
            {label === 'Content Reads' && <FileText size={14} />}
            {label === 'Appointments' && <Users size={14} />}
            {label === 'Referrals' && <Share2 size={14} />}
            {label}
        </div>
        <div>
            <span className={styles.metricVal}>{value}</span>
            <span className={`${styles.growth} ${change.startsWith('+') ? styles.positive : styles.negative}`}>{change}</span>
        </div>
    </div>
);

export default ProfileView;
