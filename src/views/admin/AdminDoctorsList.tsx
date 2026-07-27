'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppRouter } from '../../lib/router';
import { Search, Users, AlertCircle, CheckCircle, Eye, Upload, X, Download, FileSpreadsheet, Loader2, ShieldCheck, UserPlus, KeyRound, Copy, Check } from 'lucide-react';
import styles from './AdminDashboard.module.css';
import { adminService, type Doctor, type CsvValidationResponse, type CsvUploadResponse, type LinqMDSyncResult } from '../../services/adminService';
import { parseErrorMessage } from '../../lib/api';
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
                                                    <td style={{ padding: '0.375rem 0.75rem', color: '#B91C1C' }}>{err.error}</td>
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
                {step === 'done' && uploadResult && (() => {
                    const rowWarnings = uploadResult.rows.flatMap((r) =>
                        (r.warnings ?? []).map((w) => ({ row: r.row, text: w }))
                    );
                    const hasWarnings = (uploadResult.warning_count ?? rowWarnings.length) > 0;
                    const hasSkipped = uploadResult.skipped > 0;
                    const bg = hasSkipped ? '#FEF2F2' : hasWarnings ? '#FFFBEB' : '#F0FDF4';
                    const border = hasSkipped ? '#FECACA' : hasWarnings ? '#FDE68A' : '#BBF7D0';
                    const titleColor = hasSkipped ? '#991B1B' : hasWarnings ? '#92400E' : '#166534';
                    const iconColor = hasSkipped ? '#DC2626' : hasWarnings ? '#D97706' : '#16A34A';
                    return (
                    <div>
                        <div style={{
                            padding: '1.25rem',
                            borderRadius: '0.5rem',
                            background: bg,
                            border: `1px solid ${border}`,
                            textAlign: 'center'
                        }}>
                            <CheckCircle size={36} color={iconColor} style={{ marginBottom: '0.75rem' }} />
                            <p style={{ margin: 0, fontWeight: 700, color: titleColor, fontSize: '1.0625rem' }}>
                                {hasSkipped ? 'Upload completed with errors' : hasWarnings ? 'Upload complete with warnings' : 'Upload Complete!'}
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
                            {rowWarnings.length > 0 && (
                                <div style={{ marginTop: '0.75rem', textAlign: 'left' }}>
                                    <p style={{ fontSize: '0.8125rem', color: '#92400E', fontWeight: 600 }}>
                                        Verify / LinQMD warnings (create LinQMD manually in admin if needed):
                                    </p>
                                    <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem', fontSize: '0.8125rem', color: '#B45309' }}>
                                        {rowWarnings.slice(0, 8).map((w, i) => (
                                            <li key={i}>Row {w.row}: {w.text}</li>
                                        ))}
                                        {rowWarnings.length > 8 && (
                                            <li>...and {rowWarnings.length - 8} more</li>
                                        )}
                                    </ul>
                                </div>
                            )}
                            {uploadResult.skipped_errors && uploadResult.skipped_errors.length > 0 && (
                                <div style={{ marginTop: '0.75rem', textAlign: 'left' }}>
                                    <p style={{ fontSize: '0.8125rem', color: '#B91C1C', fontWeight: 600 }}>Skipped rows:</p>
                                    <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem', fontSize: '0.8125rem', color: '#B91C1C' }}>
                                        {uploadResult.skipped_errors.slice(0, 5).map((err, i) => (
                                            <li key={i}>Row {err.row}{err.field ? ` (${err.field})` : ''}: {err.error}</li>
                                        ))}
                                        {uploadResult.skipped_errors.length > 5 && (
                                            <li>...and {uploadResult.skipped_errors.length - 5} more</li>
                                        )}
                                    </ul>
                                </div>
                            )}
                            <p style={{ margin: '1rem 0 0', fontSize: '0.75rem', color: '#9CA3AF' }}>
                                This dialog will close automatically...
                            </p>
                        </div>
                    </div>
                    );
                })()}
            </div>
        </div>
    );
};

// ---------------------------------------------------------------------------
// LinQMD sync result modal
// ---------------------------------------------------------------------------

type LinqMDModalState =
    | { mode: 'success'; username: string; password: string }
    | {
        mode: 'view';
        doctorName: string;
        linqmdUserId: string;
        username: string;
        password: string;
    }
    | { mode: 'error'; message: string };

function isDoctorVerified(doc: Doctor): boolean {
    return (doc.onboarding_status ?? '').toLowerCase() === 'verified';
}

interface LinqMDResultModalProps {
    state: LinqMDModalState;
    onClose: () => void;
}

