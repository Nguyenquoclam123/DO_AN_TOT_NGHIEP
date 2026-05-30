"use client";

import React, { useState } from "react";
import EmployerLayout from "@/components/layout/employer-layout";
import {
    Zap,
    AlertTriangle,
    CheckCircle2,
    ChevronRight,
    History,
    MessageSquare,
    ShieldCheck,
    TrendingDown,
    ThumbsUp,
    ThumbsDown,
    Info,
    ChevronDown
} from "lucide-react";
import { motion } from "framer-motion";

export default function AIPerformanceAuditPage() {
    const [decision, setDecision] = useState("adjust");

    return (
        <EmployerLayout>
            <div className="max-w-[1500px] mx-auto pb-20 space-y-10">
                {/* Header Section */}
                <div className="flex items-end justify-between">
                    <div className="space-y-4">
                        <nav className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                            <span>Assessments</span>
                            <ChevronRight size={12} />
                            <span className="text-blue-600">AI Performance Audit</span>
                        </nav>
                        <div className="flex items-center gap-6">
                            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Marcus Richardson</h2>
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-gray-100 text-[10px] font-black text-gray-900 rounded uppercase tracking-widest border border-gray-200">ID: APP-9284-MR</span>
                                <span className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                                    <span className="h-2 w-2 bg-blue-600 rounded-full" /> Technical Interview Phase
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button className="px-8 py-4 bg-white border border-gray-100 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
                            Discard Review
                        </button>
                        <button className="px-10 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-blue-500/20 hover:scale-105 transition-all">
                            Submit Audit
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-[1fr_380px] gap-10">
                    <div className="space-y-10">
                        {/* Score Calibration Card */}
                        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-10 relative overflow-hidden">
                            <div className="flex items-center gap-4 text-blue-600 relative z-10">
                                <ShieldCheck size={24} />
                                <h3 className="text-xl font-black uppercase tracking-widest">Score Calibration</h3>
                            </div>

                            <div className="grid grid-cols-3 gap-8 relative z-10">
                                {/* AI Score */}
                                <div className="bg-gray-50/50 p-8 rounded-[32px] border border-blue-100/50 flex flex-col items-center">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">AI Score</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-6xl font-black text-gray-900 tracking-tighter">92</span>
                                        <span className="text-sm font-bold text-gray-400">/ 100</span>
                                    </div>
                                    <div className="w-full h-1 bg-gray-200 rounded-full mt-6 overflow-hidden">
                                        <div className="h-full w-[92%] bg-blue-600" />
                                    </div>
                                </div>

                                {/* HR Review Score */}
                                <div className="bg-white p-8 rounded-[32px] border border-gray-100 flex flex-col items-center shadow-inner group">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">HR Review Score</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-6xl font-black text-gray-900 tracking-tighter group-hover:text-blue-600 transition-colors">68</span>
                                        <span className="text-sm font-bold text-gray-400">/ 100</span>
                                    </div>
                                    <p className="text-[9px] font-medium text-gray-400 mt-4 italic text-center leading-relaxed">
                                        Manual score based on <br /> interview nuances
                                    </p>
                                </div>

                                {/* Score Variance */}
                                <div className="bg-red-50/30 p-8 rounded-[32px] border-2 border-red-100 flex flex-col items-center relative overflow-hidden">
                                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-4">Score Variance</p>
                                    <div className="flex items-center gap-2 text-red-600">
                                        <span className="text-6xl font-black tracking-tighter">-24</span>
                                        <AlertTriangle size={24} className="mb-4" />
                                    </div>
                                    <div className="mt-4 px-4 py-1.5 bg-red-100 text-red-600 text-[8px] font-black uppercase rounded-lg tracking-widest shadow-sm">
                                        HIGH VARIANCE FLAGGED
                                    </div>
                                </div>
                            </div>

                            {/* Potential Flag Toggle */}
                            <div className="pt-10 border-t border-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="h-6 w-12 bg-orange-600 rounded-full p-1 cursor-pointer flex items-center shadow-lg shadow-orange-600/20">
                                        <div className="h-4 w-4 bg-white rounded-full translate-x-6 transition-all" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-black text-gray-900 uppercase">Is Potential Flag</p>
                                        <p className="text-[10px] font-medium text-gray-400">Flag this case for AI model refinement and training</p>
                                    </div>
                                </div>
                                <AlertTriangle size={20} className="text-gray-300" />
                            </div>
                            <div className="absolute right-0 top-0 h-40 w-40 bg-gray-50 rounded-bl-full -z-10" />
                        </div>

                        {/* Final Decision & Reasoning */}
                        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-10">
                            <div className="space-y-6">
                                <h3 className="text-lg font-black uppercase tracking-widest text-gray-900">Final Decision & Reasoning</h3>
                                <div className="flex flex-col gap-8">
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">HR Decision</p>
                                        <div className="flex gap-4">
                                            <DecisionBtn active={decision === 'approve'} onClick={() => setDecision('approve')} label="Approve AI Score" />
                                            <DecisionBtn active={decision === 'adjust'} onClick={() => setDecision('adjust')} label="Adjust AI Score" />
                                            <DecisionBtn active={decision === 'reject'} onClick={() => setDecision('reject')} label="Reject AI Assessment" />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">HR Notes</p>
                                        <textarea
                                            placeholder="Provide detailed reasoning for the score adjustment..."
                                            className="w-full h-48 bg-gray-50 border-none rounded-[32px] py-10 px-10 text-sm font-medium leading-[2] text-gray-600 resize-none focus:ring-2 focus:ring-blue-500 italic"
                                        />
                                    </div>
                                </div>
                            </div>
                            <p className="text-[10px] font-bold text-gray-300 italic flex items-center gap-2">
                                <Info size={12} /> These notes will be visible to the recruitment lead and the AI development team.
                            </p>
                        </div>
                    </div>

                    {/* Right Sidebar: AI Insights */}
                    <div className="space-y-8">
                        {/* AI Reasoning Section */}
                        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-8 relative overflow-hidden">
                            <div className="flex justify-between items-center relative z-10">
                                <h4 className="text-sm font-black uppercase tracking-widest text-gray-900">AI Reasoning</h4>
                                <Zap size={18} className="text-blue-600" />
                            </div>

                            <div className="space-y-8 relative z-10">
                                {/* Strengths */}
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest flex items-center gap-2">
                                        <TrendingDown className="rotate-180" size={14} /> Identified Strengths
                                    </p>
                                    <div className="space-y-3">
                                        <ReasonBox text="Exceptional proficiency in Distributed Systems based on project keywords." />
                                        <ReasonBox text="High semantic match for 'Problem-solving under pressure' narrative." />
                                        <ReasonBox text="Consistency in multi-stage questionnaire responses exceeds 94%." />
                                    </div>
                                </div>

                                {/* Concerns */}
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-2">
                                        <TrendingDown size={14} /> Potential Concerns
                                    </p>
                                    <div className="space-y-3">
                                        <ReasonBox text="Possible over-optimization of resume for keyword matching identified in work history gaps." warning />
                                        <ReasonBox text="Leadership indicators are passive; lower confidence score in 'Managerial Potential'." warning />
                                    </div>
                                </div>

                                {/* Model Confidence */}
                                <div className="pt-8 border-t border-gray-50 space-y-4">
                                    <div className="flex justify-between text-[10px] font-black uppercase">
                                        <span className="text-gray-400">Model Confidence</span>
                                        <span className="text-blue-600">88%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                                        <div className="h-full w-[88%] bg-blue-600 rounded-full" />
                                    </div>
                                </div>
                            </div>
                            <div className="absolute right-0 top-0 h-24 w-24 bg-gray-50 rounded-bl-full -z-0" />
                        </div>

                        {/* Historical Context Sidebar */}
                        <div className="bg-gray-50/50 p-8 rounded-[40px] border border-gray-100 space-y-6">
                            <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Historical Context</h4>
                            <div className="space-y-6">
                                <HistoryItem label="Last Audit: Jan 12" sub="Variance: -5 pts (Low)" active />
                                <HistoryItem label="Avg Dept Score" sub="74 / 100 for this role" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </EmployerLayout>
    );
}

function DecisionBtn({ active, label, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                "flex-1 py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all",
                active
                    ? "bg-white border-blue-600 text-blue-600 shadow-xl shadow-blue-500/5 ring-4 ring-blue-50/50 ring-inset"
                    : "bg-white border-gray-100 text-gray-400 hover:border-gray-300"
            )}
        >
            {label}
        </button>
    )
}

function ReasonBox({ text, warning }: any) {
    return (
        <div className={clsx(
            "p-5 rounded-2xl border text-[11px] font-medium leading-relaxed group hover:scale-[1.02] transition-transform",
            warning ? "bg-orange-50/50 border-orange-100/50 text-orange-900" : "bg-gray-50/50 border-gray-100/50 text-gray-600"
        )}>
            <p className="italic">"{text}"</p>
        </div>
    )
}

function HistoryItem({ label, sub, active }: any) {
    return (
        <div className="flex gap-4 items-start">
            <div className={clsx("h-2.5 w-2.5 rounded-full mt-1 shrink-0", active ? "bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" : "bg-gray-200")} />
            <div className="space-y-1">
                <p className="text-[11px] font-black text-gray-900 leading-none">{label}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest uppercase">{sub}</p>
            </div>
        </div>
    )
}

function clsx(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
