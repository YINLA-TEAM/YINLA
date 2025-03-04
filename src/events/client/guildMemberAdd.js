const { EmbedBuilder } = require("discord.js");
const welcomeSchema = require("../../Model/welcome");

module.exports = {
    name: "guildMemberAdd",
    async execute(member, client) {
        welcomeSchema.findOne({Guild: member.guild.id}, async (err, data) => {
            if(!data) return;
            const { guild } = member;
            const welcomeChannel = member.guild.channels.cache.get(data.Channel);

            const welcomeEmbed = new EmbedBuilder()
            .setTitle("<a:_rabbit:1009019327317553223>歡迎新成員加入<a:_rabbit:1009019327317553223>")
            .setDescription(data.Msg)
            .setColor(`Random`)
            .setThumbnail(member.user.displayAvatarURL())
            .addFields(
            {
                name: `🔰｜創立帳號時間`,
                value: `**__<t:${parseInt(member.user.createdTimestamp/1000)}>__ (<t:${parseInt(member.user.createdTimestamp/1000)}:R>)**`,
            },
            {
                name: `👥｜加入伺服時間`,
                value: `**__<t:${parseInt(member.joinedTimestamp/1000)}>__ (<t:${parseInt(member.joinedTimestamp/1000)}:R>)**`,
            },
            {
                name:'👥伺服人數',
                value: `\`${guild.memberCount}\``,
            })
            .setTimestamp(Date.now())
            .setFooter({
                iconURL: client.user.displayAvatarURL(),
                text: `YINLA`
            })

            welcomeChannel.send({
                content:`<@${member.user.id}>`,
                embeds: [welcomeEmbed]
            })

            if(!data.Role) {
                console.log('[錯誤]：沒有身份組');
            } else {
                try {
                    member.roles.add(data.Role);
                } catch(err) {
                    console.log("[錯誤] ",err);
                }
            }

            if(err) return console.log("[錯誤] ",err);
        })
    }
}