// Import TypeScript modules
import { registerSettings } from './module/settings';
import { MODULE_ABBREV, MODULE_ID, MySettings, TEMPLATES } from './module/constants';
import { isItemInActionList, log } from './module/helpers';
import { getActorActionsData } from './module/getActorActionsData';
import { addFavoriteControls } from './module/handleFavoriteControls';

Handlebars.registerHelper(`${MODULE_ABBREV}-isEmpty`, (input: Object | Array<any> | Set<any>) => {
  if (input instanceof Array) {
    return input.length < 1;
  }
  if (input instanceof Set) {
    return input.size < 1;
  }
  return isObjectEmpty(input);
});

Handlebars.registerHelper(`${MODULE_ABBREV}-isItemInActionList`, isItemInActionList);

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
  if ((!!app.appId && !!existingActionsList.length) || app.options.blockActionsTab) {
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

async function renderActionsList(
  actorData: Actor5eCharacter,
  options?: {
    rollIcon?: string;
  }
) {
  const actionData = await getActorActionsData(actorData);

  log(false, 'renderActionsList', {
    actorData,
    data: actionData,
  });

  return renderTemplate(`modules/${MODULE_ID}/templates/actor-actions-list.hbs`, {
    actionData,
    abilities: game.dnd5e.config.abilityAbbreviations,
    activationTypes: {
      ...game.dnd5e.config.abilityActivationTypes,
      other: game.i18n.localize(`DND5E.ActionOther`),
    },
    rollIcon: options?.rollIcon,
  });
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

  game.modules.get(MODULE_ID).api = {
    renderActionsList,
    isItemInActionList,
  };

  globalThis[MODULE_ABBREV] = {
    renderActionsList: async function (...args) {
      log(false, {
        api: game.modules.get(MODULE_ID).api,
      });

      console.warn(
        MODULE_ID,
        '|',
        'accessing the module api on globalThis is deprecated and will be removed in a future update, check if there is an update to your sheet module'
      );
      return game.modules.get(MODULE_ID).api?.renderActionsList(...args);
    },
    isItemInActionList: function (...args) {
      console.warn(
        MODULE_ID,
        '|',
        'accessing the module api on globalThis is deprecated and will be removed in a future update, check if there is an update to your sheet module'
      );
      return game.modules.get(MODULE_ID).api?.isItemInActionList(...args);
    },
  };

  Hooks.call(`CharacterActions5eReady`, game.modules.get(MODULE_ID).api);
});

// default sheet injection if this hasn't yet been injected
Hooks.on('renderActorSheet5e', async (app, html, data) => {
  log(false, 'default sheet open hook firing', {
    app,
    html,
    data,
  });

  const actionsList = $(html).find('.character-actions-dnd5e');

  log(false, 'actionsListExists', { actionsListExists: actionsList.length });

  if (!actionsList.length) {
    await addActionsTab(app, html, data);
  }

  addFavoriteControls(app, html, data);
});

Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag(MODULE_ID);
});
