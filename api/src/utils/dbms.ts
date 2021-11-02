import fs from 'fs';
import { threadId } from 'worker_threads';

export interface DbmsConfig {
  dataRootPath: string;
  metaDataRootPath: string;
}

/**
 * Embedded Javascript database manager with persistence in any textfile based structure like JSON, YAML, MarkDown
 */
export class Dbms {
  private _collections: Array<Collection>;
  private _collectionsFileAdaptor: JsonFileAdaptor;

  config: DbmsConfig;

  constructor(dbmsConfig: DbmsConfig) {
    this.config = dbmsConfig; // TODO: if paths don't exist then create them
    this._collections = []
    this.Collections.push = (item:any):number => {
      Array.prototype.push.call(this._collections, item)
      this.saveCollectionsIndexToDisk()
      return this._collections.length
    }

    this._collectionsFileAdaptor = new JsonFileAdaptor(this.config.metaDataRootPath + "/collections-index.json")
    
    if (!this._collectionsFileAdaptor.dirExists(this.config.dataRootPath)) {
      fs.mkdir(this.config.dataRootPath, {recursive: true}, (error, path) => {
        if (error) {
          throw error
        }
      })
    }

    if (!this._collectionsFileAdaptor.dirExists(this.config.metaDataRootPath)) {
      fs.mkdir(this.config.metaDataRootPath, {recursive: true}, (error, path) => {
        if (error) {
          throw error
        }
      })
    }
  }

  private saveCollectionsIndexToDisk() {
    console.log("saveCollectionsIndexToDisk")
    this._collectionsFileAdaptor.saveToDisk(this._collections)
  }

  get Collections(): Array<Collection> {
    if (this._collections === undefined) {
      this._collections = this.loadCollectionsIndex()
    }
    return this._collections
  }

  private loadCollectionsIndex(): Array<Collection> {
    //TODO: implement collection index persistence
    throw new Error('Method not implemented.');
    return new Array<Collection>();
  }

}


export class Collection {
  private _documents: Array<Document>;
  private _documentsIndexFileAdaptor: JsonFileAdaptor;
private _dbms: Dbms;
  readonly name: string;

  constructor(name:string, dbms:Dbms) {
    this.name = name;
    this._dbms = dbms;
    this._documents = [];
    this._documentsIndexFileAdaptor = new JsonFileAdaptor(this._dbms.config.metaDataRootPath+ "/documents-index.json")
    this.Documents.push = (item:any):number => {
      Array.prototype.push.call(this._documents, item)
      this.saveDocumentsIndexToDisk()
      return this._documents.length
    }
  }

  get Documents(): Array<Document> {
    if (this._documents === undefined) {
      this._documents = this.loadDocumentsIndex()
    }
    return this._documents
  }

  saveDocumentsIndexToDisk() {
    console.log("saveDocumentsIndexToDisk")
    this._documentsIndexFileAdaptor.saveToDisk(this._documents)
  }

  loadDocumentsIndex(): Array<Document> {
    throw new Error('Method not implemented.');
    return new Array<Document>();
  }
}


/**
 * Collection is a container for a JS object.
 * Think of it as a colleciton of documents.
 * But we aren't going to be oppinionated about the stucture.
 * Consumers will use standard functionality such as Array.push
 */
export class Document {
  private _dbms: Dbms;
  _data: object;
  _documentFileAdaptor: BaseFileAdaptor;

  readonly name: string;
  //readonly filename: string;

  constructor(name: string, dbms: Dbms, private fileAdaptor: BaseFileAdaptor) {
    
    this.name = name;
    //this.filename = name + ".json";
    this._data = {}; //TODO: extend Object and figure out how to remove the data property
    this._dbms = dbms;
    this._documentFileAdaptor = fileAdaptor;
  }

  /**
   * Document data
   */
  get data(): object {
    //TODO: figure out async
    if (this._data == undefined || this._data === null) {
      this._data = this._documentFileAdaptor.loadFromDisk();
    }
    return this._data;
  }

  /**
   * Persist changes to fiel on disk
   */
  async save() {
    this._documentFileAdaptor.saveToDisk(this._data)
  }

}


/**
 * Inherit to implement file format specific adaptor classes. Example: json or yaml or Markdown + FrontMatter. 
 * Collection instances use this to manage persistance.
 */
abstract class BaseFileAdaptor {

  filename: string;

  /**
   * 
   * @param filename filename, with fully qualified path, to load/save on disk.
   */
  constructor(filename: string) {
    this.filename = filename
  }

  /**
   * Data Json object to string. 
   */
  abstract serialize(data: object): string

  /**
   * Data string to Json object
   */
  abstract deserialize(data: string): object

  /**
   * Save data to disk is whatevery structure implemented in by the `serializer()`  method.
   * @param data as `object`
   */
  async saveToDisk(data: object) {
    const s: string = this.serialize(data);
    if (this.fileExists(this.filename)) {

    }
    fs.writeFile(this.filename, s, 'utf-8', (error: any) => {
      if (error) throw error
    })
  }

  /**
   * Load data from disk and deserialize using the implementation specific deserializer.
   * Expects the file to be in UTF-8
   * @returns deserialized file data as an `object`.
   */
  async loadFromDisk(): Promise<object> {
    const s: string = "";

    let c: object = {};
    if (this.fileExists(this.filename)) {
      fs.readFile(this.filename, 'utf-8', (error: any, data: string) => {
        if (!error) throw new Error(error);
        if (data) {
          c = this.deserialize(data);
        }
      })
    }
    return c;

  }

  /**
   * 
   * @param filename Check if the file exists without opening or modifiying
   * @returns `true` if exists else `false`
   */
  fileExists(filename: string): boolean {
    let exists: boolean = false
    fs.access(filename, fs.constants.F_OK, (err) => {
      if (err) {
        console.error(err)
        exists = false;
      } else {
        exists = true;
      }
    })
    return exists
  }

  dirExists(directory: string): boolean {
    let exists: boolean = false
    fs.access(directory, fs.constants.F_OK, (err) => {
      if (err) {
        console.error(err)
        exists = false;
      } else {
        exists = true;
      }
    })
    return exists
  }
}

/**
 * Persist objects as JSON string without modifying the structure.
 */
export class JsonFileAdaptor extends BaseFileAdaptor {
  serialize(data: object): string {
    return JSON.stringify(data);
  }
  deserialize(data: string): object {
    return JSON.parse(data);
  }
}

/**
 * config

Dbms

dbms.collections.create/delete

dbms.collection[sadfsd]:collection

collection.data: object

collection.save

collections
- collection : fileAdaptor
-- documents
---document : file

documents.




 */




