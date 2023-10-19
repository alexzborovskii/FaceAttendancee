const {
    _register,
    _login,
    _getUserInfo,
    _insertSample,
    _getUserSamples,
    _delUserSample,
    _getSamplesAndUser,
    _putUserInfo,
    _getAllDescriptors,
    _postDetection,
    _getUserStatistics,
    _getUserStatisticsTotal,
    _getAdminStatistics,
    _getAdminStatisticsTotal,
    _getAllUserNames,
    _getPassword,
    _putPass,
    _getAdminByDayStatistics,
    _getAdminByDayStatisticsTotal,
    _getUserLabels,
    _getAdminByUserStatistics,
    _getStatisticsByDay,
    _getStatisticsTotalByDay,
    _getStatisticsByUser,
    _getStatisticsByUserAsc,
} = require("../models/users.model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { cloudinary } = require("../utils/cloudinary.js");
//faceapi
const faceapi = require("face-api.js");
const canvas = require("canvas");
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
//threading
const { fork } = require("child_process");
const { log } = require("console");

require("dotenv").config();

const login = async (req, res) => {
    try {
        const row = await _login(req.body.email.toLowerCase());
        //email
        if (row.length === 0) {
            return res.status(404).json({ msg: "Email not found" });
        }
        //password
        const match = await bcrypt.compare(
            req.body.password + "",
            row[0].password
        );
        if (!match) return res.status(404).json({ msg: "Wrong password!" });
        //successful login
        const userId = row[0].user_id;
        const email = row[0].email;
        const admin = row[0].admin
        // my secret
        const secret = process.env.ACCESS_TOKEN_SECRET;
        //token
        const accessToken = jwt.sign({ userId, email, admin }, secret, {
            expiresIn: "60m",
        });
        //server cookies
        res.cookie("token", accessToken, {
            httpOnly: true,
            maxAge: 60 * 60 * 1000,
        });
        //resp with token
        res.json({ token: accessToken });
    } catch (err) {
        console.log(err);
        res.status(404).json({ msg: "something went wrong" });
    }
};

const ChangePassword = async (req, res) => {
    try {
        const user_id = req.user.userId;
        const { password, newPassword, newPassword2 } = req.body;

        if (newPassword !== newPassword2)
            return res
                .status(404)
                .json({ ErrorMsg: "New passwords don`t match! Cant save it." });

        const row = await _getPassword({ user_id });

        if (row.length === 0) {
            return res.status(404).json({ msg: "Information not found" });
        }
        const match = await bcrypt.compare(
            req.body.password + "",
            row[0].password
        );

        if (!match)
            return res.status(401).json({ ErrorMsg: "Wrong password!" });

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword + "", salt);

        const resPassSave = await _putPass({ user_id, hash });

        resPassSave.length === 0
            ? res.status(404).json({ ErrorMsg: "Cant save your password" })
            : res.status(200).json({ msg: "New password saved successfully" });
    } catch (error) {
        console.log(error);
    }
};

const register = async (req, res) => {
    const { lname, fname, email, password } = req.body;
    const lower_email = email.toLowerCase();

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password + "", salt);
    try {
        if (!lname || !fname || !email || !password)
            return res.status(404).json("Some fields are empty");
        const row = await _register(lname, fname, lower_email, hash);
        res.json(row);
    } catch (error) {
        console.log(error);
        res.status(404).json({ msg: error.message });
    }
};

const logout = async (req, res) => {
    res.clearCookie("token");
    req.user = null;
    res.sendStatus(200);
};
const getUserInfo = async (req, res) => {
    const id = req.user.userId;
    const user = await _getUserInfo(id);
    if (!user) return res.status(404).json({ msg: "User not found" });
    const userArr = Object.keys(user[0]);
    userArr.forEach((key) => {
        if (user[0][key] === null) {
            user[0][key] = "";
        }
    });
    res.status(200).json(user);
};

