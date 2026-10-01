import React, { useState } from 'react';
import { BottomNavBar } from '../../common/BottomNavBar';
import { TabBar } from '../../common/TabBar';

interface HubRightColumnProps {
    mobileView: 'left' | 'middle' | 'right';
    setMobileView: (view: 'left' | 'middle' | 'right') => void;
    onNavigate: (page: 'menu' | 'work' | 'inventory' | 'settings' | 'lobby' | 'combatTest') => void;
}

export const HubRightColumn: React.FC<HubRightColumnProps> = ({ mobileView, setMobileView, onNavigate }) => {
    const [activeRightTab, setActiveRightTab] = useState<'log' | 'announcement' | 'chat' | 'mail'>('log');

    return (
        <div className={`${mobileView === 'right' ? 'flex w-full' : 'hidden'} md:flex md:w-[30%] flex-col border-l border-[var(--border-color)] bg-[var(--surface-color)]`}>
            {/* Header Tabs */}
            <TabBar 
                tabs={[
                    { id: 'log', label: '日誌' },
                    { id: 'announcement', label: '公告' },
                    { id: 'chat', label: '聊天' },
                    { id: 'mail', label: '信箱' }
                ]}
                activeTab={activeRightTab}
                onTabChange={setActiveRightTab}
            />

            {/* Log Stream */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-[var(--border-color)] flex gap-3 bg-[var(--surface-color)] z-10">
                <div className="flex-1 relative">
                    <i className="bi bi-paperclip absolute left-3 top-1/2 -translate-y-1/2 text-[var(--secondary-text-color)] cursor-pointer hover:text-[var(--primary-color)] text-lg"></i>
                    <input 
                        type="text" 
                        placeholder="輸入訊息..." 
                        className="w-full bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[var(--primary-color)] transition-colors text-[var(--text-color)]"
                    />
                </div>
                <button className="bg-[rgba(79,195,247,0.15)] text-[var(--primary-color)] border border-[var(--primary-color)] font-bold px-5 py-2 rounded-lg text-sm hover:bg-[var(--primary-color)] hover:text-[var(--background-color)] transition-all">
                    傳送
                </button>
            </div>
            {/* 導覽列 (僅手機版於聊天顯示) */}
            <div className="md:hidden mt-auto shrink-0 z-20">
                <BottomNavBar mobileView={mobileView} setMobileView={setMobileView} onNavigate={onNavigate} />
            </div>
        </div>
    );
};
