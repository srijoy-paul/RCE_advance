require("dotenv").config();
const express = require("express");
const { createServer } = require("http");
const { initWs } = require("./ws");
const cors = require("cors");

const app = express();
app.use(cors());
const httpServer = createServer(app);

initWs(httpServer);

const port = 3021;
httpServer.listen(port, () => {
  console.log(`server running on ${port}`);
});
