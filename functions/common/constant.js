exports.TransactionType = {
  C: "C",
  D: "D",
};

exports.TransactionServerMessage = {
  /** New child joined in Access 25 */
  NEW_ACCESS25_CHILD_JOINED: "NEW_ACCESS25_CHILD_JOINED",
  /** New child joined in Access 200 */
  NEW_ACCESS200_CHILD_JOINED: "NEW_ACCESS200_CHILD_JOINED",
  NEW_CHILD_JOINED: "NEW_CHILD_JOINED",
  /** New child joined in right side */
  NEW_RIGHT_CHILD_JOIN: "NEW_RIGHT_CHILD_JOIN",
  /** New child joined in left side */
  NEW_LEFT_CHILD_JOIN: "NEW_LEFT_CHILD_JOIN",

  /** User withdraw */
  WITHDRAW: "WITHDRAW",

  /** Withdraw request rejected */
  WITHDRAW_REJECTED: "WITHDRAW_REJECTED",

  /** Child joined in level1 */
  LEVEL1_CHILD_JOINED: "LEVEL1_CHILD_JOINED",
  /** Child joined in level2 */
  LEVEL2_CHILD_JOINED: "LEVEL2_CHILD_JOINED",
  /** Child joined in level3 */
  LEVEL3_CHILD_JOINED: "LEVEL3_CHILD_JOINED",
};

exports.TransactionMessageForLevels = {
  /** Child joined in level1 */
  1: "LEVEL1_CHILD_JOINED",
  /** Child joined in level2 */
  2: "LEVEL2_CHILD_JOINED",
  /** Child joined in level3 */
  3: "LEVEL3_CHILD_JOINED",
};

/**
 * User placement side.
 */
exports.PLACEMENTSIDE = {
  LEFT: "LEFT",
  RIGHT: "RIGHT",
};

exports.NoticeTypes = ["EVENTS", "NEWS", "ACHIEVERS"];
