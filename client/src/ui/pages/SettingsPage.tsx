import React from 'react';
import { PageContainer } from '../common/PageContainer';
import { BackButton } from '../common/BackButton';
import { VolumeSlider } from '../features/VolumeSlider';

import { useGameStore } from '../../store/useGameStore';

interface SettingsPageProps {
    onBack: () => void;
    embedded?: boolean;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
    onBack,
    embedded = false
}) => {
    const bgmVolume = useGameStore(state => state.bgmVolume);
    const setBgmVolume = useGameStore(state => state.setBgmVolume);
    const sfxVolume = useGameStore(state => state.sfxVolume);
    const setSfxVolume = useGameStore(state => state.setSfxVolume);
    const language = useGameStore(state => state.language);
    const setLanguage = useGameStore(state => state.setLanguage);
    const theme = useGameStore(state => state.theme);
    const toggleTheme = useGameStore(state => state.toggleTheme);
    const content = (
        <div className={embedded ? "space-y-6" : "space-y-8 mt-4"}>
            <BackButton 
                onClick={onBack} 
                label="返回營地" 
                className={embedded ? "!relative !top-0 !left-0 mb-2 inline-flex w-fit bg-[var(--surface-color)]" : ""} 
            />

            <h1 className="text-3xl font-bold text-[var(--primary-color)] border-b-2 border-[var(--primary-color)] pb-4 flex items-center gap-3">
                <i className="bi bi-gear-fill"></i> 遊戲設置
            </h1>

            {/* 音量控制 (功能塊) */}
            <div className="space-y-6">
                <VolumeSlider 
                    label="背景音樂 (BGM)" 
                    iconClass="bi-music-note-beamed" 
                    value={bgmVolume} 
                    onChange={setBgmVolume} 
                />
                <VolumeSlider 
                    label="音效 (SFX)" 
                    iconClass="bi-soundwave" 
                    value={sfxVolume} 
                    onChange={setSfxVolume} 
                />
            </div>

            {/* 主題與語言 (未來也可以拆成功能塊) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-[var(--secondary-text-color)]">介面語言</label>
                    <div className="flex gap-2">
                        <button 
                            className={`rpg-btn flex-1 ${language === 'zh' ? 'rpg-btn-primary' : ''}`}
                            onClick={() => setLanguage('zh')}
                        >
                            繁體中文
                        </button>
                        <button 
                            className={`rpg-btn flex-1 ${language === 'en' ? 'rpg-btn-primary' : ''}`}
                            onClick={() => setLanguage('en')}
                        >
                            English
                        </button>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-[var(--secondary-text-color)]">介面主題</label>
                    <button className="rpg-btn w-full" onClick={toggleTheme}>
                        <i className={`bi ${theme === 'dark' ? 'bi-sun-fill' : 'bi-moon-fill'}`}></i>
                        {theme === 'dark' ? '切換為白晝模式' : '切換為黑夜模式'}
                    </button>
                </div>
            </div>

            <div className="pt-8 border-t border-[var(--border-color)]">
                <button className="rpg-btn w-full" onClick={onBack}>
                    <i className="bi bi-check-lg"></i> 儲存並返回
                </button>
            </div>
        </div>
    );

    if (embedded) {
        return content;
    }

    return (
        <PageContainer>
            {content}
        </PageContainer>
    );
};
