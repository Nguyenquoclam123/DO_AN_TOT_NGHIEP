"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
    Building2,
    ShieldCheck,
    MapPin,
    Globe,
    Users,
    ChevronDown,
    CheckCircle2,
    FileText,
    Zap,
    TrendingUp,
    Award,
    Target,
    Briefcase,
    ArrowLeft,
    Mail,
    Phone,
    ExternalLink,
    Loader2,
    Calendar,
    Server,
    Cpu,
    ArrowRight,
    Map,
    Navigation,
    Handshake
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import AddressMap from "@/components/shared/AddressMap";

interface CompanyData {
    id: string;
    name: string;
    taxCode: string;
    website: string;
    logoUrl: string;
    logo?: string;
    coverUrl: string;
    cover?: string;
    industryId: string;
    scale: string;
    address: string;
    description: string;
    culture?: string;
    status: string;
    isVerified: boolean;
    email: string;
    establishedDate: string;
    representative: string;
    employeeCount: number;
    offices: { label: string; address: string; lat?: number; lng?: number }[];
    awards: { title: string; year: string; description?: string; imageUrl?: string }[];
    services: { title: string; description: string; details?: string }[];
    members: { name: string; position: string; imageUrl?: string; description?: string }[];
    partners: { name: string; logoUrl?: string; website?: string }[];
}

