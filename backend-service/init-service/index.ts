const express = require("express");
require("dotenv").config();
const cors = require("cors");
const projectRoutes = require("./Routes/ProjectRoutes");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/v1/project", projectRoutes);

const PORT = 3020;
app.listen(PORT, () => {
  console.log(`Server Running on Port ${PORT}`);
});
