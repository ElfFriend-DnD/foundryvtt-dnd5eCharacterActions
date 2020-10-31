// Import TypeScript modules
import { registerSettings } from './module/settings';
import { preloadTemplates } from './module/preloadTemplates';
import { MODULE_ABBREV, MODULE_ID, MySettings } from './module/constants';
import { getActivationType, getWeaponRelevantAbility, log } from './module/helpers';

Handlebars.registerHelper('cb5es-isEmpty', (input: Object | Array<any> | Set<any>) => {
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

function getActorActionsData(actor: Actor5eCharacter) {
  // within each activation time, we want to display: Items which do damange, Spells which do damage, Features
  // MUTATED
  const actionsData: Record<ActivationType5e, Set<Item5e>> = {
    action: new Set(),
    bonus: new Set(),
    reaction: new Set(),
    special: new Set(),
  };

  try {
    // digest all weapons equipped populate the actionsData appropriate categories
    const weapons = actor.items.filter((item: Item5e) => item.data.type === ItemType5e.weapon);

    const equippedWeapons =
      actor.items.filter((item: Item5e) => item.data.type === ItemType5e.weapon && item.data.equipped) || [];

    // MUTATES actionsData
    equippedWeapons.forEach((item) => {
      const attackBonus = item.data.attackBonus;
      // FIXME this has to be set by the user, perhaps we can infer from the `traits.weaponProf`
      const prof = item.data.proficient ? actor.data.attributes.prof : 0;

      const actionType = item.data.actionType;
      const actionTypeBonus = Number(actor.data.bonuses?.[actionType]?.attack || 0);

      const relevantAbility = getWeaponRelevantAbility(item.data, actor.data);
      const relevantAbilityMod = actor.data.abilities[relevantAbility]?.mod;

      const toHit = actionTypeBonus + relevantAbilityMod + attackBonus + prof;

      const activationType = getActivationType(item.data.activation?.type);

      actionsData[activationType].add({
        ...item,
        labels: {
          ...item.labels,
          toHit: String(toHit),
        },
      });
    });
  } catch (e) {
    log(true, 'error trying to digest inventory', e);
  }

  try {
    // digest all prepared spells and populate the actionsData appropriate categories
    // MUTATES actionsData

    const preparedSpells: Item5e[] = actor.items.filter((item: Item5e) => {
      const isSpell = item.data.type === ItemType5e.spell;
      const isCantrip = item.data.level === 0;
      const isPrepared = item.data.preparation?.mode === 'always' || item.data.preparation?.prepared;

      if (game.settings.get(MODULE_ID, MySettings.limitActionsToCantrips)) {
        return isSpell && isCantrip && isPrepared;
      }
      return isSpell && isPrepared;
    });

    const reactions = preparedSpells.filter((spell) => {
      return spell.data.activation?.type === 'reaction';
    });

    const damageDealers = preparedSpells.filter((spell) => {
      //ASSUMPTION: If the spell causes damage, it will have damageParts
      return spell.data.damage?.parts?.length > 0;
    });

    new Set([...damageDealers, ...reactions]).forEach((spell) => {
      const actionType = spell.data.actionType;

      // add 'toHit' as a label DANGER. Verify we aren't mutating the actor.items list.
      if (actionType !== ActionType5e.save) {
        const actionTypeBonus = String(actor.data.bonuses?.[actionType]?.attack || 0);
        const spellcastingMod = actor.data.abilities[actor.data.attributes.spellcasting]?.mod;
        const prof = actor.data.attributes.prof;

        spell.labels.toHit = String(Number(actionTypeBonus) + spellcastingMod + prof);
      }

      const activationType = getActivationType(spell.data.activation?.type);

      actionsData[activationType].add(spell);
    });
  } catch (e) {
    log(true, 'error trying to digest spellbook', e);
  }

  try {
    const activeFeatures: Item5e[] = actor.items.filter((item: Item5e) => {
      return item.type === ItemType5e.feat && item.data.activation?.type !== '';
    });

    // MUTATES actionsData
    activeFeatures.forEach((item) => {
      const activationType = getActivationType(item.data.activation?.type);

      actionsData[activationType].add(item);
    });
  } catch (e) {
    log(true, 'error trying to digest features', e);
  }
  return actionsData;
}

// this should only be called if a sheet hasn't yet rendered the actions list themselves
async function addActionsTab(app: Application, html, data: ActorSheet5eCharacterSheetData) {
  // Update the nav menu
  let actionsTabButton = $('<a class="item" data-tab="actions">' + game.i18n.localize(`DND5E.ActionPl`) + '</a>');
  let tabs = html.find('.tabs[data-group="primary"]');
  tabs.append(actionsTabButton);

  // Create the tab content
  let sheet = html.find('.sheet-body');
  let actionsTabHtml = $(await renderActionsList(data.actor, app.appId));
  sheet.append(actionsTabHtml);

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
  const data = getActorActionsData(actorData);
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
  await preloadTemplates();

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
