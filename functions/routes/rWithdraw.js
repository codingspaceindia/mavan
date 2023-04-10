const express = require("express");
const router = express.Router();

const {TransactionServerMessage} = require("../common/constant");

const {commonResponse} = require("../common/commonFunction");

const _ = require("lodash");

const mUser = require("../models/mUser");
const mWithdraw = require("../models/mWithdraw");
const mWallet = require("../models/mWallet");

router.post("/createRequest", (req, res) => {
  const newWithdrawLog = {
    currencyName: req.body.currencyName,
    currencyCount: req.body.currencyCount,
    tronAddress: req.body.tronAddress,
    currencyPrice: null,
    // req.body.amount,
    amount: null,
    baseCurrencyName: null,

    withdrawReqAt: new Date(),
    withdrawResAt: null,
    withdrawStatus: "S",
  };

  mWithdraw.findOneAndUpdate(
      {userId: req.body.token.userId},
      {$push: {logs: newWithdrawLog}},
      {new: true},
      (err, docs) => {
        if (err) {
          const response = commonResponse(
              err,
              null,
              "Failed to create withdraw request",
          );
          res.status(500).send(response);
        } else {
        // add debit log in wallet, while creating withdraw request
          const count = docs["logs"].length;
          const currenWithdrawReqLog = docs["logs"][count - 1];

          const newTransaction = {
            type: "D",
            currencyName: currenWithdrawReqLog["currencyName"],
            currencyCount: currenWithdrawReqLog["currencyCount"],
            currencyPrice: null,
            amount: null,
            baseCurrencyName: null,
            serverMessage: TransactionServerMessage.WITHDRAW,
            userMessage: "",
            withdrawId: currenWithdrawReqLog._id,
          };

          const updateWalletObj = {
            $push: {transactions: newTransaction},
          };

          mWallet.findOneAndUpdate(
              {userId: req.body.token.userId},
              updateWalletObj,
              {new: true},
              (walletErr, walletDocs) => {
                if (walletErr) {
                  const response = commonResponse(
                      walletErr,
                      null,
                      "Withdraw request creation failed",
                  );
                  res.status(500).send(response);
                } else {
                  const response = commonResponse(
                      null,
                      null,
                      "Withdraw request created successfully",
                  );
                  res.status(200).send(response);
                }
              },
          );
        }
      },
  );
});

router.post("/getSubmittedRequest", async (req, res) => {
  try {
    // 1. Get withdraw docs
    const query = {
      projectId: req.body.token.projectId,
      logs: {
        $elemMatch: {withdrawStatus: "S"},
      },
    };
    const projection = {logs: 1, userId: 1};
    const docs = await mWithdraw.find(query, projection, {lean: true});

    docs.forEach((eachDoc) => {
      const temp = eachDoc.logs.filter(
          (eachDoc2) => eachDoc2["withdrawStatus"] == "S",
      );
      eachDoc["logs"] = temp;
    });

    // 2. Get all userIds from withdraw docs
    const userIds = [];
    docs.forEach((each) => {
      userIds.push(each.userId);
    });

    // 3. Get userDocs
    const userProjection = {
      refId: 1,
      userName: 1,
      mobile: 1,
      email: 1,
      plan: 1,
    };
    const userQuery = {
      _id: {$in: userIds},
      projectId: req.body.token.projectId,
    };

    // 4. Group user docs by _id
    const userDocs = await mUser.find(userQuery, userProjection, {
      lean: true,
    });
    const grpdDocs = _.groupBy(userDocs, "_id");

    // 5. Set user docs in withdraw docs;
    docs.forEach((eachDoc) => {
      eachDoc["user"] = grpdDocs[eachDoc.userId][0];
    });

    const response = commonResponse(null, docs, "Fetch list success");
    res.status(200).send(response);
  } catch (err) {
    console.log(err);
    const response = commonResponse(err, null, "Fetch list failed");
    res.status(500).send(response);
  }
});

router.post("/reject", async (req, res) => {
  const query = {
    "userId": req.body.userId,
    "logs._id": req.body.withdrawId,
  };

  const updateObj = {
    $set: {
      "logs.$.withdrawResAt": new Date(),
      "logs.$.withdrawStatus": "R",
    },
  };
  mWithdraw.findOneAndUpdate(query, updateObj, {new: true}, (err, docs) => {
    if (err) {
      const response = commonResponse(
          err,
          {isRejected: false},
          "Withdraw rejection failed",
      );
      res.status(500).send(response);
    } else if (docs) {
      // add credit log in wallet, while rejecting withdraw request

      let currenWithdrawReqLog = null;

      docs.logs.forEach((eachLog) => {
        if (eachLog._id == req.body.withdrawId) {
          currenWithdrawReqLog = eachLog;
        }
      });

      const newTransaction = {
        type: "C",
        currencyName: currenWithdrawReqLog["currencyName"],
        currencyCount: currenWithdrawReqLog["currencyCount"],
        currencyPrice: null,
        amount: null,
        baseCurrencyName: null,
        serverMessage: TransactionServerMessage.WITHDRAW_REJECTED,
        userMessage: "",
        withdrawId: currenWithdrawReqLog._id,
      };

      const updateWalletObj = {
        $push: {transactions: newTransaction},
      };

      mWallet.findOneAndUpdate(
          {userId: req.body.userId},
          updateWalletObj,
          {new: true},
          (walletErr, walletDocs) => {
            if (walletErr) {
              const response = commonResponse(
                  walletErr,
                  null,
                  "Withdraw request rejection failed",
              );
              res.status(500).send(response);
            } else {
              const response = commonResponse(
                  null,
                  null,
                  "Withdraw request rejected successfully",
              );
              res.status(200).send(response);
            }
          },
      );
    } else {
      const response = commonResponse(
          err,
          {isRejected: false},
          "Withdraw data not found for given user",
      );
      res.status(500).send(response);
    }
  });
});

router.post("/accept", async (req, res) => {
  try {
    // 1. Set accept status in withdraw collection
    const query = {
      "userId": req.body.userId,
      "logs._id": req.body.withdrawId,
    };

    const updateObj = {
      $set: {
        "logs.$.withdrawResAt": new Date(),
        "logs.$.withdrawStatus": "A",
      },
    };
    await mWithdraw.findOneAndUpdate(query, updateObj, {
      new: true,
    });

    const response = commonResponse(
        null,
        null,
        "Withdraw request accepted successfully",
    );
    res.status(500).send(response);
  } catch (err) {
    const response = commonResponse(
        err,
        null,
        "Withdraw request accept failed",
    );
    res.status(500).send(response);
  }
});

module.exports = router;
