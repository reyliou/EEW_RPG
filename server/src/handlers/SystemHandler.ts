import { Socket } from 'socket.io';
import { SOCKET_EVENTS } from '../../../shared/constants/events';

export const registerSystemHandlers = (socket: Socket) => {
    socket.on(SOCKET_EVENTS.JOIN_RUN, (data) => {
        socket.join(data.runId);
        socket.emit(SOCKET_EVENTS.RUN_UPDATE, { status: 'connected', timestamp: Date.now() });
    });

    socket.on('disconnect', () => {
        console.log(`[Matrix] User disconnected: ${socket.id}`);
    });
};
