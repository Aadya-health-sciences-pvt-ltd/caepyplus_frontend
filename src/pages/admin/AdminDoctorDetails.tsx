import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, ShieldCheck, User, MapPin, Briefcase, Mail, Phone, Calendar } from 'lucide-react';
import styles from './AdminDashboard.module.css';

const AdminDoctorDetails = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const doctor = location.state?.doctor;

    const [status, setStatus] = useState(doctor?.status || 'Pending');

    if (!doctor) {
        return <div className={styles.container}>Doctor not found. <button onClick={() => navigate('/admin/dashboard')}>Go Back</button></div>;
    }

    const handleVerify = () => {
        setStatus('Verified');
        // In a real app, you'd make an API call here.
    };

    const handleReject = () => {
        if (window.confirm("Are you sure you want to reject this profile?")) {
            setStatus('Rejected');
        }
    };

    return (
        <div className={styles.container}>
            <button
                onClick={() => navigate('/admin/dashboard')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6B7280', marginBottom: '1.5rem' }}
            >
                <ArrowLeft size={18} /> Back to Dashboard
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h1 className={styles.title}>{doctor.name}</h1>
                    <p className={styles.subtitle}>{doctor.specialty} • {doctor.location}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span className={`${styles.statusBadge} ${status === 'Verified' ? styles.statusVerified : styles.statusPending}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                        {status}
                    </span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Main Profile Info */}
                <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid #F3F4F6', paddingBottom: '1rem' }}>Profile Information</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <DetailRow icon={<User size={18} />} label="Full Name" value={doctor.name} />
                        <DetailRow icon={<Briefcase size={18} />} label="Specialty" value={doctor.specialty} />
                        <DetailRow icon={<MapPin size={18} />} label="Location" value={doctor.location} />
                        <DetailRow icon={<Calendar size={18} />} label="Joined Date" value={doctor.date} />
                        <DetailRow icon={<Mail size={18} />} label="Email" value="doctor@example.com" />
                        <DetailRow icon={<Phone size={18} />} label="Phone" value="+1 (555) 000-0000" />
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>About</h4>
                        <p style={{ color: '#4B5563', lineHeight: '1.6' }}>
                            {doctor.name} is a dedicated {doctor.specialty} based in {doctor.location}.
                            This is a placeholder bio generated for the verified profile view.
                        </p>
                    </div>
                </div>

                {/* Actions Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Verification Actions</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button
                                onClick={handleVerify}
                                disabled={status === 'Verified'}
                                style={{
                                    background: status === 'Verified' ? '#D1FAE5' : '#10B981',
                                    color: status === 'Verified' ? '#065F46' : 'white',
                                    border: 'none', padding: '0.75rem', borderRadius: '0.5rem',
                                    cursor: status === 'Verified' ? 'default' : 'pointer',
                                    fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                }}
                            >
                                <ShieldCheck size={18} /> {status === 'Verified' ? 'Verified' : 'Verify Profile'}
                            </button>

                            {status !== 'Rejected' && (
                                <button
                                    onClick={handleReject}
                                    style={{
                                        background: 'white', border: '1px solid #EF4444', color: '#EF4444',
                                        padding: '0.75rem', borderRadius: '0.5rem', cursor: 'pointer',
                                        fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                    }}
                                >
                                    <X size={18} /> Reject Profile
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DetailRow = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{ color: '#9CA3AF', marginTop: '2px' }}>{icon}</div>
        <div>
            <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: '0 0 0.25rem 0' }}>{label}</p>
            <p style={{ fontSize: '0.875rem', color: '#111827', margin: 0, fontWeight: 500 }}>{value}</p>
        </div>
    </div>
);

export default AdminDoctorDetails;
