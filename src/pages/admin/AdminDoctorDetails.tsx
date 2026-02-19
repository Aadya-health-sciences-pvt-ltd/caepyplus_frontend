import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, X, ShieldCheck, User, MapPin, Briefcase, Mail, Phone, Calendar } from 'lucide-react';
import styles from './AdminDashboard.module.css';

import { adminService, type Doctor } from '../../services/adminService';

const AdminDoctorDetails = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // In a real app, we might want to fetch by ID if state is missing, 
    // but for now we rely on the list passing it.
    const doctor = location.state?.doctor as Doctor;

    const [status, setStatus] = useState(doctor?.onboarding_status || 'pending');
    const [isLoading, setIsLoading] = useState(false);

    if (!doctor) {
        return <div className={styles.container}>Doctor not found. <button onClick={() => navigate('/admin/dashboard')}>Go Back</button></div>;
    }

    const doctorName = doctor.full_name || `${doctor.first_name} ${doctor.last_name}`;
    const locationStr = doctor.primary_practice_location || 'Location not set';
    const specialtyStr = doctor.specialty || 'Specialty not set';
    const joinedDate = new Date(doctor.created_at).toLocaleDateString();

    const handleVerify = async () => {
        if (window.confirm("Are you sure you want to verify this doctor?")) {
            setIsLoading(true);
            try {
                await adminService.verifyDoctor(doctor.id);
                setStatus('verified');
                alert("Doctor verified successfully");
            } catch (error) {
                console.error("Verification failed", error);
                alert("Failed to verify doctor");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleReject = async () => {
        const reason = window.prompt("Please provide a reason for rejection:");
        if (reason !== null) {
            setIsLoading(true);
            try {
                await adminService.rejectDoctor(doctor.id, reason);
                setStatus('rejected');
                alert("Doctor rejected successfully");
            } catch (error) {
                console.error("Rejection failed", error);
                alert("Failed to reject doctor");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const isVerified = status === 'verified' || status === 'VERIFIED';
    const isRejected = status === 'rejected' || status === 'REJECTED';

    return (
        <div className={styles.container}>
            <button
                onClick={() => navigate('/admin/doctors')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6B7280', marginBottom: '1.5rem' }}
            >
                <ArrowLeft size={18} /> Back to Doctors List
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h1 className={styles.title}>{doctorName}</h1>
                    <p className={styles.subtitle}>{specialtyStr} • {locationStr}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span className={`${styles.statusBadge} ${isVerified ? styles.statusVerified : isRejected ? styles.statusRejected : styles.statusPending}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                        {status}
                    </span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Main Profile Info */}
                <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid #F3F4F6', paddingBottom: '1rem' }}>Profile Information</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <DetailRow icon={<User size={18} />} label="Full Name" value={doctorName} />
                        <DetailRow icon={<Briefcase size={18} />} label="Specialty" value={specialtyStr} />
                        <DetailRow icon={<MapPin size={18} />} label="Location" value={locationStr} />
                        <DetailRow icon={<Calendar size={18} />} label="Joined Date" value={joinedDate} />
                        <DetailRow icon={<Mail size={18} />} label="Email" value={doctor.email} />
                        <DetailRow icon={<Phone size={18} />} label="Phone" value={doctor.phone || 'N/A'} />
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>About</h4>
                        <p style={{ color: '#4B5563', lineHeight: '1.6' }}>
                            Doctor details and bio would go here. (Bio field not yet in API response).
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
                                disabled={isVerified || isLoading}
                                style={{
                                    background: isVerified ? '#D1FAE5' : '#10B981',
                                    color: isVerified ? '#065F46' : 'white',
                                    border: 'none', padding: '0.75rem', borderRadius: '0.5rem',
                                    cursor: (isVerified || isLoading) ? 'default' : 'pointer',
                                    fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    opacity: isLoading ? 0.7 : 1
                                }}
                            >
                                <ShieldCheck size={18} /> {isVerified ? 'Verified' : 'Verify Profile'}
                            </button>

                            {!isRejected && !isVerified && (
                                <button
                                    onClick={handleReject}
                                    disabled={isLoading}
                                    style={{
                                        background: 'white', border: '1px solid #EF4444', color: '#EF4444',
                                        padding: '0.75rem', borderRadius: '0.5rem', cursor: isLoading ? 'default' : 'pointer',
                                        fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                        opacity: isLoading ? 0.7 : 1
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
