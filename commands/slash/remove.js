const SlashCommand = require("../../lib/SlashCommand");
const { MessageEmbed } = require("discord.js");

const command = new SlashCommand()
  .setName("remove")
  .setDescription("Видаляє небажаний трек з черги")
  .addNumberOption((option) =>
    option
      .setName("номер")
      .setDescription("Введіть номер треку")
      .setRequired(true)
  )

  .setRun(async (client, interaction) => {
    const args = interaction.options.getNumber("номер");

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
            .setDescription("Немає чого видаляти"),
        ],
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    const position = Number(args) - 1;
    if (position > player.queue.size) {
      let thing = new MessageEmbed()
        .setColor(client.config.embedColor)
        .setDescription(
          `Зараз черга містить тільки **${player.queue.size}** треків`
        );
      return interaction.editReply({ embeds: [thing] });
    }

    const song = player.queue[position];
    player.queue.remove(position);

    const number = position + 1;
    let thing = new MessageEmbed()
      .setColor(client.config.embedColor)
      .setDescription(`Видалено трек номер **${number}** з черги`);
    return interaction.editReply({ embeds: [thing] });
  });

module.exports = command;
