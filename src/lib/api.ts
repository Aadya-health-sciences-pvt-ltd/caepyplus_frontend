import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        const tokenType = localStorage.getItem('token_type') || 'Bearer';
        if (token) {
            config.headers.Authorization = `${tokenType} ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor — auto-logout on 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear all auth data
            localStorage.removeItem('access_token');
            localStorage.removeItem('token_type');
            localStorage.removeItem('expires_in');
            localStorage.removeItem('doctor_id');
            localStorage.removeItem('mobile_number');
            localStorage.removeItem('is_new_user');
            localStorage.removeItem('role');
            localStorage.removeItem('doctor_profile');

            // Redirect to login (use window.location since this is outside React Router)
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
