import { Box, IconButton, useTheme } from "@mui/material";
import { useContext } from "react";
import { ColorModeContext, tokens } from "../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LogoutIcon from '@mui/icons-material/Logout';

import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../App";

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);

  const { setToken } = useContext(AppContext);
  const navigate = useNavigate();


  const logout = async () => {
      try {
          const res = await axios.get("/api/users/logout", {
              headers: {
                  "x-access-token": null,
              },
          });
          if (res.status === 200) {
              setToken(null);
              navigate("/login");
          }
      } catch (err) {
          setToken(null);
          navigate("/login");
      }
  };

  
  return (
    <Box display="flex" justifyContent="flex-end" p={2}>

      {/* ICONS */}
      <Box display="flex" justifySelf="flex-end">
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon /> 
          )}
        </IconButton>
        <IconButton onClick={logout}>
          <LogoutIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Topbar;
