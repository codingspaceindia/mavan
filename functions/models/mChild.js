const mongoose = require("mongoose");
const typeString = {type: String};
const typeStringReqUniq = {type: String, required: true, unique: true};

const childSchema = new mongoose.Schema(
    {
      userId: typeStringReqUniq,
      left: {
        userId: typeString,
        joinedByRefId: typeString,
        parentId: typeString,
        joinedAt: {type: Date},
      },
      right: {
        userId: typeString,
        joinedByRefId: typeString,
        parentId: typeString,
        joinedAt: {type: Date},
      },
      // projectId: {type: String},
    },
);

childSchema.set("timestamps", true);
module.exports = mongoose.model("child", childSchema, "child");
