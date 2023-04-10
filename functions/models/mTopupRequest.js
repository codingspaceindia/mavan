const mongoose = require("mongoose");
const typeString = {type: String};
// const typeStringReqUniq = {type: String, required: true, unique: true};

const topupRequestSchema = new mongoose.Schema(
    {
      "userId": typeString,
      "refId": typeString,
      "amount": Number,
      "status": typeString,
    },
);

topupRequestSchema.set("timestamps", true);
module.exports = mongoose.model("topupRequest", topupRequestSchema, "topupRequest");
