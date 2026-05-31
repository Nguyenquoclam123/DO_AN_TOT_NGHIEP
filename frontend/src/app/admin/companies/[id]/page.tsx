"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Building2,
    ShieldCheck,
    RefreshCcw,
    XCircle,
    MapPin,
    Mail,
    Globe,
    Phone,
    TrendingUp,
    TrendingDown,
    Users,
    Clock,
    CheckCircle2,
    MoreVertical,
    ChevronRight,
    Search,
    Bell,
    Settings,
    LogOut,
    Activity,
    Briefcase,
    Edit3,
    Ban
} from "lucide-react";
import { api } from "@/lib/api";

export default function AdminCompanyDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [company, setCompany] = useState<any>(null);
    const [jobs, setJobs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            try {
                const companyData = await api.get<any>(`/companies/${id}`);
                setCompany(companyData);

                try {
                    const jobsData = await api.get<any[]>(`/jobs?companyId=${id}`);
                    setJobs(jobsData || []);
                } catch (jobErr) {
                    console.error("Failed to fetch company jobs", jobErr);
                }
            } catch (err) {
                console.error("Failed to fetch company details", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleUpdateStatus = async (status: string, isVerified: boolean) => {
        try {
            setIsUpdating(true);
            await api.patch(`/companies/${id}`, { status, isVerified });
            alert(`Updated company status to ${status} successfully!`);
            
            // Refresh data
            const companyData = await api.get<any>(`/companies/${id}`);
            setCompany(companyData);
        } catch (err) {
            console.error("Failed to update status", err);
            alert("Failed to update company status");
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F8FAFC', fontFamily: 'sans-serif' }}>
                <div style={{ textAlign: 'center' }}>
                    <RefreshCcw className="animate-spin" size={32} color="#5C9AFF" style={{ margin: '0 auto 16px' }} />
                    <p style={{ color: '#64748b', fontWeight: 600 }}>Loading system data...</p>
                </div>
            </div>
        );
    }

    if (!company) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F8FAFC', fontFamily: 'sans-serif' }}>
                <div style={{ textAlign: 'center', maxWidth: '400px', padding: '40px', backgroundColor: 'white', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                    <XCircle size={48} color="#ef4444" style={{ margin: '0 auto 16px' }} />
                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>Not Found</h3>
                    <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>Không tìm thấy thông tin công ty yêu cầu hoặc bạn không có quyền truy cập.</p>
                    <button onClick={() => router.push('/admin/companies')} style={{ padding: '10px 20px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>Quay lại danh sách</button>
                </div>
            </div>
        );
    }

    const getStatusLabel = () => {
        switch (company.status) {
            case 'APPROVED':
                return { text: 'VERIFIED', bg: '#f0fdf4', color: '#166534' };
            case 'PENDING':
                return { text: 'PENDING REVIEW', bg: '#fff7ed', color: '#9a3412' };
            case 'REJECTED':
                return { text: 'REJECTED', bg: '#fef2f2', color: '#991b1b' };
            case 'SUSPENDED':
                return { text: 'SUSPENDED', bg: '#f1f5f9', color: '#475569' };
            default:
                return { text: company.status || 'UNKNOWN', bg: '#f1f5f9', color: '#475569' };
        }
    };

    const statusStyle = getStatusLabel();

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC', fontFamily: 'sans-serif' }}>

            {/* Admin Sidebar */}
            <div style={{ width: '280px', backgroundColor: 'white', borderRight: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', padding: '32px 0' }}>
                <div style={{ padding: '0 32px', marginBottom: '48px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', backgroundColor: '#0f172a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '16px', height: '16px', border: '2px solid white', borderRadius: '2px' }}></div>
                    </div>
                    <div>
                        <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>My Job</h4>
                        <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0, fontWeight: 700 }}>ADMIN DASHBOARD</p>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 16px' }}>
                    {[
                        { name: "Companies", icon: <Building2 size={18} />, active: true, path: '/admin/companies' },
                        { name: "Employers", icon: <Users size={18} />, path: '/admin/employers' },
                        { name: "Jobs", icon: <Briefcase size={18} />, path: '/admin/jobs' }
                    ].map(item => (
                        <div key={item.name} 
                            onClick={() => item.path && router.push(item.path)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                                backgroundColor: item.active ? '#eff6ff' : 'transparent',
                                color: item.active ? '#5C9AFF' : '#64748b'
                            }}
                        >
                            {item.icon} {item.name}
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: 'auto', padding: '0 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: '#64748b', fontSize: '14px', fontWeight: 700 }}><Activity size={18} /> System Status</div>
                    <div onClick={() => router.push('/auth/login')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: '#64748b', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}><LogOut size={18} /> Logout</div>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

                {/* Top Header */}
                <div style={{ height: '80px', backgroundColor: 'white', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input type="text" placeholder="Search companies..." style={{ width: '400px', padding: '12px 16px 12px 48px', backgroundColor: '#f8fafc', border: 'none', borderRadius: '12px', fontSize: '14px', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <Bell size={20} color="#64748b" />
                        <Settings size={20} color="#64748b" />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid #e2e8f0', paddingLeft: '24px' }}>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Admin User</p>
                                <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0, fontWeight: 700 }}>MY JOB</p>
                            </div>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#0f172a', overflow: 'hidden' }}>
                                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="admin" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Padding Wrapper */}
                <div style={{ padding: '32px 40px', overflowY: 'auto' }}>

                    {/* Header Breadcrumbs & Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '16px', cursor: 'pointer' }} onClick={() => router.push('/admin/companies')}>
                                Companies <ChevronRight size={14} /> <span style={{ color: '#5C9AFF' }}>{company.name}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                                <div style={{ width: '80px', height: '80px', backgroundColor: '#0f172a', borderRadius: '16px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {company.logoUrl ? (
                                        <img src={company.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="logo" />
                                    ) : (
                                        <Building2 size={36} color="white" />
                                    )}
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{company.name}</h1>
                                        <span style={{ fontSize: '10px', fontWeight: 900, backgroundColor: statusStyle.bg, color: statusStyle.color, padding: '4px 12px', borderRadius: '4px' }}>
                                            {statusStyle.text}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '14px', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>
                                        {company.industryId || 'General Industry'} • Established: {company.establishedDate || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Audit Action Buttons */}
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {company.status !== 'APPROVED' && (
                                <button 
                                    onClick={() => handleUpdateStatus('APPROVED', true)}
                                    disabled={isUpdating}
                                    style={{ padding: '12px 24px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                                >
                                    <ShieldCheck size={18} /> Approve/Verify
                                </button>
                            )}
                            {company.status !== 'REJECTED' && company.status !== 'APPROVED' && (
                                <button 
                                    onClick={() => handleUpdateStatus('REJECTED', false)}
                                    disabled={isUpdating}
                                    style={{ padding: '12px 24px', backgroundColor: '#fff7ed', color: '#ea580c', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                                >
                                    <Ban size={18} /> Reject Approval
                                </button>
                            )}
                            {company.status !== 'SUSPENDED' && (
                                <button 
                                    onClick={() => handleUpdateStatus('SUSPENDED', false)}
                                    disabled={isUpdating}
                                    style={{ padding: '12px 24px', backgroundColor: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                                >
                                    <XCircle size={18} /> Suspend Company
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Dashboard Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', marginBottom: '32px' }}>

                        {/* Info Section */}
                        <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>About Company</h3>
                            </div>
                            <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.8, marginBottom: '32px' }}>
                                {company.description || 'Chưa cập nhật thông tin giới thiệu doanh nghiệp.'}
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                {[
                                    { label: "ADDRESS/HEADQUARTERS", value: company.address || "Chưa cập nhật", icon: <MapPin size={18} color="#5C9AFF" /> },
                                    { label: "CONTACT EMAIL", value: company.email || "Chưa cập nhật", icon: <Mail size={18} color="#5C9AFF" /> },
                                    { label: "WEBSITE", value: company.website || "Chưa cập nhật", icon: <Globe size={18} color="#5C9AFF" />, link: !!company.website },
                                    { label: "REPRESENTATIVE", value: company.representative || "Chưa cập nhật", icon: <Users size={18} color="#5C9AFF" /> },
                                    { label: "TAX CODE", value: company.taxCode || "Chưa cập nhật", icon: <Activity size={18} color="#5C9AFF" /> },
                                    { label: "SCALE (EMPLOYEE COUNT)", value: company.scale || (company.employeeCount ? `${company.employeeCount} nhân viên` : "Chưa cập nhật"), icon: <Briefcase size={18} color="#5C9AFF" /> }
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <div style={{ width: '40px', height: '40px', backgroundColor: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.icon}</div>
                                        <div style={{ minWidth: 0 }}>
                                            <p style={{ fontSize: '9px', fontWeight: 900, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>{item.label}</p>
                                            <h4 style={{ fontSize: '13px', fontWeight: 800, color: item.link ? '#5C9AFF' : '#1e293b', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                                {item.link ? (
                                                    <a href={item.value.startsWith('http') ? item.value : `https://${item.value}`} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>{item.value}</a>
                                                ) : item.value}
                                            </h4>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Verification & System Check Card */}
                        <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9', position: 'relative', overflow: 'hidden' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '24px' }}>System Audit</h3>
                            
                            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '16px', marginBottom: '24px' }}>
                                <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '12px' }}>Tự động kiểm tra</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>Mã số thuế:</span>
                                        <span style={{ fontSize: '11px', fontWeight: 900, color: company.taxCode ? '#059669' : '#d97706', backgroundColor: company.taxCode ? '#dcfce7' : '#fef9c3', padding: '2px 8px', borderRadius: '6px' }}>
                                            {company.taxCode ? 'Đã cung cấp' : 'Thiếu'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>Người đại diện:</span>
                                        <span style={{ fontSize: '11px', fontWeight: 900, color: company.representative ? '#059669' : '#d97706', backgroundColor: company.representative ? '#dcfce7' : '#fef9c3', padding: '2px 8px', borderRadius: '6px' }}>
                                            {company.representative ? 'Đã cung cấp' : 'Thiếu'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>Email liên hệ:</span>
                                        <span style={{ fontSize: '11px', fontWeight: 900, color: company.email ? '#059669' : '#d97706', backgroundColor: company.email ? '#dcfce7' : '#fef9c3', padding: '2px 8px', borderRadius: '6px' }}>
                                            {company.email ? 'Đã cung cấp' : 'Thiếu'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                                    <CheckCircle2 size={16} color={company.isVerified ? "#10b981" : "#cbd5e1"} /> Trạng thái xác thực
                                </div>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                                    <CheckCircle2 size={16} color={jobs.length > 0 ? "#10b981" : "#cbd5e1"} /> Số tin đã tạo: {jobs.length} tin
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recruitment Performance Highlights */}
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9', marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '32px' }}>Recruitment Summary</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                            {[
                                { label: "TOTAL JOB POSTS", value: `${jobs.length} tin` },
                                { label: "ACTIVE JOBS", value: `${jobs.filter(j => j.status === 'ACTIVE').length} tin` },
                                { label: "DRAFT/PENDING JOBS", value: `${jobs.filter(j => j.status === 'DRAFT').length} tin` }
                            ].map((stat, i) => (
                                <div key={i} style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                                    <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px' }}>{stat.label}</p>
                                    <h4 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{stat.value}</h4>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Active Job Postings Table */}
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Job Postings ({jobs.length})</h3>
                        </div>
                        {jobs.length > 0 ? (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <th style={{ textAlign: 'left', paddingBottom: '16px', fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>POSITION</th>
                                            <th style={{ textAlign: 'left', paddingBottom: '16px', fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>LOCATION</th>
                                            <th style={{ textAlign: 'left', paddingBottom: '16px', fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>APPLICANTS</th>
                                            <th style={{ textAlign: 'left', paddingBottom: '16px', fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>DATE POSTED</th>
                                            <th style={{ textAlign: 'left', paddingBottom: '16px', fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>STATUS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {jobs.map((job, i) => (
                                            <tr key={i} style={{ borderBottom: i === jobs.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '24px 0' }}>
                                                    <h5 style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{job.title}</h5>
                                                    <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', fontWeight: 600 }}>Category ID: {job.categoryId || 'N/A'}</p>
                                                </td>
                                                <td style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{job.workLocation || 'N/A'}</td>
                                                <td style={{ fontSize: '15px', fontWeight: 800, color: '#5C9AFF' }}>{job.applicationsCount || 0}</td>
                                                <td style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{new Date(job.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <span style={{
                                                        fontSize: '9px', fontWeight: 900, padding: '4px 8px', borderRadius: '4px',
                                                        backgroundColor: job.status === 'ACTIVE' ? '#eff6ff' : '#f8fafc',
                                                        color: job.status === 'ACTIVE' ? '#5C9AFF' : '#64748b'
                                                    }}>{job.status}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={{ color: '#64748b', textAlign: 'center', padding: '24px 0', fontSize: '14px' }}>Chưa có tin tuyển dụng nào được tạo.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
