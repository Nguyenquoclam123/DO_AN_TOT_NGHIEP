"use client";

import React, { useEffect, useState } from "react";
import {
    Plus,
    Search,
    Bell,
    HelpCircle,
    Database,
    Zap,
    Briefcase,
    Target,
    Layers,
    Loader2,
    Settings2,
    ChevronRight,
    Search as SearchIcon,
    Brain
} from "lucide-react";
import Link from "next/link";
import { masterDataService } from "@/services/master-data.service";
import { questionBankService } from "@/services/question-bank.service";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function QuestionBankOverview() {
    const [positions, setPositions] = useState<any[]>([]);
    const [levels, setLevels] = useState<any[]>([]);
    const [summary, setSummary] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const user = useAuthStore((state) => state.user);
    const router = useRouter();
    const [showGlobalModal, setShowGlobalModal] = useState(false);
    const [isSubmittingGlobal, setIsSubmittingGlobal] = useState(false);
    const [globalSetData, setGlobalSetData] = useState({ name: '', description: '', category: 'Logic' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                // Fetch positions and levels first as they are critical
                const [posData, lvlData] = await Promise.all([
                    masterDataService.getPositions(user?.companyId).catch(err => {
                        console.error("Failed to fetch positions", err);
                        return [];
                    }),
                    masterDataService.getLevels(user?.companyId).catch(err => {
                        console.error("Failed to fetch levels", err);
                        return [];
                    })
                ]);

                setPositions(posData || []);
                setLevels((lvlData || []).sort((a, b) => a.level - b.level));

                // Fetch summary separately so it doesn't block the main list if it fails
                try {
                    const summaryData = await questionBankService.getSummary();
                    setSummary(summaryData || []);
                } catch (summaryError) {
                    console.error("Failed to fetch summary", summaryError);
                    setSummary([]);
                }
            } catch (error) {
                console.error("Critical failure in fetchData", error);
            } finally {
                setIsLoading(false);
            }
        };
        if (user) fetchData();
    }, [user]);

    // Fetch global sets separately
    const [globalSets, setGlobalSets] = useState<any[]>([]);

    useEffect(() => {
        const fetchGlobal = async () => {
            if (!user?.companyId) return;
            try {
                // Explicitly fetch sets for THIS company
                const data = await questionBankService.getSets({ companyId: user.companyId });
                // Filter for sets that don't belong to a specific position/level (Global/Mindset)
                const globalOnly = data.filter(s => !s.positionId && !s.levelId);
                setGlobalSets(globalOnly);
            } catch (err) {
                console.error("Failed to fetch global sets", err);
            }
        };
        fetchGlobal();
    }, [user?.companyId]);

    const handleCreateGlobalSet = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmittingGlobal(true);
            const createdSet = await questionBankService.createSet({
                ...globalSetData,
                positionId: null,
                levelId: null,
                companyId: user?.companyId
            });
            setShowGlobalModal(false);
            setGlobalSetData({ name: '', description: '', category: 'Logic' });
            router.push(`/employer/question-bank/set/${createdSet.id}/manage`);
        } catch (error) {
            alert("Failed to create global set");
        } finally {
            setIsSubmittingGlobal(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={48} color="#5C9AFF" />
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '32px' }}>
            {/* Top Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                {/* Search Hidden as per request */}
                <div style={{ width: '400px' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <Bell size={20} color="#64748b" style={{ cursor: 'pointer' }} />
                    <HelpCircle size={20} color="#64748b" style={{ cursor: 'pointer' }} />
                    <button 
                        onClick={() => setShowGlobalModal(true)}
                        style={{ backgroundColor: '#5C9AFF', color: 'white', padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                    >
                        <Plus size={18} /> Create Mindset Question Set
                    </button>
                </div>
            </div>

            {/* Header Content */}
            <div style={{ marginBottom: '48px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Recruitment Question Bank</h1>
                        <p style={{ color: '#64748b', marginTop: '8px', fontSize: '15px' }}>Use standardized question sets from the system or create your own for your business.</p>
                    </div>
                </div>
            </div>

            {/* Global Logic Sets Section */}
            {globalSets.length > 0 && (
                <div style={{ marginBottom: '48px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div style={{ width: '32px', height: '32px', backgroundColor: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Brain size={18} color="#5C9AFF" />
                        </div>
                        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Mindset & System Question Sets (Shared)</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                        {globalSets.map(set => (
                            <Link key={set.id} href={`/employer/question-bank/set/${set.id}`} style={{ textDecoration: 'none' }}>
                                <div style={{ backgroundColor: 'white', border: '1px solid #f1f5f9', borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                    <div style={{ width: '48px', height: '48px', backgroundColor: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Brain size={24} color="#5C9AFF" />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>{set.name}</h3>
                                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>{set.questions?.length || 0} questions • {set.category}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats Overview */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ width: '32px', height: '32px', backgroundColor: '#f0fdf4', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Briefcase size={18} color="#16a34a" />
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Assessment by Job Position</h2>
                </div>
            </div>

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
                                        <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Engineering</p>
                                    </div>
                                </div>
                                {/* Settings Button Hidden as per request */}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {levels.map((lvl) => (
                                    <Link key={lvl.id} href={`/employer/question-bank/${pos.id}/${lvl.id}`} style={{ textDecoration: 'none' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '12px', cursor: 'pointer', border: '1px solid transparent', transition: 'border-color 0.2s' }}>
                                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#475569' }}>{lvl.name}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {(() => {
                                                    const setCount = summary.find(s => s.positionId === pos.id && s.levelId === lvl.id)?.setCount || 0;
                                                    const hasSets = setCount > 0;
                                                    return (
                                                        <span style={{
                                                            fontSize: '10px',
                                                            fontWeight: 800,
                                                            color: hasSets ? '#5C9AFF' : '#94a3b8',
                                                            backgroundColor: hasSets ? '#eff6ff' : '#f1f5f9',
                                                            padding: '2px 8px',
                                                            borderRadius: '6px'
                                                        }}>
                                                            {setCount} {setCount === 1 ? 'SET' : 'SETS'}
                                                        </span>
                                                    );
                                                })()}
                                                <ChevronRight size={14} color="#cbd5e1" />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {/* Global Creation Modal */}
            {showGlobalModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '32px', width: '100%', maxWidth: '480px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)', animation: 'modalSlideUp 0.4s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                            <div style={{ width: '56px', height: '56px', backgroundColor: '#eff6ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5C9AFF' }}>
                                <Brain size={28} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Create Mindset Question Set</h3>
                                <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0' }}>Will be shared across all Positions & Levels</p>
                            </div>
                        </div>

                        <form onSubmit={handleCreateGlobalSet} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Question Set Name</label>
                                <input
                                    required
                                    placeholder="e.g., General IQ & Logic Test"
                                    value={globalSetData.name}
                                    onChange={e => setGlobalSetData({ ...globalSetData, name: e.target.value })}
                                    style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '15px', fontWeight: 600, outline: 'none' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Description (Optional)</label>
                                <textarea
                                    rows={3}
                                    placeholder="Main content of this mindset assessment..."
                                    value={globalSetData.description}
                                    onChange={e => setGlobalSetData({ ...globalSetData, description: e.target.value })}
                                    style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '15px', fontWeight: 600, outline: 'none', resize: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                                <button type="button" onClick={() => setShowGlobalModal(false)} style={{ flex: 1, padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', backgroundColor: 'transparent', fontWeight: 800, color: '#64748b', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" disabled={isSubmittingGlobal} style={{ flex: 1, padding: '16px', borderRadius: '14px', border: 'none', backgroundColor: '#5C9AFF', color: 'white', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    {isSubmittingGlobal && <Loader2 className="animate-spin" size={18} />}
                                    Create Now
                                </button>
                            </div>
                        </form>
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
