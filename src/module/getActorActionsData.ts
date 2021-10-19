import { getActivationType, isItemInActionList, log } from './helpers';

export function getActorActionsData(actor: Actor5e) {
  const filteredItems = actor.items.filter(isItemInActionList).sort((a, b) => {
    log(false, 'sorting', a.name, b.name, a.data.sort || 0, b.data.sort || 0);
    return (a.data.sort || 0) - (b.data.sort || 0);
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
