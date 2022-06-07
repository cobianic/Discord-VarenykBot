const SlashCommand = require("../../lib/SlashCommand");
const { MessageEmbed } = require("discord.js");

const command = new SlashCommand()
  .setName("stop")
  .setDescription("Зупиняє музику і очищає чергу")
  .setRun(async (client, interaction, options) => {
    let player = client.manager.players.get(interaction.guild.id);
    if (!player)
      return interaction.reply({
        embeds: [client.ErrorEmbed("Зараз нічого не грає")],
      });

    if (!interaction.member.voice.channel) {
      const joinEmbed = new MessageEmbed()
        .setColor("RED")
        .setDescription(
          "❌ | Хазяїн, ви не в голосовому каналі"
        );
      return interaction.reply({ embeds: [joinEmbed], ephemeral: true });
    }

    if (
      interaction.guild.me.voice.channel &&
      !interaction.guild.me.voice.channel.equals(
        interaction.member.voice.channel
      )
    ) {
      const sameEmbed = new MessageEmbed()
        .setColor("RED")
        .setDescription(
          "❌ | Хазяїн, ви не в моєму голосовому каналі"
        );
      return interaction.reply({ embeds: [sameEmbed], ephemeral: true });
    }

    player.destroy();

    interaction.reply({
      embeds: [client.Embed(`Від'єднався!`)],
    });
  });

module.exports = command;
