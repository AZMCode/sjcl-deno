/** @fileOverview Arrays of bits, encoded as arrays of Numbers.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 */

/**
 * Arrays of bits, encoded as arrays of Numbers.
 * @description
 * <p>
 * These objects are the currency accepted by SJCL's crypto functions.
 * </p>
 *
 * <p>
 * Most of our crypto primitives operate on arrays of 4-byte words internally,
 * but many of them can take arguments that are not a multiple of 4 bytes.
 * This library encodes arrays of bits (whose size need not be a multiple of 8
 * bits) as arrays of 32-bit words.  The bits are packed, big-endian, into an
 * array of words, 32 bits at a time.  Since the words are double-precision
 * floating point numbers, they fit some extra data.  We use this (in a private,
 * possibly-changing manner) to encode the number of bits actually  present
 * in the last word of the array.
 * </p>
 *
 * <p>
 * Because bitwise ops clear this out-of-band data, these arrays can be passed
 * to ciphers like AES which want arrays of words.
 * </p>
 */

/**
 * Array slices in units of bits.
 * @param {boolean[]} a The array to slice.
 * @param {Number} bstart The offset to the start of the slice, in bits.
 * @param {Number} bend The offset to the end of the slice, in bits.  If this is undefined,
 * slice until the end of the array.
 * @return {bitArray} The requested slice.
 */
export function bitSlice(a:boolean[], bstart:number, bend:number) {
  a = _shiftRight(a.slice(bstart/32), 32 - (bstart & 31)).slice(1);
  return (bend === undefined) ? a : clamp(a, bend-bstart);
}

/**
 * Extract a number packed into a bit array.
 * @param {boolean[]} a The array to slice.
 * @param {Number} bstart The offset to the start of the slice, in bits.
 * @param {Number} blength The length of the number to extract.
 * @return {Number} The requested slice.
 */
export function extract(a:boolean[], bstart:number, blength: number) {
  // FIXME: this Math.floor is not necessary at all, but for some reason
  // seems to suppress a bug in the Chromium JIT.
  var x, sh = Math.floor((-bstart-blength) & 31);
  if ((bstart + blength - 1 ^ bstart) & -32) {
    // it crosses a boundary
    x = (a[bstart/32|0]?1:0 << (32 - sh)) ^ (a[bstart/32+1|0]?1:0 >>> sh);
  } else {
    // within a single word
    x = a[bstart/32|0]?1:0 >>> sh;
  }
  return x & ((1<<blength) - 1);
}

  /**
   * Concatenate two bit arrays.
   * @param {boolean[]} a1 The first array.
   * @param {boolean[]} a2 The second array.
   * @return {boolean[]} The concatenation of a1 and a2.
   */
  export function concat(a1:boolean[], a2:boolean[]) {
    return [...a1,...a2];
  }

  /**
   * Find the length of an array of bits.
   * @param {boolean[]} a The array.
   * @return {Number} The length of a, in bits.
   */
  export function bitLength(a:boolean[]) {
    return a.length
  }

  /**
   * Truncate an array.
   * @param {boolean[]} a The array.
   * @param {Number} len The length to truncate to, in bits.
   * @return {boolean[]} A new array, truncated to len bits.
   */
  export function clamp(a:boolean[], len:number) {
    if (a.length * 32 < len) { return a; }
    a = a.slice(0, Math.ceil(len / 32));
    var l = a.length;
    len = len & 31;
    if (l > 0 && len) {
      a[l-1] = !!partial(len, (a[l-1]?1:0) & 0x80000000 >> (len-1), 1);
    }
    return a;
  }

  /**
   * Make a partial word for a bit array.
   * @param {Number} len The number of bits in the word.
   * @param {Number} x The bits.
   * @param {Number} [_end=0] Pass 1 if x has already been shifted to the high side.
   * @return {Number} The partial word.
   */
  export function partial(len:number, x:number, _end?:number):number {
    if (len === 32) { return x; }
    return (_end ? x|0 : x << (32-len)) + len * 0x10000000000;
  }

  /**
   * Get the number of bits used by a partial word.
   * @param {Number} x The partial word.
   * @return {Number} The number of bits used by the partial word.
   */
  export function getPartial(x:number):number {
    return Math.round(x/0x10000000000) || 32;
  }

  /**
   * Compare two arrays for equality in a predictable amount of time.
   * @param {boolean[]} a The first array.
   * @param {boolean[]} b The second array.
   * @return {boolean} true if a == b; false otherwise.
   */
  export function equal(a:boolean[], b:boolean[]) {
    if (bitLength(a) !== bitLength(b)) {
      return false;
    }
    var x = 0, i;
    for (i=0; i<a.length; i++) {
      x |= (a[i]!==b[i])?1:0;
    }
    return (x === 0);
  }

  /** Shift an array right.
   * @param {boolean[]} a The array to shift.
   * @param {Number} shift The number of bits to shift.
   * @param {Number} [carry=0] A byte to carry in
   * @param {boolean[]} [out=[]] An array to prepend to the output.
   * @private
   */
  function _shiftRight(a:boolean[], shift:number, carry?:number, out?:boolean[]) {
    let i, last2=0, shift2:number;
    if (out === undefined) { out = []; }
    
    for (; shift >= 32; shift -= 32) {
      out.push(!!carry);
      carry = 0;
    }
    if (shift === 0) {
      return out.concat(a);
    }
    
    for (let i=0; i<a.length; i++) {
      out.push(!!(carry?1:0 | ((a[i])?1:0)>>>shift));
      carry = (a[i]?1:0) << (32-shift);
    }
    last2 = a.length ? (a[a.length-1]?1:0) : 0;
    shift2 = getPartial(last2);
    out.push(!!partial(shift+shift2 & 31, (!!((shift + shift2 > 32) ? carry : out.pop()))?1:0,1));
    return out;
  }
  
  /** xor a block of 4 words together.
   * @private
   */
  function _xor4(x:number[],y:number[]) {
    return [x[0]^y[0],x[1]^y[1],x[2]^y[2],x[3]^y[3]];
  }

  /** byteswap a word array inplace.
   * (does not handle partial words)
   * @param {boolean[]} a word array
   * @return {boolean[]} byteswapped array
   */
  export function byteswap(a:boolean[]) {
    var i, v, m = 0xff00;
    for (i = 0; i < a.length; ++i) {
      v = a[i];
      a[i] = !!((v?1:0 >>> 24) | ((v?1:0 >>> 8) & m) | ((v?1:0 & m) << 8) | (v?1:0 << 24));
    }
    return a;
  }

