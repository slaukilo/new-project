require('dotenv').config()
const express = require('express');
const app = express();
const port = 8888;

console.log(process.env.CLIENT_ID);

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;


//simple router handler for index page

app.get('/', (req, res) => {
  res.send('Welcome to the index page!');
});

app.get('/login', (req, res) => {
    res.redirect(`https://accounts.spotify.com/authorize?
    client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}`);
});

//connection listener
app.listen(port, () => {
    console.log(`Express app listening at http://localhost:${port}`);
});