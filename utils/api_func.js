// @ts-ignore
const axios = require("axios");
const crypto = require('crypto');

axios.defaults.timeout = 10000;

const FF_API_KEY = process.env.FF_API_KEY;
const FF_API_SECRET = process.env.FF_API_SECRET;
const FF_API_URL = process.env.FF_API_URL;
const SS_API_URL = process.env.SS_API_URL;
const SS_API_KEY = process.env.SS_API_KEY;
const CN_API_URL = process.env.CN_API_URL;
const CN_API_KEY = process.env.CN_API_KEY;
const SE_API_URL = process.env.SE_API_URL;
const SE_API_KEY = process.env.SE_API_KEY;
const FF_ENABLE = process.env.FF_ENABLE.toLowerCase();
const SS_ENABLE = process.env.SS_ENABLE.toLowerCase();
const SE_ENABLE = process.env.SE_ENABLE.toLowerCase();
const CN_ENABLE = process.env.CN_ENABLE.toLowerCase();

function ff_sign(params) {
  let payload;
  if (typeof params === 'object') {
    const parts = [];
    for (const k in params) {
      parts.push(`${k}=${params[k]}`);
    }
    payload = parts.join('&');
  } else {
    payload = params;
  }
  return crypto
    .createHmac('sha256', FF_API_SECRET)
    .update(payload)
    .digest('hex');
}

function standardize_ff_symbol(token_symbol) {
  if (token_symbol === "BNB") return "BSC";
  else if (token_symbol === "DAI") return "DAIETH";
  else return token_symbol.toUpperCase();
}

function standardize_cn_symbol(token_symbol) {
  if (token_symbol === "BSC" || token_symbol === "BNB") return "bnbbsc";
  else if (token_symbol === "USDT") return "usdterc20";
  else if (token_symbol == "USDTTRC") return "usdttrc20";
  else if (token_symbol == "BUSDETH") return "busd";
  else if (token_symbol == "MATIC") return "maticmainnet";
  else if (token_symbol == "AVAX") return "avaxc";
  else return token_symbol.toLowerCase();
}

function standardize_ss_symbol(token_symbol) {
  if (token_symbol === "BSC") return "bnb-bsc";
  else if (token_symbol === "USDT") return "usdterc20";
  else if (token_symbol === "USDTTRC") return "usdttrc20";
  else if (token_symbol === "USDTBSC") return "usdtbep20";
  else if (token_symbol === "BUSDBSC") return "busd";
  else if (token_symbol === "DAIBSC") return "daibep20";
  else if (token_symbol == "BUSDETH") return "busderc20";
  else if (token_symbol == "AVAX") return "avaxc";
  else return token_symbol.toLowerCase();
}

function standardize_se_symbol(token_symbol) {
  if (token_symbol === "BSC") return "bnbbsc";
  else if (token_symbol === "USDT") return "usdterc20";
  else if (token_symbol === "USDTTRC") return "usdttrc20";
  else if (token_symbol === "BUSDBSC") return "busd";
  else if (token_symbol === "DAIBSC") return "daibep20";
  else if (token_symbol === "CRO") return "cromainnet";
  else if (token_symbol === "BUSDETH") return "busderc20";
  else if (token_symbol === "AVAX") return "avaxc";
  else return token_symbol.toLowerCase();
}

// FixedFloat APIs

async function getPrice_ff(amount,fromCcy, toCcy) {
  try {
    const url = FF_API_URL + 'price';
    const payload = {
      fromCcy,
      toCcy,
      amount,
      direction: 'from',
      type: 'float'
    };
    const headers = {
      'X-API-KEY': FF_API_KEY,
      'X-API-SIGN': ff_sign(JSON.stringify(payload)),
      'Content-Type': 'application/json',
    };
    const response = await axios.post(url, payload, { headers });
    return response.data["data"];
  } catch (error) {
    console.log("FF price catching error", error);
  }
}

// ChangeNow APIs
async function cn_get_exchange_amount(amount, from_ticker, to_ticker) {
  const apiURL = `${CN_API_URL}exchange-amount/${amount}/${from_ticker}_${to_ticker}?api_key=${CN_API_KEY}`;
  const response = await axios.get(apiURL);
  return response.data;
}

async function cn_get_min_exchange_amount(from_ticker, to_ticker) {
  const apiURL = `${CN_API_URL}min-amount/${from_ticker}_${to_ticker}?api_key=${CN_API_KEY}`;
  const response = await axios.get(apiURL);
  return response.data.minAmount;
}

async function cn_get_max_exchange_amount(from_ticker, to_ticker) {
  const apiURL = `${CN_API_URL}exchange-range/${from_ticker}_${to_ticker}?api_key=${CN_API_KEY}`;
  const response = await axios.get(apiURL);
  return response.data.maxAmount;
}


async function ss_get_exchange_amount(currency_from, currency_to, amount) {
  const apiURL = `${SS_API_URL}get_estimated?api_key=${SS_API_KEY}&fixed=false&currency_from=${currency_from}&currency_to=${currency_to}&amount=${amount}`;
  const response = await axios.get(apiURL);
  return response.data;
}

async function ss_get_min_exchange_amount(currency_from, currency_to) {
  const apiURL = `${SS_API_URL}get_ranges?api_key=${SS_API_KEY}&fixed=false&currency_from=${currency_from}&currency_to=${currency_to}`;
  const response = await axios.get(apiURL);
  try {
    const response = await axios.get(apiURL, {
      headers: { "Accept-Encoding": "gzip,deflate,compress" },
    });
    return response.data.min;
  } catch (error) {
    console.log("ss_get_min_exchange_amount_error===>>>", error);
  }
}

async function ss_get_max_exchange_amount(currency_from, currency_to) {
  const apiURL = `${SS_API_URL}get_ranges?api_key=${SS_API_KEY}&fixed=false&currency_from=${currency_from}&currency_to=${currency_to}`;
  const response = await axios.get(apiURL);
  try {
    const response = await axios.get(apiURL, {
      headers: { "Accept-Encoding": "gzip,deflate,compress" },
    });
    return response.data.max;
  } catch (error) {
    console.log("ss_get_max_exchange_amount_error===>>>", error);
  }
}

