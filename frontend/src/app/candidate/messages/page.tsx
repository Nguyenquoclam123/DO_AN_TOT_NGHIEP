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
    ExternalLink
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { chatService, ChatRoom, Message } from '@/services/chat.service';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

export default function CandidateMessagesPage() {
    const { user } = useAuthStore();
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [roomsLoading, setRoomsLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

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
            console.log("CandidateMessagesPage: Received global newMessage", msg);
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
                    // Refresh if room not in list
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
    }, [user, selectedRoom?.id]);

    // 3. Room-specific Setup
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
            } catch (error) {
                console.error("Failed to setup room:", error);
                setLoading(false);
            }
        };

        setupRoom();

        return () => {
            if (selectedRoom) chatService.leaveRoom(selectedRoom.id);
        };
    }, [selectedRoom?.id, user]);

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
        }
    };

    const filteredRooms = rooms.filter(room => 
        room.company?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
            {/* Left Sidebar: Room List */}
            <div style={{ 
                width: '380px', 
                borderRight: '1px solid #f1f5f9', 
                display: 'flex', 
                flexDirection: 'column',
                backgroundColor: '#fff'
            }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '20px' }}>Messages</h2>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input 
                            type="text" 
                            placeholder="Search conversations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ 
                                width: '100%', 
                                padding: '12px 16px 12px 44px', 
                                backgroundColor: '#f8fafc', 
                                border: '1px solid #e2e8f0', 
                                borderRadius: '14px', 
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                        />
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                    {roomsLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                            <Loader2 size={24} className="animate-spin" color="#5C9AFF" />
                        </div>
                    ) : filteredRooms.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                            <SearchX size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                            <p style={{ fontSize: '14px' }}>No conversations found</p>
                        </div>
                    ) : (
                            filteredRooms.map(room => (
                                <div 
                                    key={room.id}
                                    onClick={async () => {
                                        setSelectedRoom(room);
                                        // Mark as read immediately
                                        await chatService.markAsRead(room.id);
                                        setRooms(prev => prev.map(r => 
                                            r.id === room.id ? { ...r, unreadCount: 0 } : r
                                        ));
                                    }}
                                    style={{ 
                                        padding: '16px', 
                                        borderRadius: '16px', 
                                        cursor: 'pointer',
                                        marginBottom: '8px',
                                        transition: 'all 0.2s',
                                        backgroundColor: selectedRoom?.id === room.id ? '#EFF6FF' : 'transparent',
                                        border: selectedRoom?.id === room.id ? '1px solid #DBEAFE' : '1px solid transparent',
                                        position: 'relative'
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: '14px' }}>
                                        <div style={{ 
                                            width: '48px', 
                                            height: '48px', 
                                            backgroundColor: '#fff', 
                                            borderRadius: '14px', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                                            border: '1px solid #f1f5f9',
                                            flexShrink: 0
                                        }}>
                                            {room.company?.logo ? (
                                                <img src={room.company.logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '12px' }} />
                                            ) : (
                                                <Building2 size={24} color="#5C9AFF" />
                                            )}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                                <h4 style={{ 
                                                    fontSize: '15px', 
                                                    fontWeight: (room.unreadCount || 0) > 0 ? 800 : 700, 
                                                    color: '#0f172a', 
                                                    margin: 0, 
                                                    whiteSpace: 'nowrap', 
                                                    overflow: 'hidden', 
                                                    textOverflow: 'ellipsis' 
                                                }}>
                                                    {room.company?.name || "Company"}
                                                </h4>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                                    {room.messages?.[0] && (
                                                        <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>
                                                            {format(new Date(room.messages[0].createdAt), 'HH:mm')}
                                                        </span>
                                                    )}
                                                    {(room.unreadCount || 0) > 0 && (
                                                        <span style={{ 
                                                            backgroundColor: '#EF4444', 
                                                            color: 'white', 
                                                            fontSize: '10px', 
                                                            fontWeight: 800, 
                                                            padding: '2px 6px', 
                                                            borderRadius: '8px',
                                                            minWidth: '18px',
                                                            textAlign: 'center'
                                                        }}>
                                                            {room.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                                                {room.job ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#5C9AFF', fontWeight: 700 }}>
                                                        <Briefcase size={12} /> {room.job.title}
                                                    </div>
                                                ) : (
                                                    <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                                                        General Inquiry
                                                    </div>
                                                )}
                                            </div>
                                            <p style={{ 
                                                fontSize: '13px', 
                                                color: (room.unreadCount && room.unreadCount > 0) ? '#1e293b' : '#64748b', 
                                                margin: 0, 
                                                whiteSpace: 'nowrap', 
                                                overflow: 'hidden', 
                                                textOverflow: 'ellipsis',
                                                fontWeight: (room.unreadCount && room.unreadCount > 0) ? 600 : 400
                                            }}>
                                                {room.messages?.[0]?.messageText || "Start a conversation..."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                    )}
                </div>
            </div>

            {/* Right Side: Active Conversation */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#fcfdfe' }}>
                {selectedRoom ? (
                    <>
                                       <div style={{ padding: '16px 24px', backgroundColor: '#fff', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div 
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '16px',
                                    cursor: 'pointer',
                                    transition: 'opacity 0.2s'
                                }}
                                onClick={() => {
                                    if (selectedRoom.companyId) {
                                        router.push(`/candidate/companies/${selectedRoom.companyId}`);
                                    }
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                            >
                                <div style={{ width: '44px', height: '44px', backgroundColor: '#EFF6FF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                    {selectedRoom.company?.logo ? (
                                        <img src={selectedRoom.company.logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <Building2 size={24} color="#5C9AFF" />
                                    )}
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{selectedRoom.company?.name}</h3>
                                        <ExternalLink size={14} color="#94a3b8" />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '8px', height: '8px', backgroundColor: '#22c55e', borderRadius: '50%' }}></div>
                                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Active now</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button style={{ padding: '10px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><Search size={20} /></button>
                                <button style={{ padding: '10px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><MoreVertical size={20} /></button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {loading ? (
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Loader2 size={32} className="animate-spin" color="#5C9AFF" />
                                </div>
                            ) : (
                                <>
                                    {messages.map((msg, index) => {
                                        const isMe = msg.senderId === user.id;
                                        const showDate = index === 0 || format(new Date(messages[index-1].createdAt), 'yyyy-MM-dd') !== format(new Date(msg.createdAt), 'yyyy-MM-dd');

                                        return (
                                            <React.Fragment key={msg.id}>
                                                {showDate && (
                                                    <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                                                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', backgroundColor: '#f1f5f9', padding: '4px 12px', borderRadius: '100px', textTransform: 'uppercase' }}>
                                                            {format(new Date(msg.createdAt), 'EEEE, d MMMM', { locale: enUS })}
                                                        </span>
                                                    </div>
                                                )}
                                                <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                                                    <div style={{ 
                                                        maxWidth: '70%', 
                                                        padding: '12px 16px', 
                                                        borderRadius: '20px', 
                                                        fontSize: '14px', 
                                                        lineHeight: 1.6,
                                                        backgroundColor: isMe ? '#5C9AFF' : '#fff',
                                                        color: isMe ? '#fff' : '#1e293b',
                                                        boxShadow: isMe ? '0 4px 12px rgba(92, 154, 255, 0.2)' : '0 2px 4px rgba(0,0,0,0.02)',
                                                        border: isMe ? 'none' : '1px solid #f1f5f9',
                                                        borderBottomRightRadius: isMe ? '4px' : '20px',
                                                        borderBottomLeftRadius: isMe ? '20px' : '4px'
                                                    }}>
                                                        <div>{msg.messageText}</div>
                                                        <div style={{ 
                                                            fontSize: '10px', 
                                                            marginTop: '6px', 
                                                            opacity: 0.7, 
                                                            textAlign: isMe ? 'right' : 'left',
                                                            fontWeight: 600
                                                        }}>
                                                            {format(new Date(msg.createdAt), 'HH:mm')}
                                                        </div>
                                                    </div>
                                                </div>
                                            </React.Fragment>
                                        );
                                    })}
                                    {isTyping && (
                                        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                            <div style={{ backgroundColor: '#fff', padding: '12px 16px', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} style={{ width: '6px', height: '6px', backgroundColor: '#5C9AFF', borderRadius: '50%' }} />
                                                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} style={{ width: '6px', height: '6px', backgroundColor: '#5C9AFF', borderRadius: '50%' }} />
                                                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} style={{ width: '6px', height: '6px', backgroundColor: '#5C9AFF', borderRadius: '50%' }} />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        {/* Input Area */}
                        <div style={{ padding: '24px', backgroundColor: '#fff', borderTop: '1px solid #f1f5f9' }}>
                            <form onSubmit={handleSendMessage} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <button type="button" style={{ padding: '12px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><Paperclip size={22} /></button>
                                <input 
                                    type="text" 
                                    placeholder="Type a message..."
                                    value={inputText}
                                    onChange={(e) => {
                                        setInputText(e.target.value);
                                        chatService.sendTyping(selectedRoom.id, user.id, e.target.value.length > 0);
                                    }}
                                    style={{ 
                                        flex: 1, 
                                        padding: '14px 20px', 
                                        backgroundColor: '#f8fafc', 
                                        border: '1.5px solid #e2e8f0', 
                                        borderRadius: '16px', 
                                        fontSize: '14px',
                                        outline: 'none',
                                        transition: 'all 0.2s'
                                    }}
                                />
                                <button 
                                    type="submit"
                                    disabled={!inputText.trim()}
                                    style={{ 
                                        padding: '14px', 
                                        backgroundColor: '#5C9AFF', 
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '16px', 
                                        cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                                        opacity: inputText.trim() ? 1 : 0.6,
                                        boxShadow: inputText.trim() ? '0 8px 16px rgba(92, 154, 255, 0.25)' : 'none'
                                    }}
                                >
                                    <Send size={22} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', gap: '16px' }}>
                        <div style={{ width: '80px', height: '80px', backgroundColor: '#f8fafc', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MessageSquare size={40} style={{ opacity: 0.3 }} />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Select a conversation to start</h3>
                        <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>Connect with employers to discuss job opportunities.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
