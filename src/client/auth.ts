import { BufferJSON, initAuthCreds, proto } from "@whiskeysockets/baileys";
import { mongoose } from "../database/connection";

let AuthenticationStateModel: mongoose.Model<any>;

const useMongoAuthState = async (collectionName: string) => {
	if (!AuthenticationStateModel) {
		const AuthenticationStateSchema = new mongoose.Schema({
			_id: String,
			data: String,
		});

		AuthenticationStateModel = mongoose.model(
			collectionName,
			AuthenticationStateSchema
		);
	}

	const writeData = async (data: unknown, file: string) => {
		await AuthenticationStateModel.updateOne(
			{ _id: fixFileName(file) },
			{ $set: { data: JSON.stringify(data, BufferJSON.replacer) } },
			{ upsert: true }
		);
	};

	const readData = async (file: string) => {
		const document = await AuthenticationStateModel.findOne({
			_id: fixFileName(file),
		});
		if (!document) return null;
		return JSON.parse(document.data, BufferJSON.reviver);
	};

	const removeData = async (file: string) => {
		await AuthenticationStateModel.deleteOne({ _id: fixFileName(file) });
	};

	const fixFileName = (file) => file?.replace(/\//g, "__")?.replace(/:/g, "-");

	const creds = (await readData("creds")) ?? initAuthCreds();

	return {
		state: {
			creds,
			keys: {
				get: async (type, ids) => {
					const data = {};
					await Promise.all(
						ids.map(async (id) => {
							let value = await readData(`${type}-${id}`);
							if (type === "app-state-sync-key" && value) {
								value = proto.Message.AppStateSyncKeyData.fromObject(value);
							}
							data[id] = value;
						})
					);
					return data;
				},
				set: async (data) => {
					const tasks = [];
					for (const category in data) {
						for (const id in data[category]) {
							const value = data[category][id];
							const file = `${category}-${id}`;
							tasks.push(value ? writeData(value, file) : removeData(file));
						}
					}
					await Promise.all(tasks);
				},
			},
		},
		saveCreds: async (): Promise<void> => {
			await writeData(creds, "creds");
		},
	};
};

export = useMongoAuthState;
