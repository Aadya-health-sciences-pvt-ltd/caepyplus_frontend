'use client';
import React from 'react';
import { Sparkles } from 'lucide-react';
import CreatableDropdown from '../../components/ui/CreatableDropdown';
import styles from '../Onboarding.module.css';
import { FIELD_NAME_MAP } from './types';
import type { SharedStepProps, DropdownOption, MasterData } from './types';

interface Step3Props extends SharedStepProps {
    dropdownOptions: Record<string, DropdownOption[]>;
    masterData: MasterData;
    handleOptionAdded: (fieldKey: string, newOption: DropdownOption) => void;
    handleArrayChange: (field: string, value: string) => void;
}

const Step3ClinicalFocus: React.FC<Step3Props> = ({
    formData,
    setFormData,
    setFocusedField,
    profileProgress,
    dropdownOptions,
    masterData,
    handleOptionAdded,
    handleArrayChange,
}) => {
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
                        <CreatableDropdown
                            name="areasOfInterest"
                            value={Array.isArray(formData.areasOfInterest) ? formData.areasOfInterest[0] || '' : formData.areasOfInterest}
                            options={dropdownOptions.areasOfInterest || (masterData.areasOfInterest || []).map(item => ({ value: item.value, label: item.value }))}
                            fieldName={FIELD_NAME_MAP.areasOfInterest}
                            placeholder="Select or type an area of interest"
                            onChange={(val) => handleArrayChange('areasOfInterest', val)}
                            onFocus={() => setFocusedField('areasOfInterest')}
                            onOptionAdded={(opt) => handleOptionAdded('areasOfInterest', opt)}
                        />
                    </div>
                </div>

                <div className={styles.fullWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Practice Segments</label>
                        <CreatableDropdown
                            name="practiceSegments"
                            value={Array.isArray(formData.practiceSegments) ? formData.practiceSegments[0] || '' : formData.practiceSegments}
                            options={dropdownOptions.practiceSegments || masterData.practiceSegments.map((item: { value: string }) => ({ value: item.value, label: item.value }))}
                            fieldName={FIELD_NAME_MAP.practiceSegments}
                            placeholder="Select or type a practice segment"
                            onChange={(val) => handleArrayChange('practiceSegments', val)}
                            onFocus={() => setFocusedField('practiceSegments')}
                            onOptionAdded={(opt) => handleOptionAdded('practiceSegments', opt)}
                        />
                    </div>
                </div>

                <div className={styles.fullWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Most Common Conditions Treated <span>*</span></label>
                        <CreatableDropdown
                            name="commonConditions"
                            value={Array.isArray(formData.commonConditions) ? formData.commonConditions[0] || '' : formData.commonConditions}
                            options={dropdownOptions.commonConditions || masterData.commonConditions.map((item: { value: string }) => ({ value: item.value, label: item.value }))}
                            fieldName={FIELD_NAME_MAP.commonConditions}
                            placeholder="Select or type a condition"
                            onChange={(val) => handleArrayChange('commonConditions', val)}
                            onFocus={() => setFocusedField('commonConditions')}
                            onOptionAdded={(opt) => handleOptionAdded('commonConditions', opt)}
                        />
                    </div>
                </div>

                <div className={styles.fullWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Known For (Specific Expertise) <span>*</span></label>
                        <CreatableDropdown
                            name="knownForConditions"
                            value={Array.isArray(formData.knownForConditions) ? formData.knownForConditions[0] || '' : formData.knownForConditions}
                            options={dropdownOptions.knownForConditions || masterData.commonConditions.map((item: { value: string }) => ({ value: item.value, label: item.value }))}
                            fieldName={FIELD_NAME_MAP.knownForConditions}
                            placeholder="Select or type a specific expertise"
                            onChange={(val) => handleArrayChange('knownForConditions', val)}
                            onFocus={() => setFocusedField('knownForConditions')}
                            onOptionAdded={(opt) => handleOptionAdded('knownForConditions', opt)}
                        />
                    </div>
                </div>

                <div className={styles.fullWidth}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.label}>Conditions You Want to Treat More</label>
                        <CreatableDropdown
                            name="wantToTreatConditions"
                            value={formData.wantToTreatConditions}
                            options={dropdownOptions.wantToTreatConditions || masterData.commonConditions.map((item: { value: string }) => ({ value: item.value, label: item.value }))}
                            fieldName={FIELD_NAME_MAP.wantToTreatConditions}
                            placeholder="Select or type a condition"
                            onChange={(val) => setFormData(prev => ({ ...prev, wantToTreatConditions: val }))}
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
