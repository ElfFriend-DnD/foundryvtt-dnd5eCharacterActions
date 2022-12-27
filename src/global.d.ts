declare namespace Game {
	interface ModuleData<T> {
		api?: Record<string, any>;
	}
}

declare namespace ActorSheet {
	interface Options {
		blockActionsTab?: boolean;
	}
}

interface Item5e extends Item {
	system: any;
	sort?: number;
	getFlag(namespace: string, key: string);
	effects: any;
	type: string;
	labels: any;
}

interface Actor5e extends Actor {
	system: any;
	items: Item5e[];
}

interface ActorSheet5e extends ActorSheet {}
