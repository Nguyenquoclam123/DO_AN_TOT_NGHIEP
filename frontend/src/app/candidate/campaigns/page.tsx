"use client";

import React, { useState, useEffect } from 'react';
import { 
    Flag, 
    Search, 
    Calendar, 
    ArrowRight, 
    Users, 
    Building2,
    Loader2,
    Briefcase,
    ChevronRight,
    Clock
} from 'lucide-react';
import { campaignService, Campaign } from '@/services/campaign.service';
import Link from 'next/link';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

export default function CandidateCampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            const data = await campaignService.getAll();
            setCampaigns(data || []);
        } catch (error) {
            console.error("Failed to fetch campaigns:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCampaigns = campaigns.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.company?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc' }}>
                <Loader2 className="animate-spin" size={48} color="#5C9AFF" />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px 40px 60px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            {/* Header Section */}
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '48px', fontWeight: 900, color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.03em' }}>Active Recruitment Campaigns</h1>
                    <p style={{ color: '#64748b', fontSize: '16px', maxWidth: '600px', fontWeight: 500 }}>
                        Explore large-scale hiring programs from top-tier companies.
                    </p>
                </div>
                
                {/* Search Bar */}
                <div style={{ position: 'relative', width: '400px' }}>
                    <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by campaign name or company..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ 
                            width: '100%', 
                            padding: '14px 16px 14px 48px', 
                            borderRadius: '14px', 
                            border: '1px solid #e2e8f0', 
                            fontSize: '14px',
                            outline: 'none',
                            backgroundColor: 'white',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                            transition: 'all 0.2s'
                        }} 
                    />
                </div>
            </div>

            {/* Campaign List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1100px' }}>
                {filteredCampaigns.map((campaign) => (
                    <Link key={campaign.id} href={`/candidate/campaigns/${campaign.id}`} style={{ textDecoration: 'none' }}>
                        <div style={{ 
                            backgroundColor: 'white', 
                            borderRadius: '24px', 
                            padding: '24px 32px', 
                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                            border: '1px solid #f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '32px',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: 'pointer'
                        }} onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateX(12px)';
                            e.currentTarget.style.borderColor = '#5C9AFF';
                            e.currentTarget.style.boxShadow = '0 12px 20px -8px rgba(92, 154, 255, 0.15)';
                        }} onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateX(0)';
                            e.currentTarget.style.borderColor = '#f1f5f9';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
                        }}>
                            {/* Company Logo */}
                            <div style={{ width: '72px', height: '72px', backgroundColor: 'white', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #f1f5f9', overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                {campaign.company?.logo ? (
                                    <img src={campaign.company.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                ) : (
                                    <Building2 size={32} color="#cbd5e1" />
                                )}
                            </div>

                            {/* Campaign Info */}
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#5C9AFF' }}>{campaign.company?.name}</span>
                                    <div style={{ width: '4px', height: '4px', backgroundColor: '#e2e8f0', borderRadius: '50%' }}></div>
                                    <span style={{ 
                                        padding: '4px 10px', 
                                        backgroundColor: '#F0FDF4', 
                                        color: '#22c55e', 
                                        borderRadius: '8px', 
                                        fontSize: '11px', 
                                        fontWeight: 800,
                                        textTransform: 'uppercase'
                                    }}>
                                        Active
                                    </span>
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>{campaign.name}</h3>
                                <p style={{ color: '#64748b', fontSize: '14px', margin: 0, lineClamp: 1, WebkitLineClamp: 1, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: '600px' }}>
                                    {campaign.description || 'Explore various career opportunities waiting for you.'}
                                </p>
                            </div>

                            {/* Stats & CTA */}
                            <div style={{ display: 'flex', gap: '48px', alignItems: 'center', borderLeft: '1px solid #f1f5f9', paddingLeft: '48px' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>{campaign.jobs?.length || 0}</div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Positions</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Calendar size={16} color="#64748b" /> {campaign.endDate ? format(new Date(campaign.endDate), 'dd/MM', { locale: enUS }) : '--'}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Expires</div>
                                </div>
                                <div style={{ 
                                    width: '44px', 
                                    height: '44px', 
                                    borderRadius: '14px', 
                                    backgroundColor: '#EFF6FF', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    color: '#5C9AFF',
                                    transition: 'all 0.2s'
                                }}>
                                    <ChevronRight size={24} />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {filteredCampaigns.length === 0 && (
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <div style={{ width: '80px', height: '80px', backgroundColor: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <Search size={40} color="#e2e8f0" />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#64748b' }}>No recruitment campaigns found</h3>
                    <p style={{ color: '#94a3b8', marginTop: '8px' }}>Try adjusting your search keywords.</p>
                </div>
            )}
        </div>
    );
}
