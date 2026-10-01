import { Socket } from 'socket.io';
import { SOCKET_EVENTS } from '../../../shared/constants/events';
import { LLMProxy } from '../llm/LLMProxy';

export const registerTRPGHandlers = (socket: Socket) => {
    socket.on(SOCKET_EVENTS.TRPG_ACTION_REQUEST, async (request) => {
        console.log(`[Matrix] TRPG Action Request from ${socket.id}: ${request.action}`);
        
        try {
            const aiResponse = await LLMProxy.generateTRPGActionResponse(
                request.action,
                request.contextSnapshot
            );
            
            socket.emit(SOCKET_EVENTS.TRPG_ACTION_RESPONSE, aiResponse);
        } catch (error) {
            console.error('[Matrix] TRPG Action Error:', error);
            socket.emit(SOCKET_EVENTS.TRPG_ACTION_RESPONSE, {
                narration: "系統發生嚴重錯誤，無法解析你的動作。",
                actions: []
            });
        }
    });
};
