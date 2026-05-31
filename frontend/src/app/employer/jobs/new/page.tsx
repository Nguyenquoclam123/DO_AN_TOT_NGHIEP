"use client";

import React, { useState } from "react";
import EmployerLayout from "@/components/layout/employer-layout";
import {
    Plus,
    MapPin,
    DollarSign,
    Clock,
    Zap,
    CheckCircle2,
    ChevronRight,
    Info,
    Calendar,
    Layers,
    Sparkles
} from "lucide-react";
import { jobService } from "@/services/job.service";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";

export default function NewJobPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [companyStatus, setCompanyStatus] = useState<string>("APPROVED");
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        quantity: 1,
        salary_min: 0,
        salary_max: 0,
        work_location: "Remote",
        work_time: "Full-time",
        expired_at: "",
        skills: []
    });

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await jobService.create(formData);
            router.push("/employer/jobs");
        } catch (error) {
            console.error("Error creating job:", error);
        } finally {
            setLoading(false);
        }
    };
 
    React.useEffect(() => {
        authService.getProfile()
            .then(data => {
                if (data?.company?.status) {
                    setCompanyStatus(data.company.status);
                }
            })
            .catch(err => console.error("Failed to load company status on new job page", err));
    }, []);

    return (
        <EmployerLayout>
            <div className="max-w-5xl mx-auto space-y-12 pb-20">
                {/* Header & Steps */}
                <div className="flex items-end justify-between border-b-2 border-gray-50 pb-8">
                    <div className="space-y-4">
                        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Create Opportunity</h2>
                        <div className="flex gap-10">
                            <StepIndicator n={1} label="Core Details" active={step === 1} />
                            <StepIndicator n={2} label="Requirements" active={step === 2} />
                            <StepIndicator n={3} label="AI Matching" active={step === 3} />
                        </div>
                    </div>
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] italic">Step {step} of 3</p>
                </div>

                <div className="bg-white p-16 rounded-[60px] border border-gray-100 shadow-2xl shadow-gray-200/50 relative overflow-hidden">
                    {/* Step 1: Core Details */}
                    {step === 1 && (
                        <div className="space-y-12 animate-in slide-in-from-right duration-500">
                            <div className="grid grid-cols-2 gap-12">
                                <InputField
                                    label="Job Title"
                                    placeholder="e.g. Senior Principal Designer"
                                    value={formData.title}
                                    onChange={(v: any) => setFormData({ ...formData, title: v })}
                                />
                                <div className="grid grid-cols-2 gap-6">
                                    <InputField
                                        label="Work Location"
                                        icon={<MapPin size={16} />}
                                        value={formData.work_location}
                                        onChange={(v: any) => setFormData({ ...formData, work_location: v })}
                                    />
                                    <InputField
                                        label="Work Type"
                                        icon={<Clock size={16} />}
                                        value={formData.work_time}
                                        onChange={(v: any) => setFormData({ ...formData, work_time: v })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Job Description & Context</label>
                                <textarea
                                    placeholder="Describe the role, impact and daily operations..."
                                    className="w-full h-80 bg-gray-50/50 border-none rounded-[40px] p-10 text-sm font-medium leading-[2] text-gray-600 focus:ring-4 focus:ring-blue-500/10 italic"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                             <div className="grid grid-cols-3 gap-8">
                                <InputField
                                    label="Positions"
                                    icon={<Layers size={16} />}
                                    type="number"
                                    value={formData.quantity}
                                    onChange={(v: any) => setFormData({ ...formData, quantity: parseInt(v) })}
                                />
                                <InputField
                                    label="Salary (Min)"
                                    icon={<DollarSign size={16} />}
                                    type="number"
                                    value={formData.salary_min}
                                    onChange={(v: any) => setFormData({ ...formData, salary_min: parseInt(v) })}
                                />
                                <InputField
                                    label="Salary (Max)"
                                    icon={<DollarSign size={16} />}
                                    type="number"
                                    value={formData.salary_max}
                                    onChange={(v: any) => setFormData({ ...formData, salary_max: parseInt(v) })}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2 & 3 Placeholders (Will expand in next turns) */}
                    {step > 1 && (
                        <div className="h-96 flex flex-col items-center justify-center text-center space-y-6">
                            <div className="h-24 w-24 bg-blue-50 rounded-[40px] flex items-center justify-center text-blue-600 shadow-inner">
                                <Sparkles size={40} className="animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">AI Engine Ready</h3>
                                <p className="text-[11px] font-medium text-gray-400 mt-2">Section is ready for automated requirement extraction.</p>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="mt-16 flex justify-between items-center bg-gray-50/50 -mx-16 -mb-16 p-10 border-t border-gray-100">
                        <button
                            onClick={() => step > 1 ? setStep(step - 1) : router.back()}
                            className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
                        >
                            {step === 1 ? 'Cancel Posting' : 'Back to Previous'}
                        </button>
                        <button
                            onClick={() => step < 3 ? setStep(step + 1) : handleSubmit()}
                            className="bg-gray-900 text-white px-12 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-gray-200 hover:scale-105 transition-all flex items-center gap-4"
                        >
                            {loading ? 'Processing...' : (step === 3 ? (companyStatus === 'APPROVED' ? 'Publish Opportunity' : 'Save as Draft (Pending Approval)') : 'Continue Workflow')}
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="absolute right-[-5%] top-[-5%] h-64 w-64 bg-blue-50/30 rounded-full blur-[80px]" />
                </div>
            </div>
        </EmployerLayout>
    );
}

function StepIndicator({ n, label, active }: any) {
    return (
        <div className={`flex items-center gap-4 transition-all ${active ? 'opacity-100 scale-105' : 'opacity-30'}`}>
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-xs font-black shadow-lg ${active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                0{n}
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-gray-900">{label}</span>
        </div>
    )
}

function InputField({ label, placeholder, icon, type = "text", value, onChange }: any) {
    return (
        <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{label}</label>
            <div className="relative group">
                {icon && <div className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-600 transition-transform group-focus-within:scale-110">{icon}</div>}
                <input
                    type={type}
                    placeholder={placeholder}
                    className={`w-full bg-gray-50 border-none rounded-2xl py-5 pr-6 font-bold text-sm text-gray-900 focus:ring-4 focus:ring-blue-500/10 transition-all ${icon ? 'pl-16' : 'pl-6'}`}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        </div>
    )
}
