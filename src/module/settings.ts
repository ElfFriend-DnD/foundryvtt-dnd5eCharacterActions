import { MySettings, MODULE_ID, MODULE_ABBREV } from './constants';
import { getGame } from './helpers';

export const registerSettings = function () {
  // Register any custom module settings here
  getGame().settings.register(MODULE_ID, MySettings.limitActionsToCantrips, {
    name: `${MODULE_ABBREV}.settings.limitActionsToCantrips.Label`,
    default: false,
    type: Boolean,
    scope: 'client',
    config: true,
    hint: `${MODULE_ABBREV}.settings.limitActionsToCantrips.Hint`,
  });

  getGame().settings.register(MODULE_ID, MySettings.includeOneMinuteSpells, {
    name: `${MODULE_ABBREV}.settings.includeOneMinuteSpells.Label`,
    default: true,
    type: Boolean,
    scope: 'client',
    config: true,
    hint: `${MODULE_ABBREV}.settings.includeOneMinuteSpells.Hint`,
  });

  getGame().settings.register(MODULE_ID, MySettings.includeSpellsWithEffects, {
    name: `${MODULE_ABBREV}.settings.includeSpellsWithEffects.Label`,
    default: true,
    type: Boolean,
    scope: 'client',
    config: true,
    hint: `${MODULE_ABBREV}.settings.includeSpellsWithEffects.Hint`,
  });

  getGame().settings.register(MODULE_ID, MySettings.includeConsumables, {
    name: `${MODULE_ABBREV}.settings.includeConsumables.Label`,
    default: true,
    type: Boolean,
    scope: 'client',
    config: true,
    hint: `${MODULE_ABBREV}.settings.includeConsumables.Hint`,
  });

  getGame().settings.register(MODULE_ID, MySettings.injectCharacters, {
    name: `${MODULE_ABBREV}.settings.injectCharacters.Label`,
    default: true,
    type: Boolean,
    scope: 'client',
    config: true,
    hint: `${MODULE_ABBREV}.settings.injectCharacters.Hint`,
  });

  getGame().settings.register(MODULE_ID, MySettings.injectNPCs, {
    name: `${MODULE_ABBREV}.settings.injectNPCs.Label`,
    default: true,
    type: Boolean,
    scope: 'world',
    config: true,
    hint: `${MODULE_ABBREV}.settings.injectNPCs.Hint`,
  });

  getGame().settings.register(MODULE_ID, MySettings.injectVehicles, {
    name: `${MODULE_ABBREV}.settings.injectVehicles.Label`,
    default: true,
    type: Boolean,
    scope: 'world',
    config: true,
    hint: `${MODULE_ABBREV}.settings.injectVehicles.Hint`,
  });
};
