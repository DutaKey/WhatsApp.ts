import { join } from "path";
import fs from "fs";
import Collection from "../utils/collection";
const collection = new Collection();

async function commandInit(client) {
	client.log("Collecting commands...", {
		source: "Command",
		type: "info",
	});
	let commandDir = join(__dirname, "../commands");
	let dir = fs.readdirSync(commandDir);
	dir.forEach(($dir) => {
		const commandFiles = fs
			.readdirSync(join(commandDir, $dir))
			.filter((file) => file.endsWith(".js"));
		for (let file of commandFiles) {
			const command = require(join(commandDir, $dir, file)).default;
			collection.add(command.name, command);
		}
	});
	client.log("Commands loaded, Total " + collection.size() + " Commands", {
		source: "Command",
	});
}

export { commandInit, collection };
