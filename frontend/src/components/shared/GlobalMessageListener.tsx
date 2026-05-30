import React, { useEffect, useState } from 'react';
import { chatService, Message } from '@/services/chat.service';
import { socketService } from '@/services/socket.service';
import { useAuthStore } from '@/store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';

type ToastData = {
    id: string;
    title: string;
    content: string;
    type: 'MESSAGE' | 'NOTIFICATION';
    metadata?: any;
};

export const GlobalMessageListener = () => {
    const { user } = useAuthStore();
    const [activeToast, setActiveToast] = useState<ToastData | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (!user) return;

        // 1. Chat Socket
        const token = localStorage.getItem('access_token') || '';
        chatService.connect(token);
        chatService.joinUserRoom(user.id, (user as any).companyId);

        const handleNewMessage = (msg: Message) => {
            if (msg.senderId !== user.id) {
                setActiveToast({
                    id: msg.id,
                    title: msg.sender ? `${msg.sender.firstName} ${msg.sender.lastName}` : "Tin nhắn mới",
                    content: msg.messageText,
                    type: 'MESSAGE',
                    metadata: { roomId: msg.roomId }
                });
                
                setTimeout(() => setActiveToast(null), 5000);
            }
        };

        chatService.onNewMessage(handleNewMessage);

        // 2. Notification Socket
        socketService.connect(user.id);
        const handleNewNotification = (notif: any) => {
            setActiveToast({
                id: notif.id,
                title: notif.title,
                content: notif.content,
                type: 'NOTIFICATION',
                metadata: notif.metadata
            });
            
            setTimeout(() => setActiveToast(null), 6000);
        };

        socketService.onNewNotification(handleNewNotification);

        return () => {
            chatService.offNewMessage(handleNewMessage);
            socketService.offNewNotification(handleNewNotification);
        };
    }, [user]);

    const handleToastClick = () => {
        if (!activeToast) return;
        
        if (activeToast.type === 'MESSAGE') {
            if (user?.role === 'CANDIDATE') {
                router.push('/candidate/applications');
            } else {
                router.push('/employer/messages');
            }
        } else {
            const jobId = activeToast.metadata?.jobId;
            const appId = activeToast.metadata?.applicationId;
            
            if (user?.role === 'CANDIDATE') {
                router.push('/candidate/applications');
            } else if (jobId) {
                router.push(`/employer/jobs/${jobId}?appId=${appId}`);
            }
        }
        setActiveToast(null);
    };

    return (
        <AnimatePresence>
            {activeToast && (
                <motion.div
                    initial={{ opacity: 0, y: 50, x: 50 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={handleToastClick}
                    style={{
                        position: 'fixed',
                        bottom: '24px',
                        right: '24px',
                        width: '320px',
                        backgroundColor: 'white',
                        borderRadius: '20px',
                        padding: '20px',
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                        border: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        zIndex: 10001,
                        display: 'flex',
                        gap: '16px',
                        alignItems: 'flex-start'
                    }}
                >
                    <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        backgroundColor: activeToast.type === 'MESSAGE' ? '#EFF6FF' : '#F0FDF4', 
                        borderRadius: '12px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        flexShrink: 0 
                    }}>
                        {activeToast.type === 'MESSAGE' ? (
                            <MessageSquare size={20} color="#5C9AFF" />
                        ) : (
                            <Bell size={20} color="#22C55E" />
                        )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                                {activeToast.title}
                            </span>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setActiveToast(null); }}
                                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <p style={{ fontSize: '13px', color: '#64748b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {activeToast.content}
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
