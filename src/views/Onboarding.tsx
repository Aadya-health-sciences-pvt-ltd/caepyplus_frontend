'use client';
import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useAppRouter } from '../lib/router';
import { ArrowLeft } from 'lucide-react';
import Stepper from '../components/ui/Stepper';
import LivePreview from '../components/ui/LivePreview';
import WelcomeDialog from '../components/ui/WelcomeDialog';
import GuidedTour from '../components/ui/GuidedTour';
import ImageCropperModal from '../components/ui/ImageCropperModal';
import styles from './Onboarding.module.css';
import { getMasterData, type MasterData } from '../lib/masterData';
import type { DropdownOption } from '../components/ui/CreatableDropdown';

import { mockDataService } from '../services/mockDataService';
import { doctorService } from '../services/doctorService';
import { dropdownService } from '../services/dropdownService';
import { isBrowser } from '../lib/isBrowser';

import { validateSection1 } from '../lib/validation';
import { calculateProfileProgress } from '../lib/profileProgress';
import Toast from '../components/ui/Toast';

import type { OnboardingFormData } from './onboarding-steps/types';
import { FIELD_NAME_MAP } from './onboarding-steps/types';

/** Normalize legacy comma-separated strings for Section 3 multi-select fields. */
function normalizeClinicalMultiFields(d: Record<string, unknown>) {
    for (const key of ['areasOfInterest', 'practiceSegments', 'commonConditions', 'knownForConditions', 'wantToTreatConditions'] as const) {
        const v = d[key];
        if (typeof v === 'string') {
            d[key] = v.trim() ? v.split(',').map(s => s.trim()).filter(Boolean) : [];
        }
    }
}

// --- Lazy-loaded Step Components ---
// Each step is code-split so the SWC compiler processes smaller modules,
// and only the active step's JS is loaded in the browser.
const STEP_LOADING_FALLBACK = (
    <div style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF', fontSize: '0.875rem' }}>
        Loading section...
    </div>
);

const Step1ProfessionalIdentity = dynamic(
    () => import('./onboarding-steps/Step1ProfessionalIdentity'),
    { loading: () => STEP_LOADING_FALLBACK }
);
const Step2Credentials = dynamic(
    () => import('./onboarding-steps/Step2Credentials'),
    { loading: () => STEP_LOADING_FALLBACK }
);
const Step3ClinicalFocus = dynamic(
    () => import('./onboarding-steps/Step3ClinicalFocus'),
    { loading: () => STEP_LOADING_FALLBACK }
);
const Step4HumanSide = dynamic(
    () => import('./onboarding-steps/Step4HumanSide'),
    { loading: () => STEP_LOADING_FALLBACK }
);
const Step5PatientValue = dynamic(
    () => import('./onboarding-steps/Step5PatientValue'),
    { loading: () => STEP_LOADING_FALLBACK }
);
const Step6ContentSeed = dynamic(
    () => import('./onboarding-steps/Step6ContentSeed'),
    { loading: () => STEP_LOADING_FALLBACK }
);

// Fallback masterData options helper (used in dropdown fetch effect)
const getFallbackOptions = (fieldKey: string, md: MasterData): DropdownOption[] => {
    const masterKeyMap: Record<string, keyof MasterData> = {
        specialty: 'specialties',
        primaryLocation: 'locations',
        areasOfInterest: 'areasOfInterest',
        practiceSegments: 'practiceSegments',
        commonConditions: 'commonConditions',
        knownForConditions: 'commonConditions',
        wantToTreatConditions: 'commonConditions',
    };
    const masterKey = masterKeyMap[fieldKey];
    if (!masterKey || !md[masterKey]) return [];
    return (md[masterKey] as { value: string }[]).map(item => ({ value: item.value, label: item.value }));
};

