import React, { useState } from 'react';
import { User, Shield, Zap, Brain, Heart, Star, ChevronUp, ChevronDown, Save } from 'lucide-react';
import { ICharacterState } from '@shared/types/character.types';
import { GAME_CONFIG } from '@shared/constants/game.config';

interface CharacterPanelProps {
    character: ICharacterState;
    onSave: (updatedCharacter: ICharacterState) => void;
    onClose: () => void;
}

const CharacterPanel: React.FC<CharacterPanelProps> = ({ character, onSave, onClose }) => {
    const [tempStats, setTempStats] = useState<ICharacterState>({ ...character });
    const [availablePoints, setAvailablePoints] = useState(5); // 假設有 5 點可分配

    const handleAdjust = (attr: keyof ICharacterState, delta: number) => {
        const currentValue = tempStats[attr] as number;
        if (delta > 0 && availablePoints <= 0) return;
        if (delta < 0 && currentValue <= 8) return; // 屬性最低為 8

        setTempStats({
            ...tempStats,
            [attr]: currentValue + delta
        });
        setAvailablePoints(prev => prev - delta);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-40 pointer-events-auto p-4">
            <div className="bg-matrix-dark border-2 border-matrix-green/40 rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(0,255,65,0.2)]">
                {/* Header */}
                <div className="bg-matrix-green/10 border-b border-matrix-green/20 p-6 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-matrix-green/20 rounded-2xl text-matrix-green">
                            <User size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-matrix-green tracking-tighter uppercase">Character Profile</h2>
                            <p className="text-xs text-matrix-green/60 font-mono italic">ID: {tempStats.id.substring(0, 8)}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost text-matrix-green">✕</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
                    {/* 左側：基礎資訊與屬性 */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-end border-b border-matrix-green/10 pb-2">
                            <span className="text-sm font-bold text-matrix-green/80 uppercase">Attributes</span>
                            <span className="text-xs font-mono text-matrix-green">Points Available: <span className="text-xl font-black">{availablePoints}</span></span>
                        </div>

                        <div className="grid gap-3">
                            {GAME_CONFIG.ATTRIBUTES.map(attr => (
                                <div key={attr} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5 hover:border-matrix-green/20 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 flex items-center justify-center bg-matrix-green/10 rounded-lg text-matrix-green">
                                            {attr === 'strength' && <Shield size={16} />}
                                            {attr === 'intelligence' && <Brain size={16} />}
                                            {attr === 'dexterity' && <Zap size={16} />}
                                            {attr === 'constitution' && <Heart size={16} />}
                                            {attr === 'wisdom' && <Star size={16} />}
                                            {attr === 'charisma' && <User size={16} />}
                                        </div>
                                        <span className="text-sm font-bold uppercase tracking-wider opacity-80">{attr}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={() => handleAdjust(attr as any, -1)}
                                            className="btn btn-xs btn-square bg-white/5 border-matrix-green/20 text-matrix-green hover:bg-matrix-green/20"
                                        >
                                            <ChevronDown size={14} />
                                        </button>
                                        <span className="text-xl font-black text-matrix-green w-6 text-center">{tempStats[attr as keyof ICharacterState] as number}</span>
                                        <button 
                                            onClick={() => handleAdjust(attr as any, 1)}
                                            className="btn btn-xs btn-square bg-white/5 border-matrix-green/20 text-matrix-green hover:bg-matrix-green/20"
                                        >
                                            <ChevronUp size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 右側：衍生數值與預覽 */}
                    <div className="space-y-6">
                        <div className="border-b border-matrix-green/10 pb-2">
                            <span className="text-sm font-bold text-matrix-green/80 uppercase">Derived Stats</span>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-matrix-green/5 p-4 rounded-2xl border border-matrix-green/10">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs opacity-60 uppercase font-bold text-red-400">Combat Power</span>
                                    <span className="text-lg font-black text-red-400">{tempStats.strength * 2 + tempStats.dexterity}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs opacity-60 uppercase font-bold text-blue-400">Mana Capacity</span>
                                    <span className="text-lg font-black text-blue-400">{tempStats.intelligence * 10}</span>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl border border-white/5 space-y-3">
                                <h4 className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em]">Weaver's Observation</h4>
                                <p className="text-xs leading-relaxed italic opacity-70">
                                    {tempStats.intelligence > 15 ? 
                                        "\"Your mind sharpens the very fabric of reality. The Weaver notices your analytical gaze.\"" : 
                                        "\"Your presence in this world is still taking shape. Each point allocated weaves a new fate.\""}
                                </p>
                            </div>
                        </div>

                        <div className="pt-4 flex flex-col gap-3">
                            <button 
                                onClick={() => onSave(tempStats)}
                                className="btn bg-matrix-green hover:bg-matrix-green/80 text-black border-none font-black uppercase tracking-widest rounded-xl"
                            >
                                <Save size={18} className="mr-2" /> Commit Changes
                            </button>
                            <p className="text-[10px] text-center opacity-40 uppercase tracking-tighter">Changes will be permanent once saved to the matrix</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CharacterPanel;
