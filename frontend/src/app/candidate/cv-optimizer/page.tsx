"use client";

import React, { useState } from "react";
import {
    Sparkles,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    Lightbulb,
    Search,
    ChevronRight,
    FileText,
    Briefcase,
    TrendingUp,
    RefreshCw,
    X
} from "lucide-react";

export default function CVOptimizerPage() {
    const [step, setStep] = useState(1); // 1: Select, 2: Loading, 3: Result
    const [isLoading, setIsLoading] = useState(false);

    // Mock Optimization Data
    const optimizationResult = {
        currentScore: 68,
        potentialScore: 92,
        overallAdvice: "Your profile is strong on technical skills but lacks 'Impact Statements' in your experience section. By focusing on measurable results, you can significantly increase your attractiveness to this employer.",
        suggestions: [
            {
                section: "Professional Summary",
                current: "Experienced Business Analyst looking for new opportunities in FinTech.",
                improved: "Strategic Senior Business Analyst with 5+ years of experience in FinTech scale-ups, specialized in SQL-driven data modeling and reducing operational costs by 15% through BPMN optimization.",
                reason: "Adds specific duration, specialized tools, and measurable achievements."
            },
            {
                section: "Experience: Tech Corp",
                current: "Managed requirements for the banking module.",
                improved: "Spearheaded requirement elicitation for a high-priority banking module, resulting in 20% faster deployment and zero critical defects reported post-launch.",
                reason: "Uses strong action verbs and focuses on the outcome rather than just the task."
            }
        ],
        missingKeywords: ["React Query", "Tauri", "Semantic Embedding", "BPMN 2.0", "Stakeholder Management"]
    };

    const handleOptimize = () => {
        setStep(2);
        setTimeout(() => setStep(3), 2000); // Mock delay
    };

    return (
        <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>

            {/* Header */}
            <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#eff6ff', color: '#5C9AFF', borderRadius: '100px', fontSize: '12px', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '16px' }}>
                    <Sparkles size={14} /> AI CAREER COPILOT
                </div>
                <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>Optimize Your CV for Success</h1>
                <p style={{ fontSize: '16px', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
                    Let our AI analyze your profile against specific job requirements and provide actionable suggestions to help you get more interviews.
                </p>
            </div>

            {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <div style={{ width: '40px', height: '40px', backgroundColor: '#f0f9ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FileText size={20} color="#0369a1" />
                                </div>
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>1. Select Your CV</h3>
                            </div>
                            <select style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', fontWeight: 600 }}>
                                <option>Senior_BA_CV_2024.pdf</option>
                                <option>Marketing_Portfolio.pdf</option>
                            </select>
                        </div>
                        <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <div style={{ width: '40px', height: '40px', backgroundColor: '#fef2f2', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Briefcase size={20} color="#991b1b" />
                                </div>
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>2. Select Target Job</h3>
                            </div>
                            <select style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', fontWeight: 600 }}>
                                <option>Senior Business Analyst - My Job Corp</option>
                                <option>Product Manager - TechFlow</option>
                            </select>
                        </div>
                    </div>
                    <button
                        onClick={handleOptimize}
                        style={{ width: '100%', padding: '20px', backgroundColor: '#0f172a', color: 'white', borderRadius: '16px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        Start AI Optimization Analysis <ArrowRight size={20} />
                    </button>
                </div>
            )}

            {step === 2 && (
                <div style={{ padding: '100px 0', textAlign: 'center', backgroundColor: 'white', borderRadius: '32px', border: '1px solid #e2e8f0' }}>
                    <div style={{ width: '60px', height: '60px', margin: '0 auto 24px', animation: 'spin 2s linear infinite' }}>
                        <RefreshCw size={60} color="#5C9AFF" />
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>AI is analyzing your profile...</h3>
                    <p style={{ color: '#64748b' }}>Comparing your experience with 24 individual job requirements.</p>
                    <style>{`
                        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    `}</style>
                </div>
            )}

            {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                    {/* Results Overview */}
                    <div style={{ backgroundColor: '#0f172a', padding: '40px', borderRadius: '32px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '200px', height: '200px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%' }}></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '40px', position: 'relative' }}>
                            <div>
                                <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '16px', color: '#f8fafc' }}>Analysis Result</h3>
                                <p style={{ fontSize: '15px', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>{optimizationResult.overallAdvice}</p>
                            </div>
                            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
                                <div style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8', marginBottom: '16px' }}>MATCH SCORE IMPROVEMENT</div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '24px', fontWeight: 800, color: '#94a3b8', textDecoration: 'line-through' }}>{optimizationResult.currentScore}%</span>
                                    <ArrowRight size={20} color="#5C9AFF" />
                                    <span style={{ fontSize: '48px', fontWeight: 800, color: '#5C9AFF' }}>{optimizationResult.potentialScore}%</span>
                                </div>
                                <div style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 700, color: '#4ade80' }}>
                                    <TrendingUp size={16} /> +{optimizationResult.potentialScore - optimizationResult.currentScore}% Increase
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Missing Keywords */}
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Search size={20} color="#5C9AFF" /> Missing Industry Keywords
                        </h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {optimizationResult.missingKeywords.map((tag, i) => (
                                <span key={i} style={{ padding: '8px 16px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '10px', fontSize: '13px', fontWeight: 600, border: '1px solid #e2e8f0' }}>
                                    + {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Detailed Suggestions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Lightbulb size={20} color="#eab308" /> Step-by-Step Improvements
                        </h3>
                        {optimizationResult.suggestions.map((item, idx) => (
                            <div key={idx} style={{ backgroundColor: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                                <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#475569' }}>SECTION: {item.section.toUpperCase()}</span>
                                    <CheckCircle2 size={18} color="#22c55e" />
                                </div>
                                <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                    <div>
                                        <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>CURRENT VERSION</p>
                                        <div style={{ padding: '16px', backgroundColor: '#fef2f2', borderRadius: '16px', fontSize: '14px', color: '#991b1b', lineHeight: 1.5, fontWeight: 500 }}>
                                            {item.current}
                                        </div>
                                    </div>
                                    <div>
                                        <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>AI RECOMMENDED</p>
                                        <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '16px', fontSize: '14px', color: '#166534', lineHeight: 1.5, fontWeight: 600 }}>
                                            {item.improved}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ padding: '16px 24px', backgroundColor: '#fffbeb', borderTop: '1px solid #fef3c7', fontSize: '13px', color: '#92400e', display: 'flex', gap: '8px' }}>
                                    <AlertCircle size={16} /> <strong>Why this works:</strong> {item.reason}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <button
                            onClick={() => setStep(1)}
                            style={{ padding: '12px 24px', backgroundColor: 'transparent', border: 'none', color: '#64748b', fontSize: '14px', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
                            Start Over with Different Job
                        </button>
                    </div>

                </div>
            )}

        </div>
    );
}
