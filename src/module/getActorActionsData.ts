import { getActivationType, isItemInActionList, log } from './helpers';

export function getActorActionsData(actor: Actor5eCharacter) {
  const filteredItems = actor.items.filter(isItemInActionList);

  const actionsData: Record<
    'action' | 'bonus' | 'crew' | 'reaction' | 'other',
    Set<Partial<Item5e>>
  > = filteredItems.reduce(
    (acc, item: Item5e) => {
      try {
        log(false, 'digesting item', {
          item,
        });

        const activationType = getActivationType(item.data.data.activation?.type);

        acc[activationType].add(item);

        return acc;
      } catch (e) {
        log(true, 'error trying to digest item', item.name, e);
        return acc;
      }
    },
    {
      action: new Set(),
      bonus: new Set(),
      crew: new Set(),
      reaction: new Set(),
      other: new Set(),
    }
  );

  return actionsData;
}
