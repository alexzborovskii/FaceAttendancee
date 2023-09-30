import {useState, createContext} from 'react';
import { Auth } from './auth/Auth';
import {Routes, Route} from 'react-router-dom'
import VideoCapture from './components/VideoCapture';
import Nav from './components/Nav';
import LoginRegister from '../src/components/LoginRegister.js'
import AccountScreen from './components/AccountScreen';
import AddUser from './components/AddUser';
import Samples from './components/Samples';
import LogIn from './components/Login';
import Logout from './components/Logout';

export const AppContext = createContext(null);


function App() {
  const [token, setToken] = useState();

  return (
    <AppContext.Provider value={({token, setToken})} > 
      <Nav />
    <div className="App">
      <Routes>
        <Route path='/' element={<Auth><AccountScreen /><Samples /></Auth>} />
        <Route path='/videocapture' element={<Auth><VideoCapture /></Auth>} />
        <Route path='/adduser' element={<Auth><AddUser /> </Auth>} />
        <Route path='/loginR' element={<LoginRegister title="LoginR" />}/>
        <Route path='/login' element={<LogIn />}/>
        <Route path='/registerL' element={<LoginRegister title="RegisterL" />}/>
        {/* <Route path='/logout' element={<Logout />}/> */}
      </Routes>
    </div>

    </AppContext.Provider>
    );
  }

export default App;