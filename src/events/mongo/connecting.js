const { Signale } = require("signale");

const logger = new Signale({
  scope: "MONDB",
});

module.exports = {
  name: "connecting",
  async execute() {
    logger.await("連線中...");
  },
};
