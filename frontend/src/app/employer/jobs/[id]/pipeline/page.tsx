"use client";

import React from "react";
import Link from "next/link";
import {
    ChevronLeft,
    MoreHorizontal,
    Zap,
    Plus,
    Search,
    Filter,
    ArrowRight,
    Users,
    CheckCircle2,
    Clock,
    AlertCircle
} from "lucide-react";

export default function JobPipelinePage({ params }: { params: { id: string } }) {
    const jobId = params.id;

    const stages = [
        {
            name: "Applied", count: 24, candidates: [
                { id: "CAN-001", name: "Alex Rivera", match: 92, avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop" },
                { id: "CAN-002", name: "Sarah Jenkins", match: 88, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop" }
            ]
        },
        {
            name: "Invite", count: 8, candidates: [
                { id: "CAN-003", name: "Michael Chen", match: 75, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop" }
            ]
        },
        {
            name: "Interviewing", count: 12, candidates: [
                { id: "CAN-004", name: "David Kim", match: 95, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop" }
            ]
        },
        { name: "Offer", count: 3, candidates: [] },
        { name: "Hired", count: 1, candidates: [] },
        { name: "Cancelled", count: 0, candidates: [] }
    ];

    return (
        <div style={{ padding: '0', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' }}>
            {/* Header Area */}
            <div style={{ padding: '32px 40px', backgroundColor: 'white', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <Link href={`/employer/jobs/${jobId}`} style={{ textDecoration: 'none' }}>
                        <div style={{ width: '40px', height: '40px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <ChevronLeft size={20} color="#64748b" />
                        </div>
                    </Link>
                    <div>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>HIRING PIPELINE <span style={{ color: '#cbd5e1' }}>/</span> JOB #{jobId}</div>
                        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '4px 0 0' }}>Senior UI Designer</h1>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input type="text" placeholder="Search candidates..." style={{ padding: '10px 12px 10px 36px', backgroundColor: '#f8fafc', border: 'none', borderRadius: '10px', fontSize: '13px', width: '240px', outline: 'none' }} />
                        </div>
                        <button style={{ padding: '10px 16px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Filter size={16} /> Filters
                        </button>
                    </div>
                    <button style={{ padding: '10px 20px', backgroundColor: '#5C9AFF', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={18} /> Invite Candidate
                    </button>
                </div>
            </div>

            {/* Kanban Board */}
            <div style={{ flex: 1, padding: '40px', overflowX: 'auto', display: 'flex', gap: '24px' }}>
                {stages.map((stage, i) => (
                    <div key={i} style={{ minWidth: '320px', width: '320px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {stage.name} <span style={{ color: '#94a3b8', fontSize: '12px' }}>({stage.count})</span>
                            </h3>
                            <Plus size={16} color="#94a3b8" style={{ cursor: 'pointer' }} />
                        </div>

                        <div style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.02)', borderRadius: '24px', padding: '16px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {stage.candidates.map((can, j) => (
                                <div key={j} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', cursor: 'grab' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden' }}>
                                            <img src={can.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="user" />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#eff6ff', padding: '4px 8px', borderRadius: '6px' }}>
                                            <Zap size={12} color="#5C9AFF" fill="#5C9AFF" />
                                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#5C9AFF' }}>{can.match}%</span>
                                        </div>
                                    </div>
                                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b', margin: '0 0 16px' }}>{can.name}</h4>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <div style={{ width: '24px', height: '24px', backgroundColor: '#f8fafc', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle2 size={14} color="#94a3b8" /></div>
                                            <div style={{ width: '24px', height: '24px', backgroundColor: '#f8fafc', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Clock size={14} color="#94a3b8" /></div>
                                        </div>
                                        <Link href={`/employer/candidates/${can.id}/analysis`} style={{ textDecoration: 'none' }}>
                                            <button style={{ padding: '6px 12px', backgroundColor: '#5C9AFF', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '11px', fontWeight: 800, color: '#5C9AFF', cursor: 'pointer' }}>View AI Analysis</button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                            {stage.candidates.length === 0 && (
                                <div style={{ height: '60px', borderRadius: '16px', border: '2px dashed #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: '12px', fontWeight: 700 }}>
                                    Drop here
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

