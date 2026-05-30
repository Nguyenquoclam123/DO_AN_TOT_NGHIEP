"use client";

import React from "react";
import {
    X,
    Zap,
    Target,
    CheckCircle2,
    AlertTriangle,
    Activity,
    MessageSquare,
    ShieldCheck,
    ChevronRight,
    Search,
    Calendar,
    Archive
} from "lucide-react";

export default function CandidateAIAnalysisPage() {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.05)' }}>
            {/* Background List Placeholder (Blurred) */}
            <div style={{ flex: 1, padding: '40px', filter: 'blur(4px)', pointerEvents: 'none' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '16px' }}>Jobs / Engineering / Lead Product Designer</div>
                <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Lead Product Designer</h1>
                <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
                    <div style={{ padding: '8px 24px', backgroundColor: '#dbeafe', borderRadius: '8px' }}>NEW (42)</div>
                    <div style={{ padding: '8px 24px', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>SCREENING (12)</div>
                </div>
            </div>

            {/* AI Analysis Side Drawer */}
            <div style={{ width: '680px', backgroundColor: 'white', borderLeft: '1px solid #e2e8f0', boxShadow: '-10px 0 50px rgba(0,0,0,0.1)', overflowY: 'auto' }}>
                {/* Drawer Header */}
                <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <X size={20} color="#64748b" style={{ cursor: 'pointer' }} />
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Jordan Devereaux</h2>
                            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>jordan.dev@ux.design</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button style={{ padding: '10px 20px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '10px', border: 'none', fontSize: '13px', fontWeight: 700 }}>Archive</button>
                        <button style={{ padding: '10px 20px', backgroundColor: '#5C9AFF', color: 'white', borderRadius: '10px', border: 'none', fontSize: '13px', fontWeight: 700 }}>Schedule Interview</button>
                    </div>
                </div>

                {/* Sub-Tabs */}
                <div style={{ padding: '0 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '32px' }}>
                    <div style={{ padding: '20px 0', fontSize: '14px', fontWeight: 800, color: '#5C9AFF', borderBottom: '3px solid #5C9AFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Zap size={16} /> AI Insight
                    </div>
                    <div style={{ padding: '20px 0', fontSize: '14px', fontWeight: 800, color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Hồ sơ gốc
                    </div>
                </div>

                {/* AI Analysis Content */}
                <div style={{ padding: '32px' }}>
                    {/* Hero Match Score */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '4px', height: '18px', backgroundColor: '#5C9AFF', borderRadius: '2px' }}></div> AI Match Analysis
                        </h3>
                        <div style={{ fontSize: '32px', fontWeight: 800, color: '#5C9AFF' }}>94/100</div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
                        {/* Strengths */}
                        <div style={{ backgroundColor: '#f0fdf4', padding: '24px', borderRadius: '20px', border: '1px solid #dcfce7' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', marginBottom: '16px' }}>
                                <CheckCircle2 size={18} /> <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase' }}>STRENGTHS</span>
                            </div>
                            <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {[
                                    "8+ years in Fintech Product Design",
                                    "Expert Design System management",
                                    "Proven leadership in 15+ person teams"
                                ].map((item, i) => (
                                    <li key={i} style={{ fontSize: '13px', color: '#065f46', lineHeight: 1.5, display: 'flex', gap: '8px' }}>
                                        <div style={{ minWidth: '4px', height: '4px', backgroundColor: '#10b981', borderRadius: '50%', marginTop: '6px' }}></div> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Skill Gaps */}
                        <div style={{ backgroundColor: '#fff7ed', padding: '24px', borderRadius: '20px', border: '1px solid #ffedd5' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ea580c', marginBottom: '16px' }}>
                                <AlertTriangle size={18} /> <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase' }}>SKILL GAPS VS JD</span>
                            </div>
                            <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {[
                                    "Minimal experience with Framer Motion",
                                    "Lacks specific B2B SaaS billing flow exp"
                                ].map((item, i) => (
                                    <li key={i} style={{ fontSize: '13px', color: '#9a3412', lineHeight: 1.5, display: 'flex', gap: '8px' }}>
                                        <div style={{ minWidth: '4px', height: '4px', backgroundColor: '#ea580c', borderRadius: '50%', marginTop: '6px' }}></div> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Competency Matrix */}
                    <div style={{ marginBottom: '48px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '4px', height: '18px', backgroundColor: '#5C9AFF', borderRadius: '2px' }}></div> Competency Matrix
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {[
                                { label: "Visual Hierarchy & Craft", score: 98, color: '#5C9AFF' },
                                { label: "Product Strategy", score: 92, color: '#5C9AFF' },
                                { label: "Prototyping & Motion", score: 65, color: '#ea580c' }
                            ].map(item => (
                                <div key={item.label}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>{item.label}</span>
                                        <span style={{ fontSize: '13px', fontWeight: 800, color: item.color }}>{item.score}%</span>
                                    </div>
                                    <div style={{ height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px' }}>
                                        <div style={{ width: `${item.score}%`, height: '100%', backgroundColor: item.color, borderRadius: '3px' }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tailored Interview Questions */}
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '4px', height: '18px', backgroundColor: '#5C9AFF', borderRadius: '2px' }}></div> Tailored Interview Questions
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ padding: '24px', backgroundColor: '#eff6ff', borderRadius: '16px', borderLeft: '4px solid #5C9AFF' }}>
                                <p style={{ fontSize: '10px', fontWeight: 900, color: '#5C9AFF', textTransform: 'uppercase', marginBottom: '12px' }}>FOCUS: MOTION GAPS</p>
                                <p style={{ fontSize: '14px', color: '#1e40af', lineHeight: 1.6, fontStyle: 'italic', margin: 0 }}>
                                    "Can you walk us through a time you had to implement complex interactions? How did you bridge the gap between static design and high-fidelity motion?"
                                </p>
                            </div>
                            <div style={{ padding: '24px', backgroundColor: '#f8fafc', borderRadius: '16px', borderLeft: '4px solid #cbd5e1' }}>
                                <p style={{ fontSize: '10px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>FOCUS: TEAM SCALABILITY</p>
                                <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, fontStyle: 'italic', margin: 0 }}>
                                    "How have you evolved your design system documentation as your previous team grew from 5 to 15+ designers?"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Review Status */}
                <div style={{ padding: '24px 32px', borderTop: '1px solid #f1f5f9', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ display: 'flex' }}>
                            {[1, 2].map(i => <div key={i} style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#e2e8f0', border: '2px solid white', marginLeft: i > 1 ? '-8px' : 0 }}></div>)}
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', marginLeft: '-8px', fontSize: '9px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+2</div>
                        </div>
                    </div>
                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Last reviewed by Sarah 2h ago</span>
                </div>
            </div>
        </div>
    );
}
