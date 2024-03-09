import { collection } from "../client/command";
import UserModel from "../database/users/controllers/users.controller";

const multi_pref = new RegExp(
	"^[" + "!#$%&?/;:,.<>~-+=".replace(/[|\\{}()[\]^$+*?.\-\^]/g, "\\$&") + "]"
);

const chatEvent = async (msg, sock, client) => {
	try {
		let { body, senderNumber } = msg;
		// users
		await UserModel.findAndCreate(senderNumber);

		// cmd
		let cmdName = (body?.split(" ")[0] || "").replace(multi_pref, "");
		let userPrefix = cmdName.length !== body?.split(" ")[0]?.length;
		let cmd =
			collection.get(cmdName) ||
			collection.find((cmd) => cmd.alias?.includes(cmdName));
		if (!cmd) return;
		const requiresPrefix = cmd.prefix || false;
		if ((requiresPrefix && userPrefix) || (!requiresPrefix && !userPrefix)) {
			cmd.run({ msg, sock, client });
		}
	} catch (e) {
		client.log(e, "error");
	}
};

export = chatEvent;
