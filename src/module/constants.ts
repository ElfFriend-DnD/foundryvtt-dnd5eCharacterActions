export const MODULE_ID = 'character-actions-list-5e';
export const MODULE_ABBREV = 'CAL5E';

export enum MySettings {
  limitActionsToCantrips = 'limit-actions-to-cantrips',
  includeOneMinuteSpells = 'include-one-minute-spells',
  includeConsumables = 'include-consumables',
}

export enum MyFlags {
  filterOverride = 'filter-override',
}

export const TEMPLATES = {
  actionList: `modules/${MODULE_ID}/templates/actor-actions-list.hbs`,
};
