"use client";

import React from "react";
import Link from "next/link";
import {
    Briefcase,
    ShieldCheck,
    User,
    ArrowRight,
    Zap,
    MoveRight
} from "lucide-react";

export default function HomePage() {
    const modules = [
        {
            title: "Employer Portal",
            desc: "Manage AI-driven recruitment campaigns, question banks, and talent pools.",
            href: "/employer/dashboard",
            icon: <Briefcase size={32} color="#5C9AFF" />,
            color: "#eff6ff"
        },
        {
            title: "Admin Control Center",
            desc: "Audit organizations, monitor AI model performance, and system health.",
            href: "/admin/dashboard",
            icon: <ShieldCheck size={32} color="#0f172a" />,
            color: "#f8fafc"
        },
        {
            title: "Candidate Experience",
            desc: "Optimize your CV with AI and track your application journey.",
            href: "/candidate/dashboard",
            icon: <User size={32} color="#7c3aed" />,
            color: "#f5f3ff"
        }
    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif', padding: '100px 40px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#f0f9ff', borderRadius: '999px', color: '#0369a1', fontSize: '12px', fontWeight: 800, marginBottom: '24px' }}>
                        <Zap size={14} fill="#0369a1" /> MY JOB
                    </div>
                    <h1 style={{ fontSize: '56px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0 }}>
                        Recruitment Infrastructure <br /> <span style={{ color: '#5C9AFF' }}>Powered by Gemini.</span>
                    </h1>
                    <p style={{ fontSize: '18px', color: '#64748b', marginTop: '24px', maxWidth: '600px', marginInline: 'auto' }}>
                        Select a module below to start exploring the high-fidelity AI features implemented for your capstone project.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
                    {modules.map((m) => (
                        <Link key={m.href} href={m.href} style={{ textDecoration: 'none' }}>
                            <div style={{
                                padding: '48px 40px',
                                backgroundColor: 'white',
                                border: '1px solid #f1f5f9',
                                borderRadius: '32px',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                cursor: 'pointer',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                            }} className="module-card">
                                <div style={{ width: '64px', height: '64px', backgroundColor: m.color, borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
                                    {m.icon}
                                </div>
                                <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>{m.title}</h3>
                                <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.6, marginBottom: '32px', flex: 1 }}>{m.desc}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#5C9AFF', fontWeight: 800, fontSize: '14px' }}>
                                    Launch Module <MoveRight size={18} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .module-card:hover {
                    transform: translateY(-8px);
                    border-color: #5C9AFF;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
                }
            `}</style>
        </div>
    );
}
