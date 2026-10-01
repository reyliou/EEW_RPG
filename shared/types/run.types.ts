/**
 * 單局 Run Session 定義
 */

export type IRunPhase = 'lobby' | 'dungeon' | 'completed' | 'wiped';

export interface IRunSession {
    runId: string;
    seed: string;        // 用於亂數生成的一致性
    startTime: number;
    phase: IRunPhase;
    playerIds: string[];
    currentFloor: number;
}
