const Signature = require('bsv').crypto.Signature;
const ECDSA = require('bsv').crypto.ECDSA;
const BN = require('bsv').crypto.BN;
const Opcode = require('bsv').Opcode;
const PrivateKey = require('bsv').PrivateKey;
const PublicKey = require('bsv').PublicKey;
const HDPrivateKey = require('bsv').HDPrivateKey;
const HDPublicKey = require('bsv').HDPrivateKey;
const Transaction = require('bsv').Transaction;
const Script = require('bsv').Script;
const Hash = require('bsv').crypto.Hash;

const KValue = require('./KValue');
const RValue = require('./RValue');

/**
 * Represents an instance of an RPuzzle.
 *
 * More info on https://wiki.bitcoinsv.io/index.php/R-Puzzles
 *
 * @constructor
 * @param {KValue|RValue} val
 * @param {PrivateKey|HDPrivateKey} key - Optional
 * @param {string|number} path - Optional, required if key is defined
 */
function RPuzzle(val, key=null, path=null) {
    if (!(this instanceof RPuzzle)) {
        return new RPuzzle(val, key, path);
    }
    if(RPuzzle._isKValue(val)){
        this.k = val;
        this.r = RValue.fromKValue(this.k);
    } else if (RPuzzle._isRValue(val)){
        this.r = val;
    } else {
        throw "Expected instance of RValue or KValue"
    }
    if(key === null){
        if(key instanceof PrivateKey){
            this.privateKey = key;
        } else if(key instanceof HDPrivateKey) {
            let p = 0;
            if(HDPrivateKey.isValidPath(path)){
                p=path;
            }
            this.privateKey = key.deriveChild(p).privateKey;
        } else {
            this.privateKey = PrivateKey.fromRandom();
        }
    }
    this.type = 'PayToRHASH160';
    return this;
}

/**
 * Creates a new RPuzzle by generating K value from the buffer of a PrivateKey
 * @param {PrivateKey} priv
 * @return {RPuzzle}
 */
RPuzzle.fromPrivateKey = (priv) => {
    if(!RPuzzle._isPrivateKey){
        throw new TypeError("Expected instance of PrivateKey");
    }
    const k = new KValue(priv.toBuffer());
    return new RPuzzle(k);
}

/**
 * Creates a new RPuzzle by generating R value from the buffer of a PublicKey
 * @param {PublicKey} pub
 * @return {RPuzzle}
 */
RPuzzle.fromPublicKey = (pub) => {
    if(!RPuzzle._isPublicKey){
        throw new TypeError("Expected instance of PublicKey");
    }
    const r = new RValue(pub.toBuffer());
    return new RPuzzle(r);
}

/**
 * Creates a new RPuzzle by generating K value from the buffer of the PrivateKey
 * of a derived path of an HDPrivateKey.
 * @param {HDPrivateKey} priv
 * @param {string|number} path
 * @return {RPuzzle}
 */
RPuzzle.fromHDPrivateKey = (priv, path) => {
    if(!RPuzzle._isHDPrivateKey){
        throw new TypeError("Expected instance of HDPrivateKey");
    }
    if(!HDPrivateKey.isValidPath(path)){
        throw new TypeError("Invalid derivation path");
    }
    const privkey = priv.deriveChild(path);
    return RPuzzle.fromPrivateKey(privkey.privateKey);
}

/**
 * Creates a new RPuzzle by generating R value from the X value of the PublicKey
 * of a derived path of an HDPublicKey.
 * @param {HDPublicKey} pub
 * @param {string|number} path
 * @return {RPuzzle}
 */
RPuzzle.fromHDPublicKey = (pub, path) => {
    if(!RPuzzle._isHDPublicKey){
        throw new TypeError("Expected instance of HDPublicKey");
    }
    if(!HDPublicKey.isValidPath(path)) {
        throw new TypeError("Invalid derivation path");
    }
    const pubkey = pub.deriveChild(path);
    return RPuzzle.fromPublicKey(pubkey.publicKey);
}

/**
 * Creates a new RPuzzle from a random K.
 * @return {RPuzzle}
 */
RPuzzle.fromRandom = () => {
    const k = KValue.fromRandom();
    return new RPuzzle(k);
}

/**
 * Checks if input is instance of HDPrivateKey.
 * @param {HDPrivateKey} xpriv
 * @return {Boolean}
 */
RPuzzle._isHDPrivateKey = (xpriv) => {
    const HDPrivateKey = require('bsv').HDPrivateKey;
    return xpriv instanceof HDPrivateKey;
}

