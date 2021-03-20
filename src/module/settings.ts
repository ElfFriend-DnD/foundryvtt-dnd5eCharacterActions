import { MySettings, MODULE_ID, MODULE_ABBREV } from './constants';

export const registerSettings = function () {
  // Register any custom module settings here
  game.settings.register(MODULE_ID, MySettings.limitActionsToCantrips, {
    name: `${MODULE_ABBREV}.settings.limitActionsToCantrips.Label`,
    default: false,
    type: Boolean,
    scope: 'client',
    config: true,
    hint: `${MODULE_ABBREV}.settings.limitActionsToCantrips.Hint`,
  });

  game.settings.register(MODULE_ID, MySettings.includeOneMinuteSpells, {
    name: `${MODULE_ABBREV}.settings.includeOneMinuteSpells.Label`,
    default: true,
    type: Boolean,
    scope: 'client',
    config: true,
    hint: `${MODULE_ABBREV}.settings.includeOneMinuteSpells.Hint`,
  });

  game.settings.register(MODULE_ID, MySettings.includeConsumables, {
    name: `${MODULE_ABBREV}.settings.includeConsumables.Label`,
    default: true,
    type: Boolean,
    scope: 'client',
    config: true,
    hint: `${MODULE_ABBREV}.settings.includeConsumables.Hint`,
  });
};
