"use client";

import React, { useEffect, useState } from "react";
import {
    Plus,
    Loader2,
    DatabaseZap,
    Target,
    Edit2,
    EyeOff,
    Eye,
    X,
    ShieldAlert,
    Search
} from "lucide-react";
import Link from "next/link";
import { masterDataService } from "@/services/master-data.service";
import { useAuthStore } from "@/store/authStore";

const CARD_THEMES = [
    { bg: 'rgba(224, 242, 254, 0.7)', text: '#0369A1' }, // Sky Blue
    { bg: 'rgba(255, 237, 213, 0.7)', text: '#C2410C' }, // Orange
    { bg: 'rgba(237, 233, 254, 0.7)', text: '#6D28D9' }, // Purple
    { bg: 'rgba(220, 252, 231, 0.7)', text: '#15803D' }, // Green
    { bg: 'rgba(252, 231, 243, 0.7)', text: '#BE185D' }, // Pink
    { bg: 'rgba(254, 249, 195, 0.7)', text: '#A16207' }, // Yellow
    { bg: 'rgba(236, 254, 255, 0.7)', text: '#0891B2' }, // Cyan
    { bg: 'rgba(245, 243, 255, 0.7)', text: '#7C3AED' }, // Indigo
    { bg: 'rgba(255, 241, 242, 0.7)', text: '#E11D48' }, // Rose
    { bg: 'rgba(240, 253, 244, 0.7)', text: '#16A34A' }, // Emerald
    { bg: 'rgba(255, 251, 235, 0.7)', text: '#D97706' }, // Amber
    { bg: 'rgba(248, 250, 252, 0.7)', text: '#475569' }, // Slate
];

