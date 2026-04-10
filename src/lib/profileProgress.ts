/**
 * Centralized Profile Progress Calculation
 *
 * Section weights (total = 100%):
 *  Section 1 – Professional Identity: 20% WITH profile picture, 15% WITHOUT
 *  Section 2 – Credentials & Trust Markers: 20%
 *  Section 3 – Clinical Focus & Expertise: 20%
 *  Section 4 – The Human Side: 15%
 *  Section 5 – Patient Value & Choice Factors: 15%
 *  Section 6 – Content Seed: 10%
 *
 * NOTE: Section 1 without profile picture + all other completed = 95% max.
 *       With profile picture it reaches 100%.
 */

export interface SectionProgress {
  section: number;
  label: string;
  weight: number;         // Max possible weight for this section
  earned: number;         // Earned percentage for this section (0 – weight)
  isComplete: boolean;    // True when the section is considered "done"
}

export interface ProfileProgress {
  totalPercentage: number;          // 0–100
  sections: SectionProgress[];
  hasProfilePicture: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isNonEmpty(v: any): boolean {
  if (!v) return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'string') return v.trim().length > 0;
  if (typeof v === 'number') return !Number.isNaN(v);
  return false;
}

// ---------------------------------------------------------------------------
// Section completion checks
// ---------------------------------------------------------------------------

/**
 * Section 1 – Professional Identity
 * Required fields: fullName, specialty, primaryLocation, experience,
 *                  registrationNumber, medicalCouncil
 * Bonus: profileImage
 */
function checkSection1(data: Record<string, any>): { done: boolean; hasPhoto: boolean } {
  const requiredFields = [
    'fullName',
    'specialty',
    'primaryLocation',
    'experience',
    'registrationNumber',
    'medicalCouncil',
  ];
  const done = requiredFields.every((f) => isNonEmpty(data[f]));
  const hasPhoto = isNonEmpty(data.profileImage);
  return { done, hasPhoto };
}

/**
 * Section 2 – Credentials & Trust Markers
 * Required field: mbbsYear
 * Optional but counted: qualifications, specialisationYear, fellowships
 */
function checkSection2(data: Record<string, any>): boolean {
  // At least mbbsYear is required
  return isNonEmpty(data.mbbsYear);
}

/**
 * Section 3 – Clinical Focus & Expertise
 * Required: at least one of commonConditions or knownForConditions
 */
function checkSection3(data: Record<string, any>): boolean {
  return isNonEmpty(data.commonConditions) || isNonEmpty(data.knownForConditions);
}

/**
 * Section 4 – The Human Side
 * Considered done if at least one field is filled
 */
function checkSection4(data: Record<string, any>): boolean {
  const fields = [
    'trainingExperience',
    'motivation',
    'unwinding',
    'recognition',
    'qualityTime',
    'proudAchievement',
    'personalAchievement',
    'professionalAspiration',
    'personalAspiration',
  ];
  return fields.some((f) => isNonEmpty(data[f]));
}

/**
 * Section 5 – Patient Value & Choice Factors
 * Considered done if at least one field is filled
 */
function checkSection5(data: Record<string, any>): boolean {
  return (
    isNonEmpty(data.patientValue) ||
    isNonEmpty(data.careApproach) ||
    isNonEmpty(data.practicePhilosophy)
  );
}

/**
 * Section 6 – Content Seed
 * Considered done if conditionName is filled
 */
function checkSection6(data: Record<string, any>): boolean {
  const cs = data.contentSeed;
  if (!cs) return false;
  return isNonEmpty(cs.conditionName);
}

// ---------------------------------------------------------------------------
// Also support "flattened" API data (from adminService Doctor/DoctorDetails)
// ---------------------------------------------------------------------------

function isNonEmptyApi(v: any): boolean {
  if (!v) return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'string') return v.trim().length > 0;
  if (typeof v === 'number') return !Number.isNaN(v);
  return false;
}

/**
 * Calculate progress using flattened API/Doctor profile data.
 * Field names follow the backend snake_case convention.
 */
function checkSection1Api(data: Record<string, any>): { done: boolean; hasPhoto: boolean } {
  const requiredFields = [
    'full_name',
    'specialty',        // or primary_specialization
    'primary_practice_location',
    'years_of_clinical_experience', // or years_of_experience
    'medical_registration_number',
    'medical_council',
  ];
  const done = requiredFields.every(
    (f) => isNonEmptyApi(data[f]) || (f === 'specialty' && isNonEmptyApi(data.primary_specialization)),
  );
  const hasPhoto = isNonEmptyApi(data.profile_photo);
  return { done, hasPhoto };
}

function checkSection2Api(data: Record<string, any>): boolean {
  return isNonEmptyApi(data.year_of_mbbs);
}

function checkSection3Api(data: Record<string, any>): boolean {
  return isNonEmptyApi(data.conditions_commonly_treated) || isNonEmptyApi(data.conditions_known_for);
}

