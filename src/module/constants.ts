export const MODULE_ID = 'character-actions-list-5e';
export const MODULE_ABBREV = 'CAL5E';

export enum MySettings {
  includeConsumables = 'include-consumables',
  includeOneMinuteSpells = 'include-one-minute-spells',
  includeSpellsWithEffects = 'include-spells-with-effects',
  injectCharacters = 'inject-characters',
  injectNPCs = 'inject-npcs',
  injectVehicles = 'inject-vehicles',
  limitActionsToCantrips = 'limit-actions-to-cantrips',
}

export enum MyFlags {
  filterOverride = 'filter-override',
}

export const TEMPLATES = {
  actionList: `modules/${MODULE_ID}/templates/actor-actions-list.hbs`,
};
