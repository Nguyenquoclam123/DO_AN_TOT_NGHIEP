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
    Brain
} from "lucide-react";
import { api } from "@/lib/api";

export default function AIModelsConfigPage() {
    const [settings, setSettings] = useState<any>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await api.get('/settings');
                setSettings(data || {});
            } catch (err) {
                console.error("Failed to fetch AI settings", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.post('/settings', settings);
            alert('AI Settings updated successfully!');
        } catch (err) {
            alert('Failed to update AI Settings');
        } finally {
            setIsSaving(false);
        }
    };

    const updateSetting = (key: string, value: any) => {
        setSettings((prev: any) => ({ ...prev, [key]: value }));
    };

    if (isLoading) return <div style={{ padding: '40px', color: '#64748b', fontWeight: 600 }}>Loading AI configuration...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h2 style={{ fontSize: '36px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>AI Models Configuration</h2>
                    <p style={{ fontSize: '15px', color: '#64748b', marginTop: '8px', fontWeight: 500 }}>Manage large language model integration and orchestration parameters.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 28px',
                        backgroundColor: isSaving ? '#94a3b8' : '#5C9AFF', color: 'white',
                        borderRadius: '16px', border: 'none', fontSize: '14px', fontWeight: 800,
                        cursor: isSaving ? 'not-allowed' : 'pointer', boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.2)',
                        transition: 'all 0.2s'
                    }}
                >
                    <Save size={18} /> {isSaving ? 'SYNCING...' : 'SAVE CHANGES'}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                    {/* Models Selection */}
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '32px', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ width: '32px', height: '32px', backgroundColor: '#eff6ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <LayoutGrid size={18} color="#5C9AFF" />
                            </div>
                            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Active Model Stack</h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <ModelCard
                                name="Gemini 1.5 Pro"
                                provider="GOOGLE AI"
                                active={settings.ai_model === 'gemini-1.5-pro'}
                                onClick={() => updateSetting('ai_model', 'gemini-1.5-pro')}
                                icon={<Zap size={20} color="#5C9AFF" />}
                            />
                            <ModelCard
                                name="Gemini 1.5 Flash"
                                provider="GOOGLE AI"
                                active={settings.ai_model === 'gemini-1.5-flash'}
                                onClick={() => updateSetting('ai_model', 'gemini-1.5-flash')}
                                icon={<Cpu size={20} color="#ea580c" />}
                            />
                        </div>
                    </div>

                    {/* System Prompt Area */}
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '32px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '32px', height: '32px', backgroundColor: '#f5f3ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <MessageSquare size={18} color="#7c3aed" />
                                </div>
                                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Global Personality Prompt</h3>
                            </div>
                            <span style={{ fontSize: '10px', fontWeight: 900, color: '#7c3aed', backgroundColor: '#f5f3ff', padding: '4px 10px', borderRadius: '6px' }}>SYSTEM ENFORCED</span>
                        </div>

                        <textarea
                            value={settings.ai_system_prompt || ''}
                            onChange={(e) => updateSetting('ai_system_prompt', e.target.value)}
                            style={{
                                width: '100%', height: '300px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
                                borderRadius: '24px', padding: '24px', fontSize: '14px', lineHeight: '1.6',
                                color: '#334155', outline: 'none', fontFamily: 'monospace', resize: 'none'
                            }}
                            placeholder="Enter system instructions for the AI engine..."
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {/* Parameters Control */}
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '32px', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                            <div style={{ width: '32px', height: '32px', backgroundColor: '#f0fdf4', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Settings2 size={18} color="#16a34a" />
                            </div>
                            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Engine Parameters</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>TEMPERATURE</label>
                                    <span style={{ fontSize: '11px', fontWeight: 900, color: '#16a34a', backgroundColor: '#f0fdf4', padding: '2px 8px', borderRadius: '4px' }}>{settings.ai_temperature || '0.3'}</span>
                                </div>
                                <input
                                    type="range" min="0" max="1" step="0.1"
                                    value={settings.ai_temperature || 0.3}
                                    onChange={(e) => updateSetting('ai_temperature', e.target.value)}
                                    style={{ width: '100%', cursor: 'pointer' }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '10px', color: '#cbd5e1', fontWeight: 700 }}>
                                    <span>PRECISE (0.0)</span>
                                    <span>CREATIVE (1.0)</span>
                                </div>
                            </div>

                            <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <Brain size={16} color="#64748b" />
                                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#1e293b' }}>Auto-Calibration</span>
                                </div>
                                <p style={{ fontSize: '11px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>AI automatically filters tokens based on confidence scores to reduce hallucination.</p>
                            </div>
                        </div>
                    </div>

                    {/* System Health */}
                    <div style={{ backgroundColor: '#0f172a', padding: '32px', borderRadius: '32px', color: 'white' }}>
                        <h4 style={{ fontSize: '11px', fontWeight: 800, color: '#5C9AFF', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px' }}>Provider Health</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
                                    <span style={{ color: '#94a3b8', fontWeight: 600 }}>Avg. Latency</span>
                                    <span style={{ fontWeight: 800 }}>1.2s</span>
                                </div>
                                <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                                    <div style={{ width: '60%', height: '100%', backgroundColor: '#22c55e', borderRadius: '2px' }} />
                                </div>
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
                                    <span style={{ color: '#94a3b8', fontWeight: 600 }}>Requests Uptime</span>
                                    <span style={{ fontWeight: 800 }}>99.9%</span>
                                </div>
                                <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                                    <div style={{ width: '99%', height: '100%', backgroundColor: '#5C9AFF', borderRadius: '2px' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ModelCard({ name, provider, active, icon, onClick }: any) {
    return (
        <div
            onClick={onClick}
            style={{
                padding: '24px', borderRadius: '24px', border: active ? '2px solid #5C9AFF' : '1px solid #f1f5f9',
                backgroundColor: active ? '#ffffff' : '#fcfcfc', cursor: 'pointer', position: 'relative',
                transition: 'all 0.2s', boxShadow: active ? '0 10px 30px -10px rgba(37, 99, 235, 0.15)' : 'none',
                opacity: active ? 1 : 0.8
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ width: '44px', height: '44px', backgroundColor: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {icon}
                </div>
                {active && (
                    <div style={{ width: '20px', height: '20px', backgroundColor: '#5C9AFF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle2 size={12} color="white" />
                    </div>
                )}
            </div>
            <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{name}</h4>
                <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', marginTop: '4px', textTransform: 'uppercase' }}>{provider}</p>
            </div>
            <div style={{
                marginTop: '16px', display: 'inline-block', padding: '4px 10px', borderRadius: '6px',
                backgroundColor: active ? '#5C9AFF' : '#f1f5f9', color: active ? 'white' : '#64748b',
                fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em'
            }}>
                {active ? 'ACTIVE MODEL' : 'SELECT PROVIDER'}
            </div>
        </div>
    );
}
