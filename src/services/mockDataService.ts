
interface DoctorProfile {
    id: string;
    email?: string;
    phone?: string;
    name: string;
    status: 'pending' | 'submitted' | 'verified' | 'rejected';
    currentStep: number; // 0-7 (0=Resume, 1-7=Onboarding Sections)
    lastUpdated: string;
    data: any; // Holds the onboarding form data
}

const STORAGE_KEY = 'caepy_doctor_profiles';
const CURRENT_USER_KEY = 'caepy_current_user_id';

class MockDataService {
    private profiles: DoctorProfile[] = [];

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            this.profiles = JSON.parse(stored);
            this.ensureSeedData(); // Ensure seed/test profiles always exist even if storage has other data
        } else {
            this.seedData();
        }
    }

    private saveToStorage() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profiles));
    }

    private ensureSeedData() {
        const seededProfiles = this.getSeededProfiles();
        seededProfiles.forEach(seed => {
            const exists = this.profiles.find(p => p.id === seed.id);
            if (!exists) {
                this.profiles.push(seed);
            } else {
                // Optional: Update the seed profile in storage to the latest structure if needed
                // For now, we trust the storage version unless we want to force-reset test users
            }
        });
        this.saveToStorage();
    }

    private getSeededProfiles(): DoctorProfile[] {
        return [
            // 1. Completed & Verified
            {
                id: 'doc_verified_01',
                email: 'dr.arjun@caepy.com',
                phone: '9876543210',
                name: 'Dr. Arjun Mehta',
                status: 'verified',
                currentStep: 8, // Completed
                lastUpdated: new Date().toISOString(),
                data: {
                    personalInfo: { firstName: 'Arjun', lastName: 'Mehta', email: 'dr.arjun@caepy.com' },
                    qualifications: "MBBS, MD (General Medicine)",
                    primaryLocation: 'Mumbai, Maharashtra',
                    experience: '12'
                }
            },
            // 2. Completed & Pending
            {
                id: 'doc_completed_02',
                email: 'dr.priya@caepy.com',
                phone: '9876543211',
                name: 'Dr. Priya Sharma',
                status: 'submitted',
                currentStep: 8,
                lastUpdated: new Date().toISOString(),
                data: {
                    personalInfo: { firstName: 'Priya', lastName: 'Sharma' },
                    primaryLocation: 'Delhi NCR',
                    experience: '8'
                }
            },
            // 3. In-Progress (Step 3) - Updated Structure
            {
                id: 'doc_progress_03',
                email: 'dr.vikram@caepy.com',
                phone: '9876543212',
                name: 'Dr. Vikram Singh',
                status: 'pending',
                currentStep: 3,
                lastUpdated: new Date().toISOString(),
                data: {
                    fullName: 'Dr. Vikram Singh',
                    specialty: 'Dermatologist',
                    primaryLocation: 'Indiranagar, Bangalore',
                    experience: '5',
                    mbbsYear: '2015',
                    specialisationYear: '2018',
                    contentSeed: {}
                }
            },
            // 4. In-Progress (Step 5) - Updated Structure
            {
                id: 'doc_progress_04',
                email: 'dr.ananya@caepy.com',
                phone: '9876543213',
                name: 'Dr. Ananya Iyer',
                status: 'pending',
                currentStep: 5,
                lastUpdated: new Date().toISOString(),
                data: {
                    fullName: 'Dr. Ananya Iyer',
                    specialty: 'Pediatrician',
                    primaryLocation: 'Whitefield, Bangalore',
                    experience: '8',
                    mbbsYear: '2012',
                    specialisationYear: '2015',
                    patientValue: 'Trust and Transparency',
                    contentSeed: {}
                }
            }
        ];
    }

    private seedData() {
        this.profiles = this.getSeededProfiles();
        this.saveToStorage();
        console.log('Mock Data Seeded');
    }

    // Auth Methods
    login(identifier: string): DoctorProfile | null {
        // Identifier can be email or phone
        // Remove spaces/dashes for phone check if needed
        const profile = this.profiles.find(p =>
            p.email === identifier || p.phone === identifier
        );

        if (profile) {
            localStorage.setItem(CURRENT_USER_KEY, profile.id);
            return profile;
        }
        return null;
    }

    logout() {
        localStorage.removeItem(CURRENT_USER_KEY);
    }

    getCurrentUser(): DoctorProfile | null {
        const id = localStorage.getItem(CURRENT_USER_KEY);
        if (!id) return null;
        return this.getProfile(id) || null;
    }

    // Profile Methods
    createProfile(identifier: string, type: 'email' | 'phone'): DoctorProfile {
        const newProfile: DoctorProfile = {
            id: `doc_${Date.now()}`,
            [type]: identifier,
            name: '', // Will be filled later
            status: 'pending',
            currentStep: 0, // Start at Resume Upload
            lastUpdated: new Date().toISOString(),
            data: {}
        };

        this.profiles.push(newProfile);
        this.saveToStorage();
        localStorage.setItem(CURRENT_USER_KEY, newProfile.id);
        return newProfile;
    }

    getProfile(id: string): DoctorProfile | undefined {
        return this.profiles.find(p => p.id === id);
    }

    updateProfile(id: string, updates: Partial<DoctorProfile>): DoctorProfile | null {
        const index = this.profiles.findIndex(p => p.id === id);
        if (index === -1) return null;

        this.profiles[index] = {
            ...this.profiles[index],
            ...updates,
            lastUpdated: new Date().toISOString()
        };

        this.saveToStorage();
        return this.profiles[index];
    }

    // Specific method to update onboarding data deep merge
    updateOnboardingData(id: string, step: number, sectionData: any): DoctorProfile | null {
        const index = this.profiles.findIndex(p => p.id === id);
        if (index === -1) return null;

        const currentProfile = this.profiles[index];
        const newData = {
            ...currentProfile.data,
            ...sectionData // specific section update or merge logic
        };

        this.profiles[index] = {
            ...currentProfile,
            data: newData,
            currentStep: Math.max(currentProfile.currentStep, step), // Access next step if greater
            lastUpdated: new Date().toISOString()
        };

        this.saveToStorage();
        return this.profiles[index];
    }
}

export const mockDataService = new MockDataService();
