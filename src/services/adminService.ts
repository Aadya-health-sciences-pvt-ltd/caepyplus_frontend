import api, { parseResponse, parseResponseField } from '../lib/api';

export interface AdminUserResponse {
    id: number;
    phone: string;
    email: string | null;
    full_name?: string | null;
    role: 'admin' | 'operation';
    is_active: boolean;
    doctor_id: number | null;
    created_at: string;
    updated_at: string | null;
    last_login_at: string | null;
}

export interface UserListResponse {
    success: boolean;
    users: AdminUserResponse[];
    total: number;
    skip: number;
    limit: number;
}

export interface CreateUserPayload {
    phone: string;
    email: string | null;
    full_name?: string | null;
    role: 'admin' | 'operation';
    is_active: boolean;
    doctor_id: number | null;
}

export interface UpdateUserPayload {
    email?: string | null;
    full_name?: string | null;
    role?: 'admin' | 'operation' | null;
    is_active?: boolean | null;
    doctor_id?: number | null;
}

// ---------------------------------------------------------------------------
// Doctor interfaces (matching backend DoctorResponse + DoctorWithFullInfoResponse)
// ---------------------------------------------------------------------------

export interface PracticeLocation {
    hospital_name?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    phone_number?: string | null;
    consultation_fee?: number | null;
    consultation_type?: string | null;
    weekly_schedule?: string | null;
}

/** Matches the backend DoctorResponse / doctors table. */
export interface Doctor {
    id: number;
    title?: string | null;
    gender?: string | null;
    first_name: string;
    last_name: string;
    full_name: string | null;
    email: string;
    phone: string | null;
    phone_number?: string | null; // alias used by some endpoints

    // Block 1: Professional Identity
    specialty: string | null;
    primary_practice_location: string | null;
    primary_specialization?: string | null;
    centres_of_practice?: string[];
    years_of_clinical_experience?: number | null;
    years_post_specialisation?: number | null;

    // Block 2: Credentials & Trust Markers
    year_of_mbbs?: number | null;
    year_of_specialisation?: number | null;
    fellowships?: string[];
    qualifications?: string[];
    professional_memberships?: string[];
    awards_academic_honours?: string[];

    // Block 3: Clinical Focus & Expertise
    areas_of_clinical_interest?: string[];
    practice_segments?: string | null;
    conditions_commonly_treated?: string[];
    conditions_known_for?: string[];
    conditions_want_to_treat_more?: string[];

    // Block 4: The Human Side
    training_experience?: string[];
    motivation_in_practice?: string[];
    unwinding_after_work?: string[];
    recognition_identity?: string[];
    quality_time_interests?: string[];
    quality_time_interests_text?: string | null;
    professional_achievement?: string | null;
    personal_achievement?: string | null;
    professional_aspiration?: string | null;
    personal_aspiration?: string | null;

    // Block 5: Patient Value & Choice Factors
    what_patients_value_most?: string | null;
    approach_to_care?: string | null;
    availability_philosophy?: string | null;

    // Block 6: Content Seeds
    content_seeds?: Array<Record<string, any>>;

    // Legacy / compatibility fields
    medical_registration_number?: string | null;
    years_of_experience?: number | null;
    consultation_fee?: number | string | null;
    consultation_currency?: string | null;
    sub_specialties?: string[];
    areas_of_expertise?: string[];
    languages?: string[];
    conditions_treated?: string[];
    procedures_performed?: string[];
    age_groups_treated?: string[];
    awards_recognition?: string[];
    memberships?: string[];
    publications?: string[];
    practice_locations?: PracticeLocation[];
    external_links?: string[];
    professional_overview?: string | null;
    about_me?: string | null;
    professional_tagline?: string | null;
    profile_summary?: string | null;

    onboarding_status: string;
    onboarding_source?: string | null;
    role: string;
    created_at: string;
    updated_at: string | null;
}

