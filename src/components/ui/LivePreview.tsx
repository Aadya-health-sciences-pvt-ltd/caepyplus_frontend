'use client';
import React, { useEffect, useRef } from 'react';
import { MapPin, Clock, Edit2, User } from 'lucide-react';
import styles from './LivePreview.module.css';
import { useResolvedProfilePhotoDisplayUrl } from '../../hooks/useResolvedProfilePhotoDisplayUrl';

// Match the full FormData structure from Onboarding.tsx
interface LivePreviewProps {
    data: {
        fullName: string;
        specialty: string;
        primaryLocation: string;
        practiceLocations: string | string[] | { name: string; address: string; schedule: string }[];
        experience: string;
        postSpecialisationExperience: string;
        registrationNumber: string;
        medicalCouncil: string;
        languages: string[];
        mbbsYear: string;
        specialisationYear: string;
        fellowships: string | string[];
        qualifications: string;
        memberships: string;
        awards: string;
        areasOfInterest: string | string[];
        practiceSegments: string[];
        commonConditions: string | string[];
        knownForConditions: string | string[];
        wantToTreatConditions: string;
        trainingExperience: string[];
        motivation: string[];
        unwinding: string[];
        recognition: string;
        qualityTime: string;
        proudAchievement: string;
        personalAchievement: string;
        professionalAspiration: string;
        personalAspiration: string;
        patientValue: string;
        careApproach: string;
        practicePhilosophy: string;
        profileImage?: string;
        contentSeed: {
            conditionName: string;
            presentation: string;
            investigations: string;
            treatment: string;
            delayConsequences: string;
            prevention: string;
            additionalInsights: string;
        };
    };
    currentStep: number;
    focusedField?: string;
    onEditField?: (fieldName: string) => void;
}

interface FieldConfig {
    name: string;
    label: string;
    getValue: (data: LivePreviewProps['data']) => string;
}

