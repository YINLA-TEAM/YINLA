const {model, Schema} = require("mongoose");

let eqSchema = new Schema({
    Guild: String,
    Channel: String,
    E_LastReportContent: String,
    S_LastReportContent: String,
});

module.exports = model("eqChannel", eqSchema);