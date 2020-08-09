const mysql  = require('mysql');

const pool = mysql.createPool({
  connectionLimit: 10,
  database: 'hdn',
  host: 'localhost',
  port: 3306,
  user: 'devUser',
  password: 'kecske123',
  dateStrings: [
    'DATE',
    'DATETIME',
  ],
});

exports.findLoginDataByUsername = (username) => new Promise((resolve, reject) => {
  const query = `
  select a.id, a.username, b.firstName, b.lastName, a.pwdHash as hash, a.pwdSalt as salt, a.pwdIterations as iterations 
  from Users as a 
  join Persons as b 
  on a.id = b.id 
  where a.username = ${mysql.escape(username)};`;

  pool.query(query, (error, result) => {
    if (error) {
      reject(error);
    } else if (result.length > 0) {
      resolve(result[0]);
    } else {
      resolve(false);
    }
  });
});

exports.insertSession = (userId, sessionId) => new Promise((resolve, reject) => {
  const query = `insert into Sessions (userId, sessionId) values (${mysql.escape(userId)}, ${mysql.escape(sessionId)});`;
  pool.query(query, (error) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });
});

exports.findPersonById = (id) => new Promise((resolve, reject) => {
  const query = `select id, firstName, lastName from Persons where id = ${id}`;
  pool.query(query, (error, result) => {
    if (error) {
      reject(error);
    } else if (result.length > 0) {
      resolve(result[0]);
    } else {
      reject(Error('db.findPersonById: Invalid userId after auth.'));
    }
  });
});

exports.removeSession = (sessionId) => new Promise((resolve, reject) => {
  const query = `update Sessions set active = 0 where sessionId = ${mysql.escape(sessionId)};`;
  pool.query(query, (error) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });
});

exports.removeAllSessions = () => new Promise((resolve, reject) => {
  const query = 'update Sessions set active = 0;';
  pool.query(query, (error) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });
});

exports.checkExistence = (col, table, value, reverse, onError, conn = pool) => new Promise(
  (resolve, reject) => {
    console.log('checkExistence');
    const query = `select count(*) as count from ${table} where ${col} = ${mysql.escape(value)};`;
    conn.query(query, (error, result) => {
      if (error) {
        reject(error);
      } else if (parseInt(result[0].count, 10) === 0) {
        if (reverse) {
          resolve();
        } else {
          reject(onError);
        }
      } else if (reverse) {
        reject(onError);
      } else {
        resolve();
      }
    });
  },
);

exports.insertPersonUser = (input) => new Promise((resolve, reject) => {
  const query = `call insertPerson(
  ${mysql.escape(input.firstName)}, 
  ${mysql.escape(input.lastName)}, 
  ${mysql.escape(input.phone)},
  ${mysql.escape(input.email)},
  ${mysql.escape(input.cnp)},
  ${mysql.escape(input.username)},
  ${mysql.escape(input.pwdHash)}, 
  ${mysql.escape(input.pwdSalt)},
  ${mysql.escape(input.pwdIterations)},
  ${mysql.escape(input.shirtTypeId)},
  ${mysql.escape(input.shirtSizeId)},
  ${mysql.escape(input.postId)}, 
  ${mysql.escape(input.roleId)});`;

  pool.query(query, (error) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });
});

exports.findAllShirtTypes = () => new Promise((resolve, reject) => {
  const query = 'select id, name from ShirtTypes order by id';
  pool.query(query, (error, result) => {
    if (error) {
      reject(error);
    } else {
      resolve(result);
    }
  });
});

exports.findAllShirtSizes = () => new Promise((resolve, reject) => {
  const query = 'select id, name from ShirtSizes order by id';
  pool.query(query, (error, result) => {
    if (error) {
      reject(error);
    } else {
      resolve(result);
    }
  });
});

exports.findAllPosts = () => new Promise((resolve, reject) => {
  const query = 'select id, name from Posts order by id';
  pool.query(query, (error, result) => {
    if (error) {
      reject(error);
    } else {
      resolve(result);
    }
  });
});

exports.findAllUsers = () => new Promise((resolve, reject) => {
  const query = 'select a.id, b.postId, a.firstName, a.lastName, a.phone, a.email '
    + 'from Persons as a '
    + 'join Users as b '
    + 'on a.id = b.id '
    + 'order by a.lastName;';

  pool.query(query, (error, result) => {
    if (error) {
      reject(error);
    } else {
      resolve(result);
    }
  });
});

