"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
    CheckCircle2,
    Zap,
    Save,
    Pencil
} from "lucide-react";
import Link from "next/link";
import { campaignService, Campaign } from "@/services/campaign.service";
import { jobService } from "@/services/job.service";
import JobCreateModal from "@/components/modals/JobCreateModal";

export default function EditCampaignPage() {
    const router = useRouter();
    const { id } = useParams() as { id: string };
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [jobs, setJobs] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isJobModalOpen, setIsJobModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<any>(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        status: "ACTIVE",
        selectedJobs: [] as string[]
    });

    useEffect(() => {
        if (id) {
            fetchInitialData();
        }
    }, [id]);

    const fetchInitialData = async () => {
        try {
            setIsLoading(true);
            const [campaign, allJobs] = await Promise.all([
                campaignService.getById(id),
                jobService.getMyJobs()
            ]);

            setJobs(allJobs || []);

            if (campaign) {
                setFormData({
                    name: campaign.name,
                    description: campaign.description || "",
                    startDate: campaign.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : "",
                    endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : "",
                    status: campaign.status,
                    selectedJobs: campaign.jobs?.map((j: any) => j.id) || []
                });
            }
        } catch (error) {
            console.error("Failed to fetch campaign data:", error);
            alert("Could not load campaign information.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleJob = (jobId: string) => {
        setFormData(prev => ({
            ...prev,
            selectedJobs: prev.selectedJobs.includes(jobId)
                ? prev.selectedJobs.filter(id => id !== jobId)
                : [...prev.selectedJobs, jobId]
        }));
    };

    const handleEditJob = (e: React.MouseEvent, job: any) => {
        e.stopPropagation(); // Prevent toggling the job selection
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
            setIsSaving(true);
            const updateData = {
                name: formData.name,
                description: formData.description,
                startDate: formData.startDate,
                endDate: formData.endDate,
                status: formData.status as any,
                jobIds: formData.selectedJobs
            };

            await campaignService.update(id, updateData);
            router.push(`/employer/jobs/campaigns/${id}`);
        } catch (error) {
            console.error("Campaign Update Error:", error);
            alert("Could not update campaign. Please check your data.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <Loader2 className="animate-spin" size={48} color="#5C9AFF" />
            </div>
        );
    }

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '14px 18px',
        backgroundColor: 'white',
        border: '1.5px solid #e2e8f0',
        borderRadius: '14px',
        fontSize: '14px',
        fontWeight: 600,
        color: '#0f172a',
        outline: 'none'
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '12px',
        fontWeight: 800,
        color: '#64748b',
        textTransform: 'uppercase',
        marginBottom: '10px'
    };

    return (
        <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', padding: '48px 64px', fontFamily: '"Times New Roman", Times, serif' }}>
            <div style={{ marginBottom: '48px' }}>
                <button onClick={() => router.back()} style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#64748b',
                    backgroundColor: 'white',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontWeight: 700
                }}>
                    <ArrowLeft size={16} /> Back
                </button>
                <div style={{ marginTop: '24px' }}>
                    <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#0f172a', margin: 0 }}>Edit Recruitment Campaign</h1>
                    <p style={{ color: '#64748B', fontSize: '16px', marginTop: '12px' }}>Update timeline and job positions for the current campaign.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '32px', maxWidth: '1200px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {/* Basic Info Section */}
                    <div style={{ backgroundColor: 'white', borderRadius: '32px', padding: '40px', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                            <div style={{ width: '48px', height: '48px', backgroundColor: '#eff6ff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5C9AFF' }}>
                                <Info size={24} />
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Basic Information</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                            <div>
                                <label style={labelStyle}>Campaign Name <span style={{ color: '#ef4444' }}>*</span></label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Description & Goals</label>
                                <textarea
                                    rows={5}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    style={{ ...inputStyle, resize: 'none' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Jobs Selection Section */}
                    <div style={{ backgroundColor: 'white', borderRadius: '32px', padding: '40px', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '48px', height: '48px', backgroundColor: '#f0fdf4', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                                    <Briefcase size={24} />
                                </div>
                                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Job List</h3>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ position: 'relative', width: '220px' }}>
                                    <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                                    <input
                                        type="text"
                                        placeholder="Search positions..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        style={{ ...inputStyle, paddingLeft: '40px', borderRadius: '12px' }}
                                    />
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => setIsJobModalOpen(true)}
                                    style={{ 
                                        padding: '12px 16px', 
                                        backgroundColor: '#eff6ff', 
                                        color: '#5C9AFF', 
                                        border: '1px solid #dbeafe', 
                                        borderRadius: '12px', 
                                        fontSize: '13px', 
                                        fontWeight: 800, 
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <Plus size={16} /> Create New Job
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                            {filteredJobs.map(job => (
                                <div
                                    key={job.id}
                                    onClick={() => handleToggleJob(job.id)}
                                    style={{
                                        padding: '24px',
                                        backgroundColor: formData.selectedJobs.includes(job.id) ? '#eff6ff' : 'white',
                                        border: `2px solid ${formData.selectedJobs.includes(job.id) ? '#5C9AFF' : '#f1f5f9'}`,
                                        borderRadius: '24px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                        <div style={{ width: '40px', height: '40px', backgroundColor: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #f1f5f9' }}>
                                            <Target size={18} color={formData.selectedJobs.includes(job.id) ? '#5C9AFF' : '#cbd5e1'} />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {(!job.applications || job.applications.length === 0) && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleEditJob(e, job)}
                                                    style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', backgroundColor: '#f8fafc', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                                                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#eff6ff', e.currentTarget.style.color = '#5C9AFF')}
                                                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#f8fafc', e.currentTarget.style.color = '#64748b')}
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                            )}
                                            <div style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                border: `2px solid ${formData.selectedJobs.includes(job.id) ? '#5C9AFF' : '#e2e8f0'}`,
                                                backgroundColor: formData.selectedJobs.includes(job.id) ? '#5C9AFF' : 'transparent',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                {formData.selectedJobs.includes(job.id) && <CheckCircle2 size={12} color="white" />}
                                            </div>
                                        </div>
                                    </div>
                                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>{job.title}</h4>
                                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>{job.workLocation} • {job.type}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '28px', padding: '32px', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                            <Calendar size={20} color="#5C9AFF" />
                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Timeline</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={labelStyle}>Start Date</label>
                                <input type="date" required value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>End Date</label>
                                <input type="date" required value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} style={inputStyle} />
                            </div>
                        </div>
                    </div>

                    <div style={{ backgroundColor: 'white', borderRadius: '28px', padding: '32px', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                            <Settings size={20} color="#5C9AFF" />
                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Status</h3>
                        </div>
                        <select style={inputStyle} value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                            <option value="ACTIVE">Active</option>
                            <option value="UPCOMING">Upcoming</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="ARCHIVED">Archived</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={isSaving}
                        style={{
                            padding: '18px',
                            backgroundColor: '#5C9AFF',
                            color: 'white',
                            border: 'none',
                            borderRadius: '18px',
                            fontSize: '15px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px'
                        }}
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={18} />}
                        Save Changes
                    </button>
                </div>
            </form>

            <style jsx>{`
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
            <JobCreateModal 
                isOpen={isJobModalOpen}
                onClose={handleCloseModal}
                campaignId={id as string}
                jobToEdit={editingJob}
                onSuccess={(job) => {
                    // Refresh jobs list and select the new job
                    fetchInitialData();
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
