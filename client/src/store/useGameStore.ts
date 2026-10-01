import { create } from 'zustand';
import { ICharacterState } from '@shared/types/character.types';
import { IExpedition } from '@shared/types/expedition.types';

interface GameState {
    // 遊戲設置
    theme: 'dark' | 'light';
    setTheme: (theme: 'dark' | 'light') => void;
    toggleTheme: () => void;

    bgmVolume: number;
    setBgmVolume: (volume: number) => void;

    sfxVolume: number;
    setSfxVolume: (volume: number) => void;

    language: 'zh' | 'en';
    setLanguage: (lang: 'zh' | 'en') => void;

    // 核心狀態
    character: ICharacterState | null;
    setCharacter: (char: ICharacterState | null) => void;

    activeExpedition: IExpedition | null;
    setActiveExpedition: (exp: IExpedition | null) => void;
}

export const useGameStore = create<GameState>((set) => ({
    // 初始遊戲設置
    theme: 'dark',
    setTheme: (theme) => {
        set({ theme });
        document.body.setAttribute('data-theme', theme);
    },
    toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);
        return { theme: newTheme };
    }),

    bgmVolume: 30,
    setBgmVolume: (bgmVolume) => set({ bgmVolume }),

    sfxVolume: 70,
    setSfxVolume: (sfxVolume) => set({ sfxVolume }),

    language: 'zh',
    setLanguage: (language) => set({ language }),

    // 初始核心狀態
    character: null,
    setCharacter: (character) => set({ character }),

    activeExpedition: null,
    setActiveExpedition: (activeExpedition) => set({ activeExpedition })
}));
