module.exports = {
    name:'ready',
    once:true,
    async execute(client) {
        console.log('-------------------------------');
        console.log(`機器人 : ${client.user.username}`)
        console.log(`BOT ID : ${client.user.id}`)
        console.log(`伺服器 : ${client.guilds.cache.size} 個`)
        console.log(`---------機器人已啟動----------`)
        
    }
}