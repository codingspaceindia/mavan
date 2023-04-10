const mongoose = require("mongoose");
const typeStringReq = {type: String, required: true};
const {NoticeTypes} = require("../common/constant");

const noticeSchema = new mongoose.Schema(
    {
      "userId": typeStringReq,
      "content": typeStringReq,
      "type": {
        type: String,
        enum: NoticeTypes,
        required: true,
      },
      // "projectId": {type: String, required: true},
    },
);

noticeSchema.set("timestamps", true);
module.exports = mongoose.model("notice", noticeSchema, "notice");
