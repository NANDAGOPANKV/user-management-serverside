const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bp = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();
const db = require("./db/Connect");

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);
app.use(express.json());
app.use(bp.json());
app.use(cookieParser());
app.options("*", cors());
app.use(express.static(path.join(__dirname, "public")));

// routers
const userRouter = require("./router/userRouter");
app.use("/", userRouter);

const adminRouter = require("./router/adminRouter");
app.use("/", adminRouter);

app.set(db);
app.listen(3001, console.log("Server Started On 3001"));
