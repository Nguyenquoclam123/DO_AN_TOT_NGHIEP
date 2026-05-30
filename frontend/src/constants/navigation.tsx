import React from 'react';
import {
    LayoutDashboard,
    Building2,
    Briefcase,
    Settings2,
    Activity,
    ShieldCheck,
    Users,
    Zap,
    BarChart3,
    Search,
    Bookmark,
    FileText
} from "lucide-react";

export const ADMIN_MENU = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", href: "/admin/dashboard" },
    { icon: <Building2 size={20} />, label: "Companies", href: "/admin/companies" },
    { icon: <Briefcase size={20} />, label: "Jobs", href: "/admin/jobs" },
    { icon: <Settings2 size={20} />, label: "AI Management", href: "/admin/ai-management" },
    { icon: <Activity size={20} />, label: "Logs", href: "/admin/logs" },
    { icon: <ShieldCheck size={20} />, label: "Settings", href: "/admin/settings" },
];

export const EMPLOYER_MENU = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", href: "/employer/dashboard" },
    { icon: <Users size={20} />, label: "Candidates", href: "/employer/candidates" },
    { icon: <Briefcase size={20} />, label: "Jobs", href: "/employer/jobs" },
    { icon: <Zap size={20} />, label: "Question Bank", href: "/employer/question-bank" },
    { icon: <BarChart3 size={20} />, label: "Analytics", href: "/employer/analytics" },
    { icon: <Settings2 size={20} />, label: "Settings", href: "/employer/settings" },
];

export const CANDIDATE_MENU = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", href: "/candidate/dashboard" },
    { icon: <Search size={20} />, label: "Browse Jobs", href: "/candidate/jobs" },
    { icon: <FileText size={20} />, label: "My Applications", href: "/candidate/applications" },
    { icon: <Bookmark size={20} />, label: "Saved Jobs", href: "/candidate/cv/saved" },
    { icon: <Users size={20} />, label: "Resume Builder", href: "/candidate/cv/builder" },
];
