"use client";

import React, { useState, useEffect } from "react";
import {
    X,
    CheckCircle2,
    AlertTriangle,
    MessageSquare,
    ArrowRight,
    Archive,
    Calendar,
    Zap,
    Download,
    Mail,
    Phone,
    BrainCircuit,
    BarChart3,
    Clock,
    User,
    FileText,
    MapPin,
    Briefcase,
    GraduationCap,
    Award,
    Loader2,
    Layers,
    Eye,
    Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { applicationService } from "@/services/application.service";
import { cvService } from "@/services/cv.service";

interface CandidateInsightDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    application: any;
    job?: any;
}

export default function CandidateInsightDrawer({ isOpen, onClose, application, job }: CandidateInsightDrawerProps) {
    const [activeTab, setActiveTab] = useState<"AI" | "CV" | "ANSWERS" | "TIMELINE">("AI");
    const [fullApplication, setFullApplication] = useState<any>(null);
    const [cvData, setCvData] = useState<any>(null);
    const [isLoadingCv, setIsLoadingCv] = useState(false);
    const [aiFeedback, setAiFeedback] = useState<string>("");
    const [aiComment, setAiComment] = useState<string>("");
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

    useEffect(() => {
        if (isOpen && application?.id) {
            fetchFullApplication();
        } else {
            setFullApplication(null);
        }
    }, [isOpen, application?.id]);

    const fetchFullApplication = async () => {
        try {
            const data = await applicationService.getById(application.id);
            setFullApplication(data);
            
            if (data.aiFeedback) setAiFeedback(data.aiFeedback);
            if (data.aiComment) setAiComment(data.aiComment);
        } catch (error) {
            console.error("Failed to fetch full application:", error);
            setFullApplication(application); // Fallback
        }
    };

    useEffect(() => {
        if (isOpen && (fullApplication || application)) {
            fetchCvData();
        }
    }, [isOpen, fullApplication, application]);

    const fetchCvData = async () => {
        // Priority 1: Use the snapshot from the full application object (most reliable)
        const app = fullApplication || application;
        const snapshot = app?.cvSnapshot || app?.cv;
        
        if (snapshot && (snapshot.experiences || snapshot.skills || snapshot.cvTitle)) {
            setCvData(snapshot);
            return;
        }

        // Priority 2: Fallback to live data for legacy applications if snapshot still missing
        try {
            setIsLoadingCv(true);
            const data = await cvService.getByCandidate(app.candidateId);
            const targetCv = Array.isArray(data)
                ? (data.find((c: any) => c.id === app.cvId) || data[0])
                : data;
            setCvData(targetCv);
        } catch (error) {
            console.error("Failed to fetch CV data:", error);
        } finally {
            setIsLoadingCv(false);
        }
    };

    const handleSubmitFeedback = async () => {
        if (!application?.id || !aiFeedback) return;
        
        try {
            setIsSubmittingFeedback(true);
            await applicationService.submitFeedback(application.id, aiFeedback, aiComment);
            alert("Cảm ơn bạn đã đóng góp ý kiến! Phản hồi này sẽ giúp AI học hỏi và cải thiện độ chính xác.");
        } catch (error) {
            console.error("Failed to submit AI feedback:", error);
            alert("Không thể gửi phản hồi. Vui lòng thử lại sau.");
        } finally {
            setIsSubmittingFeedback(false);
        }
    };

    if (!application && isOpen) return null;

    const appData = fullApplication || application;
    const candidate = appData?.candidate || {};
    const aiReport = appData?.aiReport || null;
    const score = Math.round(appData?.score || 0);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(15, 23, 42, 0.4)',
                            backdropFilter: 'blur(8px)',
                            zIndex: 9999,
                        }}
                    />

                    {/* Drawer Container */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            right: 0,
                            bottom: 0,
                            width: '750px',
                            backgroundColor: 'white',
                            boxShadow: '-20px 0 50px rgba(0, 0, 0, 0.1)',
                            zIndex: 10000,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '32px',
                            borderBottom: '1px solid #F1F5F9',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: 'white',
                            position: 'sticky',
                            top: 0,
                            zIndex: 10
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <button
                                    onClick={onClose}
                                    style={{
                                        padding: '10px',
                                        borderRadius: '12px',
                                        border: '1px solid #E2E8F0',
                                        backgroundColor: 'white',
                                        color: '#64748B',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <X size={20} />
                                </button>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '16px', overflow: 'hidden', border: '3px solid #F8FAFC' }}>
                                        <img 
                                            src={cvData?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${candidate.email || 'default'}`} 
                                            alt="avatar" 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '0 0 2px' }}>
                                            {cvData?.candidateInfo?.firstName || candidate.firstName} {cvData?.candidateInfo?.lastName || candidate.lastName}
                                        </h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#5C9AFF' }}>
                                                {cvData?.cvTitle || "Hồ sơ ứng tuyển"}
                                            </div>
                                            {(fullApplication?.cvSnapshot || application?.cvSnapshot) && (
                                                <span style={{ fontSize: '10px', fontWeight: 800, color: '#10B981', backgroundColor: '#ECFDF5', padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.05em' }}>SNAPSHOT</span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#64748B', fontSize: '12px', fontWeight: 600 }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Mail size={12} /> {cvData?.candidateInfo?.email || candidate.email}
                                            </span>
                                            {(cvData?.candidateInfo?.phone || candidate.phone || candidate.candidateProfile?.phone) && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Phone size={12} /> {cvData?.candidateInfo?.phone || candidate.phone || candidate.candidateProfile?.phone}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <button 
                                    onClick={async () => {
                                        if (!application?.id) return;
                                        setIsLoadingCv(true);
                                        try {
                                            await applicationService.triggerAI(application.id);
                                            alert("Đã gửi yêu cầu phân tích lại. Vui lòng đóng drawer và mở lại sau vài giây.");
                                        } catch (e) {
                                            alert("Lỗi: " + e);
                                        } finally {
                                            setIsLoadingCv(false);
                                        }
                                    }}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '10px',
                                        border: '1px solid #E2E8F0',
                                        backgroundColor: 'white',
                                        color: '#5C9AFF',
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <Zap size={14} fill="#5C9AFF" /> Refresh AI
                                </button>
                                <div style={{ display: 'flex', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '12px' }}>
                                    <button
                                        onClick={() => setActiveTab("AI")}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            fontSize: '13px',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            backgroundColor: activeTab === "AI" ? 'white' : 'transparent',
                                            color: activeTab === "AI" ? '#5C9AFF' : '#64748B',
                                            boxShadow: activeTab === "AI" ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        AI Insight
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("CV")}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            fontSize: '13px',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            backgroundColor: activeTab === "CV" ? 'white' : 'transparent',
                                            color: activeTab === "CV" ? '#5C9AFF' : '#64748B',
                                            boxShadow: activeTab === "CV" ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Hồ sơ (CV)
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("ANSWERS")}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            fontSize: '13px',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            backgroundColor: activeTab === "ANSWERS" ? 'white' : 'transparent',
                                            color: activeTab === "ANSWERS" ? '#5C9AFF' : '#64748B',
                                            boxShadow: activeTab === "ANSWERS" ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Câu trả lời
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("TIMELINE")}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            fontSize: '13px',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            backgroundColor: activeTab === "TIMELINE" ? 'white' : 'transparent',
                                            color: activeTab === "TIMELINE" ? '#5C9AFF' : '#64748B',
                                            boxShadow: activeTab === "TIMELINE" ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Tiến trình
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
                            {appData.status === 'REJECTED' && (
                                <div style={{ 
                                    marginBottom: '32px', 
                                    padding: '24px', 
                                    backgroundColor: '#FEF2F2', 
                                    borderRadius: '24px', 
                                    border: '1px solid #FEE2E2',
                                    display: 'flex',
                                    gap: '16px'
                                }}>
                                    <div style={{ width: '40px', height: '40px', backgroundColor: '#EF4444', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                                        <X size={20} />
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#991B1B', margin: '0 0 4px' }}>Ứng viên đã bị từ chối</h4>
                                        <p style={{ fontSize: '14px', color: '#B91C1C', margin: '0 0 12px', opacity: 0.8 }}>Lý do từ chối đã được gửi tới ứng viên:</p>
                                        <div style={{ padding: '12px 16px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #FEE2E2', fontSize: '14px', color: '#475569', lineHeight: 1.5 }}>
                                            {appData.rejectionReason || "Chưa cung cấp lý do chi tiết."}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {appData.withdrawStatus === 'PENDING' && (
                                <div style={{ 
                                    marginBottom: '32px', 
                                    padding: '24px', 
                                    backgroundColor: '#FFF7ED', 
                                    borderRadius: '24px', 
                                    border: '1px solid #FFEDD5',
                                    display: 'flex',
                                    gap: '16px'
                                }}>
                                    <div style={{ width: '40px', height: '40px', backgroundColor: '#F97316', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                                        <AlertTriangle size={20} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#9A3412', margin: '0 0 4px' }}>Yêu cầu hủy ứng tuyển</h4>
                                        <p style={{ fontSize: '14px', color: '#C2410C', margin: '0 0 12px', opacity: 0.8 }}>Ứng viên mong muốn rút hồ sơ với lý do:</p>
                                        <div style={{ padding: '12px 16px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #FFEDD5', fontSize: '14px', color: '#475569', lineHeight: 1.5, marginBottom: '16px' }}>
                                            {appData.withdrawReason || "Không có lý do cụ thể."}
                                        </div>
                                        <button
                                            onClick={async () => {
                                                if (!confirm("Bạn có chắc chắn muốn chấp nhận yêu cầu hủy ứng tuyển này? Trạng thái ứng viên sẽ được chuyển sang Rejected.")) return;
                                                try {
                                                    await applicationService.acceptWithdraw(application.id);
                                                    alert("Đã chấp nhận yêu cầu hủy ứng tuyển.");
                                                    onClose();
                                                    window.location.reload(); // Refresh to update pipeline
                                                } catch (e) {
                                                    alert("Lỗi: " + e);
                                                }
                                            }}
                                            style={{
                                                padding: '10px 24px',
                                                backgroundColor: '#F97316',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '12px',
                                                fontSize: '14px',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.2)'
                                            }}
                                        >
                                            Chấp nhận và Hủy đơn
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === "AI" ? (
                                <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                                    {/* Match Score Hero */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '48px',
                                        padding: '32px',
                                        backgroundColor: score > 70 ? '#F0FDF4' : score > 40 ? '#FFFBEB' : '#FEF2F2',
                                        borderRadius: '32px',
                                        border: `1px solid ${score > 70 ? '#DCFCE7' : score > 40 ? '#FEF3C7' : '#FEE2E2'}`
                                    }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: score > 70 ? '#15803D' : score > 40 ? '#B45309' : '#B91C1C', marginBottom: '8px' }}>
                                                <BrainCircuit size={20} />
                                                <span style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI MATCH ANALYSIS</span>
                                            </div>
                                            <h4 style={{ fontSize: '16px', color: '#334155', fontWeight: 600, margin: 0, maxWidth: '400px' }}>
                                                {aiReport?.suitabilityReasoning?.logic || aiReport?.reasoning || "Đang phân tích hồ sơ..."}
                                            </h4>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '48px', fontWeight: 900, color: score > 70 ? '#16A34A' : score > 40 ? '#D97706' : '#DC2626', lineHeight: 1 }}>{score}<span style={{ fontSize: '20px', color: '#94A3B8' }}>/100</span></div>
                                            <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', marginTop: '4px' }}>OVERALL MATCH</div>
                                        </div>
                                    </div>



                                    {!aiReport ? (
                                        <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                                            <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 16px' }} />
                                            <p>Hệ thống AI đang thực hiện phân tích chuyên sâu...</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Strengths & Weaknesses */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '48px' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669' }}>
                                                        <CheckCircle2 size={18} />
                                                        <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>DIỂM MẠNH</span>
                                                    </div>
                                                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                        {aiReport.strengths?.map((s: any, i: number) => (
                                                            <li key={i} style={{ backgroundColor: '#F0FDF4', padding: '16px', borderRadius: '16px', border: '1px solid #DCFCE7' }}>
                                                                <div style={{ fontSize: '14px', fontWeight: 800, color: '#166534', marginBottom: '4px' }}>{s.point}</div>
                                                                <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>{s.detail}</div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D97706' }}>
                                                        <AlertTriangle size={18} />
                                                        <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>HẠN CHẾ</span>
                                                    </div>
                                                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                        {aiReport.weaknesses?.map((w: any, i: number) => (
                                                            <li key={i} style={{ backgroundColor: '#FFFBEB', padding: '16px', borderRadius: '16px', border: '1px solid #FEF3C7' }}>
                                                                <div style={{ fontSize: '14px', fontWeight: 800, color: '#92400E', marginBottom: '4px' }}>{w.point}</div>
                                                                <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>{w.detail}</div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>

                                            {/* Competency Matrix */}
                                            <div style={{ marginBottom: '48px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0F172A', marginBottom: '24px' }}>
                                                    <BarChart3 size={18} />
                                                    <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>MA TRẬN NĂNG LỰC AI</span>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                                    <MatrixBar label="Skills Alignment" percentage={aiReport.dimensionScores?.skillsMatch || 0} color="#5C9AFF" />
                                                    <MatrixBar label="Experience Depth" percentage={aiReport.dimensionScores?.experienceMatch || 0} color="#5C9AFF" />
                                                    <MatrixBar label="Culture & Mindset" percentage={aiReport.dimensionScores?.cultureFit || 0} color="#D97706" />
                                                </div>
                                            </div>

                                            {/* Sugested Interview Questions ⭐ (MỚI) */}
                                            <div style={{ marginBottom: '48px', backgroundColor: '#F8FAFC', padding: '32px', borderRadius: '32px', border: '1px solid #F1F5F9' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', color: '#0F172A' }}>
                                                    <MessageSquare size={18} />
                                                    <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>CÂU HỎI PHỎNG VẤN GỢI Ý</span>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                    {aiReport.interviewQuestions?.map((q: any, i: number) => (
                                                        <div key={i} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                                <span style={{ fontSize: '11px', fontWeight: 800, color: '#5C9AFF' }}>CÂU HỎI {i + 1}</span>
                                                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>{q.difficulty}</span>
                                                            </div>
                                                            <div style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B', marginBottom: '12px', lineHeight: 1.5 }}>{q.question}</div>
                                                            <div style={{ fontSize: '13px', color: '#64748B', backgroundColor: '#F1F5F9', padding: '12px', borderRadius: '12px', fontStyle: 'italic' }}>
                                                                <strong>Gợi ý đáp án:</strong> {q.expectedAnswerInsight}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            {/* Screening Answers Analysis ⭐ (MỚI) */}
                                            {aiReport.answersAnalysis && aiReport.answersAnalysis.length > 0 && (
                                                <div style={{ marginBottom: '48px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', color: '#0F172A' }}>
                                                        <MessageSquare size={18} />
                                                        <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>PHÂN TÍCH CÂU TRẢ LỜI SÀNG LỌC</span>
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                        {aiReport.answersAnalysis.map((a: any, i: number) => (
                                                            <div key={i} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #E2E8F0', borderLeft: `6px solid ${a.score >= 7 ? '#10B981' : a.score >= 4 ? '#F59E0B' : '#EF4444'}` }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#1E293B', maxWidth: '80%' }}>Q: {a.question}</div>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#F8FAFC', padding: '4px 10px', borderRadius: '100px' }}>
                                                                        <span style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A' }}>{a.score}</span>
                                                                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8' }}>/10</span>
                                                                    </div>
                                                                </div>
                                                                <div style={{ fontSize: '14px', color: '#64748B', backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '16px', marginBottom: '12px', border: '1px solid #F1F5F9' }}>
                                                                    <strong>Ứng viên trả lời:</strong> {a.answer}
                                                                </div>
                                                                <div style={{ display: 'flex', gap: '12px' }}>
                                                                    <div style={{ width: '24px', height: '24px', backgroundColor: '#EFF6FF', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5C9AFF', flexShrink: 0 }}>
                                                                        <BrainCircuit size={14} />
                                                                    </div>
                                                                    <div style={{ fontSize: '14px', color: '#0369A1', lineHeight: 1.6, fontWeight: 500, fontStyle: 'italic' }}>
                                                                        {a.analysis}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* AI Performance Evaluation ⭐ (MỚI) */}
                                            <div style={{ marginTop: '64px', paddingTop: '48px', borderTop: '2px dashed #E2E8F0' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0F172A' }}>
                                                        <BarChart3 size={18} />
                                                        <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>ĐÁNH GIÁ HIỆU SUẤT AI</span>
                                                    </div>
                                                    {(appData?.aiFeedback || aiFeedback) && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: '#F0FDF4', borderRadius: '100px', color: '#16A34A', fontSize: '11px', fontWeight: 800 }}>
                                                            <CheckCircle2 size={14} /> ĐÃ ĐÁNH GIÁ
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div style={{ backgroundColor: '#F8FAFC', padding: '32px', borderRadius: '32px', border: '1px solid #F1F5F9' }}>
                                                    <div style={{ marginBottom: '20px' }}>
                                                        <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>Đánh giá cho vị trí:</div>
                                                        <div style={{ fontSize: '16px', color: '#0F172A', fontWeight: 800 }}>{job?.title || "Công việc hiện tại"}</div>
                                                    </div>

                                                    <p style={{ fontSize: '14px', color: '#475569', marginBottom: '24px', fontWeight: 600 }}>Bạn đánh giá độ chính xác của kết quả phân tích AI này như thế nào?</p>
                                                    
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
                                                        {[
                                                            { id: 'ACCURATE', label: 'Chính xác', color: '#16A34A', bg: '#F0FDF4' },
                                                            { id: 'PARTIAL', label: 'Tương đối', color: '#D97706', bg: '#FFFBEB' },
                                                            { id: 'INACCURATE', label: 'Không khớp', color: '#DC2626', bg: '#FEF2F2' }
                                                        ].map(opt => (
                                                            <div 
                                                                key={opt.id}
                                                                onClick={() => setAiFeedback(opt.id)}
                                                                style={{
                                                                    padding: '16px',
                                                                    borderRadius: '16px',
                                                                    border: aiFeedback === opt.id ? `2px solid ${opt.color}` : '1px solid #E2E8F0',
                                                                    backgroundColor: aiFeedback === opt.id ? opt.bg : 'white',
                                                                    cursor: 'pointer',
                                                                    textAlign: 'center',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                            >
                                                                <span style={{ fontSize: '14px', fontWeight: 800, color: aiFeedback === opt.id ? opt.color : '#64748B' }}>{opt.label}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div style={{ marginBottom: '32px' }}>
                                                        <p style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', marginBottom: '12px', textTransform: 'uppercase' }}>Góp ý chi tiết (Nếu có):</p>
                                                        <textarea 
                                                            value={aiComment}
                                                            onChange={(e) => setAiComment(e.target.value)}
                                                            placeholder="Hãy cho AI biết lý do bạn đánh giá như vậy để hệ thống cải thiện..."
                                                            style={{
                                                                width: '100%',
                                                                height: '100px',
                                                                padding: '16px',
                                                                borderRadius: '16px',
                                                                border: '1px solid #E2E8F0',
                                                                backgroundColor: 'white',
                                                                fontSize: '14px',
                                                                color: '#1E293B',
                                                                outline: 'none',
                                                                resize: 'none',
                                                                transition: 'border 0.2s'
                                                            }}
                                                        />
                                                    </div>

                                                    <button
                                                        onClick={handleSubmitFeedback}
                                                        disabled={!aiFeedback || isSubmittingFeedback}
                                                        style={{
                                                            width: '100%',
                                                            padding: '16px',
                                                            backgroundColor: '#0F172A',
                                                            color: 'white',
                                                            borderRadius: '16px',
                                                            border: 'none',
                                                            fontSize: '14px',
                                                            fontWeight: 800,
                                                            cursor: (!aiFeedback || isSubmittingFeedback) ? 'not-allowed' : 'pointer',
                                                            opacity: (!aiFeedback || isSubmittingFeedback) ? 0.7 : 1,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '10px'
                                                        }}
                                                    >
                                                        {isSubmittingFeedback ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                                        Lưu đánh giá hiệu suất
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : activeTab === "CV" ? (
                                <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                                    {isLoadingCv ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', color: '#94A3B8' }}>
                                            <Loader2 size={40} className="animate-spin" />
                                            <p style={{ marginTop: '16px', fontWeight: 600 }}>Đang tải hồ sơ gốc...</p>
                                        </div>
                                    ) : cvData ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                                            {/* Summary Section */}
                                            <div style={{ borderLeft: '4px solid #5C9AFF', paddingLeft: '24px', marginBottom: '20px' }}>
                                                <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '12px' }}>Tóm tắt chuyên môn</h4>
                                                <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.7, margin: 0 }}>
                                                    {cvData.summary || "Ứng viên chưa cung cấp tóm tắt chuyên môn."}
                                                </p>
                                            </div>

                                            {/* Experience Section */}
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', color: '#0F172A' }}>
                                                    <div style={{ width: '32px', height: '32px', backgroundColor: '#F1F5F9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Briefcase size={16} />
                                                    </div>
                                                    <h4 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Kinh nghiệm làm việc</h4>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingLeft: '16px', position: 'relative' }}>
                                                    <div style={{ position: 'absolute', left: '31px', top: '10px', bottom: '10px', width: '2px', backgroundColor: '#F1F5F9' }} />
                                                    {cvData.experiences?.length > 0 ? cvData.experiences.map((exp: any, i: number) => (
                                                        <div key={i} style={{ position: 'relative', paddingLeft: '40px' }}>
                                                            <div style={{ position: 'absolute', left: '-5px', top: '5px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'white', border: '3px solid #5C9AFF', zIndex: 1 }} />
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                                <h5 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>{exp.position}</h5>
                                                                <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', backgroundColor: '#F8FAFC', padding: '4px 10px', borderRadius: '6px' }}>
                                                                    {exp.startDate ? new Date(exp.startDate).getFullYear() : 'N/A'} — {exp.isCurrent ? 'Hiện tại' : (exp.endDate ? new Date(exp.endDate).getFullYear() : 'N/A')}
                                                                </span>
                                                            </div>
                                                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#5C9AFF', marginBottom: '8px' }}>{exp.companyName}</div>
                                                            <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6, margin: 0 }}>{exp.description}</p>
                                                        </div>
                                                    )) : <p style={{ color: '#94A3B8', fontSize: '14px' }}>Không có dữ liệu kinh nghiệm.</p>}
                                                </div>
                                            </div>

                                            {/* Education Section */}
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', color: '#0F172A' }}>
                                                    <div style={{ width: '32px', height: '32px', backgroundColor: '#F1F5F9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <GraduationCap size={18} />
                                                    </div>
                                                    <h4 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Học vấn</h4>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                                    {cvData.educations?.length > 0 ? cvData.educations.map((edu: any, i: number) => (
                                                        <div key={i} style={{ padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #F1F5F9' }}>
                                                            <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>{edu.degree} - {edu.major}</div>
                                                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#5C9AFF', marginBottom: '4px' }}>{edu.schoolName}</div>
                                                            <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>Tốt nghiệp: {edu.endDate ? new Date(edu.endDate).getFullYear() : 'N/A'}</div>
                                                        </div>
                                                    )) : <p style={{ color: '#94A3B8', fontSize: '14px' }}>Không có dữ liệu học vấn.</p>}
                                                </div>
                                            </div>

                                            {/* Skills Section */}
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', color: '#0F172A' }}>
                                                    <div style={{ width: '32px', height: '32px', backgroundColor: '#F1F5F9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Award size={18} />
                                                    </div>
                                                    <h4 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Kỹ năng chuyên môn</h4>
                                                </div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                                    {cvData.skills?.length > 0 ? cvData.skills.map((skill: any, i: number) => (
                                                        <div key={i} style={{ padding: '8px 16px', backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '100px', fontSize: '13px', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div style={{ width: '6px', height: '6px', backgroundColor: '#5C9AFF', borderRadius: '50%' }} />
                                                            {skill.name} <span style={{ color: '#94A3B8', fontSize: '11px' }}>({skill.level})</span>
                                                        </div>
                                                    )) : <p style={{ color: '#94A3B8', fontSize: '14px' }}>Không có dữ liệu kỹ năng.</p>}
                                                </div>
                                            </div>

                                            {/* Projects Section */}
                                            {cvData.projects?.length > 0 && (
                                                <div style={{ marginTop: '40px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', color: '#0F172A' }}>
                                                        <div style={{ width: '32px', height: '32px', backgroundColor: '#F1F5F9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Layers size={18} />
                                                        </div>
                                                        <h4 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Dự án tiêu biểu</h4>
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                                        {cvData.projects.map((proj: any, i: number) => (
                                                            <div key={i} style={{ padding: '24px', backgroundColor: 'white', borderRadius: '20px', border: '1px solid #F1F5F9' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                                    <h5 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>{proj.name}</h5>
                                                                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#5C9AFF', backgroundColor: '#EFF6FF', padding: '4px 12px', borderRadius: '100px' }}>{proj.role}</span>
                                                                </div>
                                                                <p style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, marginBottom: '12px' }}>Tech: {proj.techStack}</p>
                                                                {proj.url && <a href={proj.url} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: '#5C9AFF', textDecoration: 'none', fontWeight: 700 }}>Xem dự án ↗</a>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Certifications Section */}
                                            {cvData.certifications?.length > 0 && (
                                                <div style={{ marginTop: '40px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', color: '#0F172A' }}>
                                                        <div style={{ width: '32px', height: '32px', backgroundColor: '#F1F5F9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Award size={18} />
                                                        </div>
                                                        <h4 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Chứng chỉ</h4>
                                                    </div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                                        {cvData.certifications.map((cert: any, i: number) => (
                                                            <div key={i} style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                                <Award size={20} color="#5C9AFF" />
                                                                <div>
                                                                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>{cert.name}</div>
                                                                    <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>{cert.organization}</div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>
                                            <FileText size={60} style={{ marginBottom: '20px', opacity: 0.2 }} />
                                            <p>Không tìm thấy dữ liệu hồ sơ cho ứng viên này.</p>
                                        </div>
                                    )}
                                </div>
                            ) : activeTab === "ANSWERS" ? (
                                <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', color: '#0F172A' }}>
                                        <div style={{ width: '32px', height: '32px', backgroundColor: '#F1F5F9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <MessageSquare size={18} />
                                        </div>
                                        <h4 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Câu trả lời của ứng viên</h4>
                                    </div>

                                    {!appData?.answers || appData.answers.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>
                                            <MessageSquare size={60} style={{ marginBottom: '20px', opacity: 0.2 }} />
                                            <p>Ứng viên chưa hoàn thành bộ câu hỏi hoặc không có câu trả lời nào.</p>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                            {appData.answers.map((answer: any, idx: number) => {
                                                // 1. Try to get question details directly from the answer object
                                                let questionDetails = answer.question;
                                                
                                                // Get the question ID from multiple possible keys
                                                const qId = (answer.questionId || answer.question_id)?.toString();

                                                // 2. Fallback: If question details are missing or options are empty, look into the job prop
                                                if ((!questionDetails || !questionDetails.options || questionDetails.options.length === 0) && qId && job?.questionSets) {
                                                    for (const set of job.questionSets) {
                                                        const found = set.questions?.find((q: any) => q.id?.toString() === qId);
                                                        if (found) {
                                                            questionDetails = found;
                                                            // If we found a version with options, use it
                                                            if (found.options && found.options.length > 0) break;
                                                        }
                                                    }
                                                }

                                                // Normalize selected IDs
                                                const sId = answer.selectedOptionId || answer.selected_option_id;
                                                const sIds = answer.selectedOptionIds || answer.selected_option_ids;
                                                const rawSelectedIds = sIds || (sId ? [sId] : []);
                                                const selectedIds = (Array.isArray(rawSelectedIds) ? rawSelectedIds : (typeof rawSelectedIds === 'string' ? rawSelectedIds.split(',') : [])).map(id => id?.toString());

                                                return (
                                                    <div key={answer.id || idx} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#5C9AFF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CÂU HỎI {idx + 1}</span>
                                                            {questionDetails?.type && (
                                                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', backgroundColor: '#F1F5F9', padding: '4px 8px', borderRadius: '6px' }}>{questionDetails.type}</span>
                                                            )}
                                                        </div>
                                                        <div style={{ fontSize: '16px', fontWeight: 700, color: '#1E293B', marginBottom: '20px', lineHeight: 1.5 }}>
                                                            {questionDetails?.content || "Không tìm thấy nội dung câu hỏi."}
                                                        </div>
                                                        
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                            {answer.textAnswer ? (
                                                                <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #F1F5F9' }}>
                                                                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>CÂU TRẢ LỜI:</div>
                                                                    <div style={{ fontSize: '15px', color: '#334155', fontWeight: 600, lineHeight: 1.6 }}>{answer.textAnswer}</div>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>LỰA CHỌN CỦA ỨNG VIÊN & ĐÁP ÁN:</div>
                                                                    {questionDetails?.options && questionDetails.options.length > 0 ? (
                                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                                            {questionDetails.options.map((opt: any) => {
                                                                                const isSelected = selectedIds.includes(opt.id?.toString());
                                                                                const isCorrect = opt.isCorrect;
                                                                                
                                                                                return (
                                                                                    <div 
                                                                                        key={opt.id} 
                                                                                        style={{ 
                                                                                            padding: '14px 18px', 
                                                                                            borderRadius: '16px', 
                                                                                            border: isSelected ? `2px solid ${isCorrect ? '#10B981' : '#EF4444'}` : (isCorrect ? '2px dashed #10B981' : '1px solid #E2E8F0'),
                                                                                            backgroundColor: isSelected ? (isCorrect ? '#ECFDF5' : '#FEF2F2') : (isCorrect ? '#F0FDF4' : 'white'),
                                                                                            display: 'flex',
                                                                                            alignItems: 'center',
                                                                                            gap: '12px',
                                                                                            transition: 'all 0.2s'
                                                                                        }}
                                                                                    >
                                                                                        <div style={{ 
                                                                                            width: '24px', 
                                                                                            height: '24px', 
                                                                                            borderRadius: '50%', 
                                                                                            border: '2px solid #CBD5E1',
                                                                                            display: 'flex',
                                                                                            alignItems: 'center',
                                                                                            justifyContent: 'center',
                                                                                            backgroundColor: isSelected ? (isCorrect ? '#10B981' : '#EF4444') : 'white',
                                                                                            color: 'white',
                                                                                            flexShrink: 0
                                                                                        }}>
                                                                                            {isSelected && <CheckCircle2 size={14} strokeWidth={3} />}
                                                                                        </div>
                                                                                        <span style={{ fontSize: '14px', fontWeight: 700, color: isSelected ? '#0F172A' : '#475569', flex: 1 }}>
                                                                                            {opt.optionText}
                                                                                        </span>
                                                                                        {isCorrect && (
                                                                                            <span style={{ 
                                                                                                fontSize: '10px', 
                                                                                                fontWeight: 900, 
                                                                                                color: '#065F46', 
                                                                                                backgroundColor: '#D1FAE5', 
                                                                                                padding: '4px 10px', 
                                                                                                borderRadius: '100px',
                                                                                                letterSpacing: '0.05em'
                                                                                            }}>
                                                                                                HỆ THỐNG GỢI Ý ĐÚNG
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    ) : (
                                                                        <div style={{ padding: '16px', backgroundColor: '#FFF7ED', borderRadius: '16px', border: '1px solid #FFEDD5', color: '#9A3412', fontSize: '13px', fontStyle: 'italic' }}>
                                                                            {selectedIds.length > 0 
                                                                                ? `Ứng viên đã chọn ${selectedIds.length} đáp án, nhưng nội dung các lựa chọn không có sẵn trong Snapshot này.` 
                                                                                : "Không có dữ liệu lựa chọn cho câu hỏi này."}
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>

                                                        {/* ⭐ AI Individual Answer Analysis */}
                                                        {(() => {
                                                            const aiAnalysis = aiReport?.answersAnalysis?.find((a: any) => 
                                                                a.question === (questionDetails?.content)
                                                            );
                                                            
                                                            if (!aiAnalysis) return null;

                                                            return (
                                                                <div style={{ marginTop: '16px', padding: '20px', backgroundColor: '#F0F9FF', borderRadius: '20px', border: '1px solid #E0F2FE' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#0369A1' }}>
                                                                        <BrainCircuit size={16} />
                                                                        <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI ANALYSIS</span>
                                                                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                            <span style={{ fontSize: '14px', fontWeight: 900 }}>{aiAnalysis.score}</span>
                                                                            <span style={{ fontSize: '10px', fontWeight: 700, opacity: 0.7 }}>/10</span>
                                                                        </div>
                                                                    </div>
                                                                    <div style={{ fontSize: '14px', color: '#0369A1', lineHeight: 1.6, fontWeight: 500 }}>
                                                                        {aiAnalysis.analysis}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', color: '#0F172A' }}>
                                        <div style={{ width: '32px', height: '32px', backgroundColor: '#F1F5F9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Clock size={18} />
                                        </div>
                                        <h4 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Lịch sử tiến trình & Trao đổi</h4>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: '15px', top: '10px', bottom: '10px', width: '2px', backgroundColor: '#F1F5F9' }}></div>
                                        
                                        {(() => {
                                            const events: any[] = [];
                                            const app = fullApplication || application;

                                            // 1. Initial Application
                                            events.push({
                                                date: app.createdAt,
                                                title: 'Nộp hồ sơ ứng tuyển',
                                                status: 'APPLIED',
                                                color: '#5C9AFF',
                                                icon: <FileText size={14} />,
                                                description: 'Ứng viên đã nộp hồ sơ thành công qua hệ thống.'
                                            });

                                            // 2. Viewed by Employer
                                            if (app.viewedAt) {
                                                events.push({
                                                    date: app.viewedAt,
                                                    title: 'Nhà tuyển dụng đã xem',
                                                    status: 'VIEWED',
                                                    color: '#7C3AED',
                                                    icon: <Eye size={14} />,
                                                    description: 'Hồ sơ đã được bộ phận nhân sự tiếp nhận và kiểm duyệt.'
                                                });
                                            }

                                            // 3. Status History (The Source of Truth)
                                            const statusColors: Record<string, string> = {
                                                'APPLIED': '#5C9AFF',
                                                'SCREENING': '#64748B',
                                                'INVITED': '#7C3AED',
                                                'INTERVIEWING': '#EA580C',
                                                'INTERVIEW_CONFIRMED': '#16A34A',
                                                'RESCHEDULE_REQUESTED': '#EA580C',
                                                'OFFER': '#16A34A',
                                                'OFFER_CONFIRMED': '#16A34A',
                                                'OFFER_NEGOTIATED': '#EA580C',
                                                'HIRED': '#0D9488',
                                                'REJECTED': '#94A3B8',
                                                'CANCELLED': '#475569'
                                            };

                                            const statusLabels: Record<string, string> = {
                                                'APPLIED': 'Nộp hồ sơ ứng tuyển',
                                                'SCREENING': 'Đang sàng lọc',
                                                'VIEWED': 'Nhà tuyển dụng đã xem',
                                                'INVITED': 'Mời tham gia',
                                                'INTERVIEWING': 'Hẹn phỏng vấn',
                                                'INTERVIEW_UPDATED': 'Cập nhật lịch phỏng vấn',
                                                'INTERVIEW_CONFIRMED': 'Ứng viên đã xác nhận',
                                                'RESCHEDULE_REQUESTED': 'Yêu cầu dời lịch',
                                                'OFFER': 'Gửi lời mời làm việc',
                                                'OFFER_CONFIRMED': 'Ứng viên chấp nhận Offer',
                                                'OFFER_NEGOTIATED': 'Ứng viên thương lượng',
                                                'HIRED': 'Đã tuyển dụng',
                                                'REJECTED': 'Từ chối hồ sơ',
                                                'CANCELLED': 'Đã hủy ứng tuyển'
                                            };

                                            (app.statusHistory || []).forEach((h: any) => {
                                                if (h.status === 'APPLIED') return;

                                                let detailedNote: any = h.note;
                                                const payload = h.payload;
                                                let eventTitle = statusLabels[h.status] || h.status;
                                                let icon = <Activity size={14} />;

                                                if (payload?.type === 'CANDIDATE_RESPONSE') {
                                                    icon = <User size={14} />;
                                                    eventTitle = payload.confirmation === 'RESCHEDULE_REQUESTED' ? 'Ứng viên yêu cầu dời lịch' : 
                                                                (payload.confirmation === 'ACCEPTED' ? 'Ứng viên chấp nhận' : 
                                                                (payload.confirmation === 'NEGOTIATED' ? 'Ứng viên thương lượng Offer' : 
                                                                (payload.confirmation === 'WITHDRAW_REQUESTED' ? 'Ứng viên yêu cầu rút hồ sơ' : 'Ứng viên từ chối')));
                                                }

                                                // --- INTERVIEW INFO BLOCK ---
                                                const hasInterviewData = payload?.scheduledAt || payload?.location || (h.status === 'INTERVIEWING' && payload?.type !== 'CANDIDATE_RESPONSE');
                                                if (hasInterviewData) {
                                                    const interviewData = payload?.scheduledAt 
                                                        ? { scheduledAt: payload.scheduledAt, type: payload.interviewType, location: payload.location }
                                                        : null;

                                                    if (payload?.type !== 'CANDIDATE_RESPONSE') {
                                                        icon = <Calendar size={14} />;
                                                        eventTitle = h.status === 'INTERVIEW_UPDATED' ? 'Cập nhật lịch phỏng vấn' : 'Lên lịch phỏng vấn';
                                                    }
                                                    
                                                    if (interviewData) {
                                                        detailedNote = (
                                                            <div style={{ marginTop: '8px', padding: '12px', backgroundColor: '#FFFBEB', borderRadius: '12px', border: '1px solid #FEF3C7', fontSize: '13px' }}>
                                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '8px' }}>
                                                                    <div>
                                                                        <div style={{ fontSize: '10px', color: '#92400E', fontWeight: 800, textTransform: 'uppercase' }}>Thời gian</div>
                                                                        <div style={{ fontWeight: 700 }}>{new Date(interviewData.scheduledAt).toLocaleString()}</div>
                                                                    </div>
                                                                    <div>
                                                                        <div style={{ fontSize: '10px', color: '#92400E', fontWeight: 800, textTransform: 'uppercase' }}>Hình thức</div>
                                                                        <div style={{ fontWeight: 700 }}>{interviewData.interviewType || interviewData.type}</div>
                                                                    </div>
                                                                </div>
                                                                <div style={{ marginBottom: '8px' }}>
                                                                    <div style={{ fontSize: '10px', color: '#92400E', fontWeight: 800, textTransform: 'uppercase' }}>Địa điểm</div>
                                                                    <div style={{ fontWeight: 600, color: '#475569' }}>{interviewData.location}</div>
                                                                </div>
                                                                {h.note && <div style={{ marginTop: '8px', borderTop: '1px dashed #FEF3C7', paddingTop: '8px', fontStyle: 'italic', color: '#92400E' }}>&ldquo;{h.note}&rdquo;</div>}
                                                            </div>
                                                        );
                                                    }
                                                } 
                                                // --- OFFER INFO BLOCK ---
                                                else if (payload?.salary || (h.status === 'OFFER' && payload?.type !== 'CANDIDATE_RESPONSE')) {
                                                    const offerData = payload?.salary 
                                                        ? { salary: payload.salary, startDate: payload.startDate }
                                                        : app.offer;

                                                    if (payload?.type !== 'CANDIDATE_RESPONSE') {
                                                        icon = <Award size={14} />;
                                                        eventTitle = 'Gửi Offer';
                                                    }
                                                    
                                                    if (offerData) {
                                                        detailedNote = (
                                                            <div style={{ marginTop: '8px', padding: '12px', backgroundColor: '#F0FDF4', borderRadius: '12px', border: '1px solid #DCFCE7', fontSize: '13px' }}>
                                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                                                    <div>
                                                                        <div style={{ fontSize: '10px', color: '#166534', fontWeight: 800, textTransform: 'uppercase' }}>Lương đề xuất</div>
                                                                        <div style={{ fontWeight: 700, color: '#16A34A' }}>{Number(offerData.salary).toLocaleString()} VNĐ</div>
                                                                    </div>
                                                                    <div>
                                                                        <div style={{ fontSize: '10px', color: '#166534', fontWeight: 800, textTransform: 'uppercase' }}>Ngày bắt đầu</div>
                                                                        <div style={{ fontWeight: 700 }}>{offerData.startDate ? new Date(offerData.startDate).toLocaleDateString() : 'Thỏa thuận'}</div>
                                                                    </div>
                                                                </div>
                                                                {h.note && <div style={{ marginTop: '8px', borderTop: '1px dashed #DCFCE7', paddingTop: '8px', fontStyle: 'italic', color: '#166534' }}>&ldquo;{h.note}&rdquo;</div>}
                                                            </div>
                                                        );
                                                    }
                                                }

                                                const actorName = h.actor ? `${h.actor.firstName} ${h.actor.lastName}` : (h.actorRole === 'CANDIDATE' ? 'Ứng viên' : (h.actorRole === 'SYSTEM' ? 'Hệ thống' : ''));
                                                const actorLabel = h.actorRole === 'EMPLOYER' ? `Nhà tuyển dụng (${actorName})` : (h.actorRole === 'CANDIDATE' ? 'Ứng viên' : 'Hệ thống');

                                                events.push({
                                                     date: h.createdAt,
                                                     title: eventTitle,
                                                     status: h.status,
                                                     color: statusColors[h.status] || '#64748B',
                                                     icon: icon,
                                                     description: detailedNote,
                                                     actor: actorLabel
                                                 });
                                             });

                                             // 4. Manual Withdrawal fallback
                                             if (app.status === 'CANCELLED' && !events.some(e => e.status === 'CANCELLED')) {
                                                 events.push({
                                                     date: app.updatedAt,
                                                     title: 'Ứng viên rút hồ sơ',
                                                     status: 'CANCELLED',
                                                     color: '#475569',
                                                     icon: <User size={14} />,
                                                     description: app.rejectionReason || 'Ứng viên đã chủ động rút hồ sơ.',
                                                     actor: 'Ứng viên'
                                                 });
                                             }

                                             // Sort and Render (Chronological: Earliest First)
                                             return events
                                                 .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                                 .map((ev, i) => (
                                                     <TimelineItem 
                                                         key={i}
                                                         icon={ev.icon}
                                                         title={ev.title}
                                                         date={ev.date}
                                                         status={ev.status}
                                                         color={ev.color}
                                                         description={ev.description}
                                                         actor={ev.actor}
                                                         isLast={i === events.length - 1}
                                                     />
                                                 ));
                                        })()}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer - Final Review History */}
                        <div style={{
                            padding: '32px 40px',
                            borderTop: '1px solid #F1F5F9',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: 'white'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ display: 'flex', marginLeft: '8px' }}>
                                    {[1, 2, 3].map(i => (
                                        <div key={i} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid white', backgroundColor: '#F1F5F9', marginLeft: '-8px', overflow: 'hidden' }}>
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 65}`} alt="avatar" />
                                        </div>
                                    ))}
                                </div>
                                <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>+2 thành viên đã xem</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94A3B8', fontSize: '12px', fontStyle: 'italic' }}>
                                <Clock size={14} /> Cập nhật lần cuối: Vừa xong
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function MatrixBar({ label, percentage, color }: { label: string, percentage: number, color: string }) {
    return (
        <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>{label}</span>
                <span style={{ fontSize: '12px', fontWeight: 900, color: color }}>{percentage}%</span>
            </div>
            <div style={{ height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    style={{ height: '100%', backgroundColor: color, borderRadius: '4px' }}
                />
            </div>
        </div>
    );
}

function TimelineItem({ icon, title, date, status, color, isLast = false, description, actor }: any) {
    if (!date) return null;
    
    return (
        <div style={{ display: 'flex', gap: '20px', marginBottom: isLast ? 0 : '32px', position: 'relative' }}>
            <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '10px', 
                backgroundColor: 'white', 
                border: `2px solid ${color}`, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: color,
                zIndex: 1,
                flexShrink: 0
            }}>
                {icon}
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <h5 style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', margin: 0 }}>{title}</h5>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: color, backgroundColor: `${color}10`, padding: '2px 8px', borderRadius: '4px' }}>{status}</span>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginBottom: description ? '4px' : 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{new Date(date).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    {actor && (
                        <>
                            <span style={{ color: '#E2E8F0' }}>•</span>
                            <span style={{ fontSize: '10px', color: '#64748B', backgroundColor: '#F8FAFC', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>{actor}</span>
                        </>
                    )}
                </div>
                {description && <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>{description}</div>}
            </div>
        </div>
    );
}
