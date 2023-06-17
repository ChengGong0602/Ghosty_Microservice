'use strict';
const api = require('lambda-api')();
const api_func = require("./utils/api_func");


api.post("/api/token_price", async (req, res) => {
  try {
    const TokenA_amount = req.body.TokenA_amount;
    const TokenA_sym = req.body.TokenA_symbol;
    const TokenB_sym = req.body.TokenB_symbol;
    // 1: Anonymous
    // 0: Non-Anonymous
    let isAnonym = 1;
    if(req.body.is_Anonym && req.body.is_Anonym ==="non-anonymous") {
        isAnonym = 0
    }

    let TokenA_symbol;
    let TokenB_symbol;
    if (TokenA_sym === "BNB") TokenA_symbol = "BSC";
    else TokenA_symbol = TokenA_sym;
    if (TokenB_sym === "BNB") TokenB_symbol = "BSC";
    else TokenB_symbol = TokenB_sym;

    let exchangeFlow_list;
    await Promise.race([
      api_func.get_price(
        TokenA_amount,
        TokenA_symbol,
        TokenB_symbol,
        isAnonym
      ).then(res => exchangeFlow_list = res ),
      new Promise((_resolve, reject) => {
        setTimeout(() => {
          reject("Time out");
        }, 5000);
      }),
    ]);
    const content = {
      message: "success",
      exchangeFlow_list,
    };
    res.status(200).json(content);
  } catch (error) {
    const content = {
      message: "error",
      data: error.message ?? error,
    };
    res.status(500).json(content);
  }
});

module.exports.router = async (event, context) => {
  return await api.run(event, context);
};