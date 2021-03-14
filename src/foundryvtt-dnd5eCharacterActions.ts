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

// deprecated
const actionsActionsListRenderers = new Set();

/**
 * Add the Actions Tab to Sheet HTML. Returns early if the character-actions-dnd5e element already exists
 */
async function addActionsTab(
  app: Application & {
    object: Actor5eCharacter;
  },
  html,
  data: ActorSheet5eCharacterSheetData
) {
  const existingActionsList = $(html).find('.character-actions-dnd5e');

  // check if what is rendering this is an Application and if our Actions List exists within it already
  if (!!app.appId && !!existingActionsList.length) {
    return;
  }

  // Update the nav menu
  const actionsTabButton = $('<a class="item" data-tab="actions">' + game.i18n.localize(`DND5E.ActionPl`) + '</a>');
  const tabs = html.find('.tabs[data-group="primary"]');
  tabs.prepend(actionsTabButton);

  // Create the tab
  const sheetBody = html.find('.sheet-body');
  const actionsTab = $(`<div class="tab actions flexcol" data-group="primary" data-tab="actions"></div>`);
  sheetBody.prepend(actionsTab);

  // add the list to the tab
  const actionsTabHtml = $(await renderActionsList(app.object));
  actionsTab.append(actionsTabHtml);

  // listeners
  // @ts-ignore
  actionsTabHtml.find('.item .item-image').click((event) => app._onItemRoll(event));
  // @ts-ignore
  actionsTabHtml.find('.item .item-name.rollable h4').click((event) => app._onItemSummary(event));
  // @ts-ignore
  actionsTabHtml.find('.item .item-recharge').click((event) => app._onItemRecharge(event));
}

async function renderActionsList(actorData: Actor5eCharacter, appId?: number) {
  if (!!appId) {
    actionsActionsListRenderers.add(appId); // deprecated
    console.warn(
      'providing the appId to ActionsList5e is deprecated with Character Actions List 2.0.0 and will be removed in a future update, check if your sheet module has an update'
    );
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

  globalThis[MODULE_ABBREV] = {
    renderActionsList,
  };

  Hooks.call(`CharacterActions5eReady`);
});

// default sheet injection if this hasn't yet been injected
Hooks.on('renderActorSheet5e', (app, html, data) => {
  log(false, 'default sheet open hook firing', {
    app,
    html,
    data,
  });

  // Deprecated
  if (actionsActionsListRenderers.has(app.appId)) {
    return;
  }

  const actionsList = $(html).find('.character-actions-dnd5e');

  log(false, 'actionsListExists', { actionsListExists: actionsList.length });

  if (!!actionsList.length) {
    return;
  }

  addActionsTab(app, html, data);
});

Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag(MODULE_ID);
});
