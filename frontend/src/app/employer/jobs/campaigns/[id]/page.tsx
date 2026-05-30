"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    Plus,
    Search,
    Filter,
    Target,
    ArrowRight,
    Edit2,
    X,
    History,
    Calendar,
    Briefcase,
    ChevronLeft,
    Info
} from "lucide-react";
import { campaignService, Campaign } from "@/services/campaign.service";
import { jobService } from "@/services/job.service";
import { ConfirmModal } from "@/components/shared/ConfirmModal";

export default function CampaignDetailPage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDateModalOpen, setIsDateModalOpen] = useState(false);
    const [newEndDate, setNewEndDate] = useState("");
    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        type: 'danger' | 'info' | 'success';
    }>({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => {},
        type: 'info'
    });

    useEffect(() => {
        if (id) {
            fetchCampaignDetail();
        }
    }, [id]);

    const fetchCampaignDetail = async () => {
        try {
            setIsLoading(true);
            const data = await campaignService.getById(id);
            setCampaign(data);
        } catch (error) {
            console.error("Failed to fetch campaign detail:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseCampaign = async () => {
        setConfirmConfig({
            isOpen: true,
            title: "Close Recruitment Campaign",
            message: "Are you sure you want to close this recruitment campaign? All job postings in this campaign will be moved to CLOSED status.",
            type: 'danger',
            onConfirm: async () => {
                try {
                    await campaignService.update(id, { status: 'COMPLETED' });
                    setCampaign(prev => prev ? { ...prev, status: 'COMPLETED' } : null);
                    fetchCampaignDetail();
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                } catch (error) {
                    console.error("Failed to close campaign:", error);
                    alert("Could not close recruitment campaign.");
                }
            }
        });
    };

    const handleOpenCampaign = async () => {
        if (!campaign) return;
        const now = new Date();
        const end = new Date(campaign.endDate);

        if (end < now) {
            setNewEndDate(""); 
            setIsDateModalOpen(true);
        } else {
            setConfirmConfig({
                isOpen: true,
                title: "Reopen Recruitment Campaign",
                message: "Are you sure you want to reopen this recruitment campaign? Jobs in this campaign will also be reactivated.",
                type: 'info',
                onConfirm: async () => {
                    try {
                        const today = new Date().toISOString().split('T')[0];
                        await campaignService.update(id, { 
                            status: 'ACTIVE',
                            startDate: today
                        });
                        setCampaign(prev => prev ? { ...prev, status: 'ACTIVE', startDate: today } : null);
                        fetchCampaignDetail();
                        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                    } catch (error) {
                        console.error("Failed to open campaign:", error);
                        alert("Could not reopen recruitment campaign.");
                    }
                }
            });
        }
    };

    const handleUpdateDateAndOpen = async () => {
        if (!newEndDate) return;
        try {
            await campaignService.update(id, { 
                endDate: new Date(newEndDate).toISOString(),
                status: 'ACTIVE' 
            });
            setConfirmConfig(prev => ({ ...prev, isOpen: false }));
            // Refresh to see job status changes
            fetchCampaignDetail();
        } catch (error) {
            console.error("Failed to update campaign date:", error);
            alert("Could not update campaign deadline.");
        }
    };

    const handleCloseJob = async (jobId: string) => {
        setConfirmConfig({
            isOpen: true,
            title: "Close Job Posting",
            message: "Are you sure you want to close this job posting? Candidates will no longer be able to see this post.",
            type: 'danger',
            onConfirm: async () => {
                try {
                    await jobService.update(jobId, { status: 'CLOSED' });
                    fetchCampaignDetail();
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                } catch (error) {
                    console.error("Failed to close job:", error);
                    alert("Could not close job posting.");
                }
            }
        });
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
                <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#5C9AFF', borderRadius: '50%' }}></div>
            </div>
        );
    }

    if (!campaign) return <div>Campaign not found</div>;

    const jobs = campaign.jobs || [];
    const closedJobsCount = jobs.filter(j => j.status === 'CLOSED' || j.status === 'FILLED').length;
    const totalJobsCount = jobs.length;
    const progressPercent = totalJobsCount > 0 ? (closedJobsCount / totalJobsCount) * 100 : 0;

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PUBLISHED':
            case 'HIRING':
            case 'ACTIVE':
                return { bg: '#F0FDF4', text: '#166534', label: 'HIRING' };
            case 'CLOSED':
            case 'FILLED':
                return { bg: '#EFF6FF', text: '#1E40AF', label: 'FILLED' };
            case 'PAUSED':
                return { bg: '#FFF7ED', text: '#9A3412', label: 'PAUSED' };
            default:
                return { bg: '#F1F5F9', text: '#475569', label: status };
        }
    };

    return (
        <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', padding: '32px 48px', fontFamily: 'Inter, sans-serif' }}>
            {/* Top Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', fontSize: '14px', color: '#64748B' }}>
                <Link href="/employer/jobs/campaigns" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ChevronLeft size={16} /> Campaigns
                </Link>
                <span>›</span>
                <span style={{ color: '#0F172A', fontWeight: 600 }}>{campaign.name}</span>
            </div>

            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                        <span style={{ padding: '4px 12px', backgroundColor: campaign.status === 'ACTIVE' ? '#DCFCE7' : '#F1F5F9', color: campaign.status === 'ACTIVE' ? '#166534' : '#475569', borderRadius: '6px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>
                            {campaign.status}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '14px' }}>
                            <Calendar size={16} />
                            <span>
                                {new Date(campaign.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(campaign.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                    <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#0F172A', margin: 0 }}>{campaign.name}</h1>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginTop: '24px' }}>
                        <div>
                            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>{closedJobsCount}/{totalJobsCount}</div>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginTop: '4px' }}>JOBS CLOSED</div>
                        </div>
                        <div style={{ width: '200px', height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px' }}>
                            <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: '#5C9AFF', borderRadius: '4px', transition: 'width 0.5s ease-out' }}></div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    {campaign.status === 'ACTIVE' ? (
                        <button
                            onClick={handleCloseCampaign}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '12px', color: '#EF4444', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                            <X size={18} /> Close Campaign
                        </button>
                    ) : (
                        <button
                            onClick={handleOpenCampaign}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#F0FDF4', border: '1px solid #DCFCE7', borderRadius: '12px', color: '#166534', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                            <Plus size={18} /> Reopen Campaign
                        </button>
                    )}
                    <button
                        onClick={() => router.push(`/employer/jobs/campaigns/${campaign.id}/edit`)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#F1F5F9', border: 'none', borderRadius: '12px', color: '#475569', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                        <Edit2 size={18} /> Edit Campaign
                    </button>
                    <button
                        onClick={() => {
                            if (campaign.status !== 'ACTIVE') {
                                alert("Cannot create job in this campaign. Please create in an open campaign or start a new one.");
                                return;
                            }
                            router.push(`/employer/jobs/create?campaignId=${campaign.id}`);
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#5C9AFF', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}
                    >
                        <Plus size={20} /> Add New Job
                    </button>
                </div>
            </div>

            {/* Campaign Description Section */}
            {campaign.description && (
                <div style={{
                    backgroundColor: 'white',
                    padding: '32px',
                    borderRadius: '24px',
                    border: '1px solid #F1F5F9',
                    marginBottom: '40px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Info size={16} /> Campaign Description
                    </h3>
                    <p style={{
                        fontSize: '15px',
                        lineHeight: 1.8,
                        color: '#475569',
                        margin: 0,
                        whiteSpace: 'pre-wrap'
                    }}>
                        {campaign.description}
                    </p>
                </div>
            )}

            {/* Filter Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                        <Filter size={16} /> Filter by: <span style={{ color: '#0F172A' }}>All Status</span>
                    </div>
                </div>
                <div style={{ position: 'relative', width: '320px' }}>
                    <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Search jobs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px 12px 48px', backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', fontSize: '14px', outline: 'none' }}
                    />
                </div>
            </div>

            {/* Jobs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(440px, 1fr))', gap: '24px' }}>
                {filteredJobs.length > 0 ? filteredJobs.map((job) => {
                    const statusInfo = getStatusStyle(job.status);

                    return (
                        <div key={job.id} style={{ backgroundColor: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'transform 0.2s' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3
                                        onClick={() => router.push(`/employer/jobs/${job.id}`)}
                                        className="job-title-link"
                                        style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px', cursor: 'pointer' }}>
                                        {job.title}
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748B', fontWeight: 600 }}>
                                            <Target size={14} /> {job.level?.name || "System Grade"}
                                        </div>
                                        <div style={{ width: '4px', height: '4px', backgroundColor: '#CBD5E1', borderRadius: '50%' }}></div>
                                        <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>{job.position?.name || "Role"}</div>
                                    </div>
                                </div>
                                <span style={{ padding: '4px 10px', backgroundColor: statusInfo.bg, color: statusInfo.text, borderRadius: '6px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.05em' }}>
                                    {statusInfo.label}
                                </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div style={{ backgroundColor: '#F8FAFC', padding: '20px', borderRadius: '16px', border: '1px solid #F1F5F9' }}>
                                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>APPLIED</div>
                                    <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A' }}>{job.stats?.appliedCount || 0}</div>
                                </div>
                                <div style={{ backgroundColor: statusInfo.label === 'HIRING' ? '#EFF6FF' : '#F8FAFC', padding: '20px', borderRadius: '16px', border: '1px solid #F1F5F9' }}>
                                    <div style={{ fontSize: '10px', fontWeight: 800, color: statusInfo.label === 'HIRING' ? '#5C9AFF' : '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>INTERVIEWING</div>
                                    <div style={{ fontSize: '32px', fontWeight: 800, color: statusInfo.label === 'HIRING' ? '#5C9AFF' : '#0F172A' }}>{job.stats?.interviewingCount || 0}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #F8FAFC' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    {[1, 2].map(i => (
                                        <div key={i} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid white', backgroundColor: '#E2E8F0', marginLeft: i === 1 ? 0 : '-10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 800 }}>AI</div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: '20px' }}>
                                    {job.status !== 'CLOSED' && (
                                        <button
                                            onClick={() => handleCloseJob(job.id)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'transparent', border: 'none', color: '#64748B', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
                                            <X size={16} /> Close Job
                                        </button>
                                    )}
                                    <button
                                        onClick={() => router.push(`/employer/jobs/${job.id}`)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'transparent', border: 'none', color: '#5C9AFF', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
                                        {job.status === 'CLOSED' ? <><History size={16} /> View History</> : <><ArrowRight size={16} /> View Pipeline</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                }) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px', backgroundColor: 'white', borderRadius: '24px', border: '1px dashed #E2E8F0' }}>
                        <Briefcase size={48} color="#CBD5E1" style={{ marginBottom: '16px' }} />
                        <h4 style={{ color: '#1E293B', margin: '0 0 8px' }}>No jobs found</h4>
                        <p style={{ color: '#64748B', fontSize: '14px' }}>Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            <ConfirmModal 
                isOpen={confirmConfig.isOpen || isDateModalOpen}
                title={isDateModalOpen ? "Extend Recruitment Campaign" : confirmConfig.title}
                message={isDateModalOpen ? "This campaign has expired. Please select a new end date to reopen it. Jobs in the campaign will also be reactivated." : confirmConfig.message}
                type={isDateModalOpen ? 'info' : confirmConfig.type}
                onConfirm={isDateModalOpen ? handleUpdateDateAndOpen : confirmConfig.onConfirm}
                onCancel={() => {
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                    setIsDateModalOpen(false);
                }}
                confirmText={isDateModalOpen ? "Extend & Reopen" : "Confirm"}
                cancelText="Back"
                showDateInput={isDateModalOpen}
                dateValue={newEndDate}
                onDateChange={(date) => setNewEndDate(date)}
                minDate={new Date().toISOString().split('T')[0]}
            />

            <style jsx>{`
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .job-title-link:hover {
                    color: #5C9AFF !important;
                    text-decoration: underline;
                }
            `}</style>
        </div>
    );
}