/** Matches the backend DoctorIdentityResponse. */
export interface DoctorIdentity {
    id: string;
    doctor_id: number;
    title?: string | null;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    onboarding_status: string;
    status_updated_at?: string | null;
    status_updated_by?: string | null;
    rejection_reason?: string | null;
    verified_at?: string | null;
    is_active: boolean;
    registered_at: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

/** Matches the backend DoctorDetailsResponse. */
export interface DoctorDetails {
    detail_id: string;
    doctor_id: number;

    // Block 1
    full_name?: string | null;
    specialty?: string | null;
    primary_practice_location?: string | null;
    centres_of_practice?: string[] | null;
    years_of_clinical_experience?: number | null;
    years_post_specialisation?: number | null;

    // Block 2
    year_of_mbbs?: number | null;
    year_of_specialisation?: number | null;
    fellowships?: string[] | null;
    qualifications?: string[] | null;
    professional_memberships?: string[] | null;
    awards_academic_honours?: string[] | null;

    // Block 3
    areas_of_clinical_interest?: string[] | null;
    practice_segments?: string | null;
    conditions_commonly_treated?: string[] | null;
    conditions_known_for?: string[] | null;
    conditions_want_to_treat_more?: string[] | null;

    // Block 4
    training_experience?: string[] | null;
    motivation_in_practice?: string[] | null;
    unwinding_after_work?: string[] | null;
    recognition_identity?: string[] | null;
    quality_time_interests?: string[] | null;
    quality_time_interests_text?: string | null;
    professional_achievement?: string | null;
    personal_achievement?: string | null;
    professional_aspiration?: string | null;
    personal_aspiration?: string | null;

    // Block 5
    what_patients_value_most?: string | null;
    approach_to_care?: string | null;
    availability_philosophy?: string | null;

    // Block 6
    content_seeds?: Array<Record<string, any>> | null;

    // Legacy
    gender?: string | null;
    speciality?: string | null;
    sub_specialities?: string[] | null;
    areas_of_expertise?: string[] | null;
    registration_number?: string | null;
    consultation_fee?: number | null;
    years_of_experience?: number | null;
    conditions_treated?: string[] | null;
    procedures_performed?: string[] | null;
    age_groups_treated?: string[] | null;
    languages_spoken?: string[] | null;
    achievements?: Array<Record<string, any>> | null;
    publications?: Array<Record<string, any>> | null;
    practice_locations?: Array<Record<string, any>> | null;
    external_links?: Record<string, any> | null;
    professional_overview?: string | null;
    about_me?: string | null;
    professional_tagline?: string | null;
    media_urls?: Record<string, any> | null;
    profile_summary?: string | null;

