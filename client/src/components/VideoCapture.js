import { useRef, useEffect } from "react";
import * as faceapi from "face-api.js";
import "./VideoCapture.css";

const VideoCapture = () => {
    const videoRef = useRef();
    const canvasRef = useRef();

    // LOAD FROM USEEFFECT

    useEffect(() => {
        console.log("USEEFFECT BEFORE MODELS");
        videoRef && loadModels();
        // console.log("USEEFFECT AFTER MODELS")
        // startVideo();
        // console.log("USEEFFECT AFTER VIDEO")
        // faceMyDetect();
        // console.log("USEEFFECT AFTER DETECTION")
    }, []);

    // OPEN FACE WEBCAM
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
        console.log("BEFORE MODELS DOWNLOADED INSIDE MODELS");
        Promise.all([
            // THIS FOR FACE DETECT AND LOAD FROM YOU PUBLIC/MODELS DIRECTORY
            faceapi.nets.faceExpressionNet.loadFromUri("/weights"),

            faceapi.nets.ssdMobilenetv1.loadFromUri("/weights"), //("../../public/weights")
            faceapi.nets.faceRecognitionNet.loadFromUri("/weights"),
            faceapi.nets.faceLandmark68Net.loadFromUri("/weights"),
        ])
            .then(() => {
                console.log("AFTER MODELS DOWNLOADED INSIDE MODELS");
                // faceMyDetect();
                console.log("BEFORE STARTING VIDEO INSIDE MODELS");
                startVideo();
                console.log("AFTER STARTING VIDEO INSODE MODELS");
            })
            .then(() => {
                console.log("BEFORE FACE DETECTION INSIDE MODELS");
                faceMyDetect();
                console.log("AFTER FACE DETECTION INSIDE MODELS");
            });
    };

    function getLabeledFaceDescriptions() {
        const labels = ["Alex"];
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

    const faceMyDetect = async () => {
        //LOADING DATA

        const labeledFaceDescriptors = await getLabeledFaceDescriptions();
        const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);
        console.log("videoRef.current=>", videoRef.current);
        const displaySize = {
            width: videoRef.current.offsetWidth,
            height: videoRef.current.offsetHeight,
        };
        faceapi.matchDimensions(canvasRef.current, displaySize);

        setInterval(async () => {


            const detections = await faceapi
                .detectAllFaces(
                    videoRef.current,
                )
                .withFaceLandmarks()
                .withFaceDescriptors();

            // DRAW FACE IN WEBCAM

            const resizedDetections = faceapi.resizeResults(
                detections,
                displaySize
            );

            canvasRef.current
                .getContext("2d")
                .clearRect(
                    0,
                    0,
                    canvasRef.current.twidth,
                    canvasRef.current.height
                );

            const results = resizedDetections.map((d) => {
                return faceMatcher.findBestMatch(d.descriptor);
            });
            console.log("RESULTS", results)
            results.forEach((result, i) => {
                const box = resizedDetections[i].detection.box;
                const drawBox = new faceapi.draw.DrawBox(box, {
                    label: result,
                });
                drawBox.draw(canvasRef.current);
            });
        }, 500);
    };

    return (
        <div className="myapp">
            <h1>Face Detection</h1>
            <div className="appvide">
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
