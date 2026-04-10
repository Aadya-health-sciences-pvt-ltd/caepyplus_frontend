'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAppRouter } from '../../lib/router';
import {
    ArrowLeft, X, ShieldCheck, User, MapPin, Briefcase, Mail, Phone,
    Calendar, FileText, IndianRupee, GraduationCap, Clock,
    AlertTriangle, Stethoscope, Heart, MessageSquare, Image, Loader2,
    Send
} from 'lucide-react';
import styles from './AdminDashboard.module.css';

import { adminService, type Doctor, type DoctorFullProfile, type DoctorDetails } from '../../services/adminService';
import { calculateProfileProgressFromApi } from '../../lib/profileProgress';

const AdminDoctorDetails = () => {
    const router = useAppRouter();
    const params = useParams<{ id: string }>();
    const routeId = params.id;

    const [navDoctor, setNavDoctor] = useState<Doctor | undefined>(undefined);
    useEffect(() => {
        try {
            const s = JSON.parse(sessionStorage.getItem('nav_state') || '{}');
            if (s.doctor) setNavDoctor(s.doctor);
            sessionStorage.removeItem('nav_state');
        } catch { }
    }, []);

    const [profile, setProfile] = useState<DoctorFullProfile | null>(null);
    const [doctor] = useState<Doctor | null>(navDoctor || null);
    const [status, setStatus] = useState(navDoctor?.onboarding_status || 'pending');
    const [isLoading, setIsLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [isFetching, setIsFetching] = useState(true);

    // Fetch full profile from backend
    useEffect(() => {
        const id = routeId ? parseInt(routeId) : doctor?.id;
        if (!id) { setIsFetching(false); return; }

        (async () => {
            try {
                const data = await adminService.getDoctorFullProfile(id);
                setProfile(data);
                setStatus(data.identity.onboarding_status);
            } catch (err) {
                console.warn('Failed to fetch full profile, falling back to navigation state', err);
                setFetchError('Could not load full profile from server. Showing limited data.');
            } finally {
                setIsFetching(false);
            }
        })();
    }, [routeId, doctor?.id]);

    // Build display data — prefer profile (API) over navigation-state doctor
    const identity = profile?.identity;
    const details = (profile as any)?.doctor || profile?.details;
    const media = profile?.media || [];

    const doctorName = identity
        ? [identity.first_name, identity.last_name].filter(Boolean).join(' ').trim() || (identity as any).full_name || 'Unnamed'
        : doctor?.full_name || [doctor?.first_name, doctor?.last_name].filter(Boolean).join(' ').trim() || 'Unnamed';

    const email = identity?.email || doctor?.email || '';
    const phone = identity?.phone_number || doctor?.phone || '';
    const specialty = details?.primary_specialization || details?.specialty || doctor?.specialty || 'Specialty not set';
    const locationStr = details?.primary_practice_location || doctor?.primary_practice_location || 'Location not set';
    const joinedDate = identity?.registered_at || doctor?.created_at;
    const regNumber = details?.medical_registration_number || details?.registration_number || doctor?.medical_registration_number || null;
    const medCouncil = details?.medical_council || 'Not Provided';

    // ---- Email Action Dialog state ----
    type DialogAction = 'verify' | 'reject' | null;
    const [dialogAction, setDialogAction] = useState<DialogAction>(null);
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');

    const getVerifyEmailContent = useCallback(() => ({
        subject: `Profile Verified - Welcome to Caepy, Dr. ${doctorName}!`,
        body: `Dear Dr. ${doctorName},

Congratulations! We are delighted to inform you that your profile on Caepy has been reviewed and verified successfully.

Here is a summary of your verified profile:
- Name: Dr. ${doctorName}
- Specialty: ${specialty}
- Registration No: ${regNumber || 'N/A'}
- Email: ${email}
- Phone: ${phone}

Your profile is now live and visible to patients on the Caepy platform. You can log in at any time to update your information, manage appointments, and engage with your patients.

If you have any questions or need assistance, please don't hesitate to reach out to our support team.

Warm regards,
The Caepy Team`,
    }), [doctorName, specialty, regNumber, email, phone]);

    const getRejectEmailContent = useCallback(() => ({
        subject: `Profile Review Update - Action Required, Dr. ${doctorName}`,
        body: `Dear Dr. ${doctorName},

Thank you for registering on Caepy. After a careful review of your submitted profile, we regret to inform you that your profile could not be verified at this time.

Reason for rejection:
[Please specify the reason for rejection here]

Profile details:
- Name: Dr. ${doctorName}
- Specialty: ${specialty}
- Registration No: ${regNumber || 'N/A'}
- Email: ${email}

We encourage you to review the feedback above, update your profile accordingly, and resubmit for verification. If you believe this decision was made in error, please contact our support team.

Best regards,
The Caepy Team`,
    }), [doctorName, specialty, regNumber, email]);

    if (isFetching) {
        return (
            <div className={styles.container} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!doctor && !profile) {
        return <div className={styles.container}>Doctor not found. <button onClick={() => router.push('/admin/dashboard')}>Go Back</button></div>;
    }

    const openVerifyDialog = () => {
        const content = getVerifyEmailContent();
        setEmailSubject(content.subject);
        setEmailBody(content.body);
        setDialogAction('verify');
    };

    const openRejectDialog = () => {
        const content = getRejectEmailContent();
        setEmailSubject(content.subject);
        setEmailBody(content.body);
        setDialogAction('reject');
    };

    const handleDialogConfirm = async () => {
        const id = identity?.doctor_id || doctor?.id;
        if (!id) return;
        setIsLoading(true);
        try {
            if (dialogAction === 'verify') {
                await adminService.verifyDoctor(id, {
                    send_email: true,
                    email_subject: emailSubject,
                    email_body: emailBody
                });
                setStatus('verified');
                alert('Doctor verified successfully. Notification email will be sent.');
            } else if (dialogAction === 'reject') {
                await adminService.rejectDoctor(id, {
                    reason: "Rejection email sent",
                    send_email: true,
                    email_subject: emailSubject,
                    email_body: emailBody
                });
                setStatus('rejected');
                alert('Doctor rejected. Notification email will be sent.');
            }
        } catch (error) {
            console.error(`${dialogAction} failed`, error);
            alert(`Failed to ${dialogAction} doctor`);
        } finally {
            setIsLoading(false);
            setDialogAction(null);
        }
    };

    const isVerified = status === 'verified' || status === 'VERIFIED';
    const isRejected = status === 'rejected' || status === 'REJECTED';

    return (
        <>
            <div className={styles.container}>
                <button
                    onClick={() => router.push('/admin/dashboard/doctors')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6B7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}
                >
                    <ArrowLeft size={18} /> Back to Doctors List
                </button>

                {fetchError && (
                    <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: '#92400E' }}>
                        ⚠️ {fetchError}
                    </div>
                )}

                {/* Header */}
                <div className={styles.flexBetweenStart} style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        {details?.profile_photo ? (
                            <img
                                src={details.profile_photo}
                                alt={doctorName}
                                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            />
                        ) : (
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                                <User size={40} />
                            </div>
                        )}
                        <div>
                            <h1 className={styles.title} style={{ margin: '0 0 0.25rem 0' }}>{doctorName}</h1>
                            <p className={styles.subtitle} style={{ margin: 0 }}>{specialty} • {locationStr}</p>
                        </div>
                    </div>
                </div>

                {/* Registration Number - Highlighted Card */}
                {!isVerified && (
                    <div style={{
                        background: regNumber ? 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)' : '#FEF3C7',
                        border: regNumber ? '2px solid #818CF8' : '2px solid #F59E0B',
                        borderRadius: '1rem', padding: '1.5rem 2rem', marginBottom: '2rem',
                    }} className={styles.regCard}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '12px',
                                background: regNumber ? '#4F46E5' : '#F59E0B',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                {regNumber ? <FileText size={24} color="white" /> : <AlertTriangle size={24} color="white" />}
                            </div>
                            <div>
                                <p style={{ fontSize: '0.8125rem', color: regNumber ? '#4338CA' : '#92400E', fontWeight: 500, margin: '0 0 0.25rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Medical Registration Number
                                </p>
                                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: regNumber ? '#1E1B4B' : '#78350F', margin: 0, letterSpacing: '0.02em', fontFamily: 'monospace' }}>
                                    {regNumber || 'Not Provided'}
                                </p>
                                {regNumber && medCouncil !== 'Not Provided' && (
                                    <p style={{ fontSize: '0.875rem', color: '#4338CA', marginTop: '0.25rem', fontWeight: 500 }}>
                                        {medCouncil}
                                    </p>
                                )}
                            </div>
                        </div>
                        {regNumber && (
                            <a
                                href="https://www.nmc.org.in/information-desk/indian-medical-register/"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    padding: '0.625rem 1.25rem', background: '#4F46E5', color: 'white',
                                    border: 'none', borderRadius: '0.5rem', fontWeight: 500,
                                    fontSize: '0.875rem', cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap',
                                }}
                            >
                                Verify on NMC ↗
                            </a>
                        )}
                    </div>
                )}

                <div className={styles.grid2Cols1Fr}>
                    {/* Main Profile Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* Basic Information */}
                        <SectionCard title="Basic Information">
                            <div className={styles.grid2ColsEqual}>
                                <DetailRow icon={<User size={18} />} label="Full Name" value={doctorName} />
                                <DetailRow icon={<Briefcase size={18} />} label="Specialty" value={specialty} />
                                <DetailRow icon={<Mail size={18} />} label="Email" value={email || 'N/A'} />
                                <DetailRow icon={<Phone size={18} />} label="Phone" value={phone || 'N/A'} />
                                <DetailRow icon={<MapPin size={18} />} label="Practice Location" value={locationStr} />
                                <DetailRow icon={<Calendar size={18} />} label="Joined Date" value={joinedDate ? new Date(joinedDate).toLocaleDateString() : 'N/A'} />
                            </div>

                            {/* Centres of Practice */}
                            <TagList label="Centres of Practice" items={details?.centres_of_practice} fallback={doctor?.centres_of_practice} />
                        </SectionCard>

                        {/* Credentials & Trust Markers (Block 2) */}
                        {details && (
                            <SectionCard title="Credentials & Trust Markers" icon={<GraduationCap size={18} />}>
                                <div className={styles.grid2ColsEqual}>
                                    <DetailRow icon={<Calendar size={18} />} label="Year of MBBS" value={details.year_of_mbbs?.toString() || 'N/A'} />
                                    <DetailRow icon={<Calendar size={18} />} label="Year of Specialisation" value={details.year_of_specialisation?.toString() || 'N/A'} />
                                    <DetailRow icon={<Clock size={18} />} label="Years of Clinical Experience" value={details.years_of_clinical_experience?.toString() || details.years_of_experience?.toString() || doctor?.years_of_experience?.toString() || 'N/A'} />
                                    <DetailRow icon={<Clock size={18} />} label="Years Post Specialisation" value={details.years_post_specialisation?.toString() || 'N/A'} />
                                </div>
                                <TagList label="Qualifications" items={details.qualifications} fallback={doctor?.qualifications} />
                                <TagList label="Fellowships" items={details.fellowships} fallback={doctor?.fellowships} />
                                <TagList label="Professional Memberships" items={details.professional_memberships} fallback={doctor?.professional_memberships} />
                                <TagList label="Awards & Honours" items={details.awards_academic_honours} fallback={doctor?.awards_academic_honours} />
                            </SectionCard>
                        )}

                        {/* Clinical Focus & Expertise (Block 3) */}
                        {details && (
                            <SectionCard title="Clinical Focus & Expertise" icon={<Stethoscope size={18} />}>
                                {details.practice_segments && (
                                    <DetailRow icon={<Briefcase size={18} />} label="Practice Segments" value={details.practice_segments} />
                                )}
                                <TagList label="Areas of Clinical Interest" items={details.areas_of_clinical_interest} fallback={doctor?.areas_of_clinical_interest} />
                                <TagList label="Conditions Commonly Treated" items={details.conditions_commonly_treated} />
                                <TagList label="Known For Treating" items={details.conditions_known_for} />
                                <TagList label="Wants to Treat More" items={details.conditions_want_to_treat_more} />
                            </SectionCard>
                        )}

                        {/* The Human Side (Block 4) */}
                        {details && (hasHumanSide(details)) && (
                            <SectionCard title="The Human Side" icon={<Heart size={18} />}>
                                <TagList label="Training Experience" items={details.training_experience} />
                                <TagList label="Motivation in Practice" items={details.motivation_in_practice} />
                                <TagList label="Unwinding After Work" items={details.unwinding_after_work} />
                                <TagList label="Recognition & Identity" items={details.recognition_identity} />
                                <TagList label="Quality Time Interests" items={details.quality_time_interests} />
                                {details.quality_time_interests_text && <TextBlock label="Quality Time Details" value={details.quality_time_interests_text} />}
                                {details.professional_achievement && <TextBlock label="Professional Achievement" value={details.professional_achievement} />}
                                {details.personal_achievement && <TextBlock label="Personal Achievement" value={details.personal_achievement} />}
                                {details.professional_aspiration && <TextBlock label="Professional Aspiration" value={details.professional_aspiration} />}
                                {details.personal_aspiration && <TextBlock label="Personal Aspiration" value={details.personal_aspiration} />}
                            </SectionCard>
                        )}

                        {/* Patient Value & Choice Factors (Block 5) */}
                        {details && (details.what_patients_value_most || details.approach_to_care || details.availability_philosophy) && (
                            <SectionCard title="Patient Value & Choice Factors" icon={<MessageSquare size={18} />}>
                                {details.what_patients_value_most && <TextBlock label="What Patients Value Most" value={details.what_patients_value_most} />}
                                {details.approach_to_care && <TextBlock label="Approach to Care" value={details.approach_to_care} />}
                                {details.availability_philosophy && <TextBlock label="Availability Philosophy" value={details.availability_philosophy} />}
                            </SectionCard>
                        )}

                        {/* Generated Content */}
                        {details && (details.professional_overview || details.about_me || details.professional_tagline || details.profile_summary) && (
                            <SectionCard title="Generated Profile Content" icon={<FileText size={18} />}>
                                {details.professional_tagline && <TextBlock label="Professional Tagline" value={details.professional_tagline} />}
                                {details.professional_overview && <TextBlock label="Professional Overview" value={details.professional_overview} />}
                                {details.about_me && <TextBlock label="About Me" value={details.about_me} />}
                                {details.profile_summary && <TextBlock label="Profile Summary" value={details.profile_summary} />}
                            </SectionCard>
                        )}

                        {/* Media / Documents */}
                        {media.length > 0 && (
                            <SectionCard title="Media & Documents" icon={<Image size={18} />}>
                                <div className={styles.gridAutoFill}>
                                    {media.map(m => (
                                        <div key={m.media_id} style={{ background: '#F9FAFB', borderRadius: '0.5rem', padding: '1rem', border: '1px solid #E5E7EB' }}>
                                            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111827', margin: '0 0 0.25rem 0', wordBreak: 'break-all' }}>{m.file_name}</p>
                                            <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: '0 0 0.5rem 0' }}>
                                                {m.media_category} • {m.media_type}
                                                {m.file_size ? ` • ${(m.file_size / 1024).toFixed(0)} KB` : ''}
                                            </p>
                                            <a
                                                href={m.file_uri}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ fontSize: '0.8125rem', color: '#4F46E5', textDecoration: 'none', fontWeight: 500 }}
                                            >
                                                View File ↗
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>
                        )}
                    </div>

                    {/* Right Column: Actions + Quick Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Verification Actions */}
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Verification Actions</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <button
                                    onClick={openVerifyDialog}
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
                                        onClick={openRejectDialog}
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

                        {/* Profile Completeness Card */}
                        {(() => {
                            const profileData: Record<string, any> = {
                                full_name: doctorName,
                                specialty: specialty,
                                primary_practice_location: locationStr !== 'Location not set' ? locationStr : null,
                                years_of_clinical_experience: details?.years_of_clinical_experience || details?.years_of_experience || doctor?.years_of_experience,
                                medical_registration_number: regNumber,
                                medical_council: medCouncil !== 'Not Provided' ? medCouncil : null,
                                profile_photo: details?.profile_photo || null,
                                year_of_mbbs: details?.year_of_mbbs,
                                conditions_commonly_treated: details?.conditions_commonly_treated,
                                conditions_known_for: details?.conditions_known_for,
                                training_experience: details?.training_experience,
                                motivation_in_practice: details?.motivation_in_practice,
                                unwinding_after_work: details?.unwinding_after_work,
                                recognition_identity: details?.recognition_identity,
                                quality_time_interests: details?.quality_time_interests,
                                professional_achievement: details?.professional_achievement,
                                personal_achievement: details?.personal_achievement,
                                professional_aspiration: details?.professional_aspiration,
                                personal_aspiration: details?.personal_aspiration,
                                what_patients_value_most: details?.what_patients_value_most,
                                approach_to_care: details?.approach_to_care,
                                availability_philosophy: details?.availability_philosophy,
                                content_seeds: details?.content_seeds,
                            };
                            const progress = calculateProfileProgressFromApi(profileData);
                            const barColor = progress.totalPercentage >= 80 ? '#10B981' : progress.totalPercentage >= 50 ? '#F59E0B' : '#EF4444';
                            return (
                                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        Profile Completeness
                                        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: barColor }}>{progress.totalPercentage}%</span>
                                    </h3>
                                    {/* Overall bar */}
                                    <div style={{ height: '8px', borderRadius: '4px', background: '#F3F4F6', marginBottom: '1rem', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${progress.totalPercentage}%`, background: barColor, borderRadius: '4px', transition: 'width 0.4s ease' }} />
                                    </div>
                                    {/* Section breakdown */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {progress.sections.map((sec) => (
                                            <div key={sec.section} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                                                <div style={{
                                                    width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                                                    background: sec.isComplete ? '#10B981' : '#E5E7EB',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: sec.isComplete ? 'white' : '#9CA3AF', fontSize: '0.65rem', fontWeight: 700
                                                }}>
                                                    {sec.isComplete ? '✓' : sec.section}
                                                </div>
                                                <span style={{ flex: 1, color: sec.isComplete ? '#111827' : '#9CA3AF', fontSize: '0.75rem' }}>
                                                    S{sec.section}: {sec.label}
                                                </span>
                                                <span style={{ color: sec.isComplete ? '#10B981' : '#9CA3AF', fontWeight: 600, fontSize: '0.75rem' }}>
                                                    {sec.earned}/{sec.weight}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    {!progress.hasProfilePicture && (
                                        <p style={{ fontSize: '0.7rem', color: '#F59E0B', marginTop: '0.75rem', margin: '0.75rem 0 0' }}>
                                            ⚠ Profile photo missing — +5% when added
                                        </p>
                                    )}
                                </div>
                            );
                        })()}

                        {/* Registration Summary Card */}
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Registration Summary</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <SummaryItem label="Registration No." value={regNumber || 'N/A'} highlight={!!regNumber} />
                                <SummaryItem label="Specialty" value={specialty} />
                                <SummaryItem label="Experience" value={
                                    details?.years_of_clinical_experience ? `${details.years_of_clinical_experience} yrs` :
                                        details?.years_of_experience ? `${details.years_of_experience} yrs` :
                                            doctor?.years_of_experience ? `${doctor.years_of_experience} yrs` : 'N/A'
                                } />
                            </div>
                        </div>

                        {/* Languages & Communication */}
                        {((details?.languages_spoken && details.languages_spoken.length > 0) || (doctor?.languages && doctor.languages.length > 0)) && (
                            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Languages</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {(details?.languages_spoken || doctor?.languages || []).map((lang: string, i: number) => (
                                        <span key={i} style={{
                                            background: '#EFF6FF', color: '#1D4ED8', padding: '0.25rem 0.75rem',
                                            borderRadius: '999px', fontSize: '0.8125rem', fontWeight: 500,
                                        }}>
                                            {lang}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Consultation Fee */}
                        {(details?.consultation_fee || doctor?.consultation_fee) && (
                            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Consultation Fee</h3>
                                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10B981', margin: 0 }}>
                                    <IndianRupee size={20} style={{ verticalAlign: 'middle' }} />
                                    {details?.consultation_fee || doctor?.consultation_fee}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ---- Email Action Dialog Overlay ---- */}
            {
                dialogAction && (
                    <div style={{
                        position: 'fixed', inset: 0, zIndex: 1000,
                        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '1rem',
                    }} onClick={() => setDialogAction(null)}>
                        <div style={{
                            background: 'white', borderRadius: '1rem', width: '100%', maxWidth: '640px',
                            maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                        }} onClick={e => e.stopPropagation()}>
                            {/* Dialog Header */}
                            <div style={{
                                padding: '1.25rem 1.5rem',
                                borderBottom: '1px solid #F3F4F6',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                background: dialogAction === 'verify' ? '#ECFDF5' : '#FEF2F2',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    {dialogAction === 'verify'
                                        ? <ShieldCheck size={20} style={{ color: '#059669' }} />
                                        : <AlertTriangle size={20} style={{ color: '#DC2626' }} />}
                                    <h3 style={{
                                        margin: 0, fontSize: '1.0625rem', fontWeight: 600,
                                        color: dialogAction === 'verify' ? '#065F46' : '#991B1B',
                                    }}>
                                        {dialogAction === 'verify' ? 'Verify Profile & Send Email' : 'Reject Profile & Send Email'}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setDialogAction(null)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: '#6B7280' }}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Dialog Body */}
                            <div style={{ padding: '1.5rem', overflow: 'auto', flex: 1 }}>
                                <p style={{ fontSize: '0.8125rem', color: '#6B7280', margin: '0 0 1rem 0' }}>
                                    The following email will be sent to <strong>{email || 'the doctor'}</strong>. You can edit the content before sending.
                                </p>

                                {/* To field */}
                                <div style={{ marginBottom: '0.75rem' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>To</label>
                                    <div style={{
                                        marginTop: '0.25rem', padding: '0.625rem 0.75rem', background: '#F9FAFB',
                                        borderRadius: '0.5rem', border: '1px solid #E5E7EB', fontSize: '0.875rem', color: '#374151',
                                    }}>
                                        <Mail size={14} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle', color: '#9CA3AF' }} />
                                        {email || 'No email on file'}
                                    </div>
                                </div>

                                {/* Subject field */}
                                <div style={{ marginBottom: '0.75rem' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subject</label>
                                    <input
                                        type="text"
                                        value={emailSubject}
                                        onChange={e => setEmailSubject(e.target.value)}
                                        style={{
                                            width: '100%', marginTop: '0.25rem', padding: '0.625rem 0.75rem',
                                            border: '1px solid #D1D5DB', borderRadius: '0.5rem', fontSize: '0.875rem',
                                            outline: 'none', boxSizing: 'border-box',
                                        }}
                                    />
                                </div>

                                {/* Email Body */}
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Body</label>
                                    <textarea
                                        value={emailBody}
                                        onChange={e => setEmailBody(e.target.value)}
                                        rows={14}
                                        style={{
                                            width: '100%', marginTop: '0.25rem', padding: '0.75rem',
                                            border: '1px solid #D1D5DB', borderRadius: '0.5rem', fontSize: '0.875rem',
                                            fontFamily: 'inherit', lineHeight: '1.6', resize: 'vertical',
                                            outline: 'none', boxSizing: 'border-box', minHeight: '200px',
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Dialog Footer */}
                            <div style={{
                                padding: '1rem 1.5rem', borderTop: '1px solid #F3F4F6',
                                display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', background: '#FAFAFA',
                            }}>
                                <button
                                    onClick={() => setDialogAction(null)}
                                    style={{
                                        padding: '0.625rem 1.25rem', borderRadius: '0.5rem',
                                        border: '1px solid #D1D5DB', background: 'white', color: '#374151',
                                        fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer',
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDialogConfirm}
                                    disabled={isLoading}
                                    style={{
                                        padding: '0.625rem 1.25rem', borderRadius: '0.5rem', border: 'none',
                                        background: dialogAction === 'verify' ? '#10B981' : '#EF4444',
                                        color: 'white', fontWeight: 500, fontSize: '0.875rem',
                                        cursor: isLoading ? 'default' : 'pointer', opacity: isLoading ? 0.7 : 1,
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    }}
                                >
                                    <Send size={15} />
                                    {isLoading ? 'Processing...' : (dialogAction === 'verify' ? 'Verify & Send' : 'Reject & Send')}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
};

// ---------------------------------------------------------------------------
// Helper Components
// ---------------------------------------------------------------------------

const SectionCard = ({ title, icon, children }: { title: string; icon?: any; children: React.ReactNode }) => (
    <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h3 style={{
            fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem',
            borderBottom: '1px solid #F3F4F6', paddingBottom: '1rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
            {icon && <span style={{ color: '#6B7280' }}>{icon}</span>}
            {title}
        </h3>
        {children}
    </div>
);

const DetailRow = ({ icon, label, value }: { icon: any; label: string; value: string }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{ color: '#9CA3AF', marginTop: '2px' }}>{icon}</div>
        <div>
            <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: '0 0 0.25rem 0' }}>{label}</p>
            <p style={{ fontSize: '0.875rem', color: '#111827', margin: 0, fontWeight: 500 }}>{value}</p>
        </div>
    </div>
);

const TagList = ({ label, items, fallback }: { label: string; items?: string[] | null; fallback?: string[] | null }) => {
    const list = items?.length ? items : (fallback?.length ? fallback : null);
    if (!list) return null;
    return (
        <div style={{ marginTop: '1.25rem' }}>
            <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: '0 0 0.5rem 0', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {list.map((item, i) => (
                    <span key={i} style={{
                        background: '#F3F4F6', color: '#374151', padding: '0.3rem 0.75rem',
                        borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 500,
                    }}>
                        {item}
                    </span>
                ))}
            </div>
        </div>
    );
};

const TextBlock = ({ label, value }: { label: string; value: string }) => (
    <div style={{ marginTop: '1.25rem' }}>
        <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: '0 0 0.5rem 0', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
        <p style={{ color: '#374151', lineHeight: '1.7', fontSize: '0.9375rem', margin: 0 }}>{value}</p>
    </div>
);

const SummaryItem = ({ label, value, highlight, badge, isVerified, isRejected }: {
    label: string; value: string; highlight?: boolean; badge?: boolean; isVerified?: boolean; isRejected?: boolean;
}) => (
    <div className={styles.flexBetweenCenter} style={{ padding: '0.5rem 0', borderBottom: '1px solid #F9FAFB' }}>
        <span style={{ fontSize: '0.8125rem', color: '#6B7280' }}>{label}</span>
        {badge ? (
            <span style={{
                fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.625rem', borderRadius: '999px',
                background: isVerified ? '#D1FAE5' : isRejected ? '#FEE2E2' : '#FEF3C7',
                color: isVerified ? '#065F46' : isRejected ? '#991B1B' : '#92400E',
                textTransform: 'capitalize',
            }}>
                {value}
            </span>
        ) : (
            <span style={{
                fontSize: '0.875rem', fontWeight: highlight ? 700 : 500,
                color: highlight ? '#4F46E5' : '#111827',
                fontFamily: highlight ? 'monospace' : 'inherit',
            }}>
                {value}
            </span>
        )}
    </div>
);

/** Check if any human-side block 4 fields are filled. */
function hasHumanSide(d: DoctorDetails): boolean {
    return !!(
        d.training_experience?.length ||
        d.motivation_in_practice?.length ||
        d.unwinding_after_work?.length ||
        d.recognition_identity?.length ||
        d.quality_time_interests?.length ||
        d.quality_time_interests_text ||
        d.professional_achievement ||
        d.personal_achievement ||
        d.professional_aspiration ||
        d.personal_aspiration
    );
}

export default AdminDoctorDetails;
