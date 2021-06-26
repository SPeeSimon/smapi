function isNumber(x) {
  return !isNaN(Number(x));
}

function isString(s) {
  return s !== undefined && s !== null && s !== "";
}

function toNumber(x) {
  return isNumber(x) ? Number(x) : 0;
}


module.exports = {isNumber, isString, toNumber}