const mongoose = require("mongoose");
const typeStringReqUniq = {type: String, required: true, unique: true};

const authSchema = new mongoose.Schema({
  userId: typeStringReqUniq,
  password: {type: String, required: true},
  // projectId: {type: String, required: true},
  loginLogs: [
    {
      _id: false,
      loginAt: {type: Date},
    },
  ],
  passwordChangeLogs: [
    {
      _id: false,
      oldPassword: {type: String, required: true},
      newPassword: {type: String, required: true},
      changedAt: {type: Date},
    },
  ],

});

authSchema.set("timestamps", true);
module.exports = mongoose.model("auth", authSchema, "auth");
