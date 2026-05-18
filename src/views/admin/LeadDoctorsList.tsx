'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    Search, Users, AlertCircle, ChevronLeft, ChevronRight,
    Filter, X, MapPin, Stethoscope, Building2, ExternalLink,
    Loader2, Award, GraduationCap, RefreshCw
} from 'lucide-react';
import styles from './AdminDashboard.module.css';
import {
    adminService,
    type LeadDoctor,
    type LeadDoctorFilters,
    type LeadDoctorPagination,
} from '../../services/adminService';

// ---------------------------------------------------------------------------
// Detail Drawer — slide-out panel to view full lead doctor info
// ---------------------------------------------------------------------------

interface DetailDrawerProps {
    doctor: LeadDoctor | null;
    onClose: () => void;
}

const DetailDrawer = ({ doctor, onClose }: DetailDrawerProps) => {
    if (!doctor) return null;

    const fields: { label: string; value: string | null; icon?: React.ReactNode }[] = [
        { label: 'City', value: doctor.city, icon: <MapPin size={14} /> },
        { label: 'Location', value: doctor.location, icon: <MapPin size={14} /> },
        { label: 'Speciality', value: doctor.speciality, icon: <Stethoscope size={14} /> },
        { label: 'Specialization', value: doctor.specialization, icon: <Stethoscope size={14} /> },
        { label: 'Qualification', value: doctor.qualification, icon: <GraduationCap size={14} /> },
        { label: 'Experience', value: doctor.experience },
        { label: 'Fee', value: doctor.fee },
        { label: 'Hospital', value: doctor.hospital_name, icon: <Building2 size={14} /> },
        { label: 'Hospital Address', value: doctor.hospital_address },
        { label: 'Awards', value: doctor.awards, icon: <Award size={14} /> },
        { label: 'Memberships', value: doctor.memberships },
        { label: 'Registrations', value: doctor.registrations },
        { label: 'Services', value: doctor.services },
    ];

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    position: 'fixed', right: 0, top: 0, bottom: 0,
                    width: '480px', maxWidth: '90vw',
                    background: 'white', boxShadow: '-8px 0 30px rgba(0,0,0,0.12)',
                    overflowY: 'auto', animation: 'slideInRight 0.3s ease-out',
                    display: 'flex', flexDirection: 'column',
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '1.5rem', borderBottom: '1px solid #E5E7EB',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    background: 'linear-gradient(135deg, #293991 0%, #1ABFD2 100%)',
                    color: 'white',
                }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                            {doctor.doctor_name || 'Unknown Doctor'}
                        </h2>
                        {doctor.speciality && (
                            <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', opacity: 0.9 }}>
                                {doctor.speciality}
                            </p>
                        )}
                        {doctor.city && (
                            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <MapPin size={12} /> {doctor.city}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '0.375rem', padding: '0.375rem', cursor: 'pointer', color: 'white' }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '1.5rem', flex: 1 }}>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {fields.map(({ label, value, icon }) => (
                            value ? (
                                <div key={label}>
                                    <div style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9CA3AF', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        {icon} {label}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: '#111827', lineHeight: 1.5, wordBreak: 'break-word' }}>
                                        {value}
                                    </div>
                                </div>
                            ) : null
                        ))}
                    </div>

                    {/* Profile URL */}
                    {doctor.profile_url && (
                        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #E5E7EB' }}>
                            <a
                                href={doctor.profile_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                                    padding: '0.5rem 1rem', background: '#EFF6FF', color: '#2563EB',
                                    borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600,
                                    textDecoration: 'none', transition: 'all 0.2s',
                                }}
                            >
                                <ExternalLink size={14} /> View Source Profile
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ---------------------------------------------------------------------------
// Filter Bar Component
// ---------------------------------------------------------------------------

interface FilterBarProps {
    filters: LeadDoctorFilters;
    onChange: (filters: LeadDoctorFilters) => void;
    onClear: () => void;
    isFiltered: boolean;
}

const FilterBar = ({ filters, onChange, onClear, isFiltered }: FilterBarProps) => {
    const [expanded, setExpanded] = useState(false);

    const inputStyle: React.CSSProperties = {
        padding: '0.5rem 0.75rem',
        border: '1px solid #E5E7EB',
        borderRadius: '0.5rem',
        fontSize: '0.8125rem',
        color: '#374151',
        background: 'white',
        outline: 'none',
        width: '100%',
        transition: 'border-color 0.2s, box-shadow 0.2s',
    };

    const labelStyle: React.CSSProperties = {
        fontSize: '0.6875rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: '#6B7280',
        marginBottom: '0.25rem',
    };

    const filterFields: { key: keyof LeadDoctorFilters; label: string; placeholder: string; icon: React.ReactNode }[] = [
        { key: 'city', label: 'City', placeholder: 'e.g. Mumbai', icon: <MapPin size={14} /> },
        { key: 'speciality', label: 'Speciality', placeholder: 'e.g. Dentist', icon: <Stethoscope size={14} /> },
        { key: 'specialization', label: 'Specialization', placeholder: 'e.g. Orthodontist', icon: <Stethoscope size={14} /> },
        { key: 'doctor_name', label: 'Doctor Name', placeholder: 'Search name...', icon: <Users size={14} /> },
        { key: 'location', label: 'Location', placeholder: 'e.g. Andheri', icon: <MapPin size={14} /> },
        { key: 'hospital_name', label: 'Hospital', placeholder: 'e.g. Apollo', icon: <Building2 size={14} /> },
    ];

    const activeFilterCount = Object.values(filters).filter(v => v && v.trim()).length;

    return (
        <div style={{
            background: 'white', borderRadius: '0.75rem', border: '1px solid #E5E7EB',
            marginBottom: '1.5rem', overflow: 'hidden',
            boxShadow: expanded ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
            transition: 'box-shadow 0.3s',
        }}>
            <button
                onClick={() => setExpanded(!expanded)}
                style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.75rem 1rem', background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '0.875rem', fontWeight: 600, color: '#374151',
                }}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Filter size={16} color="#6B7280" />
                    Filters
                    {activeFilterCount > 0 && (
                        <span style={{
                            background: 'linear-gradient(135deg, #293991, #1ABFD2)',
                            color: 'white', fontSize: '0.6875rem', fontWeight: 700,
                            borderRadius: '99px', padding: '0.0625rem 0.5rem', minWidth: '1.25rem',
                            textAlign: 'center',
                        }}>
                            {activeFilterCount}
                        </span>
                    )}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                    {expanded ? '▲ Collapse' : '▼ Expand'}
                </span>
            </button>

            {expanded && (
                <div style={{ padding: '0 1rem 1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                        {filterFields.map(({ key, label, placeholder, icon }) => (
                            <div key={key}>
                                <div style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    {icon} {label}
                                </div>
                                <input
                                    type="text"
                                    placeholder={placeholder}
                                    value={filters[key] || ''}
                                    onChange={e => onChange({ ...filters, [key]: e.target.value })}
                                    style={inputStyle}
                                    onFocus={e => {
                                        e.target.style.borderColor = '#293991';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(41,57,145,0.1)';
                                    }}
                                    onBlur={e => {
                                        e.target.style.borderColor = '#E5E7EB';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                    {isFiltered && (
                        <div style={{ marginTop: '0.75rem', textAlign: 'right' }}>
                            <button
                                onClick={onClear}
                                style={{
                                    padding: '0.375rem 0.75rem', background: '#FEF2F2', color: '#DC2626',
                                    border: '1px solid #FECACA', borderRadius: '0.375rem',
                                    fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
                                    display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                                }}
                            >
                                <X size={14} /> Clear All Filters
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ---------------------------------------------------------------------------
// Lead Doctors List Page
// ---------------------------------------------------------------------------

const PAGE_SIZE = 50;

const LeadDoctorsList = () => {
    const [doctors, setDoctors] = useState<LeadDoctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<LeadDoctorPagination | null>(null);
    const [filters, setFilters] = useState<LeadDoctorFilters>({});
    const [selectedDoctor, setSelectedDoctor] = useState<LeadDoctor | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const isFiltered = Object.values(filters).some(v => v && v.trim());

    const fetchDoctors = useCallback(async (p: number, f: LeadDoctorFilters) => {
        setLoading(true);
        setError('');
        try {
            const response = await adminService.getLeadDoctors(p, PAGE_SIZE, f);
            setDoctors(response.data);
            setPagination(response.pagination);
        } catch (err: any) {
            console.error('Failed to fetch lead doctors', err);
            setError(err?.response?.data?.error?.message || err?.message || 'Failed to fetch lead doctors');
            setDoctors([]);
            setPagination(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchDoctors(page, filters);
    }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

    // Debounced filter fetch
    const handleFilterChange = useCallback((newFilters: LeadDoctorFilters) => {
        setFilters(newFilters);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setPage(1);
            fetchDoctors(1, newFilters);
        }, 500);
    }, [fetchDoctors]);

    const handleClearFilters = useCallback(() => {
        setFilters({});
        setPage(1);
        fetchDoctors(1, {});
    }, [fetchDoctors]);

    const handleRefresh = useCallback(() => {
        fetchDoctors(page, filters);
    }, [fetchDoctors, page, filters]);

    const total = pagination?.total ?? 0;
    const totalPages = pagination?.total_pages ?? 1;
    const showingFrom = total > 0 ? (page - 1) * PAGE_SIZE + 1 : 0;
    const showingTo = Math.min(page * PAGE_SIZE, total);

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 className={styles.title}>Lead Doctors</h1>
                        <p className={styles.subtitle}>
                            Browse and filter lead doctor data imported from external sources
                        </p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.5rem 1rem', background: 'white',
                            border: '1px solid #D1D5DB', borderRadius: '0.5rem',
                            color: '#374151', fontWeight: 600, cursor: 'pointer',
                            fontSize: '0.875rem', transition: 'all 0.2s',
                            opacity: loading ? 0.6 : 1,
                        }}
                    >
                        <RefreshCw size={16} className={loading ? 'spin' : ''} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className={styles.statsGrid} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #293991, #1ABFD2)' }}>
                        <Users size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <h3>{total.toLocaleString()}</h3>
                        <p>{isFiltered ? 'Matching Records' : 'Total Lead Doctors'}</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <FilterBar
                filters={filters}
                onChange={handleFilterChange}
                onClear={handleClearFilters}
                isFiltered={isFiltered}
            />

            {/* Error Banner */}
            {error && (
                <div style={{
                    padding: '0.75rem 1rem', marginBottom: '1rem', borderRadius: '0.5rem',
                    background: '#FEF2F2', border: '1px solid #FECACA',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}>
                    <AlertCircle size={16} color="#DC2626" />
                    <span style={{ fontSize: '0.875rem', color: '#991B1B' }}>{error}</span>
                </div>
            )}

            {/* Table */}
            <div className={styles.tableContainer}>
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                        <Loader2 size={32} color="#293991" className="spin" />
                        <p style={{ margin: 0, color: '#6B7280', fontSize: '0.875rem' }}>Loading lead doctors...</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th style={{ minWidth: '180px' }}>Doctor Name</th>
                                    <th style={{ minWidth: '120px' }}>City</th>
                                    <th style={{ minWidth: '140px' }}>Speciality</th>
                                    <th style={{ minWidth: '170px' }}>Hospital</th>
                                    <th style={{ minWidth: '100px' }}>Experience</th>
                                    <th style={{ minWidth: '80px' }}>Fee</th>
                                    <th style={{ minWidth: '100px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {doctors.map(doc => (
                                    <tr key={doc.id} style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                                        onClick={() => setSelectedDoctor(doc)}
                                        onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
                                        onMouseLeave={e => (e.currentTarget.style.background = '')}
                                    >
                                        <td>
                                            <div style={{ fontWeight: 500, color: '#111827' }}>
                                                {doc.doctor_name || '—'}
                                            </div>
                                            {doc.qualification && (
                                                <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.125rem' }}>
                                                    {doc.qualification.length > 50 ? doc.qualification.substring(0, 50) + '…' : doc.qualification}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            {doc.city ? (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <MapPin size={12} color="#9CA3AF" /> {doc.city}
                                                </span>
                                            ) : '—'}
                                        </td>
                                        <td>
                                            {doc.speciality ? (
                                                <span style={{
                                                    display: 'inline-block', padding: '0.125rem 0.5rem',
                                                    background: '#EFF6FF', color: '#1D4ED8',
                                                    borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600,
                                                    maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                }}>
                                                    {doc.speciality}
                                                </span>
                                            ) : '—'}
                                        </td>
                                        <td>
                                            {doc.hospital_name ? (
                                                <div style={{ maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {doc.hospital_name}
                                                </div>
                                            ) : '—'}
                                        </td>
                                        <td>{doc.experience || '—'}</td>
                                        <td>
                                            {doc.fee ? (
                                                <span style={{ fontWeight: 600, color: '#059669' }}>₹{doc.fee}</span>
                                            ) : '—'}
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button
                                                    className={`${styles.actionBtn} ${styles.viewBtn}`}
                                                    title="View Details"
                                                    onClick={(e) => { e.stopPropagation(); setSelectedDoctor(doc); }}
                                                >
                                                    <Search size={16} />
                                                </button>
                                                {doc.profile_url && (
                                                    <a
                                                        href={doc.profile_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={styles.actionBtn}
                                                        style={{ color: '#8B5CF6' }}
                                                        title="View Source Profile"
                                                        onClick={e => e.stopPropagation()}
                                                    >
                                                        <ExternalLink size={16} />
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && doctors.length === 0 && !error && (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280' }}>
                        <Users size={40} color="#D1D5DB" style={{ marginBottom: '0.75rem' }} />
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '1rem' }}>No lead doctors found</p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem' }}>
                            {isFiltered ? 'Try adjusting your filters' : 'No data has been imported yet'}
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination Footer */}
            {pagination && total > 0 && (
                <div style={{
                    padding: '1rem 1.5rem',
                    borderTop: '1px solid #E5E7EB',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#F9FAFB',
                    fontSize: '0.875rem',
                    color: '#6B7280',
                    borderRadius: '0 0 1rem 1rem',
                }}>
                    <div>
                        Showing <span style={{ fontWeight: 600, color: '#111827' }}>{showingFrom.toLocaleString()}</span> to{' '}
                        <span style={{ fontWeight: 600, color: '#111827' }}>{showingTo.toLocaleString()}</span> of{' '}
                        <span style={{ fontWeight: 600, color: '#111827' }}>{total.toLocaleString()}</span> entries
                        {isFiltered && <span style={{ marginLeft: '0.5rem', color: '#6B7280' }}>(filtered)</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.8125rem', color: '#9CA3AF' }}>
                            Page {page} of {totalPages}
                        </span>
                        <button
                            disabled={!pagination.has_previous}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            style={{
                                padding: '0.5rem 0.75rem',
                                border: '1px solid #D1D5DB',
                                borderRadius: '0.375rem',
                                background: !pagination.has_previous ? '#F3F4F6' : 'white',
                                color: !pagination.has_previous ? '#9CA3AF' : '#374151',
                                cursor: !pagination.has_previous ? 'not-allowed' : 'pointer',
                                fontWeight: 500,
                                display: 'flex', alignItems: 'center', gap: '0.25rem',
                            }}
                        >
                            <ChevronLeft size={14} /> Previous
                        </button>
                        <button
                            disabled={!pagination.has_next}
                            onClick={() => setPage(p => p + 1)}
                            style={{
                                padding: '0.5rem 0.75rem',
                                border: '1px solid #D1D5DB',
                                borderRadius: '0.375rem',
                                background: !pagination.has_next ? '#F3F4F6' : 'white',
                                color: !pagination.has_next ? '#9CA3AF' : '#374151',
                                cursor: !pagination.has_next ? 'not-allowed' : 'pointer',
                                fontWeight: 500,
                                display: 'flex', alignItems: 'center', gap: '0.25rem',
                            }}
                        >
                            Next <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* Detail Drawer */}
            {selectedDoctor && (
                <DetailDrawer
                    doctor={selectedDoctor}
                    onClose={() => setSelectedDoctor(null)}
                />
            )}

            {/* Slide-in animation keyframes */}
            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
            `}</style>
        </div>
    );
};

export default LeadDoctorsList;
