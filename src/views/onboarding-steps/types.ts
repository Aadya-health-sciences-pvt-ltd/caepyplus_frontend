import type { DropdownOption } from '../../components/ui/CreatableDropdown';
import type { MasterData } from '../../lib/masterData';
import type { ProfileProgress } from '../../lib/profileProgress';

export type { DropdownOption, MasterData, ProfileProgress };

export interface OnboardingFormData {
    fullName: string;
    email: string;
    phone: string;
    specialty: string;
    primaryLocation: string;
    practiceLocations: {
        name: string;
        address: string;
        schedule: string;
        city?: string;
        state?: string;
        pincode?: string;
        phone_number?: string;
        lat?: number;
        lng?: number;
    }[];
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

/** Mapping from frontend field keys to backend API field_name values */
export const FIELD_NAME_MAP: Record<string, string> = {
    specialty: 'specialty',
    primaryLocation: 'primary_practice_location',
    areasOfInterest: 'sub_specialties',
    practiceSegments: 'practice_segments',
    commonConditions: 'conditions_treated',
    knownForConditions: 'procedures_performed',
    wantToTreatConditions: 'conditions_treated',
};

/** Common handler type for input/textarea/select change events */
export type HandleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
) => void;

/** Shared props passed to every step component */
export interface SharedStepProps {
    formData: OnboardingFormData;
    setFormData: React.Dispatch<React.SetStateAction<OnboardingFormData>>;
    handleInputChange: HandleInputChange;
    setFocusedField: (field: string) => void;
    profileProgress: ProfileProgress;
}
