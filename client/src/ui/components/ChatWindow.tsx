import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { SOCKET_EVENTS } from '@shared/constants/events';
import { ContextManager } from '../../core/services/ContextManager';

interface Message {
    id: string;
    sender: 'player' | 'weaver';
    text: string;
    isStreaming?: boolean;
}

const ChatWindow: React.FC = () => {
    const { socket, isConnected } = useSocket();
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', sender: 'weaver', text: 'Welcome, Traveler. The Weaver is ready to guide your fate...' }
    ]);
    const [input, setInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // 自動捲動到底部
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (!socket) return;

        // 監聽串流碎片
        socket.on('llm_chat_chunk', (chunk: { text: string }) => {
            setIsGenerating(true);
            setMessages(prev => {
                const lastMsg = prev[prev.length - 1];
                if (lastMsg && lastMsg.sender === 'weaver' && lastMsg.isStreaming) {
                    return [
                        ...prev.slice(0, -1),
                        { ...lastMsg, text: lastMsg.text + chunk.text }
                    ];
                } else {
                    return [...prev, { id: Date.now().toString(), sender: 'weaver', text: chunk.text, isStreaming: true }];
                }
            });
        });

        // 監聽回應結束
        socket.on(SOCKET_EVENTS.LLM_CHAT_RESPONSE, (response: any) => {
            setIsGenerating(false);
            setMessages(prev => {
                const filtered = prev.filter(m => !m.isStreaming);
                // 僅在有文字時顯示，避免顯示空對話
                if (!response.text || response.text.trim() === "") return filtered;
                return [...filtered, { id: Date.now().toString(), sender: 'weaver', text: response.text }];
            });
            // 記錄至 Context
            if (response.text?.trim()) {
                ContextManager.getInstance().addHistory('assistant', response.text);
            }
        });

        return () => {
            socket.off('llm_chat_chunk');
            socket.off(SOCKET_EVENTS.LLM_CHAT_RESPONSE);
        };
    }, [socket]);

    const handleSend = () => {
        if (!input.trim() || !isConnected || isGenerating) return;

        setIsGenerating(true);
        const playerMsg: Message = { id: Date.now().toString(), sender: 'player', text: input };
        setMessages(prev => [...prev, playerMsg]);

        // 更新本地 Context 歷史
        ContextManager.getInstance().addHistory('user', input);

        socket?.emit(SOCKET_EVENTS.LLM_CHAT_REQUEST, {
            prompt: input,
            contextSnapshot: ContextManager.getInstance().getSnapshot()
        });

        setInput('');
    };

    const downloadLog = () => {
        const logContent = messages.map(msg => {
            const time = new Date().toLocaleTimeString();
            const sender = msg.sender === 'player' ? 'PLAYER' : 'WEAVER';
            return `[${time}] ${sender}: ${msg.text}`;
        }).join('\n\n');

        const blob = new Blob([logContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `EEW_RPG_Log_${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col h-full bg-base-200/80 backdrop-blur-md rounded-lg border border-primary/20 shadow-xl overflow-hidden">
            <div className="bg-primary/10 p-2 text-xs font-bold text-primary flex justify-between items-center px-4">
                <div className="flex items-center gap-4">
                    <span>WEAVER TERMINAL</span>
                    <button 
                        onClick={downloadLog}
                        className="hover:text-white transition-colors flex items-center gap-1 opacity-70 hover:opacity-100"
                        title="Download Adventure Log"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        LOG
                    </button>
                </div>
                <span className={isConnected ? "text-success" : "text-error"}>
                    {isConnected ? "● ONLINE" : "○ OFFLINE"}
                </span>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`chat ${msg.sender === 'player' ? 'chat-end' : 'chat-start'}`}>
                        <div className={`chat-bubble ${
                            msg.sender === 'player' 
                            ? 'chat-bubble-primary' 
                            : 'chat-bubble-secondary bg-opacity-90'
                        } text-sm whitespace-pre-wrap`}>
                            {msg.text}
                            {msg.isStreaming && <span className="inline-block w-1.5 h-4 bg-primary animate-pulse ml-1 align-middle" />}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-base-300/50 flex gap-2">
                <input
                    type="text"
                    className="input input-bordered input-primary flex-1 input-sm focus:outline-none"
                    placeholder={isGenerating ? "The Weaver is weaving..." : "Describe your action..."}
                    value={input}
                    disabled={isGenerating}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button 
                    className={`btn btn-primary btn-sm px-6 ${isGenerating ? 'loading' : ''}`} 
                    onClick={handleSend}
                    disabled={isGenerating || !input.trim()}
                >
                    {isGenerating ? "" : "SEND"}
                </button>
            </div>
        </div>
    );
};

export default ChatWindow;
