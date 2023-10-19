import * as React from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import dayjs from "dayjs";
import { Box, FormControl, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useEffect, useState } from "react";
import axios from "axios";
import dateTime from "../utils/dateTime.js";
import { BarChart } from "@mui/x-charts";
import NoDataMessage from "./NoDataMessage";

export default function AdminTimeSpentChart(props) {
    //date
    const [date, setDate] = useState(dateTime(new Date()));
    const [monthYear, setMonthYear] = useState(dateTime(new Date()));
    //users
    const [user, setUser] = useState("");
    const [userLabels, setUserLabels] = useState([]);
    //data
    const [chartData, setChartData] = useState("default");

    useEffect(() => {
        getUserLabels();
        getUserId();
    }, []);

    useEffect(() => {
        if (monthYear && user) getChartData();
    }, [monthYear, user]); 
    
    let chartHeight =  "75vh"
    if (props.height) chartHeight = props.height
    
    const getChartData = async () => {
        try {
            const res = await axios(
                `/api/users/adminTimeSpentData?monthYear=${monthYear}&userId=${user}`
            );
            const data = res.data.data
            if (data.dates.length) {
                setChartData({
                    ...data
                }); 
            } else {
                setChartData("empty");
            }
        } catch (e) {
            console.log(e);
        }
    };

    const getUserLabels = async () => {
        try {
            const res = await axios(`/api/users/userLabels`);
            setUserLabels(res.data);
        } catch (e) {
            console.log(e);
        }
    };

    const getUserId = async () => {
        try {
            const res = await axios("/api/users/getId");
            setUser(Number(res.data.user_id));
        } catch (e) {
            console.log(e);
        }
    };

    const timeToHours = (data) =>
        Math.floor(data / 60) + ":" + (data % 60) + "h";

    return (
        <Box m="10px" p="10px 10px 30px 10px">
                <Box height={chartHeight}>
                <Box>
                    <FormControl
                        sx={{
                            m: 1,
                            minWidth: 120,
                        }}>
                        <InputLabel id="select-helper-label">User</InputLabel>
                        <Select
                            labelId="select-label"
                            id="userselect-helper"
                            value={user}
                            label="User"
                            onChange={(e) => setUser(e.target.value)}>
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            {userLabels &&
                                userLabels.map((label, index) => {
                                    return (
                                        <MenuItem
                                            value={label.value}
                                            key={index}>
                                            {label.fullName}
                                        </MenuItem>
                                    );
                                })}
                        </Select>
                    </FormControl>
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
                </Box>
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
