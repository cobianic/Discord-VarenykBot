const SlashCommand = require("../../lib/SlashCommand");
const { MessageEmbed } = require("discord.js");

const command = new SlashCommand()
	.setName("play")
	.setDescription(
		"Шукає і грає пісні з Youtube, Spotify, Deezer, Apple Music",
	)
	.addStringOption((option) =>
		option
			.setName("запит")
			.setDescription("Ссилка або назва пісні")
			.setRequired(true),
	)
	.setRun(async (client, interaction, options) => {
		let channel = await client.getChannel(client, interaction);
		if (!channel) {
			return;
		}

		let player;
		if (client.manager) {
			player = client.createPlayer(interaction.channel, channel);
		} else {
			return interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor("RED")
						.setDescription("Немає з'єднання з нодою Lavalink"),
				],
			});
		}

		if (player.state !== "CONNECTED") {
			player.connect();
		}

		if (channel.type == "GUILD_STAGE_VOICE") {
			setTimeout(() => {
				if (interaction.guild.me.voice.suppress === true) {
					try {
						interaction.guild.me.voice.setSuppressed(false);
					} catch (e) {
						interaction.guild.me.voice.setRequestToSpeak(true);
					}
				}
			}, 2000); //recognizing it's a stage channel?
		}
		
		const ret = await interaction.reply({
			embeds: [
				new MessageEmbed()
					.setColor(client.config.embedColor)
					.setDescription(":mag_right: **Шукаю...**"),
			],
			fetchReply: true,
		});

		let query = options.getString("запит", true);
		let res = await player.search(query, interaction.user).catch((err) => {
			client.error(err);
			return {
				loadType: "LOAD_FAILED",
			};
		});

		if (res.loadType === "LOAD_FAILED") {
			if (!player.queue.current) {
				player.destroy();
			}
			await interaction
				.editReply({
					embeds: [
						new MessageEmbed()
							.setColor("RED")
							.setDescription("Протягом пошуку відбулась помилка"),
					],
				})
				.catch(this.warn);
		}

		if (res.loadType === "NO_MATCHES") {
			if (!player.queue.current) {
				player.destroy();
			}
			await interaction
				.editReply({
					embeds: [
						new MessageEmbed()
							.setColor("RED")
							.setDescription("Нічого не знайдено"),
					],
				})
				.catch(this.warn);
		}

		if (res.loadType === "TRACK_LOADED" || res.loadType === "SEARCH_RESULT") {
			player.queue.add(res.tracks[0]);
			
			if (!player.playing && !player.paused && !player.queue.size) {
				player.play();
			}
			
			let addQueueEmbed = new MessageEmbed()
				.setColor(client.config.embedColor)
				.setAuthor({ name: "Додано до черги", iconURL: client.config.iconURL })
				.setDescription(
					`[${ res.tracks[0].title }](${ res.tracks[0].uri })` || "Без назви",
				)
				.setURL(res.tracks[0].uri)
				.addField("Автор", res.tracks[0].author, true)
				.addField(
					"Тривалість",
					res.tracks[0].isStream
						? `\`стрім\``
						: `\`${ client.ms(res.tracks[0].duration, {
							colonNotation: true,
						}) }\``,
					true,
				);

			try {
				addQueueEmbed.setThumbnail(
					res.tracks[0].displayThumbnail("maxresdefault"),
				);
			} catch (err) {
				addQueueEmbed.setThumbnail(res.tracks[0].thumbnail);
			}

			if (player.queue.totalSize > 1) {
				addQueueEmbed.addField(
					"Позиція в черзі",
					`${ player.queue.size }`,
					true,
				);
			} else {
				player.queue.previous = player.queue.current;
			}
			
			await interaction
				.editReply({ embeds: [addQueueEmbed] })
				.catch(this.warn);
		}

		if (res.loadType === "PLAYLIST_LOADED") {
			player.queue.add(res.tracks);

			if (
				!player.playing &&
				!player.paused &&
				player.queue.totalSize === res.tracks.length
			) {
				player.play();
			}

			let playlistEmbed = new MessageEmbed()
				.setColor(client.config.embedColor)
				.setAuthor({
					name: "Плейлист доданий до черги",
					iconURL: client.config.iconURL,
				})
				.setThumbnail(res.tracks[0].thumbnail)
				.setDescription(`[${ res.playlist.name }](${ query })`)
				.addField("Додано в чергу", `\`${ res.tracks.length }\` пісень`, false)
				.addField(
					"Тривалість плейлиста",
					`\`${ client.ms(res.playlist.duration, { colonNotation: true }) }\``,
					false,
				);
			
			await interaction
				.editReply({ embeds: [playlistEmbed] })
				.catch(this.warn);
		}
		
		if (ret) setTimeout(() => ret.delete().catch(this.warn), 20000);
		return ret;
	});

module.exports = command;
