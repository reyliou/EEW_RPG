import { IItemDefinition } from '../types/item.types';

export const ITEM_DICTIONARY: Record<string, IItemDefinition> = {
    // === 消耗品 (Usable) ===
    "pot_hp_small": {
        id: "pot_hp_small",
        name: "微光恢復藥水",
        description: "散發著微光的紅色液體，能治癒輕微的創傷。(HP +50)",
        type: "usable",
        rarity: "common",
        icon: "bi-droplet-fill",
        maxStack: 99,
        effect: { hp: 50 },
        value: 10
    },
    "pot_mp_small": {
        id: "pot_mp_small",
        name: "清澈乙太",
        description: "提煉過的純淨魔力水，能恢復少許精神力。(MP +30)",
        type: "usable",
        rarity: "common",
        icon: "bi-stars",
        maxStack: 99,
        effect: { mp: 30 },
        value: 15
    },

    // === 武器 (Weapon) ===
    "wpn_sword_iron": {
        id: "wpn_sword_iron",
        name: "制式鐵劍",
        description: "藍石城衛兵常用的標準武器，保養得還算不錯。(ATK +10, STR +2)",
        type: "weapon",
        rarity: "common",
        icon: "bi-asterisk", // 可以用類似劍的 icon
        maxStack: 1,
        effect: { atk: 10, str: 2 },
        value: 50
    },
    "wpn_staff_wood": {
        id: "wpn_staff_wood",
        name: "學徒木杖",
        description: "頂端鑲著劣質水晶的橡木法杖，適合剛入門的施法者。(ATK +3, INT +5)",
        type: "weapon",
        rarity: "common",
        icon: "bi-magic",
        maxStack: 1,
        effect: { atk: 3, int: 5 },
        value: 45
    },
    "wpn_dagger_thief": {
        id: "wpn_dagger_thief",
        name: "盜賊短刃",
        description: "輕巧且鋒利的匕首，非常適合從陰影中發動奇襲。(ATK +7, DEX +4)",
        type: "weapon",
        rarity: "uncommon",
        icon: "bi-hammer", // 可以找更適合的短劍 icon
        maxStack: 1,
        effect: { atk: 7, dex: 4 },
        value: 75
    },

    // === 防具 (Armor) ===
    "arm_leather": {
        id: "arm_leather",
        name: "粗糙的皮甲",
        description: "用野豬皮簡單縫製的護甲，能提供基礎的防護。(DEF +5, DEX +1)",
        type: "armor",
        rarity: "common",
        icon: "bi-shield-fill",
        maxStack: 1,
        effect: { def: 5, dex: 1 },
        value: 40
    },
    "arm_plate_iron": {
        id: "arm_plate_iron",
        name: "厚重的鐵胸甲",
        description: "雖然沉重，但能在致命的打擊下保住你一命。(DEF +15, STR +2, DEX -1)",
        type: "armor",
        rarity: "uncommon",
        icon: "bi-shield-shaded",
        maxStack: 1,
        effect: { def: 15, str: 2, dex: -1 },
        value: 120
    },

    // === 材料 (Material) ===
    "mat_iron_ore": {
        id: "mat_iron_ore",
        name: "生鏽的鐵礦",
        description: "未經冶煉的原石，對鐵匠來說是不錯的素材。",
        type: "material",
        rarity: "common",
        icon: "bi-nut-fill",
        maxStack: 99,
        value: 5
    },
    "mat_magic_dust": {
        id: "mat_magic_dust",
        name: "微光塵埃",
        description: "擊敗魔法生物後殘留的粉末，是鍊金術的基礎材料。",
        type: "material",
        rarity: "uncommon",
        icon: "bi-gem",
        maxStack: 99,
        value: 12
    },

    // === 雜物 (Junk) ===
    "junk_slime_jelly": {
        id: "junk_slime_jelly",
        name: "史萊姆黏液",
        description: "摸起來黏答答的，除了一些奇怪的學者，沒有人會想買它。",
        type: "junk",
        rarity: "common",
        icon: "bi-droplet",
        maxStack: 99,
        value: 1
    },
    "junk_goblin_ear": {
        id: "junk_goblin_ear",
        name: "哥布林的耳朵",
        description: "公會用來計算討伐數量的證明，發出難聞的惡臭。",
        type: "junk",
        rarity: "common",
        icon: "bi-ear-fill", // (假設有這個 icon，沒有也可用預設)
        maxStack: 99,
        value: 2
    }
};

/** 透過 ID 取得物品完整定義 */
export const getItemDefinition = (id: string): IItemDefinition | undefined => {
    return ITEM_DICTIONARY[id];
};
