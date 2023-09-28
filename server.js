const express = require("express");
const path = require('path');
const cors = require("cors");
//
const cookieParser = require("cookie-parser")
require("dotenv").config();
//
const app = express();
app.use(express.static('public'));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '50mb',extended: true }));
app.use(express.json());
//
const { u_router } = require("./routes/users.router.js");
//
app.use(cors());
app.use(cookieParser());
//
app.listen(process.env.PORT || 3005, () => {
  console.log(`run on port ${process.env.PORT || 3005}`);
});
//3005

app.use("/api/users", u_router);


// make Node serve the files for built React app
app.use(express.static(path.join(__dirname, "/client/build")));

// all other get requests go to React
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./client/build", "index.html"));
});
