"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    Building2, MapPin, DollarSign, Clock, Briefcase, Calendar, 
    ChevronRight, ArrowLeft, Share2, FileText, Star, ShieldCheck, 
    User, Gem, Target, Zap, Info, Loader2, Upload, Brain,
    Navigation, MessageCircle as ChatIcon
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from "@/store/authStore";
import { FavoriteButton } from '@/components/shared/FavoriteButton';
import AddressMap from '@/components/shared/AddressMap';
import { ChatWindow } from '@/components/shared/ChatWindow';

export default function CandidateJobDetailPage() {
    const params = useParams();
    const router = useRouter();
    const jobId = params.id as string;
    const currentUser = useAuthStore((state) => state.user);
    
    const [job, setJob] = useState<any>(null);
    const [cvs, setCvs] = useState<any[]>([]);
    const [selectedCvId, setSelectedCvId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'details' | 'ai'>('details');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatContext, setChatContext] = useState<{jobId?: string, applicationId?: string}>({});

    useEffect(() => {
        fetchData();
    }, [jobId]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [jobData, cvsData] = await Promise.all([
                api.get(`/jobs/${jobId}`),
                api.get('/cvs/my')
            ]);
            setJob(jobData);
            setCvs(cvsData || []);
            if (cvsData?.length > 0) setSelectedCvId(cvsData[0].id);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenChat = (context: {jobId?: string, applicationId?: string}) => {
        if (!currentUser) {
            alert("Please login to chat with employers.");
            router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
            return;
        }
        setChatContext(context);
        setIsChatOpen(true);
    };

    const handleRunAIAnalysis = async () => {
        if (!selectedCvId) {
            alert("Please select a CV from the right column before analysis.");
            return;
        }
        setActiveTab('ai');
        setIsAnalyzing(true);
        setAnalysisResult(null); // Reset previous result
        try {
            console.log("Starting AI analysis for Job:", jobId, "CV:", selectedCvId);
            const result = await api.post('/ai-candidate/analyze-cv', { jobId, cvId: selectedCvId });
            console.log("AI Analysis Result:", result);
            setAnalysisResult(result);
        } catch (err: any) {
            console.error("AI Analysis Error:", err);
            alert("AI Analysis Error: " + (err.response?.data?.message || err.message || "Unable to connect to AI server."));
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }}>
                <Loader2 size={48} className="animate-spin" color="#5C9AFF" />
                <p style={{ marginTop: '16px', color: '#64748b', fontWeight: 600 }}>Unfolding opportunities...</p>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', padding: '20px', textAlign: 'center' }}>
                <Info size={48} color="#ef4444" />
                <h2 style={{ marginTop: '16px', fontWeight: 800 }}>{error ? "Oops! Something went wrong" : "Job Not Found"}</h2>
                <p style={{ marginTop: '8px', color: '#64748b', maxWidth: '400px' }}>{error || "The job you are looking for might have been closed or is unavailable."}</p>
                <Link href="/candidate/jobs" style={{ marginTop: '24px', padding: '10px 24px', backgroundColor: '#5C9AFF', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>Back to Discovery</Link>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px' }}>
                {/* Back Button */}
                <button 
                    onClick={() => router.back()} 
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', 
                        background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, 
                        fontSize: '14px', width: 'fit-content', transition: 'color 0.2s', marginBottom: '24px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#5C9AFF'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                >
                    <ArrowLeft size={18} /> Back to list
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 400px', gap: '32px' }}>
                    
                    {/* Left Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        
                        {/* Header Section */}
                        <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                                <div style={{ width: '80px', height: '80px', backgroundColor: '#eff6ff', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {job.company?.logo ? (
                                        <img src={job.company.logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '16px' }} />
                                    ) : (
                                        <Building2 size={40} color="#5C9AFF" />
                                    )}
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{job.title}</h1>
                                        {job.type && (
                                            <span style={{ fontSize: '11px', fontWeight: 900, color: '#475569', backgroundColor: '#f1f5f9', padding: '4px 12px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>{job.type.toUpperCase()}</span>
                                        )}
                                        {job.level?.name && (
                                            <span style={{ fontSize: '11px', fontWeight: 900, color: '#7c3aed', backgroundColor: '#f5f3ff', padding: '4px 12px', borderRadius: '20px', border: '1px solid #ddd6fe' }}>{job.level.name.toUpperCase()}</span>
                                        )}
                                        {job.status === 'CLOSED' ? (
                                            <span style={{ fontSize: '11px', fontWeight: 900, color: '#dc2626', backgroundColor: '#fef2f2', padding: '4px 12px', borderRadius: '20px', border: '1px solid #ef444420' }}>CLOSED</span>
                                        ) : (
                                            <span style={{ fontSize: '11px', fontWeight: 900, color: '#059669', backgroundColor: '#ecfdf5', padding: '4px 12px', borderRadius: '20px', border: '1px solid #10b98120' }}>ACTIVE</span>
                                        )}
                                    </div>
                                    <p style={{ fontSize: '16px', color: '#64748b', marginTop: '6px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ color: '#0f172a' }}>{job.company?.name}</span>
                                        <span style={{ color: '#cbd5e1' }}>|</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={16} /> {job.workLocation}</span>
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <FavoriteButton jobId={jobId} />
                                <button 
                                    onClick={() => {
                                        const myApp = job.applications?.find((a: any) => a.candidate?.userId === currentUser?.id);
                                        setChatContext({ 
                                            jobId, 
                                            applicationId: myApp?.id 
                                        });
                                        setIsChatOpen(true);
                                    }}
                                    style={{ 
                                        padding: '12px', 
                                        backgroundColor: '#f1f5f9', 
                                        color: '#1e293b', 
                                        border: '1px solid #e2e8f0', 
                                        borderRadius: '12px', 
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                >
                                    <ChatIcon size={20} color="#5C9AFF" />
                                </button>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
                            {[
                                { label: "SALARY", value: (job.minSalary && job.maxSalary) ? `$${job.minSalary / 1000}k - $${job.maxSalary / 1000}k` : "Negotiable", icon: <DollarSign size={18} /> },
                                { label: "TYPE", value: job.type || "Full-time", icon: <Clock size={18} /> },
                                { label: "LEVEL", value: job.level?.name || "All", icon: <Gem size={18} /> },
                                { label: "QUANTITY", value: `${job.quantity} Vacancies`, icon: <Briefcase size={18} /> },
                                { label: "POSTED DATE", value: new Date(job.createdAt).toLocaleDateString('en-US'), icon: <Calendar size={18} /> }
                            ].map((stat, i) => (
                                <div key={i} style={{ backgroundColor: 'white', padding: '16px', borderRadius: '20px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <div style={{ color: '#5C9AFF', marginBottom: '8px' }}>{stat.icon}</div>
                                    <p style={{ fontSize: '9px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>{stat.label}</p>
                                    <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stat.value}</h4>
                                </div>
                            ))}
                        </div>

                        {/* Tabs Navigation */}
                        <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid #f1f5f9' }}>
                            <div 
                                onClick={() => setActiveTab('details')}
                                style={{ 
                                    padding: '16px 0', fontSize: '15px', fontWeight: 800, 
                                    color: activeTab === 'details' ? '#5C9AFF' : '#64748b', 
                                    borderBottom: activeTab === 'details' ? '3px solid #5C9AFF' : '3px solid transparent', 
                                    cursor: 'pointer'
                                }}
                            >
                                Job Details
                            </div>
                            <div 
                                onClick={handleRunAIAnalysis}
                                style={{ 
                                    padding: '16px 0', fontSize: '15px', fontWeight: 800, 
                                    color: activeTab === 'ai' ? '#5C9AFF' : '#64748b', 
                                    borderBottom: activeTab === 'ai' ? '3px solid #5C9AFF' : '3px solid transparent', 
                                    display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
                                }}
                            >
                                <Zap size={18} /> AI Match Analysis
                            </div>
                        </div>

                        {/* Details Tab */}
                        {activeTab === 'details' && (
                            <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '40px' }}>
                                {/* Requirements Row */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', paddingBottom: '32px', borderBottom: '1px solid #f1f5f9' }}>
                                    <div>
                                        <p style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px' }}>Seniority Level</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '36px', height: '36px', backgroundColor: '#fdf4ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Gem size={18} color="#a855f7" /></div>
                                            <p style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', margin: 0 }}>{job.level?.name || "All"}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px' }}>Experience</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '36px', height: '36px', backgroundColor: '#f0fdf4', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShieldCheck size={18} color="#22c55e" /></div>
                                            <div>
                                                <p style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', margin: 0 }}>{job.minExperience || 0} years</p>
                                                {job.experienceNote && <p style={{ fontSize: '10px', color: '#64748b', margin: 0, fontStyle: 'italic' }}>{job.experienceNote}</p>}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px' }}>Education</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '36px', height: '36px', backgroundColor: '#fff7ed', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={18} color="#f97316" /></div>
                                            <p style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', margin: 0 }}>{job.minEducation || "Bachelor"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Text Sections */}
                                <section>
                                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <FileText size={20} color="#5C9AFF" /> Job Description
                                    </h3>
                                    <div style={{ fontSize: '15px', color: '#475569', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{job.description}</div>
                                </section>

                                <section>
                                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <Target size={20} color="#5C9AFF" /> Candidate Requirements
                                    </h3>
                                    <div style={{ fontSize: '15px', color: '#475569', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{job.responsibilities}</div>
                                </section>

                                <section>
                                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <Gem size={20} color="#5C9AFF" /> Benefits
                                    </h3>
                                    <div style={{ fontSize: '15px', color: '#475569', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{job.benefits}</div>
                                </section>

                                <section>
                                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <MapPin size={20} color="#5C9AFF" /> Work Location
                                    </h3>
                                    <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                                        <p style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>{job.workLocation}</p>
                                        <div style={{ height: '350px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                            <AddressMap offices={[{ label: job.company?.name, address: job.workLocation }]} height="100%" />
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* AI Tab */}
                        {activeTab === 'ai' && (
                            <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9', minHeight: '400px' }}>
                                {isAnalyzing ? (
                                    <div style={{ textAlign: 'center', padding: '100px 0' }}>
                                        <Loader2 size={48} className="animate-spin" color="#5C9AFF" style={{ margin: '0 auto' }} />
                                        <p style={{ marginTop: '20px', fontWeight: 700, color: '#0f172a' }}>AI is analyzing your profile...</p>
                                        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>This may take a few seconds</p>
                                    </div>
                                ) : analysisResult ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                        {/* Score Overview */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px', alignItems: 'center', backgroundColor: '#f8fafc', padding: '32px', borderRadius: '24px' }}>
                                            <div style={{ textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>
                                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                                    <svg width="120" height="120" viewBox="0 0 120 120">
                                                        <circle cx="60" cy="60" r="54" fill="none" stroke="#e2e8f0" strokeWidth="12" />
                                                        <circle 
                                                            cx="60" cy="60" r="54" fill="none" stroke="#5C9AFF" strokeWidth="12" 
                                                            strokeDasharray={`${(analysisResult.fitScore / 100) * 339.29} 339.29`}
                                                            strokeLinecap="round" transform="rotate(-90 60 60)"
                                                        />
                                                    </svg>
                                                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                                        <div style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a' }}>{analysisResult.fitScore}%</div>
                                                    </div>
                                                </div>
                                                <p style={{ fontWeight: 800, color: '#5C9AFF', marginTop: '16px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Compatibility Score</p>
                                            </div>
                                            <div>
                                                <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Brain size={20} color="#5C9AFF" /> General Assessment
                                                </h4>
                                                <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, margin: 0 }}>{analysisResult.analysis}</p>
                                            </div>
                                        </div>

                                        {/* Skills Analysis */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                            <div style={{ padding: '24px', backgroundColor: '#ecfdf5', borderRadius: '20px', border: '1px solid #10b98120' }}>
                                                <h5 style={{ fontSize: '14px', fontWeight: 800, color: '#059669', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <ShieldCheck size={18} /> Matching Skills
                                                </h5>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                    {analysisResult.matchingSkills?.map((skill: string, i: number) => (
                                                        <span key={i} style={{ backgroundColor: 'white', color: '#059669', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, border: '1px solid #10b98120' }}>{skill}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div style={{ padding: '24px', backgroundColor: '#fff1f2', borderRadius: '20px', border: '1px solid #ef444420' }}>
                                                <h5 style={{ fontSize: '14px', fontWeight: 800, color: '#dc2626', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Zap size={18} /> Missing Skills
                                                </h5>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                    {analysisResult.missingSkills?.map((skill: string, i: number) => (
                                                        <span key={i} style={{ backgroundColor: 'white', color: '#dc2626', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, border: '1px solid #ef444420' }}>{skill}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Suggestions & Action */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                            <div style={{ padding: '24px', border: '1px dashed #5C9AFF30', borderRadius: '20px' }}>
                                                <h5 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>AI Optimization Suggestions</h5>
                                                <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                    {analysisResult.suggestions?.map((s: string, i: number) => (
                                                        <li key={i} style={{ display: 'flex', gap: '12px', fontSize: '14px', color: '#475569', lineHeight: 1.5 }}>
                                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#5C9AFF', marginTop: '7px', flexShrink: 0 }} />
                                                            {s}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            
                                            <div style={{ backgroundColor: '#0f172a', padding: '32px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ maxWidth: '60%' }}>
                                                    <h4 style={{ color: 'white', fontWeight: 800, margin: '0 0 8px' }}>Ready to upgrade your profile?</h4>
                                                    <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Apply these suggestions to your CV to increase your interview rate by 80%.</p>
                                                </div>
                                                <button 
                                                    onClick={() => router.push(`/candidate/cv/builder?copyId=${selectedCvId}&optimized=true`)}
                                                    style={{ padding: '14px 24px', backgroundColor: '#5C9AFF', color: 'white', borderRadius: '12px', border: 'none', fontSize: '14px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                                                >
                                                    <Brain size={18} /> Optimize CV Now
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '100px 0' }}>
                                        <Brain size={64} color="#e2e8f0" style={{ margin: '0 auto 24px' }} />
                                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>Smart Profile Analysis</h3>
                                        <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '400px', margin: '0 auto 32px' }}>
                                            Select your CV from the right column and click analyze to see your job match score.
                                        </p>
                                        <button 
                                            onClick={handleRunAIAnalysis}
                                            style={{ padding: '14px 32px', backgroundColor: '#5C9AFF', color: 'white', borderRadius: '14px', border: 'none', fontSize: '14px', fontWeight: 800, cursor: 'pointer' }}
                                        >
                                            Start Analysis
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Sticky Sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '40px', height: 'fit-content' }}>
                        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Quick Apply</h3>
                            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>Submit your profile now to not miss the opportunity</p>

                            <div style={{ marginBottom: '24px' }}>
                                <p style={{ fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px' }}>SELECT CV</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {cvs.map((cv) => (
                                        <div
                                            key={cv.id}
                                            onClick={() => setSelectedCvId(cv.id)}
                                            style={{
                                                padding: '12px', borderRadius: '14px', border: selectedCvId === cv.id ? '2px solid #5C9AFF' : '1px solid #e2e8f0',
                                                display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', backgroundColor: selectedCvId === cv.id ? '#f0f7ff' : 'transparent'
                                            }}
                                        >
                                            <FileText size={18} color={selectedCvId === cv.id ? "#5C9AFF" : "#cbd5e1"} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cv.cvTitle}</h4>
                                            </div>
                                            <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: selectedCvId === cv.id ? '5px solid #5C9AFF' : '2px solid #cbd5e1' }}></div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {job.status === 'CLOSED' ? (
                                <button disabled style={{ width: '100%', padding: '14px', backgroundColor: '#f1f5f9', color: '#94a3b8', borderRadius: '14px', border: 'none', fontWeight: 800 }}>Applications Closed</button>
                            ) : (
                                <Link href={`/candidate/jobs/${jobId}/apply`} style={{ textDecoration: 'none' }}>
                                    <button style={{ width: '100%', padding: '14px', backgroundColor: '#5C9AFF', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(92, 154, 255, 0.3)' }}>Apply Now</button>
                                </Link>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                                <button style={{ padding: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}><Share2 size={16} /></button>
                                <button 
                                    onClick={() => {
                                        const myApp = job?.applications?.find((a: any) => a.candidate?.userId === currentUser?.id);
                                        handleOpenChat({ jobId, applicationId: myApp?.id });
                                    }}
                                    style={{ padding: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', color: '#64748b' }}
                                ><ChatIcon size={16} color="#5C9AFF" /></button>
                            </div>
                        </div>

                        {/* Company Card */}
                        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <div style={{ width: '40px', height: '40px', backgroundColor: '#f8fafc', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Building2 size={20} color="#5C9AFF" />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{job.company?.name}</h4>
                                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>Company Details</p>
                                </div>
                            </div>
                            <Link href={`/candidate/companies/${job.companyId}`} style={{ textDecoration: 'none', color: '#5C9AFF', fontSize: '13px', fontWeight: 800 }}>View Company Profile</Link>
                        </div>
                    </div>
                </div>
            </div>

            {isChatOpen && currentUser && (
                <ChatWindow 
                    jobId={chatContext.jobId}
                    applicationId={chatContext.applicationId}
                    candidateId={currentUser.id}
                    companyId={job.companyId || job.company?.id}
                    currentUser={{
                        id: currentUser.id,
                        name: `${currentUser.firstName} ${currentUser.lastName}`,
                        role: currentUser.role
                    }}
                    onClose={() => setIsChatOpen(false)}
                />
            )}
        </div>
    );
}
