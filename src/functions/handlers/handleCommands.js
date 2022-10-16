const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');

module.exports = (client) => {
    client.handleCommands = async() => {
        const commandFolder = fs.readdirSync('./src/commands');
        for (const folder of commandFolder) {
            const commandFiles = fs
                .readdirSync(`./src/commands/${folder}`)
                .filter((file) => file.endsWith(".js"));
            const { commands, commandArray } = client;
            for (const file of commandFiles) {
                const command = require(`../../commands/${folder}/${file}`)
                commands.set(command.data.name, command);
                commandArray.push(command.data.toJSON())
                console.log(`指令 : ${command.data.name} ✅`)
            }
        }
    const clientId = '914150570250625044';
    const guildId = '1031159028505641011';
    const rest = new REST({version: '9'}).setToken(process.env.token);
    try {
        console.log("Slash Commands 已開始加載 🤔")

        await rest.put(Routes.applicationGuildCommands(clientId,guildId),{
            body: client.commandArray,
        });
        console.log("Slash Commands 已完成加載 ✅");
        } catch (error) {
            console.error(error);
        }
    };
};