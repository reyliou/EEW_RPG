import React from 'react';
import { supabase } from './core/services/supabase';

import { SettingsPage } from './ui/pages/SettingsPage';
import { LoginPage } from './ui/pages/LoginPage';
import { RegisterPage } from './ui/pages/RegisterPage';
import { ForgotPasswordPage } from './ui/pages/ForgotPasswordPage';
import { UpdatePasswordPage } from './ui/pages/UpdatePasswordPage';
import { CharacterLobbyPage } from './ui/pages/CharacterLobbyPage';
import { ThreeColumnGameHub } from './ui/pages/ThreeColumnGameHub';
import { PageContainer } from './ui/common/PageContainer';
import { ExpeditionPage } from './ui/pages/ExpeditionPage';
import { InventoryPage } from './ui/pages/InventoryPage';
import { IExpedition } from '@shared/types/expedition.types';

import { MapGenerator } from './core/services/MapGenerator';
import { useGameStore } from './store/useGameStore';

const App: React.FC = () => {
    // ... (keep state and hooks)
    const [isLoading, setIsLoading] = React.useState(true);
    const [isFadeOut, setIsFadeOut] = React.useState(false);
    const [currentPage, setCurrentPage] = React.useState<'login' | 'register' | 'forgotPassword' | 'updatePassword' | 'lobby' | 'menu' | 'main' | 'work' | 'inventory' | 'settings' | 'expedition' | 'combatTest'>('login');
    const [navigationHistory, setNavigationHistory] = React.useState<string[]>([]);
    const theme = useGameStore(state => state.theme);
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);

    // 監聽 Supabase 登入狀態
    React.useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) setIsLoggedIn(true);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                setIsLoading(false);
                setCurrentPage('updatePassword');
            } else if (session) {
                setIsLoggedIn(true);
            } else {
                setIsLoggedIn(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // 遠征狀態
    const activeExpedition = useGameStore(state => state.activeExpedition);
    const setActiveExpedition = useGameStore(state => state.setActiveExpedition);

    // 導航邏輯：記住歷史
    // 導航邏輯：記住歷史
    const navigateTo = (page: typeof currentPage) => {
        setNavigationHistory(prev => [...prev, currentPage]);
        setCurrentPage(page);
    };

    // 返回邏輯：回到上一頁
    const goBack = () => {
        if (navigationHistory.length === 0) {
            setCurrentPage('lobby'); // 如果沒歷史，預設回大廳
            return;
        }
        const prevPage = navigationHistory[navigationHistory.length - 1] as typeof currentPage;
        setNavigationHistory(prev => prev.slice(0, -1));
        setCurrentPage(prevPage);
    };

    // 導航邏輯：記住歷史
    const character = useGameStore(state => state.character);
    const setCharacter = useGameStore(state => state.setCharacter);

    const handleStartExpedition = () => {
        if (!character) return;
        // --- 簡易地圖生成演算法 (使用 Perlin Noise 程序化生成) ---
        const mapGen = new MapGenerator();
        const generatedTileMap = mapGen.generateHexMap(8);
        const mockExpedition: IExpedition = {
            id: `exp-${Date.now()}`,
            startTime: Date.now(),
            status: 'active',
            leaderId: character.id,
            partyMembers: [],
            companions: [
                { id: 'npc-1', name: '艾莉亞', job: '弓箭手', currentHp: 80, maxHp: 80, level: 1, experience: 0, strength: 10, dexterity: 15, intelligence: 10, constitution: 8, charisma: 12, wisdom: 10, luck: 10, statusEffects: [], ownerId: character.id, rarity: 'rare', isPermanent: false }
            ],
            currentMapId: 'wilderness-1',
            currentPosition: { q: 0, r: 0 },
            loot: ['生鏽的鐵劍', '乾糧'],
            tileMap: generatedTileMap,
            eventMap: {
                // 事件點依然保留，但底圖不再強制生成建築
                '2_1': 'combat-1',
                '-1_3': 'treasure-1',
                '0_4': 'boss-1'
            },
            eventHistory: ['抵達荒野邊境']
        };
        setActiveExpedition(mockExpedition);
        navigateTo('expedition');
    };

    const handleMoveExpedition = (q: number, r: number) => {
        if (!activeExpedition) return;
        
        // 簡單的移動距離驗證 (只能移動到相鄰格子，距離為1)
        const dq = q - activeExpedition.currentPosition.q;
        const dr = r - activeExpedition.currentPosition.r;
        const dist = (Math.abs(dq) + Math.abs(dr) + Math.abs(dq + dr)) / 2;
        
        if (dist > 1) {
            console.warn("太遠了，無法直接移動");
            return;
        }

        if (activeExpedition) {
            setActiveExpedition({
                ...activeExpedition,
                currentPosition: { q, r }
            });
        }
    };

    const handleEndExpedition = (summary: any) => {
        // 結算邏輯
        setActiveExpedition(null);
        navigateTo('main');
    };

    React.useEffect(() => {
        // 初始設定主題 (由 zustand store 管理時，這裡可視情況保留或移除，由於 store 初始未觸發 setAttribute，這裡保留)
        document.body.setAttribute('data-theme', theme);
    }, [theme]);

    const handleDismissSplash = () => {
        setIsFadeOut(true);
        setTimeout(() => {
            setIsFadeOut(false);
            setIsLoading(false);
            setCurrentPage(isLoggedIn ? 'lobby' : 'login');
        }, 800);
    };

    const handleStartGame = () => {
        // Obsolete (since menu is removed)
        setCurrentPage('lobby');
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setNavigationHistory([]);
        setCurrentPage('login');
    };

    // 1. 載入畫面 (Loading Screen)
    if (isLoading) {
        return (
            <div 
                className={`fixed inset-0 z-[10002] flex items-center justify-center cursor-pointer transition-colors duration-500 ${isFadeOut ? 'fade-out' : ''}`}
                style={{ backgroundColor: 'var(--background-color)' }}
                onClick={handleDismissSplash}
            >
                <div className="text-center">
                    <i className="bi bi-headphones text-[var(--primary-color)] text-[80px]"></i>
                    <p className="mt-5 text-[var(--secondary-text-color)] text-xl">配戴耳機玩效果更佳</p>
                    <p className="blinking-text text-[var(--primary-color)]">點擊螢幕開始</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 md:p-8 transition-colors duration-500" style={{ backgroundColor: 'var(--background-color)' }}>
            <div className="w-full max-w-[800px] space-y-6">
                
                {/* 1.5 認證頁面 (Auth Pages) */}
                {currentPage === 'login' && (
                    <LoginPage 
                        onLogin={() => setCurrentPage('lobby')} 
                        onGoToRegister={() => setCurrentPage('register')} 
                        onGoToForgotPassword={() => setCurrentPage('forgotPassword')}
                    />
                )}
                {currentPage === 'register' && (
                    <RegisterPage 
                        onRegisterSuccess={() => setCurrentPage('lobby')} 
                        onBackToLogin={() => setCurrentPage('login')} 
                    />
                )}
                {currentPage === 'forgotPassword' && (
                    <ForgotPasswordPage 
                        onBackToLogin={() => setCurrentPage('login')} 
                    />
                )}
                {currentPage === 'updatePassword' && (
                    <UpdatePasswordPage 
                        onPasswordUpdated={() => setCurrentPage('lobby')} 
                    />
                )}

                {/* 1.8 角色大廳 (Character Lobby) */}
                {currentPage === 'lobby' && (
                    <CharacterLobbyPage 
                        onCharacterSelected={(char) => {
                            setCharacter(char);
                            setCurrentPage('main');
                        }}
                        onBack={handleLogout}
                    />
                )}

                {/* 3. 遊戲設置頁面 (Settings Page) */}
                {currentPage === 'settings' && (
                    <SettingsPage 
                        onBack={goBack}
                    />
                )}

                {/* 4. 遊戲主畫面 */}
                {currentPage === 'main' && character && (
                    <ThreeColumnGameHub 
                        onNavigate={(page) => {
                            if (page === 'work') handleStartExpedition();
                            else navigateTo(page);
                        }} 
                    />
                )}

                {/* 5. 遠征畫面 (荒野區域) */}
                {currentPage === 'expedition' && character && (
                    <PageContainer>
                        <ExpeditionPage 
                            character={character}
                            activeExpedition={activeExpedition}
                            onMove={handleMoveExpedition}
                            onExtract={() => handleEndExpedition({})}
                            onEndExpedition={handleEndExpedition}
                        />
                    </PageContainer>
                )}

                {/* 5. 局外系統：行囊與裝備 (Inventory & Gear) */}
                {currentPage === 'inventory' && character && (
                    <InventoryPage 
                        character={character}
                        onBack={() => navigateTo('main')}
                    />
                )}

                {['work'].includes(currentPage) && (
                    <div className="w-full max-w-[800px] space-y-6 mx-auto">
                        <div className="rpg-status-panel flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <span className="text-[var(--primary-color)] font-bold text-lg"><i className="bi bi-person-circle mr-2"></i>旅者：{character?.name}</span>
                                <span className="ml-4 opacity-50 text-sm">LEVEL {character?.level}</span>
                            </div>
                            <div className="flex gap-6 items-center">
                                <span className="text-[var(--success-color)] font-mono"><i className="bi bi-heart-fill mr-2"></i>HP: {character?.currentHp}/{character?.maxHp}</span>
                                <span className="text-[var(--warning-color)] font-mono"><i className="bi bi-star-fill mr-2"></i>EXP: {character?.experience}</span>
                            </div>
                        </div>

                        <main className="rpg-page pt-16">
                            <button className="rpg-back-btn" onClick={goBack}>
                                <i className="bi bi-arrow-left"></i> 返回上一頁
                            </button>
                            <div className="text-center text-[var(--secondary-text-color)] py-8">
                                功能開發中...
                            </div>
                        </main>
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;
