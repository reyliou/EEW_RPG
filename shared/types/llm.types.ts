/**
 * LLM 互動資料結構
 */

/** 發送給後端 Proxy 的請求 */
export interface ILLMRequest {
    sessionId: string;
    prompt: string;
    contextSnapshot: any; // IContextSnapshot
    maxTokens?: number;
}

/** LLM 意圖識別的結構化輸出 (Function Calling) */
export interface IFunctionCall {
    name: string;        // 意圖名稱 (如 'use_item', 'attack')
    arguments: string;   // JSON 字串格式的參數
}

/** LLM 回傳格式 */
export interface ILLMResponse {
    text: string;               // LLM 生成的文本劇情
    functionCall?: IFunctionCall; // 可選的結構化指令
    usage: {
        promptTokens: number;
        completionTokens: number;
    };
}
