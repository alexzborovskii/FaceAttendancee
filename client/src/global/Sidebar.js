import { useState } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import PasswordIcon from "@mui/icons-material/Password";
import { AdminCheck } from "../auth/AdminCheck";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import SsidChartIcon from "@mui/icons-material/SsidChart";
import VideoCameraFrontIcon from "@mui/icons-material/VideoCameraFront";
import InsightsIcon from "@mui/icons-material/Insights";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DateRangeIcon from "@mui/icons-material/DateRange";
import TimelineIcon from "@mui/icons-material/Timeline";
import Copyright from "../components/Copyright";

const Item = ({ title, to, icon, selected, setSelected }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    return (
        <MenuItem
            active={selected === title}
            style={{
                color: colors.grey[100],
            }}
            onClick={() => setSelected(title)}
            icon={icon}>
            <Typography>{title}</Typography>
            <Link to={to} />
        </MenuItem>
    );
};

const Sidebar = (props) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { selected, setSelected } = props;
    return (
        <Box
            sx={{
                "& .pro-sidebar-inner": {
                    background: `${colors.primary[400]} !important`,
                },
                "& .pro-icon-wrapper": {
                    backgroundColor: "transparent !important",
                },
                "& .pro-inner-item": {
                    padding: "5px 35px 5px 20px !important",
                },
                "& .pro-inner-item:hover": {
                    color: "#868dfb !important",
                },
                "& .pro-menu-item.active": {
                    color: "#6870fa !important",
                },
            }}>
            <ProSidebar collapsed={isCollapsed} sx={{ position: "relative" }}>
                <Menu iconShape="square">
                    {/* LOGO AND MENU ICON */}
                    <MenuItem
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
                        style={{
                            margin: "10px 0 10px 0",
                            color: colors.grey[100],
                        }}>
                        {!isCollapsed && (
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                ml="15px">
                                <Typography
                                    variant="h3"
                                    color={colors.grey[100]}>
                                    FaceAttendance
                                </Typography>
                                <IconButton
                                    onClick={() =>
                                        setIsCollapsed(!isCollapsed)
                                    }>
                                    <MenuOutlinedIcon />
                                </IconButton>
                            </Box>
                        )}
                    </MenuItem>

                    <Box paddingLeft={isCollapsed ? undefined : "10%"}>
                        <Item
                            title="Account"
                            to="/"
                            icon={<HomeOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />
                        <Item
                            title="Charts"
                            to="/charts"
                            icon={<TimelineIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />
                        <AdminCheck>
                            <Item
                                title="Admin Charts"
                                to="/adminCharts"
                                icon={<InsightsIcon />}
                                selected={selected}
                                setSelected={setSelected}
                            />
                        </AdminCheck>

                        <Typography
                            variant="h6"
                            color={colors.grey[300]}
                            sx={{ m: "5px 0 5px 20px" }}>
                            Statistics
                        </Typography>
                        <AdminCheck>
                            <Item
                                title="Admin"
                                to="/adminStatistics"
                                icon={<PeopleOutlinedIcon />}
                                selected={selected}
                                setSelected={setSelected}
                            />
                            <Item
                                title="Admin by day"
                                to="/AdminByDayStatistics"
                                icon={<CalendarMonthIcon />}
                                selected={selected}
                                setSelected={setSelected}
                            />
                        </AdminCheck>
                        <Item
                            title="My data"
                            to="/statistics"
                            icon={<ContactsOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />
                        <Item
                            title="My data by day"
                            to="/statisticsByDay"
                            icon={<DateRangeIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />
                        <Typography
                            variant="h6"
                            color={colors.grey[300]}
                            sx={{ m: "5px 0 5px 20px" }}>
                            Charts
                        </Typography>
                        <Item
                            title="In & Out"
                            to="/lineChart"
                            icon={<SsidChartIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />
                        <Item
                            title="Time spent"
                            to="/barChart"
                            icon={<SignalCellularAltIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />
                        <Typography
                            variant="h6"
                            color={colors.grey[300]}
                            sx={{ m: "5px 0 5px 20px" }}>
                            Video
                        </Typography>
                        <Item
                            title="Video Capture"
                            to="/videocapture"
                            icon={<VideoCameraFrontIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />
                        <Typography
                            variant="h6"
                            color={colors.grey[300]}
                            sx={{ m: "15px 0 5px 20px" }}>
                            Account
                        </Typography>
                        <Item
                            title="Change password"
                            to="/changepassword"
                            icon={<PasswordIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />
                    </Box>
                </Menu>
                {/* {!isCollapsed && <Copyright sx={{justifySelf: "flex-end"}} />} */}
            </ProSidebar>
        </Box>
    );
};

export default Sidebar;
