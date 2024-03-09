import { mongoose } from "../../connection";

import { usersModel } from "./users.model";
require("dotenv").config();

mongoose.Promise = global.Promise;

const db = {
	mongoose: mongoose,
	uri: process.env.DB_URI || "",
	users: usersModel(mongoose),
};
export = db;
