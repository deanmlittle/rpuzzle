const RPuzzle = require('./lib/RPuzzle');
if (typeof module === 'undefined'){
    window.RPuzzle = RPuzzle;
    global.RPuzzle = RPuzzle;
} else {
    module.exports = RPuzzle;
}