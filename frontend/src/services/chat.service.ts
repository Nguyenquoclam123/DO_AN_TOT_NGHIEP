import { apiRequest } from "@/lib/api";
import { io, Socket } from "socket.io-client";

export interface Message {
    id: string;
    roomId: string;
    senderId: string;
    messageText: string;
    attachmentUrl?: string;
    createdAt: string;
    sender?: {
        id: string;
        firstName: string;
        lastName: string;
        role: string;
    };
}

export interface ChatRoom {
    id: string;
    applicationId: string;
    jobId: string;
    candidateId: string;
    companyId: string;
    status: string;
    unreadCount?: number;
    messages?: Message[];
    job?: {
        id: string;
        title: string;
    };
    company?: {
        id: string;
        name: string;
        logo?: string;
    };
    candidate?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
}

class ChatService {
    private socket: Socket | null = null;
    private baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    private unreadListeners: (() => void)[] = [];
    private roomReadListeners: ((roomId: string) => void)[] = [];

    onUnreadCountChange(callback: () => void) {
        this.unreadListeners.push(callback);
    }

    onRoomRead(callback: (roomId: string) => void) {
        this.roomReadListeners.push(callback);
    }

    private notifyUnreadChange() {
        this.unreadListeners.forEach(cb => cb());
    }

    private notifyRoomRead(roomId: string) {
        this.roomReadListeners.forEach(cb => cb(roomId));
    }

    connect(token: string) {
        if (this.socket?.connected) {
            console.log("Chat WebSocket already connected");
            return;
        }

        console.log("Connecting to Chat WebSocket...");
        this.socket = io(`${this.baseUrl}/chat`, {
            auth: { token },
            transports: ["websocket"]
        });

        this.socket.on("connect", () => {
            console.log("Connected to Chat WebSocket. Socket ID:", this.socket?.id);
        });

        this.socket.on("connect_error", (err) => {
            console.error("Chat WebSocket connection error:", err);
        });

        this.socket.on("disconnect", (reason) => {
            console.log("Disconnected from Chat WebSocket. Reason:", reason);
        });

        // Add a permanent listener for unread notifications
        this.socket.on("newMessage", (msg) => {
            this.notifyUnreadChange();
        });
    }

    disconnect() {
        if (this.socket) {
            console.log("Disconnecting from Chat WebSocket...");
            this.socket.disconnect();
            this.socket = null;
        }
    }

    joinRoom(roomId: string) {
        if (!this.socket) {
            console.warn("Cannot join room: Socket not initialized");
            return;
        }
        console.log(`Emitting joinRoom for: ${roomId}`);
        this.socket.emit("joinRoom", { roomId });
    }

    joinUserRoom(userId: string, companyId?: string) {
        if (!this.socket) {
            console.warn("Cannot join user room: Socket not initialized");
            return;
        }
        console.log(`Emitting joinUserRoom for: ${userId}, ${companyId}`);
        this.socket.emit("joinUserRoom", { userId, companyId });
    }

    leaveRoom(roomId: string) {
        console.log(`Emitting leaveRoom for: ${roomId}`);
        this.socket?.emit("leaveRoom", { roomId });
    }

    sendMessage(data: { roomId: string, senderId: string, messageText: string, attachmentUrl?: string }) {
        if (!this.socket?.connected) {
            console.warn("Sending message while socket is not connected. Message might be delayed.");
        }
        this.socket?.emit("sendMessage", data);
    }

    onNewMessage(callback: (message: Message) => void) {
        this.socket?.on("newMessage", callback);
    }

    offNewMessage(callback?: (message: Message) => void) {
        if (callback) {
            this.socket?.off("newMessage", callback);
        } else {
            this.socket?.off("newMessage");
        }
    }

    onUserTyping(callback: (data: { userId: string, isTyping: boolean }) => void) {
        this.socket?.on("userTyping", callback);
    }

    offUserTyping() {
        this.socket?.off("userTyping");
    }

    sendTyping(roomId: string, userId: string, isTyping: boolean) {
        this.socket?.emit("typing", { roomId, userId, isTyping });
    }

    // REST API calls
    async findOrCreateRoom(applicationId: string, candidateId: string, companyId: string, jobId?: string) {
        const body: any = { candidateId, companyId };
        if (applicationId && applicationId.trim() !== '') body.applicationId = applicationId;
        if (jobId && jobId.trim() !== '') body.jobId = jobId;

        return apiRequest<ChatRoom>("/chat/rooms", "POST", {
            body
        });
    }

    async getMyRooms() {
        return apiRequest<ChatRoom[]>("/chat/my-rooms", "GET");
    }

    async getMessages(roomId: string) {
        return apiRequest<Message[]>(`/chat/rooms/${roomId}/messages`, "GET");
    }

    async getUnreadCount() {
        return apiRequest<{ count: number }>("/chat/unread-count", "GET");
    }

    async markAsRead(roomId: string) {
        const res = await apiRequest<{ success: boolean }>(`/chat/rooms/${roomId}/read`, "POST");
        this.notifyUnreadChange();
        this.notifyRoomRead(roomId);
        return res;
    }
}

export const chatService = new ChatService();
