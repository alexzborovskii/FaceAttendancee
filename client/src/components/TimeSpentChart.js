import * as React from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import Header from "./Header";

import dayjs from "dayjs";
import { Box, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { tokens } from "../theme";
import { useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import dateTime from "../utils/dateTime.js";
import { BarChart } from "@mui/x-charts";
import NoDataMessage from "./NoDataMessage";

export default function TimeSpentChart() {
    const [date, setDate] = useState(dateTime(new Date()));
    const [monthYear, setMonthYear] = useState(dateTime(new Date()));
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [chartData, setChartData] = useState();

    useEffect(() => {
        getCharData();
    }, [monthYear]);

    const getCharData = async () => {
        try {
            const res = await axios(
                `/api/users/timeSpentData?monthYear=${monthYear}`
            );
            const data = res.data.data;
            const total = res.data.total;
            const timeValue = data.timeValue;
            const dates = data.dates;
            if (dates.length) setChartData({ timeValue, dates });
        } catch (e) {
            console.log(e);
        }
    };

    const timeToHours = (data) =>
        Math.floor(data / 60) + ":" + (data % 60) + "h";

        return (
            
            <Box m="20px">
            {chartData ? (
            <Box height="75vh">
                <LocalizationProvider
                    dateAdapter={AdapterDayjs}
                    components={["DatePicker"]}>
                    <DatePicker
                        sx={{ m: 1 }}
                        label={'Month and year"'}
                        views={["month", "year"]}
                        defaultValue={dayjs(date)}
                        autoOk={true}
                        hintText="Select Month"
                        value={dayjs(date)}
                        onChange={(e) => {
                            setMonthYear(e.$d.toISOString());
                        }}
                    />
                </LocalizationProvider>
                    <BarChart
                        series={[
                            {
                                data: chartData.timeValue,
                                label: "time inside (min)",
                                id: "timeId",
                                valueFormatter: timeToHours,
                            },
                        ]}
                        xAxis={[
                            {
                                data: chartData.dates,
                                scaleType: "band",
                            },
                        ]}
                        yAxis={[
                            {
                                valueFormatter: timeToHours,
                            },
                        ]}
                    />
            </Box>
                ) : <NoDataMessage />}
        </Box>
    );
}
