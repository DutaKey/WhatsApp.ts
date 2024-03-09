import { WaClient } from "./client/client";
const client = new WaClient();
client.connect("mongo", client);
