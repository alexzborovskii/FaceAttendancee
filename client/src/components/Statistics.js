import { Box } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../theme";
import { mockDataContacts } from "../data/mockData";
import Header from "./Header";
import { useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";



const Statistics = () => {

  const [gridData, setGridData] = useState([])

  useEffect(() => {
    getUserStatistics()
  }, [])
  
  const getUserStatistics = async () => {
    try {
        const data = await axios(`/api/users/getUserStatistics/`);
        console.log("data: ", data);
        setGridData(data.data);
        // const userInfo = data[0];
        // setFirstName(userInfo.fname);
        // setLastName(userInfo.lname);
        // setEmail(userInfo.email);
    } catch (e) {
        console.log(e);
    }
};

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const columns = [
    { field: 'detection_id', headerName: 'Detection ID', flex: 0.5 },
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
      <Header
        title="My statistics"
      />
      <Box
        m="0 0 0 0"
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
        }}
      >
        <DataGrid
          rows={gridData}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
          getRowId={(row) => row.detection_id}
        />
      </Box>
    </Box>
  );
};

export default Statistics;
