import type { Commands } from "../../types/command";

export default <Commands>{
	name: "ping",
	alias: ["p", "h"],
	category: "general",
	description: "Ping Command",
	prefix: true,
	async run({ msg, sock, client }) {
		msg.reply("pong!");
	},
};
