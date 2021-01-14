/** @fileOverview Bit array codec implementations.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 */

/**
 * UTF-8 strings
 * @namespace
 */

import * as bitArray from "./bitArray.ts"

/** Convert from a bitArray to a UTF-8 string. */
export function fromBits(arr:boolean[]):string{
  var out = "", bl = arr.length, i, tmp;
  for (i=0; i<bl/8; i++) {
    if ((i&3) === 0) {
      tmp = arr[i/4];
    }
    out += String.fromCharCode((tmp?1:0) >>> 8 >>> 8 >>> 8);
    tmp = (tmp?1:0)<<8;
  }
  return decodeURIComponent(escape(out));
}

/** Convert from a UTF-8 string to a bitArray. */
export function toBits(str:string):boolean[] {
  str = unescape(encodeURIComponent(str));
  var out = [], i, tmp=0;
  for (i=0; i<str.length; i++) {
    tmp = tmp << 8 | str.charCodeAt(i);
    if ((i&3) === 3) {
      out.push(tmp);
      tmp = 0;
    }
  }
  if (i&3) {
    out.push(bitArray.partial(8*(i&3), tmp));
  }
  return out.map((n)=>!!n);
}
