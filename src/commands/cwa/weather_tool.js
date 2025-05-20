const { EmbedBuilder, SlashCommandBuilder, MessageFlags } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weather_tool')
        .setNameLocalizations({
            "zh-TW" : "天氣小幫手",
        })
        .setDescription('小幫手會告訴你 今天天氣如何')
        .addStringOption(option => (
            option
                .setName("city")
                .setNameLocalizations({
                    "zh-TW": "縣市",
                })
                .setDescription("請選擇行政區 (由資料編號排序)"))
                .setRequired(true)
                .addChoices(
                    { name: '台北市', value: '009' },
                    { name: '新北市', value: '010' },
                    { name: '基隆市', value: '011' },
                    { name: '花蓮縣', value: '012' },
                    { name: '宜蘭縣', value: '013' },
                    { name: '金門縣', value: '014' },
                    { name: '澎湖縣', value: '015' },
                    { name: '台南市', value: '016' },
                    { name: '高雄市', value: '017' },
                    { name: '嘉義縣', value: '018' },
                    { name: '嘉義市', value: '019' },
                    { name: '苗栗縣', value: '020' },
                    { name: '台中市', value: '021' },
                    { name: '桃園市', value: '022' },
                    { name: '新竹縣', value: '023' },
                    { name: '新竹市', value: '024' },
                    { name: '屏東縣', value: '025' },
                    { name: '南投縣', value: '026' },
                    { name: '臺東縣', value: '027' },
                    { name: '彰化縣', value: '028' },
                    { name: '雲林縣', value: '029' },
                    { name: '連江縣', value: '030' },
                )
        ),

    async execute(interaction){
        await interaction.deferReply({
            withResponse: true,
            flags: MessageFlags.Ephemeral,
        });
        
        const wtResult  = await axios.get(`https://opendata.cwa.gov.tw/fileapi/v1/opendataapi/F-C0032-${interaction.options.getString('city')}?Authorization=${process.env.cwa_key}&downloadType=WEB&format=JSON`);
        const { cwaopendata } = wtResult.data;
        const wt_tool = cwaopendata.dataset;

        const ct_name = wt_tool.location.locationName;
        const ct_desc = wt_tool.parameterSet.parameter;
        const ct_desc_list = [];

        for (i = 0; i <= wt_tool.parameterSet.parameter.length - 1; i++) {
            ct_desc_list.push(ct_desc[i].parameterValue);
        }

        const wtEmbed = new EmbedBuilder()
        .setAuthor({
            name: "天氣小幫手",
        })
        .setColor('Random')
        .setTitle(ct_name)
        .setDescription(ct_desc_list.join('\n\n'))
        .setFooter({
            text: `交通部中央氣象署 提供`,
            iconURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/ROC_Central_Weather_Bureau.svg/1200px-ROC_Central_Weather_Bureau.svg.png"
        })

        await interaction.editReply({
            embeds: [wtEmbed],
        });
    }
}