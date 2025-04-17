import { useState } from 'react'
import Login  from "./pages/Login";
import Signup  from "./pages/Signup";
import Welcome from "./pages/Welcome"; 
import Home from "./pages/Home";
import Test from "./pages/Test"
import Profile from "./pages/Profile";
import Explore from './pages/Explore';
import Settings from './pages/Settings';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserContextProvider, { useUser } from './context/UserContext';

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <UserContextProvider>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/test" element={<Test/>}/>
          <Route path="/profile" element={<Profile/>}/>
          <Route path="/explore" element={<Explore />}/>
          <Route path="/settings" element={<Settings />}/>
        </Routes>
      </UserContextProvider>
    </BrowserRouter>
  )
}

export default App;
