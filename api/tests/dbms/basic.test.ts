import Dbms, {DbmsConfig} from '../../src/dbms/dbms.js'
import os from 'os'
import { JsonFileAdaptorFactory } from '../../src/dbms/baseFileAdaptor.js';

describe('Dbms Basics', () => {

  const dbconfig:DbmsConfig = {
    dataRootPath: os.homedir + "/code-projects/osobisty-search/api/data/test",
    metaDataRootPath: os.homedir + "/code-projects/osobisty-search/api/data/test/meta",
    fileAdaptorFactory: new JsonFileAdaptorFactory<object>()
    // diskStorageFactory: new diskStorageFactory(),
    // jsonSerialiserFactory: new jsonSerialiserFactory()
  }
  
  let db: Dbms;

  beforeAll(() => {
    db = new Dbms(dbconfig)
  });

  afterAll(async () => {
    db.destroy();
  });


  test('Basic collection add', (done) => {
    
    //console.log(db.Collections.length)
    //console.log(db.config)
    
    // const c = new Collection("test", db)
    // db.Collections.set(c.name, c)

    try {
      const c2 = db.Collections.add("coll2").Documents.add("doc1", {bla: "ssome eheh ehlkh dfj w"})
      console.log(db.Collections.size)
      expect(db.Collections.size).toBeGreaterThan(0)
      expect(c2.data).toMatchObject({bla: "ssome eheh ehlkh dfj w"})    
      done();
    } catch (error) {
      done(error);
      
    }
    

  });

 
});