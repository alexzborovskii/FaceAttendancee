const {
    _register,
    _login,
    _getUserInfo,
    _insertSample,
    _getUserSamples,
    _delUserSample,
    _getSamplesAndUser,
    _putUserInfo,
} = require("../models/users.model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { cloudinary } = require("../utils/cloudinary.js");

// face api node
// face api node
// face api node
// require('@tensorflow/tfjs-node');

const faceapi = require("face-api.js");
const canvas = require("canvas");
// const { log } = require("@tensorflow/tfjs-node"); 

// patch nodejs environment, we need to provide an implementation of
// HTMLCanvasElement and HTMLImageElement
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// face api node
// face api node
// face api node

require("dotenv").config();

const login = async (req, res) => {
    try {
        const row = await _login(req.body.email.toLowerCase());
        //email
        if (row.length === 0) {
            return res.status(404).json({ msg: "email not found" });
        }
        //password
        const match = await bcrypt.compare(
            req.body.password + "",
            row[0].password
        );
        if (!match) return res.status(404).json({ msg: "wrong password" });
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
        res.json({ token: accessToken, userId });
    } catch (err) {
        console.log(err);
        res.status(404).json({ msg: "something went wrong" });
    }
};

const register = async (req, res) => {
    const { email, password } = req.body;
    const lower_email = email.toLowerCase();

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password + "", salt);

    try {
        const row = await _register(lower_email, hash);
        res.json(row);
    } catch (error) {
        console.log(error);
        res.status(404).json({ msg: error.message });
    }
};

const getUserInfo = async (req, res) => {
    const id = req.params.id;
    const user = await _getUserInfo(id);
    if (!user) return res.sendStatus(404); //.json({ msg: "Product not found" });
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
            const user_id  = req.params.id; 
            const data = await _putUserInfo({...req.body, user_id});
            res.status(200).json(data);
        } catch (error) {
            console.error(error);
            res.status(404).json({ msg: "Something went wrong. Your info is not updated" }); 
        }
}

const getUserSamples = async (req, res) => {
    try {
        const user_id = req.params.id;
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
        const userId = req.body.userId;
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
        //delete from cloudinary
        // const uploadResponse = await cloudinary.uploader.upload(fileStr, {
        //     upload_preset: "",
        // });

        const delResponse = await cloudinary.uploader.destroy(
            publicID,
            function (error, result) {
                console.log(result, error);
            }
        );

        console.log("delResponse: ", delResponse);

        //delete from DB
        console.log("publicID: ", publicID);
        const data = await _delUserSample({ publicid: publicID });
        console.log("data: ", data);
        res.json(data);
    } catch (error) {
        console.log(error);
        res.status(404).json({ msg: error.message });
    }
};

/***************************
CURRENT - CREATE DESCRIPTORS
***************************/
const putDescriptors = async (req, res) => {
    try {
        // get samples and user info
        const user_id = req.params.id;
        const samplesAndUser = await _getSamplesAndUser({ user_id });
        console.log("samplesAndUser: ", samplesAndUser); // array of objects

        // get labled descriptors

        // label
        let label = "";
        if (samplesAndUser.length > 0) {
            const { fname, lname, email } = samplesAndUser[0];
            console.log("EMAIL AFTER DESCTRUCTURING: ", email);
            fname && lname ? (label = `${fname} ${lname}`) : (label = email);
            console.log("label", label);
        }

        // LOAD THE WEIGHTS
        await faceapi.nets.ssdMobilenetv1.loadFromDisk("./weights");
        await faceapi.nets.faceRecognitionNet.loadFromDisk("./weights");
        await faceapi.nets.faceLandmark68Net.loadFromDisk("./weights");

        //descriptors
        const descriptions = [];
        for (let i = 0; i < samplesAndUser.length; i++) {
            const url = cloudinary.url(samplesAndUser[i].publicid);
            console.log("URL", url);
            console.log("11111111");
            const img = await canvas.loadImage(url);
            console.log("222222222222");
            const detections = await faceapi
                .detectSingleFace(img)
                .withFaceLandmarks()
                .withFaceDescriptor();
            console.log("333333");
            descriptions.push(detections.descriptor);
        }
        console.log("descriptions: ", descriptions);
        const labeledFaceDescriptors = new faceapi.LabeledFaceDescriptors(
            label,
            descriptions
        );
        console.log("labeledFaceDescriptors: ", labeledFaceDescriptors);
        // put
        /* put descriptors into DB here*/
        res.json({ msg: samplesAndUser });
    } catch (error) {
        console.error(error);
    }
};

module.exports = {
    register,
    login,
    getUserInfo,
    // postSample,
    uploadImage,
    getUserSamples,
    delSample,
    putDescriptors,
    putUserInfo,
};
