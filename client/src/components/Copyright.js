import { Typography, Link } from "@mui/material";

function Copyright(props) {
    return (
        <Typography
            sx={{ position: "absolute",
                bottom: "0"}}
            variant="body2"
            color="text.secondary"
            align="center"
            {...props}>
            {"Copyright © "}
            <Link color="inherit">
                Face Attendance
            </Link>{" "}
            {new Date().getFullYear()}
            {"."}
        </Typography>
    );
}

export default Copyright;