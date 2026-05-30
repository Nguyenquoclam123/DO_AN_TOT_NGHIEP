"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { jobService } from "@/services/job.service";
import { masterDataService } from "@/services/master-data.service";
import { jobFavoriteService } from "@/services/jobFavorite.service";
import { FavoriteButton } from "@/components/shared/FavoriteButton";
import {
    Search,
    Filter,
    MapPin,
    Briefcase,
    DollarSign,
    Clock,
    Heart,
    ChevronRight,
    Zap,
    Building2,
    Star,
    Loader2,
    CheckCircle2,
    ChevronDown,
    Map as MapIcon,
    List
} from "lucide-react";
import GlobalJobMap from "@/components/shared/GlobalJobMap";

export default function CandidateJobDiscoveryPage() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [locationFilter, setLocationFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [positions, setPositions] = useState<any[]>([]);
    const [levels, setLevels] = useState<any[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
    const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
    const [favoriteJobIds, setFavoriteJobIds] = useState<Set<string>>(new Set());
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);

            // Fetch jobs, positions and levels
            const [jobsData, positionsData, levelsData] = await Promise.all([
                jobService.getAll(),
                masterDataService.getPositions(),
                masterDataService.getLevels()
            ]);

            setJobs(jobsData || []);
            setPositions(positionsData || []);
            setLevels(levelsData || []);

            // Fetch favorites separately to prevent blocking
            try {
                const favoritesData = await jobFavoriteService.getFavorites();
                setFavoriteJobIds(new Set((favoritesData || []).map((f: any) => f.id)));
            } catch (favError) {
                console.error("Failed to fetch favorites, but continuing:", favError);
            }

        } catch (error) {
            console.error("Failed to fetch jobs or positions:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = !searchQuery ||
            job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.company?.name?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesLocation = !locationFilter ||
            job.workLocation?.toLowerCase().includes(locationFilter.toLowerCase());

        const matchesCategory = !categoryFilter ||
            job.positionId === categoryFilter ||
            job.categoryId === categoryFilter ||
            job.category?.name?.toLowerCase().includes(categoryFilter.toLowerCase()) ||
            job.title?.toLowerCase().includes(categoryFilter.toLowerCase());

        const matchesPosition = selectedPositions.length === 0 ||
            selectedPositions.includes(job.positionId);

        const matchesType = selectedTypes.length === 0 ||
            selectedTypes.includes(job.type || "Full-time");

        const matchesLevel = selectedLevels.length === 0 ||
            selectedLevels.includes(job.levelId);

        return matchesSearch && matchesLocation && matchesCategory && matchesPosition && matchesType && matchesLevel;
    });

    const toggleType = (type: string) => {
        setSelectedTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const toggleLevel = (levelId: string) => {
        setSelectedLevels(prev =>
            prev.includes(levelId) ? prev.filter(l => l !== levelId) : [...prev, levelId]
        );
    };

    const togglePosition = (posId: string) => {
        setSelectedPositions(prev =>
            prev.includes(posId) ? prev.filter(p => p !== posId) : [...prev, posId]
        );
    };

    const clearFilters = () => {
        setSelectedTypes([]);
        setSelectedLevels([]);
        setSelectedPositions([]);
        setSearchQuery("");
        setLocationFilter("");
        setCategoryFilter("");
    };

    return (
        <div style={{ padding: '0', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            {/* Discovery Header */}
            <div style={{ padding: '24px 40px 40px', backgroundColor: 'white', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>
                <h1 style={{ fontSize: '48px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>Find your next excellence</h1>
                <p style={{ fontSize: '16px', color: '#64748b', marginTop: '8px', fontWeight: 500 }}>Browse through high-intensity roles curated by our AI engine.</p>

                <div style={{ maxWidth: '800px', margin: '40px auto 0', display: 'flex', gap: '12px', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search by role or company..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '16px 16px 16px 48px', backgroundColor: 'transparent', border: 'none', fontSize: '15px', outline: 'none' }}
                        />
                    </div>
                    <div style={{ width: '1px', backgroundColor: '#e2e8f0', margin: '8px 0' }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px', color: '#64748b', position: 'relative', flex: 0.6 }}>
                        <MapPin size={20} />
                        <input
                            type="text"
                            placeholder="Location"
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                            style={{ width: '100%', backgroundColor: 'transparent', border: 'none', fontSize: '14px', fontWeight: 600, outline: 'none', color: '#64748b' }}
                        />
                    </div>
                    <div style={{ width: '1px', backgroundColor: '#e2e8f0', margin: '8px 0' }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px', color: '#64748b', position: 'relative', flex: 0.6 }}>
                        <Briefcase size={18} />
                        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                style={{
                                    width: '100%',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    outline: 'none',
                                    color: '#64748b',
                                    cursor: 'pointer',
                                    appearance: 'none',
                                    paddingRight: '24px'
                                }}
                            >
                                <option value="">Job Position</option>
                                {positions.map(pos => (
                                    <option key={pos.id} value={pos.id}>{pos.name}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} style={{ position: 'absolute', right: '0', pointerEvents: 'none' }} />
                        </div>
                    </div>
                    <button style={{ padding: '12px 32px', backgroundColor: '#5C9AFF', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(92, 154, 255, 0.2)' }}>Search</button>
                </div>
            </div>

            <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '280px 1fr', gap: '40px' }}>

                {/* Left: Filters */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Filters</h3>
                        {(selectedTypes.length > 0 || selectedLevels.length > 0 || selectedPositions.length > 0 || searchQuery || locationFilter || categoryFilter) && (
                            <button 
                                onClick={clearFilters}
                                style={{ background: 'none', border: 'none', color: '#5C9AFF', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                        <div style={{ marginBottom: '32px' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Briefcase size={16} color="#5C9AFF" /> Job Position
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
                                {positions.map(pos => (
                                    <div 
                                        key={pos.id} 
                                        onClick={() => togglePosition(pos.id)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 600, color: selectedPositions.includes(pos.id) ? '#5C9AFF' : '#64748b', cursor: 'pointer' }}
                                    >
                                        <div style={{ 
                                            width: '18px', 
                                            height: '18px', 
                                            borderRadius: '4px', 
                                            border: selectedPositions.includes(pos.id) ? 'none' : '2px solid #e2e8f0', 
                                            backgroundColor: selectedPositions.includes(pos.id) ? '#5C9AFF' : 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s'
                                        }}>
                                            {selectedPositions.includes(pos.id) && <div style={{ width: '8px', height: '8px', backgroundColor: 'white', borderRadius: '1px' }}></div>}
                                        </div> 
                                        {pos.name}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '32px' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Clock size={16} color="#5C9AFF" /> Employment Type
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {["Full-time", "Contract", "Freelance", "Internship"].map(type => (
                                    <div 
                                        key={type} 
                                        onClick={() => toggleType(type)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 600, color: selectedTypes.includes(type) ? '#5C9AFF' : '#64748b', cursor: 'pointer' }}
                                    >
                                        <div style={{ 
                                            width: '18px', 
                                            height: '18px', 
                                            borderRadius: '4px', 
                                            border: selectedTypes.includes(type) ? 'none' : '2px solid #e2e8f0', 
                                            backgroundColor: selectedTypes.includes(type) ? '#5C9AFF' : 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s'
                                        }}>
                                            {selectedTypes.includes(type) && <div style={{ width: '8px', height: '8px', backgroundColor: 'white', borderRadius: '1px' }}></div>}
                                        </div> 
                                        {type}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Zap size={16} color="#5C9AFF" /> Experience
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {levels.length > 0 ? (
                                    levels.map(level => (
                                        <div 
                                            key={level.id} 
                                            onClick={() => toggleLevel(level.id)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 600, color: selectedLevels.includes(level.id) ? '#5C9AFF' : '#64748b', cursor: 'pointer' }}
                                        >
                                            <div style={{ 
                                                width: '18px', 
                                                height: '18px', 
                                                borderRadius: '4px', 
                                                border: selectedLevels.includes(level.id) ? 'none' : '2px solid #e2e8f0', 
                                                backgroundColor: selectedLevels.includes(level.id) ? '#5C9AFF' : 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.2s'
                                            }}>
                                                {selectedLevels.includes(level.id) && <div style={{ width: '8px', height: '8px', backgroundColor: 'white', borderRadius: '1px' }}></div>}
                                            </div> 
                                            {level.name}
                                        </div>
                                    ))
                                ) : (
                                    ["Entry Level", "Mid Level", "Senior Level", "Executive"].map(exp => (
                                        <div key={exp} style={{ fontSize: '13px', color: '#94a3b8' }}>{exp}</div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Job List / Map */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* View Toggle */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <div style={{ backgroundColor: 'white', padding: '4px', borderRadius: '12px', border: '1px solid #f1f5f9', display: 'flex', gap: '4px' }}>
                            <button
                                onClick={() => setViewMode('list')}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: viewMode === 'list' ? '#eff6ff' : 'transparent',
                                    color: viewMode === 'list' ? '#5C9AFF' : '#64748b',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    transition: 'all 0.2s'
                                }}
                            >
                                <List size={16} /> List
                            </button>
                            <button
                                onClick={() => setViewMode('map')}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: viewMode === 'map' ? '#eff6ff' : 'transparent',
                                    color: viewMode === 'map' ? '#5C9AFF' : '#64748b',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    transition: 'all 0.2s'
                                }}
                            >
                                <MapIcon size={16} /> Map View
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div style={{ padding: '80px', textAlign: 'center' }}>
                            <Loader2 size={40} className="animate-spin" color="#5C9AFF" style={{ margin: '0 auto' }} />
                            <p style={{ marginTop: '16px', color: '#64748b', fontWeight: 600 }}>Curating excellence...</p>
                        </div>
                    ) : viewMode === 'map' ? (
                        <GlobalJobMap jobs={filteredJobs} height="700px" />
                    ) : filteredJobs.length === 0 ? (
                        <div style={{ padding: '80px', textAlign: 'center', backgroundColor: 'white', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                            <Building2 size={48} color="#cbd5e1" style={{ margin: '0 auto' }} />
                            <h3 style={{ marginTop: '20px', fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>No jobs match your search</h3>
                            <p style={{ color: '#64748b', fontSize: '14px' }}>Try adjusting your keywords or filters to find more opportunities.</p>
                        </div>
                    ) : filteredJobs.map(job => (
                        <div key={job.id} style={{
                            backgroundColor: 'white',
                            padding: '32px',
                            borderRadius: '24px',
                            border: '1px solid #f1f5f9',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'all 0.2s',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                        }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', backgroundColor: '#f8fafc', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Building2 size={24} color="#5C9AFF" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                                            {job.title} {job.campaigns && job.campaigns.length > 0
                                                ? `(${job.campaigns.map((c: any) => c.name).join(', ')})`
                                                : ''}
                                        </h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                                            <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, margin: 0 }}>{job.company?.name || "NexGen Enterprise"}</p>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                {job.type && (
                                                    <span style={{ fontSize: '10px', fontWeight: 900, color: '#475569', backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '4px' }}>{job.type.toUpperCase()}</span>
                                                )}
                                                {job.level?.name && (
                                                    <span style={{ fontSize: '10px', fontWeight: 900, color: '#7c3aed', backgroundColor: '#f5f3ff', padding: '4px 10px', borderRadius: '4px' }}>{job.level.name.toUpperCase()}</span>
                                                )}
                                                {job.status === 'CLOSED' ? (
                                                    <span style={{ fontSize: '10px', fontWeight: 900, color: '#dc2626', backgroundColor: '#fef2f2', padding: '4px 10px', borderRadius: '4px', border: '1px solid #ef444420' }}>CLOSED</span>
                                                ) : (
                                                    <span style={{ fontSize: '10px', fontWeight: 900, color: '#059669', backgroundColor: '#ecfdf5', padding: '4px 10px', borderRadius: '4px', border: '1px solid #10b98120' }}>ACTIVE</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '24px', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b' }}><MapPin size={14} /> {job.workLocation || "Remote / Hub"}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#059669', fontWeight: 700 }}>
                                        <DollarSign size={14} /> {(job.minSalary && job.maxSalary) ? `$${job.minSalary / 1000}k - $${job.maxSalary / 1000}k` : "Competitive"}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {job.skills?.length > 0 ? (
                                        job.skills.map((s: any) => (
                                            <span key={s.id} style={{ padding: '6px 12px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '8px', fontSize: '11px', fontWeight: 800 }}>{s.skillName || s.name}</span>
                                        ))
                                    ) : (
                                        <>
                                            <span style={{ padding: '6px 12px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '8px', fontSize: '11px', fontWeight: 800 }}>AI Optimized</span>
                                            <span style={{ padding: '6px 12px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '8px', fontSize: '11px', fontWeight: 800 }}>Scalable Systems</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '16px', marginLeft: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                                    {job.similarity !== undefined && job.similarity !== null && (
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#5C9AFF' }}>
                                                <Zap size={16} fill="#5C9AFF" />
                                                <span style={{ fontSize: '18px', fontWeight: 800 }}>{Math.round(job.similarity * 100)}%</span>
                                            </div>
                                            <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', margin: 0 }}>MATCH SCORE</p>
                                        </div>
                                    )}
                                    <FavoriteButton
                                        jobId={job.id}
                                        initialIsFavorite={favoriteJobIds.has(job.id)}
                                    />
                                </div>
                                <Link href={`/candidate/jobs/${job.id}`} style={{ textDecoration: 'none' }}>
                                    <button style={{ padding: '12px 28px', backgroundColor: '#5C9AFF', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        View Details <ChevronRight size={16} />
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
