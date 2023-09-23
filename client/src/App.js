import {useState, createContext} from 'react';
import { Auth } from './auth/Auth';
import {Routes, Route} from 'react-router-dom'
import VideoCapture from './components/VideoCapture';
import Nav from './components/Nav';
import LoginRegister from '../src/components/LoginRegister.js'
import HomeScreen from './components/HomeScreen';
import AddUser from './components/AddUser';

export const AppContext = createContext(null);


function App() {
  const [token, setToken] = useState();

  return (
    <AppContext.Provider value={({token, setToken})} >
      <Nav />
    <div className="App">
      <Routes>
        <Route path='/' element={<Auth><HomeScreen /></Auth>} />
        <Route path='/videocapture' element={<Auth><VideoCapture /></Auth>} />
        <Route path='/adduser' element={<Auth><AddUser /> </Auth>} />
        <Route path='/login' element={<LoginRegister title="Login" />}/>
        <Route path='/register' element={<LoginRegister title="Register" />}/>
      </Routes>
    </div>

    </AppContext.Provider>
    );
  }

export default App;