async function se_get_exchange_amount(currency_from, currency_to, amount) {
  const apiURL = `${SE_API_URL}estimate/${currency_from}/${currency_to}?amount=${amount}&api_key=${SE_API_KEY}&fixed=false`;
  const response = await axios.get(apiURL);
  return response.data.estimated_amount;
}

async function se_get_min_exchange_amount(currency_from, currency_to) {
  const apiURL = `${SE_API_URL}min/${currency_from}/${currency_to}?fixed=false&api_key=${SE_API_KEY}`;
  try {
    const response = await axios.get(apiURL, {
      headers: { "Accept-Encoding": "gzip,deflate,compress" },
    });
    return response.data.min_amount;
  } catch (error) {
    console.log("se_get_min_exchange_amount_error===>>>", error);
  }
}

async function se_get_max_exchange_amount(currency_from, currency_to) {
  const apiURL = `${SE_API_URL}range/${currency_from}/${currency_to}?fixed=false&api_key=${SE_API_KEY}`;
  try {
    const response = await axios.get(apiURL, {
      headers: { "Accept-Encoding": "gzip,deflate,compress" },
    });
    return response.data.max_amount;
  } catch (error) {
    console.log("se_get_min_exchange_amount_error===>>>", error);
  }
}

function get_min_max_range(
  estimated_xmr_amount,
  swapA_amount,
  SwapA_xmr_min_amount,
  xmr_SwapB_min_amount,
  xmr_SwapB_max_amount
) {
    let SwapA_min_amount;
    let SwapA_max_amount;
    const exchange_rate = parseFloat(estimated_xmr_amount) / swapA_amount;
    const SwapA_min_amount_est = xmr_SwapB_min_amount / exchange_rate;
    const SwapA_max_amount_est =
      xmr_SwapB_max_amount === -1 ? -1 : xmr_SwapB_max_amount / exchange_rate;
    SwapA_min_amount =
      SwapA_min_amount_est > SwapA_xmr_min_amount
        ? SwapA_min_amount_est
        : SwapA_xmr_min_amount;
    SwapA_max_amount =
      SwapA_max_amount_est < xmr_SwapB_max_amount
        ? SwapA_max_amount_est
        : xmr_SwapB_max_amount;

  return [SwapA_min_amount, SwapA_max_amount]
}

async function price_cn_to_ff(swapA_amount, SwapA_sym, SwapB_sym) {
  try {
    let swapB_amount;
    let SwapA_min_amount;
    let SwapA_max_amount;
    let SwapA_xmr_min_amount;
    let SwapA_xmr_max_amount;
    let xmr_SwapB_min_amount;
    let xmr_SwapB_max_amount;
    let estimated_xmr_amount;

    const swapA_symbol = standardize_cn_symbol(SwapA_sym);
    const swapB_symbol = standardize_ff_symbol(SwapB_sym);
    SwapA_xmr_min_amount = parseFloat(await cn_get_min_exchange_amount(
      swapA_symbol,
      "xmr"
    ));
    SwapA_xmr_max_amount = parseFloat(
      await cn_get_max_exchange_amount("xmr", swapB_symbol)
    );
    if (isNaN(SwapA_xmr_max_amount)) SwapA_xmr_max_amount = -1; // no limit for max
    const XMRObj = await getPrice_ff(SwapA_xmr_min_amount, "XMR", swapB_symbol);
    xmr_SwapB_min_amount = XMRObj["from"]["min"];
    xmr_SwapB_max_amount = XMRObj["from"]["max"];
    if (
      swapA_amount < SwapA_xmr_min_amount ||
      (swapA_amount > SwapA_xmr_max_amount && SwapA_xmr_max_amount > 0)
    ){
      swapB_amount = -1;
      SwapA_min_amount = SwapA_xmr_min_amount; 
      SwapA_max_amount = SwapA_xmr_max_amount; 
    }
    else {
      const estimate = await cn_get_exchange_amount(
        swapA_amount,
        swapA_symbol,
        "xmr"
      );
      estimated_xmr_amount = estimate["estimatedAmount"];
      const priceObj = await getPrice_ff(
        estimated_xmr_amount,
        "XMR",
        swapB_symbol
      );
      swapB_amount = parseFloat(priceObj["to"]["amount"]);
      [SwapA_min_amount, SwapA_max_amount] = get_min_max_range(
        estimated_xmr_amount,
        swapA_amount,
        SwapA_xmr_min_amount,
        xmr_SwapB_min_amount,
        xmr_SwapB_max_amount
      )
      if (swapA_amount > SwapA_max_amount && SwapA_max_amount>0 ) swapB_amount = -1;
    }
    console.log("===========1=========================");
    console.log([swapB_amount, SwapA_min_amount, SwapA_max_amount, "cn_ff"]);
    return [parseFloat(swapB_amount), parseFloat(SwapA_min_amount), parseFloat(SwapA_max_amount), "cn_ff"];
  } catch (error) {
    console.error("price_cn_to_ff====error:", error);
    return [0, 0, 0, "cn_ff"];
  }
}
// price_cn_to_ff(10, "USDT", "BUSD");

