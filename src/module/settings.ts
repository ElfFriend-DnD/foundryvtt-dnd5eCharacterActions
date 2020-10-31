import { MySettings, MODULE_ID, MODULE_ABBREV } from './constants';

export const registerSettings = function () {
  // debug use
  CONFIG[MODULE_ID] = { debug: true };
  CONFIG.debug.hooks = true;

  // Register any custom module settings here
  game.settings.register(MODULE_ID, MySettings.limitActionsToCantrips, {
    name: `${MODULE_ABBREV}.limitActionsToCantrips`,
    default: false,
    type: Boolean,
    scope: 'client',
    config: true,
    hint: `${MODULE_ABBREV}.limitActionsToCantripsHint`,
  });
};
