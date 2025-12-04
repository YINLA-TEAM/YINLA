const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    if (!interaction.isCommand()) return;

    const logs_channel = client.channels.cache.get(process.env.logs_channel);
    if (!logs_channel) return;

    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle("📜 | Command Logs")
      .addFields([
        {
          name: "User",
          value: `<@${interaction.user.id}>\n\`${interaction.user.id}\``,
          inline: true,
        },
        {
          name: "Command",
          value: `</${interaction.commandName}:${interaction.commandId}>\n\`${interaction.commandName}\``,
          inline: true,
        },
        {
          name: "Channel",
          value: `<#${interaction.channel.id}>\n\`${interaction.channel.id}\``,
          inline: true,
        },
        {
          name: "Guild",
          value: `${interaction.guild.name}\n\`${interaction.guild.id}\``,
          inline: true,
        },
      ])
      .setFooter({
        text: `${client.user.username}`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setTimestamp();

    await logs_channel.send({ embeds: [embed] });
  },
};