async function price_ff_to_cn(swapA_amount, SwapA_sym, SwapB_sym) {
  try {
    let swapB_amount;
    let SwapA_min_amount;
    let SwapA_max_amount;
    let SwapA_xmr_min_amount;
    let SwapA_xmr_max_amount;
    let xmr_SwapB_min_amount;
    let xmr_SwapB_max_amount;
    let estimated_xmr_amount;
    const swapA_symbol = standardize_ff_symbol(SwapA_sym);
    const swapB_symbol = standardize_cn_symbol(SwapB_sym);

    const XMRObj = await getPrice_ff(swapA_amount, swapA_symbol, "XMR");
    SwapA_xmr_min_amount = XMRObj["from"]["min"];
    SwapA_xmr_max_amount = XMRObj["from"]["max"];
    xmr_SwapB_min_amount = parseFloat(
      await cn_get_min_exchange_amount("xmr", swapB_symbol)
    );
    xmr_SwapB_max_amount = parseFloat(
      await cn_get_max_exchange_amount("xmr", swapB_symbol)
    );
    if (isNaN(xmr_SwapB_max_amount)) xmr_SwapB_max_amount = -1; // no limit for max

    if (
      swapA_amount < SwapA_xmr_min_amount ||
      (swapA_amount > SwapA_xmr_max_amount && SwapA_xmr_max_amount > 0)
    ){
      swapB_amount = -1;
      SwapA_min_amount = SwapA_xmr_min_amount; 
      SwapA_max_amount = SwapA_xmr_max_amount; 
    }
    else {
      estimated_xmr_amount = XMRObj["to"]["amount"];
      let estimate = await cn_get_exchange_amount(
        estimated_xmr_amount,
        "xmr",
        swapB_symbol
      );
      swapB_amount = estimate["estimatedAmount"];
      if (isNaN(swapB_amount)) swapB_amount = -1;
      [SwapA_min_amount, SwapA_max_amount] = get_min_max_range(
        estimated_xmr_amount,
        swapA_amount,
        SwapA_xmr_min_amount,
        xmr_SwapB_min_amount,
        xmr_SwapB_max_amount
      )
    }
    console.log("============2========================");
    console.log([swapB_amount, SwapA_min_amount, SwapA_max_amount, "ff_cn"]);
    return [parseFloat(swapB_amount), parseFloat(SwapA_min_amount), parseFloat(SwapA_max_amount), "ff_cn"];
  } catch (error) {
    return [0, 0, 0, "ff_cn"];
  }
}
// price_ff_to_cn(10, "USDT", "BUSD");

async function price_ss_to_ff(swapA_amount, SwapA_sym, SwapB_sym) {
  try {
    let swapB_amount;
    let SwapA_min_amount;
    let SwapA_max_amount;
    let SwapA_xmr_min_amount;
    let SwapA_xmr_max_amount;
    let xmr_SwapB_min_amount;
    let xmr_SwapB_max_amount;
    let estimated_xmr_amount;
    const swapA_symbol = standardize_ss_symbol(SwapA_sym);
    const swapB_symbol = standardize_ff_symbol(SwapB_sym);
    SwapA_xmr_min_amount = parseFloat( 
      await ss_get_min_exchange_amount(swapA_symbol, "xmr")
    );
    SwapA_xmr_max_amount = parseFloat( 
      await ss_get_max_exchange_amount(swapA_symbol, "xmr")
    );
    if (isNaN(SwapA_xmr_max_amount)) SwapA_xmr_max_amount = -1; // no limit for max
    

    const XMRObj = await getPrice_ff(SwapA_xmr_min_amount, "XMR", swapB_symbol);
    xmr_SwapB_min_amount = XMRObj["from"]["min"];
    xmr_SwapB_max_amount = XMRObj["from"]["max"];
    if (
      swapA_amount < SwapA_xmr_min_amount ||
      (swapA_amount > SwapA_xmr_max_amount && SwapA_xmr_max_amount > 0)
    ){
      swapB_amount = -1;
      SwapA_min_amount = SwapA_xmr_min_amount; 
      SwapA_max_amount = SwapA_xmr_max_amount; 
    }
    else {
      estimated_xmr_amount = await ss_get_exchange_amount(
        swapA_symbol,
        "xmr",
        swapA_amount
      );
      const XMRObj = await getPrice_ff(estimated_xmr_amount, "XMR", swapB_symbol);
      swapB_amount = parseFloat(XMRObj["to"]["amount"]);
      [SwapA_min_amount, SwapA_max_amount] = get_min_max_range(
        estimated_xmr_amount,
        swapA_amount,
        SwapA_xmr_min_amount,
        xmr_SwapB_min_amount,
        xmr_SwapB_max_amount
      )
      if (swapA_amount > SwapA_max_amount && SwapA_max_amount>0 ) swapB_amount = -1;
    }
    console.log("==========3==========================");
    console.log([swapB_amount, SwapA_min_amount, SwapA_max_amount, "ss_ff"]);
    return [swapB_amount, parseFloat(SwapA_min_amount), parseFloat(SwapA_max_amount), "ss_ff"];
  } catch (error) {
    return [0, 0, 0, "ss_ff"];
  }
}
// price_ss_to_ff(10, "USDT", "BUSD");

async function price_ss_to_cn(swapA_amount, SwapA_sym, SwapB_sym) {
  try {
    let swapB_amount;
    let SwapA_min_amount;
    let SwapA_max_amount;
    let SwapA_xmr_min_amount;
    let SwapA_xmr_max_amount;
    let xmr_SwapB_min_amount;
    let xmr_SwapB_max_amount;
    const swapA_symbol = standardize_ss_symbol(SwapA_sym);
    const swapB_symbol = standardize_cn_symbol(SwapB_sym);
    SwapA_xmr_min_amount = parseFloat( 
      await ss_get_min_exchange_amount(swapA_symbol, "xmr")
    );
    SwapA_xmr_max_amount = parseFloat( 
      await ss_get_max_exchange_amount(swapA_symbol, "xmr")
    );
    if (isNaN(SwapA_xmr_max_amount)) SwapA_xmr_max_amount = -1; // no limit for max
    xmr_SwapB_min_amount = parseFloat(
      await cn_get_min_exchange_amount("xmr", swapB_symbol)
    );
    xmr_SwapB_max_amount = parseFloat(
      await cn_get_max_exchange_amount("xmr", swapB_symbol)
    );
    if (isNaN(xmr_SwapB_max_amount)) xmr_SwapB_max_amount = -1; // no limit for max
    if (
      swapA_amount < SwapA_xmr_min_amount ||
      (swapA_amount > SwapA_xmr_max_amount && SwapA_xmr_max_amount > 0)
    )
    {
      swapB_amount = -1;
      SwapA_min_amount = SwapA_xmr_min_amount; 
      SwapA_max_amount = SwapA_xmr_max_amount; 
    }
    else {
      estimated_xmr_amount = await ss_get_exchange_amount(
        swapA_symbol,
        "xmr",
        swapA_amount
      );
      const estimate = await cn_get_exchange_amount(
        estimated_xmr_amount,
        "xmr",
        swapB_symbol
      );
      swapB_amount = estimate["estimatedAmount"];
      if (isNaN(swapB_amount)) swapB_amount = -1;
      [SwapA_min_amount, SwapA_max_amount] = get_min_max_range(
        estimated_xmr_amount,
        swapA_amount,
        SwapA_xmr_min_amount,
        xmr_SwapB_min_amount,
        xmr_SwapB_max_amount
      )
    }
    console.log("============4========================");
    console.log([swapB_amount, SwapA_min_amount, SwapA_max_amount, "ss_cn"]);
    return [swapB_amount, SwapA_min_amount, SwapA_max_amount, "ss_cn"];
  } catch (error) {
    return [0, 0, 0, "ss_cn"];
  }
}
// price_ss_to_cn(10, "USDT", "BUSD");

async function price_ff_to_ss(swapA_amount, SwapA_sym, SwapB_sym) {
  try {
    let swapB_amount;
    let SwapA_min_amount;
    let SwapA_max_amount;
    let SwapA_xmr_min_amount;
    let SwapA_xmr_max_amount;
    let xmr_SwapB_min_amount;
    let xmr_SwapB_max_amount;
    let estimated_xmr_amount;
    const swapA_symbol = standardize_ff_symbol(SwapA_sym);
    const swapB_symbol = standardize_ss_symbol(SwapB_sym);

    const XMRObj = await getPrice_ff(swapA_amount, swapA_symbol, "XMR");
    SwapA_xmr_min_amount = XMRObj["from"]["min"];
    SwapA_xmr_max_amount = XMRObj["from"]["max"];
    xmr_SwapB_min_amount = parseFloat(
      await ss_get_min_exchange_amount("xmr", swapB_symbol)
    );
    xmr_SwapB_max_amount = parseFloat(
      await ss_get_max_exchange_amount("xmr", swapB_symbol)
    );
    if (isNaN(xmr_SwapB_max_amount)) xmr_SwapB_max_amount = -1; // no limit for max

    if (
      swapA_amount < SwapA_xmr_min_amount ||
      (swapA_amount > SwapA_xmr_max_amount && SwapA_xmr_max_amount > 0)
    ){
      swapB_amount = -1;
      SwapA_min_amount = SwapA_xmr_min_amount; 
      SwapA_max_amount = SwapA_xmr_max_amount; 
    }
    else {
      estimated_xmr_amount = XMRObj["to"]["amount"];
      let res = await ss_get_exchange_amount(
        "xmr",
        swapB_symbol,
        estimated_xmr_amount
      );
      swapB_amount = parseFloat(res);
      if (isNaN(swapB_amount)) swapB_amount = -1;
      [SwapA_min_amount, SwapA_max_amount] = get_min_max_range(
        estimated_xmr_amount,
        swapA_amount,
        SwapA_xmr_min_amount,
        xmr_SwapB_min_amount,
        xmr_SwapB_max_amount
      )
    }
    console.log("==========5==========================");
    console.log([swapB_amount, parseFloat(SwapA_min_amount), parseFloat(SwapA_max_amount), "ff_ss"]);
    return [swapB_amount, parseFloat(SwapA_min_amount), parseFloat(SwapA_max_amount), "ff_ss"];
  } catch (error) {
    return [0, 0, 0, "ff_ss"];
  }
}
// price_ff_to_ss(10, "USDT", "BUSD");

async function price_cn_to_ss(swapA_amount, SwapA_sym, SwapB_sym) {
  try {
    let swapB_amount;
    let SwapA_min_amount;
    let SwapA_max_amount;
    let SwapA_xmr_min_amount;
    let SwapA_xmr_max_amount;
    let xmr_SwapB_min_amount;
    let xmr_SwapB_max_amount;

    const swapA_symbol = standardize_cn_symbol(SwapA_sym);
    const swapB_symbol = standardize_ss_symbol(SwapB_sym);
    SwapA_xmr_min_amount = parseFloat(
      await cn_get_min_exchange_amount(swapA_symbol, "xmr")
    );
    SwapA_xmr_max_amount = parseFloat(
      await cn_get_max_exchange_amount(swapA_symbol, "xmr")
    );
    if (isNaN(SwapA_xmr_max_amount)) SwapA_xmr_max_amount = -1; // no limit for max
    xmr_SwapB_min_amount = parseFloat(
      await ss_get_min_exchange_amount("xmr", swapB_symbol)
    );
    xmr_SwapB_max_amount = parseFloat(
      await ss_get_max_exchange_amount("xmr", swapB_symbol)
    );
    if (isNaN(xmr_SwapB_max_amount)) xmr_SwapB_max_amount = -1; // no limit for max

    if (
      swapA_amount < SwapA_xmr_min_amount ||
      (swapA_amount > SwapA_xmr_max_amount && SwapA_xmr_max_amount > 0)
    ){
      swapB_amount = -1;
      SwapA_min_amount = SwapA_xmr_min_amount; 
      SwapA_max_amount = SwapA_xmr_max_amount; 
    }
    else {
      const estimate = await cn_get_exchange_amount(
        swapA_amount,
        swapA_symbol,
        "xmr"
      );
      const estimated_xmr_amount = estimate["estimatedAmount"];
      swapB_amount = parseFloat(
        await ss_get_exchange_amount("xmr", swapB_symbol, estimated_xmr_amount)
      );
      if (isNaN(swapB_amount)) swapB_amount = -1;
      [SwapA_min_amount, SwapA_max_amount] = get_min_max_range(
        estimated_xmr_amount,
        swapA_amount,
        SwapA_xmr_min_amount,
        xmr_SwapB_min_amount,
        xmr_SwapB_max_amount
      )
      if (swapA_amount > SwapA_max_amount && SwapA_max_amount>0 ) swapB_amount = -1;
    }
    console.log("==========6==========================");
    console.log([swapB_amount, SwapA_min_amount, SwapA_max_amount, "cn_ss"]);
    return [swapB_amount, SwapA_min_amount, SwapA_max_amount, "cn_ss"];
  } catch (error) {
    return [0, 0, 0, "cn_ss"];
  }
}
// price_cn_to_ss(10, "USDT", "BUSD");

