import { collection } from "../../client/command";
import type { Commands } from "../../types/command";

export default <Commands>{
	name: "menu",
	alias: ["help"],
	category: "general",
	description: "Menu command",
	prefix: true,
	async run({ msg, sock, client }) {
		const commandsList = collection
			.all()
			.map((command: any) => `*${command.name}*\n ${command.description}`)
			.join("\n");

		const replyMessage = `🚀 *Command List* 🚀\n\n${commandsList}\n\nTotal: ${collection.size()} Commands`;
		msg.reply(replyMessage);
	},
};
