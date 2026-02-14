
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Clock, UserCheck, Sparkles, MapPin, Edit2, LayoutGrid, Eye, Send } from 'lucide-react';
import styles from './ProfileSubmitted.module.css';

const ProfileSubmitted = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const formData = location.state?.formData || {};
    const getVal = (k: string) => formData[k] || '---';

    return (
        <div className={styles.pageWrapper}>
            <main className={styles.mainContent}>
                <div className={styles.successIcon}>
                    <Check size={40} strokeWidth={4} />
                </div>

                <h1 className={styles.title}>Profile Submitted Successfully!</h1>
                <p className={styles.subtitle}>Welcome to CAEPY Healthcare Platform, Doctor</p>

                {/* Profile Summary Card */}
                <div className={styles.card}>
                    <div className={styles.profileSummary}>
                        <div className={styles.avatarContainer}>
                            <img src={formData.profileImage || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop"} alt="Doctor" className={styles.avatar} />
                        </div>
                        <div className={styles.docInfo}>
                            <h3>{getVal('fullName')}</h3>
                            <p className={styles.specialty}>{getVal('specialty')}</p>
                            <div className={styles.metaRow}>
                                <div className={styles.metaItem}>
                                    <MapPin size={14} className={styles.metaIcon} />
                                    <span>{getVal('primaryLocation') || 'Bangalore, India'}</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <Clock size={14} className={styles.metaIcon} />
                                    <span>{getVal('experience') ? `${getVal('experience')} years experience` : '10 years experience'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timeline Card */}
                <div className={styles.card}>
                    <h2 className={styles.timelineTitle}>What Happens Next</h2>

                    <div className={styles.timeline}>
                        {/* Step 1 */}
                        <div className={styles.timelineItem}>
                            <div className={`${styles.timelineIcon} ${styles.success}`}>
                                <Check size={18} />
                            </div>
                            <div className={styles.timelineContent}>
                                <div className={styles.timelineHeader}>
                                    <h4>Profile Submitted</h4>
                                    <span className={`${styles.tag} ${styles.greenTag}`}>Just now</span>
                                </div>
                                <p className={styles.timeDesc}>Your information has been received</p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className={styles.timelineItem}>
                            <div className={`${styles.timelineIcon} ${styles.blue}`}>
                                <Clock size={18} />
                            </div>
                            <div className={styles.timelineContent}>
                                <div className={styles.timelineHeader}>
                                    <h4>Verification in Progress</h4>
                                    <span className={`${styles.tag} ${styles.blueTag}`}>24-48 hours</span>
                                </div>
                                <p className={styles.timeDesc}>Our team is reviewing your credentials</p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className={styles.timelineItem}>
                            <div className={styles.timelineIcon}>
                                <UserCheck size={18} />
                            </div>
                            <div className={styles.timelineContent}>
                                <div className={styles.timelineHeader}>
                                    <h4>Team Review</h4>
                                    <span className={styles.tag}>48-72 hours</span>
                                </div>
                                <p className={styles.timeDesc}>Final approval and account setup</p>
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className={styles.timelineItem}>
                            <div className={styles.timelineIcon}>
                                <Sparkles size={18} />
                            </div>
                            <div className={styles.timelineContent}>
                                <div className={styles.timelineHeader}>
                                    <h4>Profile Goes Live</h4>
                                    <span className={styles.tag}>3-4 days</span>
                                </div>
                                <p className={styles.timeDesc}>You'll receive full platform access</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className={styles.actionButtons}>
                    <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => navigate('/profile', { state: { formData } })}>
                        <Eye size={18} /> Preview Public Profile
                    </button>
                    <button className={styles.btn} onClick={() => navigate('/onboarding', { state: { formData, step: 1 } })}>
                        <Edit2 size={18} /> Edit Details
                    </button>
                    <button className={styles.btn} onClick={() => navigate('/admin/dashboard')}>
                        <LayoutGrid size={18} /> Go to Dashboard
                    </button>
                </div>

                {/* Notification Banner */}
                <div className={styles.noticeBox}>
                    <div className={styles.noticeIcon}>
                        <Send size={18} />
                    </div>
                    <div>
                        <h4 className={styles.noticeTitle}>Confirmation Email Sent</h4>
                        <p className={styles.noticeText}>We've sent a confirmation to <span style={{ fontWeight: 600 }}>{formData.email || 'email@example.com'}</span>. You'll receive updates about your verification status.</p>
                    </div>
                </div>

                <a href="#" className={styles.demoLink} onClick={(e) => { e.preventDefault(); navigate('/onboarding', { state: { step: 1 } }); }}>
                    Start a new onboarding (Demo)
                </a>
            </main>

            <div className={styles.helpSection}>
                <p>Need help or have questions?</p>
                <p>Contact us at <a href="mailto:support@caepy.com">support@caepy.com</a> or call <a href="tel:+911234567890">+91 123 456 7890</a></p>
            </div>
        </div>
    );
};

export default ProfileSubmitted;
