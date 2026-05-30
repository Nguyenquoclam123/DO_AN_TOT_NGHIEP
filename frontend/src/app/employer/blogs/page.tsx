"use client";

import React, { useState, useEffect } from 'react';
import { 
    Plus, 
    Search, 
    MoreVertical, 
    Edit2, 
    Trash2, 
    Eye, 
    Calendar,
    MessageSquare,
    ChevronRight,
    Loader2,
    FileText,
    ExternalLink
} from 'lucide-react';
import { blogService, Blog } from '@/services/blog.service';
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function EmployerBlogPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const data = await blogService.findMyBlogs();
            setBlogs(data || []);
        } catch (error) {
            console.error("Failed to fetch blogs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        try {
            await blogService.remove(id);
            setBlogs(blogs.filter(b => b.id !== id));
        } catch (error) {
            alert("Deletion failed");
        }
    };

    const filteredBlogs = blogs.filter(b => 
        b.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Blog Management</h1>
                    <p style={{ color: '#64748b', marginTop: '4px' }}>Share your stories, company culture, and recruitment news</p>
                </div>
                <Link href="/employer/blogs/create">
                    <button style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        backgroundColor: '#5C9AFF', 
                        color: 'white', 
                        padding: '12px 24px', 
                        borderRadius: '12px', 
                        border: 'none', 
                        fontWeight: 600, 
                        cursor: 'pointer',
                        boxShadow: '0 10px 15px -3px rgba(92, 154, 255, 0.3)'
                    }}>
                        <Plus size={20} /> Create New Post
                    </button>
                </Link>
            </div>

            <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '20px', 
                padding: '24px', 
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                border: '1px solid #f1f5f9'
            }}>
                <div style={{ position: 'relative', marginBottom: '24px' }}>
                    <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                        type="text" 
                        placeholder="Search posts..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ 
                            width: '100%', 
                            padding: '14px 16px 14px 48px', 
                            backgroundColor: '#f8fafc', 
                            border: '1px solid #e2e8f0', 
                            borderRadius: '14px', 
                            fontSize: '15px',
                            outline: 'none'
                        }}
                    />
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                        <Loader2 className="animate-spin" size={32} color="#5C9AFF" />
                    </div>
                ) : filteredBlogs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8' }}>
                        <FileText size={64} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                        <h3>No posts yet</h3>
                        <p>Start sharing your first posts today</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {filteredBlogs.map(blog => (
                            <div key={blog.id} style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                padding: '20px', 
                                borderRadius: '16px', 
                                border: '1px solid #f1f5f9',
                                transition: 'all 0.2s',
                                cursor: 'default'
                            }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#5C9AFF'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#f1f5f9'}>
                                <div style={{ 
                                    width: '120px', 
                                    height: '80px', 
                                    backgroundColor: '#f1f5f9', 
                                    borderRadius: '12px', 
                                    overflow: 'hidden',
                                    marginRight: '20px',
                                    flexShrink: 0
                                }}>
                                    {blog.thumbnail ? (
                                        <img src={blog.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                                            <FileText size={32} />
                                        </div>
                                    )}
                                </div>
                                
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <span style={{ 
                                            padding: '2px 8px', 
                                            backgroundColor: blog.status === 'PUBLISHED' ? '#dcfce7' : '#fef9c3', 
                                            color: blog.status === 'PUBLISHED' ? '#166534' : '#854d0e',
                                            borderRadius: '6px',
                                            fontSize: '11px',
                                            fontWeight: 700
                                        }}>
                                            {blog.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT'}
                                        </span>
                                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                                            {format(new Date(blog.createdAt), 'dd/MM/yyyy', { locale: vi })}
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b', margin: '0 0 8px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {blog.title}
                                    </h3>
                                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#64748b' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={14} /> {blog.views} views</span>
                                        {blog.job && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#5C9AFF' }}><ExternalLink size={14} /> Linked Job: {blog.job.title}</span>}
                                        {blog.campaign && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#5C9AFF' }}><ExternalLink size={14} /> Linked Campaign: {blog.campaign.name}</span>}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <Link href={`/employer/blogs/${blog.id}/edit`}>
                                        <button style={{ padding: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#64748b', cursor: 'pointer' }}>
                                            <Edit2 size={18} />
                                        </button>
                                    </Link>
                                    <button 
                                        onClick={() => handleDelete(blog.id)}
                                        style={{ padding: '10px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '10px', color: '#ef4444', cursor: 'pointer' }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
