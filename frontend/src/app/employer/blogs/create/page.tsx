"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
    ArrowLeft, 
    Save, 
    Eye, 
    Image as ImageIcon, 
    Link as LinkIcon,
    Briefcase,
    Flag,
    Loader2,
    CheckCircle2,
    X,
    Bold,
    Italic,
    List as ListIcon,
    ListOrdered,
    Quote,
    Code,
    Type,
    Video,
    Minus,
    Table as TableIcon,
    Underline,
    Strikethrough,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Palette,
    ChevronDown,
    MoreHorizontal
} from 'lucide-react';
import { blogService } from '@/services/blog.service';
import { jobService } from '@/services/job.service';
import { campaignService } from '@/services/campaign.service';
import { apiUpload } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export default function CreateBlogPage() {
    const router = useRouter();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [uploading, setUploading] = useState(false);
    
    const [jobs, setJobs] = useState<any[]>([]);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        thumbnail: '',
        jobId: '',
        campaignId: '',
        status: 'PUBLISHED'
    });

    const [previewMode, setPreviewMode] = useState(false);
    const [isSplitView, setIsSplitView] = useState(true);
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [jobsData, campaignsData] = await Promise.all([
                    jobService.getAll(), 
                    campaignService.getAll()
                ]);
                setJobs(jobsData || []);
                setCampaigns(campaignsData || []);
            } catch (error) {
                console.error("Failed to load jobs/campaigns:", error);
            } finally {
                setFetchingData(false);
            }
        };
        loadInitialData();
    }, []);

    const insertMarkdown = (prefix: string, suffix: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const before = text.substring(0, start);
        const selection = text.substring(start, end);
        const after = text.substring(end);

        const newText = before + prefix + selection + suffix + after;
        setFormData({ ...formData, content: newText });

        // Reset focus and selection
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + prefix.length, end + prefix.length);
        }, 0);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', file);
            
            const result = await apiUpload<{ url: string }>('/upload/image', formData);
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
            const fullUrl = `${baseUrl}${result.url}`;
            setFormData(prev => ({ ...prev, thumbnail: fullUrl }));
        } catch (error: any) {
            console.error("Upload failed:", error);
            alert(`Image upload failed: ${error.message || 'Please try again.'}`);
        } finally {
            setUploading(false);
        }
    };

    const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const data = new FormData();
            data.append('file', file);
            const res = await apiUpload<{ url: string }>('/upload/image', data);
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
            insertMarkdown(`![image](${baseUrl}${res.url})`, '');
        } catch (err: any) {
            alert(`Image upload failed: ${err.message || ''}`);
        }
    };

    const handleInsertVideo = () => {
        const url = prompt("Enter YouTube Video URL:");
        if (url) {
            const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
            insertMarkdown(`\n<iframe width="100%" height="400" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>\n`, '');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.content) {
            alert("Please enter both title and content");
            return;
        }

        try {
            setLoading(true);
            const submitData = {
                ...formData,
                jobId: formData.jobId || null,
                campaignId: formData.campaignId || null
            };
            await blogService.create(submitData);
            router.push('/employer/blogs');
        } catch (error: any) {
            console.error("Failed to create blog:", error);
            alert(`Error occurred while saving the post: ${error.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const toolbarGroups = [
        {
            type: 'dropdown',
            label: 'Paragraph',
            icon: <ChevronDown size={14} />,
            options: [
                { label: 'Heading 1', action: () => insertMarkdown('# ', '') },
                { label: 'Heading 2', action: () => insertMarkdown('## ', '') },
                { label: 'Heading 3', action: () => insertMarkdown('### ', '') },
                { label: 'Text', action: () => insertMarkdown('', '') },
            ]
        },
        {
            type: 'dropdown',
            label: '16',
            icon: <ChevronDown size={14} />,
            options: [
                { label: '12px', action: () => {} },
                { label: '14px', action: () => {} },
                { label: '16px', action: () => {} },
                { label: '18px', action: () => {} },
                { label: '24px', action: () => {} },
            ]
        },
        {
            type: 'buttons',
            items: [
                { icon: <Bold size={18} />, action: () => insertMarkdown('**', '**'), label: 'Bold' },
                { icon: <Italic size={18} />, action: () => insertMarkdown('_', '_'), label: 'Italic' },
                { icon: <Underline size={18} />, action: () => insertMarkdown('<u>', '</u>'), label: 'Underline' },
                { icon: <Strikethrough size={18} />, action: () => insertMarkdown('~~', '~~'), label: 'Strikethrough' },
            ]
        },
        {
            type: 'buttons',
            items: [
                { icon: <Palette size={18} />, action: () => insertMarkdown('<span style="color: #5C9AFF">', '</span>'), label: 'Text Color' },
                { icon: <LinkIcon size={18} />, action: () => insertMarkdown('[Title](', ')'), label: 'Link' },
                { icon: <Quote size={18} />, action: () => insertMarkdown('> ', ''), label: 'Quote' },
                { icon: <Code size={18} />, action: () => insertMarkdown('```\n', '\n```'), label: 'Code' },
            ]
        },
        {
            type: 'buttons',
            items: [
                { icon: <ListIcon size={18} />, action: () => insertMarkdown('\n- ', ''), label: 'Bullet List' },
                { icon: <ListOrdered size={18} />, action: () => insertMarkdown('\n1. ', ''), label: 'Numbered List' },
            ]
        },
        {
            type: 'buttons',
            items: [
                { icon: <AlignLeft size={18} />, action: () => insertMarkdown('<div align="left">\n', '\n</div>'), label: 'Align Left' },
                { icon: <AlignCenter size={18} />, action: () => insertMarkdown('<div align="center">\n', '\n</div>'), label: 'Align Center' },
                { icon: <AlignRight size={18} />, action: () => insertMarkdown('<div align="right">\n', '\n</div>'), label: 'Align Right' },
            ]
        },
        {
            type: 'buttons',
            items: [
                { icon: <ImageIcon size={18} />, action: () => document.getElementById('content-image-upload')?.click(), label: 'Image' },
                { icon: <Video size={18} />, action: handleInsertVideo, label: 'Video' },
                { icon: <TableIcon size={18} />, action: () => insertMarkdown('\n| Col 1 | Col 2 |\n| --- | --- |\n| Content | Content |\n', ''), label: 'Table' },
                { icon: <Minus size={18} />, action: () => insertMarkdown('\n---\n', ''), label: 'Horizontal Rule' },
            ]
        }
    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            {/* Top Bar */}
            <div style={{ 
                position: 'sticky', 
                top: 0, 
                zIndex: 100, 
                backgroundColor: 'white', 
                borderBottom: '1px solid #e2e8f0', 
                padding: '16px 32px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Link href="/employer/blogs">
                        <button style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <ArrowLeft size={24} />
                        </button>
                    </Link>
                    <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Create New Post</h1>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        onClick={() => setIsSplitView(!isSplitView)}
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            backgroundColor: isSplitView ? '#EFF6FF' : 'white', 
                            color: isSplitView ? '#5C9AFF' : '#64748b', 
                            padding: '10px 20px', 
                            borderRadius: '10px', 
                            border: '1px solid',
                            borderColor: isSplitView ? '#5C9AFF' : '#e2e8f0',
                            fontWeight: 600, 
                            cursor: 'pointer' 
                        }}
                    >
                        <ListIcon size={18} /> {isSplitView ? 'Close Preview' : 'Split View'}
                    </button>
                    <button 
                        onClick={() => setPreviewMode(!previewMode)}
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            backgroundColor: previewMode ? '#f1f5f9' : 'white', 
                            color: '#64748b', 
                            padding: '10px 20px', 
                            borderRadius: '10px', 
                            border: '1px solid #e2e8f0', 
                            fontWeight: 600, 
                            cursor: 'pointer' 
                        }}
                    >
                        <Eye size={18} /> {previewMode ? 'Edit Post' : 'Full Screen'}
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={loading}
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            backgroundColor: '#5C9AFF', 
                            color: 'white', 
                            padding: '10px 24px', 
                            borderRadius: '10px', 
                            border: 'none', 
                            fontWeight: 600, 
                            cursor: 'pointer',
                            boxShadow: '0 4px 6px -1px rgba(92, 154, 255, 0.2)',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Publish Post
                    </button>
                </div>
            </div>

            <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: previewMode ? '1fr' : '2fr 1fr', gap: '32px' }}>
                {previewMode ? (
                    <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '64px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', minHeight: '600px' }}>
                        {formData.thumbnail && (
                            <img src={formData.thumbnail} alt="" style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '20px', marginBottom: '32px' }} />
                        )}
                        <h1 style={{ fontSize: '48px', fontWeight: 900, color: '#0f172a', marginBottom: '24px', lineHeight: 1.2 }}>{formData.title || 'Post Title'}</h1>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '48px' }}>
                            {formData.jobId && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#EFF6FF', color: '#5C9AFF', borderRadius: '100px', fontSize: '14px', fontWeight: 600 }}>
                                    <Briefcase size={16} /> Job: {jobs.find(j => j.id === formData.jobId)?.title}
                                </div>
                            )}
                            {formData.campaignId && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#F0FDF4', color: '#22c55e', borderRadius: '100px', fontSize: '14px', fontWeight: 600 }}>
                                    <Flag size={16} /> Campaign: {campaigns.find(c => c.id === formData.campaignId)?.name}
                                </div>
                            )}
                        </div>
                        <div className="markdown-preview" style={{ fontSize: '18px', color: '#334155', lineHeight: 1.8 }}>
                            <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                                components={{
                                    img: ({node, ...props}) => <img {...props} style={{maxWidth: '100%', borderRadius: '12px', margin: '24px 0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                                }}
                            >
                                {formData.content || 'Post content will appear here...'}
                            </ReactMarkdown>
                            
                            <style jsx global>{`
                                .markdown-preview h1, .markdown-preview h2, .markdown-preview h3 {
                                    color: #0f172a;
                                    margin-top: 32px;
                                    margin-bottom: 16px;
                                    font-weight: 800;
                                }
                                .markdown-preview h1 { font-size: 32px; }
                                .markdown-preview h2 { font-size: 24px; }
                                .markdown-preview h3 { font-size: 20px; }
                                .markdown-preview p { margin-bottom: 20px; }
                                .markdown-preview ul, .markdown-preview ol {
                                    margin-bottom: 20px;
                                    padding-left: 24px;
                                }
                                .markdown-preview li { margin-bottom: 8px; }
                                .markdown-preview blockquote {
                                    border-left: 4px solid #5C9AFF;
                                    padding-left: 20px;
                                    font-style: italic;
                                    color: #64748b;
                                    margin: 32px 0;
                                }
                                .markdown-preview code {
                                    background-color: #f1f5f9;
                                    padding: 2px 6px;
                                    borderRadius: 4px;
                                    font-family: monospace;
                                }
                                .markdown-preview pre {
                                    background-color: #0f172a;
                                    color: #f8fafc;
                                    padding: 16px;
                                    border-radius: 8px;
                                    overflow-x: auto;
                                }
                            `}</style>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Editor Section */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9' }}>
                                <input 
                                    type="text" 
                                    placeholder="Enter an impressive title..." 
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    style={{ 
                                        width: '100%', 
                                        fontSize: '32px', 
                                        fontWeight: 800, 
                                        border: 'none', 
                                        outline: 'none', 
                                        color: '#0f172a',
                                        marginBottom: '24px'
                                    }}
                                />

                                {/* Consolidated Toolbar Area */}
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '24px', 
                                    padding: '12px 16px', 
                                    backgroundColor: '#f8fafc', 
                                    borderRadius: '16px', 
                                    marginBottom: '24px',
                                    border: '1px solid #f1f5f9',
                                    flexWrap: 'wrap'
                                }}>
                                    {/* Markdown Tools Grouped */}
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                        {toolbarGroups.map((group, gIndex) => (
                                            <React.Fragment key={gIndex}>
                                                {group.type === 'dropdown' ? (
                                                    <div style={{ position: 'relative' }}>
                                                        <div 
                                                            onClick={() => setActiveDropdown(activeDropdown === gIndex ? null : gIndex)}
                                                            style={{ 
                                                                display: 'flex', 
                                                                alignItems: 'center', 
                                                                gap: '4px', 
                                                                padding: '4px 8px', 
                                                                borderRadius: '6px', 
                                                                cursor: 'pointer',
                                                                color: '#475569',
                                                                fontSize: '13px',
                                                                fontWeight: 500,
                                                                backgroundColor: activeDropdown === gIndex ? '#f1f5f9' : 'transparent',
                                                                border: '1px solid transparent'
                                                            }} 
                                                            onMouseEnter={(e) => { if (activeDropdown !== gIndex) e.currentTarget.style.backgroundColor = '#f1f5f9' }} 
                                                            onMouseLeave={(e) => { if (activeDropdown !== gIndex) e.currentTarget.style.backgroundColor = 'transparent' }}
                                                        >
                                                            {group.label} {group.icon}
                                                        </div>
                                                        {activeDropdown === gIndex && (
                                                            <div style={{ 
                                                                position: 'absolute', 
                                                                top: '100%', 
                                                                left: 0, 
                                                                marginTop: '4px',
                                                                backgroundColor: 'white', 
                                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                                                                borderRadius: '8px', 
                                                                padding: '4px',
                                                                zIndex: 1000,
                                                                minWidth: '120px',
                                                                border: '1px solid #e2e8f0'
                                                            }}>
                                                                {group.options?.map((opt, oIdx) => (
                                                                    <div 
                                                                        key={oIdx}
                                                                        onClick={() => {
                                                                            opt.action();
                                                                            setActiveDropdown(null);
                                                                        }}
                                                                        style={{ 
                                                                            padding: '8px 12px', 
                                                                            fontSize: '13px', 
                                                                            color: '#475569', 
                                                                            cursor: 'pointer',
                                                                            borderRadius: '4px',
                                                                            transition: 'background 0.2s'
                                                                        }}
                                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                                    >
                                                                        {opt.label}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', gap: '2px' }}>
                                                        {group.items?.map((item, iIndex) => (
                                                            <button 
                                                                key={iIndex}
                                                                onClick={item.action}
                                                                title={item.label}
                                                                style={{ 
                                                                    padding: '6px', 
                                                                    background: 'none', 
                                                                    border: 'none', 
                                                                    color: '#475569', 
                                                                    cursor: 'pointer', 
                                                                    borderRadius: '6px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                                                                    e.currentTarget.style.color = '#0f172a';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                                    e.currentTarget.style.color = '#475569';
                                                                }}
                                                            >
                                                                {item.icon}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                                {gIndex < toolbarGroups.length - 1 && <div style={{ width: '1px', height: '20px', backgroundColor: '#e2e8f0', margin: '0 4px' }} />}
                                            </React.Fragment>
                                        ))}
                                    </div>

                                    {/* Data Selectors merged into toolbar */}
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: 'white', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                            <Briefcase size={14} color="#64748b" />
                                            <select 
                                                value={formData.jobId}
                                                onChange={(e) => setFormData({...formData, jobId: e.target.value})}
                                                style={{ border: 'none', outline: 'none', fontSize: '13px', fontWeight: 600, color: '#0f172a', backgroundColor: 'transparent', minWidth: '120px' }}
                                            >
                                                <option value="">Attach Job...</option>
                                                {jobs.map(job => (
                                                    <option key={job.id} value={job.id}>{job.title}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: 'white', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                            <Flag size={14} color="#64748b" />
                                            <select 
                                                value={formData.campaignId}
                                                onChange={(e) => setFormData({...formData, campaignId: e.target.value})}
                                                style={{ border: 'none', outline: 'none', fontSize: '13px', fontWeight: 600, color: '#0f172a', backgroundColor: 'transparent', minWidth: '120px' }}
                                            >
                                                <option value="">Attach Campaign...</option>
                                                {campaigns.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ height: '1px', backgroundColor: '#f1f5f9', marginBottom: '24px' }} />
                                
                                <div style={{ display: 'flex', gap: '32px', minHeight: '600px' }}>
                                    {/* Editor Area */}
                                    <div style={{ flex: 1, borderRight: isSplitView ? '1px solid #f1f5f9' : 'none', paddingRight: isSplitView ? '32px' : 0 }}>
                                        <textarea 
                                            ref={textareaRef}
                                            placeholder="Start writing your content here (Markdown supported)..." 
                                            value={formData.content}
                                            onChange={(e) => setFormData({...formData, content: e.target.value})}
                                            style={{ 
                                                width: '100%', 
                                                height: '100%',
                                                minHeight: '600px',
                                                fontSize: '17px', 
                                                border: 'none', 
                                                outline: 'none', 
                                                color: '#334155', 
                                                lineHeight: 1.6,
                                                resize: 'none',
                                                fontFamily: 'inherit'
                                            }}
                                        />
                                    </div>

                                    {/* Live Preview Area */}
                                    {isSplitView && (
                                        <div style={{ flex: 1, maxHeight: '800px', overflowY: 'auto', paddingLeft: '8px' }}>
                                            <div className="markdown-preview" style={{ fontSize: '16px', color: '#334155', lineHeight: 1.7 }}>
                                                <ReactMarkdown 
                                                    remarkPlugins={[remarkGfm]}
                                                    rehypePlugins={[rehypeRaw]}
                                                    components={{
                                                        img: ({node, ...props}) => <img {...props} style={{maxWidth: '100%', borderRadius: '8px', margin: '16px 0', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}} />,
                                                        iframe: ({node, ...props}) => <div style={{ margin: '16px 0', borderRadius: '8px', overflow: 'hidden' }}><iframe {...props} /></div>
                                                    }}
                                                >
                                                    {formData.content || '*Preview content will appear here...*'}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <input 
                                    id="content-image-upload" 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleContentImageUpload} 
                                    style={{ display: 'none' }} 
                                />
                            </div>
                        </div>

                        {/* Sidebar Config */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <ImageIcon size={18} /> Featured Image (Thumbnail)
                                </h3>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div 
                                        style={{ 
                                            width: '100%', 
                                            height: '150px', 
                                            borderRadius: '16px', 
                                            border: '2px dashed #e2e8f0',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            overflow: 'hidden',
                                            position: 'relative',
                                            transition: 'all 0.2s'
                                        }}
                                        onClick={() => document.getElementById('thumbnail-upload')?.click()}
                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#5C9AFF'}
                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                                    >
                                        {uploading ? (
                                            <Loader2 className="animate-spin" color="#5C9AFF" />
                                        ) : formData.thumbnail ? (
                                            <>
                                                <img src={formData.thumbnail} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}>
                                                    <span style={{ color: 'white', fontWeight: 700, fontSize: '12px' }}>Change Image</span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <ImageIcon size={24} color="#94a3b8" />
                                                <span style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>Upload from computer</span>
                                            </>
                                        )}
                                    </div>
                                    <input 
                                        id="thumbnail-upload"
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        style={{ display: 'none' }}
                                    />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ flex: 1, height: '1px', backgroundColor: '#f1f5f9' }}></div>
                                        <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>OR</span>
                                        <div style={{ flex: 1, height: '1px', backgroundColor: '#f1f5f9' }}></div>
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="Paste image URL here..." 
                                        value={formData.thumbnail}
                                        onChange={(e) => setFormData({...formData, thumbnail: e.target.value})}
                                        style={{ 
                                            width: '100%', 
                                            padding: '12px 16px', 
                                            backgroundColor: '#f8fafc', 
                                            border: '1px solid #e2e8f0', 
                                            borderRadius: '12px', 
                                            fontSize: '14px',
                                        }}
                                    />
                                </div>
                                {formData.thumbnail && (
                                    <button 
                                        onClick={() => setFormData({...formData, thumbnail: ''})}
                                        style={{ marginTop: '12px', width: '100%', padding: '8px', background: 'none', border: '1px solid #fee2e2', borderRadius: '10px', color: '#ef4444', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        Remove Image
                                    </button>
                                )}
                            </div>



                            <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>Status</h3>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button 
                                        onClick={() => setFormData({...formData, status: 'PUBLISHED'})}
                                        style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid', borderColor: formData.status === 'PUBLISHED' ? '#5C9AFF' : '#e2e8f0', backgroundColor: formData.status === 'PUBLISHED' ? '#EFF6FF' : 'white', color: formData.status === 'PUBLISHED' ? '#5C9AFF' : '#64748b', fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        Public
                                    </button>
                                    <button 
                                        onClick={() => setFormData({...formData, status: 'DRAFT'})}
                                        style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid', borderColor: formData.status === 'DRAFT' ? '#5C9AFF' : '#e2e8f0', backgroundColor: formData.status === 'DRAFT' ? '#EFF6FF' : 'white', color: formData.status === 'DRAFT' ? '#5C9AFF' : '#64748b', fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        Draft
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
