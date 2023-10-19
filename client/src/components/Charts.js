import * as React from "react";
import {useState} from "react"
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import { useTheme } from "@mui/material";
import Copyright from "./Copyright.js"
import TimeSpentChart from "./TimeSpentChart";
import InOutChart from "./InOutChart";



const Charts = () => {
    const theme = useTheme();
    const [timeSpentChartHeight, setSpentTimeChartHeight] = useState("30vh");
    const [inOutChartHeight, setInOutChartHeight] = useState("30vh");


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
                        height: "calc(100vh - 75.43px)",
                        overflow: "auto",
                    }}>
                    <Container maxWidth={false} sx={{ mt: 1, mb: 1 }} >
                        <Grid container spacing={2}>
                            {/* SpentTimeChart */}
                            <Grid item xs={12} >
                                <Paper
                                    sx={{
                                        p: 2,
                                        display: "flex",
                                        flexDirection: "column",
                                        height: "fitcontent",
                                    }}>
                                    <TimeSpentChart height={timeSpentChartHeight}/>
                                </Paper>
                            </Grid>
                            {/* InOutChart */}
                            <Grid item xs={12}>
                                <Paper
                                    sx={{
                                        p: 2,
                                        display: "flex",
                                        flexDirection: "column",
                                        height: "fitcontent",
                                    }}>
                                    <InOutChart height={inOutChartHeight}/>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Container>
                </Box>
            </Box>
    );
};

export default Charts;
