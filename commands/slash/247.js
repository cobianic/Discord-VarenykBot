const { MessageEmbed } = require("discord.js");
const SlashCommand = require("../../lib/SlashCommand");

const command = new SlashCommand()
  .setName("247")
  .setDescription("режим програвання 24/7")
  .setRun(async (client, interaction, options) => {
    let player = client.manager.players.get(interaction.guild.id);
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
    if (!player) {
      return interaction.reply({
        embeds: [client.ErrorEmbed("Немає що грати 24/7")],
      });
    } else if (player.twentyFourSeven) {
      player.twentyFourSeven = false;
      const embed = client.Embed(`✅ | режим 24/7 тепер вимкнений`);
      return interaction.reply({ embeds: [embed] });
    } else {
      player.twentyFourSeven = true;
      const embed = client.Embed(`✅ | режим 24/7 тепер ввімкнений`);
      return interaction.reply({ embeds: [embed] });
    }
  });
module.exports = command;
// check above message, it is a little bit confusing. and erros are not handled. probably should be fixed.
// ok use catch ez kom  follow meh ;_;
// the above message meaning error, if it cant find it or take too long the bot crashed
// play commanddddd, if timeout or takes 1000 years to find song it crashed
// OKIE, leave the comment here for idk