/**
 * Checks if input is instance of PrivateKey.
 * @param {PrivateKey} priv
 * @return {Boolean}
 */
RPuzzle._isPrivateKey = (priv) => {
    const PrivateKey = require('bsv').PrivateKey;
    return priv instanceof PrivateKey;
}

/**
 * Checks if input is instance of HDPublicKey.
 * @param {HDPublicKey} xpub
 * @return {Boolean}
 */
RPuzzle._isHDPublicKey = (xpub) => {
    const HDPublicKey = require('bsv').HDPublicKey;
    return xpub instanceof HDPublicKey;
}

/**
 * Checks if input is instance of a PublicKey.
 * @param {PublicKey} pub
 * @return {Boolean}
 */
RPuzzle._isPublicKey = (pub) => {
    const PublicKey = require('bsv').PublicKey;
    return pub instanceof PublicKey;
}

/**
 * Checks if input is instance of KValue.
 * @param {KValue} k
 * @return {Boolean}
 */
RPuzzle._isKValue = (k) => {
    const KValue = require('./KValue');
    return k instanceof KValue;
}

/**
 * Checks if input is instance of RValue.
 * @param {RValue} r
 * @return {Boolean}
 */
RPuzzle._isRValue = (r) => {
    const RValue = require('./RValue');
    return r instanceof RValue;
}

/**
 * Sets the R puzzle hash type. If invalid type is set, defaults to PayToRHASH160.
 * Types include: "PayToRHASH160", "PayToRRIPEMD160", "PayToRSHA256", "PayToRHASH256", "PayToRSHA1", "PayToR".
 * @param {string} type
 */
RPuzzle.prototype.setType = function(type) {
    if(!RPuzzle.types[type]){
        this.type = "PayToRHASH160";
    } else {
        this.type = type;
    }
}

/**
 * Sets the private key used with the K value for transaction signing.
 * @param {PrivateKey} priv
 */
RPuzzle.prototype.setPrivateKey = function(priv) {
    if(!RPuzzle._isPrivateKey()){
        throw new TypeError("Expected instance of PrivateKey");
    }
    this.privateKey = priv;
}

/**
 * Returns a valid R puzzle script for R value in ASM format.
 * @return {string}
 */
RPuzzle.prototype.toASM = function() {
    const s = this.toScript();
    return s.toASM();
}

/**
 * Object containing all hash types for R Puzzles.
 */
RPuzzle.types = {
    PayToRHASH160: {
        op: Opcode.OP_HASH160,
        hash: Hash.sha256ripemd160
    },
    PayToRRIPEMD160: {
        op: Opcode.OP_RIPEMD160,
        hash: Hash.ripemd160
    },
    PayToRSHA256: {
        op: Opcode.OP_SHA256,
        hash: Hash.sha256
    },
    PayToRHASH256: {
        op: Opcode.OP_HASH256,
        hash: Hash.sha256sha256
    },
    PayToRSHA1: {
        op: Opcode.OP_SHA1,
        hash: Hash.sha1
    },
    PayToR: {
        op: false,
        hash: (r) => { return r }
    }
}

/**
 * Returns a valid R Puzzle script for R value as Script.
 * @return {Script}
 */
RPuzzle.prototype.toScript = function() {
    const t = RPuzzle.types[this.type];
    const s = new Script();
    s.add(Opcode.OP_OVER)
    .add(Opcode.OP_3)
    .add(Opcode.OP_SPLIT)
    .add(Opcode.OP_NIP)
    .add(Opcode.OP_1)
    .add(Opcode.OP_SPLIT)
    .add(Opcode.OP_SWAP)
    .add(Opcode.OP_SPLIT)
    .add(Opcode.OP_DROP);
    if(this.getRPuzzleType()){
        s.add(this.getRPuzzleType())
    }
    s.add(this.getRHash())
    .add(Opcode.OP_EQUALVERIFY)
    .add(Opcode.OP_CHECKSIG);
    return s;
}

/**
 * Returns R Value Hash as a Buffer.
 * @return {Buffer}
 */
RPuzzle.prototype.getRHash = function() {
    return RPuzzle.types[this.type].hash(this.r.r);
}

/**
 * Returns OPCode of puzzle type, or returns false if puzzle type doesn't exist.
 * False defaults to a plain R value without a hash function.
 * @return {Opcode|Boolean}
 */
RPuzzle.prototype.getRPuzzleType = function() {
    return RPuzzle.types[this.type].op;
}

