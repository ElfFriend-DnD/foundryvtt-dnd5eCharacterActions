import { MODULE_ABBREV, MODULE_ID, MyFlags } from './constants';
import { getGame, isItemInActionList, log } from './helpers';

export function addFavoriteControls(
  app: FormApplication & {
    object: Actor5e;
  },
  html: JQuery,
) {
  function createFavButton(filterOverride: boolean) {
    return `<a class="item-control item-action-filter-override ${filterOverride ? 'active' : ''}" title="${
      filterOverride
        ? getGame().i18n.localize(`${MODULE_ABBREV}.button.setOverrideFalse`)
        : getGame().i18n.localize(`${MODULE_ABBREV}.button.setOverrideTrue`)
    }">
      <i class="fas fa-fist-raised">
        <i class="fas fa-slash"></i>
        <i class="fas fa-plus"></i>
      </i>
      <span class="control-label">${
        filterOverride
          ? getGame().i18n.localize(`${MODULE_ABBREV}.button.setOverrideFalse`)
          : getGame().i18n.localize(`${MODULE_ABBREV}.button.setOverrideTrue`)
      }</span>
    </a>`;
  }

  // add button to toggle favourite of the item in their native tab
  if (app.options.editable) {
    // Handle Click on our action
    $(html).on('click', 'a.item-action-filter-override', (e) => {
      try {
        const closestItemLi = $(e.target).parents('[data-item-id]')[0]; // BRITTLE
        const itemId = closestItemLi.dataset.itemId;
        const relevantItem = itemId && app.object.items.get(itemId);

        if (!relevantItem) {
          return;
        }

        const currentFilter = isItemInActionList(relevantItem);

        // set the flag to be the opposite of what it is now
        relevantItem.setFlag(MODULE_ID, MyFlags.filterOverride, !currentFilter);

        log(false, 'a.item-action-filter-override click registered', {
          closestItemLi,
          itemId,
          relevantItem,
          currentFilter,
        });
      } catch (e) {
        log(true, 'Error trying to set flag on item', e);
      }
    });

    // Add button to all item rows
    html.find('[data-item-id]').each((_index, element: HTMLElement) => {
      const itemId = element.dataset.itemId;
      const relevantItem = itemId && app.object.items.get(itemId);

      if (!relevantItem) {
        return;
      }

      const currentFilter = isItemInActionList(relevantItem);

      // log(false, { itemId, currentFilter });

      $(element).find('.item-controls').append(createFavButton(currentFilter));
    });
  }
}
