import makeWASocket, {
	DisconnectReason,
	fetchLatestWaWebVersion,
	useMultiFileAuthState,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import { connectToMongo } from "../database/connection";
import { join } from "path";
import { commandInit } from "./command";

import useMongoAuthState from "./auth";
import Pino from "pino";
import cfonts from "cfonts";
import chatEvent from "../events/message-upsert";
import serialize from "./serialize";

export class WaClient {
	connectionType;
	logConfig;
	constructor() {
		console.clear();
		cfonts.say("WhatsApp.ts");
		this.connectionType = "";
		this.logConfig = {
			colors: {
				success: "\x1b[32m",
				info: "\x1b[34m",
				warning: "\x1b[33m",
				error: "\x1b[31m",
				normal: "\x1b[38;5;34m",
			},
			emojis: {
				success: "✅",
				info: "ℹ",
				warning: "⚠️",
				error: "❌",
				normal: "",
			},
			resetColor: "\x1b[0m",
		};
	}
	async connect(type: "local" | "mongo", client) {
		if (type !== "local" && type !== "mongo") {
			throw new Error("Invalid connection type. Must be 'local' or 'mongo'.");
		}
		await connectToMongo(client);
		await commandInit(client);
		this.connectionType = type;
		const { version } = await fetchLatestWaWebVersion(null);
		const { state, saveCreds } =
			this.connectionType === "local"
				? await useMultiFileAuthState(join("./session"))
				: await useMongoAuthState("session");
		const sock = makeWASocket({
			version,
			printQRInTerminal: true,
			auth: state,
			logger: Pino({ level: "silent" }),
			browser: ["Whatsapp.ts", "Safari", "3.0.0"],
			syncFullHistory: false,
		});
		sock.ev.on("creds.update", saveCreds);
		sock.ev.on("connection.update", (update) => {
			const { connection, lastDisconnect } = update;
			if (connection === "close") {
				const shouldReconnect =
					(lastDisconnect.error as Boom)?.output?.statusCode !==
					DisconnectReason.loggedOut;
				this.log(
					"Connection Closed due to " +
						lastDisconnect.error +
						", reconnecting " +
						shouldReconnect,
					{ type: "warning", source: "WaClient" }
				);
				if (shouldReconnect) {
					this.connect(this.connectionType, client);
				}
			} else if (connection === "connecting") {
				this.log("Connection Connecting...", {
					type: "info",
					source: "WaClient",
				});
			} else if (connection === "open") {
				this.log("Connection Opened", { source: "WaClient" });
				this.log("\nGithub:	https://github.com/DutaKey/whatsapp.ts", {
					type: "normal",
					source: "WaClient",
				});
				this.log(
					sock.user.name == undefined
						? "BotName: " + "-"
						: "BotName: " + sock.user.name,
					{
						type: "normal",
						source: "WaClient",
					}
				);
				this.log("BotNumber: " + sock.user.id.split(":")[0] || "-", {
					type: "normal",
					source: "WaClient",
				});
			}
		});

		sock.ev.on("messages.upsert", async (m) => {
			try {
				if (m.type !== "notify") return;
				let msg = serialize(JSON.parse(JSON.stringify(m.messages[0])), sock);
				if (!msg.message) return;
				if (msg.key && msg.key.remoteJid === "status@broadcast") return;
				if (
					msg.type === "protocolMessage" ||
					msg.type === "senderKeyDistributionMessage" ||
					!msg.type ||
					msg.type === ""
				)
					return;
				chatEvent(msg, sock, this);
			} catch (e) {
				this.log(e, { type: "error", source: "WaClient" });
			}
		});
	}

	log(text: any, { type = "success", source = "General" } = {}) {
		const { colors, emojis, resetColor } = this.logConfig;
		const timestamp = new Date().toLocaleTimeString();

		if (type in colors && type in emojis) {
			const emoji = emojis[type];
			const color = colors[type];
			if (type === "normal") return console.log(`${color}${text}${resetColor}`);
			const logText = `${color}[${resetColor}${timestamp}${color}] ${emoji} [${type.toUpperCase()} - ${source}] ${text}`;
			try {
				console.log(logText + resetColor);
			} catch (error) {
				console.error("Error while logging:", error);
			}
		} else {
			console.error(`Unrecognized log type: ${type}`);
		}
	}

	welcome() {}
}
