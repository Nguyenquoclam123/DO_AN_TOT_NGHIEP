"use client";

import React, { useEffect, useState } from "react";
import {
    Search,
    Building2,
    Plus,
    Filter,
    LayoutGrid,
    SearchX,
    ShieldAlert,
    CheckCircle2,
    Clock
} from "lucide-react";
import { api } from "@/lib/api";

export default function AdminCompaniesPage() {
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

    const stats = [
        { label: "TOTAL COMPANIES", value: companies.length.toString(), trend: "Real-time updates", trendColor: "#5C9AFF", bg: "#eff6ff", icon: <Building2 size={20} color="#5C9AFF" /> },
        { label: "VERIFIED", value: companies.filter(c => c.isVerified).length.toString(), trend: "Business standard", trendColor: "#10b981", bg: "#f0fdf4", icon: <CheckCircle2 size={20} color="#10b981" /> },
        { label: "PENDING", value: companies.filter(c => !c.isVerified).length.toString(), trend: "Needs review", trendColor: "#ca8a04", bg: "#fefce8", icon: <Clock size={20} color="#ca8a04" /> },
    ];

    if (isLoading) {
        return <div style={{ padding: '40px' }}>Loading system data...</div>;
    }

    return (
        <div style={{ padding: '40px', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Company Management</h1>
                    <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>Oversee registered partners and platform activity.</p>
                </div>
                <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#0f172a', color: 'white', borderRadius: '10px', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                    <Plus size={18} /> Register New Company
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
                {stats.map((stat, i) => (
                    <div key={i} style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>{stat.label}</div>
                        <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: '12px 0' }}>{stat.value}</div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: stat.trendColor, backgroundColor: stat.bg, padding: '4px 12px', borderRadius: '20px', width: 'fit-content' }}>{stat.trend}</div>
                    </div>
                ))}
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ position: 'relative', maxWidth: '400px', flex: 1 }}>
                        <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                        <input type="text" placeholder="Search companies..." style={{ width: '100%', padding: '12px 16px 12px 48px', backgroundColor: '#f8fafc', border: 'none', borderRadius: '12px', fontSize: '14px', outline: 'none' }} />
                    </div>
                </div>

                {companies.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
                                    <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>COMPANY</th>
                                    <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>INDUSTRY/SCALE</th>
                                    <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>TAX CODE</th>
                                    <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>STATUS</th>
                                    <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {companies.map(company => (
                                    <tr key={company.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '20px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
                                                    {company.logoUrl ? <img src={company.logoUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Building2 size={24} style={{ margin: '8px', color: '#94a3b8' }} />}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>{company.name}</div>
                                                    <div style={{ fontSize: '12px', color: '#64748b' }}>{company.website || 'No website'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>{company.industryId || 'General'}</div>
                                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Scale: {company.scale || 'N/A'}</div>
                                        </td>
                                        <td style={{ padding: '20px 24px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>{company.taxCode || '---'}</td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <span style={{
                                                padding: '4px 12px', borderRadius: '999px', fontSize: '10px', fontWeight: 900,
                                                backgroundColor: company.isVerified ? '#f0fdf4' : '#fff7ed',
                                                color: company.isVerified ? '#166534' : '#9a3412'
                                            }}>
                                                {company.isVerified ? 'VERIFIED' : 'PENDING'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                            <button style={{ padding: '8px 16px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, color: '#475569', cursor: 'pointer' }}>Manage</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ padding: '100px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '100px', height: '100px', backgroundColor: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                            <SearchX size={44} color="#cbd5e1" />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: '0' }}>No companies registered.</h3>
                        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px', maxWidth: '340px' }}>
                            Platform partner list is currently empty. Registered companies will appear here for verification and management.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
