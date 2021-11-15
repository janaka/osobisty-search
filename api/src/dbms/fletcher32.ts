
// source: https://gist.github.com/bryc/8a0885a4be58b6bbf0ec54c7758c0841

// Fletcher-32
// May operate on 16-bit words (not bytes).

/**
 * Flecher-32 checksum algo. https://en.wikipedia.org/wiki/Fletcher%27s_checksum
 * @param {Buffer} data - data to generate the checksum against. E.g. chunk of text converted to a buffer.
 * @returns {number} checksum.
 * ```typescript
 * function generateIdFromText(text: string): string {
      const b: Buffer = Buffer.from(text, 'utf-8')

      const id = fletcher32(b)

      return id.toString();
  }
  ```
 * 
 */
export default function fletcher32(data: Buffer): number {
  var _sum1 = 0xffff, _sum2 = 0xffff;
  var words = data.length;
  var dataIndex = 0;
  while (words) {
      var tlen = words > 359 ? 359 : words;
      words -= tlen;
      do {
          _sum2 += _sum1 += data[dataIndex++];
      } while (--tlen);
      _sum1 = ((_sum1 & 0xffff) >>> 0) + (_sum1 >>> 16);
      _sum2 = ((_sum2 & 0xffff) >>> 0) + (_sum2 >>> 16);
  }
  _sum1 = ((_sum1 & 0xffff) >>> 0) + (_sum1 >>> 16);
  _sum2 = ((_sum2 & 0xffff) >>> 0) + (_sum2 >>> 16);
  return ((_sum2 << 16) >>> 0 | _sum1) >>> 0;
}