async function price_se_to_ff(swapA_amount, SwapA_sym, SwapB_sym) {
  try {
    let swapB_amount;
    let SwapA_min_amount;
    let SwapA_max_amount;
    let SwapA_xmr_min_amount;
    let SwapA_xmr_max_amount;
    let xmr_SwapB_min_amount;
    let xmr_SwapB_max_amount;
    let estimated_xmr_amount;
    const swapA_symbol = standardize_se_symbol(SwapA_sym);
    const swapB_symbol = standardize_ff_symbol(SwapB_sym);
    SwapA_xmr_min_amount = parseFloat( 
      await se_get_min_exchange_amount(swapA_symbol, "xmr")
    );
    SwapA_xmr_max_amount = parseFloat( 
      await se_get_max_exchange_amount(swapA_symbol, "xmr")
    );
    if (isNaN(SwapA_xmr_max_amount)) SwapA_xmr_max_amount = -1; // no limit for max
    

    const XMRObj = await getPrice_ff(SwapA_xmr_min_amount, "XMR", swapB_symbol);
    xmr_SwapB_min_amount = XMRObj["from"]["min"];
    xmr_SwapB_max_amount = XMRObj["from"]["max"];
    if (
      swapA_amount < SwapA_xmr_min_amount ||
      (swapA_amount > SwapA_xmr_max_amount && SwapA_xmr_max_amount > 0)
    ){
      swapB_amount = -1;
      SwapA_min_amount = SwapA_xmr_min_amount; 
      SwapA_max_amount = SwapA_xmr_max_amount; 
    }
    else {
      estimated_xmr_amount = await se_get_exchange_amount(
        swapA_symbol,
        "xmr",
        swapA_amount
      );
      const XMRObj = await getPrice_ff(estimated_xmr_amount, "XMR", swapB_symbol);
      swapB_amount = parseFloat(XMRObj["to"]["amount"]);
      [SwapA_min_amount, SwapA_max_amount] = get_min_max_range(
        estimated_xmr_amount,
        swapA_amount,
        SwapA_xmr_min_amount,
        xmr_SwapB_min_amount,
        xmr_SwapB_max_amount
      )
      if (swapA_amount > SwapA_max_amount && SwapA_max_amount>0 ) swapB_amount = -1;
    }
    console.log("==========7==========================");
    console.log([swapB_amount, SwapA_min_amount, SwapA_max_amount, "se_ff"]);
    return [swapB_amount, SwapA_min_amount, SwapA_max_amount, "se_ff"];
  } catch (error) {
    return [0, 0, 0, "se_ff"];
  }
}
// price_se_to_ff(10, "USDT", "BUSD");

async function price_se_to_cn(swapA_amount, SwapA_sym, SwapB_sym) {
  try {
    let swapB_amount;
    let SwapA_min_amount;
    let SwapA_max_amount;
    let SwapA_xmr_min_amount;
    let SwapA_xmr_max_amount;
    let xmr_SwapB_min_amount;
    let xmr_SwapB_max_amount;

    const swapA_symbol = standardize_se_symbol(SwapA_sym);
    const swapB_symbol = standardize_cn_symbol(SwapB_sym);

    SwapA_xmr_min_amount = parseFloat( 
      await se_get_min_exchange_amount(swapA_symbol, "xmr")
    );
    SwapA_xmr_max_amount = parseFloat( 
      await se_get_max_exchange_amount(swapA_symbol, "xmr")
    );
    if (isNaN(SwapA_xmr_max_amount)) SwapA_xmr_max_amount = -1; // no limit for max
    xmr_SwapB_min_amount = parseFloat(
      await cn_get_min_exchange_amount("xmr", swapB_symbol)
    );
    xmr_SwapB_max_amount = parseFloat(
      await cn_get_max_exchange_amount("xmr", swapB_symbol)
    );
    if (isNaN(xmr_SwapB_max_amount)) xmr_SwapB_max_amount = -1; // no limit for max
    if (
      swapA_amount < SwapA_xmr_min_amount ||
      (swapA_amount > SwapA_xmr_max_amount && SwapA_xmr_max_amount > 0)
    )
    {
      swapB_amount = -1;
      SwapA_min_amount = SwapA_xmr_min_amount; 
      SwapA_max_amount = SwapA_xmr_max_amount; 
    }
    else {
    
      estimated_xmr_amount = await se_get_exchange_amount(
        swapA_symbol,
        "xmr",
        swapA_amount
      );
      const estimate = await cn_get_exchange_amount(
        estimated_xmr_amount,
        "xmr",
        swapB_symbol
      );
      swapB_amount = estimate["estimatedAmount"];
      if (isNaN(swapB_amount)) swapB_amount = -1;
      [SwapA_min_amount, SwapA_max_amount] = get_min_max_range(
        estimated_xmr_amount,
        swapA_amount,
        SwapA_xmr_min_amount,
        xmr_SwapB_min_amount,
        xmr_SwapB_max_amount
      )

    }
    console.log("============8========================");
    console.log([swapB_amount, SwapA_min_amount, SwapA_max_amount, "se_cn"]);
    return [swapB_amount, SwapA_min_amount, SwapA_max_amount, "se_cn"];
  } catch (error) {
    return [0, 0, 0, "se_cn"];
  }
}
// price_se_to_cn(10, "USDT", "BUSD");

async function price_ff_to_se(swapA_amount, SwapA_sym, SwapB_sym) {
  try {
    let swapB_amount;
    let SwapA_min_amount;
    let SwapA_max_amount;
    let SwapA_xmr_min_amount;
    let SwapA_xmr_max_amount;
    let xmr_SwapB_min_amount;
    let xmr_SwapB_max_amount;
    let estimated_xmr_amount;

    
    const swapA_symbol = standardize_ff_symbol(SwapA_sym);
    const swapB_symbol = standardize_se_symbol(SwapB_sym);

    const XMRObj = await getPrice_ff(swapA_amount, swapA_symbol, "XMR");
    SwapA_xmr_min_amount = XMRObj["from"]["min"];
    SwapA_xmr_max_amount = XMRObj["from"]["max"];
    xmr_SwapB_min_amount = parseFloat(
      await se_get_min_exchange_amount("xmr", swapB_symbol)
    );
    xmr_SwapB_max_amount = parseFloat(
      await se_get_max_exchange_amount("xmr", swapB_symbol)
    );
    if (isNaN(xmr_SwapB_max_amount)) xmr_SwapB_max_amount = -1; // no limit for max

    if (
      swapA_amount < SwapA_xmr_min_amount ||
      (swapA_amount > SwapA_xmr_max_amount && SwapA_xmr_max_amount > 0)
    ){
      swapB_amount = -1;
      SwapA_min_amount = SwapA_xmr_min_amount; 
      SwapA_max_amount = SwapA_xmr_max_amount; 
    }
    else {
      estimated_xmr_amount = XMRObj["to"]["amount"];
      let res = await se_get_exchange_amount(
        "xmr",
        swapB_symbol,
        estimated_xmr_amount
      );
      swapB_amount = parseFloat(res);
      if (isNaN(swapB_amount)) swapB_amount = -1;
      [SwapA_min_amount, SwapA_max_amount] = get_min_max_range(
        estimated_xmr_amount,
        swapA_amount,
        SwapA_xmr_min_amount,
        xmr_SwapB_min_amount,
        xmr_SwapB_max_amount
      )
    }
    console.log("==========9==========================");
    console.log([swapB_amount, SwapA_min_amount, SwapA_max_amount, "ff_se"]);
    return [swapB_amount, parseFloat(SwapA_min_amount), parseFloat(SwapA_max_amount), "ff_se"];
  } catch (error) {
    return [0, 0, 0, "ff_se"];
  }
}
// price_ff_to_se(10, "USDT", "BUSD");

