import api from '../lib/api';

export interface AdminUserResponse {
    id: number;
    phone: string;
    email: string | null;
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
    role: 'admin' | 'operation';
    is_active: boolean;
    doctor_id: number | null;
}

export interface UpdateUserPayload {
    email?: string | null;
    role?: 'admin' | 'operation' | null;
    is_active?: boolean | null;
    doctor_id?: number | null;
}

// Static Dummy Data for Admin Console
const STATIC_USERS: AdminUserResponse[] = [
    {
        id: 9991,
        phone: '+919800000001',
        email: 'admin.demo@caepy.com',
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
        role: 'operation',
        is_active: false,
        doctor_id: 101,
        created_at: '2026-01-10T09:00:00Z',
        updated_at: null,
        last_login_at: null
    }
];

const STATIC_DOCTORS: Doctor[] = [
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
        qualifications: 'MBBS, MD (Cardiology), DM',
        experience_years: 12,
        consultation_fee: '₹1,500',
        languages: 'English, Hindi, Marathi',
        bio: 'Experienced cardiologist specializing in interventional procedures and preventive cardiology. Previously at Kokilaben Hospital.',
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
        qualifications: 'MBBS, MD (Dermatology)',
        experience_years: 6,
        consultation_fee: '₹800',
        languages: 'English, Kannada, Telugu',
        bio: 'Dermatologist with focus on cosmetic procedures and skin cancer screening.',
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
        qualifications: 'MBBS, DCH, DNB (Pediatrics)',
        experience_years: 8,
        consultation_fee: '₹1,000',
        languages: 'English, Hindi, Tamil',
        bio: 'Pediatrician specializing in neonatal care and childhood development disorders.',
    }
];

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

    verifyDoctor: async (doctorId: number) => {
        const response = await api.post(`/onboarding/verify/${doctorId}`);
        return response.data;
    },

    rejectDoctor: async (doctorId: number, reason?: string) => {
        const response = await api.post(`/onboarding/reject/${doctorId}`, { reason });
        return response.data;
    }
};

export interface Doctor {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string | null;
    email: string;
    phone: string | null;
    specialty: string | null;
    primary_practice_location: string | null;
    onboarding_status: string;
    role: string;
    created_at: string;
    updated_at: string | null;
    medical_registration_number?: string | null;
    qualifications?: string | null;
    experience_years?: number | null;
    consultation_fee?: string | null;
    languages?: string | null;
    bio?: string | null;
}
