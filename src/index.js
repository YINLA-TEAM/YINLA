require('dotenv').config();
const { Client, ActivityType , Collection } = require('discord.js');
const { Player } = require("discord-player")
const fs = require('fs');

const client = new Client({intents: 32767});
client.commands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();
client.modals = new Collection();
client.player = new Player(client, {
    ytdlOptions: {
        quality: "highestaudio",
        highWaterMark: 1 << 25
    }
})
client.commandArray = [];


const functionFolders = fs.readdirSync(`./src/functions`);
for(const folder of functionFolders) {
    const functionFolders = fs
        .readdirSync(`./src/functions/${folder}`)
        .filter((file) => file.endsWith(".js"))
    for (const file of functionFolders)
        require(`./functions/${folder}/${file}`)(client);
}

client.handleEvents();
client.handleCommands();
client.handleComponents();
client.login(process.env.token).then(() => {
    client.user.setActivity(`${client.guilds.cache.size} 個伺服器`, {type: ActivityType.Watching});
})
