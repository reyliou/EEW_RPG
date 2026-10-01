import React, { useState } from 'react';
import { PageContainer } from '../common/PageContainer';
import { ICharacterState } from '@shared/types/character.types';
import DiceOverlay from '../components/DiceOverlay';
import { IDiceRoll } from '@shared/types/encounter.types';
import { ActionCard } from '../common/ActionCard';

interface CombatTestPageProps {
    character: ICharacterState;
    onBack: () => void;
}

export const CombatTestPage: React.FC<CombatTestPageProps> = ({ character, onBack }) => {
    const [monsterHp, setMonsterHp] = useState(100);
    const [rollResult, setRollResult] = useState<IDiceRoll | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [rollDescription, setRollDescription] = useState("");

    const monsterMaxHp = 100;

    const handleAttack = (skillName: string, baseDamage: number) => {
        // 模擬 TRPG 擲骰 (1~20)
        const d20 = Math.floor(Math.random() * 20) + 1;
        const total = d20 + character.strength;
        const success = total >= 12; // 假設防禦等級 DC 為 12

        setRollResult({
            sides: 20,
            count: 1,
            rawResult: [d20],
            modifier: character.strength,
            total: total
        });
        setIsSuccess(success);
        setRollDescription(`使用 ${skillName} 攻擊 (DC 12)`);

        if (success) {
            let finalDamage = baseDamage + (d20 >= 18 ? baseDamage : 0); // 爆擊
            setTimeout(() => {
                setMonsterHp(prev => Math.max(0, prev - finalDamage));
            }, 3000); // 骰子動畫結束後扣血
        }
    };

    return (
        <div className="flex-1 flex flex-col relative bg-[var(--surface-color)] h-full">
            <button className="absolute top-4 left-4 rpg-btn px-4 py-2 z-10 text-xs shadow-[0_0_10px_rgba(0,0,0,0.5)] bg-[var(--background-color)]" onClick={onBack}>
                <i className="bi bi-arrow-left mr-2"></i>撤退
            </button>

            {/* 上半部：怪物與戰鬥展示區 (Monster Display) */}
            <div className="flex-1 flex flex-col items-center justify-center border-b border-[var(--border-color)] bg-[url('/assets/images/bg_dungeon.jpg')] bg-cover bg-center relative overflow-hidden min-h-[50%]">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--surface-color)] pointer-events-none"></div>
                
                {/* 怪物 Sprite / Placeholder */}
                <div className="z-10 flex flex-col items-center animate-bounce-slow mt-8">
                    <i className="bi bi-bug-fill text-[6rem] md:text-[8rem] text-[var(--error-color)] drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]"></i>
                    
                    <div className="mt-4 text-center bg-[rgba(0,0,0,0.5)] p-2 rounded-lg backdrop-blur-sm">
                        <h2 className="text-xl md:text-2xl font-bold text-[var(--error-color)] tracking-widest uppercase">虛空掠奪者</h2>
                        <div className="w-48 md:w-64 h-3 bg-[var(--background-color)] border border-[var(--border-color)] mt-2 relative overflow-hidden shadow-[0_0_10px_rgba(239,68,68,0.3)] mx-auto">
                            <div 
                                className="h-full bg-[var(--error-color)] transition-all duration-500 ease-out"
                                style={{ width: `${(monsterHp / monsterMaxHp) * 100}%` }}
                            ></div>
                        </div>
                        <span className="text-xs font-mono font-bold mt-1 block text-[var(--secondary-text-color)]">{monsterHp} / {monsterMaxHp} HP</span>
                    </div>
                </div>

                {/* 玩家狀態展示 (小) */}
                <div className="absolute bottom-4 left-4 z-10 flex items-center gap-3 bg-[rgba(0,0,0,0.5)] p-2 rounded-lg backdrop-blur-sm">
                    <div className="w-10 h-10 rounded-full border-2 border-[var(--primary-color)] bg-[var(--background-color)] flex items-center justify-center text-lg text-[var(--primary-color)]">
                        <i className="bi bi-person-fill"></i>
                    </div>
                    <div>
                        <div className="font-bold text-xs tracking-widest text-[var(--text-color)]">{character.name}</div>
                        <div className="text-[10px] text-[var(--success-color)] font-mono">HP: {character.currentHp}/{character.maxHp}</div>
                    </div>
                </div>
            </div>

            {/* 下半部：技能選擇區 (Skill Selection - Roguelike Style) */}
            <div className="bg-[var(--background-color)] p-4 md:p-6 flex flex-col relative z-20 shrink-0 border-t border-[var(--border-color)] shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
                <h3 className="text-xs font-bold text-[var(--secondary-text-color)] mb-3 tracking-widest uppercase flex items-center gap-2">
                    <i className="bi bi-lightning-charge-fill text-[var(--warning-color)]"></i> 戰鬥行動 (TRPG + Roguelike)
                </h3>
                
                <div className="flex flex-col gap-3 overflow-y-auto max-h-[40vh] custom-scrollbar">
                    <ActionCard
                        layout="vertical"
                        title="普通攻擊"
                        description="揮舞你的武器進行一次基礎攻擊。"
                        badge="ATK"
                        colorTheme="primary"
                        footer={<><i className="bi bi-dice-5"></i> 力量檢定 (STR)</>}
                        onClick={() => handleAttack('普通攻擊', 15)}
                    />

                    <ActionCard
                        layout="vertical"
                        title="猛力一擊"
                        description="犧牲命中率以換取巨大的破壞力，有機會造成暴擊。"
                        badge="SKILL"
                        colorTheme="error"
                        footer={<><i className="bi bi-dice-5"></i> 力量檢定 (STR) | 劣勢</>}
                        onClick={() => handleAttack('猛力一擊', 30)}
                    />

                    <ActionCard
                        layout="vertical"
                        title="奧術飛彈"
                        description="發射必中的魔法飛彈，無視敵人的物理護甲。"
                        badge="MAGIC"
                        colorTheme="magic"
                        footer={<><i className="bi bi-dice-5"></i> 智力檢定 (INT)</>}
                        onClick={() => handleAttack('奧術飛彈', 20)}
                    />
                </div>
            </div>

            {rollResult && (
                <DiceOverlay 
                    rollResult={rollResult} 
                    isSuccess={isSuccess} 
                    description={rollDescription}
                    onComplete={() => setRollResult(null)} 
                />
            )}
        </div>
    );
};
