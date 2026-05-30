"use client";

import React from "react";
import Link from "next/link";
import {
    LayoutDashboard,
    ShieldCheck,
    Users,
    Settings,
    BarChart3,
    BrainCircuit,
    LogOut,
    Search,
    Bell,
    BookOpen
} from "lucide-react";

import { useAuthStore } from "@/store/authStore";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: "Health Overview", href: "/admin/dashboard" },
        { icon: <BrainCircuit size={20} />, label: "AI Control Center", href: "/admin/ai-center" },
        { icon: <Settings size={20} />, label: "AI Models Config", href: "/admin/ai-management" },
        { icon: <Users size={20} />, label: "Employer Audit", href: "/admin/employers" },
        { icon: <ShieldCheck size={20} />, label: "Companies", href: "/admin/companies" },
        { icon: <BarChart3 size={20} />, label: "Jobs Repository", href: "/admin/jobs" },
        { icon: <BookOpen size={20} />, label: "Question Bank", href: "/admin/question-bank" },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
            {/* Sidebar */}
            <aside style={{ width: '280px', backgroundColor: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column', padding: '32px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 16px', marginBottom: '40px' }}>
                    <div style={{ width: '32px', height: '32px', backgroundColor: '#5C9AFF', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShieldCheck size={20} color="white" />
                    </div>
                    <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em' }}>MY JOB <span style={{ color: '#5C9AFF' }}>CORE</span></span>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {menuItems.map((item) => (
                        <Link key={item.label} href={item.href} style={{ textDecoration: 'none' }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                                borderRadius: '12px', color: '#94a3b8', fontSize: '14px', fontWeight: 600,
                                transition: 'all 0.2s', cursor: 'pointer'
                            }}>
                                {item.icon}
                                <span>{item.label}</span>
                            </div>
                        </Link>
                    ))}
                </nav>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 16px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>AD</div>
                        <div>
                            <p style={{ margin: 0, fontSize: '13px', fontWeight: 700 }}>System Admin</p>
                            <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>Root Access</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => {
                            useAuthStore.getState().logout();
                            window.location.href = '/auth/login';
                        }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                            backgroundColor: 'transparent', border: 'none', color: '#ef4444',
                            fontSize: '14px', fontWeight: 700, cursor: 'pointer'
                        }}
                    >
                        <LogOut size={20} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <header style={{ height: '80px', backgroundColor: 'white', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px' }}>
                    <div style={{ position: 'relative', width: '400px' }}>
                        <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input type="text" placeholder="Global search for jobs, members or reports..." style={{ width: '100%', padding: '12px 16px 12px 48px', border: 'none', backgroundColor: '#f8fafc', borderRadius: '12px', fontSize: '14px', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                        <div style={{ position: 'relative', cursor: 'pointer' }}>
                            <Bell size={20} color="#64748b" />
                            <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '14px', height: '14px', backgroundColor: '#ef4444', borderRadius: '50%', border: '2px solid white', fontSize: '8px', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</div>
                        </div>
                        <Settings size={20} color="#64748b" style={{ cursor: 'pointer' }} />
                    </div>
                </header>

                <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
