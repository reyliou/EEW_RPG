/**
 * 角色屬性與狀態定義
 */

/** 六維屬性與衍生數值 */
export interface ICharacterSheet {
    strength: number;     // 力量
    dexterity: number;    // 敏捷
    intelligence: number; // 智力
    constitution: number; // 體質
    charisma: number;     // 魅力
    wisdom: number;       // 感知
    
    maxHp: number;
    luck: number;
}

/** 動態角色狀態 (繼承屬性加上即時資料) */
export interface ICharacterState extends ICharacterSheet {
    id: string;
    name: string;
    job: string; // 職業
    currentHp: number;
    level: number;
    experience: number;
    statusEffects: string[]; // 狀態異常 ID 列表
    position?: { x: number; y: number };
}

/** 角色背包 (由伺服器驗證權威來源) */
export interface ICharacterInventory {
    ownerId: string;
    itemIds: string[]; // 道具唯一 ID 列表
}
