import { MODULE_ABBREV, MODULE_ID, MyFlags, MySettings } from './constants';

export function log(force: boolean, ...args) {
  //@ts-ignore
  const shouldLog = force || window.DEV?.getPackageDebugValue(MODULE_ID);

  if (shouldLog) {
    console.log(MODULE_ID, '|', ...args);
  }
}

export function getActivationType(activationType?: string) {
  switch (activationType) {
    case 'action':
    case 'bonus':
    case 'crew':
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
  if (['minute', 'hour', 'day'].includes(activationType)) {
    return false;
  }
  return true;
}

export function isItemInActionList(item: Item5e) {
  log(false, 'filtering item', {
    item,
  });

  // check our override
  const override = item.getFlag(MODULE_ID, MyFlags.filterOverride);

  if (override !== undefined) {
    return override;
  }

  // check the old flags
  const isFavourite = item.getFlag('favtab', 'isFavourite'); // favourite items tab
  const isFavorite = item.getFlag('favtab', 'isFavorite'); // tidy 5e sheet

  if (isFavourite || isFavorite) {
    return true;
  }

  // perform normal filtering logic
  switch (item.type) {
    case 'weapon': {
      return item.data.data.equipped;
    }
    case 'equipment': {
      return item.data.data.equipped && isActiveItem(item.data.data.activation?.type);
    }
    case 'consumable': {
      return (
        game.settings.get(MODULE_ID, MySettings.includeConsumables) && isActiveItem(item.data.data.activation?.type)
      );
    }
    case 'spell': {
      const limitToCantrips = game.settings.get(MODULE_ID, MySettings.limitActionsToCantrips);

      const isPrepared = item.data.data.preparation?.mode === 'always' || item.data.data.preparation?.prepared;

      const isCantrip = item.data.data.level === 0;

      if (!isCantrip && (limitToCantrips || !isPrepared)) {
        return false;
      }

      const isReaction = item.data.data.activation?.type === 'reaction';
      const isBonusAction = item.data.data.activation?.type === 'bonus';

      //ASSUMPTION: If the spell causes damage, it will have damageParts
      const isDamageDealer = item.data.data.damage?.parts?.length > 0;
      const isOneMinuter = item.data.data?.duration?.units === 'minute' && item.data.data?.duration?.value === 1;

      let shouldInclude = isReaction || isBonusAction || isDamageDealer;

      if (game.settings.get(MODULE_ID, MySettings.includeOneMinuteSpells)) {
        shouldInclude = shouldInclude || isOneMinuter;
      }

      return shouldInclude;
    }
    case 'feat': {
      return item.data.data.activation?.type;
    }
    default: {
      return false;
    }
  }
}
