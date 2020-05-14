# RPuzzle
A simple library to help you create, sign and spend any kind of R Puzzle.

### Installation
*Please note, RPuzzle has a peer dependency of `bsv` which must be installed independently to avoid version collisions.*

To get started, simply run:
```npm i bsv https://github.com/deanmlittle/rpuzzle```

### Quickstart
In true Bitcoin fashion, code is well-commented, poorly documented. You can create them randomly, from a PrivateKey, a buffer, a hex string or even an XPriv path. Here's an example of creating and spending a HASH160 P2RPH from Random:

##### Step 1) Generating a locking script.
We're going to generate a valid R Puzzle script in ASM format and the K value used to unlock it. Make sure to save these two pieces of information as we'll need them to publish and unlock the puzzle later.
```js
const RPuzzle = require('rpuzzle');

const rpuzzle = RPuzzle.fromRandom();
console.log(rpuzzle.toASM());
console.log(rpuzzle.k.toHex());

//Returns: 
//k value hex string
//OP_OVER OP_3 OP_SPLIT OP_NIP OP_1 OP_SPLIT OP_SWAP OP_SPLIT OP_DROP OP_HASH160 <r hash> OP_EQUALVERIFY OP_CHECKSIG
```

#### Step 2) Funding a UTXO
One of the simplest ways to do this is with MoneyButton. Copy your ASM script into the script property in `data-outputs` below:

```html
<script src="https://www.moneybutton.com/moneybutton.js"></script>
<div class='money-button'
  data-outputs='[
    {
      "script": "OP_OVER OP_3 OP_SPLIT OP_NIP OP_1 OP_SPLIT OP_SWAP OP_SPLIT OP_DROP OP_HASH160 <r hash> OP_EQUALVERIFY OP_CHECKSIG",
      "amount": "0.0218",
      "currency": "USD"
    }
  ]'
></div>
```

Here's a jsfiddle to make the whole process a little easier: https://jsfiddle.net/wfotksg6/

Swipe to put the TX on chain, copy the TXID from your Moneybutton, then head over to: `http://api.whatsonchain.com/v1/bsv/main/<txid>/hex` to get the raw hex of the transaction.

#### Step 3) Create an unlocking transaction
Remember that K value hex string from step 1? We'll need that here:
```js
const RPuzzle = require('rpuzzle');
const Transaction = require('bsv').Transaction;
const Script = require('bsv').Script;
const Address = require('bsv').Address;


//Create an R puzzle from the K value
const rpuzzle = RPuzzle(RPuzzle.KValue.fromHex("k value hexstring"));

//Grab the UTXO output(s) we want to spend from the previous TX we made
const fromTX = Transaction("tx raw hex");
const utxos = rpuzzle.getUTXOs(fromTX);

//Create a new Transaction to spend these outputs
let toTx = Transaction();
toTx.from(utxos);

//Get total input amount from UTXO(s)
const amount = toTx._getInputAmount();
toTx.to(Address.fromString('<a bitcoin address>'), amount-1000); //1000 sats is a pretty generous fee!

//Sign it!
toTx = rpuzzle.sign(toTx);

//Copy the raw tx hex so we can publish it!
console.log(toTx.uncheckedSerialize());
```

#### Step 4) Broadcast transaction
Head on over to https://whatsonchain.com/broadcast and paste in your new raw tx hex. You can either preview the TX to make sure everything looks correct (also not a bad way to figure out your fee rate), or assuming everything looks okay, hit the broadcast button and you're done!

### Other examples
You can actually publish any kind of R Puzzle you want. Here's a transaction I made where I created one output of each type:
https://whatsonchain.com/tx/1ea1d846d0e5212f28654ba0eeb1db346e38e245415bf90ccd70c95060cf7f80

And subsequently spent them:
https://whatsonchain.com/tx/a61e8444b717da21da2e6b5d6cc8b2cb724123bc6c8f3f5c088839ed4d2d5f33

### Puzzle Types

RPuzzle implements all of the native hashing functions of Bitcoin, defaulting to `OP_HASH160 <r>`. You can also just pay to the R value itself. To set a specific puzzle type, simply call `setType` on an RPuzzle instance like so:

```js
const rpuzzle = RPuzzle.fromRandom();
rpuzzle.setType('PayToRHASH256');
```

The current type options include:

| Puzzle Type | Script |
| ------ | ------ |
| PayToRHASH160 | OP_HASH160 <r> |
| PayToRRIPEMD160 | OP_RIPEMD160 <r> |
| PayToRSHA256 | OP_SHA256 <r> |
| PayToRHASH256 | OP_HASH256 <r> |
| PayToRSHA1 | OP_SHA1 <r> |
| PayToR | <r> |

### TODO:
- Typescript definitions
- Better examples
- Multisig R Puzzles
- Testnet testing (Yes, real devs code straight on Mainnet. It should work though with a bit of tweaking!)
- SIGHASH_NONE and SIGHASH_ANYONECANPAY, haven't tried this at all.
- Browser testing. Should work, may have Buffer issues? Let me know.

### Development

Want to contribute? Please do! Feel free to submit bugs or pull requests to this repo. 
You can also tip me at `deanlittle@moneybutton.com`, `1deanlittle` or `/pay @40` on Twetch.

### Legal stuff
This code is provided free of charge with no warranties. Use at your own risk. Besides that, I don't really care how you use it so long as you promise to go build something cool. ;)
