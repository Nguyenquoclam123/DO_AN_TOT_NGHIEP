"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
    Plus,
    Search,
    Calendar,
    ChevronRight,
    MoreHorizontal,
    Layers,
    Users,
    Clock,
    Loader2,
    Database
} from "lucide-react";
import { campaignService, Campaign } from "@/services/campaign.service";

export default function CampaignListPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            setIsLoading(true);
            const data = await campaignService.getAll();
            setCampaigns(data);
        } catch (error) {
            console.error("Failed to fetch campaigns:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ padding: '40px', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Campaign Management</h1>
                    <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>Launch and coordinate high-volume recruitment drives with strategic precision.</p>
                </div>
                <Link href="/employer/campaigns/create" style={{ textDecoration: 'none' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', backgroundColor: '#5C9AFF', color: 'white', borderRadius: '12px', border: 'none', fontSize: '14px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)' }}>
                        <Plus size={20} /> New Campaign
                    </button>
                </Link>
            </div>

            {isLoading ? (
                <div style={{ padding: '100px 0', textAlign: 'center' }}>
                    <Loader2 className="animate-spin" style={{ margin: '0 auto' }} color="#5C9AFF" size={40} />
                </div>
            ) : campaigns.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '32px' }}>
                    {campaigns.map((camp) => (
                        <div key={camp.id} style={{ backgroundColor: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', overflow: 'hidden', transition: 'all 0.2s', position: 'relative' }}>
                            <div style={{ padding: '32px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                    <div style={{ width: '48px', height: '48px', backgroundColor: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Layers size={24} color="#5C9AFF" />
                                    </div>
                                    <span style={{ fontSize: '10px', fontWeight: 900, color: '#166534', backgroundColor: '#f0fdf4', padding: '4px 12px', borderRadius: '6px' }}>{camp.status}</span>
                                </div>
                                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>{camp.name}</h3>
                                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, marginBottom: '32px', height: '45px', overflow: 'hidden' }}>{camp.description || "No description provided for this campaign."}</p>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                                    <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '16px' }}>
                                        <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px', margin: 0 }}>JOBS</p>
                                        <p style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{camp.jobs?.length || 0}</p>
                                    </div>
                                    <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '16px' }}>
                                        <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px', margin: 0 }}>APPLICANTS</p>
                                        <p style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{camp.jobs?.reduce((acc, j) => acc + (j.applicationsCount || 0), 0) || 0}</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '24px', borderTop: '1px solid #f8fafc' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
                                        <Calendar size={14} />
                                        <span style={{ fontSize: '12px', fontWeight: 600 }}>Dec 2024 - Jan 2025</span>
                                    </div>
                                    <Link href={`/employer/campaigns/${camp.id}`} style={{ textDecoration: 'none' }}>
                                        <button style={{ backgroundColor: '#5C9AFF', border: 'none', color: '#5C9AFF', fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                                            View Details <ChevronRight size={16} />
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ padding: '100px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '120px', height: '120px', backgroundColor: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
                        <Layers size={56} color="#cbd5e1" />
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', marginBottom: '12px' }}>No Recruitment Campaigns</h2>
                    <p style={{ fontSize: '16px', color: '#64748b', maxWidth: '400px', lineHeight: 1.6, marginBottom: '32px' }}>
                        You haven't launched any large-scale campaigns yet. Campaigns group multiple roles together for easier management.
                    </p>
                    <Link href="/employer/campaigns/create">
                        <button style={{ padding: '14px 32px', backgroundColor: '#5C9AFF', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 800, cursor: 'pointer' }}>
                            Create your first Campaign
                        </button>
                    </Link>
                </div>
            )}
        </div>
    );
}

