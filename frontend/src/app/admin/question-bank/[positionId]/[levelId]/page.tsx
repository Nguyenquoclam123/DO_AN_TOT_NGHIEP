"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Plus,
    Search,
    Loader2,
    Database,
    Brain,
    FileText,
    Building2,
    Briefcase,
    Layers,
    Edit3,
    Trash2,
    MoreVertical
} from "lucide-react";
import Link from "next/link";
import { questionBankService } from "@/services/question-bank.service";
import { masterDataService } from "@/services/master-data.service";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2 } from "lucide-react";
import { ConfirmModal } from "@/components/shared/ConfirmModal";

export default function AdminPositionLevelSetsPage() {
    const params = useParams();
    const router = useRouter();
    const [sets, setSets] = useState<any[]>([]);
    const [position, setPosition] = useState<any>(null);
    const [level, setLevel] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingSet, setEditingSet] = useState<any>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [setToDeleteId, setSetToDeleteId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newSet, setNewSet] = useState({ name: '', description: '', category: 'Technical' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [setsData, posData, lvlData] = await Promise.all([
                    questionBankService.getSets({
                        positionId: params.positionId as string,
                        levelId: params.levelId as string
                    }),
                    masterDataService.getPositionById(params.positionId as string),
                    masterDataService.getLevels().then(lvls => lvls.find((l: any) => l.id === params.levelId))
                ]);

                setSets(setsData || []);
                setPosition(posData);
                setLevel(lvlData);
            } catch (error) {
                console.error("Failed to fetch sets for position/level", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [params]);

    const handleCreateSet = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const createdSet = await questionBankService.createSet({
                ...newSet,
                positionId: params.positionId as string,
                levelId: params.levelId as string,
                companyId: null
            });
            
            setIsCreateModalOpen(false);
            setNewSet({ name: '', description: '', category: 'Technical' });
            router.push(`/admin/question-bank/set/${createdSet.id}/manage`);
        } catch (error) {
            console.error("Failed to create set", error);
            alert("Có lỗi xảy ra khi tạo bộ câu hỏi.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteSet = async (id: string) => {
        setSetToDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteSet = async () => {
        if (!setToDeleteId) return;
        try {
            await questionBankService.deleteSet(setToDeleteId);
            setSets(prev => prev.filter(s => s.id !== setToDeleteId));
            setIsDeleteModalOpen(false);
            setSetToDeleteId(null);
        } catch (error) {
            console.error("Failed to delete set", error);
            alert("Không thể xóa bộ câu hỏi này.");
        }
    };

    const handleUpdateSet = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSet) return;
        try {
            setIsSubmitting(true);
            await questionBankService.updateSet(editingSet.id, {
                name: editingSet.name,
                description: editingSet.description,
                category: editingSet.category
            });
            
            // Refresh local state
            setSets(prev => prev.map(s => s.id === editingSet.id ? { ...s, ...editingSet } : s));
            setIsEditModalOpen(false);
            setEditingSet(null);
        } catch (error) {
            console.error("Failed to update set", error);
            alert("Có lỗi xảy ra khi cập nhật bộ câu hỏi.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={48} color="#1e40af" />
            </div>
        );
    }

    return (
        <div style={{ padding: '40px', backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button onClick={() => router.back()} style={{ border: 'none', background: 'white', padding: '12px', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', color: '#64748b' }}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                            {position?.name} - {level?.name}
                        </h1>
                        <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                            Quản lý các bộ câu hỏi mẫu cho vị trí này.
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    style={{ backgroundColor: '#5C9AFF', color: 'white', padding: '12px 24px', borderRadius: '12px', border: 'none', fontWeight: 800, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 15px -3px rgba(92, 154, 255, 0.3)' }}
                >
                    <Plus size={20} /> Tạo bộ đề mới
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
                {sets.map((set) => (
                    <div key={set.id} style={{ 
                        backgroundColor: 'white', 
                        borderRadius: '24px', 
                        border: '1px solid #f1f5f9', 
                        padding: '24px', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
                    }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ width: '48px', height: '48px', backgroundColor: '#eff6ff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e40af' }}>
                                {set.category === 'Logic' ? <Brain size={24} /> : <FileText size={24} />}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{set.name}</h3>
                                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
                                    {set.questions?.length || 0} câu hỏi • {set.category}
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <Link href={`/admin/question-bank/set/${set.id}/manage`}>
                                <button style={{ padding: '10px 16px', borderRadius: '10px', border: 'none', backgroundColor: '#f8fafc', color: '#1e40af', fontWeight: 700, cursor: 'pointer' }}>
                                    Quản lý
                                </button>
                            </Link>
                            <button 
                                onClick={() => {
                                    setEditingSet(set);
                                    setIsEditModalOpen(true);
                                }}
                                style={{ width: '40px', height: '40px', borderRadius: '10px', border: 'none', backgroundColor: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            >
                                <Edit3 size={18} />
                            </button>
                            <button 
                                onClick={() => handleDeleteSet(set.id)}
                                style={{ width: '40px', height: '40px', borderRadius: '10px', border: 'none', backgroundColor: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {sets.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', padding: '64px', textAlign: 'center', border: '2px dashed #e2e8f0', borderRadius: '32px' }}>
                        <p style={{ color: '#94a3b8', fontWeight: 600 }}>Chưa có bộ câu hỏi nào cho tổ hợp này.</p>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            style={{ backgroundColor: 'white', width: '100%', maxWidth: '600px', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
                        >
                            <div style={{ padding: '40px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ width: '48px', height: '48px', backgroundColor: '#eff6ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Plus size={24} color="#5C9AFF" />
                                        </div>
                                        <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', margin: 0 }}>Tạo bộ câu hỏi mẫu</h3>
                                    </div>
                                    <button onClick={() => setIsCreateModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', padding: '8px' }}>
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleCreateSet} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Tên bộ câu hỏi</label>
                                        <input
                                            required
                                            placeholder="VD: Kỹ năng React cơ bản"
                                            value={newSet.name}
                                            onChange={e => setNewSet({ ...newSet, name: e.target.value })}
                                            style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '15px', fontWeight: 600, outline: 'none' }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Mô tả bộ đề mẫu</label>
                                        <textarea
                                            placeholder="Nội dung đánh giá chuẩn hệ thống cho vị trí này..."
                                            value={newSet.description}
                                            onChange={e => setNewSet({ ...newSet, description: e.target.value })}
                                            style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '15px', fontWeight: 600, outline: 'none', minHeight: '100px', resize: 'vertical' }}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                                        <button
                                            type="button"
                                            onClick={() => setIsCreateModalOpen(false)}
                                            style={{ padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#64748b', fontWeight: 800, cursor: 'pointer' }}
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            style={{ padding: '16px', borderRadius: '16px', border: 'none', backgroundColor: '#5C9AFF', color: 'white', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', opacity: isSubmitting ? 0.7 : 1 }}
                                        >
                                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                                            {isSubmitting ? 'Đang xử lý...' : 'Tạo ngay'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Edit Modal */}
            <AnimatePresence>
                {isEditModalOpen && editingSet && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            style={{ backgroundColor: 'white', width: '100%', maxWidth: '500px', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
                        >
                            <div style={{ padding: '40px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                    <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: 0 }}>Chỉnh sửa thông tin mẫu</h3>
                                    <button onClick={() => setIsEditModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', padding: '8px' }}>
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleUpdateSet} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Tên bộ câu hỏi</label>
                                        <input
                                            required
                                            value={editingSet.name}
                                            onChange={e => setEditingSet({ ...editingSet, name: e.target.value })}
                                            style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '15px', fontWeight: 600, outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Danh mục</label>
                                        <select
                                            value={editingSet.category}
                                            onChange={e => setEditingSet({ ...editingSet, category: e.target.value })}
                                            style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '15px', fontWeight: 600, outline: 'none' }}
                                        >
                                            <option value="Technical">Technical</option>
                                            <option value="Logic">Logic & Reasoning</option>
                                            <option value="Behavioral">Behavioral</option>
                                            <option value="Culture">Culture Fit</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Mô tả</label>
                                        <textarea
                                            rows={3}
                                            value={editingSet.description || ''}
                                            onChange={e => setEditingSet({ ...editingSet, description: e.target.value })}
                                            style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '15px', fontWeight: 600, outline: 'none', resize: 'none' }}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '8px' }}>
                                        <button type="button" onClick={() => setIsEditModalOpen(false)} style={{ padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', backgroundColor: 'transparent', fontWeight: 800, color: '#64748b', cursor: 'pointer' }}>Hủy</button>
                                        <button type="submit" disabled={isSubmitting} style={{ padding: '16px', borderRadius: '14px', border: 'none', backgroundColor: '#1e40af', color: 'white', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            {isSubmitting && <Loader2 className="animate-spin" size={18} />}
                                            Cập nhật
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                title="Xác nhận xóa bộ đề"
                message="Bạn có chắc chắn muốn xóa bộ câu hỏi này không? Thao tác này không thể hoàn tác."
                onConfirm={confirmDeleteSet}
                onCancel={() => {
                    setIsDeleteModalOpen(false);
                    setSetToDeleteId(null);
                }}
                type="danger"
                confirmText="Xóa ngay"
                cancelText="Hủy bỏ"
            />
        </div>
    );
}
