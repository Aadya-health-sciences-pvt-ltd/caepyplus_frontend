import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, X, ShieldCheck, User, MapPin, Briefcase, Mail, Phone, Calendar, FileText, Globe, IndianRupee, GraduationCap, Clock, AlertTriangle } from 'lucide-react';
import styles from './AdminDashboard.module.css';

import { adminService, type Doctor } from '../../services/adminService';

const AdminDoctorDetails = () => {
    const navigate = useNavigate();
    const location = useLocation();
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
    const regNumber = doctor.medical_registration_number || null;

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
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6B7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}
            >
                <ArrowLeft size={18} /> Back to Doctors List
            </button>

            {/* Header */}
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

            {/* Registration Number - Highlighted Card (Primary for verification) */}
            <div style={{
                background: regNumber ? 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)' : '#FEF3C7',
                border: regNumber ? '2px solid #818CF8' : '2px solid #F59E0B',
                borderRadius: '1rem',
                padding: '1.5rem 2rem',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '12px',
                        background: regNumber ? '#4F46E5' : '#F59E0B',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        {regNumber
                            ? <FileText size={24} color="white" />
                            : <AlertTriangle size={24} color="white" />
                        }
                    </div>
                    <div>
                        <p style={{ fontSize: '0.8125rem', color: regNumber ? '#4338CA' : '#92400E', fontWeight: 500, margin: '0 0 0.25rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Medical Registration Number
                        </p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 700, color: regNumber ? '#1E1B4B' : '#78350F', margin: 0, letterSpacing: '0.02em', fontFamily: 'monospace' }}>
                            {regNumber || 'Not Provided'}
                        </p>
                    </div>
                </div>
                {regNumber && (
                    <a
                        href={`https://www.nmc.org.in/information-desk/indian-medical-register/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            padding: '0.625rem 1.25rem',
                            background: '#4F46E5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            textDecoration: 'none',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        Verify on NMC ↗
                    </a>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Main Profile Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Basic Information */}
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid #F3F4F6', paddingBottom: '1rem' }}>
                            Basic Information
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <DetailRow icon={<User size={18} />} label="Full Name" value={doctorName} />
                            <DetailRow icon={<Briefcase size={18} />} label="Specialty" value={specialtyStr} />
                            <DetailRow icon={<Mail size={18} />} label="Email" value={doctor.email} />
                            <DetailRow icon={<Phone size={18} />} label="Phone" value={doctor.phone || 'N/A'} />
                            <DetailRow icon={<MapPin size={18} />} label="Practice Location" value={locationStr} />
                            <DetailRow icon={<Calendar size={18} />} label="Joined Date" value={joinedDate} />
                        </div>
                    </div>

                    {/* Professional Details */}
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid #F3F4F6', paddingBottom: '1rem' }}>
                            Professional Details
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <DetailRow icon={<GraduationCap size={18} />} label="Qualifications" value={doctor.qualifications || 'Not provided'} />
                            <DetailRow icon={<Clock size={18} />} label="Experience" value={doctor.experience_years ? `${doctor.experience_years} years` : 'Not provided'} />
                            <DetailRow icon={<IndianRupee size={18} />} label="Consultation Fee" value={doctor.consultation_fee || 'Not provided'} />
                            <DetailRow icon={<Globe size={18} />} label="Languages" value={doctor.languages || 'Not provided'} />
                        </div>

                        {doctor.bio && (
                            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #F3F4F6' }}>
                                <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: '0 0 0.5rem 0', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>About</p>
                                <p style={{ color: '#374151', lineHeight: '1.7', fontSize: '0.9375rem', margin: 0 }}>
                                    {doctor.bio}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Actions + Quick Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Verification Actions */}
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

                    {/* Registration Summary Card */}
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Registration Summary</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <SummaryItem label="Registration No." value={regNumber || 'N/A'} highlight={!!regNumber} />
                            <SummaryItem label="Specialty" value={specialtyStr} />
                            <SummaryItem label="Experience" value={doctor.experience_years ? `${doctor.experience_years} yrs` : 'N/A'} />
                            <SummaryItem label="Status" value={status} badge={true} isVerified={isVerified} isRejected={isRejected} />
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

const SummaryItem = ({ label, value, highlight, badge, isVerified, isRejected }: {
    label: string;
    value: string;
    highlight?: boolean;
    badge?: boolean;
    isVerified?: boolean;
    isRejected?: boolean;
}) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #F9FAFB' }}>
        <span style={{ fontSize: '0.8125rem', color: '#6B7280' }}>{label}</span>
        {badge ? (
            <span style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.25rem 0.625rem',
                borderRadius: '999px',
                background: isVerified ? '#D1FAE5' : isRejected ? '#FEE2E2' : '#FEF3C7',
                color: isVerified ? '#065F46' : isRejected ? '#991B1B' : '#92400E',
                textTransform: 'capitalize',
            }}>
                {value}
            </span>
        ) : (
            <span style={{
                fontSize: '0.875rem',
                fontWeight: highlight ? 700 : 500,
                color: highlight ? '#4F46E5' : '#111827',
                fontFamily: highlight ? 'monospace' : 'inherit',
            }}>
                {value}
            </span>
        )}
    </div>
);

export default AdminDoctorDetails;
