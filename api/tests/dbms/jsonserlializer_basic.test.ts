import Dbms, {DbmsConfig} from '../../src/dbms/dbms.js'
import { DiskStorageAdaptorFactory } from '../../src/dbms/DiskStorageAdapter.js';
import { JsonSerialiserFactory } from "../../src/dbms/JsonSerializer";
import os from 'os'
import Collection, { CollectionPointer } from '../../src/dbms/collection.js';

describe('Dbms Json Serializer Basics', () => {

  let dbconfig3:DbmsConfig = {
    dataRootPath: os.homedir + "/code-projects/osobisty-search/api/data/test",
    metaDataRootPath: os.homedir + "/code-projects/osobisty-search/api/data/test/meta",
    //storageAdaptor: new DiskStorageAdaptor(new JsonSerializer()),
    storageAdaptorFactory: new DiskStorageAdaptorFactory(),
    dataSerializerFactory: new JsonSerialiserFactory(),
  }
  
  let db3: Dbms;

  beforeAll(() => {
    db3 = new Dbms(dbconfig3)
  });

  afterAll(async () => {
    db3.destroy();
  });




  test('Add new Collection, get, then remove', (done) => {
    

    try {
      const collectionName: string = "coll100";
      const c2 = db3.Collections.add(collectionName);
      console.log(db3.Collections.size);
      expect(db3.Collections.get(collectionName)).toBeInstanceOf(Collection);
      expect(db3.Collections.get(collectionName)?.name).toBe(collectionName);
      expect(db3.Collections.get(collectionName)?.name).not.toBe("sdfsdfsdf");

      const DidRemove:boolean = db3.Collections.remove(collectionName);
      //const DidRemove:boolean = db.Collections.delete(collectionName);
      expect(DidRemove).toBe(true);
      expect(db3.Collections.get(collectionName)).toBeUndefined;
      expect(db3.Collections.has(collectionName)).toBe(false);

      done();
    } catch (error) {
      done(error);
      
    }    

  });

  test('Add new Collection, add Document, then remove', (done) => {
    
    try {
      const collectionName: string = "coll2";
      const docName: string = "doc1";
      const doc = db3.Collections.add(collectionName).Documents.add(docName, {bla: "ssome eheh ehlkh dfj w"})
      console.log(db3.Collections.size)
      expect(db3.Collections.size).toBeGreaterThan(0)
      expect(doc.data).toMatchObject({bla: "ssome eheh ehlkh dfj w"});
      expect(db3.Collections.get(collectionName)?.Documents.get(docName)?.name).toBe(docName)

      db3.Collections.get(collectionName)?.Documents.remove(docName);
      db3.Collections.remove(collectionName)

      done();
    } catch (error) {
      done(error); 
    }
  });


  // test('Test empty array de/serialize behaviour', (done) => {
    

  //   try {
      
  //     const ci: Array<CollectionPointer> = new Array<CollectionPointer>();

  //     const serialized = JSON.stringify(ci);

  //     console.log("serialized: ", serialized);

  //     const deserialzedObj = JSON.parse(serialized);

  //     console.log("deserialized object: ", deserialzedObj);


  //     done();
  //   } catch (error) {
  //     done(error);
      
  //   }    

  // });

 
});