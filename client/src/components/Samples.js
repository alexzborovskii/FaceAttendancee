import React, { useState, useContext, useEffect } from "react";
import AlertMsg from "./Alert";
import { Button } from "@mui/material";
import { Typography, Box, useTheme } from "@mui/material";
import { tokens } from "../theme";

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
    const [isValidSize, setIsValidSize] = useState(true);

    const { userId } = useContext(AppContext);

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

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

            const maxFileSizeInMB = 0.5;
            const maxFileSizeInKB = 1024 * 1024 * maxFileSizeInMB;

            if (file && file.size > maxFileSizeInKB) {
                setIsValidSize(false);
                setErrMsg("Image cant be bigger theb 0.5 MB")
            }   else if (file && file.size <= maxFileSizeInKB){
                setIsValidSize(true);
                setErrMsg("")
            }
        }
    };

    const previewFile = (file) => {
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                setPreviewSource(reader.result);
            };
        }
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
            const res = await fetch("/api/users/upload", {
                method: "POST",
                body: JSON.stringify({ data: base64EncodedImage }),
                headers: { "Content-Type": "application/json" },
            });
            const userImages = await res.json();

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
            // const data = await res.json();
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
            console.log("DATA: ", data);
            setSuccessMsg("Generated successfully");
        } catch (error) {
            console.error(error);
            setErrMsg("Something went wrong! Descriptors not generated!");
        }
    };

    return (
        <div>
            <h1 className="title">Upload an Image</h1>
            <AlertMsg msg={errMsg} type="error" />
            <AlertMsg msg={successMsg} type="success" />
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
                    disabled={!isValidSize}
                    className="btn"
                    type="submit"
                    sx={{ mt: 3, mb: 2, ml: 2 }}
                    variant="contained"
                    endIcon={<SendIcon />}
                    // onClick={() => console.log("create user")}
                >
                    Send
                </Button>
            </form>
            {}
            {previewSource && (
                <div>
                    <Typography
                        variant="h6"
                        color={colors.grey[100]}
                        sx={{ m: "0 0 5px 0" }}
                        mb="10px">
                        Preview the image:
                    </Typography>
                    <img
                        src={previewSource}
                        alt="chosen"
                        style={{ height: "300px" }}
                    />
                </div>
            )}
            <div
                id="samples-box"
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                }}>
                {publicIDs &&
                    publicIDs.map((idObj, index) => {
                        return (
                            <div
                                style={{
                                    display: "inline-block",
                                    margin: "10px",
                                }}
                                key={index}>
                                <Image
                                    cloudName={
                                        process.env.REACT_APP_CLOUDINARY_NAME
                                    }
                                    publicId={idObj.publicid}
                                    width="150"
                                    crop="scale"
                                    sx={{ borderRadius: "5px" }}
                                />
                                <br />
                                <Button
                                    className="btn"
                                    size="small"
                                    variant="contained"
                                    startIcon={<DeleteForever />}
                                    onClick={() => deleteImage(index)}>
                                    Delete image
                                </Button>
                            </div>
                        );
                    })}
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
                <Button
                    className="btn"
                    // sx={{ mt: 3, mb: 2, ml: 2,  }}
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
            </div>
        </div>
    );
};

export default Samples;
