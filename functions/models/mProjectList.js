const mongoose = require("mongoose");
const typeStringReq = {type: String, required: true};

const projectListSchema = new mongoose.Schema(
    {
      "projectName": typeStringReq,
      "status": typeStringReq,
      "refPrefix": typeStringReq,
      "description": typeStringReq,
      "plan": [
        {
          "name": "",
          "description": "",
        },
      ],
    },
);

projectListSchema.set("timestamps", true);
module.exports = mongoose.model("projectList", projectListSchema, "projectList");
