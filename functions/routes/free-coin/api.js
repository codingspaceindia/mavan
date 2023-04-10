const express = require("express");
const nodemailer = require("nodemailer");
const axios = require("axios");
const async = require("async");

const router = express.Router();

const baseUrl = "http://18.117.179.16:8080";
// const baseUrl = "http://localhost:8080";

const _ = require("lodash");
// const previousBalanceDocs = require("./previousBalance26Nov.json");

const fromMail = "umafreeminers@gmail.com";
const password = "gpysalrwvygnkfcj";
const mTopupRequest = require("../../models/mTopupRequest");
const welcomeMail = (toMail, subject, content) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: fromMail,
      pass: password,
    },
  });

  const mailOptions = {
    from: fromMail,
    to: toMail,
    subject,
    text: content,
  };

  transporter.sendMail(mailOptions, function(emailError, emailInfo) {
    if (emailError) {
      console.log(emailError);
    } else {
      console.log(emailInfo);
    }
  });
};

router.post("/login", async (req, res) => {
  try {
    const docs = await axios.post(baseUrl + "/auth/validate", req.body);
    res.status(200).json({data: docs.data});
  } catch (err) {
    console.log({err});
  }
});

/**
 * Get Today Coin Price.
 */

router.get("/user/coinTodayPrice", async (req, res) => {
  try {
    const result = await axios.get(baseUrl + "/user/dailyprice");

    res.status(200).json({data: result.data});
  } catch (err) {
    res.json({message: err.message});
  }
});

/**
 * Get ROI Report (ROS).
 */

router.get("/user/roiReport/:id", async (req, res) => {
  try {
    const result = await axios.get(
        baseUrl + `/user/roiReport/${req.params.id}`,
    );

    res.status(200).json({data: result.data});
  } catch (err) {
    res.json({message: err.message});
  }
});

/**
 * Get left side child user name and amount.
 */

router.get("/user/getChildDetails/left/:id", async (req, res) => {
  try {
    const result = await axios.get(
        baseUrl + `/user/getChildDetails/left/${req.params.id}`,
    );

    res.status(200).json({data: result.data});
  } catch (err) {
    res.json({message: err.message});
  }
});

/**
 * Get right side child user name and amount.
 */

router.get("/user/getChildDetails/right/:id", async (req, res) => {
  try {
    const result = await axios.get(
        baseUrl + `/user/getChildDetails/right/${req.params.id}`,
    );
    res.status(200).json({data: result.data});
  } catch (err) {
    res.json({message: err.message});
  }
});

/**
 * Get user Details by UserId.
 */
router.get("/user/getById/:id", async (req, res) => {
  try {
    const result = await axios.get(baseUrl + `/user/getById/${req.params.id}`);
    console.log(result);

    res.status(200).json({data: result.data});
  } catch (err) {
    res.status(err.status || 500).json({message: err.message});
  }
});

/**
 * Change Password.
 */
router.post("/auth/changePassword", async (req, res) => {
  try {
    const payload = {
      userId: req.body.userId,
      oldPassword: req.body.oldPassword,
      newPassword: req.body.newPassword,
    };

    const result = await axios.post(baseUrl + "/auth/changePassword", payload);

    res.status(200).json({data: result.data});
  } catch (err) {
    res.status(err.status || 500).json({message: err.message});
  }
});

/**
 * Get Bank details by UserId.
 */
router.get("/user/bankDetails/:id", async (req, res) => {
  try {
    const result = await axios.get(baseUrl + `/user/bank/${req.params.id}`);

    res.status(200).json({data: result.data});
  } catch (err) {
    res.status(err.status || 500).json({message: err.message});
  }
});

/**
 * Update Bank details.
 */

router.post("/user/bankDetails/update", async (req, res) => {
  try {
    const result = await axios.post(baseUrl + "/user/bank/update", req.body);

    res.status(200).json({data: result.data});
  } catch (err) {
    res.status(err.status || 500).json({message: err.message});
  }
});

/**
 * Get All Notices.
 */

router.get("/user/notices/:id", async (req, res) => {
  try {
    const result = await axios.get(baseUrl + `/user/notice/${req.params.id}`);

    console.log(result);

    res.status(200).json({data: result.data});
  } catch (err) {
    res.status(err.status || 500).json({message: err.message});
  }
});

/**
 * Get user Referral Report (Direct Referrals).
 */

router.get("/user/directReferralsReport/:id", async (req, res) => {
  try {
    const result = await axios.get(
        baseUrl + `/user/referalReport/${req.params.id}`,
    );

    res.status(200).json({data: result.data});
  } catch (err) {
    res.status(err.status || 500).json({message: err.message});
  }
});

/**
 * Add Topup or Stacking.
 */
router.post("/user/stacking", async (req, res) => {
  try {
    const payload = {userId: req.body.userId, amount: req.body.amount};

    const result = await axios.post(baseUrl + "/user/topup", payload);

    res.status(200).json({data: result.data});
  } catch (err) {
    res.status(err.status || 500).json({message: err.message});
  }
});

/**
 * Get user Stacking Investment Report (Topup History).
 */

router.get("/user/stackingInvestment/:id", async (req, res) => {
  try {
    const result = await axios.get(
        baseUrl + `/user/topupReport/${req.params.id}`,
    );

    res.status(200).json({data: result.data});
  } catch (err) {
    res.status(err.status || 500).json({message: err.message});
  }
});

/**
 * Get user Wallet Report (Income Details).
 */

router.get("/user/walletReport/:id", async (req, res) => {
  try {
    const result = await axios.get(
        baseUrl + `/user/incomeReport/${req.params.id}`,
    );

    res.status(200).json({data: result.data});
  } catch (err) {
    res.status(err.status || 500).json({message: err.message});
  }
});

/**
 * Create User.
 */
