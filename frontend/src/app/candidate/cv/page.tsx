"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Upload,
    Plus,
    Edit3,
    Eye,
    Trash2,
    Star,
    ArrowRight,
    BookOpen,
    Loader2,
    FileText,
    Mail,
    MapPin,
    Phone,
    User,
    Briefcase,
    GraduationCap,
    Award,
    X,
    Download,
    Calendar,
    Target,
    Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cvService } from "@/services/cv.service";
import { useAuthStore } from "@/store/authStore";

const CVPreviewModal = ({ isOpen, onClose, cv }: { isOpen: boolean, onClose: () => void, cv: any }) => {
    if (!cv) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(12px)',
                    padding: '20px'
                }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        style={{
                            backgroundColor: 'white',
                            width: '100%',
                            maxWidth: '900px',
                            maxHeight: '90vh',
                            borderRadius: '32px',
                            overflowY: 'auto',
                            position: 'relative',
                            boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.3)',
                        }}>
                        
                        <div style={{ position: 'sticky', top: 0, right: 0, left: 0, padding: '20px 32px', backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Profile Preview</h3>
                            <button onClick={onClose} style={{ padding: '8px', borderRadius: '10px', border: 'none', backgroundColor: '#F1F5F9', cursor: 'pointer' }}>
                                <X size={20} color="#64748B" />
                            </button>
                        </div>

                        <div style={{ padding: '48px' }}>
                             {/* Content identical to employer view */}
                             <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                                {/* Summary Section */}
                                <div style={{ borderLeft: '4px solid #5C9AFF', paddingLeft: '24px', marginBottom: '20px' }}>
                                    <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '12px' }}>Professional Summary</h4>
                                    <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.7, margin: 0 }}>
                                        {cv.summary || "No professional summary provided."}
                                    </p>
                                </div>

                                {/* Experience Section */}
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', color: '#0F172A' }}>
                                        <div style={{ width: '32px', height: '32px', backgroundColor: '#F1F5F9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Briefcase size={16} />
                                        </div>
                                        <h4 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Work Experience</h4>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingLeft: '16px', position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: '31px', top: '10px', bottom: '10px', width: '2px', backgroundColor: '#F1F5F9' }} />
                                        {cv.experiences?.length > 0 ? cv.experiences.map((exp: any, i: number) => (
                                            <div key={i} style={{ position: 'relative', paddingLeft: '40px' }}>
                                                <div style={{ position: 'absolute', left: '-5px', top: '5px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'white', border: '3px solid #5C9AFF', zIndex: 1 }} />
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                    <h5 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>{exp.position}</h5>
                                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', backgroundColor: '#F8FAFC', padding: '4px 10px', borderRadius: '6px' }}>
                                                        {exp.startDate ? new Date(exp.startDate).getFullYear() : 'N/A'} — {exp.isCurrent ? 'Present' : (exp.endDate ? new Date(exp.endDate).getFullYear() : 'N/A')}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '14px', fontWeight: 700, color: '#5C9AFF', marginBottom: '8px' }}>{exp.companyName}</div>
                                                <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6, margin: 0 }}>{exp.description}</p>
                                            </div>
                                        )) : <p style={{ color: '#94A3B8', fontSize: '14px' }}>No experience data found.</p>}
                                    </div>
                                </div>

                                {/* Education Section */}
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', color: '#0F172A' }}>
                                        <div style={{ width: '32px', height: '32px', backgroundColor: '#F1F5F9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <GraduationCap size={18} />
                                        </div>
                                        <h4 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Education</h4>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        {cv.educations?.length > 0 ? cv.educations.map((edu: any, i: number) => (
                                            <div key={i} style={{ padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #F1F5F9' }}>
                                                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>{edu.degree} - {edu.major}</div>
                                                <div style={{ fontSize: '14px', fontWeight: 600, color: '#5C9AFF', marginBottom: '4px' }}>{edu.schoolName}</div>
                                                <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>Graduation: {edu.endDate ? new Date(edu.endDate).getFullYear() : 'N/A'}</div>
                                            </div>
                                        )) : <p style={{ color: '#94A3B8', fontSize: '14px' }}>No education data found.</p>}
                                    </div>
                                </div>

                                {/* Skills Section */}
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', color: '#0F172A' }}>
                                        <div style={{ width: '32px', height: '32px', backgroundColor: '#F1F5F9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Award size={18} />
                                        </div>
                                        <h4 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Technical Skills</h4>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                        {cv.skills?.length > 0 ? cv.skills.map((skill: any, i: number) => (
                                            <div key={i} style={{ padding: '8px 16px', backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '100px', fontSize: '13px', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '6px', height: '6px', backgroundColor: '#5C9AFF', borderRadius: '50%' }} />
                                                {skill.name} <span style={{ color: '#94A3B8', fontSize: '11px' }}>({skill.level})</span>
                                            </div>
                                        )) : <p style={{ color: '#94A3B8', fontSize: '14px' }}>No skills found.</p>}
                                    </div>
                                </div>

                                {/* Projects Section */}
                                {cv.projects?.length > 0 && (
                                    <div style={{ marginTop: '40px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', color: '#0F172A' }}>
                                            <div style={{ width: '32px', height: '32px', backgroundColor: '#F1F5F9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Layers size={18} />
                                            </div>
                                            <h4 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Featured Projects</h4>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                            {cv.projects.map((proj: any, i: number) => (
                                                <div key={i} style={{ padding: '24px', backgroundColor: 'white', borderRadius: '20px', border: '1px solid #F1F5F9' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                        <h5 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>{proj.name}</h5>
                                                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#5C9AFF', backgroundColor: '#EFF6FF', padding: '4px 12px', borderRadius: '100px' }}>{proj.role}</span>
                                                    </div>
                                                    <p style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, marginBottom: '12px' }}>Tech: {proj.techStack}</p>
                                                    {proj.url && <a href={proj.url} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: '#5C9AFF', textDecoration: 'none', fontWeight: 700 }}>View Project ↗</a>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Certifications Section */}
                                {cv.certifications?.length > 0 && (
                                    <div style={{ marginTop: '40px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', color: '#0F172A' }}>
                                            <div style={{ width: '32px', height: '32px', backgroundColor: '#F1F5F9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Award size={18} />
                                            </div>
                                            <h4 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Certifications</h4>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            {cv.certifications.map((cert: any, i: number) => (
                                                <div key={i} style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <Award size={20} color="#5C9AFF" />
                                                    <div>
                                                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>{cert.name}</div>
                                                        <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>{cert.organization}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default function CVManagerPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [cvs, setCvs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedCv, setSelectedCv] = useState<any>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchCvs();
    }, []);

    const fetchCvs = async () => {
        try {
            setIsLoading(true);
            const data = await cvService.getMyCVs();
            setCvs(data || []);
        } catch (error) {
            console.error("Failed to fetch CVs:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this CV?")) return;
        try {
            await cvService.delete(id);
            setCvs(cvs.filter(cv => cv.id !== id));
        } catch (error) {
            alert("Failed to delete CV.");
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const mockText = `This is the content of ${file.name}. Experience in Software Engineering and React...`;
            await cvService.uploadAndParse(file.name, mockText);
            alert("CV uploaded and parsed by AI successfully!");
            fetchCvs();
        } catch (error) {
            alert("Upload failed.");
        } finally {
            setIsUploading(false);
        }
    };

    const primaryCv = cvs.find(c => c.isPrimary);
    const otherCvs = cvs.filter(c => !c.isPrimary);

    return (
        <div style={{ padding: '0 0 80px 0', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            <CVPreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} cv={selectedCv} />
            
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
            />

            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>Professional Profile</h1>
                    <p style={{ fontSize: '14px', color: '#64748B', marginTop: '8px', margin: 0, fontWeight: 500 }}>Manage and optimize your CV versions for each career goal.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {/* Hiding PDF Upload Button as requested */}
                    {/* <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: 'white', color: '#475569', borderRadius: '16px', border: '1px solid #E2E8F0', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
                        {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />} Upload PDF
                    </button> */}
                    <button
                        onClick={() => router.push("/candidate/cv/builder")}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#5C9AFF', color: 'white', borderRadius: '16px', border: 'none', fontSize: '14px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.2)' }}>
                        <Plus size={18} /> Create Professional CV
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                    <Loader2 size={48} className="animate-spin" color="#5C9AFF" />
                </div>
            ) : (
                <>
                    {/* Primary CV - Prominent View */}
                    {primaryCv && (
                        <div style={{ marginBottom: '64px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                                <Star size={20} fill="#5C9AFF" color="#5C9AFF" />
                                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Your Primary Profile</h2>
                                <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>Used for default applications</span>
                            </div>
                            
                            <div style={{ 
                                backgroundColor: 'white', 
                                borderRadius: '32px', 
                                border: '1px solid #F1F5F9', 
                                padding: '40px', 
                                display: 'grid', 
                                gridTemplateColumns: '300px 1fr', 
                                gap: '48px',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
                            }}>
                                {/* Left: Profile Info */}
                                <div style={{ borderRight: '1px solid #F1F5F9', paddingRight: '48px' }}>
                                    <div style={{ width: '120px', height: '120px', borderRadius: '32px', overflow: 'hidden', marginBottom: '24px', border: '4px solid #F8FAFC' }}>
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'default'}`} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', marginBottom: '4px' }}>{user?.firstName} {user?.lastName}</h3>
                                    <p style={{ fontSize: '14px', color: '#5C9AFF', fontWeight: 700, marginBottom: '24px' }}>{primaryCv.cvTitle}</p>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#64748B' }}>
                                            <Mail size={16} /> {user?.email}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#64748B' }}>
                                            <MapPin size={16} /> Ho Chi Minh City, VN
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#64748B' }}>
                                            <Phone size={16} /> 09x xxx xxxx
                                        </div>
                                    </div>
                                        <button 
                                            onClick={() => router.push(`/candidate/cv/builder?id=${primaryCv.id}`)}
                                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: '#5C9AFF', color: 'white', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'background-color 0.2s' }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4A8BFF'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#5C9AFF'}
                                        >
                                            Edit Profile
                                        </button>
                                        <button 
                                            onClick={() => { setSelectedCv(primaryCv); setIsPreviewOpen(true); }}
                                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', backgroundColor: 'white', color: '#475569', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                                            View Full CV
                                        </button>
                                    </div>

                                    {/* Right: Short Preview */}
                                    <div>
                                    <div style={{ marginBottom: '32px' }}>
                                        <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Professional Summary</h4>
                                        <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.7 }}>{primaryCv.summary || "No summary provided."}</p>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                                        <div>
                                            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Latest Experience</h4>
                                            {primaryCv.experiences?.[0] ? (
                                                <div>
                                                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>{primaryCv.experiences[0].position}</div>
                                                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#5C9AFF', marginTop: '2px' }}>{primaryCv.experiences[0].companyName}</div>
                                                </div>
                                            ) : <p style={{ fontSize: '13px', color: '#CBD5E1' }}>No data</p>}
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Key Skills</h4>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                {primaryCv.skills?.slice(0, 4).map((s: any, i: number) => (
                                                    <span key={i} style={{ padding: '4px 12px', backgroundColor: '#F1F5F9', borderRadius: '100px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>{s.name}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Other CVs Section */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                            <FileText size={20} color="#64748B" />
                            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Other CV Versions</h2>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
                            {otherCvs.map((cv, index) => {
                                return (
                                    <div 
                                        key={cv.id} 
                                        style={{ 
                                            backgroundColor: 'white', 
                                            borderRadius: '24px', 
                                            border: '1px solid #E2E8F0', 
                                            padding: '28px', 
                                            transition: 'all 0.3s ease',
                                            position: 'relative',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                            cursor: 'default'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = '#0F172A';
                                            e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(0,0,0,0.08)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = '#E2E8F0';
                                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                            <div style={{ width: '48px', height: '48px', backgroundColor: '#F8FAFC', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E2E8F0' }}>
                                                <FileText size={24} color="#0F172A" />
                                            </div>
                                            <div style={{ display: 'flex', gap: '2px' }}>
                                                <button 
                                                    onClick={() => { setSelectedCv(cv); setIsPreviewOpen(true); }} 
                                                    style={{ padding: '8px', color: '#94A3B8', border: 'none', background: 'none', cursor: 'pointer', borderRadius: '8px', transition: 'all 0.2s' }}
                                                    onMouseEnter={(e) => e.currentTarget.style.color = '#0F172A'}
                                                    onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => router.push(`/candidate/cv/builder?id=${cv.id}`)} 
                                                    style={{ padding: '8px', color: '#94A3B8', border: 'none', background: 'none', cursor: 'pointer', borderRadius: '8px', transition: 'all 0.2s' }}
                                                    onMouseEnter={(e) => e.currentTarget.style.color = '#0F172A'}
                                                    onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(cv.id)} 
                                                    style={{ padding: '8px', color: '#94A3B8', border: 'none', background: 'none', cursor: 'pointer', borderRadius: '8px', transition: 'all 0.2s' }}
                                                    onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
                                                    onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div style={{ marginBottom: '16px' }}>
                                            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>{cv.cvTitle}</h3>
                                            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6, margin: 0, height: '40px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                {cv.summary || "No summary provided."}
                                            </p>
                                        </div>
                                        
                                        <div style={{ paddingTop: '16px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94A3B8', fontSize: '11px', fontWeight: 600 }}>
                                                <Calendar size={12} />
                                                {new Date(cv.updatedAt).toLocaleDateString('en-US')}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {/* Hiding "Thêm CV mới" dotted card (PDF based) as requested */}
                            {/* <div
                                onClick={() => fileInputRef.current?.click()}
                                style={{ borderRadius: '24px', border: '2px dashed #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', textAlign: 'center', backgroundColor: '#F8FAFC', cursor: 'pointer' }}>
                                <div style={{ width: '48px', height: '48px', backgroundColor: '#EFF6FF', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                                    <Plus size={24} color="#5C9AFF" />
                                </div>
                                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1E293B', margin: 0 }}>Add New CV</h3>
                            </div> */}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
