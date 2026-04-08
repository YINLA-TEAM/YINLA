const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const cheerio = require('cheerio');

const fetchTRTCweb = async () => {
  const response = await fetch("https://web.metro.taipei/c/servicerealstatus2023.asp", { method: 'GET' });
  const data = await response.text();
  const $ = cheerio.load(data);

  const routeArray = [];
  const status = [];

  $('.route').each((i, elem) => {
    const RouteName = $(elem).find('.routetitle').text().trim();
    const RouteTag = $(elem).find('.routebox').text().trim();
    const RouteStatus = $(elem).find('.statusimg img').attr('title');

    routeArray.push({
      RouteName,
      RouteTag,
      RouteStatus,
    })
  })

  const Announcement = $('#abgne_marquee marquee')?.text().trim() || "目前沒有公告事項";
  const IMG = $('#abgne_marquee marquee a')?.attr('href') || null;

  status.push({
    Announcement,
    IMG,
  })

  return {
    routeArray,
    status
  };
}

const stautuType = (route, msg) => {
  let statu = "";
  if (msg == route + "目前正常營運") statu = "🟢 目前正常營運";
  else if (msg == route + "目前非營運時間") statu = "⚪️ 目前非營運時間";
  else if (msg == route + "系統異常") statu = "🟠 系統異常"
  else statu = '🟡' + msg;
  return statu;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mrt-trtc')
    .setNameLocalizations({
      "zh-TW": "臺北捷運營運狀況"
    })
    .setDescription("查詢臺北捷運營運狀況"),

  async execute(interaction) {
    await interaction.deferReply({
      withResponse: true,
      flags: MessageFlags.Ephemeral,
    });

    const data = await fetchTRTCweb();
    const routeEmbed = new EmbedBuilder()
      .setAuthor({
        name: "臺北捷運",
        url: "https://www.metro.taipei/Default.aspx",
      })
      .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Taipei_mrt_logo.svg/2473px-Taipei_mrt_logo.svg.png')
      .setTitle("目前營運狀態")
      .setDescription(
        `${data.routeArray.map((route) => `**${route.RouteTag}** - **${route.RouteName}**：${stautuType(route.RouteName, route.RouteStatus)}`).join('\n')}\n
                \`\`\`${data.status[0].Announcement}\`\`\`
            `)
      .setImage(data.status[0].IMG)
      .setColor('Blue')
      .setFooter({ text: "資料來源 臺北大眾捷運股份有限公司" })

    await interaction.editReply({
      embeds: [routeEmbed]
    });
  }
}
