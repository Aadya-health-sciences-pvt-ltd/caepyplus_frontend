'use client';
import React from 'react';
import { useAppRouter } from '../lib/router';
import {
    User, Activity, Building, MapPin,
    IndianRupee, Languages, Trophy,
    GraduationCap, ShieldCheck, Heart, Lightbulb, Coffee, Target, Sparkles
} from 'lucide-react';
import { mockDataService } from '../services/mockDataService';
import { useResolvedProfilePhotoDisplayUrl } from '../hooks/useResolvedProfilePhotoDisplayUrl';
import styles from './ProfileSummary.module.css';

const ProfileSummary = () => {
    const router = useAppRouter();
    const currentUser = mockDataService.getCurrentUser();
    const formData = currentUser?.data || {};
    const rawProfileImage =
        typeof (formData as { profileImage?: string }).profileImage === 'string'
            ? (formData as { profileImage: string }).profileImage
            : '';
    const skipSignedForLocalPreview = /^(data:|blob:)/i.test(rawProfileImage);
    const { url: resolvedProfilePhotoUrl } = useResolvedProfilePhotoDisplayUrl(
        rawProfileImage || undefined,
        undefined,
        skipSignedForLocalPreview,
    );

    // Helper to safely access data
    const getVal = (key: string) => formData[key] || 'Not provided';
    const getArr = (key: string) => {
        const raw = (formData as Record<string, unknown>)[key];
        if (Array.isArray(raw)) return raw as string[];
        if (typeof raw === 'string' && raw.trim()) {
            return raw.split(',').map(s => s.trim()).filter(Boolean);
        }
        return [];
    };

    const handleEditProfile = () => {
        sessionStorage.setItem('nav_state', JSON.stringify({ formData, step: 1 }));
        router.push('/doctor/onboarding');
    };

    const InfoRow = ({ label, value }: { label: string, value: string | React.ReactNode }) => (
        <div className={styles.infoRow}>
            <span className={styles.infoLabel}>{label}</span>
            <span className={styles.infoValue}>{value}</span>
        </div>
    );

    const Card = ({ title, icon, children }: { title: string, icon?: React.ReactNode, children: React.ReactNode }) => (
        <div className={styles.card}>
            <h3 className={styles.cardTitle}>{icon}{title}</h3>
            {children}
        </div>
    );

    const PillContainer = ({ items, emptyText = 'None listed', orange = false }: { items: string[], emptyText?: string, orange?: boolean }) => (
        <div className={styles.tagContainer}>
            {items.length > 0 ? (
                items.map((item, i) => (
                    <span key={i} className={`${styles.pill} ${orange ? styles.pillOrange : ''}`}>{item}</span>
                ))
            ) : (
                <span className={styles.emptyText}>{emptyText}</span>
            )}
        </div>
    );

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.container}>
                {/* Header Section */}
                <div className={styles.profileHeader}>
                    <div className={styles.avatarWrapper}>
                        {resolvedProfilePhotoUrl ? (
                            <img
                                src={resolvedProfilePhotoUrl}
                                alt="Profile"
                                className={styles.avatar}
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <div className={styles.avatarPlaceholder}>
                                <User size={80} strokeWidth={1} />
                            </div>
                        )}
                    </div>
                    <div className={styles.headerInfo}>
                        <div className={styles.nameRow}>
                            <h1 className={styles.doctorName}>{getVal('fullName') || 'Dr. User'}</h1>
                            <button className={styles.editBtn} onClick={handleEditProfile}>Edit Profile</button>
                        </div>
                        <p className={styles.specialty}>{getVal('specialty')}</p>
                        <p className={styles.experience}>
                            {getVal('experience')} years clinical experience
                            {formData.postSpecialisationExperience ? ` • ${formData.postSpecialisationExperience} years post-specialisation` : ''}
                        </p>

                        <div className={styles.divider}></div>

                        {/* Bio/Summary section removed as per user edit if preferred, 
                            but keeping a small "Current Role" or similar or just the divider is fine.
                            The user specifically commented out the bio div. */}
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className={styles.mainGrid}>
                    {/* Column 1: Identity & Credentials */}
                    <div className={styles.column}>
                        <Card title="Contact Information" icon={<User size={18} />}>
                            <div className={styles.contactList}>
                                <div className={styles.contactField}>
                                    <span className={styles.contactLabel}>Phone: {getVal('phone')}</span>
                                </div>
                                <div className={styles.contactField}>
                                    <span className={styles.contactLabel}>Email:</span>
                                    <span className={styles.contactValue}>{getVal('email')}</span>
                                    <div className={`${styles.statusBadge} ${currentUser?.status === 'verified' ? styles.statusVerified : styles.statusUnverified}`}>
                                        {currentUser?.status === 'verified' ? 'Verified' : 'Not-Verified'}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card title="Academic Credentials" icon={<GraduationCap size={18} />}>
                            <InfoRow label="Qualifications" value={getVal('qualifications')} />
                            <InfoRow label="MBBS Year" value={getVal('mbbsYear')} />
                            <InfoRow label="Specialisation Year" value={getVal('specialisationYear')} />
                            <div className={styles.subTitle}>Fellowships</div>
                            <PillContainer items={getArr('fellowships')} />
                        </Card>

                        <Card title="The Human Side" icon={<Coffee size={18} />}>
                            <div className={styles.subTitle}>Motivation in Practice</div>
                            <PillContainer items={getArr('motivation')} />
                            <div className={styles.subTitle}>Unwinding After Work</div>
                            <PillContainer items={getArr('unwinding')} />
                            <div className={styles.subTitle}>Training Experience</div>
                            <PillContainer items={getArr('trainingExperience')} />
                            <div className={styles.subTitle}>Recognition & Identity</div>
                            <div className={styles.contactValue}>{getVal('recognition')}</div>
                            <div className={styles.subTitle}>Quality Time / Interests</div>
                            <div className={styles.contactValue}>{getVal('qualityTime')}</div>
                        </Card>
                    </div>

                    {/* Column 2: Clinical Focus & Values */}
                    <div className={styles.column}>
                        <Card title="Expertise & Focus" icon={<Activity size={18} />}>
                            <div className={styles.subTitle}>Sub-Specialities</div>
                            <PillContainer items={getArr('areasOfInterest')} />
                            <div className={styles.subTitle}>Practice Segments</div>
                            <PillContainer items={getArr('practiceSegments')} />
                        </Card>

                        <Card title="Clinical Profile" icon={<Target size={18} />}>
                            <div className={styles.subTitle}>Common Conditions Treated</div>
                            <PillContainer items={getArr('commonConditions')} orange />
                            <div className={styles.subTitle}>Known For</div>
                            <PillContainer items={getArr('knownForConditions')} orange />
                            <div className={styles.subTitle}>Wants to Treat More</div>
                            <PillContainer items={getArr('wantToTreatConditions')} orange />
                        </Card>

                        <Card title="Patient Value & Philosophy" icon={<Heart size={18} />}>
                            <div className={styles.subTitle}><Sparkles size={14} /> What Patients Value</div>
                            <div className={styles.textBlock}>{getVal('patientValue')}</div>
                            <div className={styles.subTitle}><Lightbulb size={14} /> Approach to Care</div>
                            <div className={styles.textBlock}>{getVal('careApproach')}</div>
                            <div className={styles.subTitle}><Target size={14} /> Practice Philosophy</div>
                            <div className={styles.textBlock}>{getVal('practicePhilosophy')}</div>
                        </Card>
                    </div>

                    {/* Column 3: The Human Side & Logistics */}
                    <div className={styles.column}>
                        <Card title="Professional Standing" icon={<ShieldCheck size={18} />}>
                            <InfoRow label="Registration No." value={getVal('registrationNumber')} />
                            <InfoRow label="Medical Council" value={getVal('medicalCouncil')} />
                            <div className={styles.subTitle}>Memberships</div>
                            <div className={styles.contactValue}>{getVal('memberships')}</div>
                        </Card>

                        <Card title="Practice Logistics" icon={<MapPin size={18} />}>
                            <div className={styles.subTitle}><IndianRupee size={14} /> Consultation Fee</div>
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>Standard Fee</span>
                                <span className={styles.infoValue}>₹ {getVal('consultationFee') || '00'}</span>
                            </div>
                            <div className={styles.subTitle}><Languages size={14} /> Languages Spoken</div>
                            <PillContainer items={getArr('languages')} />
                            <div className={styles.subTitle}><Building size={14} /> Practice Locations</div>
                            <div className={styles.tagContainer}>
                                {getArr('practiceLocations').length > 0 ? (
                                    getArr('practiceLocations').map((loc: any, i: number) => (
                                        <div key={i} className={styles.hospitalInfo} style={{ width: '100%', marginBottom: '0.5rem' }}>
                                            <div className={styles.hospitalIcon}><Building size={16} /></div>
                                            <span className={styles.hospitalName}>{typeof loc === 'string' ? loc : (loc.name || loc.hospital_name)}</span>
                                        </div>
                                    ))
                                ) : (
                                    <span className={styles.emptyText}>None listed</span>
                                )}
                            </div>
                        </Card>

                        <Card title="Achievements & Aspirations" icon={<Trophy size={18} />}>
                            <div className={styles.subTitle}>Proudest Professional Achievement</div>
                            <div className={styles.textBlock}>{getVal('proudAchievement')}</div>
                            <div className={styles.subTitle}>Significant Personal Achievement</div>
                            <div className={styles.textBlock}>{getVal('personalAchievement')}</div>
                            <div className={styles.subTitle}>Professional Aspiration</div>
                            <div className={styles.textBlock}>{getVal('professionalAspiration')}</div>
                            <div className={styles.subTitle}>Personal Aspiration</div>
                            <div className={styles.textBlock}>{getVal('personalAspiration')}</div>
                            <div className={styles.subTitle}>Awards & Honors (Academic)</div>
                            <div className={styles.textBlock}>{getVal('awards')}</div>
                        </Card>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSummary;
