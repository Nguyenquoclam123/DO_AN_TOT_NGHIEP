"use client";

import React, { useState, useEffect } from "react";
import {
    Lock,
    AtSign,
    User,
    Eye,
    EyeOff,
    Loader2,
    ArrowRight,
    Sparkles,
    CheckCircle2,
    CheckSquare,
    Square,
    ShieldCheck,
    Briefcase,
    AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import SuccessPopup from "@/components/shared/SuccessPopup";

export default function LoginPage() {
    const [role, setRole] = useState<"CANDIDATE" | "EMPLOYER" | "ADMIN">("CANDIDATE");
    const [credentials, setCredentials] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [redirectPath, setRedirectPath] = useState("");
    
    const router = useRouter();
    const loginStore = useAuthStore((state) => state.login);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await authService.login({ ...credentials, role });
            loginStore(response.user, response.access_token);
            document.cookie = `access_token=${response.access_token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`;

            const userRole = response.user.role;
            let targetPath = "/candidate/dashboard";
            if (userRole === "ADMIN") targetPath = "/admin/dashboard";
            else if (userRole === "EMPLOYER") targetPath = "/employer/dashboard";

            setRedirectPath(targetPath);

            const handleRedirect = () => {
                window.location.href = targetPath;
            };

            setShowSuccess(true);
            setTimeout(handleRedirect, 1000);
        } catch (err: any) {
            console.error("Login error:", err);
            const message = err.response?.data?.message;
            if (Array.isArray(message)) {
                setError(message[0]);
            } else {
                setError(message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            width: '100%', 
            backgroundColor: '#E6EFFF', 
            backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(92, 154, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(92, 154, 255, 0.1) 0%, transparent 50%)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '20px',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
        }}>
            <SuccessPopup 
                show={showSuccess} 
                title="Welcome Back" 
                message="Your session is ready. Redirecting to your dashboard..."
                onClose={() => redirectPath && (window.location.href = redirectPath)}
            />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    width: '100%',
                    maxWidth: '1000px',
                    height: '650px',
                    backgroundColor: 'white',
                    borderRadius: '32px',
                    boxShadow: '0 25px 50px -12px rgba(92, 154, 255, 0.25)',
                    display: 'flex',
                    overflow: 'hidden'
                }}
            >
                {/* Left Side: Illustration & Branding */}
                <div style={{ 
                    flex: 1, 
                    backgroundColor: '#5C9AFF', 
                    padding: '60px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    position: 'relative',
                    color: 'white'
                }}>
                    <div style={{ zIndex: 2 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
                            <div style={{ width: '50px', height: '50px', backgroundColor: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '5px' }}>
                                <img src="/logo.png" alt="My Job Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                            <span style={{ fontSize: '24px', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>My <span style={{ color: '#FFD700' }}>Job</span></span>
                        </div>

                        <div style={{ marginTop: '40px' }}>
                            <h2 style={{ fontSize: '42px', fontWeight: 700, lineHeight: 1.2, marginBottom: '20px' }}>Welcome!</h2>
                            <p style={{ fontSize: '18px', opacity: 0.9, lineHeight: 1.6, maxWidth: '320px' }}>
                                Get a real AI-powered matching experience for your career journey.
                            </p>
                        </div>
                    </div>

                    {/* Illustration Placeholder */}
                    <div style={{ 
                        position: 'absolute', 
                        top: '50%', 
                        left: '50%', 
                        transform: 'translate(-50%, -50%)',
                        width: '300px',
                        height: '300px',
                        opacity: 0.2,
                        zIndex: 1
                    }}>
                        <img src="https://cdni.iconscout.com/illustration/premium/thumb/login-3305943-2757111.png" alt="Illustration" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', zIndex: 2 }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'white' }}></div>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.3)' }}></div>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.3)' }}></div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div style={{ 
                    flex: 1, 
                    padding: '80px 60px', 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}>
                    <div style={{ marginBottom: '40px' }}>
                        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1A1A1A', marginBottom: '12px' }}>Log In</h1>
                        <p style={{ color: '#666', fontSize: '15px' }}>
                            Don't have an account? <Link href="/auth/register" style={{ color: '#5C9AFF', fontWeight: 600, textDecoration: 'none' }}>Create an account</Link>
                        </p>
                    </div>

                    {/* Role Selection */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '32px' }}>
                        {[
                            { id: "CANDIDATE", label: "Candidate", icon: <User size={16} /> },
                            { id: "EMPLOYER", label: "Employer", icon: <Briefcase size={16} /> },
                            { id: "ADMIN", label: "Admin", icon: <ShieldCheck size={16} /> }
                        ].map((r) => (
                            <button
                                key={r.id}
                                type="button"
                                onClick={() => setRole(r.id as any)}
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    padding: '10px 4px',
                                    borderRadius: '10px',
                                    border: '1.5px solid',
                                    borderColor: role === r.id ? '#5C9AFF' : '#E5E5E5',
                                    backgroundColor: role === r.id ? 'rgba(92, 154, 255, 0.05)' : 'transparent',
                                    color: role === r.id ? '#5C9AFF' : '#666',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {r.icon} {r.label}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        <AnimatePresence>
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    style={{ 
                                        padding: '12px 16px', 
                                        backgroundColor: '#FFF5F5', 
                                        color: '#E53E3E', 
                                        borderRadius: '12px', 
                                        fontSize: '14px', 
                                        fontWeight: 500, 
                                        border: '1px solid #FED7D7',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}
                                >
                                    <AlertCircle size={18} />
                                    <span>{error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div style={{ position: 'relative' }}>
                            <AtSign size={18} style={{ position: 'absolute', right: '0', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                            <input 
                                type="email"
                                placeholder="Username or Email"
                                required
                                value={credentials.email}
                                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                                style={{ 
                                    width: '100%', 
                                    padding: '12px 0', 
                                    border: 'none', 
                                    borderBottom: '1.5px solid #E5E5E5', 
                                    fontSize: '15px', 
                                    outline: 'none',
                                    color: '#1A1A1A',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderBottomColor = '#5C9AFF'}
                                onBlur={(e) => e.target.style.borderBottomColor = '#E5E5E5'}
                            />
                        </div>

                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', right: '0', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                            <input 
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                required
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                style={{ 
                                    width: '100%', 
                                    padding: '12px 0', 
                                    border: 'none', 
                                    borderBottom: '1.5px solid #E5E5E5', 
                                    fontSize: '15px', 
                                    outline: 'none',
                                    color: '#1A1A1A',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderBottomColor = '#5C9AFF'}
                                onBlur={(e) => e.target.style.borderBottomColor = '#E5E5E5'}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                            <div 
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#666', fontSize: '14px' }}
                                onClick={() => setRememberMe(!rememberMe)}
                            >
                                {rememberMe ? <CheckSquare size={18} color="#5C9AFF" fill="#5C9AFF" /> : <Square size={18} />}
                                <span>Remember password</span>
                            </div>
                            <Link href="/auth/forgot-password" style={{ color: '#5C9AFF', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
                                Forget your password?
                            </Link>
                        </div>

                        <button 
                            type="submit"
                            disabled={isLoading}
                            style={{ 
                                marginTop: '20px',
                                padding: '16px', 
                                backgroundColor: '#5C9AFF', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '12px', 
                                fontSize: '16px', 
                                fontWeight: 700, 
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4A8CFF'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#5C9AFF'}
                        >
                            {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Sign in"}
                        </button>
                    </form>
                </div>
            </motion.div>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                input::placeholder {
                    color: #BBB;
                }
            `}</style>
        </div>
    );
}
