import Dbms, {DbmsConfig} from '../../src/dbms/dbms.js'
import { DiskStorageAdaptorFactory } from '../../src/dbms/DiskStorageAdapter.js';
import { JsonSerialiserFactory } from "../../src/dbms/JsonSerializer";
import os from 'os'
import Collection, { CollectionPointer } from '../../src/dbms/collection.js';
import { SlateMarkdownFrontMatterSerialiserFactory, SlateMarkdownFrontMatterSerializer } from '../../src/dbms/SlateMarkdownFrontmatterSerializer.js';
import { BaseElement, Editor, Element, Node } from 'slate';

describe('Dbms Slate Markdown+FrontMatter serializer Basics', () => {

  let dbconfig2:DbmsConfig = {
    dataRootPath: os.homedir + "/code-projects/osobisty-search/api/data/test",
    metaDataRootPath: os.homedir + "/code-projects/osobisty-search/api/data/test/meta",
    //storageAdaptor: new DiskStorageAdaptor(new JsonSerializer()),
    storageAdaptorFactory: new DiskStorageAdaptorFactory(),
    dataSerializerFactory: new SlateMarkdownFrontMatterSerialiserFactory(),
  }
  
  let db2: Dbms;

  beforeAll(() => {
    db2 = new Dbms(dbconfig2)
  });

  afterAll(async () => {
    db2.destroy();
  });


  test('Add new Collection, add Document, then remove', (done) => {
    
    try {
      const collectionName: string = "md_coll100";
      const docName: string = "mddoc1";
      let slateTestValue: any = [{ type: 'p', children: [{ text: 'initial value from backend' }] }, { type: 'p', children: [{ text: 'hehehehe' }] }];
      const doc = db2.Collections.add(collectionName).Documents.add(docName, slateTestValue)
      console.log(db2.Collections.size)
      expect(db2.Collections.size).toBeGreaterThan(0)
      expect(doc.data).toMatchObject<Node[]>(slateTestValue);
      expect(db2.Collections.get(collectionName)?.Documents.get(docName)?.name).toBe(docName)
      db2.Collections.get(collectionName)?.Documents.remove(docName);
      db2.Collections.remove(collectionName)

      done();
    } catch (error) {
      done(error); 
    }
  });
 

  

  test('MD de/serialize - simple text paragraph', (done) => {
    
    try {

      const ser = new SlateMarkdownFrontMatterSerializer();

      const a = ser.deserialize("Hello")
      console.log("deserialized `a`: ", JSON.stringify(a))
// let initialValue: Editor =  { children: [{"type":"h2","dep":2,"children":[{"text":"Hello, "},{"emphasis":true,"text":"yes"}]}]} //{ type: 'p', children: [{ text: 'initial value from backend' }] }; //[{ type: 'p', children: [{ text: 'initial value from backend' }] }, { type: 'p', children: [{ text: 'hehehehe' }] }];
      const b = ser.serialize(a)
      console.log("serialized `b`: ", b)
      expect(b).toMatch("Hello")
      done();
    } catch (error) {
      done(error); 
    }
  });
 

 test('MD de/serialize - heading 1', (done) => {
    
  try {

    const ser = new SlateMarkdownFrontMatterSerializer();

    const a = ser.deserialize("# Hello")
    console.log("deserialized `a`: ", JSON.stringify(a))
// let initialValue: Editor =  { children: [{"type":"h2","dep":2,"children":[{"text":"Hello, "},{"emphasis":true,"text":"yes"}]}]} //{ type: 'p', children: [{ text: 'initial value from backend' }] }; //[{ type: 'p', children: [{ text: 'initial value from backend' }] }, { type: 'p', children: [{ text: 'hehehehe' }] }];
    const b = ser.serialize(a)
    console.log("serialized `b`: ", b)

    expect(b).toMatch("# Hello")

    done();
  } catch (error) {
    done(error); 
  }
  });

  test('MD de/serialize - text decoration italics, bold, strikethrough, inlinecode', (done) => {
    
    try {
  
      const ser = new SlateMarkdownFrontMatterSerializer();
  
      const a = ser.deserialize("# Hello, _italics_, **bold**, ~~strikethrough~~, `const code = () => {}`")
      console.log("deserialized `a`: ", JSON.stringify(a))
  // let initialValue: Editor =  { children: [{"type":"h2","dep":2,"children":[{"text":"Hello, "},{"emphasis":true,"text":"yes"}]}]} //{ type: 'p', children: [{ text: 'initial value from backend' }] }; //[{ type: 'p', children: [{ text: 'initial value from backend' }] }, { type: 'p', children: [{ text: 'hehehehe' }] }];
      const b = ser.serialize(a)
      console.log("serialized `b`: ", b)
  
      expect(b).toMatch("# Hello")
  
      done();
    } catch (error) {
      done(error); 
    }
    });
  

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

 
// });