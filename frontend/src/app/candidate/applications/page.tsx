"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { applicationService } from "@/services/application.service";
import {
    Clock,
    CheckCircle2,
    Calendar,
    MoreVertical,
    ChevronRight,
    Building2,
    AlertCircle,
    Zap,
    MessageSquare,
    MapPin,
    ArrowUpRight,
    Loader2,
    Info,
    Bell,
    Circle
} from "lucide-react";
import { socketService } from "@/services/socket.service";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";

function ApplicationsContent() {
    const searchParams = useSearchParams();
    const highlightId = searchParams.get('appId');
    const [applications, setApplications] = useState<any[]>([]);
    const { notifications, fetchNotifications, markByApplicationId } = useNotificationStore();
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuthStore();

    useEffect(() => {
        fetchApplications();
        
        if (user?.id) {
            socketService.connect(user.id);
            socketService.onApplicationUpdated(() => {
                console.log("Application update received via socket");
                fetchApplications();
            });
            socketService.onNewNotification(() => {
                console.log("New notification received via socket");
                fetchNotifications();
            });
        }

        return () => {
            socketService.offApplicationUpdated();
            socketService.offNewNotification();
        };
    }, [user?.id, fetchNotifications]);

    const fetchApplications = async () => {
        try {
            setIsLoading(true);
            const appsData = await applicationService.getMyApplications();
            setApplications(appsData || []);
            await fetchNotifications();
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }}>
                <Loader2 size={48} className="animate-spin" color="#5C9AFF" />
                <p style={{ marginTop: '16px', color: '#64748b', fontWeight: 600 }}>Loading applications list...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px 40px 40px', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h1 style={{ fontSize: '48px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>My Applications</h1>
                        <p style={{ fontSize: '15px', color: '#64748b', marginTop: '4px', fontWeight: 500 }}>Manage and track your job applications in one place.</p>
                    </div>
                    <Link href="/candidate/jobs" style={{ textDecoration: 'none' }}>
                        <button style={{ padding: '12px 24px', backgroundColor: 'white', color: '#5C9AFF', border: '1px solid #E6EFFF', borderRadius: '12px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            Find More Jobs <ChevronRight size={16} />
                        </button>
                    </Link>
                </div>

                {applications.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {applications.map((app) => {
                            const isHighlighted = app.id === highlightId;
                            const hasUnread = notifications.some(n => !n.isRead && (n as any).metadata?.applicationId === app.id);
                            return (
                                <Link 
                                    key={app.id} 
                                    id={`app-${app.id}`} 
                                    href={`/candidate/applications/${app.id}`} 
                                    style={{ textDecoration: 'none', display: 'block' }}
                                    onClick={() => markByApplicationId(app.id)}
                                >
                                    <div style={{
                                        backgroundColor: hasUnread ? '#FFFBFB' : 'white',
                                        padding: '24px 32px',
                                        borderRadius: '24px',
                                        border: isHighlighted ? '2px solid #5C9AFF' : (hasUnread ? '1.5px solid #FCA5A5' : '1px solid #f1f5f9'),
                                        boxShadow: isHighlighted ? '0 0 20px rgba(92, 154, 255, 0.15)' : (hasUnread ? '0 4px 6px -1px rgba(239, 68, 68, 0.05)' : 'none'),
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 150px 140px 120px 40px',
                                        alignItems: 'center',
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        animation: isHighlighted ? 'pulseGlow 2s infinite' : 'none'
                                    }}
                                        onMouseEnter={(e) => {
                                            if (!isHighlighted) {
                                                e.currentTarget.style.borderColor = '#5C9AFF';
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.05)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isHighlighted) {
                                                e.currentTarget.style.borderColor = '#f1f5f9';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }
                                        }}
                                    >
                                        {isHighlighted && (
                                            <div style={{ position: 'absolute', top: '-10px', left: '20px', backgroundColor: '#5C9AFF', color: 'white', padding: '4px 12px', borderRadius: '100px', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Bell size={12} /> NEW UPDATE
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                            <div style={{ width: '48px', height: '48px', backgroundColor: '#F0F6FF', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Building2 size={24} color="#5C9AFF" />
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                                                        {app.job?.title} {app.job?.campaign?.name ? `(${app.job.campaign.name})` : ''}
                                                    </h4>
                                                    {hasUnread && (
                                                        <div style={{ width: '8px', height: '8px', backgroundColor: '#EF4444', borderRadius: '50%', boxShadow: '0 0 0 4px rgba(239, 68, 68, 0.1)' }}></div>
                                                    )}
                                                </div>
                                                <p style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>{app.job?.company?.name} • Applied on {new Date(app.createdAt).toLocaleDateString('en-US')}</p>
                                            </div>
                                        </div>

                                        <div style={{ textAlign: 'center' }}>
                                            {(() => {
                                                const getStatusStyle = (status: string) => {
                                                    switch (status) {
                                                        case 'HIRED':
                                                            return { bg: '#f0fdfa', color: '#0d9488', label: 'HIRED' };
                                                        case 'OFFER':
                                                            return { bg: '#f0fdf4', color: '#22c55e', label: 'JOB OFFER' };
                                                        case 'INTERVIEWING':
                                                            return { bg: '#fff7ed', color: '#ea580c', label: 'INTERVIEWING' };
                                                        case 'INVITED':
                                                            return { bg: '#f5f3ff', color: '#7c3aed', label: 'INTERVIEW INVITED' };
                                                        case 'REJECTED':
                                                            return { bg: '#f1f5f9', color: '#94a3b8', label: 'REJECTED' };
                                                        case 'CANCELLED':
                                                            return { bg: '#e2e8f0', color: '#475569', label: 'CANCELLED' };
                                                        case 'APPLIED':
                                                        default:
                                                            return { bg: '#eff6ff', color: '#5C9AFF', label: 'APPLIED' };
                                                    }
                                                };
                                                const style = getStatusStyle(app.status);
                                                return (
                                                    <span style={{
                                                        padding: '6px 14px', 
                                                        borderRadius: '10px', 
                                                        fontSize: '11px', 
                                                        fontWeight: 800,
                                                        backgroundColor: style.bg,
                                                        color: style.color,
                                                        border: `1px solid ${style.color}20`
                                                    }}>
                                                        {style.label}
                                                    </span>
                                                );
                                            })()}
                                        </div>

                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                                <Zap size={14} color="#5C9AFF" fill="#5C9AFF" />
                                                <span style={{ fontSize: '15px', fontWeight: 800, color: '#5C9AFF' }}>{Math.round(app.score || 0)}%</span>
                                            </div>
                                            <p style={{ fontSize: '9px', fontWeight: 800, color: '#94a3b8', margin: '4px 0 0' }}>MATCH SCORE</p>
                                        </div>

                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#5C9AFF', fontSize: '13px', fontWeight: 800 }}>
                                                Details <ChevronRight size={14} />
                                            </div>
                                        </div>

                                        <div style={{ textAlign: 'right' }}>
                                            <MoreVertical size={20} color="#cbd5e1" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ padding: '80px 40px', backgroundColor: 'white', borderRadius: '32px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', backgroundColor: '#f8fafc', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                            <Info size={32} color="#94a3b8" />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>No Applications Yet</h3>
                        <p style={{ fontSize: '15px', color: '#64748b', marginTop: '12px', maxWidth: '400px', margin: '12px auto' }}>You haven't applied to any jobs yet. Start your journey by exploring open positions.</p>
                        <Link href="/candidate/jobs" style={{ textDecoration: 'none' }}>
                            <button style={{ marginTop: '24px', padding: '14px 32px', backgroundColor: '#5C9AFF', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(92, 154, 255, 0.25)' }}>Explore Now</button>
                        </Link>
                    </div>
                )}
            </div>
            <style jsx>{`
                @keyframes pulseGlow {
                    0% { box-shadow: 0 0 10px rgba(37, 99, 235, 0.1); border-color: rgba(37, 99, 235, 0.3); }
                    50% { box-shadow: 0 0 25px rgba(37, 99, 235, 0.3); border-color: rgba(37, 99, 235, 1); }
                    100% { box-shadow: 0 0 10px rgba(37, 99, 235, 0.1); border-color: rgba(37, 99, 235, 0.3); }
                }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}

export default function CandidateApplicationsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ApplicationsContent />
        </Suspense>
    );
}
