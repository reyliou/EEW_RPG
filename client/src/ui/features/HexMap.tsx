import React, { useState, useEffect, useMemo } from 'react';
import { HEX_TILES } from '@shared/constants/tiles';
import { MapData } from '@shared/types/expedition.types';

interface HexCoordinate {
    q: number;
    r: number;
}

interface HexMapProps {
    radius: number;
    currentPos: HexCoordinate;
    tileMap: MapData;
    eventMap: Record<string, string>;
    onMove: (q: number, r: number) => void;
}

export const HexMap: React.FC<HexMapProps> = ({ radius, currentPos, tileMap, eventMap, onMove }) => {
    const hexSize = 42; 
    
    // 平頂六邊形 (Flat-topped)
    const getHexPath = (cx: number, cy: number, size: number) => {
        const points = [];
        for (let i = 0; i < 6; i++) {
            const angleDeg = 60 * i;
            const angleRad = (Math.PI / 180) * angleDeg;
            points.push(`${cx + size * Math.cos(angleRad)},${cy + size * Math.sin(angleRad)}`);
        }
        return `M${points.join(' L')} Z`;
    };

    const getDistance = (h1: HexCoordinate, h2: HexCoordinate) => {
        return (Math.abs(h1.q - h2.q) + Math.abs(h1.q + h1.r - (h2.q + h2.r)) + Math.abs(h1.r - h2.r)) / 2;
    };

    // Fog of war state
    const [exploredHexes, setExploredHexes] = useState<Set<string>>(new Set());

    useEffect(() => {
        // Reveal area around current position
        setExploredHexes(prev => {
            const next = new Set(prev);
            for (let q = -radius; q <= radius; q++) {
                const r1 = Math.max(-radius, -q - radius);
                const r2 = Math.min(radius, -q + radius);
                for (let r = r1; r <= r2; r++) {
                    if (getDistance({ q, r }, currentPos) <= 2) {
                        next.add(`${q}_${r}`);
                    }
                }
            }
            return next;
        });
    }, [currentPos.q, currentPos.r, radius]);

    const hexes: HexCoordinate[] = [];
    for (let q = -radius; q <= radius; q++) {
        const r1 = Math.max(-radius, -q - radius);
        const r2 = Math.min(radius, -q + radius);
        for (let r = r1; r <= r2; r++) {
            hexes.push({ q, r });
        }
    }

    const offset_x = 400 - (hexSize * 1.5 * currentPos.q);
    const offset_y = 250 - (hexSize * Math.sqrt(3) * (currentPos.r + currentPos.q / 2));

    // 根據地形類別決定顏色與 Bootstrap Icon 類別
    const getTileVisuals = (category: string, dangerLevel: number = 0) => {
        let bgColor = '#1e1e1e';
        let iconClass = '';

        switch (category) {
            case 'water':
                bgColor = '#0369a1'; // 深藍色
                iconClass = 'bi-water text-blue-200 opacity-80';
                break;
            case 'blank':
                bgColor = '#b45309'; // 泥土/沙黃色
                iconClass = ''; // 沙地不放 icon 保持乾淨
                break;
            case 'open':
                bgColor = '#166534'; // 綠色平原
                iconClass = '';
                break;
            case 'forest':
                bgColor = '#064e3b'; // 深綠色森林
                iconClass = 'bi-tree-fill text-green-400 opacity-80';
                break;
            case 'mountain':
                bgColor = dangerLevel >= 2 ? '#292524' : '#57534e'; // 深灰/淺灰
                iconClass = dangerLevel >= 2 ? 'bi-fire text-red-500 opacity-80' : 'bi-triangle-fill text-gray-300 opacity-80';
                break;
            default:
                bgColor = '#1e1e1e';
        }

        return { bgColor, iconClass };
    };

    return (
        <div 
            className="w-full aspect-video rounded-xl border relative overflow-hidden cursor-grab active:cursor-grabbing transition-colors duration-500 shadow-2xl"
            style={{ 
                backgroundColor: 'var(--background-color)',
                borderColor: 'var(--border-color)'
            }}
        >
            <svg width="100%" height="100%" viewBox="0 0 800 500">
                <g transform={`translate(${offset_x}, ${offset_y})`}>
                    {hexes.map((hex) => {
                        const coordKey = `${hex.q}_${hex.r}`;
                        const foundationId = tileMap.foundations[coordKey] || "hex_base_lush"; 
                        const overlayId = tileMap.overlays[coordKey];
                        
                        const tileData = HEX_TILES[foundationId];
                        const overlayData = overlayId ? HEX_TILES[overlayId] : null;
                        
                        const cx = hexSize * 1.5 * hex.q;
                        const cy = hexSize * Math.sqrt(3) * (hex.r + hex.q / 2);
                        
                        const isCurrent = hex.q === currentPos.q && hex.r === currentPos.r;
                        const hasEvent = eventMap[coordKey];
                        
                        const distFromPlayer = getDistance(hex, currentPos);
                        
                        const isExplored = exploredHexes.has(coordKey);
                        const isVisible = distFromPlayer <= 2;
                        const isAdjacent = distFromPlayer === 1;

                        if (!isExplored) return null; // 完全隱藏未探索區域
                        
                        const opacity = isVisible ? 1 : 0.2; // 已探索但不在視野內，降低亮度
                        const grayscaleClass = !isVisible ? 'grayscale opacity-50' : '';
                        const isWalkable = tileData?.walkable !== false && (overlayData ? overlayData.walkable !== false : true);
                        const canMoveTo = isWalkable && isAdjacent;

                        const isRiver = !!overlayId;
                        const { bgColor, iconClass } = getTileVisuals(
                            tileData?.category || 'open', 
                            tileData?.danger_level || 0
                        );

                        return (
                            <g 
                                key={coordKey} 
                                className={`transition-all duration-700 ${!isWalkable ? 'opacity-40' : ''} ${grayscaleClass}`}
                                opacity={opacity}
                                onClick={() => canMoveTo && onMove(hex.q, hex.r)}
                            >
                                {/* 顏色塊填充 */}
                                <path
                                    d={getHexPath(cx, cy, hexSize)}
                                    fill={bgColor}
                                    stroke="rgba(0,0,0,0.4)"
                                    strokeWidth={2}
                                    className={`transition-all ${canMoveTo ? 'cursor-pointer hover:brightness-125' : 'cursor-default'}`}
                                />

                                {/* IconFont 渲染 (使用 foreignObject) */}
                                {(iconClass || isRiver) && (
                                    <foreignObject
                                        x={cx - hexSize}
                                        y={cy - hexSize}
                                        width={hexSize * 2}
                                        height={hexSize * 2}
                                        className="pointer-events-none"
                                    >
                                        <div className="w-full h-full flex flex-col items-center justify-center -space-y-1 drop-shadow-md">
                                            {iconClass && <i className={`bi ${iconClass} text-lg`}></i>}
                                            {isRiver && <i className="bi bi-droplet-fill text-blue-300 text-sm"></i>}
                                        </div>
                                    </foreignObject>
                                )}

                                {/* 選取狀態框 / 可移動提示 */}
                                <path
                                    d={getHexPath(cx, cy, hexSize - 2)}
                                    fill="transparent"
                                    stroke={isCurrent ? 'white' : canMoveTo ? 'rgba(255,255,255,0.3)' : 'transparent'}
                                    strokeWidth={isCurrent ? 3 : 2}
                                    strokeDasharray={canMoveTo ? '4,4' : 'none'}
                                    className={`pointer-events-none ${canMoveTo ? 'animate-pulse' : ''}`}
                                />
                                
                                {/* 事件提示 */}
                                {hasEvent && distFromPlayer <= 2 && (
                                    <g transform={`translate(${cx}, ${cy - 12})`}>
                                        <circle r={6} fill="var(--error-color)" className="animate-ping opacity-50" />
                                        <circle r={3} fill="var(--error-color)" />
                                    </g>
                                )}

                                {/* 玩家標記 */}
                                {isCurrent && (
                                    <g transform={`translate(${cx}, ${cy})`}>
                                        <circle r={14} fill="white" className="opacity-30 animate-ping" />
                                        <circle r={6} fill="white" stroke="rgba(0,0,0,0.5)" strokeWidth={2} />
                                    </g>
                                )}
                            </g>
                        );
                    })}
                </g>
            </svg>
            
            <div className="absolute bottom-4 left-4 flex flex-col gap-2 pointer-events-none">
                <div className="flex gap-4 items-center">
                    <div className="text-[10px] text-[var(--secondary-text-color)] font-mono bg-black/50 px-2 py-1 rounded border border-white/10">
                        COORD: {currentPos.q}, {currentPos.r} | ELV: {tileMap.elevations[`${currentPos.q}_${currentPos.r}`]?.toFixed(2)}
                    </div>
                    {HEX_TILES[tileMap.foundations[`${currentPos.q}_${currentPos.r}`]] && (
                        <div className="text-xs text-white font-bold bg-black/50 px-2 py-1 rounded border border-white/30 animate-fadeIn">
                            <i className="bi bi-geo-alt-fill mr-1"></i>
                            {HEX_TILES[tileMap.foundations[`${currentPos.q}_${currentPos.r}`]].description}
                            {tileMap.overlays[`${currentPos.q}_${currentPos.r}`] && 
                                ` (💧 河流)`
                            }
                            {HEX_TILES[tileMap.foundations[`${currentPos.q}_${currentPos.r}`]].walkable === false && 
                                <span className="ml-2 text-[var(--error-color)]">[不可通行]</span>
                            }
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
