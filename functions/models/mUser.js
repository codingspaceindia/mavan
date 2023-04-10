const mongoose = require("mongoose");
const typeString = {type: String};
const typeStringReq = {type: String, required: true};
const {PLACEMENTSIDE} = require("../common/constant");

const userSchema = new mongoose.Schema({

  parentRefId: typeStringReq,
  parentId: typeStringReq, // parent _id

  refId: typeStringReq,

  userName: typeString,
  gender: typeString,
  address: typeString,
  city: typeString,
  state: typeString,
  country: typeString,
  pinCode: typeString,

  // unique: true
  mobile: {type: String},
  // unique: true
  email: {type: String, required: true},

  ifscCode: typeString,
  branch: typeString,
  panCard: typeString,
  aadharCard: typeString,

  bankAccountNo: typeString,
  accountHolderName: typeString,
  bankName: typeString,

  side: { // user's placement side
    type: String,
    enum: PLACEMENTSIDE,
    required: true,
  },

  plan: typeString, //
  // projectId: {type: String, required: true},

  status: {type: String, default: "P"}, // A => Active, D => Deactive, P => Pending
  statusReqAt: {type: Date, default: new Date()},
  statusResAt: {type: Date},

  isPromoterCompleted: {type: Boolean, default: false}, // user completed promoter childs m
});

userSchema.set("timestamps", true);
module.exports = mongoose.model("user", userSchema, "user");