router.post("/user/save", async (req, res) => {
  try {
    const docs = await axios.post(baseUrl + "/user/save", req.body);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "umafreeminers@gmail.com",
        pass: "gpysalrwvygnkfcj",
      },
    });
    console.log(docs.data);

    const mailOptions = {
      from: "umafreeminers@gmail.com",
      to: docs.data.mailId,
      subject: "Welcome Letter",
      text:
        "Welcome to Freeminers your User Id : " +
        docs.data.userRefId +
        " and Password: " +
        docs.data.password +
        " Link:https://freeminersui.web.app/",
    };

    transporter.sendMail(mailOptions, function(emailError, emailInfo) {
      if (emailError) {
        console.log(emailError);
      } else {
        console.log(emailInfo);
      }
    });

    res.status(200).json({data: docs.data});
  } catch (err) {
    res.status(err.status || 500).json({message: err.message});
  }
});

/**
 * Get user earning balance, available balance, stacking.
 */
router.get("/user/getUserPreviousBalance/:id", async (req, res) => {
  try {
    const result = await axios.get(
        baseUrl + `/user/getUserPreviousBalance/${req.params.id}`,
    );

    res.status(200).json({data: result.data});
  } catch (err) {
    res.status(err.status || 500).json({message: err.message});
  }
});

router.get("/user/getByRefId/:id", async (req, res) => {
  try {
    const result = await axios.get(
        baseUrl + `/user/getByRefId/${req.params.id}`,
    );

    res.status(200).json({data: result.data});
  } catch (err) {
    res.status(err.status || 500).json({message: err.message});
  }
});

/**
 * Returns with parent refId, placement userId, placement refId, investment details.
 */
router.get("/user/getListOrderByRefId", async (req, res) => {
  try {
    const userResponse = await axios.get(baseUrl + "/user/allUsersList");

    const nodeResponse = await axios.get(baseUrl + "/user/allNodesList");

    const authResponse = await axios.get(baseUrl + "/auth/allAuthList");

    const previousBalanceResponse = await axios.get(
        baseUrl + "/user/allPreviousBalanceList",
    );
    const walletResponse = await axios.get(baseUrl + "/user/allWalletList");
    const userDocs = _.sortBy(userResponse.data, ["refId"]);
    const grpdUserById = _.groupBy(userDocs, "id");
    const nodeDocs = nodeResponse.data;
    const authDocs = authResponse.data;

    const grpdAuthByUserId = _.groupBy(authDocs, "userId");
    const previousBalanceDocs = previousBalanceResponse.data;
    const grpdPrevBalanceDocsByUserId = _.groupBy(
        previousBalanceDocs,
        "userId",
    );

    const walletDocs = walletResponse.data;
    const grpdWalletDocsByUserId = _.groupBy(walletDocs, "userId");

    // data format conversion
    nodeDocs.forEach((eachNodeDoc) => {
      if (eachNodeDoc.left) {
        eachNodeDoc.left = eachNodeDoc.left.userId;
      }
      if (eachNodeDoc.right) {
        eachNodeDoc.right = eachNodeDoc.right.userId;
      }
    });

    const grpdNodeByLeft = _.groupBy(nodeDocs, "left");
    const grpdNodeByRight = _.groupBy(nodeDocs, "right");

    userDocs.forEach((eachUser) => {
      if (grpdAuthByUserId[eachUser.id] && grpdAuthByUserId[eachUser.id][0]) {
        eachUser["password"] = grpdAuthByUserId[eachUser.id][0]["password"];
      }
      eachUser["totalLeftBussiness"] = 0;
      eachUser["totalLeftBussinesss"] = 0;

      delete eachUser.address;
      delete eachUser.city;
      delete eachUser.country;
      delete eachUser.gender;

      // set placement userId and placement user RefId
      if (grpdNodeByLeft[eachUser.id] && grpdNodeByLeft[eachUser.id][0]) {
        eachUser["side"] = "LEFT";
        const placementUserId = grpdNodeByLeft[eachUser.id][0]["userId"];

        eachUser["placementUserId"] = placementUserId;
        if (grpdUserById[placementUserId] && grpdUserById[placementUserId][0]) {
          eachUser["placementRefId"] =
            grpdUserById[placementUserId][0]["refId"];
        }
      } else if (
        grpdNodeByRight[eachUser.id] &&
        grpdNodeByRight[eachUser.id][0]
      ) {
        eachUser["side"] = "RIGHT";
        const placementUserId = grpdNodeByRight[eachUser.id][0]["userId"];
        eachUser["placementUserId"] = placementUserId;

        if (grpdUserById[placementUserId] && grpdUserById[placementUserId][0]) {
          eachUser["placementRefId"] =
            grpdUserById[placementUserId][0]["refId"];
        }
      }
      let userTotalTopup = 0;
      const topupLog = [];
      // get user topup data
      if (
        grpdWalletDocsByUserId[eachUser.id] &&
        grpdWalletDocsByUserId[eachUser.id][0]
      ) {
        const userWalletDocs = grpdWalletDocsByUserId[eachUser.id][0];
        userWalletDocs.transactions.forEach((eachTrans) => {
          if (
            eachTrans.type == "C" &&
            eachTrans.message &&
            eachTrans.message.split("/") &&
            eachTrans.message.split("/").length &&
            eachTrans.message.split("/")[0] == "TOPUP_DONE"
          ) {
            topupLog.push(eachTrans);
            userTotalTopup = userTotalTopup + eachTrans.amount;
          }
        });
      }

      // get topup data from previous balance
      if (
        grpdPrevBalanceDocsByUserId[eachUser.id] &&
        grpdPrevBalanceDocsByUserId[eachUser.id][0]
      ) {
        const userPrevBalanceDocs = grpdPrevBalanceDocsByUserId[eachUser.id][0];

        if (userPrevBalanceDocs["stacking"]) {
          userTotalTopup = userTotalTopup + userPrevBalanceDocs["stacking"];
          const newTransactionLog = {
            type: "C",
            transactionAt: "",
            amount: userPrevBalanceDocs["stacking"],
            message: "PREVIOUS_TOPUP_STACKING",
          };
          topupLog.push(newTransactionLog);
        }
      }
      eachUser["totalTopupAmount"] = userTotalTopup;
      eachUser["topupLog"] = topupLog;
    });

    res.status(200).json({userDocs});
  } catch (err) {
    console.log(err);
    res.status(err.status || 500).json({message: err.message});
  }
});

