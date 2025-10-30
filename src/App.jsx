import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Client } from "appwrite";
import authservice from './appwrite/auth.js';
import { login, logout } from './store/authSlice.js';
import { Header, Footer , Loading} from './components';
import { Outlet } from 'react-router-dom';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    authservice.getCurrentUser()
      .then((userData) => {
        if (userData) {
          setUser(userData);
          dispatch(login({ userData }));
        } else {
          setUser(null);
          dispatch(logout());
        }
      })
      .catch((err) => {
        console.warn("Guest user, skipping login:", err);
        setUser(null);
        dispatch(logout());
      })
      .finally(() => setLoading(false));
  }, [dispatch]);

  if (loading) return <Loading/>;
  if (!navigator.onLine) return <div>No internet connection</div>;


return (
  <div className="min-h-screen flex flex-col bg-gray-100 overflow-x-hidden">
    <Header user={user} />

    <main className="grow">
      <Outlet context={{ user }} />
    </main>

    <Footer />
  </div>
);

}

export default App;
