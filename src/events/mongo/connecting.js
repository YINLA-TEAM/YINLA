const chalk = require("chalk");

module.exports = {
    name: "connecting",
    async execute() {
        console.log(chalk.cyan("[DB] 連線中..."));
    },
};