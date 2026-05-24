import type { DropdownOption } from '../components/ui/CreatableDropdown';

/**
 * Fixed options for “Languages Spoken” (onboarding UI only; stored as string[] like before).
 * Includes languages in the Indian Eighth Schedule plus Bhojpuri & Rajasthani, and common international languages.
 */
const SPOKEN_LANGUAGE_LABELS = [
    'Assamese',
    'Bengali',
    'Bhojpuri',
    'Bodo',
    'Chinese',
    'Dogri',
    'English',
    'French',
    'German',
    'Gujarati',
    'Hindi',
    'Japanese',
    'Kannada',
    'Kashmiri',
    'Konkani',
    'Maithili',
    'Malayalam',
    'Manipuri',
    'Marathi',
    'Nepali',
    'Odia',
    'Punjabi',
    'Rajasthani',
    'Sanskrit',
    'Santali',
    'Sindhi',
    'Spanish',
    'Tamil',
    'Telugu',
    'Urdu',
] as const;

export const SPOKEN_LANGUAGE_OPTIONS: DropdownOption[] = SPOKEN_LANGUAGE_LABELS.map((label) => ({
    value: label,
    label,
}));
