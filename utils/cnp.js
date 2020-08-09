const moment = require('moment');

const isNumber = (value) => !Number.isNaN(Number(value));
const control = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];

exports.isValidCNP = (input) => {
  let hashResult = 0;
  const cnp = [];

  if (input.length !== 13) {
    return false;
  }
  for (let i = 0; i < 13; i += 1) {
    cnp[i] = parseInt(input[i], 10);
    if (!isNumber(cnp[i])) {
      return false;
    }
    if (i < 12) {
      hashResult += cnp[i] * control[i];
    }
  }
  hashResult %= 11;
  if (hashResult === 10) {
    hashResult = 1;
  }

  let year = cnp[1] * 10 + cnp[2];
  switch (cnp[0]) {
    case 1: case 2:
      year += 1900;
      break;
    case 3: case 4:
      year += 1800;
      break;
    case 5: case 6:
      year += 2000;
      break;
    default:
      return false;
  }

  const month = cnp[3] * 10 + cnp[4];
  const day = cnp[5] * 10 + cnp[6];
  return cnp[12] === hashResult && moment(`${year}/${month}/${day}`, 'YYYY/M/D', true).isValid();
};
