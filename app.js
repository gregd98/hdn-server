const express = require('express'),
  session = require('express-session'),
  path = require('path'),
  organizerRoutes = require('./routes/organizer_app'),
  apiRoutes = require('./routes/api');

const PORT = 80;
const app = express();

app.use(session({
  secret: 'super secret',
  cookie: { maxAge: 43200000 },
  resave: false,
  saveUninitialized: true,
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/organizer', organizerRoutes);
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  console.log('Redirecting');
  res.redirect('/organizer');
});

app.listen(PORT, () => { console.log(`Server listening on port ${PORT}.`); });
