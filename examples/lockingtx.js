const RPuzzle = require('../index');

const rpuzzle = RPuzzle.fromRandom();
console.log(rpuzzle.toASM());
console.log(rpuzzle.k.toHex());