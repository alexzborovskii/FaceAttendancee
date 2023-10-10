import { Box } from "@mui/material";
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

const AdminByDayStatistics = () => {
    const [paginationModel, setPaginationModel] = useState({
        pageSize: 10,
        page: 0,
    });

    const [pageState, setPageState] = useState({
        isLoading: false,
        data: [],
        total: 0,
    });

    const [date, setDate] = useState(new Date().toISOString());

    useEffect(() => {
        getAdminByDayStatistics(date);
    }, [paginationModel.page, paginationModel.pageSize, date]);

    const getAdminByDayStatistics = async () => {
        try {
            setPageState((old) => ({ ...old, isLoading: true }));
            const res = await axios(
                `/api/users/AdminByDayStatistics?page=${paginationModel.page}&limit=${paginationModel.pageSize}&date=${date}`
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

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const columns = [
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
            <Header title="Admin by Day statistics" />
            <LocalizationProvider
                dateAdapter={AdapterDayjs}
                // localeText={locale}
            >
                <DatePicker
                    defaultValue={dayjs(date)}
                    autoOk={true}
                    hintText="Select Date"
                    value={dayjs(date)}
                    onChange={(e) => {
                        setDate(e.$d.toISOString());
                    }}
                />
            </LocalizationProvider>
            <Box
                // m="0 0 0 0"
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
                {console.log("date line 127: ", date)}
                <DataGrid
                    density="compact"
                    components={{
                        Toolbar: GridToolbar,
                    }}
                    getRowId={(row) => row.user_id}
                    autoHeight
                    rows={pageState.data}
                    rowCount={pageState.total}
                    loading={pageState.isLoading}
                    paginationMode="server"
                    initialState={{
                        page: paginationModel.page,
                        pagination: {
                            paginationModel: {
                                pageSize: paginationModel.pageSize,
                            },
                        },
                    }}
                    pageSizeOptions={[
                        10,
                        30,
                        50,
                        70,
                        100,
                        { label: "All", value: pageState.total },
                    ]}
                    pagination
                    page={paginationModel.page}
                    pageSize={paginationModel.pageSize}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    columns={columns}
                />
            </Box>
        </Box>
    );
};

export default AdminByDayStatistics;
