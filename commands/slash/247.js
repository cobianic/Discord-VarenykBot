const colors = require("colors");
const { MessageEmbed } = require("discord.js");
const SlashCommand = require("../../lib/SlashCommand");

const command = new SlashCommand()
  .setName("247")
  .setDescription("Не дозволяє боту відключатись від голосового каналу (вкл/викл)")
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
            .setDescription("Немає що грати 24/7"),
        ],
        ephemeral: true,
      });
    }

    let twentyFourSevenEmbed = new MessageEmbed().setColor(
      client.config.embedColor
    );
    const twentyFourSeven = player.get("twentyFourSeven");

    if (!twentyFourSeven || twentyFourSeven === false) {
      player.set("twentyFourSeven", true);
    } else {
      player.set("twentyFourSeven", false);
    }

    twentyFourSevenEmbed.setDescription(
      `✅ | **Режим 24/7 \`${!twentyFourSeven ? "увімкнений" : "вимкнений"}\`**`
    );
    client.warn(
      `Player: ${player.options.guild} | [${colors.blue(
        "24/7"
      )}] has been [${colors.blue(
        !twentyFourSeven ? "ENABLED" : "DISABLED"
      )}] in ${
        client.guilds.cache.get(player.options.guild)
          ? client.guilds.cache.get(player.options.guild).name
          : "a guild"
      }`
    );

    if (!player.playing && player.queue.totalSize === 0) player.destroy();

    return interaction.reply({ embeds: [twentyFourSevenEmbed] });
  });
module.exports = command;
// check above message, it is a little bit confusing. and erros are not handled. probably should be fixed.
// ok use catch ez kom  follow meh ;_;
// the above message meaning error, if it cant find it or take too long the bot crashed
// play commanddddd, if timeout or takes 1000 years to find song it crashed
// OKIE, leave the comment here for idk
// Comment very useful, 247 good :+1:
