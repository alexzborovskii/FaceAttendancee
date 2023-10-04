import { useState, createContext } from "react";
import { ColorModeContext, useMode } from "./theme.js";
import { Auth } from "./auth/Auth";
import { Routes, Route } from "react-router-dom";
import Topbar from "./global/Topbar";
import Sidebar from "./global/Sidebar";
import { CssBaseline, ThemeProvider } from "@mui/material";
import VideoCapture from "./components/VideoCapture";
// import Nav from "./components/Nav";
import LogIn from "./components/Login";
import Register from "./components/Register";
import Statistics from "./components/Statistics";
import AdminStatistics from "./components/AdminStatistics";
import AccountDashboard from "./components/AccountDashboard";
export const AppContext = createContext(null);

function App() {
    const [token, setToken] = useState();
    const [theme, colorMode] = useMode();
    const [isSidebar, setIsSidebar] = useState(true);

    return (
        <ColorModeContext.Provider value={colorMode}>
            <AppContext.Provider value={{ token, setToken }}>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <div className="App">
                        <Sidebar isSidebar={isSidebar} />

                        <main className="content">
                            <Topbar setIsSidebar={setIsSidebar} />

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
                    </div>
                </ThemeProvider>
            </AppContext.Provider>
        </ColorModeContext.Provider>
    );
}

export default App;
