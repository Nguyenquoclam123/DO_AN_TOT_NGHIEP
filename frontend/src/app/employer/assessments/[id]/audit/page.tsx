"use client";

import React from "react";
import EmployerLayout from "@/components/layout/employer-layout";
import {
    ArrowLeft,
    ChevronRight,
    Zap,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    MessageSquare,
    BarChart3,
    Calendar,
    Settings2,
    Trash2,
    Edit3
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AIPerformanceAuditPage() {
    return (
        <EmployerLayout>
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/employer/analytics" className="h-10 w-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors shadow-sm">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <nav className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                <span>Assessments</span>
                                <ChevronRight className="h-3 w-3" />
                                <span className="text-blue-600">AI Performance Audit</span>
                            </nav>
                            <h2 className="text-4xl font-bold text-gray-900">Marcus Richardson</h2>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">ID: APP-9284-MR</span>
                                <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Technical Interview Phase</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button className="px-6 py-3 bg-gray-100 text-gray-500 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">Discard Review</button>
                        <button className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-colors">Submit Audit</button>
                    </div>
                </div>

                <div className="grid grid-cols-[1fr_350px] gap-10">
                    <div className="space-y-10">
                        {/* Score Calibration */}
                        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                    <BarChart3 className="h-5 w-5" />
                                </div>
                                <h3 className="text-xl font-bold">Score Calibration</h3>
                            </div>

                            <div className="grid grid-cols-3 gap-10">
                                <div className="bg-blue-50/30 p-8 rounded-[32px] border border-blue-100/50 flex flex-col items-center justify-center text-center">
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">AI Score</p>
                                    <div className="relative h-24 w-24 flex items-center justify-center">
                                        <svg className="h-full w-full -rotate-90">
                                            <circle cx="48" cy="48" r="44" className="stroke-blue-100 fill-none" strokeWidth="8" />
                                            <circle cx="48" cy="48" r="44" className="stroke-blue-600 fill-none" strokeWidth="8" strokeDasharray="276" strokeDashoffset="22" strokeLinecap="round" />
                                        </svg>
                                        <span className="absolute text-3xl font-black text-blue-900 font-mono">92<span className="text-sm opacity-30 font-sans">/100</span></span>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-8 rounded-[32px] flex flex-col items-center justify-center text-center">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">HR Review Score</p>
                                    <div className="flex items-center justify-center gap-1">
                                        <span className="text-5xl font-black text-gray-900 font-mono tracking-tighter">68</span>
                                        <span className="text-sm font-bold text-gray-400 uppercase">/100</span>
                                    </div>
                                    <p className="text-[9px] text-gray-400 mt-4 leading-relaxed italic">Manual score based on interview nuances</p>
                                </div>

                                <div className="bg-red-50 p-8 rounded-[32px] border border-red-100 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-4">Score Variance</p>
                                    <div className="flex items-center justify-center gap-1">
                                        <span className="text-5xl font-black text-red-600 font-mono tracking-tighter">-24</span>
                                        <AlertCircle className="h-5 w-5 text-red-600 absolute right-6 top-6 animate-pulse" />
                                    </div>
                                    <div className="mt-4 px-3 py-1 bg-red-600 text-white text-[8px] font-black uppercase rounded tracking-widest">High Variance Flagged</div>
                                </div>
                            </div>

                            <div className="mt-10 pt-10 border-t border-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-16 bg-orange-600 rounded-full p-1 cursor-pointer flex items-center">
                                        <div className="h-8 w-8 bg-white rounded-full shadow-md ml-auto" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Is Potential Flag</p>
                                        <p className="text-[10px] text-gray-500 font-medium">Flag this case for AI model refinement and training</p>
                                    </div>
                                </div>
                                <AlertCircle className="h-5 w-5 text-red-500" />
                            </div>
                        </div>

                        {/* Final Decision & Reasoning */}
                        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-10">
                            <h3 className="text-xl font-bold">Final Decision & Reasoning</h3>

                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <button className="flex-1 py-4 border border-gray-100 rounded-2xl text-xs font-bold hover:bg-gray-50 transition-colors">Approve AI Score</button>
                                    <button className="flex-1 py-4 border-2 border-blue-600 bg-blue-50/20 rounded-2xl text-xs font-bold text-blue-600 flex items-center justify-center gap-2">
                                        <Edit3 className="h-4 w-4" /> Adjust AI Score
                                    </button>
                                    <button className="flex-1 py-4 border border-gray-100 rounded-2xl text-xs font-bold hover:bg-gray-50 transition-colors">Reject AI Assessment</button>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">HR Notes</p>
                                    <textarea
                                        placeholder="Provide detailed reasoning for the score adjustment..."
                                        className="w-full h-48 bg-gray-50 border-none rounded-[32px] py-8 px-8 text-sm font-medium focus:ring-2 focus:ring-blue-500 leading-relaxed"
                                    />
                                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium italic">
                                        <InfoIcon className="h-3.5 w-3.5" /> These notes will be visible to the recruitment lead and the AI development team.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: AI Reasoning */}
                    <div className="space-y-8">
                        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold flex items-center gap-2">AI Reasoning <Zap className="h-4 w-4 text-blue-600 fill-blue-600" /></h4>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                                        <ChevronRight className="h-3 w-3" /> Identified Strengths
                                    </div>
                                    <div className="p-5 bg-gray-50 rounded-2xl space-y-4">
                                        <p className="text-[11px] text-gray-700 leading-relaxed">
                                            Exceptional proficiency in **Distributed Systems** based on project keywords.
                                        </p>
                                        <div className="h-px bg-gray-100" />
                                        <p className="text-[11px] text-gray-700 leading-relaxed">
                                            High semantic match for **"Problem-solving under pressure"** narrative.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-orange-600 uppercase tracking-widest">
                                        <ChevronRight className="h-3 w-3" /> Potential Concerns
                                    </div>
                                    <div className="p-5 bg-orange-50/50 rounded-2xl border border-orange-100">
                                        <p className="text-[11px] text-orange-900 leading-relaxed">
                                            Possible over-optimization of resume for keyword matching identified in work history gaps.
                                        </p>
                                    </div>
                                    <div className="p-5 bg-orange-50/50 rounded-2xl border border-orange-100">
                                        <p className="text-[11px] text-orange-900 leading-relaxed">
                                            Leadership indicators are passive; lower confidence score in "Managerial Potential".
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t space-y-3">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-400">
                                        <span>Model Confidence</span>
                                        <span className="text-blue-600">88%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full w-[88%] bg-blue-600 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Historical Context */}
                        <div className="bg-gray-100/50 p-8 rounded-[40px] border border-gray-100 space-y-6">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Historical Context</h4>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="h-2 w-2 rounded-full bg-gray-300 mt-1.5" />
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-900">Last Audit: Jan 12</p>
                                        <p className="text-[10px] text-gray-400 font-medium">Variance: -5 pts (Low)</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="h-2 w-2 rounded-full bg-blue-600 mt-1.5" />
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-900">Avg Dept Score</p>
                                        <p className="text-[10px] text-gray-400 font-medium">74 / 100 for this role</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </EmployerLayout>
    );
}

function InfoIcon(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
    )
}

function clsx(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
