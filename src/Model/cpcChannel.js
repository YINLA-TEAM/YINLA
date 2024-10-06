const {model, Schema} = require("mongoose");

let cpcSchema = new Schema({
    Guild: String,
    Channel: String,
    priceUpdateDate: String,
});

module.exports = model("cpcChannel", cpcSchema);