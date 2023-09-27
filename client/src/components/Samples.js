import React, { useState, useContext, useEffect } from "react";
import Alert from "./Alert";
import { Button } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteForever from "@mui/icons-material/DeleteForever";
import SendIcon from "@mui/icons-material/Send";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { AppContext } from "../App.js";
import { Image } from "cloudinary-react";

const Samples = (props) => {
    const [fileInputState, setFileInputState] = useState("");
    const [previewSource, setPreviewSource] = useState("");
    const [selectedFile, setSelectedFile] = useState();
    const [successMsg, setSuccessMsg] = useState("");
    const [errMsg, setErrMsg] = useState("");
    const [publicIDs, setPublicIDs] = useState([]);

    const { userId } = useContext(AppContext);

    useEffect(() => {
        getUserSamples();
    }, []);

    const getUserSamples = async () => {
        try {
            const res = await fetch(`/api/users/userSamples/`);
            const data = await res.json();
            setPublicIDs(data.msg);
        } catch (error) {
            console.error(error);
        }
    };

    const handleFileInputChange = (e) => {
        if (e.target.files) {
            const file = e.target.files[0];
            previewFile(file);
            setSelectedFile(file);
            setFileInputState(e.target.value);
        }
    };

    const previewFile = (file) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            setPreviewSource(reader.result);
        };
    };

    const handleSubmitFile = (e) => {
        e.preventDefault();
        if (!selectedFile) return;
        const reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onloadend = () => {
            uploadImage(reader.result);
        };
        reader.onerror = () => {
            console.error("AHHHHHHHH!!");
            setErrMsg("something went wrong!");
        };
    };

    const uploadImage = async (base64EncodedImage) => {
        try {
            console.log("userId: ", userId);

            const res = await fetch("/api/users/upload", {
                method: "POST",
                body: JSON.stringify({ data: base64EncodedImage }),
                headers: { "Content-Type": "application/json" },
            });
            console.log("res: ", res);
            const userImages = await res.json();

            console.log("uploadedData: ", userImages.msg);
            setPublicIDs(userImages.msg);

            console.log("publicIDs: ", publicIDs);
            setFileInputState("");
            setPreviewSource("");
            setSuccessMsg("Image uploaded successfully");
        } catch (err) {
            console.error(err);
            setErrMsg("Something went wrong!");
        }
    };

    const deleteImage = async (index) => {
        try {
            const res = await fetch(
                `/api/users/deleteSample/${publicIDs[index]["publicid"]}`,
                {
                    method: "DELETE",
                }
            );
            const data = await res.json();
            const newPublickIDs = [...publicIDs];
            newPublickIDs.splice(index, 1);
            setPublicIDs(newPublickIDs);
        } catch (e) {
            console.log(e);
        }
    };

    const generateDescriptors = async (userId) => {
        try {
            const res = await fetch(`/api/users/putdescripters/`);
            const data = await res.json();
            console.log("DATA: ", data)
            setSuccessMsg("Generated successfully");
        } catch (error) {
            console.error(error);
            setErrMsg("Something went wrong! Descriptors not generated!");
        }
    }

    return (
        <div>
            <h1 className="title">Upload an Image</h1>
            <Alert msg={errMsg} type="danger" />
            <Alert msg={successMsg} type="success" />
            <form onSubmit={handleSubmitFile} className="form">
                <Button
                    sx={{ mt: 3, mb: 2 }}
                    variant="contained"
                    component="label"
                    startIcon={<CloudUploadIcon />}>
                    Upload Image
                    <input
                        id="fileInput"
                        name="image"
                        onChange={handleFileInputChange}
                        value={fileInputState}
                        className="form-input"
                        type="file"
                        // multiple
                        hidden
                    />
                </Button>
                <Button
                    className="btn"
                    type="submit"
                    sx={{ mt: 3, mb: 2, ml: 2 }}
                    variant="contained"
                    endIcon={<SendIcon />}
                    // onClick={() => console.log("create user")}
                >
                    Send
                </Button>
                <Button
                    className="btn"
                    sx={{ mt: 3, mb: 2, ml: 2 }}
                    variant="contained"
                    endIcon={
                        <>
                            <AutoFixHighIcon />
                            <AccountCircleIcon />
                        </>
                    }
                    onClick={() => generateDescriptors(userId)}>
                    Generate recognition
                </Button>
            </form>
            {}
            {previewSource && (
                <img
                    src={previewSource}
                    alt="chosen"
                    style={{ height: "300px" }}
                />
            )}
            {publicIDs &&
                publicIDs.map((idObj, index) => {
                    return (
                        <div key={index}>
                            <Image
                                // cloudName={process.env.REACT_APP_CLOUDINARY_NAME}
                                cloudName="dte0xrn6r"
                                publicId={idObj.publicid}
                                width="300"
                                crop="scale"
                            />
                            <br />
                            <Button
                                className="btn"
                                sx={{ mt: 3, mb: 2, ml: 2 }}
                                variant="contained"
                                startIcon={<DeleteForever />}
                                onClick={() => deleteImage(index)}>
                                Delete image
                            </Button>
                        </div>
                    );
                })}
        </div>
    );
};

export default Samples;
