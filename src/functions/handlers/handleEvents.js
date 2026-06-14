const fs = require("fs");
const { connection } = require("mongoose");
const { Signale } = require("signale");

module.exports = (client) => {
  client.handleEvents = async () => {
    const logger = new Signale({
      scope: "EVENT",
    });
    const eventFolders = fs.readdirSync(`./src/events`);
    for (const folder of eventFolders) {
      const eventFiles = fs
        .readdirSync(`./src/events/${folder}`)
        .filter((file) => file.endsWith(".js"));

      const emitter = folder === "mongo" ? connection : client;

      for (const file of eventFiles) {
        const event = require(`../../events/${folder}/${file}`);
        const handler = (...args) => event.execute(...args, client);
        if (event.once) emitter.once(event.name, handler);
        else emitter.on(event.name, handler);
      }

      logger.success(`事件類型：${folder} ✅`);
    }
  };
};