const Onboarding = () => {
    const router = useAppRouter();

    // Read nav_state synchronously so it's available for useState initializers
    const [navState] = useState<Record<string, any>>(() => {
        try {
            const s = JSON.parse(sessionStorage.getItem('nav_state') || '{}');
            sessionStorage.removeItem('nav_state');
            return s;
        } catch {
            return {};
        }
    });

    // Toast State
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
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

    // Load saved state if available
    const savedUser = mockDataService.getCurrentUser();
    const savedData = savedUser?.data;
    const savedStep = savedUser?.currentStep;

    const [currentStep, setCurrentStep] = useState(navState.step || (savedStep && savedStep > 0 ? savedStep : 1));
    const totalSteps = 6;
    const [focusedField, setFocusedField] = useState<string>(navState.focusedField || '');
    const [masterData, setMasterData] = useState<MasterData>({
        specialties: [],
        locations: [],
        practiceSegments: [],
        commonConditions: [],
        areasOfInterest: []
    });

    // Welcome Dialog & Guided Tour State
    const isNewUser = isBrowser() ? localStorage.getItem('is_new_user') === 'true' : false;
    const doctorId = (isBrowser() ? localStorage.getItem('doctor_id') : null) || savedUser?.id || 'unknown';
    const tourKey = `caepy_tour_completed_${doctorId}`;
    const hasTourCompleted = isBrowser() ? localStorage.getItem(tourKey) === 'true' : false;

    const isProfileSubmitted = savedUser?.status === 'submitted' || savedUser?.status === 'verified';
    const shouldSuppressDialog = currentStep >= 6 && isProfileSubmitted;
    const [showWelcome, setShowWelcome] = useState(!hasTourCompleted && !shouldSuppressDialog);
    const [showTour, setShowTour] = useState(false);

    const showSkipButton = !isNewUser && currentStep >= 3;

    const handleStartTour = () => {
        setShowWelcome(false);
        setTimeout(() => setShowTour(true), 400);
    };

    const handleSkipWelcome = () => {
        setShowWelcome(false);
        localStorage.setItem(tourKey, 'true');
    };

    const handleSkipToReview = () => {
        setShowWelcome(false);
        localStorage.setItem(tourKey, 'true');
        sessionStorage.setItem('nav_state', JSON.stringify({ formData, fromOnboarding: true }));
        router.push('/doctor/review');
    };

    const handleTourComplete = () => {
        setShowTour(false);
        localStorage.setItem(tourKey, 'true');
    };

    const handleTourSkip = () => {
        setShowTour(false);
        localStorage.setItem(tourKey, 'true');
    };

    // State for API-fetched dropdown options, keyed by frontend field name
    const [dropdownOptions, setDropdownOptions] = useState<Record<string, DropdownOption[]>>({});

    useEffect(() => {
        setMasterData(getMasterData());
    }, []);

    // Fetch dropdown options from the API on mount
    useEffect(() => {
        const fetchAllDropdowns = async () => {
            const md = getMasterData();
            const fieldKeys = Object.keys(FIELD_NAME_MAP);
            const results: Record<string, DropdownOption[]> = {};

            await Promise.all(
                fieldKeys.map(async (fieldKey) => {
                    const apiFieldName = FIELD_NAME_MAP[fieldKey];
                    try {
                        const apiOptions = await dropdownService.fetchDropdownOptions(apiFieldName);
                        if (apiOptions.length > 0) {
                            results[fieldKey] = apiOptions;
                        } else {
                            results[fieldKey] = getFallbackOptions(fieldKey, md);
                        }
                    } catch {
                        results[fieldKey] = getFallbackOptions(fieldKey, md);
                    }
                })
            );

            setDropdownOptions(results);
        };

        fetchAllDropdowns();
    }, []);

    // Handler for when a new option is added via CreatableDropdown
    const handleOptionAdded = (fieldKey: string, newOption: DropdownOption) => {
        setDropdownOptions(prev => ({
            ...prev,
            [fieldKey]: [...(prev[fieldKey] || []), newOption].sort((a, b) => a.label.localeCompare(b.label)),
        }));
        showToast(`"${newOption.label}" submitted for review`, 'success');
    };

    // Default form data
    const defaultFormData: OnboardingFormData = {
        fullName: '',
        email: '',
        phone: '',
        specialty: '',
        primaryLocation: '',
        practiceLocations: [],
        experience: '',
        postSpecialisationExperience: '',
        registrationNumber: '',
        medicalCouncil: '',
        mbbsYear: '',
        specialisationYear: '',
        fellowships: [],
        qualifications: '',
        memberships: '',
        awards: '',
        areasOfInterest: [],
        practiceSegments: [],
        commonConditions: [],
        knownForConditions: [],
        wantToTreatConditions: [],
        trainingExperience: [],
        motivation: [],
        unwinding: [],
        recognition: '',
        qualityTime: '',
        freeText: '',
        proudAchievement: '',
        personalAchievement: '',
        professionalAspiration: '',
        personalAspiration: '',
        patientValue: '',
        careApproach: '',
        practicePhilosophy: '',
        profileImage: '',
        languages: [],
        consultationFee: '',
        contentSeed: {
            conditionName: '',
            presentation: '',
            investigations: '',
            treatment: '',
            delayConsequences: '',
            prevention: '',
            additionalInsights: ''
        }
    };

    const [formData, setFormData] = useState<OnboardingFormData>(() => {
        const baseData = { ...defaultFormData };

        if (savedData) {
            Object.assign(baseData, savedData);
            if (savedData.contentSeed) {
                baseData.contentSeed = { ...defaultFormData.contentSeed, ...savedData.contentSeed };
            }
        }

        if (navState.formData) {
            Object.assign(baseData, navState.formData);
        }

        const storedProfile = doctorService.getStoredProfile();
        if (storedProfile) {
            const mappedData = doctorService.mapProfileToFormData(storedProfile);
            for (const [key, value] of Object.entries(mappedData)) {
                const existing = (baseData as any)[key];
                const isEmpty = existing === '' || existing === null || existing === undefined
                    || (Array.isArray(existing) && existing.length === 0);
                if (isEmpty && value !== '' && value !== null && value !== undefined) {
                    (baseData as any)[key] = value;
                }
            }
        }

        if (savedUser) {
            if (!baseData.email && savedUser.email) baseData.email = savedUser.email;
            if (!baseData.phone && savedUser.phone) baseData.phone = savedUser.phone;
        }

        if (!baseData.phone) {
            const storedPhone = localStorage.getItem('mobile_number');
            if (storedPhone) baseData.phone = storedPhone;
        }

        if (!baseData.email) {
            const storedEmail = localStorage.getItem('user_email');
            if (storedEmail) baseData.email = storedEmail;
        }

        normalizeClinicalMultiFields(baseData as Record<string, unknown>);

        return baseData;
    });

    // Determine login method to disable fields
    const isPhoneLogin = !!savedUser?.phone || !!(isBrowser() ? localStorage.getItem('mobile_number') : null);
    const isEmailLogin = !!savedUser?.email || !!(isBrowser() ? localStorage.getItem('user_email') : null);

    // Auto-save effect
    useEffect(() => {
        if (savedUser) {
            mockDataService.updateOnboardingData(savedUser.id, currentStep, formData);
        }
    }, [currentStep, formData, savedUser]);

    // Fetch doctor profile from API on mount and merge into formData
    useEffect(() => {
        const doctorId = localStorage.getItem('doctor_id');
        if (!doctorId) return;

        doctorService.fetchAndStoreProfile(doctorId)
            .then(async (profile) => {
                const mappedData = doctorService.mapProfileToFormData(profile);

                // If the profile has a photo, resolve it to a fresh signed URL
                // so the <img> src is always an HTTPS URL (not a bare S3 key).
                let resolvedPhotoUrl: string | null = null;
                if (profile.profile_photo) {
                    resolvedPhotoUrl = await doctorService.getProfilePhotoSignedUrl(doctorId);
                    if (resolvedPhotoUrl) {
                        mappedData.profileImage = resolvedPhotoUrl;
                    }
                }

                setFormData((prev: typeof formData) => {
                    const updated = { ...prev };
                    for (const [key, value] of Object.entries(mappedData)) {
                        const existing = updated[key as keyof typeof updated];
                        const isEmpty = existing === '' || existing === null || existing === undefined
                            || (Array.isArray(existing) && existing.length === 0);
                        if (isEmpty && value !== '' && value !== null && value !== undefined) {
                            (updated as Record<string, unknown>)[key] = value;
                        }
                    }
                    // Always apply a freshly signed photo URL (merge skips non-empty stale keys / S3 keys).
                    if (resolvedPhotoUrl) {
                        (updated as Record<string, unknown>).profileImage = resolvedPhotoUrl;
                    }
                    return updated;
                });
            })
            .catch((err) => {
                console.warn('Could not fetch doctor profile on mount:', err);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('contentSeed.')) {
            const field = name.split('.')[1];
            setFormData((prev: any) => ({
                ...prev,
                contentSeed: {
                    ...prev.contentSeed,
                    [field]: value
                }
            }));
        } else {
            setFormData((prev: any) => ({ ...prev, [name]: value }));
        }
    };

    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showToast('Image too large. Please select an image under 5MB.', 'error');
            return;
        }

        const imageUrl = URL.createObjectURL(file);
        setSelectedImageSrc(imageUrl);
        setCropModalOpen(true);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handlePhotoUpload = async (croppedBlob: Blob) => {
        const doctorId = localStorage.getItem('doctor_id');
        if (!doctorId) {
            showToast('Unable to upload profile photo. Doctor ID not found.', 'error');
            return;
        }

        const file = new File([croppedBlob], 'profile-photo.jpg', { type: 'image/jpeg' });

        try {
            // Upload and get the URL returned by the backend.
            // The backend returns a signed URL when USE_SIGNED_URLS=true, or a bare S3
            // key otherwise. We follow up with getProfilePhotoSignedUrl to guarantee
            // the <img> src is always a renderable HTTPS URL.
            await doctorService.uploadProfilePhoto(doctorId, file);

            const signedUrl = await doctorService.getProfilePhotoSignedUrl(doctorId);
            if (signedUrl) {
                setFormData(prev => ({ ...prev, profileImage: signedUrl }));
            }
            showToast('Profile photo uploaded', 'success');
        } catch (err) {
            console.error('Failed to upload profile photo:', err);
            showToast('Failed to upload profile photo. Please try again.', 'error');
        } finally {
            setCropModalOpen(false);
            setSelectedImageSrc(null);
        }
    };

    // Helper for array fields (simple strings)
    const handleArrayChange = (field: string, value: string) => {
        setFormData((prev: any) => ({ ...prev, [field]: value.split(',').map((s: string) => s.trim()) }));
    };

    // Map field names to their corresponding step numbers
    const getStepForField = (fieldName: string): number => {
        if (['fullName', 'email', 'phone', 'specialty', 'primaryLocation', 'practiceLocations', 'experience', 'postSpecialisationExperience', 'registrationNumber', 'medicalCouncil'].includes(fieldName)) return 1;
        if (['mbbsYear', 'specialisationYear', 'fellowships', 'qualifications', 'memberships', 'awards'].includes(fieldName)) return 2;
        if (['areasOfInterest', 'practiceSegments', 'commonConditions', 'knownForConditions', 'wantToTreatConditions'].includes(fieldName)) return 3;
        if (['trainingExperience', 'motivation', 'unwinding', 'recognition', 'qualityTime', 'proudAchievement', 'personalAchievement', 'professionalAspiration', 'personalAspiration'].includes(fieldName)) return 4;
        if (['patientValue', 'careApproach', 'practicePhilosophy'].includes(fieldName)) return 5;
        if (fieldName.startsWith('contentSeed')) return 6;
        return 1;
    };

    const skipAutoFocus = React.useRef(false);
    const shouldFocusTarget = React.useRef(navState.focusedField);

    // Handle edit field click from LivePreview
    const handleEditField = (fieldName: string) => {
        skipAutoFocus.current = true;
        const targetStep = getStepForField(fieldName);
        setCurrentStep(targetStep);

        setTimeout(() => {
            const input = document.querySelector(`[name="${fieldName}"]`) as HTMLInputElement;
            if (input) {
                input.focus();
                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    };

    // Auto-focus logic
    useEffect(() => {
        if (skipAutoFocus.current) {
            skipAutoFocus.current = false;
            return;
        }

        const timer = setTimeout(() => {
            let targetElement: HTMLElement | null = null;

            if (shouldFocusTarget.current) {
                targetElement = document.querySelector(`[name="${shouldFocusTarget.current}"]`) as HTMLElement;
                shouldFocusTarget.current = null;
            }

            if (!targetElement) {
                targetElement = document.querySelector(
                    `.${styles.formGrid} input, .${styles.formGrid} select, .${styles.formGrid} textarea, .${styles.formGrid} button`
                ) as HTMLElement;
            }

            if (targetElement) {
                targetElement.focus({ preventScroll: true });

                const promptBlock = document.getElementById('section-prompt-block');
                if (promptBlock) {
                    promptBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [currentStep]);

    const handleBack = () => {
        if (currentStep > 1) {
            const doctorId = localStorage.getItem('doctor_id');
            if (doctorId) {
                doctorService.updateDoctorDetails(doctorId, formData).catch((err) => {
                    console.error('Failed to save to API:', err);
                });
            }
            setCurrentStep((c: number) => c - 1);
        }
    };

    // --- Profile progress memoized once per render cycle ---
    const profileProgress = useMemo(() => calculateProfileProgress(formData), [formData]);

    const renderStepContent = () => {
        // Common props passed to every step
        const stepProps = {
            formData,
            setFormData,
            handleInputChange,
            setFocusedField,
            profileProgress,
        };

        switch (currentStep) {
            case 1:
                return (
                    <Step1ProfessionalIdentity
                        {...stepProps}
                        fileInputRef={fileInputRef}
                        handleFileSelect={handleFileSelect}
                        dropdownOptions={dropdownOptions}
                        masterData={masterData}
                        handleOptionAdded={handleOptionAdded}
                        isEmailLogin={isEmailLogin}
                        isPhoneLogin={isPhoneLogin}
                    />
                );
            case 2:
                return (
                    <Step2Credentials
                        {...stepProps}
                        handleArrayChange={handleArrayChange}
                    />
                );
            case 3:
                return (
                    <Step3ClinicalFocus
                        {...stepProps}
                        dropdownOptions={dropdownOptions}
                        masterData={masterData}
                        handleOptionAdded={handleOptionAdded}
                    />
                );
            case 4:
                return <Step4HumanSide {...stepProps} />;
            case 5:
                return <Step5PatientValue {...stepProps} />;
            case 6:
                return <Step6ContentSeed {...stepProps} />;
            default:
                return (
                    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                        <h3>Section {currentStep}</h3>
                        <p>This is an optional section to improve your profile score.</p>
                    </div>
                );
        }
    };

    const handleNext = () => {
        if (currentStep === 1) {
            const { isValid, errors } = validateSection1(formData);
            if (!isValid) {
                showToast(errors[0], 'error');
                return;
            }
        }

        mockDataService.updateOnboardingData(
            mockDataService.getCurrentUser()?.id || 'temp',
            currentStep,
            formData
        );

        const doctorId = localStorage.getItem('doctor_id');
        if (doctorId) {
            doctorService.updateDoctorDetails(doctorId, formData).catch((err) => {
                console.error('Failed to save to API:', err);
            });
        }

        if (currentStep === 3) {
            sessionStorage.setItem('nav_state', JSON.stringify({ formData, stage: 'intermediate' }));
            router.push('/doctor/review');
            return;
        }

        if (currentStep < totalSteps) {
            setCurrentStep((prev: number) => prev + 1);
            setFocusedField('');
        } else {
            sessionStorage.setItem('nav_state', JSON.stringify({ formData, stage: 'final' }));
            router.push('/doctor/review');
        }
    };

    const handleStepJump = (step: number) => {
        if (step < currentStep) {
            const doctorId = localStorage.getItem('doctor_id');
            if (doctorId) {
                doctorService.updateDoctorDetails(doctorId, formData).catch((err) => {
                    console.error('Failed to save to API:', err);
                });
            }
            setCurrentStep(step);
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>Complete Your Profile</h1>
                    <p className={styles.subtitle}>This will take just 2-3 minutes.</p>
                </div>
                <div className={styles.stepperContainer} data-tour="stepper">
                    <Stepper currentStep={currentStep} totalSteps={6} onStepClick={handleStepJump} />
                </div>
            </div>

            <div className={styles.mainContent}>
                <div className={styles.leftColumn}>
                    {currentStep > 1 && (
                        <div className={styles.onboardingBackRow}>
                            <button
                                type="button"
                                onClick={handleBack}
                                className={styles.onboardingBackButton}
                                aria-label="Go back to previous section"
                            >
                                <ArrowLeft size={18} aria-hidden />
                                Back
                            </button>
                        </div>
                    )}

                    <div className={styles.formContainer} data-tour="form-section">
                        {renderStepContent()}

                        <button className={styles.nextButton} onClick={handleNext} data-tour="next-button">
                            {currentStep === totalSteps ? 'Review & Complete' : (currentStep === 3 ? 'Review & Continue' : 'Next >')}
                        </button>

                        <p style={{ marginTop: '2rem', fontSize: '0.875rem', color: '#9CA3AF', textAlign: 'center' }}>
                            All information can be edited later from your profile settings
                        </p>
                    </div>
                </div>

                <div className={styles.rightColumn} data-tour="live-preview">
                    <LivePreview
                        data={formData}
                        currentStep={currentStep}
                        focusedField={focusedField}
                        onEditField={handleEditField}
                    />
                </div>
            </div>

            <Toast
                message={toast.message}
                isVisible={toast.isVisible}
                onClose={handleToastClose}
                type={toast.type}
            />

            <WelcomeDialog
                isOpen={showWelcome}
                isNewUser={isNewUser}
                userName={formData.fullName || savedUser?.name}
                currentStep={currentStep}
                totalSteps={6}
                profileCompletionPercent={profileProgress.totalPercentage}
                showSkipButton={showSkipButton}
                onStartTour={handleStartTour}
                onSkip={handleSkipWelcome}
                onSkipToReview={handleSkipToReview}
            />

            <GuidedTour
                isActive={showTour}
                onComplete={handleTourComplete}
                onSkip={handleTourSkip}
            />

            {/* Profile Image Cropper Modal */}
            {selectedImageSrc && (
                <ImageCropperModal
                    isOpen={cropModalOpen}
                    imageSrc={selectedImageSrc}
                    onClose={() => {
                        setCropModalOpen(false);
                        setSelectedImageSrc(null);
                    }}
                    onCropCompleteAction={async (blob) => {
                        await handlePhotoUpload(blob);
                    }}
                />
            )}
        </div>
    );
};

export default Onboarding;
