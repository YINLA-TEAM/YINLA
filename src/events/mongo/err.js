const chalk = require("chalk");

module.exports = {
    name: "err",
    execute(err) {
        console.log(
            chalk.red("[DB] 連線錯誤"));
    },
};