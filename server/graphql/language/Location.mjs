/**
 * *****************************************************************************
 * 
 * Location Object
 *
 * *****************************************************************************
 */

export class Location {
  constructor (startToken, endToken, source) {
    this.startToken = startToken;
    this.endToken = endToken;
    this.source = source;

    this.start = startToken.start;
    this.end = endToken.end;
  }

  toJSON () {
    return {
      start: this.start,
      end: this.end
    }
  }
}
