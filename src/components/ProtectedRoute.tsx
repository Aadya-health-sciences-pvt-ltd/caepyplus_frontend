'use client';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useAppRouter } from '../lib/router';

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const router = useAppRouter();
    const [isAuthed, setIsAuthed] = useState<boolean | null>(null);

    useEffect(() => {
        const accessToken = localStorage.getItem('access_token');
        const doctorId = localStorage.getItem('doctor_id');

        if (!accessToken || !doctorId) {
            const keysToRemove = [
                'access_token', 'token_type', 'expires_in',
                'doctor_id', 'mobile_number', 'is_new_user',
                'role', 'doctor_profile', 'caepy_current_user_id',
            ];
            keysToRemove.forEach((key) => localStorage.removeItem(key));
            router.replace('/login');
            return;
        }

        setIsAuthed(true);
    }, [router]);

    if (isAuthed === null) {
        return null;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
