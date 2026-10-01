import { Socket } from 'socket.io';
import { SOCKET_EVENTS } from '../../../shared/constants/events';
import { ICharacterState } from '../../../shared/types/character.types';
import { CharacterService } from '../db/CharacterService';
import { LLMProxy } from '../llm/LLMProxy';
import { EncounterManager } from '../trpg/EncounterManager';

export const registerChatHandlers = (socket: Socket, mockPlayer: ICharacterState) => {
    socket.on(SOCKET_EVENTS.LLM_CHAT_REQUEST, async (request) => {
        console.log(`[Matrix] Streaming Request from ${socket.id}`);
        
        // 實現零信任原則：不信任前端傳來的全部數值，只信任其 ID
        const clientId = request.contextSnapshot.state.globalFlags.character?.id;
        
        let activePlayer: ICharacterState;

        if (clientId) {
            // 從資料庫撈取權威資料
            const dbChar = await CharacterService.getCharacter(clientId);
            if (dbChar) {
                activePlayer = dbChar;
            } else {
                activePlayer = mockPlayer;
                console.warn(`[Matrix] Character ${clientId} not found in DB. Using Mock.`);
            }
        } else {
            activePlayer = mockPlayer;
        }

        // 強制覆寫請求中的角色資料，確保後續 LLM 與檢定都使用最真實的資料
        request.contextSnapshot.state.globalFlags.character = activePlayer;

        let fullText = "";
        let functionCallResult: any = null;

        try {
            // 使用串流產生回應
            await LLMProxy.generateStreamingResponse(request, (chunk) => {
                if (chunk.text) {
                    fullText += chunk.text;
                    // 發送打字機碎片到前端
                    socket.emit('llm_chat_chunk', { text: chunk.text });
                }
                if (chunk.functionCall) {
                    functionCallResult = chunk.functionCall;
                }
            });

            // 串流結束後，處理 Function Call 邏輯
            if (functionCallResult) {
                const args = JSON.parse(functionCallResult.arguments);
                console.log(`[Matrix] AI Intent: ${functionCallResult.name}`, args);

                if (functionCallResult.name === 'request_dice_check') {
                    const playerState = activePlayer;
                    const event = EncounterManager.generateRandomEvent(1);
                    event.checkAttribute = args.attribute;
                    event.difficultyClass = args.dc;
                    event.description = args.reason;
                    
                    socket.emit(SOCKET_EVENTS.TRIGGER_ENCOUNTER, event);
                    const result = EncounterManager.resolveCheck(playerState, event);
                    
                    // 更新伺服器端的玩家狀態
                    playerState.experience += result.actualEffect.expGain;
                    playerState.currentHp += result.actualEffect.hpChange;
                    if (playerState.currentHp > playerState.maxHp) playerState.currentHp = playerState.maxHp;
                    
                    // 檢查升級 (簡單邏輯：每 100 經驗一級)
                    const newLevel = Math.floor(playerState.experience / 100) + 1;
                    let leveledUp = false;
                    if (newLevel > playerState.level) {
                        playerState.level = newLevel;
                        leveledUp = true;
                        console.log(`[Matrix] ${playerState.name} Leveled Up to ${newLevel}!`);
                    }

                    // 將更新後的狀態存回資料庫
                    if (playerState.id !== socket.id) {
                        await CharacterService.updateCharacterStats(playerState.id, {
                            experience: playerState.experience,
                            currentHp: playerState.currentHp,
                            level: playerState.level
                        });
                    }

                    socket.emit(SOCKET_EVENTS.ROLL_DICE, { roll: result.dice, isSuccess: result.isSuccess });
                    setTimeout(() => socket.emit(SOCKET_EVENTS.RESOLVE_ENCOUNTER, result), 3000);
                } else if (functionCallResult.name === 'update_lore_state') {
                    // 處理世界狀態更新
                    console.log(`[Matrix] Lore Updated: ${args.key} -> ${args.value}`);
                    // 未來這裡可以存入資料庫
                }
            }

            // 最後發送一個結束訊號
            let finalChatText = LLMProxy.cleanResponse(fullText);
            
            if (!finalChatText.trim() && functionCallResult) {
                const args = JSON.parse(functionCallResult.arguments);
                if (functionCallResult.name === 'request_dice_check') {
                    finalChatText = `你試圖「${args.reason}」，這需要一次 ${args.attribute.toUpperCase()} 檢定 (DC ${args.dc})...`;
                } else if (functionCallResult.name === 'update_lore_state') {
                    finalChatText = `世界似乎對你的行為產生了細微的共鳴... (${args.key}: ${args.value})`;
                }
            }

            socket.emit(SOCKET_EVENTS.LLM_CHAT_RESPONSE, {
                text: finalChatText,
                functionCall: functionCallResult,
                usage: { promptTokens: 0, completionTokens: 0 }
            });

        } catch (err) {
            console.error("[Matrix] Stream Error:", err);
            socket.emit(SOCKET_EVENTS.LLM_CHAT_RESPONSE, { text: "The threads of fate are tangled...", usage: { promptTokens: 0, completionTokens: 0 } });
        }
    });
};
