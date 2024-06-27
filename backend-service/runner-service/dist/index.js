"use strict";
require("dotenv").config();
const express = require("express");
const { createServer } = require("http");
const { initWs } = require("./ws");
const cors = require("cors");
const app = express();
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
}));
const httpServer = createServer(app);
initWs(httpServer);
const port = 3001;
httpServer.listen(port, () => {
    console.log(`server running on ${port}`);
});
