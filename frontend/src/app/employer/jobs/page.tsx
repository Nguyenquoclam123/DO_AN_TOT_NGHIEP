"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
    Search,
    Plus,
    Briefcase,
    MapPin,
    Database,
    Loader2,
    Users,
    Clock,
    DollarSign,
    Target,
    Activity,
    ChevronRight,
    Filter,
    BarChart3,
    TrendingUp
} from "lucide-react";
import { jobService } from "@/services/job.service";

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <div style={{ 
        padding: '24px', 
        backgroundColor: 'white', 
        borderRadius: '24px', 
        border: '1px solid #f1f5f9',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01)',
        transition: 'transform 0.2s'
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '14px', 
                backgroundColor: `${color}10`, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
            }}>
                <Icon size={24} color={color} />
            </div>
            {trend && (
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px', 
                    padding: '4px 8px', 
                    backgroundColor: '#ecfdf5', 
                    color: '#059669', 
                    borderRadius: '8px', 
                    fontSize: '12px', 
                    fontWeight: 700 
                }}>
                    <TrendingUp size={12} /> {trend}
                </div>
            )}
        </div>
        <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>{title}</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>{value}</div>
        </div>
    </div>
);

export default function EmployerJobsPage() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("All Jobs");

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            setIsLoading(true);
            const data = await jobService.getMyJobs();
            setJobs(data || []);
        } catch (error) {
            console.error("Failed to fetch jobs:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const stats = {
        total: jobs.length,
        active: jobs.filter(j => j.status === 'OPEN').length,
        applications: jobs.reduce((acc, curr) => acc + (curr.applicationsCount || 0), 0)
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = activeTab === "All Jobs" || 
                          (activeTab === "Active" && job.status === "OPEN") ||
                          (activeTab === "Closed" && job.status === "CLOSED");
        return matchesSearch && matchesTab;
    });

    const displayJobs = filteredJobs.flatMap(job => {
        if (!job.campaigns || job.campaigns.length === 0) {
            return [{ ...job, displayCampaign: null }];
        }
        return job.campaigns.map((c: any) => ({
            ...job,
            displayCampaign: c,
            displayId: `${job.id}-${c.id}`
        }));
    });

    return (
        <div style={{ padding: '40px', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>
                        Manage Job Postings
                    </h1>
                    <p style={{ fontSize: '15px', color: '#64748b', marginTop: '8px', fontWeight: 500 }}>
                        Track and optimize recruitment performance across all channels.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Link href="/employer/jobs/create" style={{ textDecoration: 'none' }}>
                        <button style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '10px', 
                            padding: '14px 28px', 
                            backgroundColor: '#5C9AFF', 
                            color: 'white', 
                            borderRadius: '16px', 
                            border: 'none', 
                            fontSize: '14px', 
                            fontWeight: 700, 
                            cursor: 'pointer', 
                            boxShadow: '0 10px 15px -3px rgba(92, 154, 255, 0.3)',
                            transition: 'all 0.2s',
                            transform: 'translateY(0)'
                        }}>
                            <Plus size={20} /> Create New Job
                        </button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'flex', gap: '24px', marginBottom: '40px' }}>
                <StatCard title="Total Jobs" value={stats.total} icon={Briefcase} color="#5C9AFF" trend="+12%" />
                <StatCard title="Active" value={stats.active} icon={Activity} color="#10B981" />
                <StatCard title="Total Applicants" value={stats.applications} icon={Users} color="#F59E0B" trend="+24%" />
                <StatCard title="Success Rate" value="78%" icon={Target} color="#8B5CF6" />
            </div>

            {/* Content Area */}
            <div style={{ backgroundColor: 'white', borderRadius: '32px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                {/* Tabs & Search */}
                <div style={{ padding: '32px', borderBottom: '1px solid #f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '32px' }}>
                            {["All Jobs", "Open", "Closed"].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    style={{
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        padding: '0 0 16px 0',
                                        fontSize: '15px',
                                        fontWeight: activeTab === tab ? 800 : 600,
                                        color: activeTab === tab ? '#0f172a' : '#94a3b8',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {tab}
                                    {activeTab === tab && (
                                        <div style={{ 
                                            position: 'absolute', 
                                            bottom: 0, 
                                            left: 0, 
                                            right: 0, 
                                            height: '4px', 
                                            backgroundColor: '#5C9AFF', 
                                            borderRadius: '4px 4px 0 0' 
                                        }} />
                                    )}
                                </button>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            {/* Search Hidden as per request */}
                            <button style={{ 
                                padding: '14px', 
                                borderRadius: '16px', 
                                border: '1px solid #e2e8f0', 
                                backgroundColor: 'white', 
                                color: '#64748b', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Filter size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div style={{ padding: '120px 0', textAlign: 'center' }}>
                        <Loader2 style={{ margin: '0 auto', animation: 'spin 1s linear infinite' }} color="#5C9AFF" size={40} />
                        <p style={{ marginTop: '20px', color: '#94a3b8', fontSize: '15px', fontWeight: 600 }}>Synchronizing data...</p>
                    </div>
                ) : displayJobs.length > 0 ? (
                    <div style={{ padding: '0' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #f8fafc', backgroundColor: '#fbfdff' }}>
                                    <th style={{ textAlign: 'left', padding: '16px 32px', fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Job Information</th>
                                    <th style={{ textAlign: 'left', padding: '16px 32px', fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Salary Range</th>
                                    <th style={{ textAlign: 'center', padding: '16px 32px', fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Status</th>
                                    <th style={{ textAlign: 'center', padding: '16px 32px', fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Applicants</th>
                                    <th style={{ textAlign: 'right', padding: '16px 32px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayJobs.map((displayJob) => (
                                    <tr 
                                        key={displayJob.displayId || displayJob.id} 
                                        style={{ 
                                            borderBottom: '1px solid #f8fafc', 
                                            transition: 'all 0.2s',
                                            cursor: 'pointer',
                                            backgroundColor: displayJob.pendingApplicationsCount > 0 ? '#F0F9FF' : 'transparent'
                                        }}
                                    >
                                        <td style={{ padding: '28px 32px' }}>
                                            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                                                <div style={{ 
                                                    width: '60px', 
                                                    height: '60px', 
                                                    borderRadius: '18px', 
                                                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center',
                                                    color: '#5C9AFF',
                                                    flexShrink: 0
                                                }}>
                                                    <Briefcase size={28} />
                                                </div>
                                                <div>
                                                    <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
                                                        {displayJob.title}
                                                    </h3>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: '#64748b', fontSize: '13px', fontWeight: 500 }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={15} color="#94a3b8" /> {displayJob.workLocation || displayJob.location || 'Remote'}</span>
                                                        <span style={{ color: '#e2e8f0' }}>•</span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={15} color="#94a3b8" /> {displayJob.type}</span>
                                                    </div>
                                                    {displayJob.displayCampaign && (
                                                        <div style={{ marginTop: '10px', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: '#f1f5f9', borderRadius: '10px', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                                                            <BarChart3 size={13} /> {displayJob.displayCampaign.name}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '28px 32px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a', fontWeight: 800, fontSize: '15px' }}>
                                                <DollarSign size={18} color="#10B981" />
                                                {displayJob.minSalary && displayJob.maxSalary 
                                                    ? `${displayJob.minSalary.toLocaleString()} - ${displayJob.maxSalary.toLocaleString()} VNĐ` 
                                                    : 'Negotiable'}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', fontWeight: 600 }}>Monthly Salary</div>
                                        </td>
                                        <td style={{ padding: '28px 32px', textAlign: 'center' }}>
                                            <span style={{ 
                                                padding: '10px 20px', 
                                                borderRadius: '12px', 
                                                fontSize: '11px', 
                                                fontWeight: 900,
                                                letterSpacing: '0.05em',
                                                backgroundColor: (displayJob.status === 'OPEN' || displayJob.status === 'ACTIVE') ? '#F0FDF4' : displayJob.status === 'CLOSED' ? '#FEF2F2' : '#F8FAFC',
                                                color: (displayJob.status === 'OPEN' || displayJob.status === 'ACTIVE') ? '#16A34A' : displayJob.status === 'CLOSED' ? '#EF4444' : '#94A3B8',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                border: `1px solid ${(displayJob.status === 'OPEN' || displayJob.status === 'ACTIVE') ? '#DCFCE7' : displayJob.status === 'CLOSED' ? '#FEE2E2' : '#E2E8F0'}`
                                            }}>
                                                <div style={{ 
                                                    width: '8px', 
                                                    height: '8px', 
                                                    borderRadius: '50%', 
                                                    backgroundColor: (displayJob.status === 'OPEN' || displayJob.status === 'ACTIVE') ? '#22C55E' : displayJob.status === 'CLOSED' ? '#EF4444' : '#94A3B8'
                                                }} />
                                                {(displayJob.status === 'OPEN' || displayJob.status === 'ACTIVE') ? 'OPEN' : displayJob.status === 'CLOSED' ? 'CLOSED' : displayJob.status || 'DRAFT'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '28px 32px', textAlign: 'center' }}>
                                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                                <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>{displayJob.applicationsCount || 0}</div>
                                                <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Applicants</div>
                                                
                                                {displayJob.pendingApplicationsCount > 0 && (
                                                    <div style={{ 
                                                        position: 'absolute', 
                                                        top: '-10px', 
                                                        right: '-35px', 
                                                        backgroundColor: '#F59E0B', 
                                                        color: 'white', 
                                                        fontSize: '10px', 
                                                        fontWeight: 900, 
                                                        padding: '4px 10px', 
                                                        borderRadius: '8px',
                                                        boxShadow: '0 4px 6px rgba(245, 158, 11, 0.2)',
                                                        whiteSpace: 'nowrap',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        animation: 'pulse 2s infinite'
                                                    }}>
                                                        <Activity size={10} />
                                                        {displayJob.pendingApplicationsCount} NEED ACTION
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: '28px 32px', textAlign: 'right' }}>
                                            <Link href={`/employer/jobs/${displayJob.id}`}>
                                                <button style={{ 
                                                    width: '44px', 
                                                    height: '44px', 
                                                    borderRadius: '14px', 
                                                    border: '1px solid #e2e8f0', 
                                                    backgroundColor: 'white', 
                                                    color: '#64748b', 
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition: 'all 0.2s'
                                                }}>
                                                    <ChevronRight size={22} />
                                                </button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ padding: '140px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ 
                            width: '160px', 
                            height: '160px', 
                            backgroundColor: '#f8fafc', 
                            borderRadius: '60px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            marginBottom: '40px',
                            transform: 'rotate(-10deg)'
                        }}>
                            <Database size={72} color="#cbd5e1" />
                        </div>
                        <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', margin: '0 0 16px', letterSpacing: '-0.02em' }}>
                            Empower Your Growth
                        </h3>
                        <p style={{ fontSize: '17px', color: '#64748b', maxWidth: '440px', lineHeight: 1.6, margin: '0 0 48px', fontWeight: 500 }}>
                            Start building your dream team by posting your first job opening. Connect with top talent worldwide.
                        </p>
                        <Link href="/employer/jobs/create">
                            <button style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '14px', 
                                padding: '18px 40px', 
                                backgroundColor: '#5C9AFF', 
                                color: 'white', 
                                borderRadius: '20px', 
                                border: 'none', 
                                fontSize: '16px', 
                                fontWeight: 800, 
                                cursor: 'pointer',
                                boxShadow: '0 15px 30px -5px rgba(92, 154, 255, 0.4)'
                            }}>
                                <Plus size={24} /> Get Started Now
                            </button>
                        </Link>
                    </div>
                )}
            </div>

            <style jsx global>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.03); opacity: 0.9; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
