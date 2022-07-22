const SlashCommand = require("../../lib/SlashCommand");
const moment = require("moment");
require("moment-duration-format");
const { MessageEmbed } = require("discord.js");
const os = require("os");

const command = new SlashCommand()
	.setName("stats")
	.setDescription("Технічна інформація")
	.setRun(async (client, interaction) => {
		// get OS info
		const osver = os.platform() + " " + os.release();
		
		let player;
		if (client.manager) {
			player = client.manager.players.get(interaction.guild.id);
		}
		
		// Get nodejs version
		const nodeVersion = process.version;
		
		// get the uptime in a human readable format
		const runtime = moment
			.duration(client.uptime)
			.format("d[ дн]・h[ г]・m[ хв]・s[ с]");
		// show lavalink uptime in a nice format
		const lavauptime = moment
			.duration(client.manager.nodes.values().next().value.stats.uptime)
			.format(" D[дн], H[г], m[хв]");
		// show lavalink memory usage in a nice format
		const lavaram = (
			client.manager.nodes.values().next().value.stats.memory.used /
			1024 /
			1024
		).toFixed(2);
		// sow lavalink memory alocated in a nice format
		const lavamemalocated = (
			client.manager.nodes.values().next().value.stats.memory.allocated /
			1024 /
			1024
		).toFixed(2);
		// show system uptime
		var sysuptime = moment
			.duration(os.uptime() * 1000)
			.format("d[ дн]・h[ г]・m[ хв]・s[ с]");
		
		// get commit hash and date
		let gitHash = "unknown";
		try {
			gitHash = require("child_process")
				.execSync("git rev-parse HEAD")
				.toString()
				.trim();
		} catch (e) {
			// do nothing
			gitHash = "unknown";
		}
		
		const statsEmbed = new MessageEmbed()
			.setTitle(`Інформація про ${ client.user.username }`)
			.setColor(client.config.embedColor)
			.setDescription(
				`\`\`\`yml\nAPI: ${ client.ws.ping } мс\nRuntime: ${ runtime }\`\`\``,
			)
			.setFields([
				{
					name: `Статистика Lavalink`,
					value: `\`\`\`yml\n${ player? player.node.options.host + "\n" : "" }Uptime: ${ lavauptime }\nRAM: ${ lavaram } MB\nPlaying: ${
						client.manager.nodes.values().next().value.stats.playingPlayers
					} з ${
						client.manager.nodes.values().next().value.stats.players
					}\`\`\``,
					inline: true,
				},
				{
					name: "Статистика бота",
					value: `\`\`\`yml\nGuilds: ${
						client.guilds.cache.size
					} \nNodeJS: ${ nodeVersion } \`\`\``,
					inline: true,
				},
				{
					name: "Статистика системи",
					value: `\`\`\`yml\nOS: ${ osver }\nUptime: ${ sysuptime }\n\`\`\``,
					inline: false,
				},
			])
			.setFooter({ text: `Білд: ${ gitHash }` });
		return interaction.reply({ embeds: [statsEmbed], ephemeral: false });
	});

module.exports = command;
