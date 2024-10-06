const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const welcomeSchema = require("../../Model/welcome");

module.exports = {
    data: new SlashCommandBuilder()
        .setName(`setup-welcome`)
        .setNameLocalizations({
            "zh-TW" : "設定歡迎訊息",
            "zh-CN" : "设定欢迎讯息",
            "ja" : "ウェルカムメッセージを設定する",
            "ko" : "환영메시지설정"
        })
        .setDescription("設定歡迎頻道")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option => 
            option.setName("頻道")
            .setDescription("選擇頻道發送")
            .setRequired(true)
        )
        .addRoleOption(option => 
            option.setName("加入應得的身分組")
            .setDescription("設定加入應得的身分組")
            .setRequired(true)
        )
        .addStringOption(option=>
            option.setName("歡迎訊息")
            .setDescription("設定歡迎訊息")
            .setRequired(false)
        ),

    async execute(interaction) {
        const { options } = interaction;
        
        const welcomeChannel = options.getChannel("頻道");
        const welcomeMessage = options.getString("歡迎訊息");
        const roleId = options.getRole("加入應得的身分組");

        if(!interaction.guild.members.me.permissions.has(PermissionFlagsBits.Administrator)) {
            const no_admin_msg = new EmbedBuilder()
                .setTitle(`❌ **你沒有權限**`)
                .setColor(`Red`)

            interaction.reply({
                embeds:[ no_admin_msg ],
                ephemeral:true
            })
        }

        welcomeSchema.findOne({Guild:interaction.guild.id}, async (err,data) =>{
            if(!data) {
                const newWelcome = await welcomeSchema.create({
                    Guild:interaction.guild.id,
                    Channel: welcomeChannel.id,
                    Msg: welcomeMessage,
                    Role:roleId.id
                });
                const succes_creat_welcome_msg = new EmbedBuilder()
                .setTitle(`✅ 成功建立 **歡迎訊息**`)
                .setColor(`Green`)

                interaction.reply({
                    embeds:[ succes_creat_welcome_msg ],
                    ephemeral:true
                })
            } else {
                const err_creat_welcome_msg = new EmbedBuilder()
                .setTitle(`❌ 請確認使否有設定過推播頻道`)
                .setColor(`Red`)

                interaction.reply({
                    embeds:[ err_creat_welcome_msg ],
                    ephemeral:true
                })
            }
        })
    }
}