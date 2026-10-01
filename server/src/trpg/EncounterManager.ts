import { IEncounterEvent, IEncounterResult } from '../../../shared/types/encounter.types';
import { ICharacterState } from '../../../shared/types/character.types';
import { DiceEngine } from './DiceEngine';

export class EncounterManager {
    /**
     * 執行屬性檢定
     */
    static resolveCheck(
        player: ICharacterState, 
        event: IEncounterEvent
    ): IEncounterResult {
        // 獲取玩家對應屬性的加值 (簡單化：屬性值就是加值，或者屬性/2)
        const attrValue = (player as any)[event.checkAttribute] || 0;
        const modifier = Math.floor((attrValue - 10) / 2); // 標準 D&D 規則：(值-10)/2
        
        // 投骰
        const diceRoll = DiceEngine.roll(20, 1, modifier);
        const isSuccess = DiceEngine.check(diceRoll, event.difficultyClass);

        // 根據成功與否計算效果
        const payload = isSuccess ? event.successPayload : event.failPayload;

        return {
            isSuccess,
            dice: diceRoll,
            actualEffect: {
                hpChange: payload.hpChange || 0,
                expGain: payload.expGain || 0,
                itemsGained: payload.itemsGained || [],
                nextEventId: payload.nextEventId
            }
        };
    }

    /**
     * 生成一個隨機遭遇事件 (用於測試)
     */
    static generateRandomEvent(tier: number): IEncounterEvent {
        return {
            eventId: `evt_${Date.now()}`,
            tier,
            type: 'exploration',
            checkAttribute: 'intelligence',
            difficultyClass: 12,
            signature: 'MATRIX_SIGNED', // 未來實作真正簽章
            successPayload: {
                expGain: 50,
                hpChange: 0
            },
            failPayload: {
                expGain: 10,
                hpChange: -10
            }
        };
    }
}
