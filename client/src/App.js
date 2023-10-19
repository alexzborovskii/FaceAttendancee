import { useState, useEffect, createContext } from "react";
import { ColorModeContext, useMode } from "./theme.js";
import { Auth } from "./auth/Auth";
import { Routes, Route, useLocation } from "react-router-dom";
import Topbar from "./global/Topbar";
import Sidebar from "./global/Sidebar";
import { CssBaseline, ThemeProvider } from "@mui/material";
import VideoCapture from "./components/VideoCapture";
import ErrorBoundary from "./components/ErrorBoundary";
import LogIn from "./components/Login";
import Register from "./components/Register";
import Statistics from "./components/Statistics";
import AdminStatistics from "./components/AdminStatistics";
import AccountDashboard from "./components/AccountDashboard";
import LayoutFilter from "./auth/LayoutFilter.js";
import ChangePassword from "./components/ChangePassword.js";
import AdminByDayStatistics from "./components/AdminByDayStatistics.js";
import StatisticsByDay from "./components/StatisticsByDay.js";
import InOutChart from "./components/InOutChart.js";
import TimeSpentChart from "./components/TimeSpentChart.js";
import { AdminCheck } from "./auth/AdminCheck.js";
import Charts from "./components/Charts.js";
import AdminCharts from "./components/AdminCharts.js";
export const AppContext = createContext(null);

function App() {
    const [token, setToken] = useState();
    const [theme, colorMode] = useMode();
    const [isSidebar, setIsSidebar] = useState(true);
    const [selected, setSelected] = useState("Dashboard");

    //errorBoubnadry
    const [hasError, setHasError] = useState(false);
    const location = useLocation();

    useEffect(() => {
        if (hasError) setHasError(false);
    }, [location.key]);

    return (
        <ColorModeContext.Provider value={colorMode}>
            <AppContext.Provider value={{ token, setToken, }}>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                        <div className="app">
                            <LayoutFilter>
                                <Sidebar selected={selected} setSelected={setSelected} isSidebar={isSidebar} />
                            </LayoutFilter>

                    <ErrorBoundary
                        hasError={hasError}
                        setHasError={setHasError}>
                            <main className="content">
                                <LayoutFilter>
                                    <Topbar selected={selected} setIsSidebar={setIsSidebar} />
                                </LayoutFilter>

                                <Routes>
                                    <Route
                                        path="/"
                                        element={
                                            <Auth>
                                                <AccountDashboard />
                                            </Auth>
                                        }
                                    />
                                    <Route
                                        path="/charts"
                                        element={
                                            <Auth>
                                                <Charts />
                                            </Auth>
                                        }
                                    />
                                    <Route
                                        path="/adminCharts"
                                        element={
                                            <AdminCheck>
                                                <AdminCharts />
                                            </AdminCheck>
                                        }
                                    />
                                    <Route
                                        path="/statistics"
                                        element={
                                            <Auth>
                                                <Statistics />
                                            </Auth>
                                        }
                                    />
                                    <Route
                                        path="/statisticsByDay"
                                        element={
                                            <Auth>
                                                <StatisticsByDay />
                                            </Auth>
                                        }
                                    />
                                    <Route
                                        path="/adminStatistics"
                                        element={
                                            <AdminCheck>
                                                <AdminStatistics />{" "}
                                            </AdminCheck>
                                        }
                                    />
                                    <Route
                                        path="/adminByDayStatistics"
                                        element={
                                            <AdminCheck>
                                                <AdminByDayStatistics />{" "}
                                            </AdminCheck>
                                        }
                                    />
                                    <Route
                                        path="/lineChart"
                                        element={
                                            <Auth>
                                                <InOutChart />{" "}
                                            </Auth>
                                        }
                                    />
                                    <Route
                                        path="/barChart"
                                        element={
                                            <Auth>
                                                <TimeSpentChart />{" "}
                                            </Auth>
                                        }
                                    />
                                    <Route
                                        path="/videocapture"
                                        element={
                                            <Auth>
                                                <VideoCapture />
                                            </Auth>
                                        }
                                    />
                                    <Route path="/login" element={<LogIn />} />
                                    <Route
                                        path="/register"
                                        element={<Register />}
                                    />
                                    <Route
                                        path="/changepassword"
                                        element={<ChangePassword />}
                                    />
                                </Routes>
                            </main>
                    </ErrorBoundary>    
                        </div>
                </ThemeProvider>
            </AppContext.Provider>
        </ColorModeContext.Provider>
    );
}

export default App;
