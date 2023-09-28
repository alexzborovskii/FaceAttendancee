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
    getDescriptors,
    postDetection,
} = require("../controllers/users.controllers.js");
const express = require("express");
const u_router = express.Router();
const {verifyToken} = require('../middlewares/verify.token.js');



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
u_router.get("/userinfo/", verifyToken, getUserInfo);
u_router.put("/updateUserInfo/", verifyToken, putUserInfo);
u_router.post("/upload", verifyToken, uploadImage);
u_router.get("/userSamples/", verifyToken, getUserSamples);
u_router.delete("/deleteSample/:publicID", verifyToken, delSample);
u_router.get("/putdescripters/",verifyToken, putDescriptors);
u_router.get("/getAllDescriptors/", verifyToken, getDescriptors);
u_router.post("/postdetection/", postDetection);


module.exports = {
    u_router, 
}; 
