"use client";

import React, { useState } from "react";
import {
    Lock,
    AtSign,
    User,
    Eye,
    EyeOff,
    Loader2,
    ArrowRight,
    Sparkles,
    Building2,
    ShieldCheck,
    Briefcase,
    CheckCircle2,
    AlertCircle,
    MapPin
} from "lucide-react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import SuccessPopup from "@/components/shared/SuccessPopup";

export default function RegisterPage() {
    const [role, setRole] = useState<"CANDIDATE" | "EMPLOYER" | "ADMIN">("CANDIDATE");
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        fullName: "", // Gộp firstName và lastName
        companyName: "",
        taxCode: "",
        address: "", // Thêm địa chỉ văn phòng
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState("");
    
    const router = useRouter();
    const loginStore = useAuthStore((state) => state.login);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            // Tách fullName thành firstName và lastName
            const nameParts = formData.fullName.trim().split(/\s+/);
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || "";

            const dataToSubmit = { 
                ...formData, 
                firstName,
                lastName,
                role 
            };

            const response = await authService.register(dataToSubmit);
            loginStore(response.user, response.access_token);
            document.cookie = `access_token=${response.access_token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`;

            const userRole = response.user.role;
            let targetPath = "/candidate/dashboard";
            if (userRole === "ADMIN") targetPath = "/admin/dashboard";
            else if (userRole === "EMPLOYER") targetPath = "/employer/dashboard";

            setShowSuccess(true);
            setTimeout(() => {
                router.push(targetPath);
            }, 1500);
        } catch (err: any) {
            const message = err.response?.data?.message;
            if (Array.isArray(message)) {
                setError(message[0]);
            } else {
                setError(message || "Đăng ký thất bại. Vui lòng thử lại.");
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
                title="Account Created" 
                message="Welcome to My Job! Your professional profile is ready."
            />

            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    width: '100%',
                    maxWidth: '1100px',
                    minHeight: '750px',
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
                    color: 'white',
                    maxWidth: '450px'
                }}>
                    <div style={{ zIndex: 2 }}>
                        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
                                <div style={{ width: '50px', height: '50px', backgroundColor: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '5px' }}>
                                    <img src="/logo.png" alt="My Job Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                </div>
                                <span style={{ fontSize: '24px', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>My Job</span>
                            </div>
                        </Link>

                        <div style={{ marginTop: '40px' }}>
                            <h2 style={{ fontSize: '42px', fontWeight: 700, lineHeight: 1.2, marginBottom: '20px' }}>Join us.</h2>
                            <p style={{ fontSize: '18px', opacity: 0.9, lineHeight: 1.6 }}>
                                Unlock exclusive opportunities and elite talent matching.
                            </p>
                        </div>
                    </div>

                    <div style={{ zIndex: 2 }}>
                        <div style={{ marginBottom: '30px' }}>
                            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                                <CheckCircle2 size={20} color="white" />
                                <span style={{ fontSize: '15px', fontWeight: 500 }}>AI Powered Resume Analysis</span>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                                <CheckCircle2 size={20} color="white" />
                                <span style={{ fontSize: '15px', fontWeight: 500 }}>Direct Company Communication</span>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <CheckCircle2 size={20} color="white" />
                                <span style={{ fontSize: '15px', fontWeight: 500 }}>Instant Job Alerts</span>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.3)' }}></div>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'white' }}></div>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.3)' }}></div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div style={{ 
                    flex: 1.5, 
                    padding: '60px 80px', 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'center',
                    overflowY: 'auto'
                }}>
                    <div style={{ marginBottom: '32px' }}>
                        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1A1A1A', marginBottom: '8px' }}>Create Account</h1>
                        <p style={{ color: '#666', fontSize: '15px' }}>
                            Already have an account? <Link href="/auth/login" style={{ color: '#5C9AFF', fontWeight: 600, textDecoration: 'none' }}>Log in</Link>
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

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <AnimatePresence>
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
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

                        {/* Name Field - Merged */}
                        <div style={{ position: 'relative' }}>
                            <input 
                                type="text"
                                placeholder={role === 'EMPLOYER' ? "Người đại diện" : "Họ và tên"}
                                required
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                style={inputStyle}
                                onFocus={onInputFocus}
                                onBlur={onInputBlur}
                            />
                        </div>

                        {role === 'EMPLOYER' && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
                            >
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <input 
                                        type="text"
                                        placeholder="Company Name"
                                        required
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        style={inputStyle}
                                        onFocus={onInputFocus}
                                        onBlur={onInputBlur}
                                    />
                                    <input 
                                        type="text"
                                        placeholder="Tax Code"
                                        required
                                        value={formData.taxCode}
                                        onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                                        style={inputStyle}
                                        onFocus={onInputFocus}
                                        onBlur={onInputBlur}
                                    />
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <MapPin size={18} style={{ position: 'absolute', right: '0', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                    <input 
                                        type="text"
                                        placeholder="Địa chỉ văn phòng đại diện"
                                        required
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        style={inputStyle}
                                        onFocus={onInputFocus}
                                        onBlur={onInputBlur}
                                    />
                                </div>
                            </motion.div>
                        )}

                        <div style={{ position: 'relative' }}>
                            <input 
                                type="email"
                                placeholder="Email Address"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                style={inputStyle}
                                onFocus={onInputFocus}
                                onBlur={onInputBlur}
                            />
                        </div>

                        <div style={{ position: 'relative' }}>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '0', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#999', zIndex: 1 }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                            <input 
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                style={inputStyle}
                                onFocus={onInputFocus}
                                onBlur={onInputBlur}
                            />
                        </div>

                        <button 
                            type="submit"
                            disabled={isLoading}
                            style={{ 
                                marginTop: '10px',
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
                            {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Create Account"}
                        </button>

                        <p style={{ textAlign: 'center', fontSize: '13px', color: '#999', lineHeight: 1.5 }}>
                            By creating an account, you agree to our <span style={{ color: '#5C9AFF', fontWeight: 600 }}>Terms of Service</span> and <span style={{ color: '#5C9AFF', fontWeight: 600 }}>Privacy Policy</span>.
                        </p>
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

const inputStyle: React.CSSProperties = {
    width: '100%', 
    padding: '12px 0', 
    border: 'none', 
    borderBottom: '1.5px solid #E5E5E5', 
    fontSize: '15px', 
    outline: 'none',
    color: '#1A1A1A',
    transition: 'border-color 0.2s',
    backgroundColor: 'transparent'
};

const onInputFocus = (e: any) => e.target.style.borderBottomColor = '#5C9AFF';
const onInputBlur = (e: any) => e.target.style.borderBottomColor = '#E5E5E5';
