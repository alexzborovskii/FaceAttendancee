import { useState, useRef, useEffect } from "react";
import * as faceapi from "face-api.js";
import "./VideoCapture.css";
import { unDoStringify } from "../utils/parseDescriptions";

const VideoCapture = () => {
    const intervalId = useRef();
    const videoRef = useRef();
    const canvasRef = useRef();
    let streamVideo = "";
    let tracks = "";

    // LOAD FROM USEEFFECT

    useEffect(() => {
        videoRef && loadModels();
        return () => {
            clearInterval(intervalId.current);
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

    // RECOGNITION
    const faceMyDetect = async () => {
        try {
            const labeledFaceDescriptors = await getLabeledFaceDescriptions();

            const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);
            let displaySize = { width: "0", height: "0" };
            displaySize = {
                width: videoRef.current.offsetWidth,
                height: videoRef.current.offsetHeight,
            };

            const detInt = setInterval(async () => {
                intervalId.current = detInt;
                canvasRef.current &&
                    faceapi.matchDimensions(canvasRef.current, displaySize);
                const detections = await faceapi
                    .detectAllFaces(videoRef.current)
                    .withFaceLandmarks()
                    .withFaceDescriptors();

                // DRAW FACE IN WEBCAM
                const resizedDetections = faceapi.resizeResults(
                    detections,
                    displaySize
                );
                canvasRef.current &&
                    canvasRef.current
                        .getContext("2d")
                        .clearRect(
                            0,
                            0,
                            canvasRef.current.width,
                            canvasRef.current.height
                        );

                const results = resizedDetections.map((d) => {
                    return faceMatcher.findBestMatch(d.descriptor);
                });
                console.log("RESULTS", results);
                canvasRef.current &&
                    results.forEach((result, i) => {
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
                    });
            }, 1000);
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
        </div>
    );
};

export default VideoCapture;
