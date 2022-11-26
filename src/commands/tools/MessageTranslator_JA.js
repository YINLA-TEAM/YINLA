const { ContextMenuCommandBuilder, ApplicationCommandType ,EmbedBuilder} = require('discord.js');
const translate = require('@iamtraction/google-translate');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Translate into Japanese')
        .setNameLocalizations({
            "zh-TW" : "將信息翻譯成日文",
            "zh-CN" : "将信息翻译成日文",
            "ja" : "情報を日本語に翻訳する",
            "ko" : "정보를 일본어로 번역"
        })
        .setType(ApplicationCommandType.Message),

    async execute(interaction, client) {
        if(interaction.targetMessage.content == ''){
            const error_embed = new EmbedBuilder()
                .setTitle(`<:tranlate:1035826480904679424> 翻譯｜TRANSLATE`)
                .setDescription("這什麼都沒有")
                .setColor(`#5185e3`)
                .setTimestamp(Date.now())
            await interaction.reply({
                embeds:[error_embed],
                ephemeral: true
            })
        } else {
        const embed = new EmbedBuilder()
            .setTitle(`<:tranlate:1035826480904679424> 翻譯｜TRANSLATE`)
            .setColor(`#5185e3`)
            .setDescription(`翻譯不一定100%正確，僅供參考\n(最多可翻譯500字)`)
            .setFooter({
                iconURL: client.user.displayAvatarURL(),
                text: `YINLA`
            })
            .setTimestamp(Date.now())
            .addFields({
                name:`原始訊息`,
                value:`\`\`\`\n${interaction.targetMessage}\n\`\`\``
            })
            .addFields({
                name:`翻譯訊息`,
                value:`\`\`\`\n${(await translate(interaction.targetMessage,{to:'ja'})).text}\n\`\`\``
            })

        await interaction.reply({
            embeds:[embed],
            ephemeral: true
        })
    }
    }
}