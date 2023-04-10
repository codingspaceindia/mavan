
exports.commonResponse = function(error, data, message) {
  return {"error": error, "data": data, "message": message};
};
