'use client';
import React from 'react';
import { Sparkles } from 'lucide-react';
import styles from '../Onboarding.module.css';
import type { SharedStepProps } from './types';

interface Step2Props extends SharedStepProps {
    handleArrayChange: (field: string, value: string) => void;
}

const Step2Credentials: React.FC<Step2Props> = ({
    formData,
    handleInputChange,
    setFocusedField,
    profileProgress,
    handleArrayChange,
}) => {
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
                            value={formData.mbbsYear}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedField('mbbsYear')}
                            className={styles.input}
                            placeholder="YYYY"
                        />
                    </div>
                </div>

                <div className={styles.halfWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Year of Specialisation</label>
                        <input
                            name="specialisationYear"
                            value={formData.specialisationYear}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedField('specialisationYear')}
                            className={styles.input}
                            placeholder="YYYY"
                        />
                    </div>
                </div>

                <div className={styles.fullWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Fellowships</label>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input
                                value={Array.isArray(formData.fellowships) ? formData.fellowships.join(', ') : formData.fellowships}
                                onChange={(e) => handleArrayChange('fellowships', e.target.value)}
                                onFocus={() => setFocusedField('fellowships')}
                                className={styles.input}
                                placeholder="Add fellowship..."
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
