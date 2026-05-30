"use client";

import React, { useEffect, useState } from "react";
import {
    Building2,
    ShieldCheck,
    Save,
    Camera,
    MapPin,
    Globe,
    Users,
    CreditCard,
    Settings2,
    Lock,
    ChevronDown,
    Info,
    CheckCircle2,
    FileText,
    Zap,
    Plus,
    Loader2,
    TrendingUp,
    Award,
    Target,
    Briefcase,
    Mail,
    Calendar,
    UserCircle2,
    Trash2,
    Server,
    AppWindow,
    Cloud,
    Code,
    Cpu,
    ArrowRight,
    AlertCircle,
    Handshake
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { api as axiosApi, apiUpload } from "@/lib/api";
import { useForm, useFieldArray } from "react-hook-form";
import { ConfirmModal } from "@/components/shared/ConfirmModal";

interface CompanyData {
    id: string;
    name: string;
    taxCode: string;
    website: string;
    logoUrl: string;
    coverUrl: string;
    industryId: string;
    scale: string;
    address: string;
    description: string;
    status: string;
    isVerified: boolean;
    email: string;
    establishedDate: string;
    representative: string;
    employeeCount: number;
    offices: { label: string; address: string; email?: string; phone?: string; schedule?: string }[];
    awards: { title: string; year: string; description?: string; imageUrl?: string }[];
    services: { title: string; description: string; details?: string }[];
    members: { name: string; position: string; imageUrl?: string; description?: string }[];
    partners: { name: string; logoUrl?: string; website?: string }[];
}

export default function CompanyProfilePage() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [company, setCompany] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'branding' | 'reputation' | 'organization' | 'services' | 'locations'>('branding');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [pendingData, setPendingData] = useState<CompanyData | null>(null);

    const { register, handleSubmit, reset, setValue, watch, control } = useForm<CompanyData>({
        defaultValues: {
            offices: [],
            awards: [],
            services: [],
            members: [],
            partners: []
        }
    });

    const { fields: officeFields, append: appendOffice, remove: removeOffice } = useFieldArray({ control, name: "offices" });
    const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({ control, name: "services" });
    const { fields: awardFields, append: appendAward, remove: removeAward } = useFieldArray({ control, name: "awards" });
    const { fields: memberFields, append: appendMember, remove: removeMember } = useFieldArray({ control, name: "members" });
    const { fields: partnerFields, append: appendPartner, remove: removePartner } = useFieldArray({ control, name: "partners" });

    const logoUrl = watch("logoUrl");
    const coverUrl = watch("coverUrl");

    // Calculate Completeness
    const [completeness, setCompleteness] = useState(0);
    const watchAllFields = watch();

    useEffect(() => {
        const fields = ['name', 'taxCode', 'website', 'logoUrl', 'coverUrl', 'email', 'address', 'description', 'establishedDate', 'representative', 'employeeCount', 'scale'];
        let filledCount = 0;
        fields.forEach(f => {
            if (watchAllFields[f as keyof CompanyData]) filledCount++;
        });

        // Arrays
        if (watchAllFields.offices && watchAllFields.offices.length > 0) filledCount++;
        if (watchAllFields.services && watchAllFields.services.length > 0) filledCount++;
        if (watchAllFields.awards && watchAllFields.awards.length > 0) filledCount++;
        if (watchAllFields.members && watchAllFields.members.length > 0) filledCount++;
        if (watchAllFields.partners && watchAllFields.partners.length > 0) filledCount++;

        const totalItems = fields.length + 5;
        const percentage = Math.round((filledCount / totalItems) * 100);
        setCompleteness(percentage);
    }, [watchAllFields]);

    useEffect(() => {
        const refreshAndFetch = async () => {
            const findCompanyId = (obj: any): string | null => {
                if (!obj) return null;
                if (obj.companyId) return obj.companyId;
                if (obj.company_id) return obj.company_id;
                if (obj.company && typeof obj.company === 'object' && obj.company.id) return obj.company.id;
                if (obj.employerProfile && typeof obj.employerProfile === 'object') return findCompanyId(obj.employerProfile);
                return null;
            };

            let currentCompanyId = findCompanyId(user);

            if (user && !currentCompanyId) {
                try {
                    const myCompany = await axiosApi.get<any>("/companies/user/my");
                    if (myCompany && myCompany.id) {
                        setCompany(myCompany);
                        reset(myCompany);
                        setLoading(false);
                        return;
                    }
                } catch (e) {
                    console.error("Failed to find company by user association", e);
                }
            }

            if (user) {
                if (currentCompanyId) {
                    fetchCompanyData(currentCompanyId);
                } else {
                    setLoading(false);
                }
            } else {
                const timer = setTimeout(() => {
                    if (!user) setLoading(false);
                }, 2000);
                return () => clearTimeout(timer);
            }
        };

        refreshAndFetch();
    }, [user, user?.companyId, user?.company?.id]);

    const fetchCompanyData = async (id: string) => {
        try {
            setLoading(true);
            const data = await axiosApi.get<CompanyData>(`/companies/${id}`);
            if (data) {
                setCompany(data);
                const normalizedData = {
                    ...data,
                    address: data.address || "",
                    representative: data.representative || "",
                    email: data.email || "",
                    taxCode: data.taxCode || "",
                    website: data.website || "",
                    scale: data.scale || "",
                    description: data.description || "",
                };
                reset(normalizedData);
            }
        } catch (error) {
            console.error("Failed to fetch company data:", error);
            setMessage({ type: 'error', text: 'Failed to load company profile.' });
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: CompanyData) => {
        setPendingData(data);
        setIsConfirmModalOpen(true);
    };

    const confirmSubmit = async () => {
        if (!pendingData) return;
        const targetId = pendingData.id || company?.id || user?.companyId || user?.company?.id;
        if (!targetId) return;
        
        try {
            setSaving(true);
            setIsConfirmModalOpen(false);
            setMessage(null);
            await axiosApi.patch(`/companies/${targetId}`, pendingData);
            setMessage({ type: 'success', text: 'Company profile updated successfully!' });
            setPendingData(null);
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error("Failed to update company data:", error);
            setMessage({ type: 'error', text: 'Failed to update company profile.' });
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await apiUpload<{ url: string }>("/upload/image", formData);
            const fullUrl = `http://localhost:4000/api/v1${response.url}`;
            if (type === 'logo') {
                setValue("logoUrl", fullUrl);
            } else {
                setValue("coverUrl", fullUrl);
            }
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload image.");
        }
    };

    const handlePartnerLogoUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await apiUpload<{ url: string }>("/upload/image", formData);
            const fullUrl = `http://localhost:4000/api/v1${response.url}`;
            setValue(`partners.${index}.logoUrl`, fullUrl);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload partner logo.");
        }
    };

    const handleMemberImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await apiUpload<{ url: string }>("/upload/image", formData);
            const fullUrl = `http://localhost:4000/api/v1${response.url}`;
            setValue(`members.${index}.imageUrl`, fullUrl);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload member photo.");
        }
    };

    const handleAwardImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await apiUpload<{ url: string }>("/upload/image", formData);
            const fullUrl = `http://localhost:4000/api/v1${response.url}`;
            setValue(`awards.${index}.imageUrl`, fullUrl);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload award image.");
        }
    };

    if (loading) {
        return (
            <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                <div style={{ position: 'relative' }}>
                    <div style={{ height: '70px', width: '70px', border: '3px solid #f1f5f9', borderTopColor: '#5C9AFF', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <Building2 style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#5C9AFF' }} size={24} />
                </div>
                <p style={{ color: '#64748b', fontWeight: 600, fontSize: '13px', letterSpacing: '0.05em' }}>Synchronizing Company Data...</p>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ padding: '40px 48px 100px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <input type="hidden" {...register("id")} />
            
            <div style={{ position: 'relative', borderRadius: '32px', overflow: 'hidden', backgroundColor: '#0f172a', border: '1px solid #1e293b', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                <div style={{ height: '240px', position: 'relative' }}>
                    <img 
                        src={coverUrl || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000&auto=format&fit=crop"} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        alt="Company Cover"
                    />
                </div>

                <div style={{ padding: '0 48px 40px', marginTop: '-60px', position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '32px' }}>
                        <div style={{ height: '140px', width: '140px', backgroundColor: 'white', borderRadius: '28px', padding: '6px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)', border: '6px solid #0f172a', position: 'relative' }}>
                            <div style={{ height: '100%', width: '100%', backgroundColor: 'white', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                {logoUrl ? (
                                    <img src={logoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Company Logo" />
                                ) : (
                                    <Building2 style={{ color: '#5C9AFF' }} size={48} />
                                )}
                            </div>
                        </div>
                        <div style={{ paddingBottom: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'white', margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{watch("name") || "Company Settings"}</h1>
                                {watch("isVerified") && <CheckCircle2 style={{ color: '#5C9AFF' }} size={24} />}
                            </div>
                            <p style={{ color: '#f8fafc', fontSize: '14px', margin: '8px 0 0', fontWeight: 600, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{watch("website") || "No website set"}</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', paddingBottom: '10px' }}>
                        <button
                            onClick={handleSubmit(onSubmit)}
                            disabled={saving}
                            style={{ padding: '14px 32px', backgroundColor: '#5C9AFF', color: 'white', border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)' }}
                        >
                            {saving ? <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={18} /> : <Save size={18} />}
                            {saving ? "Updating..." : "Save Changes"}
                        </button>
                    </div>
                </div>

                <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', borderTop: '1px solid #1e293b', padding: '20px 48px', display: 'flex', gap: '60px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Calendar style={{ color: '#fbbf24' }} size={20} />
                        <div>
                             <p style={{ color: 'white', fontWeight: 800, fontSize: '16px', margin: 0 }}>{watch("establishedDate")?.split('-')[0] || "---"}</p>
                            <p style={{ color: '#64748b', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>Founded</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Users style={{ color: '#fbbf24' }} size={20} />
                        <div>
                            <p style={{ color: 'white', fontWeight: 800, fontSize: '16px', margin: 0 }}>{watch("employeeCount") || "0"}</p>
                            <p style={{ color: '#64748b', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>Employees</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <MapPin style={{ color: '#fbbf24' }} size={20} />
                        <div>
                            <p style={{ color: 'white', fontWeight: 800, fontSize: '16px', margin: 0 }}>{officeFields.length}</p>
                            <p style={{ color: '#64748b', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>Offices</p>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{
                display: 'flex',
                gap: '8px', 
                padding: '4px', 
                backgroundColor: '#f1f5f9', 
                borderRadius: '20px', 
                alignSelf: 'flex-start',
                maxWidth: '100%',
                overflowX: 'auto'
            }}>
                {[
                    { id: 'branding', label: 'Branding', icon: <AppWindow size={16} /> },
                    { id: 'reputation', label: 'Reputation & Partners', icon: <Handshake size={16} /> },
                    { id: 'organization', label: 'Organization & HR', icon: <Users size={16} /> },
                    { id: 'services', label: 'Services & Solutions', icon: <Server size={16} /> },
                    { id: 'locations', label: 'Offices', icon: <MapPin size={16} /> }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            padding: '12px 24px', 
                            borderRadius: '16px', 
                            border: 'none', 
                            fontSize: '13px', 
                            fontWeight: 700, 
                            cursor: 'pointer', 
                            transition: 'all 0.2s', 
                            backgroundColor: activeTab === tab.id ? 'white' : 'transparent', 
                            color: activeTab === tab.id ? '#0f172a' : '#64748b', 
                            boxShadow: activeTab === tab.id ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none'
                        }}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px', alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {activeTab === 'branding' && (
                        <section style={{ backgroundColor: 'white', padding: '40px', borderRadius: '32px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#5C9AFF' }}>
                                <AppWindow size={20} />
                                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Branding</h3>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Company Logo</label>
                                    <div 
                                        onClick={() => document.getElementById('logo-upload')?.click()}
                                        style={{ height: '120px', width: '120px', backgroundColor: '#f8fafc', borderRadius: '24px', border: '2px dashed #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
                                    >
                                        {logoUrl ? <img src={logoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Logo Preview" /> : <Camera size={32} color="#94a3b8" />}
                                        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', opacity: 0, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}>
                                            <Camera color="white" size={24} />
                                        </div>
                                        <input id="logo-upload" type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'logo')} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Cover Photo</label>
                                    <div 
                                        onClick={() => document.getElementById('cover-upload')?.click()}
                                        style={{ height: '120px', width: '100%', backgroundColor: '#f8fafc', borderRadius: '24px', border: '2px dashed #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
                                    >
                                        {coverUrl ? <img src={coverUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Cover Preview" /> : <Camera size={32} color="#94a3b8" />}
                                        <input id="cover-upload" type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'cover')} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Company Name</label>
                                    <input {...register("name")} style={{ width: '100%', padding: '16px 24px', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '16px', fontSize: '15px', fontWeight: 600, outline: 'none' }} placeholder="VD: Nexus Technology" />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Website</label>
                                    <input {...register("website")} style={{ width: '100%', padding: '16px 24px', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '16px', fontSize: '15px', fontWeight: 600, outline: 'none' }} placeholder="https://..." />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Description</label>
                                <textarea
                                    {...register("description")}
                                    style={{ width: '100%', height: '160px', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '16px', padding: '24px', fontSize: '15px', fontWeight: 500, lineHeight: 1.6, color: '#475569', resize: 'none', outline: 'none' }}
                                    placeholder="Share your company's vision..."
                                />
                            </div>
                        </section>
                    )}

                    {activeTab === 'reputation' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            <section style={{ backgroundColor: 'white', padding: '40px', borderRadius: '32px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#5C9AFF' }}>
                                        <Handshake size={20} />
                                        <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Partners & Clients</h3>
                                    </div>
                                    <button type="button" onClick={() => appendPartner({ name: "", logoUrl: "" })} style={{ background: 'none', border: 'none', color: '#5C9AFF', fontWeight: 800, fontSize: '11px', cursor: 'pointer' }}>+ ADD PARTNER</button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px' }}>
                                    {partnerFields.map((field, index) => (
                                        <div key={field.id} style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '24px', border: '1px solid #f1f5f9', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                                            <button type="button" onClick={() => removePartner(index)} style={{ position: 'absolute', top: '12px', right: '12px', border: 'none', background: 'none', color: '#ef4444' }}><Trash2 size={16} /></button>
                                            <div 
                                                onClick={() => document.getElementById(`partner-logo-${index}`)?.click()}
                                                style={{ width: '80px', height: '80px', backgroundColor: 'white', borderRadius: '20px', border: '2px dashed #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}
                                            >
                                                {watch(`partners.${index}.logoUrl`) ? (
                                                    <img src={watch(`partners.${index}.logoUrl`)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                ) : (
                                                    <Camera size={24} color="#94a3b8" />
                                                )}
                                                <input id={`partner-logo-${index}`} type="file" hidden accept="image/*" onChange={(e) => handlePartnerLogoUpload(index, e)} />
                                            </div>
                                            <input 
                                                {...register(`partners.${index}.name`)} 
                                                placeholder="Partner Name" 
                                                style={{ textAlign: 'center', background: 'none', border: 'none', fontSize: '14px', fontWeight: 800, color: '#0f172a', width: '100%', outline: 'none' }} 
                                            />
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section style={{ backgroundColor: 'white', padding: '40px', borderRadius: '32px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#5C9AFF' }}>
                                        <Award size={20} />
                                        <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Certificates & Awards</h3>
                                    </div>
                                    <button type="button" onClick={() => appendAward({ title: "", year: "" })} style={{ background: 'none', border: 'none', color: '#5C9AFF', fontWeight: 800, fontSize: '11px', cursor: 'pointer' }}>+ ADD AWARD</button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    {awardFields.map((field, index) => (
                                        <div key={field.id} style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '24px', border: '1px solid #f1f5f9', position: 'relative' }}>
                                            <button type="button" onClick={() => removeAward(index)} style={{ position: 'absolute', top: '12px', right: '12px', border: 'none', background: 'none', color: '#ef4444' }}><Trash2 size={16} /></button>
                                            <div style={{ display: 'flex', gap: '20px' }}>
                                                <div 
                                                    onClick={() => document.getElementById(`award-img-${index}`)?.click()}
                                                    style={{ width: '64px', height: '64px', backgroundColor: 'white', borderRadius: '16px', border: '2px dashed #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', flexShrink: 0 }}
                                                >
                                                    {watch(`awards.${index}.imageUrl`) ? (
                                                        <img src={watch(`awards.${index}.imageUrl`)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <Award size={20} color="#cbd5e1" />
                                                    )}
                                                    <input id={`award-img-${index}`} type="file" hidden accept="image/*" onChange={(e) => handleAwardImageUpload(index, e)} />
                                                </div>
                                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    <input {...register(`awards.${index}.title`)} placeholder="Certificate/Award Title" style={{ background: 'none', border: 'none', fontWeight: 700, fontSize: '16px', outline: 'none', color: '#0f172a' }} />
                                                    <input {...register(`awards.${index}.year`)} placeholder="Year" style={{ background: 'none', border: 'none', fontWeight: 700, color: '#5C9AFF', outline: 'none', fontSize: '13px' }} />
                                                    <textarea 
                                                        {...register(`awards.${index}.description`)} 
                                                        placeholder="Brief description of the award..." 
                                                        style={{ background: 'none', border: 'none', fontSize: '12px', color: '#64748b', outline: 'none', resize: 'none', width: '100%', minHeight: '40px' }} 
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'organization' && (
                        <section style={{ backgroundColor: 'white', padding: '40px', borderRadius: '32px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#5C9AFF' }}>
                                <Briefcase size={20} />
                                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Business Info</h3>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8' }}>HEADQUARTERS</label>
                                    <input {...register("address")} style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '14px', outline: 'none' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8' }}>REPRESENTATIVE</label>
                                    <input {...register("representative")} style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '14px', outline: 'none' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8' }}>FOUNDED DATE</label>
                                    <input type="date" {...register("establishedDate")} style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '14px', outline: 'none' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8' }}>TAX CODE</label>
                                    <input {...register("taxCode")} style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '14px', outline: 'none' }} />
                                </div>
                            </div>

                            <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#5C9AFF' }}>
                                        <Users size={20} />
                                        <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Key Members</h3>
                                    </div>
                                    <button type="button" onClick={() => appendMember({ name: "", position: "" })} style={{ background: 'none', border: 'none', color: '#5C9AFF', fontWeight: 800, fontSize: '11px', cursor: 'pointer' }}>+ ADD MEMBER</button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    {memberFields.map((field, index) => (
                                        <div key={field.id} style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '24px', border: '1px solid #f1f5f9', position: 'relative', display: 'flex', gap: '20px', alignItems: 'center' }}>
                                            <button type="button" onClick={() => removeMember(index)} style={{ position: 'absolute', top: '12px', right: '12px', border: 'none', background: 'none', color: '#ef4444' }}><Trash2 size={16} /></button>
                                            <div 
                                                onClick={() => document.getElementById(`member-img-${index}`)?.click()}
                                                style={{ width: '70px', height: '70px', backgroundColor: 'white', borderRadius: '18px', border: '2px dashed #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', flexShrink: 0 }}
                                            >
                                                {watch(`members.${index}.imageUrl`) ? (
                                                    <img src={watch(`members.${index}.imageUrl`)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <UserCircle2 size={24} color="#94a3b8" />
                                                )}
                                                <input id={`member-img-${index}`} type="file" hidden accept="image/*" onChange={(e) => handleMemberImageUpload(index, e)} />
                                            </div>
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <input {...register(`members.${index}.name`)} placeholder="Member Name" style={{ background: 'none', border: 'none', fontWeight: 800, fontSize: '15px', color: '#0f172a', outline: 'none' }} />
                                                <input {...register(`members.${index}.position`)} placeholder="Position" style={{ background: 'none', border: 'none', fontWeight: 600, fontSize: '13px', color: '#5C9AFF', outline: 'none' }} />
                                                <textarea 
                                                    {...register(`members.${index}.description`)} 
                                                    placeholder="Member bio / description..." 
                                                    style={{ background: 'none', border: 'none', fontSize: '12px', color: '#64748b', outline: 'none', resize: 'none', width: '100%', minHeight: '60px', marginTop: '4px' }} 
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {activeTab === 'services' && (
                         <section style={{ backgroundColor: 'white', padding: '40px', borderRadius: '32px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#5C9AFF' }}>
                                    <Server size={20} />
                                    <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Services</h3>
                                </div>
                                <button onClick={() => appendService({ title: "", description: "" })} style={{ background: 'none', border: 'none', color: '#5C9AFF', fontWeight: 800, fontSize: '11px', cursor: 'pointer' }}>+ ADD SERVICE</button>
                            </div>
                            {serviceFields.map((field, index) => (
                                <div key={field.id} style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '24px', border: '1px solid #f1f5f9', position: 'relative' }}>
                                    <button onClick={() => removeService(index)} style={{ position: 'absolute', right: '16px', top: '16px', color: '#ef4444', background: 'none', border: 'none' }}><Trash2 size={16} /></button>
                                    <input {...register(`services.${index}.title`)} placeholder="Service Title" style={{ background: 'none', border: 'none', fontWeight: 800, fontSize: '16px', outline: 'none', marginBottom: '8px', display: 'block' }} />
                                    <textarea {...register(`services.${index}.description`)} placeholder="Description" style={{ background: 'none', border: 'none', fontSize: '14px', outline: 'none', resize: 'none', width: '100%' }} />
                                </div>
                            ))}
                        </section>
                    )}

                    {activeTab === 'locations' && (
                        <section style={{ backgroundColor: 'white', padding: '40px', borderRadius: '32px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#5C9AFF' }}>
                                    <MapPin size={20} />
                                    <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Offices</h3>
                                </div>
                                <button onClick={() => appendOffice({ label: "", address: "" })} style={{ background: 'none', border: 'none', color: '#5C9AFF', fontWeight: 800, fontSize: '11px', cursor: 'pointer' }}>+ ADD OFFICE</button>
                            </div>
                            {officeFields.map((field, index) => (
                                <div key={field.id} style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '24px', border: '1px solid #f1f5f9', position: 'relative', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <button type="button" onClick={() => removeOffice(index)} style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', color: '#ef4444' }}><Trash2 size={16} /></button>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>OFFICE LABEL</label>
                                            <input {...register(`offices.${index}.label`)} placeholder="e.g. Da Nang Branch" style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', fontSize: '14px', outline: 'none', fontWeight: 600 }} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>ADDRESS</label>
                                            <input {...register(`offices.${index}.address`)} placeholder="Full address" style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', fontSize: '14px', outline: 'none', fontWeight: 600 }} />
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>CONTACT EMAIL</label>
                                            <input {...register(`offices.${index}.email`)} placeholder="office@company.com" style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', fontSize: '14px', outline: 'none', fontWeight: 600 }} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>PHONE NUMBER</label>
                                            <input {...register(`offices.${index}.phone`)} placeholder="+84 ..." style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', fontSize: '14px', outline: 'none', fontWeight: 600 }} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>SCHEDULE</label>
                                            <input {...register(`offices.${index}.schedule`)} placeholder="Mon-Fri : 10:00-19:30" style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', fontSize: '14px', outline: 'none', fontWeight: 600 }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </section>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div style={{ backgroundColor: '#0f172a', padding: '32px', borderRadius: '32px', color: 'white' }}>
                        <h4 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 12px' }}>Profile Quality</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Completeness</span>
                                <span style={{ fontSize: '12px', fontWeight: 800 }}>{completeness}%</span>
                            </div>
                            <div style={{ height: '6px', width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                                <div style={{ height: '100%', width: `${completeness}%`, backgroundColor: '#5C9AFF', borderRadius: '3px' }} />
                            </div>
                        </div>
                    </div>

                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '32px', border: '1px solid #f1f5f9' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 24px', display: 'flex', alignItems: 'center', gap: '10px' }}><Cloud size={18} color="#5C9AFF" /> Security Status</h4>
                        <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <ShieldCheck size={16} color="#22c55e" />
                                <span style={{ fontSize: '13px', fontWeight: 700 }}>SSL Encrypted</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        style={{ position: 'fixed', bottom: '40px', right: '40px', padding: '16px 32px', borderRadius: '16px', backgroundColor: '#0f172a', color: 'white', zIndex: 100 }}
                    >
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>{message.text}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <ConfirmModal 
                isOpen={isConfirmModalOpen}
                title="Update Profile"
                message="Save changes to your company profile?"
                onConfirm={confirmSubmit}
                onCancel={() => setIsConfirmModalOpen(false)}
                type="info"
            />
        </div>
    );
}
