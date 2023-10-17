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

const valueFormatter = (date) =>
    date.getHours() === 0
        ? date.toLocaleDateString("en-Gb", {
              month: "2-digit",
              day: "2-digit",
              timeZone: "UTC",
          })
        : date.toLocaleTimeString("en-Gb", {
              hour: "2-digit",
              timeZone: "UTC",
          });

// const uData = [
//     new Date(new Date("2023-10-04T13:47:15.451Z").toUTCString().slice(0, -4)),
//     new Date(new Date("2023-10-05T18:07:40.599Z").toUTCString().slice(0, -4)),
// ];

// const amtData = [
//     new Date(new Date("2023-10-04T13:35:38.477Z").toUTCString().slice(0, -4)),
//     new Date(new Date("2023-10-05T10:06:40.599Z").toUTCString().slice(0, -4)),
// ];

export default function StackedAreaChart() {
    const [date, setDate] = useState(dateTime(new Date()));
    const [monthYear, setMonthYear] = useState(dateTime(new Date()));
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [chartData, setChartData] = useState();
    
  useEffect(()=> {
    getLineData()
  }, [])

    useEffect(() => {
        getLineData();
    }, [monthYear]);
    //
    const getLineData = async () => {
        try {
            const res = await axios(
                `/api/users/LineData?monthYear=${monthYear}`
            );
            const data = res.data.data;
            const total = res.data.total;
            console.log("Data: ", data);
            console.log("Total: ", total);
            const firstTime = data.firstTime.map((item) => new Date(item))
            const lastTime = data.lastTime.map((item) => new Date(item))
            const dates = data.dates.map((item) => new Date(item))
            setChartData({firstTime, lastTime, dates});
        } catch (e) {
            console.log(e);
        }
    };
    
    // getLineData()
    return (
        <Box m="20px">
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
                {console.log("cD: ", chartData)}
                </LocalizationProvider>
                {chartData && <LineChart
                    series={[
                        {
                            data: chartData.firstTime,
                            label: "ft",
                            // stack: "total",
                            showMark: true,
                        },

                        {
                            data: chartData.lastTime,
                            label: "lt",
                            // area: true,
                            // stack: "total",
                            showMark: true,
                        },
                    ]}
                    
                    xAxis={[
                        {
                          data: chartData.dates,
                          scaleType: "time",
                          valueFormatter,
                          tickMinStep: 3600 * 1000 * 24,
                        }]}
                    sx={{
                        ".MuiLineElement-root": {
                            display: "none",
                        },
                    }}
                    leftAxis={null}
                />}
            </Box>
        </Box>
    );
}
