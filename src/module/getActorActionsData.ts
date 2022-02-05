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
      if (a.data.type !== b.data.type) {
        return ItemTypeSortValues[a.data.type] - ItemTypeSortValues[b.data.type];
      }

      if (a.data.type === 'spell' && b.data.type === 'spell') {
        return a.data.data.level - b.data.data.level;
      }

      return (a.data.sort || 0) - (b.data.sort || 0);
    })
    .map((item) => {
      if (item.labels) {
        //@ts-expect-error
        item.labels.type = getGame().i18n.localize(`DND5E.ItemType${item.type.titleCase()}`);
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
        if (['backpack', 'tool'].includes(item.data.type)) {
          return acc;
        }

        //@ts-ignore
        const activationType = getActivationType(item.data.data.activation?.type);

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
