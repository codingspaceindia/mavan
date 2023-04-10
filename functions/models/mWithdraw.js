// withdraw request logs
const mongoose = require("mongoose");
const typeString = {type: String};
const typeStringReq = {type: String, required: true};
const typeStringReqUniq = {type: String, required: true, unique: true};

const withdrawSchema = new mongoose.Schema({
  userId: typeStringReqUniq,
  logs: [
    {
      currencyName: typeStringReq,
      currencyCount: {type: Number},
      currencyPrice: {type: Number},
      amount: {type: Number, default: 0},
      baseCurrencyName: {type: String},

      tronAddress: {type: String, default: null},

      withdrawReqAt: {type: Date}, // withdraw request at
      withdrawResAt: {type: Date}, // withdraw response at
      withdrawStatus: typeString, // S => Submitted, A => Accepted, R => Rejected
    },
  ],
  // projectId: {type: String, required: true},
});

withdrawSchema.set("timestamps", true);
module.exports = mongoose.model("withdraw", withdrawSchema, "withdraw");
