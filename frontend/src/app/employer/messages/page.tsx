"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
    Search, 
    MessageSquare, 
    Send, 
    Paperclip, 
    MoreVertical, 
    User, 
    Building2, 
    Briefcase,
    Loader2,
    SearchX,
    ChevronLeft,
    Mail,
    Phone,
    Calendar,
    CheckCircle2,
    Clock
} from 'lucide-react';
import { chatService, ChatRoom, Message } from '@/services/chat.service';
import { applicationService, Application } from '@/services/application.service';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

export default function EmployerMessagesPage() {
    const { user } = useAuthStore();
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [roomsLoading, setRoomsLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [candidateApplications, setCandidateApplications] = useState<Application[]>([]);
    const [loadingApps, setLoadingApps] = useState(false);
    const [showCandidateSidebar, setShowCandidateSidebar] = useState(true);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // 1. Fetch Rooms
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                setRoomsLoading(true);
                const data = await chatService.getMyRooms();
                setRooms(data || []);
                setRoomsLoading(false);
            } catch (error) {
                console.error("Failed to fetch rooms:", error);
                setRoomsLoading(false);
            }
        };

        if (user) {
            fetchRooms();
        }
    }, [user]);

    // 2. Global Listener for Room List Updates
    useEffect(() => {
        if (!user) return;

        const handleGlobalMessage = (msg: Message) => {
            console.log("MessagesPage: Received global newMessage", msg);
            setRooms(prevRooms => {
                const roomExists = prevRooms.some(r => r.id === msg.roomId);
                
                let updatedRooms;
                if (roomExists) {
                    updatedRooms = prevRooms.map(r => {
                        if (r.id === msg.roomId) {
                            const newUnreadCount = (selectedRoom?.id === r.id) ? 0 : (r.unreadCount || 0) + (msg.senderId !== user.id ? 1 : 0);
                            return { 
                                ...r, 
                                messages: [msg], 
                                unreadCount: newUnreadCount 
                            };
                        }
                        return r;
                    });
                } else {
                    // If room doesn't exist in list (e.g. brand new conversation)
                    // We might need to fetch the room details from API
                    // For now, let's just trigger a re-fetch of rooms
                    chatService.getMyRooms().then(data => setRooms(data || []));
                    return prevRooms;
                }

                return [...updatedRooms].sort((a, b) => {
                    const dateA = a.messages?.[0]?.createdAt || 0;
                    const dateB = b.messages?.[0]?.createdAt || 0;
                    return new Date(dateB).getTime() - new Date(dateA).getTime();
                });
            });

            // Also update messages if it's the selected room
            if (selectedRoom?.id === msg.roomId) {
                setMessages(prev => {
                    if (prev.some(m => m.id === msg.id)) return prev;
                    return [...prev, msg];
                });
                setTimeout(scrollToBottom, 100);
            }
        };

        chatService.onNewMessage(handleGlobalMessage);
        return () => {
            chatService.offNewMessage(handleGlobalMessage);
        };
    }, [user, selectedRoom]);

    // 3. Room-specific Setup (Join room, load history)
    useEffect(() => {
        if (!selectedRoom || !user) return;

        const setupRoom = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('access_token') || '';
                chatService.connect(token);
                chatService.joinRoom(selectedRoom.id);

                const history = await chatService.getMessages(selectedRoom.id);
                setMessages(history);

                setLoading(false);
                setTimeout(scrollToBottom, 300);

                // Mark as read
                await chatService.markAsRead(selectedRoom.id);
                setRooms(prev => prev.map(r => 
                    r.id === selectedRoom.id ? { ...r, unreadCount: 0 } : r
                ));

                // Fetch candidate applications
                if (selectedRoom.candidateId) {
                    setLoadingApps(true);
                    const allApps = await applicationService.getAll();
                    const filtered = allApps.filter(app => app.candidateId === selectedRoom.candidateId);
                    setCandidateApplications(filtered);
                    setLoadingApps(false);
                }
            } catch (error) {
                console.error("Failed to setup room:", error);
                setLoading(false);
                setLoadingApps(false);
            }
        };

        setupRoom();

        return () => {
            if (selectedRoom) chatService.leaveRoom(selectedRoom.id);
        };
    }, [selectedRoom?.id, user]); // Only re-run when room ID changes

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!inputText.trim() || !selectedRoom || !user) return;

        const messageText = inputText.trim();
        const roomId = selectedRoom.id;

        // 1. Clear input immediately
        setInputText('');

        // 2. Optimistic Update
        const optimisticMessage: Message = {
            id: `temp-${Date.now()}`,
            roomId: roomId,
            senderId: user.id,
            messageText: messageText,
            createdAt: new Date().toISOString(),
            sender: {
                id: user.id,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                role: user.role
            }
        };

        setMessages(prev => [...prev, optimisticMessage]);
        setTimeout(scrollToBottom, 50);

        // 3. Send via Socket
        try {
            chatService.sendMessage({
                roomId: roomId,
                senderId: user.id,
                messageText: messageText,
            });
            chatService.sendTyping(roomId, user.id, false);
        } catch (err) {
            console.error("Failed to send message:", err);
            // Optionally remove optimistic message or show error
        }
    };

    const filteredRooms = rooms.filter(room => 
        `${room.candidate?.firstName} ${room.candidate?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.job?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!user) return null;

    return (
        <div style={{ 
            height: 'calc(100vh - 100px)', 
            backgroundColor: 'white', 
            borderRadius: '24px', 
            display: 'flex', 
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            margin: '20px',
            border: '1px solid #f1f5f9'
        }}>
            {/* Left Sidebar */}
            <div style={{ width: '380px', borderRight: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '20px' }}>Candidate Conversations</h2>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input 
                            type="text" 
                            placeholder="Search candidates or jobs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '12px 16px 12px 44px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', fontSize: '14px', outline: 'none' }}
                        />
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                    {roomsLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 size={24} className="animate-spin" color="#5C9AFF" /></div>
                    ) : filteredRooms.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}><SearchX size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} /><p style={{ fontSize: '14px' }}>No conversations found</p></div>
                    ) : (
                        filteredRooms.map(room => (
                            <div 
                                key={room.id}
                                onClick={() => setSelectedRoom(room)}
                                style={{ 
                                    padding: '16px', borderRadius: '16px', cursor: 'pointer', marginBottom: '8px',
                                    backgroundColor: selectedRoom?.id === room.id ? '#EFF6FF' : 'transparent',
                                    border: selectedRoom?.id === room.id ? '1px solid #DBEAFE' : '1px solid transparent'
                                }}
                            >
                                <div style={{ display: 'flex', gap: '14px' }}>
                                    <div style={{ width: '48px', height: '48px', backgroundColor: '#f1f5f9', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <User size={24} color="#94a3b8" />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                            <h4 style={{ fontSize: '15px', fontWeight: (room.unreadCount || 0) > 0 ? 900 : 700, color: (room.unreadCount || 0) > 0 ? '#0f172a' : '#475569', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {room.candidate ? `${room.candidate.firstName} ${room.candidate.lastName}` : "Candidate"}
                                            </h4>
                                            {room.messages?.[0] && <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>{format(new Date(room.messages[0].createdAt), 'dd/MM/yyyy HH:mm')}</span>}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                {room.job ? (
                                                    <div style={{ fontSize: '11px', color: '#5C9AFF', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Briefcase size={12} /> {room.job.title}
                                                    </div>
                                                ) : (
                                                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <MessageSquare size={12} /> General Chat
                                                    </div>
                                                )}
                                                <p style={{ 
                                                    fontSize: '13px', 
                                                    color: (room.unreadCount || 0) > 0 ? '#1e293b' : '#64748b', 
                                                    fontWeight: (room.unreadCount || 0) > 0 ? 600 : 400,
                                                    margin: 0, 
                                                    whiteSpace: 'nowrap', 
                                                    overflow: 'hidden', 
                                                    textOverflow: 'ellipsis' 
                                                }}>
                                                    {room.messages?.[0]?.messageText || "Start a conversation..."}
                                                </p>
                                            </div>
                                            {(room.unreadCount || 0) > 0 && (
                                                <div style={{ 
                                                    backgroundColor: '#EF4444', color: 'white', fontSize: '10px', fontWeight: 800,
                                                    minWidth: '18px', height: '18px', borderRadius: '9px', display: 'flex', 
                                                    alignItems: 'center', justifyContent: 'center', padding: '0 5px', marginLeft: '8px'
                                                }}>
                                                    {room.unreadCount}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#fcfdfe' }}>
                {selectedRoom ? (
                    <>
                        <div style={{ padding: '16px 24px', backgroundColor: '#fff', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '44px', height: '44px', backgroundColor: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <User size={24} color="#5C9AFF" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{selectedRoom.candidate ? `${selectedRoom.candidate.firstName} ${selectedRoom.candidate.lastName}` : "Candidate"}</h3>
                                    <span style={{ fontSize: '12px', color: '#22c55e', fontWeight: 500 }}>• Online</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowCandidateSidebar(!showCandidateSidebar)}
                                style={{ padding: '8px 16px', backgroundColor: showCandidateSidebar ? '#F1F5F9' : '#5C9AFF', color: showCandidateSidebar ? '#475569' : 'white', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                            >
                                {showCandidateSidebar ? 'Hide Details' : 'Show Details'}
                            </button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {loading ? <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 size={32} className="animate-spin" color="#5C9AFF" /></div> : (
                                messages.map((msg, idx) => {
                                    const isMe = msg.senderId === user.id;
                                    const msgDate = format(new Date(msg.createdAt), 'dd/MM/yyyy', { locale: enUS });
                                    const prevMsg = messages[idx - 1];
                                    const prevMsgDate = prevMsg ? format(new Date(prevMsg.createdAt), 'dd/MM/yyyy', { locale: enUS }) : null;
                                    const showDateDivider = msgDate !== prevMsgDate;

                                    return (
                                        <React.Fragment key={msg.id}>
                                            {showDateDivider && (
                                                <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                                                    <span style={{ backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderRadius: '12px' }}>
                                                        {msgDate}
                                                    </span>
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: '4px' }}>
                                                <div style={{ 
                                                    maxWidth: '70%', padding: '10px 16px', borderRadius: '18px', fontSize: '14px',
                                                    backgroundColor: isMe ? '#5C9AFF' : '#fff', color: isMe ? '#fff' : '#1e293b',
                                                    border: isMe ? 'none' : '1px solid #f1f5f9',
                                                    borderBottomRightRadius: isMe ? '4px' : '18px', borderBottomLeftRadius: isMe ? '18px' : '4px',
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                                                }}>
                                                    <div style={{ wordBreak: 'break-word', lineHeight: '1.5' }}>{msg.messageText}</div>
                                                    <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.7, textAlign: isMe ? 'right' : 'left', fontWeight: 500 }}>
                                                        {format(new Date(msg.createdAt), 'HH:mm')}
                                                    </div>
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    );
                                })
                            )}
                            {isTyping && <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', marginLeft: '8px' }}>Candidate is typing...</div>}
                            <div ref={messagesEndRef} />
                        </div>

                        <div style={{ padding: '24px', backgroundColor: '#fff', borderTop: '1px solid #f1f5f9' }}>
                            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px' }}>
                                <input 
                                    type="text" 
                                    placeholder="Send a message to candidate..."
                                    value={inputText}
                                    onChange={(e) => {
                                        setInputText(e.target.value);
                                        chatService.sendTyping(selectedRoom.id, user.id, e.target.value.length > 0);
                                    }}
                                    style={{ flex: 1, padding: '14px 20px', backgroundColor: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '16px', outline: 'none' }}
                                />
                                <button type="submit" disabled={!inputText.trim()} style={{ padding: '14px 24px', backgroundColor: '#5C9AFF', color: 'white', border: 'none', borderRadius: '16px', cursor: 'pointer' }}>
                                    <Send size={22} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                        <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                        <p>Select a candidate conversation</p>
                    </div>
                )}
            </div>

            {/* Right Sidebar - Candidate Info */}
            <AnimatePresence>
                {selectedRoom && showCandidateSidebar && (
                    <motion.div 
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 340, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        style={{ borderLeft: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                    >
                        <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ width: '80px', height: '80px', backgroundColor: '#f1f5f9', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
                                <User size={40} color="#5C9AFF" />
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0', textAlign: 'center' }}>
                                {selectedRoom.candidate ? `${selectedRoom.candidate.firstName} ${selectedRoom.candidate.lastName}` : "Candidate"}
                            </h3>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Mail size={14} /> {selectedRoom.candidate?.email || 'N/A'}
                                </div>
                            </div>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                            <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Briefcase size={16} color="#5C9AFF" /> Application History
                            </h4>

                            {loadingApps ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}><Loader2 size={20} className="animate-spin" color="#5C9AFF" /></div>
                            ) : candidateApplications.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {candidateApplications.map((app) => (
                                        <Link key={app.id} href={`/employer/applications/${encodeURIComponent(app.id || '')}/insight`} style={{ textDecoration: 'none' }}>
                                            <div style={{ 
                                                padding: '16px', 
                                                backgroundColor: '#f8fafc', 
                                                borderRadius: '16px', 
                                                border: '1px solid #e2e8f0',
                                                transition: 'all 0.2s ease',
                                                cursor: 'pointer'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor = '#5C9AFF';
                                                e.currentTarget.style.backgroundColor = '#f0f9ff';
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor = '#e2e8f0';
                                                e.currentTarget.style.backgroundColor = '#f8fafc';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }}
                                            >
                                                <h5 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', margin: '0 0 8px 0' }}>{app.job?.title}</h5>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ 
                                                        fontSize: '11px', fontWeight: 800, padding: '4px 8px', borderRadius: '6px',
                                                        backgroundColor: app.status === 'REJECTED' ? '#FEF2F2' : '#F0FDF4',
                                                        color: app.status === 'REJECTED' ? '#EF4444' : '#16A34A'
                                                    }}>
                                                        {app.status}
                                                    </span>
                                                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                                                        {app.createdAt ? format(new Date(app.createdAt), 'dd/MM/yyyy', { locale: enUS }) : ''}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ padding: '32px 20px', textAlign: 'center', backgroundColor: '#FFF7ED', borderRadius: '20px', border: '1px dashed #FFD8A8' }}>
                                    <Clock size={32} color="#F59E0B" style={{ margin: '0 auto 12px', opacity: 0.6 }} />
                                    <p style={{ fontSize: '14px', color: '#9A3412', fontWeight: 700, margin: 0 }}>This candidate has not applied for any jobs yet</p>
                                    <p style={{ fontSize: '12px', color: '#C2410C', marginTop: '4px' }}>This conversation was created via direct interaction.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
