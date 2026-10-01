import tileData from './tile_dictionary.json';

export interface ITileMetadata {
    tile_id: string;
    filename: string;
    terrain_key: string;
    category: string;
    is_foundation: boolean;
    walkable: boolean | null;
    danger_level: number | null;
    biome: string;
    flavors: string[];
    connector_direction: string | null;
    is_connector_tile: boolean;
    description?: string; // 手動補充或 AI 生成用
}

export interface IOverlayObject {
    object_id: string;
    filename: string;
    top_category: string;
    layer: string;
    blocks_tile: boolean;
    biome: string;
    flavors: string[];
}

export const HEX_TILES: Record<string, ITileMetadata> = {};
export const OVERLAY_OBJECTS: Record<string, IOverlayObject> = {};

// 預處理地圖字典
tileData.hex_tiles.forEach((tile: any) => {
    HEX_TILES[tile.tile_id] = {
        ...tile,
        // 為 AI 增加一段預設描述
        description: `${tile.biome} 環境下的 ${tile.terrain_key} (${tile.category})`
    };
});

tileData.overlay_objects.forEach((obj: any) => {
    OVERLAY_OBJECTS[obj.object_id] = obj;
});

/**
 * 取得 Tile 的完整路徑
 */
export const getTilePath = (filename: string) => `/assets/tilesets/${filename}`;
