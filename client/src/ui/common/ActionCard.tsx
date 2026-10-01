import React from 'react';

export type ActionCardColor = 'primary' | 'error' | 'warning' | 'success' | 'magic';

interface ActionCardProps {
    layout?: 'horizontal' | 'vertical'; // default is horizontal
    title: string;
    description: string;
    icon?: string;          // 例如 "bi-compass-fill"
    badge?: string;         // 標籤文字 (例如 "主線", "ATK")
    footer?: React.ReactNode; // 底部額外文字 (垂直排版專用)
    colorTheme?: ActionCardColor; // 預設 primary
    onClick?: () => void;
}

const themeClasses = {
    primary: {
        hoverBorder: 'hover:border-[var(--primary-color)]',
        hoverBg: 'hover:bg-[rgba(79,195,247,0.05)]',
        groupHoverText: 'group-hover:text-[var(--primary-color)]',
        groupHoverBg: 'group-hover:bg-[var(--primary-color)]',
        groupHoverShadow: 'group-hover:shadow-[0_0_15px_rgba(79,195,247,0.3)]',
        textColor: 'text-[var(--primary-color)]',
        borderColor: 'border-[var(--primary-color)]',
        badgeBg: 'bg-transparent',
    },
    error: {
        hoverBorder: 'hover:border-[var(--error-color)]',
        hoverBg: 'hover:bg-[rgba(239,68,68,0.05)]',
        groupHoverText: 'group-hover:text-[var(--error-color)]',
        groupHoverBg: 'group-hover:bg-[var(--error-color)]',
        groupHoverShadow: 'group-hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]',
        textColor: 'text-[var(--error-color)]',
        borderColor: 'border-[var(--error-color)]',
        badgeBg: 'bg-transparent',
    },
    warning: {
        hoverBorder: 'hover:border-[var(--warning-color)]',
        hoverBg: 'hover:bg-[rgba(255,167,38,0.05)]',
        groupHoverText: 'group-hover:text-[var(--warning-color)]',
        groupHoverBg: 'group-hover:bg-[var(--warning-color)]',
        groupHoverShadow: 'group-hover:shadow-[0_0_15px_rgba(255,167,38,0.3)]',
        textColor: 'text-[var(--warning-color)]',
        borderColor: 'border-[var(--warning-color)]',
        badgeBg: 'bg-transparent',
    },
    success: {
        hoverBorder: 'hover:border-[var(--success-color)]',
        hoverBg: 'hover:bg-[rgba(76,175,80,0.05)]',
        groupHoverText: 'group-hover:text-[var(--success-color)]',
        groupHoverBg: 'group-hover:bg-[var(--success-color)]',
        groupHoverShadow: 'group-hover:shadow-[0_0_15px_rgba(76,175,80,0.3)]',
        textColor: 'text-[var(--success-color)]',
        borderColor: 'border-[var(--success-color)]',
        badgeBg: 'bg-transparent',
    },
    magic: {
        hoverBorder: 'hover:border-[#d946ef]',
        hoverBg: 'hover:bg-[rgba(217,70,239,0.05)]',
        groupHoverText: 'group-hover:text-[#d946ef]',
        groupHoverBg: 'group-hover:bg-[#d946ef]',
        groupHoverShadow: 'group-hover:shadow-[0_0_15px_rgba(217,70,239,0.3)]',
        textColor: 'text-[#d946ef]',
        borderColor: 'border-[#d946ef]/30',
        badgeBg: 'bg-[#d946ef]/10',
    }
};

export const ActionCard: React.FC<ActionCardProps> = ({
    layout = 'horizontal',
    title,
    description,
    icon,
    badge,
    footer,
    colorTheme = 'primary',
    onClick
}) => {
    const t = themeClasses[colorTheme];

    if (layout === 'horizontal') {
        return (
            <div 
                className={`rpg-attr-item flex gap-5 cursor-pointer group relative overflow-hidden transition-all ${t.hoverBorder}`}
                onClick={onClick}
            >
                {/* 左側高光條 */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-transparent transition-colors ${t.groupHoverBg}`}></div>
                
                {/* 圓形 Icon */}
                {icon && (
                    <div className={`w-12 h-12 shrink-0 flex items-center justify-center text-2xl bg-[var(--background-color)] rounded-full border border-[var(--border-color)] transition-all ${t.textColor} ${t.groupHoverShadow}`}>
                        <i className={icon}></i>
                    </div>
                )}
                
                {/* 文字區 */}
                <div className="flex-1 self-center min-w-0">
                    <h4 className={`font-bold mb-1 text-base transition-colors truncate ${t.groupHoverText}`}>
                        {title}
                    </h4>
                    <p className="text-xs text-[var(--secondary-text-color)] line-clamp-2">{description}</p>
                </div>
                
                {/* Badge 區塊 */}
                {badge && (
                    <div className={`hidden md:flex items-center px-2 text-[10px] font-bold h-6 self-center rounded border shrink-0 ${t.textColor} ${t.borderColor} ${t.badgeBg}`}>
                        {badge}
                    </div>
                )}
            </div>
        );
    }

    // Vertical Layout
    return (
        <div 
            className={`border border-[var(--border-color)] bg-[var(--surface-color)] p-3 md:p-4 cursor-pointer transition-all flex flex-col justify-between group rounded-lg ${t.hoverBorder} ${t.hoverBg}`}
            onClick={onClick}
        >
            <div>
                <div className="flex justify-between items-start md:items-center mb-1 md:mb-2 gap-2">
                    <h4 className={`font-bold text-[var(--text-color)] transition-colors text-sm md:text-base ${t.groupHoverText}`}>
                        {title}
                    </h4>
                    {badge && (
                        <span className={`text-[10px] px-1 md:px-2 py-0.5 rounded border shrink-0 ${colorTheme === 'magic' ? t.textColor : 'text-[var(--secondary-text-color)]'} ${t.borderColor} ${t.badgeBg}`}>
                            {badge}
                        </span>
                    )}
                </div>
                <p className="text-[10px] md:text-xs text-[var(--secondary-text-color)] leading-relaxed">{description}</p>
            </div>
            {footer && (
                <div className="text-[9px] md:text-[10px] font-mono uppercase mt-2 md:mt-4 text-[var(--warning-color)]">
                    {footer}
                </div>
            )}
        </div>
    );
};
