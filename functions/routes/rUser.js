const express = require("express");
const router = express.Router();
const {commonResponse} = require("../common/commonFunction");
const {
  TransactionServerMessage,
  TransactionMessageForLevels,
} = require("../common/constant");
// getRandomPassword
const {
  getDeepLeftNodeId,
  getDeepRightNodeId,
  getUserMailContent,
  sendMail,
} = require("../common/helper");
const helper = require("../common/helper");

const Chance = require("chance");
const chance = new Chance();
const async = require("async");
const _ = require("lodash");
const nodemailer = require("nodemailer");

const mUser = require("../models/mUser");
const mWallet = require("../models/mWallet");
const mChild = require("../models/mChild");
const mAuth = require("../models/mAuth");
const mWithdraw = require("../models/mWithdraw");
const cryptoHelper = require("../common/cryptoHelper");

/**
 * Admin data {
 * "_id" : ObjectId("618e6b39393745eb39623609"),
 * "refId" : "UT001",
 * "userName" : "Admin"
 * "projectId": "6193c063cbb3d15ae87f95ac",
 * }.
 *
 * @todo Email and Phone number unique validation.
 */
router.post("/save", async function(req, res) {
  try {
    const userPrefix = "UT";
    const userReq = req.body;

    let totalCount = await mUser.countDocuments({});
    totalCount++;

    const parentData = await mUser.findOne(
        {refId: userReq.parentRefId},
        {},
        {lean: true},
    );

    if (!(parentData.plan == userReq.plan)) {
      throw Error("Parent plan is not match with your current plan");
    }

    const parentId = parentData._id + "";
    const newRefId = userPrefix + chance.pad(totalCount, 5);

    userReq.refId = newRefId;
    userReq.parentId = parentId;
    userReq.status = "P";
    userReq.plan = req.body.plan;
    userReq.statusReqAt = new Date();

    const newUser = new mUser(userReq);
    const user = await newUser.save(userReq);
    const userId = user._id;

    res
        .status(200)
        .send(
            commonResponse(
                null,
                {userId},
                "User created successfully. Waiting for approval",
            ),
        );
  } catch (err) {
    console.log(err);
    res
        .status(500)
        .send(commonResponse(err.message, {isUserCreated: false}, err.name));
  }
});

/**
 * .
 * UserId
 * User accepted
 * Create auth, withdraw, wallet, child docs
 * Set left right side user and send mail.
 */
