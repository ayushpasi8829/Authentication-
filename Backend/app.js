require("dotenv").config();

const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");
const app = express();
app.use(cors());

const sequelize = require("./util/database");
app.use(express.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

const authRoutes = require("./route/user");
const resetPasswordRouter = require("./route/resetPasswordRouter");
app.use("/auth", authRoutes);
app.use("/reset-password", resetPasswordRouter);
sequelize
  .sync()
  .then(() => {
    app.listen(process.env.PORT || 4000, () => {
      console.log(
        `Server running at http://localhost:${process.env.PORT || 4000}`
      );
    });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
