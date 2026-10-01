/**
 * 遊戲數值常數與 TRPG 設定
 */
export const GAME_CONFIG = {
    // 屬性清單
    ATTRIBUTES: ['strength', 'dexterity', 'intelligence', 'constitution', 'charisma', 'wisdom'] as const,
    
    // 骰子設定
    DEFAULT_DICE_SIDES: 20,
    
    // 難度等級 (DC) 參考
    DC: {
        VERY_EASY: 5,
        EASY: 10,
        MEDIUM: 15,
        HARD: 20,
        VERY_HARD: 25,
        IMPOSSIBLE: 30
    },

    // 初始屬性值
    INITIAL_STATS: {
        hp: 100,
        level: 1,
        attributePoints: 10
    }
} as const;
