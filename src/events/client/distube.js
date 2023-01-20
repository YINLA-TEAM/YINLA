const client = require("../../index.js");
const { EmbedBuilder } = require("discord.js");



const status = queue =>
    `循環播放: \`${queue.repeatMode ? (queue.repeatMode === 2 ? '列表' : '單曲') : '關閉'
    }\``
client.distube
    .on('playSong', (queue, song) => {
        play_embed = new EmbedBuilder()
            .setColor("Random")
            .setTitle(`<a:playing:1064541169960374364> | 正在播放`)
            .setImage(song.thumbnail)
            .setFooter({
                iconURL: client.user.displayAvatarURL(),
                text: `YINLA`
            })
            .addFields(
                [{
                    name:`歌名`,
                    value:`[${song.name}](${song.url})`,
                    inline:true
                },
                {
                    name:`時長`,
                    value:`\`${song.formattedDuration}\``,
                    inline:true
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
        .setTitle(`<a:check:1064547948605755402>  | 已加入歌曲`)
        .setImage(song.thumbnail)
        .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: `YINLA`
        })
        .addFields(
            [{
                name:`歌名`,
                value:`[${song.name}](${song.url})`,
                inline:true
            },
            {
                name:`時長`,
                value:`\`${song.formattedDuration}\``,
                inline:true
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
        .setTitle(`<a:check:1064547948605755402>  | 已加入播放清單<:playlist:1064554683907194950> `)
        .setThumbnail(playlist.thumbnail)
        .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: `YINLA`
        })
        .addFields(
            [{
                name:`<:playlist:1064554683907194950> 播放清單`,
                value:`[${playlist.name}](${playlist.url})`,
                inline:true
            },
            {
                name:`數量`,
                value:`\`${playlist.songs.length}\` 首`,
                inline:true
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
        if (channel) channel.send(`<a:error:1064547950753218570> | 發生一個錯誤: \`\`\`\n${e.toString().slice(0, 1974)}\n\`\`\``)
        else console.error(e)
    })
    .on('empty', channel => channel.send({
        embeds: [new EmbedBuilder().setColor("Random")
            .setDescription('<a:error:1064547950753218570> |Voice channel is empty! Leaving the channel...')]
    }))
    .on('searchNoResult', (message, query) =>
        message.channel.send(
            {
                embeds: [new EmbedBuilder().setColor("Random")
                    .setDescription(`<a:error:1064547950753218570> | No result found for \`${query}\`!`)]
            })
    )
    .on('finish', queue => queue.textChannel.send({
        embeds: [new EmbedBuilder().setColor("Random")
            .setTitle('<a:check:1064547948605755402>  | 全部歌曲都撥放完畢了!!')]
    }))