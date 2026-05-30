"use client";

import React, { useState, useEffect } from 'react';
import { 
    ArrowLeft, 
    Calendar, 
    Eye, 
    Building2, 
    Briefcase, 
    Flag, 
    ChevronRight,
    Loader2,
    Share2,
    Bookmark
} from 'lucide-react';
import { blogService, Blog } from '@/services/blog.service';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export default function BlogDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [blog, setBlog] = useState<Blog | null>(null);
    const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchBlog();
    }, [id]);

    const fetchBlog = async () => {
        try {
            setLoading(true);
            const data = await blogService.findOne(id as string);
            setBlog(data);
            
            // Fetch related blogs from the same company
            if (data?.companyId) {
                const allBlogs = await blogService.findAll({ status: 'PUBLISHED' });
                // Filter out current blog and prioritize same company
                const related = allBlogs
                    .filter(b => b.id !== id)
                    .sort((a, b) => {
                        if (a.companyId === data.companyId && b.companyId !== data.companyId) return -1;
                        if (a.companyId !== data.companyId && b.companyId === data.companyId) return 1;
                        return 0;
                    })
                    .slice(0, 3);
                setRelatedBlogs(related);
            }
        } catch (error) {
            console.error("Failed to fetch blog:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Loader2 className="animate-spin" size={48} color="#5C9AFF" />
            </div>
        );
    }

    if (!blog) {
        return (
            <div style={{ textAlign: 'center', padding: '100px' }}>
                <h2>Article not found</h2>
                <Link href="/candidate/blogs">Go back</Link>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: 'white', minHeight: '100vh' }}>
            {/* Header / Banner */}
            <div style={{ position: 'relative', width: '100%', height: '500px', backgroundColor: '#0f172a' }}>
                {blog.thumbnail ? (
                    <img src={blog.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.1)' }}>
                        <Building2 size={200} />
                    </div>
                )}
                
                <div style={{ position: 'absolute', top: '32px', left: '32px' }}>
                    <button 
                        onClick={() => router.back()}
                        style={{ backgroundColor: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '12px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}
                    >
                        <ArrowLeft size={24} />
                    </button>
                </div>

                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '64px 24px', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'white', marginBottom: '24px', opacity: 0.9 }}>
                            <div style={{ width: '40px', height: '40px', backgroundColor: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                {blog.company?.logo ? <img src={blog.company.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <Building2 size={20} color="#0f172a" />}
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontWeight: 700 }}>{blog.company?.name}</h4>
                                <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {format(new Date(blog.createdAt), 'dd MMMM, yyyy', { locale: enUS })}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={14} /> {blog.views} views</span>
                                </div>
                            </div>
                        </div>
                        <h1 style={{ fontSize: '56px', fontWeight: 900, color: 'white', margin: 0, lineHeight: 1.1 }}>{blog.title}</h1>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '64px 24px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '64px' }}>
                <div className="markdown-content" style={{ fontSize: '18px', color: '#334155', lineHeight: 1.8 }}>
                    <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                            img: ({node, ...props}) => <img {...props} style={{maxWidth: '100%', borderRadius: '16px', margin: '32px 0'}} />,
                            iframe: ({node, ...props}) => <div style={{ margin: '32px 0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}><iframe {...props} /></div>
                        }}
                    >
                        {blog.content}
                    </ReactMarkdown>
                    
                    <style jsx global>{`
                        .markdown-content h1, .markdown-content h2, .markdown-content h3 {
                            color: #0f172a;
                            margin-top: 32px;
                            margin-bottom: 16px;
                            font-weight: 800;
                        }
                        .markdown-content h1 { font-size: 32px; }
                        .markdown-content h2 { font-size: 24px; }
                        .markdown-content h3 { font-size: 20px; }
                        .markdown-content p { margin-bottom: 20px; }
                        .markdown-content ul, .markdown-content ol {
                            margin-bottom: 20px;
                            padding-left: 24px;
                        }
                        .markdown-content li { margin-bottom: 8px; }
                        .markdown-content blockquote {
                            border-left: 4px solid #5C9AFF;
                            padding-left: 20px;
                            font-style: italic;
                            color: #64748b;
                            margin: 32px 0;
                        }
                        .markdown-content code {
                            background-color: #f1f5f9;
                            padding: 2px 6px;
                            borderRadius: 4px;
                            font-family: monospace;
                            font-size: 0.9em;
                        }
                        .markdown-content pre {
                            background-color: #0f172a;
                            color: #f8fafc;
                            padding: 24px;
                            border-radius: 16px;
                            overflow-x: auto;
                            margin: 32px 0;
                        }
                        .markdown-content img {
                            max-width: 100%;
                            border-radius: 16px;
                            margin: 32px 0;
                        }
                        .markdown-content table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 24px;
                        }
                        .markdown-content th, .markdown-content td {
                            padding: 12px;
                            border: 1px solid #e2e8f0;
                            text-align: left;
                        }
                        .markdown-content th {
                            background-color: #f8fafc;
                            font-weight: 700;
                        }
                    `}</style>
                </div>

                {/* Sidebar with Linked items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {(blog.job || blog.campaign) && (
                        <div style={{ position: 'sticky', top: '100px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>Related</h3>
                            
                            {blog.job && (
                                <Link href={`/candidate/jobs/${blog.jobId}`} style={{ textDecoration: 'none' }}>
                                    <div style={{ 
                                        padding: '24px', 
                                        borderRadius: '20px', 
                                        backgroundColor: '#EFF6FF', 
                                        border: '1px solid #DBEAFE', 
                                        marginBottom: '16px',
                                        transition: 'all 0.2s'
                                    }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#5C9AFF', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '12px' }}>
                                            <Briefcase size={16} /> Job Opportunity
                                        </div>
                                        <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#1e3a8a', margin: '0 0 16px 0' }}>{blog.job.title}</h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#5C9AFF', fontWeight: 700, fontSize: '14px' }}>
                                            View Details <ChevronRight size={16} />
                                        </div>
                                    </div>
                                </Link>
                            )}

                            {blog.campaign && (
                                <Link href={`/candidate/campaigns/${blog.campaignId}`} style={{ textDecoration: 'none' }}>
                                    <div style={{ 
                                        padding: '24px', 
                                        borderRadius: '20px', 
                                        backgroundColor: '#F0FDF4', 
                                        border: '1px solid #DCFCE7',
                                        transition: 'all 0.2s'
                                    }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#22c55e', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '12px' }}>
                                            <Flag size={16} /> Recruitment Campaign
                                        </div>
                                        <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#064e3b', margin: '0 0 16px 0' }}>{blog.campaign.name}</h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#22c55e', fontWeight: 700, fontSize: '14px' }}>
                                            View Details <ChevronRight size={16} />
                                        </div>
                                    </div>
                                </Link>
                            )}

                            <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
                                <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: 600, cursor: 'pointer', backgroundColor: 'white' }}>
                                    <Share2 size={18} /> Share
                                </button>
                                <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer', backgroundColor: 'white' }}>
                                    <Bookmark size={18} />
                                </button>
                            </div>

                            {/* Related Blogs Section */}
                            {relatedBlogs.length > 0 && (
                                <div style={{ marginTop: '48px' }}>
                                    <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>Related Articles</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        {relatedBlogs.map(rBlog => {
                                            const wordCount = rBlog.content.split(/\s+/).length;
                                            const rReadingTime = Math.ceil(wordCount / 200);
                                            
                                            return (
                                                <Link key={rBlog.id} href={`/candidate/blogs/${rBlog.id}`} style={{ textDecoration: 'none' }}>
                                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                        <div style={{ width: '80px', height: '60px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#f1f5f9' }}>
                                                            {rBlog.thumbnail ? (
                                                                <img src={rBlog.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            ) : (
                                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                                                                    <Building2 size={20} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', lineHeight: 1.4 }}>{rBlog.title}</h4>
                                                            <span style={{ fontSize: '12px', color: '#64748b' }}>{rReadingTime} min read</span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer with More from Company */}
            <div style={{ backgroundColor: '#f8fafc', padding: '80px 24px', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
                    <div style={{ width: '80px', height: '80px', backgroundColor: 'white', borderRadius: '20px', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                        {blog.company?.logo ? <img src={blog.company.logo} alt="" style={{ width: '70%', height: '70%', objectFit: 'contain' }} /> : <Building2 size={32} color="#94a3b8" />}
                    </div>
                    <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>{blog.company?.name}</h3>
                    <p style={{ color: '#64748b', marginBottom: '32px' }}>Discover more stories and opportunities from us.</p>
                    <Link href={`/candidate/companies/${blog.companyId}`}>
                        <button style={{ padding: '12px 32px', backgroundColor: '#5C9AFF', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(92, 154, 255, 0.3)' }}>
                            View Company Profile
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
