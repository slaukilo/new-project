import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from 'react';
import { accessToken, logout } from './spotify';

function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    setToken(accessToken);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        {!token ? (//if not token login button, else log in
        <a  className="App-link" href='http://localhost:8888/login'>
          Login to Spotify
        </a>
        ) : (
        <>
          <h1>Logged in!</h1>
          <button onClick={logout}>Log out</button>
        </>
        )}
      </header>
    </div>
  );
}

export default App;
