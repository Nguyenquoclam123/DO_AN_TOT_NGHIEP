"use client";

import React from "react";
import {
    Bell,
    Settings,
    Search,
    Activity,
    ChevronDown,
    ShieldCheck
} from "lucide-react";

export const AdminHeader = () => {
    const [showProfileMenu, setShowProfileMenu] = React.useState(false);
    const profileRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        // Assuming useAuthStore is available here, but since it's not imported, I'll use direct storage clearing or window.location
        localStorage.clear();
        window.location.href = '/auth/login';
    };

    return (
        <header style={{ height: '72px', backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f1f5f9', fontFamily: 'sans-serif', position: 'sticky', top: 0, zIndex: 40 }}>
            {/* System Status Tracker */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: '#f0fdf4', borderRadius: '20px' }}>
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#22c55e', borderRadius: '50%', boxShadow: '0 0 0 4px rgba(34, 197, 94, 0.1)' }}></div>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#166534' }}>ALL NODES ACTIVE</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '12px', fontWeight: 600 }}>
                    <Activity size={16} /> Load: 14%
                </div>
            </div>

            {/* Right Side Tools */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '8px', borderRight: '1px solid #e2e8f0', paddingRight: '20px' }}>
                    <button style={{ padding: '8px', color: '#64748b', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>
                        <Bell size={20} />
                    </button>
                </div>

                <div style={{ position: 'relative' }} ref={profileRef}>
                    <div 
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                    >
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Administrator</p>
                            <p style={{ fontSize: '11px', fontWeight: 600, color: '#10b981', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                                Verified <ShieldCheck size={10} />
                            </p>
                        </div>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#0f172a', overflow: 'hidden' }}>
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="avatar" />
                        </div>
                        <ChevronDown size={14} color="#94a3b8" style={{ transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                    </div>

                    {showProfileMenu && (
                        <div style={{ position: 'absolute', top: '48px', right: '0', width: '180px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', border: '1px solid #f1f5f9', overflow: 'hidden', padding: '8px' }}>
                            <div 
                                onClick={handleLogout}
                                style={{ padding: '10px 12px', borderRadius: '8px', fontSize: '14px', fontWeight: 700, color: '#ef4444', cursor: 'pointer', transition: 'all 0.2s' }}
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
