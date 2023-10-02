const { cloudinary } = require("../utils/cloudinary.js");
const { _putDescriptors } = require("../models/users.model.js");
const { stringifyForEveryThing } = require("../utils/stringifyDescription.js");

//import for faceapi
const faceapi = require("face-api.js");
const canvas = require("canvas");
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

process.on("message", async (message) => {
    const samplesAndUser = message.samplesAndUser;
    const label = message.label;
    const data = await createLabeledFaceDescriptors(samplesAndUser, label);
    process.send(data);
    process.exit();
});

const createLabeledFaceDescriptors = async (samplesAndUser, label) => {
    // load weights
    await faceapi.nets.ssdMobilenetv1.loadFromDisk("./weights");
    await faceapi.nets.faceRecognitionNet.loadFromDisk("./weights");
    await faceapi.nets.faceLandmark68Net.loadFromDisk("./weights");

    //descriptors
    const descriptions = [];
    for (let i = 0; i < samplesAndUser.length; i++) {
        try {
            const url = cloudinary.url(samplesAndUser[i].publicid);
            const img = await canvas.loadImage(url);
            console.log(`image ${i}`);
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

    // put to DB
    const data = await _putDescriptors({
        descriptors: labeledFaceDescriptors,
        user_id: label,
    });

    return data;
};
