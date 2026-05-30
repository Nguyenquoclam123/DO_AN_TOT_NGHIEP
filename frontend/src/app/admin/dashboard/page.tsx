"use client";

import React, { useEffect, useState } from "react";
import {
    Users,
    Building2,
    Briefcase,
    TrendingUp,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Cpu
} from "lucide-react";
import { api } from "@/lib/api";

export default function AdminDashboardPage() {
    const [counts, setCounts] = useState({
        users: 0,
        companies: 0,
        jobs: 0,
        screeningRate: 0
    });

    useEffect(() => {
        const fetchGlobalStats = async () => {
            try {
                const data = await api.get<any>('/admin/dashboard-stats');

                setCounts({
                    users: data.totalCandidates || 0,
                    companies: data.totalCompanies || 0,
                    jobs: data.totalJobs || 0,
                    screeningRate: data.aiSuccessRate ? parseInt(data.aiSuccessRate) : 0
                });
            } catch (error) {
                console.error("Admin stats failed", error);
            }
        };
        fetchGlobalStats();
    }, []);

    const mainStats = [
        { label: "Total Users", value: counts.users, trend: "Real-time", isUp: true, icon: <Users size={20} color="#5C9AFF" /> },
        { label: "Partner Companies", value: counts.companies, trend: "Real-time", isUp: true, icon: <Building2 size={20} color="#059669" /> },
        { label: "Active Jobs", value: counts.jobs, trend: "Real-time", isUp: true, icon: <Briefcase size={20} color="#ca8a04" /> },
        { label: "AI Screening Rate", value: `${counts.screeningRate}%`, trend: "Real-time", isUp: false, icon: <Activity size={20} color="#7c3aed" /> },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: 0 }}>System Health Overview</h1>
                    <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>Global monitoring of My Job recruitment ecosystem and operational efficiency.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                {mainStats.map((stat, i) => (
                    <div key={i} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{stat.icon}</div>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>{stat.trend}</div>
                        </div>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', margin: 0 }}>{stat.label}</p>
                        <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>{stat.value}</h2>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px' }}>
                <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '32px', border: '1px solid #f1f5f9' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '32px' }}>Recruitment Trends</h3>
                    <div style={{ height: '340px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '2px dashed #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
                        <TrendingUp size={48} color="#cbd5e1" />
                        <p style={{ color: '#94a3b8', fontWeight: 600 }}>No system data to visualize yet.</p>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div style={{ backgroundColor: '#0f172a', padding: '32px', borderRadius: '32px', color: 'white' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Cpu size={20} color="#5C9AFF" /> AI Service Node: Stable
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '13px', color: '#94a3b8' }}>Gemini 1.5 Pro</span>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: '#22c55e' }}>ONLINE</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
