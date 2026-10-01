import React from 'react';

interface ExpeditionTRPGModeProps {
    showHistory: boolean;
    setShowHistory: (v: boolean) => void;
    narrativeLog: {id: string, type: 'system'|'narration'|'npc'|'player', speaker?: string, text: string}[];
    dynamicActions: { id: string, label: string, icon: string, type: string, color: string }[];
    isAILoading: boolean;
    freeActionText: string;
    setFreeActionText: (v: string) => void;
    showInputMode: boolean;
    setShowInputMode: (v: boolean) => void;
    handleNarrationAction: (action: any) => void;
    handleFreeActionSubmit: (e: React.FormEvent) => void;
}

export const ExpeditionTRPGMode: React.FC<ExpeditionTRPGModeProps> = ({
    showHistory, setShowHistory,
    narrativeLog, dynamicActions, isAILoading,
    freeActionText, setFreeActionText,
    showInputMode, setShowInputMode,
    handleNarrationAction, handleFreeActionSubmit
}) => {
    return (
        <div className="flex-1 flex flex-col h-full min-h-0 relative bg-[var(--surface-color)] rounded-xl border border-[var(--border-color)] overflow-hidden">
            {/* Header: toggle history */}
            <div className="shrink-0 p-3 border-b border-[var(--border-color)] bg-[var(--background-color)] flex justify-between items-center z-10 shadow-sm">
                <span className="text-xs font-bold text-[var(--secondary-text-color)] tracking-wider">
                    <i className="bi bi-geo-alt-fill mr-1 text-[var(--primary-color)]"></i> 
                    探索進度
                </span>
                <button 
                    onClick={() => setShowHistory(!showHistory)}
                    className={`rpg-btn px-3 py-1 text-xs border ${showHistory ? 'border-[var(--primary-color)] text-[var(--primary-color)] bg-[rgba(79,195,247,0.1)]' : 'border-[var(--border-color)] text-[var(--secondary-text-color)]'}`}
                >
                    <i className={`bi ${showHistory ? 'bi-chat-square-text-fill' : 'bi-clock-history'} mr-1`}></i> 
                    {showHistory ? "返回當前場景" : "查看歷史文本"}
                </button>
            </div>

            {/* Content Area */}
            {showHistory ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-6 pb-4">
                    {narrativeLog.map(msg => (
                        <div key={msg.id} className={`flex w-full animate-fadeIn ${msg.type === 'player' ? 'justify-end' : 'justify-start'} mb-6`}>
                            {msg.type === 'system' && (
                                <div className="text-xs text-[var(--warning-color)] border border-[var(--warning-color)] bg-[rgba(255,167,38,0.1)] px-3 py-1.5 rounded tracking-wider shadow-[0_0_10px_rgba(255,167,38,0.1)]">
                                    [系統] {msg.text}
                                </div>
                            )}
                            {msg.type === 'narration' && (
                                <div className="text-sm text-[var(--secondary-text-color)] italic max-w-[85%] leading-relaxed border-l-2 border-[var(--primary-color)] pl-4">
                                    {msg.text}
                                </div>
                            )}
                            {msg.type === 'npc' && (
                                <div className="bg-[var(--surface-color)] border border-[var(--border-color)] p-4 rounded-xl max-w-[85%] shadow-md relative">
                                    <div className="absolute -left-2 top-4 w-4 h-4 bg-[var(--surface-color)] border-l border-b border-[var(--border-color)] rotate-45"></div>
                                    <span className="text-xs font-bold text-[var(--primary-color)] mb-2 block tracking-widest">{msg.speaker}</span>
                                    <p className="text-sm text-[var(--text-color)] leading-relaxed">{msg.text}</p>
                                </div>
                            )}
                            {msg.type === 'player' && (
                                <div className="bg-[rgba(79,195,247,0.15)] border border-[var(--primary-color)] text-[var(--primary-color)] p-3 rounded-xl max-w-[85%] shadow-[0_0_15px_rgba(79,195,247,0.1)]">
                                    <p className="text-sm font-bold">{msg.text}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex flex-col h-full overflow-hidden animate-fadeIn">
                    {(() => {
                        const latestSceneMsg = [...narrativeLog].reverse().find(m => m.type !== 'player');
                        if (!latestSceneMsg) return null;
                        return (
                            <>
                                {/* 上半部：文本與選項 (自動填滿剩餘高度) */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-[rgba(0,0,0,0.1)]">
                                    {/* 背景裝飾 */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.1)] to-transparent pointer-events-none"></div>
                                    
                                    <div className="min-h-full flex flex-col items-center justify-center p-6 md:p-8">
                                        <div className="max-w-2xl w-full z-10 my-auto flex flex-col gap-8">
                                            
                                            {/* 文本區塊 */}
                                            <div>
                                                <h4 className="text-[var(--primary-color)] font-bold mb-6 tracking-widest text-sm flex items-center justify-center gap-3 border-b border-[var(--border-color)] pb-4">
                                                    <i className={`${latestSceneMsg.type === 'npc' ? "bi bi-person-circle" : "bi bi-book"} text-lg`}></i> 
                                                    {latestSceneMsg.speaker || (latestSceneMsg.type === 'system' ? '系統' : '地下城主')}
                                                </h4>
                                                <p className="text-lg md:text-xl leading-relaxed text-[var(--text-color)] text-center font-serif drop-shadow-md">
                                                    {latestSceneMsg.text}
                                                </p>
                                            </div>

                                            {/* 建議行動區塊 (文字列表呈現) */}
                                            {dynamicActions.length > 0 && (
                                                <div className="w-full mt-4 flex flex-col gap-3 pb-8 border-t border-[rgba(255,255,255,0.05)] pt-6">
                                                    {dynamicActions.map((action, index) => (
                                                        <div 
                                                            key={action.id} 
                                                            className="flex gap-4 items-start text-lg md:text-xl font-serif leading-relaxed text-[var(--text-color)] drop-shadow-md cursor-pointer hover:opacity-80 transition-opacity"
                                                            onClick={() => handleNarrationAction(action)}
                                                        >
                                                            <span className="font-bold shrink-0 mt-0.5" style={{ color: action.color }}>[{index + 1}]</span>
                                                            <span>{action.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 下半部：選項按鈕區 / 自由輸入框 (固定在底部) */}
                                <div className="shrink-0 border-t border-[var(--border-color)] bg-[var(--surface-color)] p-3 md:p-4 z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                                    <div className="max-w-4xl mx-auto">
                                        {showInputMode ? (
                                            <form onSubmit={handleFreeActionSubmit} className="relative flex items-center">
                                                <input 
                                                    type="text" 
                                                    value={freeActionText}
                                                    onChange={(e) => setFreeActionText(e.target.value)}
                                                    onBlur={() => {
                                                        if (!freeActionText.trim()) {
                                                            setShowInputMode(false);
                                                        }
                                                    }}
                                                    autoFocus
                                                    disabled={isAILoading}
                                                    placeholder={isAILoading ? "等待 DM 處理中..." : "輸入你想做的事情..."}
                                                    className="w-full bg-[var(--background-color)] border border-[var(--border-color)] rounded-lg pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-[var(--primary-color)] transition-colors text-[var(--text-color)] placeholder:text-[var(--secondary-text-color)] disabled:opacity-50"
                                                />
                                                <button 
                                                    type={freeActionText.trim() ? "submit" : "button"}
                                                    disabled={isAILoading}
                                                    onClick={(e) => {
                                                        if (!freeActionText.trim()) {
                                                            e.preventDefault();
                                                            setShowInputMode(false);
                                                        }
                                                    }}
                                                    className={`absolute right-2 w-8 h-8 flex items-center justify-center rounded-md transition-colors disabled:opacity-50 disabled:hover:bg-transparent ${freeActionText.trim() ? 'text-[var(--primary-color)] hover:bg-[rgba(79,195,247,0.1)]' : 'text-[var(--secondary-text-color)] hover:bg-[rgba(255,255,255,0.05)]'}`}
                                                    title={freeActionText.trim() ? "發送行動" : "返回選項"}
                                                >
                                                    <i className={`bi ${freeActionText.trim() ? 'bi-send-fill' : 'bi-x-lg'}`}></i>
                                                </button>
                                            </form>
                                        ) : (
                                            <div className="flex gap-3 justify-center items-center h-12">
                                                {dynamicActions.map((action, index) => (
                                                    <button
                                                        key={action.id}
                                                        disabled={isAILoading}
                                                        onClick={() => handleNarrationAction(action)}
                                                        className="w-12 h-12 flex items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--background-color)] hover:bg-[rgba(255,255,255,0.05)] transition-colors disabled:opacity-50 text-lg font-bold font-serif"
                                                        style={{ color: action.color, borderColor: action.color }}
                                                        title={action.label}
                                                    >
                                                        {index + 1}
                                                    </button>
                                                ))}
                                                <button
                                                    disabled={isAILoading}
                                                    onClick={() => setShowInputMode(true)}
                                                    className="h-12 px-6 flex items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--background-color)] hover:bg-[rgba(255,255,255,0.05)] transition-colors disabled:opacity-50 text-sm font-bold tracking-widest text-[var(--secondary-text-color)] hover:text-[var(--text-color)]"
                                                >
                                                    其他行動
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        );
                    })()}
                </div>
            )}
        </div>
    );
};
