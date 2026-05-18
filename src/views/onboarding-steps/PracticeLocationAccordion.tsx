'use client';
import React, { useState } from 'react';
import { Keyboard, MapPin, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { useJsApiLoader, Autocomplete, GoogleMap, MarkerF } from '@react-google-maps/api';
import styles from '../Onboarding.module.css';

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
    const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 12.9716, lng: 77.5946 });
    const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number } | null>(null);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: LIBRARIES,
    });

    const onAutocompleteLoad = (ac: google.maps.places.Autocomplete) => {
        ac.setFields(['name', 'formatted_address', 'geometry', 'address_components', 'formatted_phone_number', 'international_phone_number']);
        setAutocomplete(ac);
    };

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

    const onMapClick = (e: google.maps.MapMouseEvent) => {
        const mapsMouseEvent = e as google.maps.IconMouseEvent;
        if (mapsMouseEvent.placeId && mapRef) {
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
                        <span className={styles.plTitle}>Practice Location &amp; Schedule <span style={{ color: '#EF4444' }}>*</span></span>
                        <span className={styles.plSubtitle}>Add your clinic or hospital locations where</span>
                    </div>
                </div>
                {isOpen ? <ChevronUp size={20} color="#6B7280" /> : <ChevronDown size={20} color="#6B7280" />}
            </button>

            {isOpen && (
                <div className={styles.plBody}>
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

                    {isAdding ? (
                        <div className={styles.plAddForm}>
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
                                        const val = e.target.value.replace(/\D/g, '');
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

export default PracticeLocationAccordion;
