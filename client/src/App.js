import './App.css';
import { useState, useEffect } from 'react';
import { accessToken, logout, getCurrentUserProfile } from './spotify';

function App() {
  const [token, setToken] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    setToken(accessToken);
    // Fetch user profile data with Promise
    const fetchData = async () => {
      try {
        const { data } = await getCurrentUserProfile();
        setProfile(data);
      } catch (e) {
        console.error(e);
      }
    };

    fetchData();
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
          <button onClick={logout}>Log out</button>
          {profile && (//Display Profile Data
            <div>
              <h1>{profile.display_name}</h1>
              <p>{profile.followers.total} Followers</p>
              {profile.images.length && profile.images[0].url && (
                <img src={profile.images[0].url} alt="Avatar"/>
              )}
            </div>
          )}
        </>
        )}
      </header>
    </div>
  );
}

export default App;
