import { describe, it, expect } from 'vitest';
import { applyAuthoritativeLoginIdentity } from './onboardingIdentity';

describe('applyAuthoritativeLoginIdentity', () => {
    it('overrides resume phone with login phone for OTP users', () => {
        const formData: Record<string, unknown> = {
            phone: '+919876543210',
            email: 'resume@example.com',
        };

        applyAuthoritativeLoginIdentity(formData, {
            loginPhone: '+919234192341',
        });

        expect(formData.phone).toBe('+919234192341');
        expect(formData.email).toBe('resume@example.com');
    });

    it('overrides resume email with login email for Google users', () => {
        const formData: Record<string, unknown> = {
            phone: '+919876543210',
            email: 'other@cv.com',
        };

        applyAuthoritativeLoginIdentity(formData, {
            loginEmail: 'user@gmail.com',
        });

        expect(formData.email).toBe('user@gmail.com');
        expect(formData.phone).toBe('+919876543210');
    });

    it('leaves resume contact fields when no login identity is provided', () => {
        const formData: Record<string, unknown> = {
            phone: '+919876543210',
            email: 'resume@example.com',
        };

        applyAuthoritativeLoginIdentity(formData, {
            loginPhone: null,
            loginEmail: null,
        });

        expect(formData.phone).toBe('+919876543210');
        expect(formData.email).toBe('resume@example.com');
    });

    it('normalizes login phone before applying', () => {
        const formData: Record<string, unknown> = {
            phone: '+919876543210',
        };

        applyAuthoritativeLoginIdentity(formData, {
            loginPhone: '9234192341',
        });

        expect(formData.phone).toBe('+919234192341');
    });
});
