"use client";

import React, { useEffect, useState } from "react";
import {
    Search,
    Briefcase,
    Clock,
    TrendingUp,
    ShieldAlert,
    FileSearch,
    MapPin,
    Building2,
    X,
    DollarSign,
    Calendar,
    BrainCircuit,
    Award,
    CheckCircle2,
    ArrowRight,
    Tag,
    Layers,
    UserCheck
} from "lucide-react";
import { api } from "@/lib/api";
import Link from "next/link";

export default function AdminJobsManagement() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedJob, setSelectedJob] = useState<any | null>(null);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const data = await api.get<any[]>('/jobs');
                setJobs(data);
            } catch (err) {
                console.error("Failed to fetch jobs", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchJobs();
    }, []);

    // Filter jobs based on search query
    const filteredJobs = jobs.filter(job => 
        job.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        job.company?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.workLocation?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = [
        { label: "ACTIVE POSTINGS", value: jobs.length.toString(), trend: "Real-time", color: "#5C9AFF", bg: "#eff6ff", icon: <Briefcase size={22} /> },
        { label: "REMOTE JOBS", value: jobs.filter(j => j.type === 'REMOTE' || j.workLocation?.toUpperCase() === 'REMOTE').length.toString(), trend: "Flexibility", color: "#10b981", bg: "#f0fdf4", icon: <Clock size={22} /> },
        { label: "URGENT", value: jobs.filter(j => j.isUrgent || j.status === 'URGENT').length.toString(), trend: "Priority", color: "#ef4444", bg: "#fef2f2", icon: <ShieldAlert size={22} /> },
        { label: "COMPANIES HIRING", value: new Set(jobs.map(j => j.companyId)).size.toString(), trend: "Growth", color: "#7c3aed", bg: "#f5f3ff", icon: <TrendingUp size={22} /> },
    ];

    const getStatusStyle = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'ACTIVE':
                return { color: '#10b981', bg: '#ecfdf5', label: 'ACTIVE' };
            case 'DRAFT':
                return { color: '#f59e0b', bg: '#fef3c7', label: 'DRAFT' };
            case 'CLOSED':
                return { color: '#ef4444', bg: '#fef2f2', label: 'CLOSED' };
            default:
                return { color: '#64748b', bg: '#f8fafc', label: status || 'UNKNOWN' };
        }
    };

    if (isLoading) return <div style={{ padding: '40px', fontFamily: 'Inter, sans-serif', color: '#64748b' }}>Loading job repository...</div>;

    return (
        <div style={{ padding: '40px', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes slideIn {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .job-row {
                    transition: all 0.2s ease;
                    cursor: pointer;
                }
                .job-row:hover {
                    background-color: #f8fafc !important;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
                }
            `}} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Global Job Repository</h1>
                    <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>Monitor job market trends and oversee recruitment compliance.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
                {stats.map((stat, i) => (
                    <div key={i} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ width: '48px', height: '48px', backgroundColor: stat.bg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>{stat.icon}</div>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: stat.color, backgroundColor: stat.bg, padding: '4px 10px', borderRadius: '20px' }}>{stat.trend}</span>
                        </div>
                        <div>
                            <p style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px', margin: 0 }}>{stat.label}</p>
                            <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 4px 20px rgba(15, 23, 42, 0.02)' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '360px' }}>
                        <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
                        <input 
                            type="text" 
                            placeholder="Search by title, company, location..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ 
                                width: '100%', 
                                padding: '12px 16px 12px 48px', 
                                backgroundColor: '#f8fafc', 
                                border: '1px solid #e2e8f0', 
                                borderRadius: '12px', 
                                fontSize: '13px', 
                                outline: 'none',
                                transition: 'all 0.2s'
                            }} 
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery("")}
                                style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                        Showing {filteredJobs.length} of {jobs.length} jobs
                    </div>
                </div>

                {filteredJobs.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.05em' }}>JOB TITLE</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.05em' }}>COMPANY</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.05em' }}>LOCATION & TYPE</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.05em' }}>SALARY</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.05em' }}>STATUS</th>
                                <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.05em' }}>POSTED</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredJobs.map(job => {
                                const statusStyle = getStatusStyle(job.status);
                                return (
                                    <tr 
                                        key={job.id} 
                                        onClick={() => setSelectedJob(job)}
                                        className="job-row"
                                        style={{ borderBottom: '1px solid #f8fafc' }}
                                    >
                                        <td style={{ padding: '20px 24px' }}>
                                            <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '14px' }}>
                                                {job.title} {job.campaigns && job.campaigns.length > 0 ? `(${job.campaigns[0].name})` : ''}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>ID: {job.id.substring(0, 8)}...</div>
                                        </td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                                                <Building2 size={14} color="#94a3b8" /> {job.company?.name || 'Private Employer'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
                                                <MapPin size={14} color="#94a3b8" /> {job.workLocation || job.location || 'Remote'}
                                            </div>
                                            <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>{job.type || 'Full-time'} • {job.level?.name || 'All Levels'}</div>
                                        </td>
                                        <td style={{ padding: '20px 24px', fontSize: '13px', fontWeight: 700, color: '#059669' }}>
                                            {job.minSalary && job.maxSalary ? `$${(job.minSalary / 1000).toFixed(0)}k - $${(job.maxSalary / 1000).toFixed(0)}k` : 'Negotiable'}
                                        </td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <span style={{ 
                                                fontSize: '11px', 
                                                fontWeight: 800, 
                                                color: statusStyle.color, 
                                                backgroundColor: statusStyle.bg, 
                                                padding: '4px 10px', 
                                                borderRadius: '20px',
                                                display: 'inline-block'
                                            }}>
                                                {statusStyle.label}
                                            </span>
                                        </td>
                                        <td style={{ padding: '20px 24px', textAlign: 'right', fontSize: '12px', color: '#94a3b8' }}>
                                            {new Date(job.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <div style={{ padding: '100px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '100px', height: '100px', backgroundColor: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                            <FileSearch size={44} color="#cbd5e1" />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: '0' }}>No matching job postings.</h3>
                        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px', maxWidth: '340px' }}>
                            Try adjusting your search keywords to find specific job entries.
                        </p>
                    </div>
                )}
            </div>

            {/* Premium Details Side Drawer */}
            {selectedJob && (
                <>
                    {/* Backdrop */}
                    <div 
                        onClick={() => setSelectedJob(null)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(15, 23, 42, 0.4)',
                            backdropFilter: 'blur(6px)',
                            zIndex: 999,
                            animation: 'fadeIn 0.25s ease-out forwards'
                        }}
                    />

                    {/* Slide-out Panel */}
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        right: 0,
                        bottom: 0,
                        width: '640px',
                        backgroundColor: 'white',
                        boxShadow: '-12px 0 40px rgba(15, 23, 42, 0.12)',
                        zIndex: 1000,
                        display: 'flex',
                        flexDirection: 'column',
                        animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                        borderLeft: '1px solid #e2e8f0'
                    }}>
                        {/* Drawer Header */}
                        <div style={{
                            padding: '32px',
                            borderBottom: '1px solid #f1f5f9',
                            position: 'relative',
                            background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)'
                        }}>
                            <button 
                                onClick={() => setSelectedJob(null)}
                                style={{
                                    position: 'absolute',
                                    top: '24px',
                                    right: '24px',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    backgroundColor: 'white',
                                    border: '1px solid #e2e8f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: '#64748b',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = '#64748b'; }}
                            >
                                <X size={18} />
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                                <span style={{ 
                                    fontSize: '11px', 
                                    fontWeight: 850, 
                                    letterSpacing: '0.05em',
                                    color: getStatusStyle(selectedJob.status).color, 
                                    backgroundColor: getStatusStyle(selectedJob.status).bg, 
                                    padding: '4px 10px', 
                                    borderRadius: '20px',
                                    textTransform: 'uppercase'
                                }}>
                                    {selectedJob.status}
                                </span>
                                {selectedJob.category?.name && (
                                    <span style={{ 
                                        fontSize: '11px', 
                                        fontWeight: 700, 
                                        color: '#7c3aed', 
                                        backgroundColor: '#f5f3ff', 
                                        padding: '4px 10px', 
                                        borderRadius: '20px'
                                    }}>
                                        {selectedJob.category.name}
                                    </span>
                                )}
                            </div>

                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0', lineHeight: 1.25 }}>
                                {selectedJob.title}
                            </h2>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#475569', fontSize: '14px', flexWrap: 'wrap' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                                    <Building2 size={16} color="#94a3b8" /> {selectedJob.company?.name || 'Private Employer'}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <MapPin size={16} color="#94a3b8" /> {selectedJob.workLocation || selectedJob.location || 'Remote'}
                                </span>
                            </div>
                        </div>

                        {/* Drawer Content */}
                        <div style={{ padding: '32px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            {/* Key Stats Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                <div style={{ padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>
                                        <DollarSign size={14} /> Salary Target
                                    </div>
                                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#059669' }}>
                                        {selectedJob.minSalary && selectedJob.maxSalary ? `$${selectedJob.minSalary.toLocaleString()} - $${selectedJob.maxSalary.toLocaleString()}` : 'Negotiable'}
                                    </div>
                                </div>
                                <div style={{ padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>
                                        <Layers size={14} /> Role Levels
                                    </div>
                                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
                                        {selectedJob.level?.name || 'All Levels'} • {selectedJob.position?.name || 'Full Stack'}
                                    </div>
                                </div>
                                <div style={{ padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>
                                        <UserCheck size={14} /> Open Openings
                                    </div>
                                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
                                        {selectedJob.quantity || 1} position(s)
                                    </div>
                                </div>
                                <div style={{ padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>
                                        <Calendar size={14} /> Application Deadline
                                    </div>
                                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
                                        {selectedJob.expiredAt ? new Date(selectedJob.expiredAt).toLocaleDateString() : 'No deadline set'}
                                    </div>
                                </div>
                            </div>

                            {/* AI Matching Info Card */}
                            <div style={{ 
                                padding: '20px', 
                                borderRadius: '20px', 
                                background: 'linear-gradient(135deg, #f5f3ff 0%, #edd9ff 100%)', 
                                border: '1px solid #d8b4fe',
                                display: 'flex',
                                gap: '16px'
                            }}>
                                <div style={{ 
                                    width: '40px', 
                                    height: '40px', 
                                    borderRadius: '10px', 
                                    backgroundColor: 'white', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    color: '#7c3aed',
                                    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.1)',
                                    flexShrink: 0
                                }}>
                                    <BrainCircuit size={20} />
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 800, color: '#4c1d95' }}>AI Semantic Alignment Active</h4>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#6d28d9', lineHeight: 1.5 }}>
                                        This job description has been vector indexed in the PgVector database. Matches are calculated automatically for candidate CVs matching over 70% relevance.
                                    </p>
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                                        <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: 'rgba(255,255,255,0.6)', padding: '2px 8px', borderRadius: '4px', color: '#6d28d9' }}>
                                            Dimension: 1536
                                        </span>
                                        <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: 'rgba(255,255,255,0.6)', padding: '2px 8px', borderRadius: '4px', color: '#6d28d9' }}>
                                            Status: Synced
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Required Skills */}
                            <div>
                                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', margin: '0 0 12px 0', letterSpacing: '0.05em' }}>Required Skills</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {selectedJob.skills && selectedJob.skills.length > 0 ? (
                                        selectedJob.skills.map((skill: any, idx: number) => (
                                            <span 
                                                key={idx}
                                                style={{ 
                                                    fontSize: '13px', 
                                                    fontWeight: 600, 
                                                    color: '#3b82f6', 
                                                    backgroundColor: '#eff6ff', 
                                                    border: '1px solid #bfdbfe',
                                                    padding: '6px 12px', 
                                                    borderRadius: '8px'
                                                }}
                                            >
                                                {skill.skillName}
                                            </span>
                                        ))
                                    ) : (
                                        <span style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic' }}>No specific skills indexed</span>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', margin: '0 0 12px 0', letterSpacing: '0.05em' }}>Job Description</h4>
                                <div style={{ 
                                    fontSize: '14px', 
                                    color: '#334155', 
                                    lineHeight: 1.7, 
                                    whiteSpace: 'pre-line',
                                    backgroundColor: '#f8fafc',
                                    padding: '20px',
                                    borderRadius: '16px',
                                    border: '1px solid #f1f5f9'
                                }}>
                                    {selectedJob.description}
                                </div>
                            </div>

                            {/* Responsibilities */}
                            {selectedJob.responsibilities && (
                                <div>
                                    <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', margin: '0 0 12px 0', letterSpacing: '0.05em' }}>Key Responsibilities</h4>
                                    <div style={{ 
                                        fontSize: '14px', 
                                        color: '#334155', 
                                        lineHeight: 1.7, 
                                        whiteSpace: 'pre-line',
                                        backgroundColor: '#f8fafc',
                                        padding: '20px',
                                        borderRadius: '16px',
                                        border: '1px solid #f1f5f9'
                                    }}>
                                        {selectedJob.responsibilities}
                                    </div>
                                </div>
                            )}

                            {/* Benefits */}
                            {selectedJob.benefits && (
                                <div>
                                    <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', margin: '0 0 12px 0', letterSpacing: '0.05em' }}>Benefits & Perks</h4>
                                    <div style={{ 
                                        fontSize: '14px', 
                                        color: '#334155', 
                                        lineHeight: 1.7, 
                                        whiteSpace: 'pre-line',
                                        backgroundColor: '#f8fafc',
                                        padding: '20px',
                                        borderRadius: '16px',
                                        border: '1px solid #f1f5f9'
                                    }}>
                                        {selectedJob.benefits}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Drawer Footer */}
                        <div style={{
                            padding: '24px 32px',
                            borderTop: '1px solid #f1f5f9',
                            backgroundColor: '#f8fafc',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px'
                        }}>
                            {selectedJob.company?.id && (
                                <Link href={`/admin/companies/${selectedJob.company.id}`} style={{ textDecoration: 'none' }}>
                                    <button style={{
                                        padding: '12px 20px',
                                        borderRadius: '12px',
                                        backgroundColor: 'white',
                                        border: '1px solid #e2e8f0',
                                        color: '#475569',
                                        fontSize: '13px',
                                        fontWeight: 700,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; }}
                                    >
                                        Inspect Employer Profile <ArrowRight size={14} />
                                    </button>
                                </Link>
                            )}
                            <button 
                                onClick={() => setSelectedJob(null)}
                                style={{
                                    padding: '12px 20px',
                                    borderRadius: '12px',
                                    backgroundColor: '#0f172a',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1e293b'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0f172a'; }}
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
