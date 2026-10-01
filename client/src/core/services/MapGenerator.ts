import { createNoise2D } from 'simplex-noise';
import { HEX_TILES, ITileMetadata } from '@shared/constants/tiles';
import { MapData } from '@shared/types/expedition.types';

export class MapGenerator {
    private noise2D: (x: number, y: number) => number;
    
    constructor(seed?: number) {
        this.noise2D = createNoise2D(); 
    }

    private getTileByElevation(elevation: number, biomeType: string = 'temperate'): string {
        let targetCategory = 'open';
        
        if (elevation < 0.2) {
            targetCategory = 'water';
        } else if (elevation < 0.3) {
            targetCategory = 'blank';
        } else if (elevation < 0.55) {
            targetCategory = 'open';
        } else if (elevation < 0.7) {
            targetCategory = 'forest';
        } else if (elevation < 0.85) {
            targetCategory = 'mountain';
        } else {
            targetCategory = 'mountain';
        }

        const candidates = Object.values(HEX_TILES).filter(tile => 
            tile.is_foundation === true &&
            tile.category === targetCategory
        );

        if (candidates.length === 0) return 'hex_base_lush';

        if (elevation > 0.85) {
            const highMountains = candidates.filter(t => (t.danger_level ?? 0) >= 2);
            if (highMountains.length > 0) {
                return highMountains[Math.floor(Math.random() * highMountains.length)].tile_id;
            }
        }

        return candidates[Math.floor(Math.random() * candidates.length)].tile_id;
    }

    // 取得相鄰的 6 個格子座標
    private getNeighbors(q: number, r: number) {
        return [
            { q: q + 1, r: r }, { q: q + 1, r: r - 1 }, { q: q, r: r - 1 },
            { q: q - 1, r: r }, { q: q - 1, r: r + 1 }, { q: q, r: r + 1 }
        ];
    }

    public generateHexMap(radius: number): MapData {
        const foundations: Record<string, string> = {};
        const overlays: Record<string, string> = {};
        const elevations: Record<string, number> = {};
        
        const noiseScale = 0.15; 

        // 1. 生成高度圖與基礎地形
        for (let q = -radius; q <= radius; q++) {
            const r1 = Math.max(-radius, -q - radius);
            const r2 = Math.min(radius, -q + radius);
            
            for (let r = r1; r <= r2; r++) {
                const x = 1.5 * q;
                const y = Math.sqrt(3) * (r + q / 2);

                let rawNoise = this.noise2D(x * noiseScale, y * noiseScale);
                const elevation = (rawNoise + 1) / 2; 
                
                const coordKey = `${q}_${r}`;
                elevations[coordKey] = elevation;
                foundations[coordKey] = this.getTileByElevation(elevation);
            }
        }

        // 2. 生成河流 (從高處往低處流)
        // 找出潛在的水源地 (高度介於 0.7 ~ 0.8 之間的山麓)
        const springs = Object.keys(elevations).filter(key => {
            const el = elevations[key];
            return el > 0.7 && el < 0.8 && Math.random() > 0.95; // 5% 機率產生水源
        });

        // 簡單的河流流向演算法
        springs.forEach(springKey => {
            let current = springKey;
            let pathLength = 0;
            
            while (pathLength < 15) { // 避免死迴圈
                const [qStr, rStr] = current.split('_');
                const q = parseInt(qStr);
                const r = parseInt(rStr);
                const currentEl = elevations[current];

                // 找尋高度最低的相鄰格子
                let lowestNeighbor = null;
                let lowestEl = currentEl;

                const neighbors = this.getNeighbors(q, r);
                for (const n of neighbors) {
                    const nKey = `${n.q}_${n.r}`;
                    if (elevations[nKey] !== undefined && elevations[nKey] < lowestEl) {
                        lowestEl = elevations[nKey];
                        lowestNeighbor = nKey;
                    }
                }

                // 如果找不到更低的地方，或者流入海洋，河流終止
                if (!lowestNeighbor || lowestEl < 0.2) {
                    break;
                }

                // 簡單選一張 River 貼圖 (未來可根據方向精確選擇後綴)
                overlays[lowestNeighbor] = 'hex_river_1_n'; 
                current = lowestNeighbor;
                pathLength++;
            }
        });

        return { foundations, overlays, elevations };
    }
}
