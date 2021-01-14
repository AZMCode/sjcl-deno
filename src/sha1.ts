/** @fileOverview Javascript SHA-1 implementation.
 *
 * Based on the implementation in RFC 3174, method 1, and on the SJCL
 * SHA-256 implementation.
 *
 * @author Quinn Slack
 */

import { Invalid, Bug } from "./exception.ts";
import * as codec from "./codec.ts"
import * as bitArray from "./bitArray.ts"
/**
 * Context for a SHA-1 operation in progress.
 * @constructor
 */
export default class SHA1{
  constructor(hash?:SHA1){
    if (hash) {
      this._h = hash._h.slice(0);
      this._buffer = hash._buffer.slice(0);
      this._length = hash._length;
    } else {
      this.reset();
    }
  }
  private _h:      number[] = [];
  private _buffer: number[] = [];
  private _length: number   =  0;
  /**
   * The SHA-1 initialization vector.
   * @private
   */
  private _init = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0];
  
  /**
   * The SHA-1 hash key.
   * @private
   */
  private _key = [0x5A827999, 0x6ED9EBA1, 0x8F1BBCDC, 0xCA62C1D6];

  /**
   * The SHA-1 logical functions f(0), f(1), ..., f(79).
   * @private
   */
  private _f(t:number, b:number, c:number, d:number):number {
    if (t <= 19) {
      return (b & c) | (~b & d);
    } else if (t <= 39) {
      return b ^ c ^ d;
    } else if (t <= 59) {
      return (b & c) | (b & d) | (c & d);
    } else if (t <= 79) {
      return b ^ c ^ d;
    }
    throw new Bug("Unreachable state");
  }

  /**
   * Perform one cycle of SHA-1.
   * @param {Uint32Array|number[]} words one block of words.
   * @private
   */
  private _block(words:Uint32Array|number[]):void {
    let t, tmp, a, b, c, d, e;
    let h = this._h;
    let w = words;

    a = h[0]; b = h[1]; c = h[2]; d = h[3]; e = h[4]; 

    for (t=0; t<=79; t++) {
      if (t >= 16) {
        w[t] = this._S(1, w[t-3] ^ w[t-8] ^ w[t-14] ^ w[t-16]);
      }
      tmp = (this._S(5, a) + this._f(t, b, c, d) + e + w[t] +
              this._key[Math.floor(t/20)]) | 0;
      e = d;
      d = c;
      c = this._S(30, b);
      b = a;
      a = tmp;
    }

    h[0] = (h[0]+a) |0;
    h[1] = (h[1]+b) |0;
    h[2] = (h[2]+c) |0;
    h[3] = (h[3]+d) |0;
    h[4] = (h[4]+e) |0;
  }

  /**
   * Circular left-shift operator.
   * @private
   */
  private _S(n:number, x:number):number {
    return (x << n) | (x >>> 32-n);
  }

  /**
   * Hash a string or an array of words.
   * @static
   * @param {boolean[]|String} data the data to hash.
   * @return {boolean[]} The hash value, an array of 5 big-endian words.
   */
  static hash(data:boolean[]|string) {
    return new this().update(data).finalize();
  };
  /**
   * Reset the hash state.
   * @return this
   */
  reset() {
    this._h = this._init.slice(0);
    this._buffer = [];
    this._length = 0;
    return this;
  }
  /**
   * The hash's block size, in bits.
   * @constant
   */
  blockSize=512
  /**
   * Input several words to the hash.
   * @param {boolean[]|String} data the data to hash.
   * @return this
   */
  update(data: boolean[]|string){
    if (typeof data === "string") {
      data = codec.utf8String.toBits(data);
    }
    var i, b = this._buffer = bitArray.concat(this._buffer.map((o)=>!!o), data).map((o)=>o?1:0),
        ol = this._length,
        nl = this._length = ol + bitArray.bitLength(data);
    if (nl > 9007199254740991){
      throw new Invalid("Cannot hash more than 2^53 - 1 bits");
    }

    if (typeof Uint32Array !== 'undefined') {
      var c = new Uint32Array(b);
      var j = 0;
      for (i = this.blockSize+ol - ((this.blockSize+ol) & (this.blockSize-1)); i <= nl; i+= this.blockSize) {
        this._block(c.subarray(16 * j, 16 * (j+1)));
        j += 1;
      }
      b.splice(0, 16 * j);
    } else {
      for (i = this.blockSize+ol - ((this.blockSize+ol) & (this.blockSize-1)); i <= nl; i+= this.blockSize) {
        this._block(b.splice(0,16));
      }
    }
    return this;
  }

  /**
   * Complete hashing and output the hash value.
   * @return {boolean[]} The hash value, an array of 5 big-endian words. TODO
   */
  finalize():boolean[]{
    var i, b = this._buffer, h = this._h;

    // Round out and push the buffer
    b = [...b, bitArray.partial(1,1)];
    // Round out the buffer to a multiple of 16 words, less the 2 length words.
    for (i = b.length + 2; i & 15; i++) {
      b.push(0);
    }

    // append the length
    b.push(Math.floor(this._length / 0x100000000));
    b.push(this._length | 0);

    while (b.length) {
      this._block(b.splice(0,16));
    }

    this.reset();
    return h.map((o)=>!!o);
  }
}
