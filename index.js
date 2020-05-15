(function() {
    const RPuzzle = require('./lib/RPuzzle');
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
        module.exports = RPuzzle;
    else
        window.RPuzzle = ValRPuzzleidator;
})();