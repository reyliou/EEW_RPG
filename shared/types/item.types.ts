/**
 * 遊戲物品型別定義
 */

export type ItemType = 'weapon' | 'armor' | 'usable' | 'material' | 'junk' | 'quest';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface IItemEffect {
    hp?: number;
    mp?: number;
    str?: number;
    dex?: number;
    int?: number;
    con?: number;
    cha?: number;
    wis?: number;
    def?: number;
    atk?: number;
}

export interface IItemDefinition {
    id: string;             // 物品唯一代號 (例如 "pot_hp_small")
    name: string;           // 物品名稱
    description: string;    // 物品描述
    type: ItemType;         // 物品種類
    rarity: ItemRarity;     // 稀有度
    icon: string;           // UI 呈現的圖示 (例如 bootstrap icon: "bi-droplet-fill")
    maxStack: number;       // 最大堆疊數量
    effect?: IItemEffect;   // 物品的效果 (裝備時的加成，或使用時的回復量)
    value: number;          // 販售價值 (金幣)
}
