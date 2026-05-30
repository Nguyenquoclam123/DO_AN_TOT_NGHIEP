"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Plus,
    ArrowLeft,
    ChevronDown,
    X,
    Info,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Tag,
    Layers,
    BarChart3,
    Trash2,
    GripVertical,
    Save
} from "lucide-react";
import Link from "next/link";
import { questionBankService } from "@/services/question-bank.service";

export default function CreateMultipleQuestionsPage() {
    const params = useParams();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Common Metadata
    const [estimatedTime, setEstimatedTime] = useState(5);
    const [taxonomy, setTaxonomy] = useState("Technical Engineering");
    const [tags, setTags] = useState(["PYTHON", "BACKEND"]);

    // Multiple Questions State
    const [questions, setQuestions] = useState<any[]>([
        {
            id: Date.now().toString(),
            content: "",
            type: "SINGLE_CHOICE",
            difficulty: "Easy",
            options: [
                { id: '1', text: "", isCorrect: false },
                { id: '2', text: "", isCorrect: false }
            ]
        }
    ]);

    const handleAddQuestion = () => {
        setQuestions([...questions, {
            id: Date.now().toString(),
            content: "",
            type: "SINGLE_CHOICE",
            difficulty: "Easy",
            options: [
                { id: '1', text: "", isCorrect: false },
                { id: '2', text: "", isCorrect: false }
            ]
        }]);
    };

    const handleRemoveQuestion = (index: number) => {
        if (questions.length === 1) return;
        const newQs = [...questions];
        newQs.splice(index, 1);
        setQuestions(newQs);
    };

    const updateQuestion = (index: number, data: any) => {
        const newQs = [...questions];
        newQs[index] = { ...newQs[index], ...data };
        setQuestions(newQs);
    };

    const handleAddOption = (qIdx: number) => {
        const newQs = [...questions];
        newQs[qIdx].options.push({ id: Date.now().toString(), text: "", isCorrect: false });
        setQuestions(newQs);
    };

    const handleRemoveOption = (qIdx: number, optIdx: number) => {
        const newQs = [...questions];
        newQs[qIdx].options.splice(optIdx, 1);
        setQuestions(newQs);
    };

    const updateOption = (qIdx: number, optIdx: number, data: any) => {
        const newQs = [...questions];
        newQs[qIdx].options[optIdx] = { ...newQs[qIdx].options[optIdx], ...data };
        setQuestions(newQs);
    };

    const handleSave = async () => {
        try {
            setIsLoading(true);
            const formattedQuestions = questions.map(q => ({
                content: q.content,
                type: q.type === 'DESCRIPTIVE' ? 'ESSAY' : 'MULTIPLE_CHOICE',
                difficulty: q.difficulty.toUpperCase(),
                options: q.type === 'DESCRIPTIVE' ? [] : q.options.map((opt: any) => ({
                    optionText: opt.text,
                    isCorrect: opt.isCorrect
                }))
            }));

            await questionBankService.bulkAddQuestions(params.setId as string, formattedQuestions);
            router.push(`/employer/question-bank/set/${params.setId}`);
        } catch (error) {
            console.error("Failed to save questions", error);
            alert("Failed to save questions");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ backgroundColor: 'white', padding: '16px 64px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button onClick={() => router.back()} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Bulk Construct Questions</h1>
                        <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Adding to: {params.setId}</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => router.back()} style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>Discard</button>
                    <button 
                        onClick={handleSave} 
                        disabled={isLoading}
                        style={{ backgroundColor: '#1e40af', color: 'white', padding: '10px 24px', borderRadius: '10px', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(30, 64, 175, 0.2)', display: 'flex', alignItems: 'center', gap: '8px', opacity: isLoading ? 0.7 : 1 }}
                    >
                        {isLoading ? "Publishing..." : "Publish All Questions"}
                        {!isLoading && <Save size={16} />}
                    </button>
                </div>
            </div>

            <div style={{ padding: '40px 64px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
                {/* Main Column: Questions List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {questions.map((q, qIdx) => (
                        <div key={q.id} style={{ backgroundColor: 'white', borderRadius: '32px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                            {/* Question Header */}
                            <div style={{ backgroundColor: '#f8fafc', padding: '20px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ backgroundColor: '#1e40af', color: 'white', width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px' }}>
                                        {qIdx + 1}
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>Question Formulation</h3>
                                </div>
                                <button 
                                    onClick={() => handleRemoveQuestion(qIdx)}
                                    style={{ color: '#ef4444', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', opacity: questions.length > 1 ? 1 : 0.3 }}
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>

                            <div style={{ padding: '32px' }}>
                                {/* Content */}
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Content</label>
                                    <textarea
                                        placeholder="Enter question content..."
                                        value={q.content}
                                        onChange={e => updateQuestion(qIdx, { content: e.target.value })}
                                        style={{ width: '100%', minHeight: '100px', padding: '16px', borderRadius: '16px', border: '2px solid #f1f5f9', fontSize: '15px', outline: 'none', resize: 'vertical' }}
                                    />
                                </div>

                                {/* Type & Difficulty */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Type</label>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'DESCRIPTIVE'].map(t => (
                                                <button
                                                    key={t}
                                                    onClick={() => updateQuestion(qIdx, { type: t })}
                                                    style={{
                                                        flex: 1,
                                                        padding: '10px',
                                                        borderRadius: '10px',
                                                        border: '2px solid',
                                                        borderColor: q.type === t ? '#1e40af' : '#f1f5f9',
                                                        backgroundColor: q.type === t ? '#eff6ff' : 'white',
                                                        color: q.type === t ? '#1e40af' : '#64748b',
                                                        fontWeight: 700,
                                                        fontSize: '12px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {t.replace('_', ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Difficulty</label>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {['Easy', 'Medium', 'Hard'].map(d => (
                                                <button
                                                    key={d}
                                                    onClick={() => updateQuestion(qIdx, { difficulty: d })}
                                                    style={{
                                                        flex: 1,
                                                        padding: '10px',
                                                        borderRadius: '10px',
                                                        border: '2px solid',
                                                        borderColor: q.difficulty === d ? '#1e40af' : '#f1f5f9',
                                                        backgroundColor: q.difficulty === d ? '#eff6ff' : 'white',
                                                        color: q.difficulty === d ? '#1e40af' : '#64748b',
                                                        fontWeight: 700,
                                                        fontSize: '12px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {d}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Options */}
                                {q.type !== 'DESCRIPTIVE' && (
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                            <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Options</label>
                                            <button onClick={() => handleAddOption(qIdx)} style={{ border: 'none', background: 'none', color: '#1e40af', fontWeight: 800, fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Plus size={14} /> ADD OPTION
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {q.options.map((opt: any, optIdx: number) => (
                                                <div key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div 
                                                        onClick={() => updateOption(qIdx, optIdx, { isCorrect: !opt.isCorrect })}
                                                        style={{ 
                                                            width: '24px', 
                                                            height: '24px', 
                                                            borderRadius: '8px', 
                                                            border: `2px solid ${opt.isCorrect ? '#059669' : '#cbd5e1'}`,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                            backgroundColor: opt.isCorrect ? '#ecfdf5' : 'transparent',
                                                            flexShrink: 0
                                                        }}
                                                    >
                                                        {opt.isCorrect && <CheckCircle2 size={16} color="#059669" />}
                                                    </div>
                                                    <input
                                                        placeholder="Enter option text..."
                                                        value={opt.text}
                                                        onChange={e => updateOption(qIdx, optIdx, { text: e.target.value })}
                                                        style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #f1f5f9', backgroundColor: '#f8fafc', outline: 'none', fontSize: '14px' }}
                                                    />
                                                    <button onClick={() => handleRemoveOption(qIdx, optIdx)} style={{ color: '#ef4444', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.6 }}>
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    <button 
                        onClick={handleAddQuestion}
                        style={{ padding: '24px', borderRadius: '24px', border: '2px dashed #cbd5e1', backgroundColor: 'transparent', color: '#64748b', fontWeight: 700, fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', transition: 'all 0.2s' }}
                        onMouseOver={(e: any) => { e.currentTarget.style.borderColor = '#1e40af'; e.currentTarget.style.color = '#1e40af'; }}
                        onMouseOut={(e: any) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#64748b'; }}
                    >
                        <Plus size={24} /> Add Another Question
                    </button>
                </div>

                {/* Sidebar: Global Config */}
                <div style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '32px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Layers size={18} color="#1e40af" /> Set Configuration
                        </h4>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Completion Time (Min)</label>
                                <input 
                                    type="number" 
                                    value={estimatedTime} 
                                    onChange={e => setEstimatedTime(parseInt(e.target.value))}
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9', backgroundColor: '#f8fafc', fontWeight: 700, outline: 'none' }}
                                />
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Subject Taxonomy</label>
                                <select 
                                    value={taxonomy}
                                    onChange={e => setTaxonomy(e.target.value)}
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9', backgroundColor: '#f8fafc', fontWeight: 700, outline: 'none' }}
                                >
                                    <option>Technical Engineering</option>
                                    <option>Soft Skills</option>
                                    <option>Project Management</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Tags</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {tags.map(tag => (
                                        <div key={tag} style={{ backgroundColor: '#eff6ff', color: '#1e40af', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {tag} <X size={12} cursor="pointer" onClick={() => setTags(tags.filter(t => t !== tag))} />
                                        </div>
                                    ))}
                                    <button style={{ border: '1px dashed #cbd5e1', background: 'none', color: '#1e40af', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 800, cursor: 'pointer' }}>+ Tag</button>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '32px', padding: '20px', backgroundColor: '#f0f7ff', borderRadius: '20px', borderLeft: '4px solid #1e40af' }}>
                            <h5 style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#1e40af', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Info size={16} /> Summary
                            </h5>
                            <p style={{ margin: 0, fontSize: '12px', color: '#1e40af', opacity: 0.8, lineHeight: 1.5 }}>
                                You are about to publish <b>{questions.length}</b> questions. Ensure each trắc nghiệm has at least one correct answer.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
