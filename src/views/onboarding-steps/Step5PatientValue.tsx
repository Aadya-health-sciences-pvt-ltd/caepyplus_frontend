'use client';
import React from 'react';
import { Sparkles } from 'lucide-react';
import styles from '../Onboarding.module.css';
import type { SharedStepProps } from './types';

const Step5PatientValue: React.FC<SharedStepProps> = ({
    formData,
    handleInputChange,
    setFocusedField,
    profileProgress,
}) => {
    return (
        <>
            <div id="section-prompt-block" className={styles.promptItem}>
                <Sparkles className={styles.promptIcon} size={20} />
                <p className={styles.promptText}>
                    &quot;If a patient had 30 seconds to understand your practice, what would you want them to know?&quot;
                </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>Patient Value &amp; Choice Factors</h2>
                    <p style={{ fontSize: '0.875rem', color: '#10B981', marginTop: '0.25rem' }}>
                        Profile strength: {profileProgress.sections.slice(0, 5).reduce((s, x) => s + x.earned, 0)}%
                    </p>
                </div>
            </div>

            <div className={styles.formGrid}>
                <div className={styles.fullWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>What patients value most in your practice</label>
                        <textarea
                            name="patientValue"
                            value={formData.patientValue}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedField('patientValue')}
                            className={styles.input}
                            rows={3}
                            maxLength={100}
                        />
                        <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
                            {(formData.patientValue || '').length} / 100
                        </div>
                    </div>
                </div>

                <div className={styles.fullWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Your approach to care</label>
                        <textarea
                            name="careApproach"
                            value={formData.careApproach}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedField('careApproach')}
                            className={styles.input}
                            rows={3}
                            maxLength={100}
                        />
                        <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
                            {(formData.careApproach || '').length} / 100
                        </div>
                    </div>
                </div>

                <div className={styles.fullWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Availability / philosophy of practice</label>
                        <textarea
                            name="practicePhilosophy"
                            value={formData.practicePhilosophy}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedField('practicePhilosophy')}
                            className={styles.input}
                            rows={3}
                            maxLength={100}
                        />
                        <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
                            {(formData.practicePhilosophy || '').length} / 100
                        </div>
                    </div>
                </div>

                <div className={styles.halfWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Consultation Fee (Optional)</label>
                        <div className={styles.feeInputWrapper}>
                            <span className={styles.currencyPrefix}>₹</span>
                            <input
                                name="consultationFee"
                                type="number"
                                value={formData.consultationFee}
                                onChange={handleInputChange}
                                onFocus={() => setFocusedField('consultationFee')}
                                className={styles.input}
                                placeholder="e.g. 500"
                                style={{ paddingLeft: '2.5rem' }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Step5PatientValue;
