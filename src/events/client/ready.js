const { Signale } = require("signale");

module.exports = {
  name: "clientReady",
  once: true,
  async execute(client) {
    const logger = new Signale({
      scope: "READY",
    });
    logger.info(`機器人 : ${client.user.username}`);
    logger.info(`BOT ID : ${client.user.id}`);
    logger.info(`伺服器 : ${client.guilds.cache.size} 個`);
    logger.info(`機器人已啟動`);
  },
};