function checkSection4Api(data: Record<string, any>): boolean {
  const fields = [
    'training_experience',
    'motivation_in_practice',
    'unwinding_after_work',
    'recognition_identity',
    'quality_time_interests',
    'professional_achievement',
    'personal_achievement',
    'professional_aspiration',
    'personal_aspiration',
  ];
  return fields.some((f) => isNonEmptyApi(data[f]));
}

function checkSection5Api(data: Record<string, any>): boolean {
  return (
    isNonEmptyApi(data.what_patients_value_most) ||
    isNonEmptyApi(data.approach_to_care) ||
    isNonEmptyApi(data.availability_philosophy)
  );
}

function checkSection6Api(data: Record<string, any>): boolean {
  if (!data.content_seeds) return false;
  if (Array.isArray(data.content_seeds)) return data.content_seeds.length > 0;
  return false;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Calculate profile progress from *frontend* onboarding form data.
 * (keys in camelCase, e.g. formData from Onboarding.tsx)
 */
export function calculateProfileProgress(formData: Record<string, any>): ProfileProgress {
  const { done: s1done, hasPhoto } = checkSection1(formData);
  const s1Weight = hasPhoto ? 20 : 15;
  const s1Earned = s1done ? s1Weight : 0;

  const s2done = checkSection2(formData);
  const s3done = checkSection3(formData);
  const s4done = checkSection4(formData);
  const s5done = checkSection5(formData);
  const s6done = checkSection6(formData);

  const sections: SectionProgress[] = [
    { section: 1, label: 'Professional Identity', weight: hasPhoto ? 20 : 15, earned: s1Earned, isComplete: s1done },
    { section: 2, label: 'Credentials & Trust Markers', weight: 20, earned: s2done ? 20 : 0, isComplete: s2done },
    { section: 3, label: 'Clinical Focus & Expertise', weight: 20, earned: s3done ? 20 : 0, isComplete: s3done },
    { section: 4, label: 'The Human Side', weight: 15, earned: s4done ? 15 : 0, isComplete: s4done },
    { section: 5, label: 'Patient Value & Choice Factors', weight: 15, earned: s5done ? 15 : 0, isComplete: s5done },
    { section: 6, label: 'Content Seed', weight: 10, earned: s6done ? 10 : 0, isComplete: s6done },
  ];

  const totalPercentage = sections.reduce((sum, s) => sum + s.earned, 0);

  return { totalPercentage, sections, hasProfilePicture: hasPhoto };
}

/**
 * Calculate progress from *backend* API data (snake_case keys).
 * Accepts DoctorDetails or Doctor-like objects.
 */
export function calculateProfileProgressFromApi(data: Record<string, any>): ProfileProgress {
  const { done: s1done, hasPhoto } = checkSection1Api(data);
  const s1Weight = hasPhoto ? 20 : 15;
  const s1Earned = s1done ? s1Weight : 0;

  const s2done = checkSection2Api(data);
  const s3done = checkSection3Api(data);
  const s4done = checkSection4Api(data);
  const s5done = checkSection5Api(data);
  const s6done = checkSection6Api(data);

  const sections: SectionProgress[] = [
    { section: 1, label: 'Professional Identity', weight: hasPhoto ? 20 : 15, earned: s1Earned, isComplete: s1done },
    { section: 2, label: 'Credentials & Trust Markers', weight: 20, earned: s2done ? 20 : 0, isComplete: s2done },
    { section: 3, label: 'Clinical Focus & Expertise', weight: 20, earned: s3done ? 20 : 0, isComplete: s3done },
    { section: 4, label: 'The Human Side', weight: 15, earned: s4done ? 15 : 0, isComplete: s4done },
    { section: 5, label: 'Patient Value & Choice Factors', weight: 15, earned: s5done ? 15 : 0, isComplete: s5done },
    { section: 6, label: 'Content Seed', weight: 10, earned: s6done ? 10 : 0, isComplete: s6done },
  ];

  const totalPercentage = sections.reduce((sum, s) => sum + s.earned, 0);

  return { totalPercentage, sections, hasProfilePicture: hasPhoto };
}

/**
 * Get the cumulative progress percentage *up to and including* a given section.
 * Useful for displaying "strength so far" on the onboarding stepper.
 */
export function getCumulativeProgressUpToSection(
  formData: Record<string, any>,
  upToSection: number,
): number {
  const progress = calculateProfileProgress(formData);
  return progress.sections
    .filter((s) => s.section <= upToSection)
    .reduce((sum, s) => sum + s.earned, 0);
}

/**
 * Get the *section-level* earned percentage (just that section, not cumulative).
 */
export function getSectionProgress(
  formData: Record<string, any>,
  section: number,
): SectionProgress | undefined {
  return calculateProfileProgress(formData).sections.find((s) => s.section === section);
}

/**
 * Convenience: just return total percentage for a form data object.
 */
export function getTotalProfilePercentage(formData: Record<string, any>): number {
  return calculateProfileProgress(formData).totalPercentage;
}
