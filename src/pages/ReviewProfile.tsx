import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Edit2, Check, User, Activity, Briefcase, Building, MapPin,
    Award, FileText, GraduationCap, ArrowLeft, Target, Coffee, Heart, Lightbulb
} from 'lucide-react';
import Stepper from '../components/ui/Stepper';
import Toast from '../components/ui/Toast';
import styles from './ReviewProfile.module.css';
import { mockDataService } from '../services/mockDataService';
import { doctorService } from '../services/doctorService';
import { validateSection1 } from '../lib/validation';

const ReviewProfile = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const formData = location.state?.formData || {};
    const stage = location.state?.stage || 'final'; // 'intermediate' or 'final'

    // Toast State
    const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
        message: '',
        type: 'success',
        isVisible: false
    });

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ message, type, isVisible: true });
    };

    const handleToastClose = () => {
        setToast(prev => ({ ...prev, isVisible: false }));
    };

    // Helper to safely access data
    const getVal = (key: string) => formData[key] || 'Not provided';
    const getArr = (key: string) => Array.isArray(formData[key]) && formData[key].length > 0
        ? formData[key].join(', ')
        : (formData[key] || 'None');

    const handleSubmit = async () => {
        // Validate Section 1 before submission
        const { isValid, missingFields } = validateSection1(formData);
        if (!isValid) {
            showToast(`Cannot submit. Missing: ${missingFields.join(', ')}`, 'error');
            return;
        }

        const doctorId = localStorage.getItem('doctor_id');
        if (!doctorId) {
            showToast('User session not found. Please log in again.', 'error');
            return;
        }

        try {
            // 1. Save latest data first
            await doctorService.updateDoctorDetails(doctorId, formData);

            // 2. Submit profile
            await doctorService.submitProfile(doctorId);

            // 3. Update mock status for UI consistency
            const currentUser = mockDataService.getCurrentUser();
            if (currentUser) {
                mockDataService.updateProfile(currentUser.id, {
                    status: 'submitted',
                    data: formData
                });
            }

            showToast('Profile submitted successfully!', 'success');

            // 4. Redirect
            setTimeout(() => {
                navigate('/submitted', { state: { formData } });
            }, 1000);

        } catch (err: any) {
            console.error('Submission failed:', err);
            const msg = err.response?.data?.message || 'Failed to submit profile. Please try again.';
            showToast(msg, 'error');
        }
    };

    const handleContinue = async () => {
        const doctorId = localStorage.getItem('doctor_id');
        if (doctorId) {
            try {
                await doctorService.updateDoctorDetails(doctorId, formData);
            } catch (err) {
                console.error('Auto-save failed on continue:', err);
            }
        }
        navigate('/onboarding', { state: { formData, step: 4 } });
    };

    const handleEditSection = (step: number) => {
        navigate('/onboarding', { state: { formData, step } });
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.header}>
                <h1 className={styles.title}>
                    {stage === 'intermediate' ? 'Great Progress!' : 'Review Your Profile'}
                </h1>
                <p className={styles.subtitle}>
                    {stage === 'intermediate'
                        ? 'You have completed the mandatory sections.'
                        : 'Checking your details before submission.'}
                </p>
            </div>

            <Stepper currentStep={stage === 'intermediate' ? 3 : 6} totalSteps={6} />

            <div className={styles.card}>
                {stage === 'intermediate' && (
                    <div className={styles.scoreBanner} style={{
                        background: '#F0FDFA', border: '1px solid #CCFBF1', borderRadius: '1rem', padding: '1.5rem',
                        marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}>
                        <div>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0F766E', marginBottom: '0.5rem' }}>
                                Profile Score: 60%
                            </h3>
                            <p style={{ color: '#0F766E' }}>
                                Completing the next 3 optional sections will boost your visibility by 40%.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={handleContinue} className={styles.submitButton} style={{ width: 'auto', padding: '0.75rem 1.5rem' }}>
                                Continue to Section 4
                            </button>
                        </div>
                    </div>
                )}

                <div className={styles.profileHeaderSection} style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
                    <div className={styles.reviewAvatar}>
                        {formData.profileImage ? (
                            <img src={formData.profileImage} alt="Profile" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid white', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        ) : (
                            <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: '#9CA3AF', border: '4px solid white', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                                {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : '?'}
                            </div>
                        )}
                    </div>
                    <div>
                        <h2 className={styles.sectionHeader} style={{ marginTop: 0, marginBottom: '0.25rem' }}>Professional Profile</h2>
                        <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: 0 }}>Review your primary details and profile photo.</p>
                    </div>
                </div>

                <div className={styles.reviewSection}>
                    <div className={styles.reviewSectionHeader}>
                        <h3 className={styles.sectionTitle}>Section 1: Professional Identity</h3>
                        <button className={styles.sectionEditBtn} onClick={() => handleEditSection(1)}>
                            <Edit2 size={14} /> Edit Section
                        </button>
                    </div>
                    <div className={styles.sectionContent}>
                        <ReviewRow icon={<User size={20} />} label="FULL NAME" value={getVal('fullName')} />
                        <ReviewRow icon={<Activity size={20} />} label="SPECIALTY" value={getVal('specialty')} />
                        <ReviewRow icon={<Briefcase size={20} />} label="EXPERIENCE" value={getVal('experience') ? `${getVal('experience')} years` : 'Not provided'} />
                        <ReviewRow icon={<Building size={20} />} label="PRIMARY LOCATION" value={getVal('primaryLocation')} />
                        <ReviewRow icon={<MapPin size={20} />} label="PRACTICE LOCATIONS" value={formData.practiceLocations?.length ? `${formData.practiceLocations.length} locations added` : 'None added'} />
                        <ReviewRow icon={<FileText size={20} />} label="REGISTRATION NUMBER" value={getVal('registrationNumber')} />
                    </div>
                </div>

                <div className={styles.reviewSection}>
                    <div className={styles.reviewSectionHeader}>
                        <h3 className={styles.sectionTitle}>Section 2: Credentials</h3>
                        <button className={styles.sectionEditBtn} onClick={() => handleEditSection(2)}>
                            <Edit2 size={14} /> Edit Section
                        </button>
                    </div>
                    <div className={styles.sectionContent}>
                        <ReviewRow icon={<GraduationCap size={20} />} label="MBBS YEAR" value={getVal('mbbsYear')} />
                        <ReviewRow icon={<GraduationCap size={20} />} label="SPECIALISATION YEAR" value={getVal('specialisationYear')} />
                        <ReviewRow icon={<FileText size={20} />} label="QUALIFICATIONS" value={getVal('qualifications')} />
                        <ReviewRow icon={<Award size={20} />} label="FELLOWSHIPS" value={getArr('fellowships')} />
                    </div>
                </div>

                <div className={styles.reviewSection}>
                    <div className={styles.reviewSectionHeader}>
                        <h3 className={styles.sectionTitle}>Section 3: Clinical Focus</h3>
                        <button className={styles.sectionEditBtn} onClick={() => handleEditSection(3)}>
                            <Edit2 size={14} /> Edit Section
                        </button>
                    </div>
                    <div className={styles.sectionContent}>
                        <ReviewRow icon={<Activity size={20} />} label="AREAS OF INTEREST" value={getArr('areasOfInterest')} />
                        <ReviewRow icon={<Activity size={20} />} label="COMMON CONDITIONS" value={getArr('commonConditions')} />
                        <ReviewRow icon={<Activity size={20} />} label="KNOWN FOR" value={getArr('knownForConditions')} />
                    </div>
                </div>

                {stage === 'final' && (
                    <>
                        <div className={styles.reviewSection}>
                            <div className={styles.reviewSectionHeader}>
                                <h3 className={styles.sectionTitle}>Section 4: The Human Side</h3>
                                <button className={styles.sectionEditBtn} onClick={() => handleEditSection(4)}>
                                    <Edit2 size={14} /> Edit Section
                                </button>
                            </div>
                            <div className={styles.sectionContent}>
                                <ReviewRow icon={<GraduationCap size={20} />} label="TRAINING" value={getArr('trainingExperience')} />
                                <ReviewRow icon={<Target size={20} />} label="MOTIVATION" value={getArr('motivation')} />
                                <ReviewRow icon={<Coffee size={20} />} label="UNWINDING" value={getArr('unwinding')} />
                            </div>
                        </div>

                        <div className={styles.reviewSection}>
                            <div className={styles.reviewSectionHeader}>
                                <h3 className={styles.sectionTitle}>Section 5: Patient Value</h3>
                                <button className={styles.sectionEditBtn} onClick={() => handleEditSection(5)}>
                                    <Edit2 size={14} /> Edit Section
                                </button>
                            </div>
                            <div className={styles.sectionContent}>
                                <ReviewRow icon={<Heart size={20} />} label="PATIENT VALUE" value={getVal('patientValue')} />
                                <ReviewRow icon={<Lightbulb size={20} />} label="CARE APPROACH" value={getVal('careApproach')} />
                                <ReviewRow icon={<Target size={20} />} label="PRACTICE PHILOSOPHY" value={getVal('practicePhilosophy')} />
                            </div>
                        </div>
                    </>
                )}

                <div className={styles.submitSection}>
                    {stage === 'intermediate' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%' }}>
                            <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                                Satisfied with your current profile?
                            </p>
                            <button className={styles.submitButton} onClick={handleSubmit}>
                                Skip Remaining & Submit
                            </button>
                        </div>
                    ) : (
                        <button className={styles.submitButton} onClick={handleSubmit}>
                            <Check size={20} /> Confirm & Submit Profile
                        </button>
                    )}
                </div>

                <div className={styles.actions}>
                    <button className={styles.backButton} onClick={() => navigate('/onboarding', { state: { formData, step: stage === 'intermediate' ? 3 : 6 } })}>
                        <ArrowLeft size={16} /> Go Back to Edit
                    </button>
                </div>
            </div>

            <Toast
                message={toast.message}
                isVisible={toast.isVisible}
                onClose={handleToastClose}
                type={toast.type}
            />
        </div>
    );
};

const ReviewRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
    <div className={styles.row}>
        <div className={styles.rowContent}>
            <div className={styles.iconWrapper}>
                {icon}
            </div>
            <div>
                <p className={styles.label}>{label}</p>
                <p className={`${styles.value} ${value === 'None' || value === 'Not provided' ? styles.noValue : styles.hasValue}`}>
                    {value}
                </p>
            </div>
        </div>
    </div>
);

export default ReviewProfile;