const putUserInfo = async (req, res) => {
    try {
        const user_id = req.user.userId;
        const data = await _putUserInfo({ ...req.body, user_id });
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(404).json({
            msg: "Something went wrong. Your info is not updated",
        });
    }
};

const getUserSamples = async (req, res) => {
    try {
        const user_id = req.user.userId;
        const samples = await _getUserSamples({ user_id });
        res.json({ msg: samples });
    } catch (error) {
        console.error(error);
    }
};

const uploadImage = async (req, res) => {
    try {
        //send to cloudinary
        const fileStr = req.body.data;
        const uploadResponse = await cloudinary.uploader.upload(fileStr, {
            upload_preset: "",
        });
        // post publickID to DB.samples
        const userId = req.user.userId;
        const publicID = uploadResponse.public_id;
        const data = await _insertSample({
            user_id: userId,
            publicid: publicID,
        });
        // get all publicIDs of the user
        const samples = await _getUserSamples({ user_id: userId });

        res.json({ msg: samples });
    } catch (err) {
        console.error(err);
        res.status(500).json({ err: "Something went wrong" });
    }
};

const delSample = async (req, res) => {
    const { publicID } = req.params;
    try {
        const delResponse = await cloudinary.uploader.destroy(
            publicID,
            function (error, result) {
                console.log(result, error);
            }
        );

        //delete from DB
        const data = await _delUserSample({ publicid: publicID });
        res.json(data);
    } catch (error) {
        console.log(error);
        res.status(404).json({ msg: error.message });
    }
};

const putDescriptors = async (req, res) => {
    try {
        // get samples and user info
        const user_id = req.user.userId;
        const samplesAndUser = await _getSamplesAndUser({ user_id });

        // GET LABELED DESCRIPTORS

        // label
        let label = user_id + "";

        // use child process for descriptors generation and saving
        const childProcess = fork("./utils/create_detections.js");
        childProcess.send({ samplesAndUser, label });
        childProcess.on("message", (message) =>
            res.json({ data: "Generated successfully" })
        );
    } catch (error) {
        console.error(error);
    }
};

const getDescriptors = async (req, res) => {
    try {
        const user_id = req.user.userId;
        const descriptorsObj = await _getAllDescriptors({ user_id });
        const descriptors = descriptorsObj
            .filter((obj) => obj.descriptors != null)
            .map((obj) => JSON.parse(obj.descriptors));

        res.json({ msg: descriptors });
    } catch (error) {
        console.error(error);
    }
};

const postDetection = async (req, res) => {
    try {
        const data = req.body.data;
        const fieldsToInsert = data.map((field) => ({
            user_id: field.user_id,
            time: field.time,
        }));
        const DBres = await _postDetection(fieldsToInsert);
        console.log("Data saved to DB: ", DBres);

        res.status(200).json({ msg: `Detection ${req.body} saved` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ err: "Something went wrong" });
    }
};

