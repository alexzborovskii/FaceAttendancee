import React, { useState, useEffect, useContext } from "react";
import { TextField, Button, Stack, Box } from "@mui/material";
import { AppContext } from "../App.js";
import AlertMsg from "./Alert";
import Avatar from "@mui/material/Avatar";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Copyright from "./Copyright.js";
import PasswordIcon from "@mui/icons-material/Password";

const ChangePassword = () => {
    // account info
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPassword2, setNewPassword2] = useState("");
    const [infoSuccessMsg, setInfoSuccessMsg] = useState("");
    const [infoErrMsg, setInfoErrMsg] = useState("");
    const { userId, setUserId } = useContext(AppContext);
    const [newPasswordsMatch, setNewPasswordsMatch] = useState(false);
    const [saveButtonDisabled, setSaveButtonDisabled] = useState(true);
    
    // fields filled check
    useEffect(() => {
        if (newPassword && (newPassword == newPassword2)) {
            setNewPasswordsMatch(true);
            setInfoErrMsg("")
            setInfoSuccessMsg("New passwords match!")
        } else if ((newPassword.length && newPassword2.length) && (newPassword != newPassword2)){
            setNewPasswordsMatch(false);
            setInfoSuccessMsg("");
            setInfoErrMsg("New passwords don't match!");
        };
        (password.length && newPasswordsMatch) ? setSaveButtonDisabled(false) : setSaveButtonDisabled(true);
    }, [password, newPassword, newPassword2, newPasswordsMatch]);



    const updatePassword = async () => {
        try {
            const res = await fetch(`/api/users/changePassword/`, {
                method: "PUT",
                body: JSON.stringify({
                    password,
                    newPassword,
                }),
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json();
            if (data.ErrorMsg) setInfoErrMsg(data.ErrorMsg);
            if (data.msg) setInfoSuccessMsg(data.msg)
        } catch (err) {
            console.error(err);
            setInfoErrMsg("Somethign went wrong. Password is NOT updated!");
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
                sx={{
                    marginTop: 8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}>
                <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                    <PasswordIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Change password
                </Typography>
                <Box
                    component="form"
                    noValidate
                    onSubmit={() => updatePassword(userId)}
                    sx={{
                        mt: 3,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}>
                    <Grid item xs={12}>
                        <TextField
                            required
                            type="password"
                            variant="standard"
                            color="primary"
                            label="Old password"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            fullWidth
                            sx={{ mb: 4 }}
                            autoComplete="old-password"
                        />

                        <TextField
                            required
                            type="password"
                            variant="standard"
                            color="primary"
                            label="New password"
                            onChange={(e) => setNewPassword(e.target.value)}
                            value={newPassword}
                            fullWidth
                            sx={{ mb: 4 }}
                            autoComplete="new-password"
                        />

                        <TextField
                            required
                            type="password"
                            variant="standard"
                            color="primary"
                            label="New password once again"
                            onChange={(e) => setNewPassword2(e.target.value)}
                            value={newPassword2}
                            fullWidth
                            sx={{ mb: 4 }}
                            autoComplete="new-password2"
                        />
                    </Grid>
                    <Button
                        disabled={saveButtonDisabled}
                        variant="contained"
                        component="label"
                        type="submit"
                        onClick={() => updatePassword(userId)}>
                        Save Changes
                    </Button>
                    <AlertMsg msg={infoErrMsg} type="error" />
                    <AlertMsg msg={infoSuccessMsg} type="success" />
                </Box>
            </Box>
            <Copyright sx={{ mt: 5 }} />
        </Container>
    );
};

export default ChangePassword;
