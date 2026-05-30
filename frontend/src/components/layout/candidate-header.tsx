"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    Search,
    Bell,
    MessageCircle,
    ChevronDown,
    X,
    Check,
    Clock,
    Trash2
} from "lucide-react";
import { notificationService, Notification } from "@/services/notification.service";
import { chatService } from "@/services/chat.service";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";

import { socketService } from "@/services/socket.service";
import { candidateService } from "@/services/candidate.service";

export const CandidateHeader = () => {
    const router = useRouter();
    const { user } = useAuthStore();
    const { 
        notifications, 
        unreadCount, 
        fetchNotifications, 
        markAsRead, 
        markAllAsRead 
    } = useNotificationStore();
    
    const [showNotifications, setShowNotifications] = useState(false);
    const [expandedNotifs, setExpandedNotifs] = useState<string[]>([]);
    const notificationRef = useRef<HTMLDivElement>(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        };

        if (showNotifications || showProfileMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotifications, showProfileMenu]);

    const [unreadChatCount, setUnreadChatCount] = useState(0);

    const fetchUnreadChatCount = async () => {
        try {
            const res = await chatService.getUnreadCount();
            setUnreadChatCount(res.count || 0);
        } catch (error) {
            console.error("[CandidateHeader] Failed to fetch unread chat count:", error);
        }
    };

    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    const fetchProfileData = async () => {
        try {
            const data = await candidateService.getMe();
            if (data?.avatar) {
                setAvatarUrl(data.avatar);
            }
        } catch (error) {
            console.error("[CandidateHeader] Failed to fetch profile:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        fetchUnreadChatCount();
        fetchProfileData();
        
        if (user?.id) {
            socketService.connect(user.id);
            socketService.onNewNotification(() => {
                fetchNotifications();
            });

            // Also listen for new messages to update count
            chatService.connect(localStorage.getItem('access_token') || '');
            chatService.joinUserRoom(user.id, (user as any).companyId);
            chatService.onNewMessage(() => {
                fetchUnreadChatCount();
            });

            chatService.onUnreadCountChange(() => {
                fetchUnreadChatCount();
            });
        }

        return () => {
            socketService.offNewNotification();
            chatService.offNewMessage();
        };
    }, [user?.id, fetchNotifications]);

    const handleNotificationClick = async (notif: any) => {
        if (!notif.isRead) {
            await markAsRead(notif.id);
        }

        const appId = notif.metadata?.applicationId;
        if (appId) {
            router.push(`/candidate/applications/${appId}`);
        } else {
            router.push(`/candidate/applications`);
        }
        setShowNotifications(false);
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
    };

    const toggleExpand = (id: string) => {
        setExpandedNotifs(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleLogout = () => {
        useAuthStore.getState().logout();
        window.location.href = '/auth/login';
    };

    return (
        <header style={{ height: '72px', backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f1f5f9', fontFamily: 'Inter, sans-serif', position: 'relative', zIndex: 1000 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ padding: '4px 12px', backgroundColor: '#ecfdf5', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '6px', height: '6px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669' }}>READY TO WORK</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                    <div style={{ position: 'relative' }} ref={notificationRef}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            style={{ padding: '8px', color: unreadCount > 0 ? '#5C9AFF' : '#64748b', backgroundColor: unreadCount > 0 ? '#EFF6FF' : 'transparent', border: 'none', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span style={{ position: 'absolute', top: '4px', right: '4px', width: '10px', height: '10px', backgroundColor: '#EF4444', borderRadius: '50%', border: '2px solid white' }}></span>
                            )}
                        </button>

                        {showNotifications && (
                            <div style={{ position: 'absolute', top: '48px', right: '0', width: '380px', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                                <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={handleMarkAllAsRead}
                                            style={{ fontSize: '12px', color: '#5C9AFF', backgroundColor: 'transparent', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                                        >
                                            Mark all as read
                                        </button>
                                    )}
                                </div>
                                <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '8px' }}>
                                    {notifications.length === 0 ? (
                                        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
                                            <Bell size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
                                            <p style={{ fontSize: '14px' }}>No notifications yet</p>
                                        </div>
                                    ) : (
                                        notifications.map((n: any) => (
                                            <div
                                                key={n.id}
                                                onClick={() => handleNotificationClick(n)}
                                                style={{ 
                                                    padding: '16px', 
                                                    borderRadius: '12px', 
                                                    backgroundColor: n.isRead ? 'transparent' : '#EFF6FF', 
                                                    marginBottom: '4px', 
                                                    cursor: 'pointer', 
                                                    transition: 'all 0.2s', 
                                                    position: 'relative',
                                                    border: n.isRead ? '1px solid transparent' : '1px solid #DBEAFE'
                                                }}
                                            >
                                                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: n.isRead ? '#F1F5F9' : '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: n.isRead ? '#94A3B8' : '#5C9AFF', flexShrink: 0 }}>
                                                        <Bell size={18} />
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: '14px', fontWeight: n.isRead ? 600 : 800, color: '#0F172A', marginBottom: '4px' }}>{n.title}</div>
                                                        <div style={{ 
                                                            fontSize: '13px', 
                                                            color: n.isRead ? '#64748B' : '#1E293B', 
                                                            lineHeight: 1.5, 
                                                            marginBottom: '8px',
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: expandedNotifs.includes(n.id) ? 'unset' : 3,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden'
                                                        }}>
                                                            {n.content}
                                                        </div>
                                                        {n.content.length > 100 && (
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); toggleExpand(n.id); }}
                                                                style={{ background: 'none', border: 'none', color: '#5C9AFF', fontSize: '12px', fontWeight: 700, padding: 0, cursor: 'pointer', marginBottom: '8px', display: 'block' }}
                                                            >
                                                                {expandedNotifs.includes(n.id) ? "Show less" : "Show more"}
                                                            </button>
                                                        )}
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#94A3B8' }}>
                                                            <Clock size={12} />
                                                            {new Date(n.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                    {!n.isRead && (
                                                        <div style={{ width: '10px', height: '10px', backgroundColor: '#5C9AFF', borderRadius: '50%', marginTop: '4px', flexShrink: 0, boxShadow: '0 0 0 4px rgba(37, 99, 235, 0.1)' }}></div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div 
                    ref={profileRef}
                    style={{ position: 'relative' }}
                >
                    <div 
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '4px 8px', borderRadius: '12px', transition: 'all 0.2s', backgroundColor: showProfileMenu ? '#f8fafc' : 'transparent' }}
                    >
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f1f5f9', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'Marcus'}`} alt="avatar" />
                            )}
                        </div>
                        <ChevronDown size={14} color="#94a3b8" style={{ transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                    </div>

                    {showProfileMenu && (
                        <div style={{ position: 'absolute', top: '48px', right: '0', width: '200px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', border: '1px solid #f1f5f9', overflow: 'hidden', padding: '8px' }}>
                            <div 
                                onClick={() => { router.push('/candidate/settings'); setShowProfileMenu(false); }}
                                style={{ padding: '12px 16px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: '#475569', cursor: 'pointer', transition: 'all 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                Account Settings
                            </div>
                            <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '4px 8px' }}></div>
                            <div 
                                onClick={handleLogout}
                                style={{ padding: '12px 16px', borderRadius: '10px', fontSize: '14px', fontWeight: 700, color: '#ef4444', cursor: 'pointer', transition: 'all 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                Logout
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
