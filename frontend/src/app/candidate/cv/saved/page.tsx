"use client";

import React from "react";
import CandidateLayout from "@/components/layout/candidate-layout";
import {
    Bookmark,
    MapPin,
    DollarSign,
    Calendar,
    Clock,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    Building2
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const savedJobs = [
    { id: "1", title: "Senior UI Designer", company: "Google LLC", location: "California, USA", salary: "$120k - $160k", savedAt: "12/10/2023", deadline: "Ends in 2 days", isUrgent: false },
    { id: "2", title: "Product Manager", company: "Spotify", location: "Remote, UK", salary: "$90k - $130k", savedAt: "15/10/2023", deadline: "Ends in 15 days", isUrgent: false },
    { id: "3", title: "Lead UX Researcher", company: "Airbnb", location: "San Francisco, CA", salary: "$140k - $180k", savedAt: "01/10/2023", deadline: "Applications Closed", isExpired: true },
    { id: "4", title: "Visual Designer", company: "Figma", location: "New York, NY", salary: "$110k - $150k", savedAt: "18/10/2023", deadline: "Expires in 12h", isUrgent: true },
];

export default function SavedJobsPage() {
    return (
        <CandidateLayout>
            <div className="max-w-[1400px] mx-auto space-y-10">
                {/* Header */}
                <div className="flex items-end justify-between px-4">
                    <div>
                        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Saved Jobs</h2>
                        <p className="text-gray-500 mt-2 font-medium">You have <span className="text-blue-600 font-bold">12 jobs</span> saved in your portfolio.</p>
                    </div>
                    <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
                        <button className="px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20">All</button>
                        <button className="px-6 py-2 text-gray-400 hover:text-gray-900 rounded-xl text-xs font-bold transition-all">Active</button>
                        <button className="px-6 py-2 text-gray-400 hover:text-gray-900 rounded-xl text-xs font-bold transition-all">Expired</button>
                    </div>
                </div>

                {/* Expiring Soon Banner */}
                <div className="bg-orange-50 border border-orange-100 p-6 rounded-[32px] flex items-center justify-between group overflow-hidden relative">
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center text-orange-600 shadow-sm border border-orange-100 group-hover:scale-110 transition-transform">
                            <AlertTriangle size={28} />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-lg font-bold text-orange-900 leading-tight">Expiring Soon!</h4>
                            <p className="text-[11px] text-orange-700 font-medium">3 of your saved jobs will close in the next 48 hours. Check them now.</p>
                        </div>
                    </div>
                    <button className="px-6 py-3 bg-orange-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 hover:scale-105 transition-all relative z-10">
                        View Details
                    </button>
                    <div className="absolute right-0 top-0 h-full w-48 bg-orange-200/20 rounded-l-full blur-2xl" />
                </div>

                {/* Jobs Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {savedJobs.map((job, idx) => (
                        <motion.div
                            key={job.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={clsx(
                                "bg-white p-10 rounded-[40px] border relative overflow-hidden transition-all group",
                                job.isExpired ? "opacity-60 bg-gray-50/50" : "hover:shadow-2xl hover:border-blue-100",
                                job.isUrgent ? "border-orange-100 ring-2 ring-orange-50 ring-inset" : "border-gray-100"
                            )}
                        >
                            {job.isUrgent && <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-orange-500" />}

                            <div className="flex justify-between items-start mb-8">
                                <div className="flex gap-6">
                                    <div className="h-16 w-16 bg-gray-50 rounded-[24px] border border-gray-100 flex items-center justify-center p-4">
                                        <div className="h-full w-full bg-gray-900 rounded-lg" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h4 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{job.title}</h4>
                                            {job.isUrgent && <span className="px-2 py-0.5 bg-orange-50 text-[8px] font-black text-orange-600 rounded uppercase tracking-widest">URGENT</span>}
                                        </div>
                                        <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{job.company}</p>
                                    </div>
                                </div>
                                <button className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                    <Bookmark size={20} fill="currentColor" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-y-4 mb-10">
                                <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                                    <MapPin size={16} className="text-gray-400" /> {job.location}
                                </div>
                                <div className="flex items-center gap-3 text-xs font-black text-gray-900/80">
                                    <DollarSign size={16} className="text-blue-600" /> {job.salary}
                                </div>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <Calendar size={16} /> Saved: {job.savedAt}
                                </div>
                                <div className={clsx(
                                    "flex items-center gap-3 text-[10px] font-black uppercase tracking-widest",
                                    job.isExpired ? "text-red-500" : job.isUrgent ? "text-orange-600" : "text-blue-600"
                                )}>
                                    <Clock size={16} /> {job.deadline}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    disabled={job.isExpired}
                                    className={clsx(
                                        "flex-1 py-4 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all",
                                        job.isExpired ? "bg-gray-100 text-gray-300" : "bg-blue-600 text-white shadow-xl shadow-blue-500/20 hover:scale-[1.03]"
                                    )}
                                >
                                    Apply Now
                                </button>
                                <button className="flex-1 py-4 bg-gray-50 text-gray-500 rounded-[20px] text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all">
                                    View Details
                                </button>
                            </div>

                            {job.isExpired && (
                                <div className="absolute inset-0 bg-white/40 flex items-center justify-center backdrop-blur-[1px]">
                                    <div className="bg-gray-900 px-6 py-2 rounded-xl text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-2xl">
                                        EXPIRED
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-3 py-12 pb-20">
                    <button className="p-3 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors"><ChevronLeft size={18} /></button>
                    <button className="h-12 w-12 rounded-2xl bg-blue-600 text-white font-black text-sm shadow-xl shadow-blue-600/20">1</button>
                    <button className="h-12 w-12 rounded-2xl bg-white border border-gray-100 text-gray-400 font-bold text-sm hover:bg-gray-50">2</button>
                    <button className="h-12 w-12 rounded-2xl bg-white border border-gray-100 text-gray-400 font-bold text-sm hover:bg-gray-50">3</button>
                    <button className="p-3 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors"><ChevronRight size={18} /></button>
                </div>
            </div>
        </CandidateLayout>
    );
}

function clsx(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
