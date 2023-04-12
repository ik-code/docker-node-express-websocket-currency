"use strict";
const express = require("express");
const app = express();
const expressWs = require("express-ws")(app);

// Constants
const PORT = 8999;
const HOST = "localhost";

app.use(function (req, res, next) {
  console.log("middleware");
  req.testing = "testing";
  return next();
});

app.ws("/currency", function (ws, req) {
  ws.on("message", function (msg) {
    console.log(msg);
  });

  console.log("socket", req.testing);
  let counter = 0;
  loadCurrency().then((currency) => {
    console.log("Currency >>>", currency);

    if (ws.readyState === ws.OPEN) {
      if (counter === 0) {
        ws.send(JSON.stringify(currency));
        counter++;
      }
      setInterval(function () {
        //ws.send(`new message ${counter++} >>>`);
        ws.send(JSON.stringify(currency));
      }, 1 * 60 * 1000); // interval 5 min
    } else {
      res.send("The WebSocket connection is not open");
    }
  });
});

async function loadCurrency() {
  try {
    const response = await fetch("https://api.monobank.ua/bank/currency");
    const currency = await response.json();
    return currency;
  } catch (error) {
    console.log(error.name === "AbortError");
  }
}

app.listen(PORT, HOST, () => {
  console.log(`Running on ws://${HOST}:${PORT}/currency`);
});
