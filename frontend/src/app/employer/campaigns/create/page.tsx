"use client";

import React, { useEffect, useState } from "react";
import {
    Info,
    Calendar,
    Briefcase,
    Settings,
    Search,
    ChevronDown,
    Plus,
    X,
    Users,
    ArrowRight,
    Loader2,
    Eye
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { jobService, Job } from "@/services/job.service";
import { campaignService } from "@/services/campaign.service";
import EmployerLayout from "@/components/layout/employer-layout";

export default function CreateCampaignPage() {
    const router = useRouter();
    const [existingJobs, setExistingJobs] = useState<Job[]>([]);
    const [isLoadingJobs, setIsLoadingJobs] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [status, setStatus] = useState("ACTIVE");
    const [selectedReuseJobIds, setSelectedReuseJobIds] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isJobsExpanded, setIsJobsExpanded] = useState(false);

    useEffect(() => {
        fetchExistingJobs();
    }, []);

    const fetchExistingJobs = async () => {
        try {
            setIsLoadingJobs(true);
            const data = await jobService.getMyJobs();
            setExistingJobs(data || []);
        } catch (error) {
            console.error("Failed to fetch jobs:", error);
        } finally {
            setIsLoadingJobs(false);
        }
    };

    const toggleJobSelection = (jobId: string) => {
        setSelectedReuseJobIds(prev =>
            prev.includes(jobId)
                ? prev.filter(id => id !== jobId)
                : [...prev, jobId]
        );
    };

    const handleSubmit = async () => {
        if (!name) {
            alert("Vui lòng nhập tên đợt tuyển dụng");
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = {
                name,
                description,
                startDate,
                endDate,
                status,
                reuseJobIds: selectedReuseJobIds
            };

            await campaignService.create(payload);
            router.push("/employer/campaigns");
        } catch (error) {
            console.error("Failed to create campaign:", error);
            alert("Có lỗi xảy ra khi tạo đợt tuyển dụng");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredJobs = existingJobs.filter(job =>
        job.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <EmployerLayout>
            <div style={{ padding: '40px', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
                {/* Breadcrumbs */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '32px' }}>
                    <Link href="/employer/campaigns" style={{ textDecoration: 'none', color: 'inherit' }}>Campaigns</Link>
                    <ChevronDown size={14} />
                    <span style={{ color: '#5C9AFF' }}>Tạo đợt tuyển dụng mới</span>
                </div>

                <div style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Tạo Đợt Tuyển Dụng Mới</h1>
                    <p style={{ fontSize: '15px', color: '#64748b', marginTop: '12px' }}>Thiết lập thông tin chi tiết và lộ trình cho chiến dịch săn tìm tài năng tiếp theo của bạn.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1000px' }}>
                    {/* Section 1: Thông tin cơ bản */}
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ width: '36px', height: '36px', backgroundColor: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Info size={20} color="#5C9AFF" />
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Thông tin cơ bản</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div>
                                <p style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>TÊN ĐỢT TUYỂN DỤNG</p>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ví dụ: Chiến dịch Tech Talent Q4 - 2024"
                                    style={{ width: '100%', padding: '14px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '15px', fontWeight: 600, outline: 'none' }}
                                />
                            </div>
                            <div>
                                <p style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>MÔ TẢ CHI TIẾT</p>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Nhập mục tiêu và thông tin chi tiết về đợt tuyển dụng này..."
                                    style={{ width: '100%', padding: '14px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '15px', height: '120px', outline: 'none', resize: 'none' }}
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Thời gian triển khai */}
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ width: '36px', height: '36px', backgroundColor: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Calendar size={20} color="#5C9AFF" />
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Thời gian triển khai</h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                            <div>
                                <p style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>NGÀY BẮT ĐẦU</p>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    style={{ width: '100%', padding: '14px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '15px', fontWeight: 600, outline: 'none' }}
                                />
                            </div>
                            <div>
                                <p style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>NGÀY KẾT THÚC DỰ KIẾN</p>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    style={{ width: '100%', padding: '14px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '15px', fontWeight: 600, outline: 'none' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Thêm Job vào đợt */}
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                        <div 
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                            onClick={() => setIsJobsExpanded(!isJobsExpanded)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '36px', height: '36px', backgroundColor: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Briefcase size={20} color="#5C9AFF" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Gán Job từ các đợt trước</h3>
                                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                        Đã chọn <span style={{ color: '#5C9AFF', fontWeight: 700 }}>{selectedReuseJobIds.length}</span> vị trí
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ 
                                    padding: '8px 16px', 
                                    backgroundColor: isJobsExpanded ? '#f1f5f9' : '#eff6ff', 
                                    color: isJobsExpanded ? '#64748b' : '#5C9AFF', 
                                    borderRadius: '10px', 
                                    fontSize: '12px', 
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    {isJobsExpanded ? 'Thu gọn' : 'Mở rộng để chọn'}
                                    <ChevronDown size={16} style={{ transform: isJobsExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }} />
                                </div>
                            </div>
                        </div>

                        {/* Selected Jobs Summary Chips (Always visible) */}
                        {selectedReuseJobIds.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '20px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #e2e8f0' }}>
                                {selectedReuseJobIds.map(id => {
                                    const job = existingJobs.find(j => j.id === id);
                                    if (!job) return null;
                                    return (
                                        <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'white', padding: '4px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b' }}>{job.title}</span>
                                            <X size={12} color="#94a3b8" style={{ cursor: 'pointer' }} onClick={(e) => {
                                                e.stopPropagation();
                                                toggleJobSelection(id);
                                            }} />
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Expandable Selection Area */}
                        {isJobsExpanded && (
                            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <div style={{ position: 'relative', width: '300px' }}>
                                        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Tìm kiếm vị trí..."
                                            style={{ width: '100%', padding: '10px 12px 10px 36px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', outline: 'none' }}
                                        />
                                    </div>
                                    <button 
                                        onClick={() => {
                                            if (selectedReuseJobIds.length === filteredJobs.length) {
                                                setSelectedReuseJobIds([]);
                                            } else {
                                                setSelectedReuseJobIds(filteredJobs.map(j => j.id!));
                                            }
                                        }}
                                        style={{ padding: '8px 16px', backgroundColor: 'transparent', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '12px', fontWeight: 700, color: '#64748b', cursor: 'pointer' }}
                                    >
                                        {selectedReuseJobIds.length === filteredJobs.length && filteredJobs.length > 0 ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                                    </button>
                                </div>

                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                                    gap: '12px', 
                                    maxHeight: '320px', 
                                    overflowY: 'auto', 
                                    paddingRight: '8px' 
                                }}>
                                    {isLoadingJobs ? (
                                        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', padding: '40px' }}>
                                            <Loader2 className="animate-spin" color="#5C9AFF" />
                                        </div>
                                    ) : filteredJobs.length > 0 ? (
                                        filteredJobs.map((job) => {
                                            const isSelected = selectedReuseJobIds.includes(job.id!);
                                            return (
                                                <div
                                                    key={job.id}
                                                    onClick={() => toggleJobSelection(job.id!)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        padding: '12px 16px',
                                                        backgroundColor: isSelected ? '#eff6ff' : '#f8fafc',
                                                        borderRadius: '12px',
                                                        border: isSelected ? '1px solid #5C9AFF' : '1px solid #f1f5f9',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <div style={{
                                                        flexShrink: 0,
                                                        width: '18px',
                                                        height: '18px',
                                                        border: isSelected ? 'none' : '2px solid #cbd5e1',
                                                        borderRadius: '4px',
                                                        backgroundColor: isSelected ? '#5C9AFF' : 'transparent',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        {isSelected && <Plus size={12} color="white" style={{ transform: 'rotate(45deg)' }} />}
                                                    </div>
                                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                                        <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b', margin: 0, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                                            {job.title}
                                                        </h4>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                                                            <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>{job.type}</span>
                                                            <span style={{ width: '3px', height: '3px', backgroundColor: '#cbd5e1', borderRadius: '50%' }}></span>
                                                            <span style={{ fontSize: '10px', fontWeight: 800, color: '#5C9AFF' }}>{job.status}</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            window.open(`/employer/jobs/${job.id}`, '_blank');
                                                        }}
                                                        style={{
                                                            width: '28px',
                                                            height: '28px',
                                                            borderRadius: '6px',
                                                            border: 'none',
                                                            backgroundColor: 'white',
                                                            color: '#94a3b8',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            flexShrink: 0,
                                                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                                        }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.color = '#5C9AFF'; e.currentTarget.style.backgroundColor = '#eff6ff'; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.backgroundColor = 'white'; }}
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                                            <Briefcase size={32} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
                                            <p style={{ margin: 0, fontSize: '14px' }}>Không tìm thấy job nào.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Section 4: Cấu hình bổ sung */}
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ width: '36px', height: '36px', backgroundColor: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Settings size={20} color="#5C9AFF" />
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Cấu hình bổ sung</h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                            <div>
                                <p style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>TRẠNG THÁI BAN ĐẦU</p>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    style={{ width: '100%', padding: '14px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', fontWeight: 700 }}
                                >
                                    <option value="ACTIVE">Published (Mở tuyển ngay)</option>
                                    <option value="DRAFT">Draft (Lưu nháp)</option>
                                </select>
                            </div>
                            <div>
                                <p style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>PHÒNG BAN PHỤ TRÁCH</p>
                                <select style={{ width: '100%', padding: '14px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', fontWeight: 700 }}>
                                    <option>Human Resources</option>
                                    <option>Engineering</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '24px', marginTop: '20px' }}>
                        <button
                            onClick={() => router.back()}
                            style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            style={{
                                padding: '16px 48px',
                                backgroundColor: '#5C9AFF',
                                color: 'white',
                                borderRadius: '12px',
                                border: 'none',
                                fontSize: '16px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                opacity: isSubmitting ? 0.7 : 1
                            }}
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : null}
                            Tạo đợt tuyển dụng <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </EmployerLayout>
    );
}
