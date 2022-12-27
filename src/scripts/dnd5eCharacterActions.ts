import { registerSettings } from "./settings";
import { MODULE_ID, MySettings, TEMPLATES } from "./constants";
import { isItemInActionList, log } from "./helpers";
import { getActorActionsData } from "./getActorActionsData";
import { addFavoriteControls } from "./handleFavoriteControls";
import API from "./api";

Handlebars.registerHelper(`${MODULE_ID}-isEmpty`, (input: Object | Array<any> | Set<any>) => {
	if (input instanceof Array) {
		return input.length < 1;
	}
	if (input instanceof Set) {
		return input.size < 1;
	}
	return isObjectEmpty(input);
});

Handlebars.registerHelper(`${MODULE_ID}-isItemInActionList`, isItemInActionList);

/**
 * Add the Actions Tab to Sheet HTML. Returns early if the character-actions-list-5e element already exists
 */
async function addActionsTab(
	app: ActorSheet5e,
	html,
	data: ReturnType<ActorSheet5e["getData"]> extends Promise<infer T> ? T : ReturnType<ActorSheet5e["getData"]>
) {
	if (data instanceof Promise) {
		log(true, "data was unexpectedly a Promise, you might be using an unsupported sheet");
		return;
	}

	const existingActionsList = $(html).find(".character-actions-list-5e");

	// check if what is rendering this is an Application and if our Actions List exists within it already
	if ((!!app.appId && !!existingActionsList.length) || app.options.blockActionsTab) {
		return;
	}

	// Update the nav menu
	const actionsTabButton = $('<a class="item" data-tab="actions">' + game.i18n.localize(`DND5E.ActionPl`) + "</a>");
	const tabs = html.find('.tabs[data-group="primary"]');
	tabs.prepend(actionsTabButton);

	// Create the tab
	const sheetBody = html.find(".sheet-body");
	const actionsTab = $(`<div class="tab actions flexcol" data-group="primary" data-tab="actions"></div>`);
	sheetBody.prepend(actionsTab);

	// add the list to the tab
	const actionsTabHtml = $(await API.renderActionsList(<any>app.actor));
	actionsTab.append(actionsTabHtml);

	// @ts-ignore
	actionsTabHtml.find(".item .item-name.rollable h4").click((event) => app._onItemSummary(event));

	// owner only listeners
	if (data.owner) {
		// @ts-ignore
		actionsTabHtml.find(".item .item-image").click((event) => app._onItemUse(event));
		// @ts-ignore
		actionsTabHtml.find(".item .item-recharge").click((event) => app._onItemRecharge(event));
	} else {
		actionsTabHtml.find(".rollable").each((i, el) => el.classList.remove("rollable"));
	}
}

/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once("init", async function () {
	log(true, `Initializing ${MODULE_ID}`);

	// Register custom module settings
	registerSettings();

	// Preload Handlebars templates
	await loadTemplates(Object.values(flattenObject(TEMPLATES)));

	const characterActionsModuleData = game.modules.get(MODULE_ID);

	if (characterActionsModuleData) {
		characterActionsModuleData.api = API;
	}

	// TODO TO REMOVE
	globalThis[MODULE_ID] = {
		renderActionsList: async function (...args) {
			log(false, {
				api: characterActionsModuleData?.api,
			});

			console.warn(
				MODULE_ID,
				"|",
				"accessing the module api on globalThis is deprecated and will be removed in a future update, check if there is an update to your sheet module"
			);
			return characterActionsModuleData?.api?.renderActionsList(...args);
		},
		isItemInActionList: function (...args) {
			console.warn(
				MODULE_ID,
				"|",
				"accessing the module api on globalThis is deprecated and will be removed in a future update, check if there is an update to your sheet module"
			);
			return characterActionsModuleData?.api?.isItemInActionList(...args);
		},
	};

	Hooks.call(`CharacterActions5eReady`, characterActionsModuleData?.api);
});

// default sheet injection if this hasn't yet been injected
Hooks.on("renderActorSheet5e", async (app, html, data) => {
	// short circut if the user has overwritten these settings
	switch (app.actor.type) {
		case "npc": {
			const injectNPCSheet = game.settings.get(MODULE_ID, MySettings.injectNPCs) as boolean;
			if (!injectNPCSheet) {
				return;
			}
			break;
		}
		case "vehicle": {
			const injectVehicleSheet = game.settings.get(MODULE_ID, MySettings.injectVehicles) as boolean;
			if (!injectVehicleSheet) {
				return;
			}
			break;
		}
		case "character": {
			const injectCharacterSheet = game.settings.get(MODULE_ID, MySettings.injectCharacters) as boolean;
			if (!injectCharacterSheet) {
				return;
			}
			break;
		}
	}

	log(false, "default sheet open hook firing", {
		app,
		html,
		data,
	});

	const actionsList = $(html).find(".character-actions-list-5e");

	log(false, "actionsListExists", { actionsListExists: actionsList.length });

	if (!actionsList.length) {
		await addActionsTab(app, html, data);
	}

	addFavoriteControls(app, html);
});

Hooks.once("devModeReady", ({ registerPackageDebugFlag }) => {
	registerPackageDebugFlag(MODULE_ID);
});
