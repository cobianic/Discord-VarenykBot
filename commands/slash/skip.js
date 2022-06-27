const SlashCommand = require("../../lib/SlashCommand");
const { MessageEmbed } = require("discord.js");

const command = new SlashCommand()
	.setName("skip")
	.setDescription("Пропускає трек, що грає зараз")
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
						.setDescription("Немає чого пропускати")
				],
				ephemeral: true
			});
		}

		player.queue.previous = player.queue.current;
		player.stop();

		interaction.reply({
			embeds: [
				new MessageEmbed()
					.setColor(client.config.embedColor)
					.setDescription("✅ | **Пропущено!**")
			]
		});
	});

module.exports = command;
