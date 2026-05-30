"use client";

import React, { useState } from "react";
import {
    Briefcase,
    FileText,
    Save,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { masterDataService } from "@/services/master-data.service";
import { useAuthStore } from "@/store/authStore";

export default function NewPositionPage() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const user = useAuthStore((state) => state.user);

    const handleCreate = async () => {
        if (!title.trim()) {
            alert("Please enter a position title");
            return;
        }

        try {
            setIsSubmitting(true);
            await masterDataService.createPosition({
                name: title,
                description: description,
                companyId: user?.companyId
            });
            router.push("/employer/positions");
        } catch (error: any) {
            console.error("Failed to create position", error);
            alert(`Failed to create position: ${error.message || "Unknown error"}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Create Position</h2>
                    <p style={{ fontSize: '15px', color: '#64748b', marginTop: '8px' }}>Add a new business role to your hiring architecture.</p>
                </div>
                <Link href="/employer/positions" style={{ textDecoration: 'none', fontSize: '14px', fontWeight: 700, color: '#64748b' }}>
                    Cancel
                </Link>
            </div>

            <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '32px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {/* Position Title */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Position Title</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Senior Backend Engineer"
                                disabled={isSubmitting}
                                style={{ width: '100%', padding: '16px 20px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', fontSize: '16px', fontWeight: 700, outline: 'none', color: '#0f172a' }}
                            />
                            <Briefcase size={20} style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1' }} />
                        </div>
                    </div>

                    {/* Position Description */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</label>
                        <div style={{ position: 'relative' }}>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={isSubmitting}
                                placeholder="Describe the core responsibilities and expectations for this role..."
                                style={{ width: '100%', padding: '16px 20px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', fontSize: '15px', minHeight: '180px', outline: 'none', color: '#475569', lineHeight: 1.6, resize: 'none' }}
                            />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                        <button
                            onClick={handleCreate}
                            disabled={isSubmitting}
                            style={{
                                flex: 1,
                                padding: '16px',
                                backgroundColor: isSubmitting ? '#94a3b8' : '#5C9AFF',
                                color: 'white',
                                border: 'none',
                                borderRadius: '16px',
                                fontSize: '15px',
                                fontWeight: 800,
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                boxShadow: isSubmitting ? 'none' : '0 10px 15px -3px rgba(37, 99, 235, 0.3)'
                            }}
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            {isSubmitting ? "Creating..." : "Create Position Architecture"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Guidance Card */}
            <div style={{ marginTop: '32px', padding: '24px', backgroundColor: '#eff6ff', borderRadius: '24px', border: '1px solid #dbeafe', display: 'flex', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#5C9AFF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={20} color="white" />
                </div>
                <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1e40af', margin: '0 0 4px' }}>AI-Ready Standardization</h4>
                    <p style={{ fontSize: '13px', color: '#5C9AFF', margin: 0, lineHeight: 1.5 }}>Our Gemini engine will use this description to accurately match candidates and generate specific interview questions.</p>
                </div>
            </div>
        </div>
    );
}
