"use client";

import React from "react";
import {
    Building2,
    ShieldCheck,
    RefreshCcw,
    XCircle,
    MapPin,
    Mail,
    Globe,
    Phone,
    TrendingUp,
    TrendingDown,
    Users,
    Clock,
    DollarSign,
    CheckCircle2,
    MoreVertical,
    ChevronRight,
    Search,
    Bell,
    Settings,
    LogOut,
    Activity,
    Briefcase,
    LayoutDashboard,
    Edit3
} from "lucide-react";

export default function AdminCompanyDetailPage() {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC', fontFamily: 'sans-serif' }}>

            {/* Admin Sidebar */}
            <div style={{ width: '280px', backgroundColor: 'white', borderRight: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', padding: '32px 0' }}>
                <div style={{ padding: '0 32px', marginBottom: '48px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', backgroundColor: '#0f172a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '16px', height: '16px', border: '2px solid white', borderRadius: '2px' }}></div>
                    </div>
                    <div>
                        <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>My Job</h4>
                        <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0, fontWeight: 700 }}>ADMIN DASHBOARD</p>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 16px' }}>
                    {[
                        { name: "Companies", icon: <Building2 size={18} />, active: true },
                        { name: "Jobs", icon: <Briefcase size={18} /> },
                        { name: "Users", icon: <Users size={18} /> },
                        { name: "Platform Settings", icon: <Settings size={18} /> }
                    ].map(item => (
                        <div key={item.name} style={{
                            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                            backgroundColor: item.active ? '#eff6ff' : 'transparent',
                            color: item.active ? '#5C9AFF' : '#64748b'
                        }}>
                            {item.icon} {item.name}
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: 'auto', padding: '0 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: '#64748b', fontSize: '14px', fontWeight: 700 }}><Activity size={18} /> System Status</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: '#64748b', fontSize: '14px', fontWeight: 700 }}><LogOut size={18} /> Logout</div>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

                {/* Top Header */}
                <div style={{ height: '80px', backgroundColor: 'white', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input type="text" placeholder="Search companies..." style={{ width: '400px', padding: '12px 16px 12px 48px', backgroundColor: '#f8fafc', border: 'none', borderRadius: '12px', fontSize: '14px', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <Bell size={20} color="#64748b" />
                        <Settings size={20} color="#64748b" />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid #e2e8f0', paddingLeft: '24px' }}>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Admin User</p>
                                <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0, fontWeight: 700 }}>MY JOB</p>
                            </div>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#0f172a', overflow: 'hidden' }}>
                                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="admin" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Padding Wrapper */}
                <div style={{ padding: '32px 40px', overflowY: 'auto' }}>

                    {/* Header Breadcrumbs & Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '16px' }}>
                                Companies <ChevronRight size={14} /> <span style={{ color: '#5C9AFF' }}>Stellar Dynamics Inc.</span>
                            </div>
                            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                                <div style={{ width: '80px', height: '80px', backgroundColor: '#0f172a', borderRadius: '16px', overflow: 'hidden' }}>
                                    <img src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=200&auto=format&fit=crop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="logo" />
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Stellar Dynamics Inc.</h1>
                                        <span style={{ fontSize: '10px', fontWeight: 900, color: '#5C9AFF', backgroundColor: '#eff6ff', padding: '4px 12px', borderRadius: '4px' }}>PREMIUM PARTNER</span>
                                    </div>
                                    <p style={{ fontSize: '14px', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>Aerospace and Defense Manufacturing • Founded 2012</p>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button style={{ padding: '12px 24px', backgroundColor: '#f1f5f9', color: '#1e293b', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}><ShieldCheck size={18} /> Verify Company</button>
                            <button style={{ padding: '12px 24px', backgroundColor: '#f1f5f9', color: '#1e293b', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}><RefreshCcw size={18} /> Update Plan</button>
                            <button style={{ padding: '12px 24px', backgroundColor: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}><XCircle size={18} /> Suspend Account</button>
                        </div>
                    </div>

                    {/* Dashboard Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', marginBottom: '32px' }}>

                        {/* Info Section */}
                        <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>About Company</h3>
                                <button style={{ border: 'none', background: 'none', color: '#5C9AFF', fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}><Edit3 size={16} /> Edit Profile</button>
                            </div>
                            <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.8, marginBottom: '32px' }}>
                                Stellar Dynamics Inc. is a leading innovator in the aerospace sector, specializing in high-performance propulsion systems and autonomous satellite deployment technologies. Headquartered in Austin, Texas, they maintain a workforce of over 500 engineering specialists and are currently expanding their European operations.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                {[
                                    { label: "HEADQUARTERS", value: "Austin, Texas, USA", icon: <MapPin size={18} color="#5C9AFF" /> },
                                    { label: "CONTACT EMAIL", value: "hr@stellardynamics.io", icon: <Mail size={18} color="#5C9AFF" /> },
                                    { label: "WEBSITE", value: "stellardynamics.io", icon: <Globe size={18} color="#5C9AFF" />, link: true },
                                    { label: "PHONE", value: "+1 (512) 555-0198", icon: <Phone size={18} color="#5C9AFF" /> }
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <div style={{ width: '40px', height: '40px', backgroundColor: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</div>
                                        <div>
                                            <p style={{ fontSize: '9px', fontWeight: 900, color: '#94a3b8', marginBottom: '4px' }}>{item.label}</p>
                                            <h4 style={{ fontSize: '14px', fontWeight: 800, color: item.link ? '#5C9AFF' : '#1e293b', margin: 0 }}>{item.value}</h4>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Subscription Card */}
                        <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px', backgroundColor: '#eff6ff', borderRadius: '50%', opacity: 0.5 }}></div>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Subscription</h3>
                            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '32px', fontWeight: 600 }}>Billing Cycle: Monthly</p>

                            <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', padding: '24px', borderRadius: '20px', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <h4 style={{ fontSize: '24px', fontWeight: 800, color: '#5C9AFF', margin: 0 }}>Enterprise</h4>
                                    <span style={{ fontSize: '9px', fontWeight: 900, color: '#059669', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '20px' }}>ACTIVE</span>
                                </div>
                                <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '20px' }}>Active since Jan 2023</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                                    <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>Price</span>
                                    <span style={{ fontSize: '14px', fontWeight: 800 }}>$1,249 / mo</span>
                                </div>
                                <div style={{ marginTop: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 800 }}>Seats Used</span>
                                        <span style={{ fontSize: '11px', fontWeight: 900 }}>42 / 50</span>
                                    </div>
                                    <div style={{ height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ width: '84%', height: '100%', backgroundColor: '#5C9AFF' }}></div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {[
                                    "Unlimited Job Postings",
                                    "Advanced AI Screening",
                                    "Dedicated Account Manager"
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                                        <CheckCircle2 size={16} color="#5C9AFF" /> {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recruitment Performance Highlights */}
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9', marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '32px' }}>Recruitment Performance</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                            {[
                                { label: "TIME TO HIRE", value: "18 Days", change: "12% faster than avg", positive: true },
                                { label: "OFFER ACCEPTANCE", value: "92.4%", change: "4.1% increase", positive: true },
                                { label: "COST PER HIRE", value: "$2,140", change: "$120 above target", positive: false },
                                { label: "RETENTION RATE", value: "96.0%", change: "Consistent", positive: null }
                            ].map((stat, i) => (
                                <div key={i} style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                                    <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px' }}>{stat.label}</p>
                                    <h4 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{stat.value}</h4>
                                    <p style={{ fontSize: '11px', fontWeight: 700, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px', color: stat.positive === null ? '#94a3b8' : (stat.positive ? '#059669' : '#ef4444') }}>
                                        {stat.positive === true && <TrendingUp size={12} />}
                                        {stat.positive === false && <TrendingDown size={12} />}
                                        {stat.change}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Active Job Postings Table */}
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Active Job Postings (12)</h3>
                            <button style={{ border: 'none', background: 'none', color: '#5C9AFF', fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>View All Postings <ChevronRight size={16} /></button>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <th style={{ textAlign: 'left', paddingBottom: '16px', fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>POSITION</th>
                                        <th style={{ textAlign: 'left', paddingBottom: '16px', fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>LOCATION</th>
                                        <th style={{ textAlign: 'left', paddingBottom: '16px', fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>APPLICANTS</th>
                                        <th style={{ textAlign: 'left', paddingBottom: '16px', fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>DATE POSTED</th>
                                        <th style={{ textAlign: 'left', paddingBottom: '16px', fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>STATUS</th>
                                        <th style={{ textAlign: 'right', paddingBottom: '16px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { title: "Lead Propulsion Engineer", dept: "Engineering", id: "#88219", loc: "Austin, TX (Remote)", apps: 142, date: "Oct 12, 2023", stat: "FEATURED" },
                                        { title: "Senior Data Scientist", dept: "Data & AI", id: "#88204", loc: "Palo Alto, CA", apps: 89, date: "Oct 14, 2023", stat: "URGENT" },
                                        { title: "Strategic Account Manager", dept: "Sales", id: "#88195", loc: "New York, NY", apps: 215, date: "Oct 16, 2023", stat: "NORMAL" }
                                    ].map((job, i) => (
                                        <tr key={i} style={{ borderBottom: i === 2 ? 'none' : '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '24px 0' }}>
                                                <h5 style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{job.title}</h5>
                                                <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', fontWeight: 600 }}>{job.dept} • ID: {job.id}</p>
                                            </td>
                                            <td style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{job.loc}</td>
                                            <td style={{ fontSize: '15px', fontWeight: 800, color: '#5C9AFF' }}>{job.apps}</td>
                                            <td style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{job.date}</td>
                                            <td>
                                                <span style={{
                                                    fontSize: '9px', fontWeight: 900, padding: '4px 8px', borderRadius: '4px',
                                                    backgroundColor: job.stat === 'FEATURED' ? '#eff6ff' : (job.stat === 'URGENT' ? '#fff7ed' : '#f8fafc'),
                                                    color: job.stat === 'FEATURED' ? '#5C9AFF' : (job.stat === 'URGENT' ? '#ea580c' : '#64748b')
                                                }}>{job.stat}</span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}><MoreVertical size={18} color="#cbd5e1" /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
