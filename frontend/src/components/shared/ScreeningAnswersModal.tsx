import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, AlertCircle, HelpCircle } from 'lucide-react';

interface ScreeningAnswersModalProps {
    isOpen: boolean;
    onClose: () => void;
    answers: any[];
}

export const ScreeningAnswersModal: React.FC<ScreeningAnswersModalProps> = ({ isOpen, onClose, answers }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000,
                    backdropFilter: 'blur(12px)',
                    padding: '20px'
                }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        style={{
                            backgroundColor: 'white',
                            width: '100%',
                            maxWidth: '700px',
                            maxHeight: '80vh',
                            borderRadius: '32px',
                            overflow: 'hidden',
                            position: 'relative',
                            boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.3)',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                        
                        {/* Header */}
                        <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '40px', height: '40px', backgroundColor: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <HelpCircle size={20} color="#5C9AFF" />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Câu hỏi sàng lọc</h2>
                                    <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Câu trả lời của bạn cho nhà tuyển dụng</p>
                                </div>
                            </div>
                            <button 
                                onClick={onClose}
                                style={{ padding: '8px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '10px', cursor: 'pointer', color: '#64748b' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
                            {answers && answers.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    {answers.map((answer, idx) => (
                                        <div key={answer.id}>
                                            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                                                <span style={{ 
                                                    width: '24px', 
                                                    height: '24px', 
                                                    backgroundColor: '#0f172a', 
                                                    color: 'white', 
                                                    borderRadius: '50%', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center',
                                                    fontSize: '12px',
                                                    fontWeight: 800,
                                                    flexShrink: 0
                                                }}>{idx + 1}</span>
                                                <p style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: 0, lineHeight: 1.5 }}>
                                                    {answer.question?.content || `Câu hỏi: ${answer.questionId?.substring(0, 8)}...`}
                                                </p>
                                            </div>
                                            <div style={{ marginLeft: '36px', backgroundColor: '#f8fafc', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                                                <div style={{ fontSize: '14px', color: '#475569', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
                                                    {answer.textAnswer ? (
                                                        <div style={{ whiteSpace: 'pre-wrap' }}>{answer.textAnswer}</div>
                                                    ) : (
                                                        (() => {
                                                            const sId = answer.selectedOptionId || answer.selected_option_id;
                                                            const sIds = answer.selectedOptionIds || answer.selected_option_ids;
                                                            const rawSelectedIds = sIds || (sId ? [sId] : []);
                                                            const selectedIds = (Array.isArray(rawSelectedIds) ? rawSelectedIds : (typeof rawSelectedIds === 'string' ? rawSelectedIds.split(',') : [])).map(id => id?.toString());

                                                            const options = answer.question?.options || [];

                                                            if (options.length > 0) {
                                                                return (
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                                        {options.map((opt: any) => {
                                                                            const isSelected = selectedIds.includes(opt.id?.toString());
                                                                            return (
                                                                                <div 
                                                                                    key={opt.id} 
                                                                                    style={{ 
                                                                                        display: 'flex', 
                                                                                        alignItems: 'center', 
                                                                                        gap: '12px',
                                                                                        padding: '10px 16px',
                                                                                        backgroundColor: isSelected ? '#eff6ff' : 'white',
                                                                                        borderRadius: '12px',
                                                                                        border: isSelected ? '1.5px solid #5C9AFF' : '1px solid #f1f5f9',
                                                                                        transition: 'all 0.2s'
                                                                                    }}
                                                                                >
                                                                                    <div style={{ 
                                                                                        width: '18px', 
                                                                                        height: '18px', 
                                                                                        borderRadius: answer.question?.type === 'CHECKBOX' ? '4px' : '50%', 
                                                                                        border: isSelected ? 'none' : '2px solid #cbd5e1',
                                                                                        backgroundColor: isSelected ? '#5C9AFF' : 'white',
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        justifyContent: 'center',
                                                                                        flexShrink: 0
                                                                                    }}>
                                                                                        {isSelected && <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'white' }}></div>}
                                                                                    </div>
                                                                                    <span style={{ color: isSelected ? '#1e3a8a' : '#475569', fontWeight: isSelected ? 700 : 500 }}>
                                                                                        {opt.optionText}
                                                                                    </span>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                );
                                                            }
                                                            return "Không tìm thấy dữ liệu lựa chọn.";
                                                        })()
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                                    <AlertCircle size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
                                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#64748b' }}>Job này không có câu hỏi sàng lọc</h3>
                                    <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '8px' }}>Nhà tuyển dụng không yêu cầu trả lời thêm câu hỏi cho vị trí này.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div style={{ padding: '20px 32px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                            <button 
                                onClick={onClose}
                                style={{ padding: '10px 24px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 800, cursor: 'pointer' }}
                            >
                                Đóng
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
