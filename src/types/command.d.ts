declare type Commands = {
	name: string;
	alias: string[];
	category: string;
	description: string;
	prefix: boolean;
	run: () => unknown;
};

export { Commands };
