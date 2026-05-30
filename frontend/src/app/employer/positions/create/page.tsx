"use client";

import React from "react";
import {
    Layout,
    ChevronRight,
    Plus,
    Edit3,
    Trash2,
    ArrowRight,
    Info,
    Globe,
    Layers,
    LayoutDashboard,
    Cpu,
    Settings,
    FileText
} from "lucide-react";

export default function CreatePositionPage() {
    return (
        <div style={{ padding: '0', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '32px' }}>
                {/* Internal Side Nav Placeholder */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 0 20px' }}>
                    <p style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.05em' }}>MANAGEMENT</p>
                    {[
                        { name: "Overview", icon: <LayoutDashboard size={18} />, active: false },
                        { name: "Job Architecture", icon: <Cpu size={18} />, active: true },
                        { name: "Seniority Framework", icon: <Layers size={18} />, active: false },
                        { name: "Permissions", icon: <Settings size={18} />, active: false },
                        { name: "Audit Log", icon: <FileText size={18} />, active: false },
                    ].map(item => (
                        <div key={item.name} style={{
                            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                            backgroundColor: item.active ? '#eff6ff' : 'transparent',
                            color: item.active ? '#5C9AFF' : '#64748b',
                            borderRight: item.active ? '3px solid #5C9AFF' : 'none'
                        }}>
                            {item.icon} {item.name}
                        </div>
                    ))}
                    <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#64748b', fontSize: '14px', fontWeight: 700 }}>
                            <Info size={18} /> Help Center
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#0f172a', margin: 0 }}>New Position</h1>
                    <p style={{ fontSize: '14px', color: '#64748b', marginTop: '12px', maxWidth: '600px', lineHeight: 1.6 }}>
                        Configure the fundamental architecture for your new hiring pipeline. Define the role identity and progressive career stages.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '32px', marginTop: '40px' }}>
                        {/* Configuration Form */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            {/* Role Identity */}
                            <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                                <p style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '16px' }}>ROLE IDENTITY</p>
                                <div style={{ position: 'relative' }}>
                                    <input type="text" placeholder="e.g. Senior Backend Engineer" style={{ width: '100%', padding: '16px 20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '16px', fontWeight: 600, outline: 'none' }} />
                                    <Briefcase size={20} color="#94a3b8" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '24px' }}>
                                    <div>
                                        <p style={{ fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '8px' }}>DEPARTMENT</p>
                                        <select style={{ width: '100%', padding: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontWeight: 700, appearance: 'none' }}>
                                            <option>Engineering</option>
                                        </select>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '8px' }}>EMPLOYMENT TYPE</p>
                                        <select style={{ width: '100%', padding: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontWeight: 700, appearance: 'none' }}>
                                            <option>Full-time</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Seniority Levels */}
                            <div style={{ backgroundColor: '#f8fafc', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                    <div>
                                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Seniority Levels</h3>
                                        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Define the career path for this position</p>
                                    </div>
                                    <span style={{ fontSize: '10px', fontWeight: 900, color: '#ea580c', backgroundColor: '#fff7ed', padding: '4px 12px', borderRadius: '6px' }}>ARCHITECTURE</span>
                                </div>

                                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                                    <input type="text" placeholder="Add level (e.g. Lead Engineer)" style={{ flex: 1, padding: '16px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px' }} />
                                    <button style={{ padding: '0 24px', backgroundColor: '#dbeafe', color: '#5C9AFF', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Plus size={18} /> Add Level
                                    </button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {[
                                        { id: "01", name: "Junior Engineer", desc: "Entry level technical role" },
                                        { id: "02", name: "Software Engineer", desc: "Mid-level individual contributor" },
                                        { id: "03", name: "Senior Engineer", desc: "Active selection", current: true }
                                    ].map(level => (
                                        <div key={level.id} style={{
                                            backgroundColor: 'white', padding: '16px 24px', borderRadius: '16px', border: level.current ? '2px solid #5C9AFF' : '1px solid #f1f5f9',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                        }}>
                                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                <div style={{ width: '32px', height: '32px', backgroundColor: level.current ? '#5C9AFF' : '#f1f5f9', color: level.current ? 'white' : '#64748b', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 800 }}>{level.id}</div>
                                                <div>
                                                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{level.name}</h4>
                                                    <p style={{ fontSize: '11px', color: level.current ? '#5C9AFF' : '#94a3b8', margin: 0, fontWeight: 700 }}>{level.desc}</p>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                <Edit3 size={18} color="#94a3b8" />
                                                <Trash2 size={18} color="#94a3b8" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Guidance */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', marginBottom: '16px' }}>Framework Guidance</h4>
                                <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>
                                    Proper job architecture ensures fair compensation and clear career trajectories. We recommend at least 3 levels for standard engineering roles.
                                </p>
                                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: '#475569', fontWeight: 700 }}>
                                        <div style={{ width: '6px', height: '6px', backgroundColor: '#5C9AFF', borderRadius: '50%', marginTop: '4px' }}></div>
                                        Standardize naming conventions across departments.
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: '#475569', fontWeight: 700 }}>
                                        <div style={{ width: '6px', height: '6px', backgroundColor: '#ea580c', borderRadius: '50%', marginTop: '4px' }}></div>
                                        Map levels to salary bands in later steps.
                                    </div>
                                </div>
                            </div>

                            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '24px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Globe size={18} color="#64748b" />
                                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>Public Career Page</span>
                                </div>
                                <div style={{ width: '40px', height: '24px', backgroundColor: '#5C9AFF', borderRadius: '12px', position: 'relative' }}>
                                    <div style={{ width: '18px', height: '18px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', right: '3px', top: '3px' }}></div>
                                </div>
                            </div>

                            <div style={{ borderRadius: '24px', overflow: 'hidden', height: '200px', position: 'relative' }}>
                                <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="blueprint" />
                                <div style={{ position: 'absolute', bottom: '20px', left: '20px' }}>
                                    <h4 style={{ color: 'white', fontSize: '14px', fontWeight: 800, margin: 0 }}>Professional Blueprint</h4>
                                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', margin: 0 }}>Designed for scaling teams</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div style={{ marginTop: '60px', paddingTop: '32px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '24px' }}>
                        <button style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>Discard Draft</button>
                        <button style={{ padding: '14px 40px', backgroundColor: '#5C9AFF', color: 'white', borderRadius: '14px', border: 'none', fontSize: '15px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            Continue to Attributes <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Briefcase(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
    );
}
