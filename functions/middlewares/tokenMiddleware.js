const async = require("async");
const jwt = require("jsonwebtoken");
const jwtKey = "Codingspace + Universal + Trades";

module.exports = function verifyToken(req, res, next) {
  const isFreeCoin = req.path.split("/")[1] == "free-coin";

  if (req.path === "/auth/login" || req.path === "/user/save" || isFreeCoin) {
    return next();
  } else {
    if (!req.headers.authorization) {
      return res.status(401).send("unauthorized");
    }
    const token = req.headers.authorization.split(" ")[1];
    if (token === null) {
      return res.status(401).send("unauthorized");
    }

    let payload;
    async.series({
      checkToken: (callback) => {
        jwt.verify(token, jwtKey, (err, verifyDocs) => {
          if (err && err.name) {
            return callback({code: "EXPRY", name: err.name});
          } else {
            payload = verifyDocs;
            return callback();
          }
        });
      },
      handleToken: (callback) => {
        if (!payload) {
          return callback({code: 401});
        } else {
          return callback();
        }
      },
    }, (err) => {
      if (err) {
        if (err.code === 401) {
          return res.status(401).send("unauthorized");
        } else if (err.code === "EXPRY") {
          let code;
          if (err.name == "TokenExpiredError") {
            code = "Session expired.Login again";
          } else {
            code = err.name;
          }
          return res.status(401).send({code: code, isLogout: true});
        }
      } else {
        req.body["token"] = payload;
        delete req.body["token"]["iat"];
        delete req.body["token"]["exp"];
        return next();
      }
    });
  }
};
