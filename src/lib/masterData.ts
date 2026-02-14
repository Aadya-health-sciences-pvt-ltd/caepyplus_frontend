export interface MasterData {
    specialties: string[];
    locations: string[];
    practiceSegments: string[];
    commonConditions: string[];
    areasOfInterest: string[];
    // Add more as needed
}

const DEFAULT_MASTER_DATA: MasterData = {
    specialties: [
        'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology',
        'General Surgery', 'Internal Medicine', 'Neurology', 'Orthopedics',
        'Pediatrics', 'Psychiatry', 'Urology'
    ],
    locations: [
        'Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata'
    ],
    practiceSegments: [
        'Outpatient (OPD)', 'Inpatient (IPD)', 'Emergency care',
        'Teleconsultation', 'Procedures / Interventions', 'Others'
    ],
    commonConditions: [
        'Diabetes', 'Hypertension', 'Asthma', 'Arthritis', 'Migraine',
        'Thyroid Disorders', 'Anemia', 'Acne', 'Eczema', 'Psoriasis',
        'Back Pain', 'Depression', 'Anxiety', 'Obesity'
    ],
    areasOfInterest: [
        'Preventive Health', 'Chronic Disease Management', 'Pediatric Care',
        'Geriatric Care', 'Sports Medicine', 'Women\'s Health',
        'Mental Health', 'Cosmetic Dermatology', 'Interventional Cardiology'
    ]
};

const STORAGE_KEY = 'caepy_master_data';

export const getMasterData = (): MasterData => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        // Initialize with defaults if empty
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MASTER_DATA));
        return DEFAULT_MASTER_DATA;
    }
    try {
        return JSON.parse(stored);
    } catch (e) {
        console.error("Error parsing master data", e);
        return DEFAULT_MASTER_DATA;
    }
};

export const addMasterItem = (key: keyof MasterData, value: string): MasterData => {
    const data = getMasterData();
    if (!data[key].includes(value)) {
        data[key] = [...data[key], value].sort();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
    return data;
};

export const removeMasterItem = (key: keyof MasterData, value: string): MasterData => {
    const data = getMasterData();
    data[key] = data[key].filter(item => item !== value);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
};

export const resetMasterData = (): MasterData => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MASTER_DATA));
    return DEFAULT_MASTER_DATA;
};
