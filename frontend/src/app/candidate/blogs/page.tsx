"use client";

import React, { useState, useEffect } from 'react';
import { 
    Search, 
    Calendar, 
    Eye, 
    ChevronRight, 
    Building2,
    Loader2,
    ArrowRight
} from 'lucide-react';
import { blogService, Blog } from '@/services/blog.service';
import Link from 'next/link';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

export default function CandidateBlogPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const data = await blogService.findAll({ status: 'PUBLISHED' });
            setBlogs(data || []);
        } catch (error) {
            console.error("Failed to fetch blogs:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredBlogs = blogs.filter(b => 
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.company?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '24px 24px 64px', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '48px', fontWeight: 900, color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.03em' }}>Discover Culture & Opportunities</h1>
                    <p style={{ fontSize: '16px', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>Gain insights from top employers to better understand their work environment and find your perfect fit.</p>
                </div>

                <div style={{ position: 'relative', maxWidth: '650px', margin: '0 auto 64px' }}>
                    <Search size={22} style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                        type="text" 
                        placeholder="Search for articles or companies..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={(e) => {
                            e.target.style.borderColor = '#5C9AFF';
                            e.target.style.boxShadow = '0 20px 25px -5px rgba(92, 154, 255, 0.1)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = '#e2e8f0';
                            e.target.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.05)';
                        }}
                        style={{ 
                            width: '100%', 
                            padding: '24px 32px 24px 64px', 
                            backgroundColor: 'white', 
                            border: '2px solid #e2e8f0', 
                            borderRadius: '32px', 
                            fontSize: '17px',
                            fontWeight: 500,
                            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)',
                            outline: 'none',
                            transition: 'all 0.3s ease',
                            color: '#0f172a'
                        }}
                    />
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                        <Loader2 className="animate-spin" size={48} color="#5C9AFF" />
                    </div>
                ) : (
                    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>Featured Articles</h2>
                        
                        {filteredBlogs.map((blog) => {
                            // Simple reading time calculation (avg 200 words per minute)
                            const wordCount = blog.content.split(/\s+/).length;
                            const readingTime = Math.ceil(wordCount / 200);

                            return (
                                <Link key={blog.id} href={`/candidate/blogs/${blog.id}`} style={{ textDecoration: 'none' }}>
                                    <div 
                                        style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '24px',
                                            gap: '40px',
                                            backgroundColor: 'white',
                                            borderRadius: '20px',
                                            border: '1px solid #f1f5f9',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                        }} 
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-4px)';
                                            e.currentTarget.style.boxShadow = '0 12px 20px -5px rgba(0,0,0,0.05)';
                                            e.currentTarget.style.borderColor = '#e2e8f0';
                                        }} 
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
                                            e.currentTarget.style.borderColor = '#f1f5f9';
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                                <div style={{ width: '28px', height: '28px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                                                    {blog.company?.logo ? <img src={blog.company.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <Building2 size={14} className="text-slate-400" />}
                                                </div>
                                                <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>{blog.company?.name}</span>
                                            </div>
                                            <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '8px', lineHeight: 1.4 }}>{blog.title}</h3>
                                            <p style={{ 
                                                fontSize: '15px', 
                                                color: '#64748b', 
                                                marginBottom: '16px', 
                                                lineHeight: 1.6,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                fontWeight: 400
                                            }}>
                                                {blog.content.replace(/[#*`\[\]\(\)\-\n]/g, ' ').trim()}
                                                <span style={{ color: '#5C9AFF', fontWeight: 700, marginLeft: '4px' }}>... read more</span>
                                            </p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#94a3b8', fontSize: '14px', fontWeight: 500 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Eye size={14} />
                                                    <span>{readingTime} min read</span>
                                                </div>
                                                <span>•</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Calendar size={14} />
                                                    <span>{format(new Date(blog.createdAt), 'dd MMM, yyyy', { locale: enUS })}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ width: '180px', height: '120px', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#f8fafc', flexShrink: 0, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)' }}>
                                            {blog.thumbnail ? (
                                                <img src={blog.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                                                    <Building2 size={32} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
