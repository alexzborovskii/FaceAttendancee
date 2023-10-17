const {
    register,
    login,
    logout,
    getUserInfo,
    uploadImage,
    getUserSamples,
    delSample,
    putDescriptors,
    putUserInfo,
    getDescriptors,
    postDetection,
    getUserStatistics,
    getAdminStatistics,
    getUserNames,
    ChangePassword,
    getAdminByDayStatistics,
    getUserLabels,
    getAdminByUserStatistics,
    getStatisticsByDay,
    getStatisticsByUser,
    getLineData,
} = require("../controllers/users.controllers.js");
const express = require("express");
const u_router = express.Router();
const {verifyToken} = require('../middlewares/verify.token.js');


u_router.get("/verify", verifyToken, (req, res) => {
    res.sendStatus(200); 
});

u_router.post("/register", register);
u_router.post("/login", login);
u_router.get("/logout", logout); 
u_router.get("/userinfo/", verifyToken, getUserInfo);
u_router.put("/updateUserInfo/", verifyToken, putUserInfo);
u_router.post("/upload", verifyToken, uploadImage);
u_router.get("/userSamples/", verifyToken, getUserSamples);
u_router.delete("/deleteSample/:publicID", verifyToken, delSample);
u_router.get("/putdescripters/",verifyToken, putDescriptors);
u_router.get("/getAllDescriptors/", verifyToken, getDescriptors);
u_router.post("/postdetection/", postDetection);
u_router.get("/getUserStatistics/", verifyToken, getUserStatistics);
u_router.get("/getAdminStatistics/", verifyToken, getAdminStatistics);
u_router.get("/usernames/", verifyToken, getUserNames) 
u_router.get("/userLabels/", verifyToken, getUserLabels) 
u_router.put("/changePassword/", verifyToken, ChangePassword)
u_router.get("/AdminByDayStatistics/", verifyToken, getAdminByDayStatistics) 
u_router.get("/AdminByUserStatistics/", verifyToken, getAdminByUserStatistics) 
u_router.get("/StatisticsByDay/", verifyToken, getStatisticsByDay) 
u_router.get("/StatisticsByUser/", verifyToken, getStatisticsByUser) 
u_router.get("/LineData/", verifyToken, getLineData) 


module.exports = {
    u_router, 
}; 
