"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
    Search,
    Plus,
    Calendar,
    Loader2,
    MoreVertical,
    Target,
    Clock,
    CheckCircle2,
    AlertCircle,
    Archive
} from "lucide-react";
import { campaignService, Campaign } from "@/services/campaign.service";
import { ConfirmModal } from "@/components/shared/ConfirmModal";

export default function RecruitmentCampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [pendingCampaignId, setPendingCampaignId] = useState<string | null>(null);
    const [isDateModalOpen, setIsDateModalOpen] = useState(false);
    const [dateCampaign, setDateCampaign] = useState<Campaign | null>(null);
    const [newEndDate, setNewEndDate] = useState("");

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            setIsLoading(true);
            const data = await campaignService.getAll();
            setCampaigns(data || []);
        } catch (error) {
            console.error("Failed to fetch campaigns:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredCampaigns = campaigns.filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCloseCampaign = async (id: string) => {
        setPendingCampaignId(id);
        setIsConfirmModalOpen(true);
    };

    const confirmCloseCampaign = async () => {
        if (!pendingCampaignId) return;
        try {
            await campaignService.update(pendingCampaignId, { status: 'COMPLETED' });
            setCampaigns(prev => prev.map(c => c.id === pendingCampaignId ? { ...c, status: 'COMPLETED' } : c));
            setIsConfirmModalOpen(false);
            setPendingCampaignId(null);
        } catch (error) {
            console.error("Failed to close campaign:", error);
            alert("Could not close recruitment campaign.");
        }
    };

    const handleOpenCampaign = async (campaign: Campaign) => {
        const now = new Date();
        const end = new Date(campaign.endDate);

        if (end < now) {
            setDateCampaign(campaign);
            setNewEndDate(""); // Default to empty or some future date
            setIsDateModalOpen(true);
        } else {
            try {
                // When manually opening a campaign, we update the startDate to today 
                // so the backend recognizes it as ACTIVE immediately.
                const today = new Date().toISOString().split('T')[0];
                await campaignService.update(campaign.id, { 
                    status: 'ACTIVE',
                    startDate: today
                });
                setCampaigns(prev => prev.map(c => c.id === campaign.id ? { ...c, status: 'ACTIVE', startDate: today } : c));
            } catch (error) {
                console.error("Failed to open campaign:", error);
                alert("Could not reopen recruitment campaign.");
            }
        }
    };

    const handleUpdateDateAndOpen = async () => {
        if (!dateCampaign || !newEndDate) return;
        try {
            await campaignService.update(dateCampaign.id, { 
                endDate: new Date(newEndDate).toISOString(),
                status: 'ACTIVE' 
            });
            setCampaigns(prev => prev.map(c => c.id === dateCampaign.id ? { ...c, status: 'ACTIVE', endDate: new Date(newEndDate).toISOString() } : c));
            setIsDateModalOpen(false);
            setDateCampaign(null);
        } catch (error) {
            console.error("Failed to update campaign date:", error);
            alert("Could not update campaign deadline.");
        }
    };

    return (
        <div style={{ padding: '40px', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Manage Recruitment Campaigns</h1>
                    <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Organize and track centralized recruitment campaigns.</p>
                </div>
                <Link href="/employer/jobs/campaigns/new" style={{ textDecoration: 'none' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#5C9AFF', color: 'white', borderRadius: '12px', border: 'none', fontSize: '14px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' }}>
                        <Plus size={20} /> Create New Campaign
                    </button>
                </Link>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                <div style={{ padding: '24px 32px', borderBottom: '1px solid #f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                        <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                        <input
                            type="text"
                            placeholder="Search by campaign name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '12px 16px 12px 48px', backgroundColor: '#f8fafc', border: 'none', borderRadius: '12px', fontSize: '14px', outline: 'none' }}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div style={{ padding: '100px 0', textAlign: 'center' }}>
                        <Loader2 className="animate-spin" style={{ margin: '0 auto' }} color="#5C9AFF" />
                    </div>
                ) : filteredCampaigns.length > 0 ? (
                    <div style={{ padding: '24px 32px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {filteredCampaigns.map((campaign) => (
                                <div key={campaign.id} style={{ 
                                    backgroundColor: 'white', 
                                    border: '1px solid #f1f5f9', 
                                    borderRadius: '20px', 
                                    padding: '20px 24px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '24px', 
                                    transition: 'all 0.2s',
                                    position: 'relative'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#5C9AFF';
                                    e.currentTarget.style.backgroundColor = '#fbfdff';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#f1f5f9';
                                    e.currentTarget.style.backgroundColor = 'white';
                                }}
                                >
                                    <div style={{ width: '48px', height: '48px', backgroundColor: '#eff6ff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Target size={24} color="#5C9AFF" />
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{campaign.name}</h3>
                                            <span style={{
                                                fontSize: '10px',
                                                fontWeight: 800,
                                                padding: '2px 8px',
                                                borderRadius: '6px',
                                                backgroundColor: 
                                                    new Date(campaign.endDate) < new Date() ? '#fff7ed' : 
                                                    campaign.status === 'ACTIVE' ? '#f0fdf4' : 
                                                    campaign.status === 'UPCOMING' ? '#eef2ff' : '#f8fafc',
                                                color: 
                                                    new Date(campaign.endDate) < new Date() ? '#ea580c' : 
                                                    campaign.status === 'ACTIVE' ? '#16a34a' : 
                                                    campaign.status === 'UPCOMING' ? '#4f46e5' : '#64748b',
                                                textTransform: 'uppercase'
                                            }}>
                                                {new Date(campaign.endDate) < new Date() ? 'EXPIRED' : (campaign.status === 'UPCOMING' ? 'UPCOMING' : (campaign.status === 'ACTIVE' ? 'ACTIVE' : campaign.status))}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineClamp: 1, WebkitLineClamp: 1, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {campaign.description || "No description for this campaign."}
                                        </p>
                                    </div>

                                    <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', fontWeight: 600, minWidth: '180px' }}>
                                            <Calendar size={16} color="#94a3b8" />
                                            <span>{new Date(campaign.startDate).toLocaleDateString('en-US')} - {new Date(campaign.endDate).toLocaleDateString('en-US')}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', fontWeight: 600, minWidth: '100px' }}>
                                            <Archive size={16} color="#94a3b8" />
                                            <span>{campaign.jobs?.length || 0} Positions</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <Link href={`/employer/jobs/campaigns/${campaign.id}`} style={{ textDecoration: 'none' }}>
                                            <button style={{ padding: '10px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', color: '#475569', transition: 'all 0.2s' }}>Details</button>
                                        </Link>
                                        {(() => {
                                            const isExpired = new Date(campaign.endDate) < new Date();
                                            if (isExpired) {
                                                return (
                                                    <button
                                                        onClick={() => handleOpenCampaign(campaign)}
                                                        style={{ padding: '10px 20px', backgroundColor: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', color: '#ea580c' }}>
                                                        Extend
                                                    </button>
                                                );
                                            }
                                            if (campaign.status === 'ACTIVE') {
                                                return (
                                                    <button
                                                        onClick={() => handleCloseCampaign(campaign.id)}
                                                        style={{ padding: '10px 20px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', color: '#ef4444' }}>
                                                        Close
                                                    </button>
                                                );
                                            }
                                            return (
                                                <button
                                                    onClick={() => handleOpenCampaign(campaign)}
                                                    style={{ padding: '10px 20px', backgroundColor: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', color: '#16a34a' }}>
                                                    Open Campaign
                                                </button>
                                            );
                                        })()}
                                        <button style={{ width: '42px', height: '42px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8' }}>
                                            <MoreVertical size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div style={{ padding: '80px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '120px', height: '120px', backgroundColor: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                            <Archive size={48} color="#cbd5e1" />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: '0 0 8px' }}>No campaigns found</h3>
                        <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '320px', lineHeight: 1.6, margin: '0 0 32px' }}>
                            Campaigns help you group multiple job postings into a single phase for easy management.
                        </p>
                        <Link href="/employer/jobs/campaigns/new" style={{ textDecoration: 'none' }}>
                            <button style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 28px', backgroundColor: '#5C9AFF', color: 'white', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: 800, cursor: 'pointer' }}>
                                <Plus size={18} /> Create first campaign
                            </button>
                        </Link>
                    </div>
                )}
            </div>

            <ConfirmModal 
                isOpen={isConfirmModalOpen || isDateModalOpen}
                title={isDateModalOpen ? "Extend Recruitment Campaign" : "Close Recruitment Campaign"}
                message={isDateModalOpen ? "This campaign has expired. Please select a new end date to reopen it." : "Are you sure you want to close this campaign? Job postings within this campaign will maintain their current status, but the campaign will be marked as completed."}
                onConfirm={isDateModalOpen ? handleUpdateDateAndOpen : confirmCloseCampaign}
                onCancel={() => {
                    setIsConfirmModalOpen(false);
                    setIsDateModalOpen(false);
                    setDateCampaign(null);
                }}
                type={isDateModalOpen ? 'info' : 'danger'}
                confirmText={isDateModalOpen ? "Extend & Open" : "Close Now"}
                cancelText="Go Back"
                showDateInput={isDateModalOpen}
                dateValue={newEndDate}
                onDateChange={(date) => setNewEndDate(date)}
                minDate={new Date().toISOString().split('T')[0]}
            />
        </div>
    );
}
