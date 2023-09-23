import { useRef, useEffect } from "react";
import * as faceapi from "face-api.js";
import "./VideoCapture.css";

const VideoCapture = () => {
    const videoRef = useRef();
    const canvasRef = useRef();

    // LOAD FROM USEEFFECT

    useEffect(() => {
        videoRef && loadModels();
    }, []);

    // OPEN WEBCAM
    const startVideo = () => {
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: false })
            .then((currentStream) => {
                videoRef.current.srcObject = currentStream;
            })
            .catch((error) => {
                console.error(error);
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
    function getLabeledFaceDescriptions() {
        const labels = ["Alex", "Yulia"];
        return Promise.all(
            labels.map(async (label) => {
                const descriptions = [];
                for (let i = 1; i <= 2; i++) {
                    const img = await faceapi.fetchImage(
                        `./labels/${label}/${i}.jpg`
                    );
                    const detections = await faceapi
                        .detectSingleFace(img)
                        .withFaceLandmarks()
                        .withFaceDescriptor();
                    descriptions.push(detections.descriptor);
                }
                return new faceapi.LabeledFaceDescriptors(label, descriptions);
            })
        );
    }

    // RECOGNITION
    const faceMyDetect = async () => {
        //LOADING DATA
        const labeledFaceDescriptors = await getLabeledFaceDescriptions();
        const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);

        const displaySize = {
            width: videoRef.current.offsetWidth,
            height: videoRef.current.offsetHeight,
        };

        const detInt = setInterval(async () => {
            if (!canvasRef.current ) {
                clearInterval(detInt);
            }
            canvasRef.current && faceapi.matchDimensions(canvasRef.current, displaySize);
            const detections = await faceapi
                .detectAllFaces(videoRef.current)
                .withFaceLandmarks()
                .withFaceDescriptors();

            // DRAW FACE IN WEBCAM

            const resizedDetections = faceapi.resizeResults(
                detections,
                displaySize
            );
            console.log("canvasRef.current.width: ", canvasRef.current.width || canvasRef.current );
            console.log("canvasRef.current.height: ", canvasRef.current.height || canvasRef.current );
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
    };

    return (
        <div className="myapp">
            <h1>Face Detection</h1>
            <div className="appvideo">
                <video crossOrigin="anonymous" ref={videoRef} autoPlay></video>
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
