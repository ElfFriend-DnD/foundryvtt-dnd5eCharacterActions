import { MODULE_ID, MySettings } from './constants';
import { log, getActivationType, isActiveItem } from './helpers';

export function getActorActionsData(actor: Actor5eCharacter) {
  // within each activation time, we want to display: Items which do damange, Spells which do damage, Features
  // MUTATED
  const actionsData: Record<ActivationType5e, Set<Partial<Item5e>>> = {
    action: new Set(),
    bonus: new Set(),
    reaction: new Set(),
    special: new Set(),
  };

  log(false, {
    actor,
    someItems: actor.items.filter((item: Item5e) => !!item.data.name),
  });

  try {
    // digest all weapons and equipment that are equipped populate the actionsData appropriate categories
    const equippedWeapons: Item5e[] =
      actor.items.filter((item: Item5e) => item.type === 'weapon' && item.data.data.equipped) || [];

    log(false, {
      equippedWeapons,
    });

    // MUTATES actionsData
    equippedWeapons.forEach((item) => {
      const activationType = getActivationType(item.data.data.activation?.type);

      actionsData[activationType].add(item);
    });
  } catch (e) {
    log(true, 'error trying to digest weapons', e);
  }

  try {
    // digest all weapons and equipment that are equipped populate the actionsData appropriate categories
    const equippedEquipment: Item5e[] =
      actor.items.filter(
        (item: Item5e) =>
          item.type === 'equipment' && item.data.data.equipped && isActiveItem(item.data.data.activation?.type)
      ) || [];

    log(false, {
      equippedEquipment,
    });

    // MUTATES actionsData
    equippedEquipment.forEach((item) => {
      const activationType = getActivationType(item.data.data.activation?.type);

      actionsData[activationType].add(item);
    });
  } catch (e) {
    log(true, 'error trying to digest equipment', e);
  }

  if (game.settings.get(MODULE_ID, MySettings.includeConsumables)) {
    try {
      // digest all weapons and equipment that are equipped populate the actionsData appropriate categories
      const activeConsumables: Item5e[] =
        actor.items.filter(
          (item: Item5e) => item.type === 'consumable' && isActiveItem(item.data.data.activation?.type)
        ) || [];

      log(false, {
        activeConsumables,
      });

      // MUTATES actionsData
      activeConsumables.forEach((item) => {
        const activationType = getActivationType(item.data.data.activation?.type);

        actionsData[activationType].add(item);
      });
    } catch (e) {
      log(true, 'error trying to digest equipment', e);
    }
  }

  try {
    // digest all prepared spells and populate the actionsData appropriate categories
    // MUTATES actionsData

    const preparedSpells: Item5e[] = actor.items.filter((item: Item5e) => {
      const isSpell = item.type === 'spell';
      const isPrepared = item.data.data.preparation?.mode === 'always' || item.data.data.preparation?.prepared;

      if (game.settings.get(MODULE_ID, MySettings.limitActionsToCantrips)) {
        return isSpell && isPrepared && item.data.data.level === 0;
      }

      return isSpell && isPrepared;
    });

    const relevantSpells = preparedSpells.filter((spell) => {
      const isReaction = spell.data.data.activation?.type === 'reaction';
      const isBonusAction = spell.data.data.activation?.type === 'bonus';

      //ASSUMPTION: If the spell causes damage, it will have damageParts
      const isDamageDealer = spell.data.data.damage?.parts?.length > 0;
      const isOneMinuter = spell.data.data?.duration?.units === 'minute' && spell.data.data?.duration?.value === 1;

      if (game.settings.get(MODULE_ID, MySettings.includeOneMinuteSpells)) {
        return isReaction || isBonusAction || isDamageDealer || isOneMinuter;
      }

      return isReaction || isBonusAction || isDamageDealer;
    });

    relevantSpells.forEach((spell) => {
      const activationType = getActivationType(spell.data.data.activation?.type);

      actionsData[activationType].add(spell);
    });
  } catch (e) {
    log(true, 'error trying to digest spellbook', e);
  }

  try {
    const activeFeatures: Item5e[] = actor.items.filter((item: Item5e) => {
      return item.type === 'feat' && item.data.data.activation?.type !== '';
    });

    // MUTATES actionsData
    activeFeatures.forEach((item) => {
      const activationType = getActivationType(item.data.data.activation?.type);

      actionsData[activationType].add(item);
    });
  } catch (e) {
    log(true, 'error trying to digest features', e);
  }
  return actionsData;
}
