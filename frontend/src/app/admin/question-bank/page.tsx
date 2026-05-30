"use client";

import React, { useEffect, useState } from "react";
import {
    Plus,
    Search,
    Database,
    Briefcase,
    Layers,
    Loader2,
    ChevronRight,
    Search as SearchIcon,
    Globe,
    Building2,
    BookOpen,
    X,
    CheckCircle2,
    Brain,
    FileText,
    Edit3,
    Trash2
} from "lucide-react";
import Link from "next/link";
import { masterDataService } from "@/services/master-data.service";
import { questionBankService } from "@/services/question-bank.service";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/shared/ConfirmModal";

export default function AdminQuestionBankOverview() {
    const [positions, setPositions] = useState<any[]>([]);
    const [levels, setLevels] = useState<any[]>([]);
    const [allSets, setAllSets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [showGlobalModal, setShowGlobalModal] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingSet, setEditingSet] = useState<any>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [setToDeleteId, setSetToDeleteId] = useState<string | null>(null);
    const [globalSetData, setGlobalSetData] = useState({ name: '', description: '', category: 'Logic' });
    const [newSet, setNewSet] = useState({ name: '', description: '', category: 'Technical', positionId: '', levelId: '' });
    
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [posData, lvlData, setsData] = await Promise.all([
                    masterDataService.getPositions().catch(() => []),
                    masterDataService.getLevels().catch(() => []),
                    questionBankService.getSets({ companyId: '' }).catch(() => []) // Explicitly request system sets
                ]);

                setPositions(posData || []);
                setLevels((lvlData || []).sort((a: any, b: any) => a.level - b.level));
                setAllSets(setsData || []);
            } catch (error) {
                console.error("Failed to fetch admin question bank data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCreateSet = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await questionBankService.createSet({
                ...newSet,
                companyId: null
            });
            const setsData = await questionBankService.getSets({ companyId: '' });
            setAllSets(setsData);
            setIsCreateModalOpen(false);
            setNewSet({ name: '', description: '', category: 'Technical', positionId: '', levelId: '' });
        } catch (error) {
            console.error("Failed to create set", error);
            alert("An error occurred while creating the question set.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteSet = async (id: string) => {
        setSetToDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteSet = async () => {
        if (!setToDeleteId) return;
        try {
            await questionBankService.deleteSet(setToDeleteId);
            setAllSets(prev => prev.filter(s => s.id !== setToDeleteId));
            setIsDeleteModalOpen(false);
            setSetToDeleteId(null);
        } catch (error) {
            console.error("Failed to delete set", error);
            alert("Could not delete this question set.");
        }
    };

    const handleUpdateSet = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSet) return;
        try {
            setIsSubmitting(true);
            await questionBankService.updateSet(editingSet.id, {
                name: editingSet.name,
                description: editingSet.description,
                category: editingSet.category
            });
            const setsData = await questionBankService.getSets({ companyId: '' });
            setAllSets(setsData);
            setIsEditModalOpen(false);
            setEditingSet(null);
        } catch (error) {
            console.error("Failed to update set", error);
            alert("An error occurred while updating the question set.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader2 className="animate-spin" size={48} color="#1e40af" />
                    <p style={{ fontWeight: 700, color: '#64748b', marginTop: '16px' }}>Loading data...</p>
                </div>
            </div>
        );
    }

    const globalSets = allSets.filter(s => !s.positionId && !s.levelId);

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px' }}>
            {/* Top Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div style={{ position: 'relative', width: '400px' }}>
                    <SearchIcon size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        placeholder="Search for position, level, or question set..."
                        style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: 'white', outline: 'none', fontSize: '14px' }}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button 
                        onClick={() => setShowGlobalModal(true)}
                        style={{ backgroundColor: '#1e40af', color: 'white', padding: '10px 24px', borderRadius: '10px', border: 'none', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                    >
                        <Brain size={18} /> Create Logic Set
                    </button>
                </div>
            </div>

            {/* Header Content */}
            <div style={{ marginBottom: '48px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Standardized Question Bank</h1>
                <p style={{ color: '#64748b', marginTop: '8px', fontSize: '15px' }}>Configure template question sets for all companies on the platform.</p>
            </div>

            {/* Global & Logic Section */}
            <div style={{ marginBottom: '64px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ width: '32px', height: '32px', backgroundColor: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Globe size={18} color="#1e40af" />
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>General & Logic Question Sets</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                    {globalSets.map(set => (
                        <QuestionSetCard 
                            key={set.id} 
                            set={set} 
                            onDelete={() => handleDeleteSet(set.id)}
                            onEdit={() => {
                                setEditingSet(set);
                                setIsEditModalOpen(true);
                            }}
                        />
                    ))}
                    {globalSets.length === 0 && <p style={{ color: '#94a3b8', fontSize: '14px', fontStyle: 'italic' }}>No general question sets available.</p>}
                </div>
            </div>

            {/* Jobs & Levels Hierarchy */}
            <div>
            {/* Position Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '24px' }}>
                {positions.map((pos) => (
                    <div key={pos.id} style={{ backgroundColor: 'white', border: '1px solid #f1f5f9', borderRadius: '24px', overflow: 'hidden' }}>
                        <div style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    <div style={{ width: '40px', height: '40px', backgroundColor: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Briefcase size={20} color="#5C9AFF" />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>{pos.name}</h3>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>System Template</p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {levels.map((lvl) => {
                                    const matchingSets = allSets.filter(s => 
                                        (s.positionId === pos.id || s.position?.id === pos.id) && 
                                        (s.levelId === lvl.id || s.level?.id === lvl.id) &&
                                        s.category !== 'Logic'
                                    );
                                    const setCount = matchingSets.length;
                                    return (
                                        <Link key={lvl.id} href={`/admin/question-bank/${pos.id}/${lvl.id}`} style={{ textDecoration: 'none' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '12px', cursor: 'pointer', border: '1px solid transparent', transition: 'all 0.2s' }}>
                                                <span style={{ fontSize: '14px', fontWeight: 700, color: '#475569' }}>{lvl.name}</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{
                                                        fontSize: '10px',
                                                        fontWeight: 800,
                                                        color: setCount > 0 ? '#5C9AFF' : '#94a3b8',
                                                        backgroundColor: setCount > 0 ? '#eff6ff' : '#f1f5f9',
                                                        padding: '2px 8px',
                                                        borderRadius: '6px'
                                                    }}>
                                                        {setCount} SETS
                                                    </span>
                                                    <ChevronRight size={14} color="#cbd5e1" />
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            style={{ backgroundColor: 'white', width: '100%', maxWidth: '600px', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
                        >
                            <div style={{ padding: '40px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ width: '48px', height: '48px', backgroundColor: '#eff6ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <BookOpen size={24} color="#1e40af" />
                                        </div>
                                        <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', margin: 0 }}>Create New Question Set</h3>
                                    </div>
                                    <button onClick={() => setIsCreateModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', padding: '8px' }}>
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleCreateSet} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Question Set Name</label>
                                        <input
                                            required
                                            placeholder="e.g. React Fundamentals"
                                            value={newSet.name}
                                            onChange={e => setNewSet({ ...newSet, name: e.target.value })}
                                            style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '15px', fontWeight: 600, outline: 'none' }}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Job Position</label>
                                            <select
                                                value={newSet.positionId}
                                                onChange={e => setNewSet({ ...newSet, positionId: e.target.value })}
                                                style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '15px', fontWeight: 600, outline: 'none' }}
                                            >
                                                <option value="">All Positions (General)</option>
                                                {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Level</label>
                                            <select
                                                value={newSet.levelId}
                                                onChange={e => setNewSet({ ...newSet, levelId: e.target.value })}
                                                style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '15px', fontWeight: 600, outline: 'none' }}
                                            >
                                                <option value="">All Levels (General)</option>
                                                {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Category</label>
                                        <select
                                            value={newSet.category}
                                            onChange={e => setNewSet({ ...newSet, category: e.target.value })}
                                            style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '15px', fontWeight: 600, outline: 'none' }}
                                        >
                                            <option value="Technical">Technical</option>
                                            <option value="Logic">Logic & Reasoning</option>
                                            <option value="Behavioral">Behavioral</option>
                                            <option value="Culture">Culture Fit</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Description (Optional)</label>
                                        <textarea
                                            placeholder="Describe the purpose of this set..."
                                            value={newSet.description}
                                            onChange={e => setNewSet({ ...newSet, description: e.target.value })}
                                            style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '15px', fontWeight: 600, outline: 'none', minHeight: '100px', resize: 'vertical' }}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                                        <button
                                            type="button"
                                            onClick={() => setIsCreateModalOpen(false)}
                                            style={{ padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#64748b', fontWeight: 800, cursor: 'pointer' }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            style={{ padding: '16px', borderRadius: '16px', border: 'none', backgroundColor: '#1e40af', color: 'white', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', opacity: isSubmitting ? 0.7 : 1 }}
                                        >
                                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                                            {isSubmitting ? 'Processing...' : 'Create Now'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Global Creation Modal */}
            {showGlobalModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '32px', width: '100%', maxWidth: '480px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)', animation: 'modalSlideUp 0.4s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                            <div style={{ width: '56px', height: '56px', backgroundColor: '#f0fdf4', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                                <Brain size={28} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Create Logic Set (System)</h3>
                                <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0' }}>Shared across all Positions & Levels platform-wide</p>
                            </div>
                        </div>

                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            setIsSubmitting(true);
                            try {
                                await questionBankService.createSet({ ...globalSetData, positionId: null, levelId: null });
                                window.location.reload();
                            } catch (error) { alert("Error creating system set"); }
                            finally { setIsSubmitting(false); }
                        }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Question Set Name</label>
                                <input
                                    required
                                    placeholder="e.g. System IQ & Logic - Set 1"
                                    value={globalSetData.name}
                                    onChange={e => setGlobalSetData({ ...globalSetData, name: e.target.value })}
                                    style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '15px', fontWeight: 600, outline: 'none' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Description</label>
                                <textarea
                                    rows={3}
                                    placeholder="Describe the standardized system set..."
                                    value={globalSetData.description}
                                    onChange={e => setGlobalSetData({ ...globalSetData, description: e.target.value })}
                                    style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '15px', fontWeight: 600, outline: 'none', resize: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                                <button type="button" onClick={() => setShowGlobalModal(false)} style={{ flex: 1, padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', backgroundColor: 'transparent', fontWeight: 800, color: '#64748b', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: '16px', borderRadius: '14px', border: 'none', backgroundColor: '#16a34a', color: 'white', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    {isSubmitting && <Loader2 className="animate-spin" size={18} />}
                                    Create System Set
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            <AnimatePresence>
                {isEditModalOpen && editingSet && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            style={{ backgroundColor: 'white', width: '100%', maxWidth: '500px', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
                        >
                            <div style={{ padding: '40px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                    <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: 0 }}>Edit Information</h3>
                                    <button onClick={() => setIsEditModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', padding: '8px' }}>
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleUpdateSet} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Question Set Name</label>
                                        <input
                                            required
                                            value={editingSet.name}
                                            onChange={e => setEditingSet({ ...editingSet, name: e.target.value })}
                                            style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '15px', fontWeight: 600, outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Category</label>
                                        <select
                                            value={editingSet.category}
                                            onChange={e => setEditingSet({ ...editingSet, category: e.target.value })}
                                            style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '15px', fontWeight: 600, outline: 'none' }}
                                        >
                                            <option value="Technical">Technical</option>
                                            <option value="Logic">Logic & Reasoning</option>
                                            <option value="Behavioral">Behavioral</option>
                                            <option value="Culture">Culture Fit</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Description</label>
                                        <textarea
                                            rows={3}
                                            value={editingSet.description || ''}
                                            onChange={e => setEditingSet({ ...editingSet, description: e.target.value })}
                                            style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '15px', fontWeight: 600, outline: 'none', resize: 'none' }}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '8px' }}>
                                        <button type="button" onClick={() => setIsEditModalOpen(false)} style={{ padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', backgroundColor: 'transparent', fontWeight: 800, color: '#64748b', cursor: 'pointer' }}>Cancel</button>
                                        <button type="submit" disabled={isSubmitting} style={{ padding: '16px', borderRadius: '14px', border: 'none', backgroundColor: '#1e40af', color: 'white', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            {isSubmitting && <Loader2 className="animate-spin" size={18} />}
                                            Update
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                title="Confirm Delete Set"
                message="Are you sure you want to delete this question set? All questions inside will be permanently lost."
                onConfirm={confirmDeleteSet}
                onCancel={() => {
                    setIsDeleteModalOpen(false);
                    setSetToDeleteId(null);
                }}
                type="danger"
                confirmText="Delete Now"
                cancelText="Cancel"
            />

            <style>{`
                @keyframes modalSlideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

function QuestionSetCard({ set, onEdit, onDelete }: { set: any, onEdit: () => void, onDelete: () => void }) {
    return (
        <div style={{ position: 'relative' }}>
            <Link href={`/admin/question-bank/set/${set.id}/manage`} style={{ textDecoration: 'none' }}>
                <div style={{ 
                    backgroundColor: 'white', 
                    borderRadius: '24px', 
                    border: '1px solid #f1f5f9', 
                    padding: '24px', 
                    display: 'flex', 
                    gap: '20px', 
                    alignItems: 'center',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#eff6ff'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.02)'; e.currentTarget.style.borderColor = '#f1f5f9'; }}
                >
                    <div style={{ 
                        width: '56px', 
                        height: '56px', 
                        backgroundColor: set.category === 'Logic' ? '#f0fdf4' : '#eff6ff', 
                        borderRadius: '16px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: set.category === 'Logic' ? '#16a34a' : '#5C9AFF'
                    }}>
                        {set.category === 'Logic' ? <Brain size={28} /> : <FileText size={28} />}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{set.name}</h3>
                        </div>
                        <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                            {set.questions?.length || 0} questions • {set.category}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); }}
                            style={{ width: '36px', height: '36px', borderRadius: '10px', border: 'none', backgroundColor: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseOver={e => { e.currentTarget.style.backgroundColor = '#eff6ff'; e.currentTarget.style.color = '#1e40af'; }}
                            onMouseOut={e => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
                        >
                            <Edit3 size={16} />
                        </button>
                        <button 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
                            style={{ width: '36px', height: '36px', borderRadius: '10px', border: 'none', backgroundColor: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseOver={e => { e.currentTarget.style.backgroundColor = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; }}
                            onMouseOut={e => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            </Link>
        </div>
    );
}
