require('dotenv').config();
const { Client, ActivityType , Collection } = require('discord.js');
const { connect } = require('mongoose');
const { DisTube }= require('distube');
const { SpotifyPlugin } = require("@distube/spotify");
const fs = require('fs');

const client = new Client({intents: 32767});
client.commands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();
client.modals = new Collection();

client.commandArray = [];
client.commands.set([]);

const functionFolders = fs.readdirSync(`./src/functions`);
for(const folder of functionFolders) {
    const functionFolders = fs
        .readdirSync(`./src/functions/${folder}`)
        .filter((file) => file.endsWith(".js"))
    for (const file of functionFolders)
        require(`./functions/${folder}/${file}`)(client);
}

client.distube = new DisTube(client, {
    emitNewSongOnly: true,
    leaveOnFinish:true,
    emitAddSongWhenCreatingQueue:false,
    plugins:[
        new SpotifyPlugin(),
    ]
});

module.exports = client;

client.handleEvents();
client.handleCommands();
client.handleComponents();
client.login(process.env.token).then(() => {
    client.user.setActivity(`/help｜YINLA`, {type: ActivityType.Watching});
});
(async () => {
    await connect(process.env.databaseToken).catch(console.error);
})();
