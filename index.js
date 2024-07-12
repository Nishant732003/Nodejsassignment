const express = require("express");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const connectDB = require("./config/db");
connectDB();
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5000;

//routes
app.use("/api/v1/user", userRoutes);
app.listen(PORT, () => {
  console.log(
    `Server Running on  Port no ${PORT}`
  );
});
