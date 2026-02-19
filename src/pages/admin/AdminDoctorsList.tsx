import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, AlertCircle, CheckCircle, Eye } from 'lucide-react';
import styles from './AdminDashboard.module.css';
import { adminService, type Doctor } from '../../services/adminService';

const AdminDoctorsList = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

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

    const handleVerify = async (id: number) => {
        if (window.confirm("Are you sure you want to verify this doctor?")) {
            try {
                await adminService.verifyDoctor(id);
                fetchDoctors(); // Refresh list
            } catch (error) {
                console.error("Verification failed", error);
                alert("Failed to verify doctor");
            }
        }
    };

    const handleReject = async (id: number) => {
        const reason = window.prompt("Please provide a reason for rejection:");
        if (reason !== null) { // User didn't cancel
            try {
                await adminService.rejectDoctor(id, reason);
                fetchDoctors(); // Refresh list
            } catch (error) {
                console.error("Rejection failed", error);
                alert("Failed to reject doctor");
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
                                                    onClick={() => navigate(`/admin/doctor/${doc.id}`, { state: { doctor: doc } })}
                                                >
                                                    <Eye size={18} />
                                                </button>

                                                {(status === 'submitted' || status === 'SUBMITTED' || status === 'pending' || status === 'PENDING') && (
                                                    <>
                                                        <button
                                                            className={`${styles.actionBtn}`}
                                                            style={{ color: '#10B981' }}
                                                            title="Verify"
                                                            onClick={() => handleVerify(doc.id)}
                                                        >
                                                            <CheckCircle size={18} />
                                                        </button>
                                                        <button
                                                            className={`${styles.actionBtn}`}
                                                            style={{ color: '#EF4444' }}
                                                            title="Reject"
                                                            onClick={() => handleReject(doc.id)}
                                                        >
                                                            <AlertCircle size={18} />
                                                        </button>
                                                    </>
                                                )}
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
        </div>
    );
};

export default AdminDoctorsList;
