"use client";

import React from "react";
import {
    ChevronLeft,
    Zap,
    ShieldAlert,
    CheckCircle2,
    Clock,
    TrendingUp,
    Search,
    MoreHorizontal,
    MessageSquare,
    AlertCircle,
    Download,
    User,
    ArrowRight,
    Edit3,
    X,
    Filter,
    Info
} from "lucide-react";

export default function AIPerformanceAuditPage() {
    return (
        <div style={{ padding: '0', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            {/* Context Sidebar Placeholder */}
            <div style={{ padding: '24px 40px', backgroundColor: 'white', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', backgroundColor: '#f1f5f9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={20} color="#64748b" /></div>
                        <div>
                            <div style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ASSESSMENTS / AI PERFORMANCE AUDIT</div>
                            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Marcus Richardson</h1>
                        </div>
                    </div>
                    <div style={{ height: '32px', width: '1px', backgroundColor: '#e2e8f0' }}></div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>ID: APP-9284-MR <span style={{ marginLeft: '12px', color: '#5C9AFF' }}>● Technical Interview Phase</span></div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ padding: '12px 24px', backgroundColor: '#f1f5f9', color: '#64748b', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: 700 }}>Discard Review</button>
                    <button style={{ padding: '12px 32px', backgroundColor: '#5C9AFF', color: 'white', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: 700 }}>Submit Audit</button>
                </div>
            </div>

            <div style={{ padding: '40px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '32px' }}>

                {/* Left Column: Calibration & Reasoning */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {/* Score Calibration Card */}
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                            <Zap size={20} color="#5C9AFF" />
                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Score Calibration</h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px' }}>
                            <div style={{ padding: '24px', borderLeft: '4px solid #5C9AFF', backgroundColor: '#f8fafc', borderRadius: '0 16px 16px 0' }}>
                                <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px' }}>AI SCORE</p>
                                <h2 style={{ fontSize: '48px', fontWeight: 800, color: '#0f172a', margin: 0 }}>92 <span style={{ fontSize: '18px', color: '#94a3b8' }}>/ 100</span></h2>
                                <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', marginTop: '16px' }}>
                                    <div style={{ width: '92%', height: '100%', backgroundColor: '#5C9AFF', borderRadius: '3px' }}></div>
                                </div>
                            </div>
                            <div style={{ padding: '24px', borderLeft: '4px solid #cbd5e1', backgroundColor: '#f8fafc', borderRadius: '0 16px 16px 0' }}>
                                <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px' }}>HR REVIEW SCORE</p>
                                <h2 style={{ fontSize: '48px', fontWeight: 800, color: '#0f172a', margin: 0 }}>68 <span style={{ fontSize: '18px', color: '#94a3b8' }}>/ 100</span></h2>
                                <p style={{ fontSize: '11px', color: '#64748b', marginTop: '8px', lineHeight: 1.4 }}>Manual score based on interview nuances</p>
                            </div>
                            <div style={{ padding: '24px', borderLeft: '4px solid #ef4444', backgroundColor: '#fef2f2', borderRadius: '0 16px 16px 0' }}>
                                <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px' }}>SCORE VARIANCE</p>
                                <h2 style={{ fontSize: '48px', fontWeight: 800, color: '#ef4444', margin: 0 }}>-24 <AlertCircle size={20} style={{ verticalAlign: 'middle' }} /></h2>
                                <span style={{ fontSize: '9px', fontWeight: 900, color: '#ef4444', backgroundColor: 'white', padding: '4px 10px', borderRadius: '4px', border: '1px solid #fee2e2', display: 'inline-block', marginTop: '12px' }}>HIGH VARIANCE FLAGGED</span>
                            </div>
                        </div>

                        <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '48px', height: '24px', backgroundColor: '#ea580c', borderRadius: '12px', position: 'relative' }}>
                                <div style={{ width: '18px', height: '18px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', right: '3px', top: '3px' }}></div>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Is Potential Flag</h4>
                                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Flag this case for AI model refinement and training</p>
                            </div>
                        </div>
                    </div>

                    {/* Final Decision Area */}
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>Final Decision & Reasoning</h3>
                        <p style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '16px' }}>HR DECISION</p>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                            <button style={{ flex: 1, padding: '12px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontWeight: 700, color: '#64748b' }}>Approve AI Score</button>
                            <button style={{ flex: 1, padding: '12px', backgroundColor: '#eff6ff', border: '1px solid #5C9AFF', borderRadius: '10px', fontSize: '14px', fontWeight: 700, color: '#5C9AFF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Edit3 size={16} /> Adjust AI Score</button>
                            <button style={{ flex: 1, padding: '12px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontWeight: 700, color: '#64748b' }}>Reject AI Assessment</button>
                        </div>
                        <p style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '16px' }}>HR NOTES</p>
                        <textarea placeholder="Provide detailed reasoning for the score adjustment..." style={{ width: '100%', padding: '20px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', fontSize: '14px', height: '140px', outline: 'none', resize: 'none' }}></textarea>
                        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '12px' }}>
                            <Info size={16} /> These notes will be visible to the recruitment lead and the AI development team.
                        </div>
                    </div>
                </div>

                {/* Right Column: AI Reasoning */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>AI Reasoning</h3>
                            <Zap size={20} color="#5C9AFF" />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div>
                                <p style={{ fontSize: '10px', fontWeight: 900, color: '#5C9AFF', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <TrendingUp size={14} /> IDENTIFIED STRENGTHS
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {[
                                        "Exceptional proficiency in Distributed Systems based on project keywords.",
                                        "High semantic match for 'Problem-solving under pressure' narrative.",
                                        "Consistency in multi-stage questionnaire responses exceeds 94%."
                                    ].map((text, i) => (
                                        <div key={i} style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>{text}</div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p style={{ fontSize: '10px', fontWeight: 900, color: '#ea580c', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <ShieldAlert size={14} /> POTENTIAL CONCERNS
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {[
                                        "Possible over-optimization of resume for keyword matching identified in work history gaps.",
                                        "Leadership indicators are passive; lower confidence score in 'Managerial Potential'."
                                    ].map((text, i) => (
                                        <div key={i} style={{ backgroundColor: '#fff7ed', padding: '16px', borderRadius: '12px', fontSize: '13px', color: '#9a3412', lineHeight: 1.5 }}>{text}</div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p style={{ fontSize: '10px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>MODEL CONFIDENCE</p>
                                <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: '88%', height: '100%', backgroundColor: '#5C9AFF' }}></div>
                                </div>
                                <div style={{ textAlign: 'right', fontSize: '12px', fontWeight: 800, color: '#5C9AFF', marginTop: '8px' }}>88%</div>
                            </div>
                        </div>
                    </div>

                    {/* Historical Context */}
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '24px' }}>HISTORICAL CONTEXT</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '8px', height: '8px', backgroundColor: '#cbd5e1', borderRadius: '50%' }}></div>
                                <span style={{ fontSize: '13px', color: '#64748b' }}><span style={{ fontWeight: 800, color: '#1e293b' }}>Last Audit: Jan 12</span> Variance: -5 pts (Low)</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '8px', height: '8px', backgroundColor: '#5C9AFF', borderRadius: '50%' }}></div>
                                <span style={{ fontSize: '13px', color: '#64748b' }}><span style={{ fontWeight: 800, color: '#1e293b' }}>Avg Dept Score</span> 74 / 100 for this role</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
