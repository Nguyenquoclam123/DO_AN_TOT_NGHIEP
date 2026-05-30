"use client";

import React, { useEffect, useState } from "react";
import {
    ArrowLeft,
    Target,
    Layers,
    Database,
    Loader2,
    Edit2,
    ChevronRight,
    Zap,
    Users,
    TrendingUp,
    ShieldCheck,
    LayoutDashboard
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { masterDataService } from "@/services/master-data.service";

export default function PositionDetailPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const [position, setPosition] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchPosition = async () => {
            try {
                setIsLoading(true);
                const data = await masterDataService.getPositionById(id);
                setPosition(data);
            } catch (error) {
                console.error("Failed to fetch position", error);
                router.push("/employer/positions");
            } finally {
                setIsLoading(false);
            }
        };
        fetchPosition();
    }, [id, router]);

    if (isLoading) {
        return (
            <div style={{ padding: '100px 0', textAlign: 'center' }}>
                <Loader2 className="animate-spin" style={{ margin: '0 auto' }} color="#5C9AFF" size={48} />
                <p style={{ marginTop: '20px', color: '#64748b', fontWeight: 600 }}>Đang tải thông tin vị trí...</p>
            </div>
        );
    }

    if (!position) return null;

    return (
        <div style={{ padding: '48px 64px', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <Link href="/employer/positions" style={{ width: '48px', height: '48px', backgroundColor: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', border: '1px solid #e2e8f0', transition: 'all 0.2s' }}>
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>{position.name}</h1>
                        <p style={{ fontSize: '15px', color: '#64748b', marginTop: '6px', fontWeight: 500 }}>Chi tiết kiến trúc và lộ trình nghề nghiệp cho vai trò này.</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {position.companyId && (
                        <Link href={`/employer/positions/${id}/edit`}>
                            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: 'white', color: '#0f172a', borderRadius: '14px', border: '1px solid #e2e8f0', fontSize: '14px', fontWeight: 800, cursor: 'pointer' }}>
                                <Edit2 size={18} /> Chỉnh sửa
                            </button>
                        </Link>
                    )}
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#5C9AFF', color: 'white', borderRadius: '14px', border: 'none', fontSize: '14px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)' }}>
                        <Zap size={18} fill="currentColor" /> AI Sync
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
                {/* Main Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {/* Stats Summary */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                        {[
                            { label: 'Ứng viên phù hợp', value: '124', icon: Users, color: '#5C9AFF', bg: '#eff6ff' },
                            { label: 'Độ phù hợp TB', value: '86%', icon: TrendingUp, color: '#10b981', bg: '#ecfdf5' },
                            { label: 'Độ ưu tiên', value: 'Cao', icon: ShieldCheck, color: '#f59e0b', bg: '#fffbeb' }
                        ].map((stat, i) => (
                            <div key={i} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ width: '56px', height: '56px', backgroundColor: stat.bg, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                                    <stat.icon size={28} />
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{stat.label}</p>
                                    <h4 style={{ margin: '4px 0 0', fontSize: '24px', fontWeight: 900, color: '#0f172a' }}>{stat.value}</h4>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Description Section */}
                    <div style={{ backgroundColor: 'white', borderRadius: '32px', border: '1px solid #f1f5f9', padding: '40px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Target size={24} color="#5C9AFF" /> Tổng quan vai trò
                        </h3>
                        <p style={{ fontSize: '16px', color: '#475569', lineHeight: 1.8, margin: 0 }}>
                            {position.description || "Chưa có mô tả chi tiết cho vị trí này. Hãy cập nhật kiến trúc để AI có thể phân tích ứng viên chính xác hơn."}
                        </p>
                    </div>

                    {/* Management Sections */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <Link href="/employer/levels" style={{ textDecoration: 'none' }}>
                            <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #f1f5f9', transition: 'all 0.3s' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = '#5C9AFF'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = '#f1f5f9'}
                            >
                                <div style={{ width: '48px', height: '48px', backgroundColor: '#f0f9ff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0369a1', marginBottom: '24px' }}>
                                    <Layers size={24} />
                                </div>
                                <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Quản lý Level</h4>
                                <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>Thiết lập các tiêu chuẩn chuyên môn cho từng cấp bậc seniority.</p>
                            </div>
                        </Link>
                        
                        <Link href="/employer/question-bank" style={{ textDecoration: 'none' }}>
                            <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #f1f5f9', transition: 'all 0.3s' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = '#5C9AFF'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = '#f1f5f9'}
                            >
                                <div style={{ width: '48px', height: '48px', backgroundColor: '#fdf2f8', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9d174d', marginBottom: '24px' }}>
                                    <Database size={24} />
                                </div>
                                <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Ngân hàng Câu hỏi</h4>
                                <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>Xây dựng bộ câu hỏi đánh giá kỹ năng chuyên sâu cho vị trí này.</p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div style={{ backgroundColor: '#0f172a', borderRadius: '32px', padding: '32px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', backgroundColor: 'rgba(92, 154, 255, 0.2)', borderRadius: '50%', filter: 'blur(40px)' }}></div>
                        <h4 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', position: 'relative' }}>AI Insights</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
                            <div style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 8px', fontWeight: 700, textTransform: 'uppercase' }}>Kỹ năng hàng đầu</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {['System Design', 'React', 'Node.js'].map(tag => (
                                        <span key={tag} style={{ fontSize: '11px', padding: '4px 10px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>{tag}</span>
                                    ))}
                                </div>
                            </div>
                            <div style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 8px', fontWeight: 700, textTransform: 'uppercase' }}>Thị trường</p>
                                <p style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>Nhu cầu tuyển dụng tăng 12% trong tháng này.</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ backgroundColor: 'white', borderRadius: '32px', border: '1px solid #f1f5f9', padding: '32px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '20px' }}>Lịch sử thay đổi</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {[1, 2].map(i => (
                                <div key={i} style={{ display: 'flex', gap: '16px' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#e2e8f0', marginTop: '4px', flexShrink: 0 }}></div>
                                    <div>
                                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', margin: '0 0 2px' }}>Cập nhật mô tả</p>
                                        <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>2 ngày trước bởi Admin</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
