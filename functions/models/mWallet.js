const mongoose = require("mongoose");
const typeString = {type: String};
const typeStringReq = {type: String, required: true};
const typeStringReqUniq = {type: String, required: true, unique: true};

const walletSchema = new mongoose.Schema(
    {
      userId: typeStringReqUniq,
      amount: {type: Number}, // total amount
      transactions: [
        {
          type: typeStringReq, // C  or D
          currencyName: typeStringReq,
          currencyCount: {type: Number},
          currencyPrice: {type: Number},
          amount: {type: Number, default: 0},
          baseCurrencyName: {type: String},
          transactionsAt: {type: Date, default: new Date()},
          serverMessage: typeStringReq,
          userMessage: typeString,
          withdrawId: typeString, // withdraw _id
        },
      ],
      // projectId: {type: String, required: true},
    },
);

walletSchema.set("timestamps", true);
module.exports = mongoose.model("wallet", walletSchema, "wallet");
