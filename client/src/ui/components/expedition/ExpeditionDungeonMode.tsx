import React from 'react';
import { IExpedition } from '@shared/types/expedition.types';
import { HexMap } from '../../features/HexMap';

interface ExpeditionDungeonModeProps {
    activeExpedition: IExpedition;
    handleMove: (q: number, r: number) => void;
}

export const ExpeditionDungeonMode: React.FC<ExpeditionDungeonModeProps> = ({
    activeExpedition,
    handleMove
}) => {
    return (
        <div className="animate-fadeIn space-y-6 pb-20">
            {/* 1. 遠征頂部狀態 */}
            <div className="flex justify-between items-center bg-[rgba(244,67,54,0.05)] p-5 rounded-xl border border-[var(--error-color)] shadow-[0_0_15px_rgba(244,67,54,0.1)]">
                <div>
                    <h2 className="text-[var(--error-color)] text-xl font-bold tracking-widest flex items-center gap-3">
                        <i className="bi bi-shield-shaded text-2xl"></i> 古代遺跡深處
                    </h2>
                    <p className="text-xs text-[var(--secondary-text-color)] mt-1">
                        警告：未知的威脅正在逼近 | 危險等級：A+
                    </p>
                </div>
                <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-[var(--error-color)] text-white text-[10px] font-bold rounded animate-pulse">
                        交戰區
                    </span>
                </div>
            </div>

            {/* 2. 隊伍狀態 (隨從) */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rpg-attr-item border-[var(--primary-color)]">
                    <span className="rpg-attr-label">隨行夥伴</span>
                    <div className="mt-2 space-y-2">
                        {activeExpedition.companions.length > 0 ? (
                            activeExpedition.companions.map(comp => (
                                <div key={comp.id} className="flex justify-between text-sm">
                                    <span>{comp.name} ({comp.job})</span>
                                    <span className="text-[var(--success-color)]">HP: {comp.currentHp}</span>
                                </div>
                            ))
                        ) : (
                            <span className="text-xs opacity-50 italic">獨自一人探索中...</span>
                        )}
                    </div>
                </div>
                <div className="rpg-attr-item border-[var(--warning-color)] group hover:shadow-[0_0_15px_rgba(255,167,38,0.2)] transition-shadow">
                    <span className="rpg-attr-label text-[var(--warning-color)]"><i className="bi bi-box-seam mr-2"></i>本次掠奪 (Loot)</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {activeExpedition.loot.map((item, idx) => (
                            <span key={idx} className="bg-white/10 px-2 py-1 rounded text-xs">
                                <i className="bi bi-box-seam mr-1"></i>{item}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. 六邊形地圖 */}
            <HexMap 
                radius={8} 
                currentPos={activeExpedition.currentPosition} 
                tileMap={activeExpedition.tileMap}
                eventMap={activeExpedition.eventMap}
                onMove={handleMove}
            />

            {/* 4. 事件日誌 (遠征專屬) */}
            <div className="game-log-container !h-32">
                <div className="p-2 text-xs text-[var(--error-color)] font-bold">
                    [SYSTEM] 警告：偵測到附近有敵意生命跡象。
                </div>
                <div className="p-2 text-xs text-[var(--secondary-text-color)]">
                    [LOG] 玩家位置更新至 ({activeExpedition.currentPosition.q}, {activeExpedition.currentPosition.r})。
                </div>
            </div>
        </div>
    );
};
