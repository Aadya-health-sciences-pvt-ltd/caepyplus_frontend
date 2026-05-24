import api, { parseResponse } from '../lib/api';

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
    /** Present for Google / email-first login */
    email?: string | null;
    role: string;
    full_name?: string | null;
    access_token: string;
    token_type: string;
    expires_in: number;
}

export const authService = {
    requestOTP: async (mobileNumber: string, deliveryMethod: 'whatsapp' | 'sms' = 'whatsapp'): Promise<OTPRequestResponse> => {
        const response = await api.post('/auth/otp/request', {
            mobile_number: mobileNumber,
            delivery_method: deliveryMethod,
        });
        return parseResponse<OTPRequestResponse>(response);
    },

    verifyOTP: async (mobileNumber: string, otp: string): Promise<OTPVerifyResponse> => {
        const response = await api.post('/auth/otp/verify', {
            mobile_number: mobileNumber,
            otp,
        });
        const result = parseResponse<OTPVerifyResponse>(response);

        if (result.success && result.access_token) {
            localStorage.setItem('access_token', result.access_token);
            localStorage.setItem('token_type', result.token_type || 'Bearer');
            localStorage.setItem('expires_in', String(result.expires_in));
            if (result.doctor_id != null) {
                localStorage.setItem('doctor_id', String(result.doctor_id));
            }
            if (result.mobile_number) {
                localStorage.setItem('mobile_number', result.mobile_number);
            } else {
                localStorage.removeItem('mobile_number');
            }
            if (result.email) {
                localStorage.setItem('user_email', result.email);
            } else {
                localStorage.removeItem('user_email');
            }
            localStorage.setItem('is_new_user', String(result.is_new_user));
            localStorage.setItem('role', result.role || 'user');
        }

        return result;
    },

    verifyAdminOTP: async (mobileNumber: string, otp: string): Promise<OTPVerifyResponse> => {
        const response = await api.post('/auth/admin/otp/verify', {
            mobile_number: mobileNumber,
            otp,
        });
        const result = parseResponse<OTPVerifyResponse>(response);

        if (result.success && result.access_token) {
            localStorage.setItem('access_token', result.access_token);
            localStorage.setItem('token_type', result.token_type || 'Bearer');
            localStorage.setItem('expires_in', String(result.expires_in));
            if (result.doctor_id != null) {
                localStorage.setItem('doctor_id', String(result.doctor_id));
            }
            localStorage.setItem('mobile_number', result.mobile_number);
            localStorage.setItem('is_new_user', String(result.is_new_user));
            localStorage.setItem('role', result.role || 'admin');
            if (result.full_name != null && result.full_name !== '') {
                localStorage.setItem('caepy_admin_full_name', result.full_name);
            }
        }

        return result;
    },

    resendOTP: async (mobileNumber: string, deliveryMethod: 'whatsapp' | 'sms' = 'whatsapp'): Promise<OTPRequestResponse> => {
        const response = await api.post('/auth/otp/resend', {
            mobile_number: mobileNumber,
            delivery_method: deliveryMethod,
        });
        return parseResponse<OTPRequestResponse>(response);
    },

    googleLogin: async (idToken: string): Promise<OTPVerifyResponse> => {
        const response = await api.post('/auth/google/verify', {
            id_token: idToken,
        });
        const result = parseResponse<
            OTPVerifyResponse & { message?: string; error_code?: string }
        >(response);

        if (result == null || typeof result !== 'object') {
            throw new Error('Invalid response from Google sign-in.');
        }

        if (result.success !== true) {
            const msg =
                result.message ||
                'Google sign-in was not successful. Check that the API is configured for Firebase.';
            const err = new Error(msg) as Error & { error_code?: string };
            if (result.error_code) err.error_code = result.error_code;
            throw err;
        }

        if (result.access_token) {
            localStorage.setItem('access_token', result.access_token);
            localStorage.setItem('token_type', result.token_type || 'Bearer');
            localStorage.setItem('expires_in', String(result.expires_in));
            if (result.doctor_id != null) {
                localStorage.setItem('doctor_id', String(result.doctor_id));
            }
            if (result.mobile_number) {
                localStorage.setItem('mobile_number', result.mobile_number);
            } else {
                localStorage.removeItem('mobile_number');
            }
            if (result.email) {
                localStorage.setItem('user_email', result.email);
            } else {
                localStorage.removeItem('user_email');
            }
            localStorage.setItem('is_new_user', String(result.is_new_user));
            localStorage.setItem('role', result.role || 'user');
        }

        return result;
    },

    /**
     * Clears auth/session keys only (tokens, doctor id, profile cache).
     * Does not wipe unrelated localStorage (tour flags, master data, etc.),
     * so starting a new OTP flow does not erase the rest of the client state.
     */
    clearSession: () => {
        const keysToRemove = [
            'access_token',
            'token_type',
            'expires_in',
            'doctor_id',
            'mobile_number',
            'user_email',
            'is_new_user',
            'role',
            'doctor_profile',
            'caepy_current_user_id',
            'caepy_admin_full_name',
        ];
        keysToRemove.forEach((key) => localStorage.removeItem(key));
    },
};
