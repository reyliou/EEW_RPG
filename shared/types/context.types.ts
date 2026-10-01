/**
 * Context (命運線頭) 管理結構
 */

/** 靜態世界觀 (Lore) */
export interface IStaticLore {
    worldName: string;
    factions: string[];
    importantLocations: string[];
    baseRules: string;
}

/** 動態世界狀態 (World State) */
export interface IWorldState {
    currentLocation: string;
    activeNpcs: string[];
    bossStatus: { [id: string]: 'alive' | 'dead' };
    globalFlags: { [key: string]: any };
}

/** 滑動歷史記錄 (Sliding History) */
export interface ISlidingHistory {
    recentTurns: Array<{
        role: 'user' | 'assistant' | 'system';
        content: string;
    }>;
    summary?: string; // 對遠期歷史的摘要
}

/** 三層組合後的最終 Context 快照 */
export interface IContextSnapshot {
    lore: IStaticLore;
    state: IWorldState;
    history: ISlidingHistory;
}
