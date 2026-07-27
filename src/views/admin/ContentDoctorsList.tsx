'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    ChevronRight,
    Loader2,
    Mail,
    PenLine,
    Phone,
    Search,
    Stethoscope,
    Users,
} from 'lucide-react';
import { adminService, type Doctor } from '../../services/adminService';
import styles from './AdminDashboard.module.css';

function collectSearchableText(value: unknown): string[] {
    if (value == null) return [];
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return [String(value)];
    }
    if (Array.isArray(value)) {
        return value.flatMap(collectSearchableText);
    }
    if (typeof value === 'object') {
        return Object.values(value as Record<string, unknown>).flatMap(collectSearchableText);
    }
    return [];
}

function doctorMatchesQuery(doctor: Doctor, query: string): boolean {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const haystack = collectSearchableText(doctor).join(' ').toLowerCase();
    return haystack.includes(q);
}

function doctorDisplayName(doctor: Doctor): string {
    return (
        doctor.full_name ||
        [doctor.first_name, doctor.last_name].filter(Boolean).join(' ') ||
        `Doctor #${doctor.id}`
    );
}

function doctorInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ContentDoctorsList() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadDoctors = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await adminService.fetchAllVerifiedDoctors();
            setDoctors(result);
        } catch (err) {
            console.error(err);
            setError('Failed to load verified doctors.');
            setDoctors([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDoctors();
    }, [loadDoctors]);

    const filtered = useMemo(
        () => doctors.filter((d) => doctorMatchesQuery(d, search)),
        [doctors, search],
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Content Management</h1>
                <p className={styles.subtitle}>
                    Manage blogs for verified doctors in Blog Studio.
                </p>
            </div>

            <div className={styles.controls} style={{ marginBottom: '1.5rem' }}>
                <div className={styles.searchBar} style={{ flex: 1, maxWidth: '100%' }}>
                    <Search size={18} color="#9CA3AF" />
                    <input
                        type="search"
                        placeholder="Search doctors by name, email, phone, specialty, location, ID, or any profile field…"
                        className={styles.searchInput}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Search verified doctors"
                    />
                </div>
            </div>

            {!isLoading && !error && doctors.length > 0 && (
                <p style={{ fontSize: '0.8125rem', color: '#6B7280', marginBottom: '1rem' }}>
                    {search.trim()
                        ? `Showing ${filtered.length} of ${doctors.length} verified doctors`
                        : `${doctors.length} verified doctor${doctors.length === 1 ? '' : 's'}`}
                </p>
            )}

            {isLoading ? (
                <div
                    style={{
                        padding: '3rem',
                        textAlign: 'center',
                        color: '#6B7280',
                        background: 'white',
                        borderRadius: '0.75rem',
                        border: '1px solid #E5E7EB',
                    }}
                >
                    <Loader2
                        size={28}
                        style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.75rem' }}
                    />
                    Loading verified doctors…
                </div>
            ) : error ? (
                <div
                    style={{
                        padding: '2rem',
                        textAlign: 'center',
                        color: '#DC2626',
                        background: 'white',
                        borderRadius: '0.75rem',
                        border: '1px solid #E5E7EB',
                    }}
                >
                    {error}
                </div>
            ) : filtered.length === 0 ? (
                <div
                    style={{
                        padding: '2.5rem',
                        textAlign: 'center',
                        color: '#6B7280',
                        background: 'white',
                        borderRadius: '0.75rem',
                        border: '1px solid #E5E7EB',
                    }}
                >
                    <Users size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.45 }} />
                    {search.trim()
                        ? 'No verified doctors match your search.'
                        : 'No verified doctors yet.'}
                </div>
            ) : (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '1rem',
                    }}
                >
                    {filtered.map((doctor) => {
                        const displayName = doctorDisplayName(doctor);
                        const specialty =
                            doctor.specialty ||
                            doctor.primary_specialization ||
                            doctor.primary_practice_location ||
                            'Specialty not listed';
                        const phone = doctor.phone || doctor.phone_number;
                        const email = doctor.email;

                        return (
                            <article
                                key={doctor.id}
                                style={{
                                    background: 'white',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '0.75rem',
                                    padding: '1.25rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1rem',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                    transition: 'box-shadow 0.2s, border-color 0.2s',
                                }}
                            >
                                <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                                    <div
                                        style={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: '0.625rem',
                                            background: 'linear-gradient(135deg, #E0E7FF 0%, #EDE9FE 100%)',
                                            color: '#4338CA',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 700,
                                            fontSize: '0.875rem',
                                            flexShrink: 0,
                                        }}
                                    >
                                        {doctorInitials(displayName)}
                                    </div>
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <h2
                                            style={{
                                                margin: 0,
                                                fontSize: '1rem',
                                                fontWeight: 600,
                                                color: '#111827',
                                                lineHeight: 1.3,
                                            }}
                                        >
                                            {displayName}
                                        </h2>
                                        <p
                                            style={{
                                                margin: '0.25rem 0 0',
                                                fontSize: '0.75rem',
                                                color: '#9CA3AF',
                                            }}
                                        >
                                            ID {doctor.id}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem', color: '#4B5563' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Stethoscope size={14} color="#6B7280" />
                                        {specialty}
                                    </span>
                                    {phone ? (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Phone size={14} color="#6B7280" />
                                            {phone}
                                        </span>
                                    ) : null}
                                    {email ? (
                                        <span
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                wordBreak: 'break-all',
                                            }}
                                        >
                                            <Mail size={14} color="#6B7280" style={{ flexShrink: 0 }} />
                                            {email}
                                        </span>
                                    ) : null}
                                </div>

                                <Link
                                    href={`/admin/dashboard/content/${doctor.id}`}
                                    style={{
                                        marginTop: 'auto',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.375rem',
                                        padding: '0.625rem 1rem',
                                        borderRadius: '0.5rem',
                                        background: '#4F46E5',
                                        color: 'white',
                                        fontWeight: 500,
                                        fontSize: '0.875rem',
                                        textDecoration: 'none',
                                    }}
                                >
                                    <PenLine size={16} />
                                    Open Blog Studio
                                    <ChevronRight size={16} />
                                </Link>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
