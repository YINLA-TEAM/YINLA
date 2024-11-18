require('dotenv').config();
const { Client, ActivityType , Collection, GatewayIntentBits } = require('discord.js');
const { connect, mongoose } = require('mongoose');
const fs = require('fs');

const client = new Client({intents: [32767, GatewayIntentBits.MessageContent]});
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
module.exports = client;

client.handleEvents();
client.handleCommands();
client.handleComponents();
client.login(process.env.token).then(() => {
    client.user.setActivity(`${process.env.bot_status}`, {type: ActivityType.Watching});
});

mongoose.set('strictQuery', false);
(async () => {
    await connect(process.env.databaseToken).catch(console.error);
})();
