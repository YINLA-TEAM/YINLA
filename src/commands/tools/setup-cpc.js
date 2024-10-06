const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const cpcSchema = require("../../Model/cpcChannel");

module.exports = {
    data: new SlashCommandBuilder()
        .setName(`setup-cpcchannel`)
        .setNameLocalizations({
            "zh-TW" : "設定中油油價推播",
        })
        .setDescription("設定 中油油價推播頻道")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option => 
            option.setName("頻道")
            .setDescription("選擇頻道推播")
            .setRequired(true)
        ),

        async execute(interaction) {
            const { options } = interaction;
            
            const cpcChannel = options.getChannel("頻道");

            if(!interaction.guild.members.me.permissions.has(PermissionFlagsBits.Administrator)) {
                const no_admin_msg = new EmbedBuilder()
                    .setTitle(`❌ **你沒有權限**`)
                    .setColor(`Red`)

                interaction.reply({
                    embeds: [ no_admin_msg ],
                    ephemeral:true
                })
            }

            cpcSchema.findOne({Guild:interaction.guild.id}, async (err,data) =>{
                if(!data) {
                    const newCPC = await cpcSchema.create({
                        Guild: interaction.guild.id,
                        Channel: cpcChannel.id,
                    });
                    const succes_creat_cpc_msg = new EmbedBuilder()
                    .setTitle(`✅ 成功設定 **中油油價推播**`)
                    .setDescription(`中油的油價推播會在每週日的中午12點後推送`)
                    .setColor(`Green`)

                    interaction.reply({
                        embeds:[ succes_creat_cpc_msg ],
                        ephemeral:false
                    })
                } else {
                    const err_creat_cpc_msg = new EmbedBuilder()
                    .setTitle(`❌ 請確認使否有設定過推播頻道`)
                    .setColor(`Red`)

                    interaction.reply({
                        embeds:[ err_creat_cpc_msg ],
                        ephemeral:true
                    })
                };
            })
        }
};