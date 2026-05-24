'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import styles from '../Onboarding.module.css';
import type { SharedStepProps } from './types';
import { validateMbbsYearValue, validateSpecialisationYearValue, getCredentialsYearMax } from '../../lib/validation';
import { fellowshipsToCommaList } from '../../lib/fellowshipsCommaList';

interface Step2Props extends SharedStepProps {
    handleArrayChange: (field: string, value: string) => void;
}

const Step2Credentials: React.FC<Step2Props> = ({
    formData,
    setFormData,
    handleInputChange,
    setFocusedField,
    profileProgress,
    handleArrayChange,
}) => {
    const [mbbsYearError, setMbbsYearError] = useState<string | null>(null);
    const [specialisationYearError, setSpecialisationYearError] = useState<string | null>(null);

    const handleMbbsBlur = useCallback(() => {
        const err = validateMbbsYearValue(formData.mbbsYear);
        setMbbsYearError(err);
        const specRaw = formData.specialisationYear;
        if (specRaw != null && String(specRaw).trim()) {
            setSpecialisationYearError(validateSpecialisationYearValue(specRaw, formData.mbbsYear));
        } else {
            setSpecialisationYearError(null);
        }
    }, [formData.mbbsYear, formData.specialisationYear]);

    const handleSpecialisationBlur = useCallback(() => {
        setSpecialisationYearError(validateSpecialisationYearValue(formData.specialisationYear, formData.mbbsYear));
    }, [formData.mbbsYear, formData.specialisationYear]);

    useEffect(() => {
        const yMax = getCredentialsYearMax();
        const raw = String(formData.mbbsYear ?? '').trim();
        if (!raw) {
            setFormData((prev) => (prev.experience === '' ? prev : { ...prev, experience: '' }));
            return;
        }
        if (validateMbbsYearValue(formData.mbbsYear) !== null) return;
        const mbbsY = parseInt(raw, 10);
        const exp = Math.max(0, yMax - mbbsY);
        const next = String(exp);
        setFormData((prev) => (prev.experience === next ? prev : { ...prev, experience: next }));
    }, [formData.mbbsYear, setFormData]);

    useEffect(() => {
        const yMax = getCredentialsYearMax();
        const raw = String(formData.specialisationYear ?? '').trim();
        if (!raw) {
            setFormData((prev) =>
                prev.postSpecialisationExperience === '' ? prev : { ...prev, postSpecialisationExperience: '' },
            );
            return;
        }
        if (validateSpecialisationYearValue(formData.specialisationYear, formData.mbbsYear) !== null) {
            setFormData((prev) =>
                prev.postSpecialisationExperience === '' ? prev : { ...prev, postSpecialisationExperience: '' },
            );
            return;
        }
        const specY = parseInt(raw, 10);
        const post = Math.max(0, yMax - specY);
        const next = String(post);
        setFormData((prev) =>
            prev.postSpecialisationExperience === next ? prev : { ...prev, postSpecialisationExperience: next },
        );
    }, [formData.specialisationYear, formData.mbbsYear, setFormData]);

    return (
        <>
            <div id="section-prompt-block" className={styles.promptItem}>
                <Sparkles className={styles.promptIcon} size={20} />
                <p className={styles.promptText}>
                    &quot;This section highlights your training and professional milestones. You may keep this factual.&quot;
                </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>Credentials &amp; Trust Markers</h2>
                    <p style={{ fontSize: '0.875rem', color: '#10B981', marginTop: '0.25rem' }}>
                        Profile strength: {profileProgress.sections.slice(0, 2).reduce((s, x) => s + x.earned, 0)}%
                        <span style={{ fontSize: '0.75rem', background: '#FEF3C7', color: '#D97706', padding: '2px 6px', borderRadius: '4px', marginLeft: '0.5rem' }}>Authority badge unlocked</span>
                    </p>
                </div>
            </div>

            <div className={styles.formGrid}>
                <div className={styles.halfWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Year of MBBS <span>*</span></label>
                        <input
                            name="mbbsYear"
                            inputMode="numeric"
                            autoComplete="off"
                            value={formData.mbbsYear}
                            onChange={(e) => {
                                setMbbsYearError(null);
                                handleInputChange(e);
                            }}
                            onBlur={handleMbbsBlur}
                            onFocus={() => setFocusedField('mbbsYear')}
                            className={`${styles.input} ${mbbsYearError ? styles.inputError : ''}`}
                            placeholder="YYYY"
                            aria-invalid={!!mbbsYearError}
                        />
                        {mbbsYearError ? <p className={styles.fieldErrorText}>{mbbsYearError}</p> : null}
                    </div>
                </div>

                <div className={styles.halfWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Year of Specialisation</label>
                        <input
                            name="specialisationYear"
                            inputMode="numeric"
                            autoComplete="off"
                            value={formData.specialisationYear}
                            onChange={(e) => {
                                setSpecialisationYearError(null);
                                handleInputChange(e);
                            }}
                            onBlur={handleSpecialisationBlur}
                            onFocus={() => setFocusedField('specialisationYear')}
                            className={`${styles.input} ${specialisationYearError ? styles.inputError : ''}`}
                            placeholder="YYYY"
                            aria-invalid={!!specialisationYearError}
                        />
                        {specialisationYearError ? <p className={styles.fieldErrorText}>{specialisationYearError}</p> : null}
                    </div>
                </div>

                <div className={styles.halfWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Years of Experience <span>*</span></label>
                        <input
                            name="experience"
                            type="number"
                            value={formData.experience}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedField('experience')}
                            className={styles.input}
                            placeholder="e.g. 10"
                        />
                    </div>
                </div>

                <div className={styles.halfWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Post-Specialisation Exp.</label>
                        <input
                            name="postSpecialisationExperience"
                            type="number"
                            value={formData.postSpecialisationExperience}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedField('postSpecialisationExperience')}
                            className={styles.input}
                            placeholder="(Optional)"
                        />
                    </div>
                </div>

                <div className={styles.fullWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Fellowships</label>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input
                                value={fellowshipsToCommaList(formData.fellowships)}
                                onChange={(e) => handleArrayChange('fellowships', e.target.value)}
                                onFocus={() => setFocusedField('fellowships')}
                                className={styles.input}
                                placeholder="e.g. Cardiology Fellowship, National Heart Institute"
                                style={{ flex: 3 }}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.fullWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Qualifications</label>
                        <textarea
                            name="qualifications"
                            value={formData.qualifications}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedField('qualifications')}
                            className={styles.input}
                            placeholder="e.g. MD, DM, DNB..."
                            rows={2}
                        />
                    </div>
                </div>

                <div className={styles.fullWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Memberships (Societies)</label>
                        <input
                            name="memberships"
                            value={formData.memberships}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedField('memberships')}
                            className={styles.input}
                            placeholder="(Optional)"
                        />
                    </div>
                </div>

                <div className={styles.fullWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Awards / Honors</label>
                        <input
                            name="awards"
                            value={formData.awards}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedField('awards')}
                            className={styles.input}
                            placeholder="(Optional)"
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Step2Credentials;
