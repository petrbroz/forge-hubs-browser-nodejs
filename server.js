const express = require('express');
const session = require('cookie-session');
const parser = require('body-parser');
const { PORT, SERVER_SESSION_SECRET } = require('./config.js');

let app = express();
app.use(express.static('wwwroot'));
app.use(session({ secret: SERVER_SESSION_SECRET, maxAge: 24 * 60 * 60 * 1000 }));
app.use(parser.json());
app.use('/api/auth', require('./routes/auth.js'));
app.use('/api/hubs', require('./routes/hubs.js'));
app.use('/api/props', require('./routes/props.js'));
app.listen(PORT, () => console.log(`Server listening on port ${PORT}...`));
