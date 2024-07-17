const express = require("express");
require("dotenv").config();
const path = require("path");
const userRoutes = require("./routes/userRoutes");
const blogRoutes = require("./routes/blogRoutes");
const connectDB = require("./config/db");

connectDB();
const app = express();

app.use(express.json());
app.use(express.static(path.resolve("./public")));
const PORT = process.env.PORT || 5000;


//routes
app.use((req, res, next) => {
  console.log(`${req.method} request for '${req.url}'`);
  console.log("Request params:", req.params);
  console.log("Request query:", req.query);
  console.log(
    "Route stack:",
    req.app._router.stack
      .map((r) => (r.route ? r.route.path : r.name))
      .filter(Boolean)
  );
  next();
});

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/blogPost", blogRoutes);

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.listen(PORT, () => {
  console.log(
    `Server Running on  Port no ${PORT}`
  );
});
