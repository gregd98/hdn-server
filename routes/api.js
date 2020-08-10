const express = require('express'),
  cors = require('cors'),
  validate = require('validate.js'),
  db = require('../db/db'),
  passwordUtils = require('../utils/passwordUtils'),
  cnpUtils = require('../utils/cnp'),
  signupConstraints = require('../utils/constraints/signupConstraints'),
  auth = require('../middleware/authorization'),
  rest = require('../utils/rest'),
  teamsRouter = require('./teams'),
  playersRouter = require('./players'),
  gamesRouter = require('./games');

const router = express.Router();

router.use(express.text());

const reactDevCors = {
  origin: 'http://localhost:3000',
  credentials: true,
};

router.use(cors(reactDevCors));

router.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

router.get('/userData', auth.authorize(), (req, res) => {
  db.findPersonById(req.session.userId).then((result) => {
    res.status(200).json({ succeed: true, payload: result });
  }).catch((error) => {
    console.log(error.message);
    res.status(500).json({ succeed: false, authenticated: true, message: 'Internal server error.' });
  });
});

router.post('/login', (req, res) => {
  const data = JSON.parse(req.body);
  console.log(`Username: ${data.username}\nPassword: ${data.password}`);
  db.findLoginDataByUsername(data.username).then((result) => {
    let succeed;
    if (result) {
      succeed = passwordUtils.checkPassword(result, data.password);
    } else {
      succeed = false;
    }
    const obj = { succeed };
    if (succeed) {
      db.insertSession(result.id, req.sessionID).then(() => {
        obj.userData = {
          id: result.id,
          username: result.username,
          firstName: result.firstName,
          lastName: result.lastName,
        };
        res.status(200).json(obj);
      }).catch((error) => {
        console.log(error.message);
        res.status(500).json({ succeed: false, message: 'Internal server error.' });
      });
    } else {
      res.status(200).json({ succeed: false, message: 'Invalid username or password.' });
    }
  }).catch((error) => {
    console.log(error.message);
    res.status(500).json({ succeed: false, message: 'Internal server error.' });
  });
});

router.get('/logout', (req, res) => {
  console.log('Logout called.');
  req.session.destroy();
  db.removeSession(req.sessionID).then(() => {
    res.status(200).json({ succeed: true });
  }).catch((error) => {
    console.log(error.message);
    res.status(200).json({ succeed: false });
  });
});

validate.validators.cnp = (value) => {
  if (!cnpUtils.isValidCNP(value)) {
    return 'Enter a valid CNP.';
  }
  return undefined;
};

validate.validators.password = (value) => {
  if (passwordUtils.calculatePasswordStrength(value) < 2) {
    return 'The password must contain at least two character categories among the following: uppercase characters, lowercase characters, digits, special characters.';
  }
  return undefined;
};

validate.validators.selector = (value) => {
  if (!value) {
    return 'This field is required.';
  }
  return undefined;
};

router.post('/signup', (req, res) => {
  const data = JSON.parse(req.body);
  console.log(data);
  const validation = validate(data, signupConstraints, { fullMessages: false });
  if (validation) {
    Object.entries(validation).forEach(([key, value]) => { [validation[key]] = value; });
    console.log(validation);
    res.status(200).json({ succeed: false, inputErrors: validation });
  } else {
    // TODO itt elore kell tudjuk az eventId-t
    const eventId = Number.parseInt(data.regCode[0], 10);
    db.checkExistence('username', 'Users', data.username, true, {
      username: 'This username is already taken.',
    })
      .then(() => db.checkExistence('email', 'Persons', data.email, true, {
        email: 'This email address is already registered.',
      }, eventId))
      .then(() => db.checkExistence('phone', 'Persons', data.phone, true, {
        phone: 'This phone number is already registered.',
      }, eventId))
      .then(() => db.checkExistence('cnp', 'Persons', data.cnp, true, {
        cnp: 'This CNP is already registered.',
      }, eventId))
      .then(() => db.checkExistence('id', 'ShirtTypes', data.shirtType, false, {
        shirtType: 'Invalid shirt type.',
      }))
      .then(() => db.checkExistence('id', 'ShirtSizes', data.shirtSize, false, {
        shirtType: 'Invalid shirt size.',
      }))
      .then(() => {
        data.passwordData = passwordUtils.hashPassword(data.password);
        db.insertPersonUser({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          email: data.email,
          cnp: data.cnp,
          // TODO itt is majd a jo eventId-t kell visszaadni
          eventId,
          username: data.username,
          pwdHash: data.passwordData.hash,
          pwdSalt: data.passwordData.salt,
          pwdIterations: data.passwordData.iterations,
          shirtTypeId: data.shirtType,
          shirtSizeId: data.shirtSize,
          postId: 2,
          roleId: 1,
        }).then(() => {
          res.status(200).json({ succeed: true });
        }).catch((error) => {
          console.log(error.message);
          res.status(500).json({ succeed: false, message: 'Internal server error.' });
        });
      })
      .catch((error) => {
        if (error instanceof Error) {
          console.log(error.message);
          res.status(500).json({ succeed: false, message: 'Internal server error.' });
        } else {
          console.log(error);
          res.status(200).json({ succeed: false, inputErrors: error });
        }
      });
  }
});

router.get('/shirtTypes', (req, res) => {
  rest.restGetCall(db.findAllShirtTypes, req, res);
});

router.get('/shirtSizes', (req, res) => {
  rest.restGetCall(db.findAllShirtSizes, req, res);
});

router.get('/posts',  auth.authorize(), (req, res) => {
  rest.restGetCall(db.findAllPosts, req, res);
});

router.get('/users', auth.authorize(), (req, res) => {
  rest.restGetCall(() => db.findAllUsers(req.session.eventId), req, res);
});

const mySleep = () => {
  for (let i = 1; i < 500000; i += 1) {
    console.log(Math.sqrt(i));
  }
};

router.get('/leaderContacts', auth.authorize(1), (req, res) => {
  rest.restGetCall(() => db.findAllLeaderContacts(req.session.eventId), req, res);
});

router.use('/teams', teamsRouter);
router.use('/players', playersRouter);
router.use('/games', gamesRouter);

module.exports = router;
