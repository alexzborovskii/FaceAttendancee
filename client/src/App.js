import { useState, useEffect, createContext } from "react";
import { ColorModeContext, useMode } from "./theme.js";
import { Auth } from "./auth/Auth";
import { Routes, Route, useLocation } from "react-router-dom";
import Topbar from "./global/Topbar";
import Sidebar from "./global/Sidebar";
import { CssBaseline, ThemeProvider } from "@mui/material";
import VideoCapture from "./components/VideoCapture";
import ErrorBoundary from "./components/ErrorBoundary";
// import Nav from "./components/Nav";
import LogIn from "./components/Login";
import Register from "./components/Register";
import Statistics from "./components/Statistics";
import AdminStatistics from "./components/AdminStatistics";
import AccountDashboard from "./components/AccountDashboard";
import LayoutFilter from "./auth/LayoutFilter.js";
export const AppContext = createContext(null);

function App() {
    const [token, setToken] = useState();
    const [theme, colorMode] = useMode();
    const [isSidebar, setIsSidebar] = useState(true);
    //errorBoubnadry
    const [hasError, setHasError] = useState(false);
    const location = useLocation();

    useEffect(() => {
        if (hasError) setHasError(false);
    }, [location.key]);

    return (
        <ColorModeContext.Provider value={colorMode}>
            <AppContext.Provider value={{ token, setToken }}>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                        <div className="app">
                            <LayoutFilter>
                                <Sidebar isSidebar={isSidebar} />
                            </LayoutFilter>

                    <ErrorBoundary
                        hasError={hasError}
                        setHasError={setHasError}>
                            <main className="content">
                                <LayoutFilter>
                                    <Topbar setIsSidebar={setIsSidebar} />
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
                                        path="/statistics"
                                        element={
                                            <Auth>
                                                <Statistics />
                                            </Auth>
                                        }
                                    />
                                    <Route
                                        path="/adminStatistics"
                                        element={
                                            <Auth>
                                                <AdminStatistics />{" "}
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
