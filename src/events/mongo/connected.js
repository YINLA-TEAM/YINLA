const { Signale } = require("signale");

const logger = new Signale({
  scope: "MONDB",
});

module.exports = {
  name: "connected",
  execute() {
    logger.success("已連線");
  },
};
