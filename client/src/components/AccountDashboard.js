import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Link from "@mui/material/Link";
import { useTheme } from "@mui/material";

import AccountScreen from "./AccountScreen";
import Samples from "./Samples";

function Copyright(props) {
    return (
        <Typography
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



const AccountDashboard = () => {
    const theme = useTheme();

    return (
            <Box sx={{ display: "flex" }}>
                <Box
                    component="main"
                    sx={{
                        backgroundColor: (theme) =>
                            theme.palette.mode === "light"
                                ? theme.palette.grey[100]
                                : theme.palette.grey[900],
                        flexGrow: 1,
                        height: "calc(100vh - 75px)",
                        overflow: "auto",
                    }}>
                    <Container maxWidth={false} sx={{ mt: 4, mb: 4 }} >
                        <Grid container spacing={3}>
                            {/* AccountScreen */}
                            <Grid item xs={12} md={6} lg={4}>
                                <Paper
                                    sx={{
                                        p: 2,
                                        display: "flex",
                                        flexDirection: "column",
                                        height: "fitcontent",
                                    }}>
                                    <AccountScreen />
                                </Paper>
                            </Grid>
                            {/* Samples */}
                            <Grid item xs={12} md={6} lg={8}>
                                <Paper
                                    sx={{
                                        p: 2,
                                        display: "flex",
                                        flexDirection: "column",
                                        height: "fitcontent",
                                    }}>
                                    <Samples />
                                </Paper>
                            </Grid>
                        </Grid>
                        <Copyright sx={{ pt: 4 }} />
                    </Container>
                </Box>
            </Box>
    );
};

export default AccountDashboard;
