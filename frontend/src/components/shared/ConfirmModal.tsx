"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X, Plus, Check } from "lucide-react";
import { jobFavoriteService, FavoriteCategory } from "@/services/jobFavorite.service";

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: (categoryId?: string) => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'info' | 'success';
    showCategorySelection?: boolean;
    showDateInput?: boolean;
    dateValue?: string;
    onDateChange?: (date: string) => void;
    minDate?: string;
}

export const ConfirmModal = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    type = 'info',
    showCategorySelection = false,
    showDateInput = false,
    dateValue = "",
    onDateChange,
    minDate
}: ConfirmModalProps) => {
    const [categories, setCategories] = React.useState<FavoriteCategory[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = React.useState<string>("");
    const [isCreating, setIsCreating] = React.useState(false);
    const [newCategoryName, setNewCategoryName] = React.useState("");

    React.useEffect(() => {
        if (isOpen && showCategorySelection) {
            fetchCategories();
        }
    }, [isOpen, showCategorySelection]);

    const fetchCategories = async () => {
        try {
            const data = await jobFavoriteService.getCategories();
            setCategories(data);
        } catch (e) {}
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return;
        try {
            const newCat = await jobFavoriteService.createCategory(newCategoryName);
            setCategories([...categories, newCat]);
            setSelectedCategoryId(newCat.id);
            setNewCategoryName("");
            setIsCreating(false);
        } catch (e) {}
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    padding: '20px'
                }}>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCancel}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(15, 23, 42, 0.4)',
                            backdropFilter: 'blur(4px)'
                        }}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        style={{
                            width: '100%',
                            maxWidth: '440px',
                            backgroundColor: 'white',
                            borderRadius: '24px',
                            padding: '32px',
                            position: 'relative',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                            textAlign: 'center',
                            fontFamily: 'Inter, sans-serif'
                        }}
                    >
                        <button
                            onClick={onCancel}
                            style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                background: 'none',
                                border: 'none',
                                color: '#94a3b8',
                                cursor: 'pointer',
                                padding: '4px'
                            }}
                        >
                            <X size={20} />
                        </button>

                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '20px',
                            backgroundColor: type === 'danger' ? '#fff1f2' : '#eff6ff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px',
                            color: type === 'danger' ? '#ef4444' : '#5C9AFF'
                        }}>
                            <AlertCircle size={32} />
                        </div>

                        <h3 style={{
                            fontSize: '20px',
                            fontWeight: 800,
                            color: '#0f172a',
                            marginBottom: '12px',
                            margin: 0
                        }}>
                            {title}
                        </h3>

                        <p style={{
                            fontSize: '15px',
                            color: '#64748b',
                            lineHeight: 1.6,
                            marginTop: '12px',
                            marginBottom: (showCategorySelection || showDateInput) ? '24px' : '32px'
                        }}>
                            {message}
                        </p>

                        {showDateInput && (
                            <div style={{ textAlign: 'left', marginBottom: '32px' }}>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                                    Hạn kết thúc mới
                                </label>
                                <input 
                                    type="date" 
                                    value={dateValue}
                                    onChange={(e) => onDateChange?.(e.target.value)}
                                    min={minDate}
                                    style={{ 
                                        width: '100%', 
                                        padding: '14px 16px', 
                                        borderRadius: '14px', 
                                        border: '1px solid #e2e8f0', 
                                        fontSize: '14px', 
                                        fontWeight: 600, 
                                        outline: 'none',
                                        backgroundColor: '#f8fafc',
                                        color: '#0f172a'
                                    }}
                                />
                            </div>
                        )}

                        {showCategorySelection && (
                            <div style={{ textAlign: 'left', marginBottom: '32px' }}>
                                <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px', display: 'block' }}>
                                    Chọn danh mục lưu trữ (Tùy chọn)
                                </label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        <button
                                            onClick={() => setSelectedCategoryId("")}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: '10px',
                                                border: '1px solid',
                                                borderColor: selectedCategoryId === "" ? '#5C9AFF' : '#e2e8f0',
                                                backgroundColor: selectedCategoryId === "" ? '#eff6ff' : 'white',
                                                color: selectedCategoryId === "" ? '#5C9AFF' : '#64748b',
                                                fontSize: '13px',
                                                fontWeight: 600,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Mặc định
                                        </button>
                                        {categories.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setSelectedCategoryId(cat.id)}
                                                style={{
                                                    padding: '8px 16px',
                                                    borderRadius: '10px',
                                                    border: '1px solid',
                                                    borderColor: selectedCategoryId === cat.id ? '#5C9AFF' : '#e2e8f0',
                                                    backgroundColor: selectedCategoryId === cat.id ? '#eff6ff' : 'white',
                                                    color: selectedCategoryId === cat.id ? '#5C9AFF' : '#64748b',
                                                    fontSize: '13px',
                                                    fontWeight: 600,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                        {!isCreating && (
                                            <button
                                                onClick={() => setIsCreating(true)}
                                                style={{
                                                    padding: '8px 12px',
                                                    borderRadius: '10px',
                                                    border: '1px dashed #cbd5e1',
                                                    backgroundColor: 'transparent',
                                                    color: '#64748b',
                                                    fontSize: '13px',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}
                                            >
                                                <Plus size={14} /> Thêm mới
                                            </button>
                                        )}
                                    </div>

                                    {isCreating && (
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                            <input
                                                autoFocus
                                                type="text"
                                                placeholder="Tên danh mục..."
                                                value={newCategoryName}
                                                onChange={(e) => setNewCategoryName(e.target.value)}
                                                style={{
                                                    flex: 1,
                                                    padding: '8px 12px',
                                                    borderRadius: '10px',
                                                    border: '1px solid #e2e8f0',
                                                    fontSize: '13px',
                                                    outline: 'none'
                                                }}
                                                onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
                                            />
                                            <button
                                                onClick={handleCreateCategory}
                                                style={{
                                                    padding: '8px',
                                                    borderRadius: '10px',
                                                    border: 'none',
                                                    backgroundColor: '#5C9AFF',
                                                    color: 'white',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <Check size={16} />
                                            </button>
                                            <button
                                                onClick={() => setIsCreating(false)}
                                                style={{
                                                    padding: '8px',
                                                    borderRadius: '10px',
                                                    border: 'none',
                                                    backgroundColor: '#f1f5f9',
                                                    color: '#64748b',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={onCancel}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    borderRadius: '14px',
                                    border: '1px solid #e2e8f0',
                                    backgroundColor: 'white',
                                    color: '#475569',
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={async () => {
                                    let finalCategoryId = selectedCategoryId;
                                    
                                    // Auto-create category if user is in creation mode and has typed a name
                                    if (isCreating && newCategoryName.trim()) {
                                        try {
                                            const newCat = await jobFavoriteService.createCategory(newCategoryName);
                                            finalCategoryId = newCat.id;
                                        } catch (e) {
                                            console.error("Failed to auto-create category:", e);
                                        }
                                    }
                                    
                                    onConfirm(finalCategoryId);
                                }}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    borderRadius: '14px',
                                    border: 'none',
                                    backgroundColor: type === 'danger' ? '#ef4444' : '#5C9AFF',
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    boxShadow: type === 'danger' 
                                        ? '0 10px 15px -3px rgba(239, 68, 68, 0.2)' 
                                        : '0 10px 15px -3px rgba(92, 154, 255, 0.25)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
