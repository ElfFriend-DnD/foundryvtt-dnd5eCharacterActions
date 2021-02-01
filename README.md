# Character Actions 5e

![Latest Release Download Count](https://img.shields.io/badge/dynamic/json?label=Downloads@latest&query=assets%5B1%5D.download_count&url=https%3A%2F%2Fapi.github.com%2Frepos%2FElfFriend-DnD%2Ffoundryvtt-dnd5eCharacterActions%2Freleases%2Flatest)
![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fcharacter-actions-list-5e&colorB=4aa94a)
![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2FElfFriend-DnD%2Ffoundryvtt-dnd5eCharacterActions%2Fmain%2Fsrc%2Fmodule.json&label=Foundry%20Version&query=$.compatibleCoreVersion&colorB=orange)
[![ko-fi](https://img.shields.io/badge/-buy%20me%20a%20coke-%23FF5E5B)](https://ko-fi.com/elffriend)


Theoretically, this module provides a placable reusable "component" which details all of the actions a given Character Actor can take.

## Installation

Module JSON:

```
https://github.com/ElfFriend-DnD/foundryvtt-dnd5eCharacterActions/releases/latest/download/module.json
```

## Gallery


## Added Scene Config Options

| **Name**                      | Description                                                                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Limit Actions to Cantrips** | Path to the file that will be used for the Unexplored Fog. This image should be the same size as your background image or stretching will occur. |


### Compatibility

I'm honestly not sure how well this will play with modules that affect character sheets or dice rolls, I'll try to test as many as possible but if something is obviously breaking please create and issue here and I'll see what I can do.

| **Name**                                                                                            |       Works        | Notes                                                             |
| --------------------------------------------------------------------------------------------------- | :----------------: | ----------------------------------------------------------------- |
| [Better Rolls 5e](https://github.com/RedReign/FoundryVTT-BetterRolls5e)                             |        :x:         | Listeners are not activated correctly.                            |
| [Midi-QOL](https://gitlab.com/tposney/midi-qol)                                                     | :white_check_mark: | Works as expected.                                                |
| [Minimal Roll Enhancements](https://github.com/schultzcole/FVTT-Minimal-Rolling-Enhancements-DND5E) | :white_check_mark: | Works as expected.                                                |
| [FoundryVTT Magic Items](https://gitlab.com/riccisi/foundryvtt-magic-items)                         |      :shrug:       | Spells assigned to magic items do not appear in the Actions List. |
| [Inventory+](https://github.com/syl3r86/inventory-plus)                                             | :white_check_mark: | Inventory+ organization has no effect on Actions Tab              |

## Known Issues

- There is an interaction with Better Rolls 5e that makes the Actions Tab items not roll "better-y" but causes other items to roll double.

## Acknowledgements

Bootstrapped with Nick East's [create-foundry-project](https://gitlab.com/foundry-projects/foundry-pc/create-foundry-project).

Mad props to the [League of Extraordinary FoundryVTT Developers](https://forums.forge-vtt.com/c/package-development/11) community which helped me figure out a lot.
