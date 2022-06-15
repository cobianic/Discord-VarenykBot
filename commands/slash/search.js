const SlashCommand = require("../../lib/SlashCommand");
const prettyMilliseconds = require("pretty-ms");
const {
  MessageEmbed,
  MessageActionRow,
  MessageSelectMenu,
} = require("discord.js");

const command = new SlashCommand()
  .setName("search")
  .setDescription("Шукає музику")
  .addStringOption((option) =>
    option
      .setName("запит")
      .setDescription("Пісня, яку потрібно знайти")
      .setRequired(true)
  )
  .setRun(async (client, interaction, options) => {
    let channel = await client.getChannel(client, interaction);
    if (!channel) return;

    let player;
    if (client.manager)
      player = client.createPlayer(interaction.channel, channel);
    else
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription("Немає з'єднання з нодою Lavalink"),
        ],
      });
    await interaction.deferReply().catch((_) => {});

    if (player.state !== "CONNECTED") {
      player.connect();
    }

    const search = interaction.options.getString("запит");
    let res;

    try {
      res = await player.search(search, interaction.user);
      if (res.loadType === "LOAD_FAILED") {
        return interaction.reply({
          embeds: [
            new MessageEmbed()
              .setDescription("Протягом пошуку відбулась помилка")
              .setColor("RED"),
          ],
          ephemeral: true,
        });
      }
    } catch (err) {
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: "Протягом пошуку відбулась помилка",
            })
            .setColor("RED"),
        ],
        ephemeral: true,
      });
    }

    if (res.loadType == "NO_MATCHES") {
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setDescription(`Нічого не знайдено для \`${search}\``)
            .setColor("RED"),
        ],
        ephemeral: true,
      });
    } else {
      let max = 10;
      if (res.tracks.length < max) max = res.tracks.length;

      let resultFromSearch = [];

      res.tracks.slice(0, max).map((track) => {
        resultFromSearch.push({
          label: `${track.title}`,
          value: `${track.uri}`,
          description: track.isStream
            ? `стрім`
            : `${prettyMilliseconds(track.duration, {
              secondsDecimalDigits: 0,
            })} - ${track.author}`,
        });
      });

      const menus = new MessageActionRow().addComponents(
        new MessageSelectMenu()
          .setCustomId("вибір")
          .setPlaceholder("Вибрати пісню")
          .addOptions(resultFromSearch)
      );

      let choosenTracks = await interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setColor(client.config.embedColor)
            .setDescription(
              `Ось деякі з результатів для \`${search}\`. Будь ласка, виберіть пісню протягом \`30 секунд\``
            ),
        ],
        components: [menus],
      });
      const filter = (button) => button.user.id === interaction.user.id;

      const tracksCollector = choosenTracks.createMessageComponentCollector({
        filter,
        time: 30000,
      });
      tracksCollector.on("collect", async (i) => {
        if (i.isSelectMenu()) {
          await i.deferUpdate();
          let uriFromCollector = i.values[0];
          let trackForPlay;

          trackForPlay = await player?.search(
            uriFromCollector,
            interaction.user
          );
          if (player?.queue) {
            const r = trackForPlay.tracks[0];
            if (player.get("autoplay")) {
            const psba = player.get("autoplayed") || [];
              if (r) {
                if (!psba.includes(r.identifier)) {
                  psba.push(r.identifier);
                }
              }
              while (psba.length > 100) psba.shift();
              player.set("autoplayed", psba);
            }
            player.queue.add(r);
          }
          if (!player?.playing && !player?.paused && !player?.queue?.size)
            player?.play();
          i.editReply({
            content: null,
            embeds: [
              new MessageEmbed()
                .setAuthor({
                  name: "Додано до черги",
                  iconURL: client.config.iconURL,
                })
                .setURL(res.tracks[0].uri)
                .setThumbnail(res.tracks[0].displayThumbnail("maxresdefault"))
                .setDescription(
                  `[${trackForPlay?.tracks[0]?.title}](${trackForPlay?.tracks[0].uri})` ||
                    "Без назви"
                )
                .addField("Автор", trackForPlay?.tracks[0].author, true)
                .addField(
                  "Тривалість",
                  res.tracks[0].isStream
                    ? `\`стрім\``
                    : `\`${client.ms(res.tracks[0].duration, {
                        colonNotation: true,
                      })}\``,
                  true
                )
                .setColor(client.config.embedColor),
            ],
            components: [],
          });
        }
      });
      tracksCollector.on("end", async (i) => {
        if (i.size == 0) {
          choosenTracks.edit({
            content: null,
            embeds: [
              new MessageEmbed()
                .setDescription(
                  `Ви занадто довго вибирали пісню,час закінчився`
                )
                .setColor(client.config.embedColor),
            ],
            components: [],
          });
        }
      });
    }
  });

module.exports = command;
