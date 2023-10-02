import {useState, createContext} from 'react';
import { Auth } from './auth/Auth';
import {Routes, Route} from 'react-router-dom'
import VideoCapture from './components/VideoCapture';
import Nav from './components/Nav';
import AccountScreen from './components/AccountScreen';
// import AddUser from './components/AddUser';
import Samples from './components/Samples';
import LogIn from './components/Login';
import Register from './components/Register';
import Statistics from './components/Statistics';
import AdminStatistics from './components/AdminStatistics';
import AccountDashboard from './components/AccountDashboard';
export const AppContext = createContext(null);


function App() {
  const [token, setToken] = useState();

  return (
    <AppContext.Provider value={({token, setToken})} > 
      <Nav />
    <div className="App">
      <Routes>
        <Route path='/account' element={<AccountDashboard />}/>
        <Route path='/statistics' element={<Auth><Statistics /></Auth>} />
        <Route path='/adminStatistics' element={<Auth><AdminStatistics /> </Auth>} />
        <Route path='/videocapture' element={<Auth><VideoCapture /></Auth>} />
        <Route path='/login' element={<LogIn />}/>
        <Route path='/register' element={<Register />}/>
      </Routes>
    </div>

    </AppContext.Provider>
    );
  }

export default App;