"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Plus,
    ArrowLeft,
    Loader2,
    Settings2,
    FileText,
    Brain,
    Info,
    ChevronDown,
    Search,
    X,
    Check,
    AlertCircle
} from "lucide-react";
import Link from "next/link";
import { questionBankService } from "@/services/question-bank.service";

export default function AdminQuestionSetDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [set, setSet] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const data = await questionBankService.getSetDetail(params.setId as string);
            setSet(data);
        } catch (error) {
            console.error("Failed to fetch set detail", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [params]);

    if (isLoading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={48} color="#5C9AFF" />
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#fcfcfc', minHeight: '100vh', padding: '32px 64px' }}>
            {/* Breadcrumbs */}
            <div style={{ display: 'flex', gap: '8px', color: '#94a3b8', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px' }}>
                <Link href="/admin/question-bank" style={{ color: '#94a3b8', textDecoration: 'none' }}>Ngân hàng hệ thống</Link>
                <span>›</span>
                <span style={{ color: '#1e293b' }}>{set?.position?.name} - {set?.level?.name}</span>
            </div>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{set?.name}</h1>
                    <p style={{ color: '#64748b', marginTop: '12px', fontSize: '16px', maxWidth: '800px', lineHeight: 1.6 }}>
                        {set?.description || "Bộ câu hỏi chuẩn hóa dành cho việc đánh giá năng lực ứng viên trên hệ thống."}
                    </p>
                </div>
                <button
                    onClick={() => {
                        router.push(`/admin/question-bank/set/${params.setId}/manage`);
                    }}
                    style={{ backgroundColor: '#5C9AFF', color: 'white', padding: '14px 28px', borderRadius: '12px', border: 'none', fontWeight: 800, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', boxShadow: '0 8px 16px -4px rgba(92, 154, 255, 0.3)' }}
                >
                    <Settings2 size={20} /> Quản lý câu hỏi
                </button>
            </div>

            {/* Stats Bar */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '48px' }}>
                {[
                    { label: "Tổng số câu hỏi", value: set?.questions?.length || 0, color: '#eff6ff', iconColor: '#5C9AFF' },
                    { label: "Độ khó TB", value: "Medium", color: '#fff7ed', iconColor: '#f97316' },
                    { label: "Thời gian ước tính", value: "45 phút", color: '#f0fdf4', iconColor: '#22c55e' },
                    { label: "Lượt sử dụng", value: "2.4k", color: '#f8fafc', iconColor: '#64748b' }
                ].map((stat, i) => (
                    <div key={i} style={{ flex: 1, backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                        <p style={{ margin: 0, fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px' }}>{stat.label}</p>
                        <p style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: stat.iconColor === '#5C9AFF' ? '#1e293b' : stat.iconColor }}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Questions List */}
            <div style={{ backgroundColor: 'white', border: '1px solid #f1f5f9', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                        <tr>
                            <th style={{ padding: '20px 32px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Nội dung câu hỏi</th>
                            <th style={{ padding: '20px 32px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Loại</th>
                            <th style={{ padding: '20px 32px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Độ khó</th>
                        </tr>
                    </thead>
                    <tbody>
                        {set?.questions?.map((q: any, idx: number) => (
                            <tr key={q.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                <td style={{ padding: '32px' }}>
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <span style={{ fontSize: '18px', fontWeight: 800, color: '#cbd5e1', marginTop: '-2px' }}>{String(idx + 1).padStart(2, '0')}</span>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>{q.content}</p>
                                            
                                            {/* Render Options */}
                                            {(q.type === 'MULTIPLE_CHOICE' || q.type === 'CHECKBOX') && q.options && q.options.length > 0 && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '12px', borderLeft: '2px solid #f1f5f9' }}>
                                                    {q.options.map((opt: any) => (
                                                        <div key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div style={{ 
                                                                width: '14px', 
                                                                height: '14px', 
                                                                borderRadius: '4px', 
                                                                border: `1.5px solid ${opt.isCorrect ? '#10b981' : '#cbd5e1'}`,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                backgroundColor: opt.isCorrect ? '#ecfdf5' : 'transparent'
                                                            }}>
                                                                {opt.isCorrect && <div style={{ width: '6px', height: '6px', borderRadius: '1px', backgroundColor: '#10b981' }} />}
                                                            </div>
                                                            <span style={{ fontSize: '13px', color: opt.isCorrect ? '#065f46' : '#64748b', fontWeight: opt.isCorrect ? 600 : 400 }}>
                                                                {opt.optionText}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            {q.type === 'ESSAY' && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
                                                    <FileText size={14} />
                                                    <span style={{ fontSize: '12px', fontStyle: 'italic' }}>Câu hỏi tự luận (Essay)</span>
                                                </div>
                                            )}

                                            {(q.type === 'DATE' || q.type === 'DATETIME') && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#5C9AFF', backgroundColor: '#eff6ff', padding: '8px 12px', borderRadius: '8px', width: 'fit-content' }}>
                                                    <Plus size={14} />
                                                    <span style={{ fontSize: '12px', fontWeight: 700 }}>{q.type === 'DATE' ? 'Chọn ngày' : 'Chọn ngày & giờ'}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '32px' }}>
                                    <span style={{ 
                                        fontSize: '9px', 
                                        fontWeight: 900, 
                                        color: q.type === 'MULTIPLE_CHOICE' || q.type === 'CHECKBOX' ? '#5C9AFF' : '#475569', 
                                        backgroundColor: q.type === 'MULTIPLE_CHOICE' || q.type === 'CHECKBOX' ? '#eff6ff' : '#f1f5f9', 
                                        padding: '4px 8px', 
                                        borderRadius: '6px',
                                        textTransform: 'uppercase'
                                    }}>
                                        {q.type.replace('_', ' ')}
                                    </span>
                                </td>
                                <td style={{ padding: '32px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: q.difficulty === 'HARD' ? '#ef4444' : q.difficulty === 'MEDIUM' ? '#f59e0b' : '#10b981' }}></div>
                                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>{q.difficulty}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!set?.questions || set.questions.length === 0) && (
                    <div style={{ padding: '64px', textAlign: 'center', color: '#94a3b8' }}>
                        <Info style={{ margin: '0 auto 16px' }} />
                        <p>Chưa có câu hỏi nào trong bộ đề này.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
