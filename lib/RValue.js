const BN = require('bsv').crypto.BN;
const Point = require('bsv').crypto.Point;
const JSUtil = require('bsv').util.js;

/**
 * Represents an instance of an RValue.
 *
 * More info on https://wiki.bitcoinsv.io/index.php/R-Puzzles
 *
 * @constructor
 * @param {Buffer} r
 */
function RValue(r) {
    if (!(this instanceof RValue)) {
        return new RValue(r);
    }
    let rvalue;
    if(Buffer.isBuffer(r)){
        rvalue = r;
    } else if (r instanceof RValue){
        rvalue = r.r;
    } else {
        throw new TypeError("R value not an instance of Buffer");
    }

    JSUtil.defineImmutable(this, {
        r: rvalue,
    })
    return this;
}

/**
 * Creates a new R value from a KValue.
 * @param {KValue} k
 * @return {RValue}
 */
RValue.fromKValue = (k) => {
    if(!RValue._isKValue(k)){
        throw new TypeError("Expected instance of KValue");
    }
    const G = Point.getG();
    const N = Point.getN();
    const Q = G.mul(new BN.fromBuffer(k.k));
    const r = Q.x.umod(N).toBuffer();
    const r0 = r[0]>127 ? Buffer.concat([Buffer.alloc(1), r]) : r;
    return new RValue(r0);
}

/**
 * Creates a new R value from a PublicKey x value.
 * @param {PublicKey} pub
 * @return {RValue}
 */
RValue.fromPublicKey = (pub) => {
    if(!RValue._isPublicKey){
        throw new TypeError("Expected instance of PublicKey");
    }
    const p = pub.toBuffer();
    const p0 = p[0]>127 ? Buffer.concat([Buffer.alloc(1), p]) : p;
    return new RValue(p0);
}

/**
 * Creates a new R value from a PublicKey x value from a derived
 * path of an HDPublickey.
 * @param {HDPublicKey} pub
 * @param {string|number} path
 * @return {RValue}
 */
RValue.fromHDPublicKey = (pub, path) => {
    if(!RValue._isHDPublicKey){
        throw new TypeError("Expected instance of HDPrivateKey");
    }
    if(!HDPrivateKey.isValidPath(path)){
        throw new TypeError("Invalid derivation path");
    }
    const pubkey = pub.deriveChild(path);
    return RValue.fromPublicKey(pubkey.publicKey);
}

/**
 * Checks if input is instance of a KValue.
 * @param {KValue} k
 * @return {Boolean}
 */
RValue._isKValue = (k) => {
    const KValue = require('./KValue');
    return k instanceof KValue;
}

/**
 * Checks if input is instance of an HDPublicKey.
 * @param {HDPublicKey} xpub
 * @return {Boolean}
 */
RValue._isHDPublicKey = (xpub) => {
    const HDPublicKey = require('bsv').HDPublicKey;
    return xpub instanceof HDPublicKey;
}

/**
 * Checks if input is instance of a PublicKey.
 * @param {PublicKey} pub
 * @return {Boolean}
 */
RValue._isPublicKey = (pub) => {
    const PublicKey = require('bsv').PublicKey;
    return pub instanceof PublicKey;
}

/**
 * Creates a new RValue from a Buffer.
 * @param {string} hex
 * @return {RValue}
 */
RValue.fromBuffer = (buf) => {
    const r = new Buffer(buf);
    return this(r);
}

/**
 * Creates a new RValue from a hex string.
 * @param {string} hex
 * @return {RValue}
 */
RValue.fromHex = (hex) => {
    const r = new Buffer.from(hex, 'hex');
    return this(r);
}

/**
 * Returns RValue as a hex string.
 * @return {string}
 */
RValue.prototype.toHex = function() {
    return this.r.toString('hex');
}

/**
 * Returns RValue as a Buffer.
 * @return {Buffer}
 */
RValue.prototype.toBuffer = function() {
    return this.r;
}

module.exports = RValue;