import { describe, it, expect } from 'vitest';
import { doctorService, type ResumeExtractedData } from './doctorService';

const currentYear = new Date().getFullYear();

function fullPayload(): ResumeExtractedData {
    return {
        personal_details: {
            title: 'Dr.',
            first_name: 'Asha',
            last_name: 'Rao',
            email: 'asha.rao@example.com',
            phone: '9876543210',
        },
        professional_information: {
            primary_specialization: 'Cardiology',
            years_of_experience: 12,
            conditions_treated: ['Hypertension'],
            languages: ['English', 'Hindi'],
        },
        registration: {
            medical_registration_number: 'REG-998',
            medical_council: 'Maharashtra Medical Council',
            registration_year: 2011,
            registration_authority: 'MMC',
        },
        qualifications: [
            { degree: 'MBBS', institution: 'AIIMS', year: 2008 },
            { degree: 'MD Cardiology', institution: 'PGI', year: 2012 },
        ],
        achievements: {
            awards_recognition: ['Best Resident 2010'],
            memberships: ['Indian Medical Association'],
            fellowships: ['FRCS'],
        },
        media: {
            verbal_intro_file: null,
            professional_documents: [],
            achievement_images: [],
            external_links: [],
        },
        practice_locations: [
            {
                hospital_name: 'City Hospital',
                address: '12 MG Road',
                city: 'Mumbai',
                state: 'Maharashtra',
                phone_number: '+912212345678',
                consultation_fee: 500,
                consultation_type: 'In-person',
                weekly_schedule: 'Mon-Fri 10-1',
            },
        ],
    };
}

describe('mapExtractedDataToFormData', () => {
    it('prefills all Section 1 fields', () => {
        const form = doctorService.mapExtractedDataToFormData(fullPayload());

        expect(form.fullName).toBe('Dr. Asha Rao');
        expect(form.email).toBe('asha.rao@example.com');
        expect(form.phone).toBe('+919876543210');
        expect(form.specialty).toBe('Cardiology');
        expect(form.languages).toEqual(['English', 'Hindi']);
        expect(form.registrationNumber).toBe('REG-998');
        expect(form.medicalCouncil).toBe('Maharashtra Medical Council');
        expect(form.primaryLocation).toBe('12 MG Road');
        expect(form.practiceLocations).toEqual([
            {
                name: 'City Hospital',
                address: '12 MG Road',
                schedule: 'Mon-Fri 10-1',
                city: 'Mumbai',
                state: 'Maharashtra',
                phone_number: '+912212345678',
            },
        ]);
    });

    it('prefills all Section 2 fields', () => {
        const form = doctorService.mapExtractedDataToFormData(fullPayload());

        expect(form.qualifications).toBe('MBBS, MD Cardiology');
        expect(form.mbbsYear).toBe('2008');
        expect(form.specialisationYear).toBe('2012');
        expect(form.experience).toBe('12');
        expect(form.postSpecialisationExperience).toBe(String(currentYear - 2012));
        expect(form.fellowships).toEqual(['FRCS']);
        expect(form.awards).toBe('Best Resident 2010');
        expect(form.memberships).toBe('Indian Medical Association');
    });

    it('does NOT prefill any Section 3+ fields', () => {
        const form = doctorService.mapExtractedDataToFormData(fullPayload());

        const section3PlusKeys = [
            'areasOfInterest',
            'practiceSegments',
            'commonConditions',
            'knownForConditions',
            'wantToTreatConditions',
            'trainingExperience',
            'motivation',
            'unwinding',
            'recognition',
            'qualityTime',
            'proudAchievement',
            'personalAchievement',
            'professionalAspiration',
            'personalAspiration',
            'patientValue',
            'careApproach',
            'practicePhilosophy',
            'contentSeed',
        ];

        for (const key of section3PlusKeys) {
            expect(form[key]).toBeUndefined();
        }
    });

    it('derives experience from MBBS year when years_of_experience is missing', () => {
        const payload = fullPayload();
        payload.professional_information.years_of_experience = null;

        const form = doctorService.mapExtractedDataToFormData(payload);

        expect(form.experience).toBe(String(currentYear - 2008));
    });

    it('assembles fullName without a title', () => {
        const payload = fullPayload();
        payload.personal_details.title = null;

        const form = doctorService.mapExtractedDataToFormData(payload);

        expect(form.fullName).toBe('Asha Rao');
    });

    it('omits empty optional fields', () => {
        const form = doctorService.mapExtractedDataToFormData({
            personal_details: { title: null, first_name: null, last_name: null, email: null, phone: null },
            professional_information: {
                primary_specialization: null,
                years_of_experience: null,
                conditions_treated: [],
                languages: [],
            },
            registration: {
                medical_registration_number: null,
                medical_council: null,
                registration_year: null,
                registration_authority: null,
            },
            qualifications: [],
            achievements: { awards_recognition: [], memberships: [], fellowships: [] },
            media: { verbal_intro_file: null, professional_documents: [], achievement_images: [], external_links: [] },
            practice_locations: [],
        });

        expect(form.fullName).toBeUndefined();
        expect(form.specialty).toBeUndefined();
        expect(form.qualifications).toBeUndefined();
        expect(form.practiceLocations).toBeUndefined();
        expect(form.fellowships).toBeUndefined();
    });
});
