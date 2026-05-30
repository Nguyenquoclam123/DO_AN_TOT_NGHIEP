"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Plus,
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    Users,
    ArrowUpDown,
    Loader2,
    FileText,
    Brain,
    Terminal,
    MessageSquare
} from "lucide-react";
import Link from "next/link";
import { questionBankService } from "@/services/question-bank.service";
import { masterDataService } from "@/services/master-data.service";

export default function QuestionSetsPage() {
    const params = useParams();
    const router = useRouter();
    const [sets, setSets] = useState<any[]>([]);
    const [position, setPosition] = useState<any>(null);
    const [level, setLevel] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newSet, setNewSet] = useState({ name: '', description: '', category: 'Technical' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [setsData, posData, lvlData] = await Promise.all([
                    questionBankService.getSets({
                        positionId: params.positionId as string,
                        levelId: params.levelId as string
                    }),
                    masterDataService.getPositions(),
                    masterDataService.getLevels()
                ]);

                setSets(setsData || []);
                setPosition(posData.find((p: any) => p.id === params.positionId));
                setLevel(lvlData.find((l: any) => l.id === params.levelId));
            } catch (error) {
                console.error("Failed to fetch sets", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [params]);

    const handleCreateSet = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newSet.name.trim()) return;

        try {
            setIsSubmitting(true);
            const isLogic = newSet.category === 'Logic';
            const createdSet = await questionBankService.createSet({
                ...newSet,
                positionId: isLogic ? null : params.positionId,
                levelId: isLogic ? null : (newSet.levelId === "" ? null : (newSet.levelId || params.levelId))
            });
            
            setShowModal(false);
            setNewSet({ name: '', description: '', category: 'Technical' });
            
            // Success redirect to add questions for this new set
            router.push(`/employer/question-bank/set/${createdSet.id}/manage`);
        } catch (error) {
            alert("Failed to create set");
        } finally {
            setIsSubmitting(false);
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
        <div style={{ backgroundColor: '#fcfcfc', minHeight: '100vh', padding: '32px 64px' }}>
            {/* Breadcrumbs */}
            <div style={{ display: 'flex', gap: '8px', color: '#94a3b8', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px' }}>
                <Link href="/employer/question-bank" style={{ color: '#94a3b8', textDecoration: 'none' }}>Question Bank</Link>
                <span>›</span>
                <span>Positions</span>
                <span>›</span>
                <span style={{ color: '#1e293b' }}>{position?.name} - {level?.name}</span>
            </div>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Available Question Sets</h1>
                    <p style={{ color: '#64748b', marginTop: '12px', fontSize: '16px', maxWidth: '600px' }}>
                        Curated assessment libraries for {position?.name} {level?.name} candidates.
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    style={{ backgroundColor: '#1e40af', color: 'white', padding: '14px 28px', borderRadius: '12px', border: 'none', fontWeight: 800, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', boxShadow: '0 8px 16px -4px rgba(30, 64, 175, 0.2)' }}
                >
                    <Plus size={20} /> Create New Question Set
                </button>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '48px' }}>
                {[
                    { label: "Total Sets", value: `${sets.length} Sets`, icon: <BookOpen />, color: '#eff6ff', iconColor: '#5C9AFF' },
                    { label: "Sort By", value: "Recently Added", icon: <ArrowUpDown />, color: '#f8fafc', iconColor: '#64748b' }
                ].map((stat, i) => (
                    <div key={i} style={{ width: '280px', backgroundColor: 'white', padding: '16px 24px', borderRadius: '16px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '40px', height: '40px', backgroundColor: stat.color, color: stat.iconColor, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {React.cloneElement(stat.icon as any, { size: 18 })}
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>{stat.label}</p>
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#1e293b' }}>{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Sets Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
                {sets.map((set) => (
                    <Link key={set.id} href={`/employer/question-bank/set/${set.id}`} style={{ textDecoration: 'none' }}>
                        <div style={{ backgroundColor: 'white', border: '1px solid #f1f5f9', borderRadius: '24px', padding: '32px', position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <div style={{ width: '48px', height: '48px', backgroundColor: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {set.category === 'Logic' ? <Brain size={24} color="#5C9AFF" /> : <FileText size={24} color="#5C9AFF" />}
                                </div>
                                <span style={{ fontSize: '10px', fontWeight: 900, color: '#5C9AFF', backgroundColor: '#eff6ff', padding: '4px 12px', borderRadius: '6px', textTransform: 'uppercase' }}>{set.category || 'TECHNICAL'}</span>
                            </div>

                            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', marginBottom: '12px' }}>{set.name}</h3>
                            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, marginBottom: '32px', flex: 1 }}>
                                {set.description || `Assessment library specifically curated for ${position?.name} ${level?.name} candidates.`}
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800 }}>{set.companyId ? 'CO' : 'SY'}</div>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Scope</p>
                                        <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>{set.levelId ? level?.name : 'Tất cả cấp bậc'}</p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ margin: 0, fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Questions</p>
                                    <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>{set.questions?.length || 0} Items</p>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}

                {/* Add New Set Placeholder */}
                <div
                    onClick={() => setShowModal(true)}
                    style={{ backgroundColor: 'transparent', border: '2px dashed #e2e8f0', borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                >
                    <div style={{ width: '56px', height: '56px', backgroundColor: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Plus size={24} color="#cbd5e1" />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>Add New Set</h4>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>Create a custom question set for this specific role and level.</p>
                    </div>
                </div>
            </div>

            {/* Custom Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
                    <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '32px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                            <div style={{ width: '56px', height: '56px', backgroundColor: '#eff6ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5C9AFF' }}>
                                <BookOpen size={28} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Create Question Set</h3>
                                <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0' }}>Build a new assessment library for {position?.name}</p>
                            </div>
                        </div>

                        <form onSubmit={handleCreateSet} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                             <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Set Name</label>
                                <input
                                    required
                                    placeholder="e.g. Core Technical Assessment"
                                    value={newSet.name}
                                    onChange={e => setNewSet({ ...newSet, name: e.target.value })}
                                    style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '15px', fontWeight: 600, outline: 'none' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Description (Optional)</label>
                                <textarea
                                    rows={3}
                                    placeholder="Briefly describe the purpose of this set..."
                                    value={newSet.description}
                                    onChange={e => setNewSet({ ...newSet, description: e.target.value })}
                                    style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '15px', fontWeight: 600, outline: 'none', resize: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', backgroundColor: 'transparent', fontWeight: 800, fontSize: '14px', color: '#64748b', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: '16px', borderRadius: '14px', border: 'none', backgroundColor: '#1e40af', color: 'white', fontWeight: 800, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : null}
                                    {isSubmitting ? "Creating..." : "Create Set"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
