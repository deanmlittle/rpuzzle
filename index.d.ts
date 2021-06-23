import bsv from 'bsv';

export namespace RPuzzle {
  class RValue {
    constructor(r: RValue | Buffer);

    static fromKValue(k: KValue): RValue;
    static fromPublicKey(pub: bsv.PublicKey): RValue;
    static fromHDPublicKey(pub: bsv.HDPublicKey): RValue;
    static fromBuffer(buf: Buffer): RValue;
    static fromHex(hex: string): RValue;

    toHex(): string;
    toBuffer(): Buffer;
  }

  class KValue {
    constructor(k: KValue | Buffer);

    static fromPrivateKey(priv: bsv.PrivateKey): KValue;
    static fromHDPrivateKey(priv: bsv.HDPrivateKey): KValue;
    static fromRandom(): KValue;
    static fromBuffer(buf: Buffer): KValue;
    static fromHex(hex: string): KValue;

    toHex(): string;
    toRvalue(): RValue;
    toBuffer(): Buffer;
  }
}

export class RPuzzle {
  constructor(
    val: RPuzzle.RValue | RPuzzle.KValue,
    key?: bsv.PrivateKey | bsv.HDPrivateKey,
    path?: string | number
  );

  static fromPrivateKey(priv: bsv.PrivateKey): RPuzzle;
  static fromPublicKey(pub: bsv.PublicKey): RPuzzle;
  static fromHDPrivateKey(
    priv: bsv.HDPrivateKey,
    path: string | number
  ): RPuzzle;
  static fromHDPublicKey(pub: bsv.HDPublicKey): RPuzzle;
  static fromRandom(): RPuzzle;
  setType(
    type:
      | 'PayTORHASH160'
      | 'PayToRRIPEMD160'
      | 'PayToRSHA256'
      | 'PayToRHASH256'
      | 'PayToRSHA1'
      | 'PayToR'
  ): void;
  setPrivateKey(priv: bsv.PrivateKey): void;
  toASM(): string;
  toScript(): bsv.Script;
  getRHash(): Buffer;
  getRpuzzleType(): { op: number, hash: Function } | false;
  sign(tx: bsv.Transaction, sigtype?: any); // TODO sigtype
  match(script: bsv.Script): boolean;
  getUTXOs(tx: bsv.Transaction): Array<bsv.Transaction.UnspentOutput>;
}

export default RPuzzle;
