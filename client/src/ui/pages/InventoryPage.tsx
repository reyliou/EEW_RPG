import React, { useState } from 'react';
import { ICharacterState } from '@shared/types/character.types';
import { PageContainer } from '../common/PageContainer';

interface InventoryPageProps {
    character: ICharacterState;
    onBack: () => void;
}

// Mock Items Database for UI building
const MOCK_ITEMS: any[] = [];

export const InventoryPage: React.FC<InventoryPageProps> = ({ character, onBack }) => {
    const [filter, setFilter] = useState<'all' | 'usable' | 'weapon' | 'armor'>('all');
    const [selectedItem, setSelectedItem] = useState<any | null>(null);

    const filteredItems = MOCK_ITEMS.filter(item => filter === 'all' || item.type === filter);

    return (
        <PageContainer className="max-w-5xl mx-auto h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--primary-color)] tracking-widest flex items-center gap-3">
                        <i className="bi bi-backpack-fill"></i> 行囊與裝備庫
                    </h1>
                    <p className="text-sm opacity-60">整理您的戰利品與武裝，為下一場遠征做準備。</p>
                </div>
                <div className="flex gap-4 items-center">
                    <span className="text-[var(--warning-color)] font-bold bg-base-300 px-4 py-2 rounded-lg border border-[var(--warning-color)]/30">
                        <i className="bi bi-coin mr-2"></i> 14,250 G
                    </span>
                    <button className="rpg-btn px-6 py-2" onClick={onBack}>
                        <i className="bi bi-arrow-left-circle mr-2"></i>返回營地
                    </button>
                </div>
            </div>

            {/* Main Layout Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-0">
                
                {/* Left Side: Equipment Slots & Stats (4 cols) */}
                <div className="md:col-span-4 flex flex-col gap-4">
                    <div className="bg-base-200 border border-[var(--primary-color)]/30 rounded-xl p-5 flex-1">
                        <h3 className="text-sm font-bold text-[var(--secondary-text-color)] mb-4 uppercase tracking-wider">
                            <i className="bi bi-person-bounding-box mr-2"></i> 當前裝備
                        </h3>
                        
                        <div className="space-y-4">
                            {/* Weapon Slot */}
                            <div className="flex items-center justify-between bg-base-300 p-3 rounded-lg border border-base-content/10 hover:border-[var(--primary-color)]/50 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-base-100 rounded flex items-center justify-center text-xl text-[var(--primary-color)] group-hover:scale-110 transition-transform">
                                        <i className="bi bi-asterisk"></i>
                                    </div>
                                    <div>
                                        <div className="text-xs text-[var(--secondary-text-color)]">主手武器</div>
                                        <div className="font-bold">未裝備</div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Armor Slot */}
                            <div className="flex items-center justify-between bg-base-300 p-3 rounded-lg border border-base-content/10 hover:border-[var(--primary-color)]/50 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-base-100 rounded flex items-center justify-center text-xl text-[var(--secondary-color)] group-hover:scale-110 transition-transform">
                                        <i className="bi bi-shield-fill"></i>
                                    </div>
                                    <div>
                                        <div className="text-xs text-[var(--secondary-text-color)]">身體防具</div>
                                        <div className="font-bold">未裝備</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-4 border-t border-base-content/10">
                            <h3 className="text-sm font-bold text-[var(--secondary-text-color)] mb-3">戰鬥面板更新</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="opacity-60">物理攻擊力 (ATK)</span>
                                    <span className="font-bold text-[var(--warning-color)]">{character?.strength || 10}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="opacity-60">魔法攻擊力 (MATK)</span>
                                    <span className="font-bold text-cyan-500">{character?.intelligence || 10}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="opacity-60">護甲防禦 (DEF)</span>
                                    <span className="font-bold text-[var(--success-color)]">{character?.constitution || 10}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Inventory List & Detail Pane (8 cols) */}
                <div className="md:col-span-8 flex flex-col gap-4 min-h-0">
                    
                    {/* Filter Tabs */}
                    <div className="flex bg-base-200 border border-base-content/10 p-1 rounded-lg w-fit">
                        {['all', 'usable', 'weapon', 'armor'].map((type) => (
                            <button 
                                key={type}
                                onClick={() => {
                                    setFilter(type as any);
                                    setSelectedItem(null);
                                }}
                                className={`px-6 py-2 text-sm font-bold rounded-md transition-colors ${filter === type ? 'bg-[var(--primary-color)] text-base-100 shadow-[0_0_10px_rgba(var(--primary-color-rgb),0.5)]' : 'text-[var(--secondary-text-color)] hover:text-base-content'}`}
                            >
                                {type === 'all' ? '全部' : type === 'usable' ? '消耗品' : type === 'weapon' ? '武器' : '防具'}
                            </button>
                        ))}
                    </div>

                    {/* Inventory Grid Layout */}
                    <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
                        {/* List */}
                        <div className="flex-1 bg-base-200 border border-base-content/10 rounded-xl p-2 overflow-y-auto min-h-[300px] space-y-2">
                            {filteredItems.map(item => (
                                <div 
                                    key={item.id} 
                                    onClick={() => setSelectedItem(item)}
                                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${selectedItem?.id === item.id ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/10' : 'border-transparent hover:bg-base-content/5'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded flex items-center justify-center bg-base-300 ${item.type === 'usable' ? 'text-green-500' : item.type === 'weapon' ? 'text-[var(--warning-color)]' : 'text-blue-500'}`}>
                                            <i className={`bi ${item.icon}`}></i>
                                        </div>
                                        <div>
                                            <div className="font-bold">{item.name}</div>
                                            <div className="text-xs opacity-50 uppercase">{item.type}</div>
                                        </div>
                                    </div>
                                    <div className="font-bold opacity-80">
                                        x{item.qty}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Detail Pane */}
                        <div className="w-full md:w-1/3 bg-base-200 border border-[var(--primary-color)]/20 rounded-xl p-5 flex flex-col justify-between min-h-[300px]">
                            {selectedItem ? (
                                <div className="space-y-4 animate-fadeIn">
                                    <div className="flex items-center gap-4 pb-4 border-b border-base-content/10">
                                        <div className={`w-16 h-16 text-3xl rounded-lg flex items-center justify-center bg-base-300 shadow-inner ${selectedItem.type === 'usable' ? 'text-green-500' : selectedItem.type === 'weapon' ? 'text-[var(--warning-color)]' : 'text-blue-500'}`}>
                                            <i className={`bi ${selectedItem.icon}`}></i>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{selectedItem.name}</h3>
                                            <span className="text-xs bg-base-content/10 px-2 py-1 rounded">{selectedItem.type}</span>
                                        </div>
                                    </div>
                                    
                                    <p className="text-sm text-[var(--secondary-text-color)] leading-relaxed min-h-[80px]">
                                        {selectedItem.desc}
                                    </p>

                                    <div className="pt-4 flex flex-col gap-3">
                                        {selectedItem.type === 'usable' && (
                                            <button className="rpg-btn rpg-btn-primary w-full">
                                                <i className="bi bi-droplet-fill"></i> 使用道具
                                            </button>
                                        )}
                                        {(selectedItem.type === 'weapon' || selectedItem.type === 'armor') && (
                                            <button className="rpg-btn bg-[var(--warning-color)] text-black hover:bg-yellow-600 w-full">
                                                <i className="bi bi-shield-check"></i> 裝備此物品
                                            </button>
                                        )}
                                        <button className="rpg-btn bg-red-900/30 hover:bg-red-800/50 w-full text-red-300">
                                            <i className="bi bi-trash"></i> 丟棄
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center opacity-50 space-y-4">
                                    <i className="bi bi-box-seam text-5xl"></i>
                                    <p>請從清單中選擇一項物品來查看詳細資訊與進行操作。</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </PageContainer>
    );
};
