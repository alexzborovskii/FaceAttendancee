import { useState, useRef, useEffect } from "react";
import * as faceapi from "face-api.js";
import "./VideoCapture.css";
import { unDoStringify } from "../utils/parseDescriptions";
import axios from "axios";
import AlertMsg from "./Alert.js";
import dateTime from "../utils/dateTime";

const VideoCapture = () => {
    const intervalId = useRef();
    const sendIntervalId = useRef();
    const videoRef = useRef();
    const canvasRef = useRef();
    const [lastRecognized, setLastRecognized] = useState("");
    let streamVideo = "";
    let tracks = "";
    let descriptorsIntervalID = 0;

    // LOAD FROM USEEFFECT

    useEffect(() => {
        videoRef && loadModels();
        return () => {
            clearInterval(intervalId.current);
            clearInterval(sendIntervalId.current);
            clearInterval(descriptorsIntervalID);
            tracks && stopVideo();
        };
    }, []);

    // OPEN WEBCAM
    const startVideo = async () => {
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: false })
            .then((currentStream) => {
                streamVideo = currentStream;
                tracks = streamVideo.getTracks();
                videoRef.current.srcObject = currentStream;
            })
            .catch((error) => {
                console.error(error);
                tracks && stopVideo();
            });
    };

    // LOAD MODELS FROM FACE API

    const loadModels = () => {
        Promise.all([
            // LOAD THE MODELS
            faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
            faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
            faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        ])
            .then(() => {
                startVideo();
            })
            .then(() => {
                faceMyDetect();
            });
    };

    //GET DESCRIPTIONS FOR ALL USERS
    const getLabeledFaceDescriptions = async () => {
        /* Descriptors from DB */
        try {
            const res = await fetch(`/api/users/getAllDescriptors/`);
            const data = await res.json();
            const lDescriptors = data.msg;
            let newLabeledFaceDescriptors = [];

            for (let i = 0; i < lDescriptors.length; i++) {
                for (let j = 0; j < lDescriptors[i]._descriptors.length; j++) {
                    lDescriptors[i]._descriptors[j] = unDoStringify(
                        lDescriptors[i]._descriptors[j]
                    );
                }
                const newLDescriptor = new faceapi.LabeledFaceDescriptors(
                    lDescriptors[i]._label,
                    lDescriptors[i]._descriptors
                );
                newLabeledFaceDescriptors.push(newLDescriptor);
            }

            return newLabeledFaceDescriptors;
        } catch (error) {
            console.error(error);
        }
    };

    // get userNamesForDisplaying
    const getAllUserNames = async () => {
        try {
            const res = await axios.get("/api/users/usernames");
            if (res.status === 200) {
                return res.data;
            }
        } catch (error) {
            console.error(error);
        }
    };

    // RECOGNITION
    const faceMyDetect = async () => {
        try {
            let labeledFaceDescriptors = [];
            let userNames = [];
            let faceMatcher = [];
            // get descriptors at the beginning
            labeledFaceDescriptors = await getLabeledFaceDescriptions();
            userNames = await getAllUserNames();
            faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);
            // get descriptors in loop
            descriptorsIntervalID = setInterval(async () => {
                try {
                    labeledFaceDescriptors = await getLabeledFaceDescriptions();
                    userNames = await getAllUserNames();
                    faceMatcher = new faceapi.FaceMatcher(
                        labeledFaceDescriptors
                    );
                } catch (error) {
                    console.log(error);
                }
            }, 1000 * 60 * 10);

            let displaySize = { width: "0", height: "0" };
            displaySize = {
                width: videoRef.current.offsetWidth,
                height: videoRef.current.offsetHeight,
            };

            let buffer = [];
            let dataToSend = [];
            let recentlyRecognized = [];

            // RECOGNITION LOOP
            if (!canvasRef.current) return;
            const detInt = setInterval(async () => {
                // RECOGNIZE

                intervalId.current = detInt;
                canvasRef.current &&
                    faceapi.matchDimensions(canvasRef.current, displaySize);
                const detections = await faceapi
                    .detectAllFaces(videoRef.current)
                    .withFaceLandmarks()
                    .withFaceDescriptors();

                // CLEAR RECOGNITION BOX
                const resizedDetections = faceapi.resizeResults(
                    detections,
                    displaySize
                );
                canvasRef.current &&
                    canvasRef.current
                        .getContext("2d", { willReadFrequently: true })
                        .clearRect(
                            0,
                            0,
                            canvasRef.current.width,
                            canvasRef.current.height
                        );

                const results = resizedDetections.map((d) => {
                    return faceMatcher.findBestMatch(d.descriptor);
                });

                // MANAGE RESULTS
                canvasRef.current &&
                    results.forEach((result, i) => {
                        // DRAW FACE IN WEBCAM
                        // dots
                        faceapi.draw.drawFaceLandmarks(
                            canvasRef.current,
                            resizedDetections
                        );
                        // box
                        const box = resizedDetections[i].detection.box;
                        const drawBox = new faceapi.draw.DrawBox(box, {
                            label: result,
                        });
                        drawBox.draw(canvasRef.current);

                        //SAVE RECOGNITIONS
                        if (result._label !== "unknown") {
                            //get index or -1
                            const buffInd = buffer.findIndex(
                                (item) => item.label === result._label
                            );
                            //create if there isn`t
                            if (buffInd === -1) {
                                const date = dateTime(new Date());
                                const newObj = {
                                    label: result._label,
                                    time: date,
                                    recInRow: 1,
                                    notRecInRow: 0,
                                };
                                buffer.push(newObj);
                            } else {
                                //update if there is
                                buffer[buffInd].recInRow++;

                                if (buffer[buffInd].recInRow === 2) {
                                    if (
                                        !recentlyRecognized.find(
                                            (item) =>
                                                item.user_id ===
                                                buffer[buffInd].label
                                        )
                                    ) {
                                        // add to data to be sent
                                        dataToSend.push({
                                            user_id: Number(
                                                buffer[buffInd].label
                                            ),
                                            time: buffer[buffInd].time,
                                        });
                                        // add to recently recognized
                                        recentlyRecognized.push({
                                            user_id: buffer[buffInd].label,
                                            ttl: 2 * 1 * 60,
                                        }); // ttl in recognition interval

                                        //showing recognition
                                        const lastRecIndex =
                                            userNames.findIndex(
                                                (item) =>
                                                    item.user_id ===
                                                    Number(
                                                        buffer[buffInd].label
                                                    )
                                            );
                                        setLastRecognized(
                                            `${userNames[lastRecIndex]["fname"]} was recognized!`
                                        );
                                    }
                                }
                            }
                        }
                    });

                /* check buffer here */
                buffer.forEach((item, index) => {
                    const resInd = results.findIndex(
                        (result) => result._label === item.label
                    );
                    if (resInd === -1) {
                        item.notRecInRow++;
                        if (item.notRecInRow === 5) {
                            buffer.splice(index, 1);
                        }
                    }
                });

                /* update recently recognized here */
                recentlyRecognized.forEach((item, index) => {
                    item.ttl--;
                    if (item.ttl === 0) {
                        recentlyRecognized.splice(index, 1);
                    }
                });
            }, 500);

            /* SEND DATA TO DB LOOP */
            const sendDataTime = 30 * 1000;
            const sendInt = setInterval(async () => {
                sendIntervalId.current = sendInt;
                if (dataToSend.length > 0) {
                    try {
                        const res = await axios.post(
                            "/api/users/postdetection",
                            {
                                data: dataToSend,
                            }
                        );
                        if (res.status === 200) {
                            dataToSend.forEach((recognition) => {
                                const buffCleanIndex = buffer.findIndex(
                                    (item) => item.label === recognition.user_id
                                );
                                if (buffCleanIndex !== -1) {
                                    buffer.splice(buffCleanIndex, 1);
                                }
                            });
                            dataToSend = [];
                        }
                    } catch (error) {
                        console.error(error);
                    }
                }
            }, sendDataTime);
        } catch (error) {
            console.error(error);
            intervalId.current && clearInterval(intervalId.current);
            tracks && stopVideo();
        }
    };

    const stopVideo = () => {
        tracks[0].stop();
    };

    return (
        <div id="video-root">
            <div className="myapp">
                <h1>Face Detection</h1>
                <div className="appvideo">
                    <video
                        crossOrigin="anonymous"
                        ref={videoRef}
                        width="640px"
                        height="480px"
                        autoPlay></video>
                </div>
                <canvas
                    ref={canvasRef}
                    width="600"
                    height="450"
                    className="appcanvas"
                />
                <AlertMsg msg={lastRecognized} type="success" />
            </div>
        </div>
    );
};

export default VideoCapture;
