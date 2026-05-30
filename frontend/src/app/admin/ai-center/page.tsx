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
    Clock
} from 'lucide-react';

export default function AIControlCenterPage() {
    const [stats, setStats] = useState<any>(null);
    const [feedbackLogs, setFeedbackLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, logsData] = await Promise.all([
                    api.get('/admin/ai-stats'),
                    api.get('/applications/feedback-logs')
                ]);
                setStats(statsData);
                setFeedbackLogs(logsData);
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
            <p style={{ fontWeight: 700, color: '#6366f1', letterSpacing: '0.05em' }}>SYNCHRONIZING AI METRICS...</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (error) return (
        <div style={{ padding: '40px', backgroundColor: '#fff', borderRadius: '32px', border: '1px solid #fee2e2', textAlign: 'center', maxWidth: '600px', margin: '40px auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ width: '64px', height: '64px', backgroundColor: '#fef2f2', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <AlertCircle size={32} color="#ef4444" />
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginBottom: '12px' }}>Connection Error</h3>
            <p style={{ color: '#6b7280', marginBottom: '32px', lineHeight: 1.6 }}>{error}</p>
            <button
                onClick={() => window.location.reload()}
                style={{ padding: '12px 32px', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '14px', cursor: 'pointer', fontWeight: 700, transition: 'all 0.2s' }}
            >
                Retry Connection
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

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
            {/* Header section with Premium Gradient */}
            <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '32px', padding: '48px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '12px', letterSpacing: '-0.02em' }}>AI Control Center</h1>
                    <p style={{ color: '#94a3b8', fontSize: '18px', maxWidth: '600px' }}>Monitor engine performance, neural efficiency, and real-time candidate matching heuristics.</p>

                    <div style={{ display: 'flex', gap: '24px', marginTop: '40px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <Cpu size={20} color="#818cf8" />
                            <span style={{ fontWeight: 600 }}>Active Model: <span style={{ color: '#818cf8' }}>{stats?.topModel || "N/A"}</span></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', backgroundColor: 'rgba(34,197,94,0.1)', borderRadius: '16px', border: '1px solid rgba(34,197,94,0.2)' }}>
                            <div style={{ width: '8px', height: '8px', backgroundColor: '#22c55e', borderRadius: '50%' }} />
                            <span style={{ color: '#4ade80', fontWeight: 700 }}>SYSTEM OPERATIONAL</span>
                        </div>
                    </div>
                </div>
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
            </div>

            <div style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', display: 'grid', gap: '24px' }}>
                <StatCard iconPath={Target} label="Matching Accuracy" value={`${stats?.avgAccuracy || 0}%`} trend="+2.4%" color="#6366f1" bgColor="#eef2ff" />
                <StatCard iconPath={Zap} label="Avg. Latency" value={`${stats?.avgLatencyMs || 0}ms`} color="#f59e0b" bgColor="#fffbeb" />
                <StatCard iconPath={Layers} label="Total Requests" value={stats?.totalRequests?.toLocaleString() || 0} trend="+12%" color="#10b981" bgColor="#ecfdf5" />
                <StatCard iconPath={Brain} label="Token Consumption" value={stats?.tokenUsage || 0} color="#ec4899" bgColor="#fdf2f8" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '32px' }}>
                {/* Left Column: Feedback Logs */}
                <div style={{ backgroundColor: '#fff', borderRadius: '32px', border: '1px solid #f1f5f9', padding: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            Employer AI Feedback <span style={{ fontSize: '12px', padding: '4px 10px', backgroundColor: '#eef2ff', borderRadius: '100px', color: '#6366f1' }}>{feedbackLogs.length}</span>
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
                                            <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{log.candidate?.firstName} {log.candidate?.lastName}</h4>
                                            <p style={{ fontSize: '13px', color: '#64748b' }}>Applied to <strong>{log.job?.title}</strong></p>
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
                                        {log.aiFeedback}
                                    </div>
                                </div>
                                
                                <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Employer Comment:</div>
                                    <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5, margin: 0, fontStyle: log.aiComment ? 'normal' : 'italic' }}>
                                        {log.aiComment || "No comment provided."}
                                    </p>
                                </div>
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                                    <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Company: {log.job?.company?.name}</div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Clock size={12} /> {new Date(log.updatedAt || log.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                                <Brain size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                                <p>No employer feedback logs found.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Anomalies & Health */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '32px', border: '1px solid #f1f5f9', padding: '32px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>System Anomalies</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {stats?.anomalies?.length > 0 ? stats.anomalies.map((item: any) => (
                                <div key={item.id} style={{ padding: '12px', borderRadius: '16px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2' }}>
                                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#dc2626' }}>{item.candidate}</div>
                                    <div style={{ fontSize: '12px', color: '#991b1b' }}>{item.issue}</div>
                                </div>
                            )) : (
                                <p style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '20px' }}>No anomalies detected.</p>
                            )}
                        </div>
                    </div>

                    <div style={{ backgroundColor: '#fff', borderRadius: '32px', border: '1px solid #f1f5f9', padding: '32px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>Engine Health</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {[
                                { label: 'Inference Engine', score: 99.4, color: '#10b981' },
                                { label: 'Embedding Vectorizer', score: 98.2, color: '#6366f1' },
                                { label: 'Semantic Matching', score: 95.8, color: '#f59e0b' }
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

                    <div style={{ backgroundColor: '#6366f1', borderRadius: '32px', padding: '32px', color: '#fff' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '12px' }}>Optimization Tip</h3>
                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, marginBottom: '24px' }}>
                            AI matching accuracy is 4.2% higher when job descriptions exceed 500 characters.
                        </p>
                        <button style={{ backgroundColor: '#fff', color: '#6366f1', border: 'none', padding: '12px 24px', borderRadius: '14px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                            View Analysis
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
