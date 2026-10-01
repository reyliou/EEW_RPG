import React from 'react';

export interface TabItem<T extends string> {
    id: T;
    label: string;
}

interface TabBarProps<T extends string> {
    tabs: TabItem<T>[];
    activeTab: T;
    onTabChange: (tabId: T) => void;
}

export function TabBar<T extends string>({ tabs, activeTab, onTabChange }: TabBarProps<T>) {
    return (
        <div className="flex text-center border-b border-[var(--border-color)] text-xs font-bold tracking-widest shrink-0">
            {tabs.map(tab => (
                <div 
                    key={tab.id}
                    className={`flex-1 py-4 cursor-pointer transition-colors ${
                        activeTab === tab.id 
                            ? 'text-[var(--primary-color)] border-b-2 border-[var(--primary-color)]' 
                            : 'text-[var(--secondary-text-color)] hover:text-[var(--text-color)]'
                    }`}
                    onClick={() => onTabChange(tab.id)}
                >
                    {tab.label}
                </div>
            ))}
        </div>
    );
}
