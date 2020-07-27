const express = require('express'),
  path = require('path'),
  organizerRoutes = require('./routes/organizer_app');

const PORT = 80;
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.use('/organizer', organizerRoutes);

app.get('/', (req, res) => {
  console.log('Redirecting');
  res.redirect('/organizer');
});

app.listen(PORT, () => { console.log(`Server listening on port ${PORT}.`); });
