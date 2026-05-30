import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, 
    Building2, 
    MapPin, 
    DollarSign, 
    Clock, 
    Briefcase, 
    Calendar, 
    FileText, 
    ShieldCheck, 
    Gem,
    Info,
    Users,
    Target,
    CheckCircle2,
    Zap
} from 'lucide-react';

interface JobDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    job: any;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({ isOpen, onClose, job }) => {
    if (!job) return null;

    const benefits: string[] = [];
    if (typeof job.benefits === 'string' && job.benefits.trim()) {
        const rawBenefits = job.benefits.split(/[\n;•\-\*]/).map((b: string) => b.trim()).filter(Boolean);
        benefits.push(...rawBenefits);
    }

    const certificates: string[] = job.certificates || [];
    const skills: any[] = job.skills || job.jobSkills || [];

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
                    zIndex: 2000,
                    backdropFilter: 'blur(12px)',
                    padding: '20px'
                }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 40 }}
                        style={{
                            backgroundColor: '#F8FAFC',
                            width: '100%',
                            maxWidth: '1000px',
                            maxHeight: '92vh',
                            borderRadius: '32px',
                            overflow: 'hidden',
                            position: 'relative',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                        
                        {/* Header */}
                        <div style={{ 
                            padding: '24px 40px', 
                            backgroundColor: 'white', 
                            borderBottom: '1px solid #f1f5f9', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            position: 'sticky',
                            top: 0,
                            zIndex: 100
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ width: '56px', height: '56px', backgroundColor: '#eff6ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Building2 size={28} color="#5C9AFF" />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Chi tiết công việc</h2>
                                    <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0', fontWeight: 600 }}>{job.company?.name || "Premium Partner"}</p>
                                </div>
                            </div>
                            <button 
                                onClick={onClose}
                                style={{ 
                                    padding: '10px', 
                                    backgroundColor: '#f1f5f9', 
                                    border: 'none', 
                                    borderRadius: '12px', 
                                    cursor: 'pointer', 
                                    color: '#64748b',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div style={{ padding: '40px', overflowY: 'auto', flex: 1 }}>
                            {/* Job Title Card */}
                            <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9', marginBottom: '32px' }}>
                                <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', marginBottom: '16px', margin: 0 }}>{job.title}</h1>
                                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', color: '#64748b', fontWeight: 700 }}><MapPin size={18} color="#5C9AFF" /> {job.workLocation || "Văn phòng trung tâm"}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', color: '#64748b', fontWeight: 700 }}><DollarSign size={18} color="#5C9AFF" /> {(job.minSalary && job.maxSalary) ? `$${job.minSalary / 1000}k - $${job.maxSalary / 1000}k` : "Thỏa thuận"}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', color: '#64748b', fontWeight: 700 }}><Briefcase size={18} color="#5C9AFF" /> {job.type || "Toàn thời gian"}</span>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
                                {[
                                    { label: "CẤP BẬC", value: job.level?.name || "Tất cả cấp bậc", icon: <Gem size={18} color="#a855f7" />, bg: '#fdf4ff' },
                                    { label: "KINH NGHIỆM", value: `${job.minExperience || 0} năm+`, icon: <ShieldCheck size={18} color="#22c55e" />, bg: '#f0fdf4' },
                                    { label: "HỌC VẤN", value: job.minEducation || "Đại học", icon: <Info size={18} color="#f97316" />, bg: '#fff7ed' },
                                    { label: "SỐ LƯỢNG", value: `${job.quantity} Vị trí`, icon: <Users size={18} color="#5C9AFF" />, bg: '#eff6ff' }
                                ].map((stat, i) => (
                                    <div key={i} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                                        <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>{stat.label}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '32px', height: '32px', backgroundColor: stat.bg, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{stat.icon}</div>
                                            <p style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{stat.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Main Content Sections */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                                <section>
                                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '36px', height: '36px', backgroundColor: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={20} color="#5C9AFF" /></div> 
                                        Mô tả công việc
                                    </h3>
                                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9', fontSize: '15px', color: '#475569', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                                        {job.description || "Đang cập nhật..."}
                                    </div>
                                </section>

                                <section>
                                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '36px', height: '36px', backgroundColor: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Target size={20} color="#5C9AFF" /></div> 
                                        Yêu cầu công việc
                                    </h3>
                                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9', fontSize: '15px', color: '#475569', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                                        {job.responsibilities || "Đang cập nhật..."}
                                    </div>
                                </section>

                                <section>
                                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '36px', height: '36px', backgroundColor: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Gem size={20} color="#5C9AFF" /></div> 
                                        Quyền lợi & Đãi ngộ
                                    </h3>
                                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9', fontSize: '15px', color: '#475569', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                                        {job.benefits || "Đang cập nhật..."}
                                    </div>
                                </section>

                                <section>
                                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '36px', height: '36px', backgroundColor: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={20} color="#5C9AFF" /></div> 
                                        Kỹ năng & Chứng chỉ
                                    </h3>
                                    <div style={{ backgroundColor: '#f8fafc', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                                        <div style={{ marginBottom: '24px' }}>
                                            <p style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '16px' }}>Kỹ năng yêu cầu</p>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                                {skills.length > 0 ? skills.map((s, i) => (
                                                    <span key={i} style={{ padding: '8px 20px', backgroundColor: 'white', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: '#0f172a', border: '1px solid #e2e8f0' }}>
                                                        {s.skillName || s.name}
                                                    </span>
                                                )) : <span style={{ color: '#94a3b8' }}>Không yêu cầu kỹ năng cụ thể</span>}
                                            </div>
                                        </div>
                                        {certificates.length > 0 && (
                                            <div>
                                                <p style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '16px' }}>Chứng chỉ đề xuất</p>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                                    {certificates.map((c, i) => (
                                                        <span key={i} style={{ padding: '8px 20px', backgroundColor: '#eff6ff', color: '#5C9AFF', borderRadius: '12px', fontSize: '14px', fontWeight: 700, border: '1px solid #bfdbfe' }}>
                                                            {c}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{ padding: '24px 40px', backgroundColor: 'white', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600, margin: 0 }}>
                                Hạn nộp: <span style={{ color: '#e11d48' }}>{job.expiredAt ? new Date(job.expiredAt).toLocaleDateString('vi-VN') : "Đang cập nhật"}</span>
                            </p>
                            <button 
                                onClick={onClose}
                                style={{ padding: '14px 40px', backgroundColor: '#0f172a', color: 'white', borderRadius: '14px', border: 'none', fontSize: '15px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                            >
                                Đóng
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
