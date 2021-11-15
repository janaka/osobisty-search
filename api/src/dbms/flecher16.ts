/**
 * The MIT License (MIT)

Copyright (c) 2014 William Casarin


Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation 
files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, 
modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is 
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES 
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE 
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR 
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// https://github.com/jb55/fletcher
// https://en.wikipedia.org/wiki/Fletcher%27s_checksum

/**
 * Fletcher-16 checksum algo. https://en.wikipedia.org/wiki/Fletcher%27s_checksum
 * @param {Buffer} data - data to generate the checksum against. E.g. chunk of text converted to a buffer.
 * @returns {number} checksum
 * 
 * ```
 * function generateIdFromText(text: string): string {
      const b: Buffer = Buffer.from(text, 'utf-8')

      const id = fletcher16(b)

      return id.toString();
  }
  ```
 */
export default function fletcher16(data: Buffer): number {
  var sum1 = 0xff, sum2 = 0xff;
  var i = 0;
  var len = data.length;

  while (len) {
    var tlen = len > 20 ? 20 : len;
    len -= tlen;
    do {
      sum2 += sum1 += data[i++];
    } while (--tlen);
    sum1 = (sum1 & 0xff) + (sum1 >> 8);
    sum2 = (sum2 & 0xff) + (sum2 >> 8);
  }
  /* Second reduction step to reduce sums to 8 bits */
  sum1 = (sum1 & 0xff) + (sum1 >> 8);
  sum2 = (sum2 & 0xff) + (sum2 >> 8);
  return sum2 << 8 | sum1;
}