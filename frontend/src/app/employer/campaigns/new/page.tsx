"use client";

import React from "react";
import EmployerLayout from "@/components/layout/employer-layout";
import {
    Plus,
    ChevronRight,
    Info,
    Calendar,
    Briefcase,
    Settings2,
    Search,
    X
} from "lucide-react";
import Link from "next/link";

export default function CreateCampaignPage() {
    return (
        <EmployerLayout>
            <div className="max-w-5xl mx-auto space-y-10 pb-20">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <Link href="/employer/campaigns" className="hover:text-blue-600">Campaigns</Link>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-gray-900">Tạo đợt tuyển dụng mới</span>
                </nav>

                {/* Header */}
                <div className="space-y-2">
                    <h2 className="text-5xl font-bold text-gray-900">Tạo Đợt Tuyển Dụng Mới</h2>
                    <p className="text-gray-500 font-medium leading-relaxed">Thiết lập thông tin chi tiết và lộ trình cho chiến dịch săn tìm tài năng tiếp theo của bạn.</p>
                </div>

                <div className="space-y-8">
                    {/* Section 1: Basic Info */}
                    <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <Info className="h-5 w-5" />
                            </div>
                            <h3 className="text-xl font-bold">Thông tin cơ bản</h3>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Tên đợt tuyển dụng</label>
                                <input type="text" placeholder="Ví dụ: Chiến dịch Tech Talent Q4 - 2024" className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm font-bold" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Mô tả chi tiết</label>
                                <textarea placeholder="Nhập mục tiêu và lộ trình chi tiết của đợt tuyển dụng này..." className="w-full h-32 bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm font-medium resize-none" />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Timeline */}
                    <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <h3 className="text-xl font-bold">Thời gian triển khai</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-10">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Ngày bắt đầu</label>
                                <div className="relative">
                                    <input type="date" className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm font-bold appearance-none" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Ngày kết thúc dự kiến</label>
                                <input type="date" className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm font-bold" />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Add Jobs */}
                    <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                    <Briefcase className="h-5 w-5" />
                                </div>
                                <h3 className="text-xl font-bold">Thêm Job vào đợt</h3>
                            </div>
                            <div className="relative max-w-xs w-full">
                                <input type="text" placeholder="Tìm kiếm vị trí..." className="w-full bg-gray-50 py-2.5 pl-10 pr-4 rounded-xl text-xs font-medium border-none" />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <JobSelectRow name="Senior UI Designer" dept="Engineering" target={1} />
                            <JobSelectRow name="Business Analyst (BA)" dept="Product" target={1} checked />
                            <JobSelectRow name="Backend Engineer (Node.js)" dept="Engineering" target={1} />
                        </div>
                    </div>

                    {/* Section 4: Extra Config */}
                    <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <Settings2 className="h-5 w-5" />
                            </div>
                            <h3 className="text-xl font-bold">Cấu hình bổ sung</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-10">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Trạng thái ban đầu</label>
                                <select className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm font-bold appearance-none cursor-pointer">
                                    <option>Draft (Nháp)</option>
                                    <option>Open (Mở tuyển)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Phòng ban phụ trách</label>
                                <select className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm font-bold appearance-none cursor-pointer">
                                    <option>Human Resources</option>
                                    <option>Engineering Talent</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex items-center justify-end gap-10 pt-10">
                        <button className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">Hủy</button>
                        <button className="bg-blue-600 text-white px-12 py-4 rounded-2xl text-sm font-bold shadow-xl shadow-blue-500/30 hover:scale-105 transition-all">
                            Tạo đợt tuyển dụng
                        </button>
                    </div>
                </div>
            </div>
        </EmployerLayout>
    );
}

function JobSelectRow({ name, dept, target, checked }: any) {
    return (
        <div className={clsx(
            "flex items-center justify-between p-6 rounded-2xl border transition-all",
            checked ? "bg-white border-blue-600 ring-4 ring-blue-50" : "bg-white border-gray-50 hover:bg-gray-50"
        )}>
            <div className="flex items-center gap-6">
                <div className={clsx("h-6 w-6 rounded-md border-2 flex items-center justify-center transition-all", checked ? "bg-blue-600 border-blue-600" : "border-gray-200")}>
                    {checked && <Plus className="h-4 w-4 text-white rotate-45" />}
                </div>
                <div>
                    <h5 className="font-bold text-gray-900">{name}</h5>
                    <p className="text-xs text-gray-500 font-medium">Design Team • Hồ Chí Minh</p>
                </div>
            </div>
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-gray-300 uppercase">Target:</span>
                    <input type="number" defaultValue={target} className="w-16 bg-gray-50 border-none rounded-lg py-1.5 px-3 text-xs font-bold text-center" />
                </div>
                <span className={clsx("px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest", dept === 'Engineering' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600')}>
                    {dept}
                </span>
            </div>
        </div>
    )
}

function clsx(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
