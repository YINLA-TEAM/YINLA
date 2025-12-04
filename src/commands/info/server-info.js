const {
  SlashCommandBuilder,
  MessageFlags,
  SeparatorSpacingSize,
  ContainerBuilder,
  SectionBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("server-info")
    .setNameLocalizations({
      "zh-TW": "伺服器資訊",
    })
    .setDescription("伺服器介紹"),

  async execute(interaction) {
    const guild_container = new ContainerBuilder().setId(1).setSpoiler(false);

    let guild_banner = new MediaGalleryBuilder();
    if (interaction.guild.bannerURL() !== null) {
      guild_banner.addItems([
        new MediaGalleryItemBuilder().setURL(interaction.guild.bannerURL()),
      ]);
      guild_container.addMediaGalleryComponents(guild_banner);
    }

    const guild_avatar = new ThumbnailBuilder().setURL(
      interaction.guild.iconURL()
    );

    const guild_header = new TextDisplayBuilder().setContent(
      [
        `# ${interaction.guild.name}`,
        `${
          interaction.guild.description === null
            ? ""
            : `-# ${interaction.guild.description}`
        }`,
      ].join("\n")
    );

    const guild_header_section = new SectionBuilder()
      .setThumbnailAccessory(guild_avatar)
      .addTextDisplayComponents(guild_header);

    const guild_info = new TextDisplayBuilder().setContent(
      [
        `- **伺服器 ID** \n \`\`\`${interaction.guild.id}\`\`\``,
        `- **伺服器人數** \n \`${interaction.guild.memberCount}\``,
        `- **擁有者** \n <@${interaction.guild.ownerId}>`,
        `- **伺服器建立** \n __<t:${parseInt(
          interaction.guild.createdTimestamp / 1000
        )}>__ (<t:${parseInt(interaction.guild.createdTimestamp / 1000)}:R>)`,
        `- **加成狀態** \n \`${interaction.guild.premiumSubscriptionCount}\` (Lv.${interaction.guild.premiumTier})`,
      ].join("\n")
    );

    guild_container
      .addSectionComponents(guild_header_section)
      .addSeparatorComponents((separator) =>
        separator.setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(guild_info);

    await interaction.reply({
      components: [guild_container],
      flags: [MessageFlags.IsComponentsV2],
    });
  },
};
