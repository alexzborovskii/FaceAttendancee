import * as React from "react";

import dayjs from "dayjs";
import { Box, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useEffect, useState } from "react";
import axios from "axios";
import dateTime from "../utils/dateTime.js";
import { BarChart } from "@mui/x-charts";
import NoDataMessage from "./NoDataMessage";

export default function TimeSpentChart(props) {
    const [date, setDate] = useState(dateTime(new Date()));
    const [monthYear, setMonthYear] = useState(dateTime(new Date()));
    const [chartData, setChartData] = useState("default");

    useEffect(() => {
        getCharData();
    }, [monthYear]);

    let chartHeight =  "75vh";
    if (props.height) chartHeight = props.height ;

    const getCharData = async () => {
        try {
            const res = await axios(
                `/api/users/timeSpentData?monthYear=${monthYear}`
            );
            const data = res.data.data;
            if (data.dates.length) {
                setChartData({...data});
            } else {
                setChartData("empty");
            }
        } catch (e) {
            console.log(e);
        }
    };

    const timeToHours = (data) =>
        Math.floor(data / 60) + ":" + (data % 60) + "h";

    return (
        <Box m="10px" p="10px 10px 30px 10px">
                <Box height={chartHeight}>
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
                    )}
                </Box>
        </Box>
    );
}
