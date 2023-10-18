import { Box, IconButton, useTheme } from "@mui/material";
import { useContext } from "react";
import { ColorModeContext, tokens } from "../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LogoutIcon from "@mui/icons-material/Logout";

import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../App";
import Header from "../components/Header";

const Topbar = (props) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const colorMode = useContext(ColorModeContext);

    const { setToken } = useContext(AppContext);
    const { selected } = props;
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
        <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" p={2}>
            {/* Page name */}

            <Box >
                <Header title={selected} />
            </Box>

            {/* ICONS */}
            <Box display="flex" >
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
