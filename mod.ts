/** 
 * @fileOverview The Stanford Javascript Crypto Library ported to Deno tooling
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 * @author Adriano Zambrana
 */

/**
 * Symmetric ciphers.
 * @export cipher
 */
export * as cipher from "./src/cipher.ts";


/**
 * Hash functions.  Right now only SHA256 is implemented.
 * @export hash
 */
export * as hash from "./src/hash.ts";

/**
 * Key exchange functions.  Right now only SRP is implemented.
 * @export keyExchange
 */
//import * as keyExchange from "./src/keyExchange.ts"
//export { keyExchange };

/**
 * Cipher modes of operation.
 * @export mode
 */
//import * as mode from "./src/mode.ts"
//export { mode };

/**
 * Miscellaneous.  HMAC and PBKDF2.
 * @export misc
 */
//import * as misc from "./src/misc.ts";
//export { misc };
  
  /**
   * Bit array encoders and decoders.
   * @export codec
   *
   * @description
   * The members of this namespace are functions which translate between
   * SJCL's bitArrays and other objects (usually strings).  Because it
   * isn't always clear which direction is encoding and which is decoding,
   * the method names are "fromBits" and "toBits".
   */
  export * as codec from "./src/codec.ts";
  
  /**
   * Exceptions.
   * @export exception
   */
  export * as exception from "./src/exception.ts";
