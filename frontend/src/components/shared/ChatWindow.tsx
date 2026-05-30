"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare, Paperclip, Loader2, ExternalLink } from 'lucide-react';
import { chatService, Message, ChatRoom } from '@/services/chat.service';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface ChatWindowProps {
    applicationId?: string;
    jobId?: string;
    candidateId: string;
    companyId: string;
    currentUser: { id: string, name: string, role: string };
    onClose?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
    applicationId,
    jobId,
    candidateId,
    companyId,
    currentUser,
    onClose
}) => {
    const [room, setRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const initChat = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log("Initializing chat with:", { applicationId, jobId, candidateId, companyId });
                
                if (!companyId) {
                    throw new Error("Missing Company ID");
                }

                // 1. Find or create room - Only link to job if candidate has an application
                const chatRoom = await chatService.findOrCreateRoom(
                    applicationId || '', 
                    candidateId, 
                    companyId, 
                    jobId
                );
                console.log("Room initialized:", chatRoom);
                setRoom(chatRoom);

                // 2. Connect and join
                const token = localStorage.getItem('access_token') || '';
                chatService.connect(token);
                
                // 3. Setup Listeners (MUST be after connect)
                console.log("Setting up WebSocket listeners...");
                const handleNewMessage = (msg: Message) => {
                    console.log("WebSocket: Received newMessage", msg);
                    setMessages(prev => {
                        if (prev.some(m => m.id === msg.id)) return prev;
                        return [...prev, msg];
                    });
                    setTimeout(scrollToBottom, 100);
                };

                chatService.onNewMessage(handleNewMessage);

                chatService.onUserTyping((data) => {
                    if (data.userId !== currentUser.id) {
                        setIsTyping(data.isTyping);
                    }
                });

                chatService.joinRoom(chatRoom.id);

                // 4. Load history
                const history = await chatService.getMessages(chatRoom.id);
                setMessages(prev => {
                    const allMessages = [...history, ...prev];
                    const uniqueMessages = Array.from(new Map(allMessages.map(m => [m.id, m])).values());
                    return uniqueMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                });

                // 5. Mark as read
                await chatService.markAsRead(chatRoom.id);
                
                setLoading(false);
                setTimeout(scrollToBottom, 300);

                return handleNewMessage;
            } catch (err: any) {
                console.error("Failed to init chat:", err);
                setError(err.message || "Could not connect to chat server");
                setLoading(false);
                return null;
            }
        };

        let messageHandler: any = null;
        initChat().then(handler => {
            messageHandler = handler;
        });

        return () => {
            if (room) chatService.leaveRoom(room.id);
            if (messageHandler) chatService.offNewMessage(messageHandler);
            chatService.offUserTyping();
        };
    }, [applicationId, jobId, candidateId, companyId]);

    const handleSendMessage = async (e?: React.FormEvent | React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        console.log("handleSendMessage triggered. Input:", inputText, "Room:", room?.id);
        
        if (!inputText.trim() || !room) {
            console.warn("Cannot send message: Input is empty or Room is not loaded");
            return;
        }

        try {
            chatService.sendMessage({
                roomId: room.id,
                senderId: currentUser.id,
                messageText: inputText,
            });

            setInputText('');
            chatService.sendTyping(room.id, currentUser.id, false);
        } catch (err) {
            console.error("Failed to send message:", err);
            alert("Failed to send message. Please try again.");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (loading) {
        return (
            <div style={{ position: 'fixed', bottom: '24px', right: '24px', width: '384px', height: '500px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <Loader2 className="animate-spin" style={{ color: '#5C9AFF' }} size={32} />
                    <span style={{ fontSize: '13px', color: '#64748b' }}>Connecting to Chat...</span>
                </div>
            </div>
        );
    }

    return (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', width: '400px', height: '550px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 9999 }}>
            {/* Header */}
            <div style={{ backgroundColor: '#5C9AFF', padding: '16px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div 
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px',
                        cursor: (currentUser.role === 'CANDIDATE' && room?.companyId) ? 'pointer' : 'default',
                        transition: 'opacity 0.2s'
                    }}
                    onClick={() => {
                        if (currentUser.role === 'CANDIDATE' && room?.companyId) {
                            router.push(`/candidate/companies/${room.companyId}`);
                        }
                    }}
                    onMouseEnter={(e) => {
                        if (currentUser.role === 'CANDIDATE' && room?.companyId) {
                            e.currentTarget.style.opacity = '0.8';
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                    }}
                >
                    <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {room?.company?.logo ? (
                            <img src={room.company.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : room?.candidate?.firstName ? (
                            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{room.candidate.firstName[0]}</div>
                        ) : (
                            <MessageSquare size={20} />
                        )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <h4 style={{ margin: 0, fontWeight: 700, fontSize: '14px' }}>
                                {currentUser.role === 'CANDIDATE' 
                                    ? (room?.company?.name || 'Company') 
                                    : (`${room?.candidate?.firstName} ${room?.candidate?.lastName}`.trim() || 'Candidate')}
                            </h4>
                            {currentUser.role === 'CANDIDATE' && room?.companyId && (
                                <ExternalLink size={12} opacity={0.7} />
                            )}
                        </div>
                        <p style={{ margin: 0, fontSize: '10px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {room?.job?.title ? `Re: ${room.job.title}` : 'Trao đổi chung'}
                        </p>
                    </div>
                </div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '4px' }}>
                    <X size={20} />
                </button>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {error && (
                    <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '12px', fontSize: '12px', textAlign: 'center' }}>
                        {error}
                    </div>
                )}
                
                {messages.length === 0 && !error && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', gap: '8px' }}>
                        <MessageSquare size={48} opacity={0.2} />
                        <p style={{ fontSize: '13px' }}>Start a conversation...</p>
                    </div>
                )}

                {messages.map((msg, idx) => {
                    const msgDate = msg.createdAt ? format(new Date(msg.createdAt), 'dd/MM/yyyy') : 'Today';
                    const prevMsg = messages[idx - 1];
                    const prevMsgDate = prevMsg && prevMsg.createdAt ? format(new Date(prevMsg.createdAt), 'dd/MM/yyyy') : null;
                    const showDateDivider = msgDate !== prevMsgDate;

                    return (
                        <React.Fragment key={msg.id}>
                            {showDateDivider && (
                                <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0 8px' }}>
                                    <span style={{ backgroundColor: '#e2e8f0', color: '#64748b', fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '10px' }}>
                                        {msgDate}
                                    </span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: msg.senderId === currentUser.id ? 'flex-end' : 'flex-start', marginBottom: '4px' }}>
                                <div style={{ 
                                    maxWidth: '80%', padding: '10px 14px', borderRadius: '16px', fontSize: '14px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                    backgroundColor: msg.senderId === currentUser.id ? '#5C9AFF' : 'white',
                                    color: msg.senderId === currentUser.id ? 'white' : '#334155',
                                    border: msg.senderId === currentUser.id ? 'none' : '1px solid #f1f5f9',
                                    borderTopRightRadius: msg.senderId === currentUser.id ? '4px' : '16px',
                                    borderTopLeftRadius: msg.senderId === currentUser.id ? '16px' : '4px'
                                }}>
                                    <p style={{ margin: 0, wordBreak: 'break-word', lineHeight: 1.5 }}>{msg.messageText}</p>
                                    <p style={{ margin: '4px 0 0', fontSize: '10px', opacity: 0.6, textAlign: msg.senderId === currentUser.id ? 'right' : 'left', fontWeight: 500 }}>
                                        {msg.createdAt ? format(new Date(msg.createdAt), 'HH:mm') : 'Now'}
                                    </p>
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}
                {isTyping && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', gap: '4px' }}>
                            <div style={{ width: '6px', height: '6px', backgroundColor: '#cbd5e1', borderRadius: '50%' }}></div>
                            <div style={{ width: '6px', height: '6px', backgroundColor: '#cbd5e1', borderRadius: '50%' }}></div>
                            <div style={{ width: '6px', height: '6px', backgroundColor: '#cbd5e1', borderRadius: '50%' }}></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: '16px', backgroundColor: 'white', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button type="button" style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '8px' }}>
                    <Paperclip size={20} />
                </button>
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => {
                        setInputText(e.target.value);
                        if (room) chatService.sendTyping(room.id, currentUser.id, e.target.value.length > 0);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    style={{ flex: 1, backgroundColor: '#f1f5f9', border: 'none', borderRadius: '12px', padding: '10px 16px', fontSize: '14px', outline: 'none' }}
                />
                <button 
                    type="button"
                    onClick={(e) => handleSendMessage(e)}
                    disabled={!inputText.trim() || loading}
                    style={{ 
                        padding: '10px', backgroundColor: '#5C9AFF', color: 'white', border: 'none', borderRadius: '12px', 
                        cursor: (inputText.trim() && !loading) ? 'pointer' : 'not-allowed', opacity: (inputText.trim() && !loading) ? 1 : 0.5,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
                    }}
                >
                    <Send size={24} />
                </button>
            </div>
        </div>
    );
};
