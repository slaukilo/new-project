require('dotenv').config();
const express = require('express');
const app = express();
const port = 8888;

const axios = require('axios');
const querystring = require('querystring');
const params = new URLSearchParams();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

/* Generate a random string of numbers and letters
@param {number} length the length of the string
@return {string} the generated random string
*/
const generateRandomString = (length) => {
  let result = '';
  const possibilites = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    result += possibilites.charAt(Math.floor(Math.random() * possibilites.length));
  }
  return result;
};

// cookie name that will hold the auth state
const stateKey = 'spotify_auth_state';

// home page
app.get('/', (req, res) => {
  res.send('Welcome to the index page!');
});

//login authorization page
app.get('/login', (req, res) => {
  const state = generateRandomString(16);
  res.cookie(stateKey, state);
  const scope = 'user-read-private user-read-email';

  const queryParams = querystring.stringify({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    state: state,
    scope: scope
  });
  res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
});

//callback route handler for OAuth flow
app.get('/callback', (req, res) => {
  const code = req.query.code || null;

  axios({
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    data: querystring.stringify({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI
    }),
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
    },
  })
    .then(response => {//client uses access token to request data from Spotify
      if (response.status === 200) {
        const { access_token, token_type } = response.data;

        axios.get('https://api.spotify.com/v1/me', {
          headers: {
            Authorization: `${token_type} ${access_token}`
          }
        })
          .then(response => {
            res.send(`<pre>${JSON.stringify(response.data, null, 2)}</pre>`);
          })
          .catch(error => {
            res.send(error);
          });
      } else {
        res.send(response);
      }
    })
    .catch(error => {
      res.send(error);
    });
});

//refresh token route handler for behind the scenes new token retrieval
app.get('/refresh_token', (req, res) => {
  const { refresh_token } = req.query;

  axios({
    method: 'post',
    url: 'http://accounts.spotify/api/token',
    data: querystring.stringify({
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    }),
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${new Buffer.from(
        `${CLIENT_ID}:${CLIENT_SECRET}`
      ).toString('base64')}`
    }
  })
    .then((response) => {
      res.send(response.data);
    })
    .catch((error) => {
      res.send(error);
    });
});

/*
//callback route handler
app.get('/callback', (req, res) => {
  const code = req.query.code || null;
  axios.post('https://accounts.spotify.com/api/token', {
    data: querystring.stringify({
      grant_type: 'authorizaton_code',
      code: code,
      redirect_uri: REDIRECT_URI
  })}, {
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`
    }
  })
  .then((response) => {
    if (response.status === 200) {
      res.send(`<pre>${JSON.stringify(response.data, null, 2)}</pre>`);
    } else {
      res.send(response);
    }
  })
  .catch((error) => {
    res.send(error);
    console.log(error.response);
  })
});
*/

//connection listener
app.listen(port, () => {
  console.log(`Express app listening at http://localhost:${port}`);
});