import * as React from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import Header from "./Header";

import dayjs from "dayjs";
import { Box } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { tokens } from "../theme";
import { useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import dateTime from "../utils/dateTime.js";
import NoDataMessage from "./NoDataMessage";

const timeFormatter = (data) => new Date(data).toISOString().substring(11, 19);

export default function InOutChart() {
    const [date, setDate] = useState(dateTime(new Date()));
    const [monthYear, setMonthYear] = useState(dateTime(new Date()));
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [chartData, setChartData] = useState("default");

    useEffect(() => {
        getLineData();
    }, [monthYear]);

    const getLineData = async () => {
        try {
            const res = await axios(
                `/api/users/LineData?monthYear=${monthYear}`
            );
            const data = res.data.data;
            // const total = res.data.total;
            const firstTime = data.firstTime;
            const lastTime = data.lastTime;
            const dates = data.dates;
            const officialStart = data.officialStart;
            const officialEnd = data.officialEnd;
            if (dates.length) {
                setChartData({
                    firstTime,
                    lastTime,
                    dates,
                    officialStart,
                    officialEnd,
                });
            } else {
                setChartData("empty");
            }
        } catch (e) {
            console.log(e);
        }
    };

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
                    </LocalizationProvider>

                    {chartData === "default" ? null : chartData === "empty" ? (
                        <NoDataMessage />
                    ) : (
                    <LineChart
                        series={[
                            {
                                data: chartData.firstTime,
                                label: "time in",
                                showMark: true,
                                valueFormatter: timeFormatter,
                                color: colors.greenAccent[400],
                            },

                            {
                                data: chartData.lastTime,
                                label: "time out",
                                showMark: true,
                                valueFormatter: timeFormatter,
                                color: colors.redAccent[500],
                            },
                            {
                                data: chartData.officialStart,
                                label: "start of the day",
                                showMark: true,
                                valueFormatter: timeFormatter,
                                color: colors.grey[100],
                            },
                            {
                                data: chartData.officialEnd,
                                label: "end of the day",
                                showMark: true,
                                valueFormatter: timeFormatter,
                                color: colors.grey[500],
                            },
                        ]}
                        xAxis={[
                            {
                                data: chartData.dates,
                                scaleType: "band",
                            },
                        ]}
                        leftAxis={null}
                    />
                    )}
                </Box>
        </Box>
    );
}