const getUserStatistics = async (req, res) => {
    try {
        //for pagination
        let { page, limit } = req.query;
        if (!page) page = 0;
        if (!limit) limit = 10;
        page = parseInt(page);
        limit = parseInt(limit);
        //function
        const user_id = req.user.userId;
        const data = await _getUserStatistics({
            user_id,
            perPage: limit,
            currentPage: page + 1,
        });
        const totalObj = await _getUserStatisticsTotal({ user_id });
        const cleanedData = data.data.map((row) => {
            const detection_id = row.detection_id;
            const user_id = row.user_id;
            const name = `${row.fname} ${row.lname}`;
            const time = row.time.toLocaleTimeString("en-Gb", {
                hour12: false,
                timeZone: "UTC",
            });
            const date = `${row.time.getFullYear()}-${
                row.time.getMonth("en-Gb", {
                    hour12: false,
                    timeZone: "UTC",
                }) + 1
            }-${row.time.getDate("en-Gb", {
                hour12: false,
                timeZone: "UTC",
            })}`;

            return { detection_id, user_id, name, date, time };
        });
        res.status(200).json({
            data: cleanedData,
            total: Number(totalObj[0].count),
        });
    } catch (error) {
        console.error(error);
        res.status(404).json({
            msg: "Something went wrong. Cant get your statistcs",
        });
    }
};
const getAdminStatistics = async (req, res) => {
    try {
        //for pagination
        let { page, limit } = req.query;
        if (!page) page = 0;
        if (!limit) limit = 10;
        page = parseInt(page);
        limit = parseInt(limit);
        //function
        // const user_id = req.user.userId;
        const data = await _getAdminStatistics({
            perPage: limit,
            currentPage: page + 1,
        });

        const totalObj = await _getAdminStatisticsTotal();
        const cleanedData = data.data.map((row) => {
            const detection_id = row.detection_id;
            const user_id = row.user_id;
            const name = `${row.fname} ${row.lname}`;
            const time = row.time.toLocaleTimeString("en-Gb", {
                hour12: false,
                timeZone: "UTC",
            });
            const date = `${row.time.getFullYear()}-${
                row.time.getMonth("en-Gb", {
                    hour12: false,
                    timeZone: "UTC",
                }) + 1
            }-${row.time.getDate("en-Gb", {
                hour12: false,
                timeZone: "UTC",
            })}`;

            return { detection_id, user_id, name, date, time };
        });
        res.status(200).json({
            data: cleanedData,
            total: Number(totalObj[0].count),
        });
    } catch (error) {
        console.error(error);
        res.status(404).json({
            msg: "Something went wrong. Cant get your statistcs",
        });
    }
};

const getUserNames = async (req, res) => {
    try {
        const users = await _getAllUserNames();
        res.json(users);
    } catch (error) {
        console.error(error);
    }
};

const getUserLabels = async (req, res) => {
    try {
        const users = await _getUserLabels();
        const labels = users.map((user) => {
            return {
                fullName: `${user.lname} ${user.fname}`,
                value: user.user_id,
            };
        });
        res.json(labels);
    } catch (error) {
        console.error(error);
    }
};

const getAdminByDayStatistics = async (req, res) => {
    try {
        //get data
        let { date } = req.query;
        const data = await _getAdminByDayStatistics({
            date,
        });
        // get amount of rows
        const totalObj = await _getAdminByDayStatisticsTotal({ date });

        // clean and structure the data
        let statisticsByDay = [];
        let rowIndex = 1;
        data.forEach((row) => {
            const index = statisticsByDay.findIndex(
                (item) => row.user_id === item.user_id
            );
            let newRow = {};

            const time = row.time.toLocaleTimeString("en-Gb", {
                hour12: false,
                timeZone: "UTC",
            });
            const date = row.time.toISOString().substring(0, 10);

            if (index === -1) {
                newRow.index = rowIndex;
                newRow.first_time = time;
                newRow.last_time = time;
                newRow.date = date;
                newRow.name = `${row.fname} ${row.lname}`;
                newRow.user_id = row.user_id;
                statisticsByDay.push(newRow);
                rowIndex++;
            } else {
                if (statisticsByDay[index].last_time < time) {
                    statisticsByDay[index].last_time = time;
                }
                if (statisticsByDay[index].first_time > time) {
                    statisticsByDay[index].first_time = time;
                }
            }
        });

        res.status(200).json({
            data: statisticsByDay,
            total: Number(totalObj[0].count),
        });
    } catch (error) {
        console.error(error);
        res.status(404).json({
            msg: "Something went wrong. Cant get statistcs by day",
        });
    }
};

