import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, AlertCircle, TrendingUp, Clock,
    CheckCircle, Activity, FileText
} from 'lucide-react';
import { adminService, type Doctor } from '../../services/adminService';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        verified: 0
    });
    const [pendingDoctors, setPendingDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch doctors to calculate stats
            // In a real app with many users, we should have a dedicated stats endpoint
            // For now, fetching a larger list to calculate local stats
            const response = await adminService.getDoctors(1, 100);

            const total = response.total;
            const pending = response.data.filter(d => d.onboarding_status === 'submitted').length;
            const verified = response.data.filter(d => d.onboarding_status === 'verified').length;

            setStats({ total, pending, verified });

            // Set pending doctors for "Needs Attention"
            // Filter strictly for 'submitted' status
            const pendingDocs = response.data
                .filter(d => d.onboarding_status === 'submitted')
                .slice(0, 5); // Show top 5

            setPendingDoctors(pendingDocs);
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Operational Dashboard</h1>
                <p className={styles.subtitle}>Overview of doctor onboarding and system activity.</p>
            </div>

            {/* Enhanced Stats Grid */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#3B82F6' }}>
                        <Users size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <h3>{stats.total}</h3>
                        <p>Total Onboarded</p>
                    </div>
                </div>
                <div className={styles.statCard} style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/doctors')}>
                    <div className={styles.statIcon} style={{ background: '#F59E0B' }}>
                        <AlertCircle size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <h3>{stats.pending}</h3>
                        <p>Pending Review</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#10B981' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <h3>{stats.verified}</h3>
                        <p>Verified Profiles</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#8B5CF6' }}>
                        <Clock size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <h3>4h</h3>
                        <p>Avg. Approval Time</p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>

                {/* Main Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Onboarding Trends Chart Wrapper */}
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <h3 className={styles.sectionTitle}>Onboarding Trends (Last 7 Days)</h3>
                        <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '1rem 0' }}>
                            {[12, 19, 15, 22, 28, 24, 30].map((val, idx) => (
                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                    <div style={{
                                        width: '40px', height: `${val * 5}px`,
                                        background: idx === 6 ? '#3B82F6' : '#E5E7EB',
                                        borderRadius: '4px 4px 0 0',
                                        transition: 'height 0.3s'
                                    }}></div>
                                    <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Needs Attention Queue */}
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 className={styles.sectionTitle}>Needs Attention</h3>
                            <button onClick={() => navigate('/admin/doctors')} style={{ color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>View All</button>
                        </div>

                        {loading ? (
                            <p style={{ color: '#6B7280', textAlign: 'center', padding: '1rem' }}>Loading...</p>
                        ) : pendingDoctors.length === 0 ? (
                            <p style={{ color: '#6B7280', textAlign: 'center', padding: '1rem' }}>No pending verifications.</p>
                        ) : (
                            pendingDoctors.map((doc) => (
                                <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #F3F4F6' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B45309' }}>
                                            <AlertCircle size={20} />
                                        </div>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#111827' }}>
                                                {doc.full_name || `${doc.first_name} ${doc.last_name}`}
                                            </h4>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#6B7280' }}>
                                                Pending Verification • {new Date(doc.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => navigate(`/admin/doctor/${doc.id}`, { state: { doctor: doc } })} style={{ padding: '0.5rem 1rem', background: '#EFF6FF', color: '#1D4ED8', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer' }}>
                                        Review
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                </div>

                {/* Right Column: Activity Feed */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: 'fit-content' }}>
                    <h3 className={styles.sectionTitle}>Recent Activity</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
                        {[
                            { icon: <CheckCircle size={16} />, color: '#10B981', bg: '#D1FAE5', text: 'Dr. Sarah Wilson verified', time: '10m ago' },
                            { icon: <FileText size={16} />, color: '#3B82F6', bg: '#EFF6FF', text: 'Dr. Michael Chang uploaded license', time: '30m ago' },
                            { icon: <Activity size={16} />, color: '#8B5CF6', bg: '#F5F3FF', text: 'System maintenance scheduled', time: '2h ago' },
                            { icon: <Users size={16} />, color: '#6B7280', bg: '#F3F4F6', text: '5 new signups today', time: '4h ago' },
                        ].map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '0.75rem' }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    background: item.bg, color: item.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                }}>
                                    {item.icon}
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#374151' }}>{item.text}</p>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#9CA3AF' }}>{item.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button style={{ width: '100%', padding: '0.75rem', marginTop: '1.5rem', background: 'none', border: '1px solid #E5E7EB', borderRadius: '6px', color: '#6B7280', cursor: 'pointer', fontSize: '0.875rem' }}>
                        View All Activity
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;
