function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function sum(a, b) {
  if (!isNumeric(a) || !isNumeric(b)) {
    throw TypeError();
  }
  return a + b;
}

module.exports = sum;
