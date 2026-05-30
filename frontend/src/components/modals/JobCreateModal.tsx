"use client";

import React, { useState, useEffect } from "react";
import {
    Plus,
    X,
    Briefcase,
    Search,
    ChevronDown,
    Loader2,
    Sparkles,
    Target,
    Award,
    GraduationCap,
    DollarSign,
    BrainCircuit,
    CheckCircle2,
    Zap,
    MapPin,
    Calendar,
    Save
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { jobService } from "@/services/job.service";
import { questionBankService } from "@/services/question-bank.service";
import { masterDataService } from "@/services/master-data.service";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface JobCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (job: any) => void;
    campaignId: string;
    jobToEdit?: any;
}

export default function JobCreateModal({ isOpen, onClose, onSuccess, campaignId, jobToEdit }: JobCreateModalProps) {
    const user = useAuthStore(state => state.user);
    const [isCreatingJob, setIsCreatingJob] = useState(false);
    const [companyPositions, setCompanyPositions] = useState<any[]>([]);
    const [companyLevels, setCompanyLevels] = useState<any[]>([]);
    const [allQuestionSets, setAllQuestionSets] = useState<any[]>([]);
    const [offices, setOffices] = useState<{ label: string; address: string }[]>([]);
    const [isCustomLocation, setIsCustomLocation] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const isReadOnly = !!(jobToEdit?.applications?.length > 0);

    // Form State for Quick Job Creation
    const [jobFormData, setJobFormData] = useState({
        title: "",
        description: "",
        positionId: "",
        category: "BE",
        levelId: "",
        skills: [{ name: "Node.js", isRequired: true }] as { name: string; isRequired: boolean }[],
        minExperience: 1,
        experienceNote: "",
        minEducation: "Bachelor's",
        certificates: [] as string[],
        jobType: "Full-time",
        location: "",
        workingTime: "Mon - Fri, 8:30am - 6:00pm",
        expirationDate: "",
        minSalary: 0,
        maxSalary: 0,
        quantity: 1,
        questionSetIds: [] as string[],
        responsibilities: "",
        benefits: ""
    });

    const [newQuickSkill, setNewQuickSkill] = useState("");
    const [newQuickCert, setNewQuickCert] = useState("");

    useEffect(() => {
        if (isOpen && user) {
            fetchPositions();
            fetchLevels();
            fetchOffices();
            fetchQuestionSets();

            if (jobToEdit) {
                setJobFormData({
                    title: jobToEdit.title || "",
                    description: jobToEdit.description || "",
                    positionId: jobToEdit.positionId || "",
                    category: jobToEdit.categoryId || jobToEdit.category_id || "BE",
                    levelId: jobToEdit.levelId || "",
                    skills: jobToEdit.skills?.map((s: any) => ({ 
                        name: typeof s === 'string' ? s : (s.skillName || s.name || ""), 
                        isRequired: typeof s === 'object' ? !!s.isRequired : false 
                    })) || [],
                    minExperience: jobToEdit.minExperience !== undefined ? jobToEdit.minExperience : 1,
                    experienceNote: jobToEdit.experienceNote || "",
                    minEducation: jobToEdit.minEducation || "Bachelor's",
                    certificates: jobToEdit.certificates || [],
                    jobType: jobToEdit.type || "Full-time",
                    location: jobToEdit.workLocation || jobToEdit.work_location || jobToEdit.location || "",
                    workingTime: jobToEdit.workingTime || jobToEdit.work_time || "Mon - Fri, 8:30am - 6:00pm",
                    expirationDate: (jobToEdit.expiredAt || jobToEdit.expired_at) ? new Date(jobToEdit.expiredAt || jobToEdit.expired_at).toISOString().split('T')[0] : "",
                    minSalary: jobToEdit.minSalary || jobToEdit.salary_min || 0,
                    maxSalary: jobToEdit.maxSalary || jobToEdit.salary_max || 0,
                    quantity: jobToEdit.quantity || jobToEdit.total_quantity || 1,
                    questionSetIds: jobToEdit.question_sets?.map((s: any) => s.id) || jobToEdit.questionSetIds || [],
                    responsibilities: jobToEdit.responsibilities || jobToEdit.description || "",
                    benefits: jobToEdit.benefits || ""
                });
            } else {
                // Reset form for create mode
                setJobFormData({
                    title: "",
                    description: "",
                    positionId: "",
                    category: "BE",
                    levelId: "",
                    skills: [{ name: "Node.js", isRequired: true }],
                    minExperience: 1,
                    experienceNote: "",
                    minEducation: "Bachelor's",
                    certificates: [],
                    jobType: "Full-time",
                    location: "",
                    workingTime: "Mon - Fri, 8:30am - 6:00pm",
                    expirationDate: "",
                    minSalary: 0,
                    maxSalary: 0,
                    quantity: 1,
                    questionSetIds: [],
                    responsibilities: "",
                    benefits: ""
                });
                setIsCustomLocation(false);
            }
        }
    }, [isOpen, user, jobToEdit]);

    // Smart location detection after offices are loaded
    useEffect(() => {
        if (jobToEdit && offices.length > 0) {
            const loc = jobToEdit.workLocation || jobToEdit.work_location || jobToEdit.location;
            if (loc) {
                const isOffice = offices.some(off => off.address === loc);
                setIsCustomLocation(!isOffice);
            }
        }
    }, [offices, jobToEdit]);

    const fetchOffices = async () => {
        try {
            setFetchError(null);
            const companyId = user?.companyId || user?.company?.id;
            let data: any = null;
            
            if (companyId) {
                data = await api.get<any>(`/companies/${companyId}`);
            } else {
                data = await api.get<any>("/companies/user/my");
            }

            if (data) {
                let officeList: { label: string; address: string }[] = [];
                if (data.offices && Array.isArray(data.offices) && data.offices.length > 0) {
                    officeList = [...data.offices];
                } 
                if (officeList.length === 0 && data.address) {
                    officeList.push({ label: "Headquarters", address: data.address });
                }
                setOffices(officeList);
                if (officeList.length > 0 && !jobFormData.location) {
                    setJobFormData(prev => ({ ...prev, location: officeList[0].address }));
                }
            }
        } catch (error: any) {
            console.error("Failed to fetch offices", error);
            setFetchError(error.message || "Connection error");
        }
    };

    const fetchPositions = async () => {
        try {
            const data = await masterDataService.getPositions();
            setCompanyPositions(data || []);
            if (data && data.length > 0 && !jobFormData.positionId) {
                setJobFormData(prev => ({ ...prev, positionId: data[0].id }));
            }
        } catch (error) {
            console.error("Failed to fetch positions");
        }
    };

    const fetchLevels = async () => {
        try {
            const data = await masterDataService.getLevels();
            setCompanyLevels(data || []);
            if (data && data.length > 0 && !jobFormData.levelId) {
                setJobFormData(prev => ({ ...prev, levelId: data[0].id }));
            }
        } catch (error) {
            console.error("Failed to fetch levels");
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

    const handleCreateJob = async () => {
        if (!jobFormData.title) {
            alert("Please enter a Job Title");
            return;
        }
        try {
            setIsCreatingJob(true);
            const payload: any = {
                title: jobFormData.title,
                description: jobFormData.description,
                categoryId: jobFormData.category,
                category_id: jobFormData.category,
                positionId: jobFormData.positionId || undefined,
                levelId: jobFormData.levelId || undefined,
                quantity: jobFormData.quantity,
                minSalary: jobFormData.minSalary,
                salary_min: jobFormData.minSalary,
                maxSalary: jobFormData.maxSalary,
                salary_max: jobFormData.maxSalary,
                workLocation: jobFormData.location,
                work_location: jobFormData.location,
                workingTime: jobFormData.workingTime,
                work_time: jobFormData.workingTime,
                expiredAt: jobFormData.expirationDate ? new Date(jobFormData.expirationDate).toISOString() : undefined,
                expired_at: jobFormData.expirationDate ? new Date(jobFormData.expirationDate).toISOString() : undefined,
                skills: jobFormData.skills.map(s => s.name),
                questionSetIds: jobFormData.questionSetIds,
                question_set_ids: jobFormData.questionSetIds,
                responsibilities: jobFormData.responsibilities,
                benefits: jobFormData.benefits,
                minExperience: jobFormData.minExperience,
                experienceNote: jobFormData.experienceNote,
                minEducation: jobFormData.minEducation,
                certificates: jobFormData.certificates,
                type: jobFormData.jobType
            };

            if (campaignId) {
                payload.campaignId = campaignId;
                payload.campaign_ids = [campaignId];
            }

            let result;
            if (jobToEdit) {
                result = await jobService.update(jobToEdit.id, payload as any);
            } else {
                result = await jobService.create(payload as any);
            }
            
            onSuccess(result);
            onClose();
        } catch (error: any) {
            console.error("Job Action Error:", error);
            alert(`Could not ${jobToEdit ? 'update' : 'create'} job: ${error.message || "Unknown error"}`);
        } finally {
            setIsCreatingJob(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    style={{ backgroundColor: '#F8FAFC', borderRadius: '32px', width: '100%', maxWidth: '1000px', height: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.25)' }}
                >
                    {/* Modal Header */}
                    <div style={{ padding: '32px 40px', backgroundColor: 'white', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ width: '48px', height: '48px', backgroundColor: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5C9AFF' }}>
                                <Sparkles size={24} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {isReadOnly ? `Details: ${jobFormData.title || 'Job'}` : (jobToEdit ? `Edit: ${jobFormData.title || 'Job'}` : "Create New Job")}
                                    {isReadOnly && <span style={{ fontSize: '11px', fontWeight: 800, color: '#ef4444', backgroundColor: '#fef2f2', padding: '4px 12px', borderRadius: '100px', border: '1px solid #ef444420' }}>VIEW ONLY</span>}
                                </h3>
                                <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
                                    {isReadOnly 
                                        ? "This job posting already has applications and cannot be edited." 
                                        : (jobToEdit ? "Update detailed information for this vacancy" : "Set recruitment criteria for the new position")
                                    }
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} style={{ padding: '10px', borderRadius: '14px', border: 'none', backgroundColor: '#f8fafc', color: '#94a3b8', cursor: 'pointer', transition: 'all 0.2s' }}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Modal Content (Scrollable) */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
                        <fieldset disabled={isReadOnly} style={{ border: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: '1fr 320px', gap: '40px', minWidth: 0 }}>

                        {/* Main Content Area */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            {/* Core Details */}
                            <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                    <Briefcase size={20} color="#5C9AFF" />
                                    <h4 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#1e293b' }}>Position Information</h4>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>JOB TITLE *</label>
                                        <input
                                            value={jobFormData.title}
                                            onChange={e => setJobFormData({ ...jobFormData, title: e.target.value })}
                                            placeholder="e.g., Senior React Developer"
                                            style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px', fontWeight: 600, outline: 'none', transition: 'all 0.2s' }}
                                        />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>POSITION ARCHITECTURE</label>
                                            <div style={{ position: 'relative' }}>
                                                <select
                                                    value={jobFormData.positionId}
                                                    onChange={e => setJobFormData({ ...jobFormData, positionId: e.target.value })}
                                                    style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: 'white', fontSize: '14px', fontWeight: 600, appearance: 'none', outline: 'none' }}>
                                                    <option value="">Select position...</option>
                                                    {companyPositions.map(pos => <option key={pos.id} value={pos.id}>{pos.name}</option>)}
                                                </select>
                                                <ChevronDown size={18} color="#94a3b8" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>JOB DESCRIPTION</label>
                                        <textarea
                                            rows={3}
                                            value={jobFormData.description}
                                            onChange={e => setJobFormData({ ...jobFormData, description: e.target.value })}
                                            placeholder="Brief summary of the role..."
                                            style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', resize: 'none', lineHeight: 1.6 }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>JOB REQUIREMENTS</label>
                                        <textarea
                                            rows={3}
                                            value={jobFormData.responsibilities}
                                            onChange={e => setJobFormData({ ...jobFormData, responsibilities: e.target.value })}
                                            placeholder="Professional requirements, essential skills..."
                                            style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', resize: 'none', lineHeight: 1.6 }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>BENEFITS & PERKS</label>
                                        <textarea
                                            rows={3}
                                            value={jobFormData.benefits}
                                            onChange={e => setJobFormData({ ...jobFormData, benefits: e.target.value })}
                                            placeholder="Welfare, insurance, bonuses..."
                                            style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', resize: 'none', lineHeight: 1.6 }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Skills Section */}
                            <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                    <Target size={20} color="#5C9AFF" />
                                    <h4 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#1e293b' }}>Skills & Expertise</h4>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                                    <input
                                        value={newQuickSkill}
                                        onChange={e => setNewQuickSkill(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && newQuickSkill) {
                                                setJobFormData({ ...jobFormData, skills: [...jobFormData.skills, { name: newQuickSkill, isRequired: false }] });
                                                setNewQuickSkill("");
                                            }
                                        }}
                                        placeholder="Enter skill (e.g., React, Node.js...)"
                                        style={{ flex: 1, padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (newQuickSkill) {
                                                setJobFormData({ ...jobFormData, skills: [...jobFormData.skills, { name: newQuickSkill, isRequired: false }] });
                                                setNewQuickSkill("");
                                            }
                                        }}
                                        style={{ padding: '0 24px', borderRadius: '12px', border: 'none', backgroundColor: '#5C9AFF', color: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>Add</button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {jobFormData.skills.map((s, idx) => (
                                        <div key={idx} style={{ padding: '12px 18px', border: '1px solid #f8fafc', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fcfcfc' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <span style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>{s.name}</span>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                    <input type="checkbox" checked={s.isRequired} onChange={() => {
                                                        const n = [...jobFormData.skills]; n[idx].isRequired = !n[idx].isRequired;
                                                        setJobFormData({ ...jobFormData, skills: n });
                                                    }} style={{ width: '16px', height: '16px' }} />
                                                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>REQUIRED</span>
                                                </label>
                                            </div>
                                            <button onClick={() => setJobFormData({ ...jobFormData, skills: jobFormData.skills.filter((_, i) => i !== idx) })} style={{ border: 'none', background: 'none', color: '#cbd5e1', cursor: 'pointer', padding: '4px' }}><X size={16} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Experience Section */}
                            <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                    <Award size={20} color="#ef4444" />
                                    <h4 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#1e293b' }}>Experiences</h4>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>MINIMUM YEARS</label>
                                        <div style={{ position: 'relative', width: '180px' }}>
                                            <input
                                                type="number"
                                                value={jobFormData.minExperience}
                                                onChange={e => setJobFormData({ ...jobFormData, minExperience: parseInt(e.target.value) })}
                                                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px', fontWeight: 700, outline: 'none' }}
                                            />
                                            <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>years</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>EXPERIENCE NOTES</label>
                                        <textarea
                                            rows={2}
                                            value={jobFormData.experienceNote}
                                            onChange={e => setJobFormData({ ...jobFormData, experienceNote: e.target.value })}
                                            placeholder="Describe equivalent titles or roles..."
                                            style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', resize: 'none' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Education Section */}
                            <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                    <GraduationCap size={20} color="#22c55e" />
                                    <h4 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#1e293b' }}>Education & Certifications</h4>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>MINIMUM EDUCATION</label>
                                        <div style={{ position: 'relative' }}>
                                            <select
                                                value={jobFormData.minEducation}
                                                onChange={e => setJobFormData({ ...jobFormData, minEducation: e.target.value })}
                                                style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: 'white', fontSize: '14px', fontWeight: 600, appearance: 'none', outline: 'none' }}>
                                                <option value="Bachelor's">Bachelor's</option>
                                                <option value="Master's">Master's</option>
                                                <option value="PhD">PhD</option>
                                                <option value="Associate">Associate</option>
                                                <option value="High School">High School</option>
                                            </select>
                                            <ChevronDown size={18} color="#94a3b8" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>CERTIFICATIONS (Press Enter to add)</label>
                                        <div style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '52px', backgroundColor: 'white' }}>
                                            {jobFormData.certificates.map(cert => (
                                                <div key={cert} style={{ padding: '4px 10px', backgroundColor: '#eff6ff', color: '#5C9AFF', borderRadius: '8px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    {cert} <X size={12} style={{ cursor: 'pointer' }} onClick={() => setJobFormData({ ...jobFormData, certificates: jobFormData.certificates.filter(c => c !== cert) })} />
                                                </div>
                                            ))}
                                            <input
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        const val = (e.target as HTMLInputElement).value;
                                                        if (val && !jobFormData.certificates.includes(val)) {
                                                            setJobFormData({ ...jobFormData, certificates: [...jobFormData.certificates, val] });
                                                            (e.target as HTMLInputElement).value = "";
                                                        }
                                                    }
                                                }}
                                                placeholder="Add..."
                                                style={{ border: 'none', outline: 'none', fontSize: '13px', flex: 1, minWidth: '60px' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Question Sets */}
                            <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                    <BrainCircuit size={20} color="#a855f7" />
                                    <h4 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#1e293b' }}>Evaluation Question Sets</h4>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    {allQuestionSets.map(set => {
                                        const isSelected = jobFormData.questionSetIds.includes(set.id);
                                        return (
                                            <div
                                                key={set.id}
                                                onClick={() => setJobFormData(prev => ({
                                                    ...prev,
                                                    questionSetIds: prev.questionSetIds.includes(set.id) ? prev.questionSetIds.filter(i => i !== set.id) : [...prev.questionSetIds, set.id]
                                                }))}
                                                style={{
                                                    padding: '16px',
                                                    borderRadius: '16px',
                                                    border: isSelected ? '2px solid #5C9AFF' : '1px solid #f1f5f9',
                                                    backgroundColor: isSelected ? '#eff6ff' : '#f8fafc',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '14px',
                                                    transition: 'all 0.2s'
                                                }}>
                                                <div style={{ width: '36px', height: '36px', backgroundColor: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5C9AFF', border: '1px solid #e2e8f0' }}>
                                                    <BrainCircuit size={16} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{set.name}</div>
                                                    <div style={{ fontSize: '10px', color: '#64748b' }}>{set.questions?.length || 0} questions</div>
                                                </div>
                                                {isSelected && <CheckCircle2 size={18} color="#5C9AFF" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar - Logistics & Compensation */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                                    <Calendar size={18} color="#5C9AFF" />
                                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>Operation</h4>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '9px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>LEVEL</label>
                                        <select value={jobFormData.levelId} onChange={e => setJobFormData({ ...jobFormData, levelId: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontWeight: 700, fontSize: '13px', outline: 'none' }}>
                                            {companyLevels.map(lvl => <option key={lvl.id} value={lvl.id}>{lvl.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '9px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>JOB TYPE</label>
                                        <select value={jobFormData.jobType} onChange={e => setJobFormData({ ...jobFormData, jobType: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontWeight: 700, fontSize: '13px', outline: 'none' }}>
                                            <option>Full-time</option><option>Part-time</option><option>Contract</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '9px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>OPEN POSITIONS</label>
                                        <input type="number" value={jobFormData.quantity} onChange={e => setJobFormData({ ...jobFormData, quantity: parseInt(e.target.value) })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontWeight: 800, fontSize: '15px', textAlign: 'center' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '9px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>APPLICATION DEADLINE</label>
                                        {(campaignId || (jobToEdit?.campaigns && jobToEdit.campaigns.length > 0)) ? (
                                            <div style={{ 
                                                padding: '12px', 
                                                backgroundColor: '#F8FAFC', 
                                                borderRadius: '10px', 
                                                border: '1px dashed #E2E8F0',
                                                fontSize: '12px',
                                                color: '#64748B',
                                                fontWeight: 600,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}>
                                                <Calendar size={14} color="#5C9AFF" />
                                                Based on campaign duration
                                            </div>
                                        ) : (
                                            <input 
                                                type="date" 
                                                value={jobFormData.expirationDate} 
                                                onChange={e => setJobFormData({ ...jobFormData, expirationDate: e.target.value })} 
                                                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px', fontWeight: 600 }} 
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <label style={{ fontSize: '9px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', margin: 0 }}>WORK LOCATION</label>
                                            {fetchError && <span style={{ fontSize: '8px', color: '#ef4444' }}>{fetchError}</span>}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <div style={{ position: 'relative' }}>
                                                <select 
                                                    value={isCustomLocation ? "custom" : jobFormData.location} 
                                                    onChange={e => {
                                                        if (e.target.value === "custom") {
                                                            setIsCustomLocation(true);
                                                            setJobFormData({ ...jobFormData, location: "" });
                                                        } else {
                                                            setIsCustomLocation(false);
                                                            setJobFormData({ ...jobFormData, location: e.target.value });
                                                        }
                                                    }} 
                                                    style={{ width: '100%', padding: '12px 36px 12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontWeight: 600, fontSize: '13px', outline: 'none', appearance: 'none', backgroundColor: 'white' }}>
                                                    {offices.map((off, idx) => (
                                                        <option key={idx} value={off.address}>{off.label} ({off.address})</option>
                                                    ))}
                                                    <option value="custom">+ Enter other address...</option>
                                                </select>
                                                <ChevronDown size={16} color="#94a3b8" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                            </div>

                                            {isCustomLocation && (
                                                <div style={{ position: 'relative' }}>
                                                    <input 
                                                        value={jobFormData.location}
                                                        onChange={e => setJobFormData({ ...jobFormData, location: e.target.value })}
                                                        placeholder="Enter specific address..."
                                                        style={{ width: '100%', padding: '12px 14px 12px 36px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px', fontWeight: 600 }}
                                                    />
                                                    <MapPin size={14} color="#5C9AFF" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                                    <DollarSign size={18} color="#5C9AFF" />
                                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>Salary & Compensation (USD)</h4>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '8px', fontWeight: 800, color: '#94a3b8', marginBottom: '6px' }}>MIN</label>
                                        <input type="number" value={jobFormData.minSalary} onChange={e => setJobFormData({ ...jobFormData, minSalary: parseInt(e.target.value) })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #f1f5f9', fontSize: '13px', fontWeight: 800, textAlign: 'center' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '8px', fontWeight: 800, color: '#94a3b8', marginBottom: '6px' }}>MAX</label>
                                        <input type="number" value={jobFormData.maxSalary} onChange={e => setJobFormData({ ...jobFormData, maxSalary: parseInt(e.target.value) })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #f1f5f9', fontSize: '13px', fontWeight: 800, textAlign: 'center' }} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '32px', borderRadius: '24px', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '1px solid #bfdbfe' }}>
                                <h5 style={{ fontSize: '14px', fontWeight: 800, color: '#1e40af', margin: '0 0 10px' }}>AI Match Ready</h5>
                                <p style={{ fontSize: '12px', color: '#4A8CFF', lineHeight: 1.5, margin: 0 }}>This position will be automatically analyzed by the AI system to suggest the most suitable candidates based on your criteria.</p>
                            </div>
                            </div>
                        </fieldset>
                    </div>

                    {/* Modal Footer */}
                    <div style={{ padding: '24px 40px', backgroundColor: 'white', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '16px', flexShrink: 0 }}>
                        <button type="button" onClick={onClose} style={{ padding: '14px 32px', borderRadius: '12px', border: 'none', backgroundColor: 'transparent', color: '#64748b', fontWeight: 700, cursor: 'pointer' }}>Close</button>
                        {!isReadOnly && (
                            <button
                                onClick={handleCreateJob}
                                disabled={isCreatingJob}
                                style={{ 
                                    padding: '14px 48px', 
                                    borderRadius: '14px', 
                                    border: 'none', 
                                    backgroundColor: '#5C9AFF', 
                                    color: 'white', 
                                    fontWeight: 800, 
                                    fontSize: '16px', 
                                    cursor: 'pointer', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '12px', 
                                    boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)',
                                    transition: 'all 0.2s'
                                }}>
                                {isCreatingJob ? <Loader2 size={20} className="animate-spin" /> : (jobToEdit ? <Save size={20} /> : <Plus size={20} />)}
                                {isCreatingJob ? "Saving..." : (jobToEdit ? "Save Changes" : "Create New Job")}
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
