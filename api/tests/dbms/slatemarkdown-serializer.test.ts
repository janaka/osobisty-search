import * as Y from 'yjs';
import { yTextToSlateElement } from '@slate-yjs/core';
import Dbms, {DbmsConfig} from '../../src/dbms/dbms.js'
import { DiskStorageAdaptorFactory } from '../../src/dbms/DiskStorageAdapter.js';
import { JsonSerialiserFactory } from "../../src/dbms/JsonSerializer.js";
import os from 'os'
import Collection, { CollectionPointer } from '../../src/dbms/collection.js';
import { SlateMarkdownFrontMatterSerialiserFactory, SlateMarkdownFrontMatterSerializer } from '../../src/dbms/SlateMarkdownFrontmatterSerializer.js';
import { BaseElement, Editor, Element, Node } from 'slate';
import fs  from 'fs';
import { Document } from '../../src/dbms/index.js';


describe('Slate_Markdown+FrontMatter_serializer_Basics', () => {

  let dbconfig2:DbmsConfig = {
    dataRootPath: os.homedir + "/code-projects/osobisty-search/api/data/test",
    metaDataRootPath: os.homedir + "/code-projects/osobisty-search/api/data/test/meta",
    //storageAdaptor: new DiskStorageAdaptor(new JsonSerializer()),
    storageAdaptorFactory: new DiskStorageAdaptorFactory(),
    dataSerializerFactory: new SlateMarkdownFrontMatterSerialiserFactory(),
  }
  
  let db2: Dbms;

  beforeAll(() => {
    //db2 = new Dbms(dbconfig2)
  });

  afterAll(async () => {
    //db2.destroy();
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
  
      const a = ser.deserialize("# Hello, _italics_, **bold**, ~~strikethrough~~, ")
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

  test('MD de/serialize - inlinecode', (done) => {
    
    try {
  
      const ser = new SlateMarkdownFrontMatterSerializer();
  
      const a = ser.deserialize("`const code = () => {}`")
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

 

});

