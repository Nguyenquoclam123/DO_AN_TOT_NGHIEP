"use client";

import React, { useEffect, useState } from "react";
import {
    Settings2,
    Save,
    Cpu,
    Zap,
    CheckCircle2,
    LayoutGrid,
    MessageSquare,
    Brain,
    HelpCircle,
    Info,
    Activity,
    AlertCircle
} from "lucide-react";
import { api } from "@/lib/api";

interface AIModelConfig {
    id: string;
    model_name: string;
    version: string;
    provider: string;
    temperature: number;
    max_tokens: number;
    system_prompt: string;
    is_active: boolean;
}

export default function AIModelsConfigPage() {
    const [configs, setConfigs] = useState<AIModelConfig[]>([]);
    const [selectedConfig, setSelectedConfig] = useState<AIModelConfig | null>(null);
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const promptTemplates = [
        {
            name: "Mẫu Cân bằng & Khách quan (Mặc định)",
            prompt: "You are Nexus Talent AI, a high-performance recruitment orchestration agent. Your evaluation must be objective, fair, and based strictly on the evidence in the candidate CV relative to the Job Description."
        },
        {
            name: "Mẫu Chuyên gia Công nghệ Khắt khe",
            prompt: "You are a Senior Technical Recruiter at Nexus AI. Analyze technical stack alignment rigorously. Rate experience with practical frameworks higher than general statements. Flag any missing core technologies as risks."
        },
        {
            name: "Mẫu Tư vấn & Hướng nghiệp (Hỗ trợ CV)",
            prompt: "You are an empathetic Career Coach and HR consultant at Nexus AI. Your tone is supportive. Focus heavily on providing candidate resume improvement ideas, highlight hidden strengths, and offer actionable suggestions."
        }
    ];

    const fetchAllData = async () => {
        try {
            const [configsData, statsData] = await Promise.all([
                api.get<AIModelConfig[]>('/ai-control/configs'),
                api.get<any>('/ai-control/stats')
            ]);
            
            setConfigs(configsData || []);
            setStats(statsData);

            // Chọn model đang active làm selected ban đầu
            if (configsData && configsData.length > 0) {
                const active = configsData.find(c => c.is_active);
                setSelectedConfig(active ? { ...active } : { ...configsData[0] });
            }
        } catch (err) {
            console.error("Failed to fetch AI settings", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleSave = async () => {
        if (!selectedConfig) return;
        setIsSaving(true);
        setNotification(null);

        try {
            await api.patch(`/ai-control/configs/${selectedConfig.id}`, selectedConfig);
            
            // Hiển thị thông báo thành công
            showNotification('success', `Đã lưu cấu hình và kích hoạt model ${selectedConfig.model_name}!`);
            
            // Reload lại dữ liệu từ backend để đảm bảo trạng thái active cập nhật đồng bộ ở tất cả các thẻ
            await fetchAllData();
        } catch (err: any) {
            console.error(err);
            showNotification('error', err.message || 'Lỗi khi lưu cấu hình model AI');
        } finally {
            setIsSaving(false);
        }
    };

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => {
            setNotification(null);
        }, 5000);
    };

    const handleSelectModel = (configId: string) => {
        const found = configs.find(c => c.id === configId);
        if (found) {
            setSelectedConfig({ ...found });
        }
    };

    const updateSelectedField = (key: keyof AIModelConfig, value: any) => {
        if (!selectedConfig) return;
        setSelectedConfig(prev => prev ? ({ ...prev, [key]: value }) : null);
    };

    const applyTemplate = (promptText: string) => {
        updateSelectedField('system_prompt', promptText);
        showNotification('success', 'Đã áp dụng mẫu chỉ dẫn hệ thống!');
    };

    // Helper giải thích thông số nhiệt độ
    const getTemperatureGuide = (temp: number) => {
        if (temp <= 0.3) return "Chế độ Tập trung: Phân tích chính xác, so khớp kỹ năng và chấm điểm chặt chẽ.";
        if (temp <= 0.6) return "Chế độ Cân bằng: Đánh giá tổng quan hài hòa giữa kinh nghiệm và kỹ năng mềm.";
        return "Chế độ Sáng tạo: Tạo câu hỏi phỏng vấn đa chiều và gợi ý tối ưu CV phong phú.";
    };

    // Helper lấy màu nhiệt độ
    const getTemperatureColor = (temp: number) => {
        if (temp <= 0.3) return "#16a34a"; // Green
        if (temp <= 0.6) return "#2563eb"; // Blue
        return "#ea580c"; // Orange
    };

    if (isLoading) return <div style={{ padding: '40px', color: '#64748b', fontWeight: 600 }}>Loading AI configurations...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative' }}>
            
            {/* Success/Error Alert Toast */}
            {notification && (
                <div style={{
                    position: 'fixed', top: '24px', right: '24px', zIndex: 1000,
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 24px',
                    borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                    backgroundColor: notification.type === 'success' ? '#f0fdf4' : '#fef2f2',
                    border: `1px solid ${notification.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                    animation: 'slideIn 0.3s ease-out'
                }}>
                    {notification.type === 'success' ? (
                        <CheckCircle2 size={20} color="#15803d" />
                    ) : (
                        <AlertCircle size={20} color="#b91c1c" />
                    )}
                    <span style={{ fontSize: '14px', fontWeight: 700, color: notification.type === 'success' ? '#15803d' : '#b91c1c' }}>
                        {notification.message}
                    </span>
                    <style>{`
                        @keyframes slideIn {
                            from { transform: translateY(-20px); opacity: 0; }
                            to { transform: translateY(0); opacity: 1; }
                        }
                    `}</style>
                </div>
            )}

            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Cấu hình Model AI</h2>
                    <p style={{ fontSize: '15px', color: '#64748b', marginTop: '8px', fontWeight: 500 }}>
                        Quản lý tham số mô hình ngôn ngữ lớn (LLM), chỉ dẫn prompt và phân phối hoạt động của Nexus AI.
                    </p>
                </div>
                {selectedConfig && (
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 28px',
                            backgroundColor: isSaving ? '#94a3b8' : '#2563eb', color: 'white',
                            borderRadius: '16px', border: 'none', fontSize: '14px', fontWeight: 800,
                            cursor: isSaving ? 'not-allowed' : 'pointer', boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.2)',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Save size={18} /> {isSaving ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI'}
                    </button>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px' }}>
                
                {/* Left Area - Settings Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                    {/* Models Selection */}
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '32px', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ width: '32px', height: '32px', backgroundColor: '#eff6ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <LayoutGrid size={18} color="#2563eb" />
                            </div>
                            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Danh sách Model AI</h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            {configs.map((config) => {
                                const isSelected = selectedConfig?.id === config.id;
                                const isFlash = config.model_name.includes('flash');
                                
                                return (
                                    <div
                                        key={config.id}
                                        onClick={() => handleSelectModel(config.id)}
                                        style={{
                                            padding: '24px', borderRadius: '24px', 
                                            border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                                            backgroundColor: isSelected ? '#ffffff' : '#f8fafc', 
                                            cursor: 'pointer', position: 'relative',
                                            transition: 'all 0.2s', 
                                            boxShadow: isSelected ? '0 10px 30px -10px rgba(37, 99, 235, 0.15)' : 'none',
                                            opacity: isSelected ? 1 : 0.8
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                            <div style={{ 
                                                width: '44px', height: '44px', 
                                                backgroundColor: isFlash ? '#fdf2f8' : '#eff6ff', 
                                                borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                                            }}>
                                                {isFlash ? <Zap size={20} color="#db2777" /> : <Cpu size={20} color="#2563eb" />}
                                            </div>
                                            
                                            {config.is_active ? (
                                                <div style={{ 
                                                    padding: '4px 10px', borderRadius: '8px', 
                                                    backgroundColor: '#dcfce7', color: '#15803d',
                                                    fontSize: '9px', fontWeight: 900, letterSpacing: '0.05em' 
                                                }}>
                                                    ĐANG CHẠY CHÍNH
                                                </div>
                                            ) : (
                                                <div style={{ 
                                                    padding: '4px 10px', borderRadius: '8px', 
                                                    backgroundColor: '#f1f5f9', color: '#64748b',
                                                    fontSize: '9px', fontWeight: 900, letterSpacing: '0.05em' 
                                                }}>
                                                    NGOẠI TUYẾN
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                                                {config.model_name === 'gemini-2.5-flash' ? 'Gemini 2.5 Flash' :
                                                 config.model_name === 'gemini-2.5-pro' ? 'Gemini 2.5 Pro' :
                                                 config.model_name === 'gemini-1.5-flash' ? 'Gemini 1.5 Flash' : 'Gemini 1.5 Pro'}
                                            </h4>
                                            <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', marginTop: '4px', textTransform: 'uppercase' }}>
                                                {config.provider} • v{config.version}
                                            </p>
                                            
                                            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '12px', lineHeight: '1.4', minHeight: '34px' }}>
                                                {isFlash 
                                                    ? "Xử lý tốc độ cao, tiết kiệm tài nguyên. Phù hợp cho hầu hết tác vụ thông thường." 
                                                    : "Trí tuệ nhân tạo chuyên sâu, phân tích cấu trúc phức tạp & lập luận sắc bén."
                                                }
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Selected Model Configurations */}
                    {selectedConfig && (
                        <>
                            {/* Parameters Block */}
                            <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '32px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '28px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '32px', height: '32px', backgroundColor: '#f0fdf4', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Settings2 size={18} color="#16a34a" />
                                    </div>
                                    <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                        Tham số vận hành của {selectedConfig.model_name}
                                    </h3>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    
                                    {/* Active toggle */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                        <div>
                                            <span style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b' }}>Kích hoạt model này</span>
                                            <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0' }}>Khi bật, model này sẽ thay thế model hiện tại để chấm điểm toàn bộ CV/JD mới.</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={selectedConfig.is_active}
                                            onChange={(e) => updateSelectedField('is_active', e.target.checked)}
                                            style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#2563eb' }}
                                        />
                                    </div>

                                    {/* Temperature Slider */}
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                NHIỆT ĐỘ SÁNG TẠO (TEMPERATURE)
                                                <HelpCircle size={14} style={{ cursor: 'help' }} title="Mức độ ngẫu nhiên của câu trả lời. Số càng thấp, AI trả lời càng chính xác và ổn định." />
                                            </span>
                                            <span style={{ 
                                                fontSize: '11px', fontWeight: 900, 
                                                color: getTemperatureColor(selectedConfig.temperature), 
                                                backgroundColor: `${getTemperatureColor(selectedConfig.temperature)}12`, 
                                                padding: '3px 10px', borderRadius: '6px' 
                                            }}>
                                                {selectedConfig.temperature}
                                            </span>
                                        </div>
                                        
                                        <input
                                            type="range" min="0" max="1" step="0.1"
                                            value={selectedConfig.temperature}
                                            onChange={(e) => updateSelectedField('temperature', parseFloat(e.target.value))}
                                            style={{ width: '100%', cursor: 'pointer', accentColor: getTemperatureColor(selectedConfig.temperature) }}
                                        />
                                        
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>
                                            <span>CHÍNH XÁC CAO (0.0)</span>
                                            <span>SÁNG TẠO CAO (1.0)</span>
                                        </div>
                                        
                                        {/* Hướng dẫn tiếng Việt thân thiện */}
                                        <div style={{ 
                                            marginTop: '12px', padding: '12px 16px', 
                                            backgroundColor: '#f8fafc', borderRadius: '12px', 
                                            borderLeft: `3px solid ${getTemperatureColor(selectedConfig.temperature)}`,
                                            fontSize: '12px', color: '#475569', fontWeight: 500 
                                        }}>
                                            {getTemperatureGuide(selectedConfig.temperature)}
                                        </div>
                                    </div>

                                    {/* Max Tokens Selection */}
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                GIỚI HẠN TỪ ĐẦU RA (MAX TOKENS)
                                                <HelpCircle size={14} style={{ cursor: 'help' }} title="Độ dài tối đa của câu trả lời AI tạo ra. 1 token tương đương khoảng 0.75 từ tiếng Anh." />
                                            </span>
                                        </div>
                                        
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <button
                                                type="button"
                                                onClick={() => updateSelectedField('max_tokens', 4096)}
                                                style={{
                                                    padding: '16px', borderRadius: '16px', cursor: 'pointer',
                                                    border: selectedConfig.max_tokens === 4096 ? '2px solid #2563eb' : '1px solid #e2e8f0',
                                                    backgroundColor: selectedConfig.max_tokens === 4096 ? '#eff6ff' : '#ffffff',
                                                    color: selectedConfig.max_tokens === 4096 ? '#2563eb' : '#475569',
                                                    fontWeight: 700, fontSize: '13px', transition: 'all 0.2s', textAlign: 'left'
                                                }}
                                            >
                                                <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '4px' }}>4,096 Tokens</div>
                                                <div style={{ fontSize: '11px', fontWeight: 500, color: '#64748b' }}>Phù hợp báo cáo phân tích CV thông thường, tối ưu tốc độ.</div>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => updateSelectedField('max_tokens', 8192)}
                                                style={{
                                                    padding: '16px', borderRadius: '16px', cursor: 'pointer',
                                                    border: selectedConfig.max_tokens === 8192 ? '2px solid #2563eb' : '1px solid #e2e8f0',
                                                    backgroundColor: selectedConfig.max_tokens === 8192 ? '#eff6ff' : '#ffffff',
                                                    color: selectedConfig.max_tokens === 8192 ? '#2563eb' : '#475569',
                                                    fontWeight: 700, fontSize: '13px', transition: 'all 0.2s', textAlign: 'left'
                                                }}
                                            >
                                                <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '4px' }}>8,192 Tokens</div>
                                                <div style={{ fontSize: '11px', fontWeight: 500, color: '#64748b' }}>Cần thiết cho báo cáo cực kỳ chi tiết, nhiều mục so sánh.</div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* System Prompt Block */}
                            <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '32px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '32px', height: '32px', backgroundColor: '#f5f3ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <MessageSquare size={18} color="#7c3aed" />
                                        </div>
                                        <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                            Chỉ dẫn hệ thống (System Prompt)
                                        </h3>
                                    </div>
                                </div>

                                <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                                    Chỉ dẫn hệ thống thiết lập tính cách, quy định chuẩn định dạng và quy tắc hoạt động của AI. Bạn có thể sử dụng các mẫu soạn sẵn dưới đây để áp dụng nhanh:
                                </p>

                                {/* Prompt Templates */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    {promptTemplates.map((tpl, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => applyTemplate(tpl.prompt)}
                                            style={{
                                                padding: '8px 14px', borderRadius: '10px', fontSize: '11px', fontWeight: 700,
                                                backgroundColor: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe',
                                                cursor: 'pointer', transition: 'all 0.2s'
                                            }}
                                            type="button"
                                        >
                                            {tpl.name}
                                        </button>
                                    ))}
                                </div>

                                <textarea
                                    value={selectedConfig.system_prompt || ''}
                                    onChange={(e) => updateSelectedField('system_prompt', e.target.value)}
                                    style={{
                                        width: '100%', height: '220px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
                                        borderRadius: '24px', padding: '24px', fontSize: '13px', lineHeight: '1.6',
                                        color: '#334155', outline: 'none', fontFamily: 'monospace', resize: 'none'
                                    }}
                                    placeholder="Nhập chỉ dẫn hệ thống cho AI..."
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Right Area - Uptime and Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    
                    {/* Free Tier Announcement */}
                    <div style={{ 
                        backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', 
                        padding: '24px', borderRadius: '32px', color: '#1e3a8a' 
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <Info size={18} color="#2563eb" />
                            <span style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase' }}>Google AI Studio Free Tier</span>
                        </div>
                        <p style={{ fontSize: '11px', color: '#3b82f6', margin: 0, fontWeight: 700 }}>CHẾ ĐỘ MIỄN PHÍ</p>
                        <p style={{ fontSize: '12px', color: '#1e40af', marginTop: '10px', lineHeight: 1.5 }}>
                            Hệ thống được cấu hình chạy trên nền tảng khóa API miễn phí từ Google. 
                            Có giới hạn tần suất yêu cầu:
                            <br />
                            • <strong>Flash:</strong> Tối đa 15 RPM (yêu cầu/phút)
                            <br />
                            • <strong>Pro:</strong> Tối đa 2 RPM (yêu cầu/phút)
                        </p>
                    </div>

                    {/* System Health */}
                    <div style={{ backgroundColor: '#0f172a', padding: '32px', borderRadius: '32px', color: 'white' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <Activity size={18} color="#38bdf8" />
                            <h4 style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
                                Sức khỏe cổng API (Provider Health)
                            </h4>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
                                    <span style={{ color: '#94a3b8', fontWeight: 600 }}>Độ trễ trung bình</span>
                                    <span style={{ fontWeight: 800 }}>
                                        {stats ? `${(stats.avgLatencyMs / 1000).toFixed(2)}s` : '0.0s'}
                                    </span>
                                </div>
                                <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                                    <div style={{ 
                                        width: stats ? `${Math.min(100, Math.max(10, (1 - stats.avgLatencyMs / 5000) * 100))}%` : '0%', 
                                        height: '100%', backgroundColor: '#22c55e', borderRadius: '2px' 
                                    }} />
                                </div>
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
                                    <span style={{ color: '#94a3b8', fontWeight: 600 }}>Tỷ lệ gọi thành công</span>
                                    <span style={{ fontWeight: 800 }}>{stats ? `${stats.successRate}%` : '100%'}</span>
                                </div>
                                <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                                    <div style={{ 
                                        width: stats ? `${stats.successRate}%` : '100%', 
                                        height: '100%', backgroundColor: '#38bdf8', borderRadius: '2px' 
                                    }} />
                                </div>
                            </div>
                        </div>
                        
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '20px', paddingTop: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
                                <span>Tổng số cuộc gọi:</span>
                                <span style={{ color: 'white', fontWeight: 700 }}>{stats?.totalRequests || 0}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
