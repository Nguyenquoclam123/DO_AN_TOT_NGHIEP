"use client";

import React, { useState } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
import { useRouter, useSearchParams } from "next/navigation";
import {
    User,
    Briefcase,
    GraduationCap,
    Target,
    Award,
    Layers,
    Plus,
    X,
    Download,
    Save,
    ChevronRight,
    Image as ImageIcon,
    PlusCircle,
    Calendar,
    Clock,
    Globe,
    Eye,
    BrainCircuit,
    Check,
    Mail,
    MapPin,
    Phone,
    CheckCircle2,
    ArrowLeft,
    FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cvService } from "@/services/cv.service";
import { candidateService } from "@/services/candidate.service";

export default function CandidateCVBuilderPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const cvId = searchParams?.get('id');
    const copyId = searchParams?.get('copyId');
    const isCopy = !!copyId;
    const loadId = cvId || copyId;

    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(!!loadId);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<any>(null);
    const [history, setHistory] = useState<any>({ summaries: [], experiences: [], skills: [], projects: [], educations: [], certifications: [] });
    const [showHistory, setShowHistory] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [previewTab, setPreviewTab] = useState<'profile' | 'pdf'>('profile');
    const [showPdfPanel, setShowPdfPanel] = useState(false);
    const [activeSection, setActiveSection] = useState('section-identity');
    const [completionRate, setCompletionRate] = useState(0);

    // Form State
    const [formData, setFormData] = useState({
        fullName: "",
        cvTitle: "Untitled CV",
        summary: "",
        avatar: "",
        email: "",
        phone: "",
        address: "",
        experiences: [],
        educations: [],
        skills: [],
        projects: [],
        certifications: [],
        fileUrl: ""
    });

    React.useEffect(() => {
        if (formData.fileUrl) {
            setShowPdfPanel(true);
        }
    }, [formData.fileUrl]);

    React.useEffect(() => {
        if (isPreviewOpen) {
            setPreviewTab('profile');
        }
    }, [isPreviewOpen, formData.fileUrl]);

    // Calculate Completion Rate
    React.useEffect(() => {
        let filledFields = 0;
        const fields = ['fullName', 'cvTitle', 'summary', 'email', 'phone', 'address', 'avatar'];
        fields.forEach(f => { if (formData[f]) filledFields++; });
        if (formData.experiences.length > 0) filledFields++;
        if (formData.educations.length > 0) filledFields++;
        if (formData.skills.length > 0) filledFields++;
        if (formData.projects.length > 0) filledFields++;
        if (formData.certifications.length > 0) filledFields++;
        setCompletionRate(Math.round((filledFields / (fields.length + 5)) * 100));
    }, [formData]);

    // Scroll Spy Logic
    React.useEffect(() => {
        const handleScroll = () => {
            const sections = ['section-identity', 'section-experience', 'section-education', 'section-skills', 'section-projects', 'section-certifications'];
            const container = document.querySelector('.builder-scroll-container');
            if (!container) return;
            
            let current = 'section-identity';
            for (const id of sections) {
                const el = document.getElementById(id);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    if (rect.top <= 150) current = id;
                }
            }
            setActiveSection(current);
        };

        const scrollContainer = document.querySelector('.builder-scroll-container');
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll);
            return () => scrollContainer.removeEventListener('scroll', handleScroll);
        }
    }, []);

    const applyOptimizationToData = (currentData: any, analysis: any, jobTitle: string) => {
        let next = { ...currentData };
        
        // 1. Apply ONLY summary/profile suggestions
        analysis.suggestions?.forEach((sug: any) => {
            const section = sug.section?.toLowerCase();
            if (section === 'summary' || section === 'profile' || section === 'professional summary') {
                next.summary = sug.improved;
            }
            // Other sections (experience, skills, etc.) are left as original
        });

        // 2. Update CV Title to indicate optimization
        if (jobTitle) {
            next.cvTitle = `${next.cvTitle.replace(/ \(Optimized for .*\)/, '')} (Optimized for ${jobTitle})`;
        }

        return next;
    };

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                // 1. Get user profile as fallback
                const profileData = await candidateService.getMe();
                
                // 2. Initialize base data with profile info
                let baseData: any = {
                    fullName: profileData?.fullName || "",
                    cvTitle: "Untitled CV",
                    summary: "",
                    email: profileData?.email || "",
                    phone: profileData?.phone || "",
                    address: profileData?.address || "",
                    avatar: profileData?.avatar || "",
                    experiences: [],
                    educations: [],
                    skills: [],
                    projects: [],
                    certifications: []
                };

                // 3. Load CV data if editing or copying
                if (loadId) {
                    try {
                        const existingCv = await cvService.getById(loadId);
                        if (existingCv) {
                            const loadedCvData = {
                                fullName: existingCv.fullName || baseData.fullName,
                                cvTitle: isCopy ? `${existingCv.cvTitle} (Copy)` : existingCv.cvTitle,
                                summary: existingCv.summary || "",
                                email: existingCv.email || baseData.email,
                                phone: existingCv.phone || baseData.phone,
                                address: existingCv.address || baseData.address,
                                avatar: existingCv.avatar || baseData.avatar,
                                experiences: existingCv.experiences?.map((exp: any) => ({
                                    companyName: exp.companyName,
                                    position: exp.position,
                                    startDate: exp.startDate ? exp.startDate.split('T')[0] : "",
                                    endDate: exp.endDate ? exp.endDate.split('T')[0] : "",
                                    isPresent: exp.isCurrent || !!exp.isPresent,
                                    description: exp.description || ""
                                })) || [],
                                educations: existingCv.educations?.map((edu: any) => ({
                                    schoolName: edu.schoolName,
                                    degree: edu.degree,
                                    major: edu.major,
                                    gradYear: edu.gradYear || (edu.endDate ? new Date(edu.endDate).getFullYear().toString() : "")
                                })) || [],
                                skills: existingCv.skills?.map((s: any) => ({
                                    skillName: s.skillName || s.name,
                                    level: s.level || "Expert"
                                })) || [],
                                projects: existingCv.projects?.map((p: any) => ({
                                    name: p.name,
                                    role: p.role,
                                    techStack: p.techStack,
                                    url: p.url
                                })) || [],
                                certifications: existingCv.certifications?.map((c: any) => ({
                                    name: c.name,
                                    organization: c.organization,
                                    issueDate: c.issueDate ? c.issueDate.split('T')[0] : "",
                                    expiryDate: c.expiryDate ? c.expiryDate.split('T')[0] : "",
                                    credentialId: c.credentialId || "",
                                    credentialUrl: c.credentialUrl || ""
                                })) || [],
                                fileUrl: existingCv.fileUrl || ""
                            };
                            baseData = { ...baseData, ...loadedCvData };
                        }
                    } catch (err) {
                        console.error("Error loading existing CV:", err);
                    }
                }

                // 4. Apply Optimization if requested
                const optimized = searchParams?.get('optimized');
                if (optimized === 'true') {
                    const optDataStr = localStorage.getItem('pending_cv_optimization');
                    if (optDataStr) {
                        try {
                            const optData = JSON.parse(optDataStr);
                            if (optData && optData.analysis) {
                                setAiAnalysis(optData.analysis);
                                baseData = applyOptimizationToData(baseData, optData.analysis, optData.jobTitle);
                                
                                setTimeout(() => {
                                    alert("✨ My Job AI has automatically applied optimization suggestions to your CV. You can open the preview to check the results!");
                                }, 800);
                            }
                        } catch (err) {
                            console.error("Error parsing optimization data:", err);
                        }
                    }
                }

                setFormData(prev => ({ ...prev, ...baseData }));
                fetchHistory();
            } catch (error) {
                console.error("Failed to fetch data for CV builder:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [loadId]);

    const fetchHistory = async () => {
        try {
            const data = await cvService.getHistory();
            setHistory(data);
        } catch (error) {
            console.error("Failed to fetch CV history");
        }
    };

    const handlePdfImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
            alert("Vui lòng tải lên tệp tin định dạng PDF.");
            return;
        }

        setIsParsing(true);
        try {
            const parsedData = await cvService.parsePdfOnly(file);
            
            setFormData(prev => ({
                ...prev,
                cvTitle: parsedData.cvTitle || prev.cvTitle,
                summary: parsedData.summary || "",
                fileUrl: parsedData.fileUrl || "",
                experiences: parsedData.experiences?.map((exp: any) => ({
                    companyName: exp.company_name || exp.companyName || "",
                    position: exp.position || "",
                    startDate: exp.start_date || exp.startDate || "",
                    endDate: exp.end_date || exp.endDate || "",
                    isPresent: exp.is_current || exp.isCurrent || false,
                    description: exp.description || ""
                })) || [],
                educations: parsedData.educations?.map((edu: any) => ({
                    schoolName: edu.school_name || edu.schoolName || "",
                    degree: edu.degree || "",
                    major: edu.major || "",
                    gradYear: edu.end_date ? new Date(edu.end_date).getFullYear().toString() : ""
                })) || [],
                skills: parsedData.skills?.map((s: any) => ({
                    skillName: s.skill_name || s.name || "",
                    level: s.level || "Expert"
                })) || [],
                projects: parsedData.projects?.map((p: any) => ({
                    name: p.name || "",
                    role: p.role || "",
                    techStack: p.tech_stack || p.techStack || "",
                    url: p.url || ""
                })) || [],
                certifications: parsedData.certifications?.map((c: any) => ({
                    name: c.name || "",
                    organization: c.organization || "",
                    issueDate: c.issue_date || c.issueDate || "",
                    expiryDate: c.expiry_date || c.expiryDate || "",
                    credentialId: c.credential_id || c.credentialId || "",
                    credentialUrl: c.credential_url || c.credentialUrl || ""
                })) || []
            }));

            alert("✨ Nhập dữ liệu từ PDF thành công! Dữ liệu đã được điền tự động vào biểu mẫu, vui lòng kiểm tra và hoàn tất chỉnh sửa.");
        } catch (error: any) {
            console.error("PDF import failed:", error);
            alert(error.message || "Không thể phân tích file PDF. Vui lòng thử lại.");
        } finally {
            setIsParsing(false);
            if (event.target) event.target.value = '';
        }
    };

    const [newSkill, setNewSkill] = useState({ skillName: "", level: "Expert" });

    const addSkill = (skill?: any) => {
        const skillToAdd = skill || newSkill;
        if (!skillToAdd.skillName?.trim()) return;
        setFormData(prev => ({
            ...prev,
            skills: [...prev.skills, { ...skillToAdd }]
        }));
        if (!skill) setNewSkill({ skillName: "", level: "Expert" });
    };

    const removeSkill = (index: number) => {
        console.log("Removing skill at index:", index);
        setFormData(prev => {
            const newSkills = [...prev.skills];
            newSkills.splice(index, 1);
            return { ...prev, skills: newSkills };
        });
    };

    const addExperience = () => {
        setFormData(prev => ({
            ...prev,
            experiences: [...prev.experiences, {
                companyName: "",
                position: "",
                startDate: "",
                endDate: "",
                isPresent: false,
                description: ""
            }]
        }));
    };

    const removeExperience = (index: number) => {
        setFormData(prev => {
            const newExps = [...prev.experiences];
            newExps.splice(index, 1);
            return { ...prev, experiences: newExps };
        });
    };

    const updateExperience = (index: number, field: string, value: any) => {
        setFormData(prev => {
            const newExps = [...prev.experiences];
            newExps[index] = { ...newExps[index], [field]: value };
            return { ...prev, experiences: newExps };
        });
    };

    const addEducation = () => {
        setFormData(prev => ({
            ...prev,
            educations: [...prev.educations, {
                schoolName: "",
                degree: "",
                major: "",
                gradYear: ""
            }]
        }));
    };

    const removeEducation = (index: number) => {
        setFormData(prev => {
            const newEdus = [...prev.educations];
            newEdus.splice(index, 1);
            return { ...prev, educations: newEdus };
        });
    };

    const updateEducation = (index: number, field: string, value: any) => {
        setFormData(prev => {
            const newEdus = [...prev.educations];
            newEdus[index] = { ...newEdus[index], [field]: value };
            return { ...prev, educations: newEdus };
        });
    };

    const addProject = () => {
        setFormData(prev => ({
            ...prev,
            projects: [...prev.projects, {
                name: "",
                role: "",
                techStack: "",
                url: ""
            }]
        }));
    };

    const removeProject = (index: number) => {
        setFormData(prev => {
            const newProjs = [...prev.projects];
            newProjs.splice(index, 1);
            return { ...prev, projects: newProjs };
        });
    };

    const updateProject = (index: number, field: string, value: any) => {
        setFormData(prev => {
            const newProjs = [...prev.projects];
            newProjs[index] = { ...newProjs[index], [field]: value };
            return { ...prev, projects: newProjs };
        });
    };

    const addCertification = () => {
        setFormData(prev => ({
            ...prev,
            certifications: [...prev.certifications, {
                name: "",
                organization: "",
                issueDate: "",
                expiryDate: "",
                credentialId: "",
                credentialUrl: ""
            }]
        }));
    };

    const removeCertification = (index: number) => {
        setFormData(prev => {
            const newCerts = [...prev.certifications];
            newCerts.splice(index, 1);
            return { ...prev, certifications: newCerts };
        });
    };

    const updateCertification = (index: number, field: string, value: any) => {
        setFormData(prev => {
            const newCerts = [...prev.certifications];
            newCerts[index] = { ...newCerts[index], [field]: value };
            return { ...prev, certifications: newCerts };
        });
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, avatar: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await cvService.saveBuilder({
                ...formData,
                id: isCopy ? undefined : cvId,
                experiences: formData.experiences.map(exp => ({
                    ...exp,
                }))
            });
            setShowSuccess(true);
            setTimeout(() => {
                router.push("/candidate/cv");
            }, 2500);
        } catch (error) {
            console.error("Failed to save CV:", error);
            alert("Failed to save CV. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div style={{ padding: '0', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            {isLoading && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(255,255,255,0.8)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #5C9AFF', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <p style={{ fontWeight: 800, color: '#0f172a' }}>Loading Intelligence...</p>
                    <style>{`
                        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    `}</style>
                </div>
            )}

            {isParsing && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                    <div style={{ width: '56px', height: '56px', border: '4px solid rgba(255, 255, 255, 0.1)', borderTop: '4px solid #5C9AFF', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <div style={{ textAlign: 'center', color: 'white' }}>
                        <p style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 8px' }}>AI đang phân tích CV của bạn</p>
                        <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>Quá trình bóc tách dữ liệu kinh nghiệm, học vấn và kỹ năng có thể mất một vài giây...</p>
                    </div>
                </div>
            )}

            {/* Refined Success Modal */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ 
                            position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', 
                            backdropFilter: 'blur(10px)', zIndex: 2000, 
                            display: 'flex', alignItems: 'center', justifyContent: 'center' 
                        }}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            style={{ 
                                backgroundColor: 'white', padding: '48px', borderRadius: '32px', 
                                textAlign: 'center', maxWidth: '400px', width: '90%',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)',
                                border: '1px solid #F1F5F9'
                            }}
                        >
                            <div style={{ width: '64px', height: '64px', backgroundColor: '#EFF6FF', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                <Check size={32} color="#5C9AFF" strokeWidth={3} />
                            </div>
                            
                            <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', marginBottom: '12px' }}>
                                CV Updated Successfully
                            </h2>
                            <p style={{ fontSize: '14px', color: '#64748b', fontWeight: 600, lineHeight: 1.6, margin: 0 }}>
                                Your professional profile has been synchronized with our database. Redirecting...
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Premium Preview Modal */}
            {isPreviewOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(12px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '40px', width: '100%', maxWidth: '950px', maxHeight: '95vh', overflowY: 'auto', position: 'relative', boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>

                        {/* Modal Header Controls */}
                        <div style={{ position: 'sticky', top: 0, right: 0, left: 0, padding: '24px 48px', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ height: '40px', width: '40px', backgroundColor: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Eye size={20} color="#5C9AFF" />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', margin: 0 }}>Review CV</h2>
                                    <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI-Powered Smart Preview</p>
                                </div>
                                {formData.fileUrl && (
                                    <div style={{ display: 'flex', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '10px', marginLeft: '24px' }}>
                                        <button 
                                            onClick={() => setPreviewTab('profile')}
                                            style={{ padding: '6px 14px', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', backgroundColor: previewTab === 'profile' ? 'white' : 'transparent', color: previewTab === 'profile' ? '#5C9AFF' : '#64748B', transition: 'all 0.2s' }}>
                                            CV Thiết kế
                                        </button>
                                        <button 
                                            onClick={() => setPreviewTab('pdf')}
                                            style={{ padding: '6px 14px', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', backgroundColor: previewTab === 'pdf' ? 'white' : 'transparent', color: previewTab === 'pdf' ? '#5C9AFF' : '#64748B', transition: 'all 0.2s' }}>
                                            Bản gốc PDF
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <button style={{ padding: '12px 24px', backgroundColor: '#5C9AFF', color: 'white', border: 'none', borderRadius: '14px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)' }}>
                                    <Download size={18} /> Export as PDF
                                </button>
                                <button onClick={() => setIsPreviewOpen(false)} style={{ padding: '12px', backgroundColor: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s' }}>
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* CV Paper Content */}
                        <div style={{ padding: '60px 80px' }}>
                            {previewTab === 'pdf' && formData.fileUrl ? (
                                <div style={{ width: '100%', height: '70vh', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                                    <iframe 
                                        src={`${BASE_URL}${formData.fileUrl}`} 
                                        width="100%" 
                                        height="100%" 
                                        style={{ border: 'none' }}
                                    />
                                </div>
                            ) : (
                                <>
                                    {/* Header Section */}
                                    <div style={{ marginBottom: '60px', position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <motion.h1 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            style={{ fontSize: '56px', fontWeight: 900, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.04em', lineHeight: 1 }}
                                        >
                                            {formData.fullName || "Your Full Name"}
                                        </motion.h1>
                                        <p style={{ fontSize: '20px', fontWeight: 700, color: '#5C9AFF', margin: '0 0 32px', letterSpacing: '0.02em' }}>{formData.cvTitle}</p>
                                        
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', color: '#475569', fontSize: '14px', fontWeight: 600 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={14} color="#64748b" /></div>
                                                {formData.email || "email@example.com"}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MapPin size={14} color="#64748b" /></div>
                                                {formData.address || "Location City"}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Phone size={14} color="#64748b" /></div>
                                                {formData.phone || "+123 456 789"}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {formData.avatar && (
                                        <motion.div 
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            style={{ width: '160px', height: '160px', borderRadius: '32px', overflow: 'hidden', border: '8px solid white', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', backgroundColor: '#f1f5f9' }}
                                        >
                                            <img src={formData.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </motion.div>
                                    )}
                                </div>
                                <div style={{ height: '4px', width: '100%', background: 'linear-gradient(to right, #5C9AFF, #eff6ff)', borderRadius: '2px', marginTop: '40px' }}></div>
                            </div>

                            {/* Summary / About */}
                            <div style={{ marginBottom: '56px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                    <div style={{ width: '32px', height: '32px', backgroundColor: '#0f172a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={16} color="white" /></div>
                                    <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', margin: 0, letterSpacing: '0.1em' }}>Professional Narrative</h3>
                                </div>
                                <p style={{ fontSize: '16px', color: '#334155', lineHeight: 1.8, textAlign: 'justify', backgroundColor: '#f8fafc', padding: '32px', borderRadius: '24px', borderLeft: '4px solid #5C9AFF' }}>
                                    {formData.summary || "Your professional summary will appear here. Highlight your key strengths and aspirations."}
                                </p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '64px' }}>
                                {/* Main Body: Experience & Projects */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}>
                                    
                                    {/* Work Experience Section */}
                                    <section>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', borderBottom: '2px solid #0f172a', paddingBottom: '12px' }}>
                                            <Briefcase size={20} color="#0f172a" />
                                            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', margin: 0, letterSpacing: '0.05em' }}>Career Trajectory</h3>
                                        </div>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                                            {formData.experiences.length > 0 ? formData.experiences.map((exp, i) => (
                                                <div key={i} style={{ position: 'relative', paddingLeft: '24px', borderLeft: '2px solid #e2e8f0' }}>
                                                    <div style={{ position: 'absolute', left: '-7px', top: '0', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#5C9AFF', border: '3px solid white', boxShadow: '0 0 0 2px #eff6ff' }}></div>
                                                    
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                                        <div>
                                                            <h4 style={{ fontSize: '19px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{exp.position}</h4>
                                                            <p style={{ fontSize: '15px', fontWeight: 700, color: '#5C9AFF', margin: '4px 0 0' }}>{exp.companyName}</p>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', backgroundColor: '#f1f5f9', padding: '6px 14px', borderRadius: '100px', display: 'inline-block' }}>
                                                                <Calendar size={12} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                                                                {exp.startDate} — {exp.isPresent ? 'Present' : exp.endDate}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>{exp.description}</p>
                                                </div>
                                            )) : (
                                                <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No work experience added yet.</p>
                                            )}
                                        </div>
                                    </section>

                                    {/* Projects Section */}
                                    <section>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', borderBottom: '2px solid #0f172a', paddingBottom: '12px' }}>
                                            <Layers size={20} color="#0f172a" />
                                            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', margin: 0, letterSpacing: '0.05em' }}>Significant Initiatives</h3>
                                        </div>
                                        
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                                            {formData.projects.length > 0 ? formData.projects.map((proj, i) => (
                                                <div key={i} style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                        <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{proj.name}</h4>
                                                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#5C9AFF', backgroundColor: '#eff6ff', padding: '4px 12px', borderRadius: '100px' }}>{proj.role}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                                        <BrainCircuit size={14} color="#64748b" />
                                                        <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, margin: 0 }}>{proj.techStack}</p>
                                                    </div>
                                                    {proj.url && (
                                                        <a href={proj.url} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: '#5C9AFF', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            View Case Study <ArrowLeft size={14} style={{ transform: 'rotate(135deg)' }} />
                                                        </a>
                                                    )}
                                                </div>
                                            )) : (
                                                <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No projects highlighted yet.</p>
                                            )}
                                        </div>
                                    </section>

                                    {/* Certifications Section */}
                                    <section>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', borderBottom: '2px solid #0f172a', paddingBottom: '12px' }}>
                                            <Award size={20} color="#0f172a" />
                                            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', margin: 0, letterSpacing: '0.05em' }}>Certifications & Honors</h3>
                                        </div>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                            {formData.certifications.length > 0 ? formData.certifications.map((cert, i) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div>
                                                        <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{cert.name}</h4>
                                                        <p style={{ fontSize: '14px', color: '#64748b', fontWeight: 600, margin: '4px 0 0' }}>{cert.organization}</p>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <p style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', margin: 0 }}>{cert.issueDate ? new Date(cert.issueDate).getFullYear() : ''}</p>
                                                        {cert.credentialId && <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 0' }}>ID: {cert.credentialId}</p>}
                                                    </div>
                                                </div>
                                            )) : (
                                                <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No certifications listed.</p>
                                            )}
                                        </div>
                                    </section>
                                </div>

                                {/* Sidebar Column: Skills & Education */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}>
                                    
                                    {/* Expertise Section */}
                                    <section style={{ backgroundColor: '#0f172a', padding: '32px', borderRadius: '32px', color: 'white', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                            <Target size={20} color="#5C9AFF" />
                                            <h3 style={{ fontSize: '16px', fontWeight: 900, textTransform: 'uppercase', margin: 0, letterSpacing: '0.05em' }}>Skill Matrix</h3>
                                        </div>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                            {formData.skills.length > 0 ? formData.skills.map((s, i) => (
                                                <div key={i}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>{s.skillName}</span>
                                                        <span style={{ fontSize: '11px', fontWeight: 900, color: '#5C9AFF' }}>{s.level}</span>
                                                    </div>
                                                    <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: s.level === 'Expert' ? '100%' : (s.level === 'Intermediate' ? '70%' : '40%') }}
                                                            transition={{ duration: 1, delay: 0.2 }}
                                                            style={{
                                                                height: '100%',
                                                                backgroundColor: '#5C9AFF',
                                                                boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)'
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )) : (
                                                <p style={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', fontSize: '13px' }}>Add skills to see your matrix.</p>
                                            )}
                                        </div>
                                    </section>

                                    {/* Education Section */}
                                    <section>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '2px solid #0f172a', paddingBottom: '12px' }}>
                                            <GraduationCap size={20} color="#0f172a" />
                                            <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', margin: 0, letterSpacing: '0.05em' }}>Academic Foundation</h3>
                                        </div>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                            {formData.educations.length > 0 ? formData.educations.map((edu, i) => (
                                                <div key={i}>
                                                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>{edu.degree}</h4>
                                                    <p style={{ fontSize: '14px', color: '#5C9AFF', fontWeight: 700, margin: '0 0 8px' }}>{edu.major}</p>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{edu.schoolName}</span>
                                                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>{edu.gradYear}</span>
                                                    </div>
                                                </div>
                                            )) : (
                                                <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '13px' }}>Education history not yet provided.</p>
                                            )}
                                        </div>
                                    </section>
                                </div>
                            </div>
                                </>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div style={{ padding: '40px 80px', backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#94a3b8' }}>
                                <CheckCircle2 size={16} />
                                <p style={{ fontSize: '12px', fontWeight: 600, margin: 0 }}>Smart Preview matches your current builder state. Export to finalize layout.</p>
                            </div>
                            <button 
                                onClick={() => setIsPreviewOpen(false)} 
                                style={{ padding: '16px 64px', backgroundColor: '#5C9AFF', color: 'white', border: 'none', borderRadius: '18px', fontSize: '15px', fontWeight: 800, cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 20px 40px -10px rgba(92, 154, 255, 0.4)' }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                Continue Editing
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Toolbar */}
            <div style={{ padding: '16px 40px', backgroundColor: 'white', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button 
                        onClick={() => router.push('/candidate/cv')}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '13px', fontWeight: 600, padding: '8px 0' }}
                    >
                        <ArrowLeft size={16} /> Back
                    </button>
                    <div style={{ height: '20px', width: '1px', backgroundColor: '#e2e8f0' }}></div>
                    <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>ResumePro</h1>
                    {/* Hiding Dashboard, Templates, Tips as requested */}
                    {/* <div style={{ display: 'flex', gap: '16px', fontSize: '13px', fontWeight: 600, color: '#64748b' }}>
                        <span style={{ cursor: 'pointer' }}>Dashboard</span>
                        <span style={{ color: '#5C9AFF', borderBottom: '2px solid #5C9AFF', cursor: 'pointer' }}>Templates</span>
                        <span style={{ cursor: 'pointer' }}>Tips</span>
                    </div> */}
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {formData.fileUrl && (
                        <button
                            type="button"
                            onClick={() => setShowPdfPanel(!showPdfPanel)}
                            style={{ 
                                padding: '10px 20px', 
                                backgroundColor: showPdfPanel ? '#eff6ff' : 'white', 
                                color: showPdfPanel ? '#5C9AFF' : '#64748b', 
                                borderRadius: '10px', 
                                border: showPdfPanel ? '1px solid #5C9AFF' : '1px solid #e2e8f0', 
                                fontSize: '13px', 
                                fontWeight: 700, 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <FileText size={18} /> {showPdfPanel ? 'Ẩn bản gốc PDF' : 'Xem bản gốc PDF'}
                        </button>
                    )}
                    <button
                        onClick={() => setIsPreviewOpen(true)}
                        style={{ padding: '10px 20px', backgroundColor: 'white', color: '#64748b', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <Eye size={18} /> Preview
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        style={{ 
                            padding: '10px 24px', 
                            backgroundColor: '#5C9AFF', 
                            color: 'white', 
                            borderRadius: '12px', 
                            border: 'none', 
                            fontSize: '13px', 
                            fontWeight: 700, 
                            cursor: isSaving ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s',
                            opacity: isSaving ? 0.7 : 1,
                            boxShadow: '0 4px 6px -1px rgba(92, 154, 255, 0.2)'
                        }}
                        onMouseEnter={(e) => !isSaving && (e.currentTarget.style.backgroundColor = '#4A8BFF')}
                        onMouseLeave={(e) => !isSaving && (e.currentTarget.style.backgroundColor = '#5C9AFF')}
                    >
                        {isSaving ? (
                            <><div className="animate-spin" style={{ width: '14px', height: '14px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%' }} /> Đang lưu...</>
                        ) : (
                            <><Save size={18} /> Lưu hồ sơ</>
                        )}
                    </button>
                    <button style={{ padding: '10px 24px', backgroundColor: '#5C9AFF', color: 'white', borderRadius: '12px', border: 'none', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(92, 154, 255, 0.2)' }}>
                        <Download size={18} /> Tải xuống PDF
                    </button>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
                        <User size={20} color="#94a3b8" style={{ margin: '6px' }} />
                    </div>
                </div>
            </div>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: (showPdfPanel && formData.fileUrl) ? '1.2fr 0.8fr' : '1fr', 
                minHeight: 'calc(100vh - 65px)',
                transition: 'grid-template-columns 0.3s ease'
            }}>

                {/* Sidebar Navigation */}
                {/* Hiding Resume Builder sidebar content as requested */}
                <div style={{ display: 'none' }}>
                    <div style={{ backgroundColor: 'white', borderRight: '1px solid #f1f5f9', padding: '32px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>Resume Builder</h3>
                        <div style={{ height: '4px', backgroundColor: '#f1f5f9', borderRadius: '2px', marginBottom: '32px', overflow: 'hidden' }}>
                            <div style={{ width: `${completionRate || 0}%`, height: '100%', backgroundColor: '#5C9AFF', transition: 'width 0.4s ease' }}></div>
                        </div>
                        <p style={{ fontSize: '11px', fontWeight: 800, color: '#5C9AFF', marginBottom: '32px' }}>{completionRate || 0}% Complete • Optimization Ready</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {[
                                { name: "Summary", icon: <User size={18} />, id: 'section-identity' },
                                { name: "Experience", icon: <Briefcase size={18} />, id: 'section-experience' },
                                { name: "Education", icon: <GraduationCap size={18} />, id: 'section-education' },
                                { name: "Skills", icon: <Target size={18} />, id: 'section-skills' },
                                { name: "Projects", icon: <Layers size={18} />, id: 'section-projects' },
                                { name: "Certificates", icon: <Award size={18} />, id: 'section-certifications' }
                            ].map(step => (
                                <div 
                                    key={step.name} 
                                    onClick={() => {
                                        setActiveSection(step.id);
                                        scrollToSection(step.id);
                                    }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                                        backgroundColor: activeSection === step.id ? '#eff6ff' : 'transparent',
                                        color: activeSection === step.id ? '#5C9AFF' : '#64748b',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {step.icon} {step.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content: Builder Form */}
                <div className="builder-scroll-container" style={{ padding: '60px 100px', overflowY: 'auto' }}>
                    <div style={{ marginBottom: '48px' }}>
                        <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Build Your Excellence</h2>
                        <p style={{ fontSize: '15px', color: '#64748b', marginTop: '8px' }}>Every great career starts with a compelling story. Let's structure yours for success.</p>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            style={{ marginTop: '24px', padding: '12px 24px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#1e293b', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <PlusCircle size={18} /> Import dữ liệu từ PDF
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept=".pdf"
                            onChange={handlePdfImport}
                            style={{ display: 'none' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

                        {/* 1. CV Identity */}
                        <div id="section-identity" style={{ backgroundColor: 'white', padding: '40px', borderRadius: '24px', border: '1px solid #f1f5f9', scrollMarginTop: '80px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '32px', height: '32px', backgroundColor: '#eff6ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={18} color="#5C9AFF" /></div> CV Identity
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '40px' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '12px' }}>PROFILE PHOTO</p>
                                    <div style={{
                                        width: '120px',
                                        height: '120px',
                                        backgroundColor: '#f1f5f9',
                                        borderRadius: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto',
                                        overflow: 'hidden',
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        {formData.avatar ? (
                                            <img src={formData.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <User size={40} color="#cbd5e1" />
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        id="avatar-upload"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        style={{ display: 'none' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById('avatar-upload')?.click()}
                                        style={{ marginTop: '12px', backgroundColor: 'transparent', border: 'none', color: '#5C9AFF', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}>
                                        {formData.avatar ? 'CHANGE PHOTO' : 'UPLOAD PHOTO'}
                                    </button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px' }}>FULL NAME</p>
                                            <input
                                                type="text"
                                                value={formData.fullName}
                                                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                                style={{ width: '100%', padding: '14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontWeight: 700 }}
                                            />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px' }}>CV TITLE</p>
                                            <input
                                                type="text"
                                                value={formData.cvTitle}
                                                onChange={(e) => setFormData(prev => ({ ...prev, cvTitle: e.target.value }))}
                                                style={{ width: '100%', padding: '14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontWeight: 700 }}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px' }}>EMAIL ADDRESS</p>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                style={{ width: '100%', padding: '14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontWeight: 700 }}
                                            />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px' }}>PHONE NUMBER</p>
                                            <input
                                                type="text"
                                                value={formData.phone}
                                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                                style={{ width: '100%', padding: '14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontWeight: 700 }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px' }}>LOCATION / ADDRESS</p>
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                            style={{ width: '100%', padding: '14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontWeight: 700 }}
                                        />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                            PROFESSIONAL SUMMARY
                                            {history.summaries.length > 0 && (
                                                <span onClick={() => setShowHistory(showHistory === 'summary' ? null : 'summary')} style={{ color: '#5C9AFF', cursor: 'pointer' }}>Reuse Previous</span>
                                            )}
                                        </p>
                                        <div style={{ position: 'relative' }}>
                                            <textarea
                                                value={formData.summary}
                                                onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                                                style={{ width: '100%', padding: '14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', height: '100px', resize: 'none' }}
                                            />
                                            {showHistory === 'summary' && (
                                                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', marginTop: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                                                    {history.summaries.map((s: string, i: number) => (
                                                        <div key={i} onClick={() => { setFormData(prev => ({ ...prev, summary: s })); setShowHistory(null); }} style={{ padding: '12px 16px', cursor: 'pointer', fontSize: '13px', borderBottom: '1px solid #f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>{s}</div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Work Experience */}
                        <div id="section-experience" style={{ backgroundColor: 'white', padding: '40px', borderRadius: '24px', border: '1px solid #f1f5f9', scrollMarginTop: '80px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '32px', height: '32px', backgroundColor: '#eff6ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Briefcase size={18} color="#5C9AFF" /></div> Work Experience
                                </h3>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    {history.experiences.length > 0 && (
                                        <div style={{ position: 'relative' }}>
                                            <button type="button" onClick={() => setShowHistory(showHistory === 'exp' ? null : 'exp')} style={{ padding: '8px 16px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#64748b', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Clock size={14} /> Reuse Previous
                                            </button>
                                            {showHistory === 'exp' && (
                                                <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 10, width: '300px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', marginTop: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                                                    {history.experiences.map((e: any, i: number) => (
                                                        <div key={i} onClick={() => { setFormData(prev => ({ ...prev, experiences: [...prev.experiences, { ...e, startDate: "", endDate: "", isPresent: false }] })); setShowHistory(null); }} style={{ padding: '12px 16px', cursor: 'pointer', fontSize: '13px', borderBottom: '1px solid #f8fafc' }} onMouseEnter={el => el.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={el => el.currentTarget.style.backgroundColor = 'white'}>
                                                            <div style={{ fontWeight: 800 }}>{e.position}</div>
                                                            <div style={{ fontSize: '11px', color: '#64748b' }}>{e.companyName}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={addExperience}
                                        style={{ background: 'none', border: 'none', color: '#5C9AFF', fontSize: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                                    >
                                        <PlusCircle size={18} /> Add Experience
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {formData.experiences.map((exp, index) => (
                                    <div key={index} style={{ backgroundColor: '#f8fafc', padding: '32px', borderRadius: '20px', border: '1px solid #e2e8f0', position: 'relative' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                                            <div>
                                                <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px' }}>COMPANY NAME</p>
                                                <input
                                                    type="text"
                                                    value={exp.companyName}
                                                    onChange={(e) => updateExperience(index, 'companyName', e.target.value)}
                                                    style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                                                />
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px' }}>POSITION</p>
                                                <input
                                                    type="text"
                                                    value={exp.position}
                                                    onChange={(e) => updateExperience(index, 'position', e.target.value)}
                                                    style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                                                />
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px' }}>START DATE</p>
                                                <input
                                                    type="date"
                                                    value={exp.startDate}
                                                    onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                                                    style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                                                />
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px' }}>END DATE</p>
                                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                    <input
                                                        type="date"
                                                        disabled={exp.isPresent}
                                                        value={exp.endDate}
                                                        onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                                                        style={{ flex: 1, padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', opacity: exp.isPresent ? 0.5 : 1 }}
                                                    />
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={exp.isPresent}
                                                            onChange={(e) => updateExperience(index, 'isPresent', e.target.checked)}
                                                        />
                                                        <span style={{ fontSize: '12px', fontWeight: 700 }}>Present</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px' }}>JOB DESCRIPTION</p>
                                        <textarea
                                            value={exp.description}
                                            onChange={(e) => updateExperience(index, 'description', e.target.value)}
                                            style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', height: '100px', resize: 'none' }}
                                        />

                                        {index > 0 && (
                                            <button
                                                onClick={() => removeExperience(index)}
                                                style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                            >
                                                <X size={20} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 3. Education */}
                        <div id="section-education" style={{ backgroundColor: 'white', padding: '40px', borderRadius: '24px', border: '1px solid #f1f5f9', scrollMarginTop: '80px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '32px', height: '32px', backgroundColor: '#eff6ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><GraduationCap size={18} color="#5C9AFF" /></div> Education
                                </h3>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    {history.educations.length > 0 && (
                                        <div style={{ position: 'relative' }}>
                                            <button type="button" onClick={() => setShowHistory(showHistory === 'edu' ? null : 'edu')} style={{ padding: '8px 16px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#64748b', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Clock size={14} /> Reuse Previous
                                            </button>
                                            {showHistory === 'edu' && (
                                                <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 10, width: '250px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', marginTop: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                                                    {history.educations.map((edu: any, i: number) => (
                                                        <div key={i} onClick={() => { setFormData(prev => ({ ...prev, educations: [...prev.educations, { ...edu, gradYear: "" }] })); setShowHistory(null); }} style={{ padding: '12px 16px', cursor: 'pointer', fontSize: '13px', borderBottom: '1px solid #f8fafc' }} onMouseEnter={el => el.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={el => el.currentTarget.style.backgroundColor = 'white'}>
                                                            <div style={{ fontWeight: 800 }}>{edu.degree}</div>
                                                            <div style={{ fontSize: '11px', color: '#64748b' }}>{edu.schoolName}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={addEducation}
                                        style={{ background: 'none', border: 'none', color: '#5C9AFF', fontSize: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                                    >
                                        <PlusCircle size={18} /> Add Education
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {formData.educations.map((edu, index) => (
                                    <div key={index} style={{ position: 'relative', backgroundColor: '#f8fafc', padding: '32px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                            <div style={{ gridColumn: 'span 2' }}>
                                                <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px' }}>SCHOOL / UNIVERSITY NAME</p>
                                                <input
                                                    type="text"
                                                    value={edu.schoolName}
                                                    onChange={(e) => updateEducation(index, 'schoolName', e.target.value)}
                                                    style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                                                />
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px' }}>DEGREE</p>
                                                <input
                                                    type="text"
                                                    value={edu.degree}
                                                    onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                                    style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                                                />
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px' }}>MAJOR</p>
                                                <input
                                                    type="text"
                                                    value={edu.major}
                                                    onChange={(e) => updateEducation(index, 'major', e.target.value)}
                                                    style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                                                />
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px' }}>GRADUATION YEAR</p>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. 2024"
                                                    value={edu.gradYear}
                                                    onChange={(e) => updateEducation(index, 'gradYear', e.target.value)}
                                                    style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                                                />
                                            </div>
                                        </div>
                                        {index > 0 && (
                                            <button
                                                onClick={() => removeEducation(index)}
                                                style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                            >
                                                <X size={20} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 4. Skills */}
                        <div id="section-skills" style={{ backgroundColor: 'white', padding: '40px', borderRadius: '24px', border: '1px solid #f1f5f9', scrollMarginTop: '80px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '32px', height: '32px', backgroundColor: '#eff6ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Target size={18} color="#5C9AFF" /></div> Skills & Proficiencies
                                </h3>
                                {history.skills.length > 0 && (
                                    <div style={{ position: 'relative' }}>
                                        <button onClick={() => setShowHistory(showHistory === 'skills' ? null : 'skills')} style={{ background: 'none', border: 'none', color: '#5C9AFF', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>
                                            Reuse Previous
                                        </button>
                                        {showHistory === 'skills' && (
                                            <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 10, width: '200px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', marginTop: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                                                {history.skills.map((s: any, i: number) => (
                                                    <div key={i} onClick={() => { addSkill(s); setShowHistory(null); }} style={{ padding: '12px 16px', cursor: 'pointer', fontSize: '13px', borderBottom: '1px solid #f8fafc' }} onMouseEnter={el => el.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={el => el.currentTarget.style.backgroundColor = 'white'}>
                                                        {s.skillName} ({s.level})
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
                                {formData.skills.map((skill, i) => (
                                    <div key={`${skill.skillName}-${i}`} style={{ padding: '8px 16px', backgroundColor: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #dbeafe' }}>
                                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e40af' }}>{skill.skillName}</span>
                                        <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', borderLeft: '1px solid #cbd5e1', paddingLeft: '8px' }}>{skill.level}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeSkill(i)}
                                            style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <X size={14} color="#ef4444" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: '16px' }}>
                                <input
                                    type="text"
                                    placeholder="e.g. Python"
                                    value={newSkill.skillName}
                                    onChange={(e) => {
                                        console.log("Input changed:", e.target.value);
                                        setNewSkill({ ...newSkill, skillName: e.target.value });
                                    }}
                                    style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px' }}
                                />
                                <select
                                    value={newSkill.level}
                                    onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                                    style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px' }}>
                                    <option>Expert</option>
                                    <option>Intermediate</option>
                                    <option>Beginner</option>
                                </select>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        addSkill();
                                    }}
                                    style={{ backgroundColor: '#5C9AFF', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', opacity: newSkill.skillName ? 1 : 0.5 }}>
                                    Add
                                </button>
                            </div>
                        </div>

                        {/* 5. Projects */}
                        <div id="section-projects" style={{ backgroundColor: 'white', padding: '40px', borderRadius: '24px', border: '1px solid #f1f5f9', scrollMarginTop: '80px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '32px', height: '32px', backgroundColor: '#eff6ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Layers size={18} color="#5C9AFF" /></div> Projects
                                </h3>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    {history.projects.length > 0 && (
                                        <div style={{ position: 'relative' }}>
                                            <button onClick={() => setShowHistory(showHistory === 'projects' ? null : 'projects')} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>
                                                Reuse Previous
                                            </button>
                                            {showHistory === 'projects' && (
                                                <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 10, width: '250px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', marginTop: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                                                    {history.projects.map((p: any, i: number) => (
                                                        <div key={i} onClick={() => { setFormData(prev => ({ ...prev, projects: [...prev.projects, p] })); setShowHistory(null); }} style={{ padding: '12px 16px', cursor: 'pointer', fontSize: '13px', borderBottom: '1px solid #f8fafc' }} onMouseEnter={el => el.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={el => el.currentTarget.style.backgroundColor = 'white'}>
                                                            <div style={{ fontWeight: 800 }}>{p.name}</div>
                                                            <div style={{ fontSize: '11px', color: '#64748b' }}>{p.role}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={addProject}
                                        style={{ background: 'none', border: 'none', color: '#5C9AFF', fontSize: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                                    >
                                        <PlusCircle size={18} /> Add Project
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {formData.projects.map((project, index) => (
                                    <div key={index} style={{ backgroundColor: '#f8fafc', padding: '32px', borderRadius: '20px', border: '1px solid #e2e8f0', position: 'relative' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginBottom: '24px' }}>
                                            <div>
                                                <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px' }}>PROJECT NAME</p>
                                                <input
                                                    type="text"
                                                    value={project.name}
                                                    onChange={(e) => updateProject(index, 'name', e.target.value)}
                                                    style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                                                />
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px' }}>ROLE</p>
                                                <input
                                                    type="text"
                                                    value={project.role}
                                                    onChange={(e) => updateProject(index, 'role', e.target.value)}
                                                    style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                                                />
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: '24px' }}>
                                            <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px' }}>TECHNOLOGY STACK</p>
                                            <input
                                                type="text"
                                                value={project.techStack}
                                                onChange={(e) => updateProject(index, 'techStack', e.target.value)}
                                                style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                                            />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px' }}>PROJECT URL</p>
                                            <div style={{ position: 'relative' }}>
                                                <Globe size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                                <input
                                                    type="text"
                                                    value={project.url}
                                                    onChange={(e) => updateProject(index, 'url', e.target.value)}
                                                    style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                                                />
                                            </div>
                                        </div>
                                        {index > 0 && (
                                            <button
                                                onClick={() => removeProject(index)}
                                                style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                            >
                                                <X size={20} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 6. Certifications */}
                        <div id="section-certifications" style={{ backgroundColor: 'white', padding: '40px', borderRadius: '24px', border: '1px solid #f1f5f9', scrollMarginTop: '80px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '32px', height: '32px', backgroundColor: '#eff6ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Award size={18} color="#5C9AFF" /></div> Certifications & Degrees
                                </h3>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    {history.certifications?.length > 0 && (
                                        <div style={{ position: 'relative' }}>
                                            <button type="button" onClick={() => setShowHistory(showHistory === 'certs' ? null : 'certs')} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>
                                                Reuse Previous
                                            </button>
                                            {showHistory === 'certs' && (
                                                <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 10, width: '250px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', marginTop: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                                                    {history.certifications.map((c: any, i: number) => (
                                                        <div key={i} onClick={() => { setFormData(prev => ({ ...prev, certifications: [...prev.certifications, { ...c, issueDate: "", expiryDate: "" }] })); setShowHistory(null); }} style={{ padding: '12px 16px', cursor: 'pointer', fontSize: '13px', borderBottom: '1px solid #f8fafc' }} onMouseEnter={el => el.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={el => el.currentTarget.style.backgroundColor = 'white'}>
                                                            <div style={{ fontWeight: 800 }}>{c.name}</div>
                                                            <div style={{ fontSize: '11px', color: '#64748b' }}>{c.organization}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={addCertification}
                                        style={{ background: 'none', border: 'none', color: '#5C9AFF', fontSize: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                                    >
                                        <PlusCircle size={18} /> Add Certification
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {formData.certifications.map((cert, index) => (
                                    <div key={index} style={{ backgroundColor: '#f8fafc', padding: '32px', borderRadius: '20px', border: '1px solid #e2e8f0', position: 'relative' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                                            <div>
                                                <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px' }}>CERTIFICATION NAME</p>
                                                <input
                                                    type="text"
                                                    value={cert.name}
                                                    onChange={(e) => updateCertification(index, 'name', e.target.value)}
                                                    style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                                                />
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px' }}>ISSUING ORGANIZATION</p>
                                                <input
                                                    type="text"
                                                    value={cert.organization}
                                                    onChange={(e) => updateCertification(index, 'organization', e.target.value)}
                                                    style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                                                />
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px' }}>ISSUE DATE</p>
                                                <input
                                                    type="date"
                                                    value={cert.issueDate}
                                                    onChange={(e) => updateCertification(index, 'issueDate', e.target.value)}
                                                    style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                                                />
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px' }}>EXPIRY DATE (OPTIONAL)</p>
                                                <input
                                                    type="date"
                                                    value={cert.expiryDate}
                                                    onChange={(e) => updateCertification(index, 'expiryDate', e.target.value)}
                                                    style={{ width: '100', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                                                />
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                            <div>
                                                <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px' }}>CREDENTIAL ID</p>
                                                <input
                                                    type="text"
                                                    value={cert.credentialId}
                                                    onChange={(e) => updateCertification(index, 'credentialId', e.target.value)}
                                                    style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                                                />
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px' }}>CREDENTIAL URL</p>
                                                <input
                                                    type="text"
                                                    value={cert.credentialUrl}
                                                    onChange={(e) => updateCertification(index, 'credentialUrl', e.target.value)}
                                                    style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeCertification(index)}
                                            style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
            <style dangerouslySetInnerHTML={{ __html: `
                input:focus, textarea:focus, select:focus {
                    outline: 2px solid #5C9AFF;
                    border-color: transparent !important;
                }
            ` }} />
                    </div>
                </div>
                {showPdfPanel && formData.fileUrl && (
                    <div style={{ 
                        borderLeft: '1px solid #e2e8f0', 
                        backgroundColor: 'white', 
                        position: 'sticky', 
                        top: '65px', 
                        height: 'calc(100vh - 65px)', 
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        zIndex: 5
                    }}>
                        <div style={{ 
                            padding: '16px 24px', 
                            borderBottom: '1px solid #f1f5f9', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            backgroundColor: '#F8FAFC'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FileText size={18} color="#5C9AFF" />
                                <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>CV Bản Gốc PDF</span>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setShowPdfPanel(false)}
                                style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    color: '#64748b', 
                                    cursor: 'pointer',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <div style={{ flex: 1, width: '100%', height: '100%' }}>
                            <iframe 
                                src={`${BASE_URL}${formData.fileUrl}`} 
                                width="100%" 
                                height="100%" 
                                style={{ border: 'none' }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
