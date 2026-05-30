"use client";

import React, { useEffect, useState } from "react";
import {
    Search,
    Briefcase,
    Clock,
    TrendingUp,
    Filter,
    ShieldAlert,
    FileSearch,
    MapPin,
    Building2
} from "lucide-react";
import { api } from "@/lib/api";

export default function AdminJobsManagement() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

    const stats = [
        { label: "ACTIVE POSTINGS", value: jobs.length.toString(), trend: "Real-time", color: "#5C9AFF", bg: "#eff6ff", icon: <Briefcase size={22} /> },
        { label: "REMOTE JOBS", value: jobs.filter(j => j.locationType === 'REMOTE').length.toString(), trend: "Flexibility", color: "#10b981", bg: "#f0fdf4", icon: <Clock size={22} /> },
        { label: "URGENT", value: jobs.filter(j => j.isUrgent).length.toString(), trend: "Priority", color: "#ef4444", bg: "#fef2f2", icon: <ShieldAlert size={22} /> },
        { label: "COMPANIES HIRING", value: new Set(jobs.map(j => j.companyId)).size.toString(), trend: "Growth", color: "#7c3aed", bg: "#f5f3ff", icon: <TrendingUp size={22} /> },
    ];

    if (isLoading) return <div style={{ padding: '40px' }}>Loading job repository...</div>;

    return (
        <div style={{ padding: '40px', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
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

            <div style={{ backgroundColor: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '320px' }}>
                        <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
                        <input type="text" placeholder="Search by title or company..." style={{ width: '100%', padding: '10px 16px 10px 48px', backgroundColor: '#f8fafc', border: 'none', borderRadius: '10px', fontSize: '13px', outline: 'none' }} />
                    </div>
                </div>

                {jobs.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>JOB TITLE</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>COMPANY</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>LOCATION & TYPE</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>SALARY</th>
                                <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>POSTED</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map(job => (
                                <tr key={job.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '14px' }}>
                                            {job.title} {job.campaigns && job.campaigns.length > 0 ? `(${job.campaigns[0].name})` : ''}
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>ID: {job.id.substring(0, 8)}...</div>
                                    </td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                                            <Building2 size={14} /> {job.company?.name || 'Private Employer'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
                                            <MapPin size={14} /> {job.location || 'Remote'}
                                        </div>
                                        <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>{job.employmentType} • {job.workMode || 'Hybrid'}</div>
                                    </td>
                                    <td style={{ padding: '20px 24px', fontSize: '13px', fontWeight: 700, color: '#059669' }}>
                                        {job.salaryFrom && job.salaryTo ? `$${job.salaryFrom} - $${job.salaryTo}` : 'Negotiable'}
                                    </td>
                                    <td style={{ padding: '20px 24px', textAlign: 'right', fontSize: '12px', color: '#94a3b8' }}>
                                        {new Date(job.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div style={{ padding: '100px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '100px', height: '100px', backgroundColor: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                            <FileSearch size={44} color="#cbd5e1" />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: '0' }}>No job postings yet.</h3>
                        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px', maxWidth: '340px' }}>
                            The global job database is currently empty. Published jobs will appear here for oversight.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
