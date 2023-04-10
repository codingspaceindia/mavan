const express = require("express");
const router = express.Router();

const _ = require("lodash");
const jwt = require("jsonwebtoken");
const jwtKey = "Codingspace + Universal + Trades";
const jwtOptions = {algorithm: "HS384", expiresIn: "1d"};
const helper = require("../common/commonFunction");

const mAuth = require("../models/mAuth");
const mUser = require("../models/mUser");

router.post("/login", async function(req, res) {
  try {
    const projection = {
      parentId: 1,
      parentRefId: 1,
      refId: 1,
      plan: 1,
    };

    const userDocs = await mUser.findOne(
        {refId: req.body.refId},
        projection,
        {lean: true},
    );

    if (userDocs) {
      const authDocs = await mAuth.findOne(
          {userId: userDocs._id, password: req.body.password},
          {},
          {lean: true},
      );
      if (authDocs) {
        const tokenPayload = {
          parentId: userDocs.parentId,
          parentRefId: userDocs.parentRefId,
          userId: userDocs._id,
          userRefId: userDocs.refId,
          isPlan25: userDocs.plan == "Access 25",
          isPlan200: userDocs.plan == "Access 200",
          plan: userDocs.plan,
        };
        const token = jwt.sign(tokenPayload, jwtKey, jwtOptions);
        const response = helper.commonResponse(
            null,
            {token, isAuthSucc: true},
            "Login successful",
        );
        // log successful login
        await mAuth.findOneAndUpdate(
            {userId: userDocs._id},
            {$push: {loginLogs: {loginAt: new Date()}}},
        );
        res.status(200).send(response);
      } else {
        const response = helper.commonResponse(
            "RefId and Password not match",
            {isAuthSucc: false},
            "RefId and Password not match",
        );
        res.status(500).send(response);
      }
    } else {
      const response = helper.commonResponse(
          "RefId and Password not match",
          {isAuthSucc: false},
          "RefId and Password not match",
      );
      res.status(500).send(response);
    }
  } catch (err) {
    const response = helper.commonResponse(
        err,
        {isAuthSucc: false},
        "Server Error",
    );
    res.status(500).send(response);
  }
});

router.post("/changePassword", async (req, res) => {
  const userAuthDocs = await mAuth.findOne(
      {userId: req.body.token.userId, password: req.body.oldPassword},
      {},
      {lean: true},
  );

  if (!userAuthDocs) {
    const response = helper.commonResponse(
        "Old password not match",
        {isChangeSuccess: false},
        "Old password not match",
    );
    res.status(200).send(response);
    return;
  }

  if (userAuthDocs && userAuthDocs.password != req.body.oldPassword) {
    const response = helper.commonResponse(
        "Old password not match",
        {isChangeSuccess: false},
        "Old password not match",
    );
    res.status(200).send(response);
    return;
  }

  const newChangeLogs = {
    oldPassword: req.body.oldPassword,
    newPassword: req.body.newPassword,
    changedAt: new Date(),
  };

  const updateObj = {
    $set: {
      password: req.body.newPassword,
    },
    $push: {
      passwordChangeLogs: newChangeLogs,
    },
  };

  await mAuth.findOneAndUpdate({userId: req.body.token.userId}, updateObj, {
    new: true,
  });

  const response = helper.commonResponse(
      "Password changed successfully",
      {isChangeSuccess: true},
      "Password changed successfully",
  );
  res.status(200).send(response);
});

router.post("/getAuthDetails", async (req, res) => {
  try {
    const userProjection = {
      refId: 1,
      userName: 1,
      parentId: 1,
      parentRefId: 1,
    };

    const authProjection = {
      password: 1,
      userId: 1,
    };
    const authDocs = await mAuth.find({}, authProjection, {lean: true});
    const userDocs = await mUser.find({status: "A"}, userProjection, {
      lean: true,
    });

    const grpdAuthDocsByUserId = _.groupBy(authDocs, "userId");
    userDocs.forEach((eachUser) => {
      if (
        grpdAuthDocsByUserId[eachUser._id] &&
        grpdAuthDocsByUserId[eachUser._id][0]
      ) {
        eachUser["password"] =
          grpdAuthDocsByUserId[eachUser._id][0]["password"];
      }
    });
    const response = helper.commonResponse(
        null,
        userDocs,
        "Active users auth details fetch success",
    );
    res.status(200).send(response);
  } catch (err) {
    const response = helper.commonResponse(err, null, "Server Error");
    res.status(500).send(response);
  }
});

// update user details

/**
 * Message screen route.
 */

module.exports = router;
