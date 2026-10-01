import React, { useState } from 'react';
import { BottomNavBar } from '../../common/BottomNavBar';
import { ActionCard } from '../../common/ActionCard';
import { SettingsPage } from '../../pages/SettingsPage';
import { ExpeditionPage } from '../../pages/ExpeditionPage';
import { CombatTestPage } from '../../pages/CombatTestPage';
import { useGameStore } from '../../../store/useGameStore';
import { MapGenerator } from '../../../core/services/MapGenerator';

interface HubMiddleColumnProps {
    mobileView: 'left' | 'middle' | 'right';
    setMobileView: (view: 'left' | 'middle' | 'right') => void;
    onNavigate: (page: 'menu' | 'work' | 'inventory' | 'settings' | 'lobby' | 'combatTest') => void;
}

export const HubMiddleColumn: React.FC<HubMiddleColumnProps> = ({ mobileView, setMobileView, onNavigate }) => {
    const [middleView, setMiddleView] = useState<'camp' | 'settings' | 'expedition' | 'combatTest'>('camp');
    const character = useGameStore(state => state.character);
    const activeExpedition = useGameStore(state => state.activeExpedition);
    const setActiveExpedition = useGameStore(state => state.setActiveExpedition);

    if (!character) return null;

    const handleStartExpedition = () => {
        const mapGen = new MapGenerator();
        const generatedTileMap = mapGen.generateHexMap(8);

        setActiveExpedition({
            id: `exp-${Date.now()}`,
            startTime: Date.now(),
            status: 'active',
            leaderId: character.id,
            partyMembers: [],
            companions: [
                { id: 'npc-1', name: '艾莉亞', job: '弓箭手', currentHp: 80, maxHp: 80, level: 1, experience: 0, strength: 10, dexterity: 15, intelligence: 10, constitution: 8, charisma: 12, wisdom: 10, luck: 10, statusEffects: [], ownerId: character.id, rarity: 'rare', isPermanent: false }
            ],
            currentMapId: 'wilderness-1',
            currentPosition: { q: 0, r: 0 },
            loot: ['生鏽的鐵劍', '乾糧'],
            tileMap: generatedTileMap,
            eventMap: {
                '2_1': 'combat-1',
                '-1_3': 'treasure-1',
                '0_4': 'boss-1'
            },
            eventHistory: ['抵達荒野邊境']
        } as any);
        setMiddleView('expedition');
    };

    const handleEndExpedition = () => {
        setActiveExpedition(null);
        setMiddleView('camp');
    };

    return (
        <div className={`${mobileView === 'middle' ? 'flex w-full' : 'hidden'} md:flex md:w-[40%] flex-col min-w-0 bg-[var(--surface-color)] relative z-10`}>
            {/* Top Status Bar */}
            <div className="h-16 border-b border-[var(--border-color)] flex items-center px-4 md:px-6 gap-4 md:gap-6 bg-[var(--surface-color)]">
                <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-[var(--background-color)] flex items-center justify-center font-bold text-xl border border-[var(--border-color)] rounded-md text-[var(--primary-color)]">
                        {character.level}
                    </div>
                    <div className="flex flex-col flex-1 max-w-[250px]">
                        <div className="flex justify-between text-[10px] font-bold text-[var(--secondary-text-color)] mb-1">
                            <span>{character.experience}</span>
                            <span>1,000 EXP</span>
                        </div>
                        <div className="h-2 w-full bg-[var(--background-color)] border border-[var(--border-color)] rounded-sm overflow-hidden">
                            <div className="h-full bg-[#4051b5] w-1/3"></div>
                        </div>
                    </div>
                </div>
                <div className="text-xs font-mono font-bold text-[var(--warning-color)] flex items-center gap-2">
                    <i className="bi bi-coin"></i> <span className="hidden sm:inline">14,250 G</span>
                </div>
                <div className="text-xs font-mono font-bold text-[var(--primary-color)] flex items-center gap-2">
                    <i className="bi bi-gem"></i> <span className="hidden sm:inline">120 水晶</span>
                </div>
                <div 
                    className={`w-8 h-8 flex items-center justify-center cursor-pointer text-[var(--secondary-text-color)] hover:text-[var(--primary-color)] hover:bg-[rgba(79,195,247,0.1)] rounded-md transition-colors ${middleView === 'settings' ? 'text-[var(--primary-color)]' : ''}`}
                    onClick={() => setMiddleView('settings')}
                    title="系統設置"
                >
                    <i className="bi bi-gear-fill text-lg"></i>
                </div>
            </div>
            {/* Main Content Area */}
            <div className={`flex-1 ${['expedition', 'combatTest'].includes(middleView) ? 'flex flex-col overflow-hidden' : 'overflow-y-auto p-6 md:p-8'} custom-scrollbar w-full relative`}>
                {middleView === 'settings' ? (
                    <div className="animate-fadeIn">
                        <SettingsPage 
                            embedded={true}
                            onBack={() => setMiddleView('camp')}
                        />
                    </div>
                ) : middleView === 'expedition' ? (
                    <div className="animate-fadeIn h-full flex flex-col min-h-0">
                        <ExpeditionPage 
                            character={character}
                            activeExpedition={activeExpedition as any}
                            onMove={(q, r) => activeExpedition && setActiveExpedition({...activeExpedition, currentPosition: {q, r}})}
                            onExtract={handleEndExpedition}
                            onEndExpedition={handleEndExpedition}
                            embedded={true}
                        />
                    </div>
                ) : middleView === 'combatTest' ? (
                    <div className="animate-fadeIn h-full flex flex-col min-h-0 w-full">
                        <CombatTestPage 
                            character={character}
                            onBack={() => setMiddleView('camp')}
                        />
                    </div>
                ) : (
                    <div className="animate-fadeIn">
                        {/* Location Header & Banner */}
                        <div className="mb-8 text-center mt-4">
                            <h1 className="text-3xl md:text-4xl font-bold text-[var(--primary-color)] mb-3 tracking-widest" style={{ textShadow: '0 0 10px rgba(79, 195, 247, 0.3)' }}>藍石城外圍營地</h1>
                            <p className="text-sm text-[var(--secondary-text-color)]">金羊毛之地的邊陲，傭兵與冒險者聚集的灰色地帶。</p>
                            <span className="inline-block mt-4 px-3 py-1 bg-[rgba(79,195,247,0.1)] text-[var(--primary-color)] border border-[var(--primary-color)] text-[11px] font-bold rounded">
                                安全區域 / 整備點
                            </span>
                        </div>



                        {/* Interactive List */}
                        <div className="mb-10">
                            <h3 className="text-xs font-bold text-[var(--secondary-text-color)] mb-4 tracking-wider uppercase">營地設施</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="attribute-item flex items-center gap-3 cursor-pointer hover:border-[var(--primary-color)] text-center justify-center">
                                    <i className="bi bi-hammer text-[var(--primary-color)] text-lg"></i> <span className="text-sm font-bold">鐵匠鋪</span>
                                </div>
                                <div className="attribute-item flex items-center gap-3 cursor-pointer hover:border-[var(--success-color)] text-center justify-center">
                                    <i className="bi bi-shop text-[var(--success-color)] text-lg"></i> <span className="text-sm font-bold">黑市商人</span>
                                </div>
                                <div className="attribute-item flex items-center gap-3 cursor-pointer hover:border-[#d946ef] text-center justify-center">
                                    <i className="bi bi-magic text-[#d946ef] text-lg"></i> <span className="text-sm font-bold">天賦與信仰</span>
                                </div>
                            </div>
                        </div>

                        {/* Travel / Action List */}
                        <div className="pb-16 md:pb-0">
                            <h3 className="text-xs font-bold text-[var(--secondary-text-color)] mb-4 tracking-wider uppercase">行動與遠征</h3>
                            <div className="space-y-4">
                                <ActionCard
                                    title="踏上遠征 (進入 TRPG)"
                                    description="進入未知的地城探險，透過文字與骰子決定命運，並搜刮戰利品。"
                                    icon="bi-compass-fill"
                                    badge="主線"
                                    colorTheme="primary"
                                    onClick={handleStartExpedition}
                                />

                                <ActionCard
                                    title="戰鬥測試 (TRPG + Roguelike)"
                                    description="進入測試場，測試新實裝的 3D 骰子系統與 Rogue 技能組合！"
                                    icon="bi-crosshair"
                                    badge="測試"
                                    colorTheme="error"
                                    onClick={() => setMiddleView('combatTest')}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 導覽列 (中欄常駐，含電腦與手機版) */}
            <BottomNavBar mobileView={mobileView} setMobileView={setMobileView} onNavigate={onNavigate} />
        </div>
    );
};
