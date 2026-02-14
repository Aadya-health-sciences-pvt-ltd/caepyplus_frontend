import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, AlertCircle, CheckCircle, Eye, Trash2 } from 'lucide-react';
import styles from './AdminDashboard.module.css';

// Mock Data
const MOCK_DOCTORS = [
    { id: 1, name: "Dr. Sarah Wilson", specialty: "Cardiology", location: "New York, USA", status: "Verified", date: "2024-03-10" },
    { id: 2, name: "Dr. James Chen", specialty: "Dermatology", location: "San Francisco, USA", status: "Pending", date: "2024-03-12" },
    { id: 3, name: "Dr. Emily Rodriguez", specialty: "Pediatrics", location: "Chicago, USA", status: "Pending", date: "2024-03-14" },
    { id: 4, name: "Dr. Michael Chang", specialty: "Neurology", location: "Boston, USA", status: "Verified", date: "2024-03-08" },
    { id: 5, name: "Dr. Lisa Park", specialty: "General Practice", location: "Seattle, USA", status: "Pending", date: "2024-03-15" }
];

const AdminDoctorsList = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [doctors, setDoctors] = useState(MOCK_DOCTORS);

    const handleDelete = (id: number) => {
        if (window.confirm("Are you sure you want to delete this profile?")) {
            setDoctors(doctors.filter(doc => doc.id !== id));
        }
    };

    const filteredDoctors = doctors.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: doctors.length,
        verified: doctors.filter(d => d.status === "Verified").length,
        pending: doctors.filter(d => d.status === "Pending").length
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Doctor Management</h1>
                <p className={styles.subtitle}>Manage and verify doctor profiles</p>
            </div>

            {/* Stats Grid */}
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
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#F59E0B' }}>
                        <AlertCircle size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <h3>{stats.pending}</h3>
                        <p>Pending Verification</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#10B981' }}>
                        <CheckCircle size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <h3>{stats.verified}</h3>
                        <p>Verified Profiles</p>
                    </div>
                </div>
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
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Doctor Name</th>
                            <th>Specialty</th>
                            <th>Location</th>
                            <th>Date Added</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDoctors.map(doc => (
                            <tr key={doc.id}>
                                <td style={{ fontWeight: 500 }}>{doc.name}</td>
                                <td>{doc.specialty}</td>
                                <td>{doc.location}</td>
                                <td>{doc.date}</td>
                                <td>
                                    <span className={`${styles.statusBadge} ${doc.status === 'Verified' ? styles.statusVerified : styles.statusPending}`}>
                                        {doc.status}
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
                                        <button
                                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                            title="Delete Profile"
                                            onClick={() => handleDelete(doc.id)}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredDoctors.length === 0 && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>
                        No doctors found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDoctorsList;
