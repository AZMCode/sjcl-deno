/** @fileOverview Bit array codec implementations.
 *
 * @author Nils Kenneweg
 */
import * as bitArray from "./bitArray.ts";
import * as base32hex from "./base32Hex.ts";
import * as exception from "./exception.ts";

/** The base32 alphabet.
 * @private
 */
const _chars= "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const _hexChars= "0123456789ABCDEFGHIJKLMNOPQRSTUV";

/* bits in an array */
const BITS= 32;
/* base to encode at (2^x) */
const BASE= 5;
/* bits - base */
const REMAINING= 27;

/** Convert from a bitArray to a base32 string. */
export function fromBits(arr:Uint32Array, _noEquals:boolean, _hex:boolean) {
  var out = "", i, bits=0, c = _chars, ta=0, bl = bitArray.bitLength(arr);

  if (_hex) {
    c = _hexChars;
  }

  for (i=0; out.length * BASE < bl; ) {
    out += c.charAt((ta ^ arr[i]>>>bits) >>> REMAINING);
    if (bits < BASE) {
      ta = arr[i] << (BASE-bits);
      bits += REMAINING;
      i++;
    } else {
      ta <<= BASE;
      bits -= BASE;
    }
  }
  while ((out.length & 7) && !_noEquals) { out += "="; }

  return out;
}

/** Convert from a base32 string to a bitArray */
export function toBits(str:string, _hex:boolean):Uint32Array {
  str = str.replace(/\s|=/g,'').toUpperCase();
  var out = [], i, bits=0, c = _chars, ta=0, x, format="base32";

  if (_hex) {
    c = _hexChars;
    format = "base32hex";
  }

  for (i=0; i<str.length; i++) {
    x = c.indexOf(str.charAt(i));
    if (x < 0) {
      // Invalid character, try hex format
      if (!_hex) {
        try {
          return base32hex.toBits(str);
        }
        catch (e) {}
      }
      throw new exception.Invalid("this isn't " + format + "!");
    }
    if (bits > REMAINING) {
      bits -= REMAINING;
      out.push(ta ^ x>>>bits);
      ta  = x << (BITS-bits);
    } else {
      bits += BASE;
      ta ^= x << (BITS-bits);
    }
  }
  if (bits&56) {
    out.push(bitArray.partial(bits&56, ta, 1));
  }
  return Uint32Array.from(out);
}