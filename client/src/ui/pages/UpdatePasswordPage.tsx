import React, { useState } from 'react';
import { supabase } from '../../core/services/supabase';
import { PageContainer } from '../common/PageContainer';

interface UpdatePasswordPageProps {
    onPasswordUpdated: () => void;
}

export const UpdatePasswordPage: React.FC<UpdatePasswordPageProps> = ({ onPasswordUpdated }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleUpdatePassword = async () => {
        if (!password || !confirmPassword) {
            setErrorMsg('請輸入新密碼');
            return;
        }

        if (password !== confirmPassword) {
            setErrorMsg('兩次輸入的密碼不一致');
            return;
        }

        setLoading(true);
        setErrorMsg('');

        // 呼叫 updateUser 更新密碼 (因為玩家點擊信件連結後，其實已經取得暫時的授權了)
        const { error } = await supabase.auth.updateUser({
            password: password
        });

        setLoading(false);

        if (error) {
            setErrorMsg(error.message);
        } else {
            // 更新成功
            onPasswordUpdated();
        }
    };

    return (
        <PageContainer className="max-w-md mx-auto text-center">
            <h1 className="text-3xl font-bold text-[var(--primary-color)] tracking-widest mb-2">
                <i className="bi bi-shield-lock"></i> 設定新密碼
            </h1>
            <p className="text-[var(--secondary-text-color)] mb-8 text-sm">請輸入您的新密碼，設定完成後將為您登入遊戲。</p>

            {errorMsg && (
                <div className="mb-4 p-3 bg-red-900/50 text-red-200 border border-red-500/50 rounded text-sm text-left">
                    <i className="bi bi-exclamation-triangle mr-2"></i> {errorMsg}
                </div>
            )}

            <div className="space-y-6 text-left">
                <div>
                    <label className="block text-[var(--secondary-text-color)] text-sm mb-1 ml-2"><i className="bi bi-key"></i> 新密碼</label>
                    <input 
                        type="password" 
                        className="rpg-input w-full" 
                        placeholder="設定新密碼 (至少 6 碼)..." 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-[var(--secondary-text-color)] text-sm mb-1 ml-2"><i className="bi bi-key-fill"></i> 確認新密碼</label>
                    <input 
                        type="password" 
                        className="rpg-input w-full" 
                        placeholder="再次輸入新密碼..." 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdatePassword()}
                    />
                </div>
            </div>

            <div className="mt-10">
                <button 
                    className={`rpg-btn rpg-btn-primary w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} 
                    onClick={handleUpdatePassword}
                    disabled={loading}
                >
                    {loading ? <span className="loading loading-spinner loading-sm"></span> : <><i className="bi bi-check-circle"></i> 確認更新並登入</>}
                </button>
            </div>
        </PageContainer>
    );
};