const COPY_FEEDBACK_MS = 2200;

const LinqMDResultModal = ({ state, onClose }: LinqMDResultModalProps) => {
    const isSuccess = state.mode === 'success';
    const isView = state.mode === 'view';
    const isError = state.mode === 'error';
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [copyFailedField, setCopyFailedField] = useState<string | null>(null);
    const copyFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (copyFeedbackTimerRef.current) {
                clearTimeout(copyFeedbackTimerRef.current);
            }
        };
    }, []);

    const scheduleCopyFeedbackReset = () => {
        if (copyFeedbackTimerRef.current) {
            clearTimeout(copyFeedbackTimerRef.current);
        }
        copyFeedbackTimerRef.current = setTimeout(() => {
            setCopiedField(null);
            setCopyFailedField(null);
        }, COPY_FEEDBACK_MS);
    };

    const copyField = async (fieldKey: string, value: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopyFailedField(null);
            setCopiedField(fieldKey);
            scheduleCopyFeedbackReset();
        } catch {
            setCopiedField(null);
            setCopyFailedField(fieldKey);
            scheduleCopyFeedbackReset();
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div
                className={styles.modalContent}
                onClick={e => e.stopPropagation()}
                style={{ maxWidth: '480px' }}
            >
                <div className={styles.flexBetweenCenter} style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {isError ? (
                            <AlertCircle size={22} color="#DC2626" />
                        ) : (
                            <CheckCircle size={22} color="#059669" />
                        )}
                        <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#111827' }}>
                            {isError
                                ? 'LinQMD Profile Creation Failed'
                                : isView
                                  ? 'LinQMD Credentials'
                                  : 'LinQMD Profile Created'}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                        aria-label="Close"
                    >
                        <X size={20} color="#6B7280" />
                    </button>
                </div>

                {isSuccess || isView ? (
                    <>
                        <p style={{ margin: '0 0 1.25rem', fontSize: '0.9375rem', color: '#374151', lineHeight: 1.5 }}>
                            {isView
                                ? 'Stored LinQMD credentials for this doctor.'
                                : 'Doctor Profile created Successfully in LinQMD. Share these credentials with the doctor.'}
                        </p>
                        {(isView
                            ? [
                                { label: 'Doctor name', value: state.doctorName },
                                { label: 'LinQMD user ID', value: state.linqmdUserId },
                                { label: 'Username', value: state.username },
                                { label: 'Initial password', value: state.password },
                            ]
                            : [
                                { label: 'Username', value: state.username },
                                { label: 'Initial password', value: state.password },
                            ]
                        ).map(({ label, value }) => (
                            <div
                                key={label}
                                style={{
                                    marginBottom: '0.75rem',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid #E5E7EB',
                                    background: '#F9FAFB',
                                }}
                            >
                                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
                                    {label}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.375rem' }}>
                                    <code style={{ flex: 1, fontSize: '0.875rem', color: '#111827', wordBreak: 'break-all' }}>
                                        {value}
                                    </code>
                                    <button
                                        type="button"
                                        className={[
                                            styles.linqmdCopyBtn,
                                            copiedField === label ? styles.linqmdCopyBtnCopied : '',
                                            copyFailedField === label ? styles.linqmdCopyBtnFailed : '',
                                        ].filter(Boolean).join(' ')}
                                        onClick={() => copyField(label, value)}
                                        aria-label={
                                            copiedField === label
                                                ? `${label} copied`
                                                : copyFailedField === label
                                                  ? `Failed to copy ${label}`
                                                  : `Copy ${label}`
                                        }
                                    >
                                        {copiedField === label ? (
                                            <>
                                                <Check size={14} aria-hidden />
                                                Copied!
                                            </>
                                        ) : copyFailedField === label ? (
                                            <>
                                                <AlertCircle size={14} aria-hidden />
                                                Failed
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={14} aria-hidden />
                                                Copy
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <div
                        style={{
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            background: '#FEF2F2',
                            border: '1px solid #FECACA',
                        }}
                    >
                        <p style={{ margin: 0, fontSize: '0.9375rem', color: '#991B1B', lineHeight: 1.5 }}>
                            {state.message}
                        </p>
                    </div>
                )}

                <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            padding: '0.5rem 1.25rem',
                            background: 'linear-gradient(135deg, #293991, #1ABFD2)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

function credentialsFromLinqMDResult(result: LinqMDSyncResult): { username: string; password: string } {
    const resp = result.linqmd_response ?? {};
    const username =
        result.username ??
        resp.Username ??
        (typeof resp.username === 'string' ? resp.username : '');
    const password =
        result.password ??
        resp.Password ??
        (typeof resp.password === 'string' ? resp.password : '');
    return { username: String(username), password: String(password) };
}

export type LinqmdProfileTheme = 'dp_1' | 'dp_2' | 'dp_3';

const LINQMD_PROFILE_THEMES: Array<{
    value: LinqmdProfileTheme;
    title: string;
    subtitle: string;
    gradient: string;
}> = [
    {
        value: 'dp_1',
        title: 'Ocean Clinical',
        subtitle: 'Teal · calm & clinical',
        gradient: 'linear-gradient(145deg, #0D9488 0%, #5EEAD4 55%, #134E4A 100%)',
    },
    {
        value: 'dp_2',
        title: 'Royal Trust',
        subtitle: 'Indigo · professional',
        gradient: 'linear-gradient(145deg, #4338CA 0%, #A5B4FC 50%, #312E81 100%)',
    },
    {
        value: 'dp_3',
        title: 'Warm Care',
        subtitle: 'Amber · approachable',
        gradient: 'linear-gradient(145deg, #EA580C 0%, #FCD34D 45%, #9A3412 100%)',
    },
];

interface LinqMDThemePickerModalProps {
    doctorName: string;
    syncing: boolean;
    selectedTheme: LinqmdProfileTheme;
    onSelectTheme: (theme: LinqmdProfileTheme) => void;
    onConfirm: () => void;
    onClose: () => void;
}

const LinqMDThemePickerModal = ({
    doctorName,
    syncing,
    selectedTheme,
    onSelectTheme,
    onConfirm,
    onClose,
}: LinqMDThemePickerModalProps) => (
    <div className={styles.modalOverlay} onClick={syncing ? undefined : onClose}>
        <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '560px' }}
            role="dialog"
            aria-labelledby="linqmd-theme-picker-title"
        >
            <div className={styles.flexBetweenCenter} style={{ marginBottom: '0.5rem' }}>
                <h2
                    id="linqmd-theme-picker-title"
                    style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#111827' }}
                >
                    Choose Practice Hub theme
                </h2>
                <button
                    type="button"
                    onClick={onClose}
                    disabled={syncing}
                    style={{ background: 'none', border: 'none', cursor: syncing ? 'not-allowed' : 'pointer', padding: '0.25rem' }}
                    aria-label="Close"
                >
                    <X size={20} color="#6B7280" />
                </button>
            </div>
            <p style={{ margin: '0 0 0.25rem', fontSize: '0.875rem', color: '#4B5563', lineHeight: 1.5 }}>
                Select a visual theme for <strong>{doctorName}</strong>&apos;s LinQMD profile. This is applied once at
                creation.
            </p>
            <div className={styles.linqmdThemeGrid}>
                {LINQMD_PROFILE_THEMES.map((theme) => {
                    const selected = selectedTheme === theme.value;
                    return (
                        <button
                            key={theme.value}
                            type="button"
                            className={`${styles.linqmdThemeCard} ${selected ? styles.linqmdThemeCardSelected : ''}`}
                            onClick={() => onSelectTheme(theme.value)}
                            disabled={syncing}
                            aria-pressed={selected}
                        >
                            <div
                                className={styles.linqmdThemePreview}
                                style={{ background: theme.gradient }}
                                aria-hidden
                            />
                            <div className={styles.linqmdThemeCardBody}>
                                <p className={styles.linqmdThemeCardTitle}>{theme.title}</p>
                                <p className={styles.linqmdThemeCardMeta}>{theme.subtitle}</p>
                                <span className={styles.linqmdThemeCode}>{theme.value}</span>
                            </div>
                        </button>
                    );
                })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                    type="button"
                    onClick={onClose}
                    disabled={syncing}
                    style={{
                        padding: '0.625rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #D1D5DB',
                        background: 'white',
                        cursor: syncing ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem',
                    }}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={syncing}
                    className={styles.primaryBtn}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        opacity: syncing ? 0.7 : 1,
                    }}
                >
                    {syncing ? (
                        <>
                            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                            Creating profile…
                        </>
                    ) : (
                        'Create profile on LinQMD'
                    )}
                </button>
            </div>
        </div>
    </div>
);

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
    const [linqmdModal, setLinqmdModal] = useState<LinqMDModalState | null>(null);
    const [linqmdThemePicker, setLinqmdThemePicker] = useState<{
        doctorId: number;
        doctorName: string;
    } | null>(null);
    const [selectedLinqmdTheme, setSelectedLinqmdTheme] = useState<LinqmdProfileTheme>('dp_1');
    const [linqmdThemeSyncing, setLinqmdThemeSyncing] = useState(false);

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

    const handleViewLinqMDCredentials = async (id: number) => {
        try {
            const creds = await adminService.getLinqMDCredentials(id);
            setLinqmdModal({
                mode: 'view',
                doctorName: creds.doctor_name,
                linqmdUserId: creds.linqmd_user_id,
                username: creds.linqmd_username,
                password: creds.linqmd_password,
            });
        } catch (error) {
            console.error('Failed to load LinQMD credentials', error);
            setLinqmdModal({
                mode: 'error',
                message: parseErrorMessage(error),
            });
        }
    };

    const openLinqMDThemePicker = (doc: Doctor) => {
        const name =
            doc.full_name ||
            `${doc.first_name || ''} ${doc.last_name || ''}`.trim() ||
            `Doctor #${doc.id}`;
        setSelectedLinqmdTheme('dp_1');
        setLinqmdThemePicker({ doctorId: doc.id, doctorName: name });
    };

    const handleConfirmLinqMDCreate = async () => {
        if (!linqmdThemePicker) return;
        const { doctorId } = linqmdThemePicker;
        setLinqmdThemeSyncing(true);
        try {
            const result = await adminService.syncLinqMDProfile(doctorId, selectedLinqmdTheme);
            const { username, password } = credentialsFromLinqMDResult(result);
            if (!username || !password) {
                throw new Error('LinQMD credentials were not returned by the server.');
            }
            setLinqmdThemePicker(null);
            setLinqmdModal({ mode: 'success', username, password });
            fetchDoctors();
        } catch (error) {
            console.error('LinQMD sync failed', error);
            setLinqmdThemePicker(null);
            setLinqmdModal({
                mode: 'error',
                message: parseErrorMessage(error),
            });
        } finally {
            setLinqmdThemeSyncing(false);
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
                                                    onClick={() => { sessionStorage.setItem('nav_state', JSON.stringify({ doctor: doc })); router.push(`/admin/dashboard/doctor/${doc.id}`); }}
                                                >
                                                    <Eye size={18} />
                                                </button>

                                                {(() => {
                                                    const verified = isDoctorVerified(doc);
                                                    const hasProfile = !!doc.has_linqmd_profile;
                                                    const canCreate = verified && !hasProfile;
                                                    const createTooltip = !verified
                                                        ? 'Verification pending'
                                                        : hasProfile
                                                          ? 'LinQMD profile already created'
                                                          : 'Create Profile in LinQMD';
                                                    const canView = hasProfile;
                                                    const viewTooltip = canView
                                                        ? 'View LinQMD credentials'
                                                        : 'No LinQMD profile on record';
                                                    const disabledBtnStyle = {
                                                        opacity: 0.45,
                                                        cursor: 'not-allowed' as const,
                                                    };
                                                    return (
                                                        <>
                                                            <span
                                                                title={createTooltip}
                                                                style={{ display: 'inline-flex' }}
                                                            >
                                                                <button
                                                                    type="button"
                                                                    className={styles.actionBtn}
                                                                    style={{
                                                                        color: '#3B82F6',
                                                                        ...(canCreate ? {} : disabledBtnStyle),
                                                                    }}
                                                                    disabled={!canCreate}
                                                                    onClick={() => canCreate && openLinqMDThemePicker(doc)}
                                                                >
                                                                    <UserPlus size={18} />
                                                                </button>
                                                            </span>
                                                            <span
                                                                title={viewTooltip}
                                                                style={{ display: 'inline-flex' }}
                                                            >
                                                                <button
                                                                    type="button"
                                                                    className={styles.actionBtn}
                                                                    style={{
                                                                        color: '#059669',
                                                                        ...(canView ? {} : disabledBtnStyle),
                                                                    }}
                                                                    disabled={!canView}
                                                                    onClick={() => canView && handleViewLinqMDCredentials(doc.id)}
                                                                >
                                                                    <KeyRound size={18} />
                                                                </button>
                                                            </span>
                                                        </>
                                                    );
                                                })()}
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
            {linqmdThemePicker && (
                <LinqMDThemePickerModal
                    doctorName={linqmdThemePicker.doctorName}
                    syncing={linqmdThemeSyncing}
                    selectedTheme={selectedLinqmdTheme}
                    onSelectTheme={setSelectedLinqmdTheme}
                    onConfirm={handleConfirmLinqMDCreate}
                    onClose={() => !linqmdThemeSyncing && setLinqmdThemePicker(null)}
                />
            )}

            {linqmdModal && (
                <LinqMDResultModal
                    state={linqmdModal}
                    onClose={() => setLinqmdModal(null)}
                />
            )}

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
