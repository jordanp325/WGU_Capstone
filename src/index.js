import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from './pages/home';
import Signup from './pages/signup';
import Login from './pages/login';
import Profile from './pages/profile';
import LobbyBrowser from './pages/lobbyBrowser';
import HistoryBrowser from './pages/historyBrowser';
import CreateLobby from './pages/createLobby';
import Play from './pages/play';
import ViewGame from './pages/viewGame';

const router = createBrowserRouter([
  {
      path: "/",
      element: <Home/>
  },
  {
      path: "/signup",
      element: <Signup/>
  },
  {
      path: "/login",
      element: <Login/>
  },
  {
      path: "/profile",
      element: <Profile/>
  },
  {
      path: "/lobbybrowser",
      element: <LobbyBrowser/>
  },
  {
      path: "/gamehistory",
      element: <HistoryBrowser/>
  },
  {
      path: "/createlobby",
      element: <CreateLobby/>
  },
  {
      path: "/play",
      element: <Play/>
  },
  {
      path: "/viewgame",
      element: <ViewGame/>
  },
])

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <div id='headbar'>
      <div>
        <img src='./pieces/Chess_klt45.svg' alt='icon' draggable='false' />
        <p className='clickable' onClick={() => window.location.pathname = '/'}>Home</p>
        <p className='clickable' onClick={() => window.location.pathname = (Object.fromEntries(document.cookie.split('; ').map(c => c.split('=')))['sessionToken'] ? '/lobbybrowser' : '/login')}>Play</p>
      </div>
      <div>
        {Object.fromEntries(document.cookie.split('; ').map(c => c.split('=')))['sessionToken'] ?<div>
          <p id='gameHistoryButton' className='clickable' onClick={() => window.location.pathname = '/gamehistory'}>Game history</p> 
          <p className='clickable' onClick={() => window.location.pathname = '/profile'}>View profile</p> 
        </div>:<div>
          <button className='clickable' onClick={() => window.location.pathname = '/login'}>Log in</button>
          <p>or</p> 
          <button className='clickable' onClick={() => window.location.pathname = '/signup'}>Sign up</button>
        </div>}
      </div>
    </div>
    <RouterProvider router={router}/>
  </React.StrictMode>
);

