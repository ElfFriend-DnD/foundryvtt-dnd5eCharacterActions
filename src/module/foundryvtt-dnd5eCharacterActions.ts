import { registerSettings } from './settings';
import { MODULE_ABBREV, MODULE_ID, MySettings, TEMPLATES } from './constants';
import { getGame, isItemInActionList, log } from './helpers';
import { getActorActionsData } from './getActorActionsData';
import { addFavoriteControls } from './handleFavoriteControls';

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
  app: ActorSheet5e,
  html,
  data: ReturnType<ActorSheet5e['getData']> extends Promise<infer T> ? T : ReturnType<ActorSheet5e['getData']>,
) {
  if (data instanceof Promise) {
    log(true, 'data was unexpectedly a Promise, you might be using an unsupported sheet');
    return;
  }

  const existingActionsList = $(html).find('.character-actions-dnd5e');

  // check if what is rendering this is an Application and if our Actions List exists within it already
  if ((!!app.appId && !!existingActionsList.length) || app.options.blockActionsTab) {
    return;
  }

  // Update the nav menu
  const actionsTabButton = $(
    '<a class="item" data-tab="actions">' + getGame().i18n.localize(`DND5E.ActionPl`) + '</a>',
  );
  const tabs = html.find('.tabs[data-group="primary"]');
  tabs.prepend(actionsTabButton);

  // Create the tab
  const sheetBody = html.find('.sheet-body');
  const actionsTab = $(`<div class="tab actions flexcol" data-group="primary" data-tab="actions"></div>`);
  sheetBody.prepend(actionsTab);

  // add the list to the tab
  const actionsTabHtml = $(await renderActionsList(app.actor));
  actionsTab.append(actionsTabHtml);

  // @ts-ignore
  actionsTabHtml.find('.item .item-name.rollable h4').click((event) => app._onItemSummary(event));

  // owner only listeners
  if (data.owner) {
    // @ts-ignore
    actionsTabHtml.find('.item .item-image').click((event) => app._onItemUse(event));
    // @ts-ignore
    actionsTabHtml.find('.item .item-recharge').click((event) => app._onItemRecharge(event));
  } else {
    actionsTabHtml.find('.rollable').each((i, el) => el.classList.remove('rollable'));
  }
}

const damageTypeIconMap = {
  acid: '<i class="fas fa-hand-holding-water"></i>',
  bludgeoning: '<i class="fas fa-gavel"></i>',
  cold: '<i class="fas fa-snowflake"></i>',
  fire: '<i class="fas fa-fire-alt"></i>',
  force: '<i class="fas fa-hat-wizard"></i>',
  lightning: '<i class="fas fa-bolt"></i>',
  necrotic: '<i class="fas fa-skull"></i>',
  piercing: '<i class="fas fa-thumbtack"></i>',
  poison: '<i class="fas fa-skull-crossbones"></i>',
  psychic: '<i class="fas fa-brain"></i>',
  radiant: '<i class="fas fa-sun"></i>',
  slashing: '<i class="fas fa-cut"></i>',
  thunder: '<i class="fas fa-wind"></i>',
  healing: '<i class="fas fa-heart"></i>',
  temphp: '<i class="fas fa-shield-alt"></i>',
};

/**
 * Renders the html of the actions list for the provided actor data
 */
async function renderActionsList(
  actorData: Actor5e,
  options?: {
    rollIcon?: string;
  },
) {
  const actionData = getActorActionsData(actorData);

  log(false, 'renderActionsList', {
    actorData,
    data: actionData,
  });

  return renderTemplate(`modules/${MODULE_ID}/templates/actor-actions-list.hbs`, {
    actionData,
    abilities: getGame().dnd5e.config.abilityAbbreviations,
    activationTypes: {
      ...getGame().dnd5e.config.abilityActivationTypes,
      other: getGame().i18n.localize(`DND5E.ActionOther`),
    },
    damageTypes: { ...getGame().dnd5e.config.damageTypes, ...getGame().dnd5e.config.healingTypes },
    damageTypeIconMap,
    rollIcon: options?.rollIcon,
    isOwner: actorData.isOwner,
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

  const characterActionsModuleData = getGame().modules.get(MODULE_ID);

  if (characterActionsModuleData) {
    characterActionsModuleData.api = {
      getActorActionsData,
      isItemInActionList,
      renderActionsList,
    };
  }

  globalThis[MODULE_ABBREV] = {
    renderActionsList: async function (...args) {
      log(false, {
        api: characterActionsModuleData?.api,
      });

      console.warn(
        MODULE_ID,
        '|',
        'accessing the module api on globalThis is deprecated and will be removed in a future update, check if there is an update to your sheet module',
      );
      return characterActionsModuleData?.api?.renderActionsList(...args);
    },
    isItemInActionList: function (...args) {
      console.warn(
        MODULE_ID,
        '|',
        'accessing the module api on globalThis is deprecated and will be removed in a future update, check if there is an update to your sheet module',
      );
      return characterActionsModuleData?.api?.isItemInActionList(...args);
    },
  };

  Hooks.call(`CharacterActions5eReady`, characterActionsModuleData?.api);
});

// default sheet injection if this hasn't yet been injected
Hooks.on('renderActorSheet5e', async (app, html, data) => {
  // short circut if the user has overwritten these settings
  switch (app.actor.type) {
    case 'npc':
      const injectNPCSheet = getGame().settings.get(MODULE_ID, MySettings.injectNPCs) as boolean;
      if (!injectNPCSheet) return;
    case 'vehicle':
      const injectVehicleSheet = getGame().settings.get(MODULE_ID, MySettings.injectVehicles) as boolean;
      if (!injectVehicleSheet) return;
    case 'character':
      const injectCharacterSheet = getGame().settings.get(MODULE_ID, MySettings.injectCharacters) as boolean;
      if (!injectCharacterSheet) return;
  }

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

  addFavoriteControls(app, html);
});

Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag(MODULE_ID);
});
