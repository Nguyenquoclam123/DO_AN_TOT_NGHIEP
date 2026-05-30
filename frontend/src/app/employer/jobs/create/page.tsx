"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Briefcase,
    Plus,
    X,
    MapPin,
    Clock,
    Calendar,
    DollarSign,
    Target,
    Loader2,
    ChevronDown,
    ArrowRight,
    GraduationCap,
    Award,
    Sparkles,
    Search,
    BrainCircuit,
    CheckCircle2
} from "lucide-react";
import { jobService } from "@/services/job.service";
import { campaignService, Campaign } from "@/services/campaign.service";
import { questionBankService } from "@/services/question-bank.service";
import { masterDataService } from "@/services/master-data.service";
import { useAuthStore } from "@/store/authStore";
import { apiRequest } from "@/lib/api";
import { ConfirmModal } from "@/components/shared/ConfirmModal";

export default function CreateJobPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const user = useAuthStore(state => state.user);
    const [isLoading, setIsLoading] = useState(false);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [history, setHistory] = useState<any>({ titles: [], descriptions: [], responsibilities: [], benefits: [], requirements: [], skills: [], locations: [] });
    const [showHistory, setShowHistory] = useState<string | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED');

    useEffect(() => {
        const campaignIdFromUrl = searchParams.get('campaignId');
        if (campaignIdFromUrl) {
            setSelectedCampaignIds([campaignIdFromUrl]);
        }
    }, [searchParams]);
    const [allQuestionSets, setAllQuestionSets] = useState<any[]>([]);
    const [selectedQuestionSetIds, setSelectedQuestionSetIds] = useState<string[]>([]);
    const [offices, setOffices] = useState<{ label: string; address: string }[]>([]);
    const [isCustomLocation, setIsCustomLocation] = useState(false);

    // Master Data
    const [positions, setPositions] = useState<any[]>([]);
    const [levels, setLevels] = useState<any[]>([]);

    // Form States
    const [title, setTitle] = useState("");
    const [selectedPositionId, setSelectedPositionId] = useState("");
    const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([]);
    const [category, setCategory] = useState("BE");
    const [description, setDescription] = useState("");
    const [responsibilities, setResponsibilities] = useState("");
    const [benefits, setBenefits] = useState("");
    const [requirements, setRequirements] = useState("");

    const [skills, setSkills] = useState<{ name: string; isRequired: boolean }[]>([
        { name: "Node.js", isRequired: true },
        { name: "AWS Architecture", isRequired: false },
        { name: "Agile Methodology", isRequired: true }
    ]);
    const [newSkill, setNewSkill] = useState("");

    const [minExperience, setMinExperience] = useState(5);
    const [experienceNote, setExperienceNote] = useState("");
    const [minEducation, setMinEducation] = useState("Bachelor's");
    const [certificates, setCertificates] = useState(["IELTS 7.0+", "AWS Professional"]);
    const [newCert, setNewCert] = useState("");

    const [levelId, setLevelId] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [jobType, setJobType] = useState("Full-time");
    const [workLocation, setWorkLocation] = useState("San Francisco, CA");
    const [workingTime, setWorkingTime] = useState("Mon - Fri, 8am - 6pm");
    const [expirationDate, setExpirationDate] = useState("");
    const [minSalary, setMinSalary] = useState(120000);
    const [maxSalary, setMaxSalary] = useState(180000);

    useEffect(() => {
        if (user) {
            fetchCampaigns();
            fetchQuestionSets();
            fetchMasterData();
            fetchHistory();
            fetchOffices();
        }
    }, [user]);

    const fetchOffices = async () => {
        try {
            const data = await apiRequest<any>("/companies/user/my", "GET");
            if (data && data.offices) {
                setOffices(data.offices);
                // If there are offices, default to the first one
                if (data.offices.length > 0) {
                    setWorkLocation(data.offices[0].address);
                }
            }
        } catch (error) {
            console.error("Failed to fetch offices");
        }
    };

    const fetchHistory = async () => {
        try {
            const data = await jobService.getHistory();
            setHistory(data);
        } catch (error) {
            console.error("Failed to fetch job history");
        }
    };

    const fetchMasterData = async () => {
        try {
            const [posData, lvlData] = await Promise.all([
                masterDataService.getPositions(user?.companyId),
                masterDataService.getLevels(user?.companyId)
            ]);

            // FILTER: Only show active ones for job creation
            setPositions(posData?.filter((p: any) => p.isActive !== false) || []);
            setLevels(lvlData?.filter((l: any) => l.isActive !== false) || []);
        } catch (error) {
            console.error("Failed to fetch master data");
        }
    };

    const fetchCampaigns = async () => {
        try {
            const data = await campaignService.getAll();
            setCampaigns(data || []);
        } catch (error) {
            console.error("Failed to fetch campaigns");
        }
    };

    const fetchQuestionSets = async () => {
        try {
            const data = await questionBankService.getSets();
            setAllQuestionSets(data || []);
        } catch (error) {
            console.error("Failed to fetch question sets");
        }
    };

    const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedPositionId(id);
        const pos = positions.find(p => p.id === id);
        if (pos) {
            setTitle(pos.name);
            if (!description) setDescription(pos.description || "");
        }
    };

    const toggleCampaign = (id: string) => {
        const campaign = campaigns.find(c => c.id === id);
        if (campaign && campaign.status !== 'ACTIVE') {
            alert("Cannot create job in this campaign. Please select an active campaign or create a new one.");
            return;
        }
        setSelectedCampaignIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleQuestionSet = (id: string) => {
        setSelectedQuestionSetIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleAddSkill = () => {
        if (!newSkill) return;
        setSkills([...skills, { name: newSkill, isRequired: false }]);
        setNewSkill("");
    };

    const toggleSkillRequired = (index: number) => {
        const newSkills = [...skills];
        newSkills[index].isRequired = !newSkills[index].isRequired;
        setSkills(newSkills);
    };

    const removeSkill = (index: number) => {
        setSkills(skills.filter((_, i) => i !== index));
    };

    const handleAddCert = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newCert) {
            setCertificates([...certificates, newCert]);
            setNewCert("");
        }
    };

    const removeCert = (cert: string) => {
        setCertificates(certificates.filter(c => c !== cert));
    };

    const handleSubmit = async (status: 'PUBLISHED' | 'DRAFT') => {
        if (!title) {
            alert("Please enter a job title.");
            return;
        }
        setPendingStatus(status);
        setIsConfirmModalOpen(true);
    };

    const confirmSubmit = async () => {
        setIsLoading(true);
        setIsConfirmModalOpen(false);
        try {
            const payload = {
                title,
                positionId: selectedPositionId || undefined,
                levelId: levelId || undefined,
                description,
                campaign_ids: selectedCampaignIds,
                category_id: category,
                quantity,
                salary_min: minSalary,
                salary_max: maxSalary,
                work_location: workLocation,
                type: jobType,
                work_time: workingTime,
                expired_at: expirationDate || undefined,
                skills: skills.map(s => s.name),
                question_set_ids: selectedQuestionSetIds,
                responsibilities,
                benefits,
                minExperience,
                experienceNote,
                minEducation,
                certificates,
                status: pendingStatus
            };

            await jobService.create(payload as any);
            router.push("/employer/jobs");
        } catch (error) {
            console.error(error);
            alert("Error saving job. Please check your data.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', padding: '40px 64px', fontFamily: 'Inter, sans-serif' }}>

            {/* Top Navigation & Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                <div>
                    <div style={{ display: 'flex', gap: '8px', color: '#94a3b8', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '12px' }}>
                        <span>PIPELINE</span>
                        <span>&rsaquo;</span>
                        <span style={{ color: '#1e293b' }}>NEW JOB CREATION</span>
                    </div>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Configure Executive Role</h1>
                    <p style={{ color: '#64748b', fontSize: '15px', marginTop: '8px' }}>Define high-impact positions with precision. All fields are optimized for AI candidate matching.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#F0FDF4', padding: '8px 16px', borderRadius: '100px', border: '1px solid #DCFCE7' }}>
                    <div style={{ width: '6px', height: '6px', backgroundColor: '#22C55E', borderRadius: '50%' }}></div>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>READY FOR AI MATCHING</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '40px' }}>

                {/* Left Column: Main Configuration */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                    {/* Section 1: Core Details */}
                    <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                            <div style={{ width: '40px', height: '40px', backgroundColor: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5C9AFF' }}>
                                <Briefcase size={20} />
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Position Core Details</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>ARCHITECTURE POSITION</label>
                                    <div style={{ position: 'relative' }}>
                                        <select
                                            value={selectedPositionId}
                                            onChange={handlePositionChange}
                                            style={{ width: '100%', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '15px', fontWeight: 600, appearance: 'none', outline: 'none' }}>
                                            <option value="">Select position architecture...</option>
                                            {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                        <ChevronDown size={18} color="#94a3b8" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                    </div>
                                    <p style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>Select from your defined active job architecture.</p>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>SPECIFIC JOB TITLE</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            value={title}
                                            onChange={e => setTitle(e.target.value)}
                                            onFocus={() => setShowHistory('title')}
                                            placeholder="e.g. Senior Principal Engineer"
                                            style={{ width: '100%', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: 'white', fontSize: '15px', fontWeight: 600, outline: 'none' }}
                                        />
                                        {showHistory === 'title' && history.titles.length > 0 && (
                                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', marginTop: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                                                <div style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', fontSize: '10px', fontWeight: 800, color: '#94a3b8' }}>REUSE PREVIOUS TITLE</div>
                                                {history.titles.map((t: string, i: number) => (
                                                    <div key={i} onClick={() => { setTitle(t); setShowHistory(null); }} style={{ padding: '12px 16px', cursor: 'pointer', fontSize: '13px', borderBottom: '1px solid #f8fafc' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>{t}</div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '15px' }}>RECRUITMENT CAMPAIGNS (CAMPAIGNS)</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                        {campaigns.map(c => {
                                            const isSelected = selectedCampaignIds.includes(c.id);
                                            return (
                                                <div
                                                    key={c.id}
                                                    onClick={() => toggleCampaign(c.id)}
                                                    style={{
                                                        padding: '10px 18px',
                                                        borderRadius: '10px',
                                                        fontSize: '12px',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        border: isSelected ? '2px solid #5C9AFF' : '1px solid #e2e8f0',
                                                        backgroundColor: isSelected ? '#eff6ff' : 'white',
                                                        color: isSelected ? '#5C9AFF' : '#64748b',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px'
                                                    }}
                                                >
                                                    {c.name}
                                                    {isSelected && <CheckCircle2 size={14} />}
                                                </div>
                                            );
                                        })}
                                        {campaigns.length === 0 && (
                                            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>No campaigns created yet.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>JOB DESCRIPTION</span>
                                    {history.descriptions.length > 0 && (
                                        <button type="button" onClick={() => setShowHistory(showHistory === 'desc' ? null : 'desc')} style={{ border: 'none', background: 'none', color: '#5C9AFF', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={12} /> Reuse previous
                                        </button>
                                    )}
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <textarea
                                        rows={4}
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder="What is the job description and impact of this role?..."
                                        style={{ width: '100%', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: 'white', fontSize: '14px', lineHeight: 1.6, outline: 'none', resize: 'none' }}
                                    />
                                    {showHistory === 'desc' && (
                                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', marginTop: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                                            {history.descriptions.map((d: string, i: number) => (
                                                <div key={i} onClick={() => { setDescription(d); setShowHistory(null); }} style={{ padding: '12px 16px', cursor: 'pointer', fontSize: '13px', borderBottom: '1px solid #f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>{d}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>RESPONSIBILITIES</span>
                                    {history.responsibilities.length > 0 && (
                                        <button type="button" onClick={() => setShowHistory(showHistory === 'resp' ? null : 'resp')} style={{ border: 'none', background: 'none', color: '#5C9AFF', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={12} /> Reuse previous
                                        </button>
                                    )}
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <textarea
                                        rows={4}
                                        value={responsibilities}
                                        onChange={e => setResponsibilities(e.target.value)}
                                        placeholder="Specific daily requirements and responsibilities..."
                                        style={{ width: '100%', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: 'white', fontSize: '14px', lineHeight: 1.6, outline: 'none', resize: 'none' }}
                                    />
                                    {showHistory === 'resp' && (
                                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', marginTop: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                                            {history.responsibilities.map((r: string, i: number) => (
                                                <div key={i} onClick={() => { setResponsibilities(r); setShowHistory(null); }} style={{ padding: '12px 16px', cursor: 'pointer', fontSize: '13px', borderBottom: '1px solid #f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>{r}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>BENEFITS & PERKS</span>
                                    {history.benefits.length > 0 && (
                                        <button type="button" onClick={() => setShowHistory(showHistory === 'benefits' ? null : 'benefits')} style={{ border: 'none', background: 'none', color: '#5C9AFF', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={12} /> Reuse previous
                                        </button>
                                    )}
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <textarea
                                        rows={4}
                                        value={benefits}
                                        onChange={e => setBenefits(e.target.value)}
                                        placeholder="Salary, insurance, work environment, and other perks..."
                                        style={{ width: '100%', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: 'white', fontSize: '14px', lineHeight: 1.6, outline: 'none', resize: 'none' }}
                                    />
                                    {showHistory === 'benefits' && (
                                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', marginTop: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                                            {history.benefits.map((b: string, i: number) => (
                                                <div key={i} onClick={() => { setBenefits(b); setShowHistory(null); }} style={{ padding: '12px 16px', cursor: 'pointer', fontSize: '13px', borderBottom: '1px solid #f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>{b}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Skills */}
                    <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', backgroundColor: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5C9AFF' }}>
                                    <Target size={20} />
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Technical Skills</h3>
                            </div>
                            {history.skills && history.skills.length > 0 && (
                                <div style={{ position: 'relative' }}>
                                    <button onClick={() => setShowHistory(showHistory === 'skills' ? null : 'skills')} style={{ background: 'none', border: 'none', color: '#5C9AFF', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Clock size={12} /> Reuse previous
                                    </button>
                                    {showHistory === 'skills' && (
                                        <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 10, width: '200px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', marginTop: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                                            {history.skills.map((s: string, i: number) => (
                                                <div key={i} onClick={() => { if (!skills.find(sk => sk.name === s)) setSkills([...skills, { name: s, isRequired: true }]); setShowHistory(null); }} style={{ padding: '12px 16px', cursor: 'pointer', fontSize: '13px', borderBottom: '1px solid #f8fafc' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>{s}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                            <input
                                value={newSkill}
                                onChange={e => setNewSkill(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddSkill()}
                                placeholder="Enter skill (e.g. React, Leadership...)"
                                style={{ flex: 1, padding: '14px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' }}
                            />
                            <button
                                type="button"
                                onClick={handleAddSkill}
                                style={{ padding: '0 32px', borderRadius: '12px', border: 'none', backgroundColor: '#5C9AFF', color: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                                Add
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {skills.map((skill, index) => (
                                <div key={index} style={{ padding: '12px 20px', border: '1px solid #f1f5f9', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{skill.name}</span>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={skill.isRequired}
                                                onChange={() => toggleSkillRequired(index)}
                                                style={{ width: '14px', height: '14px', borderRadius: '4px' }}
                                            />
                                            <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>REQUIRED</span>
                                        </label>
                                    </div>
                                    <X size={16} color="#cbd5e1" style={{ cursor: 'pointer' }} onClick={() => removeSkill(index)} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section 3: Experiences */}
                    <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                            <div style={{ width: '40px', height: '40px', backgroundColor: '#fef2f2', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                                <Award size={20} />
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Experience Requirements</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>MINIMUM YEARS</label>
                                <div style={{ position: 'relative', width: '180px' }}>
                                    <input
                                        type="number"
                                        value={minExperience}
                                        onChange={e => setMinExperience(Number(e.target.value))}
                                        style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px', fontWeight: 700, outline: 'none' }}
                                    />
                                    <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>years</span>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>EQUIVALENT ROLES</label>
                                <textarea
                                    rows={3}
                                    value={experienceNote}
                                    onChange={e => setExperienceNote(e.target.value)}
                                    placeholder="Describe similar titles or roles held before..."
                                    style={{ width: '100%', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', resize: 'none' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Education */}
                    <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                            <div style={{ width: '40px', height: '40px', backgroundColor: '#f0fdf4', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
                                <GraduationCap size={20} />
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Education & Certs</h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>MINIMUM EDUCATION</label>
                                <div style={{ position: 'relative' }}>
                                    <select
                                        value={minEducation}
                                        onChange={e => setMinEducation(e.target.value)}
                                        style={{ width: '100%', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', fontWeight: 600, appearance: 'none', outline: 'none' }}>
                                        <option>Bachelor's</option>
                                        <option>Master's</option>
                                        <option>Associate's</option>
                                    </select>
                                    <ChevronDown size={18} color="#94a3b8" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>REQUIRED CERTIFICATIONS</label>
                                <div style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '52px' }}>
                                    {certificates.map(cert => (
                                        <div key={cert} style={{ padding: '6px 12px', backgroundColor: '#eff6ff', color: '#5C9AFF', borderRadius: '8px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            {cert} <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeCert(cert)} />
                                        </div>
                                    ))}
                                    <input
                                        value={newCert}
                                        onChange={e => setNewCert(e.target.value)}
                                        onKeyDown={handleAddCert}
                                        placeholder="Enter more..."
                                        style={{ flex: 1, minWidth: '100px', border: 'none', outline: 'none', fontSize: '13px', padding: '4px' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 5: Question Sets */}
                    <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                            <div style={{ width: '40px', height: '40px', backgroundColor: '#faf5ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
                                <BrainCircuit size={20} />
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Screening Question Sets</h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            {allQuestionSets.map(set => {
                                const isSelected = selectedQuestionSetIds.includes(set.id);
                                return (
                                    <div
                                        key={set.id}
                                        onClick={() => toggleQuestionSet(set.id)}
                                        style={{
                                            padding: '20px',
                                            borderRadius: '16px',
                                            border: isSelected ? '2px solid #5C9AFF' : '1px solid #e2e8f0',
                                            backgroundColor: isSelected ? '#eff6ff' : 'white',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '16px'
                                        }}>
                                        <div style={{ width: '40px', height: '40px', backgroundColor: isSelected ? 'white' : '#f8fafc', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5C9AFF', border: '1px solid #e2e8f0' }}>
                                            <BrainCircuit size={18} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{set.name}</div>
                                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{set.questions?.length || 0} questions • {set.category}</div>
                                        </div>
                                        {isSelected && <CheckCircle2 size={18} color="#5C9AFF" />}
                                    </div>
                                );
                            })}
                            {allQuestionSets.length === 0 && (
                                <div style={{ gridColumn: '1 / -1', padding: '32px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px dashed #e2e8f0' }}>
                                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>No question sets available. Create one in the Question Bank.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Sidebar Settings */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Status Area */}
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '32px', border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 900, color: '#10b981', backgroundColor: '#ecfdf5', padding: '6px 14px', borderRadius: '10px' }}>STATUS: OPEN</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>POSITION LEVEL</label>
                                <div style={{ position: 'relative' }}>
                                    <select
                                        value={levelId}
                                        onChange={e => setLevelId(e.target.value)}
                                        style={{ width: '100%', padding: '14px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', fontWeight: 700, appearance: 'none', outline: 'none' }}>
                                        <option value="">Select level...</option>
                                        {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                    </select>
                                    <ChevronDown size={14} color="#94a3b8" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>HEADCOUNT</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={e => setQuantity(Number(e.target.value))}
                                        style={{ width: '100%', padding: '14px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '16px', fontWeight: 800, textAlign: 'center' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Logistics Area */}
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <Calendar size={18} color="#5C9AFF" />
                            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Logistics</h4>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '6px' }}>JOB TYPE</p>
                                <select
                                    value={jobType}
                                    onChange={e => setJobType(e.target.value)}
                                    style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', fontWeight: 600 }}>
                                    <option>Full-time</option>
                                    <option>Part-time</option>
                                    <option>Contract</option>
                                </select>
                            </div>
                            <div>
                                <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '6px' }}>WORK LOCATION</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div style={{ position: 'relative' }}>
                                        <select
                                            value={isCustomLocation ? "custom" : workLocation}
                                            onChange={(e) => {
                                                if (e.target.value === "custom") {
                                                    setIsCustomLocation(true);
                                                    setWorkLocation("");
                                                } else {
                                                    setIsCustomLocation(false);
                                                    setWorkLocation(e.target.value);
                                                }
                                            }}
                                            style={{ width: '100%', padding: '12px 12px 12px 32px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', fontWeight: 600, appearance: 'none', backgroundColor: 'white' }}>
                                            {offices.map((off, idx) => (
                                                <option key={idx} value={off.address}>{off.label} ({off.address})</option>
                                            ))}
                                            <option value="custom">+ Enter custom address...</option>
                                        </select>
                                        <MapPin size={14} color="#5C9AFF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                        <ChevronDown size={14} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                    </div>
                                    
                                    {isCustomLocation && (
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                value={workLocation}
                                                onChange={e => setWorkLocation(e.target.value)}
                                                placeholder="Enter specific address..."
                                                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', fontWeight: 600 }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '6px' }}>WORKING TIME</p>
                                <input
                                    value={workingTime}
                                    onChange={e => setWorkingTime(e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', fontWeight: 600 }}
                                />
                            </div>
                            <div>
                                <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '6px' }}>EXPIRATION DATE</p>
                                <input
                                    type="date"
                                    value={expirationDate}
                                    onChange={e => setExpirationDate(e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', fontWeight: 600 }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Compensation Area */}
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <DollarSign size={18} color="#5C9AFF" />
                            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Compensation</h4>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                            <div>
                                <p style={{ fontSize: '9px', fontWeight: 800, color: '#94a3b8', marginBottom: '6px' }}>MIN (USD)</p>
                                <input
                                    type="number"
                                    value={minSalary}
                                    onChange={e => setMinSalary(Number(e.target.value))}
                                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}
                                />
                            </div>
                            <div>
                                <p style={{ fontSize: '9px', fontWeight: 800, color: '#94a3b8', marginBottom: '6px' }}>MAX (USD)</p>
                                <input
                                    type="number"
                                    value={maxSalary}
                                    onChange={e => setMaxSalary(Number(e.target.value))}
                                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}
                                />
                            </div>
                        </div>
                        <p style={{ fontSize: '10px', color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>
                            AI Matching will prioritize candidates within this threshold + 25%.
                        </p>
                    </div>

                    {/* Submit Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <button
                            onClick={() => handleSubmit('PUBLISHED')}
                            disabled={isLoading}
                            style={{
                                padding: '20px',
                                backgroundColor: '#5C9AFF',
                                color: 'white',
                                border: 'none',
                                borderRadius: '20px',
                                fontSize: '15px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <>Post Job Now <ArrowRight size={20} /></>}
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmModal 
                isOpen={isConfirmModalOpen}
                title="Confirm Job Posting"
                message="Are you sure you want to post this job? The job listing will be publicly visible immediately."
                onConfirm={confirmSubmit}
                onCancel={() => setIsConfirmModalOpen(false)}
                type="info"
                confirmText="Post Now"
                cancelText="Back"
            />
        </div>
    );
}