const LivePreview: React.FC<LivePreviewProps> = ({ data, focusedField, onEditField }) => {
    const scrollableRef = useRef<HTMLDivElement>(null);
    const fieldRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    const rawProfileImage = typeof data.profileImage === 'string' ? data.profileImage : '';
    // Do not fetch the doctor's stored DB photo when the form has no image yet — show an empty avatar instead.
    const skipServerSignedFetch =
        !rawProfileImage.trim() || /^(data:|blob:)/i.test(rawProfileImage);
    const { url: previewProfilePhotoUrl } = useResolvedProfilePhotoDisplayUrl(
        rawProfileImage || undefined,
        undefined,
        skipServerSignedFetch,
    );

    const formatArray = (val: string | string[]) => Array.isArray(val) ? val.join(', ') : val;

    // Define fields for each section in the exact order they appear in the form
    const getFieldsForStep = (step: number): FieldConfig[] => {
        switch (step) {
            case 1: // Professional Identity
                return [
                    { name: 'fullName', label: 'Enter your full name:', getValue: (d) => d.fullName },
                    { name: 'specialty', label: 'What is your area of specialization?', getValue: (d) => d.specialty },
                    { name: 'primaryLocation', label: 'Where is your practice located?', getValue: (d) => d.primaryLocation },
                    {
                        name: 'practiceLocations', label: 'Which hospital or clinic are you associated with?', getValue: (d) => {
                            if (!d.practiceLocations) return '';
                            if (typeof d.practiceLocations === 'string') return d.practiceLocations;
                            if (Array.isArray(d.practiceLocations)) {
                                return d.practiceLocations.map((loc: any) => typeof loc === 'string' ? loc : loc.name).filter(Boolean).join(', ');
                            }
                            return '';
                        }
                    },
                    { name: 'experience', label: 'How many years of experience do you have?', getValue: (d) => d.experience ? `${d.experience} years` : '' },
                    { name: 'postSpecialisationExperience', label: 'Post-Specialisation Exp.', getValue: (d) => d.postSpecialisationExperience ? `${d.postSpecialisationExperience} years` : '' },
                    { name: 'registrationNumber', label: 'Medical Registration Number', getValue: (d) => d.registrationNumber },
                    { name: 'medicalCouncil', label: 'Medical Council', getValue: (d) => d.medicalCouncil },
                    { name: 'languages', label: 'Languages Spoken', getValue: (d) => formatArray(d.languages) },
                ];
            case 2: // Credentials & Trust Markers
                return [
                    { name: 'mbbsYear', label: 'Year of MBBS', getValue: (d) => d.mbbsYear },
                    { name: 'specialisationYear', label: 'Year of Specialisation', getValue: (d) => d.specialisationYear },
                    { name: 'fellowships', label: 'Fellowships / Diplomas', getValue: (d) => formatArray(d.fellowships) },
                    { name: 'qualifications', label: 'What is your highest qualification?', getValue: (d) => d.qualifications },
                    { name: 'memberships', label: 'Memberships (Societies)', getValue: (d) => d.memberships },
                    { name: 'awards', label: 'Any notable recognition? (Awards)', getValue: (d) => d.awards },
                ];
            case 3: // Clinical Focus & Expertise
                return [
                    { name: 'areasOfInterest', label: 'What are your areas of interest?', getValue: (d) => formatArray(d.areasOfInterest) },
                    { name: 'practiceSegments', label: 'Practice Segments', getValue: (d) => formatArray(d.practiceSegments) },
                    { name: 'commonConditions', label: 'Most Common Conditions Treated', getValue: (d) => formatArray(d.commonConditions) },
                    { name: 'knownForConditions', label: 'Known For (Specific Expertise)', getValue: (d) => formatArray(d.knownForConditions) },
                    { name: 'wantToTreatConditions', label: 'Conditions You Want to Treat More', getValue: (d) => d.wantToTreatConditions },
                ];
            case 4: // The Human Side
                return [
                    { name: 'trainingExperience', label: 'What was the most challenging part of your training?', getValue: (d) => formatArray(d.trainingExperience) },
                    { name: 'motivation', label: 'What keeps you going?', getValue: (d) => formatArray(d.motivation) },
                    { name: 'unwinding', label: 'How do you unwind?', getValue: (d) => formatArray(d.unwinding) },
                    { name: 'recognition', label: 'How would you like to be recognised?', getValue: (d) => d.recognition },
                    { name: 'qualityTime', label: 'How do you prefer to spend quality time?', getValue: (d) => d.qualityTime },
                    { name: 'proudAchievement', label: 'One professional achievement you are proud of', getValue: (d) => d.proudAchievement },
                    { name: 'personalAchievement', label: 'One personal achievement outside medicine', getValue: (d) => d.personalAchievement },
                    { name: 'professionalAspiration', label: 'Professional aspiration', getValue: (d) => d.professionalAspiration },
                    { name: 'personalAspiration', label: 'Personal aspiration', getValue: (d) => d.personalAspiration },
                ];
            case 5: // Patient Value & Choice Factors
                return [
                    { name: 'patientValue', label: 'What patients value most in your practice', getValue: (d) => d.patientValue },
                    { name: 'careApproach', label: 'Your approach to care', getValue: (d) => d.careApproach },
                    { name: 'practicePhilosophy', label: 'Availability / philosophy of practice', getValue: (d) => d.practicePhilosophy },
                ];
            case 6: // Content Seed
                return [
                    { name: 'contentSeed.conditionName', label: 'Condition Name', getValue: (d) => d.contentSeed?.conditionName },
                    { name: 'contentSeed.presentation', label: 'Typical Presentation', getValue: (d) => d.contentSeed?.presentation },
                    { name: 'contentSeed.investigations', label: 'Investigations', getValue: (d) => d.contentSeed?.investigations },
                    { name: 'contentSeed.treatment', label: 'Treatment Options', getValue: (d) => d.contentSeed?.treatment },
                    { name: 'contentSeed.delayConsequences', label: 'Consequences of Delay', getValue: (d) => d.contentSeed?.delayConsequences },
                    { name: 'contentSeed.prevention', label: 'Prevention', getValue: (d) => d.contentSeed?.prevention },
                    { name: 'contentSeed.additionalInsights', label: 'Additional Insights', getValue: (d) => d.contentSeed?.additionalInsights },
                ];
            default:
                return [];
        }
    };

    // Auto-scroll to focused field
    useEffect(() => {
        if (focusedField && fieldRefs.current[focusedField] && scrollableRef.current) {
            const fieldElement = fieldRefs.current[focusedField];
            if (fieldElement) {
                fieldElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }, [focusedField]);


    return (
        <div className={styles.previewContainer}>
            <div className={styles.header}>
                <h3 className={styles.headerTitle}>Live Preview</h3>
                <span className={styles.badge}>Auto-updating</span>
            </div>

            <div className={styles.scrollableContent} ref={scrollableRef}>
                {/* Profile Header Card */}
                <div className={styles.profileCard}>
                    <div className={styles.profileHeader}>
                        <div className={styles.avatarPlaceholder}>
                            {previewProfilePhotoUrl ? (
                                <img
                                    src={previewProfilePhotoUrl}
                                    alt="Profile"
                                    className={styles.avatar}
                                    referrerPolicy="no-referrer"
                                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                />
                            ) : (
                                <User className={styles.avatarEmptyIcon} size={28} strokeWidth={1.25} aria-hidden />
                            )}
                        </div>
                        <div className={styles.profileInfo}>
                            <div className={styles.name}>
                                {data.fullName || 'Dr. [Name]'}
                            </div>
                            <div className={styles.specialization}>
                                {data.specialty || '[Specialty]'}
                            </div>

                            {data.primaryLocation && (
                                <div className={styles.metaRow}>
                                    <MapPin className={styles.icon} />
                                    <span>{data.primaryLocation}</span>
                                </div>
                            )}
                            {data.experience && (
                                <div className={styles.metaRow}>
                                    <Clock className={styles.icon} />
                                    <span>{data.experience} years experience</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Field Cards - Grouped by Section */}
                {[1, 2, 3, 4, 5, 6].map((step) => {
                    const stepFields = getFieldsForStep(step);
                    if (stepFields.length === 0) return null;

                    const stepTitles: { [key: number]: string } = {
                        1: 'Professional Identity',
                        2: 'Credentials & Trust',
                        3: 'Clinical Focus',
                        4: 'The Human Side',
                        5: 'Philosophy & Approach',
                        6: 'Content Seed'
                    };

                    return (
                        <div key={step} className={styles.sectionGroup}>
                            <div className={styles.sectionHeader}>
                                <span className={styles.sectionTitle}>{stepTitles[step]}</span>
                                {onEditField && (
                                    <div
                                        className={styles.sectionEditBtn}
                                        onClick={() => onEditField(stepFields[0].name)}
                                    >
                                        <Edit2 size={12} />
                                        <span>Edit Section</span>
                                    </div>
                                )}
                            </div>
                            {stepFields.map((field) => (
                                <div
                                    key={field.name}
                                    ref={(el) => { fieldRefs.current[field.name] = el; }}
                                    className={styles.fieldCard}
                                >
                                    <div className={styles.fieldContent}>
                                        <label className={styles.fieldLabel}>{field.label}</label>
                                        <div className={`${styles.fieldValue} ${!field.getValue(data) ? styles.empty : ''}`}>
                                            {field.getValue(data) || 'Not set'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LivePreview;