const getAdminByUserStatistics = async (req, res) => {
    try {
        //create date borders
        const month_year = req.query.monthYear;
        const endOfTheMonth = new Date(
            month_year.substring(0, 11) + "23:59:59.000Z"
        );

        const currDate = new Date(month_year);
        let firstDay = new Date(currDate.getFullYear(), currDate.getMonth(), 2);
        let lastDay = new Date(
            endOfTheMonth.getFullYear(),
            endOfTheMonth.getMonth() + 1,
            0
        );
        const start = firstDay.toISOString().substring(0, 11) + "00:00:00.000Z";
        const end = lastDay.toISOString().substring(0, 11) + "23:59:59.999Z";
        //get data
        const user_id = req.query.userId;
        const data = await _getAdminByUserStatistics({
            user_id,
            start,
            end,
        });

        // clean and structure the data
        let statisticsByUser = [];
        let rowIndex = 1;
        data.forEach((row) => {
            let newRow = {};

            const time = row.time.toLocaleTimeString("en-Gb", {
                hour12: false,
                timeZone: "UTC",
            });
            const date = row.time.toISOString().substring(0, 10);

            const index = statisticsByUser.findIndex(
                (item) => date === item.date
            );

            if (index === -1) {
                newRow.index = rowIndex;
                newRow.first_time = time;
                newRow.last_time = time;
                newRow.date = date;
                newRow.name = `${row.fname} ${row.lname}`;
                newRow.user_id = row.user_id;
                statisticsByUser.push(newRow);
                rowIndex++;
            } else {
                if (statisticsByUser[index].last_time < time) {
                    statisticsByUser[index].last_time = time;
                }
                if (statisticsByUser[index].first_time > time) {
                    statisticsByUser[index].first_time = time;
                }
            }
        });

        res.status(200).json({
            data: statisticsByUser,
            total: statisticsByUser.length,
        });
    } catch (error) {
        console.error(error);
        res.status(404).json({
            msg: "Something went wrong. Cant get statistcs by day",
        });
    }
};

const getStatisticsByDay = async (req, res) => {
    try {
        const user_id = req.user.userId;
        //get data
        let { date } = req.query;
        const data = await _getStatisticsByDay({
            user_id,
            date,
        });
        // get amount of rows
        const totalObj = await _getStatisticsTotalByDay({ date, user_id });

        // clean and structure the data
        let statisticsByDay = [];
        let rowIndex = 1;
        data.forEach((row) => {
            const index = statisticsByDay.findIndex(
                (item) => row.user_id === item.user_id
            );
            let newRow = {};

            const time = row.time.toLocaleTimeString("en-Gb", {
                hour12: false,
                timeZone: "UTC",
            });
            const date = row.time.toISOString().substring(0, 10);

            if (index === -1) {
                newRow.index = rowIndex;
                newRow.first_time = time;
                newRow.last_time = time;
                newRow.date = date;
                newRow.name = `${row.fname} ${row.lname}`;
                newRow.user_id = row.user_id;
                statisticsByDay.push(newRow);
                rowIndex++;
            } else {
                if (statisticsByDay[index].last_time < time) {
                    statisticsByDay[index].last_time = time;
                }
                if (statisticsByDay[index].first_time > time) {
                    statisticsByDay[index].first_time = time;
                }
            }
        });

        res.status(200).json({
            data: statisticsByDay,
            total: Number(totalObj[0].count),
        });
    } catch (error) {
        console.error(error);
        res.status(404).json({
            msg: "Something went wrong. Cant get statistcs by day",
        });
    }
};

