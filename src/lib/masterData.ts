export interface MasterItem {
    value: string;
    created_by: string;
    created_at: string; // ISO date string
}

export interface MasterData {
    specialties: MasterItem[];
    locations: MasterItem[];
    practiceSegments: MasterItem[];
    commonConditions: MasterItem[];
    areasOfInterest: MasterItem[];
}

const now = new Date().toISOString();

const toItems = (values: string[], by: string = 'System'): MasterItem[] =>
    values.map(value => ({ value, created_by: by, created_at: now }));

const DEFAULT_MASTER_DATA: MasterData = {
    specialties: toItems([
        'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology',
        'General Surgery', 'Internal Medicine', 'Neurology', 'Orthopedics',
        'Pediatrics', 'Psychiatry', 'Urology'
    ]),
    locations: toItems([
        'Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata'
    ]),
    practiceSegments: toItems([
        'Outpatient (OPD)', 'Inpatient (IPD)', 'Emergency care',
        'Teleconsultation', 'Procedures / Interventions', 'Others'
    ]),
    commonConditions: toItems([
        'Diabetes', 'Hypertension', 'Asthma', 'Arthritis', 'Migraine',
        'Thyroid Disorders', 'Anemia', 'Acne', 'Eczema', 'Psoriasis',
        'Back Pain', 'Depression', 'Anxiety', 'Obesity'
    ]),
    areasOfInterest: toItems([
        'Preventive Health', 'Chronic Disease Management', 'Pediatric Care',
        'Geriatric Care', 'Sports Medicine', 'Women\'s Health',
        'Mental Health', 'Cosmetic Dermatology', 'Interventional Cardiology'
    ])
};

const STORAGE_KEY = 'caepy_master_data';

/**
 * Migrate old string[] format to MasterItem[] format if needed.
 */
const migrateData = (raw: any): MasterData => {
    const result: any = {};
    for (const key of Object.keys(DEFAULT_MASTER_DATA)) {
        const arr = raw[key];
        if (!Array.isArray(arr)) {
            result[key] = (DEFAULT_MASTER_DATA as any)[key];
        } else if (arr.length > 0 && typeof arr[0] === 'string') {
            // Old format: plain strings → migrate to MasterItem
            result[key] = toItems(arr, 'System');
        } else {
            result[key] = arr;
        }
    }
    return result as MasterData;
};

export const getMasterData = (): MasterData => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MASTER_DATA));
        return DEFAULT_MASTER_DATA;
    }
    try {
        const parsed = JSON.parse(stored);
        const migrated = migrateData(parsed);
        // Re-save if migration happened
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
    } catch (e) {
        console.error("Error parsing master data", e);
        return DEFAULT_MASTER_DATA;
    }
};

export const addMasterItem = (key: keyof MasterData, value: string): MasterData => {
    const data = getMasterData();
    const exists = data[key].some(item => item.value === value);
    if (!exists) {
        const currentUser = localStorage.getItem('role') || 'Admin';
        const newItem: MasterItem = {
            value,
            created_by: currentUser,
            created_at: new Date().toISOString(),
        };
        data[key] = [...data[key], newItem].sort((a, b) => a.value.localeCompare(b.value));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
    return data;
};

export const removeMasterItem = (key: keyof MasterData, value: string): MasterData => {
    const data = getMasterData();
    data[key] = data[key].filter(item => item.value !== value);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
};

export const resetMasterData = (): MasterData => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MASTER_DATA));
    return DEFAULT_MASTER_DATA;
};

/**
 * Helper to get just the string values (for dropdowns in onboarding).
 */
export const getMasterValues = (key: keyof MasterData): string[] => {
    const data = getMasterData();
    return data[key].map(item => item.value);
};
