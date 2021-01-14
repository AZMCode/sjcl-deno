/**
 * @FileOverview
 * Exceptions
 */
export class SjclError extends Error{}

/**
 * Ciphertext is corrupt.
 * @constructor
 */
export class Corrupt extends SjclError{
    constructor(message: string){
        super();
        this.toString = function() { return "CORRUPT: "+this.message; };
        this.message = message;
    }
    
}

/**
 * Invalid parameter.
 * @constructor
 */
export class Invalid extends SjclError{
    constructor(message: string){
        super();
        this.toString = function() { return "INVALID: "+this.message; };
        this.message = message;
    }
    
}

/**
 * Bug or missing feature in SJCL.
 * @constructor
 */
export class Bug extends SjclError{
    constructor(message: string){
        super();
        this.toString = function() { return "BUG: "+this.message; };
        this.message = message;
    }
}

/**
 * Something isn't ready.
 * @constructor
 */
export class NotReady extends SjclError{
    constructor(message: string){
        super();
        this.toString = function() { return "NOT READY: "+this.message; };
        this.message = message;
    }
}