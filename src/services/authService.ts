import api from '../lib/api';

export interface OTPRequestResponse {
    success: boolean;
    message: string;
    mobile_number: string;
    expires_in_seconds: number;
}

export interface OTPVerifyResponse {
    success: boolean;
    message: string;
    doctor_id: number | null;
    is_new_user: boolean;
    mobile_number: string;
    role: string;
    access_token: string;
    token_type: string;
    expires_in: number;
}

export const authService = {
    requestOTP: async (mobileNumber: string): Promise<OTPRequestResponse> => {
        const response = await api.post<OTPRequestResponse>('/auth/otp/request', {
            mobile_number: mobileNumber,
        });
        return response.data;
    },

    verifyOTP: async (mobileNumber: string, otp: string): Promise<OTPVerifyResponse> => {
        const response = await api.post<OTPVerifyResponse>('/auth/otp/verify', {
            mobile_number: mobileNumber,
            otp,
        });

        if (response.data.success && response.data.access_token) {
            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('token_type', response.data.token_type || 'Bearer');
            localStorage.setItem('expires_in', String(response.data.expires_in));
            if (response.data.doctor_id != null) {
                localStorage.setItem('doctor_id', String(response.data.doctor_id));
            }
            localStorage.setItem('mobile_number', response.data.mobile_number);
            localStorage.setItem('is_new_user', String(response.data.is_new_user));
            localStorage.setItem('role', response.data.role || 'user');
        }

        return response.data;
    },

    verifyAdminOTP: async (mobileNumber: string, otp: string): Promise<OTPVerifyResponse> => {
        const response = await api.post<OTPVerifyResponse>('/auth/admin/otp/verify', {
            mobile_number: mobileNumber,
            otp,
        });

        if (response.data.success && response.data.access_token) {
            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('token_type', response.data.token_type || 'Bearer');
            localStorage.setItem('expires_in', String(response.data.expires_in));
            // Admin might not have a doctor_id, but if they do, store it. The endpoint returns null for doctor_id typically.
            if (response.data.doctor_id != null) {
                localStorage.setItem('doctor_id', String(response.data.doctor_id));
            }
            localStorage.setItem('mobile_number', response.data.mobile_number);
            localStorage.setItem('is_new_user', String(response.data.is_new_user));
            localStorage.setItem('role', response.data.role || 'admin');
        }

        return response.data;
    },

    resendOTP: async (mobileNumber: string): Promise<OTPRequestResponse> => {
        const response = await api.post<OTPRequestResponse>('/auth/otp/resend', {
            mobile_number: mobileNumber,
        });
        return response.data;
    },

    googleLogin: async (idToken: string): Promise<OTPVerifyResponse> => {
        const response = await api.post<OTPVerifyResponse>('/auth/google/verify', {
            id_token: idToken,
        });

        if (response.data.success && response.data.access_token) {
            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('token_type', response.data.token_type || 'Bearer');
            localStorage.setItem('expires_in', String(response.data.expires_in));
            if (response.data.doctor_id != null) {
                localStorage.setItem('doctor_id', String(response.data.doctor_id));
            }
            if (response.data.mobile_number) {
                localStorage.setItem('mobile_number', response.data.mobile_number);
            }
            localStorage.setItem('is_new_user', String(response.data.is_new_user));
            localStorage.setItem('role', response.data.role || 'user');
        }

        return response.data;
    },

    clearSession: () => {
        // Explicitly remove sensitive or state-bearing keys
        localStorage.removeItem('access_token');
        localStorage.removeItem('token_type');
        localStorage.removeItem('expires_in');
        localStorage.removeItem('doctor_id');
        localStorage.removeItem('mobile_number');
        localStorage.removeItem('is_new_user');
        localStorage.removeItem('role');
        localStorage.removeItem('caepy_current_user_id');

        // Optional: clear anything else except keys we want to persist
        const keysToKeep = ['caepy_doctor_profiles'];
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && !keysToKeep.includes(key)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
    },
};
