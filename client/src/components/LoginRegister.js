import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Box, TextField, Button } from "@mui/material";

import { AppContext } from "../App";

const LoginRegister = (props) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const { setToken, setUserId } = useContext(AppContext);
    const navigate = useNavigate();

    const handleAction = async () => {
        if (props.title === "Register") {
            try {
                const res = await axios.post("/api/users/register", {
                    email,
                    password,
                });
                if (res.status === 200) {
                    setMessage('');
                    navigate('/login')
                }
            } catch (err) {
                setMessage(err.response.data.msg)
            }
        } else {
            try {
                const res = await axios.post("/api/users/login", {
                    email,
                    password,
                });
                if (res.status === 200) {
                    setMessage('');
                    setToken({token: res.data.token});
                    setUserId(res.data.userId)
                    navigate('/')
                }
            } catch (err) {
                setMessage(err.response.data.msg)
            }
        }
    };

    return (
        <div>
            <h2>{props.title}</h2>
            <Box component={"form"} sx={{ m: 1 }} noValidate autoComplete="off">
                <TextField
                    sx={{ m: 1 }}
                    id="email"
                    type="email"
                    label="Enter Email"
                    variant="outlined"
                    onChange={(e) => {
                        setEmail(e.target.value);
                    }}
                />
                <TextField
                    sx={{ m: 1 }}
                    id="password"
                    type="password"
                    label="Enter Password"
                    variant="outlined"
                    onChange={(e) => {
                        setPassword(e.target.value);
                    }}
                />
            </Box>
            <Button variant="contained" onClick={handleAction}>
                {props.title}
            </Button>
            <div>
                <p>{message}</p>
            </div>
        </div>
    );
};

export default LoginRegister;
