"use client";

import React, { useEffect, useState } from "react";
import {
    Users,
    Building2,
    CheckCircle2,
    XCircle,
    MoreVertical,
    Filter,
    ShieldCheck,
    Mail,
    Globe,
    Search,
    ChevronDown,
    Clock
} from "lucide-react";
import { api } from "@/lib/api";

export default function EmployerAuditPage() {
    const [companies, setCompanies] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const data = await api.get<any[]>('/companies');
                setCompanies(data);
            } catch (err) {
                console.error("Failed to fetch companies", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCompanies();
    }, []);

    const stats = {
        total: companies.length,
        verified: companies.filter(c => c.isVerified).length,
        pending: companies.filter(c => !c.isVerified).length
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Employer Audit</h1>
                    <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>Manage organizational access and verify business credentials.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ padding: '12px 24px', backgroundColor: 'white', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Filter size={18} /> Filter List
                    </button>
                    <button style={{ padding: '12px 24px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                        Export History
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '48px', height: '48px', backgroundColor: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={24} color="#5C9AFF" />
                    </div>
                    <div>
                        <p style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', margin: 0 }}>NEW REQUESTS</p>
                        <h4 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>{stats.pending}</h4>
                    </div>
                </div>
                <div style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '24px', color: 'white', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '48px', height: '48px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShieldCheck size={24} color="#22c55e" />
                    </div>
                    <div>
                        <p style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', margin: 0 }}>VERIFIED PARTNERS</p>
                        <h4 style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0' }}>{stats.verified}</h4>
                    </div>
                </div>
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '48px', height: '48px', backgroundColor: '#fef2f2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <XCircle size={24} color="#ef4444" />
                    </div>
                    <div>
                        <p style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', margin: 0 }}>TOTAL RECORDS</p>
                        <h4 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>{stats.total}</h4>
                    </div>
                </div>
            </div>

            {/* Organizations Table */}
            <div style={{ backgroundColor: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                <div style={{ padding: '24px 32px', borderBottom: '1px solid #f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fafafa' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Enterprise Members</h3>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input type="text" placeholder="Search by name or email..." style={{ padding: '8px 12px 8px 36px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', outline: 'none', width: '280px' }} />
                    </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '16px 32px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Organization</th>
                            <th style={{ textAlign: 'left', padding: '16px 32px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Scope</th>
                            <th style={{ textAlign: 'left', padding: '16px 32px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ textAlign: 'left', padding: '16px 32px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Audit Date</th>
                            <th style={{ textAlign: 'right', padding: '16px 32px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {companies.map((company, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #f8fafc' }}>
                                <td style={{ padding: '20px 32px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '40px', height: '40px', backgroundColor: '#f1f5f9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                            {company.logoUrl ? <img src={company.logoUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Building2 size={20} color="#64748b" />}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b' }}>{company.name}</div>
                                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Tax Code: {company.taxCode || '---'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '20px 32px' }}>
                                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>{company.industryId || 'General'}</div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Scale: {company.scale || 'N/A'}</div>
                                </td>
                                <td style={{ padding: '20px 32px' }}>
                                    <span style={{
                                        padding: '4px 12px', borderRadius: '999px', fontSize: '10px', fontWeight: 900,
                                        backgroundColor: company.isVerified ? '#f0fdf4' : '#fff7ed',
                                        color: company.isVerified ? '#166534' : '#9a3412'
                                    }}>
                                        {company.isVerified ? 'VERIFIED' : 'PENDING'}
                                    </span>
                                </td>
                                <td style={{ padding: '20px 32px', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{new Date(company.createdAt).toLocaleDateString()}</td>
                                <td style={{ padding: '20px 32px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                        {!company.isVerified && (
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        await api.patch(`/companies/${company.id}`, { isVerified: true });
                                                        alert('Company verified successfully!');
                                                        window.location.reload();
                                                    } catch (err) {
                                                        alert('Failed to verify company');
                                                    }
                                                }}
                                                style={{ padding: '6px 12px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
                                            >
                                                APPROVE
                                            </button>
                                        )}
                                        <button style={{ padding: '6px', backgroundColor: 'transparent', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#64748b', cursor: 'pointer' }}><Mail size={14} /></button>
                                        <button style={{ padding: '6px', backgroundColor: 'transparent', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#64748b', cursor: 'pointer' }}><MoreVertical size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{ padding: '24px 32px', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Page 1 of 12</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{ padding: '8px 16px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', fontWeight: 700, color: '#475569', cursor: 'pointer' }}>Previous</button>
                        <button style={{ padding: '8px 16px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', fontWeight: 700, color: '#475569', cursor: 'pointer' }}>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
