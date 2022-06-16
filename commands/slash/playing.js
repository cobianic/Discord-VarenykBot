const { MessageEmbed } = require("discord.js");
const SlashCommand = require("../../lib/SlashCommand");
const prettyMilliseconds = require("pretty-ms");
const pms = require("pretty-ms");

const command = new SlashCommand()
  .setName("playing")
  .setDescription("Показує пісню, що грає зараз")
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
            .setDescription("Немає з'єднання з нодою Lavalink"),
        ],
      });

    if (!player) {
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription("Бот не в голосовому каналі"),
        ],
        ephemeral: true,
      });
    }

    if (!player.playing) {
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription("Нічого не грає"),
        ],
        ephemeral: true,
      });
    }

    const song = player.queue.current;
    const embed = new MessageEmbed()
      .setColor(client.config.embedColor)
      .setAuthor({ name: "Зараз грає", iconURL: client.config.iconURL })
      // show who requested the song via setField, also show the duration of the song
      .setFields([
        {
          name: "Автор",
          value: song.author,
          inline: true,
        },
        // show duration, if live show live
        {
          name: "Тривалість",
          value: song.isStream
            ? `\`стрім\``
            : `\`${pms(player.position, { colonNotation: true })} / ${pms(
              player.queue.current.duration,
              { colonNotation: true }
            )}\``,
          inline: true,
        },
      ])
      // show the thumbnail of the song using displayThumbnail("maxresdefault")
      .setThumbnail(song.displayThumbnail("maxresdefault"))
      // show the title of the song and link to it
      .setDescription(`[${song.title}](${song.uri})`);
    return interaction.reply({ embeds: [embed] });
  });
module.exports = command;
