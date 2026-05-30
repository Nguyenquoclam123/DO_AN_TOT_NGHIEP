"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ChevronLeft,
    Users,
    Edit2,
    Archive,
    Eye,
    MapPin,
    Clock,
    DollarSign,
    Calendar,
    Target,
    Layers,
    Award,
    Sparkles,
    CheckCircle2,
    ChevronRight,
    Plus,
    UserPlus,
    FileText,
    BrainCircuit,
    ArrowRight
} from "lucide-react";
import { jobService } from "@/services/job.service";

export default function JobInfoPage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const [job, setJob] = useState<any>(null);
    const [activeTab, setActiveTab] = useState("Responsibilities");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchJobDetail();
        }
    }, [id]);

    const fetchJobDetail = async () => {
        try {
            setIsLoading(true);
            const data = await jobService.getById(id);
            setJob(data);
        } catch (error) {
            console.error("Failed to fetch job detail:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
                <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#5C9AFF', borderRadius: '50%' }}></div>
            </div>
        );
    }

    if (!job) return <div>Job not found</div>;

    const tabs = ["Responsibilities", "Experience", "Benefits & Culture"];

    return (
        <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', padding: '32px 64px', fontFamily: 'Inter, sans-serif' }}>

            {/* Breadcrumbs & Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#64748B' }}>
                    <button onClick={() => router.back()} style={{ backgroundColor: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ChevronLeft size={16} /> Back
                    </button>
                    <span>›</span>
                    <Link href="/employer/jobs" style={{ textDecoration: 'none', color: 'inherit' }}>Job Postings</Link>
                    <span>›</span>
                    <span style={{ color: '#0F172A', fontWeight: 600 }}>{job.title}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: '#F0FDF4', color: '#166534', borderRadius: '100px', fontSize: '11px', fontWeight: 800 }}>
                        <div style={{ width: '6px', height: '6px', backgroundColor: '#22C55E', borderRadius: '50%' }}></div>
                        ACTIVE & OPEN
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#94A3B8', fontWeight: 600 }}>
                        <Eye size={16} /> 1,240 Views
                    </span>
                </div>
            </div>

            {/* Title & Top Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '42px', fontWeight: 800, color: '#0F172A', margin: '0 0 12px' }}>{job.title}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#64748B', fontSize: '15px', fontWeight: 500 }}>
                        <span>{job.department || 'Engineering Department'}</span>
                        <div style={{ width: '4px', height: '4px', backgroundColor: '#CBD5E1', borderRadius: '50%' }}></div>
                        <span>Ref ID: #JOB-2024-FE01</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#F1F5F9', border: 'none', borderRadius: '12px', color: '#475569', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                        <Edit2 size={18} /> Edit Job
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#F1F5F9', border: 'none', borderRadius: '12px', color: '#475569', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                        <Archive size={18} /> Archive
                    </button>
                    <Link href={`/employer/jobs/${job.id}`}>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 28px', backgroundColor: '#5C9AFF', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}>
                            <Users size={20} /> View Applicants
                        </button>
                    </Link>
                </div>
            </div>

            {/* Quick Metadata Info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '48px' }}>
                {[
                    { label: 'CAMPAIGN', value: job.campaign?.name || 'General Campaign', icon: <Target size={18} />, color: '#EFF6FF', textColor: '#5C9AFF' },
                    { label: 'CATEGORY', value: job.categoryId || 'General / Tech', icon: <Layers size={18} />, color: '#F8F9FA', textColor: '#1E293B' },
                    { label: 'LEVEL', value: job.levelId || 'Senior', icon: <Award size={18} />, color: '#F8F9FA', textColor: '#1E293B' },
                    { label: 'QUANTITY', value: `${job.quantity || 1} Openings`, icon: <Users size={18} />, color: '#F8F9FA', textColor: '#1E293B' }
                ].map((item, idx) => (
                    <div key={idx} style={{ padding: '24px', backgroundColor: 'white', borderRadius: '24px', border: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.05em' }}>{item.label}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 800, color: item.textColor }}>
                            {item.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '48px' }}>

                {/* Left Column: Job Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                    {/* Tabs Navigation */}
                    <div style={{ backgroundColor: 'white', borderRadius: '24px', border: '1px solid #F1F5F9', padding: '32px' }}>
                        <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid #F1F5F9', marginBottom: '32px' }}>
                            {tabs.map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    style={{
                                        padding: '0 0 16px',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        borderBottom: activeTab === tab ? '3px solid #5C9AFF' : '3px solid transparent',
                                        color: activeTab === tab ? '#5C9AFF' : '#94A3B8',
                                        fontSize: '15px',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}>
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div style={{ color: '#475569', lineHeight: 1.8, fontSize: '15px' }}>
                            {activeTab === 'Responsibilities' && (
                                <div style={{ whiteSpace: 'pre-wrap' }}>
                                    {job.description || "No description provided."}
                                </div>
                            )}

                        </div>

                        {/* Skills Stack */}
                        <div style={{ marginTop: '48px' }}>
                            <div style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.05em' }}>PRIORITY SKILLS STACK</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {job.skills && job.skills.length > 0 ? job.skills.map((s: any) => (
                                    <span key={s.id} style={{ padding: '8px 16px', backgroundColor: '#EFF6FF', color: '#5C9AFF', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}>
                                        {s.skillName}
                                    </span>
                                )) : (
                                    <span style={{ color: '#94A3B8', fontSize: '13px' }}>No specific skills listed.</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Question Sets */}
                    <div style={{ backgroundColor: 'white', borderRadius: '24px', border: '1px solid #F1F5F9', padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Screening Question Sets</h3>
                            <Link href="/employer/question-bank" style={{ textDecoration: 'none', color: '#5C9AFF', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Plus size={16} /> Manage Bank
                            </Link>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {job.questionSets && job.questionSets.length > 0 ? job.questionSets.map((set: any, i: number) => (
                                <div key={set.id} style={{ padding: '20px 24px', backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ width: '40px', height: '40px', backgroundColor: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5C9AFF', border: '1px solid #E2E8F0' }}>
                                            <BrainCircuit size={18} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>{set.name}</div>
                                            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>{set.category || 'General Assessment'} • Est. 20 mins</div>
                                        </div>
                                    </div>
                                    <ChevronRight size={20} color="#CBD5E1" />
                                </div>
                            )) : (
                                <div style={{ padding: '32px', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px dashed #E2E8F0', color: '#64748B', fontSize: '14px' }}>
                                    No screening sets linked to this position.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                    {/* Logistics & Budget */}
                    <div style={{ backgroundColor: 'white', borderRadius: '24px', border: '1px solid #F1F5F9', padding: '32px' }}>
                        <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '24px' }}>Logistics & Budget</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {[
                                { label: 'BUDGET RANGE', value: `$${job.minSalary?.toLocaleString()} — $${job.maxSalary?.toLocaleString()}`, sub: '/ yr', icon: <DollarSign size={20} /> },
                                { label: 'WORK LOCATION', value: `${job.workLocation || 'Not specified'}`, sub: job.type || 'Full-time', icon: <MapPin size={20} /> },
                                { label: 'WORKING HOURS', value: job.workingTime || `Full-Time (40 hrs/wk)`, sub: 'Standard hours', icon: <Clock size={20} /> },
                                { label: 'EXPIRES ON', value: job.expiredAt ? new Date(job.expiredAt).toLocaleDateString() : 'No date set', sub: 'Deadline', icon: <Calendar size={20} /> }
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', gap: '16px' }}>
                                    <div style={{ width: '40px', height: '40px', backgroundColor: '#F1F5F9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                                        {item.icon}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>{item.label}</div>
                                        <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>{item.value} <span style={{ fontWeight: 500, color: '#64748B' }}>{item.sub}</span></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Matching Engine */}
                    <div style={{ backgroundColor: '#0F172A', borderRadius: '24px', padding: '32px', color: 'white' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ width: '32px', height: '32px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <BrainCircuit size={18} color="#5C9AFF" />
                            </div>
                            <h4 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>AI Matching Engine</h4>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.5)', marginBottom: '10px', textTransform: 'uppercase' }}>
                                <span>VECTOR CONSISTENCY (JD)</span>
                            </div>
                            <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginBottom: '10px' }}>
                                <div style={{ width: '94%', height: '100%', backgroundColor: '#5C9AFF', borderRadius: '3px' }}></div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 800 }}>
                                <span style={{ color: '#5C9AFF' }}>94% STRUCTURAL SCORE</span>
                                <span style={{ color: '#22C55E' }}>OPTIMIZED</span>
                            </div>
                        </div>

                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', lineHeight: 1.6, marginBottom: '24px' }}>
                            "JD vector is currently prioritized for technical depth and leadership soft-skills pool."
                        </p>

                        <button style={{ width: '100%', padding: '12px', backgroundColor: 'white', border: 'none', borderRadius: '10px', color: '#0F172A', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
                            Re-sync AI Parameters
                        </button>
                    </div>

                    {/* Collaborators */}
                    <div style={{ backgroundColor: 'white', borderRadius: '24px', border: '1px solid #F1F5F9', padding: '32px' }}>
                        <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', marginBottom: '24px' }}>Collaborators</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
                            {[
                                { name: 'Sarah Chen', role: 'Hiring Manager' },
                                { name: 'Marcus Thorne', role: 'Lead Recruiter' }
                            ].map((person, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px', color: '#5C9AFF' }}>
                                        {person.name[0]}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>{person.name}</div>
                                        <div style={{ fontSize: '12px', color: '#64748B' }}>{person.role}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button style={{ width: '100%', padding: '12px', backgroundColor: 'white', border: '1px dashed #E2E8F0', borderRadius: '10px', color: '#64748B', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                            <UserPlus size={16} /> INVITE TEAM
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
