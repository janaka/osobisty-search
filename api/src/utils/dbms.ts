import fs, { cp } from 'fs';

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
    this._collections.push = (item:Collection):number => {
      Array.prototype.push.call(this._collections, item)
      this.saveCollectionsIndexToDisk(this._collections)
      return this._collections.length
    }
  }

  get Collections(): Array<Collection> {
    if (this._collections.length === 0) {
      console.log("Collections() cache miss.")
      const o = this.loadCollectionsIndexFromDisk()
      const c = new Array<Collection>();
      o.forEach((e:CollectionPointer) => {
        c.push(new Collection(e.name, this))
      });
      this._collections = c;
    }
    return this._collections
  }

  private saveCollectionsIndexToDisk(collections: Array<Collection>) {
    console.log("saveCollectionsIndexToDisk")

    const collectionsIndexArray = new Array<CollectionPointer>();

    collections.forEach((e: Collection) => {
      collectionsIndexArray.push({name: e.name, dirname: e.name})
    });

    this._collectionsIndexFileAdaptor.saveToDisk(collectionsIndexArray)
  }

  private loadCollectionsIndexFromDisk(): Array<CollectionPointer> {
    const t = this._collectionsIndexFileAdaptor.loadFromDisk()
    if (t === undefined) throw new Error("Collection index data load from fisk failed!")

    return t
  }

}


export interface CollectionPointer {
  [index: string]: string,
  name: string,
  dirname: string
}


//TODO: type collections to a particular document format like json, yaml, or text so we don't have to pass the fileadapter to each document instance
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
    this._documents.push = (item:Document):number => {
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

export interface DocumentPointer {
  [index: string]: string,
  name: string,
  dirname: string,
  filename: string
}

/**
 * Collection is a container for a JS object.
 * Think of it as a colleciton of documents.
 * But we aren't going to be oppinionated about the stucture.
 * Consumers will use standard functionality such as Array.push
 */
export class Document {
  private _dbms: Dbms;
  _data: object | undefined;
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
  get data(): object | undefined {
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
    if (this._data != undefined) {
      this._documentFileAdaptor.saveToDisk(this._data)
    }
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
      throw new Error("`path`:" + this.path + " doesn't exist. Please make sure the path exists.")
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
   * Save data of type `T` to disk at what ever structure implemented in by the `serializer()` method.
   * @param data as `object`
   */
  async saveToDisk(data: T) {
    const s: string = this.serialize(data);
    //TODO: do we need to control append vs replace content?
    //console.log("1:"+this._fqfilename)
    // if (this.fileExists(this._fqfilename)) {

    // }
    fs.writeFile(this._fqfilename, s, 'utf-8', (error: any) => {
      if (error) throw new Error("Saving failed. File: "+ this._fqfilename + "error: "+ error) 
    })
  }

  /**
   * Load data from disk and deserialize using the implementation specific deserializer.
   * Expects the file to be in UTF-8
   * @returns deserialized file data as a type `T` using the concreate deserializer() method.
   */
  loadFromDisk(): T | undefined {
    try {
      const s: string = fs.readFileSync(this._fqfilename, "utf-8")
      let c: T | undefined = this.deserialize(s);
      return c;      
    } catch (error) {
      throw new Error("loadFromDisk() failed. Error: "+ error)
    }

      // fs.readFileSync(this._fqfilename, 'utf-8', (error: any, data: string) => {
      //   if (!error) throw new Error("loadFromDisk() failed. Error: "+ error);
      //   if (data) {
      //     console.log("raw data:"+data)
      //     c = this.deserialize(data);
      //   }
      // })

      
    
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
    return fs.existsSync(this.path)
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


// const safeJsonParse = <T>(guard: (o: any) => o is T) => 
//   (data: string): ParseResult<T> => {
//     const parsed = JSON.parse(data)
//     return guard(parsed) ? { parsed, hasError: false } : { hasError: true }
//   }

// type ParseResult<T> =
//   | { parsed: T; hasError: false; error?: undefined }
//   | { parsed?: undefined; hasError: true; error?: unknown }

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