export default function JobArchitecturePage() {
    const [positions, setPositions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [actionId, setActionId] = useState<string | null>(null);
    const [actionName, setActionName] = useState<string | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState<any | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const user = useAuthStore((state) => state.user);

    const fetchPositions = async () => {
        try {
            setIsLoading(true);
            const data = await masterDataService.getPositions(user?.companyId);
            setPositions(data || []);
        } catch (error) {
            console.error("Failed to fetch positions", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchPositions();
        }
    }, [user]);

    const filteredPositions = positions.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openConfirmModal = (id: string, name: string) => {
        setActionId(id);
        setActionName(name);
        setShowConfirmModal(true);
    };

    const handleToggleStatus = async () => {
        if (!actionId) return;
        const pos = positions.find(p => p.id === actionId);
        const newStatus = !pos.isActive;
        try {
            setIsSubmitting(true);
            await masterDataService.updatePosition(actionId, { isActive: newStatus });
            setPositions(positions.map(p => p.id === actionId ? { ...p, isActive: newStatus } : p));
            setShowConfirmModal(false);
        } catch (error) {
            alert(`Failed to ${newStatus ? 'activate' : 'deactivate'} position.`);
        } finally {
            setIsSubmitting(false);
            setActionId(null);
            setActionName(null);
        }
    };

    return (
        <div style={{ 
            padding: '48px 64px', 
            backgroundColor: '#F8FAFC', 
            minHeight: '100vh', 
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Blobs for Glassmorphism effect */}
            <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', backgroundColor: '#E0F2FE', filter: 'blur(100px)', borderRadius: '50%', opacity: 0.5, zIndex: 0 }}></div>
            <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '400px', height: '400px', backgroundColor: '#EDE9FE', filter: 'blur(100px)', borderRadius: '50%', opacity: 0.5, zIndex: 0 }}></div>

            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginBottom: '48px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h1 style={{ fontSize: '40px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em', lineHeight: 1 }}>Position Architecture</h1>
                            <p style={{ fontSize: '16px', color: '#64748b', marginTop: '12px', fontWeight: 500 }}>Define career paths and expectations for each professional role.</p>
                        </div>
                        <Link href="/employer/positions/new">
                            <button style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '12px', 
                                padding: '16px 32px', 
                                backgroundColor: '#5C9AFF', 
                                color: 'white', 
                                borderRadius: '18px', 
                                border: 'none', 
                                fontSize: '16px', 
                                fontWeight: 800, 
                                cursor: 'pointer', 
                                boxShadow: '0 10px 20px -5px rgba(92, 154, 255, 0.4)',
                                transition: 'all 0.3s ease'
                            }}>
                                <Plus size={22} strokeWidth={3} /> Add New Position
                            </button>
                        </Link>
                    </div>
                    
                    <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
                        <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
                        <input 
                            type="text"
                            placeholder="Search for job positions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ 
                                width: '100%', 
                                padding: '18px 20px 18px 56px', 
                                backgroundColor: 'white', 
                                border: '1px solid #e2e8f0', 
                                borderRadius: '20px', 
                                fontSize: '15px', 
                                fontWeight: 600, 
                                outline: 'none',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                                transition: 'all 0.3s ease'
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = '#5C9AFF';
                                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(92, 154, 255, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = '#e2e8f0';
                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
                            }}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div style={{ padding: '100px 0', textAlign: 'center' }}>
                        <Loader2 className="animate-spin" style={{ margin: '0 auto' }} color="#5C9AFF" size={48} />
                    </div>
                ) : filteredPositions.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                        {filteredPositions.map((pos, idx) => {
                            const theme = CARD_THEMES[idx % CARD_THEMES.length];
                            const isInactive = pos.isActive === false;
                            
                            return (
                                <div 
                                    key={pos.id || idx} 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (!isInactive) setSelectedPosition(pos);
                                    }}
                                    style={{ textDecoration: 'none', display: 'block' }}
                                >
                                    <div style={{
                                        backgroundColor: theme.bg,
                                        backdropFilter: 'blur(12px)',
                                        borderRadius: '32px',
                                        padding: '32px',
                                        border: '1px solid rgba(255, 255, 255, 0.6)',
                                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                        cursor: isInactive ? 'default' : 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '20px',
                                        minHeight: '220px',
                                        height: '100%',
                                        opacity: isInactive ? 0.6 : 1,
                                        position: 'relative',
                                        boxSizing: 'border-box',
                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isInactive) {
                                            e.currentTarget.style.transform = 'translateY(-10px)';
                                            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.1)';
                                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.9)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                                    }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ width: '44px', height: '44px', backgroundColor: 'white', backdropFilter: 'blur(4px)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.text, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                            <Target size={22} strokeWidth={2.5} />
                                        </div>
                                        {pos.companyId ? (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <Link href={`/employer/positions/${pos.id}/edit`} onClick={(e) => e.stopPropagation()} style={{ textDecoration: 'none' }}>
                                                    <div style={{ width: '32px', height: '32px', backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                                        <Edit2 size={14} />
                                                    </div>
                                                </Link>
                                                <div 
                                                    onClick={(e) => { e.stopPropagation(); openConfirmModal(pos.id, pos.name); }}
                                                    style={{ width: '32px', height: '32px', backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isInactive ? '#10b981' : '#ef4444' }}
                                                >
                                                    {isInactive ? <Eye size={14} /> : <EyeOff size={14} />}
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ padding: '4px 10px', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '8px', fontSize: '10px', fontWeight: 800, color: theme.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                System
                                            </div>
                                        )}
                                        </div>
                                        
                                        <div>
                                            <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>{pos.name}</h3>
                                            <p style={{ fontSize: '14px', color: '#334155', marginTop: '10px', fontWeight: 600, lineHeight: 1.5, height: '42px', overflow: 'hidden' }}>
                                                {pos.description || "Define professional career paths for this role."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ padding: '100px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(10px)', borderRadius: '40px', border: '2px dashed rgba(226, 232, 240, 0.8)' }}>
                        <DatabaseZap size={64} color="#cbd5e1" style={{ marginBottom: '24px' }} />
                        <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#1e293b' }}>No positions defined</h3>
                        <p style={{ fontSize: '16px', color: '#64748b', maxWidth: '400px', marginTop: '8px', lineHeight: 1.6 }}>
                            Start by defining job roles to help the system support you best.
                        </p>
                        <Link href="/employer/positions/new" style={{ marginTop: '32px' }}>
                            <button style={{ padding: '16px 40px', backgroundColor: '#5C9AFF', color: 'white', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)' }}>
                                Create First Position
                            </button>
                        </Link>
                    </div>
                )}
            </div>

            {/* Custom Premium Confirm Modal */}
            {showConfirmModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
                    <div style={{
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(20px)',
                        padding: '40px',
                        borderRadius: '32px',
                        width: '100%',
                        maxWidth: '480px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
                        border: '1px solid rgba(255,255,255,0.8)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                backgroundColor: positions.find(p => p.id === actionId)?.isActive === false ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <ShieldAlert size={32} color={positions.find(p => p.id === actionId)?.isActive === false ? '#10b981' : '#ef4444'} />
                            </div>
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                style={{ padding: '8px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>Confirm Changes?</h3>
                        <p style={{ color: '#64748b', fontSize: '16px', lineHeight: 1.6, marginBottom: '40px' }}>
                            Are you sure you want to change the status of <strong>"{actionName}"</strong>?
                        </p>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                disabled={isSubmitting}
                                style={{ flex: 1, padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#0f172a', fontWeight: 800, fontSize: '15px', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleToggleStatus}
                                disabled={isSubmitting}
                                style={{
                                    flex: 1,
                                    padding: '16px',
                                    borderRadius: '16px',
                                    border: 'none',
                                    backgroundColor: '#5C9AFF',
                                    color: 'white',
                                    fontWeight: 800,
                                    fontSize: '15px',
                                    cursor: 'pointer',
                                    boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)'
                                }}
                            >
                                {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Detail Popup Modal */}
            {selectedPosition && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }} onClick={() => setSelectedPosition(null)}>
                    <div 
                        style={{
                            backgroundColor: 'white',
                            padding: '48px',
                            borderRadius: '32px',
                            width: '100%',
                            maxWidth: '600px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #f1f5f9',
                            position: 'relative'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedPosition(null)}
                            style={{ position: 'absolute', top: '24px', right: '24px', padding: '10px', backgroundColor: '#f8fafc', border: 'none', borderRadius: '12px', cursor: 'pointer', color: '#94a3b8' }}
                        >
                            <X size={20} />
                        </button>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                            <div style={{ width: '56px', height: '56px', backgroundColor: '#eff6ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5C9AFF' }}>
                                <Target size={28} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: 0 }}>{selectedPosition.name}</h2>
                                <p style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>Position Details</p>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '32px' }}>
                            <h4 style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Position Description</h4>
                            <p style={{ fontSize: '16px', color: '#334155', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap' }}>
                                {selectedPosition.description || "No detailed description for this position."}
                            </p>
                        </div>

                        <div style={{ marginTop: '48px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setSelectedPosition(null)}
                                style={{ padding: '14px 32px', borderRadius: '14px', border: 'none', backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 800, fontSize: '14px', cursor: 'pointer' }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
