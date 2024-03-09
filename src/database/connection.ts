import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import { join } from "path";
dotenv.config();

const connectToMongo = async (client) => {
	if (!fs.existsSync(join(".env"))) {
		return client.log(`Rename .env.example to .env and enter your MONGO_URI`, {
			type: "error",
			source: "MONGO",
		});
	} else if (fs.existsSync(join(".env")) && !process.env.MONGO_URI) {
		return client.log(`Enter your MONGO_URI in .env file`, {
			type: "error",
			source: "MONGO",
		});
	}

	client.log("Connecting to MongoDB...", { type: "info", source: "MONGO" });
	await mongoose.connect(process.env.MONGO_URI);
	client.log("Connected to MongoDB", { source: "MONGO" });
};

export { connectToMongo, mongoose };