async function price_cn_to_se(swapA_amount, SwapA_sym, SwapB_sym) {
  try {
    let swapB_amount;
    let SwapA_min_amount;
    let SwapA_max_amount;
    let SwapA_xmr_min_amount;
    let SwapA_xmr_max_amount;
    let xmr_SwapB_min_amount;
    let xmr_SwapB_max_amount;

    const swapA_symbol = standardize_cn_symbol(SwapA_sym);
    const swapB_symbol = standardize_se_symbol(SwapB_sym);
    SwapA_xmr_min_amount = parseFloat(
      await cn_get_min_exchange_amount(swapA_symbol, "xmr")
    );
    SwapA_xmr_max_amount = parseFloat(
      await cn_get_max_exchange_amount(swapA_symbol, "xmr")
    );
    if (isNaN(SwapA_xmr_max_amount)) SwapA_xmr_max_amount = -1; // no limit for max
    xmr_SwapB_min_amount = parseFloat(
      await se_get_min_exchange_amount("xmr", swapB_symbol)
    );
    xmr_SwapB_max_amount = parseFloat(
      await se_get_max_exchange_amount("xmr", swapB_symbol)
    );
    if (isNaN(xmr_SwapB_max_amount)) xmr_SwapB_max_amount = -1; // no limit for max

    if (
      swapA_amount < SwapA_xmr_min_amount ||
      (swapA_amount > SwapA_xmr_max_amount && SwapA_xmr_max_amount > 0)
    ){
      swapB_amount = -1;
      SwapA_min_amount = SwapA_xmr_min_amount; 
      SwapA_max_amount = SwapA_xmr_max_amount; 
    }
    else {
      const estimate = await cn_get_exchange_amount(
        swapA_amount,
        swapA_symbol,
        "xmr"
      );
      const estimated_xmr_amount = estimate["estimatedAmount"];
      swapB_amount = parseFloat(
        await se_get_exchange_amount("xmr", swapB_symbol, estimated_xmr_amount)
      );
      if (isNaN(swapB_amount)) swapB_amount = -1;
      [SwapA_min_amount, SwapA_max_amount] = get_min_max_range(
        estimated_xmr_amount,
        swapA_amount,
        SwapA_xmr_min_amount,
        xmr_SwapB_min_amount,
        xmr_SwapB_max_amount
      )
      if (swapA_amount > SwapA_max_amount && SwapA_max_amount>0 ) swapB_amount = -1;
    }
    return [swapB_amount, SwapA_min_amount, SwapA_max_amount, "cn_se"];
  } catch (error) {
    return [0, 0, 0, "cn_se"];
  }
}
// price_cn_to_se(10, "USDT", "BUSD");


async function price_ss_to_se(swapA_amount, SwapA_sym, SwapB_sym) {
  try {
    let swapB_amount;
    let SwapA_min_amount;
    let SwapA_max_amount;
    let SwapA_xmr_min_amount;
    let SwapA_xmr_max_amount;
    let xmr_SwapB_min_amount;
    let xmr_SwapB_max_amount;
    const swapA_symbol = standardize_ss_symbol(SwapA_sym);
    const swapB_symbol = standardize_se_symbol(SwapB_sym);
    SwapA_xmr_min_amount = parseFloat( 
      await ss_get_min_exchange_amount(swapA_symbol, "xmr")
    );
    SwapA_xmr_max_amount = parseFloat( 
      await ss_get_max_exchange_amount(swapA_symbol, "xmr")
    );
    if (isNaN(SwapA_xmr_max_amount)) SwapA_xmr_max_amount = -1; // no limit for max
    xmr_SwapB_min_amount = parseFloat(
      await se_get_min_exchange_amount("xmr", swapB_symbol)
    );
    xmr_SwapB_max_amount = parseFloat(
      await se_get_max_exchange_amount("xmr", swapB_symbol)
    );
    if (isNaN(xmr_SwapB_max_amount)) xmr_SwapB_max_amount = -1; // no limit for max
    if (
      swapA_amount < SwapA_xmr_min_amount ||
      (swapA_amount > SwapA_xmr_max_amount && SwapA_xmr_max_amount > 0)
    ){
      swapB_amount = -1;
      SwapA_min_amount = SwapA_xmr_min_amount; 
      SwapA_max_amount = SwapA_xmr_max_amount; 
    }else {
      estimated_xmr_amount = await ss_get_exchange_amount(
        swapA_symbol,
        "xmr",
        swapA_amount
      );
      swapB_amount = parseFloat(
        await se_get_exchange_amount("xmr", swapB_symbol, estimated_xmr_amount)
      );
      if (isNaN(swapB_amount)) swapB_amount = -1;
      [SwapA_min_amount, SwapA_max_amount] = get_min_max_range(
        estimated_xmr_amount,
        swapA_amount,
        SwapA_xmr_min_amount,
        xmr_SwapB_min_amount,
        xmr_SwapB_max_amount
      )
      if (swapA_amount > SwapA_max_amount && SwapA_max_amount>0 ) swapB_amount = -1;
    }
    console.log("==========11==========================");
    console.log([swapB_amount, SwapA_min_amount, SwapA_max_amount, "ss_se"]);
    return [swapB_amount, SwapA_min_amount, SwapA_max_amount, "ss_se"];
  } catch (error) {
    return [0, 0, 0, "ss_se"];
  }
}

