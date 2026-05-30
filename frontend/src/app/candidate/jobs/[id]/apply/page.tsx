"use client";

import React, { useEffect, useState } from "react";
import { jobService } from "@/services/job.service";
import { cvService } from "@/services/cv.service";
import { applicationService } from "@/services/application.service";
import {
    ChevronRight,
    Building2,
    Send,
    Upload,
    FileText,
    ArrowRight,
    Lightbulb,
    CheckCircle2,
    Plus,
    Loader2,
    Info,
    DollarSign
} from "lucide-react";
import Link from "next/link";

export default function CandidateApplyPage({ params }: { params: { id: string } }) {
    const jobId = params.id;
    const [job, setJob] = useState<any>(null);
    const [cvs, setCvs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCvId, setSelectedCvId] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [answers, setAnswers] = useState<Record<string, { selectedOptionId?: string; selectedOptionIds?: string[]; textAnswer?: string }>>({});

    useEffect(() => {
        fetchData();
    }, [jobId]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [jobData, cvData] = await Promise.all([
                jobService.getById(jobId),
                cvService.getMyCVs()
            ]);
            setJob(jobData);
            setCvs(cvData || []);
            if (cvData && cvData.length > 0) {
                const primary = cvData.find((cv: any) => cv.is_primary) || cvData[0];
                setSelectedCvId(primary.id || null);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnswerChange = (questionId: string, value: any, type: string) => {
        setAnswers(prev => {
            const current = prev[questionId] || {};
            
            if (type === 'CHECKBOX') {
                const ids = current.selectedOptionIds || [];
                const newIds = ids.includes(value) 
                    ? ids.filter(id => id !== value)
                    : [...ids, value];
                return { ...prev, [questionId]: { selectedOptionIds: newIds } };
            }
            
            if (type === 'MULTIPLE_CHOICE') {
                return { ...prev, [questionId]: { selectedOptionId: value } };
            }
            
            // For Essay, Short Answer, Date, DateTime
            return { ...prev, [questionId]: { textAnswer: value } };
        });
    };

    const handleSubmit = async () => {
        if (!selectedCvId) return;

        try {
            setIsLoading(true);
            const formattedAnswers = Object.entries(answers).map(([qId, val]) => ({
                questionId: qId,
                ...val
            }));

            await applicationService.apply({
                jobId,
                cvId: selectedCvId,
                candidateId: "pending",
                answers: formattedAnswers
            });
            setIsSubmitted(true);
        } catch (error) {
            console.error("Failed to submit application:", error);
            alert("Failed to submit application. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && !isSubmitted) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }}>
                <Loader2 size={48} className="animate-spin" color="#5C9AFF" />
                <p style={{ marginTop: '16px', color: '#64748b', fontWeight: 600 }}>Preparing your application...</p>
            </div>
        );
    }

    if (!job && !isSubmitted) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }}>
                <Info size={48} color="#94a3b8" />
                <h2 style={{ marginTop: '16px', fontWeight: 800 }}>Job Not Found</h2>
                <Link href="/candidate/jobs" style={{ marginTop: '12px', color: '#5C9AFF', fontWeight: 600 }}>Back to Discovery</Link>
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', padding: '40px', textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', backgroundColor: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <CheckCircle2 size={48} color="#16a34a" />
                </div>
                <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Application Sent!</h1>
                <p style={{ fontSize: '16px', color: '#64748b', marginTop: '12px', maxWidth: '400px' }}>
                    Your application for <strong>{job?.title}</strong> has been successfully delivered to <strong>{job?.company?.name || "the employer"}</strong>.
                </p>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '40px' }}>
                    <Link href="/candidate/jobs" style={{ textDecoration: 'none' }}>
                        <button style={{ padding: '12px 24px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '12px', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Back to Jobs</button>
                    </Link>
                    <Link href="/candidate/applications" style={{ textDecoration: 'none' }}>
                        <button style={{ padding: '12px 24px', backgroundColor: '#5C9AFF', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 700, cursor: 'pointer' }}>View My Applications</button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '40px', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            {/* Breadcrumbs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '32px' }}>
                JOBS <ChevronRight size={12} /> {job.company?.name || "ENGINEERING"} <ChevronRight size={12} /> <span style={{ color: '#5C9AFF' }}>{job.title}</span>
            </div>

            {/* Job Banner */}
            <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    <div style={{ width: '56px', height: '56px', backgroundColor: '#eff6ff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Building2 size={28} color="#5C9AFF" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{job.title}</h1>
                        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '6px' }}>{job.company?.name || "Global Enterprise"} • {job.workLocation} • <span style={{ color: '#5C9AFF', fontWeight: 700 }}>{(job.minSalary && job.maxSalary) ? `$${job.minSalary / 1000}k - $${job.maxSalary / 1000}k` : "Competitive"}</span></p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', backgroundColor: '#f1f5f9', padding: '6px 16px', borderRadius: '8px' }}>{job.type || "Full-time"}</span>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#5C9AFF', backgroundColor: '#eff6ff', padding: '6px 16px', borderRadius: '8px' }}>Active</span>
                </div>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>

                {/* Step 1+: Question Sets */}
                {job.questionSets?.map((set: any, setIdx: number) => (
                    <div key={set.id} style={{ backgroundColor: 'white', padding: '40px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
                            <div style={{ width: '36px', height: '36px', backgroundColor: '#5C9AFF', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 800 }}>{setIdx + 1}</div>
                            <div>
                                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{set.name}</h3>
                                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{set.description || "Please answer the following screening questions"}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            {set.questions?.map((q: any, qIdx: number) => (
                                <div key={q.id}>
                                    <p style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', marginBottom: '16px', display: 'flex', gap: '8px' }}>
                                        <span style={{ color: '#5C9AFF' }}>{setIdx + 1}.{qIdx + 1}</span> {q.content}
                                    </p>

                                    {q.type === 'MULTIPLE_CHOICE' && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                                            {q.options?.map((opt: any) => (
                                                <div
                                                    key={opt.id}
                                                    onClick={() => handleAnswerChange(q.id, opt.id, 'MULTIPLE_CHOICE')}
                                                    style={{
                                                        padding: '16px',
                                                        border: answers[q.id]?.selectedOptionId === opt.id ? '2px solid #5C9AFF' : '1px solid #e2e8f0',
                                                        backgroundColor: answers[q.id]?.selectedOptionId === opt.id ? '#eff6ff' : 'white',
                                                        borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: answers[q.id]?.selectedOptionId === opt.id ? '6px solid #5C9AFF' : '2px solid #cbd5e1', backgroundColor: 'white' }}></div>
                                                    <span style={{ fontSize: '14px', fontWeight: 600, color: answers[q.id]?.selectedOptionId === opt.id ? '#5C9AFF' : '#475569' }}>{opt.optionText}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {q.type === 'CHECKBOX' && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                                            {q.options?.map((opt: any) => {
                                                const isChecked = answers[q.id]?.selectedOptionIds?.includes(opt.id);
                                                return (
                                                    <div
                                                        key={opt.id}
                                                        onClick={() => handleAnswerChange(q.id, opt.id, 'CHECKBOX')}
                                                        style={{
                                                            padding: '16px',
                                                            border: isChecked ? '2px solid #5C9AFF' : '1px solid #e2e8f0',
                                                            backgroundColor: isChecked ? '#eff6ff' : 'white',
                                                            borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <div style={{ 
                                                            width: '18px', 
                                                            height: '18px', 
                                                            borderRadius: '4px', 
                                                            border: isChecked ? 'none' : '2px solid #cbd5e1', 
                                                            backgroundColor: isChecked ? '#5C9AFF' : 'white',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}>
                                                            {isChecked && <div style={{ width: '8px', height: '8px', backgroundColor: 'white', borderRadius: '1px' }}></div>}
                                                        </div>
                                                        <span style={{ fontSize: '14px', fontWeight: 600, color: isChecked ? '#5C9AFF' : '#475569' }}>{opt.optionText}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {(q.type === 'DATE' || q.type === 'DATETIME') && (
                                        <input
                                            type={q.type === 'DATE' ? "date" : "datetime-local"}
                                            value={answers[q.id]?.textAnswer || ""}
                                            onChange={(e) => handleAnswerChange(q.id, e.target.value, q.type)}
                                            style={{ 
                                                width: '100%', 
                                                padding: '16px', 
                                                backgroundColor: '#f8fafc', 
                                                border: '1px solid #e2e8f0', 
                                                borderRadius: '12px', 
                                                fontSize: '15px', 
                                                color: '#1e293b',
                                                outline: 'none' 
                                            }}
                                        />
                                    )}

                                    {(q.type === 'ESSAY' || q.type === 'SHORT_ANSWER') && (
                                        <textarea
                                            value={answers[q.id]?.textAnswer || ""}
                                            onChange={(e) => handleAnswerChange(q.id, e.target.value, q.type)}
                                            placeholder={q.type === 'SHORT_ANSWER' ? "Your answer..." : "Type your detailed response here..."}
                                            style={{ width: '100%', padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '15px', height: q.type === 'SHORT_ANSWER' ? '60px' : '140px', outline: 'none', resize: 'none' }}
                                        ></textarea>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Final Step: Select your Resume */}
                <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
                        <div style={{ width: '36px', height: '36px', backgroundColor: '#5C9AFF', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 800 }}>{(job.questionSets?.length || 0) + 1}</div>
                        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Select your Resume</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Option to create new CV - More like a distinct action */}
                        <Link href="/candidate/cv/builder" style={{ textDecoration: 'none' }}>
                            <div style={{
                                padding: '20px 24px',
                                border: '2px dashed #5C9AFF30',
                                backgroundColor: '#f8fafc',
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#eff6ff';
                                e.currentTarget.style.borderColor = '#5C9AFF60';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#f8fafc';
                                e.currentTarget.style.borderColor = '#5C9AFF30';
                            }}>
                                <div style={{ width: '42px', height: '42px', backgroundColor: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', flexShrink: 0 }}>
                                    <Plus size={20} color="#5C9AFF" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Build New Interactive CV</h4>
                                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Create an AI-optimized resume specifically for this role</p>
                                </div>
                                <ArrowRight size={18} color="#94a3b8" />
                            </div>
                        </Link>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
                            {/* Existing CVs list */}
                            {cvs.map((cv: any) => (
                                <div
                                    key={cv.id}
                                    onClick={() => setSelectedCvId(cv.id)}
                                    style={{
                                        padding: '20px',
                                        border: selectedCvId === cv.id ? '2px solid #5C9AFF' : '1px solid #f1f5f9',
                                        backgroundColor: selectedCvId === cv.id ? '#eff6ff' : 'white',
                                        borderRadius: '20px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: selectedCvId === cv.id ? '0 10px 25px -5px rgba(92, 154, 255, 0.2)' : '0 2px 4px -1px rgba(0,0,0,0.02)',
                                        transform: selectedCvId === cv.id ? 'translateY(-2px)' : 'none'
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <div style={{ 
                                            width: '48px', 
                                            height: '48px', 
                                            backgroundColor: selectedCvId === cv.id ? 'white' : '#f8fafc', 
                                            borderRadius: '14px', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            transition: 'background-color 0.2s'
                                        }}>
                                            <FileText size={24} color={selectedCvId === cv.id ? "#5C9AFF" : "#cbd5e1"} />
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{cv.cvTitle || "Untitled CV"}</h4>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                                {cv.is_primary && (
                                                    <span style={{ fontSize: '9px', fontWeight: 900, backgroundColor: '#5C9AFF', color: 'white', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>Primary</span>
                                                )}
                                                <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0, fontWeight: 700 }}>UPDATED {cv.updatedAt ? new Date(cv.updatedAt).toLocaleDateString() : 'RECENTLY'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ 
                                        width: '24px', 
                                        height: '24px', 
                                        borderRadius: '50%', 
                                        border: selectedCvId === cv.id ? '7px solid #5C9AFF' : '2px solid #cbd5e1', 
                                        backgroundColor: 'white',
                                        transition: 'all 0.2s'
                                    }}></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ marginTop: '24px' }}>
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedCvId || cvs.length === 0}
                        style={{ 
                            width: '100%',
                            padding: '18px', 
                            backgroundColor: '#5C9AFF', 
                            color: 'white', 
                            borderRadius: '16px', 
                            border: 'none', 
                            fontSize: '16px', 
                            fontWeight: 800, 
                            cursor: (selectedCvId && cvs.length > 0) ? 'pointer' : 'not-allowed', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '12px', 
                            boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)',
                            opacity: (selectedCvId && cvs.length > 0) ? 1 : 0.6,
                            transition: 'all 0.2s'
                        }}
                    >
                        Submit Application <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
