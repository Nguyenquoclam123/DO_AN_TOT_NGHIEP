"use client";

import React, { useEffect, useState } from "react";
import {
    Plus,
    Target,
    Layers,
    Loader2,
    Settings2,
    EyeOff,
    Eye,
    Edit2,
    Save,
    AlertCircle,
    CheckCircle2,
    X,
    ShieldAlert
} from "lucide-react";
import { masterDataService } from "@/services/master-data.service";
import { useAuthStore } from "@/store/authStore";

export default function SeniorityFrameworkPage() {
    const [levels, setLevels] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState<string | null>(null);
    const [levelData, setLevelData] = useState({ name: '', level: 1, description: '' });
    const [actionId, setActionId] = useState<string | null>(null);
    const [actionName, setActionName] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const user = useAuthStore((state) => state.user);

    const fetchLevels = async () => {
        try {
            setIsLoading(true);
            const data = await masterDataService.getLevels(user?.companyId);
            setLevels(data || []);
        } catch (error) {
            console.error("Failed to fetch levels", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchLevels();
    }, [user]);

    const handleOpenAdd = () => {
        setEditMode(false);
        setCurrentId(null);
        setLevelData({ name: '', level: 1, description: '' });
        setShowModal(true);
    };

    const handleOpenEdit = (lvl: any) => {
        setEditMode(true);
        setCurrentId(lvl.id);
        setLevelData({ name: lvl.name, level: lvl.level, description: lvl.description || '' });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            if (editMode && currentId) {
                await masterDataService.updateLevel(currentId, levelData);
            } else {
                await masterDataService.createLevel({
                    ...levelData,
                    companyId: user?.companyId
                });
            }
            setShowModal(false);
            fetchLevels();
        } catch (error) {
            alert(`Failed to ${editMode ? 'update' : 'create'} level`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const openConfirmModal = (id: string, name: string) => {
        setActionId(id);
        setActionName(name);
        setShowConfirmModal(true);
    };

    const handleToggleStatus = async () => {
        if (!actionId) return;

        const lvl = levels.find(l => l.id === actionId);
        const newStatus = !lvl.isActive;

        try {
            setIsSubmitting(true);
            await masterDataService.updateLevel(actionId, { isActive: newStatus });

            setLevels(levels.map(l =>
                l.id === actionId ? { ...l, isActive: newStatus } : l
            ));

            setShowConfirmModal(false);
        } catch (error) {
            alert(`Failed to ${newStatus ? 'activate' : 'deactivate'} level.`);
        } finally {
            setIsSubmitting(false);
            setActionId(null);
            setActionName(null);
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
                <div>
                    <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Seniority Framework</h2>
                    <p style={{ fontSize: '15px', color: '#64748b', marginTop: '8px' }}>Standardize seniority expectations across your organization.</p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    style={{ padding: '14px 28px', backgroundColor: '#5C9AFF', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' }}
                >
                    <Plus size={20} /> Add New Level
                </button>
            </div>

            {isLoading ? (
                <div style={{ padding: '100px 0', textAlign: 'center' }}>
                    <Loader2 className="animate-spin" style={{ margin: '0 auto' }} color="#5C9AFF" size={48} />
                </div>
            ) : levels.length > 0 ? (
                <div style={{ display: 'grid', gap: '16px' }}>
                    {levels.map((lvl) => {
                        const isInactive = lvl.isActive === false;
                        return (
                            <div key={lvl.id} style={{
                                backgroundColor: 'white',
                                padding: '24px 32px',
                                borderRadius: '24px',
                                border: '1px solid #f1f5f9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                opacity: isInactive ? 0.6 : 1,
                                filter: isInactive ? 'grayscale(0.6)' : 'none'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                    <div style={{
                                        width: '56px',
                                        height: '56px',
                                        backgroundColor: isInactive ? '#f1f5f9' : '#f0f9ff',
                                        borderRadius: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: isInactive ? '#94a3b8' : '#0369a1',
                                        fontWeight: 900,
                                        fontSize: '20px',
                                        transition: 'all 0.3s'
                                    }}>
                                        L{lvl.level}
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <h4 style={{ fontSize: '18px', fontWeight: 800, color: isInactive ? '#64748b' : '#1e293b', margin: 0 }}>{lvl.name}</h4>
                                            {isInactive ? (
                                                <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '8px', textTransform: 'uppercase' }}>Inactive</span>
                                            ) : (lvl.companyId ? (
                                                <span style={{ fontSize: '10px', fontWeight: 800, color: '#166534', backgroundColor: '#f0fdf4', padding: '4px 10px', borderRadius: '8px' }}>Internal</span>
                                            ) : (
                                                <span style={{ fontSize: '10px', fontWeight: 800, color: '#0369a1', backgroundColor: '#f0f9ff', padding: '4px 10px', borderRadius: '8px', textTransform: 'uppercase' }}>System</span>
                                            ))}
                                        </div>
                                        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px', margin: 0 }}>{lvl.description || "No description provided for this seniority grade."}</p>
                                    </div>
                                </div>

                                {lvl.companyId && (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => handleOpenEdit(lvl)}
                                            style={{ padding: '10px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', color: '#64748b', cursor: 'pointer', transition: 'all 0.2s' }}
                                            title="Edit Level"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => openConfirmModal(lvl.id, lvl.name)}
                                            style={{
                                                padding: '10px',
                                                borderRadius: '10px',
                                                backgroundColor: isInactive ? '#f0fdf4' : '#fef2f2',
                                                border: `1px solid ${isInactive ? '#dcfce7' : '#fee2e2'}`,
                                                color: isInactive ? '#16a34a' : '#ef4444',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            title={isInactive ? "Activate Level" : "Deactivate Level"}
                                        >
                                            {isInactive ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div style={{ padding: '100px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'white', borderRadius: '32px', border: '1px dashed #e2e8f0' }}>
                    <Layers size={56} color="#cbd5e1" style={{ marginBottom: '24px' }} />
                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>No seniority levels defined</h3>
                    <p style={{ fontSize: '15px', color: '#64748b', maxWidth: '380px', marginTop: '8px', lineHeight: 1.6 }}>
                        Your system is currently empty. Define global levels to help our AI rank candidates accurately.
                    </p>
                    <button
                        onClick={handleOpenAdd}
                        style={{ marginTop: '32px', padding: '12px 24px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '13px', fontWeight: 700, color: '#475569', cursor: 'pointer' }}
                    >
                        Initialize First Level
                    </button>
                </div>
            )}

            {/* Modal for Add/Edit */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '32px', width: '100%', maxWidth: '440px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', animation: 'modalSlideUp 0.4s' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                                {editMode ? 'Edit Seniority Level' : 'Create Seniority Level'}
                            </h3>
                            <button onClick={() => setShowModal(false)} style={{ padding: '8px', borderRadius: '12px', border: 'none', cursor: 'pointer', backgroundColor: '#f8fafc', color: '#94a3b8' }}><X size={20} /></button>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>
                            {editMode ? 'Modify this grade in your professional career ladder.' : 'Define a new grade in your professional career ladder.'}
                        </p>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Level Name</label>
                                <input
                                    required
                                    placeholder="e.g. Senior Associate"
                                    value={levelData.name}
                                    onChange={e => setLevelData({ ...levelData, name: e.target.value })}
                                    style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', backgroundColor: '#f8fafc' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Grade Number (L1, L2...)</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={levelData.level}
                                    onChange={e => setLevelData({ ...levelData, level: parseInt(e.target.value) })}
                                    style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', backgroundColor: '#f8fafc' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Description</label>
                                <textarea
                                    rows={3}
                                    placeholder="Responsibilities and expectations..."
                                    value={levelData.description}
                                    onChange={e => setLevelData({ ...levelData, description: e.target.value })}
                                    style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', backgroundColor: '#f8fafc', resize: 'none' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '14px', borderRadius: '16px', border: '1px solid #e2e8f0', backgroundColor: 'transparent', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    style={{ flex: 1, padding: '14px', borderRadius: '16px', border: 'none', backgroundColor: '#5C9AFF', color: 'white', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : (editMode ? <Save size={18} /> : <Plus size={18} />)}
                                    {editMode ? 'Save Changes' : 'Create Level'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Custom Confirm Modal */}
            {showConfirmModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
                    <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '32px', width: '100%', maxWidth: '480px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)', animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                backgroundColor: levels.find(l => l.id === actionId)?.isActive === false ? '#ecfdf5' : '#fef2f2',
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <ShieldAlert size={32} color={levels.find(l => l.id === actionId)?.isActive === false ? '#10b981' : '#ef4444'} />
                            </div>
                            <button onClick={() => setShowConfirmModal(false)} style={{ padding: '8px', cursor: 'pointer', backgroundColor: '#f8fafc', border: 'none', borderRadius: '12px', color: '#94a3b8' }}><X size={20} /></button>
                        </div>
                        <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                            {levels.find(l => l.id === actionId)?.isActive === false ? 'Activate' : 'Deactivate'} Level?
                        </h3>
                        <p style={{ color: '#64748b', fontSize: '16px', lineHeight: 1.6, marginBottom: '40px' }}>
                            Are you sure you want to {levels.find(l => l.id === actionId)?.isActive === false ? 'reactivate' : 'deactivate'} <strong>"{actionName}"</strong>?
                            {levels.find(l => l.id === actionId)?.isActive === false
                                ? ' This seniority level will be available again for candidate ranking.'
                                : ' This will hide it from new recruitment cycles but preserve existing grade history.'}
                        </p>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button onClick={() => setShowConfirmModal(false)} disabled={isSubmitting} style={{ flex: 1, padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', backgroundColor: 'transparent', fontWeight: 800, cursor: 'pointer' }}>Cancel</button>
                            <button
                                onClick={handleToggleStatus}
                                disabled={isSubmitting}
                                style={{
                                    flex: 1, padding: '16px', borderRadius: '16px', border: 'none',
                                    backgroundColor: levels.find(l => l.id === actionId)?.isActive === false ? '#10b981' : '#ef4444',
                                    color: 'white', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    boxShadow: `0 10px 15px -3px ${levels.find(l => l.id === actionId)?.isActive === false ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                                }}
                            >
                                {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                                {levels.find(l => l.id === actionId)?.isActive === false ? 'Activate Now' : 'Yes, Deactivate'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes modalSlideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
