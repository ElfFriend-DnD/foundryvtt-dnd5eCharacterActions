// Import TypeScript modules
import { registerSettings } from './module/settings';
import { MODULE_ABBREV, MODULE_ID, MySettings, TEMPLATES } from './module/constants';
import { log } from './module/helpers';
import { getActorActionsData } from './module/getActorActionsData';

Handlebars.registerHelper(`${MODULE_ABBREV}-isEmpty`, (input: Object | Array<any> | Set<any>) => {
  if (input instanceof Array) {
    return input.length < 1;
  }
  if (input instanceof Set) {
    return input.size < 1;
  }
  return isObjectEmpty(input);
});

/**
 * Challenge: Want to be able to use this without a tab on some character sheets
 * Problems:
 * - If I attach this to the default 5e character sheet render hook, it'll be on all character sheets that extend that sheet.
 *
 * Challenge: Want to be able to use this without a sheet at all.
 *
 * Potential solutions:
 * if any sheet has called the 'add actions tab' function already, don't call it on render hook for the default sheet
 * - what is the order of hooks being fired? does custom come first, or second?
 * ---> the hooks fire with custom starting first
 *
 * Solution:
 * Keep a map of appIds that have called `addActionsTab` and return out of the function if that appId is calling it again
 * On Cleanup, remove the appId.
 */

const actionsActionsListRenderers = new Set();

/**
 * Add the Actions Tab to Sheet HTML
 * This does not register any event listeners as I am hoping that this suggestion will be adopted:
 * https://gitlab.com/foundrynet/foundryvtt/-/issues/3998
 *
 * this should only be called if a sheet hasn't yet rendered the actions list themselves
 */
async function addActionsTab(
  app: Application & {
    object: Actor5eCharacter;
  },
  html,
  data: ActorSheet5eCharacterSheetData
) {
  // Update the nav menu
  const actionsTabButton = $('<a class="item" data-tab="actions">' + game.i18n.localize(`DND5E.ActionPl`) + '</a>');
  const tabs = html.find('.tabs[data-group="primary"]');
  tabs.prepend(actionsTabButton);

  // Create the tab
  const sheetBody = html.find('.sheet-body');
  const actionsTab = $(`<div class="tab actions flexcol" data-group="primary" data-tab="actions"></div>`);
  sheetBody.prepend(actionsTab);

  // add the list to the tab
  const actionsTabHtml = $(await renderActionsList(app.object, app.appId));
  actionsTab.append(actionsTabHtml);

  //@ts-ignore
  app.activateListeners(html);

  // add this appId to the list of renderers
  actionsActionsListRenderers.add(app.appId);
}

async function cleanupActionsTab(app: Application, html, data: ActorSheet5eCharacterSheetData) {
  // add this appId to the list of renderers
  actionsActionsListRenderers.delete(app.appId);
}

async function renderActionsList(actorData: Actor5eCharacter, appId) {
  // check if what is rendering this is an Application
  if (!!appId && actionsActionsListRenderers.has(appId)) {
    return;
  }
  const data = await getActorActionsData(actorData);

  log(false, 'renderActionsList', {
    actorData,
    data,
  });

  return renderTemplate(`modules/${MODULE_ID}/templates/actor-actions-list.hbs`, data);
}

/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once('init', async function () {
  log(true, `Initializing ${MODULE_ID}`);

  // Register custom module settings
  registerSettings();

  // Preload Handlebars templates
  await loadTemplates(Object.values(flattenObject(TEMPLATES)));

  Hooks.call(`CharacterActions5eReady`);
});

/* ------------------------------------ */
/* Setup module							*/
/* ------------------------------------ */
Hooks.once('setup', function () {
  // Do anything after initialization but before
  // ready
});

/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once('ready', function () {
  // Do anything once the module is ready
});

// Add any additional hooks if necessary

Hooks.on('renderActorSheet5e', (app, html, data) => {
  log(false, 'default sheet open hook firing', {
    app,
    html,
    data,
  });

  addActionsTab(app, html, data);
});

Hooks.on('closeActorSheet5e', (app, html, data) => {
  log(false, 'default sheet close hook firing', {
    app,
    html,
    data,
  });

  cleanupActionsTab(app, html, data);
});

Hooks.on('renderCompactBeyond5eSheet', (...args) => {
  log(false, 'custom sheet hook firing', ...args);
});
