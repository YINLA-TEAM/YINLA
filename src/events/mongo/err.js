const { Signale } = require("signale");

const logger = new Signale({
  scope: "MONDB",
});

module.exports = {
  name: "err",
  execute(err) {
    logger.error("連線錯誤", err);
  },
};
