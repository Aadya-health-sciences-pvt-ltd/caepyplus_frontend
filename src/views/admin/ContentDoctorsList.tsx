'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Loader2, PenLine, Search, Users } from 'lucide-react';
import { adminService, type Doctor } from '../../services/adminService';
import styles from './AdminDashboard.module.css';

export default function ContentDoctorsList() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const pageSize = 20;

    const loadDoctors = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await adminService.getVerifiedDoctors(page, pageSize);
            setDoctors(result.data);
            setTotal(result.total);
        } catch (err) {
            console.error(err);
            setError('Failed to load verified doctors.');
            setDoctors([]);
            setTotal(0);
        } finally {
            setIsLoading(false);
        }
    }, [page]);

    useEffect(() => {
        loadDoctors();
    }, [loadDoctors]);

    const filtered = doctors.filter((d) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        const name = (d.full_name || `${d.first_name || ''} ${d.last_name || ''}`).toLowerCase();
        const specialty = (d.specialty || d.primary_specialization || '').toLowerCase();
        const phone = (d.phone || d.phone_number || '').toLowerCase();
        return name.includes(q) || specialty.includes(q) || phone.includes(q);
    });

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return (
        <div style={{ padding: '2rem' }}>
            <div className={styles.flexBetweenCenter} style={{ marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>Content</h1>
                    <p style={{ color: '#6B7280', marginTop: '0.25rem' }}>
                        Manage blogs for verified doctors in Blog Studio.
                    </p>
                </div>
            </div>

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1.25rem',
                    maxWidth: '420px',
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #E5E7EB',
                    borderRadius: '0.5rem',
                    background: 'white',
                }}
            >
                <Search size={18} color="#9CA3AF" />
                <input
                    type="search"
                    placeholder="Search by name, specialty, or phone…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ border: 'none', outline: 'none', flex: 1, fontSize: '0.875rem' }}
                />
            </div>

            <div style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                {isLoading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280' }}>
                        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.5rem' }} />
                        Loading verified doctors…
                    </div>
                ) : error ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#DC2626' }}>{error}</div>
                ) : filtered.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>
                        <Users size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                        No verified doctors match your search.
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                            <tr>
                                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 500, color: '#6B7280' }}>Doctor</th>
                                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 500, color: '#6B7280' }}>Specialty</th>
                                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 500, color: '#6B7280' }}>Phone</th>
                                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'right', fontWeight: 500, color: '#6B7280' }}>Blog Studio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((doctor) => {
                                const displayName =
                                    doctor.full_name ||
                                    [doctor.first_name, doctor.last_name].filter(Boolean).join(' ') ||
                                    `Doctor #${doctor.id}`;
                                const specialty = doctor.specialty || doctor.primary_specialization || '—';
                                const phone = doctor.phone || doctor.phone_number || '—';
                                return (
                                    <tr key={doctor.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                                        <td style={{ padding: '1rem 1.5rem', fontWeight: 500, color: '#111827' }}>{displayName}</td>
                                        <td style={{ padding: '1rem 1.5rem', color: '#4B5563' }}>{specialty}</td>
                                        <td style={{ padding: '1rem 1.5rem', color: '#4B5563' }}>{phone}</td>
                                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                            <Link
                                                href={`/admin/dashboard/content/${doctor.id}`}
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.375rem',
                                                    padding: '0.5rem 0.875rem',
                                                    borderRadius: '0.5rem',
                                                    background: '#4F46E5',
                                                    color: 'white',
                                                    fontWeight: 500,
                                                    fontSize: '0.8125rem',
                                                    textDecoration: 'none',
                                                }}
                                            >
                                                <PenLine size={14} />
                                                Open studio
                                                <ChevronRight size={14} />
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {totalPages > 1 && !search.trim() && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1.25rem' }}>
                    <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #E5E7EB', background: 'white' }}
                    >
                        Previous
                    </button>
                    <span style={{ alignSelf: 'center', fontSize: '0.875rem', color: '#6B7280' }}>
                        Page {page} of {totalPages}
                    </span>
                    <button
                        type="button"
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #E5E7EB', background: 'white' }}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
