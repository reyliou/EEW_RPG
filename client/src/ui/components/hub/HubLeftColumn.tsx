import React, { useState } from 'react';
import { BottomNavBar } from '../../common/BottomNavBar';
import { TabBar } from '../../common/TabBar';

interface HubLeftColumnProps {
    mobileView: 'left' | 'middle' | 'right';
    setMobileView: (view: 'left' | 'middle' | 'right') => void;
    onNavigate: (page: 'menu' | 'work' | 'inventory' | 'settings' | 'lobby' | 'combatTest') => void;
}

// Mock Items Database for UI building
const MOCK_ITEMS: any[] = [];

export const HubLeftColumn: React.FC<HubLeftColumnProps> = ({ mobileView, setMobileView, onNavigate }) => {
    const [activeLeftTab, setActiveLeftTab] = useState<'equip' | 'inventory' | 'craft'>('inventory');
    const [itemFilter, setItemFilter] = useState<'all'|'usable'|'weapon'|'armor'>('all');

    return (
        <div className={`${mobileView === 'left' ? 'flex w-full' : 'hidden'} md:flex md:w-[30%] flex-col border-r border-[var(--border-color)] bg-[var(--surface-color)]`}>
            {/* Header Tabs */}
            <TabBar 
                tabs={[
                    { id: 'equip', label: '裝備' },
                    { id: 'inventory', label: '背包' },
                    { id: 'craft', label: '製作' }
                ]}
                activeTab={activeLeftTab}
                onTabChange={setActiveLeftTab}
            />

            {/* Filter Icons */}
            <div className="p-3 flex gap-2 overflow-x-auto custom-scrollbar border-b border-[var(--border-color)]">
                <button onClick={() => setItemFilter('all')} className={`w-10 h-10 rounded border transition-colors flex items-center justify-center ${itemFilter === 'all' ? 'border-[var(--primary-color)] bg-[rgba(79,195,247,0.1)] text-[var(--primary-color)]' : 'border-[var(--border-color)] bg-[var(--background-color)] hover:border-[var(--primary-color)]'}`}><i className="bi bi-list"></i></button>
                <button onClick={() => setItemFilter('weapon')} className={`w-10 h-10 rounded border transition-colors flex items-center justify-center ${itemFilter === 'weapon' ? 'border-[var(--primary-color)] bg-[rgba(79,195,247,0.1)] text-[var(--primary-color)]' : 'border-[var(--border-color)] bg-[var(--background-color)] hover:border-[var(--primary-color)]'}`}><i className="bi bi-asterisk"></i></button>
                <button onClick={() => setItemFilter('armor')} className={`w-10 h-10 rounded border transition-colors flex items-center justify-center ${itemFilter === 'armor' ? 'border-[var(--primary-color)] bg-[rgba(79,195,247,0.1)] text-[var(--primary-color)]' : 'border-[var(--border-color)] bg-[var(--background-color)] hover:border-[var(--primary-color)]'}`}><i className="bi bi-shield-fill"></i></button>
                <button onClick={() => setItemFilter('usable')} className={`w-10 h-10 rounded border transition-colors flex items-center justify-center ${itemFilter === 'usable' ? 'border-[var(--primary-color)] bg-[rgba(79,195,247,0.1)] text-[var(--primary-color)]' : 'border-[var(--border-color)] bg-[var(--background-color)] hover:border-[var(--primary-color)]'}`}><i className="bi bi-droplet-fill"></i></button>
            </div>

            {/* Item List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                <div className="text-xs text-[var(--secondary-text-color)] px-2 py-2 flex justify-between">
                    <span>Size: 56/100</span>
                </div>
                {MOCK_ITEMS.filter(item => itemFilter === 'all' || item.type === itemFilter).map(item => (
                    <div key={item.id} className="flex items-center justify-between p-4 border-b border-[var(--border-color)] hover:bg-[rgba(255,255,255,0.05)] cursor-pointer group transition-colors">
                        <div className="flex items-center gap-4">
                            <i className={`bi ${item.icon} text-xl ${item.rarity}`}></i>
                            <span className={`font-bold ${item.rarity} group-hover:underline`}>{item.name}</span>
                        </div>
                        <span className="font-mono text-xs text-[var(--secondary-text-color)] font-bold">x{item.qty}</span>
                    </div>
                ))}
            </div>
            {/* 導覽列 (僅手機版於背包顯示) */}
            <div className="md:hidden mt-auto shrink-0 z-20">
                <BottomNavBar mobileView={mobileView} setMobileView={setMobileView} onNavigate={onNavigate} />
            </div>
        </div>
    );
};
