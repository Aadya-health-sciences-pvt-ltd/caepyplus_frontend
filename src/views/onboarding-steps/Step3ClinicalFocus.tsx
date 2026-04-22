'use client';
import React from 'react';
import { Sparkles } from 'lucide-react';
import CreatableMultiSelect from '../../components/ui/CreatableMultiSelect';
import styles from '../Onboarding.module.css';
import { FIELD_NAME_MAP } from './types';
import type { SharedStepProps, DropdownOption, MasterData } from './types';

interface Step3Props extends SharedStepProps {
    dropdownOptions: Record<string, DropdownOption[]>;
    masterData: MasterData;
    handleOptionAdded: (fieldKey: string, newOption: DropdownOption) => void;
}

const Step3ClinicalFocus: React.FC<Step3Props> = ({
    formData,
    setFormData,
    setFocusedField,
    profileProgress,
    dropdownOptions,
    masterData,
    handleOptionAdded,
}) => {
    const asList = (v: string[] | string | undefined): string[] => {
        if (Array.isArray(v)) return v;
        if (typeof v === 'string' && v.trim()) return v.split(',').map(s => s.trim()).filter(Boolean);
        return [];
    };

    return (
        <>
            <div id="section-prompt-block" className={styles.promptItem}>
                <Sparkles className={styles.promptIcon} size={20} />
                <p className={styles.promptText}>
                    &quot;This reflects what you actually practice, not just what you were trained in.&quot;
                </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>Clinical Focus &amp; Expertise</h2>
                    <p style={{ fontSize: '0.875rem', color: '#10B981', marginTop: '0.25rem' }}>
                        Profile strength: {profileProgress.sections.slice(0, 3).reduce((s, x) => s + x.earned, 0)}%
                    </p>
                </div>
            </div>

            <div className={styles.formGrid}>
                <div className={styles.fullWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Areas of Interest</label>
                        <CreatableMultiSelect
                            name="areasOfInterest"
                            values={asList(formData.areasOfInterest)}
                            options={dropdownOptions.areasOfInterest || (masterData.areasOfInterest || []).map(item => ({ value: item.value, label: item.value }))}
                            fieldName={FIELD_NAME_MAP.areasOfInterest}
                            placeholder="Add areas of interest"
                            onChange={(vals) => setFormData(prev => ({ ...prev, areasOfInterest: vals }))}
                            onFocus={() => setFocusedField('areasOfInterest')}
                            onOptionAdded={(opt) => handleOptionAdded('areasOfInterest', opt)}
                        />
                    </div>
                </div>

                <div className={styles.fullWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Practice Segments</label>
                        <CreatableMultiSelect
                            name="practiceSegments"
                            values={asList(formData.practiceSegments)}
                            options={dropdownOptions.practiceSegments || masterData.practiceSegments.map((item: { value: string }) => ({ value: item.value, label: item.value }))}
                            fieldName={FIELD_NAME_MAP.practiceSegments}
                            placeholder="Add practice segments"
                            onChange={(vals) => setFormData(prev => ({ ...prev, practiceSegments: vals }))}
                            onFocus={() => setFocusedField('practiceSegments')}
                            onOptionAdded={(opt) => handleOptionAdded('practiceSegments', opt)}
                        />
                    </div>
                </div>

                <div className={styles.fullWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Most Common Conditions Treated <span>*</span></label>
                        <CreatableMultiSelect
                            name="commonConditions"
                            values={asList(formData.commonConditions)}
                            options={dropdownOptions.commonConditions || masterData.commonConditions.map((item: { value: string }) => ({ value: item.value, label: item.value }))}
                            fieldName={FIELD_NAME_MAP.commonConditions}
                            placeholder="Add conditions you commonly treat"
                            onChange={(vals) => setFormData(prev => ({ ...prev, commonConditions: vals }))}
                            onFocus={() => setFocusedField('commonConditions')}
                            onOptionAdded={(opt) => handleOptionAdded('commonConditions', opt)}
                        />
                    </div>
                </div>

                <div className={styles.fullWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Known For (Specific Expertise) <span>*</span></label>
                        <CreatableMultiSelect
                            name="knownForConditions"
                            values={asList(formData.knownForConditions)}
                            options={dropdownOptions.knownForConditions || masterData.commonConditions.map((item: { value: string }) => ({ value: item.value, label: item.value }))}
                            fieldName={FIELD_NAME_MAP.knownForConditions}
                            placeholder="Add areas of specific expertise"
                            onChange={(vals) => setFormData(prev => ({ ...prev, knownForConditions: vals }))}
                            onFocus={() => setFocusedField('knownForConditions')}
                            onOptionAdded={(opt) => handleOptionAdded('knownForConditions', opt)}
                        />
                    </div>
                </div>

                <div className={styles.fullWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Conditions You Want to Treat More</label>
                        <CreatableMultiSelect
                            name="wantToTreatConditions"
                            values={asList(formData.wantToTreatConditions)}
                            options={dropdownOptions.wantToTreatConditions || masterData.commonConditions.map((item: { value: string }) => ({ value: item.value, label: item.value }))}
                            fieldName={FIELD_NAME_MAP.wantToTreatConditions}
                            placeholder="Add conditions you want to focus on"
                            onChange={(vals) => setFormData(prev => ({ ...prev, wantToTreatConditions: vals }))}
                            onFocus={() => setFocusedField('wantToTreatConditions')}
                            onOptionAdded={(opt) => handleOptionAdded('wantToTreatConditions', opt)}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Step3ClinicalFocus;
