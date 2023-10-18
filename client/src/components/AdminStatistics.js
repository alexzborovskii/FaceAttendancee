import { Box } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../theme";
import { useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";

const AdminStatistics = () => {
    const [paginationModel, setPaginationModel] = useState({
        pageSize: 10,
        page: 0,
    });

    const [pageState, setPageState] = useState({
        isLoading: false,
        data: [],
        total: 0,
    });

    useEffect(() => {
        getAdminStatistics();
    }, [paginationModel.page, paginationModel.pageSize]);

    const getAdminStatistics = async () => {
        try {
            setPageState((old) => ({ ...old, isLoading: true }));
            const res = await axios(
                `/api/users/getAdminStatistics?page=${paginationModel.page}&limit=${paginationModel.pageSize}`
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
        { field: "detection_id", headerName: "Detection ID", flex: 0.5 },
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
            field: "time",
            headerName: "Time",
            type: "datetime",
            flex: 1,
        },
    ];

    return (
        <Box m="10px">
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
                <DataGrid
                    density="compact"
                    components={{
                        Toolbar: GridToolbar,
                    }}
                    getRowId={(row) => row.detection_id}
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
                    pageSizeOptions={[10, 30, 50, 70, 100,]}
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

export default AdminStatistics;
