const functions = require("firebase-functions");

const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const PORT = 3000;
const dbUrl = "mongodb+srv://codingspace:codingspacedev@cluster0.4yk93.mongodb.net/freecoin";

const rUser = require("./routes/rUser");
const rAuth = require("./routes/rAuth");
const rNotice = require("./routes/rNotice");
const rWithdraw = require("./routes/rWithdraw");
const rWallet = require("./routes/rWallet");
const api = require("./routes/free-coin/api");

// const rNews = require("./routes/rNews");
const tokenMiddleware = require("./middlewares/tokenMiddleware");

app.get("/", (req, res) => {
  res.send("Hello");
});

app.use(cors());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({
  limit: "50mb",
  extended: true, parameterLimit: 50000,
}));

app.use(tokenMiddleware);

app.use("/user", rUser);
app.use("/auth", rAuth);
app.use("/wallet", rWallet);
app.use("/notice", rNotice);
app.use("/withdraw", rWithdraw);
app.use("/free-coin", api);

// useFindAndModify: false
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}, (err, succ) => {
  if (err) {
    console.log("Db not connected");
    console.log(err);
  } else {
    console.log("MongoDB Atlas connected");
  }
});

app.listen(PORT, () => {
  console.log("Server started at", PORT);
});

exports.app = functions.https.onRequest(app);
