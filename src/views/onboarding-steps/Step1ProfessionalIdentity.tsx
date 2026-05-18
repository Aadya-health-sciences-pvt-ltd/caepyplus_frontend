'use client';
import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Sparkles, Upload } from 'lucide-react';
import CreatableDropdown from '../../components/ui/CreatableDropdown';
import CreatableMultiSelect from '../../components/ui/CreatableMultiSelect';
import styles from '../Onboarding.module.css';
import { FIELD_NAME_MAP } from './types';
import type { SharedStepProps, DropdownOption, MasterData } from './types';
import { SPOKEN_LANGUAGE_OPTIONS } from '../../lib/spokenLanguageOptions';
import { sanitizeIndianMobileInput, validateIndianMobile, validateIndianMobileOptional } from '../../lib/indianMobile';

// Lazy-load the Google Maps accordion — defers the Maps SDK until the user taps "Add Practice Location"
const PracticeLocationAccordion = dynamic(
    () => import('./PracticeLocationAccordion'),
    { ssr: false }
);

interface Step1Props extends SharedStepProps {
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    dropdownOptions: Record<string, DropdownOption[]>;
    masterData: MasterData;
    handleOptionAdded: (fieldKey: string, newOption: DropdownOption) => void;
    isEmailLogin: boolean;
    isPhoneLogin: boolean;
}

