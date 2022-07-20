const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
const pms = require("pretty-ms");
const load = require("lodash");
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
	
	if (property === "Queue") {
		// await interaction.deferReply().catch(() => {
		// });
		
		if (!player.queue.size || player.queue.size === 0) {
			let song = player.queue.current;
			const embed = new MessageEmbed()
				.setColor(client.config.embedColor)
				.setDescription(`**♪ | Зараз грає:** [${ song.title }](${ song.uri })`)
				.addFields(
					{
						name: "Тривалість",
						value: song.isStream
							? `\`стрім\``
							: `\`${ pms(player.position, { colonNotation: true }) } / ${ pms(
								player.queue.current.duration,
								{ colonNotation: true },
							) }\``,
						inline: true,
					},
					{
						name: "Треків в черзі",
						value: `\`${ player.queue.totalSize - 1 }\``,
						colonNotation: true,
						inline: true,
					},
				);
			
			await interaction.reply({
				embeds: [embed],
			});
		} else {
			let queueDuration = player.queue.duration.valueOf();
			if (player.queue.current.isStream) {
				queueDuration -= player.queue.current.duration;
			}
			for (let i = 0; i < player.queue.length; i++) {
				if (player.queue[i].isStream) {
					queueDuration -= player.queue[i].duration;
				}
			}
			console.log('queueDuration = ', queueDuration)
			
			const mapping = player.queue.map(function (t, i) {
				if (t.isStream) {
					return `\` ${ ++i } \` [${ t.title }](${ t.uri })\u00A0\u00A0(стрім)`;
				} else {
					return `\` ${ ++i } \` [${ t.title }](${ t.uri })\u00A0\u00A0[${ pms(t.duration, {
						colonNotation: true,
					}) }]`;
				}
			});
			console.log('mapping = ', mapping)
			
			const chunk = load.chunk(mapping, 10);
			console.log('chunk = ', chunk)
			const pages = chunk.map((s) => s.join("\n"));
			console.log('pages = ', pages)
			let page = interaction.options.getNumber("page");
			if (!page) {
				page = 0;
			}
			if (page) {
				page = page - 1;
			}
			if (page > pages.length) {
				page = 0;
			}
			if (page < 0) {
				page = 0;
			}
			console.log('page = ', page)
			
			if (player.queue.size < 11 || player.queue.totalSize < 11) {
				let song = player.queue.current;
				const embedTwo = new MessageEmbed()
					.setColor(client.config.embedColor)
					.setDescription(
						`**♪ | Зараз грає:** [${ song.title }](${ song.uri }) \n\n**Далі:**\n${ pages[page] }`,
					)
					.addFields(
						{
							name: "Тривалість",
							value: song.isStream
								? `\`стрім\``
								: `\`${ pms(player.position, { colonNotation: true }) } / ${ pms(
									player.queue.current.duration, {
										colonNotation: true,
									}) }\``,
							inline: true,
						},
						{
							name: "Загальна тривалість черги",
							value: `\`${ pms(queueDuration, {
								colonNotation: true,
							}) }\``,
							inline: true,
						},
						{
							name: "Загалом треків",
							value: `\`${ player.queue.totalSize - 1 }\``,
							colonNotation: true,
							inline: true,
						},
					)
					.setFooter({
						text: `Сторінка ${ page + 1 }/${ pages.length }`,
					});
				
				await interaction
					.update({
						embeds: [embedTwo],
					})
					.catch(() => {
					});
				// } else {
				// 	let song = player.queue.current;
				// 	const embedThree = new MessageEmbed()
				// 		.setColor(client.config.embedColor)
				// 		.setDescription(
				// 			`**♪ | Зараз грає:** [${ song.title }](${ song.uri }) \n\n**Далі:**\n${ pages[page] }`,
				// 		)
				// 		.addFields(
				// 			{
				// 				name: "Тривалість",
				// 				value: song.isStream
				// 					? `\`стрім\``
				// 					: `\`${ pms(player.position, { colonNotation: true }) } / ${ pms(
				// 						player.queue.current.duration, {
				// 							colonNotation: true,
				// 						}) }\``,
				// 				inline: true,
				// 			},
				// 			{
				// 				name: "Загальна тривалість черги",
				// 				value: `\`${ pms(queueDuration, {
				// 					colonNotation: true,
				// 				}) }\``,
				// 				inline: true,
				// 			},
				// 			{
				// 				name: "Загалом треків",
				// 				value: `\`${ player.queue.totalSize - 1 }\``,
				// 				colonNotation: true,
				// 				inline: true,
				// 			},
				// 		)
				// 		.setFooter({
				// 			text: `Сторінка ${ page + 1 }/${ pages.length }`,
				// 		});
				//
				// 	const buttonOne = new MessageButton()
				// 		.setCustomId("queue_cmd_but_1_app")
				// 		.setEmoji("⏭️")
				// 		.setStyle("PRIMARY");
				// 	const buttonTwo = new MessageButton()
				// 		.setCustomId("queue_cmd_but_2_app")
				// 		.setEmoji("⏮️")
				// 		.setStyle("PRIMARY");
				//
				// 	await interaction
				// 		.editReply({
				// 			embeds: [embedThree],
				// 			components: [
				// 				new MessageActionRow().addComponents([buttonTwo, buttonOne]),
				// 			],
				// 		})
				// 		.catch(() => {
				// 		});
				//
				// 	const collector = interaction.channel.createMessageComponentCollector({
				// 		filter: (b) => {
				// 			if (b.user.id === interaction.user.id) {
				// 				return true;
				// 			} else {
				// 				return b
				// 					.reply({
				// 						content: `Тільки **${ interaction.user.tag }** може використати цю кнопку`,
				// 						ephemeral: true,
				// 					})
				// 					.catch(() => {
				// 					});
				// 			}
				// 		},
				// 		time: 60000 * 5,
				// 		idle: 30e3,
				// 	});
				//
				// 	collector.on("collect", async (button) => {
				// 		if (button.customId === "queue_cmd_but_1_app") {
				// 			await button.deferUpdate().catch(() => {
				// 			});
				// 			page = page + 1 < pages.length? ++page : 0;
				//
				// 			const embedFour = new MessageEmbed()
				// 				.setColor(client.config.embedColor)
				// 				.setDescription(
				// 					`**♪ | Зараз грає:** [${ song.title }](${ song.uri }) \n\n**Далі:**\n${ pages[page] }`,
				// 				)
				// 				.addFields(
				// 					{
				// 						name: "Тривалість",
				// 						value: song.isStream
				// 							? `\`стрім\``
				// 							: `\`${ pms(player.position, { colonNotation: true }) } / ${ pms(
				// 								player.queue.current.duration, {
				// 									colonNotation: true,
				// 								}) }\``,
				// 						inline: true,
				// 					},
				// 					{
				// 						name: "Загальна тривалість черги",
				// 						value: `\`${ pms(queueDuration, {
				// 							colonNotation: true,
				// 						}) }\``,
				// 						inline: true,
				// 					},
				// 					{
				// 						name: "Загалом треків",
				// 						value: `\`${ player.queue.totalSize - 1 }\``,
				// 						colonNotation: true,
				// 						inline: true,
				// 					},
				// 				)
				// 				.setFooter({
				// 					text: `Сторінка ${ page + 1 }/${ pages.length }`,
				// 				});
				//
				// 			await interaction.editReply({
				// 				embeds: [embedFour],
				// 				components: [
				// 					new MessageActionRow().addComponents([buttonTwo, buttonOne]),
				// 				],
				// 			});
				// 		} else if (button.customId === "queue_cmd_but_2_app") {
				// 			await button.deferUpdate().catch(() => {
				// 			});
				// 			page = page > 0? --page : pages.length - 1;
				//
				// 			const embedFive = new MessageEmbed()
				// 				.setColor(client.config.embedColor)
				// 				.setDescription(
				// 					`**♪ | Зараз грає:** [${ song.title }](${ song.uri }) \n\n**Далі:**\n${ pages[page] }`,
				// 				)
				// 				.addFields(
				// 					{
				// 						name: "Тривалість",
				// 						value: song.isStream
				// 							? `\`стрім\``
				// 							: `\`${ pms(player.position, { colonNotation: true }) } / ${ pms(
				// 								player.queue.current.duration, {
				// 									colonNotation: true,
				// 								}) }\``,
				// 						inline: true,
				// 					},
				// 					{
				// 						name: "Загальна тривалість черги",
				// 						value: `\`${ pms(queueDuration, {
				// 							colonNotation: true,
				// 						}) }\``,
				// 						inline: true,
				// 					},
				// 					{
				// 						name: "Загалом треків",
				// 						value: `\`${ player.queue.totalSize - 1 }\``,
				// 						colonNotation: true,
				// 						inline: true,
				// 					},
				// 				)
				// 				.setFooter({
				// 					text: `Сторінка ${ page + 1 }/${ pages.length }`,
				// 				});
				//
				// 			await interaction
				// 				.editReply({
				// 					embeds: [embedFive],
				// 					components: [
				// 						new MessageActionRow().addComponents([buttonTwo, buttonOne]),
				// 					],
				// 				})
				// 				.catch(() => {
				// 				});
				// 		} else {
				// 			return interaction.deferUpdate();
				// 		}
				// 	});
			}
		}
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
