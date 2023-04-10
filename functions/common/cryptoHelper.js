const coinbase = require("coinbase");
const client = new coinbase.Client({"apiKey": "asZRIG9LVRnIesSL", "apiSecret": "B6XOph84F2sfMTkqiCLUC0xQSVgM3Cjt", "strictSSL": false});
const axios = require("axios");

exports.getAdaInrPrice = (callback) => {
  client.getBuyPrice({"currencyPair": "ADA-INR"}, callback);
};


exports.getTrxPrice = async () => {
  try {
    return axios.get("https://api.wazirx.com/sapi/v1/ticker/24hr?symbol=trxinr");
    // const response =
    // return { 'data': response.data };
  } catch (error) {
    return {"err": "error"};
  }
};


// client.getBuyPrice({ 'currencyPair': 'BTC-USD' }, function (err, obj) {
//     console.log('total amount: ' + obj.data.amount);
// });
