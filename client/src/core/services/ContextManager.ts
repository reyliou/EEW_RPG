import { IContextSnapshot, IStaticLore, IWorldState, ISlidingHistory } from '@shared/types/context.types';

export class ContextManager {
    private static instance: ContextManager;
    
    private lore: IStaticLore = {
        worldName: "Aetheria",
        factions: ["Order of Light", "Void Walkers"],
        importantLocations: ["The Crystal Spire", "Shadow Fen"],
        baseRules: "Magic is fueled by emotion. The Void is consuming the edges of reality."
    };

    // 在這裡設定 NPC 的個性人設
    private npcProfiles: Record<string, string> = {
        "Elder Kael": "長老凱爾：光之教團的守護者。說話風格：古板、慈祥但威嚴，喜歡用比喻，且非常擔憂虛空的威脅。"
    };

    private state: IWorldState = {
        currentLocation: "The Crystal Spire",
        activeNpcs: ["Elder Kael"],
        bossStatus: {},
        globalFlags: {}
    };

    private history: ISlidingHistory = {
        recentTurns: [],
        summary: ""
    };

    public static getInstance(): ContextManager {
        if (!ContextManager.instance) {
            ContextManager.instance = new ContextManager();
        }
        return ContextManager.instance;
    }

    public getSnapshot(): IContextSnapshot {
        // 將活躍 NPC 的人設拼接到規則中傳給 AI
        const activeProfiles = this.state.activeNpcs
            .map(name => this.npcProfiles[name] || "")
            .filter(p => p !== "")
            .join("\n");

        return {
            lore: { 
                ...this.lore,
                baseRules: `${this.lore.baseRules}\n\n[CURRENT NPC PERSONALITIES]\n${activeProfiles}`
            },
            state: { ...this.state },
            history: { ...this.history }
        };
    }

    public addHistory(role: 'user' | 'assistant', content: string) {
        this.history.recentTurns.push({ role, content });
        // 限制最近回合數 (Sliding Window)
        if (this.history.recentTurns.length > 10) {
            this.history.recentTurns.shift();
        }
    }

    public updateState(newState: Partial<IWorldState>) {
        this.state = { ...this.state, ...newState };
    }

    public clear() {
        console.log('[Weaver] Clearing destiny threads (Context Reset)');
        this.history = { recentTurns: [], summary: "" };
    }
}
