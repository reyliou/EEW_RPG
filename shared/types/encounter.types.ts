/**
 * TRPG 遭遇事件與骰子結算定義
 */

/** 事件骨架 (由伺服器簽章，客戶端不可修改) */
export interface IEncounterEvent {
    eventId: string;
    tier: number;            // 難度等級
    type: 'combat' | 'social' | 'exploration' | 'rest';
    checkAttribute: string;  // 判定屬性 (如 'strength')
    difficultyClass: number; // DC 難度
    description?: string;
    
    // 伺服器簽章預留欄位
    signature: string;
    
    // 結算後的 Payload 範本
    successPayload: any;
    failPayload: any;
}

/** 骰子規格與結果 */
export interface IDiceRoll {
    sides: number;   // 面數 (如 20)
    count: number;   // 顆數
    modifier: number; // 固定加值
    rawResult: number[]; // 每顆骰子的結果
    total: number;
}

/** 遭遇結算結果 */
export interface IEncounterResult {
    isSuccess: boolean;
    dice: IDiceRoll;
    actualEffect: {
        hpChange: number;
        expGain: number;
        itemsGained: string[];
        nextEventId?: string;
    };
}
