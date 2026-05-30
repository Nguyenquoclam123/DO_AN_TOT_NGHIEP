"use client";

import React, { ReactNode } from "react";
import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', display: 'flex', fontFamily: 'sans-serif' }}>
            {/* Sidebar fixed at 280px */}
            <AdminSidebar />

            {/* Main Content Area */}
            <div style={{ flex: 1, marginLeft: '280px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <AdminHeader />
                <main style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