    created_at: string;
    updated_at: string;
}

/** Matches the backend DoctorMediaResponse. */
export interface DoctorMedia {
    media_id: string;
    doctor_id: number;
    field_name?: string | null;
    media_type: string;
    media_category: string;
    file_uri: string;
    file_name: string;
    file_size?: number | null;
    mime_type?: string | null;
    is_primary: boolean;
    metadata?: Record<string, any> | null;
    upload_date: string;
}

/** Matches the backend DoctorStatusHistoryResponse. */
export interface DoctorStatusHistory {
    history_id: string;
    doctor_id: number;
    previous_status?: string | null;
    new_status: string;
    changed_by?: string | null;
    changed_by_email?: string | null;
    rejection_reason?: string | null;
    notes?: string | null;
    changed_at: string;
}

/** Matches the backend DoctorWithFullInfoResponse. */
export interface DoctorFullProfile {
    identity: DoctorIdentity;
    details: DoctorDetails | null;
    media: DoctorMedia[];
    status_history: DoctorStatusHistory[];
}

// ---------------------------------------------------------------------------
// Static Dummy Data for Admin Console
// ---------------------------------------------------------------------------

const STATIC_USERS: AdminUserResponse[] = [
    {
        id: 9991,
        phone: '+919800000001',
        email: 'admin.demo@caepy.com',
        full_name: 'Admin Demo',
        role: 'admin',
        is_active: true,
        doctor_id: null,
        created_at: '2026-01-01T10:00:00Z',
        updated_at: null,
        last_login_at: '2026-02-18T15:30:00Z'
    },
    {
        id: 9992,
        phone: '+919800000002',
        email: 'staff.demo@caepy.com',
        full_name: 'Staff Demo',
        role: 'operation',
        is_active: true,
        doctor_id: null,
        created_at: '2026-01-05T12:00:00Z',
        updated_at: null,
        last_login_at: '2026-02-18T14:45:00Z'
    },
    {
        id: 9993,
        phone: '+919800000003',
        email: 'dr.john.smith@demo.com',
        full_name: 'Dr. John Smith',
        role: 'operation',
        is_active: false,
        doctor_id: 101,
        created_at: '2026-01-10T09:00:00Z',
        updated_at: null,
        last_login_at: null
    }
];

// ---------------------------------------------------------------------------
// Bulk Upload API Response Types
// ---------------------------------------------------------------------------

export interface CsvRowError {
    row: number;
    field: string;
    message: string;
}

export interface CsvValidationResponse {
    valid: boolean;
    total_rows: number;
    errors: CsvRowError[];
}

export interface CsvUploadResponse {
    created: number;
    updated: number;
    skipped: number;
    errors: CsvRowError[];
}

// ---------------------------------------------------------------------------
// Admin Dropdown Management Types
// ---------------------------------------------------------------------------

export type DropdownOptionStatus = 'approved' | 'pending' | 'rejected';

export interface DropdownOption {
    id: number;
    field_name: string;
    value: string;
    label: string | null;
    display_order: number | null;
    status: DropdownOptionStatus;
    is_system: boolean;
    submitted_by: string | null;
    reviewed_by: string | null;
    review_notes: string | null;
    created_at: string;
    updated_at: string | null;
}

export interface DropdownListResponse {
    items: DropdownOption[];
    total: number;
    skip?: number;
    limit?: number;
    pending_count: number;
}

export interface DropdownField {
    field_name: string;
    description: string;
}

export interface DropdownCreateRequest {
    field_name: string;
    value: string;
    label?: string | null;
    display_order?: number | null;
}

export interface DropdownUpdateRequest {
    label?: string | null;
    display_order?: number | null;
}

export interface DropdownReviewRequest {
    review_notes?: string | null;
}

export interface DropdownBulkReviewRequest {
    option_ids: number[];
    review_notes?: string | null;
}

export interface DropdownBulkReviewResponse {
    processed: number;
    failed: number;
    errors: string[];
}


let STATIC_DOCTORS: Doctor[] = [
    {
        id: 8881,
        first_name: 'Prem',
        last_name: 'Ranjan',
        full_name: 'Dr. Prem Ranjan',
        email: 'prem.ranjan@demo.com',
        phone: '+918888811111',
        specialty: 'Cardiology',
        primary_practice_location: 'Mumbai, MH',
        onboarding_status: 'verified',
        role: 'doctor',
        created_at: '2026-01-15T08:30:00Z',
        updated_at: null,
        medical_registration_number: 'MH-2019-34521',
        qualifications: ['MBBS', 'MD (Cardiology)', 'DM'],
        years_of_experience: 12,
        consultation_fee: '₹1,500',
        languages: ['English', 'Hindi', 'Marathi'],
        about_me: 'Experienced cardiologist specializing in interventional procedures and preventive cardiology. Previously at Kokilaben Hospital.',
    },
    {
        id: 8882,
        first_name: 'Hemanth',
        last_name: 'Kumar',
        full_name: 'Dr. Hemanth Kumar',
        email: 'hemanth.kumar@demo.com',
        phone: '+918888822222',
        specialty: 'Dermatology',
        primary_practice_location: 'Bangalore, KA',
        onboarding_status: 'submitted',
        role: 'doctor',
        created_at: '2026-01-20T11:45:00Z',
        updated_at: null,
        medical_registration_number: 'KA-2021-18743',
        qualifications: ['MBBS', 'MD (Dermatology)'],
        years_of_experience: 6,
        consultation_fee: '₹800',
        languages: ['English', 'Kannada', 'Telugu'],
        about_me: 'Dermatologist with focus on cosmetic procedures and skin cancer screening.',
    },
    {
        id: 8883,
        first_name: 'Saranya',
        last_name: 'Prabhu',
        full_name: 'Dr. Saranya Prabhu',
        email: 'saranya.prabhu@demo.com',
        phone: '+918888833333',
        specialty: 'Pediatrics',
        primary_practice_location: 'Delhi NCR',
        onboarding_status: 'pending',
        role: 'doctor',
        created_at: '2026-01-25T14:20:00Z',
        updated_at: null,
        medical_registration_number: 'DL-2020-55612',
        qualifications: ['MBBS', 'DCH', 'DNB (Pediatrics)'],
        years_of_experience: 8,
        consultation_fee: '₹1,000',
        languages: ['English', 'Hindi', 'Tamil'],
        about_me: 'Pediatrician specializing in neonatal care and childhood development disorders.',
    }
];

// ---------------------------------------------------------------------------
// Admin Service
// ---------------------------------------------------------------------------

export const adminService = {
    getUsers: async (page = 1, limit = 50, role?: string | string[]): Promise<UserListResponse> => {
        const skip = (page - 1) * limit;
        const params: any = { skip, limit };
        if (role) params.role = role;

        try {
            const response = await api.get<UserListResponse>('/admin/users', {
                params,
                paramsSerializer: (params) => {
                    const searchParams = new URLSearchParams();
                    for (const key in params) {
                        const value = params[key];
                        if (Array.isArray(value)) {
                            value.forEach(v => searchParams.append(key, v));
                        } else if (value !== undefined && value !== null) {
                            searchParams.append(key, value);
                        }
                    }
                    return searchParams.toString();
                }
            });

            // Merge with static data for demonstration
            const apiUsers = response.data.users || [];
            const mergedUsers = [...apiUsers, ...STATIC_USERS];

            return {
                ...response.data,
                users: mergedUsers,
                total: (response.data.total || 0) + STATIC_USERS.length
            };
        } catch (error) {
            console.warn('API error fetching users, using static data only', error);
            return {
                success: true,
                users: STATIC_USERS,
                total: STATIC_USERS.length,
                skip: 0,
                limit
            };
        }
    },

    createUser: async (payload: CreateUserPayload) => {
        const response = await api.post('/admin/users', payload);
        return response.data;
    },

    updateUser: async (userId: number, payload: UpdateUserPayload) => {
        const response = await api.patch(`/admin/users/${userId}`, payload);
        return response.data;
    },

    // Doctor Management
    getDoctors: async (page = 1, limit = 20, specialization?: string): Promise<{ data: Doctor[]; total: number }> => {
        const params: any = { page, page_size: limit };
        if (specialization) params.specialization = specialization;

        try {
            const response = await api.get('/doctors', { params });
            const apiDoctors = response.data.data || [];

            // Merge with static data
            const mergedDoctors = [...apiDoctors, ...STATIC_DOCTORS];

            return {
                data: mergedDoctors,
                total: (response.data.pagination?.total || 0) + STATIC_DOCTORS.length
            };
        } catch (error) {
            console.warn('API error fetching doctors, using static data only', error);
            return {
                data: STATIC_DOCTORS,
                total: STATIC_DOCTORS.length
            };
        }
    },

    /** Fetch a single doctor's full profile (identity + details + media + history). */
    getDoctorFullProfile: async (doctorId: number): Promise<DoctorFullProfile> => {
        const response = await api.get<DoctorFullProfile>(`/doctors/lookup?doctor_id=${doctorId}`);
        return response.data;
    },

    verifyDoctor: async (doctorId: number) => {
        const response = await api.post(`/onboarding/verify/${doctorId}`);
        return response.data;
    },

    rejectDoctor: async (doctorId: number, reason?: string) => {
        const response = await api.post(`/onboarding/reject/${doctorId}`, { reason });
        return response.data;
    },

    /** Download the official bulk upload CSV template from the backend. */
    downloadBulkTemplate: async (): Promise<void> => {
        const response = await api.get('/doctors/bulk-upload/csv/template', {
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'doctor_bulk_upload_template.csv';
        a.click();
        URL.revokeObjectURL(url);
    },

    /** Validate a CSV file (dry-run — no DB writes). */
    validateBulkCsv: async (file: File): Promise<CsvValidationResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post<CsvValidationResponse>(
            '/doctors/bulk-upload/csv/validate',
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return response.data;
    },

    /** Confirm a previously validated CSV upload — writes records to the database. */
    confirmBulkUpload: async (file: File): Promise<CsvUploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post<CsvUploadResponse>(
            '/doctors/bulk-upload/csv',
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return response.data;
    },

    // -----------------------------------------------------------------------
    // Admin Dropdown Management
    // -----------------------------------------------------------------------

    /** Fetch all supported dropdown field names. */
    getDropdownFields: async (): Promise<DropdownField[]> => {
        const response = await api.get('/admin/dropdowns/fields');
        return parseResponseField<DropdownField[]>(response, 'fields');
    },

    /** List all dropdown options with optional filters. */
    getDropdownOptions: async (params?: {
        field_name?: string;
        status?: DropdownOptionStatus;
        search?: string;
        skip?: number;
        limit?: number;
    }): Promise<DropdownListResponse> => {
        const response = await api.get('/admin/dropdowns', { params });
        return parseResponse<DropdownListResponse>(response);
    },

    /** List pending dropdown options. */
    getPendingOptions: async (params?: {
        field_name?: string;
        skip?: number;
        limit?: number;
    }): Promise<DropdownListResponse> => {
        const response = await api.get('/admin/dropdowns/pending', { params });
        return parseResponse<DropdownListResponse>(response);
    },

    /** Create a new dropdown option (auto-approved). */
    createDropdownOption: async (payload: DropdownCreateRequest): Promise<DropdownOption> => {
        const response = await api.post('/admin/dropdowns', payload);
        return parseResponse<DropdownOption>(response);
    },

    /** Update label / display_order of an option. */
    updateDropdownOption: async (optionId: number, payload: DropdownUpdateRequest): Promise<DropdownOption> => {
        const response = await api.patch(`/admin/dropdowns/${optionId}`, payload);
        return parseResponse<DropdownOption>(response);
    },

    /** Delete a dropdown option (system rows are protected). */
    deleteDropdownOption: async (optionId: number): Promise<void> => {
        await api.delete(`/admin/dropdowns/${optionId}`);
    },

    /** Approve a pending dropdown option. */
    approveOption: async (optionId: number, payload?: DropdownReviewRequest): Promise<DropdownOption> => {
        const response = await api.post(`/admin/dropdowns/${optionId}/approve`, payload ?? {});
        return parseResponse<DropdownOption>(response);
    },

    /** Reject a pending dropdown option. */
    rejectOption: async (optionId: number, payload?: DropdownReviewRequest): Promise<DropdownOption> => {
        const response = await api.post(`/admin/dropdowns/${optionId}/reject`, payload ?? {});
        return parseResponse<DropdownOption>(response);
    },

    /** Bulk approve multiple pending options. */
    bulkApprove: async (payload: DropdownBulkReviewRequest): Promise<DropdownBulkReviewResponse> => {
        const response = await api.post('/admin/dropdowns/bulk-approve', payload);
        return parseResponse<DropdownBulkReviewResponse>(response);
    },

    /** Bulk reject multiple pending options. */
    bulkReject: async (payload: DropdownBulkReviewRequest): Promise<DropdownBulkReviewResponse> => {
        const response = await api.post('/admin/dropdowns/bulk-reject', payload);
        return parseResponse<DropdownBulkReviewResponse>(response);
    }
};
