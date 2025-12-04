const { REST } = require("discord.js");
const { Routes } = require("discord.js");
const { Signale } = require("signale");
const fs = require("fs");

module.exports = (client) => {
  const logger = new Signale({
    scope: "SLCMD",
  });
  client.handleCommands = async () => {
    const commandFolder = fs.readdirSync("./src/commands");
    const { commands, commandArray = [] } = client;
    const interactive_commands = new Signale({
      scope: "SLCMD",
      interactive: true,
    });
    for (const folder of commandFolder) {
      const commandFiles = fs
        .readdirSync(`./src/commands/${folder}`)
        .filter((file) => file.endsWith(".js"));
      for (const file of commandFiles) {
        const command = require(`../../commands/${folder}/${file}`);
        commands.set(command.data.name, command);
        commandArray.push(command.data.toJSON());
        interactive_commands.await(`${command.data.name}`);
      }
    }
    interactive_commands.success("所有 SlashCommands 已讀取");
    const clientId = process.env.botId;
    const rest = new REST({ version: "9" }).setToken(process.env.token);
    try {
      const interactive = new Signale({
        scope: "SLCMD",
      });
      interactive.await("SlashCommands 已開始加載");
      await rest.put(Routes.applicationCommands(clientId), {
        body: client.commandArray,
      });
      interactive.success("SlashCommands 已完成加載");
    } catch (error) {
      logger.error(error);
    }
  };
};
