import { Socket } from 'socket.io-client';
import { SOCKET_EVENTS } from '@shared/constants/events';
import { ILLMRequest, ILLMResponse } from '@shared/types/llm.types';
import { ContextManager } from './ContextManager';

export class LLMService {
    private static socket: Socket;

    static init(socket: Socket) {
        this.socket = socket;
    }

    /**
     * 向後端發送 LLM 請求
     */
    static async chat(prompt: string, character?: any): Promise<string> {
        return new Promise((resolve) => {
            const contextSnapshot = ContextManager.getInstance().getSnapshot();
            
            // 如果有傳入角色資料，注入到狀態中
            if (character) {
                contextSnapshot.state.globalFlags.character = character;
            }

            const request: ILLMRequest = {
                sessionId: "default-session",
                prompt,
                contextSnapshot
            };

            // 記錄玩家對話至本地 Context
            ContextManager.getInstance().addHistory('user', prompt);

            // 透過 Socket 發送請求給後端 Proxy
            this.socket.emit(SOCKET_EVENTS.LLM_CHAT_REQUEST, request);

            // 監聽回應 (僅監聽一次)
            this.socket.once(SOCKET_EVENTS.LLM_CHAT_RESPONSE, (response: ILLMResponse) => {
                // 記錄 Weaver 回應至本地 Context
                ContextManager.getInstance().addHistory('assistant', response.text);
                resolve(response.text);
            });

            // 設定超時
            setTimeout(() => resolve("The Weaver is silent... (Timeout)"), 15000);
        });
    }
}
