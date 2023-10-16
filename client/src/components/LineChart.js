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
import dateTime from "../utils/dateTime.js"


const uData = [4000, 3000, 2000, 2780, 1890, 2390, 3490];
// const pData = [2400, 1398, 9800, 3908, 4800, 3800, 4300];
const amtData = [2400, 2210, 2290, 2000, 2181, 2500, 2100];
const xLabels = [
    "Page A",
    "Page B",
    "Page C",
    "Page D",
    "Page E",
    "Page F",
    "Page G",
];

export default function StackedAreaChart() {
    const [date, setDate] = useState(dateTime(new Date()));
    const [monthYear, setMonthYear] = useState(dateTime(new Date()));

    return (
        <Box m="20px">
            <Box height="80vh">
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
                <LineChart
                    series={[
                        {
                            data: uData,
                            label: "uv",
                            stack: "total",
                            showMark: false,
                        },
                        // {
                        //     data: pData,
                        //     label: "pv",
                        //     area: true,
                        //     stack: "total",
                        //     showMark: false,
                        // },
                        {
                            data: amtData,
                            label: "amt",
                            area: true,
                            stack: "total",
                            showMark: false,
                        },
                    ]}
                    xAxis={[{ scaleType: "point", data: xLabels }]}
                    sx={{
                        ".MuiLineElement-root": {
                            display: "none",
                        },
                    }}
                />
            </Box>
        </Box>
    );
}