router.post("/acceptUserStatus", async (req, res) => {
  try {
    const userId = req.body.userId;
    const userDocs = await mUser.findOne({_id: userId});

    // if (userDocs.status == "P") {
    const updObj = {
      status: "A",
      statusResAt: new Date(),
    };

    await mUser.findOneAndUpdate({_id: userId}, {$set: updObj});

    const userPassword = "12345"; // getRandomPassword(); // setting default password
    const parentId = userDocs.parentId;

    const userAuth = {
      userId: userId,
      password: userPassword,
    };

    // Create Auth docs
    const newAuthDocs = new mAuth(userAuth);
    await newAuthDocs.save();

    // Create withdraw docs
    const userWithdrawObj = {
      userId: userId,
    };
    const newWithDrawDocs = new mWithdraw(userWithdrawObj);
    await newWithDrawDocs.save();

    // Create wallet data
    const newWallet = new mWallet();
    newWallet.userId = userId;
    newWallet.amount = 0;
    const userWallet = await newWallet.save();

    // create child data
    const newChild = new mChild();
    newChild.userId = userId;
    const userChild = await newChild.save();

    // add newUser to parents child
    const allChildData = await mChild.find({}, {}, {lean: true});

    // left child flow
    if (userDocs.side == "LEFT") {
      const leftParentId = getDeepLeftNodeId(allChildData, parentId);

      if (leftParentId == parentId) {
        const newLeft = {
          userId,
          joinedByRefId: userDocs.parentRefId,
          joinedAt: new Date(),
        };
        await mChild.findOneAndUpdate(
            {userId: parentId},
            {$set: {left: newLeft}},
        );
      } else {
        const leftParentData = await mUser.findOne(
            {_id: leftParentId},
            {},
            {lean: true},
        );

        const newParentDetails = {
          parentRefId: leftParentData.refId,
          parentId: leftParentId,
        };
        await mUser.findOneAndUpdate(
            {_id: userId},
            {$set: newParentDetails},
        );

        const newLeft = {
          userId,
          joinedByRefId: userDocs.parentRefId,
          joinedAt: new Date(),
        };
        await mChild.findOneAndUpdate(
            {userId: leftParentId},
            {$set: {left: newLeft}},
        );
      }
    } else if (userDocs.side == "RIGHT") {
      const rightParentId = getDeepRightNodeId(allChildData, parentId);

      if (rightParentId == parentId) {
        const newRight = {
          userId,
          joinedByRefId: userDocs.parentRefId,
          joinedAt: new Date(),
        };
        await mChild.findOneAndUpdate(
            {userId: parentId},
            {$set: {right: newRight}},
        );
      } else {
        const rightParentData = await mUser.findOne(
            {_id: rightParentId},
            {},
            {lean: true},
        );

        const newParentDetails = {
          parentRefId: rightParentData.refId,
          parentId: rightParentId,
        };
        await mUser.findOneAndUpdate(
            {_id: userId},
            {$set: newParentDetails},
        );

        const newRight = {
          userId,
          joinedByRefId: userDocs.parentRefId,
          joinedAt: new Date(),
        };
        await mChild.findOneAndUpdate(
            {userId: rightParentId},
            {$set: {right: newRight}},
        );
      }
    }

    const response = {
      userId: userId,
      walletId: userWallet._id,
      childNodeId: userChild._id,
      userDocs: userDocs,
    };

    const mailContent = getUserMailContent(
        userDocs.userName,
        userPassword,
        userDocs.refId,
    );
    const mailSubject = "Universal Trade Credentials";
    sendMail(userDocs.email, mailSubject, mailContent);

    res.status(200).send(commonResponse(null, response, null));
    // } else if (userDocs.status == "A" || userDocs.status == "R") {
    //   throw Error("User's status processed already");
    // } else {
    //   throw Error("Error");
    // }
  } catch (err) {
    console.log(err);
    res
        .status(500)
        .send(commonResponse(err.name, {isUserUpdated: false}, err.message));
  }
});

/**
 * Reject user status.
 */
router.post("/rejectUserStatus", async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await mUser.findOne({_id: userId}, {}, {lean: true});

    if (user.status == "P") {
      const updateObj = {
        status: "R",
        statusResAt: new Date(),
      };

      await mUser.findOneAndUpdate({_id: userId}, updateObj);
      res
          .status(200)
          .send(
              commonResponse(null, {userId}, "User status updated successfully"),
          );
    } else if (user.status == "A" || user.status == "R") {
      throw Error("User's status processed already");
    } else {
      throw Error("Error");
    }
  } catch (err) {
    res
        .status(500)
        .send(commonResponse(err.name, {isUserCreated: false}, err.message));
  }
});

router.post("/getUserById", async function(req, res) {
  try {
    const user = await mUser.findOne(
        {_id: req.body.token.userId, plan: req.body.token.plan},
        {},
        {lean: true},
    );
    const response = commonResponse(null, user, "User fetch success");
    res.status(200).send(response);
  } catch (err) {
    console.log(err);
    const response = commonResponse(err, null, "Cannot fetch user");
    res.status(500).send(response);
  }
});

/**
 * @description Get pending users list.
 */
router.post("/getPendingUsers", async (req, res) => {
  try {
    const projection = {
      refId: 1,
      userName: 1,
      createdAt: 1,
      email: 1,
      plan: 1,
      parentRefId: 1,
      mobile: 1,
    };
    const query = {status: "P", plan: req.body.token.plan};

    const pendingUsers = await mUser.find(query, projection, {lean: true});
    const response = commonResponse(null, pendingUsers, "User fetch success");
    res.status(200).send(response);
  } catch (err) {
    const response = commonResponse(err, null, "Cannot fetch user");
    res.status(500).send(response);
  }
});

