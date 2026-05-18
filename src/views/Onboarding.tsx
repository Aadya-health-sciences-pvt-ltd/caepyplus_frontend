'use client';
import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useAppRouter } from '../lib/router';
import { Mic, Keyboard, Sparkles, Upload, ArrowLeft, MicOff, MapPin, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import ImageCropperModal from '../components/ui/ImageCropperModal';
import Stepper from '../components/ui/Stepper';
import LivePreview from '../components/ui/LivePreview';
import WelcomeDialog from '../components/ui/WelcomeDialog';
import GuidedTour from '../components/ui/GuidedTour';
import styles from './Onboarding.module.css';
import { getMasterData, type MasterData } from '../lib/masterData';
import CreatableDropdown, { type DropdownOption } from '../components/ui/CreatableDropdown';
import { useAssistant } from '../hooks/useAssistant';
import { mockDataService } from '../services/mockDataService';
import { doctorService } from '../services/doctorService';
import { dropdownService } from '../services/dropdownService';
import { isBrowser } from '../lib/isBrowser';

import { validateSection1 } from '../lib/validation';
import { calculateProfileProgress } from '../lib/profileProgress';
import Toast from '../components/ui/Toast';
import { voiceService } from '../services/voiceService';
import type { StepContext } from '../lib/voiceContext';
import type { OnboardingFormData } from './onboarding-steps/types';
import { FIELD_NAME_MAP } from './onboarding-steps/types';


// --- Practice Location Accordion Component with Google Maps ---
import { useJsApiLoader, Autocomplete, GoogleMap, MarkerF } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
const LIBRARIES: ('places')[] = ['places'];

interface PracticeLocation {
    name: string;
    address: string;
    schedule: string;
    city?: string;
    state?: string;
    pincode?: string;
    phone_number?: string;
    lat?: number;
    lng?: number;
}

interface PracticeLocationAccordionProps {
    locations: PracticeLocation[];
    onLocationsChange: (locations: PracticeLocation[]) => void;
    onFocus: () => void;
}

const PracticeLocationAccordion: React.FC<PracticeLocationAccordionProps> = ({ locations, onLocationsChange, onFocus }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [addMode, setAddMode] = useState<'manual' | 'map'>('manual');
    const [newLoc, setNewLoc] = useState<PracticeLocation>({ name: '', address: '', schedule: '', city: '', state: '', pincode: '', phone_number: '' });
    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
    const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
    const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 12.9716, lng: 77.5946 }); // Default: Bangalore
    const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number } | null>(null);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: LIBRARIES,
    });

    const onAutocompleteLoad = (ac: google.maps.places.Autocomplete) => {
        ac.setFields(['name', 'formatted_address', 'geometry', 'address_components', 'formatted_phone_number', 'international_phone_number']);
        setAutocomplete(ac);
    };

    /** Extract a component value from Google Places address_components. */
    const getAddressComponent = (components: google.maps.GeocoderAddressComponent[] | undefined, type: string): string => {
        if (!components) return '';
        const comp = components.find(c => c.types.includes(type));
        return comp?.long_name || '';
    };

    const onPlaceChanged = () => {
        if (autocomplete) {
            const place = autocomplete.getPlace();
            const placeName = place.name || '';
            const placeAddress = place.formatted_address || '';
            const lat = place.geometry?.location?.lat();
            const lng = place.geometry?.location?.lng();
            const comps = place.address_components;

            // Extract city, state, pincode from address_components
            const city = getAddressComponent(comps, 'locality')
                || getAddressComponent(comps, 'sublocality_level_1')
                || getAddressComponent(comps, 'administrative_area_level_2');
            const state = getAddressComponent(comps, 'administrative_area_level_1');
            const pincode = getAddressComponent(comps, 'postal_code');
            const phoneNumber = place.formatted_phone_number || place.international_phone_number || '';

            setNewLoc(prev => ({
                ...prev,
                name: placeName || prev.name,
                address: placeAddress,
                city,
                state,
                pincode,
                phone_number: phoneNumber || prev.phone_number,
                lat,
                lng,
            }));
        }
    };

    const onMapClick = (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setMarkerPos({ lat, lng });
            setNewLoc(prev => ({ ...prev, lat, lng }));
        }
    };

    const resetForm = () => {
        setNewLoc({ name: '', address: '', schedule: '', city: '', state: '', pincode: '', phone_number: '' });
        setMarkerPos(null);
        setIsAdding(false);
        setAddMode('manual');
    };

    const handleAddLocation = () => {
        if (!newLoc.name.trim()) return;
        onLocationsChange([...locations, newLoc]);
        resetForm();
    };

    const handleRemoveLocation = (index: number) => {
        const updated = [...locations];
        updated.splice(index, 1);
        onLocationsChange(updated);
    };

    return (
        <div className={styles.plAccordion} onFocus={onFocus}>
            {/* Accordion Header */}
            <button
                type="button"
                className={styles.plHeader}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className={styles.plHeaderLeft}>
                    <div className={styles.plIconCircle}>
                        <MapPin size={18} />
                    </div>
                    <div>
                        <span className={styles.plTitle}>Practice Location & Schedule <span style={{ color: '#EF4444' }}>*</span></span>
                        <span className={styles.plSubtitle}>Add your clinic or hospital locations where</span>
                    </div>
                </div>
                {isOpen ? <ChevronUp size={20} color="#6B7280" /> : <ChevronDown size={20} color="#6B7280" />}
            </button>

            {/* Accordion Body */}
            {isOpen && (
                <div className={styles.plBody}>
                    {/* Existing Location Cards */}
                    {locations.map((loc, i) => (
                        <div key={i} className={styles.plCard}>
                            <div className={styles.plCardIcon}></div>
                            <div className={styles.plCardContent}>
                                <strong className={styles.plCardName}>{loc.name}</strong>
                                <span className={styles.plCardDetail}>
                                    {loc.address}{loc.schedule ? ` | ${loc.schedule}` : ''}
                                </span>
                            </div>
                            <button
                                type="button"
                                className={styles.plCardRemove}
                                onClick={() => handleRemoveLocation(i)}
                                title="Remove location"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}

                    {/* Add Location Form */}
                    {isAdding ? (
                        <div className={styles.plAddForm}>
                            {/* Mode Tabs */}
                            <div className={styles.plModeTabs}>
                                <button
                                    type="button"
                                    className={`${styles.plModeTab} ${addMode === 'manual' ? styles.plModeTabActive : ''}`}
                                    onClick={() => setAddMode('manual')}
                                >
                                    <Keyboard size={14} /> Manual Entry
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.plModeTab} ${addMode === 'map' ? styles.plModeTabActive : ''}`}
                                    onClick={() => setAddMode('map')}
                                >
                                    <MapPin size={14} /> Search on Map
                                </button>
                            </div>

                            {addMode === 'map' && isLoaded && (
                                <div className={styles.plMapSection}>
                                    <Autocomplete
                                        onLoad={onAutocompleteLoad}
                                        onPlaceChanged={onPlaceChanged}
                                        options={{ types: ['establishment'], componentRestrictions: { country: 'in' } }}
                                    >
                                        <input
                                            className={styles.input}
                                            placeholder="Search for a clinic, hospital, or address..."
                                            style={{ marginBottom: '0.75rem' }}
                                            autoFocus
                                        />
                                    </Autocomplete>

                                    {/* Mini Map Preview */}
                                    <div className={styles.plMapContainer}>
                                        <GoogleMap
                                            mapContainerStyle={{ width: '100%', height: '200px', borderRadius: '0.5rem' }}
                                            center={mapCenter}
                                            zoom={markerPos ? 16 : 12}
                                            options={{
                                                disableDefaultUI: true,
                                                zoomControl: true,
                                                mapTypeControl: false,
                                                streetViewControl: false,
                                                clickableIcons: true,
                                            }}
                                            onLoad={(map) => setMapRef(map)}
                                            onClick={onMapClick}
                                        >
                                            {markerPos && <MarkerF position={markerPos} />}
                                        </GoogleMap>
                                    </div>
                                </div>
                            )}

                            {addMode === 'map' && !isLoaded && (
                                <div className={styles.plMapLoading}>
                                    <span>Loading Google Maps...</span>
                                </div>
                            )}

                            {addMode === 'map' && !GOOGLE_MAPS_API_KEY && (
                                <div className={styles.plMapNotice}>
                                    <span>⚠️ Google Maps API key not configured. Add <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your <code>.env</code> file. You can still use manual entry.</span>
                                </div>
                            )}

                            {/* Common Fields (always visible) */}
                            <div className={styles.plAddFormRow}>
                                <input
                                    className={styles.input}
                                    placeholder="Clinic / Hospital Name"
                                    value={newLoc.name}
                                    onChange={(e) => setNewLoc({ ...newLoc, name: e.target.value })}
                                    autoFocus={addMode === 'manual'}
                                />
                            </div>
                            <div className={styles.plAddFormRow}>
                                <input
                                    className={styles.input}
                                    placeholder="Full address"
                                    value={newLoc.address}
                                    onChange={(e) => setNewLoc({ ...newLoc, address: e.target.value })}
                                />
                            </div>
                            <div className={styles.plAddFormRow} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                                <input
                                    className={styles.input}
                                    placeholder="City"
                                    value={newLoc.city || ''}
                                    onChange={(e) => setNewLoc({ ...newLoc, city: e.target.value })}
                                />
                                <input
                                    className={styles.input}
                                    placeholder="State"
                                    value={newLoc.state || ''}
                                    onChange={(e) => setNewLoc({ ...newLoc, state: e.target.value })}
                                />
                                <input
                                    className={styles.input}
                                    maxLength={6}
                                    placeholder="Pincode"
                                    value={newLoc.pincode || ''}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, ''); // Only digits
                                        if (val.length <= 6) {
                                            setNewLoc({ ...newLoc, pincode: val });
                                        }
                                    }}
                                />
                            </div>
                            <div className={styles.plAddFormRow}>
                                <input
                                    className={styles.input}
                                    placeholder="Phone number (optional)"
                                    value={newLoc.phone_number || ''}
                                    onChange={(e) => setNewLoc({ ...newLoc, phone_number: e.target.value })}
                                />
                            </div>
                            <div className={styles.plAddFormRow}>
                                <input
                                    className={styles.input}
                                    placeholder="Schedule (e.g. Mon - Fri, 09:00 - 17:00)"
                                    value={newLoc.schedule}
                                    onChange={(e) => setNewLoc({ ...newLoc, schedule: e.target.value })}
                                />
                            </div>
                            <div className={styles.plAddFormActions}>
                                <button type="button" className={styles.plSaveBtn} onClick={handleAddLocation}>
                                    Save Location
                                </button>
                                <button type="button" className={styles.plCancelBtn} onClick={resetForm}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            type="button"
                            className={styles.plAddBtn}
                            onClick={() => setIsAdding(true)}
                        >
                            <Plus size={16} /> Add Practice Location
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

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
    const mdKey = masterKeyMap[fieldKey] as keyof MasterData;
    if (mdKey && Array.isArray(md[mdKey])) {
        return md[mdKey].map((item: any) => ({ value: item.value, label: item.value }));
    }
    return [];
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

    // Initialize state: prefer location state (resuming from review), then saved data, then defaults
    const [isLoading, setIsLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(navState.step || (savedStep && savedStep > 0 ? savedStep : 1));
    const [voiceConfig, setVoiceConfig] = useState<{ context: Record<string, StepContext>, instructions: Record<string, string> } | null>(null);
    const totalSteps = 6;
    const [focusedField, setFocusedField] = useState<string>(navState.focusedField || '');
    const [skippedFields, setSkippedFields] = useState<string[]>([]);

    // Reset skipped fields when navigating between steps so they can be prompted again
    useEffect(() => {
        setSkippedFields([]);
    }, [currentStep]);

    const [masterData, setMasterData] = useState<MasterData>({
        specialties: [],
        locations: [],
        practiceSegments: [],
        commonConditions: [],
        areasOfInterest: []
    });

    useEffect(() => {
        let isMounted = true;
        const checkAuthAndLoadData = async () => {
            try {
                // Fetch Voice config concurrently with master data
                const configPromise = voiceService.getConfig();
                const data = await getMasterData();
                const config = await configPromise;

                if (isMounted) {
                    setMasterData(data);
                    setVoiceConfig(config);
                    // Trigger profile fetch logic implicitly
                }
            } catch (error) {
                console.error("Failed to load necessary data", error);
                if (isMounted) {
                    setMasterData({ specialties: [], locations: [], practiceSegments: [], commonConditions: [], areasOfInterest: [] });
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        checkAuthAndLoadData();
        return () => { isMounted = false; };
    }, []);

    // Welcome Dialog & Guided Tour State
    const isNewUser = isBrowser() ? localStorage.getItem('is_new_user') === 'true' : false;
    const doctorId = (isBrowser() ? localStorage.getItem('doctor_id') : null) || savedUser?.id || 'unknown';
    const tourKey = `caepy_tour_completed_${doctorId}`;
    const hasTourCompleted = isBrowser() ? localStorage.getItem(tourKey) === 'true' : false;

    const isProfileSubmitted = savedUser?.status === 'submitted' || savedUser?.status === 'verified';
    const shouldSuppressDialog = currentStep >= 6 && isProfileSubmitted;
    const mergedForWelcomeProgress = { ...(savedData || {}), ...(savedUser || {}) };
    const initialProfilePct = calculateProfileProgress(mergedForWelcomeProgress).totalPercentage;
    const freshLoginWelcome = isBrowser() && sessionStorage.getItem('caepy_fresh_login_welcome') === '1';
    const showWelcomeInitial =
        !shouldSuppressDialog &&
        ((initialProfilePct < 50 && (freshLoginWelcome || !hasTourCompleted)) ||
            (initialProfilePct >= 50 && !hasTourCompleted));

    const [showWelcome, setShowWelcome] = useState(showWelcomeInitial);
    const [showTour, setShowTour] = useState(false);

    const showSkipButton = !isNewUser && currentStep >= 3;


    // AI Assistant Integration
    const { status: assistantStatus, startSession: startWsSession, stopSession, volume } = useAssistant();
    const isListening = assistantStatus === 'connected';
    const isSpeaking = assistantStatus === 'connecting';
    const [sessionId, setSessionId] = useState<string | null>(null);

    const handleMicClick = async () => {
        if (isListening || isSpeaking) {
            stopSession();
            setSessionId(null);
            return;
        }

        // Store current focused field and reset it so it doesn't get permanently stuck
        // across multiple mic sessions if the user hasn't clicked another input.
        const currentFocused = focusedField;
        setFocusedField('');

        if (!voiceConfig) return;
        const baseContext = voiceConfig.context[currentStep.toString()];

        // Find fields that still need to be filled
        const missingFields = baseContext.fields.filter(f => {
            if (f.voiceSkip) return false;

            // Always include the focused field so the AI knows to prompt for it, even if already filled
            if (currentFocused && f.key === currentFocused) return true;

            // Allow standard empty checks to evaluate whether the field is missing.
            if (skippedFields.includes(f.key)) return false;

            if (f.key.startsWith('contentSeed.')) {
                const subKey = f.key.split('.')[1] as keyof typeof formData.contentSeed;
                const val = formData.contentSeed ? formData.contentSeed[subKey] : undefined;
                return !val;
            } else {
                const val = formData[f.key as keyof typeof formData];
                if (Array.isArray(val)) {
                    const validItems = val.filter(i => i && String(i).trim() !== '');
                    return validItems.length === 0;
                }
                return !val;
            }
        });

        const context = {
            step: currentStep,
            section: baseContext.section_name,
            focused_field_key: currentFocused || null,
            instruction: missingFields.length === 0
                ? voiceConfig.instructions.complete
                : voiceConfig.instructions.incomplete,
            missing_fields: missingFields.map(f => ({ key: f.key, label: f.label, description: f.description, required: f.required ?? true })),
            manual_fields_skipped: baseContext.fields.filter(f => f.voiceSkip).map(f => f.label),
            _debug_formData: Object.keys(FIELD_NAME_MAP).reduce((acc, key) => ({ ...acc, [key]: formData[key as keyof typeof formData] }), {})
        };

        try {
            // Start HTTP session first (gets a session_id + greeting from backend)
            const response = await voiceService.startSession('en', context);
            setSessionId(response.session_id);

            // Now open the WebSocket voice session — it handles mic + TTS automatically
            startWsSession(context, (toolData: any) => {
                console.log("Tool Update received:", toolData);
                if (toolData && Object.keys(toolData).length > 0) {
                    // First extract skipped fields
                    const newlySkipped = Object.entries(toolData)
                        .filter(([_, value]) => value === '[SKIPPED]' || (Array.isArray(value) && value.length === 1 && value[0] === '[SKIPPED]'))
                        .map(([key, _]) => key);

                    if (newlySkipped.length > 0) {
                        setSkippedFields(prev => [...new Set([...prev, ...newlySkipped])]);
                    }

                    setFormData((prev: any) => {
                        const newData = { ...prev };
                        for (const [key, value] of Object.entries(toolData)) {
                            // Skip the transcript echo — it's metadata, not a form field
                            if (key === 'transcript') continue;

                            // Skip fields that are meant to be filled manually (voiceSkip)
                            const fieldCtx = baseContext.fields.find(f => f.key === key);
                            if (fieldCtx && fieldCtx.voiceSkip) continue;

                            // Skip fields the user decided to skip
                            if (value === '[SKIPPED]' || (Array.isArray(value) && value.length === 1 && value[0] === '[SKIPPED]')) {
                                continue;
                            }

                            // Skip null / undefined values — AI must have a real answer
                            if (value === null || value === undefined) continue;

                            // Skip empty strings — AI must have captured actual speech
                            if (typeof value === 'string' && value.trim() === '') continue;

                            // Filter out the AI's own greetings from being saved as data
                            if (typeof value === 'string') {
                                const lowerVal = value.toLowerCase();
                                if (
                                    lowerVal.includes("great progress! let's handle this section") ||
                                    lowerVal.includes("hello! i'm caepy ai") ||
                                    lowerVal.includes("all the details are filled") ||
                                    lowerVal.includes("click next to continue")
                                ) {
                                    console.warn(`Filtered out AI greeting from being saved in field [${key}]: ${value}`);
                                    continue;
                                }
                            }

                            // Skip empty arrays — keeps the existing form value intact
                            if (Array.isArray(value) && value.length === 0) continue;

                            if (key.startsWith('contentSeed.')) {
                                const field = key.split('.')[1];
                                newData.contentSeed = {
                                    ...newData.contentSeed,
                                    [field]: value
                                };
                            } else if (key === 'practiceLocations') {
                                const locs = Array.isArray(value) ? value : (typeof value === 'string' ? value.split(',').map((s: string) => s.trim()).filter(Boolean) : []);
                                newData[key] = locs.map((loc: any) => typeof loc === 'string' ? { name: loc, address: '', schedule: '' } : loc);
                            } else if (['languages', 'fellowships', 'areasOfInterest', 'practiceSegments', 'commonConditions', 'knownForConditions'].includes(key)) {
                                // Short-list fields: comma-separated string → array
                                if (typeof value === 'string') {
                                    newData[key] = value.split(',').map((s: string) => s.trim()).filter(Boolean);
                                } else {
                                    newData[key] = value;
                                }
                            } else if (['trainingExperience', 'motivation', 'unwinding'].includes(key)) {
                                // Long-form narrative fields: store as single-element array — never comma-split
                                // because the answer is a full paragraph that naturally contains commas
                                if (typeof value === 'string' && value.trim()) {
                                    newData[key] = [value.trim()];
                                } else if (Array.isArray(value) && value.length > 0) {
                                    newData[key] = value;
                                }
                            } else if (['experience', 'postSpecialisationExperience', 'mbbsYear', 'specialisationYear', 'consultationFee'].includes(key)) {
                                // Extract leading number only — AI may send "5 years" or "2 year year" from transcript
                                const raw = String(value).trim();
                                const match = raw.match(/^(\d+(?:\.\d+)?)/);
                                newData[key] = match ? match[1] : raw;
                            } else {
                                newData[key] = value;
                            }
                        }
                        return newData;
                    });
                    showToast(`Updated fields based on voice input`, 'success');
                }
            });
        } catch (error) {
            console.error(error);
            showToast('Failed to connect to Voice Assistant', 'error');
        }
    };

    // startListeningLoop is kept for compatibility but no longer used by handleMicClick
    // (the WebSocket session manages the full duplex loop automatically)
    const startListeningLoop = (_currentSessionId: string, _context: any) => {
        // no-op — WebSocket session handles this internally
    };


    // State for API-fetched dropdown options, keyed by frontend field name
    const [dropdownOptions, setDropdownOptions] = useState<Record<string, DropdownOption[]>>({});

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
        phone: '+91',
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

        // 3. Merge in data from the API-fetched doctor profile (if already in localStorage)
        const storedProfile = doctorService.getStoredProfile();
        if (storedProfile) {
            const mappedData = doctorService.mapProfileToFormData(storedProfile);
            // Only fill in empty fields
            for (const [key, value] of Object.entries(mappedData)) {
                const existing = (baseData as any)[key];
                const isEmpty = existing === '' || existing === null || existing === undefined
                    || (Array.isArray(existing) && existing.length === 0);
                if (isEmpty && value !== '' && value !== null && value !== undefined) {
                    (baseData as any)[key] = value;
                }
            }
        }

        // 4. Ensure email/phone are populated from savedUser or localStorage
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
    const fetchProfileData = async () => {
        const doctorId = localStorage.getItem('doctor_id');
        if (!doctorId) return;

        try {
            const profile = await doctorService.fetchAndStoreProfile(doctorId);
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
        } catch (err) {
            console.warn('Could not fetch doctor profile on mount:', err);
        }
    };

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
            fileInputRef.current.value = ''; // Reset input to allow re-selecting the same file
        }
    };

    const handlePhotoUpload = async (croppedBlob: Blob) => {
        const doctorId = localStorage.getItem('doctor_id');
        if (!doctorId) {
            showToast('Unable to upload profile photo. Doctor ID not found.', 'error');
            return;
        }

        // Convert Blob back to File
        const file = new File([croppedBlob], "profile-photo.jpg", { type: "image/jpeg" });

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
            showToast("Failed to upload profile photo. Please try again.", "error");
        } finally {
            setCropModalOpen(false);
            setSelectedImageSrc(null);
        }
    };

    // Fellowships: comma-only split/join (see fellowshipsCommaList.ts) — no trim while typing.
    const handleArrayChange = (field: string, value: string) => {
        setFormData((prev: any) => ({
            ...prev,
            [field]: value.split(',').map(s => s.trimStart()),
        }));
    };

    // Map field names to their corresponding step numbers
    const getStepForField = (fieldName: string): number => {
        if (['fullName', 'email', 'phone', 'specialty', 'primaryLocation', 'practiceLocations', 'registrationNumber', 'medicalCouncil', 'languages'].includes(fieldName)) return 1;
        if (['mbbsYear', 'specialisationYear', 'experience', 'postSpecialisationExperience', 'fellowships', 'qualifications', 'memberships', 'awards'].includes(fieldName)) return 2;
        if (['areasOfInterest', 'practiceSegments', 'commonConditions', 'knownForConditions', 'wantToTreatConditions'].includes(fieldName)) return 3;
        if (['trainingExperience', 'motivation', 'unwinding', 'recognition', 'qualityTime', 'proudAchievement', 'personalAchievement', 'professionalAspiration', 'personalAspiration'].includes(fieldName)) return 4;
        if (['patientValue', 'careApproach', 'practicePhilosophy'].includes(fieldName)) return 5;
        if (fieldName.startsWith('contentSeed')) return 6;
        return 1;
    };

    const skipAutoFocus = React.useRef(false);
    const shouldFocusTarget = React.useRef(navState.focusedField);
    const autoStartMic = React.useRef(false);

    // Auto-start mic when advancing to next step
    useEffect(() => {
        if (autoStartMic.current) {
            autoStartMic.current = false;
            // Wait slightly for step UI to render before initializing connection
            setTimeout(() => {
                handleMicClick();
            }, 500);
        }
    }, [currentStep]);

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

                // Scroll to the prompt block (CAEPY AI block) instead
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
        if (isListening || isSpeaking) {
            stopSession();
        }
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

    const handleStartTour = () => {
        if (isBrowser()) sessionStorage.removeItem('caepy_fresh_login_welcome');
        setShowWelcome(false);
        setTimeout(() => setShowTour(true), 400);
    };

    const handleSkipWelcome = () => {
        if (isBrowser()) sessionStorage.removeItem('caepy_fresh_login_welcome');
        setShowWelcome(false);
        localStorage.setItem(tourKey, 'true');
    };

    const handleSkipToReview = () => {
        if (isBrowser()) sessionStorage.removeItem('caepy_fresh_login_welcome');
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
                    <>
                        <div id="section-prompt-block" className={styles.promptItem}>
                            <Sparkles className={styles.promptIcon} size={20} />
                            <p className={styles.promptText}>
                                "Let's start with the basics. These help patients recognise you quickly and accurately."
                            </p>
                        </div>

                        <div className={styles.sectionHeaderWrap}>
                            <div>
                                <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>Professional Identity</h2>
                                <p style={{ fontSize: '0.875rem', color: '#10B981', marginTop: '0.25rem' }}>Profile strength: {calculateProfileProgress(formData).sections[0].earned}%{!calculateProfileProgress(formData).hasProfilePicture ? <span style={{ fontSize: '0.75rem', color: '#6B7280', marginLeft: '0.5rem' }}>(+5% with profile photo)</span> : null}</p>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                            <button
                                className={styles.uploadBtn}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload size={20} color="#0F766E" strokeWidth={1.5} />
                                <div className={styles.uploadBtnContent}>
                                    <span className={styles.uploadBtnTitle}>
                                        {formData.profileImage ? 'Change Profile Pic' : 'Upload Profile Pic'}
                                    </span>
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
                                        maxLength={13}
                                        value={formData.phone}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (/^\+?[0-9]*$/.test(val) && val.length <= 13) {
                                                setFormData((prev: any) => ({ ...prev, phone: val }));
                                            }
                                        }}
                                        onFocus={() => setFocusedField('phone')}
                                        className={styles.input}
                                        placeholder="Mobile Number (e.g. +91XXXXXXXXXX)"
                                        disabled={isPhoneLogin} // Disabled if logged in via phone
                                        style={isPhoneLogin ? { background: '#F3F4F6', cursor: 'not-allowed' } : {}}
                                    />
                                </div>
                            </div>

                            <div className={styles.fullWidth}>
                                <div className={styles.inputWrapper}>
                                    <label className={styles.label}>Specialty <span>*</span></label>
                                    <CreatableDropdown
                                        name="specialty"
                                        value={formData.specialty}
                                        options={dropdownOptions.specialty || masterData.specialties.map(s => ({ value: s.value, label: s.value }))}
                                        fieldName={FIELD_NAME_MAP.specialty}
                                        placeholder="Select or type a specialty"
                                        onChange={(val: string | string[]) => setFormData(prev => ({ ...prev, specialty: val as string }))}
                                        onFocus={() => setFocusedField('specialty')}
                                        onOptionAdded={(opt: DropdownOption) => handleOptionAdded('specialty', opt)}
                                    />
                                </div>
                            </div>

                            <div className={styles.fullWidth}>
                                <div className={styles.inputWrapper}>
                                    <label className={styles.label}>Languages Spoken</label>
                                    <div className={styles.tagInput}>
                                        <input
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    const val = (e.target as HTMLInputElement).value.trim();
                                                    if (val) {
                                                        const newLangs = [...(formData.languages || []), val];
                                                        setFormData(prev => ({ ...prev, languages: newLangs }));
                                                        (e.target as HTMLInputElement).value = '';
                                                    }
                                                }
                                            }}
                                            onBlur={(e) => {
                                                const val = e.target.value.trim();
                                                if (val) {
                                                    const newLangs = [...(formData.languages || []), val];
                                                    setFormData(prev => ({ ...prev, languages: newLangs }));
                                                    e.target.value = '';
                                                }
                                            }}
                                            placeholder="Add languages"
                                            className={styles.input}
                                        />
                                        <div className={styles.tagsContainer}>
                                            {(formData.languages || []).map((lang: string, i: number) => (
                                                <span key={i} className={styles.tag}>
                                                    {lang}
                                                    <button onClick={() => {
                                                        const newLangs = formData.languages.filter((_: any, index: number) => index !== i);
                                                        setFormData(prev => ({ ...prev, languages: newLangs }));
                                                    }}>×</button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.fullWidth}>
                                <div className={styles.inputWrapper}>
                                    <label className={styles.label}>Primary Practice Location <span>*</span></label>
                                    <CreatableDropdown
                                        name="primaryLocation"
                                        value={formData.primaryLocation}
                                        options={dropdownOptions.primaryLocation || masterData.locations.map(loc => ({ value: loc.value, label: loc.value }))}
                                        fieldName={FIELD_NAME_MAP.primaryLocation}
                                        placeholder="Select or type a location"
                                        onChange={(val: string | string[]) => setFormData(prev => ({ ...prev, primaryLocation: val as string }))}
                                        onFocus={() => setFocusedField('primaryLocation')}
                                        onOptionAdded={(opt: DropdownOption) => handleOptionAdded('primaryLocation', opt)}
                                    />
                                </div>
                            </div>

                            <div className={styles.fullWidth}>
                                <PracticeLocationAccordion
                                    locations={formData.practiceLocations}
                                    onLocationsChange={(locs) => setFormData((prev: any) => ({ ...prev, practiceLocations: locs }))}
                                    onFocus={() => setFocusedField('practiceLocations')}
                                />
                            </div>

                            <div className={styles.halfWidth}>
                                <div className={styles.inputWrapper}>
                                    <label className={styles.label}>Years of Experience <span>*</span> </label>
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

                            <div className={styles.halfWidth}>
                                <div className={styles.inputWrapper}>
                                    <label className={styles.label}>Medical Registration Number <span>*</span></label>
                                    <input
                                        name="registrationNumber"
                                        value={formData.registrationNumber}
                                        onChange={handleInputChange}
                                        onFocus={() => setFocusedField('registrationNumber')}
                                        className={styles.input}
                                        placeholder="Enter your registration number"
                                    />
                                </div>
                            </div>

                            <div className={styles.halfWidth}>
                                <div className={styles.inputWrapper}>
                                    <label className={styles.label}>Medical Council <span>*</span></label>
                                    <input
                                        name="medicalCouncil"
                                        value={formData.medicalCouncil}
                                        onChange={handleInputChange}
                                        onFocus={() => setFocusedField('medicalCouncil')}
                                        className={styles.input}
                                        placeholder="Enter your medical council"
                                    />
                                </div>
                            </div>
                        </div>
                    </>
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

    /**
     * Purely frontend gate: is the current step valid for proceeding?
     * Only checks fields with required:true and voiceSkip !== true
     * in the dynamic voiceConfig.context for the current step.
     */
    const isStepValid = (() => {
        if (!voiceConfig) return true;
        const stepCtx = voiceConfig.context[currentStep.toString()];
        if (!stepCtx) return true; // no context defined → no gate

        const enforced = stepCtx.fields.filter(f => f.required !== false && !f.voiceSkip);
        return enforced.every(f => {
            const val = formData[f.key as keyof typeof formData];
            if (val === undefined || val === null) return false;
            if (typeof val === 'string') return val.trim() !== '';
            if (Array.isArray(val)) return val.length > 0;
            return true;
        });
    })();

    // Missing required labels — shown as tooltip on the disabled button
    const missingRequiredLabels = (() => {
        if (!voiceConfig) return [];
        const stepCtx = voiceConfig.context[currentStep.toString()];
        if (!stepCtx) return [];
        return stepCtx.fields
            .filter(f => f.required !== false && !f.voiceSkip)
            .filter(f => {
                const val = formData[f.key as keyof typeof formData];
                if (val === undefined || val === null) return true;
                if (typeof val === 'string') return val.trim() === '';
                if (Array.isArray(val)) return val.length === 0;
                return false;
            })
            .map(f => f.label);
    })();

    const handleNext = () => {
        if (isListening || isSpeaking) {
            stopSession();
        }

        // Frontend gate: block if required fields are missing
        if (!isStepValid) {
            showToast(`Please fill: ${missingRequiredLabels.join(', ')}`, 'error');
            return;
        }

        // Validation for Step 1
        if (currentStep === 1) {
            const { isValid, errors } = validateSection1(formData);
            if (!isValid) {
                showToast(errors[0], 'error');
                return;
            }
        }

        // Save current step data locally
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
            // Updated Flow: Review after Step 3
            const finalStage = navState.stage === 'final' ? 'final' : 'intermediate';
            sessionStorage.setItem('nav_state', JSON.stringify({ formData, stage: finalStage })); router.push('/doctor/review');
            return;
        }

        if (currentStep < totalSteps) {
            setCurrentStep((prev: number) => prev + 1);
            setFocusedField(''); // Reset focus
            autoStartMic.current = true; // Flag mic to autostart upon next render
        } else {
            sessionStorage.setItem('nav_state', JSON.stringify({ formData, stage: 'final' }));
            router.push('/doctor/review');
        }
    };

    const handleStepJump = (step: number) => {
        if (isListening || isSpeaking) {
            stopSession();
        }
        // Only allow jumping comfortably backward or to adjacent?
        // For now, allow jumping to any previous step as requested.
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
                                        <div className={`${styles.listeningDot} ${isSpeaking ? styles.isTalking : styles.isListening}`}></div>
                                        {isSpeaking ? 'connecting...' : 'listening'}
                                    </div>
                                    <div className={styles.wave}>
                                        {[1, 2, 3, 4, 5].map(i => <div key={i} className={styles.waveBar} style={{ transform: `scaleY(${Math.max(0.1, Math.min(volume * 1.5, 1.5))})`, transition: 'transform 0.1s', display: 'inline-block', transformOrigin: 'bottom' }}></div>)}
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
