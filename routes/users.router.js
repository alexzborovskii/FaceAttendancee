const {
    register,
    login,
    getUserInfo,
    // postSample,
    uploadImage,
    getUserSamples,
    delSample,
    putDescriptors,
    putUserInfo,
} = require("../controllers/users.controllers.js");
const express = require("express");
const { verifyToken } = require("../middlewares/verify.token.js");
const { _getUserSamples } = require("../models/users.model.js");
const u_router = express.Router();

u_router.post("/register", register);
u_router.post("/login", login);
u_router.get("/verify", verifyToken, (req, res) => {
    res.sendStatus(200);
});
u_router.get("/logout", (res, req) => {
    res.clearCookie("token");
    req.user = null;
    res.sendStatus(200);
});
u_router.get("/userinfo/:id", getUserInfo);
u_router.post("/upload", uploadImage);
u_router.get("/userSamples/:id", getUserSamples);
u_router.delete("/deleteSample/:publicID", delSample);
u_router.put("/updateUserInfo/:id", putUserInfo);

u_router.put("/putdescripters/:id", putDescriptors);

module.exports = {
    u_router,
};
