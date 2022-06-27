const { MessageEmbed } = require("discord.js");
const SlashCommand = require("../../lib/SlashCommand");

const command = new SlashCommand()
	.setName("filters")
	.setDescription("додає або видаляє фільтри")
	.addStringOption((option) =>
		option
			.setName("пресет")
			.setDescription("який фільтр додати?")
			.setRequired(true)
			.addChoices(
				{ name: "Nightcore", value: "nightcore" },
				{ name: "BassBoost", value: "bassboost" },
				{ name: "Vaporwave", value: "vaporwave" },
				{ name: "Pop", value: "pop" },
				{ name: "Soft", value: "soft" },
				{ name: "Treblebass", value: "treblebass" },
				{ name: "Eight Dimension", value: "eightD" },
				{ name: "Karaoke", value: "karaoke" },
				{ name: "Vibrato", value: "vibrato" },
				{ name: "Tremolo", value: "tremolo" },
				{ name: "Reset", value: "off" },
			),
	)
	
	.setRun(async (client, interaction, options) => {
		const args = interaction.options.getString("пресет");
		
		let channel = await client.getChannel(client, interaction);
		if (!channel) {
			return;
		}
		
		let player;
		if (client.manager) {
			player = client.manager.players.get(interaction.guild.id);
		} else {
			return interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor("RED")
						.setDescription("Немає з'єднання з нодою Lavalink"),
				],
			});
		}
		
		if (!player) {
			return interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor("RED")
						.setDescription("Нічого не грає"),
				],
				ephemeral: true,
			});
		}
		
		// create a new embed
		let thing = new MessageEmbed().setColor(client.config.embedColor);
		
		if (args == "nightcore") {
			thing.setDescription("✅ | Фільтр Nightcore увімкнений!");
			player.nightcore = true;
		} else if (args == "bassboost") {
			thing.setDescription("✅ | Фільтр BassBoost увімкнений!");
			player.bassboost = true;
		} else if (args == "vaporwave") {
			thing.setDescription("✅ | Фільтр Vaporwave увімкнений!");
			player.vaporwave = true;
		} else if (args == "pop") {
			thing.setDescription("✅ | Фільтр Pop увімкнений!");
			player.pop = true;
		} else if (args == "soft") {
			thing.setDescription("✅ | Фільтр Soft увімкнений!");
			player.soft = true;
		} else if (args == "treblebass") {
			thing.setDescription("✅ | Фільтр Treblebass увімкнений!");
			player.treblebass = true;
		} else if (args == "eightD") {
			thing.setDescription("✅ | Фільтр Eight Dimension увімкнений!");
			player.eightD = true;
		} else if (args == "karaoke") {
			thing.setDescription("✅ | Фільтр Karaoke увімкнений!");
			player.karaoke = true;
		} else if (args == "vibrato") {
			thing.setDescription("✅ | Фільтр Vibrato увімкнений!");
			player.vibrato = true;
		} else if (args == "tremolo") {
			thing.setDescription("✅ | Фільтр Tremolo увімкнений!");
			player.tremolo = true;
		} else if (args == "off") {
			thing.setDescription("✅ | Еквалайзер очищений");
			player.reset();
		} else {
			thing.setDescription("❌ | Неправильний фільтр");
		}
		
		return interaction.reply({ embeds: [thing] });
	});

module.exports = command;
