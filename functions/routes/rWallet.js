const express = require("express");
const router = express.Router();

// const async = require("async");
const _ = require("lodash");

// const mUser = require("../models/mUser");
const mWallet = require("../models/mWallet");

router.post("/fetch", async (req, res) => {
  let query = {};

  if (req.body && req.body.userId) {
    query = {userId: req.body.userId};
  }

  const walletDocs = await mWallet.find(query, {}, {lean: true});

  const responseArr = [];
  walletDocs.forEach((eachWalletDoc) => {
    const output = {};
    output["userId"] = eachWalletDoc.userId;

    // income = credit total
    // withdraw = debit total
    // wallet = add and sub data total

    // total sum of credit logs
    // const totalShibaIncome = 0;
    let totalAdaIncome = 0;
    let totalTrxIncome = 0;
    // const totalTronIncome = 0;

    // total sum of debit logs
    // const totalShibaWithdraw = 0;
    let totalAdaWithdraw = 0;
    let totalTrxWithdraw = 0;

    // const totalTronWithdraw = 0;

    // const shibaWallet = 0;
    // const adaWallet = 0;
    // const tronWallet = 0;

    // const incomeLogs = [];
    // const withdrawLogs = []; // logs of credit(income) and debit(withdraw) of all coins

    // const allShibaLogs = [];
    let allAdaLogs = [];
    let allTrxLogs = [];
    // const allTronLogs = []; // includes of income, withdraw and both

    // const userId = eachWalletDoc["userId"];

    // const currencyName = "ADA";
    let adaCreditLogs = [];
    let adaDebitLogs = [];

    const trxCreditLogs = [];
    const trxDebitLogs = [];

    const grpTransactionByCurrencyName = _.groupBy(
        eachWalletDoc.transactions,
        "currencyName",
    );

    /** ADA coin start */
    if (
      grpTransactionByCurrencyName["ADA"] &&
      grpTransactionByCurrencyName["ADA"].length
    ) {
      allAdaLogs = grpTransactionByCurrencyName["ADA"];

      const grpdAdaLogsByType = _.groupBy(allAdaLogs, "type");

      if (grpdAdaLogsByType["C"] && grpdAdaLogsByType["C"].length) {
        adaCreditLogs = grpdAdaLogsByType["C"];
      }

      if (grpdAdaLogsByType["D"] && grpdAdaLogsByType["D"].length) {
        adaDebitLogs = grpdAdaLogsByType["D"];
      }

      adaCreditLogs.forEach((eachCreditLog) => {
        totalAdaIncome = totalAdaIncome + eachCreditLog["currencyCount"];
      });

      adaDebitLogs.forEach((eachDebitLog) => {
        totalAdaWithdraw = totalAdaWithdraw + eachDebitLog["currencyCount"];
      });
    }
    /** ADA coin end */

    /** Tron coin start */
    if (
      grpTransactionByCurrencyName["TRX"] &&
      grpTransactionByCurrencyName["TRX"].length
    ) {
      allTrxLogs = grpTransactionByCurrencyName["TRX"];

      const grpdTrxLogsByType = _.groupBy(allAdaLogs, "type");

      if (grpdTrxLogsByType["C"] && grpdTrxLogsByType["C"].length) {
        trxCreditLogs.push(grpdTrxLogsByType["C"]);
      }

      if (grpdTrxLogsByType["D"] && grpdTrxLogsByType["D"].length) {
        trxDebitLogs.push(grpdTrxLogsByType["D"]);
      }

      trxCreditLogs.forEach((eachCreditLog) => {
        totalTrxIncome = totalTrxIncome + eachCreditLog["currencyCount"];
      });

      trxDebitLogs.forEach((eachDebitLog) => {
        totalTrxWithdraw = totalTrxWithdraw + eachDebitLog["currencyCount"];
      });
    }
    /** Tron coin end */

    output["ada"] = {};
    output["ada"]["allAdaLogs"] = allAdaLogs;
    output["ada"]["adaCreditLogs"] = adaCreditLogs;
    output["ada"]["adaDebitLogs"] = adaDebitLogs;
    output["ada"]["totalAdaIncome"] = totalAdaIncome;
    output["ada"]["totalAdaWithdraw"] = totalAdaWithdraw;
    output["ada"]["adaWalletTotal"] = totalAdaIncome - totalAdaWithdraw;

    output["trx"] = {};
    output["trx"]["allTrxLogs"] = allTrxLogs;
    output["trx"]["trxCreditLogs"] = trxCreditLogs;
    output["trx"]["trxDebitLogs"] = trxDebitLogs;
    output["trx"]["totalTrxIncome"] = totalTrxIncome;
    output["trx"]["totalTrxWithdraw"] = totalTrxWithdraw;
    output["trx"]["trxWalletTotal"] = totalTrxIncome - totalTrxWithdraw;

    responseArr.push(output);
  });
  res.send({responseArr});
});

module.exports = router;