router.post("/cryptoTest", async (req, res) => {
  /**
   * // Access 25
   * // parent ku 4,000 worth ada coin, 1000 rup worth shib every 30 days .
   *
   * // Access 200
   * // 40 tron coin count oru parent
   * // total 16 child kum 40 tron coin count poganum.
   *
   * // Own left child
   * // right child.
   *
   * // Total 16 child kum ada coin 4000 worth poganum.
   * // Wallet withdraw request api.
   */
  cryptoHelper.getAdaInrPrice((err, docs) => {
    const oneAdaInr = docs.data.amount;
    const trxDocs = cryptoHelper.getTrxPrice();
    if (trxDocs.err) {
      return res.send({});
    }
    const trxPrice = trxDocs.lastPrice;
    res.send({oneAdaInr, trxPrice, trxDocs});
  });
  // cryptoHelper.getTrxPrice();
  /**
   * (err, docs) => {
   * }.
   */
});

router.post("/setParentAmount", async (req, res) => {
  const userDocs = await mUser.findOne({_id: req.body.userId}, {}, {});
  // const parentDocs = await mUser.findOne({_id: userDocs.parentId}, {}, {lean: true});

  const allUserDocs = await mUser.find({}, {}, {lean: true});

  if (userDocs && userDocs.plan == "Access 25") {
    // access 25
    cryptoHelper.getAdaInrPrice((err, docs) => {
      if (err) {
        const response = commonResponse(err, null, "Transfer failed");
        res.status(500).send(response);
      } else {
        const oneAdaInr = docs.data.amount;
        const worthAmount = 4000;
        let totalCoins = 4000 / oneAdaInr;
        totalCoins = totalCoins.toFixed(2);

        const serverMessage =
          TransactionServerMessage.NEW_ACCESS25_CHILD_JOINED +
          "/" +
          userDocs._id +
          "/";
        const prev3LevelParentIds = helper.get3LevelParentIds(
            req.body.userId,
            allUserDocs,
        );

        let levelCount = 1;
        async.eachSeries(
            prev3LevelParentIds,
            function(eachUserId, callback) {
              const newTransaction = {
                type: "C",
                currencyName: "ADA",
                currencyCount: totalCoins,
                currencyPrice: oneAdaInr,
                amount: worthAmount,
                baseCurrencyName: "INR",
                serverMessage: serverMessage,
                userMessage: "",
              };
              newTransaction["serverMessage"] =
              newTransaction["serverMessage"] +
              TransactionMessageForLevels[levelCount];

              mWallet.findOne({userId: eachUserId}, (err, parentWalletDocs) => {
                if (err) {
                  callback(err);
                } else {
                  parentWalletDocs.transactions.push(newTransaction);
                  parentWalletDocs.save((updErr, updDocs) => {
                    if (updErr) {
                      callback(updErr);
                    } else {
                      levelCount++;
                      callback();
                    }
                  });
                }
              });
            },
            function(err) {
              if (err) {
                const response = commonResponse(err, null, "Transfer failed");
                res.status(500).send(response);
              } else {
                const response = commonResponse(null, null, "Transfer success");
                res.status(200).send(response);
              }
            },
        );
      }
    });
  } else if (userDocs) {
    // access 200
    const serverMessage =
      TransactionServerMessage.NEW_ACCESS200_CHILD_JOINED +
      "/" +
      userDocs._id +
      "/";

    const prev3LevelParentIds = helper.get3LevelParentIds(
        req.body.userId,
        allUserDocs,
    );

    let levelCount = 1;
    async.eachSeries(
        prev3LevelParentIds,
        function(eachUserId, callback) {
          const newTransaction = {
            type: "C",
            currencyName: "TRX",
            currencyCount: 40,
            currencyPrice: null,
            amount: null,
            baseCurrencyName: null,
            serverMessage: serverMessage,
            userMessage: "",
          };

          newTransaction["serverMessage"] =
          newTransaction["serverMessage"] +
          TransactionMessageForLevels[levelCount];

          mWallet.findOne({userId: eachUserId}, (err, parentWalletDocs) => {
            if (err) {
              callback(err);
            } else {
              parentWalletDocs.transactions.push(newTransaction);
              parentWalletDocs.save((updErr, updDocs) => {
                if (updErr) {
                  callback(updErr);
                } else {
                  levelCount++;
                  callback();
                }
              });
            }
          });
        },
        function(err) {
          if (err) {
            const response = commonResponse(err, null, "Transfer failed");
            res.status(500).send(response);
          } else {
            const response = commonResponse(null, null, "Transfer success");
            res.status(200).send(response);
          }
        },
    );
  } else {
    const response = commonResponse("", null, "User not found");
    res.status(500).send(response);
  }
});