async function price_se_to_ss(swapA_amount, SwapA_sym, SwapB_sym) {
  try {
    let swapB_amount;
    let SwapA_min_amount;
    let SwapA_max_amount;
    let SwapA_xmr_min_amount;
    let SwapA_xmr_max_amount;
    let xmr_SwapB_min_amount;
    let xmr_SwapB_max_amount;
    const swapA_symbol = standardize_se_symbol(SwapA_sym);
    const swapB_symbol = standardize_ss_symbol(SwapB_sym);
    SwapA_xmr_min_amount = parseFloat( 
      await se_get_min_exchange_amount(swapA_symbol, "xmr")
    );
    SwapA_xmr_max_amount = parseFloat( 
      await se_get_max_exchange_amount(swapA_symbol, "xmr")
    );
    if (isNaN(SwapA_xmr_max_amount)) SwapA_xmr_max_amount = -1; // no limit for max
    xmr_SwapB_min_amount = parseFloat(
      await ss_get_min_exchange_amount("xmr", swapB_symbol)
    );
    xmr_SwapB_max_amount = parseFloat(
      await ss_get_max_exchange_amount("xmr", swapB_symbol)
    );
    if (isNaN(xmr_SwapB_max_amount)) xmr_SwapB_max_amount = -1; // no limit for max
    if (
      swapA_amount < SwapA_xmr_min_amount ||
      (swapA_amount > SwapA_xmr_max_amount && SwapA_xmr_max_amount > 0)
    ){
      swapB_amount = -1;
      SwapA_min_amount = SwapA_xmr_min_amount; 
      SwapA_max_amount = SwapA_xmr_max_amount; 
    }else {
      estimated_xmr_amount = await se_get_exchange_amount(
        swapA_symbol,
        "xmr",
        swapA_amount
      );
      swapB_amount = parseFloat(
        await ss_get_exchange_amount("xmr", swapB_symbol, estimated_xmr_amount)
      );
      if (isNaN(swapB_amount)) swapB_amount = -1;
      [SwapA_min_amount, SwapA_max_amount] = get_min_max_range(
        estimated_xmr_amount,
        swapA_amount,
        SwapA_xmr_min_amount,
        xmr_SwapB_min_amount,
        xmr_SwapB_max_amount
      )
      if (swapA_amount > SwapA_max_amount && SwapA_max_amount>0 ) swapB_amount = -1;
    }
    console.log("==========12==========================");
    console.log([swapB_amount, SwapA_min_amount, SwapA_max_amount, "se_ss"]);
    return [swapB_amount, SwapA_min_amount, SwapA_max_amount, "se_ss"];
  } catch (error) {
    return [0, 0, 0, "se_ss"];
  }
}

async function price_cn(swapA_amount, SwapA_sym, SwapB_sym) {
  try {
    let swapB_amount;
    let SwapA_max_amount = 0;
    const swapA_symbol = standardize_cn_symbol(SwapA_sym);
    const swapB_symbol = standardize_cn_symbol(SwapB_sym);
    const SwapA_min_amount = await cn_get_min_exchange_amount(
      swapA_symbol,
      swapB_symbol
    );
    const SwapA_max_amount_temp = await cn_get_max_exchange_amount(
      swapA_symbol,
      swapB_symbol
    );
    SwapA_max_amount =
      SwapA_max_amount_temp === null ? -1 : SwapA_max_amount_temp;
    if (
      (SwapA_min_amount <= swapA_amount &&
        SwapA_max_amount > 0 &&
        swapA_amount <= SwapA_max_amount) ||
      SwapA_max_amount < 0
    ) {
      const estimate = await cn_get_exchange_amount(
        swapA_amount,
        swapA_symbol,
        swapB_symbol
      );
      swapB_amount = estimate["estimatedAmount"];
    } else {
      swapB_amount = -1;
    }
    console.log("===========13=========================");
    console.log([swapB_amount, SwapA_min_amount, SwapA_max_amount, "cn"]);
    return [swapB_amount, SwapA_min_amount, SwapA_max_amount, "cn"];
  } catch (error) {
    console.log("errror", error);
    return [0, 0, 0, "cn"];
  }
}
// price_cn(10, "USDT", "BUSD");

async function price_ff(swapA_amount, SwapA_sym, SwapB_sym) {
  try {
    const swapA_symbol = standardize_ff_symbol(SwapA_sym);
    const swapB_symbol = standardize_ff_symbol(SwapB_sym);
    const priceObj = await getPrice_ff(
      swapA_amount,
      swapA_symbol,
      swapB_symbol
    );
    const SwapA_min_amount = priceObj["from"]["min"];
    const SwapA_max_amount = priceObj["from"]["max"];
    const swapB_amount = priceObj["to"]["amount"];
    console.log("===========14=========================");
    console.log([swapB_amount, SwapA_min_amount, SwapA_max_amount, "ff"]);
    return [swapB_amount, SwapA_min_amount, SwapA_max_amount, "ff"];
  } catch (error) {
    return [0, 0, 0, "ff"];
  }
}

