import { aiClient, DEFAULT_MODEL } from './AIClient';
import { ILLMRequest, ILLMResponse } from '../../../shared/types/llm.types';
import { ContextBuilder } from './ContextBuilder';
import { AIManager } from './AIManager';

const tools = [
    {
        functionDeclarations: [
            {
                name: "request_dice_check",
                description: "當玩家的行動需要進行挑戰、冒險或具有不確定性時，發起一次屬性檢定 (Dice Roll)。",
                parameters: {
                    type: "object",
                    properties: {
                        attribute: {
                            type: "string",
                            description: "判定所需的屬性 (strength, dexterity, intelligence, constitution, charisma, wisdom)",
                        },
                        dc: {
                            type: "number",
                            description: "難度等級 (DC)，5為非常簡單，15為普通，25為極難。",
                        },
                        reason: {
                            type: "string",
                            description: "為什麼需要進行這次判定 (例如：試圖推開沉重的石門)",
                        }
                    },
                    required: ["attribute", "dc", "reason"],
                },
            },
            {
                name: "update_lore_state",
                description: "更新世界狀態或記錄玩家的重要選擇。",
                parameters: {
                    type: "object",
                    properties: {
                        key: { type: "string", description: "狀態鍵值 (如 npc_mood)" },
                        value: { type: "string", description: "狀態內容" }
                    },
                    required: ["key", "value"],
                }
            }
        ],
    },
];

export class LLMProxy {
    private static init() {
        // Initialization is now handled by AIClient
    }

    static async generateStreamingResponse(
        request: ILLMRequest, 
        onChunk: (chunk: { text?: string, functionCall?: any }) => void
    ): Promise<void> {
        this.init();
        const prompt = ContextBuilder.buildPrompt(request.prompt, request.contextSnapshot);
        
        try {
            // 使用新版 SDK 的 chats API
            const chat = aiClient.chats.create({ 
                model: DEFAULT_MODEL, 
                config: { tools: tools as any }
            });
            const responseStream = await chat.sendMessageStream({ message: prompt });

            let isInsideGameOutput = false;
            let fullTextBuffer = "";

            for await (const chunk of responseStream) {
                const text = chunk.text;
                const calls = chunk.functionCalls;
                
                if (text) {
                    fullTextBuffer += text;
                    
                    if (text.includes('[GAME_OUTPUT]')) {
                        isInsideGameOutput = true;
                        const parts = text.split('[GAME_OUTPUT]');
                        if (parts[1]) onChunk({ text: parts[1].replace('[/GAME_OUTPUT]', '') });
                        continue;
                    }

                    if (text.includes('[/GAME_OUTPUT]')) {
                        isInsideGameOutput = false;
                        const parts = text.split('[/GAME_OUTPUT]');
                        if (parts[0]) onChunk({ text: parts[0] });
                        continue;
                    }

                    if (isInsideGameOutput) {
                        onChunk({ text });
                    }
                }
                
                if (calls && calls.length > 0) {
                    onChunk({ 
                        functionCall: {
                            name: calls[0].name,
                            arguments: JSON.stringify(calls[0].args)
                        }
                    });
                }
            }
        } catch (error) {
            console.error("[Matrix] Stream Error (New SDK):", error);
        }
    }

    static cleanResponse(text: string): string {
        const match = text.match(/\[GAME_OUTPUT\]([\s\S]*?)\[\/GAME_OUTPUT\]/);
        if (match && match[1]) {
            return match[1].trim();
        }
        const lines = text.split('\n').filter(l => /[\u4e00-\u9fa5]/.test(l));
        return lines.length > 0 ? lines[lines.length - 1].trim() : text.trim();
    }

    static async generateResponse(request: ILLMRequest): Promise<ILLMResponse> {
        let fullText = "";
        let functionCall;
        await this.generateStreamingResponse(request, (chunk) => {
            if (chunk.text) fullText += chunk.text;
            if (chunk.functionCall) functionCall = chunk.functionCall;
        });
        return { text: fullText, functionCall, usage: { promptTokens: 0, completionTokens: 0 } };
    }

    static async generateTRPGActionResponse(playerAction: string, contextSnapshot: any): Promise<any> {
        this.init();
        const prompt = ContextBuilder.buildTRPGPrompt(playerAction, contextSnapshot);

        try {
            // 使用 AIManager 進行安全調用 (含排隊與重試)
            const responseText = await AIManager.generateContentSafe(DEFAULT_MODEL, prompt);
            
            
            // 自訂文字格式解析器
            const narrationMatch = responseText.match(/\[NARRATION\]\n([\s\S]*?)(?=\n\[ACTION)/i);
            const narration = narrationMatch ? narrationMatch[1].trim() : "（系統似乎無法讀取這個世界的低語...）";

            const actions = [];
            for (let i = 1; i <= 3; i++) {
                const actionBlockRegex = new RegExp(`\\[ACTION ${i}\\]\\n([\\s\\S]*?)(?=\\n\\[ACTION|\\n\\[RULES\\]|$)`, 'i');
                const actionMatch = responseText.match(actionBlockRegex);
                
                if (actionMatch) {
                    const block = actionMatch[1];
                    const label = block.match(/Label:\s*(.*)/i)?.[1]?.trim() || "繼續探索";
                    const icon = block.match(/Icon:\s*(.*)/i)?.[1]?.trim() || "bi-question-circle";
                    const type = block.match(/Type:\s*(.*)/i)?.[1]?.trim() || "narrative";
                    const color = block.match(/Color:\s*(.*)/i)?.[1]?.trim() || "var(--text-color)";

                    actions.push({ id: `act_${i}`, label, icon, type, color });
                }
            }

            if (actions.length === 0) {
                throw new Error("Failed to parse actions from response");
            }

            return { narration, actions };
        } catch (error) {
            console.error("[Matrix] TRPG AI Generation Failed (New SDK):", error);
            return {
                narration: "迷霧漸濃，系統似乎短暫失去了與主機的連接...",
                actions: [
                    { id: "fallback_1", label: "重新確認方向", icon: "bi-compass", type: "narrative", color: "var(--text-color)" },
                    { id: "fallback_2", label: "原地警戒", icon: "bi-shield", type: "narrative", color: "var(--warning-color)" }
                ]
            };
        }
    }
}
