const client = require("../../index.js");
const { EmbedBuilder } = require("discord.js");



const status = queue =>
    `循環播放: \`${queue.repeatMode ? (queue.repeatMode === 2 ? '列表' : '單曲') : '關閉'
    }\``
client.distube
    .on('playSong', (queue, song) => {
        play_embed = new EmbedBuilder()
            .setColor("Random")
            .setTitle(`🎶 | 正在播放`)
            .setImage(song.thumbnail)
            .setFooter({
                iconURL: client.user.displayAvatarURL(),
                text: `YINLA`
            })
            .addFields(
                [{
                    name:`歌名`,
                    value:`[${song.name}](${song.url})`
                },
                {
                    name:`時長`,
                    value:`\`${song.formattedDuration}\``
                },
                {
                    name:`加入者`,
                    value: `${song.user}`
                    
                },]
            )
            .setDescription(`${status(queue)}`),
        
        queue.textChannel.send({
                embeds: [play_embed]
            })
    }
        
    )
    .on('addSong', (queue, song) => {
        add_embed = new EmbedBuilder()
        .setColor("Random")
        .setTitle(`🎶 | 已加入`)
        .setImage(song.thumbnail)
        .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: `YINLA`
        })
        .addFields(
            [{
                name:`歌名`,
                value:`[${song.name}](${song.url})`
            },
            {
                name:`時長`,
                value:`\`${song.formattedDuration}\``
            },
            {
                name:`加入者`,
                value: `${song.user}`
            },]
        )
        .setDescription(`${status(queue)}`),
    queue.textChannel.send({
        embeds: [add_embed]
    })
    }
    )
    .on('addList', (queue, playlist) => {
        addlist_embed = new EmbedBuilder()
        .setColor("Random")
        .setTitle(`🎶 | 已加入播放清單`)
        .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: `YINLA`
        })
        .addFields(
            [{
                name:`播放清單`,
                value:`\`${playlist.name}\``
            },
            {
                name:`數量`,
                value:`\`${playlist.songs.length}\` 首`
            },
            {
                name:`加入者`,
                value: `${playlist.user}`
            },]
        )
        .setDescription(`${status(queue)}`),
    queue.textChannel.send({
        embeds: [addlist_embed]
    })
    }
    
    )
    .on('error', (channel, e) => {
        if (channel) channel.send(`⛔ | 發生一個錯誤: ${e.toString().slice(0, 1974)}`)
        else console.error(e)
    })
    .on('empty', channel => channel.send({
        embeds: [new EmbedBuilder().setColor("Random")
            .setDescription('⛔ |Voice channel is empty! Leaving the channel...')]
    }))
    .on('searchNoResult', (message, query) =>
        message.channel.send(
            {
                embeds: [new EmbedBuilder().setColor("Random")
                    .setDescription(`⛔ | No result found for \`${query}\`!`)]
            })
    )
    .on('finish', queue => queue.textChannel.send({
        embeds: [new EmbedBuilder().setColor("Random")
            .setTitle('🏁 | 全部歌曲都撥放完畢了!!')]
    }))