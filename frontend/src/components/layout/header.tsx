"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    Bell,
    ChevronDown,
    Clock,
    MessageSquare
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { chatService } from "@/services/chat.service";
import { authService } from "@/services/auth.service";
import { socketService } from "@/services/socket.service";

export const Header = () => {
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
    const [unreadChatCount, setUnreadChatCount] = useState(0);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    
    const notificationRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    const fetchUnreadChatCount = async () => {
        try {
            const res = await chatService.getUnreadCount();
            setUnreadChatCount(res.count || 0);
        } catch (error) {
            console.error("Failed to fetch unread chat count:", error);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        useAuthStore.getState().logout();
        window.location.href = '/auth/login';
    };

    const [profileImage, setProfileImage] = useState<string | null>(null);

    const fetchProfile = async () => {
        try {
            const data = await authService.getProfile();
            const image = data.company?.logoUrl || data.company?.logo || data.avatar || data.candidateProfile?.avatar;
            if (image) {
                setProfileImage(image);
            }
        } catch (error) {
            console.error("Failed to fetch profile in header:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        fetchUnreadChatCount();
        fetchProfile();

        const handleNewNotification = () => {
            fetchNotifications();
        };

        if (user?.id) {
            socketService.connect(user.id);
            socketService.onNewNotification(handleNewNotification);

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
            socketService.offNewNotification(handleNewNotification);
            chatService.offNewMessage();
        };
    }, [user?.id, fetchNotifications]);

    const handleNotificationClick = async (notif: any) => {
        if (!notif.isRead) await markAsRead(notif.id);

        const jobId = notif.metadata?.jobId;
        const appId = notif.metadata?.applicationId;

        if (jobId) {
            router.push(`/employer/jobs/${jobId}?appId=${appId}`);
        }
        setShowNotifications(false);
    };

    return (
        <header style={{ height: '80px', backgroundColor: '#FBFCFD', padding: '0 48px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', borderBottom: '1px solid #f1f5f9', fontFamily: 'Inter, sans-serif', position: 'relative', zIndex: 1000 }}>
            {/* Right Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ position: 'relative' }} ref={notificationRef}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            style={{ padding: '10px', color: unreadCount > 0 ? '#5C9AFF' : '#64748b', backgroundColor: 'white', border: '1px solid #f1f5f9', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                        >
                            <Bell size={18} />
                            {unreadCount > 0 && (
                                <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '10px', height: '10px', backgroundColor: '#EF4444', borderRadius: '50%', border: '2px solid white' }}></span>
                            )}
                        </button>

                        {showNotifications && (
                            <div style={{ position: 'absolute', top: '48px', right: '0', width: '380px', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                                <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button onClick={markAllAsRead} style={{ fontSize: '12px', color: '#5C9AFF', backgroundColor: 'transparent', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Mark all as read</button>
                                    )}
                                </div>
                                <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '8px' }}>
                                    {notifications.length === 0 ? (
                                        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
                                            <Bell size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
                                            <p style={{ fontSize: '14px' }}>No new notifications</p>
                                        </div>
                                    ) : (
                                        notifications.map((n: any) => (
                                            <div
                                                key={n.id}
                                                onClick={() => handleNotificationClick(n)}
                                                style={{ padding: '16px', borderRadius: '12px', backgroundColor: n.isRead ? 'transparent' : '#EFF6FF', marginBottom: '4px', cursor: 'pointer', transition: 'all 0.2s', border: n.isRead ? '1px solid transparent' : '1px solid #DBEAFE' }}
                                            >
                                                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: n.isRead ? '#F1F5F9' : '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: n.isRead ? '#94A3B8' : '#5C9AFF', flexShrink: 0 }}>
                                                        <Bell size={18} />
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: '14px', fontWeight: n.isRead ? 600 : 800, color: '#0F172A', marginBottom: '4px' }}>{n.title}</div>
                                                        <div style={{ fontSize: '13px', color: n.isRead ? '#64748B' : '#1E293B', lineHeight: 1.5, marginBottom: '8px' }}>{n.content}</div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#94A3B8' }}>
                                                            <Clock size={12} /> {new Date(n.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                    {!n.isRead && <div style={{ width: '10px', height: '10px', backgroundColor: '#5C9AFF', borderRadius: '50%', marginTop: '4px' }}></div>}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => router.push('/employer/messages')}
                        style={{ padding: '10px', color: unreadChatCount > 0 ? '#5C9AFF' : '#64748b', backgroundColor: 'white', border: '1px solid #f1f5f9', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', position: 'relative' }}
                    >
                        <MessageSquare size={18} />
                        {unreadChatCount > 0 && (
                            <span style={{ position: 'absolute', top: '-2px', right: '-2px', minWidth: '16px', height: '16px', backgroundColor: '#EF4444', borderRadius: '8px', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: 'white', fontWeight: 800, padding: '0 2px' }}>
                                {unreadChatCount > 9 ? '9+' : unreadChatCount}
                            </span>
                        )}
                    </button>
                </div>

                <div style={{ height: '32px', width: '1px', backgroundColor: '#f1f5f9' }}></div>

                <div style={{ position: 'relative' }} ref={profileRef}>
                    <button 
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
                    >
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                                {user?.company?.name || user?.email.split('@')[0] || "User Account"}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                                <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {user?.role || "Member"}
                                </p>
                                <ChevronDown size={12} color="#94a3b8" style={{ transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                            </div>
                        </div>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', overflow: 'hidden', border: '2px solid white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', backgroundColor: '#f1f5f9' }}>
                            {profileImage ? (
                                <img src={profileImage} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <img
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'Alex'}`}
                                    alt="avatar"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            )}
                        </div>
                    </button>

                    {showProfileMenu && (
                        <div style={{ position: 'absolute', top: '56px', right: '0', width: '200px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', border: '1px solid #f1f5f9', overflow: 'hidden', padding: '8px' }}>
                            <div 
                                onClick={() => { router.push('/employer/settings'); setShowProfileMenu(false); }}
                                style={{ padding: '12px 16px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: '#475569', cursor: 'pointer', transition: 'all 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                Company Profile
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
