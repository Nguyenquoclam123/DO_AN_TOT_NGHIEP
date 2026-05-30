"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Building2,
    Briefcase,
    ShieldAlert,
    Settings,
    Database,
    LogOut,
    ShieldCheck
} from "lucide-react";

import { useAuthStore } from "@/store/authStore";

export const AdminSidebar = () => {
    const pathname = usePathname();

    const menuItems = [
        { name: "Intelligence", href: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
        { name: "User Access", href: "/admin/users", icon: <Users size={20} /> },
        { name: "Companies", href: "/admin/companies", icon: <Building2 size={20} /> },
        { name: "Job Analysis", href: "/admin/jobs", icon: <Briefcase size={20} /> },
        { name: "System Logs", href: "/admin/logs", icon: <Database size={20} /> },
        { name: "Security", href: "/admin/security", icon: <ShieldAlert size={20} /> },
    ];

    return (
        <aside style={{ width: '280px', height: '100vh', backgroundColor: '#0f172a', display: 'flex', flexDirection: 'column', position: 'fixed', left: 0, top: 0, zIndex: 50, fontFamily: 'sans-serif' }}>
            {/* Logo - Admin Branding */}
            <div style={{ padding: '32px 32px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', backgroundColor: '#5C9AFF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }}>
                        <ShieldCheck style={{ color: 'white', width: '24px', height: '24px' }} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '16px', fontWeight: 900, color: 'white', margin: 0, lineHeight: 1.2 }}>My Job Admin</h1>
                        <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>CORE INFRASTRUCTURE</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s',
                                backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                color: isActive ? '#60a5fa' : 'rgba(255,255,255,0.5)'
                            }}
                        >
                            {item.icon}
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

        </aside>
    );
};
