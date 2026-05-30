"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    ChevronLeft,
    BrainCircuit,
    Target,
    Zap,
    AlertTriangle,
    CheckCircle2,
    MessageSquare,
    Download,
    Star,
    Clock,
    ThumbsUp,
    ThumbsDown,
    Send,
    ShieldCheck
} from "lucide-react";

import { useParams } from "next/navigation";
import { applicationService } from "@/services/application.service";

export default function ApplicantAIInsightPage() {
    const params = useParams();
    const id = params.id;
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [feedbackStatus, setFeedbackStatus] = useState<string | null>(null); // 'ACCURATE' | 'INACCURATE'
    const [comment, setComment] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const [aiInsight, setAiInsight] = useState<any>(null);

    const fetchInsight = async () => {
        setIsLoading(true);
        try {
            // Using applicationService to fetch data instead of manual fetch
            const data = await applicationService.getById(id as string);
            
            if (data && data.aiReport) {
                setAiInsight({
                    candidateName: `${data.candidate?.firstName} ${data.candidate?.lastName}`,
                    appliedJob: data.job?.title,
                    jobId: data.jobId,
                    overallScore: data.score || 0,
                    matchExplanation: data.aiReport.suitabilityReasoning?.logic || data.aiReport.reasoning || "No logic provided by AI.",
                    radarScores: { 
                        skills: data.aiReport.dimensionScores?.skillsMatch || 0, 
                        experience: data.aiReport.dimensionScores?.experienceMatch || 0, 
                        education: data.aiReport.dimensionScores?.educationMatch || 0, 
                        culture: data.aiReport.dimensionScores?.cultureFit || 0 
                    },
                    strengths: data.aiReport.strengths || [],
                    weaknesses: data.aiReport.weaknesses || [],
                    interviewQuestions: (data.aiReport.interviewQuestions || []).map((q: any) => ({
                        question: q.question,
                        difficulty: q.difficulty,
                        insight: q.expectedAnswerInsight
                    }))
                });
            } else if (data && !data.aiReport) {
                setError("AI analysis report is not yet generated for this application.");
            } else {
                setError("Application data not found.");
            }
        } catch (err: any) {
            console.error("Fetch Insight Error:", err);
            setError(err.message || "Failed to fetch application data. Please ensure the ID is correct.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchInsight();
    }, [id]);

    const handleReanalyze = async () => {
        setIsLoading(true);
        try {
            await applicationService.triggerAI(id as string);
            await fetchInsight();
        } catch (err: any) {
            alert("Error re-analyzing: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitFeedback = async () => {
        if (!feedbackStatus) return;
        try {
            await applicationService.submitFeedback(id as string, feedbackStatus, comment);
            setIsSubmitted(true);
        } catch (err) {
            console.error("Failed to submit feedback", err);
        }
    };

    if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px', fontWeight: 600, color: '#64748b' }}>Analyzing candidate profile with AI...</div>;
    
    if (error) return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h2 style={{ color: '#ef4444' }}>Error</h2>
            <p>{error}</p>
            <Link href="/employer/dashboard">Go back to Dashboard</Link>
        </div>
    );

    if (!aiInsight) return null;

    return (
        <div style={{ padding: '40px', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            {/* Header / Nav */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Link href={aiInsight.jobId ? `/employer/jobs/${aiInsight.jobId}` : "/employer/dashboard"} style={{ textDecoration: 'none' }}>
                        <div style={{ width: '40px', height: '40px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                            <ChevronLeft size={20} color="#64748b" />
                        </div>
                    </Link>
                    <div>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI INSIGHT <span style={{ color: '#cbd5e1' }}>/</span> {aiInsight.appliedJob}</div>
                        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: '4px 0 0', letterSpacing: '-0.02em' }}>{aiInsight.candidateName}</h1>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        onClick={handleReanalyze}
                        disabled={isLoading}
                        style={{ 
                            padding: '12px 20px', 
                            backgroundColor: 'white', 
                            border: '1px solid #e2e8f0', 
                            borderRadius: '12px', 
                            fontSize: '14px', 
                            fontWeight: 700, 
                            color: '#5C9AFF', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            cursor: 'pointer' 
                        }}
                    >
                        <BrainCircuit size={18} /> Refresh AI
                    </button>
                    <button style={{ padding: '12px 20px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <Download size={18} /> Export PDF
                    </button>
                    <button style={{ padding: '12px 24px', backgroundColor: '#5C9AFF', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}>
                        <Zap size={18} /> Take Action
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px' }}>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {/* Summary Card */}
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '32px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'radial-gradient(circle at top right, rgba(37, 99, 235, 0.05), transparent)', zIndex: 0 }}></div>
                        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                            <div style={{ 
                                width: '100px', 
                                height: '100px', 
                                borderRadius: '28px', 
                                background: 'linear-gradient(135deg, #5C9AFF, #4A8CFF)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                color: 'white', 
                                fontSize: '32px', 
                                fontWeight: 800,
                                boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.4)'
                            }}>
                                {aiInsight.overallScore}%
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                    <BrainCircuit size={22} color="#5C9AFF" />
                                    <span style={{ fontWeight: 800, color: '#1e293b', fontSize: '18px', letterSpacing: '-0.01em' }}>Executive AI Verdict</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '17px', color: '#475569', lineHeight: 1.7, fontWeight: 500 }}>{aiInsight.matchExplanation}</p>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Strengths & Weaknesses */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        {/* Strengths */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#059669', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 8px' }}>
                                <CheckCircle2 size={20} /> CORE ASSETS
                            </h3>
                            {aiInsight.strengths.map((s, idx) => (
                                <div key={idx} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #ecfdf5', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)' }}>
                                    <div style={{ fontWeight: 800, color: '#065f46', fontSize: '15px', marginBottom: '8px' }}>{s.point}</div>
                                    <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#374151', lineHeight: 1.6 }}>{s.detail}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: '#f0fdf4', borderRadius: '12px', fontSize: '12px', color: '#166534', fontWeight: 700 }}>
                                        <Zap size={14} /> IMPACT: {s.impact}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Weaknesses */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 8px' }}>
                                <AlertTriangle size={20} /> IDENTIFIED GAPS
                            </h3>
                            {aiInsight.weaknesses.map((w, idx) => (
                                <div key={idx} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #fef2f2', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)' }}>
                                    <div style={{ fontWeight: 800, color: '#991b1b', fontSize: '15px', marginBottom: '8px' }}>{w.point}</div>
                                    <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#374151', lineHeight: 1.6 }}>{w.detail}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: '#fff1f2', borderRadius: '12px', fontSize: '12px', color: '#9f1239', fontWeight: 700 }}>
                                        <AlertTriangle size={14} /> RISK: {w.risk}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Interview Questions Section ⭐ (MỚI) */}
                    <div style={{ backgroundColor: '#1e293b', padding: '40px', borderRadius: '32px', color: 'white', boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <MessageSquare size={20} color="#60a5fa" />
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>Tailored Interview Guide</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {aiInsight.interviewQuestions.map((q, idx) => (
                                <div key={idx} style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                        <span style={{ fontSize: '11px', fontWeight: 900, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.1em' }}>QUESTION {idx + 1}</span>
                                        <span style={{ 
                                            padding: '4px 10px', 
                                            backgroundColor: q.difficulty?.toUpperCase() === 'HARD' ? '#450a0a' : q.difficulty?.toUpperCase() === 'MEDIUM' ? '#3b2a06' : '#064e3b', 
                                            color: q.difficulty?.toUpperCase() === 'HARD' ? '#f87171' : q.difficulty?.toUpperCase() === 'MEDIUM' ? '#fbbf24' : '#34d399', 
                                            borderRadius: '8px', 
                                            fontSize: '11px', 
                                            fontWeight: 800,
                                            border: `1px solid ${q.difficulty?.toUpperCase() === 'HARD' ? '#7f1d1d' : q.difficulty?.toUpperCase() === 'MEDIUM' ? '#78350f' : '#065f46'}`
                                        }}>{q.difficulty}</span>
                                    </div>
                                    <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', lineHeight: 1.5 }}>{q.question}</div>
                                    <div style={{ display: 'flex', gap: '12px', padding: '16px', backgroundColor: 'rgba(96, 165, 250, 0.1)', borderRadius: '16px' }}>
                                        <Target size={18} color="#60a5fa" style={{ flexShrink: 0 }} />
                                        <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
                                            <strong style={{ color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>AI INSIGHT:</strong>
                                            {q.insight}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '32px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Target size={18} color="#5C9AFF" /> Score Breakdown
                        </h3>
                        {Object.entries(aiInsight.radarScores).map(([key, value]) => (
                            <div key={key} style={{ marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{key}</span>
                                    <span style={{ fontSize: '13px', fontWeight: 900, color: '#0f172a' }}>{value}%</span>
                                </div>
                                <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${value}%`, backgroundColor: '#5C9AFF', borderRadius: '4px' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* AI Feedback Widget moved to right col for better flow */}
                    {!isSubmitted ? (
                        <div style={{ backgroundColor: '#f0f9ff', padding: '24px', borderRadius: '32px', border: '1px solid #bae6fd' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0369a1', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <ShieldCheck size={18} /> Audit Result
                            </h3>
                            <p style={{ fontSize: '12px', color: '#0c4a6e', marginBottom: '20px', lineHeight: 1.5 }}>Is this AI analysis accurate for your needs?</p>
                            
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                                <button
                                    onClick={() => setFeedbackStatus('ACCURATE')}
                                    style={{ flex: 1, padding: '12px', backgroundColor: feedbackStatus === 'ACCURATE' ? '#0369a1' : 'white', color: feedbackStatus === 'ACCURATE' ? 'white' : '#0369a1', border: '1px solid #0369a1', borderRadius: '12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                    <ThumbsUp size={14} /> Yes
                                </button>
                                <button
                                    onClick={() => setFeedbackStatus('INACCURATE')}
                                    style={{ flex: 1, padding: '12px', backgroundColor: feedbackStatus === 'INACCURATE' ? '#e11d48' : 'white', color: feedbackStatus === 'INACCURATE' ? 'white' : '#e11d48', border: '1px solid #e11d48', borderRadius: '12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                    <ThumbsDown size={14} /> No
                                </button>
                            </div>

                            {feedbackStatus && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <textarea
                                        placeholder="Details..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #bae6fd', fontSize: '12px', minHeight: '80px', outline: 'none' }}
                                    />
                                    <button
                                        onClick={handleSubmitFeedback}
                                        style={{ padding: '12px', backgroundColor: '#0369a1', color: 'white', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                                        Submit Audit
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ backgroundColor: '#ecfdf5', padding: '24px', borderRadius: '32px', border: '1px solid #a7f3d0', color: '#065f46' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <CheckCircle2 size={18} />
                                <span style={{ fontWeight: 800, fontSize: '14px' }}>Audited</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>Thank you for helping us improve.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
