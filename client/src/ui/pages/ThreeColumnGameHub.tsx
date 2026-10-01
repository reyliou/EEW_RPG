import React, { useState } from 'react';
import { ICharacterState } from '@shared/types/character.types';
import { HubLeftColumn } from '../components/hub/HubLeftColumn';
import { HubMiddleColumn } from '../components/hub/HubMiddleColumn';
import { HubRightColumn } from '../components/hub/HubRightColumn';

interface ThreeColumnGameHubProps {
    onNavigate: (page: 'menu' | 'work' | 'inventory' | 'settings' | 'lobby' | 'combatTest') => void;
}

export const ThreeColumnGameHub: React.FC<ThreeColumnGameHubProps> = ({ 
    onNavigate
}) => {
    // Mobile view state (controls which column is active on mobile)
    const [mobileView, setMobileView] = useState<'left' | 'middle' | 'right'>('middle');

    return (
        <div className="fixed inset-0 bg-[var(--background-color)] text-[var(--text-color)] font-sans text-sm flex overflow-hidden select-none">
            {/* Left Column: Inventory / Equip */}
            <HubLeftColumn mobileView={mobileView} setMobileView={setMobileView} onNavigate={onNavigate} />

            {/* Middle Column: Main World / Expedition / Settings */}
            <HubMiddleColumn mobileView={mobileView} setMobileView={setMobileView} onNavigate={onNavigate} />

            {/* Right Column: Chat / Logs */}
            <HubRightColumn mobileView={mobileView} setMobileView={setMobileView} onNavigate={onNavigate} />
        </div>
    );
};

