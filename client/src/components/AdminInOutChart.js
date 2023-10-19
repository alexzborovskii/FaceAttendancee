import * as React from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import dayjs from "dayjs";
import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
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

export default function AdminInOutChart(props) {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
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
        getUserId()
    }, []);

    useEffect(() => {
        if (monthYear && user) getChartData();
    }, [monthYear, user]);


    let chartHeight = "75vh";
    if (props.height) chartHeight = props.height;

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

    const getChartData = async () => {
        try {
            const res = await axios(
                `/api/users/adminLineData?monthYear=${monthYear}&userId=${user}`
            );
            const data = res.data.data;
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

    return (
        <Box m="10px" pb="30px">
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
                            {/* <MenuItem value="">
                                <em>None</em>
                            </MenuItem> */}
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
