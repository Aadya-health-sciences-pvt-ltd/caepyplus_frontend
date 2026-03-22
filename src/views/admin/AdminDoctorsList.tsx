'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppRouter } from '../../lib/router';
import { Search, Users, AlertCircle, CheckCircle, Eye, Upload, X, Download, FileSpreadsheet, Loader2, ShieldCheck, UserPlus } from 'lucide-react';
import styles from './AdminDashboard.module.css';
import { adminService, type Doctor, type CsvValidationResponse, type CsvUploadResponse } from '../../services/adminService';
import { calculateProfileProgressFromApi } from '../../lib/profileProgress';

// ---------------------------------------------------------------------------
// Bulk Upload Modal — 3-step flow: Upload → Validate → Confirm
// ---------------------------------------------------------------------------

type ModalStep = 'select' | 'validating' | 'validated' | 'uploading' | 'done';

interface BulkUploadModalProps {
    onClose: () => void;
    onComplete: () => void;
}

const BulkUploadModal = ({ onClose, onComplete }: BulkUploadModalProps) => {
    const [step, setStep] = useState<ModalStep>('select');
    const [file, setFile] = useState<File | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [validationResult, setValidationResult] = useState<CsvValidationResponse | null>(null);
    const [uploadResult, setUploadResult] = useState<CsvUploadResponse | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [downloadingTemplate, setDownloadingTemplate] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback((f: File) => {
        if (!f.name.endsWith('.csv')) {
            setErrorMessage('Please upload a .csv file');
            return;
        }
        setFile(f);
        setErrorMessage('');
        setValidationResult(null);
        setUploadResult(null);
        setStep('select');
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
    }, [handleFile]);

    const downloadTemplate = async () => {
        setDownloadingTemplate(true);
        try {
            await adminService.downloadBulkTemplate();
        } catch {
            setErrorMessage('Failed to download template. Please try again.');
        } finally {
            setDownloadingTemplate(false);
        }
    };

    const handleValidate = async () => {
        if (!file) return;
        setStep('validating');
        setErrorMessage('');
        try {
            const result = await adminService.validateBulkCsv(file);
            setValidationResult(result);
            setStep('validated');
        } catch (err: any) {
            const msg = err?.response?.data?.detail || err?.response?.data?.message || 'Validation failed. Please check your CSV file.';
            setErrorMessage(typeof msg === 'string' ? msg : JSON.stringify(msg));
            setStep('select');
        }
    };

    const handleConfirmUpload = async () => {
        if (!file) return;
        setStep('uploading');
        setErrorMessage('');
        try {
            const result = await adminService.confirmBulkUpload(file);
            setUploadResult(result);
            setStep('done');
            // Auto-close after success
            setTimeout(() => {
                onComplete();
                onClose();
            }, 3000);
        } catch (err: any) {
            const msg = err?.response?.data?.detail || err?.response?.data?.message || 'Upload failed. Please try again.';
            setErrorMessage(typeof msg === 'string' ? msg : JSON.stringify(msg));
            setStep('validated'); // Go back to validated step so user can retry
        }
    };

    const resetModal = () => {
        setFile(null);
        setStep('select');
        setValidationResult(null);
        setUploadResult(null);
        setErrorMessage('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const isProcessing = step === 'validating' || step === 'uploading';

    return (
        <div className={styles.modalOverlay} onClick={isProcessing ? undefined : onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
                {/* Header */}
                <div className={styles.flexBetweenCenter} style={{ marginBottom: '1.5rem' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>
                            Bulk Upload Doctors
                        </h2>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#6B7280' }}>
                            Upload a CSV to onboard multiple doctors at once
                        </p>
                    </div>
                    {!isProcessing && (
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
                            <X size={20} color="#6B7280" />
                        </button>
                    )}
                </div>

                {/* Step Indicators */}
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.25rem' }}>
                    {['Upload', 'Validate', 'Confirm'].map((label, i) => {
                        const stepIdx = i;
                        const currentIdx = step === 'select' ? 0 : step === 'validating' || step === 'validated' ? 1 : 2;
                        const isActive = stepIdx <= currentIdx;
                        return (
                            <div key={label} style={{ flex: 1, textAlign: 'center' }}>
                                <div style={{
                                    height: '3px',
                                    borderRadius: '2px',
                                    background: isActive ? 'linear-gradient(135deg, #293991, #1ABFD2)' : '#E5E7EB',
                                    marginBottom: '0.375rem',
                                    transition: 'background 0.3s'
                                }} />
                                <span style={{ fontSize: '0.75rem', fontWeight: isActive ? 600 : 400, color: isActive ? '#293991' : '#9CA3AF' }}>
                                    {label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Download Template */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', padding: '0.75rem 1rem', background: '#F0F9FF', borderRadius: '0.5rem', border: '1px solid #BAE6FD' }}>
                    <FileSpreadsheet size={20} color="#0284C7" />
                    <span style={{ fontSize: '0.875rem', color: '#0369A1', flex: 1 }}>
                        Need the right format? Download the official template.
                    </span>
                    <button
                        onClick={downloadTemplate}
                        disabled={downloadingTemplate}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', background: '#0284C7', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: downloadingTemplate ? 'wait' : 'pointer', fontSize: '0.8125rem', fontWeight: 600, opacity: downloadingTemplate ? 0.7 : 1 }}
                    >
                        {downloadingTemplate ? <Loader2 size={14} className="spin" /> : <Download size={14} />}
                        {downloadingTemplate ? 'Downloading...' : 'Download Template'}
                    </button>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                    <div style={{ padding: '0.75rem 1rem', marginBottom: '1rem', borderRadius: '0.5rem', background: '#FEF2F2', border: '1px solid #FECACA', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <AlertCircle size={16} color="#DC2626" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.8125rem', color: '#991B1B' }}>{errorMessage}</span>
                    </div>
                )}

                {/* Step: Select File */}
                {step === 'select' && !file && (
                    <div
                        className={`${styles.dropZone} ${dragOver ? styles.dropZoneDragOver : ''}`}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                    >
                        <Upload size={36} color={dragOver ? '#3B82F6' : '#9CA3AF'} style={{ marginBottom: '0.75rem' }} />
                        <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: '#374151' }}>
                            {dragOver ? 'Drop CSV file here' : 'Drag & drop your CSV file here'}
                        </p>
                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.8125rem', color: '#9CA3AF' }}>
                            or click to browse • .csv files only • max 500 rows
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            style={{ display: 'none' }}
                            onChange={e => {
                                const f = e.target.files?.[0];
                                if (f) handleFile(f);
                            }}
                        />
                    </div>
                )}

                {/* File Selected — ready to validate */}
                {step === 'select' && file && (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #E5E7EB', background: '#F9FAFB', marginBottom: '1rem' }}>
                            <FileSpreadsheet size={24} color="#6B7280" />
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: '#111827' }}>{file.name}</p>
                                <p style={{ margin: '0.125rem 0 0', fontSize: '0.75rem', color: '#9CA3AF' }}>
                                    {(file.size / 1024).toFixed(1)} KB
                                </p>
                            </div>
                            <button
                                onClick={resetModal}
                                style={{ fontSize: '0.8125rem', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                Remove
                            </button>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                            <button
                                onClick={onClose}
                                style={{ padding: '0.625rem 1.5rem', background: 'white', border: '1px solid #D1D5DB', borderRadius: '0.5rem', color: '#374151', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
                            >
                                Cancel
                            </button>
                            <button className={styles.primaryBtn} onClick={handleValidate}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <ShieldCheck size={16} /> Validate CSV
                                </span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Step: Validating */}
                {step === 'validating' && (
                    <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                        <Loader2 size={40} color="#293991" className="spin" style={{ marginBottom: '1rem' }} />
                        <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#374151' }}>Validating your CSV...</p>
                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.8125rem', color: '#9CA3AF' }}>
                            Checking all rows for errors. No data will be written yet.
                        </p>
                    </div>
                )}

                {/* Step: Validated — show results */}
                {step === 'validated' && validationResult && (
                    <div>
                        {/* Validation summary */}
                        <div style={{
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            background: validationResult.valid ? '#F0FDF4' : '#FEF2F2',
                            border: `1px solid ${validationResult.valid ? '#BBF7D0' : '#FECACA'}`,
                            marginBottom: '1rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: validationResult.errors.length > 0 ? '0.75rem' : 0 }}>
                                {validationResult.valid ? (
                                    <CheckCircle size={20} color="#16A34A" />
                                ) : (
                                    <AlertCircle size={20} color="#DC2626" />
                                )}
                                <p style={{ margin: 0, fontWeight: 600, color: validationResult.valid ? '#166534' : '#991B1B', fontSize: '0.9375rem' }}>
                                    {validationResult.valid
                                        ? `✓ All ${validationResult.total_rows} row${validationResult.total_rows !== 1 ? 's' : ''} are valid and ready to upload`
                                        : `✗ Found ${validationResult.errors.length} error${validationResult.errors.length !== 1 ? 's' : ''} in ${validationResult.total_rows} row${validationResult.total_rows !== 1 ? 's' : ''}`
                                    }
                                </p>
                            </div>

                            {/* Error details */}
                            {validationResult.errors.length > 0 && (
                                <div style={{ maxHeight: '200px', overflowY: 'auto', borderRadius: '0.375rem', border: '1px solid #FECACA', background: 'white' }}>
                                    <table style={{ width: '100%', fontSize: '0.8125rem', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ background: '#FEF2F2' }}>
                                                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 600, color: '#991B1B', borderBottom: '1px solid #FECACA' }}>Row</th>
                                                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 600, color: '#991B1B', borderBottom: '1px solid #FECACA' }}>Field</th>
                                                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 600, color: '#991B1B', borderBottom: '1px solid #FECACA' }}>Error</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {validationResult.errors.map((err, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #FEE2E2' }}>
                                                    <td style={{ padding: '0.375rem 0.75rem', color: '#B91C1C' }}>{err.row}</td>
                                                    <td style={{ padding: '0.375rem 0.75rem', color: '#B91C1C', fontFamily: 'monospace' }}>{err.field}</td>
                                                    <td style={{ padding: '0.375rem 0.75rem', color: '#B91C1C' }}>{err.message}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                            <button
                                onClick={resetModal}
                                style={{ padding: '0.625rem 1.5rem', background: 'white', border: '1px solid #D1D5DB', borderRadius: '0.5rem', color: '#374151', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
                            >
                                {validationResult.valid ? 'Cancel' : 'Upload Different File'}
                            </button>
                            {validationResult.valid && (
                                <button className={styles.primaryBtn} onClick={handleConfirmUpload}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Upload size={16} /> Confirm Upload ({validationResult.total_rows} Doctor{validationResult.total_rows !== 1 ? 's' : ''})
                                    </span>
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Step: Uploading */}
                {step === 'uploading' && (
                    <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                        <Loader2 size={40} color="#293991" className="spin" style={{ marginBottom: '1rem' }} />
                        <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#374151' }}>Uploading doctors...</p>
                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.8125rem', color: '#9CA3AF' }}>
                            Creating records in the database. This may take a moment.
                        </p>
                    </div>
                )}

                {/* Step: Done */}
                {step === 'done' && uploadResult && (
                    <div>
                        <div style={{
                            padding: '1.25rem',
                            borderRadius: '0.5rem',
                            background: '#F0FDF4',
                            border: '1px solid #BBF7D0',
                            textAlign: 'center'
                        }}>
                            <CheckCircle size={36} color="#16A34A" style={{ marginBottom: '0.75rem' }} />
                            <p style={{ margin: 0, fontWeight: 700, color: '#166534', fontSize: '1.0625rem' }}>
                                Upload Complete!
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '0.75rem', fontSize: '0.875rem', color: '#374151' }}>
                                {uploadResult.created > 0 && (
                                    <span><strong style={{ color: '#16A34A' }}>{uploadResult.created}</strong> created</span>
                                )}
                                {uploadResult.updated > 0 && (
                                    <span><strong style={{ color: '#2563EB' }}>{uploadResult.updated}</strong> updated</span>
                                )}
                                {uploadResult.skipped > 0 && (
                                    <span><strong style={{ color: '#D97706' }}>{uploadResult.skipped}</strong> skipped</span>
                                )}
                            </div>
                            {uploadResult.errors && uploadResult.errors.length > 0 && (
                                <div style={{ marginTop: '0.75rem', textAlign: 'left' }}>
                                    <p style={{ fontSize: '0.8125rem', color: '#B91C1C', fontWeight: 600 }}>Warnings:</p>
                                    <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem', fontSize: '0.8125rem', color: '#B91C1C' }}>
                                        {uploadResult.errors.slice(0, 5).map((err, i) => (
                                            <li key={i}>Row {err.row}: {err.field} — {err.message}</li>
                                        ))}
                                        {uploadResult.errors.length > 5 && (
                                            <li>...and {uploadResult.errors.length - 5} more</li>
                                        )}
                                    </ul>
                                </div>
                            )}
                            <p style={{ margin: '1rem 0 0', fontSize: '0.75rem', color: '#9CA3AF' }}>
                                This dialog will close automatically...
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ---------------------------------------------------------------------------
// Admin Doctors List Page
// ---------------------------------------------------------------------------

const AdminDoctorsList = () => {
    const router = useAppRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [showUploadModal, setShowUploadModal] = useState(false);

    useEffect(() => {
        fetchDoctors();
    }, [page]);

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const response = await adminService.getDoctors(page, 20); // 20 items per page
            setDoctors(response.data);
            setTotal(response.total);
        } catch (error) {
            console.error("Failed to fetch doctors", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSyncLinqMD = async (id: number) => {
        if (window.confirm("Are you sure you want to create a profile in LinQMD for this doctor?")) {
            try {
                await adminService.syncLinqMDProfile(id);
                alert("Profile created successfully");
                fetchDoctors(); // Refresh list to reflect state changes if any
            } catch (error) {
                console.error("LinQMD sync failed", error);
                alert("Failed to create profile in LinQMD");
            }
        }
    };

    const filteredDoctors = doctors.filter(doc => {
        const name = doc.full_name || `${doc.first_name} ${doc.last_name}`;
        const specialty = doc.specialty || "";
        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            specialty.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const stats = {
        total: total,
        verified: doctors.filter(d => d.onboarding_status === "verified" || d.onboarding_status === "VERIFIED").length,
        pending: doctors.filter(d => d.onboarding_status === "submitted" || d.onboarding_status === "SUBMITTED").length
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Doctor Management</h1>
                <p className={styles.subtitle}>Manage and verify doctor profiles</p>
            </div>

            {/* Stats Grid - using filtered/current page stats for now as API doesn't return global stats separate from list yet */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#3B82F6' }}>
                        <Users size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <h3>{stats.total}</h3>
                        <p>Total Doctors</p>
                    </div>
                </div>
                {/* Note: Pending/Verified counts here are only for current page unless we add stats endpoint. 
                    Keeping simple for now. */}
            </div>

            {/* Controls */}
            <div className={styles.controls}>
                <div className={styles.searchBar}>
                    <Search size={18} color="#9CA3AF" />
                    <input
                        type="text"
                        placeholder="Search by name or specialty..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    className={styles.primaryBtn}
                    onClick={() => setShowUploadModal(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Upload size={16} /> Bulk Upload
                </button>
            </div>

            {/* Table */}
            <div className={styles.tableContainer}>
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Doctor Name</th>
                                <th>Specialty</th>
                                <th>Location</th>
                                <th>Date Joined</th>
                                <th>Profile %</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDoctors.map(doc => {
                                const status = doc.onboarding_status || 'pending';
                                return (
                                    <tr key={doc.id}>
                                        <td style={{ fontWeight: 500 }}>
                                            {doc.full_name || `${doc.first_name} ${doc.last_name}`}
                                        </td>
                                        <td>{doc.specialty || '-'}</td>
                                        <td>{doc.primary_practice_location || '-'}</td>
                                        <td>{new Date(doc.created_at).toLocaleDateString()}</td>
                                        <td>
                                            {(() => {
                                                const p = calculateProfileProgressFromApi({
                                                    full_name: doc.full_name || `${doc.first_name} ${doc.last_name}`,
                                                    specialty: doc.specialty || doc.primary_specialization,
                                                    primary_practice_location: doc.primary_practice_location,
                                                    years_of_clinical_experience: doc.years_of_clinical_experience || doc.years_of_experience,
                                                    medical_registration_number: doc.medical_registration_number,
                                                    profile_photo: null,
                                                    year_of_mbbs: doc.year_of_mbbs,
                                                    conditions_commonly_treated: doc.conditions_commonly_treated,
                                                    conditions_known_for: doc.conditions_known_for,
                                                    training_experience: doc.training_experience,
                                                    motivation_in_practice: doc.motivation_in_practice,
                                                    unwinding_after_work: doc.unwinding_after_work,
                                                    what_patients_value_most: doc.what_patients_value_most,
                                                    approach_to_care: doc.approach_to_care,
                                                    availability_philosophy: doc.availability_philosophy,
                                                    content_seeds: doc.content_seeds,
                                                });
                                                const color = p.totalPercentage >= 80 ? '#10B981' : p.totalPercentage >= 50 ? '#F59E0B' : '#EF4444';
                                                return (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                        <div style={{ width: '48px', height: '5px', borderRadius: '3px', background: '#F3F4F6', overflow: 'hidden' }}>
                                                            <div style={{ height: '100%', width: `${p.totalPercentage}%`, background: color, borderRadius: '3px' }} />
                                                        </div>
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color }}>{p.totalPercentage}%</span>
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${(status === 'verified' || status === 'VERIFIED') ? styles.statusVerified :
                                                (status === 'rejected' || status === 'REJECTED') ? styles.statusRejected :
                                                    styles.statusPending
                                                }`}>
                                                {status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button
                                                    className={`${styles.actionBtn} ${styles.viewBtn}`}
                                                    title="View Details"
                                                    onClick={() => { sessionStorage.setItem('nav_state', JSON.stringify({ doctor: doc })); router.push(`/admin/dashboard/doctor?id=${doc.id}`); }}
                                                >
                                                    <Eye size={18} />
                                                </button>

                                                <button
                                                    className={`${styles.actionBtn}`}
                                                    style={{ color: '#3B82F6' }}
                                                    title="Create Profile in LinQMD"
                                                    onClick={() => handleSyncLinqMD(doc.id)}
                                                >
                                                    <UserPlus size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
                {!loading && filteredDoctors.length === 0 && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>
                        No doctors found matching your search.
                    </div>
                )}
            </div>

            {/* Pagination Footer */}
            <div style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid #E5E7EB',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#F9FAFB',
                fontSize: '0.875rem',
                color: '#6B7280'
            }}>
                <div>
                    Showing <span style={{ fontWeight: 600, color: '#111827' }}>{(page - 1) * 20 + 1}</span> to <span style={{ fontWeight: 600, color: '#111827' }}>{Math.min(page * 20, total)}</span> of <span style={{ fontWeight: 600, color: '#111827' }}>{total}</span> entries
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        style={{
                            padding: '0.5rem 1rem',
                            border: '1px solid #D1D5DB',
                            borderRadius: '0.375rem',
                            background: page === 1 ? '#F3F4F6' : 'white',
                            color: page === 1 ? '#9CA3AF' : '#374151',
                            cursor: page === 1 ? 'not-allowed' : 'pointer',
                            fontWeight: 500
                        }}
                    >
                        Previous
                    </button>
                    <button
                        disabled={filteredDoctors.length < 20} // Or total > page * 20
                        onClick={() => setPage(p => p + 1)}
                        style={{
                            padding: '0.5rem 1rem',
                            border: '1px solid #D1D5DB',
                            borderRadius: '0.375rem',
                            background: 'white',
                            color: '#374151',
                            cursor: 'pointer',
                            fontWeight: 500
                        }}
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Bulk Upload Modal */}
            {showUploadModal && (
                <BulkUploadModal
                    onClose={() => setShowUploadModal(false)}
                    onComplete={fetchDoctors}
                />
            )}
        </div>
    );
};

export default AdminDoctorsList;