const getStatisticsByUser = async (req, res) => {
    try {
        const user_id = req.user.userId;
        //create date borders
        const month_year = req.query.monthYear;
        const endOfTheMonth = new Date(
            month_year.substring(0, 11) + "23:59:59.000Z"
        );

        const currDate = new Date(month_year);
        let firstDay = new Date(currDate.getFullYear(), currDate.getMonth(), 2);
        let lastDay = new Date(
            endOfTheMonth.getFullYear(),
            endOfTheMonth.getMonth() + 1,
            0
        );
        const start = firstDay.toISOString().substring(0, 11) + "00:00:00.000Z";
        const end = lastDay.toISOString().substring(0, 11) + "23:59:59.999Z";
        //get data
        const data = await _getStatisticsByUser({
            user_id,
            start,
            end,
        });

        // clean and structure the data
        let statisticsByUser = [];
        let rowIndex = 1;
        data.forEach((row) => {
            let newRow = {};

            const time = row.time.toLocaleTimeString("en-Gb", {
                hour12: false,
                timeZone: "UTC",
            });
            const date = row.time.toISOString().substring(0, 10);

            const index = statisticsByUser.findIndex(
                (item) => date === item.date
            );

            if (index === -1) {
                newRow.index = rowIndex;
                newRow.first_time = time;
                newRow.last_time = time;
                newRow.date = date;
                newRow.name = `${row.fname} ${row.lname}`;
                newRow.user_id = row.user_id;
                statisticsByUser.push(newRow);
                rowIndex++;
            } else {
                if (statisticsByUser[index].last_time < time) {
                    statisticsByUser[index].last_time = time;
                }
                if (statisticsByUser[index].first_time > time) {
                    statisticsByUser[index].first_time = time;
                }
            }
        });

        res.status(200).json({
            data: statisticsByUser,
            total: statisticsByUser.length,
        });
    } catch (error) {
        console.error(error);
        res.status(404).json({
            msg: "Something went wrong. Cant get statistcs by day",
        });
    }
};

const getLineData = async (req, res) => {
    try {
        const user_id = req.user.userId;
        //create date borders
        const month_year = req.query.monthYear;
        const endOfTheMonth = new Date(
            month_year.substring(0, 11) + "23:59:59.000Z"
        );

        const currDate = new Date(month_year);
        let firstDay = new Date(currDate.getFullYear(), currDate.getMonth(), 2);
        let lastDay = new Date(
            endOfTheMonth.getFullYear(),
            endOfTheMonth.getMonth() + 1,
            0
        );
        const start = firstDay.toISOString().substring(0, 11) + "00:00:00.000Z";
        const end = lastDay.toISOString().substring(0, 11) + "23:59:59.999Z";
        //get data
        const data = await _getStatisticsByUserAsc({
            user_id,
            start,
            end,
        });
        // clean and structure the data
        let statisticsByUser = [];
        let rowIndex = 1;
        data.forEach((row) => {
            let newRow = {};

            const time = row.time.toLocaleTimeString("en-Gb", {
                hour12: false,
                timeZone: "UTC",
            });
            const date = row.time.toISOString().substring(0, 10);

            const index = statisticsByUser.findIndex(
                (item) => date === item.date
            );

            if (index === -1) {
                newRow.index = rowIndex;
                newRow.first_time = time;
                newRow.last_time = time;
                newRow.date = date;
                newRow.name = `${row.fname} ${row.lname}`;
                newRow.user_id = row.user_id;
                statisticsByUser.push(newRow);
                rowIndex++;
            } else {
                if (statisticsByUser[index].last_time < time) {
                    statisticsByUser[index].last_time = time;
                }
                if (statisticsByUser[index].first_time > time) {
                    statisticsByUser[index].first_time = time;
                }
            }
        });

        const firstTime = statisticsByUser.map((date) =>
            new Date("Wed, 18 Oct 2023 " + date.first_time + "Z").getTime()
        );
        const lastTime = statisticsByUser.map((date) =>
            new Date("Wed, 18 Oct 2023 " + date.last_time + "Z").getTime()
        );
        const officialStart = Array(firstTime.length).fill(
            new Date("Wed, 18 Oct 2023 " + "9:00:00" + "Z").getTime()
        );
        const officialEnd = Array(firstTime.length).fill(
            new Date("Wed, 18 Oct 2023 " + "18:00:00" + "Z").getTime()
        );

        const dates = statisticsByUser.map((date) =>
            date.date.substring(8, 11)
        );

        res.status(200).json({
            data: { firstTime, lastTime, dates, officialStart, officialEnd },
            total: statisticsByUser.length,
        });
    } catch (error) {
        console.error(error);
        res.status(404).json({
            msg: "Something went wrong. Cant get statistcs by day",
        });
    }
};

