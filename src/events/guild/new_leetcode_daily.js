const cron = require('cron');
const { ThumbnailBuilder, TextDisplayBuilder, SectionBuilder, 
        ContainerBuilder, SeparatorSpacingSize, MessageFlags,
        ButtonBuilder, ButtonStyle, ActionRowBuilder, Colors } = require('discord.js');
const html2md = require('html-to-md');

const fetchLeetCodeDaily = async () => {
    const response = await fetch('https://alfa-leetcode-api.onrender.com/daily', { method: 'GET' });
    const data = await response.json();
    if(data) return data;
    else return;
}

const difficulty_color = (difficulty) => {
    if(difficulty === "Easy") return Colors.Green
    else if(difficulty === "Medium") return Colors.Yellow
    else if(difficulty === "Hard") return Colors.Red
    else return Colors.Random
}

module.exports = {
    name: 'ready',
    once: false,
    async execute(client) {
        const job = new cron.CronJob("10 8 * * *", async function () {
            const today = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });
            const data = await fetchLeetCodeDaily();
            const leetcode_channel = client.channels.cache.get(process.env.leetcode_channel);
            if (!leetcode_channel) return;

            const leetcode_logo = new ThumbnailBuilder()
                .setURL('https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png')
            
            const leetcode_title = new TextDisplayBuilder()
                .setContent([
                    `**${today} LeetCode Daily**`,
                    `# [[${data.questionFrontendId}] ${data.questionTitle}](${data.questionLink}/description/?envType=daily-question&envId=${data.date})`,
                ].join('\n'))

            const leetcode_header = new SectionBuilder()
                .setThumbnailAccessory(leetcode_logo)
                .addTextDisplayComponents(leetcode_title)

            const leetcode_description = new TextDisplayBuilder()
                .setContent(
                    `${html2md(data.question).replace(/<sub>(.*?)<\/sub>/g, '_$1')}`
                )

            const leetcode_error_msg = new TextDisplayBuilder()
                .setContent([
                    `# 發生錯誤！`,
                    `請回報`,
                ].join('\n'))

            const leetcode_footer = new TextDisplayBuilder()
                .setContent(`-# 此為測試功能，如果有誤請回報`)

            const leetcode_button = new ButtonBuilder()
                .setLabel('Question')
                .setStyle(ButtonStyle.Link)
                .setURL(`${data.questionLink}/description/?envType=daily-question&envId=${data.date}`)

            const leetcode_url = new ActionRowBuilder()
                .addComponents(leetcode_button)

            const leetcode_container = new ContainerBuilder()

            if(data){
                leetcode_container
                    .setId(1)
                    .setSpoiler(false)
                    .setAccentColor(difficulty_color(data.difficulty))
                    .addSectionComponents(leetcode_header)
                    .addSeparatorComponents(separator => separator.setSpacing(SeparatorSpacingSize.Small))
                    .addTextDisplayComponents(leetcode_description)
                    .addActionRowComponents(leetcode_url)
                    .addTextDisplayComponents(leetcode_footer)
            } else {
                leetcode_container
                    .setId(1)
                    .setSpoiler(false)
                    .addTextDisplayComponents(leetcode_error_msg)
                    .addTextDisplayComponents(leetcode_footer)
            }

            leetcode_channel.send({
                silent: true,
                components: [ leetcode_container ],
                flags: [ MessageFlags.IsComponentsV2 ],
            });
            console.log('[發布] LeetCode Daily');
        }, null, true, 'Asia/Taipei');

        job.start();
        console.log('[啟動] LeetCode Daily任務');
    }
}