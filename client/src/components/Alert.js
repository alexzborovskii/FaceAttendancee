import React, { useState, useEffect } from "react";
import Alert from '@mui/material/Alert';
import Grow from '@mui/material/Grow';

const AlertMsg = ({ msg, type, setMessage }) => {
    const [show, setShow] = useState(false);
    useEffect(() => {
        if (msg) {
            setShow(true);
            setTimeout(() => setShow(false), 10000)
        } else {
            setShow(false)
        }
    }, [msg]);

    return <>{show && <Grow in={show}><Alert severity={type}>{msg}</Alert></Grow>}</>;
};

export default AlertMsg;
