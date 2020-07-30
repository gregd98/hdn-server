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
  const query = `select pwdHash as hash, pwdSalt as salt, pwdIterations as iterations from Users where username = ${mysql.escape(username)};`;
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
