"use client";

import React, { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

import { GlobalMessageListener } from "../shared/GlobalMessageListener";

interface EmployerLayoutProps {
    children: ReactNode;
}

export default function EmployerLayout({ children }: EmployerLayoutProps) {
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', display: 'flex' }}>
            <GlobalMessageListener />
            {/* Sidebar fixed 280px */}
            <Sidebar />

            {/* Main Content with explicit inline marginLeft */}
            <div style={{ flex: 1, marginLeft: '280px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Header />
                <main style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