// price_ff(10, "USDT", "BUSD");
async function price_ss(swapA_amount, SwapA_sym, SwapB_sym) {
  try {
    let SwapA_min_amount;
    let SwapA_max_amount;
    const swapA_symbol = standardize_ss_symbol(SwapA_sym);
    const swapB_symbol = standardize_ss_symbol(SwapB_sym);
    const swapA_amount_info = await ss_get_minmax_exchange_amount(
      swapA_symbol,
      swapB_symbol
    );
    const SwapA_max_amount_temp = swapA_amount_info["max"];
    SwapA_min_amount = parseFloat(swapA_amount_info["min"]);
    SwapA_max_amount = parseFloat(swapA_amount_info["max"]);
    if (SwapA_max_amount_temp === "" || SwapA_max_amount_temp === null)
      SwapA_max_amount = -1;
    const swapB_amount = parseFloat(
      await ss_get_exchange_amount(swapA_symbol, swapB_symbol, swapA_amount)
    );
    console.log([swapB_amount, SwapA_min_amount, SwapA_max_amount, "ss"]);
    return [swapB_amount, SwapA_min_amount, SwapA_max_amount, "ss"];
  } catch (error) {
    console.log("===========simple swap =========================");
    console.log("error", error);
    return [0, 0, 0, "ss"];
  }
}
// price_ss(10, "USDT", "BUSD");
async function price_se(swapA_amount, SwapA_sym, SwapB_sym) {
  try {
    let SwapA_min_amount;
    let SwapA_max_amount;
    let swapB_amount;
    let swapB_amount_temp;
    const swapA_symbol = standardize_se_symbol(SwapA_sym);
    const swapB_symbol = standardize_se_symbol(SwapB_sym);
    SwapA_min_amount = parseFloat(
      await se_get_min_exchange_amount(swapA_symbol, swapB_symbol)
    );
    const SwapA_max_amount_temp = parseFloat(
      await se_get_max_exchange_amount(swapA_symbol, swapB_symbol)
    );
    SwapA_max_amount = isNaN(SwapA_max_amount_temp)
      ? -1
      : SwapA_max_amount_temp;
    if (
      (SwapA_min_amount <= swapA_amount &&
        SwapA_max_amount > 0 &&
        swapA_amount <= SwapA_max_amount) ||
      SwapA_max_amount < 0
    ) {
      swapB_amount_temp = parseFloat(
        await se_get_exchange_amount(
          swapA_symbol,
          swapB_symbol,
          swapA_amount
        )
      );
      swapB_amount = isNaN(swapB_amount_temp)
      ? -1
      : swapB_amount_temp;
    } else {
      swapB_amount = -1;
    }
    console.log("===========16=========================");
    console.log([swapB_amount, SwapA_min_amount, SwapA_max_amount, "se"]);
    return [swapB_amount, SwapA_min_amount, SwapA_max_amount, "se"];
  } catch (error) {
    return [0, 0, 0, "se"];
  }
}
// price_se(10, "USDT", "BUSD");
function get_price(swapA_amount, swapA_symbol, swapB_symbol, isAnonym) {
  return new Promise((resolve, reject) => {
    console.log("get_price_start==========");
    console.log("swapA_amount==========", swapA_amount);
    console.log("swapA_symbol==========", swapA_symbol);
    console.log("swapB_symbol==========", swapB_symbol);
    console.log("isAnonym==========", isAnonym);

    let price_list = [];
    let price_quoting_func_array = [];

    if (swapA_symbol === "XMR" || swapB_symbol === "XMR" || isAnonym === 0) {
      if (FF_ENABLE === "true") {
        price_quoting_func_array.push(
          price_ff(swapA_amount, swapA_symbol, swapB_symbol)
        );
      }
      if (SS_ENABLE === "true") {
        price_quoting_func_array.push(
          price_ss(swapA_amount, swapA_symbol, swapB_symbol)
        );
      }
      if (SE_ENABLE === "true") {
        price_quoting_func_array.push(
          price_se(swapA_amount, swapA_symbol, swapB_symbol)
        );
      }
      if (CN_ENABLE === "true") {
        price_quoting_func_array.push(
          price_cn(swapA_amount, swapA_symbol, swapB_symbol)
        );
      }
    } else {
      console.time();
      if (FF_ENABLE === "true" && CN_ENABLE === "true") {
        price_quoting_func_array.push(
          price_cn_to_ff(swapA_amount, swapA_symbol, swapB_symbol)
        );
        price_quoting_func_array.push(
          price_ff_to_cn(swapA_amount, swapA_symbol, swapB_symbol)
        );
      }
      if (SS_ENABLE === "true" && CN_ENABLE === "true") {
        price_quoting_func_array.push(
          price_cn_to_ss(swapA_amount, swapA_symbol, swapB_symbol)
        );
        price_quoting_func_array.push(
          price_ss_to_cn(swapA_amount, swapA_symbol, swapB_symbol)
        );
      }
      if (SS_ENABLE === "true" && SE_ENABLE === "true") {
        price_quoting_func_array.push(
          price_ss_to_se(swapA_amount, swapA_symbol, swapB_symbol)
        );
        price_quoting_func_array.push(
          price_se_to_ss(swapA_amount, swapA_symbol, swapB_symbol)
        );
      }
      if (SE_ENABLE === "true" && FF_ENABLE === "true") {
        price_quoting_func_array.push(
          price_se_to_ff(swapA_amount, swapA_symbol, swapB_symbol)
        );
        price_quoting_func_array.push(
          price_ff_to_se(swapA_amount, swapA_symbol, swapB_symbol)
        );
      }
      if (FF_ENABLE === "true" && SS_ENABLE === "true") {
        price_quoting_func_array.push(
          price_ss_to_ff(swapA_amount, swapA_symbol, swapB_symbol)
        );
        price_quoting_func_array.push(
          price_ff_to_ss(swapA_amount, swapA_symbol, swapB_symbol)
        );
      }
      if (CN_ENABLE === "true" && SE_ENABLE === "true") {
        price_quoting_func_array.push(
          price_se_to_cn(swapA_amount, swapA_symbol, swapB_symbol)
        );
        price_quoting_func_array.push(
          price_cn_to_se(swapA_amount, swapA_symbol, swapB_symbol)
        );
      }
    }
    Promise.all(price_quoting_func_array)
      .then((resultArr) => {
        const price_list_temp = resultArr.sort((a, b) => a[0] - b[0]).reverse();
        price_list = price_list_temp.sort((a, b) => {
          if (a[0] < b[0]) {
            return 1;
          }
          if (a[0] > b[0]) {
            return -1;
          }
          if (a[2] < 0 && b[2] >= 0) {
            return 1;
          }
          if (a[2] >= 0 && b[2] < 0) {
            return -1;
          }
          if (a[2] < b[2]) {
            return 1;
          }
          if (a[2] > b[2]) {
            return -1;
          }
          return 0;
        });
        console.log("price_list==>", price_list);
        return resolve(price_list); // test this test.
      })
      .catch((err) => console.error("promise_catch_err==", err));
  });
}

module.exports = { get_price };
