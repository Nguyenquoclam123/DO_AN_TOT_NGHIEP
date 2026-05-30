"use client";

import React from "react";
import {
    Search,
    Download,
    RefreshCcw,
    ChevronDown,
    BarChart3,
    Database,
    Zap,
    History
} from "lucide-react";

export default function AIProcessingLogsPage() {
    const stats = [
        { label: "SCORE VARIANCE INDEX", value: "0%", sub: "Waiting for first match", badge: "IDLE", badgeColor: "#94a3b8", bg: "#f1f5f9" },
        { label: "AI ACCEPTANCE RATE", value: "0%", sub: "No data available", trend: "0% change", trendColor: "#94a3b8" },
        { label: "AVG LATENCY", value: "0s", sub: "Engine on standby", target: "Target: <15s" },
    ];

    return (
        <div style={{ padding: '40px', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: 0 }}>AI Processing Logs</h1>
                    <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>Monitor and audit real-time AI recruitment operations.</p>
                </div>
                <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#5C9AFF', color: 'white', borderRadius: '10px', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                    <RefreshCcw size={18} /> Refresh Stream
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
                {stats.map((stat, i) => (
                    <div key={i} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '20px' }}>{stat.label}</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                            <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{stat.value}</h2>
                            <span style={{ fontSize: '10px', fontWeight: 900, color: stat.badgeColor, backgroundColor: stat.bg, padding: '2px 8px', borderRadius: '4px' }}>{stat.badge}</span>
                        </div>
                        <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px', margin: 0 }}>{stat.sub}</p>
                    </div>
                ))}
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    <Zap size={24} color="#cbd5e1" />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>Engine Ready</span>
                </div>
            </div>

            {/* Empty State Table */}
            <div style={{ backgroundColor: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                <div style={{ padding: '80px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '100px', height: '100px', backgroundColor: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                        <History size={44} color="#cbd5e1" />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: '0' }}>Audit stream is empty.</h3>
                    <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px', maxWidth: '340px' }}>
                        There are no AI activities to report at this time. Live logs will stream here during automated recruitment processes.
                    </p>
                </div>
            </div>
        </div>
    );
}
