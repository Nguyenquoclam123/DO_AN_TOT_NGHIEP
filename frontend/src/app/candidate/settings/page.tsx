"use client";
import React, { useEffect, useState } from "react";
import {
    User,
    Phone,
    MapPin,
    Mail,
    Camera,
    Save,
    Loader2,
    CheckCircle,
    HelpCircle,
    Lock,
    Bell,
    Shield,
    Eye,
    EyeOff,
    ChevronRight,
    ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { candidateService, CandidateProfile } from "@/services/candidate.service";

type SettingsTab = 'profile' | 'security' | 'notifications';

export default function CandidateSettingsPage() {
    const [profile, setProfile] = useState<Partial<CandidateProfile>>({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        avatar: ""
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
    const [successMessage, setSuccessMessage] = useState("");
    const [error, setError] = useState("");

    // Security form state
    const [passwordData, setPasswordData] = useState({
        current: "",
        new: "",
        confirm: ""
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Notification preference state
    const [notifications, setNotifications] = useState({
        jobRecommendations: true,
        applicationStatus: true,
        myJobAiTips: false,
        marketingPromo: false
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setIsLoading(true);
            const data = await candidateService.getMe();
            setProfile(data || profile);
            if (data?.notificationPreferences) {
                setNotifications(data.notificationPreferences);
            }
        } catch (error: any) {
            setError(error.message || "Failed to load profile");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile(prev => ({ ...prev, avatar: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile.id) return;

        try {
            setIsSaving(true);
            const response = await candidateService.updateProfile(profile.id!, {
                ...profile,
                notificationPreferences: notifications
            });
            setProfile(response);
            setSuccessMessage("Profile updated successfully!");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error: any) {
            setError(error.message || "Failed to save changes");
        } finally {
            setIsSaving(false);
        }
    };

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSaveNotifications = async () => {
        if (!profile.id) return;
        try {
            setIsSaving(true);
            const response = await candidateService.updateProfile(profile.id!, {
                notificationPreferences: notifications
            });
            setProfile(response);
            setSuccessMessage("Notification preferences updated!");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error: any) {
            setError(error.message || "Failed to update preferences");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '20px' }}>
                <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #5C9AFF', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#64748b' }}>Syncing Account...</p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const tabs = [
        { id: 'profile', label: 'Personal Info', icon: <User size={18} /> },
        { id: 'security', label: 'Security', icon: <Shield size={18} /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    ];

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', fontFamily: 'Inter, sans-serif', padding: '20px' }}>

            {/* Page Header */}
            <div style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Settings</h1>
                    <p style={{ fontSize: '15px', color: '#64748b', marginTop: '8px' }}>Manage your account preferences and secure your profile.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Lock size={18} color="#64748b" />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>End-to-end Encrypted</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '48px', alignItems: 'start' }}>

                {/* Modern Sidebar Navigation */}
                <div style={{ position: 'sticky', top: '100px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as SettingsTab)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '16px 20px',
                                    borderRadius: '16px',
                                    border: 'none',
                                    backgroundColor: activeTab === tab.id ? '#0f172a' : 'transparent',
                                    color: activeTab === tab.id ? 'white' : '#64748b',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    textAlign: 'left'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {tab.icon}
                                    <span style={{ fontSize: '14px', fontWeight: 700 }}>{tab.label}</span>
                                </div>
                                {activeTab === tab.id && <ChevronRight size={16} />}
                            </button>
                        ))}
                    </div>

                    <div style={{ marginTop: '40px', padding: '24px', backgroundColor: '#f8fafc', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>Profile Strength</h4>
                        <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                            <div style={{ width: '85%', height: '100%', backgroundColor: '#22c55e', borderRadius: '4px' }}></div>
                        </div>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>Your profile is looking great! Complete your portfolio to reach 100%.</p>
                    </div>
                </div>

                {/* Main Content Area */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{ backgroundColor: 'white', borderRadius: '32px', border: '1px solid #f1f5f9', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}
                >
                    {activeTab === 'profile' && (
                        <form onSubmit={handleSaveProfile}>
                            {/* Profile Header */}
                            <div style={{ padding: '48px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '40px', background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)' }}>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ width: '120px', height: '120px', borderRadius: '35px', backgroundColor: 'white', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                        {profile.avatar ? (
                                            <img src={profile.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <User size={48} color="#cbd5e1" />
                                        )}
                                    </div>
                                    <label htmlFor="avatar-upload" style={{ position: 'absolute', bottom: '-4px', right: '-4px', backgroundColor: '#0f172a', color: 'white', padding: '10px', borderRadius: '15px', cursor: 'pointer', boxShadow: '0 10px 15px rgba(0,0,0,0.2)', transition: 'transform 0.2s' }}>
                                        <Camera size={18} />
                                        <input type="file" id="avatar-upload" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
                                    </label>
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', margin: '0 0 4px' }}>{profile.fullName || "Your Identity"}</h2>
                                    <p style={{ fontSize: '14px', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Mail size={14} /> {profile.email}
                                    </p>
                                </div>
                            </div>

                            <div style={{ padding: '48px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                {successMessage && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '16px 20px', backgroundColor: '#f0fdf4', borderRadius: '16px', color: '#16a34a', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <CheckCircle size={20} /> {successMessage}
                                    </motion.div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <label style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginLeft: '4px' }}>Legal Full Name</label>
                                        <input
                                            type="text"
                                            value={profile.fullName}
                                            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                                            placeholder="John Doe"
                                            style={{ padding: '16px 20px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', fontSize: '15px', fontWeight: 600, color: '#1e293b', transition: 'all 0.2s' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <label style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginLeft: '4px' }}>Public Email</label>
                                        <input
                                            type="email"
                                            value={profile.email}
                                            disabled
                                            style={{ padding: '16px 20px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '16px', fontSize: '15px', fontWeight: 600, color: '#94a3b8', cursor: 'not-allowed' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <label style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginLeft: '4px' }}>Primary Phone</label>
                                        <input
                                            type="tel"
                                            value={profile.phone}
                                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                            placeholder="+1 234 567 890"
                                            style={{ padding: '16px 20px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', fontSize: '15px', fontWeight: 600, color: '#1e293b' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <label style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginLeft: '4px' }}>Base Location</label>
                                        <input
                                            type="text"
                                            value={profile.address}
                                            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                            placeholder="e.g. San Francisco, CA"
                                            style={{ padding: '16px 20px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', fontSize: '15px', fontWeight: 600, color: '#1e293b' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                                    <button type="button" onClick={() => fetchProfile()} style={{ padding: '14px 28px', backgroundColor: 'transparent', color: '#64748b', border: 'none', borderRadius: '16px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 40px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '16px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.3)', transition: 'all 0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                        Secure Changes
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {activeTab === 'security' && (
                        <div style={{ padding: '48px' }}>
                            <div style={{ marginBottom: '40px' }}>
                                <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>Security Settings</h3>
                                <p style={{ fontSize: '14px', color: '#64748b' }}>Update your password and manage two-factor authentication.</p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <label style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginLeft: '4px' }}>Current Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            style={{ width: '100%', padding: '16px 20px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', fontSize: '15px', fontWeight: 600 }}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={(e) => { e.preventDefault(); setShowCurrentPassword(!showCurrentPassword); }}
                                            style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', zIndex: 5, padding: '10px' }}
                                        >
                                            {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <label style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginLeft: '4px' }}>New Password</label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                style={{ width: '100%', padding: '16px 20px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', fontSize: '15px', fontWeight: 600 }}
                                                placeholder="Min. 8 characters"
                                            />
                                            <button
                                                type="button"
                                                onClick={(e) => { e.preventDefault(); setShowNewPassword(!showNewPassword); }}
                                                style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', zIndex: 5, padding: '10px' }}
                                            >
                                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <label style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginLeft: '4px' }}>Confirm Password</label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                style={{ width: '100%', padding: '16px 20px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', fontSize: '15px', fontWeight: 600 }}
                                                placeholder="Match new password"
                                            />
                                            <button
                                                type="button"
                                                onClick={(e) => { e.preventDefault(); setShowConfirmPassword(!showConfirmPassword); }}
                                                style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', zIndex: 5, padding: '10px' }}
                                            >
                                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ padding: '24px', backgroundColor: '#eff6ff', borderRadius: '24px', border: '1px solid #dbeafe', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                                    <div style={{ width: '40px', height: '40px', backgroundColor: '#5C9AFF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Shield size={20} color="white" />
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1e3a8a', margin: '0 0 4px' }}>Two-Factor Authentication</h4>
                                        <p style={{ fontSize: '13px', color: '#5C9AFF', margin: '0 0 16px', lineHeight: 1.5 }}>Add an extra layer of security to your account by requiring more than just a password to log in.</p>
                                        <button style={{ padding: '10px 20px', backgroundColor: '#5C9AFF', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Enable 2FA</button>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button style={{ padding: '14px 40px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '16px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.3)' }}>Update Password</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div style={{ padding: '48px' }}>
                            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>Notification Preferences</h3>
                                    <p style={{ fontSize: '14px', color: '#64748b' }}>Control how you receive alerts and updates.</p>
                                </div>
                                <button
                                    onClick={handleSaveNotifications}
                                    disabled={isSaving}
                                    style={{ padding: '10px 24px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    Save Preferences
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {[
                                    { id: 'jobRecommendations', title: "Job Recommendations", desc: "Get notified when new jobs matching your profile are posted." },
                                    { id: 'applicationStatus', title: "Application Status", desc: "Alerts when an employer views or updates your application." },
                                    { id: 'myJobAiTips', title: "My Job AI Tips", desc: "Weekly career growth tips and CV optimization suggestions." },
                                    { id: 'marketingPromo', title: "Marketing & Promo", desc: "Occasional updates about new features and partnerships." }
                                ].map((item) => (
                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', backgroundColor: '#f8fafc', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                                        <div style={{ flex: 1, paddingRight: '40px' }}>
                                            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>{item.title}</h4>
                                            <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
                                        </div>
                                        <div
                                            onClick={() => toggleNotification(item.id as keyof typeof notifications)}
                                            style={{
                                                width: '52px',
                                                height: '28px',
                                                backgroundColor: notifications[item.id as keyof typeof notifications] ? '#22c55e' : '#cbd5e1',
                                                borderRadius: '14px',
                                                position: 'relative',
                                                cursor: 'pointer',
                                                transition: 'background-color 0.3s'
                                            }}
                                        >
                                            <motion.div
                                                animate={{ x: notifications[item.id as keyof typeof notifications] ? 24 : 0 }}
                                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                                style={{ width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '4px', left: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