const Step1ProfessionalIdentity: React.FC<Step1Props> = ({
    formData,
    setFormData,
    handleInputChange,
    setFocusedField,
    profileProgress,
    fileInputRef,
    handleFileSelect,
    dropdownOptions,
    masterData,
    handleOptionAdded,
    isEmailLogin,
    isPhoneLogin,
}) => {
    const languagesAsList = (v: string[] | string | undefined): string[] => {
        if (Array.isArray(v)) return v;
        if (typeof v === 'string' && v.trim()) return v.split(',').map((s) => s.trim()).filter(Boolean);
        return [];
    };

    const [phoneError, setPhoneError] = useState<string | null>(null);

    const handlePhoneBlur = useCallback(() => {
        if (isPhoneLogin) return;
        const err = isEmailLogin ? validateIndianMobileOptional(formData.phone) : validateIndianMobile(formData.phone);
        setPhoneError(err);
    }, [isPhoneLogin, isEmailLogin, formData.phone]);

    return (
        <>
            <div id="section-prompt-block" className={styles.promptItem}>
                <Sparkles className={styles.promptIcon} size={20} />
                <p className={styles.promptText}>
                    &quot;Let&apos;s start with the basics. These help patients recognise you quickly and accurately.&quot;
                </p>
            </div>

            <div className={styles.sectionHeaderWrap}>
                <div>
                    <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>Professional Identity</h2>
                    <p style={{ fontSize: '0.875rem', color: '#10B981', marginTop: '0.25rem' }}>
                        Profile strength: {profileProgress.sections[0].earned}%
                        {!profileProgress.hasProfilePicture ? (
                            <span style={{ fontSize: '0.75rem', color: '#6B7280', marginLeft: '0.5rem' }}>(+5% with profile photo)</span>
                        ) : null}
                    </p>
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    style={{ display: 'none' }}
                />
                <button
                    className={styles.uploadBtn}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload size={20} color="#0F766E" strokeWidth={1.5} />
                    <div className={styles.uploadBtnContent}>
                        <span className={styles.uploadBtnTitle}>
                            {formData.profileImage ? 'Change Profile Pic' : 'Upload Profile Pic'}
                        </span>
                        <span className={styles.uploadBtnSubtitle}>Recommended: Square image, at least 400x400px</span>
                    </div>
                </button>
            </div>

            <div className={styles.formGrid}>
                <div className={styles.fullWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Full Name <span>*</span></label>
                        <input
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedField('fullName')}
                            className={styles.input}
                            placeholder="Dr. Full Name"
                        />
                    </div>
                </div>

                <div className={styles.halfWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Email <span>*</span></label>
                        <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedField('email')}
                            className={styles.input}
                            placeholder="doctor@example.com"
                            disabled={isEmailLogin}
                            style={isEmailLogin ? { background: '#F3F4F6', cursor: 'not-allowed' } : {}}
                        />
                    </div>
                </div>

                <div className={styles.halfWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Phone Number <span>*</span></label>
                        <input
                            name="phone"
                            type="tel"
                            inputMode="numeric"
                            autoComplete="tel-national"
                            maxLength={13}
                            value={formData.phone}
                            onChange={(e) => {
                                setPhoneError(null);
                                const next = sanitizeIndianMobileInput(e.target.value);
                                setFormData((prev) => ({ ...prev, phone: next }));
                            }}
                            onBlur={handlePhoneBlur}
                            onFocus={() => setFocusedField('phone')}
                            className={`${styles.input} ${phoneError ? styles.inputError : ''}`}
                            placeholder="+91 — then 10 digits (6–9…)"
                            disabled={isPhoneLogin}
                            style={isPhoneLogin ? { background: '#F3F4F6', cursor: 'not-allowed' } : {}}
                            aria-invalid={!!phoneError}
                        />
                        {!isPhoneLogin && phoneError ? (
                            <p className={styles.fieldErrorText}>{phoneError}</p>
                        ) : null}
                    </div>
                </div>

                <div className={styles.fullWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Specialty <span>*</span></label>
                        <CreatableDropdown
                            name="specialty"
                            value={formData.specialty}
                            options={dropdownOptions.specialty || masterData.specialties.map(s => ({ value: s.value, label: s.value }))}
                            fieldName={FIELD_NAME_MAP.specialty}
                            placeholder="Select or type a specialty"
                            onChange={(val) => setFormData(prev => ({ ...prev, specialty: val }))}
                            onFocus={() => setFocusedField('specialty')}
                            onOptionAdded={(opt) => handleOptionAdded('specialty', opt)}
                        />
                    </div>
                </div>

                <div className={styles.fullWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Languages Spoken</label>
                        <CreatableMultiSelect
                            name="languages"
                            values={languagesAsList(formData.languages)}
                            options={SPOKEN_LANGUAGE_OPTIONS}
                            fieldName="languages"
                            placeholder="Search and select languages…"
                            onChange={(vals) => setFormData((prev) => ({ ...prev, languages: vals }))}
                            onFocus={() => setFocusedField('languages')}
                            creatable={false}
                        />
                    </div>
                </div>

                <div className={styles.fullWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Primary Practice Location <span>*</span></label>
                        <CreatableDropdown
                            name="primaryLocation"
                            value={formData.primaryLocation}
                            options={dropdownOptions.primaryLocation || masterData.locations.map(loc => ({ value: loc.value, label: loc.value }))}
                            fieldName={FIELD_NAME_MAP.primaryLocation}
                            placeholder="Select or type a location"
                            onChange={(val) => setFormData(prev => ({ ...prev, primaryLocation: val }))}
                            onFocus={() => setFocusedField('primaryLocation')}
                            onOptionAdded={(opt) => handleOptionAdded('primaryLocation', opt)}
                        />
                    </div>
                </div>

                <div className={styles.fullWidth}>
                    <PracticeLocationAccordion
                        locations={formData.practiceLocations}
                        onLocationsChange={(locs) => setFormData((prev) => ({ ...prev, practiceLocations: locs }))}
                        onFocus={() => setFocusedField('practiceLocations')}
                    />
                </div>

                <div className={styles.halfWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Medical Registration Number <span>*</span></label>
                        <input
                            name="registrationNumber"
                            value={formData.registrationNumber}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedField('registrationNumber')}
                            className={styles.input}
                            placeholder="Enter your registration number"
                        />
                    </div>
                </div>

                <div className={styles.halfWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Medical Council <span>*</span></label>
                        <input
                            name="medicalCouncil"
                            value={formData.medicalCouncil}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedField('medicalCouncil')}
                            className={styles.input}
                            placeholder="Enter your medical council"
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Step1ProfessionalIdentity;
