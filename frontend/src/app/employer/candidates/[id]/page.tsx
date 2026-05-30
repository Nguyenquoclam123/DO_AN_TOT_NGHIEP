"use client";

import React from "react";
import {
    ChevronRight,
    Mail,
    Linkedin,
    MapPin,
    Calendar,
    Clock,
    DollarSign,
    Briefcase,
    GraduationCap,
    FileText,
    History,
    MessageSquare,
    CheckCircle2,
    MoreHorizontal,
    ExternalLink,
    Download,
    Bell,
    Settings,
    User
} from "lucide-react";

export default function CandidateDetailPage() {
    return (
        <div style={{ padding: '0', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            {/* Top Bar Navigation */}
            <div style={{ padding: '16px 40px', backgroundColor: 'white', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>My Job</div>
                    <div style={{ width: '1px', height: '16px', backgroundColor: '#e2e8f0' }}></div>
                    <div style={{ display: 'flex', gap: '20px', fontSize: '13px', fontWeight: 600, color: '#64748b' }}>
                        <span>Dashboard</span>
                        <span style={{ color: '#5C9AFF', borderBottom: '2px solid #5C9AFF', padding: '4px 0' }}>Talent Pipeline</span>
                        <span>Interviews</span>
                        <span>Analytics</span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <Bell size={20} color="#64748b" />
                    {/* Settings Hidden */}
                    <button style={{ padding: '10px 24px', backgroundColor: '#5C9AFF', color: 'white', borderRadius: '10px', border: 'none', fontSize: '13px', fontWeight: 700 }}>Hire Candidate</button>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={18} color="#94a3b8" /></div>
                </div>
            </div>

            <div style={{ padding: '40px', display: 'grid', gridTemplateColumns: '260px 1fr 320px', gap: '40px' }}>

                {/* Left Column: Sidebar Nav */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ padding: '12px 20px', backgroundColor: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #f1f5f9' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', overflow: 'hidden' }}>
                            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="profile" />
                        </div>
                        <div>
                            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Julianne Thorne</h4>
                            <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Senior Product Designer</p>
                        </div>
                    </div>
                    <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {[
                            { name: "Overview", icon: <User size={18} />, active: true },
                            { name: "Experience", icon: <Briefcase size={18} /> },
                            { name: "Education", icon: <GraduationCap size={18} /> },
                            { name: "Skills", icon: <Target size={18} /> },
                            { name: "Documents", icon: <FileText size={18} /> },
                        ].map(item => (
                            <div key={item.name} style={{
                                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                                backgroundColor: item.active ? '#eff6ff' : 'transparent',
                                color: item.active ? '#5C9AFF' : '#64748b',
                                borderLeft: item.active ? '3px solid #5C9AFF' : 'none'
                            }}>
                                {item.icon} {item.name}
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px' }}><History size={18} /> Activity</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px' }}><MessageSquare size={18} /> Notes</div>
                        <button style={{ marginTop: '16px', width: '100%', padding: '14px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '12px', color: '#475569', fontSize: '14px', fontWeight: 800 }}>Schedule Interview</button>
                    </div>
                </div>

                {/* Center Column: Profile Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Julianne Thorne</h1>
                                <span style={{ fontSize: '10px', fontWeight: 900, color: '#5C9AFF', backgroundColor: '#eff6ff', padding: '4px 12px', borderRadius: '20px' }}>INTERVIEWING</span>
                            </div>
                            <p style={{ fontSize: '18px', color: '#64748b', marginTop: '8px', fontWeight: 600 }}>Senior Product Designer • Design Systems Expert</p>
                            <div style={{ display: 'flex', gap: '24px', marginTop: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', fontWeight: 600 }}><Mail size={14} /> j.thorne@example.com</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', fontWeight: 600 }}><Linkedin size={14} /> linkedin.com/in/jthorne</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', fontWeight: 600 }}><MapPin size={14} /> San Francisco, CA</div>
                            </div>
                        </div>
                        <div style={{ width: '100px', height: '100px', borderRadius: '24px', backgroundColor: '#5C9AFF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <h2 style={{ fontSize: '32px', fontWeight: 800, margin: 0 }}>94%</h2>
                            <p style={{ fontSize: '8px', fontWeight: 900, margin: 0, opacity: 0.8, textTransform: 'uppercase' }}>AI MATCH SCORE</p>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #f1f5f9', display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ width: '44px', height: '44px', backgroundColor: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Calendar size={20} color="#5C9AFF" /></div>
                            <div><p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', margin: 0 }}>EXPERIENCE</p><h4 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', margin: 0 }}>12 Years</h4></div>
                        </div>
                        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #f1f5f9', display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ width: '44px', height: '44px', backgroundColor: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Clock size={20} color="#ea580c" /></div>
                            <div><p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', margin: 0 }}>NOTICE PERIOD</p><h4 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Immediate</h4></div>
                        </div>
                        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #f1f5f9', display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ width: '44px', height: '44px', backgroundColor: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><DollarSign size={20} color="#5C9AFF" /></div>
                            <div><p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', margin: 0 }}>EXPECTED SALARY</p><h4 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', margin: 0 }}>$185k - $210k</h4></div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div>
                        <p style={{ fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.05em' }}>SUMMARY</p>
                        <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                            Strategic Product Designer with over a decade of experience building scalable design systems and user-centric products for industry leaders. Specializing in bridging the gap between complex engineering requirements and intuitive human experiences. Proven track record of leading cross-functional teams to deliver high-impact features in fast-paced environments.
                        </p>
                    </div>

                    {/* Experience Timeline */}
                    <div>
                        <p style={{ fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '24px', letterSpacing: '0.05em' }}>EXPERIENCE</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {[
                                { title: "Lead Product Designer", company: "Google", span: "2020 – Present", icon: "G" },
                                { title: "Senior Designer", company: "Airbnb", span: "2016 – 2020", icon: "A" }
                            ].map((job, i) => (
                                <div key={i} style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', gap: '20px' }}>
                                            <div style={{ width: '48px', height: '48px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800, color: '#cbd5e1' }}>{job.icon}</div>
                                            <div>
                                                <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{job.title}</h4>
                                                <p style={{ fontSize: '13px', color: '#5C9AFF', fontWeight: 700, margin: '4px 0 0' }}>{job.company}</p>
                                            </div>
                                        </div>
                                        <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>{job.span}</span>
                                    </div>
                                    <ul style={{ padding: '0 0 0 20px', margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.8 }}>
                                        <li>Architected the global design system used across 14+ product verticals.</li>
                                        <li>Mentored a team of 8 senior designers and established UX strategy.</li>
                                    </ul>
                                    {i === 0 && (
                                        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                                            <button style={{ flex: 1, padding: '12px', backgroundColor: '#5C9AFF', color: 'white', borderRadius: '10px', border: 'none', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Calendar size={16} /> Schedule Interview</button>
                                            <button style={{ flex: 1, padding: '12px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><MessageSquare size={16} /> Send Message</button>
                                            <button style={{ width: '44px', padding: '12px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MoreHorizontal size={18} color="#64748b" /></button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Activity & Notes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                    {/* Activity Timeline */}
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                        <p style={{ fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '24px' }}>ACTIVITY TIMELINE</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {[
                                { type: "Technical Interview Scheduled", time: "Oct 18, 2023 • 10:00 AM", icon: <Calendar size={14} color="white" />, bg: "#5C9AFF" },
                                { type: "Screening Call Completed", time: "Oct 15, 2023", icon: <CheckCircle2 size={14} color="white" />, bg: "#1e293b" },
                                { type: "Applied for Role", time: "Oct 12, 2023", icon: <FileText size={14} color="white" />, bg: "#cbd5e1" }
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', gap: '16px' }}>
                                    <div style={{ width: '28px', height: '28px', backgroundColor: item.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.icon}</div>
                                    <div>
                                        <h5 style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{item.type}</h5>
                                        <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 0' }}>{item.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recruiter Notes */}
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <p style={{ fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', margin: 0 }}>RECRUITER NOTES</p>
                            <button style={{ background: 'none', border: 'none', color: '#5C9AFF', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}>Add Note</button>
                        </div>
                        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#e2e8f0' }}></div>
                                <div><h6 style={{ fontSize: '12px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Sarah M.</h6><p style={{ fontSize: '10px', color: '#94a3b8', margin: 0 }}>2d ago</p></div>
                            </div>
                            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, fontStyle: 'italic', margin: 0 }}>
                                "Exceptional portfolio. Her work on Google's design system is exactly the level of complexity we need for our scaling infrastructure."
                            </p>
                        </div>
                    </div>

                    {/* Attached Files */}
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                        <p style={{ fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '16px' }}>ATTACHED FILES</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', border: '1px solid #f1f5f9', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ color: '#ef4444' }}><FileText size={18} /></div>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e40af' }}>Original CV.pdf</span>
                                </div>
                                <Download size={16} color="#94a3b8" />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', border: '1px solid #f1f5f9', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ color: '#5C9AFF' }}><ExternalLink size={18} /></div>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e40af' }}>Portfolio_2024.link</span>
                                </div>
                                <ExternalLink size={16} color="#94a3b8" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
