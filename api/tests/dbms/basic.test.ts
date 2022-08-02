import Dbms, {DbmsConfig} from '../../src/dbms/dbms.js'
import { DiskStorageAdaptorFactory } from '../../src/dbms/DiskStorageAdapter.js';
import { JsonSerialiserFactory } from "../../src/dbms/JsonSerializer";
import os from 'os'
import Collection, { CollectionPointer } from '../../src/dbms/collection.js';

describe('Dbms Basics', () => {

  const dbconfig:DbmsConfig = {
    dataRootPath: os.homedir + "/code-projects/osobisty-search/api/data/test",
    metaDataRootPath: os.homedir + "/code-projects/osobisty-search/api/data/test/meta",
    //storageAdaptor: new DiskStorageAdaptor(new JsonSerializer()),
    storageAdaptorFactory: new DiskStorageAdaptorFactory(),
    dataSerializerFactory: new JsonSerialiserFactory(),
  }
  
  let db: Dbms;

  beforeAll(() => {
    db = new Dbms(dbconfig)
  });

  afterAll(async () => {
    db.destroy();
  });


  test('Add new Collection, add Document, then remove', (done) => {
    
    try {
      const collectionName: string = "coll2";
      const docName: string = "doc1";
      const doc = db.Collections.add(collectionName).Documents.add(docName, {bla: "ssome eheh ehlkh dfj w"})
      console.log(db.Collections.size)
      expect(db.Collections.size).toBeGreaterThan(0)
      expect(doc.data).toMatchObject({bla: "ssome eheh ehlkh dfj w"});
      expect(db.Collections.get(collectionName)?.Documents.get(docName)?.name).toBe(docName)

      db.Collections.get(collectionName)?.Documents.remove(docName);
      db.Collections.remove(collectionName)

      done();
    } catch (error) {
      done(error); 
    }
  });

  test('Add new Collection, get, then remove', (done) => {
    

    try {
      const collectionName: string = "coll100";
      const c2 = db.Collections.add(collectionName);
      console.log(db.Collections.size);
      expect(db.Collections.get(collectionName)).toBeInstanceOf(Collection);
      expect(db.Collections.get(collectionName)?.name).toBe(collectionName);
      expect(db.Collections.get(collectionName)?.name).not.toBe("sdfsdfsdf");

      const DidRemove:boolean = db.Collections.remove(collectionName);
      //const DidRemove:boolean = db.Collections.delete(collectionName);
      expect(DidRemove).toBe(true);
      expect(db.Collections.get(collectionName)).toBeUndefined;
      expect(db.Collections.has(collectionName)).toBe(false);

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