'use client';
import React, { useState, useEffect } from 'react';
import { useAppRouter } from '../lib/router';
import { Star, Loader2 } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import styles from './Login.module.css';
import { authService } from '../services/authService';
import { doctorService } from '../services/doctorService';
import { mockDataService } from '../services/mockDataService';
import { publicAssetUrl } from '../config/basePath';

const Login = () => {
    const router = useAppRouter();
    const [mobileNumber, setMobileNumber] = useState('');
    const [email, setEmail] = useState('');
    const [loginMethod] = useState<'phone' | 'email'>('phone');
    const [otpDeliveryMethod, setOtpDeliveryMethod] = useState<'whatsapp' | 'sms'>('whatsapp');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [timer, setTimer] = useState(0);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleLoginSuccess = (identifier: string, type: 'email' | 'phone') => {
        let profile = mockDataService.login(identifier);
        // is_new_user is already stored in localStorage by authService.verifyOTP
        const isNewUser = localStorage.getItem('is_new_user') === 'true';

        if (!profile) {
            // New user - create profile
            console.log("New user detected, creating profile...");
            profile = mockDataService.createProfile(identifier, type);
        }

        // Explicitly cache email for downstream mapping if logged in via email
        if (type === 'email') {
            localStorage.setItem('user_email', identifier);
        } else {
            // Explicitly cache phone
            localStorage.setItem('mobile_number', identifier);
        }

        console.log("Routing user:", profile);

        if (profile.status === 'submitted' || profile.status === 'verified') {
            router.push('/doctor/profile');
        } else {
            // In-progress - determine where to send
            const totalSteps = 7;
            const completionPercent = ((profile.currentStep) / totalSteps) * 100;

            if (completionPercent > 75) {
                // High completion – go straight to dashboard
                sessionStorage.setItem('nav_state', JSON.stringify({ isNewUser }));
                router.push('/doctor/dashboard');
            } else if (isNewUser && profile.currentStep === 0) {
                sessionStorage.setItem('nav_state', JSON.stringify({ isNewUser }));
                router.push('/doctor/resume-upload');
            } else {
                sessionStorage.setItem('nav_state', JSON.stringify({ isNewUser }));
                router.push('/doctor/onboarding');
            }
        }
    };

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        authService.clearSession();
        setError(null);
        setIsLoading(true);

        const identifier = loginMethod === 'phone' ? mobileNumber : email;

        try {
            if (loginMethod === 'phone') {
                const response = await authService.requestOTP(mobileNumber, otpDeliveryMethod);
                if (response.success) {
                    setIsOtpSent(true);
                    setTimer(30); // 30 seconds cooldown
                }
            } else {
                // Mock Email OTP flow or implement when backend ready
                console.log("Sending OTP to email:", email);
                // Simulate success for UI demo
                await new Promise(resolve => setTimeout(resolve, 1000));
                setIsOtpSent(true);
                setTimer(30);
            }
        } catch (err: unknown) {
            console.error("OTP Request Error:", err);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const errorMessage = (err as any).response?.data?.detail?.message || "Failed to send OTP. Please try again.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };



    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const response = await authService.verifyOTP(mobileNumber, otp);
            if (response.success) {
                console.log("Login Successful:", response);

                // Fetch full doctor profile from API and store in localStorage
                if (response.doctor_id != null) {
                    try {
                        await doctorService.fetchAndStoreProfile(response.doctor_id);
                        console.log("Doctor profile fetched and stored.");
                    } catch (profileErr) {
                        console.warn("Could not fetch doctor profile, continuing:", profileErr);
                    }
                }

                handleLoginSuccess(mobileNumber, 'phone');
            }
        } catch (err: unknown) {
            console.error("OTP Verify Error:", err);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const errorMessage = (err as any).response?.data?.detail?.message || "Invalid OTP. Please try again.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async (method: 'whatsapp' | 'sms') => {
        if (timer > 0) return;
        setError(null);
        setIsLoading(true);

        try {
            const response = await authService.resendOTP(mobileNumber, method);
            if (response.success) {
                setTimer(30);
                setOtpDeliveryMethod(method);
                alert(`OTP sent successfully via ${method === 'whatsapp' ? 'WhatsApp' : 'SMS'}!`);
            }
        } catch (err: unknown) {
            console.error("OTP Resend Error:", err);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const errorMessage = (err as any).response?.data?.detail?.message || "Failed to resend OTP.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangeNumber = () => {
        setIsOtpSent(false);
        setOtp('');
        setError(null);
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError(null);

        try {
            authService.clearSession();
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Get the Firebase ID token for backend verification
            const idToken = await user.getIdToken();
            const userEmail = user.email;
            const userName = user.displayName;

            if (!userEmail) {
                throw new Error("No email found in Google account.");
            }

            console.log("Google Login - sending token to backend:", { email: userEmail, name: userName });

            // Send ID token to backend for verification and user creation
            const response = await authService.googleLogin(idToken);

            if (response.success) {
                console.log("Google Login Successful:", response);

                // Fetch full doctor profile from API and store in localStorage
                if (response.doctor_id != null) {
                    try {
                        await doctorService.fetchAndStoreProfile(response.doctor_id);
                        console.log("Doctor profile fetched and stored.");
                    } catch (profileErr) {
                        console.warn("Could not fetch doctor profile, continuing:", profileErr);
                    }
                }

                // Navigate based on user status
                handleLoginSuccess(userEmail, 'email');
            }

        } catch (error: unknown) {
            console.error("Google Login Error:", error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const errorCode = (error as any).code;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const errorMessage = (error as any).message;

            if (errorCode === 'auth/popup-closed-by-user') {
                setError("Login cancelled. Please try again.");
            } else if (errorCode === 'auth/configuration-not-found' || (errorMessage && errorMessage.includes('api key'))) {
                setError("Firebase configuration error. Please check your setup.");
            } else {
                setError("Google login failed: " + (errorMessage || "Unknown error"));
            }
        } finally {
            setIsLoading(false);
        }
    };


    // Testimonials Data
    const testimonials = [
        {
            quote: "The onboarding felt surprisingly natural. I spoke for most of it, reviewed what was filled in, and was done in under 15 minutes. It reflected my practice accurately — without feeling like a form.",
            author: "Dr. Srividhya",
            role: "Consultant Physician · Bangalore",
            image: "https://randomuser.me/api/portraits/women/44.jpg"
        },
        {
            quote: "Caepy has completely transformed how I manage my online presence. The voice-assisted setup was a game-changer.",
            author: "Dr. Rajesh Kumar",
            role: "Cardiologist · Mumbai",
            image: "https://randomuser.me/api/portraits/men/32.jpg"
        },
        {
            quote: "Finally, a platform that understands doctors. Simple, efficient, and professional. Highly recommended.",
            author: "Dr. Saranya Sole",
            role: "Pediatrician · Delhi",
            image: "https://randomuser.me/api/portraits/women/68.jpg"
        },
        {
            quote: "I was skeptical at first, but the AI accuracy is impressive. It saved me hours of manual data entry.",
            author: "Dr. Amit Patel",
            role: "Orthopedic Surgeon · Chennai",
            image: "https://randomuser.me/api/portraits/men/55.jpg"
        },
        {
            quote: "The best onboarding experience I've had in 15 years of practice. Smooth, intuitive, and fast.",
            author: "Dr. Priya Sharma",
            role: "Dermatologist · Hyderabad",
            image: "https://randomuser.me/api/portraits/women/29.jpg"
        }
    ];

    const [currentTestimonial, setCurrentTestimonial] = useState(0);

    useEffect(() => {
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
                        Create your professional presence in minutes
                    </h1>
                    <p className={styles.heroSubtitle}>
                        AI-assisted onboarding designed for doctors—accurate, secure, and clinically relevant.
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
                        <img
                            src={publicAssetUrl('/LinQMD.svg')}
                            alt="Caepy logo"
                            style={{ width: 52, height: 52, display: 'block', objectFit: 'contain' }}
                        />
                        <div className={styles.logoTextColumn}>
                            <span className={styles.brandNameLarge}>Caepy</span>
                            <span className={styles.taglineLarge}>Practice Smarter</span>
                        </div>
                    </div>
                </div>

                <div className={styles.formContainer}>
                    <h2 className={styles.formTitle}>Join Caepy</h2>
                    <p className={styles.formSubtitle}>
                        Create and manage a professional doctor profile using a guided, voice-assisted setup.
                    </p>

                    {!isOtpSent ? (
                        <>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label className={styles.label} style={{ fontSize: '1rem', marginBottom: '1rem', display: 'block' }}>
                                    Please Enter Your Phone number
                                </label>

                                {/* Toggle Button for Email / Phone */}
                                {/* <div style={{ display: 'flex', marginBottom: '1rem' }}>
                                    <div style={{
                                        display: 'flex',
                                        background: '#F1F5F9',
                                        padding: '4px',
                                        borderRadius: '8px',
                                    }}>
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
                                    </div>
                                </div> */}

                                <form onSubmit={handleSendOTP}>
                                    <div className={styles.inputGroup}>
                                        {loginMethod === 'phone' ? (
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
                                        ) : (
                                            <input
                                                type="email"
                                                id="email"
                                                className={styles.input}
                                                placeholder="Please Enter Your Email or Phone number"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        )}
                                    </div>

                                    <div className={styles.checkboxGroup}>
                                        <input type="checkbox" id="remember" className={styles.checkbox} />
                                        <label htmlFor="remember" style={{ color: '#4B5563', fontSize: '0.9rem' }}>Remember me</label>
                                    </div>

                                    {error && <p className={styles.errorMessage} style={{ color: 'red', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <button
                                            type="submit"
                                            className={styles.submitButton}
                                            disabled={isLoading}
                                            onClick={() => setOtpDeliveryMethod('whatsapp')}
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#25D366' }}
                                        >
                                            {isLoading && otpDeliveryMethod === 'whatsapp' ? <Loader2 className="animate-spin" size={20} /> : 'Get OTP on WhatsApp'}
                                        </button>
                                        <button
                                            type="submit"
                                            className={styles.submitButton}
                                            disabled={isLoading}
                                            onClick={() => setOtpDeliveryMethod('sms')}
                                            style={{ background: 'transparent', color: '#4B5563', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                        >
                                            {isLoading && otpDeliveryMethod === 'sms' ? <Loader2 className="animate-spin" size={20} /> : 'Get OTP via SMS'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <div className={styles.divider}>
                                <span className={styles.dividerText}>Or </span>
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
                        </>
                    ) : (
                        <form onSubmit={handleVerifyOTP}>
                            <div className={styles.inputGroup}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <label htmlFor="otp" className={styles.label}>
                                        Enter OTP sent to {otpDeliveryMethod === 'whatsapp' ? 'WhatsApp' : 'SMS'}
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleChangeNumber}
                                        style={{ background: 'none', border: 'none', color: '#0891b2', cursor: 'pointer', fontSize: '0.875rem' }}
                                    >
                                        Change Number
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    id="otp"
                                    className={styles.input}
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    pattern="[0-9]{6}"
                                    maxLength={6}
                                    required
                                />
                            </div>

                            {error && <p className={styles.errorMessage} style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.5rem' }}>{error}</p>}

                            <button type="submit" className={styles.submitButton} disabled={isLoading} style={{ marginTop: '1rem' }}>
                                {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Verify & Login'}
                            </button>

                            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
                                <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '0.25rem' }}>Didn't receive the OTP?</p>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => handleResendOTP('whatsapp')}
                                        disabled={timer > 0 || isLoading}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: timer > 0 ? '#94a3b8' : '#25D366',
                                            cursor: timer > 0 ? 'default' : 'pointer',
                                            fontSize: '0.9rem',
                                            fontWeight: 500,
                                        }}
                                    >
                                        {timer > 0 ? `WhatsApp in ${timer}s` : 'Resend on WhatsApp'}
                                    </button>
                                    <span style={{ color: '#E2E8F0' }}>|</span>
                                    <button
                                        type="button"
                                        onClick={() => handleResendOTP('sms')}
                                        disabled={timer > 0 || isLoading}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: timer > 0 ? '#94a3b8' : '#3B82F6',
                                            cursor: timer > 0 ? 'default' : 'pointer',
                                            fontSize: '0.9rem',
                                            fontWeight: 500,
                                        }}
                                    >
                                        {timer > 0 ? `SMS in ${timer}s` : 'Resend via SMS'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    <p className={styles.footer}>
                        * Private. Secure. Always under your control.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;

