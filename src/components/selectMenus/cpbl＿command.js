const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: `cpbl`,
    },
    async execute(interaction, client) {
        const embed1 = new EmbedBuilder()
            .setTitle(`⚾️｜中華職棒賽事`)
            .setAuthor({
                name:`YINLA`,
                iconURL:client.user.displayAvatarURL()
            })
            .setThumbnail('https://www.cpbl.com.tw/theme/common/images/project/logo_new.png')
            .setDescription(`可以查詢 **歷史或進行中的賽事資訊以及MVP資訊**\n\n**❗️在執行指令時需要較久時間去擷取資料，請耐心等待**`)

        const embed2 = new EmbedBuilder()
            .setTitle(`⚾️｜中華職棒即時比分`)
            .setAuthor({
                name:`YINLA`,
                iconURL:client.user.displayAvatarURL()
            })
            .setThumbnail('https://www.cpbl.com.tw/theme/common/images/project/logo_new.png')
            .setDescription(`可以查詢 **當天的賽事比分以及賽事狀況**\n\n**❗️在執行指令時需要較久時間去擷取資料，請耐心等待**`)

        const embed3 = new EmbedBuilder()
            .setTitle(`⚾️｜中華職棒球隊成績`)
            .setAuthor({
                name:`YINLA`,
                iconURL:client.user.displayAvatarURL()
            })
            .setThumbnail('https://www.cpbl.com.tw/theme/common/images/project/logo_new.png')
            .setDescription(`可以查詢 **賽季球隊成績排名成績**(目前只支援當前賽季的資訊)\n\n**❗️在執行指令時需要較久時間去擷取資料，請耐心等待**`)

        if (interaction.values[0] == `game`) {
            await interaction.reply({
                embeds: [ embed1 ],
                ephemeral: true
            });
        }
        if (interaction.values[0] == `score`) {
            await interaction.reply({
                embeds: [ embed2 ],
                ephemeral: true
            });
        }
        if (interaction.values[0] == `standing`) {
            await interaction.reply({
                embeds: [ embed3 ],
                ephemeral: true
            });
        }
    },
}