import { MODULE_ID, MyFlags, MySettings } from './constants';

export function log(force: boolean, ...args) {
  //@ts-ignore
  const shouldLog = force || game.modules.get('_dev-mode')?.api?.getPackageDebugValue(MODULE_ID);

  if (shouldLog) {
    console.log(MODULE_ID, '|', ...args);
  }
}

export function getActivationType(activationType?: DND5e.AbilityActivationType) {
  switch (activationType) {
    case 'action':
    case 'bonus':
    case 'crew':
    case 'lair':
    case 'legendary':
    case 'reaction':
      return activationType;

    default:
      return 'other';
  }
}

export function isActiveItem(activationType?: string) {
  if (!activationType) {
    return false;
  }
  if (['minute', 'hour', 'day', 'none'].includes(activationType)) {
    return false;
  }
  return true;
}

export function isItemInActionList(item: Item5e) {
  // log(false, 'filtering item', {
  //   item,
  // });

  // check our override
  const override = item.getFlag(MODULE_ID, MyFlags.filterOverride) as boolean | undefined;

  if (override !== undefined) {
    return override;
  }

  // check the old flags
  //@ts-ignore
  const isFavourite = item.flags?.favtab?.isFavourite; // favourite items tab
  //@ts-ignore
  const isFavorite = item.flags?.favtab?.isFavorite; // tidy 5e sheet

  if (isFavourite || isFavorite) {
    return true;
  }

  // perform normal filtering logic
  switch (item.type) {
    case 'weapon': {
      return item.system.equipped;
    }
    case 'equipment': {
      return item.system.equipped && isActiveItem(item.system.activation?.type);
    }
    case 'consumable': {
      return (
        !!getGame().settings.get(MODULE_ID, MySettings.includeConsumables) && isActiveItem(item.system.activation?.type)
      );
    }
    case 'spell': {
      const limitToCantrips = getGame().settings.get(MODULE_ID, MySettings.limitActionsToCantrips);

      // only exclude spells which need to be prepared but aren't
      const notPrepared = item.system.preparation?.mode === 'prepared' && !item.system.preparation?.prepared;

      const isCantrip = item.system.level === 0;

      if (!isCantrip && (limitToCantrips || notPrepared)) {
        return false;
      }

      const isReaction = item.system.activation?.type === 'reaction';
      const isBonusAction = item.system.activation?.type === 'bonus';

      //ASSUMPTION: If the spell causes damage, it will have damageParts
      const isDamageDealer = item.system.damage?.parts?.length > 0;

      let shouldInclude = isReaction || isBonusAction || isDamageDealer;

      if (getGame().settings.get(MODULE_ID, MySettings.includeOneMinuteSpells)) {
        const isOneMinuter = item.system?.duration?.units === 'minute' && item.system?.duration?.value === 1;
        const isOneRounder = item.system?.duration?.units === 'round' && item.system?.duration?.value === 1;

        shouldInclude = shouldInclude || isOneMinuter || isOneRounder;
      }

      if (getGame().settings.get(MODULE_ID, MySettings.includeSpellsWithEffects)) {
        const hasEffects = !!item.effects.size;
        shouldInclude = shouldInclude || hasEffects;
      }

      return shouldInclude;
    }
    case 'feat': {
      return !!item.system.activation?.type;
    }
    default: {
      return false;
    }
  }
}

export function getGame(): Game {
  if (!(game instanceof Game)) {
    throw new Error('game is not initialized yet!');
  }
  return game;
}
