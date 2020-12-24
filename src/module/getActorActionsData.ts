import { MODULE_ID, MySettings } from './constants';
import { log, getWeaponRelevantAbility, getActivationType } from './helpers';

export function getActorActionsData(actor: Actor5eCharacter) {
  // within each activation time, we want to display: Items which do damange, Spells which do damage, Features
  // MUTATED
  const actionsData: Record<ActivationType5e, Set<Partial<Item5e>>> = {
    action: new Set(),
    bonus: new Set(),
    reaction: new Set(),
    special: new Set(),
  };

  try {
    // digest all weapons equipped populate the actionsData appropriate categories
    const equippedWeapons: Item5e[] =
      actor.items.filter((item: Item5e) => item.type === 'weapon' && item.data.equipped) || [];

    // MUTATES actionsData
    equippedWeapons.forEach((item) => {
      debugger;
      const attackBonus = item.data.attackBonus;

      const prof = item.data.proficient ? actor.data.attributes.prof : 0;

      const actionType = item.data.actionType;
      let actionTypeBonus = 0;
      if (actionType !== 'save') {
        actionTypeBonus = Number(actor.data.bonuses?.[actionType]?.attack || 0);
      }
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
      const isSpell = item.type === 'spell';
      const isPrepared = item.data.preparation?.mode === 'always' || item.data.preparation?.prepared;

      return isSpell && isPrepared;
    });

    const relevantSpells = preparedSpells.filter((spell) => {
      const isReaction = spell.data.activation?.type === 'reaction';
      //ASSUMPTION: If the spell causes damage, it will have damageParts
      const isDamageDealer = spell.data.damage?.parts?.length > 0;
      const isCantrip = spell.data.level === 0;

      if (game.settings.get(MODULE_ID, MySettings.limitActionsToCantrips)) {
        return isCantrip && (isReaction || isDamageDealer);
      }

      return isReaction || isDamageDealer;
    });

    // const reactions = preparedSpells.filter((spell) => {
    //   return spell.data.activation?.type === 'reaction';
    // });

    // const damageDealers = preparedSpells.filter((spell) => {
    //   return spell.data.damage?.parts?.length > 0;
    // });

    relevantSpells.forEach((spell) => {
      const actionType = spell.data.actionType;
      const activationType = getActivationType(spell.data.activation?.type);

      let toHit: string;

      // add 'toHit' as a label DANGER. Verify we aren't mutating the actor.items list.
      if (actionType !== 'save') {
        const actionTypeBonus = String(actor.data.bonuses?.[actionType]?.attack || 0);
        const spellcastingMod = actor.data.abilities[actor.data.attributes.spellcasting]?.mod;
        const prof = actor.data.attributes.prof;

        toHit = String(Number(actionTypeBonus) + spellcastingMod + prof);
      }

      actionsData[activationType].add({
        ...spell,
        labels: {
          ...spell.labels,
          toHit: String(toHit),
        },
      });
    });
  } catch (e) {
    log(true, 'error trying to digest spellbook', e);
  }

  try {
    const activeFeatures: Item5e[] = actor.items.filter((item: Item5e) => {
      return item.type === 'feat' && item.data.activation?.type !== '';
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
