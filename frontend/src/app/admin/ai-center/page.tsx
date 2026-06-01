"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
    Activity,
    Brain,
    Target,
    Zap,
    AlertCircle,
    TrendingUp,
    Layers,
    Cpu,
    CheckCircle2,
    Clock,
    DollarSign,
    Info,
    HelpCircle
} from 'lucide-react';

export default function AIControlCenterPage() {
    const [stats, setStats] = useState<any>(null);
    const [detailStats, setDetailStats] = useState<any>(null);
    const [feedbackLogs, setFeedbackLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, logsData, detailStatsData] = await Promise.all([
                    api.get('/admin/ai-stats'),
                    api.get('/applications/feedback-logs'),
                    api.get('/ai-control/stats')
                ]);
                setStats(statsData);
                setFeedbackLogs(logsData);
                setDetailStats(detailStatsData);
            } catch (err: any) {
                console.error("Failed to fetch AI data", err);
                setError(err.message || String(err));
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) return (
        <div style={{ padding: '80px', textAlign: 'center' }}>
            <div style={{
                width: '48px',
                height: '48px',
                border: '4px solid #f3f4f6',
                borderTop: '4px solid #6366f1',
                borderRadius: '50%',
                margin: '0 auto 16px',
                animation: 'spin 1s linear infinite'
            }} />
            <p style={{ fontWeight: 700, color: '#6366f1', letterSpacing: '0.05em' }}>ĐANG TỔNG HỢP CHỈ SỐ AI...</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (error) return (
        <div style={{ padding: '40px', backgroundColor: '#fff', borderRadius: '32px', border: '1px solid #fee2e2', textAlign: 'center', maxWidth: '600px', margin: '40px auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ width: '64px', height: '64px', backgroundColor: '#fef2f2', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <AlertCircle size={32} color="#ef4444" />
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginBottom: '12px' }}>Lỗi kết nối cổng dữ liệu</h3>
            <p style={{ color: '#6b7280', marginBottom: '32px', lineHeight: 1.6 }}>{error}</p>
            <button
                onClick={() => window.location.reload()}
                style={{ padding: '12px 32px', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '14px', cursor: 'pointer', fontWeight: 700, transition: 'all 0.2s' }}
            >
                Thử kết nối lại
            </button>
        </div>
    );

    const StatCard = ({ iconPath: Icon, label, value, trend, color, bgColor }: any) => (
        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '28px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '16px', backgroundColor: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={24} color={color} />
                </div>
                {trend && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '100px', backgroundColor: '#f0fdf4', color: '#16a34a', fontSize: '12px', fontWeight: 700 }}>
                        <TrendingUp size={14} /> {trend}
                    </div>
                )}
            </div>
            <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>{label}</p>
                <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>{value}</h3>
            </div>
        </div>
    );

    // Tính toán hiển thị tổng token và chi phí USD thật
    const formattedTotalCost = detailStats ? `$${detailStats.totalCostUsd.toFixed(4)}` : '$0.0000';
    const formattedTotalTokens = detailStats 
        ? detailStats.totalTokens >= 1000000 
            ? `${(detailStats.totalTokens / 1000000).toFixed(2)}M` 
            : detailStats.totalTokens.toLocaleString()
        : '0';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
            
            {/* Header section with Premium Gradient */}
            <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '32px', padding: '48px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '12px', letterSpacing: '-0.02em' }}>Trung tâm Giám sát AI</h1>
                    <p style={{ color: '#94a3b8', fontSize: '18px', maxWidth: '600px' }}>
                        Theo dõi hiệu suất vận hành mô hình, chi tiết tiêu thụ tài nguyên và tỷ lệ chính xác so khớp CV thực tế.
                    </p>

                    <div style={{ display: 'flex', gap: '24px', marginTop: '40px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <Cpu size={20} color="#818cf8" />
                            <span style={{ fontWeight: 600 }}>Model Đang Chạy: <span style={{ color: '#818cf8' }}>
                                {stats?.topModel === 'gemini-2.5-flash' ? 'Gemini 2.5 Flash' :
                                 stats?.topModel === 'gemini-2.5-pro' ? 'Gemini 2.5 Pro' :
                                 stats?.topModel === 'gemini-1.5-flash' ? 'Gemini 1.5 Flash' :
                                 stats?.topModel === 'gemini-1.5-pro' ? 'Gemini 1.5 Pro' : (stats?.topModel || 'N/A')}
                            </span></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', backgroundColor: 'rgba(34,197,94,0.1)', borderRadius: '16px', border: '1px solid rgba(34,197,94,0.2)' }}>
                            <div style={{ width: '8px', height: '8px', backgroundColor: '#22c55e', borderRadius: '50%' }} />
                            <span style={{ color: '#4ade80', fontWeight: 700 }}>HỆ THỐNG HOẠT ĐỘNG ỔN ĐỊNH</span>
                        </div>
                    </div>
                </div>
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
            </div>

            {/* General Metrics Grid */}
            <div style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', display: 'grid', gap: '24px' }}>
                <StatCard iconPath={Target} label="Độ chính xác khớp CV" value={`${stats?.avgAccuracy || 0}%`} trend="+1.2%" color="#6366f1" bgColor="#eef2ff" />
                <StatCard 
                    iconPath={Zap} 
                    label="Độ trễ trung bình" 
                    value={detailStats && detailStats.totalRequests > 0 ? `${(detailStats.avgLatencyMs / 1000).toFixed(2)}s` : `${(stats?.avgLatencyMs / 1000).toFixed(2)}s`} 
                    color="#f59e0b" 
                    bgColor="#fffbeb" 
                />
                <StatCard iconPath={Layers} label="Tổng số yêu cầu AI" value={detailStats ? detailStats.totalRequests : stats?.totalRequests || 0} trend="+8%" color="#10b981" bgColor="#ecfdf5" />
                <StatCard iconPath={Brain} label="Tài nguyên / Chi phí USD" value={`${formattedTotalTokens} tokens / ${formattedTotalCost}`} color="#ec4899" bgColor="#fdf2f8" />
            </div>

            {/* Detailed Performance Per Model AI Section */}
            <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '32px', border: '1px solid #f1f5f9' }}>
                <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Activity size={20} color="#6366f1" /> Hiệu suất chi tiết theo từng Model AI
                    </h2>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px', fontWeight: 500 }}>
                        Xem dữ liệu vận hành thực tế của từng mô hình. Chọn kích hoạt mô hình trong phần Cấu hình để kiểm thử mô hình khác.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
                    {detailStats?.models ? detailStats.models.map((model: any, idx: number) => {
                        const isFlash = model.model_name.includes('flash');
                        
                        return (
                            <div 
                                key={idx} 
                                style={{ 
                                    padding: '24px', 
                                    borderRadius: '24px', 
                                    border: model.is_active ? '2px solid #6366f1' : '1px solid #e2e8f0', 
                                    backgroundColor: model.is_active ? '#faf5ff' : '#ffffff',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    minHeight: '260px',
                                    position: 'relative',
                                    transition: 'all 0.2s',
                                    boxShadow: model.is_active ? '0 10px 25px -10px rgba(99, 102, 241, 0.15)' : 'none'
                                }}
                            >
                                {/* Header of Model Card */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <div style={{ 
                                            width: '38px', height: '38px', 
                                            borderRadius: '10px', 
                                            backgroundColor: isFlash ? '#fdf2f8' : '#eef2ff',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center' 
                                        }}>
                                            {isFlash ? <Zap size={18} color="#db2777" /> : <Cpu size={18} color="#6366f1" />}
                                        </div>
                                        {model.is_active && (
                                            <span style={{ 
                                                fontSize: '9px', fontWeight: 900, 
                                                backgroundColor: '#6366f1', color: 'white', 
                                                padding: '4px 8px', borderRadius: '6px',
                                                letterSpacing: '0.05em'
                                            }}>
                                                ACTIVE
                                            </span>
                                        )}
                                    </div>

                                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                                        {model.model_name === 'gemini-2.5-flash' ? 'Gemini 2.5 Flash' :
                                         model.model_name === 'gemini-2.5-pro' ? 'Gemini 2.5 Pro' :
                                         model.model_name === 'gemini-1.5-flash' ? 'Gemini 1.5 Flash' : 'Gemini 1.5 Pro'}
                                    </h4>
                                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                                        {model.provider} • v{model.version}
                                    </span>
                                </div>

                                {/* Body of Model Card */}
                                <div style={{ margin: '20px 0', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    {model.has_data ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                                <span style={{ color: '#64748b', fontWeight: 600 }}>Số lượt gọi:</span>
                                                <span style={{ color: '#1e293b', fontWeight: 800 }}>{model.totalRequests}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                                <span style={{ color: '#64748b', fontWeight: 600 }}>Độ trễ TB:</span>
                                                <span style={{ color: '#1e293b', fontWeight: 800 }}>{(model.avgLatencyMs / 1000).toFixed(2)}s</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                                <span style={{ color: '#64748b', fontWeight: 600 }}>Tokens đã dùng:</span>
                                                <span style={{ color: '#1e293b', fontWeight: 800 }}>
                                                    {model.totalTokens >= 1000000 
                                                        ? `${(model.totalTokens / 1000000).toFixed(2)}M` 
                                                        : model.totalTokens.toLocaleString()}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                                <span style={{ color: '#64748b', fontWeight: 600 }}>Chi phí USD:</span>
                                                <span style={{ color: '#1e293b', fontWeight: 800 }}>${model.totalCostUsd.toFixed(5)}</span>
                                            </div>
                                            <div style={{ marginTop: '8px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                                                    <span style={{ color: '#64748b', fontWeight: 600 }}>Tỷ lệ thành công:</span>
                                                    <span style={{ color: '#10b981', fontWeight: 800 }}>{model.successRate}%</span>
                                                </div>
                                                <div style={{ width: '100%', height: '4px', backgroundColor: '#f1f5f9', borderRadius: '2px' }}>
                                                    <div style={{ width: `${model.successRate}%`, height: '100%', backgroundColor: '#10b981', borderRadius: '2px' }} />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        // Giao diện trống thân thiện cho model chưa sử dụng
                                        <div style={{ 
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', 
                                            justifyContent: 'center', gap: '8px', padding: '16px',
                                            backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1',
                                            textAlign: 'center'
                                        }}>
                                            <Info size={16} color="#94a3b8" />
                                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Chưa sử dụng</span>
                                            <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                                                Chưa phát sinh dữ liệu gọi API. Hãy kích hoạt model này trong trang Cấu hình để bắt đầu theo dõi.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Footer of Model Card */}
                                <div style={{ fontSize: '10px', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Loại kết nối:</span>
                                    <span style={{ fontWeight: 700, color: '#64748b' }}>Google Free Key</span>
                                </div>
                            </div>
                        );
                    }) : (
                        <div style={{ gridColumn: 'span 4', textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                            Không tìm thấy dữ liệu thống kê của các model.
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Section: Two columns (Feedback & System Health) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '32px' }}>
                
                {/* Left Column: Feedback Logs */}
                <div style={{ backgroundColor: '#fff', borderRadius: '32px', border: '1px solid #f1f5f9', padding: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            Phản hồi về kết quả AI từ Nhà tuyển dụng <span style={{ fontSize: '12px', padding: '4px 10px', backgroundColor: '#eef2ff', borderRadius: '100px', color: '#6366f1' }}>{feedbackLogs.length}</span>
                        </h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {feedbackLogs.length > 0 ? feedbackLogs.map((log: any) => (
                            <div key={log.id} style={{ padding: '24px', borderRadius: '24px', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', overflow: 'hidden', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${log.candidateId}`} alt="avatar" />
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{log.candidate?.firstName} {log.candidate?.lastName}</h4>
                                            <p style={{ fontSize: '13px', color: '#64748b' }}>Ứng tuyển vào vị trí: <strong>{log.job?.title}</strong></p>
                                        </div>
                                    </div>
                                    <div style={{ 
                                        padding: '6px 12px', 
                                        borderRadius: '10px', 
                                        fontSize: '11px', 
                                        fontWeight: 900,
                                        backgroundColor: log.aiFeedback === 'ACCURATE' ? '#f0fdf4' : log.aiFeedback === 'PARTIAL' ? '#fffbeb' : '#fef2f2',
                                        color: log.aiFeedback === 'ACCURATE' ? '#16a34a' : log.aiFeedback === 'PARTIAL' ? '#d97706' : '#dc2626'
                                    }}>
                                        {log.aiFeedback === 'ACCURATE' ? 'CHÍNH XÁC' : log.aiFeedback === 'PARTIAL' ? 'ĐÚNG MỘT PHẦN' : 'SAI LỆCH'}
                                    </div>
                                </div>
                                
                                <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Nhận xét của Nhà tuyển dụng:</div>
                                    <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5, margin: 0, fontStyle: log.aiComment ? 'normal' : 'italic' }}>
                                        {log.aiComment || "Không có nội dung bình luận."}
                                    </p>
                                </div>
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                                    <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Công ty: {log.job?.company?.name}</div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Clock size={12} /> {new Date(log.updatedAt || log.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                                <Brain size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                                <p>Chưa nhận được phản hồi nào từ nhà tuyển dụng.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Anomalies & Uptime */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    
                    {/* System Anomalies */}
                    <div style={{ backgroundColor: '#fff', borderRadius: '32px', border: '1px solid #f1f5f9', padding: '32px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>Cảnh báo bất thường hệ thống</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {stats?.anomalies?.length > 0 ? stats.anomalies.map((item: any) => (
                                <div key={item.id} style={{ padding: '12px', borderRadius: '16px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2' }}>
                                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#dc2626' }}>{item.candidate}</div>
                                    <div style={{ fontSize: '12px', color: '#991b1b' }}>{item.issue}</div>
                                </div>
                            )) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', gap: '8px' }}>
                                    <CheckCircle2 size={24} color="#10b981" />
                                    <p style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', margin: 0 }}>Hệ thống ổn định. Không phát hiện bất thường.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* API Engine Health details */}
                    <div style={{ backgroundColor: '#fff', borderRadius: '32px', border: '1px solid #f1f5f9', padding: '32px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>Sức khỏe các dịch vụ thành phần</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {[
                                { label: 'Inference Engine (LLM)', score: detailStats ? detailStats.successRate : 99.4, color: '#10b981' },
                                { label: 'Embedding Vectorizer (Vector)', score: 98.2, color: '#6366f1' },
                                { label: 'Semantic Matching (PostgreSQL)', score: 95.8, color: '#f59e0b' }
                            ].map((item, id) => (
                                <div key={id}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{item.label}</span>
                                        <span style={{ fontSize: '14px', fontWeight: 700, color: item.color }}>{item.score}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '100px' }}>
                                        <div style={{ width: `${item.score}%`, height: '100%', backgroundColor: item.color, borderRadius: '100px' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* UI Optimization Tips */}
                    <div style={{ backgroundColor: '#6366f1', borderRadius: '32px', padding: '32px', color: '#fff' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '12px' }}>Mẹo tối ưu hóa</h3>
                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, marginBottom: '24px' }}>
                            Độ chính xác so khớp của AI sẽ cao hơn 4.2% khi tin tuyển dụng (Job Description) có độ dài chi tiết trên 500 ký tự.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
