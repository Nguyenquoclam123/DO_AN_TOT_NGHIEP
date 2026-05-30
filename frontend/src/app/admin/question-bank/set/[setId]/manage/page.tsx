"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Plus,
    ArrowLeft,
    GripVertical,
    Trash2,
    Save,
    Loader2,
    CheckCircle2,
    X,
    ChevronDown,
    Brain,
    Edit3,
    Info,
    AlertCircle
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { questionBankService } from "@/services/question-bank.service";
import { ConfirmModal } from "@/components/shared/ConfirmModal";

export default function AdminManageQuestionsPage() {
    const params = useParams();
    const router = useRouter();
    const [set, setSet] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [setToDeleteInfo, setSetToDeleteInfo] = useState<{ index: number, id: string } | null>(null);

    useEffect(() => {
        fetchData();
    }, [params.setId]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const data = await questionBankService.getSetDetail(params.setId as string);
            setSet(data);
            setQuestions(data.questions || []);
        } catch (error) {
            console.error("Failed to fetch set detail", error);
        } finally {
            setIsLoading(false);
        }
    };

    const onDragEnd = (result: any) => {
        if (!result.destination) return;
        const items = Array.from(questions);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setQuestions(items);
    };

    const handleAddQuestion = (index?: number) => {
        const newQuestion = {
            id: `temp-${Date.now()}`,
            content: "",
            type: "MULTIPLE_CHOICE",
            difficulty: "MEDIUM",
            options: [
                { id: `opt-1-${Date.now()}`, optionText: "", isCorrect: false },
                { id: `opt-2-${Date.now()}`, optionText: "", isCorrect: false }
            ],
            isNew: true
        };
        const newQs = [...questions];
        if (typeof index === 'number') {
            newQs.splice(index + 1, 0, newQuestion);
        } else {
            newQs.push(newQuestion);
        }
        setQuestions(newQs);
    };

    const handleUpdateQuestion = (index: number, data: any) => {
        const newQs = [...questions];
        newQs[index] = { ...newQs[index], ...data };
        setQuestions(newQs);
    };

    const handleRemoveQuestion = async (index: number, id: string) => {
        if (id.startsWith('temp-')) {
            const newQs = [...questions];
            newQs.splice(index, 1);
            setQuestions(newQs);
            return;
        }

        setSetToDeleteInfo({ index, id });
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteQuestion = async () => {
        if (!setToDeleteInfo) return;
        try {
            await questionBankService.deleteQuestion(setToDeleteInfo.id);
            const newQs = [...questions];
            newQs.splice(setToDeleteInfo.index, 1);
            setQuestions(newQs);
            setIsDeleteModalOpen(false);
            setSetToDeleteInfo(null);
        } catch (error) {
            console.error("Failed to delete question", error);
            alert("Không thể xóa câu hỏi này.");
        }
    };

    const handleSaveAll = async () => {
        setIsSaveModalOpen(true);
    };

    const confirmSaveAll = async () => {
        try {
            setIsSaving(true);
            setIsSaveModalOpen(false);
            const setId = params.setId as string;
            
            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                const payload = {
                    content: q.content,
                    type: q.type,
                    difficulty: q.difficulty,
                    options: (q.type === 'MULTIPLE_CHOICE' || q.type === 'CHECKBOX')
                        ? q.options.map((opt: any) => ({
                            optionText: opt.optionText,
                            isCorrect: opt.isCorrect
                        }))
                        : [] 
                };

                if (q.isNew) {
                    await questionBankService.addQuestion(setId, payload);
                } else {
                    await questionBankService.updateQuestion(q.id, payload);
                }
            }

            // Update order
            const updatedSet = await questionBankService.getSetDetail(setId);
            const questionIds = updatedSet.questions.map((q: any) => q.id);
            await questionBankService.reorderQuestions(setId, questionIds);

            router.push(`/admin/question-bank/set/${setId}`);
        } catch (error) {
            console.error("Failed to save all changes", error);
            alert("Có lỗi xảy ra khi lưu thay đổi.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={48} color="#5C9AFF" />
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px 64px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button onClick={() => router.back()} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Quản lý câu hỏi mẫu</h1>
                        <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>{set?.name} • {questions.length} Câu hỏi</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        onClick={() => router.back()} 
                        style={{ backgroundColor: 'white', color: '#475569', padding: '12px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
                    >
                        Hủy bỏ
                    </button>
                    <button 
                        onClick={handleSaveAll}
                        disabled={isSaving}
                        style={{ backgroundColor: '#5C9AFF', color: 'white', padding: '12px 32px', borderRadius: '12px', border: 'none', fontWeight: 800, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 8px 16px -4px rgba(92, 154, 255, 0.3)', opacity: isSaving ? 0.7 : 1 }}
                    >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Lưu tất cả thay đổi
                    </button>
                </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="questions">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {questions.map((q, index) => (
                                <Draggable key={q.id} draggableId={q.id} index={index}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            style={{
                                                ...provided.draggableProps.style,
                                                position: 'relative'
                                            }}
                                        >
                                            <div style={{ backgroundColor: 'white', borderRadius: '24px', border: q.isNew ? '2px dashed #5C9AFF' : '1px solid #f1f5f9', padding: '24px', display: 'flex', gap: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                                {/* Drag Handle */}
                                                <div {...provided.dragHandleProps} style={{ color: '#cbd5e1', cursor: 'grab', display: 'flex', alignItems: 'center' }}>
                                                    <GripVertical size={24} />
                                                </div>

                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                                                        <div style={{ backgroundColor: '#f1f5f9', color: '#64748b', width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px', flexShrink: 0 }}>
                                                            {index + 1}
                                                        </div>
                                                        <textarea
                                                            placeholder="Nhập nội dung câu hỏi..."
                                                            value={q.content}
                                                            onChange={(e) => handleUpdateQuestion(index, { content: e.target.value })}
                                                            style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: '16px', fontWeight: 700, color: '#1e293b', resize: 'none', padding: 0, minHeight: '24px' }}
                                                        />
                                                        <button 
                                                            onClick={() => handleRemoveQuestion(index, q.id)}
                                                            style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6, height: 'fit-content' }}
                                                        >
                                                            <Trash2 size={20} />
                                                        </button>
                                                    </div>

                                                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '24px' }}>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                            {[
                                                                { id: 'MULTIPLE_CHOICE', label: 'RADIO' },
                                                                { id: 'CHECKBOX', label: 'CHECKBOX' },
                                                                { id: 'ESSAY', label: 'TEXT' },
                                                                { id: 'DATE', label: 'DATE' },
                                                                { id: 'DATETIME', label: 'DATE-TIME' }
                                                            ].map(t => (
                                                                <button
                                                                    key={t.id}
                                                                    onClick={() => handleUpdateQuestion(index, { type: t.id })}
                                                                    style={{ 
                                                                        padding: '6px 12px', 
                                                                        borderRadius: '8px', 
                                                                        border: 'none', 
                                                                        fontSize: '10px', 
                                                                        fontWeight: 800, 
                                                                        cursor: 'pointer', 
                                                                        backgroundColor: q.type === t.id ? '#eff6ff' : '#f8fafc', 
                                                                        color: q.type === t.id ? '#5C9AFF' : '#94a3b8',
                                                                        transition: 'all 0.2s'
                                                                    }}
                                                                >
                                                                    {t.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            {['EASY', 'MEDIUM', 'HARD'].map(diff => (
                                                                <button
                                                                    key={diff}
                                                                    onClick={() => handleUpdateQuestion(index, { difficulty: diff })}
                                                                    style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', fontSize: '11px', fontWeight: 800, cursor: 'pointer', backgroundColor: q.difficulty === diff ? '#fefce8' : '#f8fafc', color: q.difficulty === diff ? '#a16207' : '#94a3b8' }}
                                                                >
                                                                    {diff}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {(q.type === 'MULTIPLE_CHOICE' || q.type === 'CHECKBOX') && (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                            {q.options?.map((opt: any, optIdx: number) => (
                                                                <div key={opt.id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                                    <div 
                                                                        onClick={() => {
                                                                            const newOpts = [...q.options];
                                                                            newOpts[optIdx].isCorrect = !newOpts[optIdx].isCorrect;
                                                                            handleUpdateQuestion(index, { options: newOpts });
                                                                        }}
                                                                        style={{ width: '20px', height: '20px', borderRadius: '6px', border: `2px solid ${opt.isCorrect ? '#10b981' : '#cbd5e1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: opt.isCorrect ? '#ecfdf5' : 'transparent', flexShrink: 0 }}
                                                                    >
                                                                        {opt.isCorrect && <CheckCircle2 size={14} color="#10b981" />}
                                                                    </div>
                                                                    <input
                                                                        placeholder="Nhập lựa chọn..."
                                                                        value={opt.optionText}
                                                                        onChange={(e) => {
                                                                            const newOpts = [...q.options];
                                                                            newOpts[optIdx].optionText = e.target.value;
                                                                            handleUpdateQuestion(index, { options: newOpts });
                                                                        }}
                                                                        style={{ flex: 1, border: 'none', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
                                                                    />
                                                                    <button 
                                                                        onClick={() => {
                                                                            const newOpts = [...q.options];
                                                                            newOpts.splice(optIdx, 1);
                                                                            handleUpdateQuestion(index, { options: newOpts });
                                                                        }}
                                                                        style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}
                                                                    >
                                                                        <X size={16} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            <button 
                                                                onClick={() => {
                                                                    const newOpts = [...(q.options || [])];
                                                                    newOpts.push({ id: `opt-${Date.now()}`, optionText: "", isCorrect: false });
                                                                    handleUpdateQuestion(index, { options: newOpts });
                                                                }}
                                                                style={{ border: 'none', background: 'none', color: '#5C9AFF', fontSize: '11px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content', marginTop: '4px' }}
                                                            >
                                                                <Plus size={14} /> Thêm lựa chọn
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Add Button Between Rows */}
                                            <div style={{ height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                                <button
                                                    onClick={() => handleAddQuestion(index)}
                                                    className="add-between-btn"
                                                    style={{
                                                        width: '28px',
                                                        height: '28px',
                                                        borderRadius: '50%',
                                                        backgroundColor: '#5C9AFF',
                                                        color: 'white',
                                                        border: '4px solid #f8fafc',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        opacity: 0,
                                                        transition: 'opacity 0.2s',
                                                        position: 'absolute',
                                                        zIndex: 10
                                                    }}
                                                >
                                                    <Plus size={16} />
                                                </button>
                                                <div style={{ width: '100%', height: '1px', backgroundColor: '#e2e8f0', opacity: 0 }} className="add-between-line"></div>
                                            </div>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            <button
                onClick={() => handleAddQuestion()}
                style={{ width: '100%', padding: '32px', borderRadius: '24px', border: '2px dashed #cbd5e1', backgroundColor: 'transparent', color: '#64748b', fontWeight: 700, fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '20px' }}
            >
                <Plus size={24} /> Thêm câu hỏi vào cuối danh sách
            </button>

            <style jsx global>{`
                .add-between-btn:hover {
                    opacity: 1 !important;
                }
                .add-between-btn:hover + .add-between-line {
                    opacity: 1 !important;
                }
                div[draggable]:hover .add-between-btn {
                    opacity: 0.3;
                }
            `}</style>

            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                title="Xóa câu hỏi"
                message="Bạn có chắc chắn muốn xóa câu hỏi này khỏi bộ đề mẫu?"
                onConfirm={confirmDeleteQuestion}
                onCancel={() => {
                    setIsDeleteModalOpen(false);
                    setSetToDeleteInfo(null);
                }}
                type="danger"
                confirmText="Xóa ngay"
                cancelText="Hủy bỏ"
            />

            <ConfirmModal 
                isOpen={isSaveModalOpen}
                title="Lưu thay đổi"
                message="Bạn có chắc chắn muốn lưu lại toàn bộ các thay đổi vừa thực hiện cho bộ câu hỏi này?"
                onConfirm={confirmSaveAll}
                onCancel={() => setIsSaveModalOpen(false)}
                type="info"
                confirmText="Lưu ngay"
                cancelText="Xem lại"
            />
        </div>
    );
}
