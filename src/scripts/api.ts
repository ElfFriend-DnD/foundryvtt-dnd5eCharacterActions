import { isItemInActionList, log } from "./helpers";
import { getActorActionsData } from "./getActorActionsData";
import { addFavoriteControls } from "./handleFavoriteControls";
import { MODULE_ID } from "./constants";

const API = {
	// async executeActionArr(...inAttributes) {
	// 	if (!Array.isArray(inAttributes)) {
	// 		throw error("executeActionArr | inAttributes must be of type array");
	// 	}
	// 	let [options] = inAttributes;
	// 	options = {
	// 		...options,
	// 		fromSocket: true,
	// 	};
	// 	this.executeAction(options);
	// },

	getActorActionsData,
	isItemInActionList,
	/**
	 * Renders the html of the actions list for the provided actor data
	 */
	async renderActionsList(
		actorData: Actor5e,
		options?: {
			rollIcon?: string;
		}
	) {
		const actionData = getActorActionsData(actorData);

		log(false, "renderActionsList", {
			actorData,
			data: actionData,
		});

		return renderTemplate(`modules/${MODULE_ID}/templates/actor-actions-list.hbs`, {
			actionData,
			//@ts-ignore
			abilities: game.dnd5e.config.abilityAbbreviations,
			activationTypes: {
				//@ts-ignore
				...game.dnd5e.config.abilityActivationTypes,
				other: game.i18n.localize(`DND5E.ActionOther`),
			},
			//@ts-ignore
			damageTypes: { ...game.dnd5e.config.damageTypes, ...game.dnd5e.config.healingTypes },
			damageTypeIconMap: this.damageTypeIconMap,
			rollIcon: options?.rollIcon,
			isOwner: actorData.isOwner,
		});
	},

	damageTypeIconMap: {
		acid: '<i class="fas fa-hand-holding-water"></i>',
		bludgeoning: '<i class="fas fa-gavel"></i>',
		cold: '<i class="fas fa-snowflake"></i>',
		fire: '<i class="fas fa-fire-alt"></i>',
		force: '<i class="fas fa-hat-wizard"></i>',
		lightning: '<i class="fas fa-bolt"></i>',
		necrotic: '<i class="fas fa-skull"></i>',
		piercing: '<i class="fas fa-thumbtack"></i>',
		poison: '<i class="fas fa-skull-crossbones"></i>',
		psychic: '<i class="fas fa-brain"></i>',
		radiant: '<i class="fas fa-sun"></i>',
		slashing: '<i class="fas fa-cut"></i>',
		thunder: '<i class="fas fa-wind"></i>',
		healing: '<i class="fas fa-heart"></i>',
		temphp: '<i class="fas fa-shield-alt"></i>',
	},
};
export default API;
