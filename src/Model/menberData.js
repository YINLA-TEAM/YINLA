const {model, Schema} = require("mongoose");

let menberDataSchema = new Schema({
    Id: String,
    Guild: String,
    SignIn: Number,
});

module.exports = model("MenberData", menberDataSchema);