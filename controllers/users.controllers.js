const {
    _register,
    _login,
    _getUserInfo,
    _insertSample,
    _getUserSamples,
    _delUserSample,
    _getSamplesAndUser,
    _putUserInfo,
    _putDescriptors,
    _getAllDescriptors,
    _postDetection,
    _getUserStatistics,
    _getUserStatisticsTotal,
    _getAdminStatistics,
    _getAdminStatisticsTotal,
    
} = require("../models/users.model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { cloudinary } = require("../utils/cloudinary.js");
const { stringifyForEveryThing } = require("../utils/stringifyDescription.js");
//faceapi
const faceapi = require("face-api.js");
const canvas = require("canvas");
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

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
        // my secret
        const secret = process.env.ACCESS_TOKEN_SECRET;
        //token
        const accessToken = jwt.sign({ userId, email }, secret, {
            expiresIn: "60m",
        });
        //server cookies
        res.cookie("token", accessToken, {
            httpOnly: true,
            maxAge: 60 * 60 * 1000,
        });
        //resp with token and uesrId
        res.json({ token: accessToken});
    } catch (err) {
        console.log(err);
        res.status(404).json({ msg: "something went wrong" });
    }
};

const register = async (req, res) => {
    const { lname, fname, email, password } = req.body;
    const lower_email = email.toLowerCase();

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password + "", salt);
    try {
        if (!lname || !fname || !email || !password) return res.status(404).json("Some fields are empty");
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
}
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

// make a transaction?
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

        console.log("delete from cloudinary ", delResponse);
        //delete from DB
        const data = await _delUserSample({ publicid: publicID });
        console.log("delete from DB: ", data);
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
        // label = user_id
        let label = user_id+"";
        console.log("label: ", label);
        // if (samplesAndUser.length > 0) {
        //     const { fname, lname, email } = samplesAndUser[0];
        //     fname && lname ? (label = `${fname} ${lname}`) : (label = email);
        // }

        // LOAD THE WEIGHTS
        await faceapi.nets.ssdMobilenetv1.loadFromDisk("./weights");
        await faceapi.nets.faceRecognitionNet.loadFromDisk("./weights");
        await faceapi.nets.faceLandmark68Net.loadFromDisk("./weights");

        //descriptors
        const descriptions = [];
        for (let i = 0; i < samplesAndUser.length; i++) {
            try {
                const url = cloudinary.url(samplesAndUser[i].publicid);
                console.log(`image ${i}`);
                const img = await canvas.loadImage(url);
                const detections = await faceapi
                    .detectSingleFace(img)
                    .withFaceLandmarks()
                    .withFaceDescriptor();
                descriptions.push(detections.descriptor);
            } catch (error) {
                console.error(error);
            }
        }

        let typedDescriptionsJson = [];
        for (let i = 0; i < descriptions.length; i++) {
            typedDescriptionsJson.push(stringifyForEveryThing(descriptions[i]));
        }

        const labeledFaceDescriptors = {
            _label: label,
            _descriptors: typedDescriptionsJson,
        };

        // put

        const data = await _putDescriptors({
            descriptors: labeledFaceDescriptors,
            user_id,
        });

        res.json({ msg: samplesAndUser, data: data });
    } catch (error) {
        console.error(error);
    }
};

const getDescriptors = async (req, res) => {
    try {
        const user_id = req.user.userId;
        const descriptorsObj = await _getAllDescriptors({ user_id });
        const descriptors = descriptorsObj.filter(obj => obj.descriptors != null ).map((obj) =>
            JSON.parse(obj.descriptors)
        );

        res.json({ msg: descriptors });
    } catch (error) {
        console.error(error);
    }
};

const postDetection = async (req, res) => {
    try {
        const data = req.body.data;
        const fieldsToInsert = data.map(field => 
            ({ user_id: field.user_id, time: field.time })); 
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
        let { page, limit } = req.query
        if (!page) page = 0
        if (!limit) limit = 10
        page = parseInt(page)
        limit = parseInt(limit)
        //function
        const user_id = req.user.userId;
        const data = await _getUserStatistics({ user_id, perPage: limit, currentPage: page+1 });
        const totalObj = await _getUserStatisticsTotal({ user_id });
        const cleanedData = data.data.map((row) => {
            const detection_id = row.detection_id;
            const user_id = row.user_id;
            const name = `${row.fname} ${row.lname}`
            const time = row.time.toLocaleTimeString("en-US", { hour12: false });
            const date =  `${row.time.getFullYear()}-${row.time.getMonth()+1}-${row.time.getDate()}`;
            
            return {detection_id, user_id, name, date, time,  }
        })
        res.status(200).json({data: cleanedData, total: Number(totalObj[0].count)});
    } catch (error) {
        console.error(error);
        res.status(404).json({
            msg: "Something went wrong. Cant get your statistcs",
        });
    }
}
const getAdminStatistics = async (req, res) => {
    try {
        //for pagination
        let { page, limit } = req.query
        if (!page) page = 0
        if (!limit) limit = 10
        page = parseInt(page)
        limit = parseInt(limit)
        //function
        // const user_id = req.user.userId;
        const data = await _getAdminStatistics({ perPage: limit, currentPage: page+1 });
        const totalObj = await _getAdminStatisticsTotal();
        const cleanedData = data.data.map((row) => {
            const detection_id = row.detection_id;
            const user_id = row.user_id;
            const name = `${row.fname} ${row.lname}`
            const time = row.time.toLocaleTimeString("en-US", { hour12: false });
            const date =  `${row.time.getFullYear()}-${row.time.getMonth()+1}-${row.time.getDate()}`;
            
            return {detection_id, user_id, name, date, time,  }
        })
        res.status(200).json({data: cleanedData, total: Number(totalObj[0].count)});
    } catch (error) {
        console.error(error);
        res.status(404).json({
            msg: "Something went wrong. Cant get your statistcs",
        });
    }
}



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
    getAdminStatistics
};
