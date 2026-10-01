import React from 'react';

interface BottomNavBarProps {
    mobileView: 'left' | 'middle' | 'right';
    setMobileView: (view: 'left' | 'middle' | 'right') => void;
    onNavigate: (page: 'menu' | 'work' | 'inventory' | 'settings' | 'lobby' | 'combatTest') => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ mobileView, setMobileView, onNavigate }) => {
    return (
        <div className="h-16 md:h-14 border-t border-[var(--border-color)] bg-[var(--surface-color)] flex items-center overflow-x-auto hide-scrollbar w-full mt-auto shrink-0 z-20">
            <div 
                className={`flex-1 min-w-[70px] flex flex-col items-center justify-center h-full gap-1 cursor-pointer transition-colors ${mobileView === 'middle' ? 'text-[var(--primary-color)] bg-[rgba(79,195,247,0.05)]' : 'text-[var(--secondary-text-color)] hover:text-[var(--text-color)] hover:bg-[rgba(255,255,255,0.02)]'}`}
                onClick={() => setMobileView('middle')}
            >
                <i className="bi bi-map-fill text-xl md:text-lg"></i>
                <span className="text-[10px] md:text-xs">地圖</span>
            </div>
            
            <div 
                className={`flex-1 min-w-[70px] flex flex-col items-center justify-center h-full gap-1 cursor-pointer transition-colors ${mobileView === 'left' ? 'text-[var(--primary-color)] bg-[rgba(79,195,247,0.05)]' : 'text-[var(--secondary-text-color)] hover:text-[var(--text-color)] hover:bg-[rgba(255,255,255,0.02)]'}`}
                onClick={() => setMobileView('left')}
            >
                <i className="bi bi-backpack-fill text-xl md:text-lg"></i>
                <span className="text-[10px] md:text-xs">背包</span>
            </div>
            
            <div 
                className={`flex-1 min-w-[70px] flex flex-col items-center justify-center h-full gap-1 cursor-pointer transition-colors text-[var(--secondary-text-color)] hover:text-[var(--text-color)] hover:bg-[rgba(255,255,255,0.02)]`}
                onClick={() => alert('【任務系統】即將開放，敬請期待！')}
            >
                <i className="bi bi-journal-bookmark-fill text-xl md:text-lg"></i>
                <span className="text-[10px] md:text-xs">任務</span>
            </div>

            <div 
                className={`flex-1 min-w-[70px] flex flex-col items-center justify-center h-full gap-1 cursor-pointer transition-colors ${mobileView === 'right' ? 'text-[var(--primary-color)] bg-[rgba(79,195,247,0.05)]' : 'text-[var(--secondary-text-color)] hover:text-[var(--text-color)] hover:bg-[rgba(255,255,255,0.02)]'}`}
                onClick={() => setMobileView('right')}
            >
                <i className="bi bi-chat-left-text-fill text-xl md:text-lg"></i>
                <span className="text-[10px] md:text-xs">訊息</span>
            </div>

            <div 
                className="flex-1 min-w-[70px] flex flex-col items-center justify-center h-full gap-1 text-[var(--secondary-text-color)] hover:text-[var(--text-color)] hover:bg-[rgba(255,255,255,0.02)] cursor-pointer transition-colors" 
                onClick={() => onNavigate('lobby')}
            >
                <i className="bi bi-person-lines-fill text-xl md:text-lg"></i>
                <span className="text-[10px] md:text-xs">資訊</span>
            </div>
        </div>
    );
};
