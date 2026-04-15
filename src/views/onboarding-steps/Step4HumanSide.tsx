'use client';
import React from 'react';
import { Sparkles } from 'lucide-react';
import styles from '../Onboarding.module.css';
import type { SharedStepProps } from './types';

const Step4HumanSide: React.FC<SharedStepProps> = ({
    formData,
    handleInputChange,
    setFocusedField,
    profileProgress,
}) => {
    return (
        <>
            {/* Important AI Disclaimer */}
            <div style={{ background: '#F0FDFA', border: '1px solid #CCFBF1', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                <Sparkles size={20} color="#0F766E" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                    <p style={{ fontSize: '0.9rem', color: '#0F766E', fontWeight: 500, margin: 0 }}>
                        There are no right or wrong answers here. This section is not evaluated or compared. Everything here can be edited later.
                    </p>
                </div>
            </div>

            <div id="section-prompt-block" className={styles.promptItem}>
                <Sparkles className={styles.promptIcon} size={20} />
                <p className={styles.promptText}>
                    &quot;Let potential patients connect with you as a person. Share what drives you.&quot;
                </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>The Human Side</h2>
                    <p style={{ fontSize: '0.875rem', color: '#10B981', marginTop: '0.25rem' }}>
                        Profile strength: {profileProgress.sections.slice(0, 4).reduce((s, x) => s + x.earned, 0)}%
                        <span style={{ fontSize: '0.75rem', background: '#DBEAFE', color: '#1E40AF', padding: '2px 6px', borderRadius: '4px', marginLeft: '0.5rem' }}>Human Touch added</span>
                    </p>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', border: '1px solid #E5E7EB', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                    AI Generated Disclaimer will be added
                </div>
            </div>

            <div className={styles.formGrid}>
                <div className={styles.fullWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>What was the most challenging part of your training?</label>
                        <textarea
                            name="trainingExperience"
                            value={typeof formData.trainingExperience === 'string' ? formData.trainingExperience : (formData.trainingExperience || []).join(', ')}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedField('trainingExperience')}
                            className={styles.input}
                            rows={3}
                            maxLength={100}
                            placeholder="e.g. Long hours, emotional toll..."
                        />
                        <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
                            {(typeof formData.trainingExperience === 'string' ? formData.trainingExperience : (formData.trainingExperience || []).join(', ')).length} / 100
                        </div>
                    </div>
                </div>

                <div className={styles.fullWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>What keeps you going?</label>
                        <textarea
                            name="motivation"
                            value={typeof formData.motivation === 'string' ? formData.motivation : (formData.motivation || []).join(', ')}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedField('motivation')}
                            className={styles.input}
                            rows={3}
                            maxLength={100}
                            placeholder="e.g. Helping patients, clinical challenges..."
                        />
                        <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
                            {(typeof formData.motivation === 'string' ? formData.motivation : (formData.motivation || []).join(', ')).length} / 100
                        </div>
                    </div>
                </div>

                <div className={styles.fullWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>How do you unwind?</label>
                        <textarea
                            name="unwinding"
                            value={typeof formData.unwinding === 'string' ? formData.unwinding : (formData.unwinding || []).join(', ')}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedField('unwinding')}
                            className={styles.input}
                            rows={3}
                            maxLength={100}
                            placeholder="e.g. Family time, reading, sports..."
                        />
                        <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
                            {(typeof formData.unwinding === 'string' ? formData.unwinding : (formData.unwinding || []).join(', ')).length} / 100
                        </div>
                    </div>
                </div>

                <div className={styles.fullWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>How would you like to be recognised?</label>
                        <textarea
                            name="recognition"
                            value={formData.recognition}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedField('recognition')}
                            className={styles.input}
                            rows={3}
                            maxLength={100}
                            placeholder="e.g. Compassionate, dedicated, innovative..."
                        />
                        <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
                            {(formData.recognition || '').length} / 100
                        </div>
                    </div>
                </div>

                <div className={styles.fullWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>How do you prefer to spend quality time?</label>
                        <textarea
                            name="qualityTime"
                            value={formData.qualityTime}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedField('qualityTime')}
                            className={styles.input}
                            rows={3}
                            maxLength={100}
                            placeholder="e.g. Travel, reading, arts, networking..."
                        />
                        <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
                            {(formData.qualityTime || '').length} / 100
                        </div>
                    </div>
                </div>

                <div className={styles.fullWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Reflective Prompts (Optional)</label>
                        <textarea
                            name="proudAchievement"
                            value={formData.proudAchievement}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedField('proudAchievement')}
                            className={styles.input}
                            rows={2}
                            maxLength={100}
                            placeholder="One professional achievement you are proud of"
                            style={{ marginBottom: '0.25rem' }}
                        />
                        <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.125rem', marginBottom: '0.5rem' }}>
                            {(formData.proudAchievement || '').length} / 100
                        </div>
                        <textarea
                            name="personalAchievement"
                            value={formData.personalAchievement}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedField('personalAchievement')}
                            className={styles.input}
                            rows={2}
                            maxLength={100}
                            placeholder="One personal achievement outside medicine"
                            style={{ marginBottom: '0.25rem' }}
                        />
                        <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.125rem', marginBottom: '0.5rem' }}>
                            {(formData.personalAchievement || '').length} / 100
                        </div>
                        <textarea
                            name="professionalAspiration"
                            value={formData.professionalAspiration}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedField('professionalAspiration')}
                            className={styles.input}
                            rows={2}
                            maxLength={100}
                            placeholder="Professional aspiration"
                            style={{ marginBottom: '0.25rem' }}
                        />
                        <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.125rem', marginBottom: '0.5rem' }}>
                            {(formData.professionalAspiration || '').length} / 100
                        </div>
                        <textarea
                            name="personalAspiration"
                            value={formData.personalAspiration}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedField('personalAspiration')}
                            className={styles.input}
                            rows={2}
                            maxLength={100}
                            placeholder="Personal aspiration"
                        />
                        <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.125rem' }}>
                            {(formData.personalAspiration || '').length} / 100
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Step4HumanSide;
