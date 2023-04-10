const express = require("express");
const router = express.Router();
const mNotice = require("../models/mNotice");
const _ = require("lodash");
const {commonResponse} = require("../common/commonFunction");

router.post("/create", async (req, res) => {
  try {
    const noticeData = {
      userId: req.body.token.userId,
      type: req.body.type,
      content: req.body.content,
    };

    const newNotice = new mNotice(noticeData);
    const docs = await newNotice.save();
    res.status(200).send(commonResponse(null, docs, null));
  } catch (err) {
    res
        .status(500)
        .send(commonResponse(err.messge, {noticeCreated: false}, err.name));
  }
});

router.post("/getAll", async (req, res) => {
  try {
    const allNotice = await mNotice.find({}, {}, {lean: true});
    const grpdNotice = _.groupBy(allNotice, "type");
    res.status(200).send(commonResponse(null, grpdNotice, null));
  } catch (err) {
    res.status(500).send(commonResponse(err.messge, [], err.name));
  }
});

module.exports = router;
