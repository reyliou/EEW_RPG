import { IContextSnapshot } from '../../../shared/types/context.types';
import { WORLD_SETTINGS } from '../../../shared/constants/WorldLore';
import { SYSTEM_PROMPTS } from '../../../shared/constants/SystemPrompts';
import { LoreLoader } from './LoreLoader';

export class ContextBuilder {
    /**
     * 將三層 Context 轉換為 Gemini 格式的 Prompt
     */
    static buildPrompt(userPrompt: string, snapshot: IContextSnapshot): string {
        const { lore, state, history } = snapshot;

        // 1. 注入靜態核心設定 (Core Setting)
        const factions = lore?.factions?.join(', ') || 'Unknown';
        let systemContext = `[WORLD LORE]\nWorld: ${WORLD_SETTINGS.WORLD_NAME}\nTheme: ${WORLD_SETTINGS.WORLD_THEME}\nRules: ${lore?.baseRules || 'Normal game rules.'}\n\n`;

        // 1.5 注入動態世界觀 (Dynamic RAG Lore)
        const dynamicLore = LoreLoader.getRelevantLore(userPrompt);
        if (dynamicLore) {
            systemContext += dynamicLore;
        }

        // 2. 注入角色屬性 (Character Stats)
        if (state?.globalFlags?.character) {
            const char = state.globalFlags.character;
            systemContext += `[CHARACTER: ${char.name}]\nStats: STR:${char.strength}, DEX:${char.dexterity}, INT:${char.intelligence}, CON:${char.constitution}, CHA:${char.charisma}, WIS:${char.wisdom}\n\n`;
        }

        // 3. 注入動態世界狀態 (State)
        const activeNpcs = state?.activeNpcs?.join(', ') || 'None';
        systemContext += `[CURRENT STATE]\nLocation: ${state?.currentLocation || 'Wilderness'}\nActive NPCs: ${activeNpcs}\n\n`;

        // 4. 注入歷史對話 (History Summary)
        if (history?.recentTurns && history.recentTurns.length > 0) {
            systemContext += `[RECENT CONVERSATION]\n`;
            history.recentTurns.forEach(turn => {
                const roleName = turn.role === 'user' ? 'Player' : 'Weaver';
                systemContext += `${roleName}: ${turn.content}\n`;
            });
            systemContext += `\n`;
        }

        // 使用集中管理的 SystemPrompts
        return SYSTEM_PROMPTS.buildChatPrompt(userPrompt, systemContext, history?.summary || 'None');
    }

    /**
     * 建立專屬於 TRPG 動態探索按鈕的 JSON Prompt
     */
    static buildTRPGPrompt(playerAction: string, snapshot: IContextSnapshot): string {
        const { state } = snapshot;
        const char = state?.globalFlags?.character;
        
        const charName = char?.name || 'Traveler';
        const charStats = `STR:${char?.strength || 10}, DEX:${char?.dexterity || 10}, INT:${char?.intelligence || 10}, CON:${char?.constitution || 10}, CHA:${char?.charisma || 10}, WIS:${char?.wisdom || 10}`;

        return SYSTEM_PROMPTS.buildTRPGPrompt(playerAction, charName, charStats);
    }
}
