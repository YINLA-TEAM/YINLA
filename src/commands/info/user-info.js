const { SlashCommandBuilder,SlashCommandUserOption, EmbedBuilder} = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user-info')
        .setNameLocalizations({
            "zh-TW" : "個人簡介",
            "zh-CN" : "个人简介",
            "ja" : "個人プロフィール",
            "ko" : "개인프로필"
        })
        .setDescription('取得個人簡介')
        .setDescriptionLocalizations({
            "zh-TW" : "個人簡介",
            "zh-CN" : "取得个人简介",
            "ja" : "プロフィールを取得する",
            "ko" : "프로필을 얻다"
        })
        .addUserOption(new SlashCommandUserOption()
			.setName("成員")
            .setNameLocalizations({
                "zh-TW" : "成員",
                "zh-CN" : "成员",
                "ja" : "メンバー",
                "ko" : "회원"
            })
			.setDescription("誰的個人簡介"))
            .setDescriptionLocalizations({
                "zh-TW" : "誰的個人簡介",
                "zh-CN" : "谁的个人简介",
                "ja" : "誰のプロフィール",
                "ko" : "누구의 프로필"
            }),
    async execute(interaction, client) {
        const member = interaction.options.getMember("成員") || interaction.member;
        const embed = new EmbedBuilder()

            .setTitle(member.user.tag)
            .setColor('Random')
            .setThumbnail(member.user.displayAvatarURL())
            .setTimestamp(Date.now())
            .setImage(interaction.user.bannerURL())
            .setAuthor({
                url: member.user.displayAvatarURL(),
                iconURL: member.user.displayAvatarURL(),
                name: `個人簡介`
            })

            .setFooter({
                iconURL: client.user.displayAvatarURL(),
                text: `YINLA`
            })

            .addFields([
                {
                    name: `🪪｜使用者ID`,
                    value: `\`${member.id}\``,
                },
                {
                    name: `💩｜伺服器暱稱`,
                    value:`\`${member.nickname}\``,
                },
                {
                    name: `🔰｜創立帳號時間`,
                    value: `**__<t:${parseInt(member.user.createdTimestamp/1000)}>__ (<t:${parseInt(member.user.createdTimestamp/1000)}:R>)**`,
                },
                {
                    name: `👥｜加入伺服時間`,
                    value: `**__<t:${parseInt(member.joinedTimestamp/1000)}>__ (<t:${parseInt(member.joinedTimestamp/1000)}:R>)**`,
                },
                {
                    name: `🤖｜機器人`,
                    value: `${member.user.bot? '\`✅\`':'\`❎\`'}`
                }
            ]);

        await interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
}