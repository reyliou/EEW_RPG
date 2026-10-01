import React from 'react';

interface VolumeSliderProps {
    label: string;
    iconClass: string;
    value: number;
    onChange: (value: number) => void;
}

export const VolumeSlider: React.FC<VolumeSliderProps> = ({ label, iconClass, value, onChange }) => {
    return (
        <div className="space-y-2">
            <label className="flex justify-between text-sm font-bold text-[var(--secondary-text-color)]">
                <span><i className={`bi ${iconClass} mr-2`}></i>{label}</span>
                <span>{value}%</span>
            </label>
            <input 
                type="range" min="0" max="100" value={value} 
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="w-full h-2 bg-[var(--border-color)] rounded-lg appearance-none cursor-pointer accent-[var(--primary-color)]"
            />
        </div>
    );
};
