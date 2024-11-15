const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const eqSchema = require("../../Model/eqChannel");

module.exports = {
    data: new SlashCommandBuilder()
        .setName(`setup-eqchannel`)
        .setNameLocalizations({
            "zh-TW" : "設定地震報告推播",
        })
        .setDescription("設定 地震報告推播頻道 (一個伺服器限一個頻道)")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option => 
            option
            .setName("channel")
            .setNameLocalizations({
                "zh-TW" : "頻道"
            })
            .setDescription("選擇頻道推播 (如果要移除推播請任意填入一個頻道)")
            .setRequired(true)
        )
        .addStringOption(option => (
            option
                .setName("setup-remove")
                .setNameLocalizations({
                    "zh-TW": "建立或移除",
                })
                .setDescription("如果要建立在新的頻道，請先移除再建立(一個伺服器限一個頻道)")
                .setRequired(true)
                .addChoices(
                    { name: '建立', value: '建立' },
                    { name: '移除', value: '移除' },
                )
        )),

        async execute(interaction) {
            const { options } = interaction;
            
            const eqChannel = options.getChannel("channel");

            if(!interaction.guild.members.me.permissions.has(PermissionFlagsBits.Administrator)) {
                const no_admin_msg = new EmbedBuilder()
                    .setTitle(`❌ **你沒有權限**`)
                    .setColor(`Red`)

                interaction.reply({
                    embeds:[ no_admin_msg ],
                    ephemeral:true
                })
            }

            eqSchema.findOne({Guild:interaction.guild.id}, async (err,data) =>{
                if(!data && interaction.options.getString('setup-remove') == '建立') {
                    const newEQ = await eqSchema.create({
                        Guild: interaction.guild.id,
                        Channel: eqChannel.id,
                    });
                    const succes_creat_eq_msg = new EmbedBuilder()
                        .setTitle(`✅ 成功設定 **地震報告推播**`)
                        .setColor(`Green`)

                    interaction.reply({
                        embeds:[ succes_creat_eq_msg ],
                        ephemeral:false
                    })
                } else if(interaction.options.getString('setup-remove') == '建立') {
                    const err_creat_eq_msg = new EmbedBuilder()
                        .setTitle(`❌ 請確認使否有設定過推播頻道`)
                        .setColor(`Red`)

                    interaction.reply({
                        embeds:[ err_creat_eq_msg ],
                        ephemeral:true
                    })
                } else if(interaction.options.getString('setup-remove') == '移除') {
                    const rmEQ = await eqSchema.deleteOne({
                        Guild:interaction.guild.id,
                    });
                    const rm_eq_msg = new EmbedBuilder()
                        .setTitle(`✅ 成功移除推播頻道`)
                        .setColor(`Green`)

                    interaction.reply({
                        embeds: [ rm_eq_msg ],
                        ephemeral: false
                    })
                } else {
                    const err_EQ = new EmbedBuilder()
                        .setTitle(`⚠️ 發生錯誤`)
                        .setColor(`Red`)

                    interaction.reply({
                        embeds: [ err_EQ ],
                        ephemeral: true,
                    })
                };
            })
        }
};