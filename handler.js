'use strict';
const api = require('lambda-api')();
const api_func = require("./utils/api_func");


api.post("/api/swap_price", async (req, res) => {
  try {
    const SwapA_amount = req.body.SwapA_amount;
    const SwapA_sym = req.body.SwapA_symbol;
    const SwapB_sym = req.body.SwapB_symbol;
    // 1: Anonymous
    // 0: Non-Anonymous
    let isAnonym = 1;
    if(req.body.is_Anonym && req.body.is_Anonym ==="non-anonymous") {
        isAnonym = 0
    }

    let SwapA_symbol;
    let SwapB_symbol;
    if (SwapA_sym === "BNB") SwapA_symbol = "BSC";
    else SwapA_symbol = SwapA_sym;
    if (SwapB_sym === "BNB") SwapB_symbol = "BSC";
    else SwapB_symbol = SwapB_sym;

    let exchangeFlow_list;
    await Promise.race([
      api_func.get_price(
        SwapA_amount,
        SwapA_symbol,
        SwapB_symbol,
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