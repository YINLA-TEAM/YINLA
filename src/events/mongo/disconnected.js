const { Signale } = require("signale");

const logger = new Signale({
  scope: "MONDB",
});

module.exports = {
  name: "disconnected",
  execute() {
    logger.error("已離線");
  },
};
