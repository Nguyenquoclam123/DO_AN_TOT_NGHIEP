"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { GlobalMessageListener } from "../shared/GlobalMessageListener";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/auth.service";
import { ShieldAlert, AlertCircle, Clock } from "lucide-react";

interface EmployerLayoutProps {
    children: ReactNode;
}

export default function EmployerLayout({ children }: EmployerLayoutProps) {
    const { user } = useAuthStore();
    const [companyStatus, setCompanyStatus] = useState<string>("APPROVED");

    useEffect(() => {
        const fetchCompanyStatus = async () => {
            try {
                const data = await authService.getProfile();
                if (data?.company?.status) {
                    setCompanyStatus(data.company.status);
                }
            } catch (error) {
                console.error("Failed to fetch company status in layout:", error);
            }
        };

        if (user?.id) {
            fetchCompanyStatus();
        }
    }, [user]);

    const renderBanner = () => {
        switch (companyStatus) {
            case 'PENDING':
                return (
                    <div style={{
                        backgroundColor: '#fffbeb',
                        borderBottom: '1px solid #fef3c7',
                        padding: '12px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        color: '#b45309',
                        fontSize: '13.5px',
                        fontWeight: 600,
                        fontFamily: 'Inter, sans-serif'
                    }}>
                        <Clock size={18} color="#d97706" style={{ flexShrink: 0 }} />
                        <span>Tài khoản doanh nghiệp của bạn đang trong trạng thái <strong>Chờ phê duyệt</strong>. Các tính năng như đăng tin chính thức, tìm ứng viên, chat AI tạm thời bị khóa cho đến khi được Ban quản trị xác thực.</span>
                    </div>
                );
            case 'REJECTED':
                return (
                    <div style={{
                        backgroundColor: '#fef2f2',
                        borderBottom: '1px solid #fee2e2',
                        padding: '12px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        color: '#b91c1c',
                        fontSize: '13.5px',
                        fontWeight: 600,
                        fontFamily: 'Inter, sans-serif'
                    }}>
                        <ShieldAlert size={18} color="#dc2626" style={{ flexShrink: 0 }} />
                        <span>Hồ sơ doanh nghiệp của bạn <strong>bị từ chối phê duyệt</strong>. Vui lòng vào Cài đặt để cập nhật chính xác Mã số thuế, tên đại diện pháp luật và liên hệ Admin duyệt lại.</span>
                    </div>
                );
            case 'SUSPENDED':
                return (
                    <div style={{
                        backgroundColor: '#f1f5f9',
                        borderBottom: '1px solid #e2e8f0',
                        padding: '12px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        color: '#475569',
                        fontSize: '13.5px',
                        fontWeight: 600,
                        fontFamily: 'Inter, sans-serif'
                    }}>
                        <AlertCircle size={18} color="#64748b" style={{ flexShrink: 0 }} />
                        <span>Tài khoản doanh nghiệp đã <strong>bị khóa/tạm dừng</strong>. Vui lòng liên hệ với Ban quản trị qua email support@platform.com để giải quyết.</span>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', display: 'flex' }}>
            <GlobalMessageListener />
            {/* Sidebar fixed 280px */}
            <Sidebar />

            {/* Main Content with explicit inline marginLeft */}
            <div style={{ flex: 1, marginLeft: '280px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Header />
                {renderBanner()}
                <main style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
