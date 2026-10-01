import { aiClient } from './AIClient';

// 簡單的 Mutex 鎖，用來強制所有 AI 請求「排隊執行」
class Mutex {
    private mutex = Promise.resolve();
    lock(): Promise<() => void> {
        let begin: (unlock: () => void) => void = () => {};
        this.mutex = this.mutex.then(() => new Promise(begin));
        return new Promise(res => { begin = res; });
    }
}

const aiLock = new Mutex();

export class AIManager {
    /**
     * 安全地調用 AI 模型，包含：
     * 1. 並發鎖 (Mutex)：確保一次只有一個請求送到 Google，避免 500 並發崩潰
     * 2. 自動重試 (Auto Retry)：如果遇到 500 錯誤，自動等待並重試，最多重試 3 次
     */
    static async generateContentSafe(modelName: string, prompt: string, maxRetries = 3): Promise<string> {

        let retriesLeft = maxRetries;
        
        // 鎖定整個重試流程，確保同時間真的只有一個 AI 任務在跑
        const unlock = await aiLock.lock();
        
        try {
            while (retriesLeft > 0) {
                try {
                    // 等待 1 秒緩衝，降低 Google Rate Limit 觸發機率
                    await new Promise(r => setTimeout(r, 1000));
                    
                    const response = await aiClient.models.generateContent({
                        model: modelName,
                        contents: prompt,
                    });
                    
                    if (retriesLeft < maxRetries) {
                        console.log(`[AIManager] 🎉 第 ${maxRetries - retriesLeft + 1} 次嘗試成功！`);
                    }
                    return response.text || "";
                } catch (error: any) {
                    console.error(`[AIManager] AI 請求失敗 (${retriesLeft} retries left):`, error?.message || error);
                    
                    // 檢查是否為 500, 429 或 503 (High Demand)
                    const isRetryable = error?.status === 500 || error?.status === 429 || error?.status === 503 ||
                                        String(error).includes('500') || String(error).includes('429') || String(error).includes('503') ||
                                        (error?.message && (error.message.includes('INTERNAL') || error.message.includes('UNAVAILABLE') || error.message.includes('high demand')));

                    if (isRetryable) {
                        retriesLeft--;
                        if (retriesLeft === 0) {
                            throw new Error(`AI 伺服器連續 ${maxRetries} 次無回應，請稍後再試。`);
                        }
                        console.log(`[AIManager] 等待 3 秒後重試...`);
                        await new Promise(r => setTimeout(r, 3000)); // 增加等待時間到 3 秒
                    } else {
                        // 其他錯誤直接拋出
                        throw error;
                    }
                }
            }
        } finally {
            unlock();
        }
        throw new Error("AI 生成失敗");
    }
}
