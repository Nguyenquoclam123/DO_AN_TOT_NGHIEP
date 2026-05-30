import { io, Socket } from "socket.io-client";

class SocketService {
    private socket: Socket | null = null;
    private baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

    connect(userId: string) {
        if (this.socket?.connected) return;

        this.socket = io(`${this.baseUrl}/notifications`, {
            transports: ["websocket"]
        });

        this.socket.on("connect", () => {
            console.log("Connected to Notifications WebSocket");
            this.socket?.emit("joinUserRoom", { userId });
        });

        this.socket.on("disconnect", () => {
            console.log("Disconnected from Notifications WebSocket");
        });
        
        this.socket.on("connect_error", (error) => {
            console.error("Connection Error:", error);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    onApplicationUpdated(callback: (data: any) => void) {
        this.socket?.on("APPLICATION_UPDATED", callback);
    }

    offApplicationUpdated(callback?: (data: any) => void) {
        if (callback) {
            this.socket?.off("APPLICATION_UPDATED", callback);
        } else {
            this.socket?.off("APPLICATION_UPDATED");
        }
    }

    onNewNotification(callback: (notification: any) => void) {
        this.socket?.on("NEW_NOTIFICATION", callback);
    }

    offNewNotification(callback?: (notification: any) => void) {
        if (callback) {
            this.socket?.off("NEW_NOTIFICATION", callback);
        } else {
            this.socket?.off("NEW_NOTIFICATION");
        }
    }
    
    getSocket() {
        return this.socket;
    }
}

export const socketService = new SocketService();