const getTimeSpentData = async (req, res) => {
    try {
        const user_id = req.user.userId;
        //create date borders
        const month_year = req.query.monthYear;
        const endOfTheMonth = new Date(
            month_year.substring(0, 11) + "23:59:59.000Z"
        );

        const currDate = new Date(month_year);
        let firstDay = new Date(currDate.getFullYear(), currDate.getMonth(), 2);
        let lastDay = new Date(
            endOfTheMonth.getFullYear(),
            endOfTheMonth.getMonth() + 1,
            0
        );
        const start = firstDay.toISOString().substring(0, 11) + "00:00:00.000Z";
        const end = lastDay.toISOString().substring(0, 11) + "23:59:59.999Z";
        //get data
        const data = await _getStatisticsByUser({
            user_id,
            start,
            end,
        });
        // clean and structure the data
        let statisticsByUser = [];
        let rowIndex = 1;
        data.forEach((row) => {
            let newRow = {};

            const time = row.time.toLocaleTimeString("en-Gb", {
                hour12: false,
                timeZone: "UTC",
            });
            const date = row.time.toISOString().substring(0, 10);

            const index = statisticsByUser.findIndex(
                (item) => date === item.date
            );

            if (index === -1) {
                newRow.index = rowIndex;
                newRow.first_time = row.time;
                newRow.last_time = row.time;
                newRow.date = date;
                newRow.name = `${row.fname} ${row.lname}`;
                newRow.user_id = row.user_id;
                statisticsByUser.push(newRow);
                rowIndex++;
            } else {
                if (statisticsByUser[index].last_time < row.time) {
                    statisticsByUser[index].last_time = row.time;
                }
                if (statisticsByUser[index].first_time > row.time) {
                    statisticsByUser[index].first_time = row.time;
                }
            }
        });
        const timeValue = statisticsByUser.map((date) =>
            Math.floor(
                (new Date(date.last_time).getTime() -
                    new Date(date.first_time).getTime()) /
                    (1000 * 60)
            )
        );
        const dates = statisticsByUser.map((date) =>
            date.date.substring(8, 11)
        );

        res.status(200).json({
            data: { timeValue, dates },
            total: statisticsByUser.length,
        });
    } catch (error) {
        console.error(error);
        res.status(404).json({
            msg: "Something went wrong. Cant get statistcs by day",
        });
    }
};

