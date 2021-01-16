import * as base32 from "./codecBase32.ts";
export function fromBits(arr:Uint32Array, _noEquals: boolean) { return base32.fromBits(arr,_noEquals,true); }
export function toBits(str:string):Uint32Array { return base32.toBits(str,true) }; 