router.post("/getTransactionList", async (req, res) => {
  try {
    const userId = req.body.token.userId;
    const userTransactions = await mWallet.findOne(
        {userId},
        {transactions: 1},
        {lean: true},
    );
    const data = _.groupBy(userTransactions.transactions, "type");

    const response = commonResponse(
        null,
        data,
        "Transaction list fetch success",
    );
    res.status(200).send(response);
  } catch (err) {
    const response = commonResponse(err, null, "Transaction list fetch failed");
    res.status(500).send(response);
  }
});

/**
 * Chart API.
 */
router.post("/getUserChart", async (req, res) => {
  const userId = req.body.token.userId;
  const userDocs = await mUser.find(
      {plan: req.body.token.plan},
      {},
      {lean: true},
  );
  const childDocs = await mChild.find({}, {}, {lean: true});

  const userWithChilds = [];
  childDocs.forEach((eachChild) => {
    const user = {};
    user["userId"] = eachChild["userId"];
    user["children"] = [];

    if (eachChild.left) {
      user["children"][0] = eachChild.left.userId;
    } else {
      user["children"][0] = null;
    }

    if (eachChild.right) {
      user["children"][1] = eachChild.right.userId;
    } else {
      user["children"][1] = null;
    }

    userWithChilds.push(user);
  });

  const grpdUserChildsByUserId = _.groupBy(userWithChilds, "userId");

  userDocs.forEach((eachUser) => {
    delete eachUser.gender;
    delete eachUser.address;
    delete eachUser.status;
    delete eachUser.city;
    delete eachUser.country;
    delete eachUser.mobileNumber;
    delete eachUser.parentId;
    delete eachUser.parentRefId;
    delete eachUser.child;
    // delete eachUser.email;
    delete eachUser.plan;
    // delete eachUser.projectId;
    delete eachUser.childLog;
    delete eachUser.createdAt;
    delete eachUser.updatedAt;

    eachUser["name"] = eachUser["userName"];
    if (
      grpdUserChildsByUserId[eachUser._id] &&
      grpdUserChildsByUserId[eachUser._id][0] &&
      grpdUserChildsByUserId[eachUser._id][0]["children"]
    ) {
      eachUser["children"] =
        grpdUserChildsByUserId[eachUser._id][0]["children"];
    } else {
      eachUser["children"] = [];
    }
  });
  const grpdUserById = _.groupBy(userDocs, "_id");

  userDocs.forEach((eachUser) => {
    if (
      eachUser["children"][0] &&
      grpdUserById[eachUser["children"][0]] &&
      grpdUserById[eachUser["children"][0]].length
    ) {
      eachUser["children"][0] = grpdUserById[eachUser["children"][0]][0];

      // let key = "(L) " + eachUser["children"][0]["refId"];
      // console.log(key)
      const key = "LEFT";

      eachUser["children"][0]["attributes"] = {};

      // if (eachUser["children"][0]) {
      eachUser["children"][0]["attributes"][key] =
        eachUser["children"][0]["refId"];
      // }
    } else {
      eachUser["children"][0] = {name: "X"};
    }

    if (
      eachUser["children"][1] &&
      grpdUserById[eachUser["children"][1]] &&
      grpdUserById[eachUser["children"][1]].length
    ) {
      eachUser["children"][1] = grpdUserById[eachUser["children"][1]][0];

      const key = "RIGHT";
      // let key = "(R) " + eachUser["children"][1]["refId"];

      eachUser["children"][1]["attributes"] = {};

      // if (eachUser["children"][1]) {
      eachUser["children"][1]["attributes"][key] =
        eachUser["children"][1]["refId"];

      // }
    } else {
      eachUser["children"][1] = {name: "X"};
    }
  });

  let output;

  userDocs.forEach((eachUser) => {
    if (eachUser._id == userId) {
      output = eachUser;
    }
  });

  res.send({output});
});

