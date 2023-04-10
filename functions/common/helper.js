const _ = require("lodash");
const nodemailer = require("nodemailer");
const Chance = require("chance");
const chance = new Chance();

// const fromMail = "codingspacein@gmail.com";
// const password = "Codingspaceindia@2304";

// const fromMail = "universaltradeschennai@gmail.com";
// const password = "universaltradeschennai@123";

const fromMail = "tradechennaiuniversal@gmail.com";
const password = "chennaiuniversal@123";

exports.getDeepLeftNodeId = (allChildData, parentId) => {
  const grpdChildDataByUserId = _.groupBy(allChildData, "userId");
  let currentParentDoc;

  if (grpdChildDataByUserId[parentId] && grpdChildDataByUserId[parentId][0]) {
    currentParentDoc = grpdChildDataByUserId[parentId][0];
  }

  for (;;) {
    if (
      currentParentDoc &&
      currentParentDoc["left"] &&
      currentParentDoc["left"]["userId"] &&
      grpdChildDataByUserId[currentParentDoc["left"]["userId"]] &&
      grpdChildDataByUserId[currentParentDoc["left"]["userId"]][0]
    ) {
      const leftUserId = currentParentDoc["left"]["userId"];
      currentParentDoc = grpdChildDataByUserId[leftUserId][0];
    } else {
      return currentParentDoc.userId;
    }
  }
};

exports.getDeepRightNodeId = (allChildData, parentId) => {
  const grpdChildDataByUserId = _.groupBy(allChildData, "userId");
  let currentParentDoc;

  if (grpdChildDataByUserId[parentId] && grpdChildDataByUserId[parentId][0]) {
    currentParentDoc = grpdChildDataByUserId[parentId][0];
  }
  for (;;) {
    if (
      currentParentDoc &&
      currentParentDoc["right"] &&
      currentParentDoc["right"]["userId"] &&
      grpdChildDataByUserId[currentParentDoc["right"]["userId"]] &&
      grpdChildDataByUserId[currentParentDoc["right"]["userId"]][0]
    ) {
      const rightUserId = currentParentDoc["right"]["userId"];
      currentParentDoc = grpdChildDataByUserId[rightUserId][0];
    } else {
      return currentParentDoc.userId;
    }
  }
};

exports.getRandomPassword = () => {
  return chance.string({
    length: 8,
    casing: "upper",
    alpha: true,
    numeric: false,
  });
};

exports.sendMail = (toMail, mailSubject, content) => {
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
    subject: mailSubject,
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

exports.getUserMailContent = (userName, password, refId) => {
  return (
    "Hi, " +
    userName.toUpperCase() +
    " ! " +
    "Your ID: " +
    refId +
    " and Your password: " +
    password
  );
};

// /**
//  *
//  * @pending
//  * @param childDoc
//  * @returns { childIds:[], rightId:String, leftId:String }
//  */

// exports.getChildIds = (childDoc) => {
//   return _getChildIds(childDoc);
// };

// /**
//  * @param childDoc
//  * @example
//  */
// function _getChildIds(childDoc) {
//   if (childDoc) {
//     const response = {
//       childUserIds: [], // only child ids
//       rightUserId: "",
//       leftUserId: "",
//     };

//     if (childDoc["right"]) {
//       response.childUserIds.push(childDoc["right"]["userId"]);
//       response.rightUserId = childDoc["right"]["userId"];
//     }

//     if (childDoc["left"]) {
//       response.childUserIds.push(childDoc["left"]["userId"]);
//       response.leftUserId = childDoc["left"]["userId"];
//     }
//     return response;
//   } else {
//     return {
//       childUserIds: [],
//       rightUserId: "",
//       leftUserId: "",
//     };
//   }
// }

// /**
//  *
//  * @param childUserIds
//  * @param grpdChildDocsByUserId
//  * @pending
//  * @example
//  */
// exports.loopSupport = (childUserIds, grpdChildDocsByUserId) => {
//   if (childUserIds.length) {
//     const output = []; // only Child ids

//     childUserIds.forEach((eachUserId) => {
//       const userChildDocs = grpdChildDocsByUserId[eachUserId][0];

//       console.log(_getChildIds(userChildDocs)["childIds"]);
//       // let ids = _getChildIds(userChildDocs)['childIds'];
//       // output.push(...ids);
//     });

//     return output;
//   } else {
//     return [];
//   }
// };

// /** .
//  * @param userId
//  * @param allUserDocs
//  * @example
//  *  * Get 3 level parentIds
//  */
exports.get3LevelParentIds = (userId, allUserDocs) => {
  const parentIds = [];
  const grpdUsersById = _.groupBy(allUserDocs, "_id");
  let currentUserId = userId;

  for (let i = 1; i <= 3; i++) {
    if (
      grpdUsersById[currentUserId] &&
      grpdUsersById[currentUserId][0] &&
      grpdUsersById[currentUserId][0]["parentId"]
    ) {
      const parentId = grpdUsersById[currentUserId][0]["parentId"];
      parentIds.push(parentId);
      currentUserId = parentId;
    }
  }
  return parentIds;
};

exports.getUser3LevelChilds = (userId, allChildDocs) => {
  /** Group child docs by userId */
  const grpdChildDocsById = _.groupBy(allChildDocs, "userId");

  const output = {};
  const level1Mems = [];
  const level2Mems = [];
  const level3Mems = [];

  grpdChildDocsById[userId][0]["right"];
  grpdChildDocsById[userId][0]["left"];

  if (
    grpdChildDocsById[userId] &&
    grpdChildDocsById[userId][0] &&
    grpdChildDocsById[userId][0]["right"]
  ) {
    level1Mems.push(grpdChildDocsById[userId][0]["right"]["userId"]);
  }

  if (
    grpdChildDocsById[userId] &&
    grpdChildDocsById[userId][0] &&
    grpdChildDocsById[userId][0]["left"]
  ) {
    level1Mems.push(grpdChildDocsById[userId][0]["left"]["userId"]);
  }

  level1Mems.forEach((eachUserId) => {
    if (
      grpdChildDocsById[eachUserId] &&
      grpdChildDocsById[eachUserId][0] &&
      grpdChildDocsById[eachUserId][0]["right"]
    ) {
      level2Mems.push(grpdChildDocsById[eachUserId][0]["right"]["userId"]);
    }

    if (
      grpdChildDocsById[eachUserId] &&
      grpdChildDocsById[eachUserId][0] &&
      grpdChildDocsById[eachUserId][0]["left"]
    ) {
      level2Mems.push(grpdChildDocsById[eachUserId][0]["left"]["userId"]);
    }
  });

  level2Mems.forEach((eachUserId) => {
    if (
      grpdChildDocsById[eachUserId] &&
      grpdChildDocsById[eachUserId][0] &&
      grpdChildDocsById[eachUserId][0]["right"]
    ) {
      level3Mems.push(grpdChildDocsById[eachUserId][0]["right"]["userId"]);
    }

    if (
      grpdChildDocsById[eachUserId] &&
      grpdChildDocsById[eachUserId][0] &&
      grpdChildDocsById[eachUserId][0]["left"]
    ) {
      level3Mems.push(grpdChildDocsById[eachUserId][0]["left"]["userId"]);
    }
  });

  output["level1Mems"] = level1Mems;
  output["level2Mems"] = level2Mems;
  output["level3Mems"] = level3Mems;
  output["allChildIds"] = [...level1Mems, ...level2Mems, ...level3Mems];
  return output;
};
