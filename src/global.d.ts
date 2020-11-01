/* This is by no means an accurate type for the 5e system, but it is enough of a start for ts to not complain */

type ActionType5e = 'mwak' | 'rwak' | 'rsak' | 'msak' | 'save';
type ActivationType5e = 'action' | 'bonus' | 'reaction' | 'special';
type ItemType5e = 'weapon' | 'equipment' | 'consumable' | 'tool' | 'loot' | 'class' | 'spell' | 'feat' | 'backpack';

interface ItemData5e extends ItemData {
  ability?: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
  actionType?: ActionType5e;
  activation?: {
    type?: ActivationType5e | '';
  };
  attackBonus?: number;
  damage?: {
    parts: string[][];
  };
  equipped?: boolean;
  level?: number; // spell level if applicable
  preparation?: {
    mode: 'always' | 'prepared';
    prepared: boolean;
  };
  proficient?: boolean;
  properties?: {
    fin?: boolean;
  };
  weaponType?: 'simpleM' | 'martialM' | 'simpleR' | 'martialR' | 'natural' | 'improv' | 'siege';
}

interface Item5e extends Item<ItemData5e> {
  data: ItemData5e;
  labels: Record<string, string>;
  type: ItemType5e;
}

type AbilityBonus = {
  check: string;
  save: string;
  skill: string;
};

type AttackBonus = {
  attack: string;
  damage: string;
};

type SaveBonus = {
  dc: number;
};

interface ActorSheet5eCharacterSheetDataType extends ActorData {
  abilities: Record<
    'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha',
    {
      mod: number;
    }
  >;
  attributes: {
    prof?: number;
    spellcasting?: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
  };
  bonuses: {
    mwak: AttackBonus;
    rwak: AttackBonus;
    rsak: AttackBonus;
    msak: AttackBonus;
    abilities: AbilityBonus;
    save: SaveBonus;
  };
}

interface ActorSheet5eCharacterSheetData extends ActorSheetData<ActorSheet5eCharacterSheetDataType> {
  actor: Actor5eCharacter;
  data: ActorSheet5eCharacterSheetDataType;
  inventory: {
    label: string;
    items: Item5e[];
  }[];
  spellbook?: {
    label: string;
    spells: Item5e[];
  }[];
  features: {
    label: string;
    items: Item5e[];
  }[];
}

declare class ActorSheet5eCharacter extends ActorSheet {
  sheetData: ActorSheet5eCharacterSheetData;
  getData(): ActorSheet5eCharacterSheetData;
}

declare class Actor5eCharacter extends Actor<ActorSheet5eCharacterSheetDataType> {
  data: ActorSheet5eCharacterSheetDataType;
  items: Collection<Item5e>;
}

/* module specific types */

interface CompactBeyond5eSheetSheetData extends ActorSheet5eCharacterSheetData {
  actionsData: Record<string, Set<Item5e>>;
}

declare class CompactBeyond5eSheet extends ActorSheet5eCharacter {
  sheetData: CompactBeyond5eSheetSheetData;
}
