import {useState, createContext} from 'react';
import { Auth } from './auth/Auth';
import {Routes, Route} from 'react-router-dom'
import VideoCapture from './components/VideoCapture';
import Nav from './components/Nav';
import AccountScreen from './components/AccountScreen';
import AddUser from './components/AddUser';
import Samples from './components/Samples';
import LogIn from './components/Login';
import Register from './components/Register';


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
        <Route path='/login' element={<LogIn />}/>
        <Route path='/register' element={<Register />}/>
      </Routes>
    </div>

    </AppContext.Provider>
    );
  }

export default App;