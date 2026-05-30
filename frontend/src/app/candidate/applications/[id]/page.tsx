"use client";

import React, { useEffect, useState, Fragment } from "react";
import { applicationService } from "@/services/application.service";
import {
    ChevronLeft,
    Building2,
    Calendar,
    Clock,
    FileText,
    Zap,
    MapPin,
    DollarSign,
    MessageSquare,
    ChevronRight,
    Check,
    Search,
    CheckCircle2,
    Briefcase,
    Layout,
    ArrowUpRight,
    Loader2,
    Info,
    Award,
    X,
    Mail,
    Phone,
    User,
    Layers,
    Target,
    GraduationCap,
    Download,
    AlertCircle,
    HelpCircle,
    Activity
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

import { interviewService } from "@/services/interview.service";
import { offerService } from "@/services/offer.service";
import { ChatWindow } from "@/components/shared/ChatWindow";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { JobDetailModal } from "@/components/shared/JobDetailModal";
import { socketService } from "@/services/socket.service";
import { ScreeningAnswersModal } from "@/components/shared/ScreeningAnswersModal";
import CandidateInsightDrawer from "@/components/candidate/candidate-insight-drawer";
import { useNotificationStore } from "@/store/notificationStore";

const getWaitingTime = (updatedAt: string) => {
    if (!updatedAt) return "";
    const lastUpdate = new Date(updatedAt);
    const now = new Date();
    const diffInMs = now.getTime() - lastUpdate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMins = Math.floor(diffInMs / (1000 * 60));

    if (diffInDays > 0) return `${diffInDays} days ago`;
    if (diffInHours > 0) return `${diffInHours} hours ago`;
    if (diffInMins > 0) return `${diffInMins} mins ago`;
    return "Just now";
};

export default function ApplicationDetailPage({ params }: { params: { id: string } }) {
    const appId = params.id;
    const [app, setApp] = useState<any>(null);
    const [interviews, setInterviews] = useState<any[]>([]);
    const [offer, setOffer] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isCvModalOpen, setIsCvModalOpen] = useState(false);
    const [isJobModalOpen, setIsJobModalOpen] = useState(false);
    const [isAnswersModalOpen, setIsAnswersModalOpen] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [withdrawReason, setWithdrawReason] = useState("");
    const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
    const [rescheduleFeedback, setRescheduleFeedback] = useState("");
    const [selectedInterviewId, setSelectedInterviewId] = useState<string | null>(null);
    const [isSubmittingReschedule, setIsSubmittingReschedule] = useState(false);
    const [isNegotiateOfferModalOpen, setIsNegotiateOfferModalOpen] = useState(false);
    const [negotiateOfferFeedback, setNegotiateOfferFeedback] = useState("");
    const [isSubmittingNegotiation, setIsSubmittingNegotiation] = useState(false);
    const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
    const currentUser = useAuthStore((state) => state.user);
    const { markByApplicationId } = useNotificationStore();

    useEffect(() => {
        fetchApplication();
        fetchInterviews();
        fetchOffer();
        
        // Mark notifications for this application as read
        markByApplicationId(appId);

        if (currentUser?.id) {
            socketService.connect(currentUser.id);

            socketService.onApplicationUpdated((data) => {
                console.log("Real-time Update Received:", data);
                // Refresh all relevant data when notified
                if (data.applicationId === appId) {
                    fetchApplication(true);
                    fetchInterviews(true);
                    fetchOffer(true);
                }
            });
        }

        return () => {
            socketService.offApplicationUpdated();
        };
    }, [appId, currentUser?.id]);

    const fetchApplication = async (silent = false) => {
        try {
            if (!silent) setIsLoading(true);
            const data = await applicationService.getById(appId);
            setApp(data);
        } catch (error) {
            console.error("Failed to fetch application:", error);
        } finally {
            if (!silent) setIsLoading(false);
        }
    };

    const fetchInterviews = async (silent = false) => {
        try {
            const data = await interviewService.getByApplication(appId);
            setInterviews(data || []);
        } catch (error) {
            console.error("Failed to fetch interviews:", error);
        }
    };

    const fetchOffer = async (silent = false) => {
        try {
            const data = await offerService.getByApplication(appId);
            setOffer(data);
        } catch (error) {
            console.error("Failed to fetch offer:", error);
        }
    };
    const handleRequestWithdraw = async () => {
        if (!withdrawReason.trim()) {
            alert("Please enter your reason for withdrawing.");
            return;
        }

        try {
            setIsSubmittingWithdraw(true);
            await applicationService.requestWithdraw(appId, withdrawReason);
            alert("Withdrawal request sent to employer.");
            setIsWithdrawModalOpen(false);
            fetchApplication();
        } catch (error) {
            console.error("Failed to request withdraw:", error);
            alert("An error occurred while sending the request.");
        } finally {
            setIsSubmittingWithdraw(false);
        }
    };
    const handleConfirmInterview = async (interviewId: string, confirmation: 'ACCEPTED' | 'REJECTED' | 'RESCHEDULE_REQUESTED', feedback?: string) => {
        try {
            await interviewService.confirmInterview(interviewId, confirmation, feedback);
            fetchInterviews();
            fetchApplication(true); // Refresh application to get updated status history
            setIsRescheduleModalOpen(false);
            setRescheduleFeedback("");
            setSelectedInterviewId(null);
        } catch (error) {
            console.error("Failed to confirm interview:", error);
            alert("An error occurred.");
        }
    };

    const handleConfirmOffer = async (offerId: string, confirmation: 'ACCEPTED' | 'REJECTED' | 'NEGOTIATED', feedback?: string) => {
        if (confirmation !== 'NEGOTIATED' && !confirm(`Are you sure you want to ${confirmation === 'ACCEPTED' ? 'accept' : 'reject'} this job offer?`)) return;

        try {
            if (confirmation === 'NEGOTIATED') setIsSubmittingNegotiation(true);

            await offerService.confirm(offerId, confirmation, feedback);
            fetchOffer();
            fetchApplication(true);

            if (confirmation === 'NEGOTIATED') {
                setIsNegotiateOfferModalOpen(false);
                setNegotiateOfferFeedback("");
            }
        } catch (error) {
            console.error("Failed to confirm offer:", error);
            alert("An error occurred.");
        } finally {
            setIsSubmittingNegotiation(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }}>
                <Loader2 size={48} className="animate-spin" color="#5C9AFF" />
                <p style={{ marginTop: '16px', color: '#64748b', fontWeight: 600 }}>Loading application details...</p>
            </div>
        );
    }

    if (!app) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }}>
                <Info size={48} color="#94a3b8" />
                <h2 style={{ marginTop: '16px', fontWeight: 800 }}>Application Not Found</h2>
                <Link href="/candidate/applications" style={{ marginTop: '12px', color: '#5C9AFF', fontWeight: 600 }}>Back to My Applications</Link>
            </div>
        );
    }

    const job = app.job;
    const statusColors: Record<string, { bg: string, text: string, label: string }> = {
        'APPLIED': { bg: '#eff6ff', text: '#5C9AFF', label: 'Applied' },
        'SCREENING': { bg: '#f8fafc', text: '#64748b', label: 'Screening' },
        'INVITED': { bg: '#f5f3ff', text: '#7c3aed', label: 'Invited' },
        'INTERVIEWING': { bg: '#fff7ed', text: '#ea580c', label: 'Lên lịch phỏng vấn' },
        'INTERVIEW_CONFIRMED': { bg: '#f0fdf4', text: '#16a34a', label: 'Đã xác nhận phỏng vấn' },
        'INTERVIEW_UPDATED': { bg: '#fff7ed', text: '#ea580c', label: 'Cập nhật lịch phỏng vấn' },
        'RESCHEDULE_REQUESTED': { bg: '#fff7ed', text: '#ea580c', label: 'Yêu cầu dời lịch' },
        'OFFER': { bg: '#f0fdf4', text: '#22c55e', label: 'Offer Received' },
        'HIRED': { bg: '#f0fdfa', text: '#0d9488', label: 'Hired' },
        'REJECTED': { bg: '#f1f5f9', text: '#94a3b8', label: 'Rejected' },
        'CANCELLED': { bg: '#e2e8f0', text: '#475569', label: 'Cancelled' }
    };

    const currentStatus = statusColors[app.status] || statusColors['APPLIED'];

    return (
        <div className="application-detail-root">
            <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '40px', fontFamily: 'Inter, sans-serif' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <Link href="/candidate/applications" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', fontWeight: 700, padding: '8px 16px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <ChevronLeft size={16} /> Dashboard
                            </Link>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f0fdf4', padding: '6px 14px', borderRadius: '100px', border: '1px solid #dcfce7' }}>
                                <div style={{ width: '6px', height: '6px', backgroundColor: '#16a34a', borderRadius: '50%', boxShadow: '0 0 8px #16a34a' }} className="animate-pulse"></div>
                                <span style={{ fontSize: '10px', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Tracking</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setIsAnswersModalOpen(true)}
                                style={{ padding: '10px 20px', backgroundColor: 'white', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <HelpCircle size={16} /> My Answers
                            </button>
                            <button
                                onClick={() => setIsJobModalOpen(true)}
                                style={{ padding: '10px 20px', backgroundColor: 'white', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <Briefcase size={16} /> Job Post
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', backgroundColor: 'white', padding: '24px 32px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ width: '64px', height: '64px', backgroundColor: '#f8fafc', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                                {job?.company?.logoUrl ? (
                                    <img src={job.company.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '6px' }} />
                                ) : (
                                    <Building2 size={32} color="#0f172a" />
                                )}
                            </div>
                            <div>
                                <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{job?.title}</h1>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                                    <span style={{ fontSize: '15px', fontWeight: 600, color: '#64748b' }}>{job?.company?.name}</span>
                                    <div style={{ width: '4px', height: '4px', backgroundColor: '#cbd5e1', borderRadius: '50%' }}></div>
                                    <span style={{
                                        padding: '4px 12px',
                                        backgroundColor: currentStatus.bg,
                                        color: currentStatus.text,
                                        borderRadius: '100px',
                                        fontSize: '11px',
                                        fontWeight: 800,
                                        textTransform: 'uppercase'
                                    }}>
                                        {currentStatus.label}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setIsChatOpen(true)}
                                style={{ padding: '12px 24px', backgroundColor: '#5C9AFF', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(92, 154, 255, 0.2)' }}
                            >
                                <MessageSquare size={18} /> Chat with Recruiter
                            </button>
                            <Link
                                href={`/candidate/applications/${app.id}/analysis`}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: 'white',
                                    color: '#5C9AFF',
                                    border: '1px solid #eff6ff',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    textDecoration: 'none'
                                }}
                            >
                                <Zap size={18} fill="#5C9AFF" /> AI Insight
                            </Link>
                            {app.status !== 'CANCELLED' && app.status !== 'REJECTED' && app.status !== 'HIRED' && (
                                <button
                                    onClick={() => setIsWithdrawModalOpen(true)}
                                    style={{ padding: '12px 24px', backgroundColor: 'white', color: '#ef4444', border: '1px solid #fee2e2', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
                                >
                                    Withdraw
                                </button>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
                        {/* Main Content Area */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                            {/* Hired Celebration Banner (Simplified & Direct) */}
                            {app.status === 'HIRED' && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{ 
                                        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                                        borderRadius: '24px',
                                        padding: '24px 32px',
                                        border: '1px solid #bbf7d0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '24px',
                                        marginBottom: '32px',
                                        boxShadow: '0 10px 30px rgba(22, 163, 74, 0.05)'
                                    }}
                                >
                                    <div style={{ 
                                        width: '60px', 
                                        height: '60px', 
                                        backgroundColor: 'white', 
                                        borderRadius: '18px', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        boxShadow: '0 4px 12px rgba(22, 163, 74, 0.1)',
                                        flexShrink: 0
                                    }}>
                                        <Award size={32} color="#16a34a" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#166534', margin: '0 0 6px 0' }}>Chúc mừng! Bạn đã chính thức trúng tuyển</h2>
                                        <div style={{ fontSize: '14px', color: '#15803d', fontWeight: 500, lineHeight: 1.5, padding: '10px 14px', backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: '12px', border: '1px solid #dcfce7' }}>
                                            <span style={{ fontSize: '10px', fontWeight: 900, color: '#16a34a', textTransform: 'uppercase', marginRight: '8px', letterSpacing: '0.05em' }}>Lời nhắn:</span>
                                            &ldquo;{app.statusHistory?.find((h: any) => h.status === 'HIRED')?.note || "Chào mừng bạn gia nhập đội ngũ!"}&rdquo;
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setIsOnboardingModalOpen(true)}
                                        style={{ 
                                            padding: '12px 24px', 
                                            backgroundColor: '#16a34a', 
                                            color: 'white', 
                                            borderRadius: '12px', 
                                            border: 'none', 
                                            fontWeight: 700, 
                                            fontSize: '14px', 
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        Xem chi tiết nhận việc
                                    </button>
                                </motion.div>
                            )}

                            {/* Status Message Card (Improved) */}
                            <div style={{
                                background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
                                borderRadius: '28px',
                                border: '1px solid #e2e8f0',
                                padding: '32px',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.03)'
                            }}>
                                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', background: `${currentStatus.text}08`, borderRadius: '50%', filter: 'blur(40px)' }}></div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                                    <div style={{
                                        width: '44px',
                                        height: '44px',
                                        backgroundColor: `${currentStatus.text}15`,
                                        borderRadius: '14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: `1px solid ${currentStatus.text}20`
                                    }}>
                                        <Activity size={22} color={currentStatus.text} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Trạng thái hồ sơ (Status Update)</h3>
                                        <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Cập nhật lần cuối: {getWaitingTime(app.updatedAt)}</span>
                                    </div>
                                </div>

                                <div style={{
                                    fontSize: '16px',
                                    color: '#334155',
                                    lineHeight: 1.7,
                                    fontWeight: 500,
                                    backgroundColor: 'white',
                                    padding: '20px',
                                    borderRadius: '20px',
                                    border: '1px solid #f1f5f9'
                                }}>
                                    {app.status === 'APPLIED' && "Hồ sơ của bạn đã được gửi thành công. Đội ngũ tuyển dụng sẽ sớm xem xét thông tin của bạn."}
                                    {app.status === 'SCREENING' && "Chúng tôi đang trong quá trình đánh giá kỹ năng và kinh nghiệm của bạn. Kết quả sẽ được cập nhật sớm nhất."}
                                    {app.status === 'INVITED' && "Chúc mừng! Bạn đã nhận được lời mời phỏng vấn. Vui lòng kiểm tra lịch hẹn bên dưới."}
                                    {app.status === 'INTERVIEWING' && "Bạn đang trong giai đoạn phỏng vấn. Hãy chuẩn bị thật tốt và theo dõi các thông tin tiếp theo."}
                                    {app.status === 'OFFER' && "Tuyệt vời! Bạn đã nhận được đề nghị làm việc (Offer). Hãy xem kỹ các điều khoản bên dưới nhé."}
                                    {app.status === 'HIRED' && "Chúc mừng tân binh! Bạn đã chính thức trúng tuyển và gia nhập đội ngũ. Chào mừng bạn!"}
                                    {app.status === 'REJECTED' && `Kết quả: ${app.rejectionReason || "Cảm ơn bạn đã quan tâm. Rất tiếc hiện tại chúng tôi chưa tìm thấy sự phù hợp tối ưu."}`}
                                    {app.status === 'CANCELLED' && "Bạn đã chủ động rút hồ sơ ứng tuyển này."}
                                </div>
                            </div>

                            {/* Area: Offers (Conditionally Rendered) */}
                            {offer && (
                                <div style={{ backgroundColor: 'white', borderRadius: '28px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.04)' }}>
                                    <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#fcfdfe', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <Award size={20} color="#16a34a" />
                                            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Lời mời làm việc (Job Offer)</h3>
                                        </div>
                                        <span style={{
                                            padding: '6px 16px',
                                            borderRadius: '100px',
                                            fontSize: '11px',
                                            fontWeight: 800,
                                            backgroundColor: offer.status === 'ACCEPTED' ? '#dcfce7' : (offer.status === 'REJECTED' ? '#fef2f2' : (offer.status === 'NEGOTIATED' ? '#fff7ed' : '#f0f9ff')),
                                            color: offer.status === 'ACCEPTED' ? '#166534' : (offer.status === 'REJECTED' ? '#991b1b' : (offer.status === 'NEGOTIATED' ? '#ea580c' : '#0369a1'))
                                        }}>
                                            {offer.status === 'PENDING' ? '• ĐANG CHỜ BẠN PHẢN HỒI' : (offer.status === 'ACCEPTED' ? '✓ ĐÃ CHẤP NHẬN' : (offer.status === 'REJECTED' ? '✕ ĐÃ TỪ CHỐI' : '⚖️ ĐANG THƯƠNG LƯỢNG'))}
                                        </span>
                                    </div>
                                    <div style={{ padding: '32px' }}>
                                        {/* Offer Welcome Header */}
                                        <div style={{ padding: '24px', backgroundColor: '#f0fdf4', borderRadius: '24px', border: '1px solid #dcfce7', marginBottom: '24px' }}>
                                            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#166534', margin: '0 0 8px 0' }}>Chúc mừng! Bạn đã nhận được đề nghị làm việc.</h4>
                                            <p style={{ fontSize: '13px', color: '#166534', margin: 0, opacity: 0.85, lineHeight: 1.6 }}>
                                                Sau quá trình đánh giá kỹ lưỡng, chúng tôi rất ấn tượng với năng lực của bạn và trân trọng mời bạn gia nhập đội ngũ. Vui lòng xem các chi tiết về mức lương và ngày bắt đầu bên dưới.
                                            </p>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                                            <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                    <DollarSign size={16} color="#94a3b8" />
                                                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mức lương đề xuất</span>
                                                </div>
                                                <div style={{ fontSize: '20px', fontWeight: 800, color: '#10b981' }}>{Number(offer.salary).toLocaleString()} VNĐ</div>
                                            </div>
                                            <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                    <Calendar size={16} color="#94a3b8" />
                                                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ngày bắt đầu dự kiến</span>
                                                </div>
                                                <div style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>{offer.startDate ? new Date(offer.startDate).toLocaleDateString('vi-VN') : 'Thỏa thuận'}</div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            {offer.notes && (
                                                <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Ghi chú từ Nhà tuyển dụng</div>
                                                    <div style={{ fontSize: '14px', color: '#1e293b', lineHeight: 1.6, fontWeight: 500, fontStyle: 'italic' }}>&ldquo;{offer.notes}&rdquo;</div>
                                                </div>
                                            )}

                                            {offer.candidateFeedback && (
                                                <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', borderLeft: '4px solid #ea580c' }}>
                                                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Phản hồi của bạn</div>
                                                    <div style={{ fontSize: '14px', color: '#475569', fontStyle: 'italic', lineHeight: 1.6 }}>&ldquo;{offer.candidateFeedback}&rdquo;</div>
                                                </div>
                                            )}
                                        </div>

                                        {offer.status === 'PENDING' && (
                                            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                                                <button
                                                    onClick={() => setIsNegotiateOfferModalOpen(true)}
                                                    style={{ flex: 1, padding: '14px', borderRadius: '16px', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#475569', fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                                >
                                                    Thương lượng
                                                </button>
                                                <button
                                                    onClick={() => handleConfirmOffer(offer.id, 'ACCEPTED')}
                                                    style={{ flex: 1.5, padding: '14px', borderRadius: '16px', border: 'none', backgroundColor: '#10b981', color: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}
                                                >
                                                    Chấp nhận Offer
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Area: Interviews (Conditionally Rendered) */}
                            {interviews.length > 0 && (
                                <div style={{ backgroundColor: 'white', borderRadius: '28px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.04)' }}>
                                    <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#fcfdfe', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <Calendar size={20} color="#5C9AFF" />
                                            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Lịch phỏng vấn (Interview Schedule)</h3>
                                        </div>
                                    </div>
                                    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                        {/* Interview Status Header */}
                                        <div style={{ padding: '24px', backgroundColor: '#eff6ff', borderRadius: '24px', border: '1px solid #dbeafe' }}>
                                            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#1e40af', margin: '0 0 8px 0' }}>Thông báo về lịch phỏng vấn.</h4>
                                            <p style={{ fontSize: '13px', color: '#1e40af', margin: 0, opacity: 0.85, lineHeight: 1.6 }}>
                                                Nhà tuyển dụng đã sắp xếp lịch hẹn để trao đổi kỹ hơn về công việc. Bạn vui lòng xác nhận tham gia hoặc yêu cầu dời lịch nếu không sắp xếp được thời gian.
                                            </p>
                                        </div>

                                        {interviews.map((interview) => (
                                            <div key={interview.id} style={{ padding: '24px', backgroundColor: '#f8fafc', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                                            <Clock size={14} color="#94a3b8" />
                                                            <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ngày & Giờ</span>
                                                        </div>
                                                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{new Date(interview.scheduledAt).toLocaleString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                                            <MapPin size={14} color="#94a3b8" />
                                                            <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Địa điểm</span>
                                                        </div>
                                                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#475569', lineHeight: 1.5 }}>{interview.location}</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                                            <Layers size={14} color="#94a3b8" />
                                                            <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hình thức</span>
                                                        </div>
                                                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#475569' }}>{interview.type}</div>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                    {interview.notes && (
                                                        <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                                            <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Ghi chú từ Nhà tuyển dụng</div>
                                                            <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: 500, lineHeight: 1.6, fontStyle: 'italic' }}>&ldquo;{interview.notes}&rdquo;</div>
                                                        </div>
                                                    )}

                                                    {interview.candidateFeedback && (
                                                        <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', borderLeft: '4px solid #ea580c' }}>
                                                            <div style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Phản hồi của bạn</div>
                                                            <div style={{ fontSize: '14px', color: '#475569', fontStyle: 'italic', lineHeight: 1.6 }}>&ldquo;{interview.candidateFeedback}&rdquo;</div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                                                    <span style={{
                                                        padding: '6px 16px',
                                                        borderRadius: '100px',
                                                        fontSize: '11px',
                                                        fontWeight: 800,
                                                        backgroundColor: interview.candidateConfirmation === 'ACCEPTED' ? '#dcfce7' : (interview.candidateConfirmation === 'REJECTED' ? '#fef2f2' : (interview.candidateConfirmation === 'RESCHEDULE_REQUESTED' ? '#fff7ed' : '#f0f9ff')),
                                                        color: interview.candidateConfirmation === 'ACCEPTED' ? '#166534' : (interview.candidateConfirmation === 'REJECTED' ? '#991b1b' : (interview.candidateConfirmation === 'RESCHEDULE_REQUESTED' ? '#ea580c' : '#0369a1'))
                                                    }}>
                                                        {interview.candidateConfirmation === 'PENDING' ? '• CHỜ BẠN XÁC NHẬN' : (interview.candidateConfirmation === 'ACCEPTED' ? '✓ ĐÃ XÁC NHẬN THAM GIA' : (interview.candidateConfirmation === 'REJECTED' ? '✕ ĐÃ TỪ CHỐI' : '⚠️ ĐÃ YÊU CẦU DỜI LỊCH'))}
                                                    </span>

                                                    {interview.candidateConfirmation === 'PENDING' && (
                                                        <div style={{ display: 'flex', gap: '12px' }}>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedInterviewId(interview.id);
                                                                    setIsRescheduleModalOpen(true);
                                                                }}
                                                                style={{ padding: '10px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#475569', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                                            >
                                                                Dời lịch phỏng vấn
                                                            </button>
                                                            <button
                                                                onClick={() => handleConfirmInterview(interview.id, 'ACCEPTED')}
                                                                style={{ padding: '10px 28px', borderRadius: '12px', border: 'none', backgroundColor: '#5C9AFF', color: 'white', fontSize: '13px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(92, 154, 255, 0.2)' }}
                                                            >
                                                                Xác nhận tham gia
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Status History Timeline */}
                            <div style={{ backgroundColor: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                                <div style={{ padding: '20px 32px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#fcfdfe', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Clock size={18} color="#64748b" />
                                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Application Timeline</h3>
                                </div>
                                <div style={{ padding: '32px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                        {(() => {
                                            const events: any[] = [];

                                            // 1. Status History (Employer & Candidate Actions)
                                            (app.statusHistory || []).forEach((h: any) => {
                                                if (h.status === 'APPLIED') return;

                                                let detailedNote: any = h.note;
                                                let payload = h.payload;

                                                // Defensive parsing if payload is stringified
                                                if (typeof payload === 'string') {
                                                    try { payload = JSON.parse(payload); } catch (e) { console.error("Failed to parse payload", e); }
                                                }

                                                let eventType = 'STATUS_CHANGE';
                                                let eventTitle = statusColors[h.status]?.label || h.status;

                                                // Determine Event Type and Title
                                                if (payload?.type === 'CANDIDATE_RESPONSE') {
                                                    eventType = 'CANDIDATE_RESPONSE';
                                                    if (payload.confirmation === 'RESCHEDULE_REQUESTED') {
                                                        eventTitle = 'Yêu cầu dời lịch phỏng vấn';
                                                    } else if (payload.confirmation === 'ACCEPTED') {
                                                        eventTitle = 'Chấp nhận lịch phỏng vấn';
                                                    } else if (payload.confirmation === 'NEGOTIATED') {
                                                        eventTitle = 'Đề xuất thương lượng Offer';
                                                    } else if (payload.confirmation === 'REJECTED') {
                                                        eventTitle = 'Từ chối (Hủy/Từ chối)';
                                                    } else if (payload.confirmation === 'WITHDRAW_REQUESTED') {
                                                        eventTitle = 'Yêu cầu rút hồ sơ';
                                                    } else {
                                                        eventTitle = 'Bạn đã phản hồi';
                                                    }
                                                } else if (payload?.type === 'INTERVIEW_SNAPSHOT' || payload?.scheduledAt) {
                                                    eventTitle = 'Thông tin phỏng vấn';
                                                } else if (payload?.type === 'OFFER_SNAPSHOT' || payload?.salary) {
                                                    eventTitle = 'Lời mời làm việc (Offer)';
                                                }

                                                // More robust interview data detection
                                                const interviewData = payload?.scheduledAt
                                                    ? {
                                                        scheduledAt: payload.scheduledAt,
                                                        type: payload.interviewType || payload.type,
                                                        location: payload.location || 'Địa điểm chưa xác định'
                                                    }
                                                    : (h.status === 'INTERVIEWING' && interviews.length > 0 ? interviews[0] : null);

                                                if (interviewData) {
                                                    detailedNote = (
                                                        <div style={{ marginTop: '4px', padding: '12px', backgroundColor: '#FFFBEB', borderRadius: '12px', border: '1px solid #FEF3C7', fontSize: '13px' }}>
                                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '8px' }}>
                                                                <div>
                                                                    <div style={{ fontSize: '10px', color: '#92400E', fontWeight: 800, textTransform: 'uppercase' }}>Thời gian</div>
                                                                    <div style={{ fontWeight: 700 }}>{new Date(interviewData.scheduledAt).toLocaleString()}</div>
                                                                </div>
                                                                <div>
                                                                    <div style={{ fontSize: '10px', color: '#92400E', fontWeight: 800, textTransform: 'uppercase' }}>Hình thức</div>
                                                                    <div style={{ fontWeight: 700 }}>{interviewData.type || interviewData.interviewType}</div>
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
                                                else {
                                                    const offerData = payload?.salary
                                                        ? { salary: payload.salary, startDate: payload.startDate }
                                                        : (h.status === 'OFFER' && payload?.type !== 'CANDIDATE_RESPONSE' ? (offer || null) : null);

                                                    if (offerData) {
                                                        detailedNote = (
                                                            <div style={{ marginTop: '4px', padding: '12px', backgroundColor: '#F0FDF4', borderRadius: '12px', border: '1px solid #DCFCE7', fontSize: '13px' }}>
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
                                                const actorLabel = h.actorRole === 'EMPLOYER' ? 'Nhà tuyển dụng' : (h.actorRole === 'CANDIDATE' ? 'Bạn' : 'Hệ thống');

                                                events.push({
                                                    date: h.createdAt,
                                                    title: eventTitle,
                                                    note: detailedNote,
                                                    type: eventType,
                                                    status: h.status,
                                                    actor: actorLabel,
                                                    icon: h.actorRole === 'EMPLOYER' ? Building2 : (h.actorRole === 'CANDIDATE' ? User : CheckCircle2)
                                                });
                                            });

                                            if (app.status === 'CANCELLED') {
                                                events.push({
                                                    date: app.updatedAt,
                                                    title: 'Đã rút hồ sơ',
                                                    note: app.rejectionReason || 'Bạn đã chủ động rút hồ sơ ứng tuyển này.',
                                                    type: 'CANDIDATE_RESPONSE',
                                                    color: '#64748b',
                                                    actor: 'Bạn',
                                                    icon: X
                                                });
                                            }

                                            if (!events.some(e => e.status === 'APPLIED')) {
                                                events.push({
                                                    date: app.createdAt,
                                                    title: 'Nộp hồ sơ thành công',
                                                    note: 'Hồ sơ của bạn đã được gửi đến đội ngũ tuyển dụng.',
                                                    type: 'STATUS_CHANGE',
                                                    status: 'APPLIED',
                                                    actor: 'Bạn',
                                                    icon: FileText
                                                });
                                            }

                                            return events
                                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                                .map((e, i) => {
                                                    const Icon = e.icon || Activity;
                                                    return (
                                                        <div key={i} style={{ display: 'flex', gap: '20px', position: 'relative' }}>
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                                                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: i === 0 ? '#eff6ff' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', border: i === 0 ? '2px solid #3b82f6' : '1px solid #e2e8f0' }}>
                                                                    <Icon size={16} color={i === 0 ? '#3b82f6' : '#94a3b8'} />
                                                                </div>
                                                                {i !== events.length - 1 && <div style={{ width: '2px', flex: 1, backgroundColor: '#e2e8f0', margin: '4px 0' }}></div>}
                                                            </div>
                                                            <div style={{ flex: 1, paddingBottom: '24px' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{e.title}</span>
                                                                    {i === 0 && <span style={{ fontSize: '10px', fontWeight: 900, color: '#10b981', backgroundColor: '#dcfce7', padding: '2px 6px', borderRadius: '4px' }}>NEW</span>}
                                                                </div>
                                                                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>
                                                                    {new Date(e.date).toLocaleString()} • {e.actor}
                                                                </div>
                                                                {e.note && (
                                                                    <div style={{
                                                                        fontSize: '13px',
                                                                        color: '#475569',
                                                                        lineHeight: 1.6,
                                                                        padding: '14px',
                                                                        backgroundColor: e.actor === 'Bạn' ? '#eff6ff' : (e.actor === 'Hệ thống' ? '#f8fafc' : '#fcfdfe'),
                                                                        borderRadius: '16px',
                                                                        border: '1px solid #e2e8f0',
                                                                        borderLeft: `4px solid ${e.actor === 'Bạn' ? '#3b82f6' : (e.actor === 'Hệ thống' ? '#94a3b8' : '#10b981')}`,
                                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                                                    }}>
                                                                        <div style={{
                                                                            fontSize: '10px',
                                                                            fontWeight: 900,
                                                                            color: e.actor === 'Bạn' ? '#3b82f6' : (e.actor === 'Hệ thống' ? '#64748b' : '#059669'),
                                                                            textTransform: 'uppercase',
                                                                            marginBottom: '6px',
                                                                            letterSpacing: '0.025em',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '4px'
                                                                        }}>
                                                                            {e.actor === 'Bạn' ? <User size={10} /> : (e.actor === 'Hệ thống' ? <Activity size={10} /> : <Building2 size={10} />)}
                                                                            {e.actor === 'Bạn' ? 'Lời nhắn của bạn' : (e.actor === 'Hệ thống' ? 'Thông báo hệ thống' : 'Phản hồi từ nhà tuyển dụng')}
                                                                        </div>
                                                                        <div style={{ color: '#1e293b', fontWeight: 500 }}>
                                                                            {typeof e.note === 'string' ? `\u201C${e.note}\u201D` : e.note}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                });
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Company & CV Quick Access */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                            {/* Company Card */}
                            <div style={{ backgroundColor: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                                <div style={{ height: '100px', backgroundColor: '#0f172a', position: 'relative' }}>
                                    {job?.company?.coverUrl ? (
                                        <img src={job.company.coverUrl} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(45deg, #0f172a 0%, #1e293b 100%)' }} />
                                    )}
                                    <div style={{ position: 'absolute', bottom: '-28px', left: '24px', width: '64px', height: '64px', backgroundColor: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.1)', border: '4px solid white', overflow: 'hidden' }}>
                                        {job?.company?.logoUrl ? (
                                            <img src={job.company.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
                                        ) : (
                                            <Building2 size={32} color="#0f172a" />
                                        )}
                                    </div>
                                </div>
                                <div style={{ padding: '44px 24px 24px 24px' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>{job?.company?.name}</h3>
                                    <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0', fontWeight: 500 }}>{job?.company?.industry || "Technology Sector"}</p>
                                    <Link
                                        href={`/candidate/companies/${job?.company?.id}`}
                                        style={{ width: '100%', padding: '12px', backgroundColor: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}
                                    >
                                        Company Profile <ChevronRight size={14} />
                                    </Link>
                                </div>
                            </div>

                            {/* Job Quick Info */}
                            <div style={{ backgroundColor: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '24px' }}>
                                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 20px 0' }}>Job Details</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <MapPin size={16} color="#64748b" />
                                        <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>{job?.workLocation || 'Not specified'}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <DollarSign size={16} color="#64748b" />
                                        <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>{job?.minSalary ? `$${job.minSalary / 1000}k - $${job.maxSalary / 1000}k` : 'Negotiable'}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <Briefcase size={16} color="#64748b" />
                                        <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>{job?.type || 'Full-time'}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsJobModalOpen(true)}
                                    style={{ width: '100%', marginTop: '20px', padding: '10px', backgroundColor: 'transparent', color: '#5C9AFF', border: '1px solid #eff6ff', borderRadius: '10px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>
                                    View Full Description
                                </button>
                            </div>

                            {/* Submitted CV Card */}
                            <div style={{ backgroundColor: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                    <FileText size={16} color="#64748b" />
                                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>My Profile</h3>
                                </div>
                                <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                    <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>{app.cv?.cvTitle || "Standard CV"}</h4>
                                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 12px 0', fontWeight: 600 }}>Submitted on {new Date(app.createdAt).toLocaleDateString()}</p>
                                    <button
                                        onClick={() => setIsCvModalOpen(true)}
                                        style={{ width: '100%', padding: '8px', backgroundColor: 'white', color: '#5C9AFF', border: '1px solid #dbeafe', borderRadius: '8px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>
                                        View CV Preview
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {isChatOpen && currentUser && (
                    <ChatWindow
                        applicationId={app.id}
                        jobId={app.jobId || app.job?.id}
                        candidateId={app.candidateId}
                        companyId={app.job?.companyId}
                        currentUser={{
                            id: currentUser.id,
                            name: `${currentUser.firstName} ${currentUser.lastName}`,
                            role: currentUser.role
                        }}
                        onClose={() => setIsChatOpen(false)}
                    />
                )}

                <ScreeningAnswersModal
                    isOpen={isAnswersModalOpen}
                    onClose={() => setIsAnswersModalOpen(false)}
                    answers={app.answers}
                />

                <JobDetailModal
                    isOpen={isJobModalOpen}
                    onClose={() => setIsJobModalOpen(false)}
                    job={app.job}
                />

                {/* Reschedule Request Modal */}
                {isRescheduleModalOpen && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(15, 23, 42, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1100,
                        backdropFilter: 'blur(8px)',
                        padding: '20px'
                    }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            style={{
                                backgroundColor: 'white',
                                width: '100%',
                                maxWidth: '500px',
                                borderRadius: '24px',
                                padding: '32px',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', backgroundColor: '#fff7ed', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Calendar size={20} color="#ea580c" />
                                    </div>
                                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Reschedule Request</h3>
                                </div>
                                <button onClick={() => setIsRescheduleModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                                    <X size={24} />
                                </button>
                            </div>

                            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px', lineHeight: 1.6 }}>
                                Please let the employer know why you need to reschedule and propose an alternative time if possible.
                            </p>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Your message / Proposed time</label>
                                <textarea
                                    value={rescheduleFeedback}
                                    onChange={(e) => setRescheduleFeedback(e.target.value)}
                                    placeholder="Example: I am busy at the proposed time. Can we move it to Friday at 2:00 PM?"
                                    style={{
                                        width: '100%',
                                        height: '120px',
                                        padding: '16px',
                                        borderRadius: '16px',
                                        border: '1.5px solid #e2e8f0',
                                        fontSize: '14px',
                                        fontFamily: 'inherit',
                                        resize: 'none',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#5C9AFF'}
                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => setIsRescheduleModalOpen(false)}
                                    style={{ flex: 1, padding: '12px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleConfirmInterview(selectedInterviewId!, 'RESCHEDULE_REQUESTED', rescheduleFeedback)}
                                    disabled={!rescheduleFeedback.trim()}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        backgroundColor: '#5C9AFF',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '14px',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        opacity: !rescheduleFeedback.trim() ? 0.7 : 1
                                    }}
                                >
                                    Send Request
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Negotiate Offer Modal */}
                {isNegotiateOfferModalOpen && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(15, 23, 42, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1100,
                        backdropFilter: 'blur(8px)',
                        padding: '20px'
                    }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            style={{
                                backgroundColor: 'white',
                                width: '100%',
                                maxWidth: '500px',
                                borderRadius: '24px',
                                padding: '32px',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', backgroundColor: '#f0fdf4', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <DollarSign size={20} color="#16a34a" />
                                    </div>
                                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Thương lượng Offer</h3>
                                </div>
                                <button onClick={() => setIsNegotiateOfferModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                                    <X size={24} />
                                </button>
                            </div>

                            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px', lineHeight: 1.6 }}>
                                Bạn có thể đề xuất mức lương mong muốn hoặc trao đổi thêm về các quyền lợi khác với nhà tuyển dụng.
                            </p>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Nội dung đề xuất / Mức lương mong muốn</label>
                                <textarea
                                    value={negotiateOfferFeedback}
                                    onChange={(e) => setNegotiateOfferFeedback(e.target.value)}
                                    placeholder="VD: Em mong muốn mức lương X hoặc muốn trao đổi thêm về chế độ remote..."
                                    style={{
                                        width: '100%',
                                        height: '120px',
                                        padding: '16px',
                                        borderRadius: '16px',
                                        border: '1.5px solid #e2e8f0',
                                        fontSize: '14px',
                                        fontFamily: 'inherit',
                                        resize: 'none',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#5C9AFF'}
                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => setIsNegotiateOfferModalOpen(false)}
                                    style={{ flex: 1, padding: '12px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={() => handleConfirmOffer(offer.id, 'NEGOTIATED', negotiateOfferFeedback)}
                                    disabled={isSubmittingNegotiation || !negotiateOfferFeedback.trim()}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        backgroundColor: '#22c55e',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '14px',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        opacity: isSubmittingNegotiation || !negotiateOfferFeedback.trim() ? 0.7 : 1
                                    }}
                                >
                                    {isSubmittingNegotiation ? <Loader2 size={18} className="animate-spin" /> : "Gửi đề xuất"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Withdraw Request Modal */}
                {isWithdrawModalOpen && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(15, 23, 42, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1100,
                        backdropFilter: 'blur(8px)',
                        padding: '20px'
                    }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            style={{
                                backgroundColor: 'white',
                                width: '100%',
                                maxWidth: '500px',
                                borderRadius: '24px',
                                padding: '32px',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', backgroundColor: '#fff1f2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <AlertCircle size={20} color="#e11d48" />
                                    </div>
                                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Withdraw Application</h3>
                                </div>
                                <button onClick={() => setIsWithdrawModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                                    <X size={24} />
                                </button>
                            </div>

                            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px', lineHeight: 1.6 }}>
                                Are you sure you want to withdraw this application? This action will send a request to the employer and cannot be undone once accepted.
                            </p>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Reason for withdrawing (required)</label>
                                <textarea
                                    value={withdrawReason}
                                    onChange={(e) => setWithdrawReason(e.target.value)}
                                    placeholder="Example: I have accepted another job, or personal reasons..."
                                    style={{
                                        width: '100%',
                                        height: '120px',
                                        padding: '16px',
                                        borderRadius: '16px',
                                        border: '1.5px solid #e2e8f0',
                                        fontSize: '14px',
                                        fontFamily: 'inherit',
                                        resize: 'none',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#5C9AFF'}
                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => setIsWithdrawModalOpen(false)}
                                    style={{ flex: 1, padding: '12px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
                                >
                                    Go Back
                                </button>
                                <button
                                    onClick={handleRequestWithdraw}
                                    disabled={isSubmittingWithdraw}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        backgroundColor: '#e11d48',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '14px',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        opacity: isSubmittingWithdraw ? 0.7 : 1
                                    }}
                                >
                                    {isSubmittingWithdraw ? <Loader2 size={18} className="animate-spin" /> : "Submit Withdrawal Request"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* CV Modal Popup - Professional Paper Layout */}
                {isCvModalOpen && (
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
                        zIndex: 1000,
                        backdropFilter: 'blur(12px)',
                        padding: '20px'
                    }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            style={{
                                backgroundColor: 'white',
                                width: '100%',
                                maxWidth: '950px',
                                maxHeight: '95vh',
                                borderRadius: '40px',
                                overflowY: 'auto',
                                position: 'relative',
                                boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.3)',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>

                            {/* Modal Header Controls */}
                            <div style={{ position: 'sticky', top: 0, right: 0, left: 0, padding: '24px 48px', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ height: '40px', width: '40px', backgroundColor: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FileText size={20} color="#5C9AFF" />
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', margin: 0 }}>Detailed Application Profile</h2>
                                        <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI-Powered Smart Preview</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <button style={{ padding: '12px 24px', backgroundColor: '#5C9AFF', color: 'white', border: 'none', borderRadius: '14px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)' }}>
                                        <Download size={18} /> Download PDF
                                    </button>
                                    <button onClick={() => setIsCvModalOpen(false)} style={{ padding: '12px', backgroundColor: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s' }}>
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* CV Paper Content */}
                            <div style={{ padding: '60px 80px' }}>
                                {/* Header Section */}
                                <div style={{ marginBottom: '60px', position: 'relative' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1 }}>
                                            <h1 style={{ fontSize: '56px', fontWeight: 900, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.04em', lineHeight: 1 }}>
                                                {app.candidate?.firstName} {app.candidate?.lastName}
                                            </h1>
                                            <p style={{ fontSize: '20px', fontWeight: 700, color: '#5C9AFF', margin: '0 0 32px', letterSpacing: '0.02em' }}>{app.cv?.cvTitle}</p>

                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', color: '#475569', fontSize: '14px', fontWeight: 600 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={14} color="#64748b" /></div>
                                                    {app.candidate?.email}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MapPin size={14} color="#64748b" /></div>
                                                    {app.candidate?.address || "Address not updated"}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Phone size={14} color="#64748b" /></div>
                                                    {app.candidate?.phone || "Phone not updated"}
                                                </div>
                                            </div>
                                        </div>

                                        {app.cv?.avatar && (
                                            <div style={{ width: '160px', height: '160px', borderRadius: '32px', overflow: 'hidden', border: '8px solid white', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', backgroundColor: '#f1f5f9' }}>
                                                <img src={app.cv.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ height: '4px', width: '100%', background: 'linear-gradient(to right, #5C9AFF, #eff6ff)', borderRadius: '2px', marginTop: '40px' }}></div>
                                </div>

                                {/* Summary Section */}
                                <div style={{ marginBottom: '56px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                        <div style={{ width: '32px', height: '32px', backgroundColor: '#0f172a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={16} color="white" /></div>
                                        <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', margin: 0, letterSpacing: '0.1em' }}>Personal Summary</h3>
                                    </div>
                                    <p style={{ fontSize: '16px', color: '#334155', lineHeight: 1.8, textAlign: 'justify', backgroundColor: '#f8fafc', padding: '32px', borderRadius: '24px', borderLeft: '4px solid #5C9AFF' }}>
                                        {app.cv?.summary || "No personal summary provided."}
                                    </p>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '64px' }}>
                                    {/* Main Body: Experience & Projects */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}>

                                        {/* Work Experience Section */}
                                        <section>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', borderBottom: '2px solid #0f172a', paddingBottom: '12px' }}>
                                                <Briefcase size={20} color="#0f172a" />
                                                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', margin: 0, letterSpacing: '0.05em' }}>Work Experience</h3>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                                                {app.cv?.experiences?.length > 0 ? app.cv.experiences.map((exp: any, i: number) => (
                                                    <div key={i} style={{ position: 'relative', paddingLeft: '24px', borderLeft: '2px solid #e2e8f0' }}>
                                                        <div style={{ position: 'absolute', left: '-7px', top: '0', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#5C9AFF', border: '3px solid white', boxShadow: '0 0 0 2px #eff6ff' }}></div>

                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                                            <div>
                                                                <h4 style={{ fontSize: '19px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{exp.position}</h4>
                                                                <p style={{ fontSize: '15px', fontWeight: 700, color: '#5C9AFF', margin: '4px 0 0' }}>{exp.companyName}</p>
                                                            </div>
                                                            <div style={{ textAlign: 'right' }}>
                                                                <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', backgroundColor: '#f1f5f9', padding: '6px 14px', borderRadius: '100px', display: 'inline-block' }}>
                                                                    <Calendar size={12} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                                                                    {new Date(exp.startDate).toLocaleDateString('en-US')} — {exp.isCurrent ? 'Present' : (exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US') : '')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>{exp.description}</p>
                                                    </div>
                                                )) : (
                                                    <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No experience updated yet.</p>
                                                )}
                                            </div>
                                        </section>

                                        {/* Projects Section */}
                                        {app.cv?.projects?.length > 0 && (
                                            <section>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', borderBottom: '2px solid #0f172a', paddingBottom: '12px' }}>
                                                    <Layers size={20} color="#0f172a" />
                                                    <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', margin: 0, letterSpacing: '0.05em' }}>Key Projects</h3>
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                                                    {app.cv.projects.map((proj: any, i: number) => (
                                                        <div key={i} style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                                <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{proj.name}</h4>
                                                                <span style={{ fontSize: '11px', fontWeight: 800, color: '#5C9AFF', backgroundColor: '#eff6ff', padding: '4px 12px', borderRadius: '100px' }}>{proj.role}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                                                <Target size={14} color="#64748b" />
                                                                <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, margin: 0 }}>{proj.techStack}</p>
                                                            </div>
                                                            {proj.url && (
                                                                <a href={proj.url} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: '#5C9AFF', textDecoration: 'none', fontWeight: 700 }}>
                                                                    View Project Details ↗
                                                                </a>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </section>
                                        )}
                                    </div>

                                    {/* Sidebar Column: Skills & Education */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}>

                                        {/* Expertise Section */}
                                        <section style={{ backgroundColor: '#0f172a', padding: '32px', borderRadius: '32px', color: 'white', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                                <Target size={20} color="#5C9AFF" />
                                                <h3 style={{ fontSize: '16px', fontWeight: 900, textTransform: 'uppercase', margin: 0, letterSpacing: '0.05em' }}>Expertise & Skills</h3>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                                {app.cv?.skills?.length > 0 ? app.cv.skills.map((s: any, i: number) => (
                                                    <div key={i}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>{s.name}</span>
                                                            <span style={{ fontSize: '11px', fontWeight: 900, color: '#5C9AFF' }}>{s.level}</span>
                                                        </div>
                                                        <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                                            <div style={{
                                                                height: '100%',
                                                                backgroundColor: '#5C9AFF',
                                                                width: s.level === 'Expert' ? '100%' : (s.level === 'Intermediate' ? '70%' : '40%'),
                                                                boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)',
                                                                transition: 'width 1s ease-out'
                                                            }} />
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <p style={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', fontSize: '13px' }}>No skills updated yet.</p>
                                                )}
                                            </div>
                                        </section>

                                        {/* Education Section */}
                                        <section>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '2px solid #0f172a', paddingBottom: '12px' }}>
                                                <GraduationCap size={20} color="#0f172a" />
                                                <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', margin: 0, letterSpacing: '0.05em' }}>Educational Background</h3>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                                {app.cv?.educations?.length > 0 ? app.cv.educations.map((edu: any, i: number) => (
                                                    <div key={i}>
                                                        <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>{edu.degree}</h4>
                                                        <p style={{ fontSize: '14px', color: '#5C9AFF', fontWeight: 700, margin: '0 0 8px' }}>{edu.major || edu.fieldOfStudy}</p>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{edu.schoolName}</span>
                                                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>{edu.gradYear || (edu.endDate ? new Date(edu.endDate).getFullYear() : '')}</span>
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '13px' }}>No education updated yet.</p>
                                                )}
                                            </div>
                                        </section>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div style={{ padding: '40px 80px', backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                                <button
                                    onClick={() => setIsCvModalOpen(false)}
                                    style={{ padding: '16px 64px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '18px', fontSize: '15px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.4)' }}
                                >
                                    Close Preview
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
            {/* Onboarding Details Modal */}
            {isOnboardingModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        style={{ backgroundColor: 'white', width: '100%', maxWidth: '600px', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
                    >
                        {/* Header */}
                        <div style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', padding: '40px 32px', textAlign: 'center', color: 'white', position: 'relative' }}>
                            <button 
                                onClick={() => setIsOnboardingModalOpen(false)}
                                style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
                            >
                                <X size={20} />
                            </button>
                            <div style={{ width: '64px', height: '64px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', backdropFilter: 'blur(4px)' }}>
                                <Award size={32} color="white" />
                            </div>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Chào mừng bạn đến với {job?.company?.name || "công ty mới"}!</h2>
                            <p style={{ fontSize: '15px', opacity: 0.9, marginTop: '8px' }}>Dưới đây là các thông tin chi tiết về hành trình nhận việc của bạn.</p>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
                            {/* Step 1: Time & Location */}
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ width: '40px', height: '40px', backgroundColor: '#f0fdf4', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Calendar size={20} color="#16a34a" />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>Thời gian & Địa điểm</h4>
                                    <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                                        <strong>Thời gian:</strong> 08:30 AM, Thứ Hai tuần tới (hoặc theo thỏa thuận)<br />
                                        <strong>Địa điểm:</strong> {job?.location || "Trụ sở chính của công ty"}
                                    </p>
                                </div>
                            </div>

                            {/* Step 2: Documents */}
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ width: '40px', height: '40px', backgroundColor: '#f0fdf4', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <FileText size={20} color="#16a34a" />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>Hồ sơ cần chuẩn bị</h4>
                                    <ul style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, margin: 0, paddingLeft: '20px' }}>
                                        <li>Căn cước công dân (Bản sao công chứng)</li>
                                        <li>Bằng cấp liên quan (Bản sao)</li>
                                        <li>Sổ hộ khẩu hoặc xác nhận cư trú</li>
                                        <li>Ảnh thẻ 3x4 (2 tấm)</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Step 3: Contact */}
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ width: '40px', height: '40px', backgroundColor: '#f0fdf4', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <User size={20} color="#16a34a" />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>Người liên hệ trực tiếp</h4>
                                    <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                                        <strong>Họ tên:</strong> Bộ phận Nhân sự (HR Department)<br />
                                        <strong>Email:</strong> hr@{job?.company?.name?.toLowerCase().replace(/\s/g, '') || 'company'}.com
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{ padding: '24px 32px 32px', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                            <button 
                                onClick={() => setIsOnboardingModalOpen(false)}
                                style={{ padding: '14px 48px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(22, 163, 74, 0.2)' }}
                            >
                                Tôi đã hiểu
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
