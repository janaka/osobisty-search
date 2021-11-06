import fs, { cp } from 'fs';
import { object } from 'joi';
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
  private _collectionsIndexFileAdaptor: JsonFileAdaptor<Array<CollectionPointer>>;


  config: DbmsConfig;

  constructor(dbmsConfig: DbmsConfig) {
    this.config = dbmsConfig;

    this._collectionsIndexFileAdaptor = new JsonFileAdaptor(this.config.metaDataRootPath, "collections-index.json")


    // if (!this._collectionsIndexFileAdaptor.dirExists()) {
    //   throw new Error("MataDataRootath folder " + this.config.metaDataRootPath + " doesn't exist.")
    // }

    this._collections = new Array<Collection>();
    this._collections.push = (item:any):number => {
      Array.prototype.push.call(this._collections, item)
      this.saveCollectionsIndexToDisk()
      return this._collections.length
    }
  }

  get Collections(): Array<Collection> {
    if (this._collections === undefined) {
      const o = this.loadCollectionsIndex()
      console.log(o)
      //this._collections = 
    }
    return this._collections
  }

  private saveCollectionsIndexToDisk() {
    console.log("saveCollectionsIndexToDisk")
    //TODO: create a index object manually m

    const collectionsIndexArray = new Array<CollectionPointer>();

    this._collections.forEach((e: Collection) => {
      collectionsIndexArray.push({name: e.name, dirname: e.name})
    });

    this._collectionsIndexFileAdaptor.saveToDisk(collectionsIndexArray)
  }

  private loadCollectionsIndex() {
    //TODO: implement loading collection index persistence
    //const collectionsIndex:{collectionsIndex: CollectionPointer[]} = this._collectionsIndexFileAdaptor.loadFromDisk()
    
    //collectionsIndex.collectionsIndex.forEach((e:CollectionPointer) => {
      
    //});
  }

}


export interface CollectionPointer {
  name: string,
  dirname: string
}

export class Collection {
  private _documents: Array<Document>;
  private _documentsIndexFileAdaptor: JsonFileAdaptor<Array<Document>>;
private _dbms: Dbms;
  readonly name: string;

  constructor(name:string, dbms:Dbms) {
    this.name = name;
    this._dbms = dbms;
    this._documents = [];
    this._documentsIndexFileAdaptor = new JsonFileAdaptor(this._dbms.config.metaDataRootPath, "documents-index.json")
    this._documents.push = (item:any):number => {
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
    //throw new Error('Method not implemented.');
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
  _documentFileAdaptor: BaseFileAdaptor<object>;

  /**
   * Unique name of the document. Also the naming convention for the persisted file.
   */
  readonly name: string;
  //readonly filename: string;

  constructor(name: string, dbms: Dbms, private fileAdaptor: BaseFileAdaptor<object>) {
    
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
   * Persist changes to file on disk
   */
  async save() {
    this._documentFileAdaptor.saveToDisk(this._data)
  }

}


/**
 * Inherit to implement file format specific adaptor classes. Example: json or yaml or Markdown + FrontMatter. 
 * Collection instances use this to manage persistance.
 */
abstract class BaseFileAdaptor<T> {
  _fqfilename: string;

  filename:string;
  path: string;

  /**
   * @param path fully qualified path to where `filename` will be persisted. Include leading and trailing slash `/`
   * @param filename filename to load/save on disk.
   */
  constructor(path: string, filename: string) {
    this.path = path;
    this.filename = filename;
    this._fqfilename = path + filename

    if (!this.dirExists()) {
      throw new Error("DataRootpath folder " + this.path + " doesn't exist. Please create the path.")
    }
  }

  /**
   * Data Json object to string. 
   */
  abstract serialize(data: T): string

  /**
   * Data string to Json object
   */
  abstract deserialize(data: string): T

  /**
   * Save data to disk is whatevery structure implemented in by the `serializer()`  method.
   * @param data as `object`
   */
  async saveToDisk(data: T) {
    const s: string = this.serialize(data);
    if (this.fileExists(this._fqfilename)) {

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
  loadFromDisk(): T {
    const s: string = "";

    let c: any;
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
   * Check a file exists with the configured `path`
   * @param filename Check if the file exists without opening or modifiying
   * @returns `true` if exists else `false`
   */
  private fileExists(filename: string): boolean {
    let exists: boolean = false
    fs.access(this.path+filename, fs.constants.F_OK, (err) => {
      if (err) {
        console.error(err)
        exists = false;
      } else {
        exists = true;
      }
    })
    return exists
  }

  /**
   * Check if the configrued adaptor `path` exits
   * @returns `true` if the directory exists, else `false`
   */
  private dirExists(): boolean {
    let exists: boolean = false
    fs.access(this.path, fs.constants.F_OK, (err) => {
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
export class JsonFileAdaptor<T> extends BaseFileAdaptor<T> {
  serialize(data: T): string {
    return JSON.stringify(data);
  }
  deserialize(data: string): T {
    const result:T = JSON.parse(data)
    return result
  }
}


const safeJsonParse = <T>(guard: (o: any) => o is T) => 
  (data: string): ParseResult<T> => {
    const parsed = JSON.parse(data)
    return guard(parsed) ? { parsed, hasError: false } : { hasError: true }
  }

type ParseResult<T> =
  | { parsed: T; hasError: false; error?: undefined }
  | { parsed?: undefined; hasError: true; error?: unknown }

/**
 * config

Dbms

dbms.collections.create/delete

dbms.collection[sadfsd]:collection

collection.data: object

collection.save

collections : index 
-collection : folder : fileAdaptor
--documents : index
---document : file

documents.




 */




