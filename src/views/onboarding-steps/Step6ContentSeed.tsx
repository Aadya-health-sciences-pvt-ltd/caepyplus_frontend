'use client';
import React from 'react';
import { Sparkles } from 'lucide-react';
import styles from '../Onboarding.module.css';
import type { SharedStepProps } from './types';

const Step6ContentSeed: React.FC<SharedStepProps> = ({
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
                    &quot;Just answer as you would explain to a patient in your clinic. No need to write an article.&quot;
                </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 className={styles.sectionTitle}>Content Seed (Optional)</h2>
                    <p style={{ fontSize: '0.875rem', color: '#10B981', marginTop: '0.25rem' }}>
                        Profile strength: {profileProgress.totalPercentage}%{' '}
                        {profileProgress.sections[5].isComplete ? '✓ First content seed created' : ''}
                    </p>
                </div>
            </div>

            <div className={styles.formGrid}>
                <div className={styles.fullWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Condition Name</label>
                        <input
                            name="contentSeed.conditionName"
                            value={formData.contentSeed.conditionName}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedField('contentSeed.conditionName')}
                            className={styles.input}
                        />
                    </div>
                </div>
                <div className={styles.fullWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Typical Presentation</label>
                        <textarea
                            name="contentSeed.presentation"
                            value={formData.contentSeed.presentation}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedField('contentSeed.presentation')}
                            className={styles.input}
                            rows={2}
                        />
                    </div>
                </div>
                <div className={styles.fullWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Investigations</label>
                        <textarea
                            name="contentSeed.investigations"
                            value={formData.contentSeed.investigations}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedField('contentSeed.investigations')}
                            className={styles.input}
                            rows={2}
                        />
                    </div>
                </div>
                <div className={styles.fullWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Treatment Options</label>
                        <textarea
                            name="contentSeed.treatment"
                            value={formData.contentSeed.treatment}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedField('contentSeed.treatment')}
                            className={styles.input}
                            rows={2}
                        />
                    </div>
                </div>
                <div className={styles.fullWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Consequences of Delay</label>
                        <textarea
                            name="contentSeed.delayConsequences"
                            value={formData.contentSeed.delayConsequences}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedField('contentSeed.delayConsequences')}
                            className={styles.input}
                            rows={2}
                        />
                    </div>
                </div>
                <div className={styles.fullWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Prevention</label>
                        <textarea
                            name="contentSeed.prevention"
                            value={formData.contentSeed.prevention}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedField('contentSeed.prevention')}
                            className={styles.input}
                            rows={2}
                        />
                    </div>
                </div>
                <div className={styles.fullWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Any Additional Insights</label>
                        <textarea
                            name="contentSeed.additionalInsights"
                            value={formData.contentSeed.additionalInsights}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedField('contentSeed.additionalInsights')}
                            className={styles.input}
                            rows={2}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Step6ContentSeed;
