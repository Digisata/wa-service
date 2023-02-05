const qrcode = require("qrcode-terminal");
const { Client } = require("whatsapp-web.js");
const express = require("express");
const { body, validationResult } = require("express-validator");
const http = require("http");

const port = process.env.PORT || 8000;

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

const client = new Client({
  puppeteer: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("message", (message) => {
  if (message.body === "!ping") {
    message.reply("pong");
  }
});

let myVar;
client.on("message_create", (message) => {
  if (message.body === "!spam") {
    myVar = setInterval(myTimer, 300);
    function myTimer() {
      client.sendMessage(message.to, "😞");
    }
  }

  if (message.body === "!stop") {
    clearInterval(myVar);
  }
});

client.initialize();

const phoneNumberFormatter = function (number) {
  let formatted = number.replace(/\D/g, "");

  if (formatted.startsWith("0")) {
    formatted = "62" + formatted.substr(1);
  }

  if (!formatted.endsWith("@c.us")) {
    formatted += "@c.us";
  }

  return formatted;
};

// Send message
app.post(
  "/send-message",
  [body("number").notEmpty(), body("message").notEmpty()],
  async (req, res) => {
    const errors = validationResult(req).formatWith(({ msg }) => {
      return msg;
    });

    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: false,
        message: errors.mapped(),
      });
    }

    const number = phoneNumberFormatter(req.body.number);
    const message = req.body.message;

    client
      .sendMessage(number, message)
      .then((response) => {
        res.status(200).json({
          status: true,
          response: response,
        });
      })
      .catch((err) => {
        res.status(500).json({
          status: false,
          response: err,
        });
      });
  }
);

server.listen(port, function () {
  console.log("App running on *: " + port);
});
