const SlashCommand = require("../../lib/SlashCommand");
const { MessageEmbed } = require("discord.js");

const command = new SlashCommand()
	.setName("loopqueue")
	.setDescription("Зациклює чергу відтворення (вкл/викл)")
	.setRun(async (client, interaction, options) => {
		let channel = await client.getChannel(client, interaction);
		if (!channel) return;

		let player;
		if (client.manager)
			player = client.manager.players.get(interaction.guild.id);
		else
			return interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor("RED")
						.setDescription("Немає з\'єднання з нодою Lavalink")
				]
			});

		if (!player) {
			return interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor("RED")
						.setDescription("Нічого не грає")
				],
				ephemeral: true
			});
		}

		if (player.setQueueRepeat(!player.queueRepeat)) ;
		const queueRepeat = player.queueRepeat ? "ввімкнене" : "вимкнене";

		interaction.reply({
			embeds: [
				new MessageEmbed()
					.setColor(client.config.embedColor)
					.setDescription(
						`:thumbsup: | **Зациклювання черги \`${queueRepeat}\`**`
					)
			]
		});
	});

module.exports = command;
