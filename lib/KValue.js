const Point = require('bsv').crypto.Point;
const RValue = require('./RValue');
const PrivateKey = require('bsv').PrivateKey;
const JSUtil = require('bsv').util.js;

/**
 * Represents an instance of a KValue.
 *
 * More info on https://wiki.bitcoinsv.io/index.php/R-Puzzles
 *
 * @constructor
 * @param {Buffer} k
 */
function KValue (k) {
    if (!(this instanceof KValue)) {
        return new KValue(k)
    }
    let kvalue;
    if(k instanceof Buffer){
        kvalue = k;
    } else if (k instanceof KValue) {
        kvalue = k.k;
    } else {
        throw new TypeError("K value not an instance of Buffer");
    }

    JSUtil.defineImmutable(this, {
        k: kvalue
    });

    return this;
}

/**
 * Creates a new KValue from a PrivateKey buffer.
 * @param {PrivateKey} priv
 * @return {KValue}
 */
KValue.fromPrivateKey = (priv) => {
    if(!KValue._isPrivateKey){
        throw new TypeError("Expected instance of PrivateKey");
    }
    const k = priv.toBuffer();
    return new KValue(k);
}

/**
 * Creates a new KValue from the buffer of a PrivateKey from a
 * derived HDPrivateKey path.
 * @param {HDPrivateKey} priv
 * @param {string|number} path
 * @return {KValue}
 */
KValue.fromHDPrivateKey = (priv, path) => {
    if(!KValue._isHDPrivateKey){
        throw new TypeError("Expected instance of HDPrivateKey");
    }
    if(!HDPrivateKey.isValidPath(path)){
        throw new TypeError("Invalid derivation path");
    }
    const privkey = priv.deriveChild(path);
    return KValue.fromPrivateKey(privkey.privateKey);
}

/**
 * Creates a new KValue from a random buffer.
 * @return {KValue}
 */
KValue.fromRandom = () => {
    const r = PrivateKey.fromRandom().toBuffer();
    return new KValue(r);
}

/**
 * Creates a new KValue from a Buffer.
 * @param {Buffer} buf
 * @return {KValue}
 */
KValue.fromBuffer = (buf) => {
    const k = new Buffer(buf);
    return new KValue(k);
}

/**
 * Creates a new KValue from a hex string.
 * @param {string} hex
 * @return {KValue}
 */
KValue.fromHex = (hex) => {
    const k = new Buffer.from(hex, 'hex');
    return new KValue(k);
}

/**
 * Checks if input is instance of an HDPrivateKey.
 * @param {HDPrivateKey} xpriv
 * @return {Boolean}
 */
KValue._isHDPrivateKey = (xpriv) => {
    const HDPrivateKey = require('bsv').HDPrivateKey;
    return xpriv instanceof HDPrivateKey;
}

/**
 * Checks if input is instance of a PrivateKey.
 * @param {PrivateKey} priv
 * @return {Boolean}
 */
KValue._isPrivateKey = (priv) => {
    const PrivateKey = require('bsv').PrivateKey;
    return priv instanceof PrivateKey;
}

/**
 * Returns KValue as a hex string.
 * @return {string}
 */
KValue.prototype.toHex = function() {
    return this.k.toString('hex');
}

/**
 * Returns RValue from k value.
 * @return {RValue}
 */
KValue.prototype.toRValue = function() {
    return RValue.fromKValue(this);
}

/**
 * Returns KValue as a Buffer.
 * @return {Buffer}
 */
KValue.prototype.toBuffer = function() {
    return this.k;
}

module.exports = KValue;