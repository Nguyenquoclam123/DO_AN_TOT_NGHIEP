"use client";

import React, { useState } from "react";
import {
    Users,
    Search,
    FileText,
    Star,
    Mail,
    MessageSquare,
    MoreVertical,
    Target,
    Zap,
    Trophy,
    ArrowUpRight
} from "lucide-react";

export default function TalentPoolPage() {
    const [searchTerm, setSearchTerm] = useState("");

    const candidates = [
        { id: "1", name: "Alexander Nguyen", email: "alex@example.com", topScore: 92, lastCv: "Senior BA v2", summary: "Expert in SQL, Tableau and FinTech requirements gathering.", tags: ["Python", "SQL", "FinTech"] },
        { id: "2", name: "Sarah Jenkins", email: "sarah.j@tech.com", topScore: 88, lastCv: "Product Designer", summary: "Senior UI/UX designer with 8 years of experience in SaaS products.", tags: ["Figma", "SaaS", "UX"] },
        { id: "3", name: "David Chen", email: "dchen@global.io", topScore: 85, lastCv: "Backend Lead", summary: "Specialized in microservices architecture and Node.js performance tuning.", tags: ["Node.js", "Redis", "AWS"] },
        { id: "4", name: "Elena Rodriguez", email: "elena.r@agency.com", topScore: 81, lastCv: "Marketing Expert", summary: "Growth-driven marketer focusing on data analytics and campaign RoI.", tags: ["Growth", "Ads", "Analytics"] },
    ];

    return (
        <div style={{ padding: '0', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Talent Pool</h1>
                    <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>Global database of candidates who have engaged with your organization.</p>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search by skill, name or tag..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '320px', padding: '12px 16px 12px 48px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', outline: 'none' }}
                        />
                    </div>
                </div>
            </div>

            {/* AI Insights Bar */}
            <div style={{ backgroundColor: '#0f172a', borderRadius: '24px', padding: '32px', color: 'white', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <Zap size={20} color="#5C9AFF" fill="#5C9AFF" />
                        <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.1em', color: '#5C9AFF' }}>AI RECOMMENDATION</span>
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>Discover Hidden Gems in your Pool</h2>
                    <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '8px', maxWidth: '600px' }}>Our AI can re-screen candidates from past applications for your current open roles. Optimize your hiring costs by looking inward first.</p>
                </div>
                <button style={{ padding: '14px 28px', backgroundColor: '#5C9AFF', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 800, cursor: 'pointer' }}>Run AI Re-discovery</button>
            </div>

            {/* Candidate List Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '32px' }}>
                {candidates.map((can) => (
                    <div key={can.id} style={{ backgroundColor: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', overflow: 'hidden', padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{ width: '48px', height: '48px', backgroundColor: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 800, color: '#5C9AFF' }}>
                                    {can.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{can.name}</h3>
                                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>{can.email}</p>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ca8a04' }}>
                                    <Trophy size={14} />
                                    <span style={{ fontSize: '16px', fontWeight: 800 }}>{can.topScore}</span>
                                </div>
                                <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8' }}>PEAK SCORE</span>
                            </div>
                        </div>

                        <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, marginBottom: '24px', height: '40px', overflow: 'hidden' }}>{can.summary}</p>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                            {can.tags.map(tag => (
                                <span key={tag} style={{ padding: '4px 12px', backgroundColor: '#eff6ff', color: '#5C9AFF', borderRadius: '999px', fontSize: '10px', fontWeight: 800 }}>{tag}</span>
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid #f8fafc' }}>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button style={{ padding: '8px', color: 'white', backgroundColor: '#5C9AFF', border: 'none', cursor: 'pointer' }}><Mail size={18} /></button>
                                <button style={{ padding: '8px', color: '#94a3b8', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}><MessageSquare size={18} /></button>
                            </div>
                            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                                View Profile <ArrowUpRight size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

