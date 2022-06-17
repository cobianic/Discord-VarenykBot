const SlashCommand = require("../../lib/SlashCommand");
const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
const load = require("lodash");
const pms = require("pretty-ms");

const command = new SlashCommand()
  .setName("queue")
  .setDescription("Показує чергу")

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
            .setDescription("Черга пуста"),
        ],
        ephemeral: true,
      });
    }

    if (!player.playing) {
      const queueEmbed = new MessageEmbed()
        .setColor("RED")
        .setDescription("Нічого не грає");
      return interaction.reply({ embeds: [queueEmbed], ephemeral: true });
    }

    await interaction.deferReply().catch(() => {});

    if (!player.queue.size || player.queue.size === 0) {
      let song = player.queue.current;
      const embed = new MessageEmbed()
        .setColor(client.config.embedColor)
        .setDescription(`**♪ | Зараз грає:** [${song.title}](${song.uri})`)
        .addFields(
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
          // Volume not needed here
          // {
          //   name: "Гучність",
          //   value: `\`${player.volume}\``,
          //   inline: true,
          // },
          {
            name: "Треків в черзі",
            value: `\`${player.queue.totalSize - 1}\``,
            colonNotation: true,
            inline: true,
          }
        );

      await interaction.editReply({
        embeds: [embed],
      });
    } else {
      const mapping = player.queue.map(
        (t, i) => `\` ${++i} \` [${t.title}](${t.uri})\u00A0\u00A0[${pms(t.duration, {
          colonNotation: true,
        })}]`
      );

      const chunk = load.chunk(mapping, 10);
      const pages = chunk.map((s) => s.join("\n"));
      let page = interaction.options.getNumber("page");
      if (!page) page = 0;
      if (page) page = page - 1;
      if (page > pages.length) page = 0;
      if (page < 0) page = 0;

      if (player.queue.size < 11 || player.queue.totalSize < 11) {
        let song = player.queue.current;
        const embedTwo = new MessageEmbed()
          .setColor(client.config.embedColor)
          .setDescription(
            `**♪ | Зараз грає:** [${song.title}](${song.uri}) \n\n**Далі:**\n${pages[page]}`
          )
          .addFields(
            {
              name: "Тривалість",
              value: song.isStream
                ? `\`стрім\``
                : `\`${pms(player.position, { colonNotation: true })} / ${pms(
                  player.queue.current.duration, {
                colonNotation: true,
              })}\``,
              inline: true,
            },
            {
              name: "Загальна тривалість черги",
              value: `\`${pms(player.queue.duration, {
                colonNotation: true,
              })}\``,
              inline: true,
            },
            {
              name: "Загалом треків",
              value: `\`${player.queue.totalSize - 1}\``,
              colonNotation: true,
              inline: true,
            }
          )
          .setFooter({
            text: `Сторінка ${page + 1}/${pages.length}`,
          });

        await interaction
          .editReply({
            embeds: [embedTwo],
          })
          .catch(() => {});
      } else {
        let song = player.queue.current;
        const embedThree = new MessageEmbed()
          .setColor(client.config.embedColor)
          .setDescription(
            `**♪ | Зараз грає:** [${song.title}](${song.uri}) \n\n**Далі:**\n${pages[page]}`
          )
          .addFields(
            {
              name: "Тривалість",
              value: song.isStream
                ? `\`стрім\``
                : `\`${pms(player.position, { colonNotation: true })} / ${pms(
                  player.queue.current.duration, {
                colonNotation: true,
              })}\``,
              inline: true,
            },
            {
              name: "Загальна тривалість черги",
              value: `\`${pms(player.queue.duration, {
                colonNotation: true,
              })}\``,
              inline: true,
            },
            {
              name: "Загалом треків",
              value: `\`${player.queue.totalSize - 1}\``,
              colonNotation: true,
              inline: true,
            }
          )
          .setFooter({
            text: `Сторінка ${page + 1}/${pages.length}`,
          });

        const buttonOne = new MessageButton()
          .setCustomId("queue_cmd_but_1_app")
          .setEmoji("⏭️")
          .setStyle("PRIMARY");
        const buttonTwo = new MessageButton()
          .setCustomId("queue_cmd_but_2_app")
          .setEmoji("⏮️")
          .setStyle("PRIMARY");

        await interaction
          .editReply({
            embeds: [embedThree],
            components: [
              new MessageActionRow().addComponents([buttonTwo, buttonOne]),
            ],
          })
          .catch(() => {});

        const collector = interaction.channel.createMessageComponentCollector({
          filter: (b) => {
            if (b.user.id === interaction.user.id) return true;
            else
              return b
                .reply({
                  content: `Тільки **${interaction.user.tag}** може використати цю кнопку`,
                  ephemeral: true,
                })
                .catch(() => {});
          },
          time: 60000 * 5,
          idle: 30e3,
        });

        collector.on("collect", async (button) => {
          if (button.customId === "queue_cmd_but_1_app") {
            await button.deferUpdate().catch(() => {});
            page = page + 1 < pages.length ? ++page : 0;

            const embedFour = new MessageEmbed()
              .setColor(client.config.embedColor)
              .setDescription(
                `**♪ | Зараз грає:** [${song.title}](${song.uri}) \n\n**Далі:**\n${pages[page]}`
              )
              .addFields(
                {
                  name: "Тривалість",
                  value: song.isStream
                    ? `\`стрім\``
                    : `\`${pms(player.position, { colonNotation: true })} / ${pms(
                      player.queue.current.duration, {
                    colonNotation: true,
                  })}\``,
                  inline: true,
                },
                {
                  name: "Загальна тривалість черги",
                  value: `\`${pms(player.queue.duration, {
                    colonNotation: true,
                  })}\``,
                  inline: true,
                },
                {
                  name: "Загалом треків",
                  value: `\`${player.queue.totalSize - 1}\``,
                  colonNotation: true,
                  inline: true,
                }
              )
              .setFooter({
                text: `Сторінка ${page + 1}/${pages.length}`,
              });

            await interaction.editReply({
              embeds: [embedFour],
              components: [
                new MessageActionRow().addComponents([buttonTwo, buttonOne]),
              ],
            });
          } else if (button.customId === "queue_cmd_but_2_app") {
            await button.deferUpdate().catch(() => {});
            page = page > 0 ? --page : pages.length - 1;

            const embedFive = new MessageEmbed()
              .setColor(client.config.embedColor)
              .setDescription(
                `**♪ | Зараз грає:** [${song.title}](${song.uri}) \n\n**Далі:**\n${pages[page]}`
              )
              .addFields(
                {
                  name: "Тривалість",
                  value: song.isStream
                    ? `\`стрім\``
                    : `\`${pms(player.position, { colonNotation: true })} / ${pms(
                      player.queue.current.duration, {
                    colonNotation: true,
                  })}\``,
                  inline: true,
                },
                {
                  name: "Загальна тривалість черги",
                  value: `\`${pms(player.queue.duration, {
                    colonNotation: true,
                  })}\``,
                  inline: true,
                },
                {
                  name: "Загалом треків",
                  value: `\`${player.queue.totalSize - 1}\``,
                  colonNotation: true,
                  inline: true,
                }
              )
              .setFooter({
                text: `Сторінка ${page + 1}/${pages.length}`,
              });

            await interaction
              .editReply({
                embeds: [embedFive],
                components: [
                  new MessageActionRow().addComponents([buttonTwo, buttonOne]),
                ],
              })
              .catch(() => {});
          } else return;
        });
      }
    }
  });

module.exports = command;
