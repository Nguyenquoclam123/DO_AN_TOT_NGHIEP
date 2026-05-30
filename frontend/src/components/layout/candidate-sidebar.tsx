"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Search,
    FileText,
    Settings,
    LogOut,
    Rocket,
    ChevronRight,
    ChevronLeft,
    Circle,
    Heart,
    MessageSquare,
    BookOpen,
    Flag,
    Sparkles
} from "lucide-react";
import { notificationService } from "@/services/notification.service";
import { chatService } from "@/services/chat.service";
import { useAuthStore } from "@/store/authStore";
import { motion } from "framer-motion";
import { socketService } from "@/services/socket.service";

export const CandidateSidebar = () => {
    const pathname = usePathname();
    const { user } = useAuthStore();
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadChatCount, setUnreadChatCount] = useState(0);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const fetchUnreadCount = async () => {
        try {
            const data = await notificationService.getMyNotifications();
            // Group by unique applicationId to show how many applications have updates
            const unreadApps = new Set(
                data
                    .filter(n => !n.isRead && n.metadata?.applicationId)
                    .map(n => n.metadata.applicationId)
            );
            setUnreadCount(unreadApps.size);
        } catch (error) {
            console.error("Failed to fetch notifications in sidebar:", error);
        }
    };

    const fetchUnreadChatCount = async () => {
        try {
            const res = await chatService.getUnreadCount();
            setUnreadChatCount(res.count || 0);
        } catch (error) {
            console.error("Failed to fetch unread chat count in sidebar:", error);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        fetchUnreadChatCount();
        
        if (user?.id) {
            socketService.connect(user.id);
            socketService.onNewNotification(() => {
                fetchUnreadCount();
            });
            socketService.onApplicationUpdated(() => {
                fetchUnreadCount();
            });

            chatService.connect(localStorage.getItem('access_token') || '');
            chatService.onNewMessage(() => {
                fetchUnreadChatCount();
            });
            chatService.onUnreadCountChange(() => {
                fetchUnreadChatCount();
            });
        }

        const handleRead = () => fetchUnreadCount();
        window.addEventListener('notifications-read', handleRead);

        return () => {
            socketService.offNewNotification();
            socketService.offApplicationUpdated();
            chatService.offNewMessage();
            window.removeEventListener('notifications-read', handleRead);
        };
    }, [user?.id]);

    const menuGroups = [
        {
            title: "Overview",
            items: [
                { name: "Dashboard", href: "/candidate/dashboard", icon: <LayoutDashboard size={20} /> },
            ]
        },
        {
            title: "Job Search",
            items: [
                { name: "Find Jobs", href: "/candidate/jobs", icon: <Search size={20} /> },
                { name: "Recruitment Campaigns", href: "/candidate/campaigns", icon: <Flag size={20} /> },
                { name: "Favorite Jobs", href: "/candidate/favorites", icon: <Heart size={20} /> },
            ]
        },
        {
            title: "Career",
            items: [
                { name: "CV / Profile", href: "/candidate/cv", icon: <FileText size={20} /> },
                { name: "My Applications", href: "/candidate/applications", icon: <Rocket size={20} />, badge: unreadCount },
            ]
        },
        {
            title: "Communication",
            items: [
                { name: "Messages", href: "/candidate/messages", icon: <MessageSquare size={20} />, badge: unreadChatCount, badgeColor: '#EF4444' },
                { name: "AI Job Assistant", href: "/candidate/chatbot", icon: <Sparkles size={20} /> },
                { name: "Blogs & News", href: "/candidate/blogs", icon: <BookOpen size={20} /> },
            ]
        }
    ];

    return (
        <motion.aside 
            animate={{ width: isCollapsed ? '88px' : '280px' }}
            style={{ 
                height: '100vh', 
                backgroundColor: 'white', 
                borderRight: '1px solid #F1F3F5',
                display: 'flex', 
                flexDirection: 'column', 
                position: 'fixed', 
                left: 0, 
                top: 0, 
                zIndex: 100, 
                fontFamily: 'Inter, sans-serif',
                boxSizing: 'border-box',
                padding: '16px 12px',
                transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
        >
            {/* Window Controls */}
            {!isCollapsed && (
                <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', paddingLeft: '8px' }}>
                    <div style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#FF5F57', opacity: 0.8 }}></div>
                    <div style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#FEBC2E', opacity: 0.8 }}></div>
                    <div style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#28C840', opacity: 0.8 }}></div>
                </div>
            )}

            {/* Logo Section */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: isCollapsed ? 'center' : 'space-between',
                marginBottom: '24px',
                padding: '0 8px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                        width: '44px', 
                        height: '44px', 
                        backgroundColor: 'white', 
                        borderRadius: '12px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        overflow: 'hidden',
                        padding: '4px',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.05)',
                        border: '1px solid #F1F3F5'
                    }}>
                        <img src="/logo.png" alt="My Job Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    {!isCollapsed && (
                        <span style={{ fontSize: '20px', fontWeight: 800, color: '#5C9AFF', letterSpacing: '-0.02em' }}>My Job</span>
                    )}
                </div>
                {!isCollapsed && (
                    <button 
                        onClick={() => setIsCollapsed(true)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ADB5BD', padding: '4px' }}
                    >
                        <ChevronLeft size={20} />
                    </button>
                )}
                {isCollapsed && (
                    <button 
                        onClick={() => setIsCollapsed(false)}
                        style={{ position: 'absolute', right: '-12px', top: '32px', width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'white', border: '1px solid #F1F3F5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 8px rgba(0,0,0,0.05)' }}
                    >
                        <ChevronRight size={14} />
                    </button>
                )}
            </div>

            {/* Navigation Section */}
            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', paddingRight: '4px' }} className="custom-scrollbar">
                {menuGroups.map((group, groupIdx) => (
                    <div key={groupIdx} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {!isCollapsed && (
                            <p style={{ 
                                fontSize: '10px', 
                                fontWeight: 800, 
                                color: '#ADB5BD', 
                                textTransform: 'uppercase', 
                                letterSpacing: '0.1em', 
                                marginBottom: '8px', 
                                paddingLeft: '12px',
                                marginTop: groupIdx === 0 ? 0 : '8px'
                            }}>
                                {group.title}
                            </p>
                        )}
                        
                        {group.items.map((item) => {
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    style={{
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: isCollapsed ? 'center' : 'space-between', 
                                        padding: '10px 12px', 
                                        borderRadius: '12px', 
                                        fontSize: '14px', 
                                        fontWeight: 700, 
                                        textDecoration: 'none', 
                                        transition: 'all 0.2s',
                                        backgroundColor: isActive ? '#F8F9FA' : 'transparent',
                                        color: isActive ? '#1A1A1A' : '#6C757D',
                                        marginBottom: '1px'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <span style={{ color: isActive ? '#5C9AFF' : '#6C757D' }}>{item.icon}</span>
                                        {!isCollapsed && <span>{item.name}</span>}
                                    </div>
                                    
                                    {!isCollapsed && (item as any).badge !== undefined && (item as any).badge > 0 && (
                                        <span style={{ 
                                            padding: '2px 8px', 
                                            backgroundColor: (item as any).badgeColor || '#5C9AFF', 
                                            color: 'white', 
                                            borderRadius: '6px', 
                                            fontSize: '10px', 
                                            fontWeight: 800 
                                        }}>
                                            {(item as any).badge}
                                        </span>
                                    )}
                                </Link>
                            )
                        })}
                    </div>
                ))}
            </nav>

        </motion.aside>
    );
};
