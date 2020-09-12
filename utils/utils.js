const checkInt = (str, min = 1) => {
  const s = String(str);
  const n = Math.floor(Number(s));
  return n !== Infinity && String(n) === s && n >= min;
};

exports.checkId = (str) => checkInt(str);
exports.checkIntGE0 = (str) => checkInt(str, 0);

exports.checkIdList = (list) => {
  for (let i = 0; i < list.length; i += 1) {
    if (!checkInt(list[i])) {
      return false;
    }
  }
  return true;
};

exports.loadingTest = () => {
  for (let i = 1; i < 500000; i += 1) {
    console.log(Math.sqrt(i));
  }
};
