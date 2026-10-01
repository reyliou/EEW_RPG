import React, { useState, useEffect } from 'react';
import { ICharacterState } from '@shared/types/character.types';

export interface ITRPGEventChoice {
    text: string;
    statRequired?: keyof ICharacterState;
    dc?: number; // Difficulty Class (1-20)
    onSuccess: () => { log: string; loot?: string[]; hpChange?: number };
    onFailure: () => { log: string; hpChange?: number };
}

export interface ITRPGEvent {
    id: string;
    title: string;
    description: string;
    choices: ITRPGEventChoice[];
}

interface ExpeditionEventModalProps {
    event: ITRPGEvent;
    character: ICharacterState;
    onComplete: (log: string, loot?: string[], hpChange?: number) => void;
}

export const ExpeditionEventModal: React.FC<ExpeditionEventModalProps> = ({ event, character, onComplete }) => {
    const [step, setStep] = useState<'intro' | 'rolling' | 'result'>('intro');
    const [selectedChoice, setSelectedChoice] = useState<ITRPGEventChoice | null>(null);
    const [diceValue, setDiceValue] = useState<number>(1);
    const [isRolling, setIsRolling] = useState(false);
    const [resultData, setResultData] = useState<{ log: string; loot?: string[]; hpChange?: number; success: boolean } | null>(null);

    const handleChoice = (choice: ITRPGEventChoice) => {
        setSelectedChoice(choice);
        if (choice.statRequired && choice.dc) {
            setStep('rolling');
            rollDice(choice);
        } else {
            // No dice roll required (automatic success or safe choice)
            const result = choice.onSuccess();
            setResultData({ ...result, success: true });
            setStep('result');
        }
    };

    const rollDice = (choice: ITRPGEventChoice) => {
        setIsRolling(true);
        // Simulate dice rolling animation
        let rolls = 0;
        const interval = setInterval(() => {
            setDiceValue(Math.floor(Math.random() * 20) + 1);
            rolls++;
            if (rolls > 15) {
                clearInterval(interval);
                setIsRolling(false);
                
                // Final calculation
                const finalRoll = Math.floor(Math.random() * 20) + 1;
                setDiceValue(finalRoll);
                
                const statValue = (character[choice.statRequired as keyof ICharacterState] as number) || 0;
                // In a D20 system: Roll + Stat modifier vs DC
                const modifier = Math.floor((statValue - 10) / 2); // Standard D&D modifier calculation
                const total = finalRoll + modifier;
                
                let isSuccess = false;
                if (finalRoll === 20) isSuccess = true; // Critical Success
                else if (finalRoll === 1) isSuccess = false; // Critical Failure
                else isSuccess = total >= (choice.dc || 10);
                
                const res = isSuccess ? choice.onSuccess() : choice.onFailure();
                
                setTimeout(() => {
                    setResultData({ ...res, success: isSuccess });
                    setStep('result');
                }, 1500); // Wait a bit to show the dice result before moving to result screen
            }
        }, 80);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-lg bg-[var(--background-color)] border border-[var(--border-color)] shadow-[0_0_30px_rgba(0,0,0,0.5)] rounded-xl overflow-hidden flex flex-col">
                
                {/* Header */}
                <div className="bg-[var(--surface-color)] p-4 border-b border-[var(--border-color)] flex items-center gap-3">
                    <i className="bi bi-exclamation-triangle-fill text-[var(--warning-color)] text-xl"></i>
                    <h2 className="font-bold tracking-widest text-[var(--text-color)]">突發事件：{event.title}</h2>
                </div>

                {/* Content */}
                <div className="p-6 flex-1">
                    {step === 'intro' && (
                        <div className="animate-fadeIn">
                            <p className="text-[var(--secondary-text-color)] leading-relaxed mb-8 text-sm md:text-base">
                                {event.description}
                            </p>
                            <div className="space-y-3">
                                {event.choices.map((choice, idx) => (
                                    <button 
                                        key={idx}
                                        className="w-full text-left p-4 rounded bg-[var(--surface-color)] border border-[var(--border-color)] hover:border-[var(--primary-color)] hover:bg-[rgba(79,195,247,0.05)] transition-all group flex justify-between items-center"
                                        onClick={() => handleChoice(choice)}
                                    >
                                        <span className="text-sm font-bold text-[var(--text-color)] group-hover:text-[var(--primary-color)]">
                                            {choice.text}
                                        </span>
                                        {choice.statRequired && (
                                            <span className="text-[10px] bg-black/50 px-2 py-1 rounded border border-[var(--border-color)] text-[var(--secondary-text-color)]">
                                                檢定：{getStatName(choice.statRequired)} (DC {choice.dc})
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 'rolling' && selectedChoice && (
                        <div className="flex flex-col items-center justify-center py-10 animate-fadeIn">
                            <h3 className="text-[var(--secondary-text-color)] mb-8 tracking-widest">
                                正在進行 <span className="text-[var(--primary-color)] font-bold">{getStatName(selectedChoice.statRequired as any)}</span> 檢定...
                            </h3>
                            
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                {/* Glowing background */}
                                <div className={`absolute inset-0 rounded-xl blur-xl transition-all duration-300 opacity-50 ${isRolling ? 'bg-[var(--primary-color)] animate-pulse' : diceValue >= (selectedChoice.dc || 10) ? 'bg-[var(--success-color)]' : 'bg-[var(--error-color)]'}`}></div>
                                
                                {/* Dice Body */}
                                <div className={`relative z-10 w-24 h-24 bg-[var(--surface-color)] border-2 flex items-center justify-center shadow-lg transform transition-transform duration-75 ${isRolling ? 'border-[var(--primary-color)] scale-110' : diceValue >= (selectedChoice.dc || 10) ? 'border-[var(--success-color)]' : 'border-[var(--error-color)]'} ${isRolling ? 'rotate-12' : 'rotate-0'}`} style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                                    <span className={`text-4xl font-bold font-mono ${isRolling ? 'text-[var(--primary-color)] blur-[1px]' : diceValue >= (selectedChoice.dc || 10) ? 'text-[var(--success-color)]' : 'text-[var(--error-color)]'}`}>
                                        {diceValue}
                                    </span>
                                </div>
                            </div>

                            {!isRolling && (
                                <div className="mt-8 text-center animate-fadeIn">
                                    <div className="text-sm text-[var(--secondary-text-color)] mb-1">
                                        基礎骰數 (D20): <span className="text-white">{diceValue}</span>
                                    </div>
                                    <div className="text-sm text-[var(--secondary-text-color)] mb-2">
                                        屬性加值: <span className="text-[var(--primary-color)]">+{Math.floor((((character[selectedChoice.statRequired as keyof ICharacterState] as number) || 0) - 10) / 2)}</span>
                                    </div>
                                    <div className="text-xl font-bold mt-2">
                                        總和：<span className="text-white mr-2">{diceValue + Math.floor((((character[selectedChoice.statRequired as keyof ICharacterState] as number) || 0) - 10) / 2)}</span> 
                                        vs 
                                        <span className="ml-2 text-[var(--warning-color)]">DC {selectedChoice.dc}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'result' && resultData && (
                        <div className="py-6 animate-fadeIn flex flex-col items-center text-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-6 ${resultData.success ? 'bg-[rgba(76,175,80,0.1)] text-[var(--success-color)]' : 'bg-[rgba(244,67,54,0.1)] text-[var(--error-color)]'}`}>
                                <i className={`bi ${resultData.success ? 'bi-check-lg' : 'bi-x-lg'}`}></i>
                            </div>
                            
                            <h3 className={`text-xl font-bold mb-4 tracking-widest ${resultData.success ? 'text-[var(--success-color)]' : 'text-[var(--error-color)]'}`}>
                                {resultData.success ? '檢定成功' : '檢定失敗'}
                            </h3>
                            
                            <p className="text-[var(--text-color)] leading-relaxed mb-6 text-sm">
                                {resultData.log}
                            </p>

                            <div className="flex gap-4 mb-8">
                                {resultData.loot && resultData.loot.length > 0 && (
                                    <div className="bg-[rgba(255,167,38,0.1)] border border-[var(--warning-color)] px-4 py-2 rounded text-[12px] text-[var(--warning-color)] flex items-center gap-2">
                                        <i className="bi bi-box-seam"></i> 獲得: {resultData.loot.join(', ')}
                                    </div>
                                )}
                                {resultData.hpChange !== undefined && (
                                    <div className={`px-4 py-2 rounded text-[12px] flex items-center gap-2 border ${resultData.hpChange < 0 ? 'bg-[rgba(244,67,54,0.1)] border-[var(--error-color)] text-[var(--error-color)]' : 'bg-[rgba(76,175,80,0.1)] border-[var(--success-color)] text-[var(--success-color)]'}`}>
                                        <i className="bi bi-heart-fill"></i> HP {resultData.hpChange > 0 ? '+' : ''}{resultData.hpChange}
                                    </div>
                                )}
                            </div>

                            <button 
                                className="rpg-btn w-full justify-center"
                                onClick={() => onComplete(resultData.log, resultData.loot, resultData.hpChange)}
                            >
                                繼續遠征
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

function getStatName(stat: keyof ICharacterState | undefined): string {
    switch(stat) {
        case 'strength': return '力量 (STR)';
        case 'dexterity': return '敏捷 (DEX)';
        case 'intelligence': return '智力 (INT)';
        case 'constitution': return '體質 (CON)';
        case 'charisma': return '魅力 (CHA)';
        case 'wisdom': return '感知 (WIS)';
        case 'luck': return '幸運 (LUK)';
        default: return '未知';
    }
}
