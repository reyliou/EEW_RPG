import React, { useEffect, useState } from 'react';
import { supabase } from '../../core/services/supabase';
import { ICharacterState } from '@shared/types/character.types';
import { PageContainer } from '../common/PageContainer';
import { CharacterCreationPage } from './CharacterCreationPage';
import { BackButton } from '../common/BackButton';

interface CharacterLobbyPageProps {
    onCharacterSelected: (character: ICharacterState) => void;
    onBack: () => void;
}

export const CharacterLobbyPage: React.FC<CharacterLobbyPageProps> = ({ onCharacterSelected, onBack }) => {
    const [characters, setCharacters] = useState<ICharacterState[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [showCreation, setShowCreation] = useState(false);

    const fetchCharacters = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('未登入');

            const { data, error } = await supabase
                .from('characters')
                .select('*')
                .eq('player_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // 轉換資料庫格式為 ICharacterState (這裡簡化對應)
            const mappedChars: ICharacterState[] = (data || []).map(row => ({
                id: row.id,
                name: row.name,
                job: row.job || '無職',
                strength: row.strength,
                dexterity: row.dexterity,
                intelligence: row.intelligence,
                constitution: row.constitution,
                charisma: row.charisma,
                wisdom: row.wisdom,
                maxHp: row.max_hp,
                currentHp: row.current_hp,
                luck: row.luck || 10,
                level: row.level,
                experience: row.experience,
                statusEffects: row.status_effects || []
            }));

            setCharacters(mappedChars);
        } catch (err: any) {
            console.error("讀取角色失敗:", err);
            setErrorMsg(err.message || '讀取角色失敗');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!showCreation) {
            fetchCharacters();
        }
    }, [showCreation]);

    if (showCreation) {
        return (
            <CharacterCreationPage 
                onCancel={() => setShowCreation(false)} 
                onCharacterCreated={() => setShowCreation(false)} 
            />
        );
    }

    return (
        <PageContainer className="max-w-4xl mx-auto pt-12">
            <BackButton onClick={onBack} label="返回主畫面" />
            <div className="flex justify-between items-center mb-8 mt-4">
                <h1 className="text-3xl font-bold text-[var(--text-color)] tracking-widest">
                    <i className="bi bi-people-fill mr-3 text-[var(--primary-color)]"></i>角色大廳
                </h1>
            </div>

            {errorMsg && (
                <div className="mb-6 p-3 bg-red-900/50 text-red-200 border border-red-500/50 rounded">
                    {errorMsg}
                </div>
            )}

            {loading ? (
                <div className="text-center py-20 text-[var(--secondary-text-color)]">
                    <span className="loading loading-spinner loading-lg mb-4 text-[var(--primary-color)]"></span>
                    <p>正在翻閱古老的羊皮紙檔案...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* 新增角色卡片 */}
                    <div 
                        className="border-2 border-dashed border-[var(--border-color)] rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[var(--primary-color)] hover:bg-[rgba(79,195,247,0.05)] transition-all min-h-[250px] group"
                        onClick={() => setShowCreation(true)}
                    >
                        <i className="bi bi-plus-circle text-4xl text-[var(--secondary-text-color)] group-hover:text-[var(--primary-color)] mb-4 transition-colors"></i>
                        <h3 className="text-lg font-bold text-[var(--secondary-text-color)] group-hover:text-[var(--text-color)] transition-colors">喚醒新靈魂</h3>
                    </div>

                    {/* 已有角色列表 */}
                    {characters.map(char => (
                        <div 
                            key={char.id} 
                            className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl p-6 cursor-pointer hover:border-[var(--primary-color)] hover:shadow-[0_0_15px_rgba(79,195,247,0.3)] transition-all relative overflow-hidden group"
                            onClick={() => onCharacterSelected(char)}
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-[var(--primary-color)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-[var(--text-color)] tracking-wider">{char.name}</h3>
                                    <span className="inline-block px-2 py-1 bg-[rgba(79,195,247,0.1)] text-[var(--primary-color)] border border-[var(--primary-color)] text-xs rounded mt-2">
                                        Lv.{char.level} {char.job}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="space-y-2 mt-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[var(--secondary-text-color)]">生命值</span>
                                    <span className="text-[var(--success-color)]">{char.currentHp} / {char.maxHp}</span>
                                </div>
                                <div className="w-full bg-[var(--background-color)] border border-[var(--border-color)] rounded-full h-1.5">
                                    <div className="bg-[var(--success-color)] h-full rounded-full" style={{ width: `${(char.currentHp/char.maxHp)*100}%` }}></div>
                                </div>
                            </div>
                            
                            <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex justify-between text-xs text-[var(--secondary-text-color)]">
                                <span><i className="bi bi-sword"></i> {char.strength}</span>
                                <span><i className="bi bi-wind"></i> {char.dexterity}</span>
                                <span><i className="bi bi-book"></i> {char.intelligence}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </PageContainer>
    );
};
