'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    Search, Plus, Trash2, CheckCircle, XCircle, Edit3, X,
    Loader2, AlertCircle, Filter, Clock
} from 'lucide-react';
import styles from './AdminDashboard.module.css';
import { parseErrorMessage } from '../../lib/api';
import {
    adminService,
    type DropdownOption,
    type DropdownField,
    type DropdownOptionStatus,
    type DropdownListResponse,
} from '../../services/adminService';


// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<DropdownOptionStatus, { bg: string; text: string }> = {
    approved: { bg: '#D1FAE5', text: '#065F46' },
    pending: { bg: '#FEF3C7', text: '#92400E' },
    rejected: { bg: '#FEE2E2', text: '#991B1B' },
};

const formatFieldLabel = (name: string) =>
    name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const formatDate = (iso: string) => {
    try {
        return new Date(iso).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
        });
    } catch { return iso; }
};

// ---------------------------------------------------------------------------
// Add Value Modal
// ---------------------------------------------------------------------------

interface AddModalProps {
    fields: DropdownField[];
    defaultField: string;
    onClose: () => void;
    onAdded: () => void;
}

const AddValueModal = ({ fields, defaultField, onClose, onAdded }: AddModalProps) => {
    const [field, setField] = useState(defaultField || fields[0]?.field_name || '');
    const [value, setValue] = useState('');
    const [label, setLabel] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    const handleSubmit = async () => {
        if (!value.trim()) return;
        setSaving(true);
        setError('');
        try {
            await adminService.createDropdownOption({
                field_name: field,
                value: value.trim(),
                label: label.trim() || null,
            });
            onAdded();
            onClose();
        } catch (err: any) {
            setError(parseErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#111827' }}>Add New Value</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color="#6B7280" /></button>
                </div>

                {error && (
                    <div style={{ padding: '0.5rem 0.75rem', marginBottom: '0.75rem', borderRadius: '0.375rem', background: '#FEF2F2', border: '1px solid #FECACA', fontSize: '0.8125rem', color: '#991B1B' }}>
                        {error}
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }}>Field</label>
                        <select
                            value={field}
                            onChange={e => setField(e.target.value)}
                            style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB', fontSize: '0.875rem', outline: 'none', background: 'white' }}
                        >
                            {fields.map(f => (
                                <option key={f.field_name} value={f.field_name}>{formatFieldLabel(f.field_name)}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }}>Value *</label>
                        <input
                            ref={inputRef}
                            value={value}
                            onChange={e => setValue(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                            placeholder="e.g. Cardiology"
                            style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }}>Display Label (optional)</label>
                        <input
                            value={label}
                            onChange={e => setLabel(e.target.value)}
                            placeholder="Leave blank to use value as label"
                            style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.625rem', marginTop: '1.25rem' }}>
                    <button onClick={onClose} style={{ padding: '0.5rem 1.25rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem', background: 'white', color: '#374151', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving || !value.trim()}
                        className={styles.primaryBtn}
                    >
                        {saving ? <><Loader2 size={14} className="spin" /> Saving...</> : 'Add Value'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ---------------------------------------------------------------------------
// Edit Modal
// ---------------------------------------------------------------------------

interface EditModalProps {
    option: DropdownOption;
    onClose: () => void;
    onUpdated: () => void;
}

const EditModal = ({ option, onClose, onUpdated }: EditModalProps) => {
    const [label, setLabel] = useState(option.label || '');
    const [order, setOrder] = useState(option.display_order?.toString() || '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        setSaving(true);
        setError('');
        try {
            await adminService.updateDropdownOption(option.id, {
                label: label.trim() || null,
                display_order: order ? Number(order) : null,
            });
            onUpdated();
            onClose();
        } catch (err: any) {
            setError(parseErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#111827' }}>Edit Option</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color="#6B7280" /></button>
                </div>

                <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: '#6B7280' }}>
                    <strong>{formatFieldLabel(option.field_name)}</strong> → <code style={{ background: '#F3F4F6', padding: '0.125rem 0.375rem', borderRadius: '0.25rem' }}>{option.value}</code>
                </p>

                {error && (
                    <div style={{ padding: '0.5rem 0.75rem', marginBottom: '0.75rem', borderRadius: '0.375rem', background: '#FEF2F2', border: '1px solid #FECACA', fontSize: '0.8125rem', color: '#991B1B' }}>{error}</div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }}>Display Label</label>
                        <input
                            value={label} onChange={e => setLabel(e.target.value)}
                            placeholder={option.value}
                            style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }}>Display Order</label>
                        <input
                            type="number" value={order} onChange={e => setOrder(e.target.value)}
                            placeholder="Auto"
                            style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.625rem', marginTop: '1.25rem' }}>
                    <button onClick={onClose} style={{ padding: '0.5rem 1.25rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem', background: 'white', color: '#374151', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>Cancel</button>
                    <button onClick={handleSubmit} disabled={saving} className={styles.primaryBtn}>
                        {saving ? <><Loader2 size={14} className="spin" /> Saving...</> : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const PAGE_SIZE = 50;

const AdminMasters = () => {
    // Data
    const [fields, setFields] = useState<DropdownField[]>([]);
    const [options, setOptions] = useState<DropdownOption[]>([]);
    const [total, setTotal] = useState(0);
    const [pendingCount, setPendingCount] = useState(0);

    // Filters
    const [activeField, setActiveField] = useState<string>('__all__');
    const [statusFilter, setStatusFilter] = useState<DropdownOptionStatus | ''>('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    // UI state
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [showAddModal, setShowAddModal] = useState(false);
    const [editOption, setEditOption] = useState<DropdownOption | null>(null);
    const [bulkActioning, setBulkActioning] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

    // -----------------------------------------------------------------------
    // Fetch
    // -----------------------------------------------------------------------

    const fetchFields = useCallback(async () => {
        try {
            const result = await adminService.getDropdownFields();
            setFields(result);
        } catch (err) {
            console.error('Failed to load dropdown fields', err);
        }
    }, []);

    const fetchOptions = useCallback(async () => {
        setLoading(true);
        try {
            const params: any = { skip: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE };
            if (activeField !== '__all__') params.field_name = activeField;
            if (statusFilter) params.status = statusFilter;
            if (search.trim()) params.search = search.trim();

            let result: DropdownListResponse;
            if (activeField === '__pending__') {
                result = await adminService.getPendingOptions({
                    skip: params.skip,
                    limit: params.limit,
                    ...(search.trim() ? {} : {}), // pending endpoint doesn't support search; filter client side if needed
                });
            } else {
                result = await adminService.getDropdownOptions(params);
            }

            setOptions(result.items ?? []);
            setTotal(result.total ?? 0);
            setPendingCount(result.pending_count ?? 0);
        } catch (err) {
            console.error('Failed to load dropdown options', err);
            showToast('Failed to load dropdown options', 'error');
        } finally {
            setLoading(false);
        }
    }, [activeField, statusFilter, search, page]);

    useEffect(() => { fetchFields(); }, [fetchFields]);
    useEffect(() => { fetchOptions(); }, [fetchOptions]);

    // Debounce search
    const handleSearchChange = (val: string) => {
        setSearch(val);
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            setPage(1);
        }, 300);
    };

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // -----------------------------------------------------------------------
    // Actions
    // -----------------------------------------------------------------------

    const handleApprove = async (id: number) => {
        setActionLoading(id);
        try {
            await adminService.approveOption(id);
            showToast('Option approved', 'success');
            fetchOptions();
        } catch (err: any) {
            showToast(parseErrorMessage(err), 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id: number) => {
        const notes = window.prompt('Rejection reason (optional):');
        if (notes === null) return; // cancelled
        setActionLoading(id);
        try {
            await adminService.rejectOption(id, { review_notes: notes || null });
            showToast('Option rejected', 'success');
            fetchOptions();
        } catch (err: any) {
            showToast(parseErrorMessage(err), 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (opt: DropdownOption) => {
        if (opt.is_system) {
            alert('System values cannot be deleted. Use reject to hide them.');
            return;
        }
        if (!window.confirm(`Delete "${opt.value}" from ${formatFieldLabel(opt.field_name)}?`)) return;
        setActionLoading(opt.id);
        try {
            await adminService.deleteDropdownOption(opt.id);
            showToast('Option deleted', 'success');
            fetchOptions();
        } catch (err: any) {
            showToast(parseErrorMessage(err), 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleBulkApprove = async () => {
        if (selectedIds.size === 0) return;
        setBulkActioning(true);
        try {
            const result = await adminService.bulkApprove({ option_ids: Array.from(selectedIds) });
            showToast(`${result.processed} option(s) approved`, 'success');
            setSelectedIds(new Set());
            fetchOptions();
        } catch (err: any) {
            showToast(parseErrorMessage(err), 'error');
        } finally {
            setBulkActioning(false);
        }
    };

    const handleBulkReject = async () => {
        if (selectedIds.size === 0) return;
        const notes = window.prompt('Rejection reason for all selected (optional):');
        if (notes === null) return;
        setBulkActioning(true);
        try {
            const result = await adminService.bulkReject({ option_ids: Array.from(selectedIds), review_notes: notes || null });
            showToast(`${result.processed} option(s) rejected`, 'success');
            setSelectedIds(new Set());
            fetchOptions();
        } catch (err: any) {
            showToast(parseErrorMessage(err), 'error');
        } finally {
            setBulkActioning(false);
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        const pendingOnPage = options.filter(o => o.status === 'pending').map(o => o.id);
        if (pendingOnPage.every(id => selectedIds.has(id))) {
            setSelectedIds(prev => {
                const next = new Set(prev);
                pendingOnPage.forEach(id => next.delete(id));
                return next;
            });
        } else {
            setSelectedIds(prev => {
                const next = new Set(prev);
                pendingOnPage.forEach(id => next.add(id));
                return next;
            });
        }
    };

    // -----------------------------------------------------------------------
    // Derived
    // -----------------------------------------------------------------------

    const pendingOnPage = options.filter(o => o.status === 'pending');
    const allPendingSelected = pendingOnPage.length > 0 && pendingOnPage.every(o => selectedIds.has(o.id));
    const hasPendingSelected = selectedIds.size > 0;
    const totalPages = Math.ceil(total / PAGE_SIZE);

    // Build tab list: "All" + dynamic fields + "Pending Review"
    const tabs: { key: string; label: string; badge?: number }[] = [
        { key: '__all__', label: 'All Fields' },
        ...fields.map(f => ({ key: f.field_name, label: formatFieldLabel(f.field_name) })),
        { key: '__pending__', label: 'Pending Review', badge: pendingCount },
    ];

    return (
        <div style={{ padding: '2rem' }}>
            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
                    padding: '0.75rem 1.25rem', borderRadius: '0.5rem',
                    background: toast.type === 'success' ? '#F0FDF4' : '#FEF2F2',
                    border: `1px solid ${toast.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
                    color: toast.type === 'success' ? '#166534' : '#991B1B',
                    fontWeight: 600, fontSize: '0.875rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    animation: 'fadeIn 0.2s ease-out',
                }}>
                    {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {toast.message}
                </div>
            )}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: '0 0 0.375rem' }}>
                        Master Data Management
                    </h1>
                    <p style={{ color: '#6B7280', margin: 0, fontSize: '0.875rem' }}>
                        Manage dropdown values for the doctor onboarding flow
                        {pendingCount > 0 && (
                            <span style={{ marginLeft: '0.5rem', background: '#FEF3C7', color: '#92400E', padding: '0.125rem 0.5rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600 }}>
                                {pendingCount} pending
                            </span>
                        )}
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className={styles.primaryBtn}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                >
                    <Plus size={16} /> Add Value
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.125rem', borderBottom: '1px solid #E5E7EB', marginBottom: '1.25rem', overflowX: 'auto' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => { setActiveField(tab.key); setPage(1); setSelectedIds(new Set()); setStatusFilter(tab.key === '__pending__' ? '' : statusFilter); }}
                        style={{
                            padding: '0.625rem 1rem',
                            borderBottom: activeField === tab.key ? '2px solid #293991' : '2px solid transparent',
                            color: activeField === tab.key ? '#293991' : '#6B7280',
                            fontWeight: activeField === tab.key ? 600 : 500,
                            background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                            cursor: 'pointer', fontSize: '0.875rem', whiteSpace: 'nowrap',
                            display: 'flex', alignItems: 'center', gap: '0.375rem',
                        }}
                    >
                        {tab.key === '__pending__' && <Clock size={14} />}
                        {tab.label}
                        {tab.badge !== undefined && tab.badge > 0 && (
                            <span style={{
                                background: '#EF4444', color: 'white', fontSize: '0.6875rem', fontWeight: 700,
                                borderRadius: '99px', padding: '0.0625rem 0.375rem', minWidth: '1.125rem', textAlign: 'center',
                            }}>
                                {tab.badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Controls: search + status filter + bulk actions */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: 'white', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #E5E7EB', flex: '1 1 220px', maxWidth: '320px', gap: '0.375rem' }}>
                    <Search size={16} color="#9CA3AF" />
                    <input
                        value={search}
                        onChange={e => handleSearchChange(e.target.value)}
                        placeholder="Search values..."
                        style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.875rem' }}
                    />
                </div>

                {activeField !== '__pending__' && (
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Filter size={14} color="#9CA3AF" />
                        <select
                            value={statusFilter}
                            onChange={e => { setStatusFilter(e.target.value as any); setPage(1); }}
                            style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #E5E7EB', fontSize: '0.875rem', outline: 'none', background: 'white', cursor: 'pointer', appearance: 'auto' }}
                        >
                            <option value="">All Statuses</option>
                            <option value="approved">Approved</option>
                            <option value="pending">Pending</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                )}

                {hasPendingSelected && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                        <button
                            onClick={handleBulkApprove}
                            disabled={bulkActioning}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.375rem',
                                padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #BBF7D0',
                                background: '#F0FDF4', color: '#166534', fontWeight: 600, cursor: 'pointer', fontSize: '0.8125rem',
                            }}
                        >
                            <CheckCircle size={14} /> Approve {selectedIds.size}
                        </button>
                        <button
                            onClick={handleBulkReject}
                            disabled={bulkActioning}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.375rem',
                                padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #FECACA',
                                background: '#FEF2F2', color: '#991B1B', fontWeight: 600, cursor: 'pointer', fontSize: '0.8125rem',
                            }}
                        >
                            <XCircle size={14} /> Reject {selectedIds.size}
                        </button>
                    </div>
                )}
            </div>

            {/* Table */}
            <div style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>
                        <Loader2 size={28} className="spin" style={{ margin: '0 auto 0.75rem' }} />
                        <p style={{ margin: 0 }}>Loading options…</p>
                    </div>
                ) : options.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>
                        No dropdown options found.
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                            <tr>
                                <th style={{ width: '36px', padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                                    {pendingOnPage.length > 0 && (
                                        <input
                                            type="checkbox"
                                            checked={allPendingSelected}
                                            onChange={toggleSelectAll}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    )}
                                </th>
                                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#6B7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Value</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#6B7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Field</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#6B7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Status</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#6B7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Submitted By</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#6B7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Date</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem', color: '#6B7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', width: '140px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {options.map(opt => {
                                const isLoading = actionLoading === opt.id;
                                const statusColor = STATUS_COLORS[opt.status];
                                return (
                                    <tr key={opt.id} style={{ borderBottom: '1px solid #F3F4F6', opacity: isLoading ? 0.5 : 1 }}>
                                        <td style={{ textAlign: 'center', padding: '0.75rem 0.5rem' }}>
                                            {opt.status === 'pending' && (
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(opt.id)}
                                                    onChange={() => toggleSelect(opt.id)}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                            )}
                                        </td>
                                        <td style={{ padding: '0.75rem', color: '#111827', fontWeight: 500, fontSize: '0.875rem' }}>
                                            {opt.value}
                                            {opt.label && opt.label !== opt.value && (
                                                <span style={{ display: 'block', fontSize: '0.75rem', color: '#9CA3AF' }}>{opt.label}</span>
                                            )}
                                            {opt.is_system && (
                                                <span style={{ marginLeft: '0.375rem', fontSize: '0.6875rem', background: '#F3F4F6', color: '#6B7280', padding: '0.0625rem 0.25rem', borderRadius: '0.25rem', fontWeight: 500 }}>system</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '0.75rem', fontSize: '0.8125rem', color: '#6B7280' }}>{formatFieldLabel(opt.field_name)}</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <span style={{
                                                display: 'inline-block', padding: '0.1875rem 0.625rem', borderRadius: '99px',
                                                fontSize: '0.75rem', fontWeight: 600,
                                                background: statusColor.bg, color: statusColor.text,
                                            }}>
                                                {opt.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem', fontSize: '0.8125rem', color: '#6B7280' }}>{opt.submitted_by || '—'}</td>
                                        <td style={{ padding: '0.75rem', fontSize: '0.8125rem', color: '#6B7280' }}>{formatDate(opt.created_at)}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
                                                {opt.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(opt.id)}
                                                            disabled={isLoading}
                                                            className={styles.actionBtn}
                                                            title="Approve"
                                                            style={{ color: '#16A34A' }}
                                                        >
                                                            <CheckCircle size={17} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(opt.id)}
                                                            disabled={isLoading}
                                                            className={styles.actionBtn}
                                                            title="Reject"
                                                            style={{ color: '#EF4444' }}
                                                        >
                                                            <XCircle size={17} />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => setEditOption(opt)}
                                                    className={styles.actionBtn}
                                                    title="Edit"
                                                    style={{ color: '#3B82F6' }}
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                {!opt.is_system && (
                                                    <button
                                                        onClick={() => handleDelete(opt)}
                                                        disabled={isLoading}
                                                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {!loading && total > PAGE_SIZE && (
                <div style={{
                    padding: '0.75rem 1rem', marginTop: '0.5rem',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    fontSize: '0.8125rem', color: '#6B7280',
                }}>
                    <span>
                        Showing <strong style={{ color: '#111827' }}>{(page - 1) * PAGE_SIZE + 1}</strong> to <strong style={{ color: '#111827' }}>{Math.min(page * PAGE_SIZE, total)}</strong> of <strong style={{ color: '#111827' }}>{total}</strong>
                    </span>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            style={{ padding: '0.375rem 0.875rem', border: '1px solid #D1D5DB', borderRadius: '0.375rem', background: page === 1 ? '#F3F4F6' : 'white', color: page === 1 ? '#9CA3AF' : '#374151', cursor: page === 1 ? 'not-allowed' : 'pointer', fontWeight: 500 }}
                        >
                            Previous
                        </button>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => p + 1)}
                            style={{ padding: '0.375rem 0.875rem', border: '1px solid #D1D5DB', borderRadius: '0.375rem', background: page >= totalPages ? '#F3F4F6' : 'white', color: page >= totalPages ? '#9CA3AF' : '#374151', cursor: page >= totalPages ? 'not-allowed' : 'pointer', fontWeight: 500 }}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Modals */}
            {showAddModal && (
                <AddValueModal
                    fields={fields}
                    defaultField={activeField !== '__all__' && activeField !== '__pending__' ? activeField : ''}
                    onClose={() => setShowAddModal(false)}
                    onAdded={() => { fetchOptions(); showToast('Value added successfully', 'success'); }}
                />
            )}
            {editOption && (
                <EditModal
                    option={editOption}
                    onClose={() => setEditOption(null)}
                    onUpdated={() => { fetchOptions(); showToast('Option updated', 'success'); }}
                />
            )}
        </div>
    );
};

export default AdminMasters;