/**
 * Signs all inputs compatible with the K value of the RPuzzle in a transaction.
 * @param {Transaction} tx - transaction you want to sign
 * @param {Signature.SIGHASH_ALL|Signature.SIGHASH_SINGLE} sighash - optional
 * @return {Transaction}
 */
RPuzzle.prototype.sign = function(tx, sigtype=null) {
    if(!this.k){
        throw new Error("K value undefined");
    }
    if(sigtype === null){
        sigtype = Signature.SIGHASH_ALL | Signature.SIGHASH_FORKID;
    }
    const flags = Script.Interpreter.SCRIPT_VERIFY_MINIMALDATA | Script.Interpreter.SCRIPT_ENABLE_SIGHASH_FORKID | Script.Interpreter.SCRIPT_ENABLE_MAGNETIC_OPCODES | Script.Interpreter.SCRIPT_ENABLE_MONOLITH_OPCODES;
    tx.inputs.forEach((input, i) => {
        if(this.match(input.output.script)){
            const hashbuf = Transaction.sighash.sighash(
                tx,
                sigtype,
                i,
                input.output.script,
                new BN.fromNumber(input.output.satoshis),
                flags
            );

            const ecdsa = new ECDSA({
                hashbuf: hashbuf,
                privkey: this.privateKey,
                endian: 'little',
                k: BN.fromBuffer(this.k.toBuffer())
            });
            ecdsa.privkey2pubkey();
            const signature = ecdsa.sign().sig;
            const unlockingScript = new Script();
            unlockingScript
            .add(Buffer.concat([
                signature.toBuffer(),
                Buffer.from([sigtype & 0xff])
            ]))
            .add(ecdsa.pubkey.toBuffer());
            tx.inputs[i].setScript(unlockingScript);
        }
    });
    return tx;
}

/**
 * Returns true if a script has a compatible template and R value/hash.
 * @param {Script} script
 * @return {Boolean}
 */
RPuzzle.prototype.match = function(script) {
    if(this.getRPuzzleType()){
        return !!(script.chunks.length === 13 &&
            script.chunks[0].opcodenum === Opcode.OP_OVER &&
            script.chunks[1].opcodenum === Opcode.OP_3 &&
            script.chunks[2].opcodenum === Opcode.OP_SPLIT &&
            script.chunks[3].opcodenum === Opcode.OP_NIP &&
            script.chunks[4].opcodenum === Opcode.OP_1 &&
            script.chunks[5].opcodenum === Opcode.OP_SPLIT &&
            script.chunks[6].opcodenum === Opcode.OP_SWAP &&
            script.chunks[7].opcodenum === Opcode.OP_SPLIT &&
            script.chunks[8].opcodenum === Opcode.OP_DROP &&
            script.chunks[9].opcodenum === this.getRPuzzleType() &&
            script.chunks[10].buf &&
            script.chunks[10].buf.toString('hex') === this.getRHash().toString('hex') &&
            script.chunks[11].opcodenum === Opcode.OP_EQUALVERIFY &&
            script.chunks[12].opcodenum === Opcode.OP_CHECKSIG
        )
    } else {
        return !!(script.chunks.length === 12 &&
            script.chunks[0].opcodenum === Opcode.OP_OVER &&
            script.chunks[1].opcodenum === Opcode.OP_3 &&
            script.chunks[2].opcodenum === Opcode.OP_SPLIT &&
            script.chunks[3].opcodenum === Opcode.OP_NIP &&
            script.chunks[4].opcodenum === Opcode.OP_1 &&
            script.chunks[5].opcodenum === Opcode.OP_SPLIT &&
            script.chunks[6].opcodenum === Opcode.OP_SWAP &&
            script.chunks[7].opcodenum === Opcode.OP_SPLIT &&
            script.chunks[8].opcodenum === Opcode.OP_DROP &&
            script.chunks[9].buf &&
            script.chunks[9].buf.toString('hex') === this.getRHash().toString('hex') &&
            script.chunks[10].opcodenum === Opcode.OP_EQUALVERIFY &&
            script.chunks[11].opcodenum === Opcode.OP_CHECKSIG
        )
    }
}

/**
 * Gets all signable outputs from a transaction with a compatible R value/hash.
 * @param {Script} script
 * @return {Array}
 */
RPuzzle.prototype.getUTXOs = function(tx) {
    let utxos = [];
    tx.outputs.forEach((o, i) => {
        if(this.match(o.script)) {
            const utxo = new Transaction.UnspentOutput({
                txId: tx.id,
                outputIndex: i,
                script: o.script,
                satoshis: o.satoshis
            });
            utxos.push(utxo);
        }
    });
    return utxos;
}

module.exports = RPuzzle;