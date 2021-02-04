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
  gamesRouter = require('./games/games'),
  invitationsRouter = require('./invitations'),
  eventsRouter = require('./events'),
  { PERM_TEAMS_DATA_ACCESS, PERM_SCORE_TABLE_ACCESS, PERM_SYSTEM_ADMIN } = require('../constants'),
  responses = require('../utils/responses');

const router = express.Router();

router.use(express.text());

const reactDevCors = {
  origin: 'http://localhost:3000',
  credentials: true,
};

router.use(cors(reactDevCors));

router.get('/userData', auth.authorize(), (req, res) => {
  rest.restGetCall(() => db.findPersonById(req.session.userId), req, res);
});

router.post('/login', (req, res) => {
  const data = JSON.parse(req.body);
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
        responses.internalServerError(res);
      });
    } else {
      res.status(401).json({ succeed: false, authenticated: true, message: 'Invalid username or password.' });
    }
  }).catch((error) => {
    console.log(error.message);
    responses.internalServerError(res);
  });
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  db.removeSession(req.sessionID).then(() => {
    responses.succeed(res);
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

router.get('/regKey', (req, res) => {
  const { key } = req.query;
  if (key && key.length > 0 && key.length <= 128) {
    rest.restGetCall(() => db.checkRegKey(key), req, res);
  } else {
    responses.badRequest(res);
  }
});

router.put('/signup', (req, res) => {
  const regKey = req.query.key;
  const data = JSON.parse(req.body);
  if (regKey && regKey.length > 0 && regKey.length <= 128) {
    db.findRegKeyByKey(regKey).then((result) => {
      if (result.length > 0) {
        const [keyData] = result;
        const {
          id, postId, roleId, eventId, singleUse,
        } = keyData;

        const validation = validate(data, signupConstraints, { fullMessages: false });
        if (validation) {
          Object.entries(validation).forEach(([key, value]) => { [validation[key]] = value; });
          res.status(200).json({ succeed: false, inputErrors: validation });
        } else {
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
                eventId,
                username: data.username,
                pwdHash: data.passwordData.hash,
                pwdSalt: data.passwordData.salt,
                pwdIterations: data.passwordData.iterations,
                shirtTypeId: data.shirtType,
                shirtSizeId: data.shirtSize,
                postId,
                roleId,
                regKeyId: id,
                singleUse,
              }).then(() => {
                responses.succeed(res);
              }).catch((error) => {
                console.log(error.message);
                responses.internalServerError(res);
              });
            })
            .catch((error) => {
              if (error instanceof Error) {
                console.log(error.message);
                responses.internalServerError(res);
              } else {
                responses.inputErrors(res, error);
              }
            });
        }
      } else {
        responses.badRequest(res);
      }
    });
  } else {
    responses.badRequest(res);
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

router.get('/leaderContacts', auth.authorize(PERM_TEAMS_DATA_ACCESS), (req, res) => {
  rest.restGetCall(() => db.findAllLeaderContacts(req.session.eventId), req, res);
});

router.get('/days', auth.authorize(), (req, res) => {
  rest.restGetCall(() => db.findAllDays(req.session.eventId), req, res);
});

router.get('/userPermissions', auth.authorize(), (req, res) => {
  rest.restGetCall(() => db.findPermissionsByUserId(req.session.userId), req, res);
});

router.get('/scores', auth.authorize(PERM_SCORE_TABLE_ACCESS), (req, res) => {
  rest.restGetCall(() => db.findAllScores(req.session.eventId), req, res);
});

router.get('/posts', auth.authorize(), (req, res) => {
  rest.restGetCall(() => db.findAllPosts(), req, res);
});

router.get('/roles', auth.authorize(), (req, res) => {
  rest.restGetCall(() => db.findAllRoles(), req, res);
});

router.use('/teams', teamsRouter);
router.use('/players', playersRouter);
router.use('/games', gamesRouter);
router.use('/invitations', invitationsRouter);
router.use('/events', eventsRouter);
module.exports = router;
