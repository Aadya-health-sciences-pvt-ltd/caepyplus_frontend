import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Star } from 'lucide-react';

import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase';
import { getCurrentUserRole, setLoggedInAdmin } from '../../lib/adminAuth';
import styles from './AdminLogin.module.css';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        if (loginMethod === 'email') {
            const role = getCurrentUserRole(email);
            if (role) {
                setLoggedInAdmin(email); // Persist session
                navigate('/admin/dashboard');
            } else {
                alert("Access Denied: You are not an authorized admin or operations user.");
            }
        } else {
            // Mock Phone Login for Admin (allow any 10 digit number for now or specific list)
            // In real app, this would verify OTP.
            if (mobileNumber.length === 10) {
                setLoggedInAdmin(`phone:${mobileNumber}`);
                navigate('/admin/dashboard');
            } else {
                alert("Please enter a valid 10-digit mobile number.");
            }
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            const userEmail = user.email || '';

            console.log("Google Login Success:", user);

            const role = getCurrentUserRole(userEmail);
            if (role) {
                setLoggedInAdmin(userEmail);
                navigate('/admin/dashboard');
            } else {
                alert("Access Denied: Your Google account is not authorized for Admin access.");
            }

        } catch (error: any) {
            console.error("Google Login Error:", error);
            if (error.code === 'auth/popup-closed-by-user') {
                alert("Login cancelled.");
            } else if (error.code === 'auth/configuration-not-found' || error.message.includes('api key')) {
                // FALLBACK FOR DEMO: Allow admin navigation if keys are missing but we are testing locally
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    const mockAdminEmail = "admin@caepy.com";
                    setLoggedInAdmin(mockAdminEmail);
                    alert(`(Demo Mode) Auto-logging in as ${mockAdminEmail}`);
                    navigate('/admin/dashboard');
                    return;
                }
                alert("Firebase configuration missing! Please add your keys to .env file.");
            } else {
                alert("Login failed: " + error.message);
            }
        }
    };

    // Testimonials Data
    const testimonials = [
        {
            quote: "The operational tools have streamlined our verification process significantly. What used to take days now takes hours.",
            author: "Dr. Abida Sultan",
            role: "Head of Operations · Bangalore",
            image: "https://randomuser.me/api/portraits/women/44.jpg"
        },
        {
            quote: "Managing thousands of doctor profiles is effortless with this dashboard. The insights are invaluable.",
            author: "Dr. Rajesh Kumar",
            role: "Medical Director · Mumbai",
            image: "https://randomuser.me/api/portraits/men/32.jpg"
        },
        {
            quote: "Security and compliance are top-notch. I feel confident managing sensitive data here.",
            author: "Dr. Sarah Jenkins",
            role: "Compliance Officer · Delhi",
            image: "https://randomuser.me/api/portraits/women/68.jpg"
        },
        {
            quote: "The support features allow us to assist doctors in real-time. It's a game changer for our support team.",
            author: "Dr. Amit Patel",
            role: "Support Lead · Chennai",
            image: "https://randomuser.me/api/portraits/men/55.jpg"
        },
        {
            quote: "We've seen a 40% increase in profile completion rates since switching to this admin console.",
            author: "Dr. Priya Sharma",
            role: "Growth Manager · Hyderabad",
            image: "https://randomuser.me/api/portraits/women/29.jpg"
        }
    ];

    const [currentTestimonial, setCurrentTestimonial] = useState(0);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.pageWrapper}>
            {/* Left Side */}
            <div className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>
                        Manage doctor profiles efficiently
                    </h1>
                    <p className={styles.heroSubtitle}>
                        Operational tools to verify, manage, and support our medical professionals.
                    </p>

                    <div className={styles.testimonial}>
                        <div className={styles.stars}>
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={20} fill="#FCD34D" strokeWidth={0} />
                            ))}
                        </div>
                        <div className={styles.fadeIn} key={currentTestimonial}>
                            <p className={styles.quote}>"{testimonials[currentTestimonial].quote}"</p>
                            <div className={styles.author}>
                                <div className={styles.authorAvatar}>
                                    <img src={testimonials[currentTestimonial].image} alt={testimonials[currentTestimonial].author} />
                                </div>
                                <div className={styles.authorInfo}>
                                    <h4>{testimonials[currentTestimonial].author}</h4>
                                    <p>{testimonials[currentTestimonial].role}</p>
                                </div>
                            </div>
                        </div>

                        {/* Carousel Indicators */}
                        <div style={{ display: 'flex', gap: '6px', marginTop: '1.5rem' }}>
                            {testimonials.map((_, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setCurrentTestimonial(idx)}
                                    style={{
                                        width: idx === currentTestimonial ? '24px' : '6px',
                                        height: '6px',
                                        borderRadius: '3px',
                                        background: 'white',
                                        opacity: idx === currentTestimonial ? 1 : 0.3,
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side */}
            <div className={styles.formSection}>
                <div className={styles.logoWrapper}>
                    <div className={styles.logoHeader}>
                        <Sparkles size={48} color="#293991" fill="#293991" fillOpacity={0.1} strokeWidth={1.5} />
                        <div className={styles.logoTextColumn}>
                            <span className={styles.brandNameLarge}>Caepy</span>
                            <span className={styles.taglineLarge}>Practice Smarter</span>
                        </div>
                    </div>
                </div>

                <div className={styles.formContainer}>
                    <h2 className={styles.formTitle}>Admin Login</h2>
                    <p className={styles.formSubtitle}>
                        Login to access the operational dashboard.
                    </p>

                    {!email ? (
                        /* Phone Login View - Wait, logic in AdminLogin is confusing. 
                           It has separate states for email and mobileNumber. 
                           Let's match the Login.tsx logic where it renders based on loginMethod. */
                        <></>
                    ) : null}

                    {/* Toggle Button for Email / Phone - Moved Component */}
                    <div style={{ display: 'flex', marginBottom: '1rem' }}>
                        <div style={{
                            display: 'flex',
                            background: '#F1F5F9',
                            padding: '4px',
                            borderRadius: '8px',
                        }}>
                            <button
                                type="button"
                                onClick={() => setLoginMethod('email')}
                                style={{
                                    padding: '6px 16px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: loginMethod === 'email' ? 'white' : 'transparent',
                                    boxShadow: loginMethod === 'email' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                                    color: loginMethod === 'email' ? '#0F172A' : '#64748B',
                                    fontWeight: 500,
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Email
                            </button>
                            <button
                                type="button"
                                onClick={() => setLoginMethod('phone')}
                                style={{
                                    padding: '6px 16px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: loginMethod === 'phone' ? 'white' : 'transparent',
                                    boxShadow: loginMethod === 'phone' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                                    color: loginMethod === 'phone' ? '#0F172A' : '#64748B',
                                    fontWeight: 500,
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Phone
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleLogin}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="loginInput" className={styles.label}>
                                {loginMethod === 'email' ? 'Please Enter Your Email' : 'Mobile Number'}
                            </label>
                            {loginMethod === 'email' ? (
                                <input
                                    type="email"
                                    id="email"
                                    className={styles.input}
                                    placeholder="admin@caepy.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            ) : (
                                <input
                                    type="tel"
                                    id="mobile"
                                    className={styles.input}
                                    placeholder="Enter 10-digit mobile number"
                                    value={mobileNumber}
                                    onChange={(e) => setMobileNumber(e.target.value)}
                                    pattern="[0-9]{10}"
                                    maxLength={10}
                                    required
                                />
                            )}
                        </div>

                        <div className={styles.checkboxGroup}>
                            <input type="checkbox" id="remember" className={styles.checkbox} />
                            <label htmlFor="remember" style={{ fontSize: '0.9rem', color: '#475569' }}>
                                Remember me
                            </label>
                        </div>

                        <button type="submit" className={styles.submitButton}>
                            Log In →
                        </button>
                    </form>

                    <div className={styles.divider}>
                        <span className={styles.dividerText}>Or login with {loginMethod === 'email' ? 'phone' : 'email'}</span>
                    </div>

                    <button type="button" className={styles.googleButton} onClick={handleGoogleLogin}>
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>

                    <p className={styles.footer}>
                        * Private. Secure. Always under your control.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
