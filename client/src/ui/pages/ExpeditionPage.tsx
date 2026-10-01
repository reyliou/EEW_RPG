import React, { useState } from 'react';
import { IExpedition } from '@shared/types/expedition.types';
import { ICharacterState } from '@shared/types/character.types';
import { BackButton } from '../common/BackButton';
import { ExpeditionEventModal, ITRPGEvent } from '../features/ExpeditionEventModal';
import { ExpeditionTRPGMode } from '../components/expedition/ExpeditionTRPGMode';
import { ExpeditionDungeonMode } from '../components/expedition/ExpeditionDungeonMode';
import { useSocket } from '../../hooks/useSocket';
import { SOCKET_EVENTS } from '@shared/constants/events';

interface ExpeditionPageProps {
    character: ICharacterState;
    activeExpedition: IExpedition | null;
    onMove: (q: number, r: number) => void;
    onExtract: () => void;
    onEndExpedition: (summary: any) => void;
    embedded?: boolean;
}

export const ExpeditionPage: React.FC<ExpeditionPageProps> = ({ 
    character, 
    activeExpedition, 
    onMove,
    onExtract,
    onEndExpedition,
    embedded = false
}) => {
    const [activeEvent, setActiveEvent] = useState<ITRPGEvent | null>(null);
    const [isDungeon, setIsDungeon] = useState(false);
    const [freeActionText, setFreeActionText] = useState("");
    const [isAILoading, setIsAILoading] = useState(false);
    const isAILoadingRef = React.useRef(false);

    const { socket } = useSocket();

    // Dynamic Actions State (To be populated by AI later)
    const [dynamicActions, setDynamicActions] = useState<any[]>([]);

    // Narrative Log State for TRPG Expedition
    const [narrativeLog, setNarrativeLog] = useState<{id: string, type: 'system'|'narration'|'npc'|'player', speaker?: string, text: string}[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [showInputMode, setShowInputMode] = useState(false);

    // Initial Scene Generation
    React.useEffect(() => {
        if (!socket || isAILoadingRef.current || narrativeLog.length > 0) return;
        
        setIsAILoading(true);
        isAILoadingRef.current = true;
        setNarrativeLog([
            { id: Date.now().toString(), type: 'system', text: '系統已載入。正在等待地下城主為您構建初始場景...' }
        ]);
        
        socket.emit(SOCKET_EVENTS.TRPG_ACTION_REQUEST, {
            action: "玩家剛剛踏上遠征，請描述他眼前的初始場景，並提供三個可以立刻執行的探索選項。",
            contextSnapshot: {
                state: {
                    globalFlags: { character }
                }
            }
        });
    }, [socket, narrativeLog.length, character]);

    React.useEffect(() => {
        if (!socket) return;

        const handleAIResponse = (data: any) => {
            setIsAILoading(false);
            isAILoadingRef.current = false;
            
            if (data.narration) {
                let speaker = "地下城主";
                let text = data.narration;
                let type: 'narration' | 'npc' = 'narration';
                
                // 嘗試解析說話者 (例如 "神秘老人：你終於來了" 或 "守衛: 停下來！")
                const match = data.narration.match(/^([^:：]{1,15})[:：]\s*(.*)/);
                if (match && !match[1].includes('\n')) {
                    speaker = match[1].trim();
                    text = match[2].trim();
                    type = 'npc';
                }

                setNarrativeLog(prev => [...prev, {
                    id: Date.now().toString(),
                    type,
                    speaker,
                    text
                }]);
            }
            if (data.actions && Array.isArray(data.actions)) {
                setDynamicActions(data.actions);
            }
        };

        socket.on(SOCKET_EVENTS.TRPG_ACTION_RESPONSE, handleAIResponse);

        return () => {
            socket.off(SOCKET_EVENTS.TRPG_ACTION_RESPONSE, handleAIResponse);
        };
    }, [socket]);

    const handleNarrationAction = (action: { id: string, label: string, icon: string, type: string, color: string }) => {
        if (isAILoadingRef.current || isAILoading) return;
        isAILoadingRef.current = true;
        setIsAILoading(true);

        const newLogs = [...narrativeLog, { id: Date.now().toString(), type: 'player' as const, text: `> 行動：${action.label}` }];
        setNarrativeLog(newLogs);
        
        if (action.type === 'dungeon') {
            setNarrativeLog(prev => [...prev, { id: (Date.now()+1).toString(), type: 'system', text: '發現古代遺跡，載入地形數據...' }]);
            setTimeout(() => setIsDungeon(true), 1500);
            return;
        }

        // 發送請求給後端 AI
        if (socket) {
            socket.emit(SOCKET_EVENTS.TRPG_ACTION_REQUEST, {
                action: action.label,
                contextSnapshot: {
                    state: {
                        globalFlags: { character }
                    }
                }
            });
        }
    };

    const handleFreeActionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!freeActionText.trim()) return;

        handleNarrationAction({
            id: `free_${Date.now()}`,
            label: freeActionText,
            icon: 'bi-chat-text',
            type: 'narrative',
            color: 'var(--primary-color)'
        });
        setFreeActionText("");
    };

    if (!activeExpedition) {
        return <div className="p-8 text-center">正在初始化荒野區域...</div>;
    }

    const handleMove = (q: number, r: number) => {
        onMove(q, r);

        // Check for specific events based on coordinate, or random event
        const key = `${q}_${r}`;
        const mapEvent = activeExpedition.eventMap[key];

        if (mapEvent) {
            // Simplified: Generate a mock event based on the event string
            triggerMockEvent(mapEvent);
        } else {
            // Random chance for random encounter (e.g. 20% chance)
            if (Math.random() < 0.2) {
                triggerMockEvent('random_encounter');
            }
        }
    };

    const triggerMockEvent = (type: string) => {
        // Just a simple event pool for demonstration
        const events: ITRPGEvent[] = [
            {
                id: 'evt_chest_01',
                title: '古老的保險箱',
                description: '你在廢墟角落發現了一個被藤蔓纏繞的金屬保險箱。雖然外表鏽跡斑斑，但鎖頭似乎還能運作。你要怎麼處理它？',
                choices: [
                    {
                        text: '用蠻力砸開 (力量檢定)',
                        statRequired: 'strength',
                        dc: 12,
                        onSuccess: () => ({ log: '你一鎚砸爛了鎖頭！裡面裝著一些古代遺留物。', loot: ['古代錢幣', '微型能量電池'] }),
                        onFailure: () => ({ log: '保險箱異常堅固，你不僅沒砸開，還扭傷了手腕。', hpChange: -5 })
                    },
                    {
                        text: '嘗試破解密碼鎖 (智力檢定)',
                        statRequired: 'intelligence',
                        dc: 14,
                        onSuccess: () => ({ log: '你成功推算出了密碼組合，鎖頭「喀」一聲彈開。', loot: ['無損的古代兵器'] }),
                        onFailure: () => ({ log: '你輸入了錯誤的密碼，觸發了防盜電擊陷阱！', hpChange: -10 })
                    },
                    {
                        text: '直接離開',
                        onSuccess: () => ({ log: '你決定不冒險，繼續前進。' }),
                        onFailure: () => ({ log: '' })
                    }
                ]
            },
            {
                id: 'evt_trap_01',
                title: '致命的地雷陣',
                description: '當你踏出下一步時，腳下的土壤傳來了金屬碰撞的聲音。你意識到自己走進了一片未清除的地雷區！',
                choices: [
                    {
                        text: '小心翼翼地拆除引信 (敏捷檢定)',
                        statRequired: 'dexterity',
                        dc: 15,
                        onSuccess: () => ({ log: '你屏住呼吸，成功拆除了腳下的地雷。', loot: ['高爆破片'] }),
                        onFailure: () => ({ log: '你的手微微發抖，不小心觸發了引信！巨大的爆炸吞噬了你。', hpChange: -20 })
                    },
                    {
                        text: '相信直覺往前衝 (幸運檢定)',
                        statRequired: 'luck',
                        dc: 12,
                        onSuccess: () => ({ log: '不可思議地，你踩的全是啞彈，毫髮無傷地跑出了雷區。' }),
                        onFailure: () => ({ log: '你的運氣不太好，被一顆邊緣的地雷炸傷了。', hpChange: -15 })
                    }
                ]
            }
        ];
        
        setActiveEvent(events[Math.floor(Math.random() * events.length)]);
    };

    const handleEventComplete = (log: string, loot?: string[], hpChange?: number) => {
        // Here you would normally dispatch an action to update global state (HP, inventory, log)
        console.log(`[Event Complete] ${log}`, loot, hpChange);
        setActiveEvent(null);
    };

    return (
        <div className={`animate-fadeIn flex flex-col h-full ${embedded ? "space-y-6" : "space-y-6 mt-4"}`}>
            <BackButton 
                onClick={onExtract} 
                label="撤退回營地" 
                className={embedded ? "!relative !top-0 !left-0 mb-2 inline-flex w-fit bg-[var(--surface-color)] shrink-0" : "shrink-0"} 
            />

            {!isDungeon ? (
                <ExpeditionTRPGMode 
                    showHistory={showHistory}
                    setShowHistory={setShowHistory}
                    narrativeLog={narrativeLog}
                    dynamicActions={dynamicActions}
                    isAILoading={isAILoading}
                    freeActionText={freeActionText}
                    setFreeActionText={setFreeActionText}
                    showInputMode={showInputMode}
                    setShowInputMode={setShowInputMode}
                    handleNarrationAction={handleNarrationAction}
                    handleFreeActionSubmit={handleFreeActionSubmit}
                />
            ) : (
                <ExpeditionDungeonMode 
                    activeExpedition={activeExpedition}
                    handleMove={handleMove}
                />
            )}

            {/* Event Modal Overlay */}
            {activeEvent && (
                <ExpeditionEventModal 
                    event={activeEvent} 
                    character={character}
                    onComplete={handleEventComplete}
                />
            )}
        </div>
    );
};
