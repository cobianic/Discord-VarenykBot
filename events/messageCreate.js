const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");

module.exports = async (client, message) => {
	const mention = new RegExp(`^<@!?${ client.user.id }>( |)$`);
	const invite = `https://discord.com/oauth2/authorize?client_id=${ client.config.clientId }&permissions=${ client.config.permissions }&scope=${ client.config.scopes.toString()
		.replace(/,/g, '%20') }`;
	
	const buttons = new MessageActionRow()
		.addComponents(
			new MessageButton()
				.setStyle("LINK")
				.setLabel('Запросіть мене')
				.setURL(invite),
		);
	
	if (message.content.match(mention)) {
		const mentionEmbed = new MessageEmbed()
			.setColor(client.config.embedColor)
			.setDescription(
				`Мій префікс на цьому сервері \`/\` (слеш команда).\nНапишіть \`/help\` щоб побачити всі мої команди.\nЯкщо ви не можете їх побачити, будьласка виженіть і [запросіть](invite) мене на сервер ще раз з правильними дозволами.`,
			);
		
		message.channel.send({
			embeds: [mentionEmbed],
			components: [buttons],
		});
	}
};
