"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { jobFavoriteService, FavoriteCategory } from "@/services/jobFavorite.service";
import {
    MapPin,
    DollarSign,
    Heart,
    ChevronRight,
    Building2,
    Loader2,
    Layers,
    Calendar,
    Briefcase,
    ArrowUpRight
} from "lucide-react";
import { FavoriteButton } from "@/components/shared/FavoriteButton";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

export default function FavoriteJobsPage() {
    const [allJobs, setAllJobs] = useState<any[]>([]);
    const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
    const [categories, setCategories] = useState<FavoriteCategory[]>([]);
    const [activeCategoryId, setActiveCategoryId] = useState<string>("all");
    const [isLoading, setIsLoading] = useState(true);
    const searchParams = useSearchParams();
    const highlightId = searchParams.get("highlightId");
    const jobRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!isLoading && highlightId && jobRefs.current[highlightId]) {
            setTimeout(() => {
                jobRefs.current[highlightId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }
    }, [isLoading, highlightId]);

    useEffect(() => {
        if (activeCategoryId === "all") {
            setFilteredJobs(allJobs);
        } else if (activeCategoryId === "default") {
            setFilteredJobs(allJobs.filter(job => !job.favoriteCategory));
        } else {
            setFilteredJobs(allJobs.filter(job => job.favoriteCategory?.id === activeCategoryId));
        }
    }, [activeCategoryId, allJobs]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [jobsData, categoriesData] = await Promise.all([
                jobFavoriteService.getFavorites(),
                jobFavoriteService.getCategories()
            ]);
            setAllJobs(jobsData || []);
            setCategories(categoriesData || []);
        } catch (error) {
            console.error("Failed to fetch favorite data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFavoriteToggle = (jobId: string, isFavorite: boolean) => {
        if (!isFavorite) {
            setAllJobs(prev => prev.filter(job => job.id !== jobId));
        }
    };

    return (
        <div style={{ padding: '24px 40px 60px', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <motion.h1 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            style={{ fontSize: '48px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}
                        >
                            Favorite Jobs
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            style={{ fontSize: '15px', color: '#64748b', marginTop: '4px', fontWeight: 500 }}
                        >
                            Track and manage your most important career opportunities.
                        </motion.p>
                    </div>
                    {!isLoading && (
                        <div style={{ backgroundColor: '#ffffff', padding: '12px 24px', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                            <span style={{ fontSize: '24px', fontWeight: 900, color: '#5C9AFF' }}>{allJobs.length}</span>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', marginLeft: '8px', textTransform: 'uppercase' }}>SAVED POSITIONS</span>
                        </div>
                    )}
                </header>

                {/* Categories Navigation */}
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ 
                        display: 'flex', 
                        gap: '8px', 
                        padding: '6px', 
                        backgroundColor: '#ffffff', 
                        borderRadius: '18px', 
                        width: 'fit-content',
                        border: '1px solid #f1f5f9',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                    }}>
                        {[
                            { id: "all", name: "All", count: allJobs.length },
                            ...(allJobs.some(j => !j.favoriteCategory) ? [{ id: "default", name: "Default", count: allJobs.filter(j => !j.favoriteCategory).length }] : []),
                            ...categories.map(cat => ({ id: cat.id, name: cat.name, count: allJobs.filter(j => j.favoriteCategory?.id === cat.id).length }))
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveCategoryId(tab.id)}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    backgroundColor: activeCategoryId === tab.id ? '#5C9AFF' : 'transparent',
                                    color: activeCategoryId === tab.id ? 'white' : '#64748b',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                {tab.name}
                                <span style={{ 
                                    fontSize: '11px', 
                                    padding: '2px 8px', 
                                    borderRadius: '6px', 
                                    backgroundColor: activeCategoryId === tab.id ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                                    color: activeCategoryId === tab.id ? 'white' : '#94a3b8'
                                }}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <div style={{ padding: '120px 0', textAlign: 'center' }}>
                        <div style={{ position: 'relative', width: '60px', height: '60px', margin: '0 auto' }}>
                            <Loader2 size={60} className="animate-spin" color="#5C9AFF" strokeWidth={1.5} />
                        </div>
                        <p style={{ marginTop: '24px', color: '#64748b', fontWeight: 600, fontSize: '14px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Intelligence is loading...</p>
                    </div>
                ) : allJobs.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ padding: '100px 40px', textAlign: 'center', backgroundColor: 'white', borderRadius: '32px', border: '1px solid #f1f5f9' }}
                    >
                        <div style={{ width: '80px', height: '80px', backgroundColor: '#f8fafc', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
                            <Heart size={40} color="#cbd5e1" strokeWidth={1.5} />
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>No Favorite Jobs Yet</h3>
                        <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '40px', maxWidth: '400px', margin: '0 auto 40px', lineHeight: 1.6 }}>Start exploring and saving positions that match your career goals.</p>
                        <Link href="/candidate/jobs">
                            <button style={{ padding: '16px 40px', backgroundColor: '#5C9AFF', color: 'white', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 20px 40px -10px rgba(92, 154, 255, 0.3)' }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                Explore Jobs
                            </button>
                        </Link>
                    </motion.div>
                ) : filteredJobs.length === 0 ? (
                    <div style={{ padding: '80px 40px', textAlign: 'center', backgroundColor: 'white', borderRadius: '32px', border: '1px solid #f1f5f9' }}>
                        <Layers size={40} color="#cbd5e1" style={{ margin: '0 auto' }} />
                        <p style={{ marginTop: '20px', color: '#64748b', fontWeight: 600 }}>No jobs found in this category.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <AnimatePresence>
                            {filteredJobs.map((job, index) => (
                                <motion.div 
                                    key={job.id} 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    ref={el => jobRefs.current[job.id] = el}
                                    style={{ 
                                        backgroundColor: 'white', 
                                        padding: '32px', 
                                        borderRadius: '28px', 
                                        border: job.id === highlightId ? '2px solid #0f172a' : '1px solid #f1f5f9', 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center', 
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                                        boxShadow: job.id === highlightId ? '0 20px 40px -10px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.02)',
                                        opacity: job.status === 'CLOSED' ? 0.7 : 1,
                                        position: 'relative',
                                        cursor: 'default'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (job.id !== highlightId) {
                                            e.currentTarget.style.borderColor = '#e2e8f0';
                                            e.currentTarget.style.transform = 'translateY(-4px)';
                                            e.currentTarget.style.boxShadow = '0 12px 24px -8px rgba(0,0,0,0.05)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (job.id !== highlightId) {
                                            e.currentTarget.style.borderColor = '#f1f5f9';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
                                        }
                                    }}
                                >
                                    <div style={{ flex: 1, display: 'flex', gap: '28px', alignItems: 'center' }}>
                                        {/* Company Logo Section */}
                                        <div style={{ 
                                            width: '64px', 
                                            height: '64px', 
                                            backgroundColor: '#F8FAFC', 
                                            borderRadius: '18px', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            border: '1px solid #F1F5F9',
                                            flexShrink: 0
                                        }}>
                                            {job.company?.logo ? (
                                                <img src={job.company.logo} alt={job.company.name} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                                            ) : (
                                                <Building2 size={28} color="#94A3B8" strokeWidth={1.5} />
                                            )}
                                        </div>

                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>{job.title}</h3>
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                    {job.type && (
                                                        <span style={{ fontSize: '10px', fontWeight: 900, color: '#475569', backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '4px' }}>{job.type.toUpperCase()}</span>
                                                    )}
                                                    {job.level?.name && (
                                                        <span style={{ fontSize: '10px', fontWeight: 900, color: '#7c3aed', backgroundColor: '#f5f3ff', padding: '4px 10px', borderRadius: '4px' }}>{job.level.name.toUpperCase()}</span>
                                                    )}
                                                    {job.status === 'CLOSED' ? (
                                                        <span style={{ backgroundColor: '#FEF2F2', color: '#EF4444', padding: '4px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em' }}>CLOSED</span>
                                                    ) : (
                                                        <span style={{ fontSize: '10px', fontWeight: 900, color: '#059669', backgroundColor: '#ecfdf5', padding: '4px 10px', borderRadius: '4px' }}>ACTIVE</span>
                                                    )}
                                                </div>
                                            </div>
 
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#64748b', fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span style={{ color: '#0f172a' }}>{job.company?.name}</span>
                                                    {job.favoriteCategory && (
                                                        <span style={{ fontSize: '10px', color: '#5C9AFF', fontWeight: 700, marginLeft: '8px', padding: '2px 8px', backgroundColor: '#EFF6FF', borderRadius: '6px' }}>📁 {job.favoriteCategory.name}</span>
                                                    )}
                                                </div>
                                            </div>
 
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                                                    <MapPin size={14} color="#94A3B8" />
                                                    {job.workLocation}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#16A34A', fontWeight: 700 }}>
                                                    <DollarSign size={14} />
                                                    {(job.minSalary && job.maxSalary) ? `$${job.minSalary / 1000}k - $${job.maxSalary / 1000}k` : "Competitive"}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>
                                                    <Calendar size={14} />
                                                    Saved {formatDistanceToNow(new Date(job.savedAt), { addSuffix: true, locale: enUS })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '32px' }}>
                                        <div style={{ width: '1px', height: '40px', backgroundColor: '#F1F5F9' }}></div>
                                        <FavoriteButton 
                                            jobId={job.id} 
                                            initialIsFavorite={true} 
                                            onToggle={(isFavorite) => handleFavoriteToggle(job.id, isFavorite)} 
                                        />
                                        <Link href={`/candidate/jobs/${job.id}`} style={{ textDecoration: 'none' }}>
                                            <button style={{ 
                                                padding: '12px 24px', 
                                                backgroundColor: job.status === 'CLOSED' ? '#F1F5F9' : '#5C9AFF', 
                                                color: job.status === 'CLOSED' ? '#94A3B8' : 'white', 
                                                border: 'none', 
                                                borderRadius: '14px', 
                                                fontSize: '13px', 
                                                fontWeight: 800, 
                                                cursor: job.status === 'CLOSED' ? 'not-allowed' : 'pointer',
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '8px',
                                                transition: 'all 0.2s',
                                                boxShadow: job.status === 'CLOSED' ? 'none' : '0 10px 15px -3px rgba(92, 154, 255, 0.2)'
                                            }}
                                            onMouseEnter={(e) => job.status !== 'CLOSED' && (e.currentTarget.style.backgroundColor = '#4A8BFF')}
                                            onMouseLeave={(e) => job.status !== 'CLOSED' && (e.currentTarget.style.backgroundColor = '#5C9AFF')}
                                            >
                                                Details <ArrowUpRight size={16} />
                                            </button>
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
