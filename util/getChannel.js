/**
 *
 * @param {import("../lib/DiscordMusicBot")} client
 * @param {import("discord.js").GuildCommandInteraction} interaction
 * @returns
 */
module.exports = async (client, interaction) => {
	return new Promise(async (resolve) => {
		if (!interaction.member.voice.channel) {
			await interaction.reply({
				embeds: [
					client.ErrorEmbed(
						"Хазяїн, ви не в голосовому каналі"
					)
				]
			});
			return resolve(false);
		}
		if (
			interaction.guild.me.voice.channel &&
			interaction.member.voice.channel.id !==
			interaction.guild.me.voice.channel.id
		) {
			await interaction.reply({
				embeds: [
					client.ErrorEmbed(
						"Хазяїн, ви не в моєму голосовому каналі"
					)
				]
			});
			return resolve(false);
		}
		if (!interaction.member.voice.channel.joinable) {
			await interaction.reply({
				embeds: [
					client.ErrorEmbed(
						"В мене недостатньо дозволів, щоб я міг приєднатись до голосового каналу (つ﹏<)･ﾟ｡"
					)
				]
			});
			return resolve(false);
		}

		resolve(interaction.member.voice.channel);
	});
};
