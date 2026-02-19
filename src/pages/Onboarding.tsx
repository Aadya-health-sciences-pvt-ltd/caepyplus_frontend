import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mic, Keyboard, Sparkles, Upload, ArrowLeft, MicOff } from 'lucide-react';
import Stepper from '../components/ui/Stepper';
import LivePreview from '../components/ui/LivePreview';
import WelcomeDialog from '../components/ui/WelcomeDialog';
import GuidedTour from '../components/ui/GuidedTour';
import styles from './Onboarding.module.css';
import { getMasterData, type MasterData } from '../lib/masterData';

import { mockDataService } from '../services/mockDataService';
import { doctorService } from '../services/doctorService';
import { useAssistant } from '../hooks/useAssistant';

import { validateSection1 } from '../lib/validation';
import Toast from '../components/ui/Toast';
import { voiceService } from '../services/voiceService';
import { ONBOARDING_VOICE_CONTEXT } from '../lib/voiceContext';

const Onboarding = () => {
    const navigate = useNavigate();
    const location = useLocation();

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

    // Initialize state: prefer location state (resuming from review), then saved data, then defaults
    const [currentStep, setCurrentStep] = useState(location.state?.step || (savedStep && savedStep > 0 ? savedStep : 1));
    const totalSteps = 6;
    const [focusedField, setFocusedField] = useState<string>(location.state?.focusedField || '');
    const [masterData, setMasterData] = useState<MasterData>({
        specialties: [],
        locations: [],
        practiceSegments: [],
        commonConditions: [],
        areasOfInterest: []
    });



    // Welcome Dialog & Guided Tour State
    const isNewUser = localStorage.getItem('is_new_user') === 'true';
    const doctorId = localStorage.getItem('doctor_id') || savedUser?.id || 'unknown';
    const tourKey = `caepy_tour_completed_${doctorId}`;
    const hasTourCompleted = localStorage.getItem(tourKey) === 'true';
    const [showWelcome, setShowWelcome] = useState(!hasTourCompleted);
    const [showTour, setShowTour] = useState(false);

    const handleStartTour = () => {
        setShowWelcome(false);
        // Small delay so the dialog dismisses before the tour starts
        setTimeout(() => setShowTour(true), 400);
    };

    const handleSkipWelcome = () => {
        setShowWelcome(false);
        localStorage.setItem(tourKey, 'true');
    };

    const handleTourComplete = () => {
        setShowTour(false);
        localStorage.setItem(tourKey, 'true');
    };

    const handleTourSkip = () => {
        setShowTour(false);
        localStorage.setItem(tourKey, 'true');
    };

    // Define prompts for each step
    // AI Assistant Integration
    const { isSpeaking, isListening, speak, listen, stop } = useAssistant();
    const [sessionId, setSessionId] = useState<string | null>(null);

    const handleMicClick = async () => {
        if (isListening || isSpeaking) {
            stop();
            return;
        }

        const context = ONBOARDING_VOICE_CONTEXT[currentStep];

        try {
            if (!sessionId) {
                // Start new session
                const response = await voiceService.startSession('en', context);
                setSessionId(response.session_id);

                // Speak greeting then listen
                speak(response.greeting, () => {
                    startListeningLoop(response.session_id, context);
                });
            } else {
                // Resume / Listen
                startListeningLoop(sessionId, context);
            }
        } catch (error) {
            console.error(error);
            showToast("Failed to connect to Voice Assistant", "error");
        }
    };

    const startListeningLoop = (currentSessionId: string, context: any) => {
        listen(async (transcript) => {
            console.log("User said:", transcript);

            try {
                const response = await voiceService.sendChatMessage(currentSessionId, transcript, context);

                // Update Form Data with all collected fields
                if (response.current_data && Object.keys(response.current_data).length > 0) {
                    setFormData((prev: any) => ({
                        ...prev,
                        ...response.current_data
                    }));

                    // Optional: highlight last updated field if possible, or just skip focus logic for now
                    // The backend doesn't explicitly tell us which field was *just* updated, 
                    // but we can infer or just rely on the UI updating.

                    showToast(`Updated fields based on voice input`, 'success');
                }

                // Speak AI response, then continue listening
                speak(response.ai_response, () => {
                    // Continue listening after AI finishes speaking
                    startListeningLoop(currentSessionId, context);
                });

            } catch (err) {
                console.error(err);
                showToast("Failed to process voice command", "error");
            }
        });
    };

    useEffect(() => {
        setMasterData(getMasterData());
    }, []);

    // State for all form fields
    const defaultFormData = {
        // Block 1: Professional Identity
        fullName: '',
        email: '',
        phone: '',
        specialty: '',
        primaryLocation: '',
        practiceLocations: [], // Array of { name, address, timings }
        experience: '',
        postSpecialisationExperience: '',
        registrationNumber: '',

        // Block 2: Credentials & Trust Markers
        mbbsYear: '',
        specialisationYear: '',
        fellowships: [], // Multi-entry
        qualifications: '', // Text list
        memberships: '', // Optional
        awards: '', // Optional

        // Block 3: Clinical Focus & Expertise
        areasOfInterest: [], // Multi-select + custom
        practiceSegments: [], // Multi-select
        commonConditions: [], // Multi-select
        knownForConditions: [], // Multi-select
        wantToTreatConditions: '', // Optional

        // Block 4: The Human Side
        trainingExperience: [], // Max 2
        motivation: [], // Max 2
        unwinding: [], // Multi-select
        recognition: '',
        qualityTime: '',
        freeText: '', // Optional line
        proudAchievement: '',
        personalAchievement: '',
        professionalAspiration: '',
        personalAspiration: '',

        // Block 5: Patient Value & Choice Factors
        patientValue: '',
        careApproach: '',
        practicePhilosophy: '',

        // Block 6: Content Seed
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

    const [formData, setFormData] = useState(() => {
        // Initialize state logic
        const baseData = location.state?.formData || (savedData ? { ...defaultFormData, ...savedData, contentSeed: { ...defaultFormData.contentSeed, ...(savedData.contentSeed || {}) } } : defaultFormData);

        // Merge in data from the API-fetched doctor profile
        const storedProfile = doctorService.getStoredProfile();
        if (storedProfile) {
            const mappedData = doctorService.mapProfileToFormData(storedProfile);
            // Only fill in empty/default fields — don't overwrite user edits
            for (const [key, value] of Object.entries(mappedData)) {
                const existing = baseData[key as keyof typeof baseData];
                const isEmpty = existing === '' || existing === null || existing === undefined
                    || (Array.isArray(existing) && existing.length === 0);
                if (isEmpty && value !== '' && value !== null && value !== undefined) {
                    (baseData as Record<string, unknown>)[key] = value;
                }
            }
        }

        // Ensure email/phone are populated from savedUser if not in data
        if (savedUser) {
            if (!baseData.email && savedUser.email) baseData.email = savedUser.email;
            if (!baseData.phone && savedUser.phone) baseData.phone = savedUser.phone;
        }

        // Also populate from localStorage auth data if still empty
        if (!baseData.phone) {
            const storedPhone = localStorage.getItem('mobile_number');
            if (storedPhone) baseData.phone = storedPhone;
        }

        return baseData;
    });

    // Determine login method to disable fields
    const isPhoneLogin = !!savedUser?.phone;
    const isEmailLogin = !!savedUser?.email;

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
            .then((profile) => {
                const mappedData = doctorService.mapProfileToFormData(profile);
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
        // Handle nested state for contentSeed if needed, or flat
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

    // Helper for array fields (simple strings)
    const handleArrayChange = (field: string, value: string) => {
        setFormData((prev: any) => ({ ...prev, [field]: value.split(',').map((s: string) => s.trim()) }));
    };

    const handleMultiSelect = (field: string, value: string, max?: number) => {
        setFormData((prev: any) => {
            const current = prev[field] || [];
            if (current.includes(value)) {
                return { ...prev, [field]: current.filter((item: string) => item !== value) };
            } else {
                if (max && current.length >= max) return prev;
                return { ...prev, [field]: [...current, value] };
            }
        });
    };

    // Map field names to their corresponding step numbers
    const getStepForField = (fieldName: string): number => {
        // Block 1: Professional Identity
        if (['fullName', 'email', 'phone', 'specialty', 'primaryLocation', 'practiceLocations', 'experience', 'postSpecialisationExperience'].includes(fieldName)) return 1;
        // Block 2: Credentials
        if (['mbbsYear', 'specialisationYear', 'fellowships', 'qualifications', 'memberships', 'awards'].includes(fieldName)) return 2;
        // Block 3: Clinical Focus
        if (['areasOfInterest', 'practiceSegments', 'commonConditions', 'knownForConditions', 'wantToTreatConditions'].includes(fieldName)) return 3;
        // Block 4: Human Side
        if (['trainingExperience', 'motivation', 'unwinding', 'recognition', 'qualityTime', 'proudAchievement', 'personalAchievement', 'professionalAspiration', 'personalAspiration'].includes(fieldName)) return 4;
        // Block 5: Patient Value
        if (['patientValue', 'careApproach', 'practicePhilosophy'].includes(fieldName)) return 5;
        // Block 6: Content Seed
        if (fieldName.startsWith('contentSeed')) return 6;
        return 1; // Default to first step
    };

    const skipAutoFocus = React.useRef(false);
    const shouldFocusTarget = React.useRef(location.state?.focusedField);

    // Handle edit field click from LivePreview
    const handleEditField = (fieldName: string) => {
        skipAutoFocus.current = true; // Skip generic auto-focus since we target specific field
        const targetStep = getStepForField(fieldName);
        setCurrentStep(targetStep);

        // Focus the field after step renders
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

            // Priority 1: Specific target from navigation (Review -> Edit)
            if (shouldFocusTarget.current) {
                targetElement = document.querySelector(`[name="${shouldFocusTarget.current}"]`) as HTMLElement;
                // Use it only once
                shouldFocusTarget.current = null;
            }

            // Priority 2: Default first field
            if (!targetElement) {
                targetElement = document.querySelector(
                    `.${styles.formGrid} input, .${styles.formGrid} select, .${styles.formGrid} textarea, .${styles.formGrid} button`
                ) as HTMLElement;
            }

            if (targetElement) {
                // Focus the input field without scrolling (we handle scroll separately)
                targetElement.focus({ preventScroll: true });

                // Scroll to the prompt block (Caepy AI block) instead
                const promptBlock = document.getElementById('section-prompt-block');
                if (promptBlock) {
                    promptBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    // Fallback if prompt block not found
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [currentStep]);



    const handleBack = () => {
        if (currentStep > 1) {
            // Persist to backend API before navigating
            const doctorId = localStorage.getItem('doctor_id');
            if (doctorId) {
                doctorService.updateDoctorDetails(doctorId, formData).catch((err) => {
                    console.error('Failed to save to API:', err);
                });
            }
            setCurrentStep((c: number) => c - 1);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <>
                        <div id="section-prompt-block" className={styles.promptItem}>
                            <Sparkles className={styles.promptIcon} size={20} />
                            <p className={styles.promptText}>
                                "Let's start with the basics. These help patients recognise you quickly and accurately."
                            </p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>Professional Identity</h2>
                                <p style={{ fontSize: '0.875rem', color: '#10B981', marginTop: '0.25rem' }}>Profile strength: 20%</p>
                            </div>
                            <button className={styles.uploadBtn}>
                                <Upload size={20} color="#0F766E" strokeWidth={1.5} />
                                <div className={styles.uploadBtnContent}>
                                    <span className={styles.uploadBtnTitle}>Upload Profile Pic</span>
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
                                        disabled={isEmailLogin} // Disabled if logged in via email
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
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        onFocus={() => setFocusedField('phone')}
                                        className={styles.input}
                                        placeholder="Mobile Number"
                                        disabled={isPhoneLogin} // Disabled if logged in via phone
                                        style={isPhoneLogin ? { background: '#F3F4F6', cursor: 'not-allowed' } : {}}
                                    />
                                </div>
                            </div>

                            <div className={styles.fullWidth}>
                                <div className={styles.inputWrapper}>
                                    <label className={styles.label}>Specialty <span>*</span></label>
                                    <input
                                        name="specialty"
                                        value={formData.specialty}
                                        onChange={handleInputChange}
                                        onFocus={() => setFocusedField('specialty')}
                                        className={styles.input}
                                        placeholder="Select or search specialty"
                                        list="specialties-list"
                                    />
                                    <datalist id="specialties-list">
                                        {masterData.specialties.map(s => (
                                            <option key={s} value={s} />
                                        ))}
                                    </datalist>
                                </div>
                            </div>

                            <div className={styles.fullWidth}>
                                <div className={styles.inputWrapper}>
                                    <label className={styles.label}>Primary Practice Location <span>*</span></label>
                                    <select
                                        name="primaryLocation"
                                        value={formData.primaryLocation}
                                        onChange={handleInputChange}
                                        onFocus={() => setFocusedField('primaryLocation')}
                                        className={styles.input}
                                        style={{ appearance: 'none', background: 'white' }}
                                    >
                                        <option value="">Select location</option>
                                        {masterData.locations.map(loc => (
                                            <option key={loc} value={loc}>{loc}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className={styles.fullWidth}>
                                <div className={styles.inputWrapper}>
                                    <label className={styles.label}>Practice Locations</label>
                                    <textarea
                                        name="practiceLocations" // Using simple text area for mock, ideally array UI
                                        value={Array.isArray(formData.practiceLocations) ? formData.practiceLocations.join(', ') : formData.practiceLocations}
                                        onChange={(e) => handleArrayChange('practiceLocations', e.target.value)}
                                        onFocus={() => setFocusedField('practiceLocations')}
                                        className={styles.input}
                                        placeholder="List your clinics/hospitals (comma separated)"
                                        rows={2}
                                    />
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
                                    <label className={styles.label}>Medical Registration Number <span>*</span></label>
                                    <input
                                        name="registrationNumber"
                                        value={formData.registrationNumber}
                                        onChange={handleInputChange}
                                        onFocus={() => setFocusedField('registrationNumber')}
                                        className={styles.input}
                                        placeholder="Enter your registration/license number"
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                );
            case 2:
                return (
                    <>
                        <div id="section-prompt-block" className={styles.promptItem}>
                            <Sparkles className={styles.promptIcon} size={20} />
                            <p className={styles.promptText}>
                                "This section highlights your training and professional milestones. You may keep this factual."
                            </p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 className={styles.sectionTitle}>Credentials & Trust Markers</h2>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem' }}>
                                    <p style={{ fontSize: '0.875rem', color: '#10B981', margin: 0 }}>Profile strength: 40%</p>
                                    <span style={{ fontSize: '0.75rem', background: '#FEF3C7', color: '#D97706', padding: '2px 6px', borderRadius: '4px' }}>Authority badge unlocked</span>
                                </div>
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
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            // Handling array as comma-sep string for simple input
                                            value={Array.isArray(formData.fellowships) ? formData.fellowships.join(', ') : formData.fellowships}
                                            onChange={(e) => handleArrayChange('fellowships', e.target.value)}
                                            onFocus={() => setFocusedField('fellowships')}
                                            className={styles.input}
                                            placeholder="Add fellowship..."
                                            style={{ flex: 1 }}
                                        />
                                        <button className={styles.uploadBtn} style={{ padding: '0.5rem' }}>
                                            <Upload size={16} />
                                        </button>
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
            case 3:
                return (
                    <>
                        <div id="section-prompt-block" className={styles.promptItem}>
                            <Sparkles className={styles.promptIcon} size={20} />
                            <p className={styles.promptText}>
                                "This reflects what you actually practice, not just what you were trained in."
                            </p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 className={styles.sectionTitle}>Clinical Focus & Expertise</h2>
                            <p style={{ fontSize: '0.875rem', color: '#10B981', marginTop: '0.25rem' }}>Profile strength: 60%</p>
                        </div>

                        <div className={styles.formGrid}>
                            {/* Datalists for this section */}
                            <datalist id="areas-list">
                                {masterData.areasOfInterest?.map(item => <option key={item} value={item} />)}
                            </datalist>
                            <datalist id="segments-list">
                                {masterData.practiceSegments.map(item => <option key={item} value={item} />)}
                            </datalist>
                            <datalist id="conditions-list">
                                {masterData.commonConditions.map(item => <option key={item} value={item} />)}
                            </datalist>

                            <div className={styles.fullWidth}>
                                <div className={styles.inputWrapper}>
                                    <label className={styles.label}>Areas of Interest</label>
                                    <input
                                        name="areasOfInterest"
                                        value={Array.isArray(formData.areasOfInterest) ? formData.areasOfInterest.join(', ') : formData.areasOfInterest}
                                        onChange={(e) => handleArrayChange('areasOfInterest', e.target.value)}
                                        onFocus={() => setFocusedField('areasOfInterest')}
                                        className={styles.input}
                                        placeholder="Add areas (comma separated)"
                                        list="areas-list"
                                    />
                                </div>
                            </div>

                            <div className={styles.fullWidth}>
                                <div className={styles.inputWrapper}>
                                    <label className={styles.label}>Practice Segments</label>
                                    <input
                                        name="practiceSegments"
                                        value={Array.isArray(formData.practiceSegments) ? formData.practiceSegments.join(', ') : formData.practiceSegments}
                                        onChange={(e) => handleArrayChange('practiceSegments', e.target.value)} // Changed to array handling
                                        onFocus={() => setFocusedField('practiceSegments')}
                                        className={styles.input}
                                        placeholder="Add segments (comma separated)"
                                        list="segments-list"
                                    />
                                </div>
                            </div>

                            <div className={styles.fullWidth}>
                                <div className={styles.inputWrapper}>
                                    <label className={styles.label}>Most Common Conditions Treated <span>*</span></label>
                                    <input
                                        name="commonConditions"
                                        value={Array.isArray(formData.commonConditions) ? formData.commonConditions.join(', ') : formData.commonConditions}
                                        onChange={(e) => handleArrayChange('commonConditions', e.target.value)}
                                        onFocus={() => setFocusedField('commonConditions')}
                                        className={styles.input}
                                        placeholder="Add conditions (comma separated)"
                                        list="conditions-list"
                                    />
                                </div>
                            </div>

                            <div className={styles.fullWidth}>
                                <div className={styles.inputWrapper}>
                                    <label className={styles.label}>Known For (Specific Expertise) <span>*</span></label>
                                    <input
                                        name="knownForConditions"
                                        value={Array.isArray(formData.knownForConditions) ? formData.knownForConditions.join(', ') : formData.knownForConditions}
                                        onChange={(e) => handleArrayChange('knownForConditions', e.target.value)}
                                        onFocus={() => setFocusedField('knownForConditions')}
                                        className={styles.input}
                                        placeholder="Add conditions (comma separated)"
                                        list="conditions-list" // Reusing conditions list
                                    />
                                </div>
                            </div>

                            <div className={styles.fullWidth}>
                                <div className={styles.inputWrapper}>
                                    <label className={styles.label}>Conditions You Want to Treat More</label>
                                    <input
                                        name="wantToTreatConditions"
                                        value={formData.wantToTreatConditions}
                                        onChange={handleInputChange}
                                        onFocus={() => setFocusedField('wantToTreatConditions')}
                                        className={styles.input}
                                        placeholder="(Optional)"
                                        list="conditions-list" // Reusing conditions list
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                );
            case 4:
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
                                "Let potential patients connect with you as a person. Share what drives you."
                            </p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 className={styles.sectionTitle}>The Human Side</h2>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem' }}>
                                    <p style={{ fontSize: '0.875rem', color: '#10B981', margin: 0 }}>Profile strength: 60%</p>
                                    <span style={{ fontSize: '0.75rem', background: '#DBEAFE', color: '#1E40AF', padding: '2px 6px', borderRadius: '4px' }}>Human Touch added</span>
                                </div>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#6B7280', border: '1px solid #E5E7EB', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                                AI Generated Disclaimer will be added
                            </div>
                        </div>

                        <div className={styles.formGrid}>
                            <div className={styles.fullWidth}>
                                <div className={styles.inputWrapper}>
                                    <label className={styles.label}>What was the most challenging part of your training? (Max 2)</label>
                                    <div className={styles.chipsContainer}>
                                        {['Long hours', 'Emotional toll', 'Complexity of cases', 'Work-life balance', 'High pressure'].map(opt => (
                                            <button
                                                key={opt}
                                                className={`${styles.chip} ${formData.trainingExperience.includes(opt) ? styles.activeChip : ''}`}
                                                onClick={() => {
                                                    handleMultiSelect('trainingExperience', opt, 2);
                                                    setFocusedField('trainingExperience');
                                                }}
                                                style={{
                                                    padding: '0.5rem 1rem', borderRadius: '20px', border: formData.trainingExperience.includes(opt) ? '1px solid #10B981' : '1px solid #E5E7EB',
                                                    background: formData.trainingExperience.includes(opt) ? '#D1FAE5' : 'white', cursor: 'pointer', color: '#374151'
                                                }}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.fullWidth}>
                                <label className={styles.label}>What keeps you going? (Choose up to 2)</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {['Helping patients', 'Clinical challenges', 'Professional growth', 'Teaching / mentoring', 'Recognition', 'Work–life balance'].map(opt => (
                                        <button
                                            key={opt}
                                            className={`${styles.chip} ${formData.motivation.includes(opt) ? styles.activeChip : ''}`}
                                            onClick={() => {
                                                handleMultiSelect('motivation', opt, 2);
                                                setFocusedField('motivation');
                                            }}
                                            style={{
                                                padding: '0.5rem 1rem', borderRadius: '20px', border: formData.motivation.includes(opt) ? '1px solid #10B981' : '1px solid #E5E7EB',
                                                background: formData.motivation.includes(opt) ? '#D1FAE5' : 'white', cursor: 'pointer', color: '#374151'
                                            }}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.fullWidth}>
                                <label className={styles.label}>How do you unwind? (Multi-select)</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {['Family time', 'Music', 'Reading', 'Sports', 'Meditation', 'Academic work', 'Movies / entertainment'].map(opt => (
                                        <button
                                            key={opt}
                                            className={`${styles.chip} ${formData.unwinding.includes(opt) ? styles.activeChip : ''}`}
                                            onClick={() => {
                                                handleMultiSelect('unwinding', opt);
                                                setFocusedField('unwinding');
                                            }}
                                            style={{
                                                padding: '0.5rem 1rem', borderRadius: '20px', border: formData.unwinding.includes(opt) ? '1px solid #10B981' : '1px solid #E5E7EB',
                                                background: formData.unwinding.includes(opt) ? '#D1FAE5' : 'white', cursor: 'pointer', color: '#374151'
                                            }}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.fullWidth}>
                                <div className={styles.inputWrapper}>
                                    <label className={styles.label}>How would you like to be recognised?</label>
                                    <select
                                        name="recognition"
                                        value={formData.recognition}
                                        onChange={handleInputChange}
                                        onFocus={() => setFocusedField('recognition')}
                                        className={styles.input}
                                        style={{ appearance: 'none', background: 'white' }}
                                    >
                                        <option value="">Select option</option>
                                        {['Dedicated', 'Knowledgeable', 'Compassionate', 'Calm', 'Driven', 'Innovative'].map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className={styles.fullWidth}>
                                <div className={styles.inputWrapper}>
                                    <label className={styles.label}>How do you prefer to spend quality time?</label>
                                    <select
                                        name="qualityTime"
                                        value={formData.qualityTime}
                                        onChange={handleInputChange}
                                        onFocus={() => setFocusedField('qualityTime')}
                                        className={styles.input}
                                        style={{ appearance: 'none', background: 'white' }}
                                    >
                                        <option value="">Select option</option>
                                        {['Travel', 'Reading', 'Academics / writing', 'Arts / music', 'Networking', 'Entrepreneurship'].map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className={styles.fullWidth}>
                                <div className={styles.inputWrapper}>
                                    <label className={styles.label}>Reflective Prompts (Optional)</label>
                                    <input
                                        name="proudAchievement"
                                        value={formData.proudAchievement}
                                        onChange={handleInputChange}
                                        onFocus={() => setFocusedField('proudAchievement')}
                                        className={styles.input}
                                        placeholder="One professional achievement you are proud of"
                                        style={{ marginBottom: '0.5rem' }}
                                    />
                                    <input
                                        name="personalAchievement"
                                        value={formData.personalAchievement}
                                        onChange={handleInputChange}
                                        onFocus={() => setFocusedField('personalAchievement')}
                                        className={styles.input}
                                        placeholder="One personal achievement outside medicine"
                                        style={{ marginBottom: '0.5rem' }}
                                    />
                                    <input
                                        name="professionalAspiration"
                                        value={formData.professionalAspiration}
                                        onChange={handleInputChange}
                                        onFocus={() => setFocusedField('professionalAspiration')}
                                        className={styles.input}
                                        placeholder="Professional aspiration"
                                        style={{ marginBottom: '0.5rem' }}
                                    />
                                    <input
                                        name="personalAspiration"
                                        value={formData.personalAspiration}
                                        onChange={handleInputChange}
                                        onFocus={() => setFocusedField('personalAspiration')}
                                        className={styles.input}
                                        placeholder="Personal aspiration"
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                );
            case 5:
                return (
                    <>
                        <div id="section-prompt-block" className={styles.promptItem}>
                            <Sparkles className={styles.promptIcon} size={20} />
                            <p className={styles.promptText}>
                                "If a patient had 30 seconds to understand your practice, what would you want them to know?"
                            </p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 className={styles.sectionTitle}>Patient Value & Choice Factors</h2>
                                <p style={{ fontSize: '0.875rem', color: '#10B981', marginTop: '0.25rem' }}>Profile strength: 90%</p>
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
                                    />
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
                                    />
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
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                );
            case 6:
                return (
                    <>
                        <div id="section-prompt-block" className={styles.promptItem}>
                            <Sparkles className={styles.promptIcon} size={20} />
                            <p className={styles.promptText}>
                                "Just answer as you would explain to a patient in your clinic. No need to write an article."
                            </p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 className={styles.sectionTitle}>Content Seed (Optional)</h2>
                                <p style={{ fontSize: '0.875rem', color: '#10B981', marginTop: '0.25rem' }}>First content seed created</p>
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
        // Validation for Step 1
        if (currentStep === 1) {
            const { isValid, missingFields } = validateSection1(formData);
            if (!isValid) {
                showToast(`Please fill: ${missingFields.join(', ')}`, 'error');
                return;
            }
        }

        // Save current step data locally
        mockDataService.updateOnboardingData(
            mockDataService.getCurrentUser()?.id || 'temp',
            currentStep,
            formData
        );

        // Persist to backend API
        const doctorId = localStorage.getItem('doctor_id');
        if (doctorId) {
            doctorService.updateDoctorDetails(doctorId, formData).catch((err) => {
                console.error('Failed to save to API:', err);
            });
        }

        if (currentStep === 3) {
            // Updated Flow: Review after Step 3
            navigate('/review', { state: { formData, stage: 'intermediate' } });
            return;
        }

        if (currentStep < totalSteps) {
            setCurrentStep((prev: number) => prev + 1);
            setFocusedField(''); // Reset focus
        } else {
            // Final Step
            navigate('/review', { state: { formData, stage: 'final' } });
        }
    };

    const handleStepJump = (step: number) => {
        // Only allow jumping comfortably backward or to adjacent?
        // For now, allow jumping to any previous step as requested.
        if (step < currentStep) {
            // Persist to backend API before jumping
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
                <div style={{ flex: 1, maxWidth: '600px', marginLeft: 'auto' }} data-tour="stepper">
                    <Stepper currentStep={currentStep} totalSteps={6} onStepClick={handleStepJump} />
                </div>
            </div>

            <div className={styles.mainContent}>
                <div className={styles.leftColumn}>

                    {/* AI Banner with embedded Back button */}
                    <div className={styles.aiBanner} data-tour="ai-banner">
                        <div className={styles.aiContent}>
                            {currentStep > 1 && (
                                <button
                                    onClick={handleBack}
                                    className={styles.inlineBackButton}
                                    aria-label="Go back"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                            )}

                            <div className={styles.aiIconCircle}>
                                <Sparkles size={24} />
                            </div>
                            <div className={styles.aiText}>
                                <h4>CAEPY AI</h4>
                                <p>Speak naturally, I'll take care of the rest</p>
                            </div>
                        </div>

                        <div className={styles.audioControls}>
                            {isListening || isSpeaking ? (
                                <>
                                    <div className={styles.listeningBadge}>
                                        <div className={styles.listeningDot}></div>
                                        {isSpeaking ? 'Speaking...' : 'Listening'}
                                    </div>
                                    <div className={styles.wave}>
                                        {[1, 2, 3, 4, 5].map(i => <div key={i} className={styles.waveBar} style={{ animationDelay: `${i * 0.1}s` }}></div>)}
                                    </div>
                                    <button
                                        className={`${styles.micButton} ${styles.active}`}
                                        onClick={handleMicClick}
                                    >
                                        <MicOff size={24} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className={styles.listeningBadge}>
                                        <div className={styles.listeningDot} style={{ backgroundColor: '#39C8CE', boxShadow: 'none', border: 'none' }}></div>
                                        Ready to Speak
                                    </div>
                                    <button
                                        className={`${styles.micButton} ${styles.ready}`}
                                        onClick={handleMicClick}
                                    >
                                        <Mic size={24} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className={styles.formContainer} data-tour="form-section">

                        {renderStepContent()}

                        <button className={styles.nextButton} onClick={handleNext} data-tour="next-button">
                            {currentStep === totalSteps ? 'Review & Complete' : (currentStep === 3 ? 'Review & Continue' : 'Next >')}
                        </button>

                        <button className={styles.typeButton}>
                            <Keyboard size={16} /> Prefer typing instead
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
                onStartTour={handleStartTour}
                onSkip={handleSkipWelcome}
            />

            <GuidedTour
                isActive={showTour}
                onComplete={handleTourComplete}
                onSkip={handleTourSkip}
            />
        </div>
    );
};

export default Onboarding;
