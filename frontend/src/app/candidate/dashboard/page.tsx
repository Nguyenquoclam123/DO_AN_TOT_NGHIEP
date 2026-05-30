"use client";

import React, { useEffect, useState } from "react";
import {
    FileText,
    Send,
    CheckCircle2,
    Clock,
    Zap,
    Plus,
    Search,
    ChevronRight,
    Briefcase
} from "lucide-react";
import Link from "next/link";
import { cvService } from "@/services/cv.service";
import { applicationService } from "@/services/application.service";
import { useAuthStore } from "@/store/authStore";
import { socketService } from "@/services/socket.service";

export default function CandidateDashboard() {
    const [stats, setStats] = useState({
        totalCvs: 0,
        applications: 0,
        interviews: 0
    });
    const [recentApplications, setRecentApplications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuthStore();

    const fetchCandidateStats = async () => {
        try {
            const [cvs, apps] = await Promise.all([
                cvService.getMyCVs().catch(() => []),
                applicationService.getMyApplications().catch(() => [])
            ]);

            const appList = Array.isArray(apps) ? apps : [];
            
            setStats({
                totalCvs: Array.isArray(cvs) ? cvs.length : 0,
                applications: appList.length,
                interviews: appList.filter((a: any) => 
                    ['INVITED', 'INTERVIEWING', 'OFFER'].includes(a.status)
                ).length
            });
            
            setRecentApplications(appList.slice(0, 5)); // Get top 5
        } catch (error) {
            console.error("Candidate stats failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCandidateStats();
        
        const handleUpdate = () => {
            console.log("CandidateDashboard: Real-time update detected. Refreshing stats...");
            fetchCandidateStats();
        };

        if (user?.id) {
            socketService.connect(user.id);
            socketService.onNewNotification(handleUpdate);
            socketService.onApplicationUpdated(handleUpdate);
        }

        return () => {
            socketService.offNewNotification(handleUpdate);
            socketService.offApplicationUpdated(handleUpdate);
        };
    }, [user?.id]);

    const userStats = [
        { label: "My CVs", value: stats.totalCvs, icon: <FileText size={24} color="#5C9AFF" />, bgColor: "#eff6ff" },
        { label: "Applications", value: stats.applications, icon: <Send size={24} color="#7c3aed" />, bgColor: "#f5f3ff" },
        { label: "Interviews", value: stats.interviews, icon: <Clock size={24} color="#ca8a04" />, bgColor: "#fffbeb" },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '48px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>My Journey</h1>
                    <p style={{ fontSize: '15px', color: '#64748b', marginTop: '4px', fontWeight: 500 }}>Monitor your AI-enhanced career progress.</p>
                </div>
                <Link href="/candidate/cv">
                    <button style={{ padding: '12px 24px', backgroundColor: '#5C9AFF', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={18} /> Create CV
                    </button>
                </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                {userStats.map((stat, i) => (
                    <div key={i} style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '56px', height: '56px', backgroundColor: stat.bgColor, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {stat.icon}
                        </div>
                        <div>
                            <p style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', margin: 0 }}>{stat.label}</p>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '2px 0' }}>{stat.value}</h2>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '32px', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Recent Applications</h3>
                            <Link href="/candidate/my-applications" style={{ fontSize: '14px', color: '#5C9AFF', fontWeight: 700, textDecoration: 'none' }}>View All</Link>
                        </div>
                        
                        {recentApplications.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {recentApplications.map((app: any) => (
                                    <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderRadius: '20px', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                            <div style={{ width: '48px', height: '48px', backgroundColor: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                                                <Briefcase size={20} color="#5C9AFF" />
                                            </div>
                                            <div>
                                                <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{app.job?.title}</h4>
                                                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0' }}>{app.job?.company?.name} • Applied {new Date(app.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div style={{ 
                                            padding: '6px 12px', 
                                            borderRadius: '100px', 
                                            fontSize: '12px', 
                                            fontWeight: 800,
                                            backgroundColor: app.status === 'REJECTED' ? '#fef2f2' : app.status === 'HIRED' || app.status === 'OFFER' ? '#f0fdf4' : '#eff6ff',
                                            color: app.status === 'REJECTED' ? '#ef4444' : app.status === 'HIRED' || app.status === 'OFFER' ? '#16a34a' : '#5C9AFF'
                                        }}>
                                            {app.status}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: '60px 0', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '20px', border: '2px dashed #e2e8f0' }}>
                                <Search size={40} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
                                <p style={{ color: '#94a3b8', fontWeight: 600, margin: 0 }}>You haven't applied to any jobs yet.</p>
                                <Link href="/candidate/jobs" style={{ color: '#5C9AFF', fontSize: '14px', fontWeight: 700, textDecoration: 'none', marginTop: '12px', display: 'inline-block' }}>Explore Opportunities</Link>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div style={{ backgroundColor: '#0f172a', padding: '32px', borderRadius: '32px', color: 'white' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                            <Zap size={18} color="#5C9AFF" fill="#5C9AFF" />
                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#5C9AFF', letterSpacing: '0.1em' }}>AI CAREER COACH</span>
                        </div>
                        <h4 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 12px' }}>Optimize your CV</h4>
                        <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '24px' }}>
                            Upload your CV to let our AI analyze and suggest improvements based on market trends and specific job descriptions.
                        </p>
                        <Link href="/candidate/cv-optimizer">
                            <button style={{ width: '100%', padding: '14px', backgroundColor: '#5C9AFF', color: 'white', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Try AI Optimizer</button>
                        </Link>
                    </div>

                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '32px', border: '1px solid #f1f5f9' }}>
                        <h4 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px' }}>Quick Actions</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <Link href="/candidate/jobs" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '16px', backgroundColor: '#f8fafc', textDecoration: 'none', color: '#1e293b' }}>
                                <span style={{ fontWeight: 700, fontSize: '14px' }}>Find New Jobs</span>
                                <ChevronRight size={18} />
                            </Link>
                            <Link href="/candidate/cv/builder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '16px', backgroundColor: '#f8fafc', textDecoration: 'none', color: '#1e293b' }}>
                                <span style={{ fontWeight: 700, fontSize: '14px' }}>Build New CV</span>
                                <ChevronRight size={18} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
