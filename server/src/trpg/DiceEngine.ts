import { IDiceRoll } from '../../../shared/types/encounter.types';

export class DiceEngine {
    /**
     * 投擲骰子
     * @param sides 面數 (預設 20)
     * @param count 顆數 (預設 1)
     * @param modifier 加值
     */
    static roll(sides: number = 20, count: number = 1, modifier: number = 0): IDiceRoll {
        const rawResult: number[] = [];
        let total = 0;

        for (let i = 0; i < count; i++) {
            const roll = Math.floor(Math.random() * sides) + 1;
            rawResult.push(roll);
            total += roll;
        }

        total += modifier;

        return {
            sides,
            count,
            modifier,
            rawResult,
            total
        };
    }

    /**
     * 判定是否成功 (DC 檢定)
     */
    static check(roll: IDiceRoll, dc: number): boolean {
        return roll.total >= dc;
    }
}
