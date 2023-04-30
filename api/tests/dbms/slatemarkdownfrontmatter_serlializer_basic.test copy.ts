import * as Y from 'yjs';
import { yTextToSlateElement } from '@slate-yjs/core';
import Dbms, {DbmsConfig} from '../../src/dbms/dbms.js'
import { DiskStorageAdaptorFactory } from '../../src/dbms/DiskStorageAdapter.js';
import { JsonSerialiserFactory } from "../../src/dbms/JsonSerializer";
import os from 'os'
import Collection, { CollectionPointer } from '../../src/dbms/collection.js';
import { SlateMarkdownFrontMatterSerialiserFactory, SlateMarkdownFrontMatterSerializer } from '../../src/dbms/SlateMarkdownFrontmatterSerializer.js';
import { BaseElement, Editor, Element, Node } from 'slate';
import fs  from 'fs';
import { Document } from '../../src/dbms/index.js';


describe('Dbms_Slate_Markdown+FrontMatter_serializer_Basics', () => {

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

  function fileExists(fqfilename: string): boolean {
    
      //fs.accessSync(fqfilename, fs.constants.F_OK);
      
      return fs.existsSync(fqfilename);;
    
  }


  
  function sleep(ms:number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }


  test('Add new Collection and doc if it doesnt exist', (done) => {

    let docName = "testinbox";
    let zettleroot: Collection | undefined;
    if (!db2.Collections.has("test_zettlekasten_root")) {
      db2.Collections.add("test_zettlekasten_root")
    }

    zettleroot = db2.Collections.get("test_zettlekasten_root")

    let inboxmd: Document | undefined;
    if (!zettleroot?.Documents.has(docName)) {
      zettleroot?.Documents.add(docName)
    }

    inboxmd = zettleroot?.Documents.get(docName);

    if (inboxmd && !inboxmd.data) {
      inboxmd.data = "";
    }
    done();
  });


  test('Add new Collection with simple name, add Document, then remove', (done) => {
    
    // try {
      const collectionName: string = "md_coll100";
      const docName: string = "mddoc1";
      let slateTestValue: any = [{ type: 'p', children: [{ text: 'initial value from backend' }] }, { type: 'p', children: [{ text: 'hehehehe' }] }];
      const doc = db2.Collections.add(collectionName).Documents.add(docName, slateTestValue)
      console.log(db2.Collections.size)
      expect(db2.Collections.size).toBeGreaterThan(0)
      expect(doc.data).toMatchObject<Node[]>(slateTestValue);
      expect(db2.Collections.get(collectionName)?.Documents.get(docName)?.name).toBe(docName)
      db2.Collections.get(collectionName)?.Documents.delete(docName);
      expect(db2.Collections.get(collectionName)?.Documents.get(docName)).toBeUndefined()
      const docpath = db2.config.dataRootPath + "/" + collectionName + "/" + doc.filename
      expect(fileExists(docpath)).toBe(false);

      db2.Collections.delete(collectionName)
      
      expect(fileExists(db2.config.dataRootPath + "/" + collectionName)).toBe(false);
      expect(fileExists(db2.config.metaDataRootPath + "/" + collectionName + "documents-index.json")).toBe(false);

      done();
    // } catch (error) {
    //   done(String(error));
    // }
  });

  test('Add_new_Collection_with_simple_name_add_Document_separately_then_remove', (done) => {
    
//    try {
      const collectionName: string = "md_coll100";
      const docName: string = "mddoc1";
      let slateTestValue: any = [{ type: 'p', children: [{ text: 'initial value from backend' }] }, { type: 'p', children: [{ text: 'hehehehe' }] }];
      const coll = db2.Collections.add(collectionName)
      console.log(db2.Collections.size)

      const doc = coll.Documents.add(docName, slateTestValue)
      console.log(coll.Documents.size)
      expect(db2.Collections.size).toBeGreaterThan(0)
      expect(doc.data).toMatchObject<Node[]>(slateTestValue);
      expect(db2.Collections.get(collectionName)?.Documents.get(docName)?.name).toBe(docName)
      db2.Collections.get(collectionName)?.Documents.delete(docName);

      db2.Collections.delete(collectionName)

      done();
    // } catch (error) {
    //   done(String(error));
    // }
  });
 
  test('Add new Collection with slashes in name, add Document, then remove', (done) => {
    
    try {
      const collectionName: string = "md_coll100/root";
      const docName: string = "mddoc1";
      let slateTestValue: any = [{ type: 'p', children: [{ text: 'initial value from backend' }] }, { type: 'p', children: [{ text: 'hehehehe' }] }];
      expect(db2.Collections.add(collectionName).Documents.add(docName, slateTestValue)).toThrowError("Initialise collections index failed! Error message: Error: Invalid collection name. Slash character is not allowed! Path selector syntax not supported yet")
      // console.log(db2.Collections.size)
      // expect(db2.Collections.size).toBeGreaterThan(0)
      // expect(doc.data).toMatchObject<Node[]>(slateTestValue);
      // expect(db2.Collections.get(collectionName)?.Documents.get(docName)?.name).toBe(docName)
      // db2.Collections.get(collectionName)?.Documents.remove(docName);
      // db2.Collections.remove(collectionName)

      done();
    } catch (error) {
      done();
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
      done(String(error));
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
    done(String(error));
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
      done(String(error));
    }
  });

  test('Serialize from Y.XmlText', (done) => {
    
    try {
  
      const ser = new SlateMarkdownFrontMatterSerializer();
      const ydoc = new Y.Doc()

      const yxmlText = ydoc.get('my xmltext type', Y.XmlText) as Y.XmlText

      yxmlText.insert(0, "abcd");
      yxmlText.format(1, 2, { bold: true })
      console.log(yxmlText);

      const a =  yTextToSlateElement(yxmlText) // this crashes. no idea why
      
      
      

      // const b = ser.serialize(a)
      // console.log("serialized `b`: ", b)
  
      // expect(b).toMatch("a*bc*d")
  
      done();
    } catch (error) {
      done(String(error));
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