router.get("/directReferalDetails/:id", async (req, res) => {
  try {
    const userResponse = await axios.get(baseUrl + "/user/allUsersList");

    const nodeResponse = await axios.get(baseUrl + "/user/allNodesList");
    const nodeDocs = nodeResponse.data;

    const userDocs = userResponse.data;

    const grpdNodeDocsByLeft = _.groupBy(nodeDocs, "left.userId");
    const grpdNodeDocsByRight = _.groupBy(nodeDocs, "right.userId");

    const grpdByParentId = _.groupBy(userDocs, "parentId");
    const grpdUserDocsById = _.groupBy(userDocs, "id");

    const userChilds = grpdByParentId[req.params.id];

    userChilds.forEach((eachUser) => {
      eachUser["placementRefId"] = null;
      eachUser["side"] = null;
      const userId = eachUser.id;

      if (grpdNodeDocsByLeft[userId] && grpdNodeDocsByLeft[userId][0]) {
        eachUser["side"] = "LEFT";
        const placementParentId = grpdNodeDocsByLeft[userId][0]["userId"];

        if (
          grpdUserDocsById[placementParentId] &&
          grpdUserDocsById[placementParentId][0]
        ) {
          eachUser["placementRefId"] =
            grpdUserDocsById[placementParentId][0]["refId"];
        }
      } else if (
        grpdNodeDocsByRight[userId] &&
        grpdNodeDocsByRight[userId][0]
      ) {
        eachUser["side"] = "RIGHT";
        const placementParentId = grpdNodeDocsByRight[userId][0]["userId"];
        if (
          grpdUserDocsById[placementParentId] &&
          grpdUserDocsById[placementParentId][0]
        ) {
          eachUser["placementRefId"] =
            grpdUserDocsById[placementParentId][0]["refId"];
        }
      }
    });
    res.status(200).json({userChilds});
  } catch (err) {
    res.status(err.status || 500).json({message: err.message});
  }
});