/**
 * Get user ADA coin quantity count.
 */
router.post("/getUserAdaCoin", async (req, res) => {
  try {
    const userId = req.body.token.userId;
    const userTransactions = await mWallet.findOne(
        {userId},
        {transactions: 1},
        {lean: true},
    );
    let incomeQuantity = 0;
    const walletQuantity = 0;

    if (userTransactions.transactions && userTransactions.transactions.length) {
      const grpdTransactions = _.groupBy(userTransactions.transactions, "type");
      const creditTransctions = grpdTransactions["C"];

      if (creditTransctions) {
        creditTransctions.forEach((eachTransaction) => {
          if (eachTransaction.currencyName == "ADA") {
            incomeQuantity = incomeQuantity + eachTransaction["currencyCount"];
          }
        });
      }
      const responseObj = {incomeQuantity, walletQuantity};
      const response = commonResponse(
          null,
          responseObj,
          "ADA Coin Transaction list fetch success",
      );
      res.status(200).send(response);
    } else {
      const responseObj = {incomeQuantity, walletQuantity};
      const response = commonResponse(
          null,
          responseObj,
          "No transactions found",
      );
      res.status(200).send(response);
    }
  } catch (err) {
    console.log(err);
    const response = commonResponse(
        err,
        null,
        "ADA Coin Transaction list fetch failed",
    );
    res.status(500).send(response);
  }
});

router.post("/testMail", (req, res) => {
  const fromMail = "admin@universaltradeweb.com"; // "tradechennaiuniversal@gmail.com";
  const password = "Admin@123"; // "chennaiuniversal@123";

  // const transporter = nodemailer.createTransport({
  //   service: "gmail",
  //   auth: {
  //     user: fromMail,
  //     pass: password,
  //   },
  // });
  const transporter = nodemailer.createTransport({
    service: "siteground",
    // host: "smtp.siteground.com",
    // port: 465,
    // secure: true, // true for 465, false for other ports
    auth: {
      user: fromMail, // generated ethereal user
      pass: password, // generated ethereal password
    },
  });

  const mailOptions = {
    from: fromMail,
    to: "its.hari.programmer@gmail.com",
    subject: "mailSubject",
    text: "content",
  };

  transporter.sendMail(mailOptions, function(emailError, emailInfo) {
    if (emailError) {
      res.send({err: emailError});
    } else {
      res.send({data: emailInfo});
    }
  });
});

/**
 * @pending
 */
// router.post("/getUserChilds", async (req, res) => {
//   const userId = "6193c473cbb3d15ae87f95ae";

//   const maxLeftChildCount = 3;
//   const maxRightChildCount = 3;

//   const userDocs = await mUser.findOne({_id: userId}, {}, {lean: true});
//   const childDocs = await mChild.find({}, {}, {lean: true});

//   const grpdChildDocsByUserId = _.groupBy(childDocs, "userId");

//   const level1ChildIds = [];
//   const level2ChildIds = [];
//   const level3ChildIds = [];

//   const userChildDocs = grpdChildDocsByUserId[userId][0];

//   const output = helper.loopSupport([userId], grpdChildDocsByUserId);

//   // level1ChildIds = helper.getChildIds(userChildDocs)['childUserIds'];
//   // level2ChildIds =
//   // userChildDocs.
//   // console.log(helper.getChildIds(userChildDocs));

//   res.send({output});
//   // res.send(helper.getChildIds(output));
// });

router.post("/getChildUsers", async (req, res) => {
  try {
    // req.body.userId = userId;
    const userId = "61ac53ae8d161470e02bd2a2";
    const allChildDocs = await mChild.find({}, {}, {lean: true});

    const output = helper.getUser3LevelChilds(userId, allChildDocs);
    const response = commonResponse(null, output, "");
    res.status(200).send(response);
  } catch (err) {
    const response = commonResponse(err, null, "");
    res.status(500).send(response);
  }
});

// router.post('/upgradeToSilver', (req, res) => {
//   //isPromoterCompleted

// });

module.exports = router;
