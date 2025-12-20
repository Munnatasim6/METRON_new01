// ফাইল: Frontend/src/services/api/socketService.ts

class SocketService {
    private socket: WebSocket | null = null;
    private listeners: ((data: any) => void)[] = [];
    private reconnectAttempts = 0;
    private maxReconnectDelay = 30000; // সর্বোচ্চ ৩০ সেকেন্ড অপেক্ষা করবে

    connect(url = 'ws://localhost:8000/ws/feed') {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) return;

        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
            console.log('✅ Socket Connected');
            this.reconnectAttempts = 0; // কানেক্ট হলে কাউন্টার রিসেট
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.listeners.forEach(callback => callback(data));
        };

        this.socket.onclose = () => {
            console.log('❌ Socket Disconnected');
            this.retryConnection(url);
        };

        this.socket.onerror = (error) => {
            console.error('⚠️ Socket Error:', error);
            this.socket?.close();
        };
    }

    private retryConnection(url: string) {
        // রিকানেক্ট লজিক: ৩সে, ৬সে, ১২সে... এভাবে বাড়বে
        const delay = Math.min(3000 * Math.pow(2, this.reconnectAttempts), this.maxReconnectDelay);

        console.log(`🔄 Reconnecting in ${delay / 1000}s...`);

        setTimeout(() => {
            this.reconnectAttempts++;
            this.connect(url);
        }, delay);
    }

    subscribe(callback: (data: any) => void) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }

    send(data: any) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        } else {
            console.warn("Socket not open. Creating queue logic or retrying could be added here.");
        }
    }
}

export const socketService = new SocketService();
