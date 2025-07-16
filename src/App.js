import './App.css';
import React, { useState, useEffect } from 'react';
import { login, logout, handleAuthentication } from './Auth';
import VideoUpload from './VideoUpload';
import UserClips from './UserClips'; 

function App() {
  const [user, setUser] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    const initAuth = async () => {
      const identityId = await handleAuthentication();
      if (identityId) {
        setUser(identityId);
        window.history.replaceState({}, document.title, '/');
      }
    };
    initAuth();
  }, []);

  const handleLogin = () => {
    login();
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    localStorage.removeItem('id_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  const handleRefresh = () => {
    setRefreshCount((prevCount) => prevCount + 1);
  };

  return (
    <>
      <div class="welcomemsg">
        Welcome to ViralHive.pro
      </div>
      <div className="App">
        <h2 style={{ marginBottom: '40px' }}>Video Uploader</h2>
        {user ? (
          <>
            {/* <p>Welcome, user with identity ID: {user}</p> */}
            <div style={{ marginTop: '5px' }}>
              <button onClick={handleLogout} style={{ marginLeft: '35px', marginBottom: '15px' }}>Logout</button>
              <button onClick={handleRefresh} style={{ marginLeft: '195px' }}>
                Refresh Clips
              </button>
            </div>
            <div>
              <VideoUpload />
            </div>
          </>
        ) : (
          <button onClick={handleLogin}>Login</button>
        )}
      </div>
      <div style={{ marginTop: '40px' }}></div> {/* Add this div for separation */}
      {user && <UserClips userId={user} refresh={refreshCount}/>}
    </>
  );
}

export default App;
