import { getActivationType, getGame, isItemInActionList, log } from './helpers';

enum ItemTypeSortValues {
  weapon = 1,
  equipment = 2,
  feat = 3,
  spell = 4,
  consumable = 5,
  tool = 6,
  backpack = 7,
  class = 8,
  loot = 9,
}

export function getActorActionsData(actor: Actor5e) {
  const filteredItems = actor.items
    .filter(isItemInActionList)
    .sort((a, b) => {
      if (a.type !== b.type) {
        return ItemTypeSortValues[a.type] - ItemTypeSortValues[b.type];
      }

      if (a.type === 'spell' && b.type === 'spell') {
        return a.system.level - b.system.level;
      }

      return (a.sort || 0) - (b.sort || 0);
    })
    .map((item) => {
      if (item.labels) {
        //@ts-expect-error
        item.labels.type = getGame().i18n.localize(`ITEM.Type${item.type.titleCase()}`);
      }

      // removes any in-formula flavor text from the formula in the label
      //@ts-expect-error
      if (item.labels?.derivedDamage?.length) {
        //@ts-expect-error
        item.labels.derivedDamage = item.labels.derivedDamage.map(({ formula, ...rest }) => ({
          formula: formula?.replace(/\[.+?\]/, '') || '0',
          ...rest,
        }));
      }

      return item;
    });

  const actionsData: Record<
    'action' | 'bonus' | 'crew' | 'lair' | 'legendary' | 'reaction' | 'other',
    Set<Item5e>
  > = filteredItems.reduce(
    (acc, item: Item5e) => {
      try {
        log(false, 'digesting item', {
          item,
        });
        if (['backpack', 'tool'].includes(item.type)) {
          return acc;
        }

        //@ts-ignore
        const activationType = getActivationType(item.system.activation?.type);

        acc[activationType].add(item);

        return acc;
      } catch (e) {
        log(true, 'error trying to digest item', item.name, e);
        return acc;
      }
    },
    {
      action: new Set<Item5e>(),
      bonus: new Set<Item5e>(),
      crew: new Set<Item5e>(),
      lair: new Set<Item5e>(),
      legendary: new Set<Item5e>(),
      reaction: new Set<Item5e>(),
      other: new Set<Item5e>(),
    },
  );

  return actionsData;
}
