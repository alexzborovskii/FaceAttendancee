import { Box, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import dayjs from "dayjs";
import { tokens } from "../theme";
import Header from "./Header";
import { useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";

import dateTime from "../utils/dateTime.js";

const StatisticsByDay = () => {
    const [pageState, setPageState] = useState({
        isLoading: false,
        data: [],
        total: 0,
    });

    const [date, setDate] = useState(dateTime(new Date()));
    const [monthYear, setMonthYear] = useState(dateTime(new Date()));
    const [userLabels, setUserLabels] = useState([]);
    const [identifier, setIdentifier] = useState("user_id");
    let source = "date";
    useEffect(() => {
        getUserLabels();
    }, []);

    useEffect(() => {
        source = "date";
    }, [date]);

    useEffect(() => {
        source = "user";
    }, [monthYear]);

    useEffect(() => {
        if (source === "date") {
            getStatisticsByDay();
        } else if (source === "user") {
            getStatisticsByUser();
        }
    }, [date, monthYear]);

    const getUserLabels = async () => {
        try {
            const res = await axios(`/api/users/userLabels`);
            setUserLabels(res.data);
        } catch (e) {
            console.log(e);
        }
    };

    const getStatisticsByUser = async (event) => {
        try {
            setIdentifier("index");
            setPageState((old) => ({ ...old, isLoading: true }));
            const res = await axios(
                `/api/users/StatisticsByUser?monthYear=${monthYear}`
            );
            const data = res.data.data;
            const total = res.data.total;
            setPageState((old) => ({ 
                ...old,
                isLoading: false,
                data,
                total,
            }));
        } catch (e) {
            console.log(e);
        }
    };

    const getStatisticsByDay = async () => {
        try {
            setIdentifier("user_id");
            setPageState((old) => ({ ...old, isLoading: true }));
            const res = await axios(`/api/users/StatisticsByDay?date=${date}`);
            const data = res.data.data;
            const total = res.data.total;
            setPageState((old) => ({
                ...old,
                isLoading: false,
                data,
                total,
            }));
        } catch (e) {
            console.log(e);
        }
    };

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const columns = [
        { field: "index", headerName: "#", flex: 0.5 },
        { field: "user_id", headerName: "User ID", flex: 0.5 },
        {
            field: "name",
            headerName: "User Fullname",
            flex: 1,
            cellClassName: "name-column--cell",
        },
        {
            field: "date",
            headerName: "Date",
            type: "datetime",
            flex: 1,
        },
        {
            field: "first_time",
            headerName: "First Time",
            type: "datetime",
            flex: 1,
        },
        {
            field: "last_time",
            headerName: "Last Time",
            type: "datetime",
            flex: 1,
        },
    ];

    return (
        <Box m="10px">
                <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        sx={{ m: 1 }} 
                        label="Date"
                        defaultValue={dayjs(date)}
                        autoOk={true}
                        hintText="Select Date"
                        format="YYYY-MM-DD"
                        value={dayjs(date)}
                        onChange={(e) => {
                            setDate(dateTime(e.$d));
                        }}
                    />
                </LocalizationProvider>
                <Typography sx={{ display: "inline-block" }}>OR</Typography>

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
                            setMonthYear(dateTime(e.$d));
                        }}
                    />
                </LocalizationProvider>
            </Box>

            <Box
                height="84vh"
                sx={{
                    "& .MuiDataGrid-root": {
                        border: "none",
                    },
                    "& .MuiDataGrid-cell": {
                        borderBottom: "none",
                    },
                    "& .name-column--cell": {
                        color: colors.greenAccent[300],
                    },
                    "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: colors.blueAccent[700],
                        borderBottom: "none",
                    },
                    "& .MuiDataGrid-virtualScroller": {
                        backgroundColor: colors.primary[400],
                    },
                    "& .MuiDataGrid-footerContainer": {
                        borderTop: "none",
                        backgroundColor: colors.blueAccent[700],
                    },
                    "& .MuiCheckbox-root": {
                        color: `${colors.greenAccent[200]} !important`,
                    },
                    "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
                        color: `${colors.grey[100]} !important`,
                    },
                }}>
                <DataGrid
                    density="compact"
                    components={{
                        Toolbar: GridToolbar,
                    }}
                    getRowId={(row) => row[`${identifier}`]}
                    autoHeight
                    rows={pageState.data}
                    rowCount={pageState.total}
                    loading={pageState.isLoading}
                    pageSizeOptions={[]}
                    pagination
                    columns={columns}
                />
            </Box>
        </Box>
    );
};

export default StatisticsByDay;
