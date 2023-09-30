import React, { useState, useEffect } from "react";
import Alert from '@mui/material/Alert';

const AlertMsg = ({ msg, type, setMessage }) => {
    const [show, setShow] = useState(false);
    useEffect(() => {
        if (msg) {
            setShow(true);
        }
    }, [msg]);

    return <>{show && <Alert severity={type}>{msg}</Alert>}</>;
};

export default AlertMsg;
