import { Socket } from 'socket.io';
import { SOCKET_EVENTS } from '../../../shared/constants/events';
import { GeminiService } from '../services/GeminiService';

export const registerSortingHatHandlers = (socket: Socket) => {
    socket.on(SOCKET_EVENTS.SORTING_HAT_GET_QUIZ, async () => {
        try {
            console.log(`[Matrix] Generating Quiz for ${socket.id}...`);
            const quizData = await GeminiService.generateQuiz();
            socket.emit(SOCKET_EVENTS.SORTING_HAT_QUIZ_READY, { success: true, quizData });
        } catch (error: any) {
            console.error("[Matrix] Quiz Generation Error:", error);
            socket.emit(SOCKET_EVENTS.SORTING_HAT_QUIZ_READY, { success: false, error: error.message });
        }
    });

    socket.on(SOCKET_EVENTS.SORTING_HAT_REQUEST, async (data: { playerName: string; quizData: any; mcqAnswers: number[]; essayAnswer: string }) => {
        try {
            console.log(`[Matrix] Sorting Hat Request from ${socket.id} (Player: ${data.playerName})`);
            // 呼叫 AI 分類帽鑑定
            const result = await GeminiService.determineJob(data.quizData, data.mcqAnswers, data.essayAnswer);
            
            socket.emit(SOCKET_EVENTS.SORTING_HAT_RESPONSE, {
                success: true,
                job: result.job,
                commentary: result.commentary,
                playerName: data.playerName
            });
        } catch (error: any) {
            console.error("[Matrix] Sorting Hat Error:", error);
            socket.emit(SOCKET_EVENTS.SORTING_HAT_RESPONSE, {
                success: false,
                error: error.message
            });
        }
    });
};
