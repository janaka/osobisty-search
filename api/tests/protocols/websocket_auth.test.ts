import {encoding, decoding} from 'lib0'
/**
 * Tests the json string <> json serialisation is working.
 * This serialiser is used to convert in-mem json objects to json strings for use cases like persistence
 * Strage backend is decoupled from the object serializer.
 * The storage adaptors define persistance backend+protocol like database, filesystem, G Drive, S3 etc.
 * Dbms metadata is persisted as json and NOT configurable. 
 * Data persistence can be different and configured during instantiation of the instance.
 */

describe('Dbms Json Serializer Basics', () => {


  
  

  beforeAll(() => {

  });

  afterAll(async () => {

  });




  test('binary_encode_decode', (done) => {
      // lib0 binary encoder/decoder
      // this a example of how to use the utility.
      // because there no schema the key is the values need to be read in the same order they were written

      const encoder = encoding.createEncoder()
      encoding.writeVarUint(encoder, 0)
      encoding.writeVarUint(encoder, 1)
      encoding.writeVarString(encoder, "Bearer: sadfjlsjdfljdsfsfd97439574b95794w7bavslkfsbf9847brakfjhbva98r7bv293v")
      const message = encoding.toUint8Array(encoder)

      const decoder = decoding.createDecoder(message)
      //const encoder = encoding.createEncoder()
      const messageValue1 = decoding.readVarUint(decoder)
      const messageValue2 = decoding.readVarUint(decoder)
      const messageValue3 = decoding.readVarString(decoder)

      expect(messageValue1).toBe(0);
      expect(messageValue2).toBe(1);
      expect(messageValue3).toBe("Bearer: sadfjlsjdfljdsfsfd97439574b95794w7bavslkfsbf9847brakfjhbva98r7bv293v")

      done()
  });

 

 
});