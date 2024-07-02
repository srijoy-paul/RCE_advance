require("dotenv").config();
const express = require("express");
const { createServer } = require("http");
const { initWs } = require("./socket-connection");
const cors = require("cors");

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use((req: any, res: any, next: any) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

const httpServer = createServer(app);

initWs(httpServer);

const port = 3001;
httpServer.listen(port, () => {
  console.log(`server running on ${port}`);
});
