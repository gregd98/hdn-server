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

exports.beginTransaction = (conn) => new Promise((resolve, reject) => {
  conn.beginTransaction((err) => {
    if (err) {
      reject(err);
    }
    resolve();
  });
});

exports.commit = (conn) => new Promise((resolve, reject) => {
  conn.commit((err) => {
    if (err) {
      reject(err);
    }
    resolve();
  });
});

exports.rollback = (conn) => new Promise((resolve, reject) => {
  conn.rollback((err) => {
    if (err) {
      reject(err);
    }
    resolve();
  });
});

exports.getConnection = () => new Promise((resolve, reject) => {
  pool.getConnection((err, conn) => {
    if (err) {
      reject(err);
    }
    resolve(conn);
  });
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

exports.checkExistence = (col, table, value, reverse, onError, eventId = false) => new Promise(
  (resolve, reject) => {
    const query = `
    select count(*) as count from ${table} where ${col} = ${mysql.escape(value)}${eventId ? ` and eventId = ${eventId}` : ''};`;
    pool.query(query, (error, result) => {
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
  ${mysql.escape(input.eventId)},
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

exports.findAllUsers = (eventId) => new Promise((resolve, reject) => {
  const query = `call findAllUsers(${mysql.escape(eventId)});`;
  pool.query(query, (error, result) => {
    if (error) {
      reject(error);
    } else {
      resolve(result[0]);
    }
  });
});

exports.findUserIdBySessionId = (sessionId) => new Promise((resolve, reject) => {
  const query = `call findUserIdBySessionId(${mysql.escape(sessionId)});`;
  pool.query(query, (error, result) => {
    if (error) {
      reject(error);
    } else if (result[0].length > 0) {
      resolve(result[0][0]);
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

exports.findAllTeams = (eventId) => new Promise((resolve, reject) => {
  const query = `call findAllTeams(${mysql.escape(eventId)});`;
  pool.query(query, (error, result) => {
    if (error) {
      reject(error);
    } else {
      resolve(result[0]);
    }
  });
});

exports.findAllLeaderContacts = (eventId) => new Promise((resolve, reject) => {
  const query = `call findAllLeaderContacts(${mysql.escape(eventId)});`;
  pool.query(query, (error, result) => {
    if (error) {
      reject(error);
    } else {
      const phone = [],
        email = [];
      result[0].forEach((contact) => {
        phone.push(contact.phone);
        email.push(contact.email);
      });
      resolve({ phone, email });
    }
  });
});

exports.findTeamById = (id, eventId) => new Promise((resolve, reject) => {
  const query = `call findTeamById(${mysql.escape(id)}, ${mysql.escape(eventId)});`;
  pool.query(query, (error, result) => {
    if (error) {
      reject(error);
    } else if (result[0].length > 0) {
      resolve(result[0][0]);
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

exports.findAllPlayers = (eventId) => new Promise((resolve, reject) => {
  const query = `call findAllPlayers(${mysql.escape(eventId)});`;
  pool.query(query, (error, result) => {
    if (error) {
      reject(error);
    } else {
      resolve(result[0]);
    }
  });
});

exports.findPlayerById = (id, eventId) => new Promise((resolve, reject) => {
  const query = `call findPlayerById(${mysql.escape(id)}, ${mysql.escape(eventId)});`;
  pool.query(query, (error, result) => {
    if (error) {
      reject(error);
    } else if (result[0].length > 0) {
      resolve(result[0][0]);
    } else {
      resolve(false);
    }
  });
});

exports.findAllGames = (eventId) => new Promise((resolve, reject) => {
  const query = `call findAllGames(${mysql.escape(eventId)});`;
  pool.query(query, (error, result) => {
    if (error) {
      reject(error);
    } else if (result[0].length > 0) {
      const output = [];
      let lastId = 0;
      result[0].forEach((item) => {
        if (item.id !== lastId) {
          lastId = item.id;
          const tmp = {
            id: item.id,
            name: item.name,
            location: item.location,
            description: item.description,
            notes: item.notes,
            playerCount: item.playerCount,
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

exports.findAllGames2 = (eventId) => new Promise((resolve, reject) => {
  const query = `call findAllGames2(${mysql.escape(eventId)});`;
  pool.query(query, (error, result) => {
    if (error) {
      reject(error);
    } else if (result[0].length > 0) {
      const output = [];
      result[0].forEach((item) => {
        output.push({
          id: item.id,
          name: item.name,
          location: item.location,
          description: item.description,
          notes: item.notes,
          playerCount: item.playerCount,
          startTime: item.startTime,
          endTime: item.endTime,
          owner: {
            id: item.ownerId,
            firstName: item.ownerFirstName,
            lastName: item.ownerLastName,
          },
        });
      });
      resolve(output);
    } else {
      resolve([]);
    }
  });
});

exports.findGamesByOwnerId = (ownerId, eventId) => new Promise((resolve, reject) => {
  const query = `call findGamesByOwnerId(${mysql.escape(ownerId)}, ${mysql.escape(eventId)});`;
  pool.query(query, (error, result) => {
    if (error) {
      reject(error);
    } else if (result[0].length > 0) {
      const output = [];
      result[0].forEach((item) => {
        output.push({
          id: item.id,
          name: item.name,
          location: item.location,
          description: item.description,
          notes: item.notes,
          playerCount: item.playerCount,
          startTime: item.startTime,
          endTime: item.endTime,
          owner: {
            id: item.ownerId,
            firstName: item.ownerFirstName,
            lastName: item.ownerLastName,
          },
        });
      });
      resolve(output);
    } else {
      resolve([]);
    }
  });
});

exports.findAllDays = (eventId) => new Promise((resolve, reject) => {
  const query = `call findAllDays(${mysql.escape(eventId)});`;
  pool.query(query, (error, result) => {
    if (error) {
      reject(error);
    } else {
      resolve(result[0].map((day) => day.selected_date));
    }
  });
});

exports.findPermissionsByUserId = (userId) => new Promise((resolve, reject) => {
  const query = `call findPermissionsByUserId(${mysql.escape(userId)});`;
  pool.query(query, (error, result) => {
    if (error) {
      reject(error);
    } else {
      resolve(result[0].map((row) => row.permissionId));
    }
  });
});

exports.insertGame = (game, userId, eventId) => new Promise((resolve, reject) => {
  const query = `call insertGame(
  ${mysql.escape(game.title)}, 
  ${mysql.escape(game.location)}, 
  ${mysql.escape(game.description)}, 
  ${mysql.escape(game.notes)}, 
  ${mysql.escape(userId)}, 
  ${mysql.escape(game.playerCount)}, 
  ${mysql.escape(game.startTime)}, 
  ${mysql.escape(game.endTime)}, 
  ${mysql.escape(eventId)});`;
  pool.query(query, (error) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });
});

exports.findGameById = (gameId, eventId) => new Promise((resolve, reject) => {
  const query = `call findGameById(${mysql.escape(gameId)}, ${mysql.escape(eventId)});`;
  pool.query(query, (error, result) => {
    if (error) {
      reject(error);
    } else {
      resolve(result[0]);
    }
  });
});

exports.findAssignmentsByGameId = (gameId) => new Promise((resolve, reject) => {
  const query = `call findAssignmentsByGameId(${mysql.escape(gameId)});`;
  pool.query(query, (error, result) => {
    if (error) {
      reject(error);
    } else {
      resolve(result[0]);
    }
  });
});

exports.deleteAssignmentsByGameId = (gameId, conn = pool) => new Promise((resolve, reject) => {
  const query = `call deleteAssignmentsByGameId(${mysql.escape(gameId)});`;
  conn.query(query, (error) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });
});

exports.insertAssignment = (gameId, userId, conn = pool) => new Promise((resolve, reject) => {
  const query = `call insertAssignment(${mysql.escape(gameId)}, ${mysql.escape(userId)});`;
  conn.query(query, (error) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });
});
