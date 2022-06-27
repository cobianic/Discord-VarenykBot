const { MessageEmbed } = require("discord.js");
/**
 *
 * @param {import("../lib/DiscordMusicBot")} client
 * @param {import("discord.js").ButtonInteraction} interaction
 */
module.exports = async (client, interaction) => {
	let guild = client.guilds.cache.get(interaction.customId.split(":")[1]);
	let property = interaction.customId.split(":")[2];
	let player = client.manager.get(guild.id);
	
	if (!player) {
		await interaction.reply({
			embeds: [
				client.ErrorEmbed("Нічого не грає, нічим керувати"),
			],
		});
		setTimeout(() => {
			interaction.deleteReply();
		}, 5000);
		return;
	}
	if (!interaction.member.voice.channel) {
		const joinEmbed = new MessageEmbed()
			.setColor("RED")
			.setDescription(
				"❌ | Хазяїн, ви не в голосовому каналі",
			);
		return interaction.reply({ embeds: [joinEmbed], ephemeral: true });
	}
	
	if (
		interaction.guild.me.voice.channel &&
		!interaction.guild.me.voice.channel.equals(interaction.member.voice.channel)
	) {
		const sameEmbed = new MessageEmbed()
			.setColor("RED")
			.setDescription(
				"❌ | Хазяїн, ви не в моєму голосовому каналі",
			);
		return interaction.reply({ embeds: [sameEmbed], ephemeral: true });
	}
	
	if (property === "Stop") {
		player.queue.clear();
		player.stop();
		client.warn(`Player: ${ player.options.guild } | Successfully stopped the player`);
		const msg = await interaction.channel.send({
			embeds: [
				client.Embed(`Від'єднався!`),
			],
		});
		setTimeout(() => {
			msg.delete();
		}, 5000);
		
		interaction.update({
			components: [client.createController(player.options.guild, player)],
		});
		
		return;
	}
	
	// if theres no previous song, return an error.
	if (property === "Replay") {
		const previousSong = player.queue.previous;
		const currentSong = player.queue.current;
		const nextSong = player.queue[0];
		
		if (!previousSong
			|| previousSong === currentSong
			|| previousSong === nextSong) {
			const msg = await interaction.channel.send({
				embeds: [
					new MessageEmbed()
						.setColor("RED")
						.setDescription("Немає попередньої пісні"),
				],
			});
			setTimeout(() => {
				msg.delete();
			}, 5000);
			return interaction.deferUpdate();
		}
		if (previousSong !== currentSong && previousSong !== nextSong) {
			player.queue.splice(0, 0, currentSong);
			player.play(previousSong);
			return interaction.deferUpdate();
		}
	}
	
	if (property === "PlayAndPause") {
		if (!player || (!player.playing && player.queue.totalSize === 0)) {
			const msg = await interaction.channel.send({
				embeds: [
					new MessageEmbed()
						.setColor("RED")
						.setDescription("Зараз нічого не грає"),
				],
			});
			setTimeout(() => {
				msg.delete();
			}, 5000);
			return interaction.deferUpdate();
		} else {
			
			if (player.paused) {
				player.pause(false);
			} else {
				player.pause(true);
			}
			client.warn(`Player: ${ player.options.guild } | Successfully ${ player.paused? "paused" : "resumed" } the player`);
			
			return interaction.update({
				components: [client.createController(player.options.guild, player)],
			});
		}
	}
	
	if (property === "Next") {
		player.stop();
		return interaction.deferUpdate();
	}
	
	// if (property === "Loop") {
	//   if (player.trackRepeat) {
	//     player.setTrackRepeat(false);
	//     player.setQueueRepeat(true);
	//   } else if (player.queueRepeat) {
	//     player.setQueueRepeat(false);
	//   } else {
	//     player.setTrackRepeat(true);
	//   }
	//   client.warn(`Player: ${player.options.guild} | Successfully toggled loop the player`);
	//
	//   interaction.update({
	//     components: [client.createController(player.options.guild, player)],
	//   });
	//   return;
	// }
	
	const controllerEmbed = new MessageEmbed()
		.setColor("RED")
		.setDescription("Невідома команда контролера");
	return interaction.reply({
		embeds: [controllerEmbed], ephemeral: true
	});
};