const getAdminLineData = async (req, res) => {
    try {
        const user_id = req.query.userId;
        //create date borders
        const month_year = req.query.monthYear;
        const endOfTheMonth = new Date(
            month_year.substring(0, 11) + "23:59:59.000Z"
        );

        const currDate = new Date(month_year);
        let firstDay = new Date(currDate.getFullYear(), currDate.getMonth(), 2);
        let lastDay = new Date(
            endOfTheMonth.getFullYear(),
            endOfTheMonth.getMonth() + 1,
            0
        );
        const start = firstDay.toISOString().substring(0, 11) + "00:00:00.000Z";
        const end = lastDay.toISOString().substring(0, 11) + "23:59:59.999Z";
        //get data
        const data = await _getStatisticsByUserAsc({
            user_id,
            start,
            end,
        });
        // clean and structure the data
        let statisticsByUser = [];
        let rowIndex = 1;
        data.forEach((row) => {
            let newRow = {};

            const time = row.time.toLocaleTimeString("en-Gb", {
                hour12: false,
                timeZone: "UTC",
            });
            const date = row.time.toISOString().substring(0, 10);

            const index = statisticsByUser.findIndex(
                (item) => date === item.date
            );

            if (index === -1) {
                newRow.index = rowIndex;
                newRow.first_time = time;
                newRow.last_time = time;
                newRow.date = date;
                newRow.name = `${row.fname} ${row.lname}`;
                newRow.user_id = row.user_id;
                statisticsByUser.push(newRow);
                rowIndex++;
            } else {
                if (statisticsByUser[index].last_time < time) {
                    statisticsByUser[index].last_time = time;
                }
                if (statisticsByUser[index].first_time > time) {
                    statisticsByUser[index].first_time = time;
                }
            }
        });

        const firstTime = statisticsByUser.map((date) =>
            new Date("Wed, 18 Oct 2023 " + date.first_time + "Z").getTime()
        );
        const lastTime = statisticsByUser.map((date) =>
            new Date("Wed, 18 Oct 2023 " + date.last_time + "Z").getTime()
        );
        const officialStart = Array(firstTime.length).fill(
            new Date("Wed, 18 Oct 2023 " + "9:00:00" + "Z").getTime()
        );
        const officialEnd = Array(firstTime.length).fill(
            new Date("Wed, 18 Oct 2023 " + "18:00:00" + "Z").getTime()
        );

        const dates = statisticsByUser.map((date) =>
            date.date.substring(8, 11)
        );

        res.status(200).json({
            data: { firstTime, lastTime, dates, officialStart, officialEnd,  },
            total: statisticsByUser.length,
        });
    } catch (error) {
        console.error(error);
        res.status(404).json({
            msg: "Something went wrong. Cant get statistcs by day",
        });
    }
};

const getAdminTimeSpentData = async (req, res) => {
    try {
        const user_id = req.query.userId;
        //create date borders
        const month_year = req.query.monthYear;
        const endOfTheMonth = new Date(
            month_year.substring(0, 11) + "23:59:59.000Z"
        );

        const currDate = new Date(month_year);
        let firstDay = new Date(currDate.getFullYear(), currDate.getMonth(), 2);
        let lastDay = new Date(
            endOfTheMonth.getFullYear(),
            endOfTheMonth.getMonth() + 1,
            0
        );
        const start = firstDay.toISOString().substring(0, 11) + "00:00:00.000Z";
        const end = lastDay.toISOString().substring(0, 11) + "23:59:59.999Z";
        //get data
        const data = await _getStatisticsByUser({
            user_id,
            start,
            end,
        });
        // clean and structure the data
        let statisticsByUser = [];
        let rowIndex = 1;
        data.forEach((row) => {
            let newRow = {};

            const time = row.time.toLocaleTimeString("en-Gb", {
                hour12: false,
                timeZone: "UTC",
            });
            const date = row.time.toISOString().substring(0, 10);

            const index = statisticsByUser.findIndex(
                (item) => date === item.date
            );

            if (index === -1) {
                newRow.index = rowIndex;
                newRow.first_time = row.time;
                newRow.last_time = row.time;
                newRow.date = date;
                newRow.name = `${row.fname} ${row.lname}`;
                newRow.user_id = row.user_id;
                statisticsByUser.push(newRow);
                rowIndex++;
            } else {
                if (statisticsByUser[index].last_time < row.time) {
                    statisticsByUser[index].last_time = row.time;
                }
                if (statisticsByUser[index].first_time > row.time) {
                    statisticsByUser[index].first_time = row.time;
                }
            }
        });
        const timeValue = statisticsByUser.map((date) =>
            Math.floor(
                (new Date(date.last_time).getTime() -
                    new Date(date.first_time).getTime()) /
                    (1000 * 60)
            )
        );
        const dates = statisticsByUser.map((date) =>
            date.date.substring(8, 11)
        );

        res.status(200).json({
            data: { timeValue, dates },
            total: statisticsByUser.length,
        });
    } catch (error) {
        console.error(error);
        res.status(404).json({
            msg: "Something went wrong. Cant get statistcs by day",
        });
    }
};

module.exports = {
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
    getTimeSpentData,
    getAdminLineData,
    getAdminTimeSpentData,
};
