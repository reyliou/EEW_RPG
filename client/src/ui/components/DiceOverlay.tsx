import React, { useState, useEffect } from 'react';
import { IDiceRoll } from '@shared/types/encounter.types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface DiceOverlayProps {
    rollResult: IDiceRoll | null;
    isSuccess?: boolean;
    description?: string; // 新增原因描述
    onComplete?: () => void;
}

const DiceOverlay: React.FC<DiceOverlayProps> = ({ rollResult, isSuccess, description, onComplete }) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [displayValue, setDisplayValue] = useState(1);

    useEffect(() => {
        if (rollResult) {
            setIsAnimating(true);
            
            // 模擬骰子旋轉動畫
            let count = 0;
            const interval = setInterval(() => {
                setDisplayValue(Math.floor(Math.random() * rollResult.sides) + 1);
                count++;
                if (count > 20) {
                    clearInterval(interval);
                    setDisplayValue(rollResult.rawResult[0]);
                    setIsAnimating(false);
                    // 3秒後消失
                    setTimeout(() => onComplete?.(), 3000);
                }
            }, 50);

            return () => clearInterval(interval);
        }
    }, [rollResult]);

    if (!rollResult) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 pointer-events-auto">
            <div className={cn(
                "flex flex-col items-center gap-6 p-12 rounded-full aspect-square border-4 shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-500",
                isAnimating ? "scale-110 rotate-12 border-zinc-500 bg-zinc-900" : 
                isSuccess ? "scale-125 rotate-0 border-matrix-green bg-matrix-dark shadow-[0_0_80px_rgba(0,255,65,0.4)]" : 
                "scale-125 rotate-0 border-red-500 bg-zinc-900 shadow-[0_0_80px_rgba(239,68,68,0.4)]"
            )}>
                <span className="text-xs font-black tracking-[0.3em] uppercase opacity-50">Check Result</span>
                
                {description && (
                    <span className="text-sm font-bold text-primary/80 text-center max-w-[200px]">
                        {description}
                    </span>
                )}
                
                <div className={cn(
                    "relative w-48 h-48 transition-all duration-300",
                    isAnimating ? "animate-spin" : isSuccess ? "drop-shadow-[0_0_20px_var(--success-color)]" : "drop-shadow-[0_0_20px_var(--error-color)]"
                )}>
                    <img 
                        src={`/assets/images/dice/d20_${String(displayValue).padStart(2, '0')}.png`} 
                        alt={`d20 roll ${displayValue}`} 
                        className="w-full h-full object-contain"
                    />
                </div>

                {!isAnimating && (
                    <div className="flex flex-col items-center animate-bounce">
                        <span className={cn(
                            "text-xl font-bold uppercase",
                            isSuccess ? "text-matrix-green" : "text-red-500"
                        )}>
                            {isSuccess ? "Critical Success" : "Failure"}
                        </span>
                        {rollResult.modifier !== 0 && (
                            <span className="text-xs opacity-60">
                                ({rollResult.rawResult[0]} + {rollResult.modifier})
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiceOverlay;
