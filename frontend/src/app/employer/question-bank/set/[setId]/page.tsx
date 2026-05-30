"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Plus,
    ArrowLeft,
    Loader2,
    Settings2,
    Trash2,
    Edit3,
    FileText,
    Brain,
    HelpCircle,
    Info,
    ChevronDown,
    Search,
    ExternalLink,
    X,
    Check,
    AlertCircle,
    ShieldAlert
} from "lucide-react";
import Link from "next/link";
import { questionBankService } from "@/services/question-bank.service";

export default function QuestionSetDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [set, setSet] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [editingQuestion, setEditingQuestion] = useState<any>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [editData, setEditData] = useState({ name: '', description: '' });

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

    const handleUpdateSet = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsUpdating(true);
            await questionBankService.updateSet(params.setId as string, editData);
            setSet({ ...set, ...editData });
            setIsEditingInfo(false);
        } catch (error) {
            console.error("Failed to update set", error);
            alert("Lỗi khi cập nhật thông tin bộ đề.");
        } finally {
            setIsUpdating(false);
        }
    };

    async function handleDeleteSet() {
        try {
            setIsDeleting(true);
            const posId = set?.positionId;
            const lvlId = set?.levelId;
            
            await questionBankService.deleteSet(params.setId as string);
            
            if (posId && lvlId) {
                router.push(`/employer/question-bank/${posId}/${lvlId}`);
            } else {
                router.push('/employer/question-bank');
            }
        } catch (error) {
            console.error("Failed to delete set", error);
            alert("Không thể xóa bộ câu hỏi. Vui lòng thử lại.");
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    }

    async function handleUpdateQuestion() {
        if (!editingQuestion) return;
        try {
            setIsUpdating(true);
            await questionBankService.updateQuestion(editingQuestion.id, {
                content: editingQuestion.content,
                type: editingQuestion.type,
                difficulty: editingQuestion.difficulty,
                options: editingQuestion.options
            });
            setEditingQuestion(null);
            fetchData();
        } catch (error) {
            console.error("Failed to update question", error);
            alert("Failed to update question. Please try again.");
        } finally {
            setIsUpdating(false);
        }
    }

    async function handleDeleteQuestion() {
        if (!questionToDelete) return;
        try {
            setIsDeleting(true);
            await questionBankService.deleteQuestion(questionToDelete);
            fetchData();
        } catch (error) {
            console.error("Failed to delete question", error);
            alert("Không thể xóa câu hỏi.");
        } finally {
            setIsDeleting(false);
            setQuestionToDelete(null);
        }
    }

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
                <Link href="/employer/question-bank" style={{ color: '#94a3b8', textDecoration: 'none' }}>Question Bank</Link>
                <span>›</span>
                <span style={{ color: '#1e293b' }}>{set?.position?.name} - {set?.level?.name}</span>
            </div>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{set?.name}</h1>
                        {set?.companyId && (
                            <button 
                                onClick={() => {
                                    setEditData({ name: set.name, description: set.description || "" });
                                    setIsEditingInfo(true);
                                }}
                                style={{ border: 'none', background: '#f1f5f9', padding: '8px', borderRadius: '10px', cursor: 'pointer', color: '#64748b' }}
                            >
                                <Edit3 size={18} />
                            </button>
                        )}
                    </div>
                    <p style={{ color: '#64748b', marginTop: '12px', fontSize: '16px', maxWidth: '800px', lineHeight: 1.6 }}>
                        {set?.description || "A foundational assessment set designed to evaluate core competencies, critical thinking, and technical literacy for entry-level candidates."}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {set?.companyId && (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            style={{ backgroundColor: 'white', color: '#ef4444', padding: '14px 24px', borderRadius: '12px', border: '1px solid #fee2e2', fontWeight: 800, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                        >
                            <Trash2 size={20} /> Xóa bộ câu hỏi
                        </button>
                    )}
                    <button
                        onClick={() => {
                            const hasQuestions = set?.questions?.length > 0;
                            router.push(`/employer/question-bank/set/${params.setId}/${hasQuestions ? 'manage' : 'add'}`);
                        }}
                        style={{ backgroundColor: '#1e40af', color: 'white', padding: '14px 28px', borderRadius: '12px', border: 'none', fontWeight: 800, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', boxShadow: '0 8px 16px -4px rgba(30, 64, 175, 0.2)' }}
                    >
                        {set?.questions?.length > 0 ? (
                            <>
                                <Settings2 size={20} /> Quản lý câu hỏi
                            </>
                        ) : (
                            <>
                                <Plus size={20} /> Thêm câu hỏi
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Stats Bar */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '48px' }}>
                {[
                    { label: "Total Questions", value: set?.questions?.length || 0, color: '#eff6ff', iconColor: '#5C9AFF' },
                    { label: "Avg. Difficulty", value: "Medium", color: '#fff7ed', iconColor: '#f97316' },
                    { label: "Est. Duration", value: "45 min", color: '#f0fdf4', iconColor: '#22c55e' },
                    { label: "Usage Count", value: "112", color: '#f8fafc', iconColor: '#64748b' }
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
                            <th style={{ padding: '20px 32px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Question Text</th>
                            <th style={{ padding: '20px 32px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Type</th>
                            <th style={{ padding: '20px 32px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Difficulty</th>
                        </tr>
                    </thead>
                    <tbody>
                        {set?.questions?.map((q: any, idx: number) => (
                            <tr key={q.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                <td style={{ padding: '32px' }}>
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <span style={{ fontSize: '18px', fontWeight: 800, color: '#cbd5e1', marginTop: '-2px' }}>{String(idx + 1).padStart(2, '0')}</span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>{q.content}</p>
                                                {set?.companyId && (
                                                    <button 
                                                        onClick={() => setQuestionToDelete(q.id)}
                                                        style={{ border: 'none', background: 'none', color: '#cbd5e1', cursor: 'pointer', padding: '4px' }}
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                )}
                                            </div>
                                            
                                            {/* Render Options if available */}
                                            {(q.type === 'MULTIPLE_CHOICE' || q.type === 'CHECKBOX') && q.options && q.options.length > 0 && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '12px', borderLeft: '2px solid #f1f5f9' }}>
                                                    {q.options.map((opt: any) => (
                                                        <div key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div style={{ 
                                                                width: '14px', 
                                                                height: '14px', 
                                                                borderRadius: '4px', 
                                                                border: `1.5px solid ${opt.isCorrect ? '#059669' : '#cbd5e1'}`,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                backgroundColor: opt.isCorrect ? '#ecfdf5' : 'transparent'
                                                            }}>
                                                                {opt.isCorrect && <div style={{ width: '6px', height: '6px', borderRadius: '1px', backgroundColor: '#059669' }} />}
                                                            </div>
                                                            <span style={{ fontSize: '13px', color: opt.isCorrect ? '#059669' : '#64748b', fontWeight: opt.isCorrect ? 600 : 400 }}>
                                                                {opt.optionText}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '32px' }}>
                                    <span style={{ 
                                        fontSize: '9px', 
                                        fontWeight: 900, 
                                        color: q.type === 'MULTIPLE_CHOICE' || q.type === 'CHECKBOX' ? '#1e40af' : '#475569', 
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
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: q.difficulty === 'HARD' ? '#ef4444' : q.difficulty === 'MEDIUM' ? '#f59e0b' : '#22c55e' }}></div>
                                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>{q.difficulty}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Delete Set Confirmation Modal */}
            {showDeleteConfirm && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '32px', width: '100%', maxWidth: '480px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)', animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                            <div style={{ width: '64px', height: '64px', backgroundColor: '#fef2f2', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ShieldAlert size={32} color="#ef4444" />
                            </div>
                            <button onClick={() => setShowDeleteConfirm(false)} style={{ padding: '8px', cursor: 'pointer', backgroundColor: '#f8fafc', border: 'none', borderRadius: '12px', color: '#94a3b8' }}><X size={20} /></button>
                        </div>
                        <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>Xóa bộ câu hỏi?</h3>
                        <p style={{ color: '#64748b', fontSize: '16px', lineHeight: 1.6, marginBottom: '40px' }}>
                            Bạn có chắc chắn muốn xóa bộ câu hỏi <strong>"{set?.name}"</strong>? 
                            Hành động này sẽ xóa tất cả câu hỏi liên quan và không thể hoàn tác.
                        </p>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting} style={{ flex: 1, padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', backgroundColor: 'transparent', fontWeight: 800, cursor: 'pointer' }}>Hủy</button>
                            <button
                                onClick={handleDeleteSet}
                                disabled={isDeleting}
                                style={{ flex: 1, padding: '16px', borderRadius: '16px', border: 'none', backgroundColor: '#ef4444', color: 'white', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.3)' }}
                            >
                                {isDeleting && <Loader2 size={18} className="animate-spin" />}
                                Xác nhận xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Question Confirmation Modal */}
            {questionToDelete && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '32px', width: '100%', maxWidth: '480px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)', animation: 'modalSlideUp 0.4s' }}>
                        <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>Xóa câu hỏi?</h3>
                        <p style={{ color: '#64748b', fontSize: '16px', lineHeight: 1.6, marginBottom: '40px' }}>
                            Hành động này sẽ xóa vĩnh viễn câu hỏi này khỏi bộ. Bạn có chắc chắn muốn tiếp tục?
                        </p>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button onClick={() => setQuestionToDelete(null)} disabled={isDeleting} style={{ flex: 1, padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', backgroundColor: 'transparent', fontWeight: 800, cursor: 'pointer' }}>Hủy</button>
                            <button
                                onClick={handleDeleteQuestion}
                                disabled={isDeleting}
                                style={{ flex: 1, padding: '16px', borderRadius: '16px', border: 'none', backgroundColor: '#ef4444', color: 'white', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                {isDeleting && <Loader2 size={18} className="animate-spin" />}
                                Xác nhận xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Info Modal */}
            {isEditingInfo && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '32px', width: '100%', maxWidth: '520px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)', animation: 'modalSlideUp 0.4s' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Chỉnh sửa thông tin</h3>
                            <button onClick={() => setIsEditingInfo(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={24} /></button>
                        </div>

                        <form onSubmit={handleUpdateSet} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Tên bộ câu hỏi</label>
                                <input
                                    required
                                    value={editData.name}
                                    onChange={e => setEditData({ ...editData, name: e.target.value })}
                                    style={{ width: '100%', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '15px', fontWeight: 600, outline: 'none' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Mô tả</label>
                                <textarea
                                    rows={4}
                                    value={editData.description}
                                    onChange={e => setEditData({ ...editData, description: e.target.value })}
                                    style={{ width: '100%', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '15px', fontWeight: 600, outline: 'none', resize: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                                <button type="button" onClick={() => setIsEditingInfo(false)} style={{ flex: 1, padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', backgroundColor: 'transparent', fontWeight: 800, color: '#64748b', cursor: 'pointer' }}>Hủy</button>
                                <button type="submit" disabled={isUpdating} style={{ flex: 1, padding: '16px', borderRadius: '16px', border: 'none', backgroundColor: '#1e40af', color: 'white', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    {isUpdating && <Loader2 size={18} className="animate-spin" />}
                                    Lưu thay đổi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes modalSlideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
