const SlashCommand = require("../../lib/SlashCommand");
const { MessageEmbed } = require("discord.js");
const fetch = require("node-fetch");

const command = new SlashCommand()
  .setName("lyrics")
  .setDescription("Знаходить текст пісні")
  // get user input
  .addStringOption((option) =>
    option
      .setName("пісня")
      .setDescription("Пісня, для якої потрібен текст")
      .setRequired(false)
  )
  .setRun(async (client, interaction, options) => {
    await interaction.reply({
      embeds: [
        new MessageEmbed()
          .setColor(client.config.embedColor)
          .setDescription("🔎 **Шукаю...**"),
      ],
    });

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

    const args = interaction.options.getString("пісня");
    if (!args && !player)
      return interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription("Нічого не грає"),
        ],
      });

    let search = args ? args : player.queue.current.title;
    // Lavalink api for lyrics
    let url = `https://api.darrennathanael.com/lyrics?song=${search}`;

    let lyrics = await fetch(url)
      .then((res) => {
        return res.json();
      })
      .catch((err) => {
        return err.name;
      });
    if (!lyrics || lyrics.response !== 200 || lyrics === "FetchError") {
      return interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setDescription(
              `❌ | Текст для ${search} не знайдений!\nПереконайтесь, що ви ввели правильні дані.`
            ),
        ],
      });
    }

    let text = lyrics.lyrics;
    let lyricsEmbed = new MessageEmbed()
      .setColor(client.config.embedColor)
      .setTitle(`${lyrics.full_title}`)
      .setURL(lyrics.url)
      .setThumbnail(lyrics.thumbnail)
      .setDescription(text);

    if (text.length > 4096) {
      text = text.substring(0, 4090) + "[...]";
      lyricsEmbed
        .setDescription(text)
        .setFooter({ text: "Текст обрізаний, бо він занадто довгий" });
    }

    return interaction.editReply({ embeds: [lyricsEmbed] });
  });

module.exports = command;
