"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ChevronLeft,
    Users,
    Edit2,
    Archive,
    Eye,
    MapPin,
    Clock,
    DollarSign,
    Calendar,
    Target,
    Layers,
    Award,
    Sparkles,
    CheckCircle2,
    ChevronRight,
    Plus,
    UserPlus,
    FileText,
    BrainCircuit,
    ArrowRight,
    MoreHorizontal,
    Filter,
    X,
    Check,
    Zap,
    Mail,
    Phone,
    Download,
    MessageSquare,
    AlertTriangle,
    BarChart3,
    ArrowUpRight,
    Briefcase,
    Bell,
    Mail as MailIcon,
    Smartphone
} from "lucide-react";
import { jobService } from "@/services/job.service";
import { apiRequest } from "@/lib/api";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import CandidateInsightDrawer from "@/components/candidate/candidate-insight-drawer";
import { interviewService } from "@/services/interview.service";
import { offerService } from "@/services/offer.service";
import { useAuthStore } from "@/store/authStore";
import { ChatWindow } from "@/components/shared/ChatWindow";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { socketService } from "@/services/socket.service";
import JobCreateModal from "@/components/modals/JobCreateModal";

const TemplateSelector = ({ templates, onSelect }: { templates: string[], onSelect: (t: string) => void }) => {
    if (!templates || templates.length === 0) return null;
    return (
        <div style={{ marginBottom: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {templates.map((t, i) => (
                <button 
                    key={i} 
                    onClick={() => onSelect(t)}
                    style={{ 
                        padding: '6px 12px', 
                        fontSize: '11px', 
                        backgroundColor: '#F1F5F9', 
                        border: '1px solid #E2E8F0', 
                        borderRadius: '8px', 
                        color: '#475569', 
                        cursor: 'pointer',
                        fontWeight: 600,
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E2E8F0'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F1F5F9'; }}
                >
                    Template {i + 1}
                </button>
            ))}
        </div>
    );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, candidateName, targetStatus, jobTitle }: any) => {
    const [note, setNote] = useState("");
    
    useEffect(() => {
        setNote("");
    }, [isOpen]);

    if (!isOpen) return null;

    const templates = {
        INVITED: [
            `Hello ${candidateName}, thank you for your interest in the ${jobTitle} position. We have reviewed your profile and are very impressed. We would like to invite you to a follow-up interview to discuss the role in more detail.`,
            `Thank you ${candidateName} for applying for the ${jobTitle} position. Your profile has passed the initial screening. Our HR department will contact you within the next 1-2 days to arrange a specific appointment.`
        ],
        HIRED: [
            `Welcome ${candidateName} officially to the company! We believe you will be a great addition to the team. See you on your first day of work.`,
            `Congratulations on successfully completing the recruitment process and becoming an official employee of the company. HR will send you instructions on how to prepare for onboarding soon.`
        ]
    };

    const currentTemplates = templates[targetStatus as keyof typeof templates] || [];
    
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div style={{ backgroundColor: 'white', borderRadius: '32px', width: '480px', padding: '40px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                <div style={{ width: '64px', height: '64px', backgroundColor: '#EFF6FF', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: '#5C9AFF' }}><Bell size={32} /></div>
                <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginBottom: '12px' }}>Confirm Move</h3>
                <p style={{ fontSize: '15px', color: '#64748B', lineHeight: 1.6, marginBottom: '24px' }}>Move <strong>{candidateName}</strong> to stage <strong>{targetStatus}</strong>?</p>
                
                <div style={{ marginBottom: '32px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px', display: 'block' }}>Notes / Description (Optional)</label>
                    <TemplateSelector templates={currentTemplates} onSelect={(t) => setNote(t)} />
                    <textarea 
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Enter notes or a message for the candidate..."
                        style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', minHeight: '100px', resize: 'vertical', fontSize: '14px' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: '16px', border: '1px solid #E2E8F0', backgroundColor: 'white', color: '#475569', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                    <button onClick={() => onConfirm(note)} style={{ flex: 1, padding: '14px', borderRadius: '16px', border: 'none', backgroundColor: '#5C9AFF', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Confirm</button>
                </div>
            </div>
        </div>
    );
};

