import React from 'react';

interface BackButtonProps {
    onClick: () => void;
    label?: string;
    className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick, label = '返回選單', className = '' }) => {
    return (
        <button className={`rpg-back-btn ${className}`} onClick={onClick}>
            <i className="bi bi-arrow-left"></i> {label}
        </button>
    );
};
