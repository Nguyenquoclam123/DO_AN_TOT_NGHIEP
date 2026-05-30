"use client";

import React, { useEffect, useState } from "react";
import {
    Search,
    Filter,
    Users,
    UserPlus,
    BarChart3,
    ChevronDown,
    UserX,
    Mail,
    Zap,
    ChevronRight,
    MapPin,
    BrainCircuit
} from "lucide-react";
import Link from "next/link";
import { applicationService, Application } from "@/services/application.service";
import CandidateInsightDrawer from "@/components/candidate/candidate-insight-drawer";

export default function EmployerCandidatesPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("All Candidates");
    const [searchQuery, setSearchQuery] = useState("");
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState<any>(null);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setIsLoading(true);
            const data = await applicationService.getAll();
            setApplications(data);
        } catch (error) {
            console.error("Failed to fetch applications", error);
        } finally {
            setIsLoading(false);
        }
    };

    const tabs = [
        { name: "All Candidates", count: applications.length, status: 'ALL' },
        { name: "Newly Applied", count: applications.filter(a => a.status === 'APPLIED').length, status: 'APPLIED' },
        { name: "Invited", count: applications.filter(a => a.status === 'INVITED').length, status: 'INVITED' },
        { name: "Interviewing", count: applications.filter(a => a.status === 'INTERVIEWING').length, status: 'INTERVIEWING' },
        { name: "Offer & Hired", count: applications.filter(a => ['OFFER', 'HIRED'].includes(a.status)).length, status: 'HIRED' },
        { name: "Rejected", count: applications.filter(a => a.status === 'REJECTED').length, status: 'REJECTED' },
        { name: "Cancelled", count: applications.filter(a => a.status === 'CANCELLED').length, status: 'CANCELLED' }
    ];

    const filteredApps = applications.filter(app => {
        const matchesTab = activeTab === "All Candidates" ||
            (activeTab === "Newly Applied" && app.status === "APPLIED") ||
            (activeTab === "Invited" && app.status === "INVITED") ||
            (activeTab === "Interviewing" && app.status === "INTERVIEWING") ||
            (activeTab === "Offer & Hired" && ["OFFER", "HIRED"].includes(app.status)) ||
            (activeTab === "Rejected" && app.status === "REJECTED") ||
            (activeTab === "Cancelled" && app.status === "CANCELLED");

        const fullName = `${app.candidate?.firstName} ${app.candidate?.lastName}`.toLowerCase();
        const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
            app.job?.title?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesTab && matchesSearch;
    });

    return (
        <div style={{ padding: '40px', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            <CandidateInsightDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                application={selectedApp}
                job={selectedApp?.job}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Talent Pipeline</h1>
                    <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Track and manage your candidate applications across all active jobs.</p>
                </div>

            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                {/* Tabs */}
                <div style={{ padding: '0 32px', borderBottom: '1px solid #f8fafc', display: 'flex', gap: '32px', overflowX: 'auto' }}>
                    {tabs.map((tab) => (
                        <div
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            style={{
                                padding: '24px 0',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                color: activeTab === tab.name ? '#0f172a' : '#94a3b8',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <span style={{ fontSize: '14px', fontWeight: 700 }}>{tab.name}</span>
                            <span style={{
                                fontSize: '11px',
                                fontWeight: 800,
                                color: activeTab === tab.name ? '#5C9AFF' : '#94a3b8',
                                backgroundColor: activeTab === tab.name ? '#eff6ff' : '#f8fafc',
                                padding: '2px 8px',
                                borderRadius: '6px'
                            }}>{tab.count}</span>
                            {activeTab === tab.name && (
                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: '#5C9AFF', borderRadius: '3px 3px 0 0' }} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f8fafc', backgroundColor: '#fff' }}>
                    <div style={{ position: 'relative', width: '360px' }}>
                        <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                        <input
                            type="text"
                            placeholder="Search by candidate name or job title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '12px 16px 12px 42px', backgroundColor: '#f8fafc', border: '1px solid transparent', borderRadius: '12px', fontSize: '14px', outline: 'none', transition: 'all 0.2s' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                            <Filter size={16} /> Filters
                        </button>
                    </div>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div style={{ padding: '100px 0', textAlign: 'center', color: '#94a3b8' }}>Loading candidates...</div>
                ) : filteredApps.length > 0 ? (
                    <div style={{ width: '100%', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                                    <th style={{ padding: '16px 32px', textAlign: 'left', fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Candidate</th>
                                    <th style={{ padding: '16px 32px', textAlign: 'left', fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Applied For</th>
                                    <th style={{ padding: '16px 32px', textAlign: 'center', fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>AI Match</th>
                                    <th style={{ padding: '16px 32px', textAlign: 'center', fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ padding: '16px 32px', textAlign: 'right' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredApps.map((app) => (
                                    <tr
                                        key={app.id}
                                        onClick={() => { setSelectedApp(app); setIsDrawerOpen(true); }}
                                        style={{ borderBottom: '1px solid #f8fafc', cursor: 'pointer', transition: 'all 0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fbfdff'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <td style={{ padding: '20px 32px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 800, color: '#64748b' }}>
                                                    {app.candidate?.firstName?.[0]}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{app.candidate?.firstName} {app.candidate?.lastName}</div>
                                                    <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                                        <Mail size={12} /> {app.candidate?.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px 32px' }}>
                                            <Link 
                                                href={`/employer/jobs/${app.job?.id}`}
                                                onClick={(e) => e.stopPropagation()}
                                                style={{ textDecoration: 'none' }}
                                            >
                                                <div style={{ 
                                                    fontSize: '14px', 
                                                    fontWeight: 700, 
                                                    color: '#1e293b',
                                                    transition: 'color 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.color = '#5C9AFF'}
                                                onMouseLeave={(e) => e.currentTarget.style.color = '#1e293b'}
                                                >
                                                    {app.job?.title}
                                                </div>
                                            </Link>
                                            <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                                <MapPin size={12} /> {app.job?.workLocation || 'Remote'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px 32px', textAlign: 'center' }}>
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: '#eff6ff', color: '#5C9AFF', borderRadius: '100px', fontWeight: 800, fontSize: '13px' }}>
                                                <Zap size={14} fill="#5C9AFF" /> {Math.round(app.score || 0)}%
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px 32px', textAlign: 'center' }}>
                                            <span style={{
                                                fontSize: '11px',
                                                fontWeight: 900,
                                                padding: '6px 12px',
                                                borderRadius: '8px',
                                                display: 'inline-block',
                                                backgroundColor: 
                                                    app.status === 'APPLIED' ? '#eff6ff' : 
                                                    app.status === 'INVITED' ? '#f5f3ff' :
                                                    app.status === 'INTERVIEWING' ? '#fff7ed' : 
                                                    app.status === 'OFFER' ? '#f0fdf4' :
                                                    app.status === 'HIRED' ? '#f0fdfa' :
                                                    app.status === 'REJECTED' ? '#f1f5f9' :
                                                    app.status === 'CANCELLED' ? '#e2e8f0' : '#f1f5f9',
                                                color: 
                                                    app.status === 'APPLIED' ? '#5C9AFF' : 
                                                    app.status === 'INVITED' ? '#7c3aed' :
                                                    app.status === 'INTERVIEWING' ? '#ea580c' : 
                                                    app.status === 'OFFER' ? '#22c55e' :
                                                    app.status === 'HIRED' ? '#0d9488' :
                                                    app.status === 'REJECTED' ? '#94a3b8' :
                                                    app.status === 'CANCELLED' ? '#475569' : '#64748b',
                                                textTransform: 'uppercase'
                                            }}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '20px 32px', textAlign: 'right' }}>
                                            <ChevronRight size={20} color="#cbd5e1" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ padding: '100px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '100px', height: '100px', backgroundColor: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                            <UserX size={44} color="#cbd5e1" />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: '0' }}>No candidates found.</h3>
                        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px', maxWidth: '340px' }}>
                            No candidates found matching your current filter in the talent pipeline.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
