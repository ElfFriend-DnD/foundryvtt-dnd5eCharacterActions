import { MySettings, MODULE_ID } from "./constants";

export const registerSettings = function () {
	// Register any custom module settings here
	game.settings.register(MODULE_ID, MySettings.limitActionsToCantrips, {
		name: `${MODULE_ID}.settings.limitActionsToCantrips.Label`,
		default: false,
		type: Boolean,
		scope: "client",
		config: true,
		hint: `${MODULE_ID}.settings.limitActionsToCantrips.Hint`,
	});

	game.settings.register(MODULE_ID, MySettings.includeOneMinuteSpells, {
		name: `${MODULE_ID}.settings.includeOneMinuteSpells.Label`,
		default: true,
		type: Boolean,
		scope: "client",
		config: true,
		hint: `${MODULE_ID}.settings.includeOneMinuteSpells.Hint`,
	});

	game.settings.register(MODULE_ID, MySettings.includeSpellsWithEffects, {
		name: `${MODULE_ID}.settings.includeSpellsWithEffects.Label`,
		default: true,
		type: Boolean,
		scope: "client",
		config: true,
		hint: `${MODULE_ID}.settings.includeSpellsWithEffects.Hint`,
	});

	game.settings.register(MODULE_ID, MySettings.includeConsumables, {
		name: `${MODULE_ID}.settings.includeConsumables.Label`,
		default: true,
		type: Boolean,
		scope: "client",
		config: true,
		hint: `${MODULE_ID}.settings.includeConsumables.Hint`,
	});

	game.settings.register(MODULE_ID, MySettings.injectCharacters, {
		name: `${MODULE_ID}.settings.injectCharacters.Label`,
		default: true,
		type: Boolean,
		scope: "client",
		config: true,
		hint: `${MODULE_ID}.settings.injectCharacters.Hint`,
	});

	game.settings.register(MODULE_ID, MySettings.injectNPCs, {
		name: `${MODULE_ID}.settings.injectNPCs.Label`,
		default: true,
		type: Boolean,
		scope: "world",
		config: true,
		hint: `${MODULE_ID}.settings.injectNPCs.Hint`,
	});

	game.settings.register(MODULE_ID, MySettings.injectVehicles, {
		name: `${MODULE_ID}.settings.injectVehicles.Label`,
		default: true,
		type: Boolean,
		scope: "world",
		config: true,
		hint: `${MODULE_ID}.settings.injectVehicles.Hint`,
	});
};
