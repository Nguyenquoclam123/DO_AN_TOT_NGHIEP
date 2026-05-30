"use client";

import React from "react";
import EmployerLayout from "@/components/layout/employer-layout";
import {
    ChevronDown,
    Search,
    Filter,
    X,
    Eye,
    Calendar,
    Trash2,
    LayoutGrid,
    List,
    Mail,
    Zap
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const candidates = [
    { id: "1", name: "Alex Rivera", role: "Senior BA at FinTech Corp", applied: "Oct 12", score: 98, insights: ["SQL MASTERY", "FINTECH EXP"], stage: "Interviewing", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" },
    { id: "2", name: "Jordan Smith", role: "Analyst at DataSync", applied: "Oct 14", score: 92, insights: ["TABLEAU EXPERT", "AGILE"], stage: "Screening", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan" },
    { id: "3", name: "Taylor Chen", role: "Business Consultant", applied: "Oct 11", score: 85, insights: ["STAKEHOLDER MGMT"], stage: "Screening", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor" },
    { id: "4", name: "Marcus Weber", role: "Lead Analyst at Global Solutions", applied: "Oct 15", score: 81, insights: ["STRATEGY LEAD", "M&A EXP"], stage: "New Applicant", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus" },
];

export default function CandidateRankedListPage() {
    return (
        <EmployerLayout>
            <div className="max-w-[1400px] mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-end justify-between">
                    <div className="space-y-1">
                        <h2 className="text-4xl font-bold text-gray-900">Senior Business Analyst</h2>
                        <p className="text-sm font-medium text-gray-500">Strategy Department • <span className="text-blue-600 font-bold">124 applicants total</span></p>
                    </div>
                    <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                        <button className="flex items-center gap-2 px-6 py-2 bg-white shadow-sm border border-gray-100 rounded-xl text-xs font-bold transition-all">
                            <List className="h-4 w-4" /> Ranked List
                        </button>
                        <Link href="/employer/jobs/1/pipeline" className="flex items-center gap-2 px-6 py-2 text-gray-500 rounded-xl text-xs font-bold hover:text-gray-900 transition-all">
                            <LayoutGrid className="h-4 w-4" /> Kanban
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-[1fr_350px] gap-10">
                    <div className="space-y-8">
                        {/* Filters & Search */}
                        <div className="flex items-center justify-between gap-6 pb-6 border-b border-gray-100">
                            <div className="flex flex-wrap items-center gap-3">
                                <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border rounded-xl text-[10px] font-black uppercase">
                                    <Filter className="h-3.5 w-3.5" /> FILTERS
                                </button>
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border rounded-xl text-[10px] font-bold text-gray-500 uppercase">
                                    Experience: 5+ years <ChevronDown className="h-3.5 w-3.5" />
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl text-[10px] font-bold text-blue-600 uppercase">
                                    Skill: SQL <X className="h-3.5 w-3.5" />
                                </div>
                                <button className="text-[10px] font-bold text-blue-600 hover:underline">Clear all</button>
                            </div>
                            <div className="relative max-w-xs w-full">
                                <input type="text" placeholder="Search candidates..." className="w-full bg-gray-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-xs" />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                        </div>

                        {/* Candidate Table */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_120px] px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <div>Candidate Details</div>
                                <div className="text-center">AI Match Score</div>
                                <div className="text-center">Matched Insights</div>
                                <div className="text-center">Stage</div>
                                <div className="text-right">Actions</div>
                            </div>
                            <div className="space-y-3">
                                {candidates.map((can, idx) => (
                                    <motion.div
                                        key={can.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="grid grid-cols-[1.5fr_1fr_1fr_1fr_120px] px-8 py-6 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl hover:border-blue-100 transition-all items-center group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <img src={can.avatar} className="h-12 w-12 rounded-xl object-cover bg-gray-100 border border-gray-50" />
                                            <div>
                                                <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{can.name}</h4>
                                                <p className="text-[10px] font-medium text-gray-400">{can.role} • Applied {can.applied}</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-center">
                                            <div className="relative h-14 w-14 flex items-center justify-center">
                                                <svg className="h-full w-full -rotate-90">
                                                    <circle cx="28" cy="28" r="24" className="stroke-gray-100 fill-none" strokeWidth="4" />
                                                    <circle cx="28" cy="28" r="24" className={clsx("fill-none rounded-full", can.score > 90 ? 'stroke-blue-600' : 'stroke-blue-400')} strokeWidth="4" strokeDasharray={`${can.score * 1.5} 1000`} strokeLinecap="round" />
                                                </svg>
                                                <span className="absolute text-sm font-black text-gray-900">{can.score}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap justify-center gap-1.5">
                                            {can.insights.map(tag => (
                                                <span key={tag} className="px-2 py-1 bg-orange-50 text-[8px] font-black text-orange-600 rounded-md border border-orange-100">{tag}</span>
                                            ))}
                                        </div>
                                        <div className="flex justify-center">
                                            <span className={clsx(
                                                "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                                can.stage === 'Interviewing' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'
                                            )}>{can.stage}</span>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"><Eye className="h-4 w-4" /></button>
                                            <button className="p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"><Calendar className="h-4 w-4" /></button>
                                            <button className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"><X className="h-4 w-4" /></button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            <button className="w-full py-4 text-xs font-bold text-blue-600 flex items-center justify-center gap-2 hover:underline">
                                Load 10 more candidates <ChevronDown className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Sidebar: Pipeline Stats & Insights */}
                    <div className="space-y-8">
                        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pipeline Velocity</h4>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span>New Applicants</span>
                                        <span className="text-gray-900">42</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                                        <div className="h-full w-[45%] bg-blue-600 rounded-full" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span>Interviewing</span>
                                        <span className="text-gray-900">18</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                                        <div className="h-full w-[80%] bg-blue-600 rounded-full" />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t space-y-6">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">Recent Activities</h4>
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0"><Mail className="h-4 w-4" /></div>
                                        <div className="space-y-1">
                                            <p className="text-[11px] font-bold text-gray-900 leading-tight">Alex Rivera responded</p>
                                            <p className="text-[10px] text-gray-400 font-medium italic">Schedule confirmation • 2h ago</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="h-8 w-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 shrink-0"><Zap className="h-4 w-4" /></div>
                                        <div className="space-y-1">
                                            <p className="text-[11px] font-bold text-gray-900 leading-tight">AI Match updated</p>
                                            <p className="text-[10px] text-gray-400 font-medium italic">Processed 12 new applicants • 4h ago</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Talent Insights AI Card */}
                        <div className="bg-blue-600 p-8 rounded-[40px] text-white space-y-6 shadow-xl shadow-blue-500/20">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-sm">Talent Insights AI</h4>
                                <Zap className="h-5 w-5 opacity-50" />
                            </div>
                            <p className="text-[11px] leading-relaxed opacity-80">You have **5 high-potential** candidates who match over **90%** of your core requirements. Recommend prioritizing interviews for **Alex Rivera** and **Jordan Smith**.</p>
                            <button className="w-full py-3 bg-white text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-50 transition-colors">
                                Generate Summary
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </EmployerLayout>
    );
}

function clsx(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
