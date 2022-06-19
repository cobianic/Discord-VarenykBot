const SlashCommand = require("../../lib/SlashCommand");
const { MessageEmbed } = require("discord.js");

const command = new SlashCommand()
  .setName("previous")
  .setDescription("Вернутись до попередньої пісні")
  .setRun(async (client, interaction) => {
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
            .setDescription("Немає з\'єднання з нодою Lavalink"),
        ],
      });

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

    const previousSong = player.queue.previous;
    const currentSong = player.queue.current;
    const nextSong = player.queue[0]

    if (!previousSong
      || previousSong === currentSong
      || previousSong === nextSong) {
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription("Немає попередньої пісні"),
        ],
      })}

    if (previousSong !== currentSong && previousSong !== nextSong) {
      player.queue.splice(0, 0, currentSong)
      player.play(previousSong);
    }

    interaction.reply({
      embeds: [
        new MessageEmbed()
          .setColor(client.config.embedColor)
          .setDescription(
            `⏮ | Попередня пісня: **${previousSong.title}**`
          ),
      ],
    });
  });

module.exports = command;
