import React, { useState, useEffect, useContext } from "react";
import { TextField, Button, Stack, Box } from "@mui/material";
import { useParams } from "react-router-dom";
import { AppContext } from "../App.js";
import Alert from "./Alert";

const AccountScreen = () => {
    // account info
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [infoSuccessMsg, setIfoSuccessMsg] = useState("");
    const [infoErrMsg, setInfoErrMsg] = useState("");
    const { userId, setUserId } = useContext(AppContext);

    useEffect(() => {
        getUserInfo();
    }, []);

    const getUserInfo = async () => {
        try {
            const res = await fetch(`/api/users/userinfo/`);
            const data = await res.json();
            const userInfo = data[0];
            setFirstName(userInfo.fname);
            setLastName(userInfo.lname);
            setEmail(userInfo.email);
            setUserId(userInfo.user_id);
        } catch (e) {
            console.log(e);
        }
    };

    const updateInfo = async (userId) => {
        try {
            const res = await fetch(`/api/users/updateUserInfo/`, {
                method: "PUT",
                body: JSON.stringify({
                    fname: firstName,
                    lname: lastName,
                    email,
                }),
                headers: { "Content-Type": "application/json" },
            });
            const userData = await res.json();
            setIfoSuccessMsg("Your info updated successfully");
        } catch (err) {
            console.error(err);
            setInfoErrMsg("Something went wrong!");
        }
    };

    return (
        <>
            <h2>Edit profile</h2>
            <Box
                component="form"
                onSubmit={() => updateInfo(userId)} 
                noValidate
                sx={{ mt: 1, width: "50%" }}>
                <Stack spacing={2} direction="row" sx={{ marginBottom: 4 }}>
                    <TextField
                        type="text"
                        variant="standard"
                        color="primary"
                        label="First Name"
                        onChange={(e) => setFirstName(e.target.value)}
                        value={firstName}
                        fullWidth
                        required
                    />
                    <TextField
                        type="text"
                        variant="standard"
                        color="primary"
                        label="Last Name"
                        onChange={(e) => setLastName(e.target.value)}
                        value={lastName}
                        fullWidth
                        required
                    />
                </Stack>
                <TextField
                    type="email"
                    variant="standard"
                    color="primary"
                    label="Email"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    fullWidth
                    required
                    sx={{ mb: 4 }}
                />
                <TextField
                    type="password"
                    variant="standard"
                    color="primary"
                    label="Password"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    required
                    fullWidth
                    sx={{ mb: 4 }}
                />
                <Button
                    variant="contained"
                    component="label"
                    type="submit"
                    onClick={() => updateInfo(userId)}>
                    Save Changes
                </Button>
                <Alert msg={infoErrMsg} type="danger" />
                <Alert msg={infoSuccessMsg} type="success" />
            </Box>
        </>
    );
};

export default AccountScreen;
