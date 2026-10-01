/**
 * 遠征系統 (Expedition System) 型別定義
 */

import { ICharacterState } from "./character.types";

export interface MapData {
    foundations: Record<string, string>; // q_r -> tileId
    overlays: Record<string, string>;   // q_r -> objectId (e.g., river, road)
    elevations: Record<string, number>; // q_r -> elevation (for debugging/LLM)
}

/** 遠征狀態階段 */
export type ExpeditionStatus = 'preparation' | 'active' | 'extracting' | 'wiped' | 'returned';

/** 隨從/夥伴 (Companion) 定義 */
export interface ICompanion extends ICharacterState {
    ownerId: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    job: string;
    isPermanent: boolean; // 是否為永久資產 (留在主城工作)
    currentAssignedTask?: string; // 目前指派的工作 (例如 'farming', 'guarding')
}

/** 撤離點 (Extraction Point) 定義 */
export interface IExtractionPoint {
    id: string;
    name: string;
    type: 'fixed' | 'temporary';
    retentionRate: number; // 資源保留比例 (0.0 ~ 1.0)
    position: { q: number; r: number }; // 軸向座標
}

/** 遠征實例 (Expedition Instance) */
export interface IExpedition {
    id: string;
    startTime: number;
    status: ExpeditionStatus;
    
    // 參與者
    leaderId: string;
    partyMembers: string[]; // 其他玩家 ID
    companions: ICompanion[]; // 隨行 NPC
    
    // 進度與資源
    currentMapId: string;
    currentPosition: { q: number; r: number }; // 軸向座標
    loot: string[]; // 本次遠征獲得的道具 ID
    
    // 地圖資料 (包含 foundations, overlays, elevations)
    tileMap: MapData;
    
    // 地圖事件分布 (q_r -> eventId)
    eventMap: Record<string, string>; 
    
    // 歷史紀錄 (用於 LLM Context)
    eventHistory: string[]; // 命運骨牌的簡要記錄
}

/** 遠征結算結果 */
export interface IExpeditionSummary {
    expeditionId: string;
    finalStatus: ExpeditionStatus;
    totalExpGained: number;
    itemsRetained: string[];
    lostCompanions: string[];
    duration: number;
}
