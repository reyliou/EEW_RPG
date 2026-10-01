import { supabase } from './supabase';
import { ICharacterState } from '../../../shared/types/character.types';

export class CharacterService {
  /**
   * 根據 ID 取得角色資料
   */
  static async getCharacter(characterId: string): Promise<ICharacterState | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('id', characterId)
      .single();

    if (error || !data) {
      console.error('[DB] Error fetching character:', error?.message);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      job: data.job || '新手',
      strength: data.strength,
      dexterity: data.dexterity,
      intelligence: data.intelligence,
      constitution: data.constitution,
      charisma: data.charisma,
      wisdom: data.wisdom,
      maxHp: data.max_hp,
      currentHp: data.current_hp,
      luck: data.luck,
      level: data.level,
      experience: data.experience,
      statusEffects: data.status_effects
    };
  }

  /**
   * 更新角色狀態 (例如結算檢定後的變更)
   */
  static async updateCharacterStats(characterId: string, updates: Partial<ICharacterState>): Promise<boolean> {
    if (!supabase) return false;

    const dbUpdates: any = {};
    if (updates.experience !== undefined) dbUpdates.experience = updates.experience;
    if (updates.currentHp !== undefined) dbUpdates.current_hp = updates.currentHp;
    if (updates.level !== undefined) dbUpdates.level = updates.level;
    // statusEffects 等欄位若有需要亦可在此補上

    const { error } = await supabase
      .from('characters')
      .update(dbUpdates)
      .eq('id', characterId);

    if (error) {
      console.error('[DB] Error updating character stats:', error.message);
      return false;
    }
    return true;
  }
}
