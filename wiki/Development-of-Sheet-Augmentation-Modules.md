This is a primer on the decisions and rationales I made which I hope will serve as guidelines for creating what I refer to as Actor Sheet Augmentation Modules.

An "Actor Sheet Augmentation Module" is any module which adds content to an Actor Sheet. These are very common as there's a lot of neat stuff surrounding the actors of a system which the base system might not support.

___

## Problems facing ASAMs

### Different Actor Sheet Layouts
Supporting Different Actor Sheet layouts is the primary challenge facing ASAMs. For the D&D5e module ecosystem, almost all of the sheets out there have a tabbed structure, so the obvious answer has always been "add a new tab and call it a day."

This is a problem because while most support this, not all do. For Example: the OGL character sheet module places Inventory and Features on the single large main sheet tab, making it incompatible with any inventory augmentation modules.

> #### Core Assumption
> The onus should not be on the Augmentation Module to support each individual character sheet, as new ones might come and go with the seasons.


### Duplication of Layout (and probably data)
Having the same field on the FormApplication twice can cause extreme database bloat if they both try to save data at once. Additionally, doubled up tabs and such look bad.


### Activating Listeners
Since an ASAM necessarily must inject its HTML after the rest of the sheet has initiated, the sheet's normal listeners are not applied to its DOM elements.

___

## Patterns to negate these problems

I believe Character Actions has struck an elegant balance in how it tackles these problems.

### Customizable DOM Injection
If a module desires, it can inject the Character Actions list into its own DOM anywhere it pleases. Most likely this should happen during `_renderInner()` as that runs immediately after the Application's DOM is created but before it is injected. With a little jQuery, you can put the output HTML of the module's API function wherever you need it.

```ts
async function renderActionsList(actorData: Actor5eCharacter, appId) {
  const data = await getActorActionsData(actorData);

  return renderTemplate(`modules/${MODULE_ID}/templates/actor-actions-list.hbs`, data);
}

// Hooks.once('init'...
  globalThis[MODULE_ABBREV] = {
    renderActionsList,
  };
```
See: [src/foundryvtt-dnd5eCharacterActions.ts](https://github.com/ElfFriend-DnD/foundryvtt-dnd5eCharacterActions/blob/main/src/foundryvtt-dnd5eCharacterActions.ts#L58)


If the sheet hooks are called and the HTML provided in those hooks doesn't contain the expected html, we inject it ourself in the `renderActor5eSheet` hook.
```ts
  const actionsList = $(html).find('.character-actions-dnd5e');

  if (!!actionsList.length) {
    return;
  }

  addActionsTab(app, html, data);
```
See: [src/foundryvtt-dnd5eCharacterActions.ts](https://github.com/ElfFriend-DnD/foundryvtt-dnd5eCharacterActions/blob/main/src/foundryvtt-dnd5eCharacterActions.ts#L96)

#### Third Party Implementation
The best place to inject HTML in a sheet module is `_renderInner` as it is awaited in the render function and happens before listeners are activated.

```ts
  async _renderInner(...args) {
    const html = await super._renderInner(...args);

    try {
      const actionsTab = html.find('.actions');

      const actionsTabHtml = $(await CAL5E.renderActionsList(this.actor));
      actionsTab.html(actionsTabHtml);
    } catch (e) {
      log(true, e);
    }

    return html;
  }
```

By allowing other modules to inject the DOM during their own DOM creation processes, we also partially solve the issue of Activating Listeners. The fallback injection must still activate its own listeners however, I haven't yet discovered an elegant solution to that problem.
___

### Duplicates
Because Character Actions checks if it exists first, we prevent duplication by simply not injecting the tab ourself if it's already present on the Application.

___

### Issues
There is one issue which presents itself with the fallback injection, since the DOM for the Actions Tab doesn't exist in the brief moment while the character sheet is created, the tab is navigated away from any time the actor is updated. This issue does not exist if the character sheet implements the DIY injection.