'use client';
import React, { useState, useEffect } from 'react';
import { useAppRouter } from '../lib/router';
import { Mic, Keyboard, Sparkles, Upload, ArrowLeft, MicOff, MapPin, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import Stepper from '../components/ui/Stepper';
import LivePreview from '../components/ui/LivePreview';
import WelcomeDialog from '../components/ui/WelcomeDialog';
import GuidedTour from '../components/ui/GuidedTour';
import CreatableDropdown from '../components/ui/CreatableDropdown';
import type { DropdownOption } from '../components/ui/CreatableDropdown';
import styles from './Onboarding.module.css';
import { getMasterData, type MasterData } from '../lib/masterData';

import { mockDataService } from '../services/mockDataService';
import { doctorService } from '../services/doctorService';
import { dropdownService } from '../services/dropdownService';
import { useAssistant } from '../hooks/useAssistant';
import { isBrowser } from '../lib/isBrowser';

import { validateSection1 } from '../lib/validation';
import Toast from '../components/ui/Toast';
import { voiceService } from '../services/voiceService';
import { ONBOARDING_VOICE_CONTEXT } from '../lib/voiceContext';


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

            if (lat && lng) {
                setMapCenter({ lat, lng });
                setMarkerPos({ lat, lng });
            }
        }
    };

    /** Handle direct clicks on POIs (Points of Interest) on the map */
    const onMapClick = (e: google.maps.MapMouseEvent) => {
        // Check for POI click (has placeId)
        const mapsMouseEvent = e as google.maps.IconMouseEvent;
        if (mapsMouseEvent.placeId && mapRef) {
            // Prevent default info window
            e.stop?.();

            const service = new google.maps.places.PlacesService(mapRef);
            service.getDetails(
                {
                    placeId: mapsMouseEvent.placeId,
                    fields: ['name', 'formatted_address', 'geometry', 'address_components', 'formatted_phone_number', 'international_phone_number'],
                },
                (place, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                        const placeName = place.name || '';
                        const placeAddress = place.formatted_address || '';
                        const lat = place.geometry?.location?.lat();
                        const lng = place.geometry?.location?.lng();
                        const comps = place.address_components;

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

                        if (lat && lng) {
                            setMapCenter({ lat, lng });
                            setMarkerPos({ lat, lng });
                        }
                    }
                }
            );
        } else if (e.latLng) {
            // Regular map click (not a POI) — place marker and reverse geocode
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setMarkerPos({ lat, lng });
            setMapCenter({ lat, lng });

            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === 'OK' && results && results[0]) {
                    const result = results[0];
                    const comps = result.address_components;
                    const city = getAddressComponent(comps, 'locality')
                        || getAddressComponent(comps, 'sublocality_level_1')
                        || getAddressComponent(comps, 'administrative_area_level_2');
                    const state = getAddressComponent(comps, 'administrative_area_level_1');
                    const pincode = getAddressComponent(comps, 'postal_code');

                    setNewLoc(prev => ({
                        ...prev,
                        address: result.formatted_address || '',
                        city,
                        state,
                        pincode,
                        lat,
                        lng,
                    }));
                }
            });
        }
    };

    const handleAddLocation = () => {
        if (newLoc.name.trim()) {
            onLocationsChange([...locations, { ...newLoc }]);
            setNewLoc({ name: '', address: '', schedule: '', city: '', state: '', pincode: '', phone_number: '' });
            setMarkerPos(null);
            setIsAdding(false);
            setAddMode('manual');
        }
    };

    const handleRemoveLocation = (index: number) => {
        onLocationsChange(locations.filter((_, i) => i !== index));
    };

    const resetForm = () => {
        setIsAdding(false);
        setNewLoc({ name: '', address: '', schedule: '', city: '', state: '', pincode: '', phone_number: '' });
        setMarkerPos(null);
        setAddMode('manual');
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
                                    placeholder="Pincode"
                                    value={newLoc.pincode || ''}
                                    onChange={(e) => setNewLoc({ ...newLoc, pincode: e.target.value })}
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

const Onboarding = () => {
    const router = useAppRouter();
    const [navState, setNavState] = useState<Record<string, any>>({});
    useEffect(() => {
        try { const s = JSON.parse(sessionStorage.getItem('nav_state') || '{}'); setNavState(s); sessionStorage.removeItem('nav_state'); } catch { }
    }, []);

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

    // Determine if dialog should be suppressed:
    // If section >= 6 AND profile already submitted/verified, skip dialog entirely
    const isProfileSubmitted = savedUser?.status === 'submitted' || savedUser?.status === 'verified';
    const shouldSuppressDialog = currentStep >= 6 && isProfileSubmitted;
    const [showWelcome, setShowWelcome] = useState(!hasTourCompleted && !shouldSuppressDialog);
    const [showTour, setShowTour] = useState(false);

    // Show "Skip to Review" when user has completed section 3 or above
    const showSkipButton = !isNewUser && currentStep >= 3;

    const handleStartTour = () => {
        setShowWelcome(false);
        // Small delay so the dialog dismisses before the tour starts
        setTimeout(() => setShowTour(true), 400);
    };

    const handleSkipWelcome = () => {
        setShowWelcome(false);
        localStorage.setItem(tourKey, 'true');
    };

    const handleSkipToReview = () => {
        setShowWelcome(false);
        localStorage.setItem(tourKey, 'true');
        sessionStorage.setItem('nav_state', JSON.stringify({ formData, fromOnboarding: true })); router.push('/doctor/review');
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

    interface OnboardingFormData {
        fullName: string;
        email: string;
        phone: string;
        specialty: string;
        primaryLocation: string;
        practiceLocations: { name: string; address: string; schedule: string; city?: string; state?: string; pincode?: string; phone_number?: string; lat?: number; lng?: number }[];
        experience: string;
        postSpecialisationExperience: string;
        registrationNumber: string;
        medicalCouncil: string;
        mbbsYear: string;
        specialisationYear: string;
        fellowships: string[];
        qualifications: string;
        memberships: string;
        awards: string;
        areasOfInterest: string[];
        practiceSegments: string[];
        commonConditions: string[];
        knownForConditions: string[];
        wantToTreatConditions: string;
        trainingExperience: string[];
        motivation: string[];
        unwinding: string[];
        recognition: string;
        qualityTime: string;
        freeText: string;
        proudAchievement: string;
        personalAchievement: string;
        professionalAspiration: string;
        personalAspiration: string;
        patientValue: string;
        careApproach: string;
        practicePhilosophy: string;
        profileImage: string;
        languages: string[];
        consultationFee: string;
        contentSeed: {
            conditionName: string;
            presentation: string;
            investigations: string;
            treatment: string;
            delayConsequences: string;
            prevention: string;
            additionalInsights: string;
        };
    }

    // Mapping from frontend field keys to backend API field_name values
    const FIELD_NAME_MAP: Record<string, string> = {
        specialty: 'specialty',
        primaryLocation: 'primary_practice_location',
        areasOfInterest: 'sub_specialties',
        practiceSegments: 'practice_segments',
        commonConditions: 'conditions_treated',
        knownForConditions: 'procedures_performed',
        wantToTreatConditions: 'conditions_treated',
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
                            // Fallback to masterData
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

    // Fallback: convert masterData to DropdownOption[]
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
        return md[masterKey].map(item => ({ value: item.value, label: item.value }));
    };

    // Handler for when a new option is added via CreatableDropdown
    const handleOptionAdded = (fieldKey: string, newOption: DropdownOption) => {
        setDropdownOptions(prev => ({
            ...prev,
            [fieldKey]: [...(prev[fieldKey] || []), newOption].sort((a, b) => a.label.localeCompare(b.label)),
        }));
        showToast(`"${newOption.label}" submitted for review`, 'success');
    };

    // State for all form fields
    const defaultFormData: OnboardingFormData = {
        // Block 1: Professional Identity
        fullName: '',
        email: '',
        phone: '',
        specialty: '',
        primaryLocation: '',
        practiceLocations: [], // Array of { name, address, schedule }
        experience: '',
        postSpecialisationExperience: '',
        registrationNumber: '',
        medicalCouncil: '',

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
        profileImage: '',
        languages: [],
        consultationFee: '',

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

    const [formData, setFormData] = useState<OnboardingFormData>(() => {
        // Start with default values
        const baseData = { ...defaultFormData };

        // 1. Merge in savedData from localStorage (mock persistence)
        if (savedData) {
            Object.assign(baseData, savedData);
            if (savedData.contentSeed) {
                baseData.contentSeed = { ...defaultFormData.contentSeed, ...savedData.contentSeed };
            }
        }

        // 2. Override with nav state (e.g. from Resume Upload)
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

    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const fellowshipFileRef = React.useRef<HTMLInputElement>(null);
    const [fellowshipFiles, setFellowshipFiles] = useState<File[]>([]);

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Size check (e.g., 5MB limit for upload safety)
        if (file.size > 5 * 1024 * 1024) {
            showToast("Image too large. Please select an image under 5MB.", "error");
            return;
        }

        const doctorId = localStorage.getItem('doctor_id');
        if (!doctorId) {
            showToast("Unable to upload profile photo. Doctor ID not found.", "error");
            return;
        }

        try {
            const url = await doctorService.uploadProfilePhoto(doctorId, file);
            setFormData(prev => ({ ...prev, profileImage: url }));
            showToast("Profile photo uploaded", "success");
        } catch (err) {
            console.error('Failed to upload profile photo:', err);
            showToast("Failed to upload profile photo. Please try again.", "error");
        }
    };

    // Helper for array fields (simple strings)
    const handleArrayChange = (field: string, value: string) => {
        setFormData((prev: any) => ({ ...prev, [field]: value.split(',').map((s: string) => s.trim()) }));
    };

    // const handleMultiSelect = (field: string, value: string, max?: number) => {
    //     setFormData((prev: any) => {
    //         const current = prev[field] || [];
    //         if (!Array.isArray(current)) return { ...prev, [field]: [value] };
    //         if (current.includes(value)) {
    //             return { ...prev, [field]: current.filter((item: string) => item !== value) };
    //         } else {
    //             if (max && current.length >= max) return prev;
    //             return { ...prev, [field]: [...current, value] };
    //         }
    //     });
    // };

    // Map field names to their corresponding step numbers
    const getStepForField = (fieldName: string): number => {
        // Block 1: Professional Identity
        if (['fullName', 'email', 'phone', 'specialty', 'primaryLocation', 'practiceLocations', 'experience', 'postSpecialisationExperience', 'registrationNumber', 'medicalCouncil'].includes(fieldName)) return 1;
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
    const shouldFocusTarget = React.useRef(navState.focusedField);

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

                        <div className={styles.sectionHeaderWrap}>
                            <div>
                                <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>Professional Identity</h2>
                                <p style={{ fontSize: '0.875rem', color: '#10B981', marginTop: '0.25rem' }}>Profile strength: 20%</p>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handlePhotoUpload}
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
                                    <CreatableDropdown
                                        name="specialty"
                                        value={formData.specialty}
                                        options={dropdownOptions.specialty || masterData.specialties.map(s => ({ value: s.value, label: s.value }))}
                                        fieldName={FIELD_NAME_MAP.specialty}
                                        placeholder="Select or type a specialty"
                                        onChange={(val) => setFormData(prev => ({ ...prev, specialty: val }))}
                                        onFocus={() => setFocusedField('specialty')}
                                        onOptionAdded={(opt) => handleOptionAdded('specialty', opt)}
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
                                            placeholder="Press Enter to add languages (e.g., English, Hindi, Spanish)"
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
                                        onChange={(val) => setFormData(prev => ({ ...prev, primaryLocation: val }))}
                                        onFocus={() => setFocusedField('primaryLocation')}
                                        onOptionAdded={(opt) => handleOptionAdded('primaryLocation', opt)}
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
                    <>
                        <div id="section-prompt-block" className={styles.promptItem}>
                            <Sparkles className={styles.promptIcon} size={20} />
                            <p className={styles.promptText}>
                                "This section highlights your training and professional milestones. You may keep this factual."
                            </p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>Credentials & Trust Markers</h2>
                                <p style={{ fontSize: '0.875rem', color: '#10B981', marginTop: '0.25rem' }}>
                                    Profile strength: 40%
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
            case 3:
                return (
                    <>
                        <div id="section-prompt-block" className={styles.promptItem}>
                            <Sparkles className={styles.promptIcon} size={20} />
                            <p className={styles.promptText}>
                                "This reflects what you actually practice, not just what you were trained in."
                            </p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>Clinical Focus & Expertise</h2>
                                <p style={{ fontSize: '0.875rem', color: '#10B981', marginTop: '0.25rem' }}>Profile strength: 60%</p>
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
                                        options={dropdownOptions.practiceSegments || masterData.practiceSegments.map((item: any) => ({ value: item.value, label: item.value }))}
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
                                        options={dropdownOptions.commonConditions || masterData.commonConditions.map((item: any) => ({ value: item.value, label: item.value }))}
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
                                        options={dropdownOptions.knownForConditions || masterData.commonConditions.map((item: any) => ({ value: item.value, label: item.value }))}
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
                                        options={dropdownOptions.wantToTreatConditions || masterData.commonConditions.map((item: any) => ({ value: item.value, label: item.value }))}
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

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>The Human Side</h2>
                                <p style={{ fontSize: '0.875rem', color: '#10B981', marginTop: '0.25rem' }}>
                                    Profile strength: 60%
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
            case 5:
                return (
                    <>
                        <div id="section-prompt-block" className={styles.promptItem}>
                            <Sparkles className={styles.promptIcon} size={20} />
                            <p className={styles.promptText}>
                                "If a patient had 30 seconds to understand your practice, what would you want them to know?"
                            </p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>Patient Value & Choice Factors</h2>
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
            sessionStorage.setItem('nav_state', JSON.stringify({ formData, stage: 'intermediate' })); router.push('/doctor/review');
            return;
        }

        if (currentStep < totalSteps) {
            setCurrentStep((prev: number) => prev + 1);
            setFocusedField(''); // Reset focus
        } else {
            // Final Step
            sessionStorage.setItem('nav_state', JSON.stringify({ formData, stage: 'final' })); router.push('/doctor/review');
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
                                        {isSpeaking ? 'talking' : 'listening'}
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

                        {/* <button className={styles.typeButton}>
                            <Keyboard size={16} /> Prefer typing instead
                        </button> */}

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
        </div>
    );
};

export default Onboarding;
