import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

import { LLMService } from '../core/services/LLMService';

// 建立一個單例 (Singleton)，確保全域只有一個 Socket 連線
let socketInstance: Socket | null = null;

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

export const getSocket = () => {
    if (!socketInstance) {
        socketInstance = io(SOCKET_URL);
        console.log('[Socket] Initializing global socket instance');
        
        // 初始化 LLMService 使用同一個 socket
        LLMService.init(socketInstance);
    }
    return socketInstance;
};

export const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(socketInstance);
    const [isConnected, setIsConnected] = useState(socketInstance?.connected || false);

    useEffect(() => {
        const s = getSocket();
        setSocket(s);

        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);

        s.on('connect', onConnect);
        s.on('disconnect', onDisconnect);

        // 如果已經連線了，手動設為 true
        if (s.connected) setIsConnected(true);

        return () => {
            // 注意：我們不在這裡斷開連線，因為其他組件還在用
            s.off('connect', onConnect);
            s.off('disconnect', onDisconnect);
        };
    }, []);

    return { socket, isConnected };
};
