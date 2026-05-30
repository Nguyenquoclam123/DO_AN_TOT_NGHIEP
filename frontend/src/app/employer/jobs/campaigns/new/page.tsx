"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Plus,
    X,
    ArrowLeft,
    Calendar,
    Info,
    Briefcase,
    Settings,
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
    Eye,
    Pencil,
    Save
} from "lucide-react";
import Link from "next/link";
import { campaignService } from "@/services/campaign.service";
import { jobService } from "@/services/job.service";
import { masterDataService } from "@/services/master-data.service";
import { questionBankService } from "@/services/question-bank.service";
import { api, apiRequest } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import JobCreateModal from "@/components/modals/JobCreateModal";

export default function CreateCampaignPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [jobs, setJobs] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [isJobsExpanded, setIsJobsExpanded] = useState(false);
    const [isJobModalOpen, setIsJobModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<any>(null);
    const user = useAuthStore(state => state.user);

    // Form State for Campaign
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        status: "ACTIVE",
        department: "Human Resources",
        selectedJobs: [] as string[]
    });

    const fetchJobs = async () => {
        try {
            const data = await jobService.getMyJobs();
            setJobs(data || []);
        } catch (error) {
            console.error("Failed to fetch jobs");
        }
    };

    useEffect(() => {
        if (user) {
            fetchJobs();
        }
    }, [user]);

    const handleToggleJob = (jobId: string) => {
        setFormData(prev => ({
            ...prev,
            selectedJobs: prev.selectedJobs.includes(jobId)
                ? prev.selectedJobs.filter(id => id !== jobId)
                : [...prev.selectedJobs, jobId]
        }));
    };

    const handleEditJob = (e: React.MouseEvent, job: any) => {
        e.stopPropagation();
        setEditingJob(job);
        setIsJobModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsJobModalOpen(false);
        setEditingJob(null);
    };

    const filteredJobs = jobs.filter(job =>
        job.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const campaignData = {
                name: formData.name,
                description: formData.description,
                startDate: formData.startDate,
                endDate: formData.endDate,
                status: formData.status as any,
                jobIds: formData.selectedJobs
            };

            await campaignService.create(campaignData);
            router.push("/employer/jobs/campaigns");
        } catch (error) {
            console.error("Campaign Creation Error:", error);
            alert("Failed to create campaign. Please check your data.");
        } finally {
            setIsLoading(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '14px 18px',
        backgroundColor: 'white',
        border: '1.5px solid #e2e8f0',
        borderRadius: '14px',
        fontSize: '14px',
        fontWeight: 600,
        color: '#0f172a',
        outline: 'none',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '12px',
        fontWeight: 800,
        color: '#64748b',
        textTransform: 'uppercase',
        marginBottom: '10px',
        letterSpacing: '0.05em'
    };

    return (
        <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', padding: '48px 64px', fontFamily: '"Times New Roman", Times, serif' }}>
            {/* Header Area */}
            <div style={{ marginBottom: '48px' }}>
                <Link href="/employer/jobs/campaigns" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#64748b',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: 700,
                    marginBottom: '16px',
                    padding: '8px 16px',
                    backgroundColor: 'white',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s'
                }}>
                    <ArrowLeft size={16} /> Back
                </Link>
                <div style={{ marginTop: '24px' }}>
                    <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>Create Recruitment Campaign</h1>
                    <p style={{ color: '#64748b', fontSize: '16px', marginTop: '12px', maxWidth: '600px', lineHeight: 1.6 }}>Define the details and timeline for your next talent acquisition drive.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '32px', maxWidth: '1200px' }}>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {/* Basic Info Section */}
                    <div style={{ backgroundColor: 'white', borderRadius: '32px', padding: '40px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                            <div style={{ width: '48px', height: '48px', backgroundColor: '#eff6ff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5C9AFF' }}>
                                <Info size={24} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Basic Information</h3>
                                <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0' }}>Define campaign name and primary objective</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                            <div>
                                <label style={labelStyle}>Campaign Name <span style={{ color: '#ef4444' }}>*</span></label>
                                <input
                                    required
                                    placeholder="e.g., Tech Talent Q4 - 2024 Drive"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    style={inputStyle}
                                    onFocus={(e) => e.target.style.borderColor = '#5C9AFF'}
                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Campaign Objective</label>
                                <textarea
                                    rows={5}
                                    placeholder="Enter the primary goals and details of this recruitment campaign..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    style={{ ...inputStyle, resize: 'none' }}
                                    onFocus={(e) => e.target.style.borderColor = '#5C9AFF'}
                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Jobs Selection Section */}
                    <div style={{ backgroundColor: 'white', borderRadius: '32px', padding: '40px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                        <div 
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                            onClick={() => setIsJobsExpanded(!isJobsExpanded)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '48px', height: '48px', backgroundColor: '#f0fdf4', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                                    <Briefcase size={24} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Assign Jobs to Campaign</h3>
                                    <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0' }}>
                                        Selected <span style={{ color: '#5C9AFF', fontWeight: 700 }}>{formData.selectedJobs.length}</span> positions
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ 
                                    padding: '8px 16px', 
                                    backgroundColor: isJobsExpanded ? '#f1f5f9' : '#eff6ff', 
                                    color: isJobsExpanded ? '#64748b' : '#5C9AFF', 
                                    borderRadius: '10px', 
                                    fontSize: '12px', 
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    {isJobsExpanded ? 'Collapse' : 'Expand to Select'}
                                    <ChevronDown size={16} style={{ transform: isJobsExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }} />
                                </div>
                            </div>
                        </div>

                        {/* Selected Jobs Chips (Always visible) */}
                        {formData.selectedJobs.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '20px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px dashed #e2e8f0' }}>
                                {formData.selectedJobs.map(id => {
                                    const job = jobs.find(j => j.id === id);
                                    if (!job) return null;
                                    return (
                                        <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'white', padding: '6px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{job.title}</span>
                                            <X size={14} color="#94a3b8" style={{ cursor: 'pointer' }} onClick={(e) => {
                                                e.stopPropagation();
                                                handleToggleJob(id);
                                            }} />
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Expandable Selection Area */}
                        {isJobsExpanded && (
                            <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                    <div style={{ position: 'relative', width: '280px' }}>
                                        <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                                        <input
                                            type="text"
                                            placeholder="Search positions..."
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            style={{ ...inputStyle, paddingLeft: '40px', paddingRight: '12px', paddingTop: '10px', paddingBottom: '10px', borderRadius: '12px', fontSize: '13px' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                if (formData.selectedJobs.length === filteredJobs.length) {
                                                    setFormData(prev => ({ ...prev, selectedJobs: [] }));
                                                } else {
                                                    setFormData(prev => ({ ...prev, selectedJobs: filteredJobs.map(j => j.id!) }));
                                                }
                                            }}
                                            style={{ padding: '8px 16px', backgroundColor: 'transparent', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '12px', fontWeight: 700, color: '#64748b', cursor: 'pointer' }}
                                        >
                                            {formData.selectedJobs.length === filteredJobs.length && filteredJobs.length > 0 ? "Deselect All" : "Select All"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsJobModalOpen(true)}
                                            style={{ padding: '8px 16px', backgroundColor: '#eff6ff', color: '#5C9AFF', border: '1px solid #dbeafe', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                        >
                                            <Plus size={14} /> Create New Job
                                        </button>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
                                    {filteredJobs.length > 0 ? filteredJobs.map(job => (
                                        <div
                                            key={job.id}
                                            onClick={() => handleToggleJob(job.id)}
                                            style={{
                                                padding: '16px',
                                                backgroundColor: formData.selectedJobs.includes(job.id) ? '#eff6ff' : '#f8fafc',
                                                border: `1.5px solid ${formData.selectedJobs.includes(job.id) ? '#5C9AFF' : '#f1f5f9'}`,
                                                borderRadius: '20px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '16px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                position: 'relative'
                                            }}
                                        >
                                            <div style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '6px',
                                                border: `2px solid ${formData.selectedJobs.includes(job.id) ? '#5C9AFF' : '#cbd5e1'}`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: formData.selectedJobs.includes(job.id) ? '#5C9AFF' : 'transparent',
                                                flexShrink: 0
                                            }}>
                                                {formData.selectedJobs.includes(job.id) && <Plus size={14} color="white" style={{ transform: 'rotate(45deg)' }} />}
                                            </div>
                                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{job.title}</h4>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                                                    <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>{job.type || 'Full-time'}</span>
                                                    <span style={{ width: '3px', height: '3px', backgroundColor: '#cbd5e1', borderRadius: '50%' }}></span>
                                                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#5C9AFF' }}>TARGET: {job.quantity}</span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                                {(!job.applications || job.applications.length === 0) && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleEditJob(e, job)}
                                                        style={{
                                                            width: '32px',
                                                            height: '32px',
                                                            borderRadius: '8px',
                                                            border: 'none',
                                                            backgroundColor: 'white',
                                                            color: '#94a3b8',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                                        }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.color = '#5C9AFF'; e.currentTarget.style.backgroundColor = '#eff6ff'; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.backgroundColor = 'white'; }}
                                                        title="Edit Job"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.open(`/employer/jobs/${job.id}`, '_blank');
                                                    }}
                                                    style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '8px',
                                                        border: 'none',
                                                        backgroundColor: 'white',
                                                        color: '#94a3b8',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        flexShrink: 0,
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                                    }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.color = '#5C9AFF'; e.currentTarget.style.backgroundColor = '#eff6ff'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.backgroundColor = 'white'; }}
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )) : (
                                        <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
                                            <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 600 }}>No matching jobs found.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Config */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {/* Timeline Section */}
                    <div style={{ backgroundColor: 'white', borderRadius: '28px', padding: '32px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                            <Calendar size={20} color="#5C9AFF" />
                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Timeline</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={labelStyle}>Start Date</label>
                                <input
                                    type="date"
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    value={formData.startDate}
                                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                    style={{ ...inputStyle, padding: '12px 14px' }}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Expected End Date</label>
                                <input
                                    type="date"
                                    required
                                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                                    value={formData.endDate}
                                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                    style={{ ...inputStyle, padding: '12px 14px' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Settings Section */}
                    <div style={{ backgroundColor: 'white', borderRadius: '28px', padding: '32px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                            <Settings size={20} color="#5C9AFF" />
                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Configuration</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={labelStyle}>Status</label>
                                <div style={{ position: 'relative' }}>
                                    <select
                                        style={{ ...inputStyle, padding: '12px 14px', appearance: 'none' }}
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="ACTIVE">Active</option>
                                    </select>
                                    <ChevronDown size={16} color="#94a3b8" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Area */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                padding: '18px',
                                backgroundColor: '#5C9AFF',
                                color: 'white',
                                border: 'none',
                                borderRadius: '18px',
                                fontSize: '15px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={18} fill="white" />}
                            {isLoading ? 'Creating...' : 'Create Campaign'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            style={{
                                padding: '16px',
                                backgroundColor: 'transparent',
                                border: '1px solid #e2e8f0',
                                borderRadius: '18px',
                                fontSize: '14px',
                                fontWeight: 700,
                                color: '#64748b',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </form>


            <JobCreateModal 
                isOpen={isJobModalOpen}
                onClose={handleCloseModal}
                campaignId="" // This is a new campaign, so we don't have an ID yet, but we'll select the job upon success
                jobToEdit={editingJob}
                onSuccess={(job) => {
                    fetchJobs();
                    if (job && job.id && !editingJob) {
                        setFormData(prev => ({
                            ...prev,
                            selectedJobs: [...prev.selectedJobs, job.id]
                        }));
                    }
                }}
            />
        </div>
    );
}