const InterviewScheduleModal = ({ isOpen, onClose, onConfirm, candidateName, initialData, jobTitle }: any) => {
    const [date, setDate] = useState(initialData?.scheduledAt ? new Date(initialData.scheduledAt).toISOString().split('T')[0] : "");
    const [time, setTime] = useState(initialData?.scheduledAt ? new Date(initialData.scheduledAt).toTimeString().split(' ')[0].substring(0, 5) : "");
    const [location, setLocation] = useState(initialData?.location || "");
    const [type, setType] = useState(initialData?.type || "Technical Interview");
    const [notes, setNotes] = useState(initialData?.notes || "");

    useEffect(() => {
        if (!isOpen) {
            setDate(initialData?.scheduledAt ? new Date(initialData.scheduledAt).toISOString().split('T')[0] : "");
            setTime(initialData?.scheduledAt ? new Date(initialData.scheduledAt).toTimeString().split(' ')[0].substring(0, 5) : "");
            setLocation(initialData?.location || "");
            setNotes(initialData?.notes || "");
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const templates = [
        `Hello ${candidateName}, on behalf of the company, I would like to invite you to an interview for the ${jobTitle} position. Time: ${time || '___'}, Date: ${date || '___'}. Location: ${location || '___'}. Please confirm if you can attend.`,
        `Interview Invitation: Position ${jobTitle}. We cordially invite you to an interview at ${location || '___'} at ${time || '___'} on ${date || '___'}. Please bring your CV and relevant documents if any.`
    ];

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div style={{ backgroundColor: 'white', borderRadius: '32px', width: '540px', padding: '40px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                <div style={{ width: '64px', height: '64px', backgroundColor: '#F0F9FF', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: '#0369A1' }}><Calendar size={32} /></div>
                <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>Schedule Interview</h3>
                <p style={{ fontSize: '15px', color: '#64748B', marginBottom: '32px' }}>Schedule an interview for <strong>{candidateName}</strong></p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '40px' }}>
                    <div style={{ padding: '24px', backgroundColor: '#F8FAFC', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#0369A1', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Interview Details</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '8px', display: 'block' }}>Date</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', backgroundColor: 'white' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '8px', display: 'block' }}>Time</label>
                                <input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', backgroundColor: 'white' }} />
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '8px', display: 'block' }}>Location / Meeting Link</label>
                            <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Company office or Google Meet link" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', backgroundColor: 'white' }} />
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px', display: 'block' }}>Notes / Message for Candidate</label>
                        <TemplateSelector templates={templates} onSelect={(t) => setNotes(t)} />
                        <textarea 
                            value={notes} 
                            onChange={e => setNotes(e.target.value)} 
                            placeholder="Add a friendly message or specific instructions..." 
                            style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', minHeight: '100px', resize: 'vertical', fontSize: '14px' }} 
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: '16px', border: '1px solid #E2E8F0', backgroundColor: 'white', color: '#475569', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                    <button 
                        onClick={() => {
                            const isoString = new Date(`${date}T${time}`).toISOString();
                            onConfirm({ scheduledAt: isoString, location, type, notes });
                        }} 
                        disabled={!date || !time || !location}
                        style={{ flex: 1, padding: '14px', borderRadius: '16px', border: 'none', backgroundColor: '#5C9AFF', color: 'white', fontWeight: 700, cursor: 'pointer', opacity: (!date || !time || !location) ? 0.5 : 1 }}>
                        Confirm & Send Notification
                    </button>
                </div>
            </div>
        </div>
    );
};

const OfferModal = ({ isOpen, onClose, onConfirm, candidateName, initialData, jobTitle }: any) => {
    const [salary, setSalary] = useState(initialData?.salary ? String(initialData.salary) : "");
    const [startDate, setStartDate] = useState(initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : "");
    const [notes, setNotes] = useState(initialData?.notes || "");

    useEffect(() => {
        if (initialData) {
            setSalary(initialData.salary ? String(initialData.salary) : "");
            setStartDate(initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : "");
            setNotes(initialData.notes || "");
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const templates = [
        `Congratulations ${candidateName}, we are pleased to offer you the ${jobTitle} position. The agreed salary is ${salary || '___'} USD with an expected start date of ${startDate || '___'}. Please review the offer and provide us with your feedback.`,
        `Job Offer: After the interview process, the company highly appreciates your ability and would like to invite you to join the ${jobTitle} team. Proposed salary: ${salary || '___'} USD. Start date: ${startDate || '___'}. We look forward to working with you.`
    ];

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div style={{ backgroundColor: 'white', borderRadius: '32px', width: '540px', padding: '40px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                <div style={{ width: '64px', height: '64px', backgroundColor: '#F0FDF4', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: '#16A34A' }}><Award size={32} /></div>
                <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>{initialData ? 'Update Job Offer' : 'Send Job Offer'}</h3>
                <p style={{ fontSize: '15px', color: '#64748B', marginBottom: '32px' }}>Send Offer to <strong>{candidateName}</strong></p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '40px' }}>
                    <div style={{ padding: '24px', backgroundColor: '#F0FDF4', borderRadius: '24px', border: '1px solid #DCFCE7' }}>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#166534', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Offer Details</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '8px', display: 'block' }}>Salary (USD)</label>
                                <input type="number" value={salary} onChange={e => setSalary(e.target.value)} placeholder="e.g. 5000" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', backgroundColor: 'white' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '8px', display: 'block' }}>Expected Start Date</label>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', backgroundColor: 'white' }} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px', display: 'block' }}>Notes / Message for Candidate</label>
                        <TemplateSelector templates={templates} onSelect={(t) => setNotes(t)} />
                        <textarea 
                            value={notes} 
                            onChange={e => setNotes(e.target.value)} 
                            placeholder="Enter a friendly message for the candidate..." 
                            style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', minHeight: '100px', resize: 'vertical', fontSize: '14px' }} 
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: '16px', border: '1px solid #E2E8F0', backgroundColor: 'white', color: '#475569', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                    <button 
                        onClick={() => onConfirm({ salary: Number(salary), startDate, notes })} 
                        disabled={!salary || !startDate}
                        style={{ flex: 1, padding: '14px', borderRadius: '16px', border: 'none', backgroundColor: '#16A34A', color: 'white', fontWeight: 700, cursor: 'pointer', opacity: (!salary || !startDate) ? 0.5 : 1 }}>
                        Confirm & Send Offer
                    </button>
                </div>
            </div>
        </div>
    );
};

const RejectModal = ({ isOpen, onClose, onConfirm, candidateName, jobTitle }: any) => {
    const [reason, setReason] = useState("");

    useEffect(() => {
        if (isOpen) setReason("");
    }, [isOpen]);

    if (!isOpen) return null;

    const templates = [
        `Thank you ${candidateName} for taking the time to apply and interview with the company. After careful consideration, we find that your experience is not yet fully aligned with the current direction of the ${jobTitle} position. We wish you the best in finding a suitable role soon.`,
        `Hello ${candidateName}, we regret to inform you that we cannot move forward with your application for the ${jobTitle} position at this time. However, we will keep your profile in our system and contact you if a more suitable position arises. We wish you much success.`
    ];

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div style={{ backgroundColor: 'white', borderRadius: '32px', width: '540px', padding: '40px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                <div style={{ width: '64px', height: '64px', backgroundColor: '#FEF2F2', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: '#EF4444' }}><X size={32} /></div>
                <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>Reject Candidate</h3>
                <p style={{ fontSize: '15px', color: '#64748B', marginBottom: '32px' }}>Please enter the rejection reason for <strong>{candidateName}</strong> so they are informed.</p>
                
                <div style={{ marginBottom: '40px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px', display: 'block' }}>Rejection Reason</label>
                    <TemplateSelector templates={templates} onSelect={(t) => setReason(t)} />
                    <textarea 
                        value={reason} 
                        onChange={e => setReason(e.target.value)} 
                        placeholder="e.g. Professional experience does not meet current requirements..." 
                        style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', minHeight: '120px', resize: 'vertical', fontSize: '14px', lineHeight: 1.6 }} 
                    />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: '16px', border: '1px solid #E2E8F0', backgroundColor: 'white', color: '#475569', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                    <button 
                        onClick={() => onConfirm(reason)} 
                        disabled={!reason.trim()}
                        style={{ flex: 1, padding: '14px', borderRadius: '16px', border: 'none', backgroundColor: '#EF4444', color: 'white', fontWeight: 700, cursor: 'pointer', opacity: !reason.trim() ? 0.5 : 1 }}>
                        Confirm Rejection
                    </button>
                </div>
            </div>
        </div>
    );
};

const getWaitingTime = (updatedAt: string) => {
    if (!updatedAt) return "";
    const lastUpdate = new Date(updatedAt);
    const now = new Date();
    const diffInMs = now.getTime() - lastUpdate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMins = Math.floor(diffInMs / (1000 * 60));

    if (diffInDays > 0) return `${diffInDays} days`;
    if (diffInHours > 0) return `${diffInHours} hours`;
    if (diffInMins > 0) return `${diffInMins} mins`;
    return "Just now";
};

export default function JobDetailPage() {
    const { id } = useParams() as { id: string };
    const [job, setJob] = useState<any>(null);
    const [activeTab, setActiveTab] = useState("Responsibilities");
    const [isLoading, setIsLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState<any>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [pendingMove, setPendingMove] = useState<any>(null);
    const { user } = useAuthStore();
    const [selectedChatApp, setSelectedChatApp] = useState<any>(null);
    const [isCloseJobModalOpen, setIsCloseJobModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const fetchJobDetail = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await jobService.getById(id);
            setJob(data);
            
            // Check for appId in query to auto-open drawer
            const urlParams = new URLSearchParams(window.location.search);
            const queryAppId = urlParams.get('appId');
            const currentAppId = queryAppId || selectedAppIdRef.current;

            if (currentAppId && data.applications) {
                const updatedApp = data.applications.find((a: any) => a.id === currentAppId);
                if (updatedApp) {
                    setSelectedApp(updatedApp);
                    if (queryAppId) setIsDrawerOpen(true);
                }
            }
        } catch (error) {
            console.error("Fetch error", error);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    // Ref to track applications for socket listener without triggering useEffect loops
    const appsRef = useRef(job?.applications);
    const selectedAppIdRef = useRef(selectedApp?.id);

    useEffect(() => {
        appsRef.current = job?.applications;
        selectedAppIdRef.current = selectedApp?.id;
    }, [job?.applications, selectedApp?.id]);

    // 1. Initial Data Fetch
    useEffect(() => {
        if (id) fetchJobDetail();
    }, [id, fetchJobDetail]);

    // 2. Real-time Notification & Update Listener
    useEffect(() => {
        const handleNotification = (notif: any) => {
            console.log("JobDetailPage: Received real-time notification", notif);
            const targetJobId = notif.metadata?.jobId;
            const targetAppId = notif.metadata?.applicationId;
            
            if (targetJobId === id) {
                console.log("Notification matches current job. Refreshing...");
                fetchJobDetail();
            } else if (targetAppId) {
                const appExists = appsRef.current?.some((a: any) => a.id === targetAppId);
                if (appExists) {
                    console.log("Notification matches application in current job. Refreshing...");
                    fetchJobDetail();
                }
            }
        };

        const handleApplicationUpdate = (data: any) => {
            console.log("JobDetailPage: Received real-time application update", data);
            if (data.applicationId) {
                const appExists = appsRef.current?.some((a: any) => a.id === data.applicationId);
                if (appExists) {
                    console.log("Update matches application in current job. Refreshing...");
                    fetchJobDetail();
                }
            }
        };

        if (user?.id) {
            socketService.connect(user.id);
            socketService.onNewNotification(handleNotification);
            socketService.onApplicationUpdated(handleApplicationUpdate);
        }

        return () => {
            socketService.offNewNotification(handleNotification);
            socketService.offApplicationUpdated(handleApplicationUpdate);
        };
    }, [id, user?.id, fetchJobDetail]);

    const handleConfirmMove = async (note?: string) => {
        if (!pendingMove) return;
        const { draggableId, targetStatus } = pendingMove;
        
        // Update local UI
        const updatedApps = Array.from(job.applications);
        const appIdx = updatedApps.findIndex((a: any) => a.id === draggableId);
        if (appIdx !== -1) {
            const [moved] = updatedApps.splice(appIdx, 1) as any[];
            moved.status = targetStatus;
            
            if (targetStatus === 'REJECTED' && note) {
                moved.rejectionReason = note;
            } else if (note) {
                moved.note = note; // Store note locally
            }

            updatedApps.push(moved);
            setJob({ ...job, applications: updatedApps });
            try { 
                await apiRequest(`/applications/${draggableId}/status`, "PATCH", { 
                    body: { 
                        status: targetStatus,
                        rejectionReason: targetStatus === 'REJECTED' ? note : undefined,
                        note: targetStatus !== 'REJECTED' ? note : undefined
                    } 
                }); 
                // Always refresh after success to get full backend data
                fetchJobDetail();
            } catch (e) { 
                fetchJobDetail(); 
            }
        }
        setIsConfirmOpen(false);
        setIsRejectModalOpen(false);
        setPendingMove(null);
    };

    const handleScheduleInterview = async (data: any) => {
        if (!pendingMove) return;
        const { draggableId, targetStatus, interviewId } = pendingMove;

        try {
            if (interviewId) {
                // Update existing interview (reschedule)
                await interviewService.update(interviewId, data);
                
                // Optimistic UI for reschedule
                const updatedApps = Array.from(job.applications);
                const appIdx = updatedApps.findIndex((a: any) => a.id === draggableId);
                if (appIdx !== -1) {
                    const app = { ...updatedApps[appIdx] };
                    if (app.interviews && app.interviews.length > 0) {
                        app.interviews = [{ ...app.interviews[0], ...data }, ...app.interviews.slice(1)];
                    }
                    updatedApps[appIdx] = app;
                    setJob({ ...job, applications: updatedApps });
                }
            } else {
                // Create new interview
                await interviewService.schedule({
                    applicationId: draggableId,
                    ...data
                });

                // Update status to INTERVIEWING if not already
                const updatedApps = Array.from(job.applications);
                const appIdx = updatedApps.findIndex((a: any) => a.id === draggableId);
                if (appIdx !== -1) {
                    const [moved] = updatedApps.splice(appIdx, 1) as any[];
                    moved.status = targetStatus;
                    moved.note = data.notes;
                    moved.interviews = [{ ...data, candidateConfirmation: 'PENDING' }];
                    updatedApps.push(moved);
                    setJob({ ...job, applications: updatedApps });
                }
            }
            
            fetchJobDetail();
        } catch (error) {
            console.error("Failed to schedule/update interview", error);
            alert("An error occurred while processing the interview schedule.");
            fetchJobDetail();
        }

        setIsInterviewModalOpen(false);
        setPendingMove(null);
    };

    const handleSendOffer = async (data: any) => {
        if (!pendingMove) return;
        const { draggableId, targetStatus } = pendingMove;

        try {
            // 1. Create Offer
            await offerService.create({
                applicationId: draggableId,
                ...data
            });

            // 2. Update status to OFFER
            const updatedApps = Array.from(job.applications);
            const appIdx = updatedApps.findIndex((a: any) => a.id === draggableId);
            if (appIdx !== -1) {
                const [moved] = updatedApps.splice(appIdx, 1) as any[];
                moved.status = targetStatus;
                moved.note = data.notes;
                updatedApps.push(moved);
                setJob({ ...job, applications: updatedApps });
            }
        } catch (error) {
            console.error("Failed to send offer", error);
            alert("An error occurred while sending the offer.");
            fetchJobDetail();
        }

        setIsOfferModalOpen(false);
        setPendingMove(null);
    };

    const onDragEnd = (result: any) => {
        const { destination, draggableId } = result;
        if (!destination) return;
        
        const app = job.applications.find((a: any) => a.id === draggableId);
        const targetStatus = destination.droppableId;
        
        setPendingMove({ 
            draggableId, 
            targetStatus, 
            candidateName: `${app?.candidate?.firstName || ''} ${app?.candidate?.lastName || ''}`.trim() || 'candidate',
            jobTitle: job.title
        });

        if (targetStatus === 'INTERVIEWING') {
            setIsInterviewModalOpen(true);
        } else if (targetStatus === 'OFFER') {
            setIsOfferModalOpen(true);
        } else if (targetStatus === 'REJECTED') {
            setIsRejectModalOpen(true);
        } else {
            setIsConfirmOpen(true);
        }
    };

    const handleCloseJob = async () => {
        setIsCloseJobModalOpen(true);
    };

    const confirmCloseJob = async () => {
        try {
            await jobService.update(id, { status: 'CLOSED' });
            setIsCloseJobModalOpen(false);
            fetchJobDetail();
        } catch (error) {
            console.error("Failed to close job:", error);
            alert("Could not close the job posting.");
        }
    };

    if (isLoading || !job) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading...</div>;

    const isClosed = job.status === 'CLOSED';

    return (
        <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', padding: '24px 32px', fontFamily: 'Inter, sans-serif', width: '100%', maxWidth: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
            <ConfirmationModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleConfirmMove} candidateName={pendingMove?.candidateName} targetStatus={pendingMove?.targetStatus} jobTitle={pendingMove?.jobTitle} />
            <InterviewScheduleModal isOpen={isInterviewModalOpen} onClose={() => setIsInterviewModalOpen(false)} onConfirm={handleScheduleInterview} candidateName={pendingMove?.candidateName} initialData={pendingMove?.initialData} jobTitle={pendingMove?.jobTitle} />
            <OfferModal isOpen={isOfferModalOpen} onClose={() => setIsOfferModalOpen(false)} onConfirm={handleSendOffer} candidateName={pendingMove?.candidateName} initialData={pendingMove?.initialData} jobTitle={pendingMove?.jobTitle} />
            <RejectModal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} onConfirm={handleConfirmMove} candidateName={pendingMove?.candidateName} jobTitle={pendingMove?.jobTitle} />
            <CandidateInsightDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} application={selectedApp} job={job} />

            {/* Top Navigation & Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px', color: '#64748B' }}>
                        <Link href="/employer/jobs" style={{ textDecoration: 'none', color: 'inherit' }}>Recruitment</Link>
                        <span>›</span>
                        <span style={{ color: '#0F172A', fontWeight: 600 }}>{job.title} {job.campaigns && job.campaigns.length > 0 ? `(${job.campaigns[0].name})` : ''}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>{job.title} {job.campaigns && job.campaigns.length > 0 ? `(${job.campaigns[0].name})` : ''}</h1>
                        <span style={{ 
                            padding: '6px 16px', 
                            backgroundColor: isClosed ? '#fef2f2' : '#ecfdf5', 
                            color: isClosed ? '#dc2626' : '#059669', 
                            borderRadius: '100px', 
                            fontSize: '11px', 
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            border: `1px solid ${isClosed ? '#ef444420' : '#10b98120'}`
                        }}>
                            • {isClosed ? 'CLOSED' : 'ACTIVE RECRUITMENT'}
                        </span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        onClick={() => setIsEditModalOpen(true)}
                        style={{ 
                            padding: '10px 20px', 
                            borderRadius: '12px', 
                            backgroundColor: 'white', 
                            border: '1px solid #E2E8F0', 
                            fontWeight: 700, 
                            cursor: 'pointer', 
                            fontSize: '14px',
                            color: '#0F172A',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        {job.applications && job.applications.length > 0 ? (
                            <>
                                <Eye size={16} /> View Details
                            </>
                        ) : (
                            <>
                                <Edit2 size={16} /> Edit
                            </>
                        )}
                    </button>
                    {!isClosed && (
                        <button 
                            onClick={handleCloseJob}
                            style={{ padding: '10px 24px', borderRadius: '12px', backgroundColor: '#FEF2F2', border: '1px solid #FEE2E2', color: '#EF4444', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>
                            Close Job
                        </button>
                    )}

                </div>
            </div>

            {/* Compact Stats Grid - Forced to fit one row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
                {[
                    { label: 'APPLICANTS', value: job.applications?.length || 0, icon: <Users size={16} />, color: '#5C9AFF' },
                    { 
                        label: 'AI MATCHED', 
                        value: job.applications?.length > 0 
                            ? `${Math.round(job.applications.reduce((acc: number, app: any) => acc + (app.score || 0), 0) / job.applications.length)}%`
                            : '0%', 
                        icon: <Zap size={16} />, 
                        color: '#7C3AED' 
                    },
                    { 
                        label: 'REMAINING', 
                        value: job.expiredAt 
                            ? `${Math.max(0, Math.ceil((new Date(job.expiredAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} Days`
                            : job.status === 'CLOSED' ? 'Closed' : 'No Limit', 
                        icon: <Clock size={16} />, 
                        color: '#D97706' 
                    }
                ].map((item, idx) => (
                    <div key={idx} style={{ padding: '20px', backgroundColor: 'white', borderRadius: '20px', border: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 900, color: '#94A3B8', letterSpacing: '0.05em' }}>{item.label}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>
                            <div style={{ color: item.color }}>{item.icon}</div>
                            {item.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Applicant Table - Always fits width */}
            <div style={{ marginBottom: '48px', width: '100%' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '20px' }}>Featured Candidates</h3>
                <div style={{ backgroundColor: 'white', borderRadius: '24px', border: '1px solid #F1F5F9', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody style={{ fontSize: '14px' }}>
                            {(job.applications || []).sort((a: any, b: any) => b.score - a.score).slice(0, 5).map((app: any) => (
                                <tr key={app.id} onClick={() => { setSelectedApp(app); setIsDrawerOpen(true); }} style={{ borderBottom: '1px solid #F8FAFC', cursor: 'pointer', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FBFDFF'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <td style={{ padding: '14px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#64748B' }}>{app.candidate?.firstName?.[0]}</div>
                                            <span style={{ fontWeight: 700 }}>{app.candidate?.firstName} {app.candidate?.lastName}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px 24px', textAlign: 'center' }}>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#5C9AFF', fontWeight: 800, backgroundColor: '#EFF6FF', padding: '4px 10px', borderRadius: '100px', fontSize: '12px' }}>
                                            <Zap size={12} fill="#5C9AFF" /> {Math.round(app.score)}% AI Score
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px 24px', textAlign: 'center', fontWeight: 700, fontSize: '12px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <span style={{ 
                                                color: 
                                                    app.status === 'APPLIED' ? '#5C9AFF' : 
                                                    app.status === 'INVITED' ? '#7c3aed' :
                                                    app.status === 'INTERVIEWING' ? '#ea580c' : 
                                                    app.status === 'OFFER' ? '#22c55e' :
                                                    app.status === 'HIRED' ? '#0d9488' :
                                                    app.status === 'REJECTED' ? '#94a3b8' :
                                                    app.status === 'CANCELLED' ? '#475569' : '#64748b'
                                            }}>{app.status}</span>
                                            <span style={{ fontSize: '10px', fontWeight: 500, color: '#94A3B8', marginTop: '2px' }}>
                                                <Clock size={10} style={{ marginRight: '4px', display: 'inline' }} />
                                                Waiting: {getWaitingTime(app.updatedAt)}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedChatApp(app);
                                                }}
                                                style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#F1F5F9', border: 'none', color: '#64748B', cursor: 'pointer' }}
                                                title="Chat with candidate"
                                            >
                                                <MessageSquare size={16} />
                                            </button>
                                            <ChevronRight size={20} color="#CBD5E1" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pipeline Section - The ONLY area allowed to horizontal scroll */}
            <div style={{ marginBottom: '48px', width: '100%' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '20px' }}>Pipeline Management</h3>
                <div style={{ overflowX: 'auto', paddingBottom: '16px', margin: '0 -8px', padding: '0 8px', scrollbarWidth: 'thin' }}>
                    <DragDropContext onDragEnd={onDragEnd}>
                        <div style={{ display: 'flex', gap: '20px', minWidth: 'max-content' }}>
                            {['APPLIED', 'REJECTED', 'CANCELLED', 'INVITED', 'INTERVIEWING', 'OFFER', 'HIRED'].map(stage => {
                                const stageApps = job.applications?.filter((app: any) => {
                                    if (stage === 'INTERVIEWING') {
                                        return ['INTERVIEWING', 'INTERVIEW_CONFIRMED', 'RESCHEDULE_REQUESTED', 'INTERVIEW_UPDATED'].includes(app.status);
                                    }
                                    if (stage === 'OFFER') {
                                        return ['OFFER', 'OFFER_CONFIRMED', 'OFFER_NEGOTIATED'].includes(app.status);
                                    }
                                    return app.status === stage;
                                }) || [];
                                const stageColor = 
                                    stage === 'APPLIED' ? '#5C9AFF' : 
                                    stage === 'INVITED' ? '#7c3aed' :
                                    stage === 'INTERVIEWING' ? '#ea580c' : 
                                    stage === 'OFFER' ? '#22c55e' :
                                    stage === 'HIRED' ? '#0d9488' :
                                    stage === 'REJECTED' ? '#94a3b8' :
                                    stage === 'CANCELLED' ? '#475569' : '#64748b';
                                return (
                                    <div key={stage} style={{ width: '280px' }}>
                                        <div style={{ 
                                            marginBottom: '12px', 
                                            padding: '0 8px', 
                                            fontSize: '11px', 
                                            fontWeight: 900, 
                                            color: stageColor, 
                                            textTransform: 'uppercase', 
                                            letterSpacing: '0.05em',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}>
                                            <span>{stage}</span>
                                            <span style={{ backgroundColor: `${stageColor}15`, padding: '2px 8px', borderRadius: '6px' }}>{stageApps.length}</span>
                                        </div>
                                        <Droppable droppableId={stage}>
                                            {(provided, snapshot) => (
                                                <div {...provided.droppableProps} ref={provided.innerRef} style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '160px', backgroundColor: snapshot.isDraggingOver ? '#E2E8F0' : '#F1F5F9', padding: '12px', borderRadius: '20px', transition: 'all 0.2s' }}>
                                                    {stageApps.map((app: any, index: number) => (
                                                        <Draggable key={app.id} draggableId={app.id} index={index}>
                                                            {(provided) => (
                                                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} onClick={() => { setSelectedApp(app); setIsDrawerOpen(true); }} style={{ ...provided.draggableProps.style, backgroundColor: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #E2E8F0', cursor: 'grab', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                                        <div style={{ fontWeight: 800, fontSize: '14px', color: '#0F172A' }}>{app.candidate?.firstName} {app.candidate?.lastName}</div>
                                                                        <button 
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setSelectedChatApp(app);
                                                                            }}
                                                                            style={{ padding: '4px', borderRadius: '6px', backgroundColor: '#F1F5F9', border: 'none', color: '#64748B', cursor: 'pointer' }}
                                                                        >
                                                                            <MessageSquare size={14} />
                                                                        </button>
                                                                    </div>
                                                                    
                                                                    {/* Actionable Status Priority Logic */}
                                                                    {(() => {
                                                                        if (app.withdrawStatus === 'PENDING') {
                                                                            return (
                                                                                <div style={{ fontSize: '10px', fontWeight: 800, padding: '4px 8px', borderRadius: '6px', marginBottom: '10px', display: 'inline-block', backgroundColor: '#FFEDD5', color: '#9A3412', border: '1px solid #FED7AA' }}>
                                                                                    ⚠️ WITHDRAWAL REQUESTED
                                                                                </div>
                                                                            );
                                                                        }

                                                                        if (app.offer) {
                                                                            return (
                                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                                                                                    <div style={{ fontSize: '10px', fontWeight: 800, padding: '4px 8px', borderRadius: '6px', display: 'inline-block', backgroundColor: app.offer.status === 'ACCEPTED' ? '#DCFCE7' : (app.offer.status === 'REJECTED' ? '#FEF2F2' : (app.offer.status === 'NEGOTIATED' ? '#FFF7ED' : '#F0F9FF')), color: app.offer.status === 'ACCEPTED' ? '#166534' : (app.offer.status === 'REJECTED' ? '#991B1B' : (app.offer.status === 'NEGOTIATED' ? '#EA580C' : '#0369A1')) }}>
                                                                                        {app.offer.status === 'ACCEPTED' ? '✓ OFFER ACCEPTED' : (app.offer.status === 'REJECTED' ? '✕ OFFER REJECTED' : (app.offer.status === 'NEGOTIATED' ? '⚖️ NEGOTIATION' : '⏲ PENDING OFFER'))}
                                                                                    </div>
                                                                                    {app.offer.salary && (
                                                                                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                                            💰 ${app.offer.salary.toLocaleString()}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        }

                                                                        if (app.interviews && app.interviews.length > 0) {
                                                                            const latestInterview = app.interviews[0];
                                                                            return (
                                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                                                                                    <div style={{ fontSize: '10px', fontWeight: 800, padding: '4px 8px', borderRadius: '6px', display: 'inline-block', backgroundColor: latestInterview.candidateConfirmation === 'ACCEPTED' ? '#DCFCE7' : (latestInterview.candidateConfirmation === 'REJECTED' ? '#FEF2F2' : (latestInterview.candidateConfirmation === 'RESCHEDULE_REQUESTED' ? '#FFF7ED' : '#F0F9FF')), color: latestInterview.candidateConfirmation === 'ACCEPTED' ? '#166534' : (latestInterview.candidateConfirmation === 'REJECTED' ? '#991B1B' : (latestInterview.candidateConfirmation === 'RESCHEDULE_REQUESTED' ? '#EA580C' : '#0369A1')) }}>
                                                                                        {latestInterview.candidateConfirmation === 'ACCEPTED' ? '✓ INTERVIEW ACCEPTED' : (latestInterview.candidateConfirmation === 'REJECTED' ? '✕ REJECTED' : (latestInterview.candidateConfirmation === 'RESCHEDULE_REQUESTED' ? '⚠️ RESCHEDULE' : '⏲ PENDING CONFIRM'))}
                                                                                    </div>
                                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#475569' }}>
                                                                                        <Calendar size={12} color="#5C9AFF" />
                                                                                        {new Date(latestInterview.startTime).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        }

                                                                        if (app.note) {
                                                                            return (
                                                                                <div style={{ fontSize: '11px', color: '#64748B', fontStyle: 'italic', marginBottom: '12px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
                                                                                    "{app.note}"
                                                                                </div>
                                                                            );
                                                                        }

                                                                        return null;
                                                                    })()}

                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#94A3B8', fontWeight: 600 }}>
                                                                            <Clock size={12} /> {getWaitingTime(app.updatedAt)}
                                                                        </div>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#F0F9FF', padding: '4px 8px', borderRadius: '8px' }}>
                                                                            <BrainCircuit size={12} color="#0369A1" />
                                                                            <span style={{ fontSize: '11px', fontWeight: 900, color: '#0369A1' }}>{Math.round(app.score)}%</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                    </div>
                                );
                            })}
                        </div>
                    </DragDropContext>
                </div>
            </div>

            {/* Bottom Content Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', width: '100%' }}>
                <div style={{ backgroundColor: 'white', borderRadius: '24px', border: '1px solid #F1F5F9', padding: '32px' }}>
                    <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #F1F5F9', marginBottom: '32px' }}>
                        {['Details', 'Skills & Education'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '0 0 16px', backgroundColor: 'transparent', border: 'none', borderBottom: (activeTab === tab || (activeTab === 'Responsibilities' && tab === 'Details')) ? '3px solid #5C9AFF' : '3px solid transparent', color: (activeTab === tab || (activeTab === 'Responsibilities' && tab === 'Details')) ? '#5C9AFF' : '#94A3B8', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>{tab}</button>
                        ))}
                    </div>
                    
                    {(activeTab === 'Details' || activeTab === 'Responsibilities') && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                            <div>
                                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '16px' }}>Job Description</h4>
                                <div style={{ color: '#475569', lineHeight: 1.8, fontSize: '15px', whiteSpace: 'pre-wrap', backgroundColor: '#F8FAFC', padding: '20px', borderRadius: '16px' }}>
                                    {job.description || "No description provided."}
                                </div>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '16px' }}>Responsibilities</h4>
                                <div style={{ color: '#475569', lineHeight: 1.8, fontSize: '15px', whiteSpace: 'pre-wrap', backgroundColor: '#F8FAFC', padding: '20px', borderRadius: '16px' }}>
                                    {job.responsibilities || "No specific requirements provided."}
                                </div>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '16px' }}>Benefits</h4>
                                <div style={{ color: '#475569', lineHeight: 1.8, fontSize: '15px', whiteSpace: 'pre-wrap', backgroundColor: '#F8FAFC', padding: '20px', borderRadius: '16px' }}>
                                    {job.benefits || "No benefits information provided."}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Skills & Education' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            <div>
                                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '16px' }}>Required Skills</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {job.skills?.map((s: any, i: number) => (
                                        <span key={i} style={{ padding: '8px 16px', backgroundColor: '#F1F5F9', borderRadius: '10px', fontSize: '13px', fontWeight: 700, color: '#475569' }}>
                                            {s.skillName || s.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div>
                                    <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '12px' }}>Education</h4>
                                    <p style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B', margin: 0 }}>{job.minEducation || "Bachelor's"}</p>
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '12px' }}>Experience</h4>
                                    <p style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B', margin: 0 }}>{job.minExperience || 0} years</p>
                                    {job.experienceNote && (
                                        <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', fontStyle: 'italic' }}>Note: {job.experienceNote}</p>
                                    )}
                                </div>
                            </div>
                            {job.certificates && job.certificates.length > 0 && (
                                <div>
                                    <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '16px' }}>Recommended Certs</h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {job.certificates.map((c: string, i: number) => (
                                            <span key={i} style={{ padding: '6px 12px', backgroundColor: '#EFF6FF', color: '#5C9AFF', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>{c}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div style={{ backgroundColor: '#5C9AFF', borderRadius: '32px', padding: '40px', color: 'white', height: 'fit-content', boxShadow: '0 20px 40px -10px rgba(92, 154, 255, 0.4)' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '32px', color: 'rgba(255, 255, 255, 0.8)', letterSpacing: '0.05em' }}>JOB SUMMARY</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                        {[
                            { label: 'SALARY RANGE', value: (job.minSalary && job.maxSalary) ? `$${job.minSalary / 1000}k - $${job.maxSalary / 1000}k` : "Negotiable", icon: <DollarSign size={20} /> },
                            { label: 'LOCATION', value: job.workLocation || 'On-site', icon: <MapPin size={20} /> },
                            { label: 'JOB TYPE', value: job.type || 'Full-time', icon: <Briefcase size={20} /> },
                            { label: 'LEVEL', value: job.level?.name || 'All', icon: <Layers size={20} /> },
                            { label: 'QUANTITY', value: `${job.quantity} people`, icon: <Users size={20} /> }
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                <div style={{ width: '48px', height: '48px', backgroundColor: 'rgba(255, 255, 255, 0.15)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</div>
                                <div>
                                    <div style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase', marginBottom: '4px' }}>{item.label}</div>
                                    <div style={{ fontSize: '16px', fontWeight: 800 }}>{item.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <ConfirmModal 
                isOpen={isCloseJobModalOpen}
                title="Close Job Posting"
                message="Are you sure you want to close this job posting? Candidates will no longer be able to apply after closing."
                onConfirm={confirmCloseJob}
                onCancel={() => setIsCloseJobModalOpen(false)}
                type="danger"
                confirmText="Close Now"
                cancelText="Go Back"
            />

            {/* Chat Window Implementation */}
            {selectedChatApp && user && (
                <ChatWindow 
                    applicationId={selectedChatApp.id}
                    jobId={id}
                    candidateId={selectedChatApp.candidateId}
                    companyId={user.companyId || ''}
                    currentUser={{
                        id: user.id,
                        name: user.company?.name || user.email,
                        role: user.role
                    }}
                    onClose={() => setSelectedChatApp(null)}
                />
            )}

            <JobCreateModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                jobToEdit={job}
                onSuccess={() => {
                    setIsEditModalOpen(false);
                    fetchJobDetail();
                }}
            />
        </div>
    );
}