export default function CandidateCompanyDetailPage({ params }: { params: { id: string } }) {
    const [company, setCompany] = useState<CompanyData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'reputation' | 'jobs' | 'locations'>('overview');
    const [companyJobs, setCompanyJobs] = useState<any[]>([]);

    useEffect(() => {
        fetchCompanyData();
    }, [params.id]);

    const fetchCompanyData = async () => {
        try {
            setLoading(true);
            const [companyData, jobsData] = await Promise.all([
                api.get<CompanyData>(`/companies/${params.id}`),
                api.get<any[]>(`/jobs?companyId=${params.id}`)
            ]);
            setCompany(companyData);
            setCompanyJobs(jobsData || []);
        } catch (error) {
            console.error("Failed to fetch company data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', backgroundColor: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
                <div style={{ position: 'relative' }}>
                    <div style={{ height: '70px', width: '70px', border: '3px solid #f1f5f9', borderTopColor: '#5C9AFF', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <Building2 style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#5C9AFF' }} size={24} />
                </div>
                <p style={{ color: '#64748b', fontWeight: 600, fontSize: '14px' }}>Exploring Corporate Identity...</p>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!company) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
                <Building2 size={64} color="#cbd5e1" />
                <h2 style={{ marginTop: '24px', fontWeight: 800 }}>Company Not Found</h2>
                <Link href="/candidate/jobs" style={{ marginTop: '24px', color: '#5C9AFF', fontWeight: 700, textDecoration: 'none' }}>Back to Search</Link>
            </div>
        );
    }

    const companyLogo = company.logoUrl || company.logo;
    const companyCover = company.coverUrl || company.cover;

    const tabConfig = [
        { id: 'overview', label: 'Overview', icon: <Target size={16} /> },
        { id: 'team', label: 'Team', icon: <Users size={16} /> },
        { id: 'reputation', label: 'Reputation & Partners', icon: <Handshake size={16} /> },
        { id: 'jobs', label: 'Jobs', icon: <Briefcase size={16} />, count: companyJobs.length },
        { id: 'locations', label: 'Locations', icon: <MapPin size={16} /> }
    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
            {/* Top Navigation */}
            <div style={{ padding: '16px 40px', backgroundColor: 'white', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <Link href="/candidate/jobs" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
                        <ArrowLeft size={18} /> Back
                    </Link>
                    <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ height: '32px', width: '32px', backgroundColor: '#eff6ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            {companyLogo ? <img src={companyLogo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <Building2 size={16} color="#5C9AFF" />}
                        </div>
                        <span style={{ fontWeight: 800, color: '#0f172a' }}>{company.name}</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ padding: '10px 24px', backgroundColor: '#5C9AFF', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)' }}>Follow</button>
                </div>
            </div>

            <div style={{ padding: '40px 48px 100px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

                {/* Header Branding Section */}
                <div style={{ position: 'relative', borderRadius: '40px', overflow: 'hidden', backgroundColor: '#0f172a', border: '1px solid #1e293b', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                    {/* Banner */}
                    <div style={{ height: '360px', position: 'relative' }}>
                        <img
                            src={companyCover || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000&auto=format&fit=crop"}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>

                    {/* Info Section */}
                    <div style={{ padding: '0 64px 64px', marginTop: '-100px', position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '48px' }}>
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                style={{ height: '180px', width: '180px', backgroundColor: 'white', borderRadius: '40px', padding: '10px', boxShadow: '0 30px 40px -10px rgba(0, 0, 0, 0.4)', border: '10px solid #0f172a' }}
                            >
                                <div style={{ height: '100%', width: '100%', backgroundColor: 'white', borderRadius: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                    {companyLogo ? (
                                        <img src={companyLogo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <Building2 style={{ color: '#5C9AFF' }} size={72} />
                                    )}
                                </div>
                            </motion.div>
                            <div style={{ paddingBottom: '16px' }}>
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
                                >
                                    <h1 style={{ fontSize: '48px', fontWeight: 900, color: 'white', margin: 0, letterSpacing: '-0.03em', textShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>{company.name}</h1>
                                    {company.isVerified && <CheckCircle2 size={32} style={{ color: '#5C9AFF' }} />}
                                </motion.div>
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    style={{ display: 'flex', gap: '32px', marginTop: '24px' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f8fafc', fontSize: '15px', fontWeight: 700, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                                        <Globe size={18} /> {company.website?.replace(/^https?:\/\//, '') || "N/A"}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f8fafc', fontSize: '15px', fontWeight: 700, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                                        <Users size={18} /> {company.employeeCount || company.scale || "---"} Employees
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f8fafc', fontSize: '15px', fontWeight: 700, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                                        <MapPin size={18} /> {company.offices?.length || 1} Offices
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        <div style={{ paddingBottom: '16px' }}>
                            <a href={company.website} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                                <button style={{ padding: '16px 32px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px', fontSize: '15px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', backdropFilter: 'blur(12px)', transition: 'all 0.2s' }}>
                                    Official Website <ExternalLink size={18} />
                                </button>
                            </a>
                        </div>
                    </div>

                    {/* Quick Stats Banner */}
                    <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)', borderTop: '1px solid #1e293b', padding: '32px 64px', display: 'flex', gap: '100px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <Calendar style={{ color: '#fbbf24' }} size={28} />
                            <div>
                                <p style={{ color: 'white', fontWeight: 900, fontSize: '20px', margin: 0 }}>{company.establishedDate?.split('-')[0] || "---"}</p>
                                <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', margin: 0, letterSpacing: '0.05em' }}>Founded</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <Briefcase style={{ color: '#fbbf24' }} size={28} />
                            <div>
                                <p style={{ color: 'white', fontWeight: 900, fontSize: '20px', margin: 0 }}>{companyJobs.length}</p>
                                <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', margin: 0, letterSpacing: '0.05em' }}>Openings</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <ShieldCheck style={{ color: '#fbbf24' }} size={28} />
                            <div>
                                <p style={{ color: 'white', fontWeight: 900, fontSize: '20px', margin: 0 }}>Verified</p>
                                <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', margin: 0, letterSpacing: '0.05em' }}>Trusted Partner</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Navigation Tabs */}
                <div style={{ display: 'flex', gap: '12px', padding: '6px', backgroundColor: '#f1f5f9', borderRadius: '24px', alignSelf: 'flex-start' }}>
                    {tabConfig.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            style={{
                                padding: '14px 24px',
                                borderRadius: '18px',
                                border: 'none',
                                fontSize: '14px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                backgroundColor: activeTab === tab.id ? 'white' : 'transparent',
                                color: activeTab === tab.id ? '#0f172a' : '#64748b',
                                boxShadow: activeTab === tab.id ? '0 10px 15px -3px rgba(0,0,0,0.05)' : 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {tab.icon} {tab.label}
                            {tab.count !== undefined && (
                                <span style={{ backgroundColor: activeTab === tab.id ? '#eff6ff' : '#f1f5f9', color: activeTab === tab.id ? '#5C9AFF' : '#64748b', padding: '2px 8px', borderRadius: '8px', fontSize: '11px' }}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '48px' }}>

                    {/* Left Content Area */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                        {activeTab === 'overview' && (
                            <>
                                {/* About Section */}
                                <section>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                        <div style={{ width: '4px', height: '32px', backgroundColor: '#5C9AFF', borderRadius: '2px' }} />
                                        <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: 0 }}>Corporate Story</h2>
                                    </div>
                                    <div style={{ backgroundColor: 'white', padding: '48px', borderRadius: '32px', border: '1px solid #f1f5f9', fontSize: '17px', lineHeight: 1.8, color: '#475569', whiteSpace: 'pre-wrap', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                                        {company.description || "A detailed narrative of our corporate journey is being updated."}
                                    </div>
                                </section>

                                {/* Culture Section */}
                                {company.culture && (
                                    <section>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                            <div style={{ width: '4px', height: '32px', backgroundColor: '#5C9AFF', borderRadius: '2px' }} />
                                            <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: 0 }}>Corporate Culture</h2>
                                        </div>
                                        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '48px', borderRadius: '32px', position: 'relative', overflow: 'hidden' }}>
                                            <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1 }}>
                                                <TrendingUp size={200} color="white" />
                                            </div>
                                            <div style={{ position: 'relative', zIndex: 1, fontSize: '17px', lineHeight: 1.8, color: '#cbd5e1', whiteSpace: 'pre-wrap' }}>
                                                {company.culture}
                                            </div>
                                        </div>
                                    </section>
                                )}

                                {/* Services Portfolio */}
                                {company.services && company.services.length > 0 && (
                                    <section>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                            <div style={{ width: '4px', height: '32px', backgroundColor: '#5C9AFF', borderRadius: '2px' }} />
                                            <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: 0 }}>Services & Expertise</h2>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                            {company.services.map((service, idx) => (
                                                <div key={idx} style={{ backgroundColor: 'white', padding: '32px', borderRadius: '28px', border: '1px solid #f1f5f9', transition: 'all 0.3s', cursor: 'default' }}>
                                                    <div style={{ height: '48px', width: '48px', backgroundColor: '#eff6ff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                                                        <Cpu size={24} color="#5C9AFF" />
                                                    </div>
                                                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>{service.title}</h3>
                                                    <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>{service.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </>
                        )}

                        {activeTab === 'team' && (
                            <section>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                                    <div style={{ width: '4px', height: '32px', backgroundColor: '#5C9AFF', borderRadius: '2px' }} />
                                    <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: 0 }}>Leadership Team</h2>
                                </div>
                                {company.members && company.members.length > 0 ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '48px' }}>
                                        {company.members.map((member, idx) => (
                                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                                <motion.div
                                                    whileHover={{ scale: 1.05 }}
                                                    style={{
                                                        width: '180px',
                                                        height: '180px',
                                                        borderRadius: '50%',
                                                        overflow: 'hidden',
                                                        marginBottom: '20px',
                                                        border: '2px solid #f1f5f9',
                                                        padding: '6px',
                                                        backgroundColor: 'white',
                                                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)'
                                                    }}
                                                >
                                                    <img
                                                        src={member.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`}
                                                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                                    />
                                                </motion.div>
                                                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: '0 0 6px' }}>{member.name}</h3>
                                                <p style={{ fontSize: '14px', fontWeight: 600, color: '#5C9AFF', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{member.position}</p>
                                                {member.description && (
                                                    <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, margin: 0, maxWidth: '200px' }}>{member.description}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '64px', backgroundColor: 'white', borderRadius: '32px', border: '1px dashed #e2e8f0' }}>
                                        <Users size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                                        <p style={{ color: '#64748b', fontWeight: 600 }}>Leadership team information is being updated</p>
                                    </div>
                                )}
                            </section>
                        )}

                        {activeTab === 'reputation' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                                {/* Awards Section */}
                                <section>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                        <div style={{ width: '4px', height: '32px', backgroundColor: '#5C9AFF', borderRadius: '2px' }} />
                                        <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: 0 }}>Awards & Certifications</h2>
                                    </div>
                                    {company.awards && company.awards.length > 0 ? (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                                            {company.awards.map((award, idx) => (
                                                <div key={idx} style={{ backgroundColor: 'white', borderRadius: '24px', overflow: 'hidden', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                                                    <div style={{ height: '140px', backgroundColor: '#f8fafc', position: 'relative' }}>
                                                        {award.imageUrl ? (
                                                            <img src={award.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '12px' }} />
                                                        ) : (
                                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <Award size={32} color="#cbd5e1" />
                                                            </div>
                                                        )}
                                                        <div style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: '#5C9AFF', color: 'white', padding: '2px 10px', borderRadius: '100px', fontSize: '10px', fontWeight: 800 }}>{award.year}</div>
                                                    </div>
                                                    <div style={{ padding: '16px' }}>
                                                        <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>{award.title}</h4>
                                                        <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.4 }}>{award.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '64px', backgroundColor: 'white', borderRadius: '32px', border: '1px dashed #e2e8f0' }}>
                                            <Award size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                                            <p style={{ color: '#64748b', fontWeight: 600 }}>Certification and award data is being updated</p>
                                        </div>
                                    )}
                                </section>

                                {/* Partners Section */}
                                <section>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                                        <div style={{ width: '4px', height: '32px', backgroundColor: '#5C9AFF', borderRadius: '2px' }} />
                                        <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: 0 }}>Strategic Partners</h2>
                                    </div>
                                    {company.partners && company.partners.length > 0 ? (
                                        <div style={{ backgroundColor: 'white', padding: '48px', borderRadius: '40px', border: '1px solid #f1f5f9' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '24px' }}>
                                                {company.partners.map((partner, idx) => (
                                                    <motion.div
                                                        key={idx}
                                                        whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}
                                                        style={{
                                                            backgroundColor: 'white',
                                                            height: '100px',
                                                            borderRadius: '20px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            padding: '20px',
                                                            border: '1px solid #f1f5f9',
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                    >
                                                        <img src={partner.logoUrl} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', opacity: 0.8 }} title={partner.name} />
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '64px', backgroundColor: 'white', borderRadius: '32px', border: '1px dashed #e2e8f0' }}>
                                            <Handshake size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                                            <p style={{ color: '#64748b', fontWeight: 600 }}>Partner information is being updated</p>
                                        </div>
                                    )}
                                </section>
                            </div>
                        )}

                        {activeTab === 'jobs' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                                    <div style={{ width: '4px', height: '32px', backgroundColor: '#5C9AFF', borderRadius: '2px' }} />
                                    <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: 0 }}>Active Openings</h2>
                                </div>
                                {companyJobs.length > 0 ? companyJobs.map(job => (
                                    <Link key={job.id} href={`/candidate/jobs/${job.id}`} style={{ textDecoration: 'none' }}>
                                        <motion.div
                                            whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}
                                            style={{ backgroundColor: 'white', padding: '32px', borderRadius: '28px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                                        >
                                            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                                                <div style={{ height: '64px', width: '64px', backgroundColor: '#f8fafc', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Briefcase size={32} color="#5C9AFF" />
                                                </div>
                                                <div>
                                                    <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{job.title}</h4>
                                                    <p style={{ fontSize: '15px', color: '#64748b', marginTop: '6px', fontWeight: 500 }}>
                                                        {job.type && typeof job.type === 'object' ? (job.type as any).name : job.type} • {job.workLocation} • {job.level && typeof job.level === 'object' ? (job.level as any).name : job.level}
                                                    </p>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ backgroundColor: '#f0f9ff', color: '#0369a1', padding: '6px 16px', borderRadius: '10px', fontSize: '14px', fontWeight: 800, marginBottom: '8px' }}>
                                                    {job.minSalary && job.maxSalary ? `$${job.minSalary / 1000}k - $${job.maxSalary / 1000}k` : "Negotiable"}
                                                </div>
                                                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Posted on {new Date(job.createdAt).toLocaleDateString('en-US')}</p>
                                            </div>
                                        </motion.div>
                                    </Link>
                                )) : (
                                    <div style={{ textAlign: 'center', padding: '100px', backgroundColor: 'white', borderRadius: '40px', border: '1px dashed #cbd5e1' }}>
                                        <Briefcase size={64} color="#cbd5e1" style={{ margin: '0 auto 24px' }} />
                                        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>Future Opportunities</h3>
                                        <p style={{ color: '#64748b', fontSize: '15px' }}>We currently have no open positions. Follow us to stay updated!</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'locations' && (
                            <section style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '4px', height: '32px', backgroundColor: '#5C9AFF', borderRadius: '2px' }} />
                                    <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: 0 }}>Network System</h2>
                                </div>
                                <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '32px', border: '1px solid #f1f5f9' }}>
                                    <div style={{ borderRadius: '20px', overflow: 'hidden', marginBottom: '32px', border: '1px solid #f1f5f9' }}>
                                        <AddressMap
                                            offices={company.offices && company.offices.length > 0 ? company.offices : [{ label: 'Headquarters', address: company.address }]}
                                            height="450px"
                                        />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                        {company.offices && company.offices.length > 0 ? (
                                            company.offices.map((office, idx) => (
                                                <div key={idx} style={{ padding: '28px', backgroundColor: '#f8fafc', borderRadius: '28px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                                        <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#1e40af', margin: 0 }}>{office.label}</h4>
                                                        <a
                                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(office.address)}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            style={{
                                                                height: '36px',
                                                                width: '36px',
                                                                backgroundColor: 'white',
                                                                borderRadius: '10px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: '#5C9AFF',
                                                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                                                                border: '1px solid #f1f5f9'
                                                            }}
                                                        >
                                                            <ExternalLink size={16} />
                                                        </a>
                                                    </div>

                                                    <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                                                        <div style={{ flexShrink: 0, marginTop: '4px' }}>
                                                            <MapPin size={16} color="#94a3b8" />
                                                        </div>
                                                        <p style={{ fontSize: '14px', color: '#475569', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>{office.address}</p>
                                                    </div>

                                                    {(office.email || office.phone || office.schedule) && (
                                                        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                            {office.email && (
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                                                                    <div style={{ height: '28px', width: '28px', backgroundColor: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                        <Mail size={14} color="#5C9AFF" />
                                                                    </div>
                                                                    {office.email}
                                                                </div>
                                                            )}
                                                            {office.phone && (
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                                                                    <div style={{ height: '28px', width: '28px', backgroundColor: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                        <Phone size={14} color="#5C9AFF" />
                                                                    </div>
                                                                    {office.phone}
                                                                </div>
                                                            )}
                                                            {office.schedule && (
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                                                                    <div style={{ height: '28px', width: '28px', backgroundColor: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                        <Calendar size={14} color="#5C9AFF" />
                                                                    </div>
                                                                    {office.schedule}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{ gridColumn: 'span 2', padding: '24px', backgroundColor: '#f8fafc', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                                                <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#1e40af', margin: '0 0 12px' }}>Headquarters</h4>
                                                <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>{company.address}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                        {/* Corporate Meta Data */}
                        <section style={{ backgroundColor: 'white', padding: '40px', borderRadius: '32px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', color: '#0f172a' }}>
                                <ShieldCheck size={20} color="#5C9AFF" />
                                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Corporate Information</h3>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>Tax Code</span>
                                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', textAlign: 'right' }}>{company.taxCode || "N/A"}</span>
                                </div>
                                <div style={{ height: '1px', backgroundColor: '#f1f5f9' }} />

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>Headquarters</span>
                                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', textAlign: 'right', maxWidth: '200px' }}>{company.address || "N/A"}</span>
                                </div>
                                <div style={{ height: '1px', backgroundColor: '#f1f5f9' }} />

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>Representative</span>
                                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>{company.representative || "N/A"}</span>
                                </div>
                                <div style={{ height: '1px', backgroundColor: '#f1f5f9' }} />

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>Contact Email</span>
                                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#5C9AFF' }}>{company.email || "N/A"}</span>
                                </div>
                                <div style={{ height: '1px', backgroundColor: '#f1f5f9' }} />

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>Founded Date</span>
                                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                                        {company.establishedDate ? new Date(company.establishedDate).toLocaleDateString('en-US') : "N/A"}
                                    </span>
                                </div>
                            </div>
                        </section>

                        {/* Why Join Us Highlight */}
                        <section style={{ padding: '40px', borderRadius: '32px', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '1px solid #bfdbfe' }}>
                            <div style={{ height: '40px', width: '40px', backgroundColor: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', boxShadow: '0 10px 15px rgba(37, 99, 235, 0.1)' }}>
                                <Zap size={20} color="#5C9AFF" />
                            </div>
                            <h4 style={{ fontSize: '18px', fontWeight: 900, color: '#1e40af', margin: '0 0 12px' }}>Elevate Your Career</h4>
                            <p style={{ fontSize: '14px', color: '#4A8CFF', lineHeight: 1.6, margin: '0 0 24px' }}>Join a global team committed to excellence, innovation, and mutual growth.</p>
                            <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {[
                                    'Global working environment',
                                    'Professional certification support',
                                    'Clear career path',
                                    'Creative & open culture'
                                ].map((item, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: 700, color: '#1e3a8a' }}>
                                        <div style={{ height: '8px', width: '8px', borderRadius: '50%', backgroundColor: '#5C9AFF' }} /> {item}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
