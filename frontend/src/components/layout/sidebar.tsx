"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Briefcase,
    BookOpen,
    Settings,
    HelpCircle,
    LogOut,
    Target,
    Layers,
    ChevronDown,
    MessageSquare,
    FileText,
    Lock
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { chatService } from "@/services/chat.service";
import { authService } from "@/services/auth.service";

export const Sidebar = () => {
    const pathname = usePathname();
    const { user, logout } = useAuthStore();
    const [unreadChatCount, setUnreadChatCount] = useState(0);

    const fetchUnreadChatCount = async () => {
        try {
            const res = await chatService.getUnreadCount();
            setUnreadChatCount(res.count || 0);
        } catch (error) {
            console.error("Failed to fetch unread chat count in sidebar:", error);
        }
    };

    const [companyLogo, setCompanyLogo] = useState<string | null>(null);
    const [companyStatus, setCompanyStatus] = useState<string>("APPROVED");
 
    const fetchCompanyData = async () => {
        try {
            const data = await authService.getProfile();
            const logo = data.company?.logoUrl || data.company?.logo;
            if (logo) {
                setCompanyLogo(logo);
            }
            if (data.company?.status) {
                setCompanyStatus(data.company.status);
            }
        } catch (error) {
            console.error("Failed to fetch company logo and status in sidebar:", error);
        }
    };

    useEffect(() => {
        fetchUnreadChatCount();
        fetchCompanyData();
        
        if (user?.id) {
            chatService.connect(localStorage.getItem('access_token') || '');
            chatService.onNewMessage(() => {
                fetchUnreadChatCount();
            });
            chatService.onUnreadCountChange(() => {
                fetchUnreadChatCount();
            });
        }

        return () => {
            chatService.offNewMessage();
        };
    }, [user?.id]);

    const menuGroups = [
        {
            title: "OVERVIEW",
            items: [
                { name: "Dashboard", href: "/employer/dashboard", icon: <LayoutDashboard size={20} /> },
            ]
        },
        {
            title: "RECRUITMENT",
            items: [
                { name: "Campaigns", href: "/employer/jobs/campaigns", icon: <Target size={20} /> },
                { name: "Job Postings", href: "/employer/jobs", icon: <Briefcase size={20} /> },
                { name: "Candidates", href: "/employer/candidates", icon: <Users size={20} /> },
            ]
        },
        {
            title: "RESOURCES",
            items: [
                { name: "Question Bank", href: "/employer/question-bank", icon: <BookOpen size={20} /> },
                { name: "Roles & Levels", href: "#", icon: <Layers size={20} />, subItems: [
                    { name: "Positions", href: "/employer/positions" },
                    { name: "Levels", href: "/employer/levels" },
                ]},
            ]
        },
        {
            title: "INTERACTION",
            items: [
                { name: "Messages", href: "/employer/messages", icon: <MessageSquare size={20} />, badge: unreadChatCount },
                { name: "Company Blog", href: "/employer/blogs", icon: <FileText size={20} /> },
            ]
        },
        {
            title: "SYSTEM",
            items: [
                { name: "Profile", href: "/employer/settings", icon: <Settings size={20} /> },
            ]
        }
    ];

    const menuItems = menuGroups.flatMap(g => g.items);

    const [expandedItems, setExpandedItems] = useState<string[]>([]);

    useEffect(() => {
        // Automatically expand the menu item if one of its sub-items is active
        const activeItem = menuItems.find(item => 
            item.subItems?.some(sub => pathname === sub.href)
        );
        if (activeItem && !expandedItems.includes(activeItem.name)) {
            setExpandedItems(prev => [...prev, activeItem.name]);
        }
    }, [pathname]);

    const toggleExpand = (name: string) => {
        setExpandedItems(prev => 
            prev.includes(name) 
                ? prev.filter(item => item !== name) 
                : [...prev, name]
        );
    };

    return (
        <aside style={{ width: '280px', height: '100vh', backgroundColor: '#FBFCFD', borderRight: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', position: 'fixed', left: 0, top: 0, zIndex: 50, fontFamily: 'Inter, sans-serif' }}>
            {/* Logo Section */}
            <div style={{ padding: '32px 32px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ 
                        width: '44px', 
                        height: '44px', 
                        backgroundColor: 'white', 
                        borderRadius: '14px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        overflow: 'hidden',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.05)',
                        border: '1px solid #f1f5f9',
                        flexShrink: 0
                    }}>
                        {companyLogo ? (
                            <img src={companyLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                            <Briefcase size={22} color="#5C9AFF" />
                        )}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        <h1 style={{ 
                            fontSize: '17px', 
                            fontWeight: 900, 
                            color: '#1e3a8a', 
                            margin: 0,
                            lineHeight: 1.2,
                            letterSpacing: '-0.02em',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {user?.company?.name || "KIAISOFT"}
                        </h1>
                        <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>RECRUITMENT</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
                {menuGroups.map((group) => (
                    <div key={group.title} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <p style={{ 
                            fontSize: '10px', 
                            fontWeight: 800, 
                            color: '#94a3b8', 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.05em', 
                            margin: '0 0 4px 20px' 
                        }}>
                            {group.title}
                        </p>
                        
                        {group.items.map((item: any) => {
                            const isActive = pathname === item.href || (item.subItems?.some((sub: any) => pathname === sub.href));
                            const isExpanded = expandedItems.includes(item.name);
                            
                            const lockedItems = companyStatus !== 'APPROVED' ? ["Candidates", "Question Bank", "Messages"] : [];
                            const isLocked = lockedItems.includes(item.name);
 
                            return (
                                <React.Fragment key={item.name}>
                                    <div
                                        onClick={(e) => {
                                            if (isLocked) {
                                                e.preventDefault();
                                                alert(`Tính năng "${item.name}" yêu cầu tài khoản doanh nghiệp đã được phê duyệt.`);
                                                return;
                                            }
                                            if (item.subItems) toggleExpand(item.name);
                                        }}
                                        style={{ cursor: (item.subItems || isLocked) ? 'pointer' : 'default' }}
                                    >
                                        <Link
                                            href={isLocked ? '#' : (item.subItems ? '#' : item.href)}
                                            prefetch={false}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '12px', padding: '9.5px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s',
                                                backgroundColor: isActive && !item.subItems ? '#dbeafe' : 'transparent',
                                                color: isLocked ? '#cbd5e1' : (isActive ? '#1e40af' : '#64748b'),
                                                position: 'relative',
                                                pointerEvents: isLocked ? 'none' : 'auto'
                                            }}
                                        >
                                            <div style={{ color: isLocked ? '#cbd5e1' : (isActive ? '#1e40af' : '#94a3b8'), display: 'flex' }}>
                                                {React.cloneElement(item.icon as React.ReactElement, { size: 20 })}
                                            </div>
                                            <span style={{ flex: 1, color: isLocked ? '#94a3b8' : 'inherit' }}>{item.name}</span>
                                            {isLocked ? (
                                                <Lock size={14} color="#cbd5e1" style={{ marginLeft: 'auto' }} />
                                            ) : (
                                                <>
                                                    {item.badge !== undefined && item.badge > 0 && (
                                                        <span style={{ 
                                                            padding: '2px 8px', 
                                                            backgroundColor: '#ef4444', 
                                                            color: 'white', 
                                                            borderRadius: '6px', 
                                                            fontSize: '10px', 
                                                            fontWeight: 800,
                                                            marginLeft: '8px'
                                                        }}>
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                    {item.subItems && (
                                                        <ChevronDown 
                                                            size={16} 
                                                            style={{ 
                                                                transition: 'transform 0.2s', 
                                                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                                                color: isActive ? '#1e40af' : '#94a3b8'
                                                            }} 
                                                        />
                                                    )}
                                                </>
                                            )}
                                        </Link>
                                    </div>

                                    {item.subItems && isExpanded && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '44px', marginBottom: '8px', marginTop: '4px' }}>
                                            {item.subItems.map((sub: any) => {
                                                const isSubActive = pathname === sub.href;
                                                return (
                                                    <Link
                                                        key={sub.name}
                                                        href={sub.href}
                                                        style={{
                                                            padding: '8px 12px',
                                                            fontSize: '13px',
                                                            fontWeight: 600,
                                                            color: isSubActive ? '#1e40af' : '#94a3b8',
                                                            textDecoration: 'none',
                                                            borderRadius: '8px',
                                                            backgroundColor: isSubActive ? '#eff6ff' : 'transparent',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        {sub.name}
                                                    </Link>
                                                )
                                            })}
                                        </div>
                                    )}
                                </React.Fragment>
                            )
                        })}
                    </div>
                ))}
            </nav>
        </aside>
    );
};