router.get("/userCharts/:id", async (req, res) => {
  try {
    const userResponse = await axios.get(baseUrl + "/user/allUsersList");

    const nodeResponse = await axios.get(baseUrl + "/user/allNodesList");

    const stackingResponse = await axios.get(baseUrl + "/user/getUserStatus");

    const userDocs = userResponse.data;
    const nodeDocs = nodeResponse.data;

    const userWithChilds = [];
    nodeDocs.forEach((eachNode) => {
      const user = {};
      user["userId"] = eachNode["userId"];
      user["children"] = [];

      if (eachNode.left) {
        user["children"][0] = eachNode.left.userId;
      } else {
        user["children"][0] = null;
      }

      if (eachNode.right) {
        user["children"][1] = eachNode.right.userId;
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

      if (
        grpdUserChildsByUserId[eachUser.id] &&
        grpdUserChildsByUserId[eachUser.id][0]
      ) {
        eachUser["children"] =
          grpdUserChildsByUserId[eachUser.id][0]["children"];
      } else {
        eachUser["children"] = [];
      }
    });
    const grpdUserById = _.groupBy(userDocs, "id");

    userDocs.forEach((eachUser) => {
      if (
        eachUser["children"][0] &&
        grpdUserById[eachUser["children"][0]] &&
        grpdUserById[eachUser["children"][0]].length
      ) {
        eachUser["children"][0] = grpdUserById[eachUser["children"][0]][0];

        const value = stackingResponse.data.find(
            (stacking) => stacking.refId === eachUser["children"][0]["refId"],
        );
        let suffix = "";
        if (value && value.active) suffix = "(S)";

        const key = `(L) ${eachUser["children"][0]["refId"]} ${suffix}`;

        eachUser["children"][0]["attributes"] = {};
        eachUser["children"][0]["attributes"][key] =
          eachUser["children"][0]["mailId"];
      } else {
        eachUser["children"][0] = {name: "X"};
      }

      if (
        eachUser["children"][1] &&
        grpdUserById[eachUser["children"][1]] &&
        grpdUserById[eachUser["children"][1]].length
      ) {
        eachUser["children"][1] = grpdUserById[eachUser["children"][1]][0];

        const value = stackingResponse.data.find(
            (stacking) => stacking.refId === eachUser["children"][1]["refId"],
        );

        let suffix = "";
        if (value && value.active) suffix = "(S)";

        const key = `(R) ${eachUser["children"][1]["refId"]} ${suffix}`;

        eachUser["children"][1]["attributes"] = {};
        eachUser["children"][1]["attributes"][key] =
          eachUser["children"][1]["mailId"];
      } else {
        eachUser["children"][1] = {name: "X"};
      }
    });

    let output;

    userDocs.forEach((eachUser) => {
      if (eachUser.id == req.params.id) {
        output = eachUser;
      }
    });

    res.status(200).json({output});
  } catch (err) {
    console.log(err);
    res.status(err.status || 500).json({message: err.message});
  }
});

/**
 * Send Welcome Email Message.
 */

router.post("/send-welcome-mail", async (req, res) => {
  try {
    const {refId, email, password} = req.body;

    const content = `Welcome to Freeminers your User Id : ${refId} and Password: ${password} Link:https://freeminersui.web.app/`;

    welcomeMail(email, "Welcome Letter", content);

    res.status(200).json({message: "Mail Sent"});
  } catch (err) {
    res.status(err.status || 500).json({message: err.message});
  }
});

/**
 * Get Placement Details by user id.
 */
router.get("/user/getPlacementDetails/:id", async (req, res) => {
  try {
    const response = await axios.get(
        `${baseUrl}/user/getPlacementDetails/${req.params.id}`,
    );

    const userId = req.params.id;

    const nodeResponse = await axios.get(baseUrl + "/user/allNodesList");

    const nodeDocs = nodeResponse.data;

    const grpdNodeByLeft = _.groupBy(nodeDocs, "left.userId");
    const grpdNodeByRight = _.groupBy(nodeDocs, "right.userId");

    const userResponse = await axios.get(baseUrl + "/user/allUsersList");
    const userDocs = userResponse.data;
    const grpdUserDocs = _.groupBy(userDocs, "id");
    let parentId;

    if (grpdNodeByLeft[userId] && grpdNodeByLeft[userId][0]) {
      response.data["side"] = "LEFT";
      parentId = grpdNodeByLeft[userId][0]["userId"];
    }

    if (grpdNodeByRight[userId] && grpdNodeByRight[userId][0]) {
      response.data["side"] = "RIGHT";
      parentId = grpdNodeByLeft[userId][0]["userId"];
    }

    if (grpdUserDocs[parentId] && grpdUserDocs[parentId][0]) {
      response.data["placementParentRefId"] =
        grpdUserDocs[parentId][0]["refId"];
      response.data["placementParentName"] = grpdUserDocs[parentId][0]["name"];
    }

    console.log(response.data);

    res.status(200).json({data: response.data});
  } catch (err) {
    console.log(err);
    res.status(err.status || 500).json({message: err.message});
  }
});

/**
 *  Get All Withdraw Request.
 */

router.get("/user/getWithdrawRequests", async (req, res) => {
  try {
    const response = await axios.get(`${baseUrl}/user/getWithdrawRequests`);
    res.status(200).json({data: response.data});
  } catch (err) {
    res.status(err.status || 500).json({message: err.message});
  }
});

/**
 * User Profile Update.
 */

router.post("/user/update", async (req, res) => {
  try {
    const result = await axios.post(baseUrl + "/user/user/update", req.body);

    res.status(200).json({data: result.data});
  } catch (err) {
    res.status(err.status || 500).json({message: err.message});
  }
});

/**
 *  Pair Matching, Total left, Total Left Business, Total Right, Total Right Business.
 */

router.get("/user/PairMatching/:id", async (req, res) => {
  try {
    const response = await axios.get(
        `${baseUrl}/user/PairMatching/${req.params.id}`,
    );
    res.json({data: response.data});
  } catch (err) {
    res.json({message: err.message});
  }
});

/**
 * Change daily price (Free Coin).
 */

router.post("/user/dailyprice/change", async (req, res) => {
  try {
    const payload = {
      cost: req.body.cost,
      perDollar: req.body.perDollar,
    };

    const response = await axios.post(
        baseUrl + "/user/dailyprice/change",
        payload,
    );
    res.status(200).json({data: response.data});
  } catch (err) {
    res.status(err.status).json({message: err.message});
  }
});

/**
 *  Active Wallet and Earnings Wallet Amount.
 */

router.get("/user/wallet/classify/:id", async (req, res) => {
  try {
    const response = await axios.get(
        baseUrl + `/user/wallet/classify/${req.params.id}`,
    );
    res.status(200).json({data: response.data});
  } catch (err) {
    res.status(err.status || 500).json({message: err.message});
  }
});

/**
 *  Convert FC to USD.
 */

router.get("/coinToUsd/:coins", async (req, res) => {
  try {
    const response = await axios.get(
        `${baseUrl}/user/coinToUsd/${req.params.coins}`,
    );
    res.status(200).json({data: response.data});
  } catch (err) {
    res.status(err.status || 500).json({message: err.message});
  }
});

/**
 * Convert USD to FC.
 */
router.get("/usdToCoin/:usd", async (req, res) => {
  try {
    const response = await axios.get(
        `${baseUrl}/user/usdToCoin/${req.params.usd}`,
    );
    res.status(200).json({data: response.data});
  } catch (err) {
    res.status(err.status || 500).json({message: err.message});
  }
});

/**
 * Convert FC to INR.
 */
router.get("/coinToInr/:coins", async (req, res) => {
  try {
    const response = await axios.get(
        `${baseUrl}/user/coinToInr/${req.params.coins}`,
    );
    res.status(200).json({data: response.data});
  } catch (err) {
    res.json({message: err.message});
  }
});
/**
 * Convert INR to FC.
 */
router.get("/inrToCoin/:inr", async (req, res) => {
  try {
    const response = await axios.get(
        `${baseUrl}/user/inrToCoin/${req.params.inr}`,
    );
    res.status(200).json({data: response.data});
  } catch (err) {
    res.json({message: err.message});
  }
});

router.post("/withdrawRequest/create", async (req, res) => {
  try {
    console.log(req.body);
    const response = await axios.post(
        baseUrl + "/user/withdrawRequest/create",
        req.body,
    );
    res.status(200).json({data: response.data});
  } catch (err) {
    res.json({message: err.message});
  }
});

router.post("/createUserTest", async (req, res) => {
  const userResponse = await axios.get(baseUrl + "/user/allUsersList");
  // const userDocs = _.sortBy(userResponse.data, ["refId"]);
  const userDocs = userResponse.data;
  const grpdById = _.groupBy(userDocs, "refId");
  let previousBalanceDocs;
  const testArr = [];
  let async;
  async.eachSeries(
      previousBalanceDocs,
      function(eachPrevBalanceDocs, callback) {
        let userId;

        const request = {};
        if (
          eachPrevBalanceDocs["User Id"] &&
        grpdById[eachPrevBalanceDocs["User Id"]] &&
        grpdById[eachPrevBalanceDocs["User Id"]][0]
        ) {
          userId = grpdById[eachPrevBalanceDocs["User Id"]][0]["id"];
          // console.log(userId + "----");

          request["userId"] = userId;
          request["availableBalance"] = 0 + "";
          request["earningBalance"] = 0 + "";
          request["stacking"] = 0 + "";
          request["stackingAt"] = new Date();
          request["joiningDate"] = new Date();

          if (eachPrevBalanceDocs["Earing balance"] > 0) {
            request["earningBalance"] =
            eachPrevBalanceDocs["Earing balance"] + "";
          }

          if (
            eachPrevBalanceDocs["Stacking"] &&
          eachPrevBalanceDocs["Stacking"] != "0"
          ) {
            request["stacking"] = eachPrevBalanceDocs["Stacking"] + "";
          }

          if (
            eachPrevBalanceDocs["Join date"] &&
          eachPrevBalanceDocs["Join date"] != "NULL"
          ) {
            request["joiningDate"] = new Date(eachPrevBalanceDocs["Join date"]);
          }

          testArr.push(request);

          axios
              .post(baseUrl + "/user/createBalanceTest", request)
              .then(function(response) {
                console.log("userId--", userId);
                callback();
              })
              .catch(function(error) {
                console.log(error);
                callback(error);
              });
        } else {
        // console.log("userId not found " + eachPrevBalanceDocs['User Id']);
          callback();
        }
      },
      (err) => {
        if (err) {
          res.status(500).send({err, completed: false});
        } else {
          res.status(200).send({completed: true, testArr});
        }
      },
  );
});

/**
 * Get All Stacking Request.
 */
router.get("/user/getTopupRequests", async (req, res) => {
  try {
    const response = await axios.get(baseUrl + "/user/getTopupRequests");
    res.json({data: response.data});
  } catch (err) {
    res.json({message: err.message});
  }
});

/**
 * Create Topup Request.
 */

router.post("/user/topUpRequest/create", async (req, res) => {
  try {
    const response = await axios.post(
        baseUrl + "/user/topUpRequest/create",
        req.body,
    );
    res.json({data: response.data});
  } catch (err) {
    res.json({message: err.message});
  }
});

/**
 * Accept Topup (Stacking) Request.
 */
router.put("/user/acceptTopupRequest", async (req, res) => {
  try {
    const response = await axios.put(
        baseUrl + "/user/acceptTopupRequest",
        req.body,
    );
    res.json({data: response.data});
  } catch (err) {
    res.json({message: err.message});
  }
});

/**
 * Reject Topup (Stacking) Request.
 */
router.put("/user/rejectTopupRequest", async (req, res) => {
  try {
    const response = await axios.put(
        baseUrl + "/user/rejectTopupRequest",
        req.body,
    );
    res.json({data: response.data});
  } catch (err) {
    res.json({message: err.message});
  }
});

/**
 * Get Daily ROS.
 */

router.get("/user/roiTopupAmount/:id", async (req, res) => {
  try {
    const response = await axios.get(
        `${baseUrl}/user/roiTopupAmount/${req.params.id}`,
    );
    res.json({data: response.data});
  } catch (err) {
    res.json({message: err.message});
  }
});

/**
 * Get stacking and roi amount.
 */

router.get("/user/getUserStatistic/:id", async (req, res) => {
  try {
    const response = await axios.get(
        `${baseUrl}/user/getUserStatistic/${req.params.id}`,
    );
    res.json({data: response.data});
  } catch (err) {
    res.json({message: err.message});
  }
});

/**
 * Get reason for all transaction.
 */

router.get("/user/transactionData/:id", async (req, res) => {
  try {
    const response = await axios.get(
        `${baseUrl}/user/transactionData/${req.params.id}`,
    );
    res.json({data: response.data});
  } catch (err) {
    res.json({message: err.message});
  }
});

/**
 * Get Bonus Wallet Reports.
 */

router.get("/user/getBonusWallet/for/:id", async (req, res) => {
  try {
    const response = await axios.get(
        `${baseUrl}/user/getBonusWallet/for/${req.params.id}`,
    );
    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

/**
 * Create Bonus Wallet.
 */

router.post("/user/bonusWallet/create", async (req, res) => {
  try {
    const response = await axios.post(
        `${baseUrl}/user/bonusWallet/create`,
        req.body,
    );
    res.json({data: response.data});
  } catch (err) {
    res.json({message: err.message});
  }
});

/**
 * Update Bonus Wallet.
 */

router.put("/user/updateBonusWalletAmount/as/:amount", async (req, res) => {
  try {
    const response = await axios.put(
        `${baseUrl}/user/updateBonusWalletAmount/as/${req.params.amount}`,
        req.body,
    );
    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

/**
 * Get Wallet Data.
 */

router.get("/user/getWalletData/for/:id", async (req, res) => {
  try {
    const response = await axios.get(
        `${baseUrl}/user/getWalletData/for/${req.params.id}`,
    );
    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

/**
 * Get Offer Wallet Report.
 */

router.get("/user/offerWalletTransactionData/:id", async (req, res) => {
  try {
    const response = await axios.get(
        `${baseUrl}/user/offerWalletTransactionData/${req.params.id}`,
    );
    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

/**
 * Get Stacking Wallet Report.
 */

router.get("/user/stackingTransactionData/:id", async (req, res) => {
  try {
    const response = await axios.get(
        `${baseUrl}/user/stackingTransactionData/${req.params.id}`,
    );
    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

/**
 * Get Earning Wallet Report.
 */

router.get("/user/earningsTransactionData/:id", async (req, res) => {
  try {
    const response = await axios.get(
        `${baseUrl}/user/earningsTransactionData/${req.params.id}`,
    );
    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

/**
 * Get Users StackingAt By id.
 */

router.get("/user/getUserTopupDate/:id", async (req, res) => {
  try {
    const response = await axios.get(
        `${baseUrl}/user/getUserTopupDate/${req.params.id}`,
    );
    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

/**
 * Bulk User Entry.
 */

router.post("/user/createUserTest", (req, res) => {
  let currentUser;
  const userExcelData = [];
  let i = 0;
  async.eachSeries(
      userExcelData,
      function(eachUser, callback) {
        currentUser = eachUser;
        eachUser["refId"] = eachUser["userRefId"];
        axios
            .post(baseUrl + "/user/create", eachUser)
            .then(function(response) {
              callback();
              console.log(i++);
              console.log(currentUser);
            })
            .catch(function(error) {
              console.log(error);
              callback(error);
            });
      },
      (err) => {
        if (err) {
          res.status(500).send({err, completed: false});
        } else {
          res.status(200).send({completed: true});
        }
      },
  );
});

/**
 * Bulk Previous Balance Entry.
 */

router.post("/user/createPreviousBalance", (req, res) => {
  // let currentUser;
  const userExcelData = [];
  async.eachSeries(
      userExcelData,
      function(eachUser, callback) {
      // currentUser = eachUser;
        eachUser["refId"] = eachUser["userRefId"];
        axios
            .post(baseUrl + "/user/createBalanceTest", {
              stacking: eachUser["Stacking"] ? `${eachUser["Stacking"]}` : "0",
              availableBalance: eachUser["Avilable balance"] ?
            `${eachUser["Avilable balance"]}` :
            "0",
              earningBalance: "0",
              userId: eachUser["User Id"],
              stackingAt: "2021-12-03",
            })
            .then(function(response) {
              callback();
            })
            .catch(function(error) {
              console.log(error);
              callback(error);
            });
      },
      (err) => {
        if (err) {
          res.status(500).send({err, completed: false});
        } else {
          res.status(200).send({completed: true});
        }
      },
  );
});

router.get("/user/offerWalletTransactionData/:id", async (req, res) => {
  try {
    const response = await axios.get(
        `${baseUrl}/user/offerWalletTransactionData/${req.params.id}`,
    );
    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

router.get("/user/stackingTransactionData/:id", async (req, res) => {
  try {
    const response = await axios.get(
        `${baseUrl}/user/stackingTransactionData/${req.params.id}`,
    );
    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

router.get("/user/earningsTransactionData/:id", async (req, res) => {
  try {
    const response = await axios.get(
        `${baseUrl}/user/earningsTransactionData/${req.params.id}`,
    );
    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

router.get("/user/getUserStackingDate/:id", async (req, res) => {
  try {
    const response = await axios.get(
        `${baseUrl}/user/getUserStackingDate/${req.params.id}`,
    );
    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

/**
 * Create Freecoin Address.
 */

router.post("/user/freeCoinAddress/create", async (req, res) => {
  try {
    const response = await axios.post(
        baseUrl + "/user/freeCoinAddress/create",
        req.body,
    );
    res.json({data: response.data});
  } catch (err) {
    res.json({message: err.message});
  }
});

/**
 * Getting User FreeCoin Address by ID.
 */

router.get("/user/getFreeCoinAddress/:id", async (req, res) => {
  try {
    const response = await axios.get(
        `${baseUrl}/user/getFreeCoinAddress/${req.params.id}`,
    );
    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

/**
 * Edit or Update Freecoin Address.
 */

router.put("/user/editFreeCoinAddress/:id", async (req, res) => {
  try {
    const response = await axios.put(
        `${baseUrl}/user/editFreeCoinAddress/${req.params.id}`,
        req.body,
    );
    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

/**
 * Get All User's Bonus Wallet Amount.
 */

router.get("/user/getUserAvailableBalance", async (req, res) => {
  try {
    const response = await axios.get(`${baseUrl}/user/getUserAvailableBalance`);
    res.json({data: response.data});
  } catch (err) {
    res.json({message: err.message});
  }
});

/**
 * Change Bonus Wallet Amount.
 */

router.put("/user/setUserAvailableBalance/:id/:newAmount", async (req, res) => {
  try {
    const response = await axios.put(
        `${baseUrl}/user/setUserAvailableBalance/${req.params.id}/${req.params.newAmount}`,
        {},
    );
    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

/**
 * Pair Matching Data.
 */

router.get("/user/PairMatchRun", async (req, res) => {
  try {
    const response = await axios.get(`${baseUrl}/user/PairMatchRun`);
    res.json({data: response.data});
  } catch (err) {
    res.json({message: err.message});
  }
});

router.post("/user/withdrawRequest/create", async (req, res) => {
  try {
    const response = await axios.post(
        baseUrl + "/user/withdrawRequest/create",
        req.body,
    );
    res.json({data: response.data});
  } catch (err) {
    res.json({message: err.message});
  }
});

router.get("/user/getAcceptedWithdrawRequests", async (req, res) => {
  try {
    const response = await axios.get(
        `${baseUrl}/user/getAcceptedWithdrawRequests`,
    );
    res.json({data: response.data});
  } catch (err) {
    res.json({message: err.message});
  }
});
router.get("/user/getPendingWithdrawRequests", async (req, res) => {
  try {
    const response = await axios.get(
        `${baseUrl}/user/getPendingWithdrawRequests`,
    );
    res.json({data: response.data});
  } catch (err) {
    res.json({message: err.message});
  }
});

router.put("/user/acceptWithdrawRequest", async (req, res) => {
  try {
    const response = await axios.put(
        baseUrl + "/user/acceptWithdrawRequest",
        req.body,
    );
    res.json({data: response.data});
  } catch (err) {
    res.json({message: err.message});
  }
});

router.put("/user/rejectWithdrawRequest", async (req, res) => {
  try {
    const response = await axios.put(
        baseUrl + "/user/rejectWithdrawRequest",
        req.body,
    );
    res.json({data: response.data});
  } catch (err) {
    res.json({message: err.message});
  }
});

/**
 * Time Consumption : More than 3 hours.
 */

const third = require("./third.json");
const fourth = require("./fourth.json");

router.get("/user/getBulkUserChart/3", async (req, res) => {
  try {
    const list = {};

    async.eachSeries(
        third.list,
        async function(eachUser, callback) {
          console.log(eachUser.refId);
          const response = await axios.get(
              `http://localhost:3000/free-coin/user/PairMatching/${eachUser.id}`,
          );
          console.log(response.data.data);
          if (response.data.data) {
            list[eachUser.refId] = {
              leftBusinessAmount: response.data.data.leftBusinessAmount,
              rightBusinessAmount: response.data.data.rightBusinessAmount,
            };
            console.log("--------------------INSERTED--------------------------");
          } else {
            list[eachUser.refId] = {
              leftBusinessAmount: 0,
              rightBusinessAmount: 0,
            };
          }
        },
        (err) => {
          if (err) {
            res
                .status(500)
                .json({message: err.message, stack: err.stack, completed: false});
          } else {
            res.status(200).json({list});
          }
        },
    );
  } catch (err) {
    res.json({message: err.message});
  }
});

router.get("/user/getBulkUserChart/4", async (req, res) => {
  try {
    const list = {};

    async.eachSeries(
        fourth.list,
        async function(eachUser, callback) {
          console.log(eachUser.refId);
          const response = await axios.get(
              `http://localhost:3000/free-coin/user/PairMatching/${eachUser.id}`,
          );
          console.log(response.data.data);
          if (response.data.data) {
            list[eachUser.refId] = {
              leftBusinessAmount: response.data.data.leftBusinessAmount,
              rightBusinessAmount: response.data.data.rightBusinessAmount,
            };
            console.log("--------------------INSERTED--------------------------");
          } else {
            list[eachUser.refId] = {
              leftBusinessAmount: 0,
              rightBusinessAmount: 0,
            };
          }
        },
        (err) => {
          if (err) {
            res
                .status(500)
                .json({message: err.message, stack: err.stack, completed: false});
          } else {
            res.status(200).json({list});
          }
        },
    );
  } catch (err) {
    res.json({message: err.message});
  }
});

/**
 * Waller Report Bulk Change.
 */

const compareDates = (date1, date2) => {
  return new Date(date1).toDateString() === new Date(date2).toDateString();
};

router.get("/user/walletBulkChange", async (req, res) => {
  try {
    const walletResponse = await axios.get(baseUrl + "/user/allWalletList");

    walletResponse.data.map((res) => {
      const selectedTransaction = res.transactions.filter(
          (trans) =>
            compareDates(trans.transactionAt, "12/13/2021") &&
          trans.message === "ROI",
      )[0];
      if (selectedTransaction) {
        res.transactions.map((trans) => {
          const transaction = trans;
          if (
            (compareDates(trans.transactionAt, "12/14/2021") ||
              compareDates(trans.transactionAt, "12/15/2021") ||
              compareDates(trans.transactionAt, "12/16/2021")) &&
            trans.message === "ROI"
          ) {
            transaction.fcAmount = selectedTransaction.fcAmount;
            transaction.amount = selectedTransaction.amount;
          }
          return transaction;
        });

        const data = res.transactions
            .filter((trans) => trans.message === "ROI")
            .reduce((acc, cur) => acc + cur.fcAmount, 0);

        console.log(data);

        res.stackingWallet = data;

        return res;
      }
    });

    res.json({data: walletResponse.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

router.put("/update/walletData", async (req, res) => {
  try {
    async.eachSeries(
        [],
        async function(eachUser, callback) {
          const response = await axios.put(
              baseUrl + "/user/setDataFunction",
              eachUser,
          );
          console.log(response);
        },
        (err) => {
          if (err) {
            res
                .status(500)
                .json({message: err.message, stack: err.stack, completed: false});
          } else {
            res.status(200).json({message: "completed"});
          }
        },
    );
  } catch (err) {
    res.json({message: err.message});
  }
});

/**
 * Generate OTP.
 */

router.post("/user/generateOtpFor/:userId", async (req, res) => {
  try {
    const response = await axios.post(
        `${baseUrl}/user/generateOtpFor/${req.params.userId}`,
        {},
    );
    res.json({data: response.data});
  } catch (err) {
    res.json({message: err.message});
  }
});

/**
 * Check OTP.
 */

router.get("/user/authenticateOtpFor/:userId/:enteredOtp", async (req, res) => {
  try {
    const response = await axios.get(
        `${baseUrl}/user/authenticateOtpFor/${req.params.userId}/${req.params.enteredOtp}`,
    );
    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

router.post("/user/supportRecord/create", async (req, res) => {
  try {
    const response = await axios.post(
        `${baseUrl}/user/supportRecord/create`,
        req.body,
    );
    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

router.get("/user/getUnprocessedSupportRecords", async (req, res) => {
  try {
    const response = await axios.get(
        `${baseUrl}/user/getUnprocessedSupportRecords`,
    );
    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

router.get("/user/getAcceptedSupportRecords", async (req, res) => {
  try {
    const response = await axios.get(
        `${baseUrl}/user/getAcceptedSupportRecords`,
    );
    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

router.put("/user/supportRecord/accept", async (req, res) => {
  try {
    const response = await axios.put(
        `${baseUrl}/user/supportRecord/accept`,
        req.body,
    );
    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

router.post("/user/panRecord/create", async (req, res) => {
  try {
    const response = await axios.post(
        `${baseUrl}/user/panRecord/create`,
        req.body,
    );
    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

router.get("/user/getPanRecord/for/:userId", async (req, res) => {
  try {
    const response = await axios.get(
        `${baseUrl}/user/getPanRecord/for/${req.params.userId}`,
    );
    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

router.get("/user/get", async (req, res) => {
  try {
    const response = await axios.get(`${baseUrl}/user/get`);
    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

router.get("/user/get/auth", async (req, res) => {
  try {
    const response = await axios.get(`${baseUrl}/user/get/auth`);

    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

router.get("/user/getBusinessRecords", async (req, res) => {
  try {
    const response = await axios.get(`${baseUrl}/user/getBusinessRecords`);

    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

router.get("/user/getDeductionAmount/:id", async (req, res) => {
  try {
    const response = await axios.get(
        `${baseUrl}/user/getDeductionAmount/${req.params.id}`,
    );

    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

router.get("/user/getAcceptedTopupRequests", async (req, res) => {
  try {
    const response = await axios.get(
        `${baseUrl}/user/getAcceptedTopupRequests`,
    );

    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

router.get("/user/getAcceptedTopupRequests/:userId", async (req, res) => {
  try {
    const response = await axios.get(
        `${baseUrl}/user/getAcceptedTopupRequests/${req.params.userId}`,
    );
    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});


router.get("/user/topupRequest", async (req, res)=>{
  mTopupRequest.find({}, {}, {lean: true}, (topupErr, topupRes)=>{
    if (topupErr) {
      res.send(topupErr);
    } else {
      res.send(topupRes);
    }
  });
});

router.post("/user/topupRequestById", async (req, res)=>{
  mTopupRequest.find({userId: req.body.userId}, {}, {lean: true}, (topupErr, topupRes)=>{
    if (topupErr) {
      res.send(topupErr);
    } else {
      res.send(topupRes);
    }
  });
});

router.post("/user/transferWithdraw", async (req, res)=>{
  try {
    const response = await axios.post(
        `${baseUrl}/user/transferWithdraw`, req.body,
    );
    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

router.post("/user/internalTransfer", async (req, res)=>{
  try {
    const response = await axios.post(
        `${baseUrl}/user/internalTransfer`, req.body,
    );
    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

router.post("/auth/sendMailUserIdPassword", async (req, res)=>{
  try {
    const response = await axios.post(
        `${baseUrl}/auth/sendMailUserIdPassword`, req.body,
    );
    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

router.post("/user/demo1", async (req, res)=>{
  try {
    const response = await axios.post(
        `${baseUrl}/user/demo1`, req.body,
    );
    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

router.post("/user/demo2", async (req, res)=>{
  try {
    const response = await axios.post(
        `${baseUrl}/user/demo2`, req.body,
    );
    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

router.post("/user/demo3", async (req, res)=>{
  try {
    const response = await axios.post(
        `${baseUrl}/user/demo3`, req.body,
    );
    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

router.post("/user/demo4", async (req, res)=>{
  try {
    const response = await axios.post(
        `${baseUrl}/user/createPreviousBalance`, req.body,
    );
    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

router.post("/user/demo5", async (req, res)=>{
  try {
    const response = await axios.post(
        `${baseUrl}/user/userActiveCheck`, req.body,
    );
    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

router.post("/user/demo6", async (req, res)=>{
  try {
    const response = await axios.post(
        `${baseUrl}/user/demo6`, req.body,
    );
    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

router.post("/user/demo7", async (req, res)=>{
  try {
    const response = await axios.post(
        `${baseUrl}/user/demo7`, req.body,
    );
    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

router.get("/user/demo8", async (req, res) => {
  try {
    const response = await axios.get(`${baseUrl}/user/demo8`);
    res.status(200).json({data: response.data});
  } catch (err) {
    res.status(err.status || 500).json({message: err.message});
  }
});

router.get("/user/demo9/:id", async (req, res) => {
  try {
    const response = await axios.get(`${baseUrl}/user/demo9/${req.params.id}`);
    res.status(200).json({data: response.data});
  } catch (err) {
    res.status(err.status || 500).json({message: err.message});
  }
});

router.get("/user/demo10", async (req, res) => {
  try {
    const response = await axios.get(`${baseUrl}/user/demo10`);
    res.status(200).json({data: response.data});
  } catch (err) {
    res.status(err.status || 500).json({message: err.message});
  }
});

router.get("/user/demo11", async (req, res) => {
  try {
    const response = await axios.get(`${baseUrl}/user/demo11`);
    res.status(200).json({data: response.data});
  } catch (err) {
    res.status(err.status || 500).json({message: err.message});
  }
});

router.get("/user/demo12", async (req, res) => {
  try {
    const response = await axios.get(`${baseUrl}/user/demo12`);
    res.status(200).json({data: response.data});
  } catch (err) {
    res.status(err.status || 500).json({message: err.message});
  }
});

router.get("/user/demo13", async (req, res) => {
  try {
    const response = await axios.get(`${baseUrl}/user/demo13`);
    res.status(200).json({data: response.data});
  } catch (err) {
    res.status(err.status || 500).json({message: err.message});
  }
});

router.put("/user/demo14", async (req, res) => {
  try {
    const response = await axios.put(
        `${baseUrl}/user/demo14`,
        req.body,
    );
    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

router.put("/user/demo15", async (req, res) => {
  try {
    const response = await axios.put(
        `${baseUrl}/user/demo15`,
        req.body,
    );
    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

router.put("/user/demo16", async (req, res) => {
  try {
    const response = await axios.put(
        `${baseUrl}/user/demo16`,
        req.body,
    );
    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

router.post("/user/internalSelfTopup", async (req, res)=>{
  try {
    const response = await axios.post(
        `${baseUrl}/user/internalSelfTopup`, req.body,
    );
    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

router.post("/user/internalTransfer", async (req, res)=>{
  try {
    const response = await axios.post(
        `${baseUrl}/user/internalTransfer`, req.body,
    );
    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});


router.get("/user/getById/:id", async (req, res) => {
  try {
    const result = await axios.get(baseUrl + `/user/getById/${req.params.id}`);
    console.log(result);

    res.status(200).json({data: result.data});
  } catch (err) {
    res.status(err.status || 500).json({message: err.message});
  }
});


router.post("/generateOtpFor/:userId", async (req, res)=>{
  try {
    const response = await axios.post(
        `${baseUrl}/generateOtpFor/${req.params.userId}`, req.body,
    );
    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

router.get("/authenticateOtpFor/{userId}/{enteredOtp}", async (req, res) => {
  try {
    const result = await axios.get(baseUrl + `/authenticateOtpFor/${req.params.userId}/${req.params.enteredOtp}`);
    console.log(result);

    res.status(200).json({data: result.data});
  } catch (err) {
    res.status(err.status || 500).json({message: err.message});
  }
});

router.get("/getUserName/:refId", async (req, res) => {
  try {
    const result = await axios.get(baseUrl + `/getUserName/${req.params.refId}`);
    console.log(result);

    res.status(200).json({data: result.data});
  } catch (err) {
    res.status(err.status || 500).json({message: err.message});
  }
});

router.post("/user/internalSelfTopup", async (req, res)=>{
  try {
    const response = await axios.post(baseUrl + "/user/internalSelfTopup", req.body);
    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

router.post("/user/internalTransfer", async (req, res)=>{
  try {
    const response = await axios.post(baseUrl + "/user/interTransfer", req.body);
    res.json({data: response.data});
  } catch (error) {
    res.json({message: error.message});
  }
});

router.post("/user/createFmdc", async (req,res)=>{
  try{
    const response = await axios.post(baseUrl + "/user/createFmdc",req.body);
    res.json({data:response.data});
  }catch(err){
    res.json({message:err.message})
  }
})
module.exports = router;
