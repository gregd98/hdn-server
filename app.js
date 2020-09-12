const express = require('express'),
  session = require('express-session'),
  path = require('path'),
  fs = require('fs'),
  morgan = require('morgan'),
  organizerRoutes = require('./routes/organizer_app'),
  apiRoutes = require('./routes/api'),
  db = require('./db/db');

const PORT = 80;
const app = express();

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));

db.removeAllSessions().catch((error) => {
  console.log(error.message);
});

app.use(session({
  secret: 'super secret',
  cookie: { maxAge: 43200000 },
  resave: false,
  saveUninitialized: true,
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/organizer', organizerRoutes);
app.use('/api', apiRoutes);

app.get('/*', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, './public', 'index.html'));
});

app.listen(PORT, () => { console.log(`Server listening on port ${PORT}.`); });
