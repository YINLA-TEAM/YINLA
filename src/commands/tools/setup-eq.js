const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const eqSchema = require("../../Model/eqChannel");

module.exports = {
    data: new SlashCommandBuilder()
        .setName(`setup-eqchannel`)
        .setNameLocalizations({
            "zh-TW" : "設定地震報告推播",
        })
        .setDescription("設定 地震報告推播頻道")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option => 
            option.setName("頻道")
            .setDescription("選擇頻道推播")
            .setRequired(true)
        ),

        async execute(interaction) {
            const { options } = interaction;
            
            const eqChannel = options.getChannel("頻道");

            if(!interaction.guild.members.me.permissions.has(PermissionFlagsBits.Administrator)) {
                const no_admin_msg = new EmbedBuilder()
                    .setTitle(`❌ **你沒有權限**`)
                    .setColor(`Red`)

                interaction.reply({
                    embeds:no_admin_msg,
                    ephemeral:true
                })
            }

            eqSchema.findOne({Guild:interaction.guild.id}, async (err,data) =>{
                if(!data) {
                    const newEQ = await eqSchema.create({
                        Guild: interaction.guild.id,
                        Channel: eqChannel.id,
                    });
                    const succes_creat_eq_msg = new EmbedBuilder()
                    .setTitle(`✅ 成功設定 **地震報告推播**`)
                    .setColor(`Red`)

                    interaction.reply({
                        embeds:[succes_creat_eq_msg],
                        ephemeral:false
                    })
                } else {
                    const err_creat_eq_msg = new EmbedBuilder()
                    .setTitle(`❌ 請確認使否有設定過推播頻道`)
                    .setColor(`Green`)

                    interaction.reply({
                        embeds:[err_creat_eq_msg],
                        ephemeral:true
                    })
                };
                
            })
        }
};