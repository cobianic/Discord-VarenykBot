const { Router } = require("express");
const api = Router();

const package = require("../../package.json");
const client = require("../../")

api.get("/", (req, res) => {
	let data = {
		name: client.user.username,
		version: package.version,
		commands: client.slashCommands.map(cmd => {
			return {
				name: cmd.name,
				description: cmd.description,
			}
		}),
		inviteURL: `https://discord.com/oauth2/authorize?client_id=${ client.config.clientId
		}&permissions=${ client.config.permissions
		}&scope=${ client.config.scopes.toString().replace(/,/g, "%20") }`,
	}
	res.json(data)
});

module.exports = api;
