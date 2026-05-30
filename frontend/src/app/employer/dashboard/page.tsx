"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
    Briefcase,
    Users,
    Calendar,
    Activity,
    Plus,
    FileText,
    MoveRight,
    TrendingUp,
    Zap
} from "lucide-react";
import Link from "next/link";
import { jobService } from "@/services/job.service";
import { applicationService } from "@/services/application.service";
import { api as axiosApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { socketService } from "@/services/socket.service";

export default function EmployerDashboard() {
    const { user } = useAuthStore();
    const [stats, setStats] = useState({
        activeJobs: 0,
        totalApplicants: 0,
        interviews: 0,
        screenings: 0
    });
    const [pipelineData, setPipelineData] = useState<any[]>([]);
    const [recentActivities, setRecentActivities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [company, setCompany] = useState<any>(null);
    const [completion, setCompletion] = useState(0);

    const fetchDashboardData = useCallback(async () => {
        try {
            setIsLoading(true);
            
            // 1. Resolve Company ID from User
            const findCompanyId = (obj: any): string | null => {
                if (!obj) return null;
                if (obj.companyId) return obj.companyId;
                if (obj.company_id) return obj.company_id;
                if (obj.company && typeof obj.company === 'object' && obj.company.id) return obj.company.id;
                if (obj.employerProfile && typeof obj.employerProfile === 'object') return findCompanyId(obj.employerProfile);
                return null;
            };

            const companyId = findCompanyId(user);
            
            // 2. Fetch Data in Parallel
            const [jobs, apps] = await Promise.all([
                jobService.getMyJobs().catch(() => []),
                applicationService.getAll().catch(() => [])
            ]);

            // 3. Fetch Company Info if ID exists
            if (companyId) {
                try {
                    const companyData = await axiosApi.get(`/companies/${companyId}`);
                    if (companyData) {
                        setCompany(companyData);
                        setCompletion((companyData as any).completeness || 0);
                    }
                } catch (e) {
                    console.error("Failed to fetch company info", e);
                }
            }

            // 4. Calculate Stats
            const activeJobsCount = Array.isArray(jobs) ? jobs.filter((j: any) => j.status === 'ACTIVE').length : 0;
            const totalAppsCount = Array.isArray(apps) ? apps.length : 0;
            const screeningsCount = Array.isArray(apps) ? apps.filter((a: any) => (a.score || 0) > 0).length : 0;
            const interviewsCount = Array.isArray(apps) ? apps.filter((a: any) => a.status === 'INTERVIEWING').length : 0;

            setStats({
                activeJobs: activeJobsCount,
                totalApplicants: totalAppsCount,
                interviews: interviewsCount,
                screenings: screeningsCount
            });

            // 5. Calculate Pipeline Distribution
            const distribution = [
                { stage: 'Applied', count: apps.filter((a: any) => a.status === 'APPLIED').length, color: '#5C9AFF' },
                { stage: 'Interview', count: apps.filter((a: any) => a.status === 'INTERVIEWING').length, color: '#ca8a04' },
                { stage: 'Offer', count: apps.filter((a: any) => a.status === 'OFFER').length, color: '#059669' },
                { stage: 'Hired', count: apps.filter((a: any) => a.status === 'HIRED').length, color: '#7c3aed' }
            ];
            setPipelineData(distribution.filter(d => d.count > 0));

            // 6. Process Recent Activities
            const sortedApps = [...apps].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setRecentActivities(sortedApps.slice(0, 5));

        } catch (error) {
            console.error("Failed to load dashboard stats", error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchDashboardData();

        // Real-time update listener
        const handleNotification = (notif: any) => {
            console.log("EmployerDashboard: Received real-time notification", notif);
            // Refresh dashboard on any notification related to applications/jobs
            fetchDashboardData();
        };

        if (user?.id) {
            socketService.connect(user.id);
            socketService.onNewNotification(handleNotification);
        }

        return () => {
            socketService.offNewNotification(handleNotification);
        };
    }, [fetchDashboardData, user?.id]);

    const statCards = [
        { label: "Active Jobs", value: stats.activeJobs, icon: <Briefcase color="#5C9AFF" />, trend: "Real-time" },
        { label: "Total Applicants", value: stats.totalApplicants, icon: <Users color="#059669" />, trend: "Real-time" },
        { label: "Interviews", value: stats.interviews, icon: <Calendar color="#ca8a04" />, trend: "Scheduled" },
        { label: "AI Screenings", value: stats.screenings, icon: <Activity color="#7c3aed" />, trend: "Processed" }
    ];

    const maxCount = Math.max(...pipelineData.map(d => d.count), 1);

    return (
        <div style={{ padding: '0', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            
            {/* Onboarding Banner */}
            {completion < 100 && (
                <div style={{ 
                    marginBottom: '40px', padding: '24px 32px', borderRadius: '24px', 
                    background: 'linear-gradient(135deg, #5C9AFF 0%, #1e40af 100%)', 
                    color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    boxShadow: '0 20px 25px -5px rgba(37, 99, 235, 0.2)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <div style={{ height: '56px', width: '56px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Zap size={28} color="white" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Your profile is only {completion}% complete</h3>
                            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginTop: '4px', maxWidth: '500px' }}>
                                Please update your company description to help AI find more accurate candidates and build trust with talent!
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ width: '120px', height: '6px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '3px', marginBottom: '8px' }}>
                                <div style={{ width: `${completion}%`, height: '100%', backgroundColor: '#fbbf24', borderRadius: '3px' }} />
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 700 }}>Profile Strength: {completion}%</span>
                        </div>
                        <Link href="/employer/settings" style={{ textDecoration: 'none' }}>
                            <button style={{ padding: '12px 24px', backgroundColor: 'white', color: '#5C9AFF', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                Complete Now <MoveRight size={18} />
                            </button>
                        </Link>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Executive Dashboard</h1>
                    <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>Welcome back. Here is your current recruitment lifecycle at a glance.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Link href="/employer/jobs/campaigns/new">
                        <button style={{ padding: '12px 24px', backgroundColor: '#5C9AFF', color: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Create Campaign</button>
                    </Link>
                    <Link href="/employer/jobs/create">
                        <button style={{ padding: '12px 24px', backgroundColor: '#5C9AFF', color: 'white', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Plus size={18} /> Post New Job
                        </button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
                {statCards.map((stat, i) => (
                    <div key={i} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {stat.icon}
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>{stat.trend}</span>
                        </div>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', margin: 0 }}>{stat.label}</p>
                        <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>{stat.value}</h2>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px' }}>
                {/* Pipeline Distribution */}
                <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '32px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Hiring Pipeline Distribution</h3>
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Last 30 Days</span>
                    </div>
                    {pipelineData.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {pipelineData.map((d, i) => (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>
                                        <span>{d.stage}</span>
                                        <span>{d.count} candidates</span>
                                    </div>
                                    <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: `${(d.count / maxCount) * 100}%`, height: '100%', backgroundColor: d.color, borderRadius: '4px' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
                            <TrendingUp size={40} color="#cbd5e1" />
                            <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '16px', fontWeight: 600 }}>No application data to visualize yet.</p>
                            <p style={{ color: '#cbd5e1', fontSize: '12px' }}>Analytics will appear here after publishing jobs.</p>
                        </div>
                    )}
                </div>

                {/* AI Talent Match Widget */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ backgroundColor: '#0f172a', padding: '32px', borderRadius: '32px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                                <Zap size={18} color="#5C9AFF" fill="#5C9AFF" />
                                <span style={{ fontSize: '12px', fontWeight: 800, color: '#5C9AFF', letterSpacing: '0.1em' }}>AI TALENT MATCH</span>
                            </div>
                            <h4 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 12px' }}>
                                {stats.totalApplicants > 0 ? "Potential Matches Found" : "Waiting for Candidates"}
                            </h4>
                            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '24px' }}>
                                {stats.totalApplicants > 0
                                    ? `Our AI has identified high-quality candidates matching your current job requirements.`
                                    : "As soon as candidates apply, our AI will automatically rank them based on your JD requirements."}
                            </p>
                            <Link href="/employer/jobs" style={{ textDecoration: 'none' }}>
                                <button style={{ width: '100%', padding: '14px', backgroundColor: '#5C9AFF', color: 'white', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>View Matches</button>
                            </Link>
                        </div>
                    </div>

                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '32px', border: '1px solid #f1f5f9' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 24px' }}>Recent Activity</h4>
                        <div style={{ borderLeft: '2px solid #f1f5f9', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {recentActivities.length > 0 ? recentActivities.map((act, i) => (
                                <div key={i} style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#5C9AFF', left: '-31px', top: '4px', border: '2px solid white' }} />
                                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
                                        {act.candidate?.firstName} {act.candidate?.lastName} applied to {act.job?.title} {act.job?.campaigns && act.job.campaigns.length > 0 ? `(${act.job.campaigns[0].name})` : ''}
                                    </p>
                                    <p style={{ fontSize: '11px', color: '#94a3b8' }}>
                                        {new Date(act.createdAt).toLocaleDateString()} • Score: {Math.round(act.score || 0)}%
                                    </p>
                                </div>
                            )) : (
                                <p style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>No recent activity to show.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

