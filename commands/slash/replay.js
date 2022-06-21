const SlashCommand = require("../../lib/SlashCommand");
const { MessageEmbed } = require("discord.js");

const command = new SlashCommand()
  .setName("replay")
  .setDescription("Відмотати на початок пісні")
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

    await interaction.deferReply();

    player.seek(0);

    let song = player.queue.current;
    return interaction.editReply({
      embeds: [
        new MessageEmbed()
          .setColor(client.config.embedColor)
          .setDescription(`[${song.title}](${song.uri}) запущена з початку`),
      ],
    });
  });

module.exports = command;
