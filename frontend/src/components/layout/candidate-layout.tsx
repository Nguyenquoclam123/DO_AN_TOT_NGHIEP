"use client";

import React, { ReactNode } from "react";
import { CandidateSidebar } from "./candidate-sidebar";
import { CandidateHeader } from "./candidate-header";

import { GlobalMessageListener } from "../shared/GlobalMessageListener";

interface CandidateLayoutProps {
    children: ReactNode;
}

export default function CandidateLayout({ children }: CandidateLayoutProps) {
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', display: 'flex', fontFamily: 'sans-serif' }}>
            <GlobalMessageListener />
            {/* Sidebar fixed at 280px */}
            <CandidateSidebar />

            {/* Main Area pushed by Sidebar width */}
            <div style={{ flex: 1, marginLeft: '280px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <CandidateHeader />
                <main style={{ flex: 1, padding: '32px', backgroundColor: '#F8FAFC' }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
