const { EmbedBuilder, RESTJSONErrorCodes } = require("discord.js");
const welcomeSchema = require("../../Model/welcome");
const { Signale } = require("signale");

module.exports = {
  name: "guildMemberAdd",
  async execute(member, client) {
    const logger = new Signale({
      scope: "GMADD",
    });

    let data;
    try {
      data = await welcomeSchema.findOne({ Guild: member.guild.id });
    } catch (err) {
      return client.sendErrorLog(err, null, "guildMemberAdd (welcomeSchema)");
    }
    if (!data) return;

    const { guild } = member;
    const welcomeChannel = member.guild.channels.cache.get(data.Channel);
    if (!welcomeChannel) return;

    const welcomeEmbed = new EmbedBuilder()
      .setTitle(
        "<a:_rabbit:1009019327317553223>歡迎新成員加入<a:_rabbit:1009019327317553223>"
      )
      .setDescription(data.Msg)
      .setColor(`Random`)
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        {
          name: `🔰｜創立帳號時間`,
          value: `**__<t:${parseInt(
            member.user.createdTimestamp / 1000
          )}>__ (<t:${parseInt(member.user.createdTimestamp / 1000)}:R>)**`,
        },
        {
          name: `👥｜加入伺服時間`,
          value: `**__<t:${parseInt(
            member.joinedTimestamp / 1000
          )}>__ (<t:${parseInt(member.joinedTimestamp / 1000)}:R>)**`,
        },
        {
          name: "👥伺服人數",
          value: `\`${guild.memberCount}\``,
        }
      )
      .setTimestamp(Date.now())
      .setFooter({
        iconURL: client.user.displayAvatarURL(),
        text: `YINLA`,
      });

    try {
      await welcomeChannel.send({
        content: `<@${member.user.id}>`,
        embeds: [welcomeEmbed],
      });
    } catch (err) {
      client.sendErrorLog(err, null, "guildMemberAdd (welcomeChannel.send)");
    }

    if (!data.Role) {
      logger.info("此伺服器未設定自動身分組");
    } else {
      try {
        await member.roles.add(data.Role);
      } catch (err) {
        if (err.code === RESTJSONErrorCodes.UnknownRole) {
          logger.warn(`自動身分組 ${data.Role} 已不存在，清除該伺服器的身分組設定`);
          data.Role = null;
          await data
            .save()
            .catch((e) =>
              client.sendErrorLog(e, null, "guildMemberAdd (清除失效身分組)")
            );
        } else {
          client.sendErrorLog(err, null, "guildMemberAdd (roles.add)");
        }
      }
    }
  },
};
