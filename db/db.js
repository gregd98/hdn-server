const mysql  = require('mysql');

const pool = mysql.createPool({
  connectionLimit: 10,
  database: 'hdn',
  host: 'localhost',
  port: 3306,
  user: 'devUser',
  password: 'kecske123',
});

exports.findLoginDataByUsername = (username) => new Promise((resolve, reject) => {
  const query = `
  select a.id, a.username, b.firstName, b.lastName, a.pwdHash as hash, a.pwdSalt as salt, a.pwdIterations as iterations 
  from Users as a 
  join Persons as b 
  on a.personId = b.id 
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