exports.findUserIdBySessionId = (sessionId) => new Promise((resolve, reject) => {
  const query = `call findUserIdBySessionId(${mysql.escape(sessionId)});`;
  pool.query(query, (error, result) => {
    if (error) {
      reject(error);
    } else if (result[0].length > 0) {
      resolve(result[0][0].userId);
    } else {
      resolve(false);
    }
  });
});

exports.checkUserPermission = (userId, permissionId) => new Promise((resolve, reject) => {
  const query = `call checkUserPermission(${mysql.escape(userId)}, ${mysql.escape(permissionId)});`;
  pool.query(query, (error, result) => {
    if (error) {
      reject(error);
    } else if (result[0].length > 0) {
      resolve(result[0][0].result > 0);
    } else {
      reject(Error('SQL error: count(*) has no return value.'));
    }
  });
});

exports.findAllTeams = () => new Promise((resolve, reject) => {
  const query = 'select id, name from Teams order by name;';
  pool.query(query, (error, result) => {
    if (error) {
      reject(error);
    } else {
      resolve(result);
    }
  });
});

exports.findAllLeaderContacts = () => new Promise((resolve, reject) => {
  const query = 'select b.phone, b.email from Players as a join Persons as b on a.personId = b.id where a.rankId > 0;';
  pool.query(query, (error, result) => {
    if (error) {
      reject(error);
    } else {
      const phone = [],
        email = [];
      result.forEach((contact) => {
        phone.push(contact.phone);
        email.push(contact.email);
      });
      resolve({ phone, email });
    }
  });
});

exports.findTeamById = (id) => new Promise((resolve, reject) => {
  const query = `select id, name, city from Teams where id = ${mysql.escape(id)};`;
  pool.query(query, (error, result) => {
    if (error) {
      reject(error);
    } else if (result.length > 0) {
      resolve(result[0]);
    } else {
      resolve(false);
    }
  });
});

exports.findPlayersByTeamId = (id) => new Promise((resolve, reject) => {
  const query = `call findPlayersByTeamId(${mysql.escape(id)});`;
  pool.query(query, (error, result) => {
    if (error) {
      reject(error);
    } else {
      resolve(result[0]);
    }
  });
});

exports.findAllPlayers = () => new Promise((resolve, reject) => {
  const query = 'call findAllPlayers();';
  pool.query(query, (error, result) => {
    if (error) {
      reject(error);
    } else {
      resolve(result[0]);
    }
  });
});

exports.findPlayerById = (id) => new Promise((resolve, reject) => {
  const query = `
  select b.id, a.rankId, b.lastName, b.firstName, b.phone, b.email, b.cnp, c.name team 
  from Players as a
  join Persons as b
  on a.personId = b.id
  join Teams as c
  on a.teamId = c.id
  where b.id = ${mysql.escape(id)}
  order by concat(b.lastName, ' ', b.firstName) asc;`;
  pool.query(query, (error, result) => {
    if (error) {
      reject(error);
    } else if (result.length > 0) {
      resolve(result[0]);
    } else {
      resolve(false);
    }
  });
});

exports.findAllGames = () => new Promise((resolve, reject) => {
  const query = 'call findAllGames();';
  pool.query(query, (error, result) => {
    if (error) {
      reject(error);
    } else if (result[0].length > 0) {
      console.log(result[0]);
      const output = [];
      let lastId = 0;
      result[0].forEach((item) => {
        if (item.id !== lastId) {
          lastId = item.id;
          const tmp = {
            id: item.id,
            name: item.name,
            description: item.description,
            notes: item.notes,
            playerCount: item.playerCount,
            maxScore: item.maxScore,
            startTime: item.startTime,
            endTime: item.endTime,
            owner: {
              id: item.ownerId,
              firstName: item.ownerFirstName,
              lastName: item.ownerLastName,
            },
            assignments: [],
          };
          if (item.assignedId) {
            tmp.assignments.push({
              id: item.assignedId,
              firstName: item.assignedFirstName,
              lastName: item.assignedLastName,
            });
          }
          output.push(tmp);
        } else {
          output[output.length - 1].assignments.push({
            id: item.assignedId,
            firstName: item.assignedFirstName,
            lastName: item.assignedLastName,
          });
        }
      });
      resolve(output);
    } else {
      resolve([]);
    }
  });
});
