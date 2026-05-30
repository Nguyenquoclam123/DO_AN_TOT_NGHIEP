"use client";

import React, { useState, useEffect } from 'react';
import { 
    Flag, 
    Calendar, 
    Briefcase, 
    MapPin, 
    DollarSign, 
    ArrowLeft,
    Building2,
    Loader2,
    ChevronRight,
    Clock
} from 'lucide-react';
import { campaignService, Campaign } from '@/services/campaign.service';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

export default function CandidateCampaignDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchCampaignDetail();
    }, [id]);

    const fetchCampaignDetail = async () => {
        try {
            setLoading(true);
            const data = await campaignService.getById(id as string);
            setCampaign(data);
        } catch (error) {
            console.error("Failed to fetch campaign detail:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc' }}>
                <Loader2 className="animate-spin" size={48} color="#5C9AFF" />
            </div>
        );
    }

    if (!campaign) {
        return (
            <div style={{ textAlign: 'center', padding: '100px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>Recruitment Campaign Not Found</h2>
                <button 
                    onClick={() => router.push('/candidate/campaigns')}
                    style={{ marginTop: '20px', padding: '12px 24px', backgroundColor: '#5C9AFF', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                >
                    Back to Campaigns
                </button>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {/* Back Button */}
                <button 
                    onClick={() => router.back()}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#64748b', fontWeight: 600, cursor: 'pointer', marginBottom: '32px' }}
                >
                    <ArrowLeft size={20} /> Back
                </button>

                {/* Hero Section */}
                <div style={{ backgroundColor: 'white', borderRadius: '32px', padding: '48px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', marginBottom: '40px' }}>
                    <div style={{ display: 'flex', gap: '32px', alignItems: 'center', marginBottom: '32px' }}>
                        <div style={{ width: '80px', height: '80px', backgroundColor: 'white', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                            {campaign.company?.logo ? <img src={campaign.company.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <Building2 size={32} color="#94a3b8" />}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '16px', fontWeight: 700, color: '#5C9AFF', marginBottom: '4px' }}>{campaign.company?.name}</div>
                            <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#0f172a', margin: 0 }}>{campaign.name}</h1>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ padding: '6px 12px', backgroundColor: '#F0FDF4', color: '#22c55e', borderRadius: '100px', fontSize: '12px', fontWeight: 800, marginBottom: '8px', display: 'inline-block' }}>ACTIVE</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#64748b', fontWeight: 600 }}>
                                <Clock size={16} /> Ends: {campaign.endDate ? format(new Date(campaign.endDate), 'dd MMM yyyy', { locale: enUS }) : 'N/A'}
                            </div>
                        </div>
                    </div>
                    
                    <div style={{ paddingTop: '32px', borderTop: '1px solid #f1f5f9' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>About this Campaign</h3>
                        <p style={{ color: '#64748b', fontSize: '16px', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                            {campaign.description || 'No detailed description available.'}
                        </p>
                    </div>
                </div>

                {/* Jobs List */}
                <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', marginBottom: '24px' }}>Active Openings ({campaign.jobs?.length || 0})</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {campaign.jobs?.map((job) => (
                        <Link key={job.id} href={`/candidate/jobs/${job.id}`} style={{ textDecoration: 'none' }}>
                            <div style={{ 
                                backgroundColor: 'white', 
                                borderRadius: '24px', 
                                padding: '24px 32px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                border: '1px solid #f1f5f9',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                transition: 'all 0.2s'
                            }} onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateX(8px)';
                                e.currentTarget.style.borderColor = '#5C9AFF';
                            }} onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateX(0)';
                                e.currentTarget.style.borderColor = '#f1f5f9';
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1 }}>
                                    <div style={{ width: '56px', height: '56px', backgroundColor: '#f8fafc', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5C9AFF' }}>
                                        <Briefcase size={28} />
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>{job.title}</h4>
                                        <div style={{ display: 'flex', gap: '20px', color: '#64748b', fontSize: '14px', fontWeight: 600 }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} /> {job.workLocation || 'National'}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><DollarSign size={16} /> {job.minSalary && job.maxSalary ? `$${job.minSalary / 1000}k - $${job.maxSalary / 1000}k` : 'Negotiable'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ 
                                            padding: '4px 10px', 
                                            backgroundColor: job.status === 'ACTIVE' ? '#F0FDF4' : '#FEF2F2', 
                                            color: job.status === 'ACTIVE' ? '#22c55e' : '#ef4444', 
                                            borderRadius: '8px', 
                                            fontSize: '11px', 
                                            fontWeight: 800,
                                            textTransform: 'uppercase',
                                            marginBottom: '6px',
                                            display: 'inline-block'
                                        }}>
                                            {job.status === 'ACTIVE' ? 'Hiring' : 'Closed'}
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: 700 }}>{job.level?.name || 'Professional'}</div>
                                    </div>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5C9AFF' }}>
                                        <ChevronRight size={20} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {(!campaign.jobs || campaign.jobs.length === 0) && (
                        <div style={{ padding: '64px', backgroundColor: 'white', borderRadius: '32px', textAlign: 'center', border: '2px dashed #e2e8f0' }}>
                            <p style={{ color: '#94a3b8', fontWeight: 600 }}>There are currently no positions posted for this campaign.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
