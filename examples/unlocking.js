const RPuzzle = require('../index').RPuzzle;
const Transaction = require('bsv').Transaction;
const Script = require('bsv').Script;
const Address = require('bsv').Address;

//Setup
const kvalue = "";
const address = "";
const rawtx = "";

//Create an R puzzle from the K value
const rpuzzle = RPuzzle(RPuzzle.KValue.fromHex(kvalue));

//Grab the UTXO output(s) we want to spend from the previous TX we made
const fromTX = Transaction(rawtx);
const utxos = rpuzzle.getUTXOs(fromTX);

//Create a new Transaction to spend these outputs
let toTx = Transaction();
toTx.from(utxos);

//Get total input amount from UTXO(s)
const amount = toTx._getInputAmount();
toTx.to(Address.fromString(address), amount-1000); //1000 sats is a pretty generous fee!

//Sign it!
toTx = rpuzzle.sign(toTx);

//Copy the raw tx hex so we can publish it!
console.log(toTx.uncheckedSerialize());