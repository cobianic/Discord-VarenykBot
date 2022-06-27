const SlashCommand = require("../../lib/SlashCommand");
const { MessageEmbed } = require("discord.js");

const command = new SlashCommand()
	.setName("random")
	.setDescription("Вибирає один з варіантів. Приклад: /random гра1 гра2 гра3")
	.addStringOption((option) =>
		option
			.setName("варіанти")
			.setDescription("Строка з варіантами")
			.setRequired(true)
	)
	.setRun(async (client, interaction, options) => {
		let tempArray = options.getString("варіанти").trim()
			.replace(/([,;])/g, " ").split(/\s+/g);

		const embed = new MessageEmbed()
			.setColor(client.config.embedColor)
			.setDescription(`Бог рандому вибрав **${tempArray[Math.floor(Math.random() * tempArray.length)]}** !`);

		return interaction.reply({ embeds: [embed] });
	});

module.exports = command;
