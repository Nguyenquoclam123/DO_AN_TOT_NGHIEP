"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Zap,
    CheckCircle2,
    TrendingUp,
    ArrowRight,
    AlertCircle,
    FileText,
    History,
    Search,
    ChevronRight,
    Star,
    Lightbulb,
    Target,
    Loader2
} from "lucide-react";
import { applicationService, Application } from "@/services/application.service";

export default function CandidateAIAnalysisReportPage() {
    const { id } = useParams() as { id: string };
    const [application, setApplication] = useState<Application | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const data = await applicationService.getById(id);
            setApplication(data);
        } catch (error) {
            console.error("Failed to fetch application analysis:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#F8FAFC', gap: '16px' }}>
                <Loader2 className="animate-spin" size={48} color="#5C9AFF" />
                <p style={{ color: '#64748b', fontWeight: 600 }}>Analyzing your application...</p>
            </div>
        );
    }

    if (!application) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>Application not found</div>;
    }

    const { aiReport, job, candidate } = application;

    if (!aiReport) {
        return (
            <div style={{ padding: '100px 40px', textAlign: 'center', backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
                <div style={{ backgroundColor: 'white', padding: '48px', borderRadius: '32px', maxWidth: '600px', margin: '0 auto', border: '1px solid #e2e8f0' }}>
                    <Zap size={48} color="#94a3b8" style={{ marginBottom: '24px' }} />
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>Analysis Not Ready</h2>
                    <p style={{ color: '#64748b', marginBottom: '32px', lineHeight: 1.6 }}>Our AI system is processing your profile. Please check back in a few minutes for the detailed report.</p>
                    <button onClick={fetchData} style={{ padding: '12px 24px', backgroundColor: '#5C9AFF', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Refresh Data</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '0', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            {/* Nav Strip */}
            <div style={{ padding: '24px 40px', backgroundColor: 'white', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
                    <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{job?.company?.name || 'Recruitment Portal'}</h1>
                    <div style={{ display: 'flex', gap: '24px', fontSize: '13px', fontWeight: 600, color: '#64748b' }}>
                        <span>Analysis Report</span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{candidate?.fullName}</div>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Candidate</div>
                    </div>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#5C9AFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '14px' }}>
                        {candidate?.fullName?.charAt(0)}
                    </div>
                </div>
            </div>

            <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
                {/* Profile Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '48px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '24px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 800, color: '#5C9AFF', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                        {candidate?.fullName?.charAt(0)}
                    </div>
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{candidate?.fullName}</h1>
                        <p style={{ fontSize: '16px', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>{job?.title}</p>
                    </div>
                </div>

                <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: 0 }}>AI Analysis Report</h2>
                    <p style={{ fontSize: '15px', color: '#64748b', marginTop: '8px', fontWeight: 600 }}>Compatibility analysis for the position: {job?.title}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 420px', gap: '32px', alignItems: 'start' }}>

                    {/* Left Panel: Match Compatibility */}
                    <div style={{ backgroundColor: 'white', padding: '48px', borderRadius: '32px', border: '1px solid #f1f5f9', position: 'relative' }}>
                        <div style={{ textAlign: 'center', position: 'relative', marginBottom: '48px' }}>
                            <div style={{ display: 'inline-block', position: 'relative' }}>
                                <svg width="220" height="220" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#5C9AFF" strokeWidth="8" strokeDasharray="251" strokeDashoffset={251 - (251 * (application.score || 0)) / 100} strokeLinecap="round" transform="rotate(-90 50 50)" style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
                                </svg>
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                                    <h1 style={{ fontSize: '48px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{Math.round(application.score || 0)}<span style={{ fontSize: '20px' }}>%</span></h1>
                                    <p style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', margin: 0, letterSpacing: '0.05em' }}>{application.score && application.score >= 80 ? 'STRONG FIT' : application.score && application.score >= 60 ? 'POTENTIAL' : 'DEVELOPING'}</p>
                                </div>
                            </div>
                            <div style={{ position: 'absolute', top: 0, right: 0, width: '48px', height: '48px', backgroundColor: '#dbeafe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CheckCircle2 color="#5C9AFF" size={24} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            {[
                                { label: "TECHNICAL SKILLS", score: aiReport.dimensionScores?.skillsMatch || 0, color: '#5C9AFF' },
                                { label: "WORK EXPERIENCE", score: aiReport.dimensionScores?.experienceMatch || 0, color: '#1e293b' },
                                { label: "CULTURE & ATTITUDE", score: aiReport.dimensionScores?.cultureFit || 0, color: '#5C9AFF' }
                            ].map(item => (
                                <div key={item.label}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <span style={{ fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase' }}>{item.label}</span>
                                        <span style={{ fontSize: '13px', fontWeight: 800, color: item.color }}>{item.score}%</span>
                                    </div>
                                    <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: `${item.score}%`, height: '100%', backgroundColor: item.color, borderRadius: '4px' }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Panel: Recommendations & Insights */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        {/* AI Recommendation Box */}
                        <div style={{ backgroundColor: '#eff6ff', padding: '32px', borderRadius: '24px', border: '1px solid #dbeafe', borderLeft: '6px solid #5C9AFF' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <Zap size={22} color="#5C9AFF" />
                                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e40af', margin: 0 }}>AI Recommendation</h3>
                            </div>
                            <p style={{ fontSize: '14px', color: '#1e3a8a', lineHeight: 1.6, margin: 0 }}>
                                {aiReport.recommendation}
                            </p>
                        </div>

                        {/* Pros & Cons */}
                        <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#059669', marginBottom: '24px' }}>
                                <TrendingUp size={20} /> <span style={{ fontSize: '14px', fontWeight: 800 }}>Key Strengths</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {aiReport.strengths && Array.isArray(aiReport.strengths) ? aiReport.strengths.slice(0, 3).map((pro: any, i: number) => (
                                    <div key={i} style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{ width: '16px', height: '16px', backgroundColor: '#d1fae5', color: '#059669', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '3px' }}><CheckCircle2 size={10} strokeWidth={4} /></div>
                                        <div>
                                            <h5 style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{pro.point || pro}</h5>
                                            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0', lineHeight: 1.4 }}>{pro.detail || pro.impact || ""}</p>
                                        </div>
                                    </div>
                                )) : <p>No strengths data available.</p>}
                            </div>
                        </div>

                        <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ea580c', marginBottom: '24px' }}>
                                <AlertCircle size={20} /> <span style={{ fontSize: '14px', fontWeight: 800 }}>Improvements & Observations</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {aiReport.weaknesses && Array.isArray(aiReport.weaknesses) ? aiReport.weaknesses.slice(0, 2).map((con: any, i: number) => (
                                    <div key={i} style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{ width: '16px', height: '16px', backgroundColor: '#ffedd5', color: '#ea580c', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '3px' }}><Zap size={10} strokeWidth={4} /></div>
                                        <div>
                                            <h5 style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{con.point || con}</h5>
                                            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0', lineHeight: 1.4 }}>{con.detail || con.risk || ""}</p>
                                        </div>
                                    </div>
                                )) : <p>Your profile is very comprehensive.</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer History/Sources */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginTop: '40px' }}>
                    <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '44px', height: '44px', backgroundColor: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={20} color="#5C9AFF" /></div>
                        <div>
                            <p style={{ fontSize: '9px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', margin: 0 }}>CV SOURCE</p>
                            <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b', margin: '4px 0 0' }}>Application Profile</h4>
                        </div>
                    </div>
                    <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '44px', height: '44px', backgroundColor: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Target size={20} color="#5C9AFF" /></div>
                        <div>
                            <p style={{ fontSize: '9px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', margin: 0 }}>JOB TITLE</p>
                            <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b', margin: '4px 0 0' }}>{job?.title}</h4>
                        </div>
                    </div>
                    <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '44px', height: '44px', backgroundColor: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><History size={20} color="#64748b" /></div>
                        <div>
                            <p style={{ fontSize: '9px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', margin: 0 }}>APPLIED AT</p>
                            <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b', margin: '4px 0 0' }}>{new Date(application.createdAt!).toLocaleDateString('en-US')}</h4>
                        </div>
                    </div>
                </div>
            </div>
            
            <style jsx>{`
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
