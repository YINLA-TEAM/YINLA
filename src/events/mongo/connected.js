const chalk = require("chalk");

module.exports = {
    name: "connected",
    execute() {
        console.log(chalk.green("[DB] 已連線"));
    },
};