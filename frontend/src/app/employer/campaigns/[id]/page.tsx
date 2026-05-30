"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    ChevronLeft,
    Plus,
    Briefcase,
    Users,
    Target,
    TrendingUp,
    MoreVertical,
    Clock,
    MapPin,
    ArrowUpRight
} from "lucide-react";
import { campaignService, Campaign } from "@/services/campaign.service";

export default function CampaignDetailPage() {
    const { id } = useParams();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) fetchDetail();
    }, [id]);

    const fetchDetail = async () => {
        try {
            setIsLoading(true);
            const data = await campaignService.getById(id as string);
            setCampaign(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div style={{ padding: '100px', textAlign: 'center' }}>Loading Campaign Assets...</div>;
    if (!campaign) return <div>Campaign not found</div>;

    return (
        <div style={{ padding: '40px', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <Link href="/employer/campaigns" style={{ textDecoration: 'none' }}>
                    <div style={{ width: '40px', height: '40px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ChevronLeft size={20} color="#64748b" />
                    </div>
                </Link>
                <div>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>CAMPAIGN ARCHITECTURE / {campaign.status}</div>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: '4px 0 0' }}>{campaign.name}</h1>
                </div>
            </div>

            {/* Campaign Summary Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '48px' }}>
                <div style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '24px', color: 'white' }}>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', margin: 0 }}>ACTIVE ROLES</p>
                    <h2 style={{ fontSize: '32px', fontWeight: 800, margin: '8px 0' }}>{campaign.jobs?.length || 0}</h2>
                    <p style={{ fontSize: '12px', color: '#5C9AFF', fontWeight: 700 }}>Positions live in pipeline</p>
                </div>
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', margin: 0 }}>TOTAL APPLICANTS</p>
                    <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: '8px 0' }}>85</h2>
                    <p style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700 }}>+12 since last week</p>
                </div>
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', margin: 0 }}>AI AVG MATCH</p>
                    <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: '8px 0' }}>76%</h2>
                    <p style={{ fontSize: '12px', color: '#7c3aed', fontWeight: 700 }}>High-quality talent pool</p>
                </div>
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', margin: 0 }}>TIME TO HIRE</p>
                    <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: '8px 0' }}>14d</h2>
                    <p style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>Optimized by My Job AI</p>
                </div>
            </div>

            {/* Jobs in this Campaign */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Associated Positions</h3>
                <Link href={`/employer/jobs/create?campaignId=${campaign.id}`}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#5C9AFF', color: 'white', borderRadius: '12px', border: 'none', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
                        <Plus size={18} /> Add Position to Campaign
                    </button>
                </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                {campaign.jobs && campaign.jobs.length > 0 ? campaign.jobs.map((job) => (
                    <div key={job.id} style={{ backgroundColor: 'white', padding: '24px 32px', borderRadius: '24px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                            <div style={{ width: '56px', height: '56px', backgroundColor: '#eff6ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Briefcase size={28} color="#5C9AFF" />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>{job.title}</h4>
                                <div style={{ display: 'flex', gap: '16px', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> Remote</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> Full-time</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#5C9AFF' }}><Users size={14} /> 12 Candidates</div>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ textAlign: 'right', paddingRight: '24px', borderRight: '1px solid #f1f5f9' }}>
                                <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', margin: 0 }}>AI BEST MATCH</p>
                                <p style={{ fontSize: '16px', fontWeight: 800, color: '#16a34a', margin: 0 }}>92%</p>
                            </div>
                            <Link href={`/employer/campaigns/details/${job.id}`}>
                                <button style={{ padding: '12px 20px', backgroundColor: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    Manage Pipeline <ArrowUpRight size={16} />
                                </button>
                            </Link>
                        </div>
                    </div>
                )) : (
                    <div style={{ padding: '60px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '24px', border: '1px dashed #e2e8f0' }}>
                        <p style={{ color: '#94a3b8', fontWeight: 600 }}>No positions added to this campaign yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
